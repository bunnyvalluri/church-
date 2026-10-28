"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { Calendar, MapPin, Clock, Users, Plus, Trash2, X, Loader2, Sparkles, Check } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attending?: number;
  category: string;
  description?: string;
  isDb?: boolean;
}

export default function PastorEventsPage() {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  const [searchQuery, setSearchQuery] = useState("");
  const [dbEvents, setDbEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and close on Escape key when Schedule Event modal is open
  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsModalOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isModalOpen]);

  // New Event Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("WORSHIP");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("10:00 AM");
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Default fallback items with translation keys mapped to current language
  const defaultEvents: EventItem[] = [
    {
      id: "1",
      title: t.event1Title,
      date: t.event1Date,
      time: t.event1Time,
      location: t.event1Location,
      attending: 450,
      category: "WORSHIP",
    },
    {
      id: "2",
      title: t.event2Title,
      date: t.event2Date,
      time: t.event2Time,
      location: t.event2Location,
      attending: 120,
      category: "PRAYER",
    },
    {
      id: "3",
      title: t.event3Title,
      date: t.event3Date,
      time: t.event3Time,
      location: t.event3Location,
      attending: 180,
      category: "YOUTH",
    },
    {
      id: "4",
      title: t.event4Title,
      date: t.event4Date,
      time: t.event4Time,
      location: t.event4Location,
      attending: 95,
      category: "FELLOWSHIP",
    },
    {
      id: "5",
      title: t.event5Title,
      date: t.event5Date,
      time: t.event5Time,
      location: t.event5Location,
      attending: 320,
      category: "PRAYER",
    },
    {
      id: "6",
      title: t.event6Title,
      date: t.event6Date,
      time: t.event6Time,
      location: t.event6Location,
      attending: 140,
      category: "SPECIAL",
    },
  ];

  // Fetch real events from DB
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pastor/events");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.events) && data.events.length > 0) {
        const mapped = data.events.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: new Date(e.date).toLocaleDateString(language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          time: e.time || "10:00 AM",
          location: e.location,
          attending: e.remainingSeats || 100,
          category: e.category || "WORSHIP",
          description: e.description,
          isDb: true,
        }));
        setDbEvents(mapped);
      } else {
        setDbEvents([]);
      }
    } catch (err) {
      console.error("Failed to load events from DB", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const allEvents = dbEvents.length > 0 ? dbEvents : defaultEvents;

  // Search filtering
  const filteredEvents = allEvents.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      e.title.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.date.toLowerCase().includes(q)
    );
  });

  // Category Translation Helper
  const getCategoryLabel = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "WORSHIP":
        return t.catWorship;
      case "PRAYER":
        return t.catPrayer;
      case "YOUTH":
        return t.catYouth;
      case "SPECIAL":
        return t.catSpecial;
      case "FESTIVAL":
        return t.catFestival;
      case "FELLOWSHIP":
        return t.catFellowship;
      default:
        return cat;
    }
  };

  // Category Color Helper
  const getCategoryBadgeClass = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "WORSHIP":
        return "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
      case "PRAYER":
        return "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
      case "YOUTH":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
      case "SPECIAL":
        return "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 border-purple-200 dark:border-purple-500/20";
      case "FESTIVAL":
        return "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
      case "FELLOWSHIP":
        return "bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400 border-teal-200 dark:border-teal-500/20";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  // Handle Event Creation
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newLocation) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/pastor/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          date: newDate,
          time: newTime,
          location: newLocation,
          description: newDescription || newTitle,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToastMsg(t.eventCreatedSuccess);
        setIsModalOpen(false);
        setNewTitle("");
        setNewDate("");
        setNewTime("10:00 AM");
        setNewLocation("");
        setNewDescription("");
        fetchEvents();
      } else {
        alert(data.error || "Failed to schedule event");
      }
    } catch (err) {
      console.error(err);
      alert("Error scheduling event");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToastMsg(""), 4000);
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async (id: string, isDb?: boolean) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    if (isDb) {
      try {
        const res = await fetch(`/api/pastor/events?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          setToastMsg(t.eventDeletedSuccess);
          fetchEvents();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setToastMsg(""), 4000);
      }
    } else {
      setDbEvents(dbEvents.filter((ev) => ev.id !== id));
      setToastMsg(t.eventDeletedSuccess);
      setTimeout(() => setToastMsg(""), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg("")} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <PastorPageHeader
        title={t.eventsPageTitle}
        subtitle={t.eventsPageSubtitle}
        badge={`${filteredEvents.length} ${t.upcomingEventsCountBadge}`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t.searchEventsPlaceholder}
        primaryActionLabel={t.scheduleNewEventBtn}
        onPrimaryAction={() => setIsModalOpen(true)}
        onRefresh={fetchEvents}
      />

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white/70 dark:bg-[#0E0F24]/70 backdrop-blur-xl p-12 rounded-3xl border border-slate-200/60 dark:border-white/[0.06] text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto" />
          <p className="text-sm font-bold text-slate-600 dark:text-gray-400">{t.noEventsFoundText}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((e) => (
            <div
              key={e.id}
              className="group bg-white/80 dark:bg-[#0E0F24]/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/70 dark:border-white/[0.07] shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all space-y-3 relative"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider border ${getCategoryBadgeClass(e.category)}`}>
                  {getCategoryLabel(e.category)}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(e.id, e.isDb)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                  title={t.deleteEventBtn}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {e.title}
              </h3>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300 pt-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>
                    {e.date} {t.atLabel} {e.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">{e.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>
                    {e.attending || 100} {t.attendingLabel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Event Modal (Portaled to document.body) */}
      {isModalOpen && mounted && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-event-modal-title"
        >
          <div
            className="w-full sm:max-w-xl bg-white dark:bg-[#0E0F24] border-t sm:border border-slate-200/90 dark:border-white/10 rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Pull Handle for Mobile */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:py-4 border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 id="schedule-event-modal-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    {t.scheduleModalTitle}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-gray-400 truncate">
                    {t.scheduleModalSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 -mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateEvent} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4 sm:space-y-4.5 overscroll-contain">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    {t.eventTitleLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Grand Worship Service"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                      {t.eventCategoryLabel} *
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="WORSHIP">{t.catWorship}</option>
                      <option value="PRAYER">{t.catPrayer}</option>
                      <option value="YOUTH">{t.catYouth}</option>
                      <option value="SPECIAL">{t.catSpecial}</option>
                      <option value="FESTIVAL">{t.catFestival}</option>
                      <option value="FELLOWSHIP">{t.catFellowship}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                      {t.eventDateLabel} *
                    </label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                      {t.eventTimeLabel} *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="e.g. 10:00 AM - 01:00 PM"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                      {t.eventLocationLabel} *
                    </label>
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Main Sanctuary, Shapur"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    {t.eventDescriptionLabel}
                  </label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Additional details or instructions..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50/90 dark:bg-[#0c0e1a]/95 backdrop-blur-md flex items-center justify-end gap-2.5 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all active:scale-95"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.schedulingEventBtn}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{t.saveEventBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
