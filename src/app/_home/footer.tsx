"use client";

import Link from "next/link";
import { useInstallPWA } from "@/hooks/useInstallPWA";

const links = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/upload", label: "Upload Paper" },
  { href: "/dashboard", label: "Dashboard" },
];

function InstallButton() {
  const { canInstall, install } = useInstallPWA();
  if (!canInstall) return null;
  return (
    <button onClick={install} className="flex items-center gap-1.5 text-xs md:text-sm text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer bg-none border-none">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Install App
    </button>
  );
}

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
          <InstallButton />
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
