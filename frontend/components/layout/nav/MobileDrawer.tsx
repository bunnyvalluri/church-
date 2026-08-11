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
 * MobileDrawer — Mobile Dropdown Menu (width < 541px)
 * Reverted to the original, clean, no-icon dropdown card.
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
    <div
      id="mobile-menu"
      className={cn(
        "lg:hidden mt-2 mb-3 p-3.5 pb-safe",
        "bg-white/90 dark:bg-slate-900/90",
        "backdrop-blur-3xl",
        "rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]",
        "border border-white/60 dark:border-white/15",
        "animate-scale-in"
      )}
    >
      {/* Nav links */}
      <nav aria-label="Mobile navigation" className="space-y-2">
        <ul className="space-y-1.5" role="list">
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
                    "apple-liquid-glass-btn group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl",
                    "text-[14px] font-extrabold transition-all duration-300 select-none",
                    "min-h-[50px] overflow-hidden",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? cn(
                          "bg-white/95 dark:bg-slate-900/90",
                          styles.activeText,
                          styles.activeBg,
                          styles.liquidBorderGlow,
                          "border shadow-lg font-black"
                        )
                      : cn(
                          "bg-white/60 dark:bg-white/[0.06]",
                          "text-gray-900 dark:text-white",
                          "border border-white/60 dark:border-white/10",
                          "hover:bg-white/80 dark:hover:bg-white/[0.12] hover:text-white",
                          "hover:scale-[1.015] active:scale-[0.98]"
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

                  {/* Left content: Liquid Glass Icon Capsule + Title */}
                  <div className="relative z-10 flex items-center gap-3.5">
                    {item.emoji ? (
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0",
                          "bg-white/90 dark:bg-white/[0.12] backdrop-blur-md",
                          "border border-white/70 dark:border-white/20 shadow-sm",
                          "transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
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
                          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                          "bg-white/90 dark:bg-white/[0.12] backdrop-blur-md",
                          "border border-white/70 dark:border-white/20 shadow-sm",
                          "transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
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
                    <div className="relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 dark:bg-white/20 backdrop-blur-md border border-white/60 dark:border-white/20 shadow-sm">
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

      {/* Preferences section */}
      <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-white/10 space-y-3">
        {/* Toggles row */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400 dark:text-violet-300">
            Preferences
          </span>
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle />
            <PaletteToggle />
          </div>
        </div>

        {/* Social */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400 dark:text-violet-300 mr-2">
            Follow
          </span>
          <div className="flex items-center gap-2">
            {socialLinks.map(({ icon: Icon, href, label, bg }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={cn(
                  "w-9 h-9 rounded-full text-white flex items-center justify-center",
                  "shadow-md transition-all duration-300 hover:scale-110 active:scale-95",
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

        {/* Login CTA */}
        <div className="pt-1">
          <MemberLoginButton variant="drawer" onClick={onClose} />
        </div>
      </div>
    </div>
  );
});

export default MobileDrawer;
