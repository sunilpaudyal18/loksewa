"use client";

import Navbar from "./navbar";
import Hero from "./hero";
import HowItWorks from "./how-it-works";
import Features from "./features";
import CTA from "./cta";
import Footer from "./footer";

export default function LandingPage() {
  return (
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
  );
}
