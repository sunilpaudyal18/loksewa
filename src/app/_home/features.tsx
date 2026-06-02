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
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function Features() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything You Need
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-lg mx-auto">
            A complete AI-powered study toolkit
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                variants={item}
                className="group rounded-2xl border border-slate-800/60 bg-slate-900/50 backdrop-blur-sm p-6 md:p-7 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/20 mb-4 group-hover:from-indigo-500/30 group-hover:to-indigo-600/20 transition-all duration-300">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
