"use client";

import { motion } from "framer-motion";
import Navbar from "./navbar";
import Hero from "./hero";
import HowItWorks from "./how-it-works";
import Features from "./features";
import CTA from "./cta";
import Footer from "./footer";

export default function LandingPage() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-500/8 blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-amber-500/5 blur-[140px]"
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px]"
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative">
        <Navbar />
        <main>
          <Hero />
          <HowItWorks />
          <Features />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
}
