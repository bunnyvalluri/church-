"use client";

import dynamic from "next/dynamic";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

const GiveForm = dynamic(() => import("@/components/GiveForm"), {
  ssr: false,
});

export default function GivePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Navbar />
      <GiveForm />
      <Footer />
    </div>
  );
}