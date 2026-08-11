"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import {
  Send, X, ChevronDown, Sparkles, Clock, MapPin, User,
  HeartHandshake, RotateCcw, ChevronRight, ChevronUp,
  BookOpen, Globe, Heart, HelpCircle, Coffee, Code, Zap,
  RefreshCw, Copy, Check, Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";

// ── Markdown renderer ──────────────────────────────────────────────────────────
function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1 text-[13px] leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("### "))
          return <h3 key={i} className="font-bold text-sm mt-2 mb-0.5 text-gray-900 dark:text-white">{line.slice(4)}</h3>;
        if (line.startsWith("## "))
          return <h2 key={i} className="font-bold text-sm mt-2 mb-0.5 text-gray-900 dark:text-white">{line.slice(3)}</h2>;
        if (line.startsWith("# "))
          return <h1 key={i} className="font-bold text-base mt-2 mb-1 text-gray-900 dark:text-white">{line.slice(2)}</h1>;
        if (line.match(/^[-*•]\s/))
          return (
            <div key={i} className="flex items-start gap-2 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-[5px] shrink-0" />
              <span>{renderInline(line.replace(/^[-*•]\s/, ""))}</span>
            </div>
          );
        if (line.match(/^\d+\.\s/))
          return (
            <div key={i} className="flex items-start gap-2 ml-1">
              <span className="text-purple-500 font-bold text-xs mt-0.5 shrink-0 min-w-[14px]">{line.match(/^\d+/)?.[0]}.</span>
              <span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
            </div>
          );
        if (line.trim() === "") return <div key={i} className="h-0.5" />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={j} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={j} className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    const lm = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (lm) return <a key={j} href={lm[2]} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline hover:text-purple-700">{lm[1]}</a>;
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
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
      title="Copy"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ── Topic categories ────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    label: "Church",
    icon: Heart,
    questions: [
      { icon: Clock,          label: "Service Times",    msg: "What are the Sunday service timings at KCM?" },
      { icon: MapPin,         label: "Location",         msg: "Where is Kingdom of Christ Ministries located?" },
      { icon: User,           label: "Senior Pastor",    msg: "Who is the Senior Pastor of KCM?" },
      { icon: HeartHandshake, label: "Prayer Request",   msg: "How can I submit a prayer request?" },
      { icon: Phone,          label: "Contact",          msg: "What is the church contact number?" },
    ],
  },
  {
    label: "Bible",
    icon: BookOpen,
    questions: [
      { icon: BookOpen,  label: "John 3:16",      msg: "Explain the meaning of John 3:16" },
      { icon: Heart,     label: "How to Pray",    msg: "How do I pray effectively as a Christian?" },
      { icon: Sparkles,  label: "Holy Spirit",    msg: "Who is the Holy Spirit and what does He do?" },
      { icon: Zap,       label: "Faith & Works",  msg: "What does the Bible say about faith and works?" },
    ],
  },
  {
    label: "General",
    icon: Globe,
    questions: [
      { icon: Code,       label: "Coding Help",  msg: "Can you help me write a Python function?" },
      { icon: Coffee,     label: "Health Tips",  msg: "What are some good daily health habits?" },
      { icon: HelpCircle, label: "Life Advice",  msg: "How do I manage stress effectively?" },
      { icon: Globe,      label: "Learn Anything", msg: "Explain how machine learning works simply" },
    ],
  },
];

// ── Main component ─────────────────────────────────────────────────────────────
export default function AIChat() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [msgTimes, setMsgTimes] = useState<Record<string, Date>>({});
  const [hasError, setHasError] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setMessages, reload } = useChat({
    api: "/api/chat",
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
      pathname?.startsWith("/login") || pathname?.startsWith("/register")) return null;
  if (!mounted) return null;

  const onSubmit = (e: React.FormEvent) => { setHasError(false); handleSubmit(e); };
  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) { setHasError(false); handleSubmit(e as any); }
    }
  };

  // ── Floating FAB ─────────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50 group">
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full focus:outline-none"
          aria-label="Open KCM Assistant"
          style={{ filter: "drop-shadow(0 6px 20px rgba(109,40,217,0.55))" }}
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 opacity-25 animate-pulse scale-110 blur-sm pointer-events-none" />
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 border border-white/20 shadow-xl" />
          <span className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full bg-white/10 pointer-events-none" />
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-[1.5px] border-white shadow-sm" />
          </span>
          <div className="relative z-10 w-9 h-9 rounded-full overflow-hidden bg-purple-800/40">
            <Image src="/chatbot-bird-logo.png" alt="KCM Assistant" width={36} height={36} unoptimized className="object-cover rounded-full w-full h-full" />
          </div>
        </button>
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2.5 py-1.5 bg-gray-950/90 text-white text-[11px] font-semibold rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none border border-white/10 hidden sm:block">
          Ask KCM anything ✦
          <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-gray-950/90" />
        </div>
      </div>
    );
  }

  // ── Chat window ───────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300 ease-in-out shadow-2xl rounded-2xl overflow-hidden",
        "border border-gray-200/80 dark:border-gray-800",
        isMinimized
          // Minimized: pill at bottom-right
          ? "bottom-4 right-4 w-[280px] h-[60px]"
          // Open on mobile: full-width strip above FAB, fixed height using dvh
          : [
              // Mobile: anchor to bottom, stretch edge-to-edge with margin
              "bottom-4 left-3 right-3",
              // Height: use dvh so it never overflows the visible area
              "h-[min(540px,calc(100dvh-80px))]",
              // On sm+: revert to right-anchored panel
              "sm:left-auto sm:right-5 sm:w-[400px] sm:h-[600px] sm:bottom-5",
            ].join(" ")
      )}
    >
      <div className="w-full h-full bg-white dark:bg-gray-950 flex flex-col">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div
          className="px-3 py-2.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-violet-700 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900 flex items-center justify-between cursor-pointer select-none flex-shrink-0"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-2.5 text-white min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 p-0.5 border border-white/30">
                <Image src="/chatbot-bird-logo.png" alt="KCM Assistant" width={28} height={28} className="object-cover rounded-full w-full h-full" />
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-indigo-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[13px] text-white">KCM Assistant</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-white/20 text-white rounded border border-white/30 flex items-center gap-0.5 shrink-0">
                  <Sparkles className="w-2 h-2" /> AI
                </span>
              </div>
              <p className="text-[11px] text-purple-100 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                <span className="truncate">{isLoading ? "Thinking…" : "Online · Ask me anything"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 text-purple-100 shrink-0">
            {messages.length > 0 && !isMinimized && (
              <button
                onClick={(e) => { e.stopPropagation(); setMessages([]); setHasError(false); prevCount.current = 0; }}
                title="Clear chat"
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}
              className="p-1.5 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────────── */}
        {!isMinimized && (
          <>
            {/* Scrollable messages + empty state */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto overscroll-contain bg-white dark:bg-gray-950"
            >
              {/* Empty / welcome state */}
              {messages.length === 0 && (
                <div className="p-3 space-y-3">
                  {/* Compact greeting */}
                  <div className="text-center bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-900/40 px-4 py-4 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                    <div className="relative inline-block mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-lg mx-auto flex items-center justify-center">
                        <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full p-0.5 overflow-hidden">
                          <Image src="/chatbot-bird-logo.png" alt="KCM Assistant" width={44} height={44} className="object-cover rounded-full w-full h-full" />
                        </div>
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full">
                        <Sparkles className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-0.5">Hi, I'm KCM Assistant! 👋</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                      KCM's AI — ask me <span className="text-purple-600 dark:text-purple-400 font-semibold">anything</span>
                    </p>
                  </div>

                  {/* Category tabs — icon + short label, no overflow */}
                  <div className="flex gap-1.5">
                    {CATEGORIES.map((cat, idx) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.label}
                          onClick={() => setActiveTab(idx)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all border",
                            activeTab === idx
                              ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                              : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-purple-400 hover:text-purple-600"
                          )}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Questions */}
                  <div className="space-y-1.5">
                    {CATEGORIES[activeTab].questions.map(({ icon: Icon, label, msg }) => (
                      <button
                        key={label}
                        onClick={() => { setHasError(false); append({ role: "user", content: msg }); }}
                        className="w-full text-left px-3 py-2.5 bg-white dark:bg-gray-900/90 border border-gray-200/80 dark:border-gray-800 rounded-xl hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/60 dark:hover:bg-purple-900/20 flex items-center justify-between gap-2 transition-all group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-purple-100/70 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{label}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-purple-500 shrink-0" />
                      </button>
                    ))}
                  </div>

                  <p className="text-center text-[10px] text-gray-400 dark:text-gray-600">
                    Or type any question below ✨
                  </p>
                </div>
              )}

              {/* Messages list */}
              {messages.length > 0 && (
                <div className="px-3 py-2 space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex gap-2 group",
                        m.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {/* Bot avatar */}
                      {m.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 mt-0.5">
                          <Image src="/chatbot-bird-logo.png" alt="KCM Assistant" width={28} height={28} className="object-cover rounded-full" />
                        </div>
                      )}

                      <div className="flex flex-col gap-0.5 max-w-[80%]">
                        <div className={cn(
                          "px-3 py-2.5 rounded-2xl shadow-sm",
                          m.role === "user"
                            ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm"
                            : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-tl-sm border border-gray-200/80 dark:border-gray-800"
                        )}>
                          <SimpleMarkdown content={m.content} />
                        </div>
                        <div className={cn("flex items-center gap-1", m.role === "user" ? "justify-end" : "justify-start")}>
                          <span className="text-[9px] text-gray-400 dark:text-gray-600">
                            {msgTimes[m.id] ? formatTime(msgTimes[m.id]) : ""}
                          </span>
                          {m.role === "assistant" && <CopyButton text={m.content} />}
                        </div>
                      </div>

                      {/* User avatar */}
                      {m.role === "user" && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          You
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing dots */}
                  {isLoading && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                        <Image src="/chatbot-bird-logo.png" alt="KCM Assistant" width={28} height={28} className="object-cover rounded-full" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {hasError && !isLoading && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center justify-center shrink-0 text-red-500 text-xs font-bold">!</div>
                      <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-red-50 dark:bg-red-900/20 border border-red-200/80 dark:border-red-800/50 text-xs text-red-700 dark:text-red-300">
                        <p className="font-medium mb-1.5">Couldn't connect. Try again.</p>
                        <button
                          onClick={() => { setHasError(false); reload(); }}
                          className="flex items-center gap-1 text-[11px] bg-red-100 dark:bg-red-900/40 hover:bg-red-200 px-2 py-1 rounded-lg font-semibold"
                        >
                          <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Input bar ──────────────────────────────────────────────────── */}
            <div className="px-3 pt-2 pb-3 bg-white dark:bg-gray-950 border-t border-gray-200/80 dark:border-gray-800 flex-shrink-0">
              <form onSubmit={onSubmit} className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={onKey}
                    placeholder="Ask KCM anything…"
                    className="w-full max-h-24 min-h-[42px] px-3 py-2.5 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all text-[13px] outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                    disabled={isLoading}
                    rows={1}
                    maxLength={2000}
                  />
                  {input.length > 1800 && (
                    <span className="absolute bottom-2 right-2 text-[9px] text-amber-500 font-medium">{2000 - input.length}</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="h-[42px] w-[42px] bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl disabled:opacity-40 transition-all shadow-md flex items-center justify-center shrink-0 active:scale-95"
                >
                  {isLoading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </form>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-gray-400 dark:text-gray-600">Enter to send</span>
                <span className="text-[10px] text-purple-500/60 font-medium flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> KCM Assistant
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
