"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, ChevronRight } from "lucide-react";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Navbar() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navItems = [
    { name: t.nav.home, href: "#home" },
    { name: t.nav.about, href: "#about" },
    { name: t.nav.services, href: "#services" },
    { name: t.nav.events, href: "#events" },
    { name: t.nav.sermons, href: "#sermons" },
    { name: t.nav.contact, href: "#contact" },
  ];

  const socialLinks = [
    { icon: Facebook,  href: "https://facebook.com",  label: "Facebook",  color: "hover:text-[#1877F2]", bg: "bg-[#1877F2]" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hover:text-[#E1306C]", bg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" },
    { icon: Youtube,   href: "https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO", label: "YouTube", color: "hover:text-[#FF0000]", bg: "bg-[#FF0000]" },
    { icon: Twitter,   href: "https://twitter.com",   label: "Twitter / X", color: "hover:text-white", bg: "bg-black" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const sections = navItems.map(item => item.href.slice(1));
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">

      {/* ── Top Announcement Bar ── */}
      <div className="relative bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 dark:from-purple-950 dark:via-indigo-950 dark:to-purple-950 border-b border-purple-800/30 text-gray-200 dark:text-gray-300 text-xs hidden md:block overflow-hidden">
        {/* Animated shimmer line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent animate-shimmer" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between h-9">
            {/* Phone */}
            <a href="tel:+919704090069"
              className="flex items-center gap-1.5 hover:text-white dark:hover:text-purple-300 transition-colors duration-200 group">
              <Phone className="w-3 h-3 group-hover:animate-bounce" />
              <span className="font-medium">+91 97040 90069</span>
            </a>

            {/* Centre ticker */}
            <div className="hidden lg:flex items-center gap-2 text-purple-200/80 dark:text-purple-300/70">
              <ChevronRight className="w-3 h-3" />
              <span className="text-[11px] tracking-wide">
                Sunday Services: 5:45 AM | 8:30 AM | 10:30 AM
              </span>
              <ChevronRight className="w-3 h-3" />
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-0.5">
              <span className="mr-2 text-purple-300/80 dark:text-purple-400/60 text-[11px] uppercase tracking-wider">Follow</span>
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    "w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-125 group",
                    color
                  )}>
                  <Icon className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-[360deg]" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <nav className={cn(
        "transition-all duration-500 relative",
        isScrolled
          ? "bg-white/80 dark:bg-black/50 backdrop-blur-2xl shadow-lg shadow-purple-900/5 dark:shadow-primary/5 py-2"
          : "bg-white/40 dark:bg-black/30 backdrop-blur-xl py-4"
      )}>
        {/* Animated gradient border at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
        {/* Top subtle glow */}
        {isScrolled && (
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent" />
        )}

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center space-x-3 group perspective">
              <div className="relative w-12 h-12 flex-shrink-0">
                {/* Rotating glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-500 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 scale-110" />
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-300/50 dark:border-purple-400/30 shadow-lg shadow-purple-500/10 dark:shadow-primary/20 group-hover:border-purple-400/70 transition-all duration-500 group-hover:scale-105 bg-white">
                  <Image
                    src="/logo.png"
                    alt="Kingdom of Christ Ministries Logo"
                    fill
                    className="object-cover rounded-full"
                    priority
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl leading-tight text-gray-900 dark:text-white tracking-tight drop-shadow-sm group-hover:text-purple-700 dark:group-hover:text-purple-100 transition-colors duration-300">
                  {t.nav.churchName}
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  {t.nav.ministries}
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Nav pill */}
              <div className="flex items-center bg-gray-100/50 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 p-1.5 rounded-2xl shadow-sm dark:shadow-none">
                {navItems.map((item) => {
                  const isActive = activeSection === item.href.slice(1);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden group",
                        isActive
                          ? "text-white"
                          : "text-gray-600 hover:text-gray-900 dark:text-white/70 dark:hover:text-white"
                      )}
                    >
                      {/* Active pill background */}
                      {isActive && (
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-600/80 dark:to-indigo-600/80 rounded-xl shadow-inner shadow-white/20 dark:shadow-white/10" />
                      )}
                      {/* Hover fill */}
                      {!isActive && (
                        <span className="absolute inset-0 bg-gray-200/50 dark:bg-white/0 dark:group-hover:bg-white/10 rounded-xl transition-colors duration-200 opacity-0 group-hover:opacity-100" />
                      )}
                      {/* Active dot indicator */}
                      {isActive && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-200 dark:bg-purple-300" />
                      )}
                      <span className="relative z-10">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Right controls */}
              <div className="flex items-center space-x-2 pl-3">
                <LanguageToggle />
                <ThemeToggle />
                {/* Member Login — always links to login page */}
                <Link
                  href="/login"
                  className="relative ml-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm overflow-hidden group shadow-md shadow-purple-500/20"
                >
                  {/* Base gradient */}
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 transition-all duration-300 group-hover:opacity-90" />
                  {/* Animated shimmer sweep */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {/* Outer glow */}
                  <span className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
                  <span className="relative z-10">Member Login</span>
                </Link>
              </div>
            </div>

            {/* ── Mobile Menu Button ── */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-gray-100/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all shadow-sm"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* ── Mobile Menu ── */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 p-4 animate-scale-in bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = activeSection === item.href.slice(1);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all",
                        isActive
                          ? "bg-gradient-to-r from-purple-100 to-indigo-50 dark:from-purple-600/30 dark:to-indigo-600/20 text-purple-700 dark:text-purple-300 border-l-4 border-purple-500"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
                      )}
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 flex-shrink-0" />}
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-5 pt-5 border-t border-gray-200 dark:border-white/10 flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</span>
                  <div className="flex gap-3">
                    <LanguageToggle />
                    <ThemeToggle />
                  </div>
                </div>

                {/* Mobile Social Icons */}
                <div className="px-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">Follow Us</span>
                  <div className="flex items-center gap-3">
                    {socialLinks.map(({ icon: Icon, href, label, bg }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                        className={cn("w-10 h-10 rounded-full text-white flex items-center justify-center transition-all duration-300 hover:scale-110 group shadow-md", bg)}>
                        <Icon className="w-4 h-4 transition-transform duration-500 group-hover:rotate-[360deg]" />
                      </a>
                    ))}
                  </div>
                </div>

                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-4 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 text-white rounded-xl font-bold text-center shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
                >
                  Member Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
