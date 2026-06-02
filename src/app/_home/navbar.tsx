"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

const links = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center justify-between rounded-2xl border border-slate-800/50 bg-slate-900/75 px-5 py-3 backdrop-blur-xl shadow-lg shadow-black/10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-xl transition-transform duration-300 group-hover:scale-110">🏛️</span>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">
              LoksewaPro
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/60 transition-all duration-200"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 ml-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl hover:from-indigo-500 hover:to-indigo-400 transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              Start Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-all duration-200"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="mt-2 rounded-2xl border border-slate-800/50 bg-slate-900/90 backdrop-blur-xl p-3 shadow-xl shadow-black/20"
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/60 transition-all duration-200"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/upload"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl transition-all duration-200"
              >
                Start Now <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
