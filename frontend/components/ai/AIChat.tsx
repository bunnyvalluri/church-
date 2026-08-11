"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "ai/react";
import {
  Send,
  X,
  ChevronDown,
  Sparkles,
  Clock,
  MapPin,
  User,
  HeartHandshake,
  RotateCcw,
  MessageSquare,
  ChevronRight,
  ChevronUp,
  Mic,
  BookOpen,
  Globe,
  Heart,
  HelpCircle,
  Coffee,
  Code,
  Zap,
  RefreshCw,
  Copy,
  Check,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";

// ── Markdown renderer ──────────────────────────────────────────────────────────
function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1 text-sm leading-relaxed">
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
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-[6px] shrink-0" />
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
      return <strong key={j} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={j} className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch)
      return <a key={j} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline hover:text-purple-700 transition-colors">{linkMatch[1]}</a>;
    return part;
  });
}

// ── Timestamp formatter ────────────────────────────────────────────────────────
function formatTime(date: Date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// ── Copy button for AI messages ────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      title="Copy"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ── Topic categories for quick suggestions ─────────────────────────────────────
const TOPIC_CATEGORIES = [
  {
    label: "Church Info",
    color: "purple",
    icon: Heart,
    questions: [
      { icon: Clock,        label: "Sunday Service Times",   msg: "What are the Sunday service timings at KCM?" },
      { icon: MapPin,       label: "Church Location",        msg: "Where is Kingdom of Christ Ministries located?" },
      { icon: User,         label: "Senior Pastor",          msg: "Who is the Senior Pastor of KCM?" },
      { icon: HeartHandshake, label: "Prayer Request",       msg: "How can I submit a prayer request?" },
      { icon: Phone,        label: "Contact Church",         msg: "What is the church contact number?" },
    ],
  },
  {
    label: "Bible & Faith",
    color: "amber",
    icon: BookOpen,
    questions: [
      { icon: BookOpen,   label: "John 3:16 Meaning",     msg: "Explain the meaning of John 3:16" },
      { icon: Heart,      label: "How to Pray",           msg: "How do I pray effectively as a Christian?" },
      { icon: Sparkles,   label: "The Holy Spirit",       msg: "Who is the Holy Spirit and what does He do?" },
      { icon: Zap,        label: "Faith vs Works",        msg: "What does the Bible say about faith and works?" },
    ],
  },
  {
    label: "General Help",
    color: "blue",
    icon: Globe,
    questions: [
      { icon: Code,       label: "Coding Help",           msg: "Can you help me with Python programming?" },
      { icon: Coffee,     label: "Health Tips",           msg: "What are some good daily health habits?" },
      { icon: HelpCircle, label: "Life Advice",           msg: "How do I manage stress effectively?" },
      { icon: Globe,      label: "Learn About Anything",  msg: "Explain how machine learning works in simple terms" },
    ],
  },
];

// ── Main component ─────────────────────────────────────────────────────────────
export default function AIChat() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [msgTimes, setMsgTimes] = useState<Record<string, Date>>({});
  const [hasError, setHasError] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setMessages, reload } = useChat({
    api: "/api/chat",
    onError: () => setHasError(true),
    onResponse: () => setHasError(false),
  });

  // Track message timestamps client-side
  const prevMsgCount = useRef(0);
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      const newMsg = messages[messages.length - 1];
      setMsgTimes(prev => ({ ...prev, [newMsg.id]: new Date() }));
      prevMsgCount.current = messages.length;
    }
  }, [messages]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Exclude admin/pastor/auth routes
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/pastor") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register")
  ) return null;
  if (!mounted) return null;

  const handleSend = (e: React.FormEvent) => {
    setHasError(false);
    handleSubmit(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        setHasError(false);
        handleSubmit(e as any);
      }
    }
  };

  // ── Floating button ──────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <div className="fixed bottom-safe right-3 sm:bottom-6 sm:right-6 z-40 group">
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 sm:w-15 sm:h-15 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
          aria-label="Open KCM Grace AI Assistant"
          style={{ filter: "drop-shadow(0 8px 28px rgba(109,40,217,0.5))" }}
        >
          {/* Pulse halo */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 opacity-20 animate-pulse scale-110 blur-sm pointer-events-none" />
          {/* Shell */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 border border-white/20 shadow-2xl" />
          {/* Shimmer */}
          <span className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full bg-white/10 pointer-events-none" />
          {/* Status dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-[1.5px] border-white dark:border-gray-900 shadow-sm" />
          </span>
          {/* Avatar */}
          <div className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center bg-purple-800/40">
            <Image src="/chatbot-bird-logo.png" alt="Grace AI" width={40} height={40} unoptimized className="object-cover rounded-full w-full h-full" />
          </div>
        </button>

        {/* Tooltip */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3.5 px-3 py-1.5 bg-gray-950/90 dark:bg-gray-900/90 backdrop-blur-xl text-white text-[11px] font-semibold rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none border border-white/10 hidden sm:block tracking-wide">
          Ask Grace anything ✦
          <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-gray-950/90 dark:border-l-gray-900/90" />
        </div>
      </div>
    );
  }

  // ── Chat window ──────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300 ease-in-out shadow-2xl rounded-2xl overflow-hidden border border-gray-200/80 dark:border-gray-800",
        isMinimized
          ? "bottom-safe right-3 sm:bottom-6 sm:right-6 w-72 sm:w-80 h-[64px]"
          : "bottom-safe right-2 left-2 sm:left-auto sm:right-6 w-auto sm:w-[440px] h-[580px] sm:h-[660px] max-h-[calc(100dvh-4rem)]"
      )}
    >
      <div className="relative w-full h-full bg-white dark:bg-gray-950 flex flex-col">

        {/* ── Header ── */}
        <div
          className="px-4 py-3 bg-gradient-to-r from-purple-700 via-indigo-600 to-violet-700 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900 border-b border-purple-500/20 dark:border-gray-800 flex items-center justify-between cursor-pointer select-none flex-shrink-0"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-3 text-white">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 dark:bg-white/10 p-0.5 border border-white/30 dark:border-white/20 flex items-center justify-center">
                <Image src="/chatbot-bird-logo.png" alt="Grace AI" width={32} height={32} className="object-cover rounded-full" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-indigo-700 dark:ring-gray-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm leading-tight text-white">Grace</h3>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-white/20 dark:bg-purple-500/20 text-white dark:text-purple-300 rounded border border-white/30 dark:border-purple-400/30 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              </div>
              <p className="text-[11px] text-purple-100 dark:text-gray-300 font-medium mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                {isLoading ? "Thinking..." : "Online • Ask me anything"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-purple-100 dark:text-gray-300">
            {messages.length > 0 && !isMinimized && (
              <button
                onClick={(e) => { e.stopPropagation(); setMessages([]); setHasError(false); prevMsgCount.current = 0; }}
                title="Clear chat"
                className="p-1.5 hover:bg-white/20 dark:hover:bg-white/10 hover:text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
              title={isMinimized ? "Expand" : "Minimize"}
              className="p-1.5 hover:bg-white/20 dark:hover:bg-white/10 hover:text-white rounded-lg transition-colors"
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}
              title="Close"
              className="p-1.5 hover:bg-red-500/30 dark:hover:bg-red-500/20 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body (hidden when minimized) ── */}
        {!isMinimized && (
          <>
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-purple-50/30 to-white dark:from-gray-950 dark:to-gray-950 scroll-smooth" ref={scrollRef}>
              
              {/* Empty state */}
              {messages.length === 0 && (
                <div className="p-4 space-y-4 animate-fade-in">
                  {/* Greeting card */}
                  <div className="text-center bg-gradient-to-b from-purple-50 via-indigo-50/40 to-white dark:from-purple-950/30 dark:via-indigo-950/15 dark:to-gray-900/40 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                    <div className="relative inline-block mb-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-500/20 mx-auto flex items-center justify-center">
                        <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full p-1 flex items-center justify-center overflow-hidden">
                          <Image src="/chatbot-bird-logo.png" alt="Grace AI" width={56} height={56} className="object-cover rounded-full" />
                        </div>
                      </div>
                      <span className="absolute bottom-0 right-0 p-1 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full shadow-md">
                        <Sparkles className="w-3 h-3" />
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">Hi, I'm Grace! 👋</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                      Your AI assistant for KCM Church — and <span className="text-purple-600 dark:text-purple-400 font-semibold">anything else</span> you need help with.
                    </p>
                  </div>

                  {/* Category tabs */}
                  <div>
                    <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
                      {TOPIC_CATEGORIES.map((cat, idx) => {
                        const CatIcon = cat.icon;
                        return (
                          <button
                            key={cat.label}
                            onClick={() => setActiveCategory(idx)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                              activeCategory === idx
                                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600"
                            )}
                          >
                            <CatIcon className="w-3 h-3" />
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Questions for active category */}
                    <div className="space-y-1.5">
                      {TOPIC_CATEGORIES[activeCategory].questions.map(({ icon: Icon, label, msg }) => (
                        <button
                          key={label}
                          onClick={() => { setHasError(false); append({ role: "user", content: msg }); }}
                          className="w-full text-left px-3 py-2.5 bg-white dark:bg-gray-900/90 border border-gray-200/80 dark:border-gray-800 rounded-xl hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/60 dark:hover:bg-purple-900/20 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-purple-100/70 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">{label}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 pt-1">
                    Or type any question below — Grace knows it all ✨
                  </p>
                </div>
              )}

              {/* Messages */}
              <div className="px-3 py-2 space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex gap-2.5 max-w-[92%] animate-fade-in group",
                      m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold shadow-sm overflow-hidden mt-0.5",
                      m.role === "user"
                        ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    )}>
                      {m.role === "user" ? "You" : (
                        <Image src="/chatbot-bird-logo.png" alt="Grace" width={28} height={28} className="object-cover rounded-full" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div className="flex flex-col gap-1">
                      <div className={cn(
                        "px-3.5 py-2.5 rounded-2xl text-xs shadow-sm",
                        m.role === "user"
                          ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm"
                          : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-tl-sm border border-gray-200/80 dark:border-gray-800"
                      )}>
                        <SimpleMarkdown content={m.content} />
                      </div>
                      {/* Timestamp + copy */}
                      <div className={cn("flex items-center gap-1", m.role === "user" ? "justify-end" : "justify-start")}>
                        <span className="text-[9px] text-gray-400 dark:text-gray-600">
                          {msgTimes[m.id] ? formatTime(msgTimes[m.id]) : ""}
                        </span>
                        {m.role === "assistant" && <CopyButton text={m.content} />}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 mr-auto max-w-[85%] animate-fade-in">
                    <div className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                      <Image src="/chatbot-bird-logo.png" alt="Grace" width={28} height={28} className="object-cover rounded-full" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}

                {/* Error state */}
                {hasError && !isLoading && (
                  <div className="flex gap-2.5 mr-auto max-w-[95%] animate-fade-in">
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center justify-center shrink-0 text-red-500 text-xs">!</div>
                    <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-red-50 dark:bg-red-900/20 border border-red-200/80 dark:border-red-800/50 text-xs text-red-700 dark:text-red-300">
                      <p className="font-medium mb-1.5">Couldn't get a response. Please try again.</p>
                      <button
                        onClick={() => { setHasError(false); reload(); }}
                        className="flex items-center gap-1 text-[11px] bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 px-2 py-1 rounded-lg transition-colors font-semibold"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Input area ── */}
            <div className="p-3 bg-white dark:bg-gray-950 border-t border-gray-200/80 dark:border-gray-800 flex-shrink-0">
              <form onSubmit={handleSend} className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Grace anything..."
                    className="w-full max-h-28 min-h-[44px] px-3.5 py-2.5 pr-10 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all text-xs outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
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
                  className="h-[44px] w-[44px] bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl disabled:opacity-40 transition-all shadow-md hover:shadow-purple-500/30 flex items-center justify-center shrink-0 active:scale-95"
                >
                  {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>

              <div className="flex items-center justify-between mt-1.5 px-0.5">
                <span className="text-[10px] text-gray-400 dark:text-gray-600">
                  ↩ Enter to send • Shift+Enter for new line
                </span>
                <span className="text-[10px] text-purple-500/70 dark:text-purple-400/50 font-medium flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Grace AI
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}