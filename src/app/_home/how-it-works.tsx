"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, Sparkles, Eye, Play, ArrowRight } from "lucide-react";

const steps = [
  { num: "01", icon: Upload, title: "Upload Images", desc: "Drag & drop your question paper pages and the answer key image." },
  { num: "02", icon: Sparkles, title: "AI Processing", desc: "Our OCR + parser engine extracts all questions and matches answers." },
  { num: "03", icon: Eye, title: "Review & Fix", desc: "Check extracted questions, fix any OCR errors before practicing." },
  { num: "04", icon: Play, title: "Start Quiz", desc: "Take the interactive quiz, submit, and get your score instantly." },
];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function HowItWorks() {
  return (
    <section className="border-t border-slate-800/50 py-24 md:py-32 xl:py-40">
      <div className="mx-auto w-full px-8 md:px-10" style={{ maxWidth: "1400px" }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.35 }}
          className="text-center mb-12 md:mb-16 xl:mb-20"
        >
          <h2 className="text-3xl md:text-5xl xl:text-[3.5rem] font-bold tracking-tight">
            How It Works
          </h2>
          <p className="mt-3 md:mt-4 text-sm md:text-lg xl:text-xl text-slate-500 mx-auto leading-relaxed" style={{ maxWidth: "600px" }}>
            Four simple steps to go from scanned paper to scored quiz
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 xl:gap-8"
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                variants={item}
                className="rounded-xl border border-slate-800/60 bg-slate-900 flex flex-col"
                style={{ padding: "2rem", minHeight: "280px" }}
              >
                <div className="flex items-center gap-3 mb-4 md:mb-5">
                  <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 xl:w-14 xl:h-14 rounded-lg bg-indigo-500/15">
                    <Icon className="w-4 h-4 md:w-5 md:h-5 xl:w-6 xl:h-6 text-indigo-400" />
                  </div>
                  <span className="text-xs md:text-sm xl:text-base font-semibold tracking-wider text-indigo-400/60 uppercase">
                    Step {step.num}
                  </span>
                </div>
                <h3 className="text-base md:text-xl xl:text-2xl font-semibold mb-2">{step.title}</h3>
                <p className="text-sm md:text-base xl:text-lg text-slate-400 leading-relaxed flex-1">{step.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex justify-center mt-10 md:mt-12 xl:mt-14"
        >
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 md:px-6 md:py-3 xl:px-8 xl:py-4 text-sm md:text-base xl:text-lg font-medium text-slate-400 border border-slate-800/60 rounded-xl hover:border-slate-700 hover:text-slate-200 transition-colors"
          >
            Learn More in Detail
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 xl:w-5 xl:h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}