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
    <section className="border-t border-slate-800/50 py-24">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.35 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            How It Works
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-500 max-w-lg mx-auto">
            Four simple steps to go from scanned paper to scored quiz
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                variants={item}
                className="rounded-xl border border-slate-800/60 bg-slate-900 p-6 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/15">
                    <Icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-xs font-semibold tracking-wider text-indigo-400/60 uppercase">
                    Step {step.num}
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-1.5">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">{step.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex justify-center mt-10"
        >
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-slate-400 border border-slate-800/60 rounded-xl hover:border-slate-700 hover:text-slate-200 transition-colors"
          >
            Learn More in Detail
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
