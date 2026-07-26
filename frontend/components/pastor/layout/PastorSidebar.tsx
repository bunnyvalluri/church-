"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";
import { 
  Layers, 
  Play, 
  IndianRupee, 
  Users, 
  Heart, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  UserCheck, 
  ImageIcon, 
  Activity, 
  TrendingUp, 
  FileText, 
  Settings, 
  ShieldCheck, 
  Bell, 
  ChevronDown, 
  LogOut, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PastorSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function PastorSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose
}: PastorSidebarProps) {
  const pathname = usePathname() || "/pastor/dashboard";
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  // Collapsible section state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    MAIN: true,
    MINISTRY: true,
    NGO: true,
    REPORTS: true,
    MEDIA: true,
    SETTINGS: true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const navGroups = [
    {
      group: t.groupMain,
      items: [
        { name: t.navDashboard, href: "/pastor/dashboard", icon: Layers },
        { name: t.navSermons, href: "/pastor/main/sermons", icon: Play },
        { name: t.navDonations, href: "/pastor/main/donations", icon: IndianRupee },
        { name: t.navMemberRequests, href: "/pastor/main/member-requests", icon: Users },
        { name: t.navPrayerRequests, href: "/pastor/main/prayer-requests", icon: Heart },
        { name: t.navEvents, href: "/pastor/main/events", icon: Calendar },
        { name: t.navMessages, href: "/pastor/main/messages", icon: MessageSquare }
      ]
    },
    {
      group: t.groupMinistry,
      items: [
        { name: t.navBibleStudy, href: "/pastor/ministry/bible-study-groups", icon: BookOpen },
        { name: t.navSmallGroups, href: "/pastor/ministry/small-groups", icon: Users },
        { name: t.navVolunteers, href: "/pastor/ministry/volunteers", icon: UserCheck }
      ]
    },
    {
      group: t.groupNgo,
      items: [
        { name: t.navNgoProjects, href: "/pastor/ngo/projects", icon: Heart },
        { name: t.navNgoMedia, href: "/pastor/ngo/media", icon: ImageIcon },
        { name: t.navNgoVolunteers, href: "/pastor/ngo/volunteers", icon: Users }
      ]
    },
    {
      group: t.groupReports,
      items: [
        { name: t.navAttendanceReports, href: "/pastor/reports/attendance", icon: Activity },
        { name: t.navMemberReports, href: "/pastor/reports/members", icon: Users },
        { name: t.navFinanceReports, href: "/pastor/reports/finance", icon: IndianRupee },
        { name: t.navGrowthReports, href: "/pastor/reports/growth", icon: TrendingUp }
      ]
    },
    {
      group: t.groupMedia,
      items: [
        { name: t.navCalendar, href: "/pastor/calendar", icon: Calendar },
        { name: t.navPhotoGallery, href: "/pastor/media/gallery", icon: ImageIcon },
        { name: t.navVideoArchives, href: "/pastor/media/videos", icon: Play },
        { name: t.navDocumentLibrary, href: "/pastor/media/documents", icon: FileText }
      ]
    },
    {
      group: t.groupSettings,
      items: [
        { name: t.navProfile, href: "/pastor/profile", icon: UserCheck },
        { name: t.navGeneralSettings, href: "/pastor/settings/general", icon: Settings },
        { name: t.navSecurity, href: "/pastor/settings/security", icon: ShieldCheck },
        { name: t.navNotifications, href: "/pastor/settings/notifications", icon: Bell },
        { name: t.navPreferences, href: "/pastor/settings/preferences", icon: Settings }
      ]
    }
  ];

  const renderContent = (onLinkClick?: () => void) => (
    <div className="flex flex-col h-full bg-white/95 dark:bg-[#070814]/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-white/[0.04] transition-all duration-300">
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-slate-200/50 dark:border-white/[0.04] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700/50 shadow-sm bg-white shrink-0">
            <Image
              src="/logo.png"
              alt="KCM Logo"
              fill
              sizes="36px"
              className="object-cover rounded-xl"
              priority
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight leading-tight truncate">
                Kingdom of Christ
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold tracking-wider uppercase">
                Pastor Portal
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button for Desktop */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 custom-scrollbar">
        {navGroups.map((grp) => {
          const isOpen = openSections[grp.group] ?? true;

          return (
            <div key={grp.group} className="space-y-1">
              {!isCollapsed && (
                <div
                  onClick={() => toggleSection(grp.group)}
                  className="flex items-center justify-between px-3 mb-1.5 cursor-pointer text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 transition-colors"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {grp.group}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </div>
              )}

              <AnimatePresence initial={false}>
                {(isOpen || isCollapsed) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {grp.items.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/pastor/dashboard" && pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onLinkClick}
                          title={isCollapsed ? item.name : undefined}
                          className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all relative group ${
                            isActive
                              ? "bg-indigo-500/10 dark:bg-indigo-500/15 text-[#6366F1] dark:text-indigo-400 font-black shadow-sm"
                              : "hover:bg-slate-100/70 dark:hover:bg-white/5 text-slate-650 dark:text-gray-400 hover:text-[#6366F1] dark:hover:text-white"
                          }`}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-[#6366F1] dark:bg-indigo-400 rounded-r-full" />
                          )}
                          <item.icon
                            className={`w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                              isActive ? "text-[#6366F1] dark:text-indigo-400" : ""
                            }`}
                          />
                          {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer Profile Card */}
      <div className="p-3.5 border-t border-slate-200/50 dark:border-white/[0.04] bg-slate-50/50 dark:bg-[#0A0B16]/50 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          <div className="w-9 h-9 rounded-xl border border-slate-200/60 dark:border-white/10 overflow-hidden relative shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs">
            {user?.name ? user.name.charAt(0) : "P"}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.name || "Bishop K. Kristhu Raju"}
              </h4>
              <p className="text-[9.5px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider truncate">
                Senior Pastor
              </p>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            type="button"
            onClick={logout}
            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-white/5 transition-colors shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-300 z-30 shrink-0 ${
          isCollapsed ? "w-[88px]" : "w-[280px]"
        }`}
      >
        {renderContent()}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-[280px] z-50 lg:hidden shadow-2xl"
            >
              {renderContent(onMobileClose)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
