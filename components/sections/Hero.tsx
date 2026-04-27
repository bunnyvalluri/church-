"use client";

import { ArrowRight, Calendar, Users, Heart, Sparkles } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/components/providers/LanguageProvider";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] dark:opacity-10" />
        {/* Colorful Floating orbs (Local to Hero for extra vibrancy) */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full blur-[100px] animate-float opacity-40 mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-[100px] animate-float-delayed opacity-40 mix-blend-multiply dark:mix-blend-screen" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-full text-foreground mb-8 animate-bounce-in shadow-xl shadow-purple-500/10">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-semibold tracking-wide">{t.hero.prayerBoxSub}</span>
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground mb-6 animate-fade-in-up tracking-tight drop-shadow-sm">
            {t.hero.welcome}{" "}
            <span className="block mt-4 bg-gradient-to-r from-primary via-pink-500 to-indigo-500 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%] pb-2">
              Kingdom of Christ Ministries
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in-up animate-delay-200 leading-relaxed font-medium">
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16 animate-scale-in animate-delay-300">
            <Link
              href="#events"
              className="group px-8 py-4 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.05] flex items-center justify-center gap-3 hover-lift border border-white/10"
            >
              {t.nav.events}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
            <Link
              href="#contact"
              className="px-8 py-4 bg-white/50 dark:bg-black/40 backdrop-blur-xl border-2 border-white/50 dark:border-white/10 text-foreground rounded-2xl font-bold hover:bg-white/70 dark:hover:bg-white/10 transition-all duration-300 hover:scale-[1.05] hover-lift"
            >
              {t.hero.ctaPrimary}
            </Link>
          </div>

          {/* Stats - Staggered Animation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto stagger-children perspective">
            <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-3xl p-8 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 card-flip shadow-2xl shadow-primary/5">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-300 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
                <Users className="h-8 w-8 text-white animate-bounce-in" />
              </div>
              <div className="text-4xl font-black text-foreground mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">1000+</div>
              <div className="text-muted-foreground font-semibold uppercase tracking-wider text-sm">Active Members</div>
            </div>
            
            <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-3xl p-8 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 card-flip shadow-2xl shadow-primary/5">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/30">
                <Calendar className="h-8 w-8 text-white animate-bounce-in animate-delay-100" />
              </div>
              <div className="text-4xl font-black text-foreground mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">50+</div>
              <div className="text-muted-foreground font-semibold uppercase tracking-wider text-sm">Events Yearly</div>
            </div>

            <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-3xl p-8 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 card-flip shadow-2xl shadow-primary/5">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/30">
                <Heart className="h-8 w-8 text-white animate-bounce-in animate-delay-200" />
              </div>
              <div className="text-4xl font-black text-foreground mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">24/7</div>
              <div className="text-muted-foreground font-semibold uppercase tracking-wider text-sm">Prayer Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/40 rounded-full flex items-start justify-center p-2 backdrop-blur-md bg-white/20 dark:bg-black/20">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
