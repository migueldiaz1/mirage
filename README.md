<div align="center">

<h1>MIRAGE</h1>
<h3>Retrieval and Generation of Multimodal Images and Texts for Medical Education</h3>

<br/>

<h2>SYSTEM ACCESS POINTS</h2>

<table>
<tr>
<td align="center" width="33%">
<a href="https://mirageos.netlify.app/">
<img src="https://img.shields.io/badge/Frontend_UI-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=black" height="35" />
</a>
<br/>
<b>Interactive Web App</b>
</td>
<td align="center" width="33%">
<a href="https://huggingface.co/spaces/Migueldiaz1/mirage-backend">
<img src="https://img.shields.io/badge/Backend_API-Hugging_Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" height="35" />
</a>
<br/>
<b>API Server</b>
</td>
<td align="center" width="33%">
<a href="https://www.kaggle.com/code/migueldazbenito/mirage">
<img src="https://img.shields.io/badge/Source_Code-Kaggle-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white" height="35" />
</a>
<br/>
<b>Notebook & Pipeline</b>
</td>
</tr>
</table>

<br/>

<p align="center">
  <b>Retrieval. Synthesis. Vector Arithmetic.</b>
</p>

</div>

---

## MICCAI 2025 PAPER

This project is the official implementation of the research presented at the **4th Workshop on Applications of Medical AI (AMAI), MICCAI 2025**.

## OVERVIEW

Access to diverse, well-annotated medical images with interactive learning tools is fundamental for training practitioners in medicine and related fields to improve their diagnostic skills and understanding of anatomical structures. While medical atlases are valuable, they are often impractical due to their size and lack of interactivity, whereas on- line image search may provide mislabeled or incomplete material. To address this, we propose MIRAGE, a multimodal medical text and image retrieval and generation system that allows users to find and generate clinically relevant images from trustworthy sources by mapping both text and images to a shared latent space, enabling semantically meaningful queries. The system is based on a fine-tuned medical version of CLIP (MedICaT-ROCO), trained with the ROCO dataset, obtained from PubMed Central. MIRAGE allows users to give prompts to retrieve images, generate synthetic ones through a medical diffusion model (Prompt2MedImage) and receive enriched descriptions from a large language model (Dolly-v2-3b). It also supports a dual search option, enabling the visual comparison of different medical conditions. A key advantage of the system is that it relies entirely on publicly available pretrained models, ensuring reproducibility and accessibility. Our goal is to provide a free, transparent and easy-to-use didactic tool for medical students, especially those without programming skills. The system features an interface that enables interactive and personalized visual learning through medical image retrieval and generation. The system is accessible to medical students worldwide without requiring local computational resources or technical expertise.

---

## OPTIMIZATIONS: CHANGES FROM THE PAPER

To ensure the web deployment on standard CPU environments (like the Hugging Face free tier) without requiring the heavy GPU resources described in the original paper, we have implemented specific adaptations.

### 1. Precomputed Embeddings (Speed Optimization)
While the paper describes a pipeline that processes images dynamically, this deployment uses **precomputed vector embeddings**.
* **Paper:** CLIP Vision Transformer runs in real-time when the system is initialized.
* **Web Deployment:** We cached the CLIP embeddings for the ROCO dataset. This allows for **O(1) retrieval speed**, skipping the heavy visual encoding step during user queries.

### 2. Latent Consistency Models (LCM)
The paper utilizes Prompt2MedImage (Standard Stable Diffusion) which typically requires 30 to 50 steps for high-quality generation.
* **Paper:** High inference time (~40-60s) in GPU.
* **Web Deployment:** We use **LCM (Latent Consistency Models)**. This reduces the inference requirement to just **some steps (4 to 10)**, enabling image synthesis in a reasonable time on a CPU.

---

## CITATION

If you use MIRAGE in your research, please cite our MICCAI 2025 paper (NOTE: in press):

```bibtex
@inproceedings{diazbenito2025mirage,
  title={MIRAGE: Retrieval and Generation of Multimodal Images and Texts for Medical Education},
  author={Díaz Benito, Miguel and Diana-Albelda, Cecilia and García-Martín, Álvaro and Bescos, Jesus and Escudero Viñolo, Marcos and San Miguel, Juan Carlos},
  booktitle={4th Workshop on Applications of Medical AI (AMAI), MICCAI},
  year={2025},
  organization={Springer}
}
