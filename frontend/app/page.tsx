"use client";

import dynamic from 'next/dynamic';
import Hero from "@/components/sections/Hero";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

// Lazy load below-the-fold components
const About = dynamic(() => import('@/components/sections/About'));
const Services = dynamic(() => import('@/components/sections/Services'));
const Events = dynamic(() => import('@/components/sections/Events'));
const Sermons = dynamic(() => import('@/components/sections/Sermons'));
const Contact = dynamic(() => import('@/components/sections/Contact'));
const ScrollReveal = dynamic(() => import('@/components/ui/ScrollReveal'));
const NgoShowcase = dynamic(() => import('@/components/sections/NgoShowcase'));

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen overflow-x-hidden">
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
    </>
  );
}
