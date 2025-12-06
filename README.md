<div align="center">

# 🟠 MIRAGE
### Retrieval and Generation of Multimodal Images and Texts for Medical Education

<img src="https://img.shields.io/badge/MICCAI-2025-orange?style=for-the-badge&logo=fireship" alt="MICCAI 2025" />
<img src="https://img.shields.io/badge/STATUS-LIVE-red?style=for-the-badge&logo=statuspage" alt="Status Live" />
<img src="https://img.shields.io/badge/BUILD-v1.0-amber?style=for-the-badge" alt="Build v1.0" />

<br/>

<p align="center">
  <a href="https://effulgent-duckanoo-083431.netlify.app/">
    <img src="https://img.shields.io/badge/🚀_Frontend-Netlify-00C7B7?style=plastic&logo=netlify" height="35" />
  </a>
  <a href="https://huggingface.co/spaces/Migueldiaz1/mirage-backend">
    <img src="https://img.shields.io/badge/⚡_Backend-Hugging_Face-FFD21E?style=plastic&logo=huggingface" height="35" />
  </a>
  <a href="https://www.kaggle.com/code/migueldazbenito/mirage">
    <img src="https://img.shields.io/badge/📘_Notebook-Kaggle-20BEFF?style=plastic&logo=kaggle" height="35" />
  </a>
</p>

<p align="center">
  <b>Explore Medical Latent Spaces.</b> <br/>
  <i>Retrieval. Synthesis. Vector Arithmetic.</i>
</p>

</div>

---

## ⚡ Overview

**MIRAGE** is a multimodal system designed to revolutionize medical education by allowing students to navigate the complex relationships between medical texts and images. 

Unlike static atlases or unreliable web searches, MIRAGE projects medical concepts into a shared high-dimensional latent space. This allows for semantic retrieval, synthetic image generation, and—most importantly—**conceptual algebra**, enabling users to mathematically modify medical conditions (e.g., subtracting "bones" from an X-ray query).

The system is fully deployed and accessible via the links above.

---

## 🔬 Based on MICCAI 2025 Research

This project is the official implementation of the paper:
> **MIRAGE: Retrieval and Generation of Multimodal Images and Texts for Medical Education** > *Presented at the 4th Workshop on Applications of Medical AI (AMAI), MICCAI 2025.*

The core research focuses on using a **CLIP model fine-tuned on the ROCO (Radiology Objects in Context) dataset** to align visual and textual medical data. This alignment enables the system to "understand" that a chest X-ray and the text "pleural effusion" reside in the same semantic neighborhood.

### Core Paper Features:
* **Multimodal Retrieval:** Text-to-Image search grounded in verified medical data (ROCO).
* **Generative AI:** Using Stable Diffusion to synthesize unseen pathologies.
* **LLM Enrichment:** Generating detailed radiology reports using Dolly-v2/BioGPT.
* **Dual Search (Latent Arithmetic):** Modifying queries via vector operations.

---

## 🚀 Optimization: Changes from the Paper

To ensure this web deployment provides a **blazing fast** user experience on standard CPU/Cloud environments (like Hugging Face Spaces free tier), we have engineered several optimizations compared to the original research pipeline.

### 1. Precomputed Vector Embeddings (Speed ⚡)
In the research paper, the system encodes the dataset dynamically. For this deployment, we have **precomputed and cached the embeddings** for the entire ROCO dataset.
* **Paper:** Runtime encoding of images.
* **Deployment:** `O(1)` access time. The visual vectors are loaded directly into memory, allowing for instant cosine similarity searches without needing to run the heavy CLIP Vision Transformer on the dataset for every query.

### 2. Latent Consistency Models (LCM) (Generation ⚡)
Generating synthetic medical images with standard Stable Diffusion takes 25-50 inference steps (approx. 40-60 seconds on CPU).
* **Deployment:** We utilize **LCM (Latent Consistency Models)** LoRAs. This distills the diffusion process, allowing us to generate high-fidelity medical images in just **4-8 steps**.
* **Result:** Generation time is slashed from ~1 minute to mere seconds, making the tool interactive.

### 3. Metadata Indexing
Captions and image paths are indexed in a lightweight JSON structure, decoupled from the heavy model weights, ensuring the UI remains responsive even during heavy computation.

---

## 🧠 How It Works: The "Dual Search"

The most powerful feature of MIRAGE is **Latent Space Arithmetic**. We don't just search for keywords; we perform math on concepts.

When a user runs a Dual Search, the system calculates a new vector $\vec{v}_{final}$:

$$\vec{v}_{final} = \vec{v}_{query} - \vec{v}_{subtract} + \vec{v}_{add}$$

**Example:**
1.  **Query:** "Chest X-Ray"
2.  **Subtract:** "Bones"
3.  **Add:** "Soft Tissue"
4.  **Result:** The system navigates to a point in latent space representing a "Bone Suppression" image, retrieving real examples and generating synthetic ones that match this new concept.

---

## 🛠️ Architecture

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React + Tailwind + Framer Motion | Cyberpunk/Dark UI, State Management |
| **Backend** | Python (FastAPI/Gradio) | API Endpoints, Model Inference |
| **Retrieval** | CLIP (MedICaT) | Embedding Medical Text & Images |
| **Generation** | Stable Diffusion + LCM | Fast Synthetic Image Creation |
| **Dataset** | ROCO (PubMed) | Ground Truth Medical Data |

---

## 📦 Deployment & Usage

### 🌐 Live Demo
* **Frontend:** [Access the UI here](https://effulgent-duckanoo-083431.netlify.app/)
* **Backend:** [View the Space](https://huggingface.co/spaces/Migueldiaz1/mirage-backend)

### 💻 Local Development
If you wish to run the notebook or backend locally, please refer to the **Kaggle Notebook** linked above. It contains the complete installation pipeline:

```bash
# Example setup from the notebook
pip install diffusers transformers accelerate peft
pip install gradio
