"use client";
import React, { memo } from "react";
import Link from "next/link";
import { Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
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
 * MobileDrawer — High-performance, fully responsive Mobile Navigation Drawer.
 * 
 * Senior UI/UX Specifications:
 * - Dynamic Viewport Height containment (100dvh) with overscroll protection.
 * - Smooth touch-optimized scrolling with generous bottom padding.
 * - Side-by-side dock layout for Preferences & Socials to minimize vertical bulk.
 * - Prominent, high-contrast Member Portal CTA button that is 100% visible.
 * - Tap-outside backdrop blur dismiss layer.
 */
const MobileDrawer = memo(function MobileDrawer({
  isOpen,
  onClose,
  navItems,
  activeSection,
  pathname,
  resolveHref,
}: MobileDrawerProps) {
  if (!isOpen) return null;

  const socialLinks = [
    {
      icon: Youtube,
      href: "https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO",
      label: "YouTube",
      bg: "bg-[#FF0000]",
    },
  ];

  return (
    <>
      {/* Backdrop blur overlay for outside clicks */}
      <div
        className="fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs z-[-1] transition-opacity duration-200 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        id="mobile-menu"
        className={cn(
          "lg:hidden mt-2 mb-3 p-3 sm:p-4",
          "bg-white/95 dark:bg-slate-900/95",
          "backdrop-blur-3xl",
          "rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]",
          "border border-white/80 dark:border-white/15",
          // Senior UI/UX Height & Scroll Constraints
          "max-h-[calc(100dvh-4.5rem)] sm:max-h-[calc(100dvh-5.25rem)]",
          "overflow-y-auto overscroll-contain",
          "scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-900 scrollbar-track-transparent",
          "flex flex-col gap-2.5",
          "animate-scale-in"
        )}
      >
        {/* Nav links */}
        <nav aria-label="Mobile navigation" className="space-y-1">
          <ul className="space-y-1" role="list">
            {navItems.map((item) => {
              const isActive = item.href.startsWith("/")
                ? pathname === item.href || pathname.startsWith(item.href + "/")
                : activeSection === item.href.replace("#", "");
              const styles = NAV_STYLES[item.href] ?? NAV_STYLES["#home"];
              const Icon = item.icon;

              return (
                <li key={item.href} role="listitem">
                  <Link
                    href={resolveHref(item.href)}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "apple-liquid-glass-btn group relative flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-2xl",
                      "text-[13.5px] sm:text-sm font-extrabold transition-all duration-200 select-none",
                      "min-h-[44px] sm:min-h-[48px] overflow-hidden",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isActive
                        ? cn(
                            "bg-white/95 dark:bg-slate-900/90",
                            styles.activeText,
                            styles.activeBg,
                            styles.liquidBorderGlow,
                            "border shadow-md font-black"
                          )
                        : cn(
                            "bg-white/60 dark:bg-white/[0.05]",
                            "text-slate-800 dark:text-white",
                            "border border-slate-200/60 dark:border-white/10",
                            "hover:bg-white/90 dark:hover:bg-white/[0.12]",
                            "active:scale-[0.99]"
                          )
                    )}
                  >
                    {/* Morphing Liquid Fluid Blob Background */}
                    <div
                      className={cn(
                        "absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl bg-gradient-to-r animate-liquid-blob pointer-events-none",
                        styles.liquidBlobGradient,
                        isActive && "opacity-80"
                      )}
                    />

                    {/* Left content: Icon Capsule + Title */}
                    <div className="relative z-10 flex items-center gap-3">
                      {item.emoji ? (
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0",
                            "bg-white/90 dark:bg-white/[0.12] backdrop-blur-md",
                            "border border-white/80 dark:border-white/20 shadow-xs",
                            "transition-transform duration-200 group-hover:scale-105",
                            styles.iconBg
                          )}
                        >
                          <span role="img" aria-hidden="true">
                            {item.emoji}
                          </span>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                            "bg-white/90 dark:bg-white/[0.12] backdrop-blur-md",
                            "border border-white/80 dark:border-white/20 shadow-xs",
                            "transition-transform duration-200 group-hover:scale-105",
                            styles.iconBg
                          )}
                        >
                          {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
                        </div>
                      )}

                      <span className="tracking-wide font-extrabold">{item.name}</span>
                    </div>

                    {/* Right Content: Active Liquid Indicator Capsule */}
                    {isActive && (
                      <div className="relative z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/80 dark:bg-white/20 backdrop-blur-md border border-white/60 dark:border-white/20 shadow-xs">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full animate-ping",
                            styles.activeIndicator
                          )}
                        />
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full absolute",
                            styles.activeIndicator
                          )}
                        />
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer section inside drawer */}
        <div className="mt-1 pt-2.5 border-t border-slate-200/80 dark:border-white/10 space-y-2.5 shrink-0 pb-1">
          {/* Dual Pill Controls: Preferences & Social */}
          <div className="grid grid-cols-2 gap-2">
            {/* Preferences Control */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/10 flex flex-col justify-between gap-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-purple-300/80">
                Preferences
              </span>
              <div className="flex items-center gap-1">
                <LanguageToggle />
                <ThemeToggle />
                <PaletteToggle />
              </div>
            </div>

            {/* Social Follow */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/10 flex flex-col justify-between gap-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-purple-300/80">
                Follow Us
              </span>
              <div className="flex items-center gap-1.5">
                {socialLinks.map(({ icon: Icon, href, label, bg }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={cn(
                      "w-8 h-8 rounded-xl text-white flex items-center justify-center",
                      "shadow-sm transition-all duration-200 hover:scale-105 active:scale-95",
                      "border border-white/40 dark:border-white/20",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      bg
                    )}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Member Login CTA Button */}
          <div className="pt-0.5">
            <MemberLoginButton variant="drawer" onClick={onClose} label="Member Portal Login" />
          </div>
        </div>
      </div>
    </>
  );
});

export default MobileDrawer;
