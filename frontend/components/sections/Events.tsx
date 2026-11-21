"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Loader2,
  Ticket,
  Church,
  ArrowRight,
  Heart,
} from "lucide-react";
import { getSharedSocket } from "@/lib/socketClient";

const EventRegisterModal = dynamic(() => import("./EventRegisterModal"), { ssr: false });

interface DynamicEvent {
  id: string;
  title: string;
  shortDescription?: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image?: string;
  remainingSeats?: number | null;
  registrationRequired?: boolean;
  slug: string;
  branch?: { name: string };
  priority?: string;
}

// Helper function to robustly parse target date
function parseTargetDate(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  // If ISO format (contains T)
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d;
  }
  if (timeStr) {
    d = new Date(`${dateStr} ${timeStr}`);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function safeImgSrc(src: string | null | undefined): string {
  if (!src) return "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80";
  let clean = src.trim();
  if (clean.startsWith("https%3A") || clean.startsWith("http%3A")) {
    try {
      clean = decodeURIComponent(clean);
    } catch {}
  }
  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("//") ||
    clean.startsWith("data:") ||
    clean.startsWith("blob:")
  ) {
    return clean;
  }
  if (!clean.startsWith("/")) {
    clean = "/" + clean;
  }
  return clean;
}

// Countdown hook
function useCountdown(targetDate: string, targetTime?: string) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    const calculate = () => {
      const parsed = parseTargetDate(targetDate, targetTime);
      if (!parsed) {
        setTimeLeft(null);
        return;
      }

      const difference = parsed.getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  return timeLeft;
}

// Countdown display component with light & dark mode high contrast styling
function CountdownTimer({ date, time }: { date: string; time?: string }) {
  const timeLeft = useCountdown(date, time);
  if (!timeLeft) return null;

  return (
    <div className="grid grid-cols-4 gap-2 text-center p-3 bg-gradient-to-r from-indigo-50/90 via-purple-50/90 to-indigo-50/90 dark:from-slate-900/90 dark:via-indigo-950/40 dark:to-slate-900/90 border border-indigo-200/60 dark:border-indigo-500/20 rounded-2xl max-w-xs mx-auto md:mx-0 shadow-sm backdrop-blur-md">
      {[
        { label: "Days", value: timeLeft.days },
        { label: "Hrs", value: timeLeft.hours },
        { label: "Mins", value: timeLeft.minutes },
        { label: "Secs", value: timeLeft.seconds },
      ].map((item) => (
        <div key={item.label}>
          <span className="block text-base sm:text-lg font-black tracking-tight leading-none text-indigo-700 dark:text-indigo-400">{item.value}</span>
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-600 dark:text-slate-400 mt-1 block">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Events({ initialEvents = [] }: { initialEvents?: DynamicEvent[] }) {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<DynamicEvent[]>(initialEvents);
  const [loading, setLoading] = useState(initialEvents.length === 0);

  // Pure authentic events from database only — zero synthetic or fake cards
  const displayEvents = Array.isArray(events) ? events : [];

  // Registration Modal state (Code-split into EventRegisterModal)
  const [registerEvent, setRegisterEvent] = useState<DynamicEvent | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events/upcoming?limit=6");
      if (res.ok) {
        const data = await res.json();
        if (data.events) {
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
    if (initialEvents.length === 0) {
      fetchEvents();
    }

    let active = true;
    getSharedSocket().then((socket) => {
      if (!socket || !active) return;
      // Auto update landing page on modifications
      socket.on("event.created", () => fetchEvents());
      socket.on("event.updated", () => fetchEvents());
      socket.on("event.deleted", () => fetchEvents());
      socket.on("event.published", () => fetchEvents());
      socket.on("event.reorder", () => fetchEvents());
      socket.on("event:uploaded", () => fetchEvents());
    }).catch(() => {});

    return () => {
      active = false;
    };
  }, [fetchEvents]);

  // Format event date
  const formatEventDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parsed = Date.parse(dateStr);
    if (isNaN(parsed)) return dateStr;
    const dateObj = new Date(parsed);
    return dateObj.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section id="events" className="py-14 sm:py-20 lg:py-24 bg-slate-50 dark:bg-transparent relative z-10 transition-colors duration-300">
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 border border-indigo-500/20">
            <Sparkles className="w-3 h-3" /> {t.events.title}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
            {t.events.title.split(" ").length > 1 ? (
              <>
                {t.events.title.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="text-gradient">{t.events.title.split(" ").slice(-1)[0]}</span>
              </>
            ) : (
              <span className="text-gradient">{t.events.title}</span>
            )}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-white/70 px-2">
            {t.events.subtitle}
          </p>
        </div>

        {/* Grid of Events — Rich Dynamic Content with 100% High-Conversion CTAs */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 sm:h-96 bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : displayEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {displayEvents.map((event, index) => {
              const displayImage = safeImgSrc(event.image);
              const branchName = event.branch?.name;
              
              // Only render countdown on the absolute soonest event (index 0)
              const isFirst = index === 0;

              return (
                <div
                  key={event.id}
                  className="group bg-white dark:bg-slate-900/90 rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-2xl dark:hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 border border-slate-200/80 dark:border-slate-800 dark:backdrop-blur-3xl flex flex-col justify-between"
                >
                  <div>
                    {/* Image Banner with Smart Poster Canvas */}
                    <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 flex items-center justify-center">
                      <div className="relative z-10 w-full h-full">
                        <Image
                          src={displayImage}
                          alt={event.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          loading="lazy"
                          decoding="async"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
                      
                      {branchName && (
                        <span className="absolute bottom-3 left-3 z-20 bg-indigo-600/95 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md shadow-xs border border-white/10 font-outfit">
                          {branchName}
                        </span>
                      )}

                      {event.priority && (
                        <span className={cn(
                          "absolute top-3 right-3 z-20 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs font-outfit border",
                          event.priority === "URGENT"
                            ? "bg-rose-600 text-white border-rose-400/30"
                            : event.priority === "FEATURED"
                            ? "bg-amber-500 text-slate-950 border-amber-300/40"
                            : "bg-violet-600 text-white border-violet-400/30"
                        )}>
                          {event.priority}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6 space-y-4">
                      {event.registrationRequired && typeof event.remainingSeats === "number" && (
                        <div className="flex items-center justify-end">
                          <span className={cn(
                            "text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full font-outfit",
                            event.remainingSeats > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          )}>
                            {event.remainingSeats > 0 ? `${event.remainingSeats} seats left` : "Waitlist Open"}
                          </span>
                        </div>
                      )}

                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-2 tracking-tight font-outfit">
                        {event.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-sans">
                        {event.shortDescription || event.description}
                      </p>

                      {/* Event Details Cluster */}
                      <div className="space-y-2 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-300 font-sans">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Calendar className="h-3.5 w-3.5" />
                          </div>
                          <span>{formatEventDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <MapPin className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>

                      {/* Render Countdown on first card */}
                      {isFirst && (
                        <div className="pt-2">
                          <CountdownTimer date={event.date} time={event.time} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Button (Active High-Conversion Interface) */}
                  <div className="p-5 sm:p-6 pt-0">
                    {event.registrationRequired ? (
                      <button
                        type="button"
                        onClick={() => setRegisterEvent(event)}
                        className="w-full min-h-[42px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-outfit"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>{language === "te" ? "రిజిస్టర్ చేసుకోండి" : language === "hi" ? "सीट आरक्षित करें" : "Reserve Free Ticket"}</span>
                      </button>
                    ) : (
                      <Link
                        href="#services"
                        className="w-full min-h-[42px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/90 dark:bg-white/[0.07] dark:hover:bg-white/[0.12] text-slate-800 dark:text-white font-extrabold text-xs border border-slate-200/80 dark:border-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 select-none font-outfit"
                      >
                        <Church className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                        <span>{language === "te" ? "ఆరాధన సమయాలు →" : language === "hi" ? "आराधना समय →" : "View Service Times →"}</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-6 bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 rounded-3xl max-w-md mx-auto shadow-sm backdrop-blur-sm">
            <div className="w-14 h-14 bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 font-outfit">
              {t.events.noEventsTitle || (language === "te" ? "ప్రస్తుతం షెడ్యూల్ చేసిన ఈవెంట్లు లేవు" : language === "hi" ? "फिलहाल कोई निर्धारित कार्यक्रम नहीं हैं" : "No Scheduled Events")}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 font-sans max-w-xs mx-auto">
              {t.events.noEventsDesc || (language === "te" ? "రాబోయే ప్రత్యేక ఆరాధనలు మరియు సమావేశాల వివరాలు ఇక్కడ ప్రచురించబడతాయి." : language === "hi" ? "आगामी विशेष आराधना और सम्मेलनों की जानकारी यहाँ प्रकाशित की जाएगी।" : "Special church conferences, youth conventions, and revival meetings will appear here when scheduled.")}
            </p>
            <Link
              href="#services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-600/25 active:scale-95 transition-all"
            >
              <span>{language === "te" ? "వారపు ఆరాధన సమయాలు చూడండి" : language === "hi" ? "साप्ताहिक आराधना समय देखें" : "View Weekly Services"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* ── Section Footer Action Bar ── */}
        {displayEvents.length > 0 && (
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
            <Link
              href="/events"
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white font-extrabold text-xs sm:text-sm border border-slate-200/90 dark:border-white/15 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 font-outfit"
            >
              <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>{language === "te" ? "అన్ని ఈవెంట్లు చూడండి" : language === "hi" ? "सभी कार्यक्रम देखें" : "Browse All Events"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/prayer"
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/30 dark:hover:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-extrabold text-xs sm:text-sm border border-violet-200/80 dark:border-violet-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 font-outfit"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>{language === "te" ? "ప్రార్థన విన్నపం" : language === "hi" ? "प्रार्थना अनुरोध" : "Need Prayer?"}</span>
            </Link>
          </div>
        )}

        {/* ── Code-Split Registration & Ticket Modal ── */}
        {registerEvent && (
          <EventRegisterModal
            event={registerEvent}
            onClose={() => setRegisterEvent(null)}
            formatEventDate={formatEventDate}
          />
        )}
      </div>
    </section>
  );
}
