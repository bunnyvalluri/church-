"use client";

import { ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export interface GivingHeroConfigProps {
  headline?: string;
  subtitle?: string;
  backgroundImageUrl?: string | null;
  backgroundType?: string;
  badgeText?: string;
  ctaPrimaryText?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  campaignBannerText?: string | null;
  campaignBannerHref?: string | null;
  securityBadges?: string[];
  statistics?: Array<{ label: string; value: string }>;
}

export default function DynamicGivingHero({
  headline = "Sow a Seed of Faith & Transform Lives",
  subtitle = "Your generous giving supports our local church services, community outreach programs, youth development, and global missions.",
  badgeText = "100% Tax Exempt (80G) & Secure",
  ctaPrimaryText = "Give Now",
  ctaPrimaryHref = "#give-form",
  ctaSecondaryText = "Impact Report",
  ctaSecondaryHref = "/about#impact",
  campaignBannerText,
  campaignBannerHref,
  securityBadges = ["80G Tax Exemption Registered", "256-bit SSL Encrypted", "Instant Verified PDF Receipt"],
  statistics = [
    { label: "Lives Impacted", value: "10,000+" },
    { label: "Outreach Programs", value: "25+" },
    { label: "Church Branches", value: "3" },
  ],
}: GivingHeroConfigProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 text-white p-5 sm:p-8 md:p-10 shadow-2xl border border-violet-700/40">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
        {/* Active Campaign Alert Banner */}
        {campaignBannerText && (
          <motion.a
            href={campaignBannerHref || "#give-form"}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40 text-xs sm:text-sm font-bold shadow-lg hover:bg-amber-400/30 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{campaignBannerText}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.a>
        )}

        {/* Top Badge */}
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-950/80 backdrop-blur-md border border-emerald-400/50 text-emerald-300 text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-black/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {badgeText}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-md">
          {headline}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-violet-100/90 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
          {subtitle}
        </p>

        {/* Statistics Bar */}
        {statistics && statistics.length > 0 && (
          <div className="pt-4 pb-2 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {statistics.map((stat, idx) => (
              <div key={idx} className="bg-violet-950/70 backdrop-blur-md rounded-2xl p-4 border border-violet-500/30 text-center shadow-lg shadow-black/20">
                <div className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow">{stat.value}</div>
                <div className="text-xs sm:text-sm font-bold text-violet-100 uppercase tracking-wide mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Security Labels */}
        {securityBadges && securityBadges.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {securityBadges.map((badge, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-violet-100 bg-violet-950/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-violet-600/40 shadow">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
