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
  Home, Activity, Star, Shield, Sparkles, TrendingUp, Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MemberFooter from "@/components/layout/MemberFooter";

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
    quickNavigation: "Quick Navigation",
    preferences: "Preferences & Theme",
    languageLabel: "Language",
    appearanceLabel: "Appearance",
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
    quickNavigation: "త్వరిత నావిగేషన్",
    preferences: "ప్రాధాన్యతలు & థీమ్",
    languageLabel: "భాష",
    appearanceLabel: "రూపం",
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
    quickNavigation: "त्वरित नेविगेशन",
    preferences: "प्राथमिकताएं और थीम",
    languageLabel: "भाषा",
    appearanceLabel: "प्रकटन",
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

  if (status === "unauthenticated" && mounted) {
    return null;
  }

  const Sidebar = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-white/5 overflow-hidden">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between gap-3 shrink-0">
        <Link href="/member" onClick={onClose} className="flex items-center gap-3 group min-w-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-purple-300/40 group-hover:border-purple-400/70 shadow-md group-hover:scale-105 transition-transform bg-white flex items-center justify-center shrink-0">
            <Image src="/logo.png" alt="KCM Logo" fill className="object-contain p-0.5" priority />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight truncate">{lt.portalName}</p>
            <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest truncate">{lt.memberArea}</p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors shrink-0"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="p-3.5 sm:p-4 shrink-0">
        <div className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-2xl p-3.5 sm:p-4 text-white overflow-hidden shadow-lg shadow-purple-500/10">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-lg pointer-events-none" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shrink-0 overflow-hidden shadow-xs">
              {user?.image && typeof user.image === 'string' && user.image.length > 0 ? (
                <Image src={user.image} alt={user.name || "Member"} width={44} height={44} unoptimized className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-sm truncate leading-tight text-white">{user?.name || "Member"}</p>
              <p className="text-white text-xs truncate mt-0.5 leading-tight font-extrabold tracking-wide drop-shadow-xs">{user?.email}</p>
            </div>
          </div>
          <div className="relative flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/15">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/15 backdrop-blur-md rounded-full border border-white/20">
              <Shield className="w-3 h-3 text-amber-300" />
              <span className="text-[9.5px] font-extrabold text-white uppercase tracking-wider">{lt.verifiedMember}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-400/30">
              <Wifi className="w-3 h-3 text-emerald-300 animate-pulse" />
              <span className="text-[9.5px] font-extrabold text-emerald-300 uppercase tracking-wider">
                {isOnline ? lt.live : lt.offline}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav & Preferences List (Single scroll container) */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
        {/* Navigation Section */}
        <div className="space-y-1">
          <Link
            href="/member"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs sm:text-sm font-bold group ${
              pathname === "/member"
                ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>{lt.dashboard}</span>
          </Link>

          <p className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 pt-3 pb-1">{lt.servicesHeader}</p>

          {translatedLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive
                    ? `${link.bg} ${link.text} font-extrabold shadow-xs`
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white font-semibold"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  isActive
                    ? `bg-gradient-to-br ${link.color} shadow-md`
                    : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                }`}>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-gray-500 dark:text-gray-400"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm leading-tight truncate">{link.label}</p>
                  <p className={`text-[10px] truncate mt-0.5 ${isActive ? "opacity-80" : "text-gray-400 dark:text-gray-500"}`}>{link.desc}</p>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />}
              </Link>
            );
          })}
        </div>

        {/* Preferences Toggles inside mobile drawer */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-white/5 rounded-2xl space-y-2 lg:hidden">
          <p className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
            {lt.preferences}
          </p>
          <div className="flex items-center justify-around gap-2 bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-white/10 p-2 rounded-xl shadow-xs">
            <LanguageToggle />
            <ThemeToggle />
            <PaletteToggle />
          </div>
        </div>
      </div>

      {/* Footer / Sign Out */}
      <div className="p-3.5 sm:p-4 border-t border-gray-100 dark:border-white/5 shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
        <button
          onClick={() => {
            if (onClose) onClose();
            logout();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 border border-red-200/80 dark:border-red-900/40 transition-all active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          <span>{lt.signOut}</span>
        </button>
      </div>
    </div>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] sm:w-[320px] bg-white dark:bg-gray-900 z-[100] lg:hidden shadow-2xl overflow-hidden flex flex-col"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 min-w-0 max-w-full overflow-x-hidden lg:ml-64 xl:ml-72 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className={`sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 transition-shadow ${scrolled ? "shadow-md" : ""}`}>
          <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 h-14">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-sm min-w-0 flex-1">
              <Link href="/member" className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors whitespace-nowrap font-medium hidden sm:block">
                {lt.dashboard}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0 hidden sm:block" />
              {activeLink && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`w-6 h-6 bg-gradient-to-br ${activeLink.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <activeLink.icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white truncate">{activeLink.label}</span>
                </div>
              )}
            </div>

            {/* Right: online + profile */}
            <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 flex-shrink-0">
              {/* Unified Toggles Capsule for Desktop */}
              <div className="hidden md:flex scale-90 sm:scale-100 origin-right items-center gap-2 bg-gray-50/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-1 rounded-2xl shadow-sm backdrop-blur-md flex-shrink-0">
                <LanguageToggle />
                <ThemeToggle />
                <PaletteToggle />
              </div>

              <div className={`hidden sm:flex items-center justify-center rounded-full text-[10px] font-bold border flex-shrink-0 transition-all ${
                isOnline
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400"
              } px-2.5 py-1 gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <span>{isOnline ? lt.live : lt.offline}</span>
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
                    <>
                      {/* Mobile Backdrop Overlay */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsProfileOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 sm:hidden"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="fixed top-14 right-3 sm:absolute sm:top-full sm:right-0 sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl p-4 sm:p-5 space-y-4 z-50 origin-top-right overflow-hidden text-left"
                      >
                        {/* User Profile Header Card */}
                        <div className="relative bg-purple-50/80 dark:bg-purple-950/60 p-3.5 rounded-2xl border border-purple-100/80 dark:border-purple-800/60 flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-purple-500/70 shadow-sm flex-shrink-0">
                            {user?.image && typeof user.image === 'string' && user.image.length > 0 ? (
                              <Image src={user.image} alt={user.name || "Member"} fill unoptimized className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-600 dark:text-purple-200" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white truncate leading-tight">{user?.name || "Member"}</h4>
                            <p className="text-xs text-slate-700 dark:text-slate-100 font-bold truncate leading-tight mt-0.5">{user?.email}</p>
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-purple-900 dark:text-white mt-1.5 px-2.5 py-0.5 bg-purple-100/90 dark:bg-purple-600/40 rounded-full border border-purple-300 dark:border-purple-400/60 shadow-xs">
                              <Shield className="w-2.5 h-2.5 text-purple-700 dark:text-purple-200" />
                              {lt.verifiedMember}
                            </span>
                          </div>
                        </div>

                        {/* Quick Navigation Links */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 block">
                            {lt.quickNavigation}
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            <Link
                              href="/member/profile"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-900/40 transition-all"
                            >
                              <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center text-purple-600 dark:text-purple-300 flex-shrink-0">
                                <User className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate">{lt.links.profile.label}</span>
                            </Link>

                            <Link
                              href="/member/give"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all"
                            >
                              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-300 flex-shrink-0">
                                <Gift className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate">{lt.links.give.label}</span>
                            </Link>

                            <Link
                              href="/member/prayers"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 hover:border-rose-200 dark:hover:border-rose-900/40 transition-all"
                            >
                              <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center text-rose-600 dark:text-rose-300 flex-shrink-0">
                                <Heart className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate">{lt.links.prayers.label}</span>
                            </Link>

                            <Link
                              href="/member/sermons"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900/40 transition-all"
                            >
                              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0">
                                <BookOpen className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate">{lt.links.sermons.label}</span>
                            </Link>
                          </div>
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-gray-800" />

                        {/* Display Preferences Section */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 flex items-center gap-1.5">
                            <Sliders className="w-3 h-3 text-gray-400" />
                            {lt.preferences}
                          </span>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 rounded-2xl space-y-3">
                            {/* Language */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                {lt.languageLabel}
                              </span>
                              <LanguageToggle />
                            </div>

                            <div className="h-px bg-gray-200/60 dark:bg-gray-700/60" />

                            {/* Appearance Controls */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                {lt.appearanceLabel}
                              </span>
                              <div className="flex items-center gap-2">
                                <ThemeToggle />
                                <PaletteToggle />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-gray-800" />

                        {/* Sign Out Button */}
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            logout();
                          }}
                          className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-900/40 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xs"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{lt.signOut}</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Logout Button (Direct in Header) */}
              <button
                onClick={logout}
                className="hidden sm:flex h-8 sm:h-9 items-center gap-1.5 px-2.5 sm:px-3.5 rounded-xl bg-red-500/10 dark:bg-red-500/5 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:scale-105 active:scale-95 shadow-sm transition-all flex-shrink-0 text-xs font-bold"
                title={lt.signOut}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lt.signOut}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-2 sm:p-5 md:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
        <MemberFooter />
      </div>
    </div>
  );
}
