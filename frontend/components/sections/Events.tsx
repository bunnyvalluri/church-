"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  QrCode,
  User,
  Mail,
  Phone,
  Ticket,
} from "lucide-react";
import io from "socket.io-client";

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

// Countdown hook
function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    const calculate = () => {
      const difference = +new Date(targetDate) - +new Date();
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
  }, [targetDate]);

  return timeLeft;
}

// Countdown display component
function CountdownTimer({ date }: { date: string }) {
  const timeLeft = useCountdown(date);
  if (!timeLeft) return null;

  return (
    <div className="grid grid-cols-4 gap-2 text-center p-3.5 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl text-white max-w-xs mx-auto md:mx-0">
      {[
        { label: "Days", value: timeLeft.days },
        { label: "Hrs", value: timeLeft.hours },
        { label: "Mins", value: timeLeft.minutes },
        { label: "Secs", value: timeLeft.seconds },
      ].map((item) => (
        <div key={item.label}>
          <span className="block text-base font-black tracking-tight leading-none text-indigo-400">{item.value}</span>
          <span className="text-[8px] uppercase tracking-wider font-bold text-slate-300 mt-1 block">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Events({ initialEvents = [] }: { initialEvents?: DynamicEvent[] }) {
  const { t } = useLanguage();
  const [events, setEvents] = useState<DynamicEvent[]>(initialEvents);
  const [loading, setLoading] = useState(initialEvents.length === 0);

  // Registration Modal state
  const [registerEvent, setRegisterEvent] = useState<DynamicEvent | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any | null>(null);
  const [regError, setRegError] = useState("");

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

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });

    // Auto update landing page on modifications
    socket.on("event.created", () => fetchEvents());
    socket.on("event.updated", () => fetchEvents());
    socket.on("event.deleted", () => fetchEvents());
    socket.on("event.published", () => fetchEvents());
    socket.on("event.reorder", () => fetchEvents());
    socket.on("event:uploaded", () => fetchEvents());

    return () => {
      socket.disconnect();
    };
  }, [fetchEvents]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEvent) return;

    setRegLoading(true);
    setRegError("");
    try {
      const res = await fetch(`/api/events/${registerEvent.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register.");
      }

      setTicketData({
        ...data.registration,
        isWaitlisted: data.isWaitlisted,
      });

      // Clear fields
      setName("");
      setEmail("");
      setPhone("");
    } catch (err: any) {
      setRegError(err.message || "An error occurred during registration.");
    } finally {
      setRegLoading(false);
    }
  };

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
    <section id="events" className="py-24 bg-slate-50 dark:bg-transparent relative z-10 transition-colors duration-300">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Live Booking Enabled
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight">
            Upcoming <span className="text-gradient">Events</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-white/70">
            Register to reserve a seat, download entry passes, and receive calendar updates.
          </p>
        </div>

        {/* Grid / Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => {
              const displayImage = event.image || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80";
              const branchName = event.branch?.name;
              
              // Only render countdown on the absolute soonest event (index 0)
              const isFirst = index === 0;

              return (
                <div
                  key={event.id}
                  className="group bg-white dark:bg-white/[0.02] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] dark:hover:shadow-2xl dark:hover:shadow-indigo-500/5 transition-all duration-500 hover:-translate-y-2 border border-slate-100 dark:border-white/[0.05] dark:backdrop-blur-3xl flex flex-col justify-between"
                >
                  <div>
                    {/* Image Banner */}
                    <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                      <Image
                        src={displayImage}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      
                      {branchName && (
                        <span className="absolute bottom-3 left-3 bg-indigo-600/90 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md">
                          {branchName}
                        </span>
                      )}

                      {event.priority === "URGENT" && (
                        <span className="absolute top-3 right-3 bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                          URGENT
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase">
                          {event.category}
                        </span>
                        
                        {event.registrationRequired && typeof event.remainingSeats === "number" && (
                          <span className={`text-[10px] font-bold ${event.remainingSeats > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                            {event.remainingSeats > 0 ? `${event.remainingSeats} seats left` : "Waitlist Open"}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">
                        {event.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {event.shortDescription || event.description}
                      </p>

                      {/* Event Details */}
                      <div className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span>{formatEventDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>

                      {/* Render Countdown on first card */}
                      {isFirst && (
                        <div className="pt-2">
                          <CountdownTimer date={`${event.date}T${event.time}`} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => setRegisterEvent(event)}
                      className="w-full h-11 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-black transition-all hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white"
                    >
                      {event.registrationRequired ? "Register / Reserve Seat" : "Attend Event"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.05] rounded-3xl max-w-md mx-auto shadow-sm backdrop-blur-sm">
            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Scheduled Events</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Check back soon for upcoming worship services, conferences, and fellowships.
            </p>
          </div>
        )}

        {/* ── Registration & Ticket Modal ──────────────────────────────────────── */}
        {registerEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(9,10,26,0.65)", backdropFilter: "blur(12px)" }}>
            <div className="bg-white dark:bg-[#0f1021] border border-slate-200/50 dark:border-white/[0.06] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="border-b border-slate-100 dark:border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl">
                    <Ticket className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {ticketData ? "Ticket Issued" : "Reserve Ticket"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{registerEvent.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setRegisterEvent(null);
                    setTicketData(null);
                    setRegError("");
                  }}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                {!ticketData ? (
                  /* Form */
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Full Name *
                      </label>
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                      />
                    </div>

                    {regError && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{regError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md hover:from-indigo-500 transition-all flex items-center justify-center gap-2"
                    >
                      {regLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Registration"}
                    </button>
                  </form>
                ) : (
                  /* QR PASS DISPLAY */
                  <div className="space-y-5 text-center animate-in fade-in duration-300">
                    <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-white">
                        {ticketData.isWaitlisted ? "Waitlist Confirmed" : "Ticket Confirmed!"}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {ticketData.isWaitlisted
                          ? "We have added you to the waitlist and will email you if seats open up."
                          : "We sent a confirmation email to you. Present this pass at entrance."}
                      </p>
                    </div>

                    {!ticketData.isWaitlisted && ticketData.qrCode && (
                      <div className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/10 rounded-2xl inline-block shadow-sm">
                        <Image src={ticketData.qrCode} alt="Ticket Code" width={160} height={160} className="mx-auto" />
                        <p className="text-[9px] font-black text-slate-400 tracking-wider mt-2 flex items-center justify-center gap-1">
                          <QrCode className="w-3.5 h-3.5 text-indigo-500" /> TICKET #{ticketData.id.toUpperCase()}
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl text-left text-[11px] text-slate-500 dark:text-slate-300 space-y-1">
                      <p><strong>Name:</strong> {ticketData.name}</p>
                      <p><strong>Email:</strong> {ticketData.email}</p>
                      <p><strong>Venue:</strong> {registerEvent.location}</p>
                      <p><strong>Date & Time:</strong> {formatEventDate(registerEvent.date)} at {registerEvent.time}</p>
                    </div>

                    <button
                      onClick={() => {
                        setRegisterEvent(null);
                        setTicketData(null);
                      }}
                      className="w-full h-11 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
                    >
                      Done / Close
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
