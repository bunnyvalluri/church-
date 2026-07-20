"use client";

import { ArrowRight, Users, HeartHandshake, Award, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useState, useEffect } from "react";

export default function Hero() {
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ctaPrimaryText = language === "te" ? "ఆరాధనలో చేరండి" : language === "hi" ? "आराधना में शामिल हों" : "Join Worship";
  const ctaSecondaryText = language === "te" ? "ప్రసంగాలు చూడండి" : language === "hi" ? "उपदेश देखें" : "Watch Sermons";
  const ctaTertiaryText = language === "te" ? "ప్రార్థన అభ్యర్థన" : language === "hi" ? "प्राथना अनुरोध" : "Prayer Request";

  const statsData = [
    {
      icon: Users,
      count: "1000+",
      label: language === "te" ? "సభ్యులు" : language === "hi" ? "सदस्य" : "Members",
      borderGradient: "from-violet-500/30 to-indigo-500/10 dark:from-violet-500/40 dark:to-indigo-500/10",
      glowBg: "group-hover:shadow-violet-500/20",
      numGradient: "from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400",
      iconBg: "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20",
    },
    {
      icon: HeartHandshake,
      count: "150+",
      label: language === "te" ? "స్వచ్ఛంద సేవకులు" : language === "hi" ? "स्वयंसेवक" : "Volunteers",
      borderGradient: "from-emerald-500/30 to-teal-500/10 dark:from-emerald-500/40 dark:to-teal-500/10",
      glowBg: "group-hover:shadow-emerald-500/20",
      numGradient: "from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20",
    },
    {
      icon: Award,
      count: "25+",
      label: language === "te" ? "సంవత్సరాల పరిచర్య" : language === "hi" ? "मंत्रालय के वर्ष" : "Years of Ministry",
      borderGradient: "from-amber-500/30 to-orange-500/10 dark:from-amber-500/40 dark:to-orange-500/10",
      glowBg: "group-hover:shadow-amber-500/20",
      numGradient: "from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20",
    },
    {
      icon: BookOpen,
      count: "100+",
      label: language === "te" ? "సామాజిక కార్యక్రమాలు" : language === "hi" ? "सामुदायिक कार्यक्रम" : "Community Programs",
      borderGradient: "from-rose-500/30 to-red-500/10 dark:from-rose-500/40 dark:to-red-500/10",
      glowBg: "group-hover:shadow-rose-500/20",
      numGradient: "from-rose-600 to-red-600 dark:from-rose-400 dark:to-red-400",
      iconBg: "bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/20",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
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

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-5" />
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center"
        >
          {/* Live pulsing tag badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2.5 px-5 md:px-6 py-2 md:py-2.5 bg-white/40 dark:bg-black/20 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-full text-foreground shadow-sm hover:border-primary/30 transition-all duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span suppressHydrationWarning className="font-extrabold tracking-wider text-[10px] md:text-xs uppercase font-outfit text-gray-500 dark:text-gray-300">
                {mounted ? t.hero.prayerBoxSub : "We are here for you 24/7"}
              </span>
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
            <span suppressHydrationWarning className="block mt-2 bg-gradient-to-r from-primary via-amber-500 to-gradient-end bg-clip-text text-transparent pb-1 bg-[length:200%_auto] animate-shimmer">
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
            className="text-slate-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed font-semibold px-4"
            style={{ fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)" }}
          >
            {mounted ? t.hero.subtitle : "A place of Love, Faith, and Miracles"}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24 max-w-2xl mx-auto px-4"
          >
            <Link
              href="#services"
              className="w-full sm:w-auto group relative px-8 py-4 bg-gradient-to-r from-primary to-gradient-end text-white rounded-2xl font-bold overflow-hidden shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 text-center flex items-center justify-center gap-2"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-out skew-x-12" />
              <span className="relative flex items-center justify-center gap-2">
                {ctaPrimaryText}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="#sermons"
              className="w-full sm:w-auto px-8 py-4 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-gray-200/80 dark:border-white/10 text-slate-800 dark:text-gray-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 rounded-2xl font-bold hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 text-center"
            >
              {ctaSecondaryText}
            </Link>
            <Link
              href="/prayer"
              className="w-full sm:w-auto px-8 py-4 bg-rose-500/8 hover:bg-rose-500/12 border border-rose-500/20 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-350 rounded-2xl font-bold hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 text-center"
            >
              {ctaTertiaryText}
            </Link>
          </motion.div>

          {/* Stats - Staggered Animation */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto px-4"
          >
            {statsData.map((stat, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.015 }}
                className="relative group rounded-2xl p-[1px] bg-gradient-to-b from-white/60 to-white/15 dark:from-white/15 dark:to-transparent"
              >
                {/* Glow layer on hover */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10 shadow-lg ${stat.glowBg}`} />
                
                {/* Border glowing gradient on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />

                <div className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl rounded-2xl p-5 md:p-8 h-full border border-white/40 dark:border-white/5 flex flex-col items-center justify-center text-center transition-all duration-500">
                  <div className={`w-12 h-12 md:w-14 md:h-14 ${stat.iconBg} rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                  </div>
                  <div suppressHydrationWarning className={`text-2xl md:text-4xl font-black mb-1.5 font-heading bg-gradient-to-r ${stat.numGradient} bg-clip-text text-transparent`}>
                    {stat.count}
                  </div>
                  <div className="text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[9px] md:text-xs">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex items-start justify-center p-1 backdrop-blur-sm">
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 bg-foreground/50 rounded-full" 
          />
        </div>
      </motion.div>
    </section>
  );
}
