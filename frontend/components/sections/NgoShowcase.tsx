"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";
import { ALL_NGO_IMAGES } from "@/lib/ngoImages";

// Cap to 30 images per row — enough for a seamless loop, avoids 1000+ DOM nodes
const MAX_PER_ROW = 30;

export default function NgoShowcase() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ngoT = mounted ? t.ngo : translations.en.ngo;

  // Interleave images by directory/event to ensure variety and prevent duplicate events from clustering together
  const interleavedImages = useMemo(() => {
    const groups: { [key: string]: string[] } = {};
    for (const src of ALL_NGO_IMAGES) {
      const lastSlashIndex = src.lastIndexOf('/');
      if (lastSlashIndex === -1) continue;
      const dir = src.substring(0, lastSlashIndex);
      if (!groups[dir]) {
        groups[dir] = [];
      }
      groups[dir].push(src);
    }

    const groupKeys = Object.keys(groups).sort();
    const interleaved: string[] = [];
    let maxLen = 0;
    for (const key of groupKeys) {
      if (groups[key].length > maxLen) {
        maxLen = groups[key].length;
      }
    }

    for (let index = 0; index < maxLen; index++) {
      for (const key of groupKeys) {
        if (index < groups[key].length) {
          interleaved.push(groups[key][index]);
        }
      }
    }
    return interleaved;
  }, []);

  // Distribute interleaved images, capped at MAX_PER_ROW each
  const row1 = useMemo(() => interleavedImages.slice(0, MAX_PER_ROW), [interleavedImages]);
  const row2 = useMemo(() => interleavedImages.slice(MAX_PER_ROW, MAX_PER_ROW * 2), [interleavedImages]);
  const row3 = useMemo(() => interleavedImages.slice(MAX_PER_ROW * 2, MAX_PER_ROW * 3), [interleavedImages]);

  // Duplicate for seamless infinite loop
  const itemsRow1 = useMemo(() => [...row1, ...row1], [row1]);
  const itemsRow2 = useMemo(() => [...row2, ...row2], [row2]);
  const itemsRow3 = useMemo(() => [...row3, ...row3], [row3]);

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 border-t border-b border-slate-200/50 dark:border-white/[0.04]">
      {/* Single lightweight bg orb — not two */}
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
        <div className="absolute top-12 left-12 w-64 h-64 rounded-full bg-purple-500/5 blur-2xl" />
        <div className="absolute bottom-12 right-12 w-64 h-64 rounded-full bg-red-500/5 blur-2xl" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-reverse {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee-slow {
          display: flex;
          width: max-content;
          animation: marquee 220s linear infinite;
          will-change: transform;
        }
        .animate-marquee-reverse-slow {
          display: flex;
          width: max-content;
          animation: marquee-reverse 200s linear infinite;
          will-change: transform;
        }
        .marquee-group:hover .animate-marquee-slow,
        .marquee-group:hover .animate-marquee-reverse-slow {
          animation-play-state: paused;
        }
        .marquee-row {
          -webkit-mask-image: linear-gradient(to right, transparent 0px, black 100px, black calc(100% - 100px), transparent 100%);
          mask-image: linear-gradient(to right, transparent 0px, black 100px, black calc(100% - 100px), transparent 100%);
        }
        .ngo-img-card {
          transition: box-shadow 0.3s ease;
        }
        .ngo-img-card:hover {
          box-shadow: 0 12px 32px rgba(0,0,0,0.15);
        }
        .ngo-img-card img {
          transition: transform 0.6s ease;
        }
        .ngo-img-card:hover img {
          transform: scale(1.06);
        }
      ` }} />

      <div className="relative z-10 space-y-16">

        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-300 text-xs font-semibold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 animate-pulse" />
            <span>KCM NGO Impact</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            {ngoT.showcase?.title || "KCM Social Service Outreaches"}
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            {ngoT.showcase?.subtitle || "Witness our ongoing physical ministries, daily hospital distributions, disabled care, and ashramam relief efforts across Hyderabad."}
          </p>
        </div>

        {/* Infinite Scroll Showcase — Full Bleed */}
        <div className="marquee-group relative w-full py-4 select-none">

          {/* Row 1: Leftward */}
          <div className="marquee-row relative flex overflow-hidden w-full mb-6">
            <div className="animate-marquee-slow flex gap-5">
              {itemsRow1.map((src, idx) => (
                <div
                  key={`row1-${idx}`}
                  className="ngo-img-card w-64 sm:w-72 aspect-[4/3] relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md bg-slate-900 flex-shrink-0"
                >
                  <Image
                    src={src}
                    alt={`NGO Outreach ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 256px, 288px"
                    className="object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-red-500/90 text-white px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>Hospital Services</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Rightward */}
          <div className="marquee-row relative flex overflow-hidden w-full mb-6">
            <div className="animate-marquee-reverse-slow flex gap-5">
              {itemsRow2.map((src, idx) => (
                <div
                  key={`row2-${idx}`}
                  className="ngo-img-card w-64 sm:w-72 aspect-[4/3] relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md bg-slate-900 flex-shrink-0"
                >
                  <Image
                    src={src}
                    alt={`NGO Outreach ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 256px, 288px"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Leftward */}
          <div className="marquee-row relative flex overflow-hidden w-full">
            <div className="animate-marquee-slow flex gap-5">
              {itemsRow3.map((src, idx) => (
                <div
                  key={`row3-${idx}`}
                  className="ngo-img-card w-64 sm:w-72 aspect-[4/3] relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md bg-slate-900 flex-shrink-0"
                >
                  <Image
                    src={src}
                    alt={`NGO Outreach ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 256px, 288px"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center pt-4">
          <Link
            href="/ngo"
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>{ngoT.showcase?.actionBtn || "Visit NGO Portal"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
