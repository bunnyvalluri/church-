"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Send, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Simple markdown-to-JSX renderer (avoids ESM-only react-markdown package)
function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <h3 key={i} className="font-bold text-base mt-2">{line.slice(4)}</h3>;
        if (line.startsWith("## "))  return <h2 key={i} className="font-bold text-base mt-2">{line.slice(3)}</h2>;
        if (line.startsWith("# "))   return <h1 key={i} className="font-bold text-lg mt-2">{line.slice(2)}</h1>;
        if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
        if (line.trim() === "") return <br key={i} />;
        // Inline bold: **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**")
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function AIChat() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Vercel AI SDK hook
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/chat",
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!mounted) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-1 bg-white dark:bg-gray-900 rounded-full shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 z-50 flex items-center justify-center border-2 border-purple-500/20"
      >
        <div className="rounded-full overflow-hidden">
          <Image src="/chatbot-bird-logo.png" alt="KCM AI Assistant" width={48} height={48} className="object-cover" />
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300 ease-in-out shadow-2xl",
        isMinimized
          ? "bottom-6 right-6 w-72 h-[60px]"
          : "bottom-6 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[85vh]",
      )}
    >
      <div className="relative w-full h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col shadow-2xl">
        {/* Header */}
        <div
          className="px-5 py-4 bg-gray-900 dark:bg-black border-b border-gray-800 flex items-center justify-between cursor-pointer transition-colors hover:bg-gray-800 dark:hover:bg-gray-900"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-3 text-white">
            <div className="rounded-full overflow-hidden bg-white flex items-center justify-center shrink-0">
              <Image src="/chatbot-bird-logo.png" alt="Bot" width={32} height={32} className="object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">KCM Assistant</h3>
              <p className="text-[10px] text-green-400 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="p-1.5 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50 dark:bg-gray-900" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="text-center py-6 mt-4">
                  <div className="bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    <Image src="/chatbot-bird-logo.png" alt="Bot" width={64} height={64} className="object-cover" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                    How can I help you today?
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 px-4">
                    Ask me about service times, locations, prayer requests, or church events.
                  </p>
                  <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">Quick Topics</div>
                  <div className="grid grid-cols-2 gap-2 px-2">
                    {[
                      { label: "Sunday service timings?", msg: "What are the Sunday service timings?" },
                      { label: "Where is KCM located?", msg: "Where is the church located?" },
                      { label: "Who is Senior Pastor?", msg: "Who is the Senior Pastor?" },
                      { label: "Submit prayer request?", msg: "How can I submit a prayer request?" },
                    ].map(({ label, msg }) => (
                      <button
                        key={label}
                        onClick={() => append({ role: "user", content: msg })}
                        className="text-xs bg-white dark:bg-gray-800 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:shadow-sm text-left transition-all text-gray-700 dark:text-gray-300 flex items-center justify-between group"
                      >
                        <span className="truncate">{label}</span>
                        <Send className="w-3 h-3 text-gray-400 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-3 max-w-[90%]",
                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs shadow-sm overflow-hidden",
                      m.role === "user"
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                        : "bg-white"
                    )}
                  >
                    {m.role === "user" ? "You" : <Image src="/chatbot-bird-logo.png" alt="Bot" width={28} height={28} className="object-cover" />}
                  </div>
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                      m.role === "user"
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-tr-sm"
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-gray-700 leading-relaxed"
                    )}
                  >
                    <SimpleMarkdown content={m.content} />
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 mr-auto max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                    <Image src="/chatbot-bird-logo.png" alt="Bot" width={28} height={28} className="object-cover" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 rounded-tl-sm border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex gap-1.5 h-4 items-center">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="flex gap-2 items-end relative">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim()) handleSubmit(e as any);
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 max-h-32 min-h-[44px] px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm outline-none resize-none"
                  disabled={isLoading}
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="h-[44px] px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[10px] text-gray-400">Powered by advanced AI. Responses may vary.</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}