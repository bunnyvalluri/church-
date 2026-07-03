"use client";

import { memo, useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Calendar, MapPin, Clock, Sparkles } from "lucide-react";
import { useSocketEvent } from "@/hooks/useSocket";
import Image from "next/image";

interface DynamicEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image?: string;
  branch?: { name: string };
  media?: { imageUrl: string }[];
}

// ── Date formatter defined outside component (pure function, no deps) ─────────
function formatEventDate(dateStr: string): string {
  if (!dateStr) return "";
  const isIsoDate = /^\d{4}-\d{2}-\d{2}/.test(dateStr);
  if (!isIsoDate) return dateStr;
  const parsed = Date.parse(dateStr);
  if (isNaN(parsed)) return dateStr;
  return new Date(parsed).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// ── Individual event card (memoized) ──────────────────────────────────────────
interface EventCardProps {
  event: DynamicEvent;
  index: number;
}
const EventCard = memo(function EventCard({ event }: EventCardProps) {
  const displayImage = event.image || event.media?.[0]?.imageUrl;
  const branchName = event.branch?.name;

  return (
    <div className="group bg-white dark:bg-white/[0.02] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-2xl dark:hover:shadow-primary/10 transition-shadow duration-300 hover:-translate-y-2 border border-slate-100 dark:border-white/[0.05] dark:backdrop-blur-3xl flex flex-col will-change-auto">
      {/* Image Banner */}
      {displayImage ? (
        <div className="relative h-48 w-full overflow-hidden bg-slate-900">
          <Image
            src={displayImage}
            alt={event.title}
            fill
            loading="lazy"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          {branchName && (
            <span className="absolute bottom-3 left-3 bg-primary/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md">
              {branchName}
            </span>
          )}
        </div>
      ) : (
        <div className="h-2 bg-gradient-to-r from-violet-600 via-indigo-500 to-teal-400" />
      )}

      {/* Event Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20">
            {event.category}
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}
          <div className="space-y-3 font-medium text-sm">
            <div className="flex items-center gap-3 text-slate-600 dark:text-white/70">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>{formatEventDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-white/70">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>{event.time || "09:00 AM"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-white/70">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── Events section ─────────────────────────────────────────────────────────────
function Events() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<DynamicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events?limit=6&status=PUBLISHED");
      if (res.ok) {
        const data = await res.json();
        if (data.events && data.events.length > 0) {
          setEvents(data.events);
        }
      }
    } catch (err) {
      console.warn("[LANDING/EVENTS] Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ── Real-time refresh via shared singleton socket ──
  useSocketEvent("event:uploaded", fetchEvents);
  useSocketEvent("new-event", fetchEvents);

  return (
    <section
      id="events"
      className="py-24 bg-slate-50 dark:bg-transparent relative z-10 transition-colors duration-300"
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" /> Live Updates Enabled
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight">
            {t.events.title.split(" ")[0]}{" "}
            <span className="text-gradient">
              {t.events.title.split(" ").slice(1).join(" ")}
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-white/70">
            {t.events.subtitle}
          </p>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-white/[0.02] rounded-3xl overflow-hidden border border-slate-100 dark:border-white/[0.05] animate-pulse"
              >
                <div className="h-48 bg-slate-200 dark:bg-white/[0.03]" />
                <div className="p-6 space-y-4">
                  <div className="h-5 bg-slate-200 dark:bg-white/[0.03] rounded w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-white/[0.03] rounded w-1/2" />
                  <div className="h-4 bg-slate-200 dark:bg-white/[0.03] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <EventCard key={event.id || index} event={event} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.05] rounded-3xl max-w-md mx-auto shadow-sm backdrop-blur-sm">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No Upcoming Events
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We don't have any events scheduled at the moment. Please check
              back later or follow our announcements!
            </p>
          </div>
        )}

        {/* View All Events */}
        <div className="mt-16 text-center">
          <a
            href="/events"
            className="inline-block px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-2xl shadow-lg hover:bg-slate-800 dark:hover:bg-slate-100 hover:shadow-xl transition-shadow duration-300 hover:scale-105 active:scale-95"
          >
            {t.events.viewAll}
          </a>
        </div>
      </div>
    </section>
  );
}

export default memo(Events);
