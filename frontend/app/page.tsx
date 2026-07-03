"use client";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Events from "@/components/sections/Events";
import Sermons from "@/components/sections/Sermons";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import ScrollReveal from "@/components/ui/ScrollReveal";
import NgoShowcase from "@/components/sections/NgoShowcase";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />

      {/* Section divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.15)] to-transparent" />

      <NgoShowcase />

      {/* Section divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.3)] to-transparent" />

      <About />

      {/* Section divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.2)] to-transparent" />

      <Services />

      {/* Section divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.2)] to-transparent" />

      <Events />

      {/* Section divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.3)] to-transparent" />

      <Sermons />

      {/* Section divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.15)] to-transparent" />

      <ScrollReveal delay={0.1}><Contact /></ScrollReveal>
      <Footer />
    </main>
  );
}
