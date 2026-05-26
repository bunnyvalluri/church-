"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowLeft, CheckCircle2, UserCheck, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
}

export default function MemberEvents() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [mounted, status, router]);

  const loadEventsData = useCallback(async () => {
    if (user?.uid) {
      try {
        const res = await fetch(`/api/member/events?userId=${user.uid}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setEvents(data.events || []);
          setRegisteredIds(data.registeredEventIds || []);
        }
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [user?.uid]);

  useEffect(() => {
    if (status === "authenticated" && user?.uid) {
      loadEventsData();
    }
  }, [user, status, loadEventsData]);

  const handleRegister = async (eventId: string) => {
    setProcessingId(eventId);
    try {
      const res = await fetch("/api/member/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          eventId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegisteredIds(prev => [...prev, eventId]);
      }
    } catch (err) {
      console.error("Failed to register:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-800 dark:text-gray-200 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          href="/member"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline transition-all"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              Church Programs & Events
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Participate in worship services, fellowship camps, and local ministries
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-white dark:bg-gray-800/20 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800/40 rounded-3xl p-8 border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500">No upcoming events listed at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => {
              const isRegistered = registeredIds.includes(event.id);
              
              return (
                <div 
                  key={event.id}
                  className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-150 dark:border-white/5 shadow-md p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900/40"
                >
                  <div className="space-y-4 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-full">
                        {event.category}
                      </span>
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-950 dark:text-white leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        {new Date(event.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        {event.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isRegistered ? (
                      <span className="px-5 py-3.5 bg-green-500 text-white rounded-2xl font-bold text-sm shadow-md flex items-center gap-1.5 select-none">
                        <UserCheck className="w-4.5 h-4.5" />
                        Registered
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={processingId === event.id}
                        onClick={() => handleRegister(event.id)}
                        className="px-5 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm flex items-center gap-1.5 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {processingId === event.id ? (
                          <>
                            <Loader2 className="w-4.5 h-4.5 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            Register to Attend
                          </>
                        )}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
