"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Calendar, MapPin, Clock, ArrowRight, Sparkles, Image as ImageIcon } from "lucide-react";
import io from "socket.io-client";
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

export default function Events() {
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
      console.warn("[LANDING/EVENTS] Failed to fetch dynamic events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();

    // Socket.io listener for immediate real-time auto refresh without reloading!
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });

    socket.on("event:uploaded", () => {
      console.log("[LANDING/EVENTS] Auto-refreshing event section due to live upload...");
      fetchEvents();
    });

    socket.on("new-event", () => {
      fetchEvents();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchEvents]);

  const displayList = events.length > 0 ? events : t.events.list.map((e, idx) => ({
    id: `static-${idx}`,
    title: e.title,
    description: "",
    date: e.date,
    time: e.time,
    location: e.location,
    category: e.category,
    image: undefined
  }));

  return (
    <section id="events" className="py-24 bg-slate-50 dark:bg-transparent relative z-10 transition-colors duration-300">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" /> Live Updates Enabled
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight">
            {t.events.title.split(" ")[0]}{" "}
            <span className="text-gradient">{t.events.title.split(" ").slice(1).join(" ")}</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-white/70">
            {t.events.subtitle}
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayList.map((event: any, index: number) => {
            const displayImage = event.image || (event.media && event.media[0]?.imageUrl);
            const branchName = event.branch?.name;

            return (
              <div
                key={event.id || index}
                className="group bg-white dark:bg-white/[0.02] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-2xl dark:hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 border border-slate-100 dark:border-white/[0.05] dark:backdrop-blur-3xl flex flex-col"
              >
                {/* Image Banner if available */}
                {displayImage ? (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={displayImage}
                      alt={event.title}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
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
                    {/* Category Badge */}
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

                    {/* Event Details */}
                    <div className="space-y-3 mb-8 font-medium text-sm">
                      <div className="flex items-center gap-3 text-slate-600 dark:text-white/70">
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        <span>{new Date(event.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
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

                  {/* Register Button */}
                  <a
                    href={`/events/${event.id || ""}`}
                    className="w-full py-3 bg-gradient-to-r from-primary to-primary-gradient-end text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95 text-sm"
                  >
                    {t.events.register}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Events */}
        <div className="mt-16 text-center">
          <a
            href="/events"
            className="inline-block px-8 py-4 bg-white dark:bg-white/[0.02] text-primary border border-primary/20 rounded-2xl font-semibold hover:bg-primary/5 dark:hover:bg-primary/10 dark:hover:border-primary/40 transition-all duration-300 hover:scale-105 backdrop-blur-md"
          >
            {t.events.viewAll}
          </a>
        </div>
      </div>
    </section>
  );
}
