"use client";

import { useState } from "react";
import Image from "next/image";
import { Ticket, X, User, Mail, Phone, AlertCircle, CheckCircle, QrCode, Loader2 } from "lucide-react";

interface EventRegisterModalProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
  };
  onClose: () => void;
  formatEventDate: (dateStr: string) => string;
}

export default function EventRegisterModal({
  event,
  onClose,
  formatEventDate,
}: EventRegisterModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any | null>(null);
  const [regError, setRegError] = useState("");

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setRegLoading(true);
    setRegError("");
    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
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

      // Forward to Formspark for email notification
      try {
        const { submitToFormspark } = await import("@/lib/formspark");
        await submitToFormspark({
          formType: "Event RSVP Registration",
          name,
          email,
          phone: phone || undefined,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          subject: `Event RSVP: [${event.title}] from ${name}`,
        });
      } catch (fsErr) {
        console.warn("[EVENTS] Formspark submit notice:", fsErr);
      }

      setName("");
      setEmail("");
      setPhone("");
    } catch (err: any) {
      setRegError(err.message || "An error occurred during registration.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-event-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0f1021] border border-slate-200/50 dark:border-white/[0.06] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-100 dark:border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 id="modal-event-title" className="text-sm font-black text-slate-900 dark:text-white">
                {ticketData ? "Ticket Issued" : "Reserve Ticket"}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{event.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {!ticketData ? (
            /* Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="event-reg-name" className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Full Name *
                </label>
                <input
                  id="event-reg-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="event-reg-email" className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email Address *
                </label>
                <input
                  id="event-reg-email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="event-reg-phone" className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Mobile Number
                </label>
                <input
                  id="event-reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
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
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md hover:from-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                  <Image
                    src={ticketData.qrCode}
                    alt="Ticket Code"
                    width={160}
                    height={160}
                    loading="lazy"
                    decoding="async"
                    className="mx-auto"
                  />
                  <p className="text-[9px] font-black text-slate-400 tracking-wider mt-2 flex items-center justify-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-indigo-500" /> TICKET #{ticketData.id?.toUpperCase()}
                  </p>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl text-left text-[11px] text-slate-500 dark:text-slate-300 space-y-1">
                <p><strong>Name:</strong> {ticketData.name}</p>
                <p><strong>Email:</strong> {ticketData.email}</p>
                <p><strong>Venue:</strong> {event.location}</p>
                <p><strong>Date & Time:</strong> {formatEventDate(event.date)} at {event.time}</p>
              </div>

              <button
                onClick={onClose}
                className="w-full h-11 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Done / Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
