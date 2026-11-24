"use client";

import { ArrowRight, Users, HeartHandshake, Award, BookOpen, Sparkles, LucideIcon, Heart, Images, Church, Globe, Phone } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useState, useEffect, useRef, memo } from "react";
import { useHeroContent, useStatistics } from "@/hooks/useCmsData";
import { useCountUp, useInView } from "@/hooks/useCountUp";
import type { SiteStatistic } from "@/types/cms";

// ── Icon registry helper ──────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  HeartHandshake,
  Award,
  BookOpen,
  Sparkles,
};

function getHeroIcon(name: string): LucideIcon {
  if (!name) return Users;
  return ICON_MAP[name] || Users;
}

// ── Color scheme configuration ─────────────────────────────────────────────────
const COLOR_SCHEMES: Record<string, { border: string; glow: string; iconBg: string; iconColor: string }> = {
  violet: {
    border: "border-purple-200/80 dark:border-purple-500/20",
    glow: "group-hover:shadow-purple-500/15",
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  emerald: {
    border: "border-emerald-200/80 dark:border-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/15",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    border: "border-amber-200/80 dark:border-amber-500/20",
    glow: "group-hover:shadow-amber-500/15",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    border: "border-rose-200/80 dark:border-rose-500/20",
    glow: "group-hover:shadow-rose-500/15",
    iconBg: "bg-rose-500/10 dark:bg-rose-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  blue: {
    border: "border-blue-200/80 dark:border-blue-500/20",
    glow: "group-hover:shadow-blue-500/15",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  teal: {
    border: "border-teal-200/80 dark:border-teal-500/20",
    glow: "group-hover:shadow-teal-500/15",
    iconBg: "bg-teal-500/10 dark:bg-teal-500/20",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  orange: {
    border: "border-orange-200/80 dark:border-orange-500/20",
    glow: "group-hover:shadow-orange-500/15",
    iconBg: "bg-orange-500/10 dark:bg-orange-500/20",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  purple: {
    border: "border-purple-200/80 dark:border-purple-500/20",
    glow: "group-hover:shadow-purple-500/15",
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
};

// ── Stat Card Component ───────────────────────────────────────────────────────
const StatCard = memo(function StatCard({ stat, isInView, index }: { stat: SiteStatistic; isInView: boolean; index: number }) {
  const { language } = useLanguage();
  const colors = COLOR_SCHEMES[stat.colorScheme] ?? COLOR_SCHEMES.violet;
  const Icon = getHeroIcon(stat.icon);

  const label =
    language === "te" && stat.labelTe
      ? stat.labelTe
      : language === "hi" && stat.labelHi
      ? stat.labelHi
      : stat.label;

  const animatedValue = useCountUp(stat.value, isInView, {
    duration: 1800,
    delay: index * 150,
    easing: "easeOut",
  });

  const handleStatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href="#about"
      onClick={handleStatClick}
      aria-label={`View statistics for ${label}: ${stat.value}`}
      className="block text-left no-underline cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 rounded-2xl h-full"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 25 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 60, damping: 14 },
          },
        }}
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`relative group rounded-2xl h-full min-h-[140px] sm:min-h-[156px] bg-white/80 dark:bg-[#0c1021]/80 backdrop-blur-xl border ${colors.border} shadow-sm hover:shadow-lg ${colors.glow} transition-all duration-300 p-4 sm:p-5 md:p-6 flex flex-col items-center justify-center text-center`}
      >
        {/* Icon Capsule */}
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 ${colors.iconBg} ${colors.iconColor} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 ring-1 ring-inset ring-black/5 dark:ring-white/10`}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
        </div>

        {/* High-Contrast Crisp Metric Number (No Muddy Clip or Red) */}
        <div
          className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 font-outfit text-slate-900 dark:text-white tracking-tight"
          suppressHydrationWarning
        >
          {animatedValue}
        </div>

        {/* Readable Label — Multi-line wrapping with zero truncation */}
        <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[9.5px] sm:text-[11px] font-outfit text-center leading-tight px-1 min-h-[2.4em] flex items-center justify-center">
          {label}
        </div>
      </motion.div>
    </a>
  );
});

// ── Skeleton Loaders ───────────────────────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/60 to-white/15 dark:from-white/15 dark:to-transparent animate-pulse min-h-[140px] sm:min-h-[156px]">
      <div className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 md:p-6 h-full border border-white/40 dark:border-white/5 flex flex-col items-center justify-center text-center">
        <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-3 sm:mb-4" />
        <div className="h-7 sm:h-8 md:h-9 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg mb-1" />
        <div className="h-3 w-20 bg-slate-100 dark:bg-slate-900 rounded" />
      </div>
    </div>
  );
}

// ── Main Hero Component ───────────────────────────────────────────────────────
export default function Hero({ initialHeroData, initialStatsData }: { initialHeroData?: any, initialStatsData?: any }) {
  const { t, language } = useLanguage();
  const { ref: statsRef, inView: statsInView } = useInView({ threshold: 0.2 });

  // CMS data
  const { data: hero, loading: heroLoading } = useHeroContent(initialHeroData);
  const { statistics, loading: statsLoading } = useStatistics(initialStatsData);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 60, damping: 14 },
    },
  };

  // Resolve localized text instantly without client hydration mismatch
  const badgeText =
    language === "te" && (hero as any)?.badgeTextTe
      ? (hero as any).badgeTextTe
      : language === "hi" && (hero as any)?.badgeTextHi
      ? (hero as any).badgeTextHi
      : language !== "en"
      ? t.hero.prayerBoxSub
      : hero?.badgeText ?? "Kingdom of Christ Ministries (KCM) • Official Website";

  const rawHeadline =
    language === "te" && (hero as any)?.headlineTe
      ? (hero as any).headlineTe
      : language === "hi" && (hero as any)?.headlineHi
      ? (hero as any).headlineHi
      : language !== "en"
      ? t.hero.welcome
      : hero?.headline ?? t.hero.welcome ?? "Welcome to";

  const rawChurchName =
    language === "te" && (hero as any)?.subheadlineTe
      ? (hero as any).subheadlineTe
      : language === "hi" && (hero as any)?.subheadlineHi
      ? (hero as any).subheadlineHi
      : language !== "en"
      ? t.hero.churchName
      : hero?.subheadline ?? t.hero.churchName ?? "Kingdom of Christ";

  const ministriesText = t.hero.ministries ?? "Ministries";

  // 🛡️ Senior UI/UX Architectural Normalization:
  // Prevent duplicate "Ministries / MINISTRIES" or inverted church name hierarchy
  let headline = rawHeadline;
  let churchName = rawChurchName;
  let showMinistriesBanner = true;

  if (
    churchName.toLowerCase().trim() === "ministries" ||
    churchName.toLowerCase().trim() === ministriesText.toLowerCase().trim()
  ) {
    if (headline.toLowerCase().includes("kingdom of christ")) {
      headline =
        headline.replace(/kingdom of christ/i, "").trim() ||
        (language === "te" ? "స్వాగతం" : language === "hi" ? "स्वागत है" : "Welcome to");
    }
    churchName =
      language === "te"
        ? "కింగ్డమ్ ఆఫ్ క్రైస్ట్"
        : language === "hi"
        ? "किंगडम ऑफ क्राइस्ट"
        : "Kingdom of Christ";
  } else if (headline.toLowerCase().includes(churchName.toLowerCase())) {
    headline =
      headline.replace(new RegExp(churchName, "gi"), "").trim() ||
      (language === "te" ? "స్వాగతం" : language === "hi" ? "स्वागत है" : "Welcome to");
  }

  if (churchName.toLowerCase().endsWith(ministriesText.toLowerCase())) {
    showMinistriesBanner = false;
  }

  const subtitle =
    language === "te" && (hero as any)?.subtitleTe
      ? (hero as any).subtitleTe
      : language === "hi" && (hero as any)?.subtitleHi
      ? (hero as any).subtitleHi
      : language !== "en"
      ? t.hero.subtitle
      : hero?.subtitle ?? t.hero.subtitle ?? "A place of Love, Faith, and Miracles";

  // CTA text — use CMS localized values or dictionary defaults
  const ctaPrimaryText =
    language === "te"
      ? (hero as any)?.ctaPrimaryTextTe || t.hero.ctaPrimary || "మా చిరునామా"
      : language === "hi"
      ? (hero as any)?.ctaPrimaryTextHi || t.hero.ctaPrimary || "आराधना में शामिल हों"
      : hero?.ctaPrimaryText ?? t.hero.ctaPrimary ?? "Plan A Visit";

  const ctaSecondaryText =
    language === "te"
      ? (hero as any)?.ctaSecondaryTextTe || t.hero.ctaSecondary || "గ్యాలరీ చూడండి"
      : language === "hi"
      ? (hero as any)?.ctaSecondaryTextHi || t.hero.ctaSecondary || "गैलरी देखें"
      : hero?.ctaSecondaryText && hero.ctaSecondaryText !== "Watch Sermons"
      ? hero.ctaSecondaryText
      : t.hero.ctaSecondary ?? "Watch Gallery";

  const ctaSecondaryHref =
    hero?.ctaSecondaryHref && hero.ctaSecondaryHref !== "#sermons"
      ? hero.ctaSecondaryHref
      : "/gallery";

  const ctaTertiaryText =
    language === "te"
      ? "ప్రార్థన అభ్యర్థన"
      : language === "hi"
      ? "प्राथना अनुरोध"
      : hero?.ctaTertiaryText ?? "Prayer Request";

  const ctaTertiaryShort =
    language === "te" ? "ప్రార్థన" : language === "hi" ? "प्रार्थना" : "Prayer";

  const ctaNgoText =
    language === "te"
      ? (hero as any)?.ctaNgoTextTe || (t.hero as any)?.ctaNgo || "NGO పోర్టల్ సందర్శించండి"
      : language === "hi"
      ? (hero as any)?.ctaNgoTextHi || (t.hero as any)?.ctaNgo || "NGO पोर्टल पर जाएं"
      : (hero as any)?.ctaNgoText ?? (t.hero as any)?.ctaNgo ?? "Visit NGO Portal";

  const ctaNgoShort =
    language === "te" ? "KCM NGO" : language === "hi" ? "KCM NGO" : "KCM NGO";

  const ctaNgoHref = (hero as any)?.ctaNgoHref ?? "/ngo";

  const ctaContactText =
    language === "te"
      ? "సంప్రదించండి"
      : language === "hi"
      ? "संपर्क करें"
      : "Contact Us";

  const ctaContactShort =
    language === "te" ? "సంప్రదించండి" : language === "hi" ? "संपर्क" : "Contact";

  const ctaNgoDisplay = language === "en" ? "NGO Portal" : ctaNgoText;
  const ctaPrayerDisplay = language === "en" ? "Prayer Request" : ctaTertiaryText;
  const ctaContactDisplay = language === "en" ? "Contact Us" : ctaContactText;

  return (
    <section
      id="home"
      className="relative min-h-[calc(100dvh-var(--kcm-header-height,76px))] flex flex-col justify-center overflow-hidden bg-transparent scroll-mt-[var(--kcm-header-height,80px)]"
    >
      {/* Animated Background Orbs (GPU accelerated) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-5" />
        <div className="hero-orb-1 transform-gpu" />
        <div className="hero-orb-2 transform-gpu" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10 lg:pt-12 pb-10 sm:pb-12 md:pb-14 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center"
        >
          {/* Live pulsing tag badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-3.5 sm:mb-4 md:mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-slate-100/90 dark:bg-white/[0.06] backdrop-blur-md border border-slate-200/90 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300 shadow-xs hover:border-purple-400/40 transition-all duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span
                suppressHydrationWarning
                className="font-bold tracking-wider text-[10px] sm:text-xs uppercase font-outfit"
              >
                {badgeText}
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            suppressHydrationWarning
            variants={itemVariants}
            className="font-black text-foreground mb-3 sm:mb-4 leading-[1.1] sm:leading-[1.08] font-outfit tracking-tight"
          >
            <span
              suppressHydrationWarning
              className="block text-slate-600 dark:text-slate-300 font-semibold text-base sm:text-xl md:text-2xl tracking-normal mb-1 sm:mb-2"
            >
              {headline}
            </span>
            <span
              suppressHydrationWarning
              className="block font-black tracking-tight"
              style={{
                fontSize: "clamp(2.1rem, 7.5vw, 4.75rem)",
                lineHeight: 1.05,
              }}
            >
              <span 
                className="bg-gradient-to-r from-slate-950 via-violet-950 to-indigo-900 dark:from-white dark:via-purple-100 dark:to-indigo-200 bg-clip-text text-transparent"
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {churchName}
              </span>
            </span>
            {showMinistriesBanner && (
              <span
                suppressHydrationWarning
                className="block font-extrabold mt-2 sm:mt-2.5 leading-none uppercase tracking-[0.25em] sm:tracking-[0.3em] text-violet-600 dark:text-violet-400 text-xs sm:text-sm md:text-base font-outfit"
              >
                {ministriesText}
              </span>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            suppressHydrationWarning
            variants={itemVariants}
            className="text-slate-600 dark:text-slate-300 mt-2.5 sm:mt-3 mb-5 sm:mb-7 md:mb-8 max-w-2xl mx-auto leading-relaxed font-medium text-sm sm:text-base md:text-lg px-4"
          >
            {subtitle}
          </motion.p>

          {/* CTA Actions: Clean High-Conversion Visual Hierarchy */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center gap-3 sm:gap-3.5 mb-6 sm:mb-8 md:mb-10 max-w-xl mx-auto px-4 w-full"
          >
            {/* Primary & Secondary Action Pair */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
              {/* Primary: Plan A Visit / Join Worship */}
              <Link
                href={hero?.ctaPrimaryHref ?? "#services"}
                className="w-full sm:flex-1 min-h-[48px] px-6 sm:px-8 py-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl text-sm sm:text-base font-extrabold shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 border border-violet-400/30 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              >
                <Church className="h-4 w-4" />
                <span>{ctaPrimaryText}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Secondary: Watch Gallery */}
              <Link
                href={ctaSecondaryHref}
                className="w-full sm:flex-1 min-h-[48px] px-6 sm:px-8 py-3.5 bg-white dark:bg-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.14] text-slate-800 dark:text-white rounded-2xl text-sm sm:text-base font-bold shadow-sm border border-slate-200/90 dark:border-white/15 hover:border-violet-300 dark:hover:border-violet-400/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              >
                <Images className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span>{ctaSecondaryText}</span>
              </Link>
            </div>

            {/* Balanced Supporting Quick Actions (Symmetrical 3-Column Pill Strip - No Orphans & No Truncation) */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-md mx-auto pt-0.5">
              <Link
                href="/prayer"
                aria-label={`Prayer: ${ctaPrayerDisplay}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 sm:px-2.5 rounded-xl text-[11.5px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-white/[0.05] hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200/80 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-500/40 hover:text-rose-700 dark:hover:text-rose-300 transition-all select-none min-h-[44px] active:scale-95 shadow-xs"
              >
                <Heart className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">{ctaPrayerDisplay}</span>
                <span className="sm:hidden whitespace-nowrap">{ctaTertiaryShort}</span>
              </Link>

              <Link
                href={ctaNgoHref}
                aria-label={`NGO: ${ctaNgoDisplay}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 sm:px-2.5 rounded-xl text-[11.5px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-white/[0.05] hover:bg-violet-50 dark:hover:bg-violet-950/30 border border-slate-200/80 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/40 hover:text-violet-700 dark:hover:text-violet-300 transition-all select-none min-h-[44px] active:scale-95 shadow-xs"
              >
                <Globe className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">{ctaNgoDisplay}</span>
                <span className="sm:hidden whitespace-nowrap">{ctaNgoShort}</span>
              </Link>

              <Link
                href="/contact"
                aria-label={`Contact: ${ctaContactDisplay}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 sm:px-2.5 rounded-xl text-[11.5px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-white/[0.05] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all select-none min-h-[44px] active:scale-95 shadow-xs"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">{ctaContactDisplay}</span>
                <span className="sm:hidden whitespace-nowrap">{ctaContactShort}</span>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div ref={statsRef as any}>
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto px-4"
            >
              {statsLoading
                ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                : (Array.isArray(statistics) ? statistics : []).map((stat, i) => (
                    <StatCard key={stat.id} stat={stat} isInView={statsInView} index={i} />
                  ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

