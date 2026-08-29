"use client";

import React, { memo, useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";

// Curated high-impact showcase images across categories
const CURATED_SHOWCASE_IMAGES = [
  { src: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0031.jpg", alt: "Gandhi Hospital Service", badge: "Hospital Aid" },
  { src: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0013.jpg", alt: "Bethany Ashramam Care", badge: "Ashramam Support" },
  { src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0037.jpg", alt: "NIMS Hospital Outreach", badge: "Medical Supplies" },
  { src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED (SECUNDERABAD) [23-07-2026]/IMG-20260723-WA0001.jpg", alt: "Disabled Care Relief", badge: "Rehabilitation" },
  { src: "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0018.jpg", alt: "Government Hospital Food Drive", badge: "Food Aid" },
  { src: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0018.jpg", alt: "Ashramam Provisions", badge: "Care Program" },
  { src: "/KCM_NGO_SERVICES/MISSIONARIES OF CHARITY [SECUNDERABAD BHOIGUDA] 25-05-2026/IMG-20260825-WA0008.jpg", alt: "Missionaries of Charity Outreach", badge: "Compassion Aid" },
  { src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0010.jpg", alt: "Disabled Care Ashramam", badge: "Elderly & Wheelchair" },
];

// Memoized Gallery Image Card with contain-paint and async decoding
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
    <div className="ngo-img-card w-48 sm:w-56 md:w-64 aspect-[4/3] relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md bg-slate-900 flex-shrink-0">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 192px, 256px"
        className="object-cover transition-transform duration-300 hover:scale-105"
        loading="lazy"
        decoding="async"
        quality={60}
      />
      {badgeText && (
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span>{badgeText}</span>
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
      className="py-10 sm:py-14 md:py-16 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 border-t border-b border-slate-200/50 dark:border-white/[0.04]"
    >
      {/* Background Orbs — Static GPU layers */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-12 left-12 w-48 h-48 rounded-full bg-purple-500/5 blur-2xl" />
        <div className="absolute bottom-12 right-12 w-48 h-48 rounded-full bg-red-500/5 blur-2xl" />
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
        .marquee-group:hover .animate-marquee-reverse-slow {
          animation-play-state: paused;
        }
      ` }} />

      <div className="relative z-10 space-y-10 sm:space-y-14">

        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-300 text-xs font-semibold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 animate-pulse text-red-500" />
            <span>
              {t.nav.ngo ? `KCM ${t.nav.ngo}` : "KCM NGO Impact"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            {ngoT.showcase?.title || "KCM Social Service Outreaches"}
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            {ngoT.showcase?.subtitle || "Witness our ongoing physical ministries, daily hospital distributions, disabled care, and ashramam relief efforts across Hyderabad."}
          </p>
        </div>

        {/* Infinite Scroll Showcase with Edge Fades (Fast GPU overlay, zero mask-image rasterization) */}
        <div className="marquee-group relative w-full py-1 select-none overflow-hidden">
          
          {/* Left / Right Fade Gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-slate-50 dark:from-[#090a15] to-transparent pointer-events-none z-20" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-slate-50 dark:from-[#090a15] to-transparent pointer-events-none z-20" />

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

        {/* CTA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Link
            href="/ngo"
            aria-label="Visit KCM NGO Portal"
            className="px-8 py-3.5 min-h-[44px] bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 flex items-center gap-2 text-sm"
          >
            <span>{ngoT.showcase?.actionBtn || "Visit NGO Portal"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
