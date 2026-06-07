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
    <section className="pt-40 pb-24 md:pt-48 md:pb-28 lg:pt-56 lg:pb-36">
      <div className="mx-auto w-full max-w-[90rem] px-6 md:px-10 lg:px-16 xl:px-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 lg:px-5 lg:py-2 text-xs lg:text-sm xl:text-base font-semibold tracking-wide text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              Built for Nepal&apos;s Loksewa Aspirants
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mx-auto max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-extrabold tracking-tight leading-[1.05]"
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
            className="mx-auto max-w-2xl lg:max-w-3xl xl:max-w-4xl mt-6 lg:mt-8 text-base sm:text-lg lg:text-xl xl:text-2xl text-slate-400 leading-relaxed"
          >
            Upload your Loksewa question paper images. Our AI reads Nepali &amp; English text,
            extracts every MCQ, matches with the answer key, and gives you a full practice quiz — instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-10 lg:mt-12 xl:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-6"
          >
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-7 py-3 lg:px-9 lg:py-4 xl:px-10 xl:py-5 text-sm lg:text-base xl:text-lg font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-500/25"
            >
              Upload Question Paper
              <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-7 py-3 lg:px-9 lg:py-4 xl:px-10 xl:py-5 text-sm lg:text-base xl:text-lg font-medium text-slate-300 border border-slate-700/60 rounded-xl hover:border-slate-600 hover:text-white transition-colors"
            >
              <Play className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
              See How It Works
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-16 lg:mt-20 xl:mt-24 flex flex-wrap items-center justify-center gap-x-14 lg:gap-x-20 xl:gap-x-24 gap-y-5"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-indigo-400">
                  {s.value}
                </div>
                <div className="mt-1 text-xs lg:text-sm xl:text-base text-slate-500 font-medium uppercase tracking-wider">
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
