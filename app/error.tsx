"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RotateCw, Home, AlertOctagon } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [currentLang, setCurrentLang] = useState("en");

  useEffect(() => {
    // Safe language detection from localStorage
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("language");
        if (saved === "te" || saved === "hi" || saved === "en") {
          setCurrentLang(saved);
        }
      } catch (e) {
        console.error("Error reading language preference:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Log the error to console for debugging
    console.error("NextJS Runtime Boundary Error:", error);
  }, [error]);

  // Localized dictionary for robust errors
  const strings: Record<string, { title: string; desc: string; tryAgain: string; home: string }> = {
    en: {
      title: "Something went wrong!",
      desc: "An unexpected error occurred while loading this page. We are looking into this. Please try again.",
      tryAgain: "Try Again",
      home: "Go back Home",
    },
    te: {
      title: "సమస్య ఏర్పడింది!",
      desc: "ఈ పేజీని లోడ్ చేయడంలో అనూహ్యమైన లోపం సంభవించింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
      tryAgain: "మళ్ళీ ప్రయత్నించండి",
      home: "హోమ్‌కు తిరిగి వెళ్ళు",
    },
    hi: {
      title: "कुछ गलत हो गया!",
      desc: "इस पृष्ठ को लोड करते समय एक अप्रत्याशित त्रुटि हुई। कृपया पुन: प्रयास करें।",
      tryAgain: "फिर से प्रयास करें",
      home: "होम पर वापस जाएं",
    },
  };

  const active = strings[currentLang] || strings.en;

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-[#05050A] px-4">
      {/* Background Decorative Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-red-500/10 dark:bg-red-900/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-purple-500/10 dark:bg-purple-900/15 blur-[120px] pointer-events-none" />

      {/* Error Card */}
      <div className="relative z-10 w-full max-w-xl p-8 sm:p-10 rounded-3xl bg-white/40 dark:bg-black/30 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl text-center flex flex-col items-center">
        {/* Pulsing warning icon container */}
        <div className="relative w-20 h-20 rounded-2xl bg-red-150/10 dark:bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-inner animate-pulse">
          <AlertOctagon className="h-10 w-10 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight font-outfit">
          {active.title}
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-md">
          {active.desc}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[hsl(var(--primary-gradient-start))] to-[hsl(var(--primary-gradient-end))] text-white rounded-full font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto"
          >
            <RotateCw className="w-4 h-4" />
            {active.tryAgain}
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto"
          >
            <Home className="w-4 h-4" />
            {active.home}
          </Link>
        </div>

        {/* Error reference for developers */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-white/5 w-full text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 block mb-2">Development Diagnostic</span>
            <pre className="text-xs text-red-600 dark:text-red-400/90 font-mono bg-red-500/5 p-4 rounded-xl overflow-x-auto max-h-40 border border-red-500/10">
              {error.stack || error.message}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
