"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";
import LanguageToggle from "@/components/LanguageToggle";
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
        { name: t.navDashboard, href: "/pastor/dashboard", icon: Layers, iconColor: "text-indigo-500", activeBg: "bg-indigo-500/10 dark:bg-indigo-500/20", activeText: "text-indigo-600 dark:text-indigo-400", activeBar: "bg-indigo-500" },
        { name: t.navSermons, href: "/pastor/main/sermons", icon: Play, iconColor: "text-violet-500", activeBg: "bg-violet-500/10 dark:bg-violet-500/20", activeText: "text-violet-600 dark:text-violet-400", activeBar: "bg-violet-500" },
        { name: t.navDonations, href: "/pastor/main/donations", icon: IndianRupee, iconColor: "text-emerald-500", activeBg: "bg-emerald-500/10 dark:bg-emerald-500/20", activeText: "text-emerald-600 dark:text-emerald-400", activeBar: "bg-emerald-500" },
        { name: t.navMemberRequests, href: "/pastor/main/member-requests", icon: Users, iconColor: "text-sky-500", activeBg: "bg-sky-500/10 dark:bg-sky-500/20", activeText: "text-sky-600 dark:text-sky-400", activeBar: "bg-sky-500" },
        { name: t.navPrayerRequests, href: "/pastor/main/prayer-requests", icon: Heart, iconColor: "text-rose-500", activeBg: "bg-rose-500/10 dark:bg-rose-500/20", activeText: "text-rose-600 dark:text-rose-400", activeBar: "bg-rose-500" },
        { name: t.navEvents, href: "/pastor/main/events", icon: Calendar, iconColor: "text-amber-500", activeBg: "bg-amber-500/10 dark:bg-amber-500/20", activeText: "text-amber-600 dark:text-amber-400", activeBar: "bg-amber-500" },
        { name: t.navMessages, href: "/pastor/main/messages", icon: MessageSquare, iconColor: "text-purple-500", activeBg: "bg-purple-500/10 dark:bg-purple-500/20", activeText: "text-purple-600 dark:text-purple-400", activeBar: "bg-purple-500" }
      ]
    },
    {
      group: t.groupMinistry,
      items: [
        { name: t.navBibleStudy, href: "/pastor/ministry/bible-study-groups", icon: BookOpen, iconColor: "text-cyan-500", activeBg: "bg-cyan-500/10 dark:bg-cyan-500/20", activeText: "text-cyan-600 dark:text-cyan-400", activeBar: "bg-cyan-500" },
        { name: t.navSmallGroups, href: "/pastor/ministry/small-groups", icon: Users, iconColor: "text-teal-500", activeBg: "bg-teal-500/10 dark:bg-teal-500/20", activeText: "text-teal-600 dark:text-teal-400", activeBar: "bg-teal-500" },
        { name: t.navVolunteers, href: "/pastor/ministry/volunteers", icon: UserCheck, iconColor: "text-blue-500", activeBg: "bg-blue-500/10 dark:bg-blue-500/20", activeText: "text-blue-600 dark:text-blue-400", activeBar: "bg-blue-500" }
      ]
    },
    {
      group: t.groupNgo,
      items: [
        { name: t.navNgoProjects, href: "/pastor/ngo/projects", icon: Heart, iconColor: "text-fuchsia-500", activeBg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20", activeText: "text-fuchsia-600 dark:text-fuchsia-400", activeBar: "bg-fuchsia-500" },
        { name: t.navNgoMedia, href: "/pastor/ngo/media", icon: ImageIcon, iconColor: "text-pink-500", activeBg: "bg-pink-500/10 dark:bg-pink-500/20", activeText: "text-pink-600 dark:text-pink-400", activeBar: "bg-pink-500" },
        { name: t.navNgoVolunteers, href: "/pastor/ngo/volunteers", icon: Users, iconColor: "text-lime-500", activeBg: "bg-lime-500/10 dark:bg-lime-500/20", activeText: "text-lime-600 dark:text-lime-400", activeBar: "bg-lime-500" }
      ]
    },
    {
      group: t.groupReports,
      items: [
        { name: t.navAttendanceReports, href: "/pastor/reports/attendance", icon: Activity, iconColor: "text-emerald-400", activeBg: "bg-emerald-400/10 dark:bg-emerald-400/20", activeText: "text-emerald-500 dark:text-emerald-300", activeBar: "bg-emerald-400" },
        { name: t.navMemberReports, href: "/pastor/reports/members", icon: Users, iconColor: "text-orange-500", activeBg: "bg-orange-500/10 dark:bg-orange-500/20", activeText: "text-orange-600 dark:text-orange-400", activeBar: "bg-orange-500" },
        { name: t.navFinanceReports, href: "/pastor/reports/finance", icon: IndianRupee, iconColor: "text-green-500", activeBg: "bg-green-500/10 dark:bg-green-500/20", activeText: "text-green-600 dark:text-green-400", activeBar: "bg-green-500" },
        { name: t.navGrowthReports, href: "/pastor/reports/growth", icon: TrendingUp, iconColor: "text-yellow-500", activeBg: "bg-yellow-500/10 dark:bg-yellow-500/20", activeText: "text-yellow-600 dark:text-yellow-400", activeBar: "bg-yellow-500" }
      ]
    },
    {
      group: t.groupMedia,
      items: [
        { name: t.navCalendar, href: "/pastor/calendar", icon: Calendar, iconColor: "text-indigo-400", activeBg: "bg-indigo-400/10 dark:bg-indigo-400/20", activeText: "text-indigo-500 dark:text-indigo-300", activeBar: "bg-indigo-400" },
        { name: t.navPhotoGallery, href: "/pastor/media/gallery", icon: ImageIcon, iconColor: "text-purple-400", activeBg: "bg-purple-400/10 dark:bg-purple-400/20", activeText: "text-purple-500 dark:text-purple-300", activeBar: "bg-purple-400" },
        { name: t.navVideoArchives, href: "/pastor/media/videos", icon: Play, iconColor: "text-rose-400", activeBg: "bg-rose-400/10 dark:bg-rose-400/20", activeText: "text-rose-500 dark:text-rose-300", activeBar: "bg-rose-400" },
        { name: t.navDocumentLibrary, href: "/pastor/media/documents", icon: FileText, iconColor: "text-sky-400", activeBg: "bg-sky-400/10 dark:bg-sky-400/20", activeText: "text-sky-500 dark:text-sky-300", activeBar: "bg-sky-400" }
      ]
    },
    {
      group: t.groupSettings,
      items: [
        { name: t.navProfile, href: "/pastor/profile", icon: UserCheck, iconColor: "text-cyan-400", activeBg: "bg-cyan-400/10 dark:bg-cyan-400/20", activeText: "text-cyan-500 dark:text-cyan-300", activeBar: "bg-cyan-400" },
        { name: t.navGeneralSettings, href: "/pastor/settings/general", icon: Settings, iconColor: "text-amber-400", activeBg: "bg-amber-400/10 dark:bg-amber-400/20", activeText: "text-amber-500 dark:text-amber-300", activeBar: "bg-amber-400" },
        { name: t.navSecurity, href: "/pastor/settings/security", icon: ShieldCheck, iconColor: "text-teal-400", activeBg: "bg-teal-400/10 dark:bg-teal-400/20", activeText: "text-teal-500 dark:text-teal-300", activeBar: "bg-teal-400" },
        { name: t.navNotifications, href: "/pastor/settings/notifications", icon: Bell, iconColor: "text-yellow-400", activeBg: "bg-yellow-400/10 dark:bg-yellow-400/20", activeText: "text-yellow-500 dark:text-yellow-300", activeBar: "bg-yellow-400" },
        { name: t.navPreferences, href: "/pastor/settings/preferences", icon: Settings, iconColor: "text-violet-400", activeBg: "bg-violet-400/10 dark:bg-violet-400/20", activeText: "text-violet-500 dark:text-violet-300", activeBar: "bg-violet-400" }
      ]
    }
  ];

  const renderContent = (onLinkClick?: () => void) => (
    <div className="flex flex-col h-full bg-white dark:bg-[#070814] border-r border-slate-200/50 dark:border-white/[0.04] transition-all duration-300 shadow-2xl">
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

        {/* Close Button for Mobile */}
        {onLinkClick && (
          <button
            type="button"
            onClick={onLinkClick}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
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
                              ? `${item.activeBg} ${item.activeText} font-black shadow-sm`
                              : "hover:bg-slate-100/70 dark:hover:bg-white/5 text-slate-650 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          {isActive && (
                            <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4 ${item.activeBar} rounded-r-full`} />
                          )}
                          <item.icon
                            className={`w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                              isActive ? item.activeText : item.iconColor
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

      {/* Footer Profile & Language Card */}
      <div className="p-3.5 pb-6 sm:pb-3.5 border-t border-slate-200/50 dark:border-white/[0.04] bg-slate-50/50 dark:bg-[#0A0B16]/50 flex flex-col gap-3 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Language</span>
            <LanguageToggle />
          </div>
        )}
        
        <div className="flex items-center justify-between gap-3">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-[280px] sm:w-[320px] z-[100] lg:hidden shadow-2xl"
            >
              {renderContent(onMobileClose)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
