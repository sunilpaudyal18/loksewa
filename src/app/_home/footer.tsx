"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🏛️</span>
            <span className="text-base font-extrabold bg-gradient-to-r from-indigo-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">
              LoksewaPro
            </span>
          </div>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            Built for Nepal&apos;s Loksewa aspirants &middot; Free AI-powered exam preparation
          </p>
          <div className="flex items-center gap-6">
            <Link href="/how-it-works" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              How It Works
            </Link>
            <Link href="/upload" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Upload Paper
            </Link>
            <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Dashboard
            </Link>
          </div>
          <p className="text-xs text-slate-600">
            Made with ❤️ by{" "}
            <a
              href="https://sunil.sajilodigital.com.np/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400/80 hover:text-indigo-400 transition-colors border-b border-indigo-400/20 hover:border-indigo-400/40"
            >
              Sunil Paudyal
            </a>{" "}
            🇳🇵
          </p>
        </div>
      </div>
    </footer>
  );
}
