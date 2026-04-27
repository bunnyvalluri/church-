"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Sparkles, Send, X, MessageCircle, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 hover:shadow-purple-500/50 transition-all duration-300 z-50 group hover-lift animate-bounce-in"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
        </span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-500 ease-in-out",
        isMinimized
          ? "bottom-6 right-6 w-72 h-14"
          : "bottom-6 right-6 w-[90vw] md:w-96 h-[600px] max-h-[80vh]",
      )}
    >
      <div className="relative w-full h-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div
          className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-between cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold">Pastor AI Assistant</h3>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">
              How can I help you today?
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Ask me about sermons, prayer requests, or church events.
            </p>
            <div className="grid gap-2">
              <button
                onClick={() => append({ role: 'user', content: "When is the next service?" })}
                className="text-sm bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:shadow-sm text-left transition-all"
              >
                🕒 When is the next service?
              </button>
              <button
                onClick={() => append({ role: 'user', content: "Can you pray for my anxiety?" })}
                className="text-sm bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:shadow-sm text-left transition-all"
              >
                🙏 Can you pray for my anxiety?
              </button>
            </div>
          </div>
        )}

        {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      m.role === "user"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-indigo-100 text-indigo-600"
                    )}
                  >
                    {m.role === "user" ? (
                      <div className="w-4 h-4 font-bold">You</div>
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-3 rounded-2xl text-sm shadow-sm",
                      m.role === "user"
                        ? "bg-purple-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 mr-auto max-w-[85%] animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 rounded-tl-none border border-gray-100 dark:border-gray-700">
                    <div className="flex gap-1 h-5 items-center">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <div className="text-xs text-red-500 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg mx-4 text-center">
                  Connection issue. Please try again.
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask something..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors shadow-md"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
