"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import {
  User, Calendar, Heart, BookOpen, Briefcase, Gift,
  LogOut, Menu, X, ChevronRight, Bell, Wifi, WifiOff,
  Home, Activity, Star, Shield, Sparkles, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/member/profile", label: "My Profile", icon: User, color: "from-purple-500 to-violet-600", bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-600 dark:text-purple-400", desc: "Account & settings" },
  { href: "/member/events", label: "Church Events", icon: Calendar, color: "from-indigo-500 to-blue-600", bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-600 dark:text-indigo-400", desc: "RSVP & schedules" },
  { href: "/member/prayers", label: "Prayer Requests", icon: Heart, color: "from-rose-500 to-pink-600", bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-600 dark:text-rose-400", desc: "Prayer wall" },
  { href: "/member/sermons", label: "Sermon Library", icon: BookOpen, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", desc: "Watch & listen" },
  { href: "/member/volunteer", label: "Volunteer", icon: Briefcase, color: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400", desc: "Serve in ministry" },
  { href: "/give", label: "Give & Tithe", icon: Gift, color: "from-green-500 to-emerald-600", bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-600 dark:text-green-400", desc: "Online offerings" },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { user, status, mounted, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const activeLink = NAV_LINKS.find(l => pathname.startsWith(l.href)) || NAV_LINKS[0];
  const isMainDashboard = pathname === "/member";

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (isMainDashboard) return <>{children}</>;

  const Sidebar = () => (
    <aside className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-6 border-b border-gray-100 dark:border-white/5">
        <Link href="/member" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">KCM Portal</p>
            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Member Area</p>
          </div>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="p-4">
        <div className="relative bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-4 text-white overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-lg" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{user?.name || "Member"}</p>
              <p className="text-purple-200 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
          <div className="relative flex items-center gap-1.5 mt-3">
            <Shield className="w-3 h-3 text-purple-200" />
            <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">Verified Member</span>
            <div className="ml-auto flex items-center gap-1">
              {isOnline ? <Wifi className="w-3 h-3 text-green-300" /> : <WifiOff className="w-3 h-3 text-red-300" />}
              <span className={`text-[9px] font-bold ${isOnline ? "text-green-300" : "text-red-300"}`}>
                {isOnline ? "Live" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <Link
          href="/member"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold group ${
            pathname === "/member"
              ? "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          Dashboard
        </Link>

        <p className="text-[10px] font-extrabold text-gray-300 dark:text-gray-600 uppercase tracking-widest px-3 pt-3 pb-1">Services</p>

        {NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                isActive
                  ? `${link.bg} ${link.text} font-bold`
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white font-semibold"
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                isActive
                  ? `bg-gradient-to-br ${link.color} shadow-md`
                  : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
              }`}>
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-gray-500 dark:text-gray-400"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-none truncate">{link.label}</p>
                <p className={`text-[10px] mt-0.5 truncate ${isActive ? "opacity-70" : "text-gray-400 dark:text-gray-500"}`}>{link.desc}</p>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Sign Out */}
      <div className="p-4 border-t border-gray-100 dark:border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-white/5 shadow-sm fixed top-0 left-0 h-full z-30">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                <span className="font-black text-gray-900 dark:text-white">Menu</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <Sidebar />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 xl:ml-72 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className={`sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 transition-shadow ${scrolled ? "shadow-md" : ""}`}>
          <div className="flex items-center gap-4 px-4 sm:px-6 h-14">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
              <Link href="/member" className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors whitespace-nowrap font-medium hidden sm:block">
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0 hidden sm:block" />
              {activeLink && (
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-6 h-6 bg-gradient-to-br ${activeLink.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <activeLink.icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white truncate">{activeLink.label}</span>
                </div>
              )}
            </div>

            {/* Right: online + bell */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Language Selector */}
              <div className="scale-90 sm:scale-100 origin-right">
                <LanguageToggle />
              </div>

              {/* Theme Toggle */}
              <div className="scale-90 sm:scale-100 origin-right">
                <ThemeToggle />
              </div>

              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                isOnline
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <span className="hidden sm:inline">{isOnline ? "Live" : "Offline"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
