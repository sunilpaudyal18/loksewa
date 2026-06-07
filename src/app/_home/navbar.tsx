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
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-12 pt-4">
        <nav className="flex items-center justify-between rounded-xl border border-slate-800/50 bg-slate-900/80 px-5 py-3 lg:px-6 lg:py-4 backdrop-blur-lg shadow-sm shadow-black/20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-xl lg:text-2xl transition-transform duration-200 group-hover:scale-110">🏛️</span>
            <span className="text-base lg:text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">
              LoksewaPro
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-sm lg:text-base font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 ml-2 px-5 py-2 lg:px-6 lg:py-2.5 text-sm lg:text-base font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-500/30"
            >
              Start Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="mt-2 rounded-xl border border-slate-800/50 bg-slate-900/90 backdrop-blur-lg p-3 shadow-sm shadow-black/20"
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/upload"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
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
