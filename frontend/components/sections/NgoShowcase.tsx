"use client";

import React, { memo, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";
import { ALL_NGO_IMAGES } from "@/lib/ngoImages";

// Cap to 10 images per row — 20 total per row when doubled for seamless loop (60 total DOM nodes instead of 180)
const MAX_PER_ROW = 10;

// Memoized Gallery Image Card
const NgoImageCard = memo(function NgoImageCard({
  src,
  alt,
  badgeText,
}: {
  src: string;
  alt: string;
  badgeText?: string;
}) {
  return (
    <div className="ngo-img-card w-60 sm:w-72 aspect-[4/3] relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md bg-slate-900 flex-shrink-0 transform-gpu">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 240px, (max-width: 1024px) 288px, 320px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        quality={75}
      />
      {badgeText && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-red-500/90 text-white px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>{badgeText}</span>
        </div>
      )}
    </div>
  );
});

export default function NgoShowcase() {
  const { t } = useLanguage();
  const ngoT = t.ngo ?? translations.en.ngo;

  // Interleave images by directory/event to ensure variety
  const interleavedImages = useMemo(() => {
    const groups: Record<string, string[]> = {};
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

  // Distribute interleaved images capped at MAX_PER_ROW each
  const row1 = useMemo(() => interleavedImages.slice(0, MAX_PER_ROW), [interleavedImages]);
  const row2 = useMemo(() => interleavedImages.slice(MAX_PER_ROW, MAX_PER_ROW * 2), [interleavedImages]);
  const row3 = useMemo(() => interleavedImages.slice(MAX_PER_ROW * 2, MAX_PER_ROW * 3), [interleavedImages]);

  // Duplicate for seamless infinite loop (20 cards per row)
  const itemsRow1 = useMemo(() => [...row1, ...row1], [row1]);
  const itemsRow2 = useMemo(() => [...row2, ...row2], [row2]);
  const itemsRow3 = useMemo(() => [...row3, ...row3], [row3]);

  return (
    <section className="py-20 sm:py-24 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 border-t border-b border-slate-200/50 dark:border-white/[0.04]">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-12 left-12 w-64 h-64 rounded-full bg-purple-500/5 blur-2xl transform-gpu" />
        <div className="absolute bottom-12 right-12 w-64 h-64 rounded-full bg-red-500/5 blur-2xl transform-gpu" />
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
          animation: marquee 160s linear infinite;
          will-change: transform;
        }
        .animate-marquee-reverse-slow {
          display: flex;
          width: max-content;
          animation: marquee-reverse 150s linear infinite;
          will-change: transform;
        }
        .marquee-group:hover .animate-marquee-slow,
        .marquee-group:hover .animate-marquee-reverse-slow {
          animation-play-state: paused;
        }
        .marquee-row {
          -webkit-mask-image: linear-gradient(to right, transparent 0px, black 80px, black calc(100% - 80px), transparent 100%);
          mask-image: linear-gradient(to right, transparent 0px, black 80px, black calc(100% - 80px), transparent 100%);
        }
        .ngo-img-card {
          transition: box-shadow 0.3s ease;
        }
        .ngo-img-card:hover {
          box-shadow: 0 12px 32px rgba(0,0,0,0.15);
        }
      ` }} />

      <div className="relative z-10 space-y-12 sm:space-y-16">

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
        <div className="marquee-group relative w-full py-2 select-none">

          {/* Row 1: Leftward */}
          <div className="marquee-row relative flex overflow-hidden w-full mb-5">
            <div className="animate-marquee-slow flex gap-4 sm:gap-5">
              {itemsRow1.map((src, idx) => (
                <NgoImageCard
                  key={`row1-${idx}`}
                  src={src}
                  alt={`KCM NGO Outreach ${idx + 1}`}
                  badgeText="Hospital Services"
                />
              ))}
            </div>
          </div>

          {/* Row 2: Rightward */}
          <div className="marquee-row relative flex overflow-hidden w-full mb-5">
            <div className="animate-marquee-reverse-slow flex gap-4 sm:gap-5">
              {itemsRow2.map((src, idx) => (
                <NgoImageCard
                  key={`row2-${idx}`}
                  src={src}
                  alt={`KCM NGO Outreach ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Row 3: Leftward */}
          <div className="marquee-row relative flex overflow-hidden w-full">
            <div className="animate-marquee-slow flex gap-4 sm:gap-5">
              {itemsRow3.map((src, idx) => (
                <NgoImageCard
                  key={`row3-${idx}`}
                  src={src}
                  alt={`KCM NGO Outreach ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center pt-2">
          <Link
            href="/ngo"
            aria-label="Visit KCM NGO Portal"
            className="px-8 py-4 min-h-[44px] bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 flex items-center gap-2"
          >
            <span>{ngoT.showcase?.actionBtn || "Visit NGO Portal"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

