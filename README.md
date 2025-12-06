<div align="center">

<h1 style="color: #F97316; font-size: 3em;">MIRAGE</h1>
<h3 style="color: #FDBA74;">Retrieval and Generation of Multimodal Images and Texts for Medical Education</h3>

<br/><br/>

<h2 style="color: #F97316;">SYSTEM ACCESS POINTS</h2>

<table style="border: none;">
<tr>
<td align="center" width="33%">
<a href="https://effulgent-duckanoo-083431.netlify.app/">
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

<h2 style="color: #F97316;">OVERVIEW</h2>

Access to diverse, well-annotated medical images with interactive learning tools is fundamental for training practitioners in medicine and related fields to improve their diagnostic skills and understanding of anatomical structures. While medical atlases are valuable, they are often impractical due to their size and lack of interactivity, whereas on- line image search may provide mislabeled or incomplete material. To address this, we propose MIRAGE, a multimodal medical text and image retrieval and generation system that allows users to find and generate clinically relevant images from trustworthy sources by mapping both text and images to a shared latent space, enabling semantically meaningful queries. The system is based on a fine-tuned medical version of CLIP (MedICaT-ROCO), trained with the ROCO dataset, obtained from PubMed Central. MIRAGE allows users to give prompts to retrieve images, generate synthetic ones through a medical diffusion model (Prompt2MedImage) and receive enriched descriptions from a large language model (Dolly-v2-3b). It also supports a dual search option, enabling the visual comparison of different medical conditions. A key advantage of the system is that it relies entirely on publicly available pretrained models, ensuring reproducibility and accessibility. Our goal is to provide a free, transparent and easy-to-use didactic tool for medical students, especially those without programming skills. The system features an interface that enables interactive and personalized visual learning through medical image retrieval and generation. The system is accessible to medical students worldwide without requiring local computational resources or technical expertise.

---

<h2 style="color: #F97316;">MICCAI 2025 PAPER</h2>

This project is the official implementation of the research presented at the <strong style="color: #F97316;">4th Workshop on Applications of Medical AI (AMAI), MICCAI 2025</strong>.

The system is built upon a fine-tuned medical version of <strong style="color: #F97316;">CLIP (MedICaT-ROCO)</strong> trained on the ROCO dataset. It maps both text and images to a shared latent space, enabling semantically meaningful queries.

<h3 style="color: #FDBA74;">Core Research Features</h3>

* <strong style="color: #F97316;">Multimodal Retrieval:</strong> Finds clinically relevant images from verified sources.
* <strong style="color: #F97316;">Latent Arithmetic (Dual Search):</strong> Enables visual comparison of different medical conditions by subtracting/adding concept vectors.
* <strong style="color: #F97316;">Generative AI:</strong> Synthesizes new medical images using diffusion models.
* <strong style="color: #F97316;">LLM Enrichment:</strong> Generates detailed descriptions using Large Language Models.

---

<h2 style="color: #F97316;">OPTIMIZATIONS: CHANGES FROM THE PAPER</h2>

To ensure this web deployment runs efficiently on standard CPU environments (like the Hugging Face free tier) without requiring the heavy GPU resources described in the original paper, we have implemented specific engineering optimizations.

<h3 style="color: #FDBA74;">1. Precomputed Embeddings (Speed Optimization)</h3>
While the paper describes a pipeline that processes images dynamically, this deployment uses <strong style="color: #F97316;">precomputed vector embeddings</strong>.
* **Paper:** CLIP Vision Transformer runs in real-time.
* **Web Deployment:** We cached the CLIP embeddings for the ROCO dataset. This allows for <strong style="color: #F97316;">O(1) retrieval speed</strong>, skipping the heavy visual encoding step during user queries.

<h3 style="color: #FDBA74;">2. Latent Consistency Models (LCM)</h3>
The paper utilizes *Prompt2MedImage* (Standard Stable Diffusion) which typically requires 50 steps for high-quality generation.
* **Paper:** High inference time (~40-60s).
* **Web Deployment:** We utilize <strong style="color: #F97316;">LCM (Latent Consistency Models)</strong>. This reduces the inference requirement to just <strong style="color: #F97316;">4-8 steps</strong>, enabling image synthesis in seconds on a CPU.

<h3 style="color: #FDBA74;">3. Metadata Indexing</h3>
We decoupled the dataset metadata (captions, paths) into a lightweight JSON structure. This ensures the search engine remains responsive and lightweight, loading only the necessary textual data for the results.

---

<h2 style="color: #F97316;">HOW IT WORKS: LATENT ARITHMETIC</h2>

The system enables concept-level comparison via latent space manipulation. When a user defines a "Dual Search", we perform vector arithmetic:

<h3 align="center" style="color: #F97316;">Vector<sub>modified</sub> = Vector<sub>query</sub> - Vector<sub>subtract</sub> + Vector<sub>add</sub></h3>

<br/>

For example, subtracting the concept **"Bones"** from a **"Chest X-Ray"** vector forces the system to retrieve or generate soft-tissue specific visualizations.

---

<h2 style="color: #F97316;">CITATION</h2>

If you use MIRAGE in your research, please cite our MICCAI 2025 paper:

```bibtex
@inproceedings{diazbenito2025mirage,
  title={MIRAGE: Retrieval and Generation of Multimodal Images and Texts for Medical Education},
  author={Díaz Benito, Miguel and Diana-Albelda, Cecilia and García-Martín, Álvaro and Bescos, Jesus and Escudero Viñolo, Marcos and San Miguel, Juan Carlos},
  booktitle={4th Workshop on Applications of Medical AI (AMAI), MICCAI},
  year={2025},
  organization={Springer}
}
