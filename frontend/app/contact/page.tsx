"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Phone, 
  MapPin, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  MessageCircle, 
  Clock, 
  Sparkles,
  ShieldCheck,
  Send
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "General Inquiry",
    message: "",
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const categories = [
    "General Inquiry",
    "Pastoral Prayer",
    "Counseling",
    "Ministries & Volunteering",
    "Donations & Giving"
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: `[${formData.category}] Contact Form Inquiry`,
          message: formData.message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to send message. Please try again.");
      }

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", category: "General Inquiry", message: "" });
    } catch (err: any) {
      console.error("[CONTACT_FORM_ERROR]", err);
      setStatus("error");
      setErrorMessage(err?.message || "Unable to send message. Please try again or reach out directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070814] font-sans antialiased text-slate-900 dark:text-slate-100 selection:bg-[#f95700] selection:text-white transition-colors duration-200">
      <Navbar />

      {/* ── Top Hero Banner ── */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-[#090b17] text-white overflow-hidden">
        {/* Ambient Dark Overlay with Subtle Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060710]/90 via-[#0a0c1e]/90 to-[#070814] pointer-events-none z-10" />
        
        {/* Glow Spheres */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[#f95700]/15 rounded-full blur-[120px] pointer-events-none z-10" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-orange-400 mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#f95700]" />
            <span>Kingdom of Christ Ministries • Hyderabad</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-outfit">
            Contact <span className="text-[#f95700] drop-shadow-sm">Us</span>
          </h1>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 mt-4 text-sm font-semibold">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-[#f95700] text-base">•</span>
            <span className="text-[#f95700]">Contact Us</span>
          </nav>
        </div>
      </section>

      {/* ── 3-Column Floating Info Cards Banner ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-30">
        <div className="bg-white/95 dark:bg-[#0c0e22]/95 border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 sm:p-8 lg:p-10 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 md:divide-x md:divide-slate-200/80 dark:md:divide-white/10">
            
            {/* 1. Contact Us */}
            <div className="flex flex-col justify-between space-y-5 md:pr-4 lg:pr-6 group">
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-2xl border border-slate-200 dark:border-white/15 flex items-center justify-center shrink-0 bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-white/5 dark:to-orange-500/10 shadow-sm group-hover:scale-105 group-hover:border-orange-500/50 transition-all duration-300">
                  <Phone className="w-5 h-5 text-slate-800 dark:text-slate-100 group-hover:text-[#f95700] transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Contact Us</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <a
                      href="tel:+919704090069"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-[#f95700] dark:hover:text-[#f95700] transition-colors"
                    >
                      9704090069
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy("9704090069", "phone")}
                      className="p-1 rounded-md text-slate-400 hover:text-[#f95700] hover:bg-orange-50 dark:hover:bg-white/5 transition-all"
                      title="Copy phone number"
                    >
                      {copiedKey === "phone" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Direct Pastoral Line & WhatsApp
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#f95700] shadow-[0_0_12px_rgba(249,87,0,0.6)] animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Live Support</span>
              </div>
            </div>

            {/* 2. Location */}
            <div className="flex flex-col justify-between space-y-5 md:px-4 lg:px-6 group">
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-2xl border border-slate-200 dark:border-white/15 flex items-center justify-center shrink-0 bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-white/5 dark:to-orange-500/10 shadow-sm group-hover:scale-105 group-hover:border-orange-500/50 transition-all duration-300">
                  <MapPin className="w-5 h-5 text-slate-800 dark:text-slate-100 group-hover:text-[#f95700] transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Location</h3>
                    <a
                      href="https://maps.google.com/?q=Kingdom+of+Christ+Ministries+Jeedimetla+Hyderabad"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#f95700] hover:underline flex items-center gap-1"
                    >
                      Directions <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1 font-medium">
                    DOOR NO.119/A, pochamma, temple, IDA Jeedimetla, SUBHASHNAGAR, Qutubullapur, 500055, K.V.RANGAREDDY, Telangana
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#f95700] shadow-[0_0_12px_rgba(249,87,0,0.6)] animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Main Headquarters</span>
              </div>
            </div>

            {/* 3. E-Mail Us */}
            <div className="flex flex-col justify-between space-y-5 md:pl-4 lg:pl-6 group">
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-2xl border border-slate-200 dark:border-slate-white/15 flex items-center justify-center shrink-0 bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-white/5 dark:to-orange-500/10 shadow-sm group-hover:scale-105 group-hover:border-orange-500/50 transition-all duration-300">
                  <Mail className="w-5 h-5 text-slate-800 dark:text-slate-100 group-hover:text-[#f95700] transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">E-Mail Us</h3>
                  
                  {/* Primary Email */}
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <a
                      href="mailto:kingofchristministries23@gmail.com"
                      className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-[#f95700] dark:hover:text-[#f95700] transition-colors truncate"
                      title="kingofchristministries23@gmail.com"
                    >
                      kingofchristministries23@gmail.com
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy("kingofchristministries23@gmail.com", "email1")}
                      className="p-1 rounded-md text-slate-400 hover:text-[#f95700] hover:bg-orange-50 dark:hover:bg-white/5 transition-all shrink-0"
                    >
                      {copiedKey === "email1" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Secondary Email */}
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <a
                      href="mailto:kcm.kristhraj2004@gmail.com"
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#f95700] dark:hover:text-[#f95700] transition-colors truncate"
                      title="kcm.kristhraj2004@gmail.com"
                    >
                      kcm.kristhraj2004@gmail.com
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy("kcm.kristhraj2004@gmail.com", "email2")}
                      className="p-1 rounded-md text-slate-400 hover:text-[#f95700] hover:bg-orange-50 dark:hover:bg-white/5 transition-all shrink-0"
                    >
                      {copiedKey === "email2" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#f95700] shadow-[0_0_12px_rgba(249,87,0,0.6)] animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">24/7 Monitored Inbox</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Main Two-Column Section: Portrait & Form ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column (5 cols): Official Portrait of Bishop Kurra Kristhu Raju */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative w-full aspect-[4/4.6] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/10 bg-[#0c0e22] group">
              <Image
                src="/pastor.png"
                alt="Bishop Kurra Kristhu Raju"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                priority
              />
              
              {/* Subtle Vignette Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Pastor Credentials Floating Tag */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-white z-10">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-orange-400 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Senior Pastor & Founder</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight font-outfit">
                  Bishop Kurra Kristhu Raju
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  Serving Kingdom of Christ Ministries with faith, compassion, and divine purpose across Hyderabad.
                </p>
              </div>
            </div>

            {/* Quick Action Hub under Portrait */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://wa.me/919704090069?text=Praise%20the%20Lord%20Pastor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Pastor</span>
              </a>

              <a
                href="tel:+919704090069"
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-[#f95700] font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Phone className="w-4 h-4" />
                <span>Call Directly</span>
              </a>
            </div>
          </div>

          {/* Right Column (7 cols): "Get in to touch" Form */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0c0e22]/90 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-10 lg:p-11 shadow-xl relative">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-outfit">
                Get in to touch
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Have a prayer request, testimony, or inquiry? Send us a message and our pastoral team will connect with you.
              </p>
            </div>

            {/* Success Feedback Modal / Card */}
            {status === "success" && (
              <div className="mb-6 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-4 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Message Received with Blessing!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
                    Thank you for reaching out to Kingdom of Christ Ministries. Your inquiry has been routed to our ministry desk.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 underline hover:no-underline"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            )}

            {/* Error Feedback */}
            {status === "error" && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 animate-in fade-in duration-300">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-300">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Inquiry Category Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Inquiry Purpose
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                      className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                        formData.category === cat
                          ? "bg-[#f95700] text-white border-[#f95700] shadow-sm shadow-orange-500/30"
                          : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-orange-500/40"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* First Name */}
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  First Name <span className="text-orange-500">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your Name"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#070814] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f95700] focus:border-transparent transition-all text-sm font-medium"
                />
              </div>

              {/* Email & Mobile Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    E mail <span className="text-orange-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your e-mail"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#070814] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f95700] focus:border-transparent transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mobile Number <span className="text-orange-500">*</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Mobile Number"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#070814] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f95700] focus:border-transparent transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="contact-message" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Message <span className="text-orange-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    {formData.message.length}/1000
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    maxLength={1000}
                    rows={4}
                    placeholder="Write message..."
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#070814] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f95700] focus:border-transparent transition-all text-sm font-medium resize-none"
                  />
                  {/* Vertical Accent Pill */}
                  <span className="absolute right-0 top-3 bottom-3 w-1.5 bg-[#f95700] rounded-r-md pointer-events-none" />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[#f95700] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white font-extrabold text-sm px-9 py-4 rounded-full inline-flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* ── Sanctuary Service Timings & Direct Location Map Section ── */}
      <section className="border-t border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-[#090a1b]/50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            {/* Worship Times */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                <span>Sanctuary Timings</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-outfit">
                Join Us in Worship
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 dark:bg-white/5">
                  <span className="font-semibold">Sunday 1st Service</span>
                  <span className="font-mono text-[#f95700] font-bold">10:00 AM</span>
                </li>
                <li className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 dark:bg-white/5">
                  <span className="font-semibold">Sunday 2nd Service</span>
                  <span className="font-mono text-[#f95700] font-bold">12:30 PM</span>
                </li>
                <li className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 dark:bg-white/5">
                  <span className="font-semibold">Sunday Evening Service</span>
                  <span className="font-mono text-[#f95700] font-bold">06:00 PM</span>
                </li>
                <li className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 dark:bg-white/5">
                  <span className="font-semibold">Friday Fasting Prayer</span>
                  <span className="font-mono text-[#f95700] font-bold">10:30 AM</span>
                </li>
              </ul>
            </div>

            {/* Interactive Location Map */}
            <div className="lg:col-span-2 rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-white/10 h-72 sm:h-80 relative bg-slate-900">
              <iframe
                title="Kingdom of Christ Ministries Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3804.839846399432!2d78.441865!3d17.514032!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb90325fa12d27%3A0x6ec0c6efb18d2bf4!2sSubhash%20Nagar%20Colony%2C%20Jeedimetla%2C%20Hyderabad%2C%20Telangana%20500055!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "contrast(1.05) brightness(0.95)" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}