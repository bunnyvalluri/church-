"use client";

import React, { useState } from "react";
import { 
  Menu, 
  Search, 
  Bell, 
  Globe, 
  User, 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles,
  Command
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";
import { useNotifications } from "@/hooks/useNotifications";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import GlobalSearch from "@/components/admin/GlobalSearch";
import NotificationCenter from "@/components/admin/NotificationCenter";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
}

export default function AdminHeader({ onToggleMobileSidebar }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const t = adminTranslations[language || "en"] as any;
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchPlaceholderText = t?.common?.searchPlaceholder || "Search resources, members...";

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-[#0D0E1A]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 px-2.5 sm:px-4 lg:px-6 flex items-center justify-between transition-colors shadow-sm min-w-0">
        {/* ── Left Section: Mobile Menu Trigger & Search Trigger ── */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink-0">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors shrink-0"
            aria-label="Open Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search Bar / Trigger — Mobile Icon Button (< sm) */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
            aria-label="Search"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Quick Search Bar / Trigger — Desktop Bar (>= sm) */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/10 transition-all text-xs sm:w-48 md:w-80 group shadow-inner dark:shadow-none shrink-0"
          >
            <Search className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
            <span className="flex-1 text-left truncate">{searchPlaceholderText}</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-[#070812] border border-gray-200 dark:border-white/10 rounded-md text-gray-400 shadow-sm shrink-0">
              <Command className="w-3 h-3" /> K
            </kbd>
          </button>
        </div>

        {/* ── Right Section: Actions & Profile ── */}
        <div className="flex items-center gap-1 min-[375px]:gap-1.5 sm:gap-3 shrink-0">
          {/* Notifications Button */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Center Dropdown */}
            <NotificationCenter
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
            />
          </div>

          {/* Language Switcher */}
          <LanguageToggle />

          {/* Theme Toggle */}
          <ThemeToggle />

          <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-0.5 hidden sm:block" />

          {/* Admin User Profile Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 hover:bg-gray-200/80 dark:hover:bg-white/10 transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[110px]">
                  {user?.name || "Admin"}
                </span>
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {user?.role || "SUPER_ADMIN"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-transform" />
            </button>

            {/* Profile Menu Dropdown */}
            {isProfileOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0F1021] border border-gray-200 dark:border-white/15 shadow-2xl p-2 z-50 animate-scale-in text-slate-900 dark:text-white"
                onClick={() => setIsProfileOpen(false)}
              >
                <div className="px-3 py-2 border-b border-gray-100 dark:border-white/10 mb-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {user?.name || "Administrator"}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || "admin@kcmchurch.org"}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-md">
                    {user?.role || "SUPER_ADMIN"} Access
                  </span>
                </div>

                <div className="space-y-0.5">
                  <a
                    href="/admin/settings"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Account & Security</span>
                  </a>
                </div>

                <div className="border-t border-gray-100 dark:border-white/10 my-1 pt-1">
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <GlobalSearch
          onNavigate={(viewPath) => {
            setIsSearchOpen(false);
            if (viewPath) router.push(viewPath);
          }}
        />
      )}
    </>
  );
}
