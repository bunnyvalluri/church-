"use client";

import { useEffect, useState } from "react";
import { X, Bell, Calendar, MapPin, Upload, Play } from "lucide-react";

export interface NotificationData {
  id: string;
  type: "new-event" | "event-images-uploaded" | "status" | "custom" | "sermon-uploaded";
  title: string;
  description: string;
  timestamp: Date;
  icon?: "event" | "upload" | "bell" | "play";
  link?: string;
}

interface NotificationPopupProps {
  notification: NotificationData | null;
  onDismiss: () => void;
}

export default function NotificationPopup({ notification, onDismiss }: NotificationPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  const icons = {
    event: <Calendar className="w-5 h-5" />,
    upload: <Upload className="w-5 h-5" />,
    bell: <Bell className="w-5 h-5" />,
    play: <Play className="w-5 h-5" />,
  };

  const colors = {
    "new-event": {
      bg: "from-violet-600 to-indigo-600",
      ring: "ring-violet-500/30",
      badge: "bg-violet-500/10 text-violet-300 border-violet-500/20",
      label: "NEW EVENT",
    },
    "event-images-uploaded": {
      bg: "from-emerald-600 to-teal-600",
      ring: "ring-emerald-500/30",
      badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      label: "PHOTOS UPLOADED",
    },
    status: {
      bg: "from-amber-500 to-orange-600",
      ring: "ring-amber-500/30",
      badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      label: "STATUS UPDATE",
    },
    "sermon-uploaded": {
      bg: "from-fuchsia-600 to-purple-650",
      ring: "ring-fuchsia-500/30",
      badge: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20",
      label: "NEW SERMON",
    },
    custom: {
      bg: "from-blue-600 to-cyan-600",
      ring: "ring-blue-500/30",
      badge: "bg-blue-500/10 text-blue-300 border-blue-500/20",
      label: "NOTIFICATION",
    },
  };

  const scheme = colors[notification.type] || colors.custom;
  const iconEl = icons[notification.icon || "bell"];

  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] max-w-sm w-full transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-3xl bg-slate-900 border border-white/[0.08] shadow-2xl ring-1 ${scheme.ring}`}
      >
        {/* Gradient top bar */}
        <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${scheme.bg}`} />

        <div className="p-5 flex items-start gap-4">
          {/* Icon blob */}
          <div className={`shrink-0 bg-gradient-to-br ${scheme.bg} p-3 rounded-2xl shadow-lg`}>
            <div className="text-white">{iconEl}</div>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${scheme.badge}`}
              >
                {scheme.label}
              </span>
              <span className="text-[9px] text-slate-500 font-semibold ml-auto">
                {new Date(notification.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <h4 className="text-sm font-black text-white leading-tight truncate">
              {notification.title}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
              {notification.description}
            </p>
          </div>

          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="shrink-0 p-1.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-4">
          <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${scheme.bg} rounded-full animate-[shrink_8s_linear_forwards]`}
              style={{ animation: "shrink 8s linear forwards" }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}
