"use client";

/**
 * components/admin/NotificationCenter.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Slide-in notification panel triggered by the header bell icon.
 * Features: list all notifications, mark individual/all as read, delete.
 * SWR-powered with 15s polling for real-time updates.
 */

import React, { useEffect, useRef } from "react";
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle,
  Gift,
  Users,
  Calendar,
  Loader2,
} from "lucide-react";
import { useNotifications, AppNotification } from "@/hooks/useNotifications";
import { useLanguage } from "@/components/providers/LanguageProvider";

// ── Icon per notification type ─────────────────────────────────────────────────
function NotifIcon({ type }: { type: string }) {
  const t = type?.toLowerCase() || "";
  if (t.includes("donation") || t.includes("payment"))
    return <Gift className="w-4 h-4 text-amber-500" />;
  if (t.includes("member") || t.includes("user"))
    return <Users className="w-4 h-4 text-emerald-500" />;
  if (t.includes("event"))
    return <Calendar className="w-4 h-4 text-pink-500" />;
  if (t.includes("success") || t.includes("approved"))
    return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  if (t.includes("warning") || t.includes("alert"))
    return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  return <Info className="w-4 h-4 text-indigo-500" />;
}

// ── Relative time helper ───────────────────────────────────────────────────────
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Single notification row ────────────────────────────────────────────────────
function NotifRow({
  notif,
  onMarkRead,
  onDelete,
}: {
  notif: AppNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`group relative flex gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-white/[0.03] transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.015] ${
        !notif.isRead ? "bg-indigo-50/40 dark:bg-indigo-500/[0.04]" : ""
      }`}
    >
      {/* Unread dot */}
      {!notif.isRead && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
      )}

      {/* Icon */}
      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
        <NotifIcon type={notif.type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold truncate ${notif.isRead ? "text-slate-600 dark:text-gray-300" : "text-slate-900 dark:text-white"}`}>
          {notif.title}
        </p>
        <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
          {notif.content}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] font-bold text-slate-300 dark:text-gray-600 uppercase tracking-wide">
            {relativeTime(notif.createdAt)}
          </span>
          {notif.link && (
            <a
              href={notif.link}
              className="inline-flex items-center gap-0.5 text-[9px] font-bold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300"
              target="_blank"
              rel="noreferrer"
            >
              View <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* Action buttons (appear on hover) */}
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!notif.isRead && (
          <button
            onClick={() => onMarkRead(notif.id)}
            title="Mark as read"
            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition-all"
          >
            <CheckCheck className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => onDelete(notif.id)}
          title="Delete"
          className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 flex items-center justify-center transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { language } = useLanguage();
  const { notifications, unreadCount, isLoading, markRead, markAllRead, deleteNotification } =
    useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const label = {
    title: language === "te" ? "నోటిఫికేషన్లు" : language === "hi" ? "सूचनाएं" : "Notifications",
    markAll: language === "te" ? "అన్నీ చదివినట్లు" : language === "hi" ? "सभी पढ़े" : "Mark all read",
    empty: language === "te" ? "నోటిఫికేషన్లు లేవు" : language === "hi" ? "कोई सूचना नहीं" : "No notifications yet",
    emptyDesc: language === "te" ? "మీరు అన్ని కార్యాచరణలపై తాజాగా ఉన్నారు." : language === "hi" ? "आप सभी गतिविधियों पर अप-टू-डेट हैं।" : "You are up to date on all platform activity.",
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col bg-white dark:bg-[#0C0D1E] border-l border-slate-200 dark:border-white/[0.06] shadow-2xl shadow-black/20 transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Notification Center"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.01] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{label.title}</h2>
              {unreadCount > 0 && (
                <p className="text-[10px] text-indigo-500 font-bold">
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                {label.markAll}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center justify-center transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] text-slate-300 dark:text-gray-600 flex items-center justify-center mb-4 border border-slate-200 dark:border-white/[0.06]">
                <Bell className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-700 dark:text-gray-300">
                {label.empty}
              </h3>
              <p className="text-xs text-slate-400 dark:text-gray-600 mt-1 max-w-[220px] leading-relaxed">
                {label.emptyDesc}
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <NotifRow
                key={notif.id}
                notif={notif}
                onMarkRead={markRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01] shrink-0">
            <p className="text-[10px] text-center text-slate-400 dark:text-gray-600 font-semibold">
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""} — auto-refreshes every 15s
            </p>
          </div>
        )}
      </div>
    </>
  );
}
