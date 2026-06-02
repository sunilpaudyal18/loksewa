"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 border-t border-slate-800/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-xl text-center rounded-2xl border border-slate-800/60 bg-slate-900 p-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Ready to Study Smarter?
          </h2>
          <p className="mt-4 text-sm md:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
            Upload your first question paper and get a full interactive quiz in under 30 seconds.
          </p>
          <div className="mt-8">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/25"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
