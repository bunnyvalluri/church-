"use client";

import React, { memo, useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";

// Curated high-impact showcase images across outreach categories
const CURATED_SHOWCASE_IMAGES = [
  { src: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0031.jpg", alt: "Gandhi Hospital Service", badge: "Hospital Aid" },
  { src: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0013.jpg", alt: "Bethany Ashramam Care", badge: "Ashramam Support" },
  { src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0037.jpg", alt: "NIMS Hospital Outreach", badge: "Medical Supplies" },
  { src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED (SECUNDERABAD) [23-07-2026]/IMG-20260723-WA0001.jpg", alt: "Disabled Care Relief", badge: "Rehabilitation" },
  { src: "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0018.jpg", alt: "Government Hospital Food Drive", badge: "Food Aid" },
  { src: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0018.jpg", alt: "Ashramam Provisions", badge: "Care Program" },
  { src: "/KCM_NGO_SERVICES/MISSIONARIES OF CHARITY [SECUNDERABAD BHOIGUDA] 25-05-2026/IMG-20260825-WA0008.jpg", alt: "Missionaries of Charity Outreach", badge: "Compassion Aid" },
  { src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0010.jpg", alt: "Disabled Care Ashramam", badge: "Elderly Care" },
];

// Memoized Gallery Image Card with cinematic aspect ratio and gradient scrim
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
    <div className="ngo-img-card w-52 sm:w-60 md:w-68 aspect-[16/10] relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-md bg-slate-900 flex-shrink-0 group">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 208px, 272px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
        quality={75}
      />

      {/* Cinematic bottom gradient scrim — guarantees 100% text contrast without blocking photos */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* Elegant Pill Badge — Clean, unobtrusive, no alarming red pulsing dots */}
      {badgeText && (
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 dark:bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider border border-white/20 shadow-xs">
            <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-400 shrink-0" />
            <span className="truncate">{badgeText}</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default function NgoShowcase() {
  const { t } = useLanguage();
  const ngoT = t.ngo ?? translations.en.ngo;
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Viewport Observer: Pause marquee animations when not in viewport to save 100% GPU
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: "150px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const row1 = useMemo(() => CURATED_SHOWCASE_IMAGES.slice(0, 4), []);
  const row2 = useMemo(() => CURATED_SHOWCASE_IMAGES.slice(4, 8), []);

  const itemsRow1 = useMemo(() => [...row1, ...row1, ...row1], [row1]);
  const itemsRow2 = useMemo(() => [...row2, ...row2, ...row2], [row2]);

  return (
    <section
      ref={sectionRef}
      className="py-10 sm:py-14 md:py-16 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 border-t border-b border-slate-200/50 dark:border-white/[0.04] min-h-[440px] sm:min-h-[500px]"
    >
      {/* Background Orbs — Subtle ambient GPU layers */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-12 left-12 w-48 h-48 rounded-full bg-purple-500/5 blur-2xl" />
        <div className="absolute bottom-12 right-12 w-48 h-48 rounded-full bg-rose-500/5 blur-2xl" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333%, 0, 0); }
        }
        @keyframes marquee-reverse {
          0% { transform: translate3d(-33.333%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee-slow {
          display: flex;
          width: max-content;
          animation: marquee 80s linear infinite;
          will-change: transform;
        }
        .animate-marquee-reverse-slow {
          display: flex;
          width: max-content;
          animation: marquee-reverse 80s linear infinite;
          will-change: transform;
        }
        .marquee-paused {
          animation-play-state: paused !important;
        }
        .marquee-group:hover .animate-marquee-slow,
        .marquee-group:hover .animate-marquee-reverse-slow,
        .marquee-group:active .animate-marquee-slow,
        .marquee-group:active .animate-marquee-reverse-slow {
          animation-play-state: paused;
        }
      ` }} />

      <div className="relative z-10 space-y-10 sm:space-y-14">

        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider font-outfit shadow-2xs">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            <span>
              {t.nav.ngo ? `KCM ${t.nav.ngo}` : "KCM NGO Impact"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight font-outfit">
            {ngoT.showcase?.title || "KCM Social Service Outreaches"}
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-sans">
            {ngoT.showcase?.subtitle || "Witness our ongoing physical ministries, daily hospital distributions, disabled care, and ashramam relief efforts across Hyderabad."}
          </p>
        </div>

        {/* Infinite Scroll Showcase with Universal Alpha Feathering (CSS Mask — zero color clash) */}
        <div
          className="marquee-group relative w-full py-1 select-none overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
          }}
        >
          {/* Row 1: Leftward */}
          <div className="relative flex overflow-hidden w-full mb-4">
            <div className={`animate-marquee-slow flex gap-3.5 sm:gap-4.5 ${!isInView ? "marquee-paused" : ""}`}>
              {itemsRow1.map((item, idx) => (
                <NgoImageCard
                  key={`row1-${idx}`}
                  src={item.src}
                  alt={item.alt}
                  badgeText={item.badge}
                />
              ))}
            </div>
          </div>

          {/* Row 2: Rightward */}
          <div className="relative flex overflow-hidden w-full">
            <div className={`animate-marquee-reverse-slow flex gap-3.5 sm:gap-4.5 ${!isInView ? "marquee-paused" : ""}`}>
              {itemsRow2.map((item, idx) => (
                <NgoImageCard
                  key={`row2-${idx}`}
                  src={item.src}
                  alt={item.alt}
                  badgeText={item.badge}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button — Unified with Platform Brand Language */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Link
            href="/ngo"
            aria-label="Visit KCM NGO Portal"
            className="min-h-[48px] px-8 py-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base border border-purple-400/30 select-none group"
          >
            <span>{ngoT.showcase?.actionBtn || "Visit NGO Portal"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
