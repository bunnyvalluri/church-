"use client";

import { memo, useState, useEffect, useMemo } from "react";
import { ArrowRight, Users, HeartHandshake, Award, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";

// ── Variants defined OUTSIDE component — never recreated on re-render ─────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

// ── Static stats data — outside component (no rebuild on render) ──────────────
const STATS = [
  {
    icon: Users,
    count: "1000+",
    label: "Members",
    color: "from-primary to-gradient-end",
    shadow: "shadow-primary/20",
  },
  {
    icon: HeartHandshake,
    count: "150+",
    label: "Volunteers",
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-500/20",
  },
  {
    icon: Award,
    count: "25+",
    label: "Years of Ministry",
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-500/20",
  },
  {
    icon: BookOpen,
    count: "100+",
    label: "Community Programs",
    color: "from-rose-400 to-red-500",
    shadow: "shadow-rose-500/20",
  },
];

// ── Stat card (memoized) — only re-renders if its own props change ────────────
interface StatCardProps {
  stat: (typeof STATS)[0];
}
const StatCard = memo(function StatCard({ stat }: StatCardProps) {
  const Icon = stat.icon;
  return (
    <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-white/40 to-white/10 dark:from-white/10 dark:to-transparent">
      {/* CSS hover card — no JS whileHover, no layout recalc ── */}
      <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-3xl p-5 md:p-8 h-full border border-white/20 dark:border-white/5 shadow-2xl shadow-black/5 flex flex-col items-center justify-center text-center services-card">
        <div
          className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg ${stat.shadow} services-icon`}
        >
          <Icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
        </div>
        <div className="text-2xl md:text-4xl font-black text-foreground mb-1 font-outfit">
          {stat.count}
        </div>
        <div className="text-muted-foreground font-semibold uppercase tracking-widest text-[9px] md:text-xs">
          {stat.label}
        </div>
      </div>
    </div>
  );
});

// ── Main Hero section (memoized) ───────────────────────────────────────────────
function Hero() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background — CSS keyframes in globals.css (no inline style tag) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-5" />
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 mt-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full text-foreground shadow-2xl shadow-amber-500/10 hover:border-amber-500/30 transition-colors duration-300">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span suppressHydrationWarning className="font-medium tracking-wide text-sm md:text-base">
                {mounted ? t.hero.prayerBoxSub : "We are here for you 24/7"}
              </span>
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            suppressHydrationWarning
            variants={itemVariants}
            className="font-black text-foreground mb-4 leading-[1.1] drop-shadow-sm font-outfit tracking-tighter"
            style={{ fontSize: "clamp(2.25rem, 7vw, 5.5rem)" }}
          >
            <span suppressHydrationWarning>
              {mounted ? t.hero.welcome : "Welcome to"}{" "}
            </span>
            <span
              suppressHydrationWarning
              className="block mt-2 bg-gradient-to-r from-primary via-amber-500 to-gradient-end bg-clip-text text-transparent pb-1 bg-[length:200%_auto] animate-shimmer"
            >
              {mounted ? t.hero.churchName : "Kingdom of Christ"}
            </span>
            <span
              suppressHydrationWarning
              className="block font-black mt-1 pb-1 leading-normal uppercase tracking-[0.2em] bg-gradient-to-r from-primary via-gradient-start to-gradient-end bg-clip-text text-transparent"
              style={{ fontSize: "clamp(1.1rem, 3.5vw, 2.25rem)" }}
            >
              {mounted ? t.hero.ministries : "Ministries"}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            suppressHydrationWarning
            variants={itemVariants}
            className="text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed font-medium px-4"
            style={{ fontSize: "clamp(0.95rem, 2.5vw, 1.25rem)" }}
          >
            {mounted ? t.hero.subtitle : "A place of Love, Faith, and Miracles"}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 max-w-2xl mx-auto px-4"
          >
            <Link
              href="#services"
              className="w-full sm:w-auto group relative px-8 py-4 bg-gradient-to-r from-primary to-gradient-end text-white rounded-full font-bold overflow-hidden shadow-2xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95 text-center"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-out skew-x-12" />
              <span className="relative flex items-center justify-center gap-2">
                Join Worship
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="#sermons"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 text-foreground rounded-full font-bold hover:bg-gray-100/50 dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95 text-center"
            >
              Watch Sermons
            </Link>
            <Link
              href="/prayer"
              className="w-full sm:w-auto px-8 py-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-full font-bold transition-all hover:scale-105 active:scale-95 text-center"
            >
              Prayer Request
            </Link>
          </motion.div>

          {/* Stats Grid — CSS hover (not Framer whileHover) */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto px-4"
          >
            {STATS.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <StatCard stat={stat} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator — CSS animation, no Framer spring */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex items-start justify-center p-1 backdrop-blur-sm">
          <div className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-scroll-dot" />
        </div>
      </div>
    </section>
  );
}

export default memo(Hero);
