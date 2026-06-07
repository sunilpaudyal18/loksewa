"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const stats = [
  { value: "100+", label: "Questions per paper" },
  { value: "Eng+नेपाली", label: "Bilingual OCR" },
  { value: "< 30s", label: "Processing time" },
];

export default function Hero() {
  return (
    <section
      className="flex items-center justify-center pt-32 pb-20 md:pt-40 md:pb-24"
      style={{ minHeight: "90vh" }}
    >
      <div
        className="mx-auto w-full px-8 md:px-10"
        style={{ maxWidth: "1600px" }}
      >
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span
              className="inline-flex items-center gap-1.5 px-4 py-1.5 md:px-5 md:py-2 text-xs md:text-sm xl:text-base font-semibold tracking-wide text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
            >
              Built for Nepal&apos;s Loksewa Aspirants
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-6 md:mt-8 font-extrabold tracking-tight text-slate-100"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 7rem)",
              lineHeight: "0.95",
            }}
          >
            Transform Scanned Papers into{" "}
            <span className="block bg-gradient-to-r from-indigo-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">
              Interactive Quizzes
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mx-auto mt-5 md:mt-6 text-base md:text-lg xl:text-xl text-slate-400 leading-relaxed"
            style={{ maxWidth: "720px" }}
          >
            Upload your Loksewa question paper images. Our AI reads Nepali &amp; English text,
            extracts every MCQ, matches with the answer key, and gives you a full practice quiz — instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5"
          >
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 text-sm md:text-base xl:text-lg font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-500/25"
            >
              Upload Question Paper
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 text-sm md:text-base xl:text-lg font-medium text-slate-300 border border-slate-700/60 rounded-xl hover:border-slate-600 hover:text-white transition-colors"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5" />
              See How It Works
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-12 md:mt-16 flex flex-wrap items-center justify-center gap-x-12 md:gap-x-16 gap-y-5"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl xl:text-4xl font-bold text-indigo-400">
                  {s.value}
                </div>
                <div className="mt-1 text-xs md:text-sm xl:text-base text-slate-500 font-medium uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}