"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function Navbar() {
  const { t } = useLanguage();
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position
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

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook", color: "hover:text-[#1877F2]", bg: "bg-[#1877F2] hover:brightness-110" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hover:text-[#E1306C]", bg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:brightness-110" },
    { icon: Youtube, href: "https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO", label: "YouTube", color: "hover:text-[#FF0000]", bg: "bg-[#FF0000] hover:brightness-110" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter / X", color: "hover:text-white", bg: "bg-black hover:bg-gray-800" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* ── Top Social Bar ── */}
      <div className="bg-gray-900/95 backdrop-blur-md border-b border-white/10 text-gray-400 text-xs hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-9">
            {/* Phone */}
            <a href="tel:+919704090069" className="flex items-center gap-1.5 hover:text-purple-400 transition-colors">
              <Phone className="w-3 h-3" />
              <span>+91 97040 90069</span>
            </a>
            {/* Socials */}
            <div className="flex items-center gap-1">
              <span className="mr-2 text-gray-500">Follow us:</span>
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    "w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-white/10 hover:scale-125 group",
                    color
                  )}
                >
                  <Icon className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-[360deg]" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <nav
      className={cn(
        "transition-all duration-500",
        isScrolled
          ? "bg-white/40 dark:bg-black/40 backdrop-blur-2xl border-b border-white/20 dark:border-white/10 shadow-lg shadow-primary/5 py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group perspective">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg shadow-primary/20 transition-all duration-500 group-hover:shadow-primary/40 group-hover:scale-105 bg-white flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="Kingdom of Christ Ministries Logo" 
                fill 
                className="object-cover rounded-full"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl leading-tight text-foreground tracking-tight drop-shadow-sm">
                Kingdom of Christ
              </span>
              <span className="text-[0.65rem] font-bold uppercase tracking-widest bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                Ministries
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 p-1.5 rounded-2xl shadow-inner">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group",
                    activeSection === item.href.slice(1)
                      ? "text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10"
                  )}
                >
                  {/* Active Background highlight */}
                  {activeSection === item.href.slice(1) && (
                    <div className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl shadow-sm border border-black/5 dark:border-white/5 -z-10" />
                  )}
                  <span className="relative z-10">{item.name}</span>
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-2 pl-4">
              <LanguageToggle />
              <ThemeToggle />
              <Link
                href="/login"
                className="ml-2 px-6 py-2.5 bg-gradient-to-r from-primary via-indigo-500 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.05] hover:-translate-y-0.5 border border-white/20"
              >
                {t.nav.login}
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-md border border-white/50 dark:border-white/10 text-foreground hover:bg-white/80 dark:hover:bg-white/20 transition-all"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 animate-scale-in bg-white/80 dark:bg-[#0A0A10]/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 dark:border-white/10">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-base font-semibold transition-all",
                    activeSection === item.href.slice(1)
                      ? "bg-gradient-to-r from-primary/10 to-transparent text-primary border-l-4 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-black/10 dark:border-white/10 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Settings</span>
                <div className="flex gap-3">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </div>

              {/* Mobile Social Icons */}
              <div className="px-2">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-3">Follow Us</span>
                <div className="flex items-center gap-3">
                  {socialLinks.map(({ icon: Icon, href, label, color, bg }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={cn("w-10 h-10 rounded-full text-white flex items-center justify-center transition-all duration-300 hover:scale-110 group shadow-md", bg)}
                    >
                      <Icon className="w-4 h-4 transition-transform duration-500 group-hover:rotate-[360deg]" />
                    </a>
                  ))}
                </div>
              </div>

              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-3.5 bg-gradient-to-r from-primary via-indigo-500 to-pink-500 text-white rounded-xl font-bold text-center shadow-lg shadow-primary/20"
              >
                {t.nav.login}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>

    {/* ── Floating Social Sidebar (Desktop) ── */}
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-1 pl-1">
      {socialLinks.map(({ icon: Icon, href, label, color, bg }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={cn(
            "group relative flex items-center w-9 h-9 rounded-r-xl overflow-hidden transition-all duration-300 hover:w-28 shadow-lg text-white",
            bg
          )}
        >
          {/* Icon */}
          <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
            <Icon className="w-4 h-4 transition-transform duration-500 group-hover:rotate-[360deg]" />
          </div>
          {/* Label — slides in on hover */}
          <span className="text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-3">
            {label}
          </span>
        </a>
      ))}
    </div>
    </div>
  );
}
