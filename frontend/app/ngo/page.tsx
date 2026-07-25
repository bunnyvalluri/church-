"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Users,
  Video,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Award,
  Star,
  CheckCircle2,
  Sparkles,
  HandHeart,
  Building2,
  FileText,
  ChevronRight,
  ExternalLink,
  Gift
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function NgoOverviewPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [selectedImpactIndex, setSelectedImpactIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ngoT = t?.ngo || {};

  const stats = [
    {
      value: "5,000+",
      label: ngoT.stats?.peopleAssisted || "People Assisted",
      desc: ngoT.stats?.peopleAssistedDesc || "Patient food, medicines & care support",
      icon: HandHeart,
      gradient: "from-rose-500 to-pink-500",
    },
    {
      value: "3+",
      label: ngoT.stats?.hospitalsSupported || "Hospitals Supported",
      desc: ngoT.stats?.hospitalsSupportedDesc || "NIMS, Gandhi, & Govt Hospitals",
      icon: Building2,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      value: "100+",
      label: ngoT.stats?.volunteersActive || "Volunteers Active",
      desc: ngoT.stats?.volunteersActiveDesc || "Dedicated social service team",
      icon: Users,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      value: "2+",
      label: ngoT.stats?.ashramamsFunded || "Ashramams Supported",
      desc: ngoT.stats?.ashramamsFundedDesc || "Rehabilitation & shelter care",
      icon: ShieldCheck,
      gradient: "from-purple-500 to-indigo-500",
    },
  ];

  const features = [
    {
      title: ngoT.hospitalOutreachTitle || "Hospital Outreaches",
      desc: ngoT.hospitalOutreachDesc || "Providing medicine, food supplies, and spiritual comfort to patients in Gandhi, NIMS, and Government General Hospitals.",
      icon: Award,
      badge: "Regular Outreach",
      color: "from-blue-500/10 via-indigo-500/5 to-purple-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border-blue-500/20 text-blue-700 dark:text-blue-300",
      accent: "bg-blue-500",
      href: "/ngo/projects",
    },
    {
      title: ngoT.ashramamSupportTitle || "Ashramam Support",
      desc: ngoT.ashramamSupportDesc || "Aiding Bethany Samrakshana Ashramam and disabled care shelters with monthly provisions, bedding, and medical assistance.",
      icon: Star,
      badge: "Shelter Care",
      color: "from-purple-500/10 via-pink-500/5 to-rose-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border-purple-500/20 text-purple-700 dark:text-purple-300",
      accent: "bg-purple-500",
      href: "/ngo/projects",
    },
    {
      title: ngoT.impactGalleryTitle || "Impact Gallery",
      desc: ngoT.impactGalleryDesc || "Browse high-quality photo logs capturing real-time volunteer services, food distribution drives, and relief camps.",
      icon: ImageIcon,
      badge: "Photo Logs",
      color: "from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 border-emerald-500/20 text-emerald-700 dark:text-emerald-300",
      accent: "bg-emerald-500",
      href: "/ngo/gallery",
    },
    {
      title: ngoT.videoLogsTitle || "Service Video Logs",
      desc: ngoT.videoLogsDesc || "Watch direct video evidence of social work, including specialized hospital care distribution and community relief operations.",
      icon: Video,
      badge: "Video Evidence",
      color: "from-rose-500/10 via-red-500/5 to-orange-500/10 dark:from-rose-500/20 dark:to-red-500/20 border-rose-500/20 text-rose-700 dark:text-rose-300",
      accent: "bg-rose-500",
      href: "/ngo/videos",
    },
  ];

  const impactTiers = [
    {
      amount: "₹500",
      rawAmount: 500,
      title: "Medical & Meal Pack",
      desc: "Provides 1 essential medicine kit & hot nutritious meals for hospital patients.",
      impactBadge: "1 Patient Helped",
      icon: HandHeart,
    },
    {
      amount: "₹1,500",
      rawAmount: 1500,
      title: "Ashramam Care Kit",
      desc: "Funds monthly grocery provisions, bedding & hygiene kits for elderly residents.",
      impactBadge: "Elderly Care Support",
      icon: ShieldCheck,
    },
    {
      amount: "₹3,000",
      rawAmount: 3000,
      title: "Outreach & Wheelchair Aid",
      desc: "Supports mobility equipment & specialized medical care in relief camps.",
      impactBadge: "Mobility & Aid",
      icon: Award,
    },
    {
      amount: "₹5,000+",
      rawAmount: 5000,
      title: "Sponsor a Shelter Unit",
      desc: "Provides total monthly care, food & medical treatment for vulnerable disabled individuals.",
      impactBadge: "Full Shelter Sponsorship",
      icon: Star,
    },
  ];

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* 1. Hero Section */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 via-pink-500/10 to-purple-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Heart className="w-4 h-4 text-red-500 animate-pulse fill-red-500/20" />
                <span>{ngoT.subtitle || "NON-GOVERNMENTAL ORGANIZATION (NGO)"}</span>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 80G Tax Exempted
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] bg-gradient-to-r from-slate-900 via-slate-800 to-purple-700 dark:from-white dark:via-slate-100 dark:to-purple-300 bg-clip-text text-transparent">
              {ngoT.title || "Serving Humanity, Spreading Hope"}
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              {ngoT.desc || "Kingdom of Christ Ministries extends its mission beyond chapel walls through community outreaches, medical aids, and rehabilitation support. We believe in active faith through selfless social service."}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/ngo/donations"
                className="group relative px-7 py-3.5 bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2.5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Gift className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{ngoT.supportBtn || "Support Our Cause"}</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/ngo/volunteers"
                className="px-7 py-3.5 bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 font-bold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2.5"
              >
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>{ngoT.volunteerBtn || "Join as Volunteer"}</span>
              </Link>
            </div>

            {/* Quick Trust Highlights Pills */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Regd No: 206/2024</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>12A & 80G Approval</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 col-span-2 sm:col-span-1">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>100% Direct Field Aid</span>
              </div>
            </div>
          </div>

          {/* Right Visual Frame */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative group rounded-3xl overflow-hidden border border-slate-200 dark:border-white/15 bg-slate-900 shadow-2xl shadow-purple-500/10">
              {/* Card Container with subtle gradient backdrop for image */}
              <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-900 to-slate-950 p-2 flex items-center justify-center">
                <img
                  src="/kcm_society_ngo.jpg"
                  alt="KCM Society NGO - Bishop Kristhuraju Kurra"
                  className="w-full h-full object-contain rounded-2xl transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>

              {/* Floating Registration Badge */}
              <div className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/20 text-[11px] font-bold text-amber-400 font-mono shadow-xl flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Regd No: 206/2024</span>
              </div>
            </div>

            {/* Visual Info Block */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-5 backdrop-blur-md shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-300">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500/20 animate-pulse" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {ngoT.bannerTitle || "KCM Social Services"}
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                  Government Registered
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {ngoT.bannerDesc || "Active social service initiatives providing daily necessities, blankets, medical funds, and care programs across orphanage houses and clinics in Hyderabad."}
              </p>
            </div>
          </div>

        </div>

        {/* 2. Official NGO Trust & Tax Exemption Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-blue-500/10 dark:from-slate-900 dark:via-indigo-950/80 dark:to-purple-950/90 border border-purple-200/80 dark:border-white/10 p-6 sm:p-10 shadow-xl backdrop-blur-md">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Tax Exemption Eligible (Section 80G)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Government Registered NGO with 12A & 80G Approvals
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
                All donations made to KCM Society NGO qualify for tax deduction under Section 80G(5)(VI) of the Indian Income Tax Act. Official donation vouchers and tax receipts are issued automatically for every contribution.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3.5 justify-center">
              <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/90 dark:border-white/10 text-center shadow-md">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Society Reg Number</div>
                <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">206 / 2024</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/90 dark:border-white/10 text-center shadow-md">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">IT Section Approval</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">12A & 80G(5)(VI)</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Impact Counters Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Our Measured Impact
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
              Real outcomes powered by generous donors and dedicated volunteer teams across Telangana.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="group relative p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${stat.gradient} p-2.5 text-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                      Verified
                    </span>
                  </div>

                  <div>
                    <div className={`text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient}`}>
                      {stat.value}
                    </div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-base mt-1">
                      {stat.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {stat.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Interactive Impact Calculator / Selector */}
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-50 via-white to-purple-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/20 border border-slate-200 dark:border-white/10 shadow-xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                <Sparkles className="w-4 h-4" />
                <span>See What Your Gift Does</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Select Your Giving Impact Tier
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-xl">
                Choose an amount to see the tangible medical supplies, ration packs, or shelter support your donation directly funds.
              </p>
            </div>

            <Link
              href={`/ngo/donations?amount=${impactTiers[selectedImpactIndex].rawAmount}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm whitespace-nowrap"
            >
              <span>Donate {impactTiers[selectedImpactIndex].amount} Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {impactTiers.map((tier, idx) => {
              const isSelected = selectedImpactIndex === idx;
              const Icon = tier.icon;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedImpactIndex(idx)}
                  className={`text-left p-5 rounded-2xl border transition-all duration-300 relative ${
                    isSelected
                      ? "bg-white dark:bg-slate-800 border-purple-500 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/10 -translate-y-1"
                      : "bg-white/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-white/10 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-300"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}

                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mb-1">
                    {tier.amount}
                  </div>

                  <div className="font-bold text-slate-900 dark:text-white text-sm mb-2">
                    {tier.title}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {tier.desc}
                  </p>

                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                    {tier.impactBadge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Core Outreaches Section */}
        <div className="space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {ngoT.initiativesTitle || "Our Core Initiatives"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              {ngoT.initiativesDesc || "Learn how we distribute resources, utilize volunteers, and address medical and elder-care challenges throughout the region."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`group relative p-7 rounded-3xl bg-gradient-to-br ${feature.color} border flex flex-col justify-between space-y-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-white/10 flex items-center justify-center shadow-md">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-white/10 shadow-sm">
                        {feature.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/40 dark:border-white/10 flex items-center justify-between">
                    <Link
                      href={feature.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-all"
                    >
                      <span>{ngoT.exploreMore || "Explore Initiative"}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Recent Action Spotlight / Quick Media Gateway */}
        <div className="grid lg:grid-cols-2 gap-8 items-center bg-slate-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-5 relative z-10 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider">
              <Video className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>Real-Time Field Transparency</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Witness Our Work in Action
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              We document every distribution drive, hospital visit, and ashramam aid program. Check out verified photo archives and high-definition video logs of ongoing humanitarian efforts.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/ngo/gallery"
                className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>View Photo Gallery</span>
              </Link>
              
              <Link
                href="/ngo/videos"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl transition-all flex items-center gap-2 text-sm"
              >
                <Video className="w-4 h-4 text-rose-400" />
                <span>Watch Video Logs</span>
              </Link>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950 p-3 space-y-2">
              <div className="aspect-video rounded-xl bg-slate-800 overflow-hidden relative group">
                <img src="/kcm_society_ngo.jpg" alt="Relief Drive" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-xs font-semibold text-slate-300 truncate">Hospital Medical Aid</div>
              <div className="text-[10px] text-slate-400">Gandhi & NIMS Hospitals</div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950 p-3 space-y-2">
              <div className="aspect-video rounded-xl bg-slate-800 overflow-hidden relative group">
                <img src="/kcm_society_ngo.jpg" alt="Ashramam Care" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Video className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-xs font-semibold text-slate-300 truncate">Ashramam Blanket Drive</div>
              <div className="text-[10px] text-slate-400">Bethany Shelter Support</div>
            </div>
          </div>
        </div>

        {/* 7. Action Banner */}
        <div className="p-8 sm:p-12 bg-gradient-to-r from-purple-500/10 via-slate-50 dark:via-slate-900 to-red-500/10 border border-slate-200 dark:border-white/10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 text-left shadow-xl">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>{ngoT.ctaHeading || "Be the Change Today"}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Make a Direct Difference in Someone's Life
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {ngoT.ctaText || "Every small action counts. Your donation funds medical supplies and food packs for government hospitals, while volunteering gives us the hands needed to deliver them."}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 flex-shrink-0">
            <Link
              href="/ngo/donations"
              className="px-7 py-3.5 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2"
            >
              <Gift className="w-4 h-4" />
              <span>{ngoT.donateNow || "Donate Now"}</span>
            </Link>
            <Link
              href="/ngo/volunteers"
              className="px-7 py-3.5 bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 font-bold rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>{ngoT.becomeVolunteer || "Become a Volunteer"}</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
