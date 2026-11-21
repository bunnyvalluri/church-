"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Youtube, ExternalLink, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SermonCinemaModalProps {
  sermon: {
    id?: string;
    title: string;
    pastor?: string;
    category?: string;
    videoId?: string;
    videoUrl?: string;
    directVideoUrl?: string;
  };
  onClose: () => void;
}

export default function SermonCinemaModal({ sermon, onClose }: SermonCinemaModalProps) {
  const [mounted, setMounted] = useState(false);
  const [playbackSource, setPlaybackSource] = useState<"direct" | "youtube">("direct");

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={sermon.title || "Sermon Video Player"}
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-950 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-white/15 animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar: Broadcast Brand + Source Toggle + Close Button */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/[0.05] border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
              <Youtube className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate font-outfit">
                {sermon.title}
              </h4>
              <p className="text-[10px] text-violet-300 truncate">
                {sermon.pastor || "Bishop Kurra Kristhu Raju"} • {sermon.category || "KCM Ministry Broadcast"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Dual-Stream Source Switcher: Direct HD Button First, YouTube Next */}
            <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/10 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setPlaybackSource("direct")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                  playbackSource === "direct"
                    ? "bg-violet-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                )}
              >
                Direct HD
              </button>
              <button
                type="button"
                onClick={() => setPlaybackSource("youtube")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                  playbackSource === "youtube"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                )}
              >
                YouTube
              </button>
            </div>

            {sermon.videoUrl && (
              <a
                href={sermon.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors active:scale-95"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3 text-slate-300" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close video player"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer border border-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Video Frame: 16:9 Cinema Aspect Ratio */}
        <div className="relative w-full pt-[56.25%] bg-black">
          {playbackSource === "direct" ? (
            <video
              src={sermon.directVideoUrl || "/gallery/pastor/pastor-video.mp4"}
              controls
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/${sermon.videoId || "B1M_Ls_vi4o"}?autoplay=1&playsinline=1&controls=1&fs=1&rel=0&modestbranding=1`}
              title={sermon.title || "KCM Sermon Broadcast"}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {playbackSource === "direct"
                ? "Direct HD Broadcast (Offline / Local MP4)"
                : "Kingdom of Christ Ministries • Official YouTube Broadcast"}
            </span>
          </span>
          <span className="hidden sm:inline text-[11px] text-slate-500">
            Press ESC to close
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
