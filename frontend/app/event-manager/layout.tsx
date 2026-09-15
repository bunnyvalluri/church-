"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, PlusCircle, Users, AlertTriangle, Shield } from "lucide-react";

export default function EventManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/event-manager";

  const mobileDockItems = [
    { name: "EVENTS", href: "/event-manager", icon: CalendarCheck, color: "text-indigo-600 dark:text-indigo-400" },
    { name: "SUBMIT", href: "/event-manager/report", icon: PlusCircle, color: "text-emerald-600 dark:text-emerald-400" },
    { name: "ATTENDANCE", href: "/admin/attendance", icon: Users, color: "text-cyan-600 dark:text-cyan-400" },
    { name: "REPORT", href: "/member/report", icon: AlertTriangle, color: "text-rose-600 dark:text-rose-400" },
    { name: "ADMIN", href: "/admin/dashboard", icon: Shield, color: "text-purple-600 dark:text-purple-400" },
  ];

  return (
    <div className="min-h-screen flex flex-col relative" suppressHydrationWarning>
      <div className="flex-1 pb-24 lg:pb-0">
        {children}
      </div>

      {/* Mobile Ultra-Premium Floating Glassmorphic Bottom Dock for Event Manager */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-50 pointer-events-auto">
        <nav className="bg-white/90 dark:bg-[#0A0B1E]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.12] rounded-3xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-around gap-1 transition-all duration-300">
          {mobileDockItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/event-manager" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-90 ${
                  isActive
                    ? "bg-slate-100/80 dark:bg-white/[0.08] shadow-sm"
                    : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                }`}
              >
                {isActive && (
                  <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-sm shadow-indigo-500/50" />
                )}

                <div className="relative flex items-center justify-center">
                  <item.icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive
                        ? `${item.color} scale-110 -translate-y-0.5`
                        : "text-slate-400 dark:text-gray-400"
                    }`}
                  />
                  {isActive && (
                    <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                  )}
                </div>

                <span
                  className={`text-[9px] font-black uppercase tracking-wider mt-1 transition-colors duration-200 text-center leading-none ${
                    isActive
                      ? `${item.color} font-extrabold`
                      : "text-slate-500 dark:text-gray-400"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
