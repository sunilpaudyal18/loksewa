"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="border-t border-slate-800/50 py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.35 }}
          className="mx-auto max-w-2xl text-center rounded-xl border border-slate-800/60 bg-slate-900 p-10 md:p-12 lg:p-16"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
            Ready to Study Smarter?
          </h2>
          <p className="mt-4 text-sm md:text-base lg:text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
            Upload your first question paper and get a full interactive quiz in under 30 seconds.
          </p>
          <div className="mt-8 lg:mt-10">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-7 py-3 lg:px-8 lg:py-4 text-sm lg:text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-500/25"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
