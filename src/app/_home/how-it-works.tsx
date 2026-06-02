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
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function HowItWorks() {
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
            How It Works
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-lg mx-auto">
            Four simple steps to go from scanned paper to scored quiz
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-indigo-500/30 via-indigo-400/20 to-amber-400/30" />

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  variants={item}
                  className="group relative rounded-2xl border border-slate-800/60 bg-slate-900/50 backdrop-blur-sm p-6 md:p-8 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/20 group-hover:from-indigo-500/30 group-hover:to-indigo-600/20 transition-all duration-300">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-4xl font-extrabold text-slate-800/50 select-none">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex justify-center mt-10"
        >
          <Link
            href="/how-it-works"
            className="group inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-slate-300 border border-slate-700/60 rounded-xl hover:border-indigo-500/40 hover:text-white transition-all duration-200"
          >
            Learn More in Detail
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
