
import Hero from "@/components/sections/Hero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Events from "@/components/sections/Events";
import Sermons from "@/components/sections/Sermons";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";

import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <ScrollReveal><About /></ScrollReveal>
      <ScrollReveal delay={0.1}><Services /></ScrollReveal>
      <ScrollReveal delay={0.1}><Events /></ScrollReveal>
      <ScrollReveal delay={0.1}><Sermons /></ScrollReveal>
      <ScrollReveal delay={0.1}><Contact /></ScrollReveal>
      <Footer />
    </main>
  );
}
