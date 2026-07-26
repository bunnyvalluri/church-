"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  Sparkles, 
  CheckCircle, 
  X, 
  Play, 
  Calendar, 
  Megaphone, 
  Heart, 
  UserPlus, 
  Mail, 
  TrendingUp, 
  Info,
  LogOut,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import PastorBreadcrumbs from "./PastorBreadcrumbs";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

interface PastorHeaderProps {
  onToggleMobileSidebar: () => void;
}

export default function PastorHeader({ onToggleMobileSidebar }: PastorHeaderProps) {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Notifications mock state
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New Prayer Request",
      content: "Sister Mary requested prayers for healing.",
      type: "PRAYER_REQUEST",
      isRead: false,
      time: "10m ago"
    },
    {
      id: "2",
      title: "New Sunday Donation",
      content: "Brother David contributed ₹5,000 to building fund.",
      type: "DONATION",
      isRead: false,
      time: "1h ago"
    },
    {
      id: "3",
      title: "New Member Registration",
      content: "John Doe submitted membership application.",
      type: "NEW_MEMBER",
      isRead: false,
      time: "2h ago"
    }
  ]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setIsQuickCreateOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "DONATION":
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case "PRAYER_REQUEST":
        return <Heart className="w-4 h-4 text-rose-500" />;
      case "NEW_MEMBER":
        return <UserPlus className="w-4 h-4 text-indigo-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 shrink-0 h-16 sm:h-20 bg-white/90 dark:bg-[#070814]/90 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/[0.06] px-3.5 sm:px-8 flex items-center justify-between transition-all duration-300">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-600 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/[0.08] rounded-xl transition-all shrink-0 active:scale-95"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="md:hidden text-xs font-black text-slate-900 dark:text-white tracking-tight truncate">
          {t.pastorPortal}
        </span>

        <PastorBreadcrumbs />
      </div>

      {/* Right: Search, Notifications, Theme, Language, Quick Create & Profile */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Global Search Input */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all"
          />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-9 h-9 flex items-center justify-center bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-slate-600 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#6366F1] text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white dark:border-[#070814] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute -right-12 sm:right-0 mt-2.5 w-80 sm:w-96 bg-white/95 dark:bg-[#0E0F24]/95 backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-[#0A0B16]/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] text-indigo-600 font-extrabold">({unreadCount} new)</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.03] custom-scrollbar">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 flex items-start gap-3 transition-colors ${
                        !n.isRead ? "bg-indigo-50/20 dark:bg-indigo-500/5" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center shrink-0">
                        {getNotifIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{n.title}</h4>
                          <span className="text-[9px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 leading-snug">{n.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <div className="shrink-0">
          <ThemeToggle />
        </div>

        {/* Language Switcher */}
        <div className="shrink-0">
          <LanguageToggle />
        </div>

        {/* Quick Create Dropdown */}
        <div className="relative" ref={quickRef}>
          <button
            type="button"
            onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
            className="w-9 h-9 sm:w-auto sm:h-auto sm:py-2.5 sm:px-4 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053E4] hover:to-[#7C3AED] text-white rounded-full font-black text-xs flex items-center justify-center sm:gap-1.5 shadow-md shadow-indigo-500/15 transition-all border border-white/10 active:scale-95"
          >
            <Plus className={`w-4 h-4 transition-transform duration-200 ${isQuickCreateOpen ? "rotate-45" : ""}`} />
            <span className="hidden sm:inline">New</span>
          </button>

          <AnimatePresence>
            {isQuickCreateOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2.5 w-56 bg-white/95 dark:bg-[#0E0F24]/95 backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
              >
                <div className="px-4 py-1.5 border-b border-slate-100 dark:border-white/[0.03] mb-1">
                  <span className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block">
                    Quick Create
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-gray-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 font-bold flex items-center gap-2.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-indigo-500" /> New Sermon Upload
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-gray-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 font-bold flex items-center gap-2.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Schedule Event
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-gray-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 font-bold flex items-center gap-2.5 transition-colors"
                >
                  <Megaphone className="w-3.5 h-3.5 text-indigo-500" /> Announcement
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-white/10 overflow-hidden relative shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center hover:opacity-90 transition-opacity"
            title="Profile Menu"
          >
            {user?.name ? user.name.charAt(0) : "P"}
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2.5 w-60 bg-white/95 dark:bg-[#0E0F24]/95 backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.04]">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {user?.name || "Bishop K. Kristhu Raju"}
                  </p>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block mt-0.5">
                    Senior Pastor
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold flex items-center gap-2 transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" /> Log Out Workspace
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
