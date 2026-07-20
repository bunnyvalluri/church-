"use client";
import React, { memo } from "react";
import Link from "next/link";
import { Youtube, Instagram } from "lucide-react";
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
 * Reverted to the original, clean, no-icon dropdown card with Instagram integration.
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
      icon: Instagram,
      href: "https://instagram.com",
      label: "Instagram",
      bg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
    },
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
        "sm:hidden mt-2 mb-3 p-4",
        "bg-white/98 dark:bg-gray-950/98 backdrop-blur-2xl",
        "rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10",
        "animate-scale-in"
      )}
    >
      {/* Nav links */}
      <nav aria-label="Mobile navigation" className="space-y-1">
        <ul className="space-y-0.5" role="list">
          {navItems.map((item) => {
            const isActive = item.href.startsWith("/")
              ? pathname === item.href || pathname.startsWith(item.href + "/")
              : activeSection === item.href.replace("#", "");
            const styles = NAV_STYLES[item.href] ?? NAV_STYLES["#home"];

            return (
              <li key={item.href} role="listitem">
                <Link
                  href={resolveHref(item.href)}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl",
                    "text-[14px] font-bold transition-all",
                    "border-l-[3px]",
                    "min-h-[44px]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? cn(
                          styles.activeBg,
                          styles.activeText,
                          styles.mobileActiveBorder
                        )
                      : cn(
                          "text-gray-600 dark:text-gray-400",
                          "border-l-transparent",
                          "hover:bg-gray-50 dark:hover:bg-white/5",
                          styles.hoverText,
                          styles.hoverBg
                        )
                  )}
                >
                  {item.emoji && (
                    <span className="text-base flex-shrink-0" role="img" aria-hidden="true">
                      {item.emoji}
                    </span>
                  )}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Preferences section */}
      <div className="mt-4 pt-4 border-t border-gray-200/70 dark:border-white/10 space-y-3">
        {/* Toggles row */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
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
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mr-2">
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
                  "shadow-sm transition-all hover:scale-110 active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  bg
                )}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
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
