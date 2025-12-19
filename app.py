from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel
import torch
import open_clip
import numpy as np
import json
import google.generativeai as genai
import os
import base64
from datasets import load_dataset
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from huggingface_hub import login
from typing import Optional, List, Any, Dict, Union
from diffusers import StableDiffusionPipeline

app = FastAPI(title="MIRAGE")

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
CLIP_MODEL_NAME = 'hf-hub:luhuitong/CLIP-ViT-L-14-448px-MedICaT-ROCO'
SD_MODEL_ID = "Nihirc/Prompt2MedImage" 
HF_DATASET_ID = "mdwiratathya/ROCO-radiology"
SPLIT = "train"

device = "cuda" if torch.cuda.is_available() else "cpu"

# Glob variables
clip_model = None
clip_tokenizer = None
embeddings = None       
metadata = None
dataset_stream = None 
sd_pipe = None 
gemini_available = False 

# Authentication
try:
    # Hugging Face Auth
    hf_token = os.environ.get('HF_TOKEN')
    if hf_token:
        login(token=hf_token)
    
    # Google Gemini Auth
    google_key = os.environ.get('GOOGLE_API_KEY')
    genai.configure(api_key=google_key)
    gemini_available = True
        
except Exception as e:
    print(f"Warning Auth: {e}")

# Helper: Placeholder Image
def create_placeholder_image(text="Image Error"):
    img = Image.new('RGB', (512, 512), color=(40, 40, 45))
    d = ImageDraw.Draw(img)
    try:
        font = ImageFont.load_default()
    except:
        font = None
    d.text((20, 200), "No Image Available", fill=(255, 100, 100), font=font)
    d.text((20, 230), f"{text}", fill=(200, 200, 200), font=font)
    img_byte_arr = BytesIO()
    img.save(img_byte_arr, format='JPEG')
    return img_byte_arr.getvalue()

# Load Models
@app.on_event("startup")
async def load_models():
    global clip_model, clip_tokenizer, embeddings, metadata, dataset_stream, sd_pipe
    
    # Load CLIP
    print("Loading CLIP...")
    clip_model, _, _ = open_clip.create_model_and_transforms(CLIP_MODEL_NAME, device=device)
    clip_tokenizer = open_clip.get_tokenizer(CLIP_MODEL_NAME)
    clip_model.eval()

    # Load Metadata and Embeddings
    print("Loading Metadata...")
    with open("metadata.json", 'r') as f:
        metadata = json.load(f)
    
    embeddings = np.load("embeddings.npy")
    
    # Load Dataset
    dataset_stream = load_dataset(HF_DATASET_ID, split=SPLIT, streaming=False)

    # Load Stable Diffusion
    print("Loading Stable Diffusion...")
    sd_pipe = StableDiffusionPipeline.from_pretrained(SD_MODEL_ID, torch_dtype=torch.float32)
    sd_pipe.safety_checker = None 
    sd_pipe.requires_safety_checker = False
    sd_pipe = sd_pipe.to(device)

    
def calculate_clip_vector(text):
    with torch.no_grad():
        text_tokens = clip_tokenizer([text]).to(device)
        vec = clip_model.encode_text(text_tokens)
        vec /= vec.norm(dim=-1, keepdim=True)
        return vec

def perform_arithmetic(base_text, add_text, sub_text):
    vec_base = calculate_clip_vector(base_text)
    
    if add_text and add_text.strip():
        vec_add = calculate_clip_vector(add_text)
        vec_base = vec_base + vec_add
        
    if sub_text and sub_text.strip():
        vec_sub = calculate_clip_vector(sub_text)
        vec_base = vec_base - vec_sub
        
    vec_base /= vec_base.norm(dim=-1, keepdim=True)
    return vec_base

def search_embeddings(query_vector, k=3):
    query_vec_np = query_vector.cpu().numpy()
    similarities = (query_vec_np @ embeddings.T).squeeze()
    best_indices = similarities.argsort()[-k:][::-1]
    return best_indices, similarities

def get_captions_from_indices(indices):
    captions = []
    for idx in indices:
        idx = int(idx)
        if idx < len(metadata):
            cap = metadata[idx].get("caption", "")
            if cap:
                captions.append(cap)
    return captions

# LLM
def generate_gemini_description(user_query, context_captions):
    
    context_str = ". ".join(context_captions[:3])
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')  # In paper we used Dolly (Bc of HF limitations we can't load everything in RAM) -> General model
        prompt = f"Explain the medical condition '{user_query}' concisely using these findings from a database: {context_str}. Keep it short and clinical."
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error Gemini API: {e}")
        return user_query

# Stable Diffusion Generation
def generate_synthetic_image_sd(prompt, steps=50, guidance=7.5):
    if sd_pipe is None: return None
    try:
        # Recortar prompt si es muy largo (límite de CLIP tokenizer en SD)
        clean_prompt = prompt[:77] 
        image = sd_pipe(clean_prompt, num_inference_steps=steps, guidance_scale=guidance).images[0]
        
        draw = ImageDraw.Draw(image)
        text_mark = "MIRAGE Synthetic"
        try: font = ImageFont.load_default() 
        except: font = None
        draw.text((10, image.height - 20), text_mark, fill=(255, 255, 255), font=font)

        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{img_str}"
    except Exception as e:
        print(f"Error SD Generation: {e}")
        return None

# ENDPOINTS
@app.get("/image/{index}")
def get_image(index: str):
    if index in ["None", "", "undefined"]: return Response(content=create_placeholder_image("Invalid"), media_type="image/jpeg")
    if dataset_stream is None: return Response(content=create_placeholder_image("Loading Data..."), media_type="image/jpeg")
    try:
        idx_int = int(float(index))
        real_idx = idx_int 
        if 0 <= real_idx < len(dataset_stream):
            img = dataset_stream[real_idx]['image']
            if img.mode != 'RGB': img = img.convert('RGB')
            b = BytesIO()
            img.save(b, format='JPEG')
            return Response(content=b.getvalue(), media_type="image/jpeg")
    except Exception: pass
    return Response(content=create_placeholder_image("Not Found"), media_type="image/jpeg")

class GenerationRequest(BaseModel):
    original_text: str
    sub_concept: Optional[str] = None
    add_concept: Optional[str] = None
    top_k: int = 3
    gen_text: bool = True       
    gen_image: bool = True      
    guidance_scale: float = 7.5 
    num_inference_steps: int = 50 

@app.post("/generate_comparison")
def generate_comparison(req: GenerationRequest):
    if not clip_model: raise HTTPException(status_code=503, detail="Models Loading...")
    
    response_data = {
        "original": None,
        "modified": None,
        "original_text": req.original_text,
        "modified_text": ""
    }

    # Retrieval (Always done)
    vec_orig = calculate_clip_vector(req.original_text)
    
    final_matches_orig = []
    desc_display = "LLM generation skipped."
    
    if req.gen_text:
        # Initial Retrieval for Context
        idx_init, _ = search_embeddings(vec_orig, k=req.top_k)
        captions_init = get_captions_from_indices(idx_init)
        
        # Important changed wrt paper: Gemini API instead of Dolly (Free tier limitations in HF)
        desc_enriched_orig = generate_gemini_description(req.original_text, captions_init)
        desc_display = desc_enriched_orig
        
        # Re-ranking 
        vec_orig_refined = calculate_clip_vector(desc_enriched_orig)
        idx_final, scores_final = search_embeddings(vec_orig_refined, k=req.top_k)
        
        for i, idx in enumerate(idx_final):
             idx = int(idx)
             meta = metadata[idx]
             final_matches_orig.append({
                "index": int(meta.get('dataset_index', idx)),
                "score": float(scores_final[i]),
                "caption": meta.get("caption", ""),
                "url": f"/image/{int(meta.get('dataset_index', idx))}"
             })
    else:
        # Standard Retrieval (No Re-ranking)
        idx_final, scores_final = search_embeddings(vec_orig, k=req.top_k)
        for i, idx in enumerate(idx_final):
             idx = int(idx)
             meta = metadata[idx]
             final_matches_orig.append({
                "index": int(meta.get('dataset_index', idx)),
                "score": float(scores_final[i]),
                "caption": meta.get("caption", ""),
                "url": f"/image/{int(meta.get('dataset_index', idx))}"
             })

    # Image Generation 
    img_syn_orig = ""
    if req.gen_image:
        img_syn_orig = generate_synthetic_image_sd(
            req.original_text, # O usa desc_display si quieres que SD use el texto mejorado
            steps=req.num_inference_steps,
            guidance=req.guidance_scale
        )
    
    response_data["original"] = {
        "real_match": final_matches_orig, 
        "synthetic": {
            "image_base64": img_syn_orig,
            "generated_prompt": desc_display
        }
    }
    
    # dual search
    if req.sub_concept and req.add_concept:
        # Arithmetic
        vec_mod = perform_arithmetic(req.original_text, req.add_concept, req.sub_concept)
        mod_text_display = f"{req.original_text} + {req.add_concept} - {req.sub_concept}"
        response_data["modified_text"] = mod_text_display
        
        final_matches_mod = []
        desc_enriched_mod = "LLM generation skipped."
        
        if req.gen_text:
             # Initial Retrieval Modified
            idx_mod_init, _ = search_embeddings(vec_mod, k=req.top_k)
            captions_mod = get_captions_from_indices(idx_mod_init)
            
            # LLM : Gemini API
            desc_enriched_mod = generate_gemini_description(mod_text_display, captions_mod)
            
            # Re-Ranking Modified
            vec_mod_refined = calculate_clip_vector(desc_enriched_mod)
            idx_mod_final, scores_mod_final = search_embeddings(vec_mod_refined, k=req.top_k)
            
            for i, idx in enumerate(idx_mod_final):
                 idx = int(idx)
                 meta = metadata[idx]
                 final_matches_mod.append({
                    "index": int(meta.get('dataset_index', idx)),
                    "score": float(scores_mod_final[i]),
                    "caption": meta.get("caption", ""),
                    "url": f"/image/{int(meta.get('dataset_index', idx))}"
                 })
        else:
             idx_mod_final, scores_mod_final = search_embeddings(vec_mod, k=req.top_k)
             for i, idx in enumerate(idx_mod_final):
                 idx = int(idx)
                 meta = metadata[idx]
                 final_matches_mod.append({
                    "index": int(meta.get('dataset_index', idx)),
                    "score": float(scores_mod_final[i]),
                    "caption": meta.get("caption", ""),
                    "url": f"/image/{int(meta.get('dataset_index', idx))}"
                 })

        # Image Generation Modified
        img_syn_mod = ""
        if req.gen_image:
            prompt_syn_mod = f"{req.original_text} {req.add_concept}" 
            img_syn_mod = generate_synthetic_image_sd(
                prompt_syn_mod,
                steps=req.num_inference_steps,
                guidance=req.guidance_scale
            )
        
        response_data["modified"] = {
            "real_match": final_matches_mod,
            "synthetic": {
                "image_base64": img_syn_mod,
                "generated_prompt": desc_enriched_mod
            }
        }

    return response_data

# To create the frontend serving
app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

if os.path.exists("static/images"):
    app.mount("/images", StaticFiles(directory="static/images"), name="images")

@app.get("/")
async def read_index():
    return FileResponse('static/index.html')

@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    if os.path.exists(f"static/{full_path}"):
        return FileResponse(f"static/{full_path}")
    return FileResponse('static/index.html')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
