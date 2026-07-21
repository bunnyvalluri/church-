"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Users, Video, Image as ImageIcon, ArrowRight, ShieldAlert, Award, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";

export default function NgoOverviewPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ngoT = t.ngo; // LanguageProvider guards t to en before mount � no double-guard needed

  const stats = [
    { value: "5,000+", label: ngoT.stats.peopleAssisted, desc: ngoT.stats.peopleAssistedDesc },
    { value: "3+", label: ngoT.stats.hospitalsSupported, desc: ngoT.stats.hospitalsSupportedDesc },
    { value: "100+", label: ngoT.stats.volunteersActive, desc: ngoT.stats.volunteersActiveDesc },
    { value: "2+", label: ngoT.stats.ashramamsFunded, desc: ngoT.stats.ashramamsFundedDesc },
  ];

  const features = [
    {
      title: ngoT.hospitalOutreachTitle,
      desc: ngoT.hospitalOutreachDesc,
      icon: Award,
      color: "from-blue-500/10 dark:from-blue-500/20 to-indigo-500/10 dark:to-indigo-500/20 border-blue-500/20 dark:border-blue-500/30 text-blue-700 dark:text-blue-300",
      href: "/ngo/projects",
    },
    {
      title: ngoT.ashramamSupportTitle,
      desc: ngoT.ashramamSupportDesc,
      icon: Star,
      color: "from-purple-500/10 dark:from-purple-500/20 to-pink-500/10 dark:to-pink-500/20 border-purple-500/20 dark:border-purple-500/30 text-purple-700 dark:text-purple-300",
      href: "/ngo/projects",
    },
    {
      title: ngoT.impactGalleryTitle,
      desc: ngoT.impactGalleryDesc,
      icon: ImageIcon,
      color: "from-emerald-500/10 dark:from-emerald-500/20 to-teal-500/10 dark:to-teal-500/20 border-emerald-500/20 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
      href: "/ngo/gallery",
    },
    {
      title: ngoT.videoLogsTitle,
      desc: ngoT.videoLogsDesc,
      icon: Video,
      color: "from-rose-500/10 dark:from-rose-500/20 to-red-500/10 dark:to-red-500/20 border-rose-500/20 dark:border-rose-500/30 text-rose-700 dark:text-rose-300",
      href: "/ngo/videos",
    },
  ];

  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* 1. Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-300 text-xs font-semibold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 animate-pulse" />
              {ngoT.subtitle}
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-slate-900 via-slate-800 to-purple-600 dark:from-white dark:via-slate-100 dark:to-purple-400 bg-clip-text text-transparent">
              {ngoT.title}
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-xl">
              {ngoT.desc}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/ngo/donations"
                className="px-6 py-3.5 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
              >
                <span>{ngoT.supportBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href="/ngo/volunteers"
                className="px-6 py-3.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
              >
                <span>{ngoT.volunteerBtn}</span>
                <Users className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Visual card banner & info stacked */}
          <div className="space-y-6">
            {/* Banner Image Card */}
            <div className="relative group rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 aspect-[4/3] bg-slate-950 shadow-2xl shadow-purple-500/5">
              <img
                src="/kcm_society_ngo.jpg"
                alt="KCM Society NGO - Bishop Kristhuraju Kurra"
                className="w-full h-full object-contain bg-slate-950 dark:bg-slate-950 transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-950/80 dark:bg-slate-950/80 border border-slate-200/50 dark:border-white/10 backdrop-blur-sm text-[10px] font-semibold text-purple-600 dark:text-purple-300 font-mono">
                Regd No: 206/2024
              </div>
            </div>

            {/* Description Card */}
            <div className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 p-6 backdrop-blur-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-300">
                  <Heart className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{ngoT.bannerTitle}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {ngoT.bannerDesc}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Impact Counters Grid */}
        <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 rounded-3xl p-8 backdrop-blur-sm">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center space-y-2 border-r last:border-0 border-slate-200 dark:border-white/5 md:border-r-0 lg:border-r">
                <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600 dark:from-red-400 dark:to-purple-400">
                  {stat.value}
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{stat.label}</div>
                <div className="text-xs text-slate-500 max-w-[180px] mx-auto">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Core Outreaches Section */}
        <div className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{ngoT.initiativesTitle}</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              {ngoT.initiativesDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`p-8 rounded-3xl bg-gradient-to-br ${feature.color} border flex flex-col justify-between space-y-6 hover:scale-[1.01] transition-all`}
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300/80 leading-relaxed">{feature.desc}</p>
                  </div>

                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:gap-2 transition-all"
                  >
                    <span>{ngoT.exploreMore}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Action Banner */}
        <div className="p-8 sm:p-12 bg-gradient-to-r from-purple-500/5 dark:from-purple-900/20 via-slate-50 dark:via-slate-900 to-red-500/5 dark:to-red-950/10 border border-slate-200 dark:border-white/5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{ngoT.ctaHeading}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {ngoT.ctaText}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/ngo/donations"
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              {ngoT.donateNow}
            </Link>
            <Link
              href="/ngo/volunteers"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 font-bold rounded-xl transition-all"
            >
              {ngoT.becomeVolunteer}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
