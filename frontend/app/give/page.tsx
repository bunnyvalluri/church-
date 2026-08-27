"use client";

import dynamic from "next/dynamic";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

const GiveForm = dynamic(() => import("@/components/GiveForm"), {
  ssr: false,
});

export default function GivePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-12">
        <GiveForm />
      </main>
      <Footer />
    </div>
  );
}