"use client";

import React from "react";
import Link from "next/link";
import { Heart, Users, Video, Image as ImageIcon, ArrowRight, ShieldAlert, Award, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function NgoOverviewPage() {
  const stats = [
    { value: "5,000+", label: "People Assisted", desc: "Patient food, clothes & support" },
    { value: "3+", label: "Hospitals Supported", desc: "NIMS, Gandhi, & Govt Hospitals" },
    { value: "100+", label: "Volunteers Active", desc: "Dedicated social service workers" },
    { value: "2+", label: "Ashramams Funded", desc: "Rehabilitation & shelter support" },
  ];

  const features = [
    {
      title: "Hospital Outreaches",
      desc: "Providing medicine, food supplies, and spiritual comfort to patients in Gandhi, NIMS, and Government General Hospitals.",
      icon: Award,
      color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300",
      href: "/ngo/projects",
    },
    {
      title: "Ashramam Support",
      desc: "Aiding Bethany Samrakshana Ashramam and disabled care shelters with monthly provisions, bedding, and medical assistance.",
      icon: Star,
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300",
      href: "/ngo/projects",
    },
    {
      title: "Impact Gallery",
      desc: "Browse high-quality photo logs capturing real-time volunteer services and relief distribution camps.",
      icon: ImageIcon,
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300",
      href: "/ngo/gallery",
    },
    {
      title: "Service Video Logs",
      desc: "Watch direct video evidence of social work, including specialized hospital care distributions.",
      icon: Video,
      color: "from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-300",
      href: "/ngo/videos",
    },
  ];

  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* 1. Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 animate-pulse" />
              Non-Governmental Organization (NGO)
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-transparent">
              Serving Humanity,<br />
              Spreading Hope
            </h1>
            
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              Kingdom of Christ Ministries extends its mission beyond the chapel walls through community outreaches, medical aids, and rehabilitation support. We believe in active faith through selfless social service.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/ngo/donations"
                className="px-6 py-3.5 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
              >
                <span>Support Our Cause</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href="/ngo/volunteers"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-white/10 hover:border-white/20 font-bold rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
              >
                <span>Join as Volunteer</span>
                <Users className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Visual card banner */}
          <div className="relative group rounded-3xl overflow-hidden border border-white/10 aspect-video lg:aspect-square flex items-center justify-center bg-slate-900 shadow-2xl shadow-purple-500/5">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
            <div className="absolute inset-0 bg-purple-600/10 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-20 text-center p-8 space-y-4 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-300">
                <Heart className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold">KCM Social Services</h3>
              <p className="text-sm text-slate-400">
                Active social service initiatives providing daily necessities, blankets, medical funds, and care programs across orphanage houses and clinics in Hyderabad.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Impact Counters Grid */}
        <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center space-y-2 border-r last:border-0 border-white/5 md:border-r-0 lg:border-r">
                <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-400">
                  {stat.value}
                </div>
                <div className="font-bold text-slate-200 text-sm">{stat.label}</div>
                <div className="text-xs text-slate-500 max-w-[180px] mx-auto">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Core Outreaches Section */}
        <div className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Our Core Initiatives</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Learn how we distribute resources, utilize volunteers, and address medical and elder-care challenges.
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
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                    <p className="text-sm text-slate-300/80 leading-relaxed">{feature.desc}</p>
                  </div>

                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:gap-2 transition-all"
                  >
                    <span>Explore More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Action Banner */}
        <div className="p-8 sm:p-12 bg-gradient-to-r from-purple-900/30 via-slate-900 to-red-950/20 border border-white/5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl font-bold">Be the Change Today</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every small action count. Your donation funds medical supplies and food packets for government hospitals, while volunteering gives us the hands needed to deliver them.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/ngo/donations"
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Donate Now
            </Link>
            <Link
              href="/ngo/volunteers"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold rounded-xl transition-all"
            >
              Become a Volunteer
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
