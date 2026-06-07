"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="border-t border-slate-800/50 py-24 lg:py-32 xl:py-36">
      <div className="mx-auto w-full max-w-[90rem] px-6 md:px-10 lg:px-16 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.35 }}
          className="mx-auto max-w-3xl lg:max-w-4xl text-center rounded-xl border border-slate-800/60 bg-slate-900 p-10 md:p-12 lg:p-16 xl:p-20"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight">
            Ready to Study Smarter?
          </h2>
          <p className="mt-4 text-sm md:text-base lg:text-lg xl:text-xl text-slate-500 max-w-lg lg:max-w-xl mx-auto leading-relaxed">
            Upload your first question paper and get a full interactive quiz in under 30 seconds.
          </p>
          <div className="mt-8 lg:mt-10 xl:mt-12">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-7 py-3 lg:px-9 lg:py-4 xl:px-10 xl:py-5 text-sm lg:text-base xl:text-lg font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-500/25"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
