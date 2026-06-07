"use client";

import Link from "next/link";

const links = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/upload", label: "Upload Paper" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/50 py-14 lg:py-20 xl:py-24">
      <div className="mx-auto w-full max-w-[90rem] px-6 md:px-10 lg:px-16 xl:px-20">
        <div className="flex flex-col items-center gap-5 lg:gap-6">
          <div className="flex items-center gap-2.5">
            <span className="text-lg lg:text-xl xl:text-2xl">🏛️</span>
            <span className="text-base lg:text-lg xl:text-xl font-extrabold bg-gradient-to-r from-indigo-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">
              LoksewaPro
            </span>
          </div>
          <p className="text-sm lg:text-base xl:text-lg text-slate-500 text-center max-w-md lg:max-w-lg">
            Built for Nepal&apos;s Loksewa aspirants &middot; Free AI-powered exam preparation
          </p>
          <div className="flex items-center gap-6 lg:gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs lg:text-sm xl:text-base text-slate-500 hover:text-slate-300 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p className="text-xs lg:text-sm xl:text-base text-slate-600">
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
