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
    <section className="bg-slate-900/30 py-24 md:py-32 xl:py-40">
      <div className="mx-auto w-full px-8 md:px-10" style={{ maxWidth: "1400px" }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.35 }}
          className="text-center mb-12 md:mb-16 xl:mb-20"
        >
          <h2 className="text-3xl md:text-5xl xl:text-[3.5rem] font-bold tracking-tight">
            Everything You Need
          </h2>
          <p className="mt-3 md:mt-4 text-sm md:text-lg xl:text-xl text-slate-500 mx-auto leading-relaxed" style={{ maxWidth: "600px" }}>
            A complete AI-powered study toolkit
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 xl:gap-8"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                variants={item}
                className="rounded-xl border border-slate-800/60 bg-slate-900 hover:border-slate-700/80 transition-colors flex flex-col"
                style={{ padding: "2rem", minHeight: "280px" }}
              >
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 xl:w-14 xl:h-14 rounded-lg bg-indigo-500/15 mb-4 md:mb-5">
                  <Icon className="w-4 h-4 md:w-5 md:h-5 xl:w-6 xl:h-6 text-indigo-400" />
                </div>
                <h3 className="text-base md:text-xl xl:text-2xl font-semibold mb-2">{f.title}</h3>
                <p className="text-sm md:text-base xl:text-lg text-slate-400 leading-relaxed flex-1">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}