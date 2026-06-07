"use client";

import Link from "next/link";

const links = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/upload", label: "Upload Paper" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/50 py-14 md:py-20 xl:py-24">
      <div className="mx-auto w-full px-8 md:px-10" style={{ maxWidth: "1400px" }}>
        <div className="flex flex-col items-center gap-5 md:gap-6">
          <div className="flex items-center gap-2.5">
            <span className="text-lg md:text-xl xl:text-2xl">🏛️</span>
            <span className="text-base md:text-lg xl:text-xl font-extrabold bg-gradient-to-r from-indigo-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">
              LoksewaPro
            </span>
          </div>
          <p className="text-sm md:text-base xl:text-lg text-slate-500 text-center leading-relaxed" style={{ maxWidth: "480px" }}>
            Built for Nepal&apos;s Loksewa aspirants &middot; Free AI-powered exam preparation
          </p>
          <div className="flex items-center gap-6 md:gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs md:text-sm xl:text-base text-slate-500 hover:text-slate-300 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p className="text-xs md:text-sm xl:text-base text-slate-600">
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