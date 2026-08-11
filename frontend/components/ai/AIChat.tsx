"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Enhanced markdown-to-JSX renderer with support for links, bold, lists, and headers
function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("### "))
          return (
            <h3 key={i} className="font-bold text-base mt-3 mb-1 text-gray-900 dark:text-white">
              {line.slice(4)}
            </h3>
          );
        if (line.startsWith("## "))
          return (
            <h2 key={i} className="font-bold text-base mt-3 mb-1 text-gray-900 dark:text-white">
              {line.slice(3)}
            </h2>
          );
        if (line.startsWith("# "))
          return (
            <h1 key={i} className="font-bold text-lg mt-3 mb-1 text-gray-900 dark:text-white">
              {line.slice(2)}
            </h1>
          );
        if (line.startsWith("- ") || line.startsWith("* "))
          return (
            <div key={i} className="flex items-start gap-2 ml-2 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
              <span>{renderInlineText(line.slice(2))}</span>
            </div>
          );
        if (line.trim() === "") return <div key={i} className="h-1" />;

        return <p key={i}>{renderInlineText(line)}</p>;
      })}
    </div>
  );
}

function renderInlineText(text: string) {
  // Regex to match markdown links [text](url) or bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={j} className="font-semibold text-gray-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={j}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 dark:text-purple-400 underline hover:text-purple-700 transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

export default function AIChat() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Vercel AI SDK hook
  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setMessages } = useChat({
    api: "/api/chat",
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/pastor") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register")
  )
    return null;
  if (!mounted) return null;

  // Floating trigger button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-safe right-3 sm:bottom-6 sm:right-6 z-40 group">
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 sm:w-15 sm:h-15 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
          aria-label="Open KCM Assistant"
          style={{ filter: "drop-shadow(0 8px 28px rgba(109,40,217,0.5))" }}
        >
          {/* Outer animated halo ring */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 opacity-20 animate-pulse scale-110 blur-sm pointer-events-none" />

          {/* Main button shell — glassmorphism */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 border border-white/20 shadow-2xl" />

          {/* Inner shimmer highlight */}
          <span className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full bg-white/10 pointer-events-none" />

          {/* Online status dot — top right, crisp */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-[1.5px] border-white dark:border-gray-900 shadow-sm" />
          </span>

          {/* Chatbot avatar */}
          <div className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center bg-purple-800/40">
            <Image
              src="/chatbot-bird-logo.png"
              alt="KCM AI Assistant"
              width={40}
              height={40}
              unoptimized
              className="object-cover rounded-full w-full h-full"
            />
          </div>
        </button>

        {/* Glassmorphism tooltip */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3.5 px-3 py-1.5 bg-gray-950/90 dark:bg-gray-900/90 backdrop-blur-xl text-white text-[11px] font-semibold rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none border border-white/10 hidden sm:block tracking-wide">
          Chat with KCM Assistant ✦
          {/* Arrow */}
          <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-gray-950/90 dark:border-l-gray-900/90" />
        </div>
      </div>
    );
  }

  const quickTopics = [
    {
      icon: Clock,
      label: "Sunday Service Timings",
      msg: "What are the Sunday service timings?",
    },
    {
      icon: MapPin,
      label: "Church Location & Map",
      msg: "Where is the church located?",
    },
    {
      icon: User,
      label: "Senior Pastor Info",
      msg: "Who is the Senior Pastor?",
    },
    {
      icon: HeartHandshake,
      label: "Submit Prayer Request",
      msg: "How can I submit a prayer request?",
    },
  ];

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300 ease-in-out shadow-2xl rounded-2xl overflow-hidden border border-gray-200/80 dark:border-gray-800",
        isMinimized
          ? "bottom-safe right-3 sm:bottom-6 sm:right-6 w-72 sm:w-80 h-[64px]"
          : "bottom-safe right-2 left-2 sm:left-auto sm:right-6 w-auto sm:w-[420px] h-[520px] sm:h-[620px] max-h-[calc(100dvh-5rem)]"
      )}
    >
      <div className="relative w-full h-full bg-white dark:bg-gray-950 flex flex-col">
        {/* Modern Header with subtle gradient */}
        <div
          className="px-4 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900 border-b border-purple-500/20 dark:border-gray-800 flex items-center justify-between cursor-pointer select-none"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-3 text-white">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 dark:bg-white/10 p-0.5 border border-white/30 dark:border-white/20 flex items-center justify-center">
                <Image
                  src="/chatbot-bird-logo.png"
                  alt="KCM Bot"
                  width={32}
                  height={32}
                  className="object-cover rounded-full"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-purple-700 dark:ring-gray-900"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm leading-tight text-white">KCM Assistant</h3>
                <span className="px-1.5 py-0.5 text-[9px] font-medium bg-white/20 dark:bg-purple-500/20 text-white dark:text-purple-300 rounded border border-white/30 dark:border-purple-400/30 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              </div>
              <p className="text-[11px] text-purple-100 dark:text-gray-300 font-normal flex items-center gap-1 mt-0.5">
                Always here to answer & guide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-purple-100 dark:text-gray-300">
            {messages.length > 0 && !isMinimized && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMessages([]);
                }}
                title="Clear chat"
                className="p-1.5 hover:bg-white/20 dark:hover:bg-white/10 hover:text-white rounded-md transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              title={isMinimized ? "Expand" : "Minimize"}
              className="p-1.5 hover:bg-white/20 dark:hover:bg-white/10 hover:text-white rounded-md transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMinimized ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              title="Close chat"
              className="p-1.5 hover:bg-red-500/30 dark:hover:bg-red-500/20 hover:text-white dark:hover:text-red-300 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-purple-50/20 dark:bg-gray-950" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="py-4 px-2 space-y-5 animate-fade-in">
                  {/* Hero Avatar Card */}
                  <div className="text-center bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-white dark:from-purple-950/30 dark:via-indigo-950/15 dark:to-gray-900/40 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-xs">
                    <div className="relative inline-block mb-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-500/20 mx-auto flex items-center justify-center">
                        <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full p-1 flex items-center justify-center overflow-hidden">
                          <Image
                            src="/chatbot-bird-logo.png"
                            alt="KCM Assistant"
                            width={56}
                            height={56}
                            className="object-cover rounded-full"
                          />
                        </div>
                      </div>
                      <span className="absolute bottom-0 right-0 p-1 bg-purple-600 text-white rounded-full shadow-md">
                        <Sparkles className="w-3 h-3" />
                      </span>
                    </div>

                    <h4 className="font-heading font-semibold text-gray-900 dark:text-white text-base mb-1">
                      How can I help you today?
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xs mx-auto leading-relaxed">
                      Ask me about service times, location, prayer requests, or church events.
                    </p>
                  </div>

                  {/* Quick Topics */}
                  <div>
                    <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-2.5 px-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 text-purple-600 dark:text-purple-400" /> Suggested Questions
                    </div>
                    <div className="space-y-2">
                      {quickTopics.map(({ icon: Icon, label, msg }) => (
                        <button
                          key={label}
                          onClick={() => append({ role: "user", content: msg })}
                          className="w-full text-left p-3 bg-white dark:bg-gray-900/90 border border-purple-100/80 dark:border-gray-800 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/60 dark:hover:bg-purple-900/20 hover:shadow-sm text-xs font-medium text-gray-800 dark:text-gray-200 flex items-center justify-between transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-purple-100/70 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">{label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-2.5 max-w-[92%] animate-fade-in",
                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold shadow-sm overflow-hidden mt-0.5",
                      m.role === "user"
                        ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    )}
                  >
                    {m.role === "user" ? (
                      "You"
                    ) : (
                      <Image
                        src="/chatbot-bird-logo.png"
                        alt="KCM Bot"
                        width={28}
                        height={28}
                        className="object-cover rounded-full"
                      />
                    )}
                  </div>
                  <div
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm",
                      m.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs"
                        : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-tl-xs border border-gray-200/80 dark:border-gray-800"
                    )}
                  >
                    <SimpleMarkdown content={m.content} />
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 mr-auto max-w-[85%] animate-fade-in">
                  <div className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                    <Image
                      src="/chatbot-bird-logo.png"
                      alt="KCM Bot"
                      width={28}
                      height={28}
                      className="object-cover rounded-full"
                    />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 rounded-tl-xs border border-gray-200/80 dark:border-gray-800 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-gray-950 border-t border-gray-200/80 dark:border-gray-800">
              <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim()) handleSubmit(e as any);
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 max-h-28 min-h-[44px] px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all text-xs sm:text-sm outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  disabled={isLoading}
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="h-[44px] px-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl disabled:opacity-40 transition-all shadow-md hover:shadow-purple-500/25 flex items-center justify-center shrink-0 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  Powered by KCM AI • Instant Answers
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}