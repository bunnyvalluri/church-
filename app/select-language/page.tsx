"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Globe, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

export default function SelectLanguagePage() {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const languageOptions = [
    {
      code: "en",
      name: "English",
      nativeName: "English",
      desc: "Navigate the portal and sermons in English.",
      motif: "Faith, Love, Miracles",
      gradient: "from-blue-500 to-indigo-500",
      glowColor: "rgba(59, 130, 246, 0.15)",
    },
    {
      code: "te",
      name: "Telugu",
      nativeName: "తెలుగు",
      desc: "ప్రసంగాలు మరియు పోర్టల్‌ను తెలుగులో వీక్షించండి.",
      motif: "ప్రేమ, విశ్వాసం, అద్భుతాలు",
      gradient: "from-purple-500 to-pink-500",
      glowColor: "rgba(168, 85, 247, 0.15)",
    },
    {
      code: "hi",
      name: "Hindi",
      nativeName: "हिंदी",
      desc: "प्रवचन और पोर्टल को हिंदी भाषा में देखें।",
      motif: "प्रेम, विश्वास, चमत्कार",
      gradient: "from-amber-500 to-rose-500",
      glowColor: "rgba(245, 158, 11, 0.15)",
    },
  ] as const;

  const handleLanguageSelect = (code: "en" | "te" | "hi") => {
    setLanguage(code);
    router.push("/");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center" />
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden flex flex-col justify-between py-12 px-4">
      {/* Background ambient glowing spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full filter blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full filter blur-[120px] animate-pulse" />
      <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-pink-900/10 rounded-full filter blur-[100px]" />

      {/* Header Info */}
      <header className="relative z-10 text-center max-w-2xl mx-auto pt-6">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 px-4.5 py-2 bg-white/5 border border-white/10 rounded-full text-purple-300 text-xs tracking-widest uppercase hover:bg-white/10 transition-all">
          <Globe className="w-3.5 h-3.5 animate-spin" />
          <span>Kingdom of Christ</span>
        </Link>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4 font-display">
          Choose Your Language
        </h1>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
          Select your regional language to completely localize your dashboard portal, upcoming events calendar, online offerings, and sermon archives.
        </p>
      </header>

      {/* 3 Separate Giant Buttons */}
      <main className="relative z-10 max-w-4xl mx-auto w-full grid md:grid-cols-3 gap-6 my-12">
        {languageOptions.map((opt) => {
          const isActive = language === opt.code;
          return (
            <button
              key={opt.code}
              onClick={() => handleLanguageSelect(opt.code)}
              style={{ boxShadow: isActive ? `0 20px 40px ${opt.glowColor}` : "none" }}
              className={`group relative text-left bg-white/[0.03] dark:bg-black/40 backdrop-blur-2xl rounded-3xl border p-8 flex flex-col justify-between h-[320px] transition-all duration-500 hover:scale-[1.03] hover:bg-white/[0.05] ${
                isActive
                  ? "border-purple-500/50 shadow-2xl"
                  : "border-white/5 hover:border-white/20"
              }`}
            >
              {/* Highlight Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${opt.gradient} opacity-0 group-hover:opacity-[0.02] rounded-3xl transition-opacity duration-500`} />
              
              {/* Top Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 bg-gradient-to-br ${opt.gradient} rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg`}>
                    {opt.code.toUpperCase()}
                  </div>
                  {isActive && (
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full animate-pulse">
                      Active Choice
                    </span>
                  )}
                </div>

                <div className="space-y-1 pt-2">
                  <h2 className="text-3xl font-black text-white group-hover:text-purple-300 transition-colors">
                    {opt.nativeName}
                  </h2>
                  <p className="text-xs uppercase font-extrabold tracking-widest text-gray-500">
                    {opt.name}
                  </p>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed pt-1">
                  {opt.desc}
                </p>
              </div>

              {/* Bottom Motif CTA */}
              <div className="pt-6 border-t border-white/5 flex items-center justify-between w-full">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Heart className="w-3 h-3 text-pink-500 animate-pulse" />
                  {opt.motif}
                </span>
                <div className={`w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 text-white flex items-center justify-center transition-all group-hover:translate-x-1 duration-300`}>
                  <Globe className="w-4 h-4 text-purple-400" />
                </div>
              </div>
            </button>
          );
        })}
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 text-center max-w-md mx-auto pt-6 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Kingdom of Christ Ministries. All rights reserved.</p>
        <p className="mt-1">
          Return to the <Link href="/" className="text-purple-400 hover:underline">Homepage</Link> or view your secure <Link href="/dashboard" className="text-purple-400 hover:underline">Dashboard Portal</Link>.
        </p>
      </footer>
    </div>
  );
}
