"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="border-t border-slate-800/50 py-24">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.35 }}
          className="mx-auto max-w-xl text-center rounded-xl border border-slate-800/60 bg-slate-900 p-10 md:p-12"
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
              className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-500/25"
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
