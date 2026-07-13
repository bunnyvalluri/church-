"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import PaletteToggle from "@/components/PaletteToggle";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  User, Calendar, Heart, BookOpen, Briefcase, Gift,
  LogOut, Menu, X, ChevronRight, ChevronDown, Bell, Wifi, WifiOff,
  Home, Activity, Star, Shield, Sparkles, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const layoutTranslations = {
  en: {
    loadingPortal: "Securing Member Fellowship Space...",
    portalName: "KCM Portal",
    memberArea: "Member Area",
    verifiedMember: "Verified Member",
    live: "Live",
    offline: "Offline",
    dashboard: "Dashboard",
    servicesHeader: "Services",
    signOut: "Log Out",
    menu: "Menu",
    links: {
      profile: { label: "My Profile", desc: "Account & settings" },
      events: { label: "Church Events", desc: "RSVP & schedules" },
      prayers: { label: "Prayer Requests", desc: "Prayer wall" },
      sermons: { label: "Sermon Library", desc: "Watch & listen" },
      volunteer: { label: "Volunteer", desc: "Serve in ministry" },
      give: { label: "Online Giving", desc: "Support the ministry" }
    }
  },
  te: {
    loadingPortal: "సభ్యుల పోర్టల్ లోడ్ అవుతోంది...",
    portalName: "కింగ్డమ్ ఆఫ్ క్రైస్ట్ పోర్టల్",
    memberArea: "సభ్యుల ప్రాంతం",
    verifiedMember: "ధృవీకరించబడిన సభ్యుడు",
    live: "లైవ్",
    offline: "ఆఫ్‌లైన్",
    dashboard: "డాష్‌బోర్డ్",
    servicesHeader: "సేవలు",
    signOut: "లాగ్ అవుట్",
    menu: "మెనూ",
    links: {
      profile: { label: "నా ప్రొఫైల్", desc: "ఖాతా & సెట్టింగులు" },
      events: { label: "చర్చి కార్యక్రమాలు", desc: "నమోదు & షెడ్యూల్స్" },
      prayers: { label: "ప్రార్థన విన్నపాలు", desc: "ప్రార్థన గోడ" },
      sermons: { label: "ప్రసంగాల లైబ్రరీ", desc: "వీక్షించండి & వినండి" },
      volunteer: { label: "వాలంటీర్", desc: "పరిచర్యలో సేవ చేయండి" },
      give: { label: "ఆన్‌లైన్ కానుక", desc: "పరిచర్యకు మద్దతు" }
    }
  },
  hi: {
    loadingPortal: "सदस्य पोर्टल लोड हो रहा है...",
    portalName: "केसीएम पोर्टल",
    memberArea: "सदस्य क्षेत्र",
    verifiedMember: "सत्यापित सदस्य",
    live: "लाइव",
    offline: "ऑफ़लाइन",
    dashboard: "डैशबोर्ड",
    servicesHeader: "सेवाएं",
    signOut: "लॉग आउट",
    menu: "मेनू",
    links: {
      profile: { label: "मेरी प्रोफाइल", desc: "खाता और सेटिंग्स" },
      events: { label: "चर्च कार्यक्रम", desc: "पंजीकरण और कार्यक्रम" },
      prayers: { label: "प्रार्थना निवेदन", desc: "प्रार्थना वाल" },
      sermons: { label: "प्रवचन लाइब्रेरी", desc: "देखें और सुनें" },
      volunteer: { label: "स्वयंसेवक", desc: "मंत्रालय में सेवा" },
      give: { label: "ऑनलाइन दान", desc: "मंत्रालय का समर्थन करें" }
    }
  }
};

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { user, status, mounted, logout } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname() || "";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const lt = layoutTranslations[language as keyof typeof layoutTranslations] || layoutTranslations.en;

  const translatedLinks = [
    { href: "/member/profile", label: lt.links.profile.label, icon: User, color: "from-purple-500 to-violet-600", bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-600 dark:text-purple-400", desc: lt.links.profile.desc },
    { href: "/member/events", label: lt.links.events.label, icon: Calendar, color: "from-indigo-500 to-blue-600", bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-600 dark:text-indigo-400", desc: lt.links.events.desc },
    { href: "/member/prayers", label: lt.links.prayers.label, icon: Heart, color: "from-rose-500 to-pink-600", bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-600 dark:text-rose-400", desc: lt.links.prayers.desc },
    { href: "/member/sermons", label: lt.links.sermons.label, icon: BookOpen, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", desc: lt.links.sermons.desc },
    { href: "/member/volunteer", label: lt.links.volunteer.label, icon: Briefcase, color: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400", desc: lt.links.volunteer.desc },
    { href: "/member/give", label: lt.links.give.label, icon: Gift, color: "from-green-500 to-emerald-600", bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-600 dark:text-green-400", desc: lt.links.give.desc },
  ];

  // Auth redirect — always runs (hooks must be before any return)
  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  // Warm up Next.js client router cache by prefetching all member route bundles aggressively
  useEffect(() => {
    if (status === "authenticated" && router) {
      translatedLinks.forEach((link) => {
        router.prefetch(link.href);
      });
      router.prefetch("/member");
    }
  }, [status, router]);

  // Online/offline detection
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLink = translatedLinks.find(l => pathname.startsWith(l.href)) || translatedLinks[0];
  const isMainDashboard = pathname === "/member";

  // On the server or during loading, render a beautiful, instant loading shell to avoid blank screens
  if (!mounted || status === "loading") {
    if (isMainDashboard) {
      return <>{children}</>;
    }
    return (
      <div className="min-h-screen bg-gray-55 dark:bg-gray-950 flex animate-pulse">
        {/* Desktop Sidebar Skeleton */}
        <aside className="hidden lg:flex w-64 xl:w-72 flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-white/5 shadow-sm fixed top-0 left-0 h-full z-30">
          {/* Brand */}
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-gray-250 dark:bg-gray-800 rounded w-2/3" />
              <div className="h-3 bg-gray-150 dark:bg-gray-800/60 rounded w-1/2" />
            </div>
          </div>

          {/* Profile Card */}
          <div className="p-4">
            <div className="h-24 bg-gray-150 dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-150 dark:bg-gray-700/60 rounded w-1/2" />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3 py-2 space-y-3">
            <div className="h-9 bg-gray-100 dark:bg-gray-800/80 rounded-xl w-full" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-1/3 ml-3 mt-4" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                  <div className="h-2.5 bg-gray-150 dark:bg-gray-800/60 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Content Area Skeleton */}
        <div className="flex-1 min-w-0 max-w-full lg:ml-64 xl:ml-72 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-white/5 h-14 flex items-center justify-between px-6">
            <div className="h-5 bg-gray-250 dark:bg-gray-800 rounded w-36" />
            <div className="flex items-center gap-3">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-24" />
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="w-16 h-8 rounded-xl bg-gray-200 dark:bg-gray-800" />
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-8 bg-gray-250 dark:bg-gray-800 rounded-xl w-48" />
                <div className="h-4 bg-gray-150 dark:bg-gray-800/60 rounded-lg w-72" />
              </div>
              <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 rounded-2xl" />
              ))}
            </div>

            <div className="h-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 rounded-2xl" />
          </main>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (isMainDashboard) return <>{children}</>;

  const Sidebar = () => (
    <aside className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-6 border-b border-gray-100 dark:border-white/5">
        <Link href="/member" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-purple-300/40 group-hover:border-purple-400/70 shadow-lg group-hover:scale-105 transition-transform bg-white flex items-center justify-center">
            <Image src="/logo.png" alt="KCM Logo" fill className="object-contain p-0.5" priority />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{lt.portalName}</p>
            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{lt.memberArea}</p>
          </div>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="p-4">
        <div className="relative bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-4 text-white overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-lg" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0 overflow-hidden">
              {user?.image && typeof user.image === 'string' && user.image.length > 0 ? (
                <Image src={user.image} alt={user.name || "Member"} width={44} height={44} unoptimized className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{user?.name || "Member"}</p>
              <p className="text-purple-200 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
          <div className="relative flex items-center gap-1.5 mt-3">
            <Shield className="w-3 h-3 text-purple-200" />
            <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">{lt.verifiedMember}</span>
            <div className="ml-auto flex items-center gap-1">
              {isOnline ? <Wifi className="w-3 h-3 text-green-300" /> : <WifiOff className="w-3 h-3 text-red-300" />}
              <span className={`text-[9px] font-bold ${isOnline ? "text-green-300" : "text-red-300"}`}>
                {isOnline ? lt.live : lt.offline}
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
          {lt.dashboard}
        </Link>

        <p className="text-[10px] font-extrabold text-gray-300 dark:text-gray-600 uppercase tracking-widest px-3 pt-3 pb-1">{lt.servicesHeader}</p>

        {translatedLinks.map((link) => {
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

      {/* Settings & Preferences Toggles for Mobile/Tablet */}
      <div className="p-4 lg:hidden border-t border-gray-100 dark:border-white/5">
        <p className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">Preferences</p>
        <div className="flex items-center gap-2 bg-gray-50/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-1.5 rounded-2xl shadow-sm backdrop-blur-md w-full justify-around scale-95">
          <LanguageToggle />
          <ThemeToggle />
          <PaletteToggle />
        </div>
      </div>

      {/* Bottom: Sign Out */}
      <div className="p-4 border-t border-gray-100 dark:border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          {lt.signOut}
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
                <span className="font-black text-gray-900 dark:text-white">{lt.menu}</span>
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
      <div className="flex-1 min-w-0 max-w-full overflow-x-hidden lg:ml-64 xl:ml-72 flex flex-col min-h-screen">
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
                {lt.dashboard}
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
            <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 flex-shrink-0">
              {/* Unified Toggles Capsule */}
              <div className="hidden md:flex scale-90 sm:scale-100 origin-right items-center gap-2 bg-gray-50/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-1 rounded-2xl shadow-sm backdrop-blur-md flex-shrink-0">
                <LanguageToggle />
                <ThemeToggle />
                <PaletteToggle />
              </div>

              <div className={`flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] font-bold border flex-shrink-0 ${
                isOnline
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <span className="hidden md:inline">{isOnline ? lt.live : lt.offline}</span>
              </div>

              {/* Profile Dropdown Container */}
              <div className="relative flex-shrink-0" ref={profileMenuRef}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsProfileOpen(!isProfileOpen);
                    }
                  }}
                  className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-200 dark:border-white/5 hover:border-[hsl(var(--primary))/0.2] hover:bg-white dark:hover:bg-gray-800/80 transition-all focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/0.2] cursor-pointer"
                  aria-label="Toggle profile menu"
                >
                  <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[hsl(var(--primary))] dark:border-purple-900/30 shadow-sm flex-shrink-0">
                    {user?.image && typeof user.image === 'string' && user.image.length > 0 ? (
                      <Image src={user.image} alt={user.name || "Member"} fill unoptimized className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                        <User className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold hidden xl:inline text-gray-700 dark:text-gray-300 max-w-[90px] truncate pr-1">
                    Welcome <span className="text-[hsl(var(--primary))]">{user?.name?.split(" ")[0] || "Member"}</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 mr-1 ${isProfileOpen ? "rotate-180" : ""}`} />
                </div>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="fixed top-14 right-3 sm:absolute sm:top-auto sm:right-0 sm:mt-3 w-[calc(100vw-1.5rem)] sm:w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl p-5 space-y-4 z-50 origin-top-right"
                    >
                      {/* User Profile Card */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-[hsl(var(--primary))/0.2] flex-shrink-0">
                          {user?.image && typeof user.image === 'string' && user.image.length > 0 ? (
                            <Image src={user.image} alt={user.name || "Member"} width={40} height={40} unoptimized className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-sm text-gray-950 dark:text-white truncate leading-tight">{user?.name || "Member"}</h4>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate leading-none mt-0.5">{user?.email}</p>
                          <span className="inline-block text-[9px] font-black uppercase tracking-wider text-[hsl(var(--primary))] mt-1 px-2 py-0.5 bg-[hsl(var(--primary))/0.08] rounded-full border border-[hsl(var(--primary))/0.1]">
                            {lt.verifiedMember}
                          </span>
                        </div>
                      </div>

                      <div className="h-[1px] bg-gray-100 dark:bg-gray-800" />

                      {/* Regional Dropdown Utilities */}
                      <div className="space-y-4">
                        {/* Mobile Preferences (Visible on screens < md) */}
                        <div className="md:hidden space-y-3">
                          <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">⚙️ Preferences</span>
                          <div className="flex flex-col gap-3 p-3 bg-gray-50/50 dark:bg-white/5 border border-gray-150 dark:border-white/5 rounded-2xl">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Language</span>
                              <div className="scale-[0.9] origin-left">
                                <LanguageToggle />
                              </div>
                            </div>
                            <div className="h-[1px] bg-gray-200/50 dark:bg-gray-800/50" />
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Appearance</span>
                              <div className="flex gap-2 items-center">
                                <ThemeToggle />
                                <PaletteToggle />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tablet Language Selection (Visible on screens md to lg) */}
                        <div className="hidden md:block lg:hidden space-y-1.5">
                          <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">🌐 Choose Language</span>
                          <div className="scale-[0.98] origin-left">
                            <LanguageToggle />
                          </div>
                        </div>
                      </div>

                      <div className="lg:hidden h-[1px] bg-gray-100 dark:bg-gray-800" />

                      {/* Sign Out Button */}
                      <button
                        onClick={logout}
                        className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {lt.signOut}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Logout Button (Direct in Header) */}
              <button
                onClick={logout}
                className="flex h-8 sm:h-9 items-center gap-1.5 px-2.5 sm:px-3.5 rounded-xl bg-red-500/10 dark:bg-red-500/5 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:scale-105 active:scale-95 shadow-sm transition-all flex-shrink-0 text-xs font-bold"
                title={lt.signOut}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lt.signOut}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8">
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
