import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, Minus, Zap, Image as ImageIcon, Loader2, Sparkles, 
  Command, Activity, FileText, ArrowRight, Award, BrainCircuit, 
  ScanEye, SplitSquareHorizontal, Info, Sliders, Gauge,
  X, Globe, Check, Link as LinkIcon, Lightbulb, BookOpen, Layers,
  Network, GraduationCap, ChevronLeft, MonitorPlay, Database, Wand2,
  AlignLeft, Share2, Infinity as InfinityIcon, MousePointerClick, Maximize2, Flame,
  ArrowDown, Play, Youtube, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- CONFIGURATION ---
const API_URL = "https://migueldiaz1-mirage-backend.hf.space";  
const PROJECT_URL = "https://arxiv.org/abs/2400.00000"; 
const KAGGLE_URL = "https://www.kaggle.com/code/migueldazbenito/mirage"; 
const YOUTUBE_VIDEO_ID = "GlPMrBWtZoQ"; 

// --- DATA (ENGLISH) ---
const MEDICAL_PROMPTS = [
    { title: "Glioblastoma Multiforme", text: "MRI of the brain showing a large necrotic glioblastoma in the frontal lobe with edema." },
    { title: "Liver Metastasis", text: "CT scan of the abdomen showing multiple hypodense metastatic lesions in the liver." },
    { title: "Pleural Effusion", text: "Chest radiograph showing blunting of the costophrenic angle indicating pleural effusion." }
];

const DUAL_ARITHMETIC_EXAMPLES = [
    { title: "Bone Suppression", query: "Chest X-Ray", add: "Soft Tissue", sub: "Bones", desc: "Isolates lung tissue by subtracting bone structures." },
    { title: "Infection Highlight", query: "Lungs X-Ray", add: "Pneumonia", sub: "Clear Lungs", desc: "Visualizes the difference between healthy and infected tissue." },
    { title: "Cardiac Pacemaker", query: "Chest X-ray", add: "Pacemaker generator and leads", sub: "No foreign bodies", desc: "Add a pacemaker to the chest X-ray." }
];

// --- UTILS ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const RichText = ({ text, className }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <span className={className}>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-bold text-orange-400">{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </span>
    );
};

// --- ANIMATION VARIANTS ---
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 40, damping: 10 } }
};

// --- VISUAL COMPONENTS ---

const OpticalGradient = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#050505] pointer-events-none">
            <motion.div 
                animate={{ x: ["-30%", "20%", "-30%"], y: ["-30%", "20%", "-30%"], scale: [1, 1.5, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-orange-600/30 rounded-full blur-[100px] mix-blend-screen"
            />
            <motion.div 
                animate={{ x: ["20%", "-10%", "20%"], y: ["10%", "-30%", "10%"], scale: [1.2, 0.8, 1.2] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/3 right-1/4 w-[40vw] h-[40vw] bg-red-600/20 rounded-full blur-[90px] mix-blend-screen"
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.07]" />
        </div>
    );
};

const BreathingTitle = () => {
    const phrase = [
        { char: "M", type: "standard" }, { char: "I", type: "standard" }, { char: "R", type: "standard" },
        { char: "A", type: "standard" }, { char: "G", type: "standard" }, { char: "E", type: "standard" },
        { char: "\u00A0", type: "space" }, 
        { char: "O", type: "highlight" }, { char: "S", type: "highlight" },
    ];
    
    return (
        <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-none drop-shadow-2xl flex justify-center cursor-default group">
            {phrase.map((item, index) => (
                <motion.span
                    key={index}
                    initial={{ y: 0, scale: 1, filter: "brightness(1)" }}
                    animate={{ 
                        y: [0, -8, 0], scale: [1, 1.05, 1], filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"], 
                        textShadow: ["0 0 0px rgba(249, 115, 22, 0)", "0 0 20px rgba(249, 115, 22, 0.4)", "0 0 0px rgba(249, 115, 22, 0)"]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.15 }}
                    className={cn("inline-block origin-bottom", item.type === "highlight" ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600" : "text-white")}
                >
                    {item.char}
                </motion.span>
            ))}
        </h1>
    );
};

const BrainstormingBackground = () => {
    const MEDICAL_TERMS = [
        "Pneumonia", "Atelectasis", "Cardiomegaly", "Effusion", "Infiltration", "Mass", "Nodule", 
        "Pneumothorax", "Consolidation", "Edema", "Emphysema", "Fibrosis", "Hernia", "Fracture"
    ]; 
    const colors = ["bg-orange-500/20 text-orange-200 border-orange-500/30", "bg-red-500/20 text-red-200 border-red-500/30"];
    
    const floatingWords = useMemo(() => MEDICAL_TERMS.map((term, i) => ({
        text: term, 
        x: Math.random() * 80 - 40, 
        y: Math.random() * 80 - 40, 
        scale: Math.random() * 0.4 + 0.8, 
        delay: Math.random() * 20, 
        colorClass: colors[i % colors.length]
    })), []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
            {floatingWords.map((word, i) => (
                <motion.div 
                    key={i} 
                    className={`absolute px-4 py-1.5 rounded-full border backdrop-blur-sm text-xs font-bold uppercase tracking-widest whitespace-nowrap shadow-lg ${word.colorClass}`} 
                    initial={{ x: `${word.x}vw`, y: `${word.y}vh`, scale: 0, opacity: 0 }} 
                    animate={{ scale: [0, word.scale, 0], opacity: [0, 0.9, 0], y: [`${word.y}vh`, `${word.y - 15}vh`] }} 
                    transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, repeatDelay: Math.random() * 4, delay: word.delay, ease: "easeInOut" }}
                >
                    {word.text}
                </motion.div>
            ))}
        </div>
    );
};

const KaggleLogo = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.825 23.859c-.022.092-.117.141-.283.141h-3.139c-.187 0-.351-.082-.492-.248l-5.16-6.59-1.398 1.434v5.204c0 .165-.116.299-.348.401-.06.027-.123.04-.188.04H5.206c-.165 0-.3-.135-.4-.403l-.004-.055V.453c0-.165.116-.3.348-.401.06-.027.123-.04.188-.04h2.611c.165 0 .3.135.4.403l.004.055v15.702l6.23-7.797c.143-.179.313-.268.511-.268h3.333c.174 0 .274.053.3.16.025.105-.01.21-.106.314l-6.31 7.027 6.643 7.824c.104.127.142.235.114.341z"/>
    </svg>
);

// ==========================================
// [PREMIUM COMPONENT] Paper Explanation Page
// ==========================================
const PaperExplanation = ({ onBack }) => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ container: containerRef });
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const FigurePlaceholder = ({ label, className, src, imageClassName }) => (
        <div className={cn("relative group w-full aspect-video rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center transition-all duration-500 hover:border-orange-500/30 hover:shadow-[0_0_50px_-12px_rgba(249,115,22,0.3)]", className)}>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
            
            {src ? (
                <img 
                    src={src} 
                    alt={label} 
                    className={cn("w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105", imageClassName)}
                />
            ) : (
                <div className="text-center p-6 transition-transform duration-500 group-hover:scale-105 relative z-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-orange-500/10 group-hover:border-orange-500/30 transition-all">
                        <ImageIcon className="w-6 h-6 text-zinc-500 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest group-hover:text-zinc-300 transition-colors">{label}</p>
                    <p className="text-zinc-600 text-xs mt-2 group-hover:text-orange-500/70 transition-colors">Drag or insert figure here</p>
                </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 via-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
    );

    const AppleSection = ({ children, className, gradient = "none" }) => (
        <section className={cn("min-h-screen w-full flex flex-col items-center justify-center p-6 py-24 relative overflow-hidden bg-black", className)}>
            {gradient === "hero" && (
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black opacity-60" />
            )}
            {gradient === "subtle" && (
                 <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/10 to-black" />
            )}
            {gradient === "amber" && (
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black" />
            )}
            <div className="max-w-7xl w-full z-10">{children}</div>
        </section>
    );

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, transition: { duration: 0.5 } }} 
            className="fixed inset-0 z-50 bg-black font-sans"
        >
            <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 origin-left z-50 shadow-[0_0_20px_rgba(249,115,22,0.5)]" />
            
            <button 
                onClick={onBack}
                className="fixed top-8 left-8 z-50 p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-400 transition-all group"
            >
                <ChevronLeft className="w-6 h-6 text-zinc-400 group-hover:text-orange-400 transition-colors" />
            </button>

            <div 
                ref={containerRef} 
                className="h-full overflow-y-scroll scroll-smooth custom-scrollbar"
            >
                {/* 01. HERO */}
                <AppleSection gradient="hero">
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center space-y-8 relative w-full flex flex-col items-center justify-center min-h-[60vh]"
                     >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium uppercase tracking-[0.2em] backdrop-blur-md shadow-[0_0_30px_-10px_rgba(249,115,22,0.3)]">
                             <Award className="w-3 h-3" /> MICCAI 2025 Paper
                        </div>
                        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 drop-shadow-2xl leading-tight">
                            MIRAGE
                        </h1>
                        <p className="text-lg md:text-2xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed mb-8">
                            Redefining medical education through <br/> <span className="text-orange-200 font-normal">Multimodal Artificial Intelligence</span>.
                        </p>
                        
                        <div className="pt-24 flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Scroll to Explore</span>
                            <ArrowDown className="w-6 h-6 text-orange-500 animate-bounce" />
                        </div>
                     </motion.div>
                </AppleSection>

                {/* 02. PROBLEM: ATLASES */}
                <AppleSection gradient="subtle">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div 
                             initial={{ opacity: 0, x: -50 }}
                             whileInView={{ opacity: 1, x: 0 }}
                             transition={{ duration: 0.8 }}
                             className="space-y-8"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                The <span className="text-red-500">Static</span> Trap.
                            </h2>
                            <p className="text-lg text-zinc-400 leading-relaxed">
                                Traditional medical atlases are the gold standard for accuracy, yet they fail in the modern era. They are prohibitively expensive, cumbersome to update, and present only a single, idealized view of pathologies.
                            </p>
                            <ul className="space-y-4 pt-4">
                                <li className="flex items-center gap-3 text-zinc-300">
                                    <X className="w-5 h-5 text-red-500" /> Fixed viewpoints, no 3D rotation.
                                </li>
                                <li className="flex items-center gap-3 text-zinc-300">
                                    <X className="w-5 h-5 text-red-500" /> Limited rare case examples.
                                </li>
                                <li className="flex items-center gap-3 text-zinc-300">
                                    <X className="w-5 h-5 text-red-500" /> Zero interactivity for students.
                                </li>
                            </ul>
                        </motion.div>
                        <motion.div 
                             initial={{ opacity: 0, scale: 0.95 }}
                             whileInView={{ opacity: 1, scale: 1 }}
                             transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <FigurePlaceholder 
                                label="Figure 1a: Static Atlas Limitations" 
                                src="images/atlases.png" 
                                className="w-full aspect-auto h-auto bg-transparent border-none shadow-none" 
                                imageClassName="object-contain h-auto relative" 
                            />
                        </motion.div>
                    </div>
                </AppleSection>

                {/* 03. PROBLEM: INTERNET */}
                <AppleSection>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                         <motion.div 
                             initial={{ opacity: 0, scale: 0.95 }}
                             whileInView={{ opacity: 1, scale: 1 }}
                             transition={{ duration: 0.8, delay: 0.2 }}
                             className="order-2 lg:order-1"
                        >
                             <FigurePlaceholder 
                                label="Figure 1b: Search Engine Noise" 
                                src="images/internet.png" 
                                className="w-full aspect-auto h-auto bg-transparent border-none shadow-none" 
                                imageClassName="object-contain h-auto relative"
                             />
                        </motion.div>
                        <motion.div 
                             initial={{ opacity: 0, x: 50 }}
                             whileInView={{ opacity: 1, x: 0 }}
                             transition={{ duration: 0.8 }}
                             className="space-y-8 order-1 lg:order-2"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                The <span className="text-orange-500">Reliability</span> Gap.
                            </h2>
                            <p className="text-lg text-zinc-400 leading-relaxed">
                                Turning to Google Images provides speed but sacrifices trust. Results are often mislabeled, lack clinical context, or originate from unverified sources, posing a risk for medical education.
                            </p>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                                    <Database className="w-6 h-6 text-orange-500 mb-2" />
                                    <div className="text-sm font-bold text-white">Uncurated Data</div>
                                </div>
                                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                                    <Globe className="w-6 h-6 text-orange-500 mb-2" />
                                    <div className="text-sm font-bold text-white">Context Loss</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </AppleSection>

                {/* 04. THE ARCHITECTURE */}
                <AppleSection gradient="amber">
                     <div className="flex flex-col h-full justify-center w-full">
                        <motion.div 
                             initial={{ opacity: 0, y: 30 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             transition={{ duration: 0.8 }}
                             className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Unified Architecture</h2>
                            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                                CLIP + ROCO + Stable Diffusion. Orchestrated in a shared latent space.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: "Retrieval", sub: "CLIP MedICaT", icon: Search, color: "orange" },
                                { title: "Generation", sub: "Prompt2MedImage", icon: Wand2, color: "red" },
                                { title: "Description", sub: "Dolly-v2 LLM", icon: AlignLeft, color: "amber" }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                    className="group p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-lg hover:border-orange-500/30 hover:bg-orange-950/10 transition-colors"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mb-6`}>
                                        <item.icon className={`w-6 h-6 text-${item.color}-500`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-zinc-500 font-mono text-sm group-hover:text-zinc-400 transition-colors">{item.sub}</p>
                                </motion.div>
                            ))}
                        </div>
                        
                        <div className="mt-20 w-full max-w-4xl mx-auto">
                             <FigurePlaceholder 
                                label="Figure 2: Pipeline Architecture Diagram" 
                                src="images/PIPELINE.png"
                                className="w-full aspect-auto h-auto bg-transparent border-none shadow-none" 
                                imageClassName="object-contain h-auto relative"
                             />
                        </div>
                     </div>
                </AppleSection>

                {/* 05. DUAL SEARCH */}
                <AppleSection>
                    <div className="max-w-5xl w-full flex flex-col items-center">
                         <div className="mb-12 text-center">
                             <span className="text-orange-500 font-mono text-sm uppercase tracking-widest mb-4 block flex items-center justify-center gap-2">
                                <Flame className="w-4 h-4" /> Key Feature
                             </span>
                             <h2 className="text-4xl md:text-7xl font-bold text-white tracking-tighter">
                                 Latent Arithmetic
                             </h2>
                         </div>

                         <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                             <div className="space-y-6">
                                 <p className="text-xl text-zinc-300 font-light leading-normal">
                                     We enable users to <span className="text-red-400 font-medium">"subtract"</span> concepts (like bones) and <span className="text-amber-400 font-medium">"add"</span> others (like soft tissue) mathematically.
                                 </p>
                                 <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 font-mono text-lg text-zinc-400 shadow-2xl">
                                     Query<span className="text-red-500 font-bold">-Bones</span><span className="text-amber-500 font-bold">+Tissue</span> = Result
                                 </div>
                             </div>
                             <div className="relative">
                                 <div className="absolute inset-0 bg-orange-600/10 blur-[120px] rounded-full" />
                                 <FigurePlaceholder 
                                    label="Figure 3: Dual Search Visual Example" 
                                    src="images/dual_search.png"
                                    className="relative z-10 w-full aspect-auto h-auto shadow-2xl border-none bg-transparent" 
                                    imageClassName="object-contain h-auto relative"
                                 />
                             </div>
                         </div>
                    </div>
                </AppleSection>

                {/* 06. CALL TO ACTION */}
                <AppleSection gradient="hero">
                     <div className="w-full max-w-7xl flex flex-col items-center gap-12">
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
                            
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800 shadow-[0_0_50px_-10px_rgba(249,115,22,0.15)] group bg-black"
                            >
                                <iframe 
                                    className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                                    src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`} 
                                    title="MIRAGE Explanation"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-center lg:text-left space-y-8"
                            >
                                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur shadow-2xl shrink-0">
                                        <KaggleLogo className="w-10 h-10 text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Run on Kaggle.</h2>
                                        <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-4 mx-auto lg:mx-0" />
                                    </div>
                                </div>
                                
                                <p className="text-lg text-zinc-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                                    Experience the full MIRAGE pipeline with zero setup cost using Kaggle's free GPU infrastructure. Reproduce our MICCAI 2025 results instantly.
                                </p>
                            </motion.div>
                        </div>
                        
                        <motion.div 
                             initial={{ opacity: 0, y: 20 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             transition={{ duration: 0.8, delay: 0.4 }}
                             className="flex flex-col md:flex-row justify-center gap-6 items-center pt-8 border-t border-zinc-800/50 w-full"
                        >
                            <a 
                                href={KAGGLE_URL} 
                                target="_blank" 
                                className="group relative px-10 py-5 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105 shadow-xl"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <KaggleLogo className="w-5 h-5" /> Open Notebook
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                            </a>
                            
                            <button onClick={onBack} className="px-10 py-5 text-zinc-400 hover:text-white font-medium text-lg transition-colors flex items-center gap-2">
                                <ChevronLeft className="w-4 h-4" /> Return to App
                            </button>
                        </motion.div>
                     </div>
                </AppleSection>

            </div>
        </motion.div>
    );
};


// --- WELCOME SCREEN (MODIFIED) ---
const WelcomeScreen = ({ onStart, onOpenPaper }) => {
  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-white selection:bg-orange-500/30 py-10 font-sans"
      initial="initial" animate="animate" exit="exit"
    >
      <OpticalGradient />
      <div className="container max-w-5xl px-6 relative z-10 flex flex-col items-center text-center space-y-12">
        <motion.div variants={pageTransition} className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-700/50 rounded-full px-5 py-2 backdrop-blur-md shadow-lg">
            <Award className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold text-zinc-200 tracking-wide uppercase">
              The Fourth Workshop on Applications of Medical AI (AMAI) <span className="text-zinc-500 mx-1">|</span> MICCAI 2025
            </span>
        </motion.div>
        <motion.div variants={pageTransition} className="space-y-4">
          <BreathingTitle />
          <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto leading-relaxed font-light">
            Retrieval and Generation of Multimodal Images <br/> & Texts for Medical Education
          </p>
        </motion.div>
        <motion.div variants={pageTransition} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            <div className="bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 p-6 rounded-2xl flex flex-col items-center gap-4 transition-colors duration-300 backdrop-blur-sm">
                <div className="h-12 flex items-center gap-3 opacity-90">
                   <BrainCircuit className="w-8 h-8 text-zinc-300" />
                   <div className="text-left">
                     <div className="text-sm font-bold text-zinc-100">FAST INFERENCE</div>
                     <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Visual Only Retrieval</div>
                   </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  Optimized for speed. Retrieves medical imagery using pure visual vector similarity (CLIP).
                </p>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 p-6 rounded-2xl flex flex-col items-center gap-4 transition-colors duration-300 backdrop-blur-sm">
               <div className="h-12 flex items-center gap-3 opacity-90">
                   <ScanEye className="w-8 h-8 text-zinc-300" />
                   <div className="text-left">
                     <div className="text-sm font-bold text-zinc-100">ROCO DATASET</div>
                     <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Radiology Optimized</div>
                   </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  Built on a foundation of thousands of annotated radiology images form PubMed.
                </p>
            </div>
        </motion.div>
        
        <div className="flex items-center gap-4">
            <motion.button 
                onClick={onOpenPaper}
                variants={pageTransition}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-full font-bold tracking-wide uppercase text-xs flex items-center gap-2 transition-all"
            >
                <BookOpen className="w-4 h-4" /> Explain Paper
            </motion.button>

            <motion.button 
              variants={pageTransition}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="group relative px-10 py-4 bg-white text-black rounded-full font-bold tracking-wide uppercase overflow-hidden shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              <span className="relative z-10 flex items-center gap-2 text-sm">
                Enter System <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// UI HELPERS (Sliders, Counters, Checkboxes, Inputs)
const ParameterSlider = ({ icon: Icon, label, value, onChange, min, max, step, description, formatValue }) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3 text-amber-500" /> {label}
                </div>
                <span className="text-amber-400">{formatValue ? formatValue(value) : value}</span>
            </div>
            <div className="relative h-4 flex items-center group">
                <div className="absolute inset-x-0 h-1 bg-zinc-800 rounded-lg overflow-hidden">
                     <div 
                        className="h-full bg-gradient-to-r from-yellow-600 to-amber-500"
                        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
                     />
                </div>
                <input 
                    type="range" min={min} max={max} step={step} value={value} 
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                <motion.div 
                    className="absolute h-3 w-3 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)] border border-yellow-200 pointer-events-none"
                    style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 6px)` }}
                />
            </div>
            {description && <p className="text-[9px] text-zinc-600">{description}</p>}
        </div>
    );
};

const TopKCounter = ({ value, onChange, disabled }) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            <div className={cn("flex items-center gap-3 bg-zinc-950/40 border border-zinc-700 rounded-lg p-1 w-full justify-between", disabled && "opacity-60 cursor-not-allowed")}>
                <button 
                    onClick={() => !disabled && onChange(Math.max(1, value - 1))}
                    disabled={disabled}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors disabled:pointer-events-none"
                >
                    <Minus className="w-3 h-3" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Retrieval Count</span>
                    <span className="font-mono text-sm font-bold text-zinc-200">K={value}</span>
                </div>
                <button 
                    onClick={() => !disabled && onChange(Math.min(10, value + 1))}
                    disabled={disabled}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors disabled:pointer-events-none"
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

const CheckboxTile = ({ icon: Icon, label, checked, onChange, color = "orange", description, infoTitle, infoDesc }) => {
  const [showInfo, setShowInfo] = useState(false);
  
  const styles = {
      rose: { active: "bg-rose-500/10 border-rose-500/50", icon: "text-rose-500", checkbox: "bg-rose-500 border-rose-500", info: "border-rose-500/30 text-rose-400" },
      orange: { active: "bg-orange-500/10 border-orange-500/50", icon: "text-orange-500", checkbox: "bg-orange-500 border-orange-500", info: "border-orange-500/30 text-orange-400" },
      amber: { active: "bg-amber-500/10 border-amber-500/50", icon: "text-amber-500", checkbox: "bg-amber-500 border-amber-500", info: "border-amber-500/30 text-amber-400" },
      default: { active: "bg-zinc-800 border-zinc-600", icon: "text-zinc-500", checkbox: "bg-zinc-500 border-zinc-500", info: "border-zinc-700 text-zinc-400" }
  };
  const currentStyle = styles[color] || styles.default;

  return (
    <div className="flex flex-col">
        <div className="flex items-center gap-2">
            <motion.div 
                layout
                onClick={() => onChange(!checked)}
                className={cn("relative flex-1 rounded-xl border p-3 cursor-pointer transition-all duration-300", checked ? currentStyle.active : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-600")}
            >
                <div className="flex items-center gap-3">
                    <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0", checked ? `${currentStyle.checkbox} text-black` : "border-zinc-600 bg-transparent")}>
                        {checked && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                        <h4 className={cn("text-xs font-bold uppercase tracking-wider", checked ? "text-white" : "text-zinc-400")}>{label}</h4>
                    </div>
                    <Icon className={cn("w-4 h-4", checked ? currentStyle.icon : "text-zinc-500")} />
                </div>
            </motion.div>
            
            {infoTitle && (
                 <button 
                    onClick={() => setShowInfo(!showInfo)} 
                    className={cn(
                        "p-2 rounded-lg border bg-zinc-900/40 hover:bg-zinc-900 transition-colors", 
                        showInfo ? currentStyle.info + " bg-zinc-900" : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
                    )}
                 >
                    <Info className="w-4 h-4" />
                 </button>
            )}
        </div>
        
        <AnimatePresence>
            {showInfo && infoTitle && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className={cn("mt-2 bg-zinc-900/80 border p-3 rounded-lg text-[10px] text-zinc-400 leading-relaxed shadow-inner", currentStyle.info?.split(' ')[0] || "border-zinc-800")}>
                        <strong className={cn("block mb-1 font-bold uppercase tracking-wide", currentStyle.info?.split(' ')[1] || "text-zinc-300")}>{infoTitle}</strong>
                        {infoDesc}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

const InputField = ({ icon: Icon, value, onChange, placeholder, color = "orange", label }) => {
    const textareaRef = useRef(null);
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);
    
    // Gradient definitions for borders
    const gradients = {
        red: "bg-[conic-gradient(transparent,rgba(239,68,68,1),transparent,rgba(239,68,68,1),transparent)]",
        rose: "bg-[conic-gradient(transparent,rgba(244,63,94,1),transparent,rgba(244,63,94,1),transparent)]",
        orange: "bg-[conic-gradient(transparent,rgba(249,115,22,1),transparent,rgba(249,115,22,1),transparent)]",
        amber: "bg-[conic-gradient(transparent,rgba(245,158,11,1),transparent,rgba(245,158,11,1),transparent)]",
    }

    return (
        <div className="space-y-1.5">
            {label && <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">{label}</label>}
            
            <div className="relative group rounded-lg p-[1px] overflow-hidden bg-zinc-800/50">
                <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] opacity-0 group-focus-within:opacity-100 transition-opacity duration-500">
                    <div className={cn("w-full h-full", gradients[color] || gradients.orange)} />
                </div>

                <div className="relative bg-zinc-950 rounded-lg flex items-start">
                    <div className="absolute top-3 left-3 flex items-center pointer-events-none z-10">
                        <Icon className={cn("w-4 h-4 transition-colors", value ? "text-white" : "text-zinc-500")} />
                    </div>
                    <textarea 
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={1}
                        className="w-full pl-10 pr-3 py-3 bg-zinc-950/90 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all focus:bg-zinc-900/50 relative z-10 resize-none overflow-hidden min-h-[44px]"
                    />
                </div>
            </div>
        </div>
    );
};

// --- DEFINICIONES FALTANTES (MOVIDAS ANTES DE MainInterface) ---

const Column = ({ title, query, color, children }) => (
    <div className="space-y-6">
        <div className={`pb-4 border-b border-zinc-800 border-l-4 pl-4 border-l-${color}-500`}>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">{title}</h2>
            <p className="text-zinc-400 font-mono text-xs mt-1 truncate">{query}</p>
        </div>
        {children}
    </div>
);

const ResultCard = ({ item, isSynth, label }) => {
    if(!item) return null;
    const url = isSynth ? item.url : (item.url?.startsWith('http') ? item.url : `${API_URL}${item.url}`);

    return (
        <motion.div variants={cardVariant} className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-colors shadow-2xl flex flex-col h-full">
            <div className="absolute top-4 left-4 z-20 flex gap-2">
                 <div className="px-3 py-1 bg-black/80 backdrop-blur border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
                    {label}
                </div>
            </div>

            <div className="aspect-[4/5] w-full bg-[#020202] relative p-4 flex items-center justify-center">
                <img 
                    src={url || "https://placehold.co/400x500/18181b/3f3f46?text=No+Image"} 
                    className={cn(
                        "max-w-full max-h-full object-contain shadow-2xl transition-all duration-500", 
                        isSynth ? "opacity-90" : "opacity-90 group-hover:scale-105 group-hover:opacity-100"
                    )}
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />
            </div>

            <div className="p-5 border-t border-zinc-800 bg-zinc-900 flex-1 flex flex-col">
                 {isSynth ? (
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-amber-500/10 rounded-lg">
                             <Sparkles className="w-4 h-4 text-amber-500" />
                         </div>
                         <div>
                             <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Synthetic Generation</h4>
                             <p className="text-[10px] text-zinc-500">Created by Diffusion Model</p>
                         </div>
                    </div>
                 ) : (
                    <div className="space-y-3 flex-1 flex flex-col">
                        <div className="flex items-start justify-between">
                            <span className="text-orange-500 text-[9px] font-bold uppercase tracking-widest">Findings</span>
                            {item.score && (
                                <div className="text-right">
                                    <span className="text-white font-mono text-xs font-bold block">Score: {(item.score * 100).toFixed(1)}%</span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                            {item.caption || "No caption available for this image."}
                        </p>
                    </div>
                 )}
            </div>
        </motion.div>
    );
};

const DescriptionBox = ({ text, title }) => {
    if(!text || text === "LLM generation skipped.") return null;
    return (
        <motion.div variants={cardVariant} className="bg-zinc-900/50 border-l-4 border-orange-500 border-y border-r border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-zinc-800 rounded-lg">
                    <FileText className="w-4 h-4 text-orange-400" />
                </div>
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">{title}</h4>
            </div>
            <RichText text={text} className="text-sm text-zinc-300 leading-relaxed font-sans block" />
        </motion.div>
    );
};

// 3. MAIN APP INTERFACE
const MainInterface = ({ onBack }) => { 
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(1); 
  const [isDualSearch, setIsDualSearch] = useState(false);
  const [loadDescription, setLoadDescription] = useState(false);
  const [generateSynthetic, setGenerateSynthetic] = useState(false);
  
  const isHeavyComputation = isDualSearch || loadDescription || generateSynthetic;

  useEffect(() => {
    if (isHeavyComputation) {
        setTopK(1);
    }
  }, [isHeavyComputation]);
  
  const [showMedicalInspiration, setShowMedicalInspiration] = useState(false);
  const [showDualInspiration, setShowDualInspiration] = useState(false);

  const [guidanceScale, setGuidanceScale] = useState(1);
  const [inferenceSteps, setInferenceSteps] = useState(5); 

  const [addConcept, setAddConcept] = useState('');
  const [subConcept, setSubConcept] = useState('');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); 
  const [error, setError] = useState(null);
  
  const isDualSearchValid = !isDualSearch || (addConcept.trim() !== '' && subConcept.trim() !== '');
  const canExecute = !loading && query.trim() !== '' && isDualSearchValid;

  const handleExecute = async () => {
    if (!canExecute) return;
    setLoading(true); 
    setResults(null);
    setError(null);
    
    try {
        const payload = {
            original_text: query,
            sub_concept: isDualSearch ? subConcept : null,
            add_concept: isDualSearch ? addConcept : null,
            top_k: topK,
            gen_text: loadDescription,     
            gen_image: generateSynthetic,
            guidance_scale: generateSynthetic ? guidanceScale : undefined,
            num_inference_steps: generateSynthetic ? inferenceSteps : undefined,
        };
        const res = await fetch(`${API_URL}/generate_comparison`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("API Error");
        const data = await res.json();
        setResults(data);
    } catch (e) {
      console.error(e);
      setError("Connection Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetMedicalExample = (text) => {
      setQuery(text);
      setShowMedicalInspiration(false);
  };
  
  const handleSetDualExample = (ex) => {
      setQuery(ex.query);
      setAddConcept(ex.add);
      setSubConcept(ex.sub);
      setIsDualSearch(true);
      setShowDualInspiration(false);
  };

  return (
    <div className="h-screen bg-[#09090b] text-zinc-100 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        className="w-full md:w-[420px] bg-zinc-950/90 border-r border-zinc-800/50 flex flex-col z-20 shadow-2xl backdrop-blur-xl flex-shrink-0"
      >
        <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={onBack}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-900/20">
                    <Zap className="w-4 h-4 text-white fill-current" />
                </div>
                <div>
                    <h1 className="font-bold tracking-tight text-zinc-100">MIRAGE <span className="text-zinc-500 font-normal">OS</span></h1>
                    <p className="text-[9px] text-zinc-600 uppercase tracking-widest">v1</p>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* INPUT SECTION (RED SPECTRUM) */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-1">Medical Query</label>
                    <button 
                        onClick={() => setShowMedicalInspiration(!showMedicalInspiration)}
                        className="text-[9px] text-red-400/80 hover:text-red-300 transition-colors flex items-center gap-1 uppercase tracking-wide font-medium"
                     >
                        <Lightbulb className="w-2.5 h-2.5" /> Need inspiration?
                     </button>
                </div>
                
                 {/* Inspiration Panel (Medical) */}
                <AnimatePresence>
                    {showMedicalInspiration && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-zinc-900/50 border border-red-500/20 rounded-lg p-2 mb-3 space-y-2">
                                <p className="text-[9px] text-zinc-400 uppercase tracking-wider px-1">Select a query:</p>
                                {MEDICAL_PROMPTS.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSetMedicalExample(item.text)}
                                        className="w-full text-left p-2 rounded hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all group"
                                    >
                                        <div className="text-[10px] font-bold text-zinc-300 group-hover:text-red-200">{item.title}</div>
                                        <div className="text-[9px] text-zinc-500 group-hover:text-zinc-400 whitespace-normal leading-relaxed">{item.text}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <InputField 
                    icon={Search} 
                    placeholder={`Enter medical query...`} 
                    value={query} 
                    onChange={setQuery} 
                    color="red"
                />

                <div className="flex items-start gap-3 pt-2">
                     <TopKCounter 
                        value={topK} 
                        onChange={setTopK} 
                        disabled={isHeavyComputation} 
                     />
                </div>
            </section>

            <div className="h-px bg-zinc-800/50" />

            {/* CONTROLS */}
            <section className="space-y-6">
                <div className="space-y-3">
                    {/* DUAL SEARCH (ROSE/PINK SPECTRUM) */}
                    <div className="flex items-center justify-between">
                         <div className="flex-1">
                            <CheckboxTile 
                                icon={SplitSquareHorizontal} 
                                label="Dual Search (Arithmetic)" 
                                checked={isDualSearch} 
                                onChange={setIsDualSearch} 
                                color="rose"
                                infoTitle="Dual Search Logic"
                                infoDesc="Performs vector arithmetic in the latent space. Adding a concept pushes the search vector towards a specific feature (e.g., 'Pneumonia'), while subtracting moves it away (e.g., 'Bones'). Adjusting weights fine-tunes this balance."
                            />
                         </div>
                         {isDualSearch && (
                             <button 
                                onClick={() => setShowDualInspiration(!showDualInspiration)}
                                className="ml-2 text-[9px] text-rose-400/80 hover:text-rose-300 transition-colors flex items-center gap-1 uppercase tracking-wide font-medium whitespace-nowrap"
                             >
                                <Lightbulb className="w-2.5 h-2.5" /> Examples
                             </button>
                         )}
                    </div>

                    <AnimatePresence>
                        {isDualSearch && showDualInspiration && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-2 ml-2 border-l-2 border-rose-500/30"
                            >
                                 <div className="bg-zinc-900/50 border border-rose-500/20 rounded-lg p-2 mb-3 space-y-2">
                                    <p className="text-[9px] text-zinc-400 uppercase tracking-wider px-1">Try vector arithmetic:</p>
                                    {DUAL_ARITHMETIC_EXAMPLES.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSetDualExample(item)}
                                            className="w-full text-left p-2 rounded hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all group"
                                        >
                                            <div className="text-[10px] font-bold text-zinc-300 group-hover:text-rose-200">{item.title}</div>
                                            <div className="text-[9px] text-zinc-500 flex gap-2 font-mono mt-1">
                                                <span className="text-zinc-400">{item.query}</span>
                                                <span className="text-rose-400">+ {item.add}</span>
                                                <span className="text-rose-400">- {item.sub}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <AnimatePresence>
                        {isDualSearch && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3 pl-2 border-l-2 border-rose-500/30 ml-2 pt-2">
                                <InputField icon={Plus} label="Add Concept (+)" placeholder="e.g. Fracture" value={addConcept} onChange={setAddConcept} color="rose" />
                                <InputField icon={Minus} label="Subtract Concept (-)" placeholder="e.g. Bones" value={subConcept} onChange={setSubConcept} color="rose" />
                                {(!addConcept || !subConcept) && (
                                    <p className="text-[9px] text-red-500 font-bold uppercase tracking-wide animate-pulse px-1">
                                        * Both concepts required for calculation
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* LLM CONTEXT (ORANGE SPECTRUM) */}
                    <CheckboxTile 
                        icon={FileText} 
                        label="Generate Context (LLM)" 
                        checked={loadDescription} 
                        onChange={setLoadDescription} 
                        color="orange"
                        infoTitle="LLM Radiology Report"
                        infoDesc="Uses a Large Language Model to synthesize findings from the top retrieved images into a coherent radiology report. It translates raw visual retrieval data into natural language descriptions."
                    />
                    
                    {/* SYNTHETIC (AMBER SPECTRUM) */}
                    <CheckboxTile 
                        icon={ImageIcon} 
                        label="Synthetic Imaging (SD)" 
                        checked={generateSynthetic} 
                        onChange={setGenerateSynthetic} 
                        color="amber"
                        infoTitle="Generative Imaging"
                        infoDesc="Creates a new, artificial medical image based on the search context using Stable Diffusion. 'Guidance Scale' controls how strictly the AI follows the prompt (higher = stricter). 'Steps' controls image quality/refinement."
                    />
                    <AnimatePresence>
                        {generateSynthetic && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4 pl-3 border-l-2 border-amber-500/30 ml-2 py-2">
                                <ParameterSlider icon={Sliders} label="Guidance Scale" value={guidanceScale} min={1.0} max={3.0} step={0.1} onChange={setGuidanceScale} description="Controls prompt adherence strictness." />
                                <ParameterSlider icon={Gauge} label="Inference Steps" value={inferenceSteps} min={1} max={10} step={1} onChange={setInferenceSteps} description="Higher steps = better quality, slower speed." />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-950 z-20 flex-shrink-0">
             <button 
                onClick={handleExecute}
                disabled={!canExecute}
                className={cn(
                    "w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-2",
                    canExecute 
                        ? "bg-white text-black hover:bg-orange-500 hover:text-white shadow-lg shadow-orange-900/20" 
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
                )}
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                {loading ? "Processing Vectors..." : "Execute Operation"}
            </button>
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative bg-[#050505] overflow-y-auto custom-scrollbar">
         {/* Background Elements */}
         <div className="fixed inset-0 pointer-events-none">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[100px]" />
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-900/5 rounded-full blur-[100px]" />
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
         </div>

         {/* CONTENT WRAPPER */}
         <motion.div 
            className="relative z-10 p-8 min-h-full flex flex-col"
            animate={{ marginRight: "0px" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
         >
            <header className="flex justify-between items-center mb-10 flex-shrink-0">
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-widest">
                    <div className={cn("w-2 h-2 rounded-full", loading ? "bg-orange-500 animate-pulse" : "bg-emerald-500")} />
                    Status: {loading ? "Computing" : "Idle"}
                </div>
            </header>

            <AnimatePresence mode="wait">
                {loading && (
                    <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center space-y-6 relative h-full">
                         {/* STANDARD LOADER */}
                         <div className="text-center space-y-4">
                            <div className="relative w-32 h-32 mx-auto">
                                <div className="absolute inset-0 border-t-2 border-orange-500 rounded-full animate-spin" />
                                <div className="absolute inset-4 border-t-2 border-blue-500 rounded-full animate-spin direction-reverse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <BrainCircuit className="w-10 h-10 text-zinc-700" />
                                </div>
                            </div>
                            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest animate-pulse">Navigating Latent Space...</p>
                         </div>
                    </motion.div>
                )}

                {!loading && !results && (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center opacity-50 relative overflow-hidden">
                        <BrainstormingBackground />
                        
                        <div className="z-10 flex flex-col items-center bg-zinc-950/70 backdrop-blur-md p-10 rounded-3xl border border-zinc-800 shadow-2xl">
                            <Command className="w-24 h-24 mb-6 text-zinc-800" />
                            <h2 className="text-4xl font-bold text-zinc-800 tracking-tighter">SYSTEM IDLE</h2>
                            <p className="text-zinc-600 mt-2 text-sm max-w-sm">Ready to navigate high-dimensional medical latent spaces.</p>
                        </div>
                    </motion.div>
                )}

                {!loading && results && (
                    <motion.div key="results" className="w-full max-w-7xl mx-auto space-y-12" initial="hidden" animate="show" variants={staggerContainer}>
                        
                        <div className={cn("grid gap-8", results.modified ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 max-w-3xl mx-auto")}>
                            <Column title={results.modified ? "Original Vector" : "Query Result"} query={results.original_text} color="blue">
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Array.isArray(results.original.real_match) 
                                            ? results.original.real_match.map((item, i) => <ResultCard key={i} item={item} label={`Retrieval #${i+1}`} query={results.original_text} />)
                                            : <ResultCard item={results.original.real_match} label="Best Match" query={results.original_text} />
                                        }
                                        {results.original.synthetic.image_base64 && (
                                            <ResultCard item={{ url: results.original.synthetic.image_base64, score: null }} isSynth label="Synthesis" />
                                        )}
                                    </div>
                                    <DescriptionBox text={results.original.synthetic.generated_prompt} title="Radiology Context" />
                                </div>
                            </Column>

                            {results.modified && (
                                <Column title="Modified Vector" query={results.modified_text} color="orange">
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {Array.isArray(results.modified.real_match) 
                                                ? results.modified.real_match.map((item, i) => <ResultCard key={i} item={item} label={`Retrieval #${i+1}`} query={results.modified_text} />)
                                                : <ResultCard item={results.modified.real_match} label="Best Match" query={results.modified_text} />
                                            }
                                            {results.modified.synthetic.image_base64 && (
                                                <ResultCard item={{ url: results.modified.synthetic.image_base64, score: null }} isSynth label="Synthesis" />
                                            )}
                                        </div>
                                        <DescriptionBox text={results.modified.synthetic.generated_prompt} title="Radiology Context" />
                                    </div>
                                </Column>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
         </motion.div>
      </main>
    </div>
  );
};

// --- EXPORTACIÓN FINAL DE LA APP ---
export default function App() {
  const [mode, setMode] = useState('welcome'); // Estados: 'welcome', 'app', 'paper'
  
  return (
    <AnimatePresence mode="wait">
        {mode === 'welcome' && (
            <WelcomeScreen 
                key="welcome" 
                onStart={() => setMode('app')} 
                onOpenPaper={() => setMode('paper')} 
            />
        )}
        
        {mode === 'app' && (
            <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen w-full">
                <MainInterface onBack={() => setMode('welcome')} /> 
            </motion.div>
        )}
        
        {/* RENDERIZADO DE PÁGINA DEL PAPER (EN ESPAÑOL) */}
        {mode === 'paper' && (
            <PaperExplanation key="paper" onBack={() => setMode('welcome')} />
        )}
    </AnimatePresence>
  );
}