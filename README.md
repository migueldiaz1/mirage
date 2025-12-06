<div align="center">

<!-- TITLE & LOGO -->

<img src="https://www.google.com/search?q=https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmVreXJ4bnl4bnl4bnl4bnl4bnl4bnl4bnl4bnl4bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LmcMtPdPlC5V2qGMQZ/giphy.gif" width="120" height="auto" style="border-radius: 50%; border: 2px solid #F97316;">

🧠 MIRAGE OS

Multimodal Interface for Retrieval & Augmented Generation in Education

MICCAI 2025 | Fourth Workshop on Applications of Medical AI (AMAI)

<!-- BADGES WITH CUSTOM COLORS (Orange/Red/Amber Theme) -->

<p align="center" style="color: #9ca3af; font-family: monospace;">
<i>"Redefining medical education through Latent Space Navigation."</i>
</p>

</div>

⚡ Live Demos

Platform

Status

Description

Link

Hugging Face

🟢 Online

Full Experience. Backend + Frontend running on HF Spaces.

Launch App

Netlify

🟢 Online

Frontend Only. High-speed Edge deployment.

View UI

Kaggle

📓 Notebook

Source Code. Reproducible pipeline on free T4 GPUs.

Open Code

🧬 Project Overview

MIRAGE is a multimodal AI system designed to solve the reliability gap in medical education. While students often turn to Google Images for speed, they sacrifice accuracy. Medical Atlases offer accuracy but lack interactivity.

MIRAGE bridges this gap by mapping medical text and images into a shared latent space, enabling:

Semantic Retrieval: Search for pathologies by concept, not just keywords (e.g., "Ground glass opacity in lungs").

Latent Arithmetic (Dual Search): Algebraically modify medical concepts (e.g., Chest X-Ray - Bones + Soft Tissue).

Generative AI: Create synthetic medical imagery on-demand using diffusion models.

🛠️ Paper vs. Reality: Optimizations for Deployment

This repository implements the architecture described in our MICCAI 2025 paper, but with specific engineering optimizations to ensure the system allows real-time inference on standard CPUs (or free tier cloud environments) without requiring massive GPU clusters.

Feature

📄 Research Paper Implementation

🚀 This Repository (Production/Demo)

Justification (Why?)

Embeddings

Real-time CLIP inference on the full dataset.

Pre-computed Vectors (.npy)

Extreme Speed. We avoid processing 80k+ images for every query. Vectors are loaded directly into RAM, making retrieval instant on CPU.

Metadata

SQL Database Queries.

Lightweight JSON

Low Latency. Removes the overhead of database connections, keeping the app portable and self-contained.

Generation

Stable Diffusion v1.5 / v2.1 (50 steps).

LCM (Latent Consistency Models)

Efficiency. Standard SD takes ~30s on a T4 GPU. By switching to LCM, we generate high-quality images in 4-8 steps, reducing wait times to seconds.

"These changes democratize access to advanced Medical AI, allowing MIRAGE to run on a laptop or a free Hugging Face Space."

🧠 Core Features

1. Visual Retrieval (CLIP MedICaT)

We use a CLIP model fine-tuned on the ROCO dataset (Radiology Objects in Context). Unlike keyword matching, this understands the visual content of the query.

2. Dual Search (Latent Arithmetic)

This is the system's flagship feature. It allows users to perform vector arithmetic on medical concepts:


$$V_{result} = V_{query} - V_{sub} + V_{add}$$


Example: Visualizing a "Pneumothorax" by taking a healthy lung X-ray vector and mathematically adding the "collapsed lung" feature vector.

3. Augmented Generation

For rare conditions where data is scarce, MIRAGE generates synthetic examples using Prompt2MedImage (optimized via LCM lora), providing students with infinite visual variations of a pathology.

💻 Local Installation

To run MIRAGE locally on your machine:

1. Clone & Hydrate Data

CRITICAL: The vector embeddings (>200MB) are stored in Hugging Face, not GitHub. You must run the download script.

# Clone repository
git clone [https://github.com/migueldiaz1/mirage.git](https://github.com/migueldiaz1/mirage.git)
cd mirage

# Install dependencies
pip install -r requirements.txt

# ⚠️ DOWNLOAD HEAVY DATA (Embeddings & Metadata)
python download_data.py


2. Run Backend

python app.py
# Server starts at http://localhost:7860


3. Run Frontend

Open a new terminal:

cd frontend
npm install

# IMPORTANT: Update API_URL in src/App.jsx to "[http://127.0.0.1:7860](http://127.0.0.1:7860)"
npm run dev


🐳 Docker Support

Run the entire stack in a container:

docker build -t mirage-os .
docker run -p 7860:7860 mirage-os
