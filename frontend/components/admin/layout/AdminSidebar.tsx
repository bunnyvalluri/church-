"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  UsersRound, 
  HeartHandshake, 
  FolderKanban, 
  DollarSign, 
  CreditCard, 
  Receipt, 
  BarChart3, 
  Landmark, 
  CalendarCheck, 
  FileSpreadsheet, 
  CalendarDays, 
  BarChart2, 
  Globe, 
  Video, 
  Radio, 
  Camera, 
  FileCode, 
  Building2, 
  HandHeart, 
  Film, 
  UserPlus, 
  Settings, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  LogOut,
  PanelLeftClose,
  PanelLeft,
  X,
  Cpu,
  MessageSquare
} from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: string;
  color: string;
  activeGradient: string;
  iconBg: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "Overview",
    items: [
      {
        name: "Executive Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        color: "text-indigo-500 dark:text-indigo-400",
        activeGradient: "from-indigo-600 via-indigo-700 to-purple-700",
        iconBg: "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400",
      },
      {
        name: "OpenClaw AI Orchestrator",
        href: "/admin/openclaw-orchestrator",
        icon: Cpu,
        badge: "AI 2.0",
        color: "text-purple-500 dark:text-purple-400",
        activeGradient: "from-purple-600 via-indigo-600 to-pink-600",
        iconBg: "bg-purple-500/10 text-purple-500 dark:text-purple-400",
      },
      {
        name: "SMS Delivery Engine",
        href: "/admin/notifications/sms",
        icon: MessageSquare,
        badge: "PROD",
        color: "text-blue-500 dark:text-blue-400",
        activeGradient: "from-blue-600 via-indigo-600 to-purple-600",
        iconBg: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
      },
    ],
  },
  {
    title: "Members",
    items: [
      {
        name: "Member Registry",
        href: "/admin/members",
        icon: Users,
        color: "text-emerald-500 dark:text-emerald-400",
        activeGradient: "from-emerald-600 to-teal-600",
        iconBg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
      },
      {
        name: "Member Groups",
        href: "/admin/members/groups",
        icon: UsersRound,
        color: "text-cyan-500 dark:text-cyan-400",
        activeGradient: "from-cyan-600 to-blue-600",
        iconBg: "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400",
      },
      {
        name: "Prayer Desk",
        href: "/admin/members/prayer-requests",
        icon: HeartHandshake,
        color: "text-rose-500 dark:text-rose-400",
        activeGradient: "from-rose-600 to-pink-600",
        iconBg: "bg-rose-500/10 text-rose-500 dark:text-rose-400",
      },
      {
        name: "Family Management",
        href: "/admin/members/family-management",
        icon: FolderKanban,
        color: "text-violet-500 dark:text-violet-400",
        activeGradient: "from-violet-600 to-purple-600",
        iconBg: "bg-violet-500/10 text-violet-500 dark:text-violet-400",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        name: "Financial Overview",
        href: "/admin/finance",
        icon: DollarSign,
        color: "text-amber-500 dark:text-amber-400",
        activeGradient: "from-amber-500 via-orange-600 to-amber-600",
        iconBg: "bg-amber-500/10 text-amber-500 dark:text-amber-400",
      },
      {
        name: "Donations Ledger",
        href: "/admin/finance/donations",
        icon: CreditCard,
        color: "text-green-500 dark:text-green-400",
        activeGradient: "from-green-600 to-emerald-600",
        iconBg: "bg-green-500/10 text-green-500 dark:text-green-400",
      },
      {
        name: "Pledges & Campaigns",
        href: "/admin/finance/pledges",
        icon: Receipt,
        color: "text-yellow-500 dark:text-yellow-400",
        activeGradient: "from-yellow-500 to-amber-600",
        iconBg: "bg-yellow-500/10 text-yellow-500 dark:text-yellow-400",
      },
      {
        name: "Transactions",
        href: "/admin/finance/transactions",
        icon: BarChart3,
        color: "text-lime-500 dark:text-lime-400",
        activeGradient: "from-lime-600 to-emerald-600",
        iconBg: "bg-lime-500/10 text-lime-500 dark:text-lime-400",
      },
      {
        name: "Bank Accounts",
        href: "/admin/finance/accounts",
        icon: Landmark,
        color: "text-blue-500 dark:text-blue-400",
        activeGradient: "from-blue-600 to-indigo-600",
        iconBg: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
      },
    ],
  },
  {
    title: "Attendance",
    items: [
      {
        name: "Attendance Hub",
        href: "/admin/attendance",
        icon: CalendarCheck,
        color: "text-sky-500 dark:text-sky-400",
        activeGradient: "from-sky-500 to-blue-600",
        iconBg: "bg-sky-500/10 text-sky-500 dark:text-sky-400",
      },
      {
        name: "Service Records",
        href: "/admin/attendance/records",
        icon: FileSpreadsheet,
        color: "text-indigo-500 dark:text-indigo-400",
        activeGradient: "from-indigo-600 to-sky-600",
        iconBg: "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400",
      },
      {
        name: "Event Attendance",
        href: "/admin/attendance/events",
        icon: CalendarDays,
        color: "text-purple-500 dark:text-purple-400",
        activeGradient: "from-purple-600 to-pink-600",
        iconBg: "bg-purple-500/10 text-purple-500 dark:text-purple-400",
      },
      {
        name: "Analytics & Reports",
        href: "/admin/attendance/reports",
        icon: BarChart2,
        color: "text-fuchsia-500 dark:text-fuchsia-400",
        activeGradient: "from-fuchsia-600 to-rose-600",
        iconBg: "bg-fuchsia-500/10 text-fuchsia-500 dark:text-fuchsia-400",
      },
    ],
  },
  {
    title: "Content & CMS",
    items: [
      {
        name: "CMS Dashboard",
        href: "/admin/content",
        icon: Globe,
        color: "text-pink-500 dark:text-pink-400",
        activeGradient: "from-pink-600 to-rose-600",
        iconBg: "bg-pink-500/10 text-pink-500 dark:text-pink-400",
      },
      {
        name: "Sermon Archive",
        href: "/admin/content/sermons",
        icon: Video,
        color: "text-red-500 dark:text-red-400",
        activeGradient: "from-red-600 to-rose-700",
        iconBg: "bg-red-500/10 text-red-500 dark:text-red-400",
      },
      {
        name: "Events Manager",
        href: "/admin/content/events",
        icon: CalendarDays,
        color: "text-orange-500 dark:text-orange-400",
        activeGradient: "from-orange-500 to-amber-600",
        iconBg: "bg-orange-500/10 text-orange-500 dark:text-orange-400",
      },
      {
        name: "Announcements",
        href: "/admin/content/announcements",
        icon: Radio,
        color: "text-emerald-500 dark:text-emerald-400",
        activeGradient: "from-emerald-500 to-teal-600",
        iconBg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
      },
      {
        name: "Media Library",
        href: "/admin/content/media",
        icon: Camera,
        color: "text-teal-500 dark:text-teal-400",
        activeGradient: "from-teal-500 to-cyan-600",
        iconBg: "bg-teal-500/10 text-teal-500 dark:text-teal-400",
      },
      {
        name: "Public Page CMS",
        href: "/admin/content/pages",
        icon: FileCode,
        color: "text-cyan-500 dark:text-cyan-400",
        activeGradient: "from-cyan-600 to-blue-600",
        iconBg: "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400",
      },
    ],
  },
  {
    title: "NGO & Outreach",
    items: [
      {
        name: "NGO Overview",
        href: "/admin/ngo",
        icon: Building2,
        color: "text-emerald-600 dark:text-emerald-400",
        activeGradient: "from-emerald-600 to-green-600",
        iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      },
      {
        name: "Outreach Projects",
        href: "/admin/ngo/projects",
        icon: HandHeart,
        color: "text-rose-500 dark:text-rose-400",
        activeGradient: "from-rose-500 to-pink-600",
        iconBg: "bg-rose-500/10 text-rose-500 dark:text-rose-400",
      },
      {
        name: "Field Media",
        href: "/admin/ngo/media",
        icon: Film,
        color: "text-amber-500 dark:text-amber-400",
        activeGradient: "from-amber-500 to-orange-600",
        iconBg: "bg-amber-500/10 text-amber-500 dark:text-amber-400",
      },
      {
        name: "Volunteer Roster",
        href: "/admin/ngo/volunteers",
        icon: UserPlus,
        color: "text-blue-500 dark:text-blue-400",
        activeGradient: "from-blue-600 to-indigo-600",
        iconBg: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
      },
    ],
  },
  {
    title: "AI & Skill Orchestration",
    items: [
      {
        name: "OpenClaw Orchestrator",
        href: "/admin/openclaw-orchestrator",
        icon: Cpu,
        badge: "PROD",
        color: "text-purple-500 dark:text-purple-400",
        activeGradient: "from-indigo-600 via-purple-600 to-pink-600",
        iconBg: "bg-purple-500/10 text-purple-500 dark:text-purple-400",
      },
    ],
  },
  {
    title: "Settings & Security",
    items: [
      {
        name: "Settings Overview",
        href: "/admin/settings",
        icon: Settings,
        color: "text-slate-500 dark:text-gray-400",
        activeGradient: "from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800",
        iconBg: "bg-slate-500/10 text-slate-600 dark:text-gray-300",
      },
      {
        name: "General Config",
        href: "/admin/settings/general",
        icon: Globe,
        color: "text-cyan-500 dark:text-cyan-400",
        activeGradient: "from-cyan-600 to-teal-600",
        iconBg: "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400",
      },
      {
        name: "User Directory",
        href: "/admin/settings/users",
        icon: Users,
        roles: ["SUPER_ADMIN", "ADMIN"],
        color: "text-indigo-500 dark:text-indigo-400",
        activeGradient: "from-indigo-600 to-violet-600",
        iconBg: "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400",
      },
      {
        name: "Roles & Access",
        href: "/admin/settings/roles",
        icon: ShieldCheck,
        roles: ["SUPER_ADMIN"],
        color: "text-purple-500 dark:text-purple-400",
        activeGradient: "from-purple-600 to-fuchsia-600",
        iconBg: "bg-purple-500/10 text-purple-500 dark:text-purple-400",
      },
      {
        name: "Permissions Matrix",
        href: "/admin/settings/permissions",
        icon: KeyRound,
        roles: ["SUPER_ADMIN"],
        color: "text-yellow-500 dark:text-yellow-400",
        activeGradient: "from-yellow-600 to-amber-600",
        iconBg: "bg-yellow-500/10 text-yellow-500 dark:text-yellow-400",
      },
      {
        name: "Security & Audit",
        href: "/admin/settings/security",
        icon: Lock,
        roles: ["SUPER_ADMIN"],
        color: "text-red-500 dark:text-red-400",
        activeGradient: "from-red-600 to-rose-600",
        iconBg: "bg-red-500/10 text-red-500 dark:text-red-400",
      },
    ],
  },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname() || "/admin/dashboard";
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const t = adminTranslations[language || "en"] as any;
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const userRole = user?.role || "ADMIN";

  const toggleGroup = (groupTitle: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  // Filter menu items by search & user role permissions + translate category & item names
  const filteredGroups = useMemo(() => {
    const sidebarDict = t?.sidebar || {};
    const catDict = sidebarDict.categories || {};
    const itemDict = sidebarDict.items || {};

    return menuGroups.map((group) => {
      const translatedTitle = catDict[group.title] || group.title;
      const allowedItems = group.items
        .filter((item) => {
          if (item.roles && !item.roles.includes(userRole)) {
            return false;
          }
          if (!searchQuery.trim()) return true;
          const translatedName = itemDict[item.name] || item.name;
          return (
            translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            translatedTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })
        .map((item) => ({
          ...item,
          name: itemDict[item.name] || item.name,
        }));

      return {
        ...group,
        title: translatedTitle,
        items: allowedItems,
      };
    }).filter((group) => group.items.length > 0);
  }, [searchQuery, userRole, t]);

  const bestMatchHref = useMemo(() => {
    const allHrefs = menuGroups.flatMap((g) => g.items.map((i) => i.href));
    const matches = allHrefs.filter(
      (href) => pathname === href || pathname.startsWith(href + "/")
    );
    return matches.sort((a, b) => b.length - a.length)[0] || "";
  }, [pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B0C16] text-slate-700 dark:text-gray-300 border-r border-slate-200 dark:border-white/10 select-none transition-colors">
      {/* ── Brand Header ── */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-white/10 flex-shrink-0 bg-slate-50/80 dark:bg-[#0F1021]/80 transition-colors">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <div className="relative w-full h-full rounded-[10px] bg-slate-950 overflow-hidden">
              <Image
                src="/logo.png"
                alt="Kingdom of Christ Ministries Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-extrabold text-sm tracking-wider text-slate-900 dark:text-white truncate">
                KCM CHURCH
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Enterprise Portal
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onMobileClose}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Search Input (hidden when collapsed on desktop) ── */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-200 dark:border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t?.sidebar?.searchPlaceholder || "Search menu items..."}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Navigation Items List ── */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-3 space-y-6">
        {filteredGroups.map((group) => {
          const isGroupCollapsed = !!collapsedGroups[group.title] && !searchQuery;

          return (
            <div key={group.title} className="space-y-1">
              {/* Group Header (if not collapsed desktop mode) */}
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                >
                  <span>{group.title}</span>
                  {!searchQuery && (
                    <span className="opacity-60 group-hover:opacity-100">
                      {isGroupCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </span>
                  )}
                </button>
              ) : (
                <div className="h-px bg-slate-200 dark:bg-white/10 my-2" />
              )}

              {/* Group Items */}
              {!isGroupCollapsed && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = item.href === bestMatchHref;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onMobileClose}
                        title={isCollapsed ? item.name : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative overflow-hidden ${
                          isActive
                            ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                        )}
                        <div
                          className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                            isActive
                              ? `bg-white dark:bg-black/20 shadow-sm ${item.color}`
                              : `${item.iconBg} group-hover:scale-110`
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                        </div>

                        {!isCollapsed && (
                          <span className="truncate flex-1">{item.name}</span>
                        )}
                        {!isCollapsed && item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-md">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer User Card ── */}
      <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1021]/90 flex-shrink-0 transition-colors">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || "Administrator"}
                </span>
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {user?.role || "SUPER_ADMIN"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg bg-slate-200/60 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/20 text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 rounded-xl bg-slate-200/60 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/20 text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Sticky/Fixed) */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-300 z-30 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Backdrop & Drawer (<1024px) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
