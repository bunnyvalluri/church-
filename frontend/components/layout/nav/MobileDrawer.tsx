"use client";

import React, { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { 
  X, 
  Youtube, 
  ChevronRight, 
  Sparkles, 
  Heart, 
  PlayCircle, 
  Sun, 
  Moon, 
  Globe, 
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTheme } from "next-themes";
import PaletteToggle from "@/components/PaletteToggle";
import MemberLoginButton from "./MemberLoginButton";
import { NAV_STYLES } from "./constants";
import { NavItem } from "./types";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  activeSection: string;
  pathname: string;
  resolveHref: (href: string) => string;
}

/**
 * MobileDrawer — Ultra-responsive, touch-optimized Navigation Drawer.
 * 
 * Sized & styled perfectly for compact smartphones (e.g. Samsung Galaxy S8+ 360px,
 * iPhone SE 375px, Pixel, Galaxy Fold) up to tablets.
 */
const MobileDrawer = memo(function MobileDrawer({
  isOpen,
  onClose,
  navItems,
  activeSection,
  pathname,
  resolveHref,
}: MobileDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const languages = [
    { code: "en", label: "English", short: "EN" },
    { code: "te", label: "తెలుగు", short: "TE" },
    { code: "hi", label: "हिंदी", short: "HI" },
  ] as const;

  const drawerContent = (
    <div className="fixed inset-0 z-[99999] flex justify-end">
      {/* ── Backdrop blur overlay with fade-in ── */}
      <div
        className="fixed inset-0 bg-slate-950/70 dark:bg-black/85 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Slide-In Drawer Panel (Full width on mobile <640px, max-w-md on tablet+) ── */}
      <aside
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className={cn(
          "relative z-10 w-full max-w-full sm:max-w-md h-full h-dvh",
          "bg-white dark:bg-[#0b0e1b]",
          "border-l border-slate-200/80 dark:border-white/10",
          "shadow-2xl shadow-black/60",
          "flex flex-col justify-between",
          "animate-in slide-in-from-right duration-300 ease-out"
        )}
      >
        {/* ── 1. Drawer Header ── */}
        <div className="flex items-center justify-between px-3.5 py-3 min-[360px]:px-4 min-[360px]:py-3.5 sm:px-5 sm:py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-2.5 min-[360px]:gap-3">
            <div className="relative w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 rounded-full overflow-hidden border border-purple-400/40 shadow-sm bg-white shrink-0">
              <Image src="/logo.png" alt="KCM Logo" fill className="object-cover" />
            </div>
            <div>
              <h2 className="text-[13px] min-[360px]:text-sm font-black text-slate-900 dark:text-white leading-tight font-outfit tracking-tight">
                Kingdom of Christ
              </h2>
              <div className="flex items-center gap-1 text-[10px] min-[360px]:text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                <Sparkles className="w-2.5 h-2.5 min-[360px]:w-3 min-[360px]:h-3" />
                <span>Ministries Portal</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shrink-0"
          >
            <X className="w-4.5 h-4.5 min-[360px]:w-5 min-[360px]:h-5" />
          </button>
        </div>

        {/* ── 2. Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-2.5 min-[360px]:px-3.5 min-[360px]:py-3 space-y-2.5 min-[360px]:space-y-3 pb-8 custom-scrollbar">
          
          {/* Main Navigation Links */}
          <div>
            <div className="px-1 mb-1 flex items-center justify-between">
              <span className="text-[9px] min-[360px]:text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Main Menu
              </span>
              <span className="text-[9px] min-[360px]:text-[10px] font-bold text-slate-400 dark:text-slate-500">
                Explore KCM
              </span>
            </div>

            <nav aria-label="Mobile menu navigation">
              <div className="bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-slate-200/60 dark:divide-white/[0.05] shadow-xs">
                {navItems.map((item) => {
                  const isActive = item.href.startsWith("/")
                    ? pathname === item.href || pathname.startsWith(item.href + "/")
                    : activeSection === item.href.replace("#", "");
                  const styles = NAV_STYLES[item.href] ?? NAV_STYLES["#home"];
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={resolveHref(item.href)}
                      onClick={onClose}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center justify-between px-3 py-1.5 min-[360px]:py-2 min-[360px]:px-3.5",
                        "text-[12.5px] min-[360px]:text-[13px] sm:text-sm font-bold transition-all duration-200 select-none",
                        "min-h-[38px] min-[360px]:min-h-[40px]",
                        isActive
                          ? cn(
                              "bg-white dark:bg-slate-800/90",
                              styles.activeText,
                              "font-black shadow-xs"
                            )
                          : "text-slate-800 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/[0.06] active:scale-[0.99]"
                      )}
                    >
                      {/* Left: Icon capsule + Title */}
                      <div className="relative z-10 flex items-center gap-2 min-[360px]:gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "w-6 h-6 min-[360px]:w-7 min-[360px]:h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                            "transition-all duration-200 group-hover:scale-105 shadow-xs border",
                            isActive
                              ? cn(styles.iconBg, "shadow-sm")
                              : "bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10"
                          )}
                        >
                          {Icon && <Icon className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5" aria-hidden="true" />}
                        </div>
                        <span className="tracking-tight truncate">{item.name}</span>
                      </div>

                      {/* Right: Active pill or subtle arrow */}
                      <div className="relative z-10 flex items-center gap-1 shrink-0 ml-1.5">
                        {isActive ? (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[9px] min-[360px]:text-[9.5px] font-black tracking-wide">
                            <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", styles.activeIndicator)} />
                            Active
                          </span>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Quick Actions Bar (Prayer & Sermons) */}
          <div>
            <div className="px-1 mb-1.5">
              <span className="text-[9.5px] min-[360px]:text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Quick Ministry Links
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 min-[360px]:gap-2.5">
              {/* Prayer Request */}
              <Link
                href="/prayer"
                onClick={onClose}
                className="p-2.5 min-[360px]:p-3 rounded-2xl bg-gradient-to-br from-rose-500/10 via-pink-500/10 to-rose-600/5 dark:from-rose-500/20 dark:to-pink-600/10 border border-rose-200 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-400 transition-all flex flex-col justify-between gap-1.5 min-[360px]:gap-2 group"
              >
                <div className="w-6 h-6 min-[360px]:w-7 min-[360px]:h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Heart className="w-3 min-[360px]:w-3.5 h-3 min-[360px]:h-3.5 fill-white/20" />
                </div>
                <div>
                  <h4 className="text-[11px] min-[360px]:text-xs font-black text-rose-700 dark:text-rose-300 leading-tight">Prayer Request</h4>
                  <p className="text-[9px] min-[360px]:text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">Send requests 24/7</p>
                </div>
              </Link>

              {/* Watch Gallery / Sermons */}
              <Link
                href="/gallery"
                onClick={onClose}
                className="p-2.5 min-[360px]:p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-orange-600/10 border border-amber-200 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-400 transition-all flex flex-col justify-between gap-1.5 min-[360px]:gap-2 group"
              >
                <div className="w-6 h-6 min-[360px]:w-7 min-[360px]:h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-3 min-[360px]:w-3.5 h-3 min-[360px]:h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11px] min-[360px]:text-xs font-black text-amber-700 dark:text-amber-300 leading-tight">Video Gallery</h4>
                  <p className="text-[9px] min-[360px]:text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">Watch sermons</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Preferences & Display Section */}
          <div className="p-2.5 min-[360px]:p-3 sm:p-3.5 rounded-2xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2.5">
            
            {/* 1-Tap Language Switcher */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9.5px] min-[360px]:text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5 min-[360px]:w-3 min-[360px]:h-3 text-purple-600 dark:text-purple-400" />
                  Language
                </span>
                <span className="text-[9.5px] min-[360px]:text-[10px] font-bold text-purple-600 dark:text-purple-400">
                  {language === "en" ? "English" : language === "te" ? "తెలుగు" : "हिंदी"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 min-[360px]:gap-1.5 p-1 bg-slate-200/70 dark:bg-white/[0.08] rounded-xl border border-slate-200/80 dark:border-white/10">
                {languages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code as any)}
                      className={cn(
                        "py-2 px-1.5 min-[360px]:px-2 rounded-lg text-xs min-[360px]:text-[13px] transition-all cursor-pointer flex items-center justify-center gap-1 min-h-[36px] leading-normal",
                        isSelected
                          ? "bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-extrabold shadow-xs border border-purple-200/60 dark:border-purple-500/30"
                          : "text-slate-800 dark:text-slate-100 hover:text-purple-700 dark:hover:text-purple-300 font-bold hover:bg-white/60 dark:hover:bg-white/10"
                      )}
                    >
                      <span className="truncate">{lang.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Tools & Theme Switcher Bar */}
            <div className="pt-2 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-1.5 min-[360px]:gap-2">
              
              {/* Theme Toggle Pill */}
              <div className="flex items-center gap-1.5 min-[360px]:gap-2">
                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center gap-1 min-[360px]:gap-1.5 px-2.5 min-[360px]:px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[11px] min-[360px]:text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/15 transition-all shadow-xs cursor-pointer"
                >
                  {theme === "dark" ? (
                    <>
                      <Moon className="w-3 min-[360px]:w-3.5 h-3 min-[360px]:h-3.5 text-purple-400" />
                      <span>Dark</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3 min-[360px]:w-3.5 h-3 min-[360px]:h-3.5 text-amber-500" />
                      <span>Light</span>
                    </>
                  )}
                </button>

                {/* Color Palette Toggle */}
                <PaletteToggle />
              </div>

              {/* YouTube Channel Button */}
              <a
                href="https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="KCM YouTube Channel"
                className="flex items-center gap-1 min-[360px]:gap-1.5 px-2.5 min-[360px]:px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] min-[360px]:text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                <Youtube className="w-3 min-[360px]:w-3.5 h-3 min-[360px]:h-3.5" />
                <span>YouTube</span>
              </a>
            </div>

          </div>

        </div>

        {/* ── 3. Sticky Bottom Member Portal CTA ── */}
        <div className="p-3 min-[360px]:p-3.5 sm:p-4 pb-[max(14px,env(safe-area-inset-bottom))] border-t border-slate-100 dark:border-white/10 bg-slate-50/90 dark:bg-[#0b0e1b] shrink-0 space-y-1.5 min-[360px]:space-y-2 shadow-[0_-10px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_-10px_20px_rgba(0,0,0,0.4)]">
          <MemberLoginButton variant="drawer" onClick={onClose} label="Member Portal Login" />
          <p className="text-[9.5px] min-[360px]:text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium">
            Kingdom of Christ Ministries • Faith, Love & Miracles
          </p>
        </div>

      </aside>
    </div>
  );

  return createPortal(drawerContent, document.body);
});

export default MobileDrawer;
