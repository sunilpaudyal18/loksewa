"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const stats = [
  { value: "100+", label: "Questions per paper" },
  { value: "Eng+नेपाली", label: "Bilingual OCR" },
  { value: "< 30s", label: "Processing time" },
];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function Hero() {
  return (
    <section className="pt-28 pb-16 md:pt-36 md:pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={item} className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              Built for Nepal&apos;s Loksewa Aspirants
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
          >
            Transform Scanned Papers into{" "}
            <span className="block sm:inline bg-gradient-to-r from-indigo-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">
              Interactive Quizzes
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Upload your Loksewa question paper images. Our AI reads Nepali &amp; English text,
            extracts every MCQ, matches with the answer key, and gives you a full practice quiz — instantly.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/25"
            >
              Upload Question Paper
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-7 py-3 text-sm font-medium text-slate-300 border border-slate-700/60 rounded-xl hover:border-slate-600 hover:text-white transition-all duration-200"
            >
              <Play className="w-4 h-4" />
              See How It Works
            </Link>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-12 md:mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-5"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl md:text-2xl font-bold text-indigo-400">
                  {s.value}
                </div>
                <div className="mt-0.5 text-xs text-slate-500 font-medium uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
