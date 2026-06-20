"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";

export default function NgoShowcase() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ngoT = mounted ? t.ngo : translations.en.ngo;

  // Actual Hospital outreach images (NIMS, Gandhi, Govt General)
  const row1 = [
    "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0031.jpg",
    "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0043.jpg",
    "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0018.jpg",
    "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0035.jpg",
    "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0045.jpg",
    "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0020.jpg",
    "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0045.jpg",
    "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0052.jpg",
    "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0025.jpg",
    "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0048.jpg",
    "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0059.jpg",
    "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0030.jpg",
  ];

  // Actual Bethany Samrakshana Ashramam support images
  const row2 = [
    "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0018.jpg",
    "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0013.jpg",
    "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0019.jpg",
    "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0016.jpg",
    "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0020.jpg",
    "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0018.jpg",
    "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0022.jpg",
    "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0020.jpg",
    "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0025.jpg",
    "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0022.jpg",
    "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0030.jpg",
    "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0030.jpg",
  ];

  // Actual Home for the Disabled Ashramam aid images
  const row3 = [
    "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260615-WA0015.jpg",
    "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0010.jpg",
    "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260615-WA0017.jpg",
    "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0012.jpg",
    "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260615-WA0019.jpg",
    "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0013.jpg",
    "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0014.jpg",
    "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0015.jpg",
    "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0019.jpg",
    "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0022.jpg",
    "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0024.jpg",
    "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0029.jpg",
  ];

  // Double the rows to make the marquee loop infinitely without gaps
  const itemsRow1 = [...row1, ...row1];
  const itemsRow2 = [...row2, ...row2];
  const itemsRow3 = [...row3, ...row3];

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 border-t border-b border-slate-200/50 dark:border-white/[0.04]">
      {/* Decorative background orbs */}
      <div className="absolute top-12 left-12 w-72 h-72 rounded-full bg-purple-500/5 dark:bg-purple-500/10 filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-72 h-72 rounded-full bg-red-500/5 dark:bg-red-500/10 filter blur-3xl pointer-events-none" />

      {/* Styled inline animation block to avoid CSS file mutation */}
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
          animation: marquee 35s linear infinite;
        }
        .animate-marquee-reverse-slow {
          display: flex;
          width: max-content;
          animation: marquee-reverse 35s linear infinite;
        }
        .marquee-group:hover .animate-marquee-slow,
        .marquee-group:hover .animate-marquee-reverse-slow {
          animation-play-state: paused;
        }
      ` }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10 text-center">
        
        {/* Header Block */}
        <div className="space-y-4 max-w-3xl mx-auto">
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

        {/* Infinite Scroll Showcase Container */}
        <div className="marquee-group space-y-6 overflow-hidden py-4 select-none pointer-events-auto">
          
          {/* Row 1: Leftward Scroll (Hospital Outreaches) */}
          <div className="relative flex overflow-hidden w-full">
            <div className="animate-marquee-slow flex gap-6">
              {itemsRow1.map((src, idx) => (
                <div 
                  key={`row1-${idx}`} 
                  className="w-72 sm:w-80 aspect-[4/3] relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md group bg-slate-900 flex-shrink-0"
                >
                  <img
                    src={src}
                    alt={`NGO Outreach Camp ${idx}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Hospital Services</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Rightward Scroll (Ashramam & Elders Care) */}
          <div className="relative flex overflow-hidden w-full">
            <div className="animate-marquee-reverse-slow flex gap-6">
              {itemsRow2.map((src, idx) => (
                <div 
                  key={`row2-${idx}`} 
                  className="w-72 sm:w-80 aspect-[4/3] relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md group bg-slate-900 flex-shrink-0"
                >
                  <img
                    src={src}
                    alt={`NGO Outreach Camp ${idx}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Ashramam & Elders Care</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Leftward Scroll (Disabled Rehabilitation) */}
          <div className="relative flex overflow-hidden w-full">
            <div className="animate-marquee-slow flex gap-6">
              {itemsRow3.map((src, idx) => (
                <div 
                  key={`row3-${idx}`} 
                  className="w-72 sm:w-80 aspect-[4/3] relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md group bg-slate-900 flex-shrink-0"
                >
                  <img
                    src={src}
                    alt={`NGO Outreach Camp ${idx}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Disabled Rehab Services</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Call to Action Button */}
        <div className="pt-4 flex justify-center">
          <Link
            href="/ngo"
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
          >
            <span>{ngoT.showcase?.actionBtn || "Visit NGO Portal"}</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
