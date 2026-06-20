"use client";

import { useEffect } from "react";
import { RotateCw, AlertOctagon } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  // Read direct from localStorage since provider context will be unavailable outside RootLayout
  let currentLang = "en";
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("language");
      if (saved === "te" || saved === "hi") {
        currentLang = saved;
      }
    } catch (_) {}
  }

  useEffect(() => {
    console.error("Global Root Layout Crash:", error);
  }, [error]);

  const strings: Record<string, { title: string; desc: string; tryAgain: string }> = {
    en: {
      title: "System Error",
      desc: "A critical system error occurred. We are looking into this immediately. Please try again.",
      tryAgain: "Recover & Retry",
    },
    te: {
      title: "వ్యవస్థలో లోపం!",
      desc: "ఒక క్లిష్టమైన వ్యవస్థ లోపం సంభవించింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
      tryAgain: "మళ్ళీ ప్రయత్నించండి",
    },
    hi: {
      title: "सिस्टम त्रुटि",
      desc: "एक गंभीर सिस्टम त्रुटि हुई। हम तुरंत इसकी जांच कर रहे हैं। कृपया पुनः प्रयास करें।",
      tryAgain: "पुनः प्रयास करें",
    },
  };

  const active = strings[currentLang] || strings.en;

  return (
    <html lang={currentLang} className="overflow-x-hidden">
      <head>
        <title>{active.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 px-4 text-slate-100 font-sans">
        {/* Background Ambient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-red-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

        {/* Outer container */}
        <div className="relative z-10 w-full max-w-xl p-8 sm:p-10 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl text-center flex flex-col items-center">
          {/* Warning Icon */}
          <div className="relative w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-inner animate-pulse">
            <AlertOctagon className="h-10 w-10 text-red-500" />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
            {active.title}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-400 mb-8 leading-relaxed max-w-md">
            {active.desc}
          </p>

          {/* Action button */}
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full font-bold shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto"
          >
            <RotateCw className="w-4 h-4 animate-spin-slow" />
            {active.tryAgain}
          </button>

          {/* Technical Dump for Devs */}
          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mt-8 pt-6 border-t border-slate-800 w-full text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-2">Development Diagnostic</span>
              <pre className="text-xs text-red-400 font-mono bg-red-500/5 p-4 rounded-xl overflow-x-auto max-h-40 border border-red-500/10">
                {error.stack || error.message}
              </pre>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
