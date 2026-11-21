"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import {
  Send, X, ChevronDown, Sparkles, Clock, MapPin, User,
  HeartHandshake, RotateCcw, ChevronRight, ChevronUp,
  BookOpen, Globe, Heart, HelpCircle, Coffee, Code, Zap,
  RefreshCw, Copy, Check, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useColorTheme } from "@/components/providers/ColorThemeProvider";
import { isSafeLinkUrl } from "@/lib/ai/aiSecurityPipeline";

const CHAT_THEME_STYLES: Record<string, {
  fabGradient: string;
  fabGlow: string;
  headerGradient: string;
  userBubble: string;
  buttonGradient: string;
  activeTab: string;
  iconBg: string;
  iconText: string;
}> = {
  violet: {
    fabGradient: "from-violet-600 via-indigo-600 to-purple-800",
    fabGlow: "rgba(139, 92, 246, 0.55)",
    headerGradient: "from-violet-700 via-indigo-700 to-purple-800",
    userBubble: "from-violet-600 to-indigo-600",
    buttonGradient: "from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700",
    activeTab: "bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 font-extrabold shadow-xs border border-violet-200/60 dark:border-violet-500/30",
    iconBg: "bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400",
    iconText: "text-violet-600 dark:text-violet-400",
  },
  emerald: {
    fabGradient: "from-emerald-600 via-teal-600 to-green-800",
    fabGlow: "rgba(16, 185, 129, 0.55)",
    headerGradient: "from-emerald-700 via-teal-700 to-emerald-800",
    userBubble: "from-emerald-600 to-teal-600",
    buttonGradient: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
    activeTab: "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-extrabold shadow-xs border border-emerald-200/60 dark:border-emerald-500/30",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    iconText: "text-emerald-600 dark:text-emerald-400",
  },
  ocean: {
    fabGradient: "from-blue-600 via-sky-600 to-indigo-800",
    fabGlow: "rgba(59, 130, 246, 0.55)",
    headerGradient: "from-blue-700 via-sky-700 to-indigo-800",
    userBubble: "from-blue-600 to-sky-600",
    buttonGradient: "from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700",
    activeTab: "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-extrabold shadow-xs border border-blue-200/60 dark:border-blue-500/30",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    iconText: "text-blue-600 dark:text-blue-400",
  },
  crimson: {
    fabGradient: "from-red-600 via-rose-600 to-red-800",
    fabGlow: "rgba(220, 38, 38, 0.55)",
    headerGradient: "from-red-700 via-rose-700 to-red-800",
    userBubble: "from-red-600 to-rose-600",
    buttonGradient: "from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700",
    activeTab: "bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 font-extrabold shadow-xs border border-rose-200/60 dark:border-rose-500/30",
    iconBg: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400",
    iconText: "text-rose-600 dark:text-rose-400",
  },
  gold: {
    fabGradient: "from-amber-600 via-yellow-600 to-orange-700",
    fabGlow: "rgba(212, 175, 55, 0.55)",
    headerGradient: "from-amber-700 via-yellow-700 to-orange-800",
    userBubble: "from-amber-600 to-orange-600",
    buttonGradient: "from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
    activeTab: "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-extrabold shadow-xs border border-amber-200/60 dark:border-amber-500/30",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
    iconText: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    fabGradient: "from-rose-600 via-pink-600 to-rose-800",
    fabGlow: "rgba(225, 29, 72, 0.55)",
    headerGradient: "from-rose-700 via-pink-700 to-rose-800",
    userBubble: "from-rose-600 to-pink-600",
    buttonGradient: "from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700",
    activeTab: "bg-white dark:bg-slate-800 text-pink-700 dark:text-pink-300 font-extrabold shadow-xs border border-pink-200/60 dark:border-pink-500/30",
    iconBg: "bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400",
    iconText: "text-pink-600 dark:text-pink-400",
  },
  sky: {
    fabGradient: "from-sky-600 via-cyan-600 to-blue-800",
    fabGlow: "rgba(14, 165, 233, 0.55)",
    headerGradient: "from-sky-700 via-cyan-700 to-blue-800",
    userBubble: "from-sky-600 to-cyan-600",
    buttonGradient: "from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700",
    activeTab: "bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 font-extrabold shadow-xs border border-sky-200/60 dark:border-sky-500/30",
    iconBg: "bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400",
    iconText: "text-sky-600 dark:text-sky-400",
  },
  olive: {
    fabGradient: "from-lime-700 via-emerald-700 to-green-900",
    fabGlow: "rgba(101, 163, 13, 0.55)",
    headerGradient: "from-lime-800 via-emerald-800 to-green-900",
    userBubble: "from-lime-700 to-emerald-700",
    buttonGradient: "from-lime-700 to-emerald-700 hover:from-lime-800 hover:to-emerald-800",
    activeTab: "bg-white dark:bg-slate-800 text-lime-700 dark:text-lime-300 font-extrabold shadow-xs border border-lime-200/60 dark:border-lime-500/30",
    iconBg: "bg-lime-500/10 dark:bg-lime-500/20 text-lime-700 dark:text-lime-400",
    iconText: "text-lime-700 dark:text-lime-400",
  },
  earth: {
    fabGradient: "from-amber-700 via-orange-700 to-stone-800",
    fabGlow: "rgba(180, 83, 9, 0.55)",
    headerGradient: "from-amber-800 via-orange-800 to-stone-900",
    userBubble: "from-amber-700 to-orange-700",
    buttonGradient: "from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800",
    activeTab: "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-extrabold shadow-xs border border-amber-200/60 dark:border-amber-500/30",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
    iconText: "text-amber-700 dark:text-amber-400",
  },
  platinum: {
    fabGradient: "from-slate-600 via-zinc-600 to-slate-800",
    fabGlow: "rgba(100, 116, 139, 0.55)",
    headerGradient: "from-slate-700 via-zinc-700 to-slate-800",
    userBubble: "from-slate-600 to-zinc-600",
    buttonGradient: "from-slate-600 to-zinc-600 hover:from-slate-700 hover:to-zinc-700",
    activeTab: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold shadow-xs border border-slate-200/60 dark:border-slate-500/30",
    iconBg: "bg-slate-500/10 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300",
    iconText: "text-slate-700 dark:text-slate-400",
  },
};

// ── Markdown renderer ──────────────────────────────────────────────────────────
function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-[13.5px] leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("### "))
          return <h3 key={i} className="font-extrabold text-sm mt-2 mb-0.5 text-slate-900 dark:text-white font-outfit">{line.slice(4)}</h3>;
        if (line.startsWith("## "))
          return <h2 key={i} className="font-extrabold text-sm mt-2 mb-0.5 text-slate-900 dark:text-white font-outfit">{line.slice(3)}</h2>;
        if (line.startsWith("# "))
          return <h1 key={i} className="font-black text-base mt-2 mb-1 text-slate-900 dark:text-white font-outfit">{line.slice(2)}</h1>;
        if (line.match(/^[-*•]\s/))
          return (
            <div key={i} className="flex items-start gap-2 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400 mt-2 shrink-0" />
              <span>{renderInline(line.replace(/^[-*•]\s/, ""))}</span>
            </div>
          );
        if (line.match(/^\d+\.\s/))
          return (
            <div key={i} className="flex items-start gap-2 ml-1">
              <span className="text-violet-600 dark:text-violet-400 font-bold text-xs mt-0.5 shrink-0 min-w-[14px]">{line.match(/^\d+/)?.[0]}.</span>
              <span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
            </div>
          );
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={j} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={j} className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 rounded-md text-xs font-mono">{part.slice(1, -1)}</code>;
    const lm = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (lm) {
      const label = lm[1];
      const href = lm[2];
      if (!isSafeLinkUrl(href)) {
        return <span key={j} className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>;
      }
      return (
        <a
          key={j}
          href={href}
          target={href.startsWith("/") ? "_self" : "_blank"}
          rel="noopener noreferrer"
          className="text-violet-600 dark:text-violet-400 underline hover:text-violet-700 font-semibold"
        >
          {label}
        </a>
      );
    }
    return part;
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
      title="Copy text"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ── Curated Topic Categories & Structured Prompt Cards ─────────────────────────
const CATEGORIES = [
  {
    mode: "CHURCH" as const,
    label: "Church",
    icon: Heart,
    questions: [
      { icon: Clock,          label: "Service Times",  desc: "Sunday & Mid-week timings", msg: "What are the Sunday service timings at KCM?" },
      { icon: MapPin,         label: "Location",       desc: "Find church campuses",       msg: "Where is Kingdom of Christ Ministries located?" },
      { icon: User,           label: "Senior Pastor",  desc: "Bishop Kurra Kristhu Raju",  msg: "Who is the Senior Pastor of KCM?" },
      { icon: HeartHandshake, label: "Prayer Request", desc: "Submit prayer needs",       msg: "How can I submit a prayer request?" },
    ],
  },
  {
    mode: "BIBLE" as const,
    label: "Bible",
    icon: BookOpen,
    questions: [
      { icon: BookOpen,  label: "John 3:16",      desc: "God's unconditional love",   msg: "Explain the meaning of John 3:16" },
      { icon: Heart,     label: "How to Pray",    desc: "Effective prayer guidance",  msg: "How do I pray effectively as a Christian?" },
      { icon: Sparkles,  label: "Holy Spirit",    desc: "His divine guidance & role", msg: "Who is the Holy Spirit and what does He do?" },
      { icon: Zap,       label: "Faith & Works",  desc: "Scriptural understanding",   msg: "What does the Bible say about faith and works?" },
    ],
  },
  {
    mode: "GENERAL" as const,
    label: "General",
    icon: Globe,
    questions: [
      { icon: Code,       label: "Coding Help",    desc: "Write clean software",       msg: "Can you help me write a Python function?" },
      { icon: Coffee,     label: "Health Tips",    desc: "Daily healthy habits",       msg: "What are some good daily health habits?" },
      { icon: HelpCircle, label: "Life Advice",    desc: "Managing stress in faith",   msg: "How do I manage stress effectively?" },
      { icon: Globe,      label: "Learn Anything", desc: "Clear simple explanations",  msg: "Explain how machine learning works simply" },
    ],
  },
];

// ── Main AIChat Component ──────────────────────────────────────────────────────
export default function AIChat() {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname?.startsWith("/admin/login") ||
    pathname?.startsWith("/admin/register");

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [msgTimes, setMsgTimes] = useState<Record<string, Date>>({});
  const [hasError, setHasError] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme: colorTheme } = useColorTheme();
  const themeStyle = CHAT_THEME_STYLES[colorTheme] ?? CHAT_THEME_STYLES.violet;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isAuthPage) return;
    const handleMenuToggle = (e: Event) => {
      const customEv = e as CustomEvent<{ isOpen: boolean }>;
      setIsMenuOpen(!!customEv.detail?.isOpen);
    };
    window.addEventListener("mobile-menu-toggle", handleMenuToggle);
    return () => window.removeEventListener("mobile-menu-toggle", handleMenuToggle);
  }, [isAuthPage]);

  const selectedCategory = CATEGORIES[activeTab] || CATEGORIES[0];

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setMessages, reload } = useChat({
    api: "/api/chat",
    body: {
      mode: selectedCategory.mode,
      language: "en",
    },
    onError: () => setHasError(true),
    onResponse: () => setHasError(false),
  });

  const prevCount = useRef(0);
  useEffect(() => {
    if (messages.length > prevCount.current) {
      const m = messages[messages.length - 1];
      setMsgTimes(p => ({ ...p, [m.id]: new Date() }));
      prevCount.current = messages.length;
    }
  }, [messages]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/pastor") ||
      pathname?.startsWith("/member") || pathname?.startsWith("/event-manager") ||
      pathname?.startsWith("/login") || pathname?.startsWith("/register") ||
      pathname?.startsWith("/gallery") || pathname?.startsWith("/ngo/videos") ||
      pathname?.startsWith("/about/story")) return null;
  if (!mounted || isMenuOpen) return null;

  const onSubmit = (e: React.FormEvent) => { setHasError(false); handleSubmit(e); };
  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) { setHasError(false); handleSubmit(e as any); }
    }
  };

  // ── Floating Action Launcher Button (FAB) ──────────────────────────────────
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50 group">
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open KCM Assistant"
          style={{ filter: `drop-shadow(0 8px 24px ${themeStyle.fabGlow})` }}
        >
          <span className={cn("absolute inset-0 rounded-full bg-gradient-to-br opacity-25 animate-pulse scale-110 blur-sm pointer-events-none", themeStyle.fabGradient)} />
          <span className={cn("absolute inset-0 rounded-full bg-gradient-to-br border border-white/20 shadow-xl", themeStyle.fabGradient)} />
          <span className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full bg-white/10 pointer-events-none" />
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-[1.5px] border-white shadow-sm" />
          </span>
          <div className="relative z-10 w-9 h-9 rounded-full overflow-hidden bg-white shadow-sm p-0.5 border border-white/40">
            <Image src="/logo.png" alt="Kingdom of Christ Ministries" width={36} height={36} unoptimized className="object-contain rounded-full w-full h-full" />
          </div>
        </button>
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-slate-900/95 text-white text-xs font-bold rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none border border-white/10 hidden sm:block font-outfit">
          Ask KCM Assistant ✦
          <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-slate-900/95" />
        </div>
      </div>
    );
  }

  // ── Executive Chat Window ──────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300 ease-in-out shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.85)] rounded-3xl overflow-hidden contain-paint isolation-isolate",
        "border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0c0f1e]",
        isMinimized
          ? "bottom-4 right-4 w-[280px] h-[58px]"
          : [
              "bottom-3 left-3 right-3",
              "h-[min(580px,calc(100dvh-75px))]",
              "sm:left-auto sm:right-5 sm:w-[420px] sm:h-[620px] sm:bottom-5",
            ].join(" ")
      )}
    >
      <div className="w-full h-full flex flex-col font-sans">

        {/* ── 1. Executive Frosted Header ────────────────────────────────────────── */}
        <div
          className={cn("px-4 py-3 bg-gradient-to-r flex items-center justify-between cursor-pointer select-none flex-shrink-0 relative overflow-hidden", themeStyle.headerGradient)}
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {/* Subtle Ambient Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

          <div className="flex items-center gap-2.5 text-white min-w-0 relative z-10">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white shadow-sm p-0.5 border border-white/40 ring-1 ring-white/30">
                <Image src="/pastor.png" alt="Bishop Kurra Kristhu Raju" width={36} height={36} className="object-cover object-top rounded-full w-full h-full scale-110" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-violet-800 shadow-xs" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-tight font-outfit">KCM Assistant</span>
                <span className="px-1.5 py-0.5 text-[9px] font-black bg-white/20 text-white rounded-md border border-white/30 flex items-center gap-0.5 shrink-0 uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" /> AI
                </span>
              </div>
              <p className="text-[11px] text-violet-100 font-medium flex items-center gap-1 leading-tight mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                <span className="truncate">{isLoading ? "Reflecting on God's Word…" : "Online • Ready to help"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-white/90 relative z-10 shrink-0">
            {messages.length > 0 && !isMinimized && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setMessages([]); setHasError(false); prevCount.current = 0; }}
                title="Clear conversation"
                aria-label="Clear conversation"
                className="w-7 h-7 rounded-lg hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
              aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              className="w-7 h-7 rounded-lg hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}
              aria-label="Close assistant"
              className="w-7 h-7 rounded-lg hover:bg-red-500/30 text-white/80 hover:text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── 2. Scrollable Body ─────────────────────────────────────────────────── */}
        {!isMinimized && (
          <>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto overscroll-contain bg-slate-50/60 dark:bg-[#0c0f1e] custom-thin-scrollbar"
            >
              {/* ── Elegant Non-Redundant Welcome State ── */}
              {messages.length === 0 && (
                <div className="p-4 space-y-4">
                  {/* Clean Greeting Hero (Zero Duplication) */}
                  <div className="text-center pt-2 pb-1 space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 text-[10.5px] font-extrabold uppercase tracking-widest border border-violet-200/80 dark:border-violet-500/30">
                      <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                      <span>Kingdom of Christ Ministries</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight font-outfit">
                      How can we assist your faith today?
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Ask about worship services, scripture insights, pastoral prayer, or outreach.
                    </p>
                  </div>

                  {/* Segmented Category Pill Tabs */}
                  <div className="bg-slate-200/70 dark:bg-white/[0.05] p-1 rounded-2xl border border-slate-200/80 dark:border-white/10 flex gap-1">
                    {CATEGORIES.map((cat, idx) => {
                      const Icon = cat.icon;
                      const isSelected = activeTab === idx;
                      return (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => setActiveTab(idx)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs transition-all duration-200 select-none cursor-pointer",
                            isSelected
                              ? themeStyle.activeTab
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                          )}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 2x2 Suggested Prompt Grid (Ergonomic & Space-Efficient) */}
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES[activeTab].questions.map(({ icon: Icon, label, desc, msg }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => { setHasError(false); append({ role: "user", content: msg }); }}
                        className="p-3 text-left bg-white dark:bg-white/[0.04] hover:bg-violet-50/70 dark:hover:bg-white/[0.08] border border-slate-200/80 hover:border-violet-300 dark:border-white/10 dark:hover:border-violet-500/40 rounded-2xl transition-all duration-200 group cursor-pointer flex flex-col justify-between h-[86px] shadow-2xs hover:shadow-sm active:scale-[0.98]"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", themeStyle.iconBg)}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors truncate">
                            {label}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal">
                            {desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    Or type your question in the composer below ✦
                  </p>
                </div>
              )}

              {/* ── Active Conversation Stream ── */}
              {messages.length > 0 && (
                <div className="p-4 space-y-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex gap-2.5 group",
                        m.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {/* Assistant Avatar */}
                      {m.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white shadow-xs p-0.5 border border-slate-200/80 dark:border-white/20 shrink-0 mt-0.5">
                          <Image src="/pastor.png" alt="Bishop Kurra Kristhu Raju" width={32} height={32} className="object-cover object-top rounded-full w-full h-full scale-110" />
                        </div>
                      )}

                      <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[80%]">
                        <div className={cn(
                          "px-4 py-3 rounded-2xl shadow-2xs leading-relaxed",
                          m.role === "user"
                            ? cn("bg-gradient-to-r text-white rounded-tr-sm shadow-sm", themeStyle.userBubble)
                            : "bg-white dark:bg-white/[0.05] text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-200/80 dark:border-white/10"
                        )}>
                          <SimpleMarkdown content={m.content} />
                        </div>
                        <div className={cn("flex items-center gap-1 px-1", m.role === "user" ? "justify-end" : "justify-start")}>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {msgTimes[m.id] ? formatTime(msgTimes[m.id]) : ""}
                          </span>
                          {m.role === "assistant" && <CopyButton text={m.content} />}
                        </div>
                      </div>

                      {/* User Avatar */}
                      {m.role === "user" && (
                        <div className={cn("w-8 h-8 rounded-full bg-gradient-to-r text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-outfit", themeStyle.userBubble)}>
                          You
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <div className="flex gap-2.5 justify-start">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white shadow-xs p-0.5 border border-slate-200/80 dark:border-white/20 shrink-0">
                        <Image src="/pastor.png" alt="Bishop Kurra Kristhu Raju" width={32} height={32} className="object-cover object-top rounded-full w-full h-full scale-110" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 shadow-2xs flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {hasError && !isLoading && (
                    <div className="flex gap-2.5 justify-start">
                      <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 flex items-center justify-center shrink-0 text-xs font-bold">!</div>
                      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-rose-50/90 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 space-y-2">
                        <p className="font-semibold">Unable to reach the assistant right now. Please retry.</p>
                        <button
                          type="button"
                          onClick={() => { setHasError(false); reload(); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 dark:hover:bg-rose-900/60 rounded-xl font-bold transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /> Retry Message
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── 3. Ergonomic Input Composer ─────────────────────────────────────── */}
            <div className="p-3 bg-white dark:bg-[#0c0f1e] border-t border-slate-200/80 dark:border-white/10 flex-shrink-0">
              <form onSubmit={onSubmit} className="relative flex items-center bg-slate-100/90 dark:bg-white/[0.06] border border-slate-200/90 dark:border-white/10 rounded-2xl focus-within:border-violet-500 dark:focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all p-1.5 shadow-2xs">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={onKey}
                  placeholder="Ask about church, Bible, prayer..."
                  className="flex-1 max-h-24 min-h-[38px] px-2.5 py-1.5 bg-transparent border-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-[13px] outline-none resize-none leading-relaxed"
                  disabled={isLoading}
                  rows={1}
                  maxLength={2000}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 select-none",
                    input.trim() && !isLoading
                      ? "bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/30 active:scale-95 cursor-pointer"
                      : "bg-slate-200/80 dark:bg-white/10 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </form>
              <div className="flex items-center justify-between px-1 pt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                <span>Press Enter to send</span>
                <span className="flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>KCM Ministry AI</span>
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
