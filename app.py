from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.responses import Response
from pydantic import BaseModel
import torch
import open_clip
import numpy as np
import json
import os
import requests
from fastapi.middleware.cors import CORSMiddleware
import base64
from datasets import load_dataset
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from huggingface_hub import login
import google.generativeai as genai 
from typing import Optional, List, Any, Dict, Union
from diffusers import StableDiffusionPipeline, LCMScheduler

app = FastAPI(title="MIRAGE")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
MODEL_NAME = 'hf-hub:luhuitong/CLIP-ViT-L-14-448px-MedICaT-ROCO'
HF_DATASET_ID = "mdwiratathya/ROCO-radiology"
SPLIT = "train"
device = "cpu"

# Glob variables
model = None
tokenizer = None
embeddings = None       
metadata = None
dataset_stream = None 
gemini_available = False
pipe = None 

# authentication
try:
    hf_token = os.environ.get('HF_TOKEN')
    if hf_token:
        login(token=hf_token)
    
    google_key = os.environ.get('GOOGLE_API_KEY')
    if google_key:
        genai.configure(api_key=google_key)
        gemini_available = True
    
except Exception as e:
    print(f"Error auth: {e}")

# to handle if there's an error
def create_placeholder_image(text="Image Error"):
    img = Image.new('RGB', (512, 512), color=(40, 40, 45))
    d = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = None
        
    d.text((20, 200), f"No Image Available", fill=(255, 100, 100), font=font)
    d.text((20, 230), f"{text}", fill=(200, 200, 200), font=font)
    img_byte_arr = BytesIO()
    img.save(img_byte_arr, format='JPEG')
    return img_byte_arr.getvalue()

# load the data
@app.on_event("startup")
async def load_data():
    global model, tokenizer, embeddings, metadata, dataset_stream, pipe
    model, _, _ = open_clip.create_model_and_transforms(MODEL_NAME, device=device)
    tokenizer = open_clip.get_tokenizer(MODEL_NAME)
    model.eval()

    # load metadata
    if os.path.exists("metadata_text.json"):
        with open("metadata_text.json", 'r') as f:
            metadata = json.load(f)
    elif os.path.exists("metadata.json"):
        with open("metadata.json", 'r') as f:
            metadata = json.load(f)
    else:
        print("no metadata file found")
        metadata = [{"dataset_index": 0, "filename": "error", "caption": "Error"}]

    # load the embdeddings of the images (already processed)
    embeddings = np.load("embeddings.npy")
    print(f"✅ Image Embeddings listos: {embeddings.shape[0]} registros.")

    # load the dataset
    dataset_stream = load_dataset(HF_DATASET_ID, split=SPLIT, streaming=False) 

    # Load the Stable Diffusion LCM Pipeline
    model_id = "Nihirc/Prompt2MedImage"
    pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float32)
    pipe.load_lora_weights("latent-consistency/lcm-lora-sdv1-5")
    pipe.fuse_lora() 
    pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config, solver_order=2)
    pipe.safety_checker = None
    pipe.requires_safety_checker = False
    
    if device == "cpu":
        pipe = pipe.to("cpu")
        pipe.enable_attention_slicing() 
    else:
        pipe = pipe.to("cuda")

def calculate_vector(text, add=None, sub=None):
    with torch.no_grad():
        # the user gives us a text, we obtain the embedding using CLIP
        text_tokens = tokenizer([text]).to(device)
        vec = model.encode_text(text_tokens)
        vec /= vec.norm(dim=-1, keepdim=True)
        if add and add.strip():
            add_vec = model.encode_text(tokenizer([add]).to(device))
            add_vec /= add_vec.norm(dim=-1, keepdim=True)
            vec = vec + add_vec
        if sub and sub.strip():
            sub_vec = model.encode_text(tokenizer([sub]).to(device))
            sub_vec /= sub_vec.norm(dim=-1, keepdim=True)
            vec = vec - sub_vec
        vec /= vec.norm(dim=-1, keepdim=True)
        return vec

def get_retrieval_and_context(query_vector, top_k):
    # We compare the query (text) embd with the image embeddings to retrieve
    query_vec_np = query_vector.cpu().numpy()
    
   
    # query_vec_np (1, 768), embeddings (N, 768) -> result (N,)
    sim_img = (query_vec_np @ embeddings.T).squeeze()
    best_indices = sim_img.argsort()[-top_k:][::-1]
    
    real_matches = []
    retrieved_captions = []

    for idx in best_indices:
        idx = int(idx)
        if idx >= len(metadata): continue
        
        meta = metadata[idx]
        safe_index = meta.get('dataset_index', idx)
        
        real_matches.append({
            "url": f"/image/{safe_index}",
            "score": float(sim_img[idx]), 
            "filename": meta.get("filename", "img"),
            "caption": meta.get("caption", ""),
            "index": safe_index 
        })

        cap = meta.get("caption", "")
        if cap and len(cap) > 5: 
            retrieved_captions.append(cap)
        
    return real_matches, retrieved_captions

def generate_llm_prompt(captions, user_text):
    if not gemini_available or not captions:
        return user_text + ". " + (captions[0] if captions else "")
    try:
        llm = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"Using the following medical query: '{user_text}', synthesize these findings into a concise radiology description: {', '.join(captions[:3])}"
        res = llm.generate_content(prompt)
        return res.text.strip()
    except: 
        return user_text

def generate_synthetic_image(prompt, steps=5, guidance=1.5):
    global pipe
    if pipe is None: return None
    try:
        NEGATIVE_PROMPT = "painting, artistic, drawing, illustration, blur, low quality, distorted, abstract, text, watermark, grid, noise, glitch"
        image = pipe(prompt[:77], height=512, width=512, num_inference_steps=steps, guidance_scale=guidance, negative_prompt=NEGATIVE_PROMPT).images[0]
        
        draw = ImageDraw.Draw(image)
        text = "Created by MIRAGE"
        try: font = ImageFont.load_default() 
        except: font = None
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((image.width - text_w - 20, image.height - text_h - 15), text, fill=(255, 225, 210), font=font)

        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{img_str}"
    except Exception as e:
        print(f"Error Gen Image: {e}")
        return None

def fetch_image_from_stream(index):
    if dataset_stream is None: return None
    try:
        idx = int(index)
        return dataset_stream[idx]['image']
    except Exception: return None


# ENDPOINTS
@app.get("/api/health")
def health_check(): 
    return {"status": "online", "version": "lite"}

@app.get("/image/{index}")
def get_image(index: str):
    if index in ["None", "", "undefined"]: return Response(content=create_placeholder_image("Invalid"), media_type="image/jpeg")
    if dataset_stream is None: return Response(content=create_placeholder_image("Loading..."), media_type="image/jpeg")
    try:
        idx_int = int(float(index))
        if idx_int < 0 or idx_int >= len(dataset_stream): return Response(content=create_placeholder_image("Out of Bounds"), media_type="image/jpeg")
        img = fetch_image_from_stream(idx_int)
        if img:
            if img.mode != 'RGB': img = img.convert('RGB')
            b = BytesIO()
            img.save(b, format='JPEG')
            return Response(content=b.getvalue(), media_type="image/jpeg")
    except Exception: pass
    return Response(content=create_placeholder_image("Error"), media_type="image/jpeg")

class GenerationRequest(BaseModel):
    original_text: str
    sub_concept: Optional[str] = None
    add_concept: Optional[str] = None
    top_k: int = 3
    gen_text: bool = True
    gen_image: bool = True
    guidance_scale: float = 1.5   
    num_inference_steps: int = 5

# this is the main endpoint
@app.post("/generate_comparison")
def generate_comparison(req: GenerationRequest):
    if not model: raise HTTPException(status_code=503, detail="Loading...") 
    try:
        final_query = req.original_text
        final_add = req.add_concept
        final_sub = req.sub_concept
        
        response_data = {
            "original_text": final_query,
            "modified_text": final_query,
            "original": {},
            "modified": None,
            "input_lang_detected": "raw"
        }

        vec_orig = calculate_vector(final_query)
        match_orig, caps_orig = get_retrieval_and_context(vec_orig, req.top_k)
        
        prompt_orig = ""
        if req.gen_text:
            prompt_orig = generate_llm_prompt(caps_orig, final_query)
        else:
            prompt_orig = "LLM generation skipped."
            
        img_orig_b64 = ""
        if req.gen_image:
            p_to_use = prompt_orig if req.gen_text else final_query
            img_orig_b64 = generate_synthetic_image(p_to_use, steps=req.num_inference_steps, guidance=req.guidance_scale)

        response_data["original"] = {
            "real_match": match_orig, 
            "synthetic": {
                "image_base64": img_orig_b64,
                "generated_prompt": prompt_orig
            }
        }

        has_dual = (final_add and final_add.strip()) and (final_sub and final_sub.strip())
        if has_dual:
            vec_mod = calculate_vector(final_query, final_add, final_sub)
            match_mod, caps_mod = get_retrieval_and_context(vec_mod, req.top_k)
            
            prompt_mod = ""
            if req.gen_text:
                prompt_mod = generate_llm_prompt(caps_mod, f"{final_query} + {final_add} - {final_sub}")
            else:
                prompt_mod = "LLM generation skipped."

            img_mod_b64 = ""
            if req.gen_image:
                p_to_use_mod = prompt_mod if req.gen_text else f"{final_query} {final_add}"
                img_mod_b64 = generate_synthetic_image(p_to_use_mod, steps=req.num_inference_steps, guidance=req.guidance_scale)
                
            response_data["modified"] = {
                "real_match": match_mod,
                "synthetic": {
                    "image_base64": img_mod_b64,
                    "generated_prompt": prompt_mod
                }
            }
            response_data["modified_text"] = f"{final_query} + {final_add} - {final_sub}"

        return response_data

    except Exception as e:
        print(f"🔥 Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
def search(req: GenerationRequest):
    return generate_comparison(req)


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