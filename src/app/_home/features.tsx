"use client";

import { motion } from "framer-motion";
import { Scan, BrainCircuit, Zap, BarChart3, Languages, Smartphone } from "lucide-react";

const features = [
  { icon: Scan, title: "Smart OCR Upload", desc: "Upload scanned question papers and answer keys. Our AI reads both English and Nepali text accurately." },
  { icon: BrainCircuit, title: "Auto Question Parsing", desc: "Regex-powered engine extracts questions, options A–D, and matches them with answer keys automatically." },
  { icon: Zap, title: "Interactive Practice", desc: "Attempt questions, track time, skip and return, then get a detailed score breakdown." },
  { icon: BarChart3, title: "Performance Analytics", desc: "Review every answer, see where you went wrong, and track improvement over sessions." },
  { icon: Languages, title: "Bilingual Support", desc: "Full support for both Nepali (Devanagari) and English questions in the same paper." },
  { icon: Smartphone, title: "Works Everywhere", desc: "Optimized for mobile. Snap photos with your camera and get a quiz instantly." },
];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export default function Features() {
  return (
    <section className="bg-slate-900/30 py-24">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.35 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything You Need
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-500 max-w-lg mx-auto">
            A complete AI-powered study toolkit
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                variants={item}
                className="rounded-xl border border-slate-800/60 bg-slate-900 p-6 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/15 mb-4">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="text-base font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
