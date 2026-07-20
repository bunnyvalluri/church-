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
    <div 
      style={{
        backgroundColor: "#0f172a",
        backgroundImage: "linear-gradient(135deg, #0f172a 0%, #2e1065 50%, #1e1b4b 100%)",
        color: "#ffffff",
      }}
      className="relative overflow-hidden rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl border border-purple-600/40"
    >
      {/* Ambient Radial Glow Effect */}
      <div 
        style={{ background: "radial-gradient(circle, rgba(147, 51, 234, 0.35) 0%, rgba(0, 0, 0, 0) 70%)" }}
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none" 
      />
      <div 
        style={{ background: "radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(0, 0, 0, 0) 70%)" }}
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full pointer-events-none" 
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5 sm:space-y-6">
        {/* Active Campaign Alert Banner */}
        {campaignBannerText && (
          <motion.a
            href={campaignBannerHref || "#give-form"}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#fde68a", borderColor: "rgba(245, 158, 11, 0.5)" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-bold shadow-lg hover:bg-amber-500/30 transition-all duration-200"
          >
            <Sparkles style={{ color: "#fbbf24" }} className="w-4 h-4 animate-pulse" />
            <span>{campaignBannerText}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.a>
        )}

        {/* Top Badge */}
        <div>
          <span 
            style={{ backgroundColor: "#022c22", color: "#6ee7b7", borderColor: "#059669" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg"
          >
            <ShieldCheck style={{ color: "#34d399" }} className="w-4 h-4" />
            {badgeText}
          </span>
        </div>

        {/* Main Headline */}
        <h1 
          style={{ color: "#ffffff" }} 
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight drop-shadow-md"
        >
          {headline}
        </h1>

        {/* Subtitle */}
        <p 
          style={{ color: "#e2e8f0" }} 
          className="text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
        >
          {subtitle}
        </p>

        {/* Statistics Bar */}
        {statistics && statistics.length > 0 && (
          <div className="pt-3 pb-1 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {statistics.map((stat, idx) => (
              <div 
                key={idx} 
                style={{ backgroundColor: "rgba(15, 23, 42, 0.9)", borderColor: "rgba(168, 85, 247, 0.4)" }}
                className="rounded-2xl p-4 border text-center shadow-xl"
              >
                <div style={{ color: "#fbbf24" }} className="text-2xl sm:text-3xl font-black drop-shadow">{stat.value}</div>
                <div style={{ color: "#ffffff" }} className="text-xs sm:text-sm font-extrabold uppercase tracking-wide mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Security Labels */}
        {securityBadges && securityBadges.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {securityBadges.map((badge, idx) => (
              <span 
                key={idx} 
                style={{ backgroundColor: "#0f172a", color: "#ffffff", borderColor: "#4c1d95" }}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold px-4 py-1.5 rounded-full border shadow"
              >
                <CheckCircle2 style={{ color: "#34d399" }} className="w-4 h-4" />
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
