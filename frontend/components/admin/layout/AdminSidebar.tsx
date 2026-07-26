"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
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
  X
} from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "Executive Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Members",
    items: [
      { name: "Directory Overview", href: "/admin/members", icon: Users },
      { name: "Member Registry", href: "/admin/members/member", icon: UserCheck },
      { name: "Member Groups", href: "/admin/members/groups", icon: UsersRound },
      { name: "Prayer Desk", href: "/admin/members/prayer-requests", icon: HeartHandshake },
      { name: "Family Management", href: "/admin/members/family-management", icon: FolderKanban },
    ],
  },
  {
    title: "Finance",
    items: [
      { name: "Financial Overview", href: "/admin/finance", icon: DollarSign },
      { name: "Donations Ledger", href: "/admin/finance/donations", icon: CreditCard },
      { name: "Pledges & Campaigns", href: "/admin/finance/pledges", icon: Receipt },
      { name: "Transactions", href: "/admin/finance/transactions", icon: BarChart3 },
      { name: "Bank Accounts", href: "/admin/finance/accounts", icon: Landmark },
    ],
  },
  {
    title: "Attendance",
    items: [
      { name: "Attendance Hub", href: "/admin/attendance", icon: CalendarCheck },
      { name: "Service Records", href: "/admin/attendance/records", icon: FileSpreadsheet },
      { name: "Event Attendance", href: "/admin/attendance/events", icon: CalendarDays },
      { name: "Analytics & Reports", href: "/admin/attendance/reports", icon: BarChart2 },
    ],
  },
  {
    title: "Content & CMS",
    items: [
      { name: "CMS Dashboard", href: "/admin/content", icon: Globe },
      { name: "Sermon Archive", href: "/admin/content/sermons", icon: Video },
      { name: "Events Manager", href: "/admin/content/events", icon: CalendarDays },
      { name: "Announcements", href: "/admin/content/announcements", icon: Radio },
      { name: "Media Library", href: "/admin/content/media", icon: Camera },
      { name: "Public Page CMS", href: "/admin/content/pages", icon: FileCode },
    ],
  },
  {
    title: "NGO & Outreach",
    items: [
      { name: "NGO Overview", href: "/admin/ngo", icon: Building2 },
      { name: "Outreach Projects", href: "/admin/ngo/projects", icon: HandHeart },
      { name: "Field Media", href: "/admin/ngo/media", icon: Film },
      { name: "Volunteer Roster", href: "/admin/ngo/volunteers", icon: UserPlus },
    ],
  },
  {
    title: "Settings & Security",
    items: [
      { name: "Settings Overview", href: "/admin/settings", icon: Settings },
      { name: "General Config", href: "/admin/settings/general", icon: Globe },
      { name: "User Directory", href: "/admin/settings/users", icon: Users, roles: ["SUPER_ADMIN", "ADMIN"] },
      { name: "Roles & Access", href: "/admin/settings/roles", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
      { name: "Permissions Matrix", href: "/admin/settings/permissions", icon: KeyRound, roles: ["SUPER_ADMIN"] },
      { name: "Security & Audit", href: "/admin/settings/security", icon: Lock, roles: ["SUPER_ADMIN"] },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const userRole = user?.role || "ADMIN";

  const toggleGroup = (groupTitle: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  // Filter menu items by search & user role permissions
  const filteredGroups = useMemo(() => {
    return menuGroups.map((group) => {
      const allowedItems = group.items.filter((item) => {
        if (item.roles && !item.roles.includes(userRole)) {
          return false;
        }
        if (!searchQuery.trim()) return true;
        return (
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      return {
        ...group,
        items: allowedItems,
      };
    }).filter((group) => group.items.length > 0);
  }, [searchQuery, userRole]);

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
              placeholder="Search menu items..."
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
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
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
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onMobileClose}
                        title={isCollapsed ? item.name : undefined}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25"
                            : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? "text-white" : "text-slate-400 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                          }`}
                        />
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
