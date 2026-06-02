"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.08] to-amber-500/[0.04] p-10 md:p-16 shadow-lg shadow-indigo-500/5"
        >
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Ready to Study Smarter?
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Upload your first question paper and get a full interactive quiz in under 30 seconds.
          </p>
          <div className="mt-8">
            <Link
              href="/upload"
              className="group inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl hover:from-indigo-500 hover:to-indigo-400 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
