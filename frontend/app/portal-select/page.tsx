"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Shield, BookOpen, Users, Star, LogOut, ChevronRight, Crown, Lock, Camera, ClipboardCheck } from "lucide-react";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

interface Portal {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  icon: React.ElementType;
  gradient: string;
  badge: string;
  badgeColor: string;
  allowed: boolean;
}

export default function PortalSelectPage() {
  const router = useRouter();
  const { user, status, mounted, logout } = useAuth();
  const [mounted2, setMounted2] = useState(false);

  useEffect(() => {
    setMounted2(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    // MEMBER users should go directly to member portal, and event managers/volunteers to the event-manager portal
    if (status === "authenticated" && user) {
      if (user.role === "MEMBER") {
        router.replace("/member");
      } else if (user.role === "EVENT_MANAGER" || user.role === "FIELD_VOLUNTEER") {
        router.replace("/event-manager");
      }
    }
  }, [mounted, status, user, router]);

  if (!mounted2 || !mounted || status === "loading" || status === "unauthenticated") {
    return null;
  }

  const role = user?.role ?? "MEMBER";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdmin      = role === "ADMIN" || isSuperAdmin;
  const isPastor     = role === "PASTOR" || isSuperAdmin;
  const isEventManager = role === "EVENT_MANAGER" || isAdmin;
  const isVolunteer    = role === "FIELD_VOLUNTEER" || isEventManager;

  const portals: Portal[] = [
    {
      id: "admin",
      title: "Admin Portal",
      subtitle: "Church Administration",
      description: "Manage members, donations, finances, attendance, content, and all church operations.",
      href: "/admin",
      icon: Shield,
      gradient: "from-violet-600 via-purple-600 to-indigo-700",
      badge: isSuperAdmin ? "SUPER ADMIN" : "ADMIN",
      badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
      allowed: isAdmin,
    },
    {
      id: "pastor",
      title: "Pastor Portal",
      subtitle: "Ministry & Sermons",
      description: "Manage sermons, announcements, prayer requests, small groups, and member requests.",
      href: "/pastor",
      icon: BookOpen,
      gradient: "from-amber-500 via-orange-500 to-rose-600",
      badge: "PASTOR",
      badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      allowed: isPastor,
    },
    {
      id: "field-volunteer",
      title: "Field Volunteer Portal",
      subtitle: "Live Event Uploads",
      description: "Submit live branch reports, record attendance, take camera captures, and sync offline updates.",
      href: "/event-manager",
      icon: Camera,
      gradient: "from-pink-600 via-rose-600 to-orange-700",
      badge: "VOLUNTEER",
      badgeColor: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
      allowed: isVolunteer,
    },
    {
      id: "member",
      title: "Member Portal",
      subtitle: "Church Membership",
      description: "View events, submit prayers, watch sermons, volunteer, and manage your church profile.",
      href: "/member",
      icon: Users,
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      badge: "MEMBER",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      allowed: true, // Everyone can access member portal
    },
  ];

  const allowedPortals  = portals.filter(p => p.allowed);
  const blockedPortals  = portals.filter(p => !p.allowed);

  const roleLabelMap: Record<string, string> = {
    SUPER_ADMIN: "Super Administrator",
    ADMIN:       "Administrator",
    PASTOR:      "Pastor",
    MEMBER:      "Member",
    EVENT_MANAGER: "Event Manager",
    FIELD_VOLUNTEER: "Field Volunteer",
  };

  const roleGradientMap: Record<string, string> = {
    SUPER_ADMIN: "from-violet-600 to-purple-700",
    ADMIN:       "from-indigo-600 to-blue-700",
    PASTOR:      "from-amber-500 to-orange-600",
    MEMBER:      "from-emerald-500 to-teal-600",
    EVENT_MANAGER: "from-blue-600 to-cyan-700",
    FIELD_VOLUNTEER: "from-pink-600 to-rose-700",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 flex flex-col transition-colors duration-300">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 flex-shrink-0">
            <Image src="/logo.png" alt="KCM Logo" fill className="object-cover" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight leading-none">Kingdom of Christ</p>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-white/40 uppercase tracking-widest">Ministries Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/[0.08] text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* User Identity Card */}
        <div className="w-full max-w-md mb-10 text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${roleGradientMap[role] || "from-gray-600 to-gray-700"} mb-4 shadow-sm`}>
            <Crown className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-black text-white uppercase tracking-widest">
              {roleLabelMap[role] || role}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] || "User"}! 🙏
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-sm mt-2 font-medium">
            {user?.email} · Select a portal to continue
          </p>
        </div>

        {/* Available Portals */}
        <div className="w-full max-w-3xl space-y-4">
          <p className="text-[10px] font-extrabold text-slate-400 dark:text-white/30 uppercase tracking-widest px-1">
            Your Portals ({allowedPortals.length})
          </p>

          <div className={`grid gap-4 ${allowedPortals.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : allowedPortals.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
            {allowedPortals.map((portal) => {
              const Icon = portal.icon;
              return (
                <button
                  key={portal.id}
                  onClick={() => router.push(portal.href)}
                  className="group relative bg-white dark:bg-white/[0.04] hover:bg-slate-50/50 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] hover:border-primary/20 dark:hover:border-white/20 rounded-3xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                >
                  {/* Gradient glow bg on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-10 rounded-3xl transition-opacity duration-300`} />

                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${portal.gradient} rounded-2xl flex items-center justify-center shadow-md dark:shadow-xl mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Role Badge */}
                  <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 border border-current/10 ${portal.badgeColor}`}>
                    {portal.badge}
                  </span>

                  <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-1">
                    {portal.title}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-white/50 mb-3">
                    {portal.subtitle}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-white/35 leading-relaxed mb-5">
                    {portal.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-white/60 group-hover:text-primary dark:group-hover:text-white transition-colors">
                    Enter Portal
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Blocked Portals (shown greyed out) */}
          {blockedPortals.length > 0 && (
            <div className="mt-8">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-white/20 uppercase tracking-widest px-1 mb-4">
                Not Available for Your Role
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {blockedPortals.map((portal) => {
                  const Icon = portal.icon;
                  return (
                    <div
                      key={portal.id}
                      className="relative bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.04] rounded-2xl p-4 flex items-center gap-4 opacity-50 cursor-not-allowed"
                    >
                      <div className="w-10 h-10 bg-slate-200/60 dark:bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-slate-400 dark:text-white/30" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-500 dark:text-white/40">{portal.title}</p>
                        <p className="text-xs text-slate-400 dark:text-white/20">{portal.subtitle}</p>
                      </div>
                      <Lock className="w-4 h-4 text-slate-400 dark:text-white/20 ml-auto flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Role Info */}
        <div className="mt-10 flex items-center gap-2 text-[11px] text-slate-400 dark:text-white/25 font-medium">
          <Star className="w-3 h-3" />
          <span>Your access level: <strong className="text-slate-600 dark:text-white/40">{roleLabelMap[role]}</strong></span>
        </div>
      </main>
    </div>
  );
}
