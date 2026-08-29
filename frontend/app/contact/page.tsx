"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Phone, MapPin, Mail, ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          subject: "Contact Form Inquiry",
          message: formData.message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to send message. Please try again.");
      }

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      console.error("[CONTACT_FORM_ERROR]", err);
      setStatus("error");
      setErrorMessage(err?.message || "Unable to send message. Please try again or reach out directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080914] font-sans antialiased text-slate-900 dark:text-slate-100 selection:bg-orange-500 selection:text-white transition-colors duration-200">
      <Navbar />

      {/* ── Top Hero Banner ── */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-slate-900 text-white overflow-hidden">
        {/* Ambient Dark Overlay with Subtle Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950 pointer-events-none z-10" />
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,87,0,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_50%)] pointer-events-none z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Contact <span className="text-[#f95700]">Us</span>
          </h1>
          <div className="flex items-center gap-2 mt-3 text-sm font-semibold">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-[#f95700] text-base">•</span>
            <span className="text-[#f95700]">Contact Us</span>
          </div>
        </div>
      </section>

      {/* ── 3-Column Floating Info Cards Banner ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-30">
        <div className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x md:divide-slate-200 dark:md:divide-slate-800">
            {/* 1. Contact Us */}
            <div className="flex flex-col justify-between space-y-4 md:pr-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800/80">
                  <Phone className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Contact Us</h3>
                  <a
                    href="tel:9704090069"
                    className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-[#f95700] dark:hover:text-[#f95700] transition-colors mt-1 block font-medium"
                  >
                    9704090069
                  </a>
                </div>
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#f95700] shadow-sm shadow-orange-500/50" />
            </div>

            {/* 2. Location */}
            <div className="flex flex-col justify-between space-y-4 md:px-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800/80">
                  <MapPin className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Location</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1 font-medium">
                    DOOR NO.119/A, pochamma, temple, IDA Jeedimetla,SUBHASHNAGAR, Qutubullapur, 500055, K.V.RANGAREDDY, Telangana
                  </p>
                </div>
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#f95700] shadow-sm shadow-orange-500/50" />
            </div>

            {/* 3. E-Mail Us */}
            <div className="flex flex-col justify-between space-y-4 md:pl-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800/80">
                  <Mail className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">E-Mail Us</h3>
                  <a
                    href="mailto:kcm.kristhraj2004@gmail.com"
                    className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-[#f95700] dark:hover:text-[#f95700] transition-colors mt-1 block font-medium break-all"
                  >
                    kcm.kristhraj2004@gmail.com
                  </a>
                </div>
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#f95700] shadow-sm shadow-orange-500/50" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Two-Column Contact Section ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left Column: Official Portrait of Bishop Kurra Kristhu Raju */}
          <div className="relative w-full aspect-square sm:aspect-[4/4.5] max-w-md mx-auto lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group">
            <Image
              src="/pastor.png"
              alt="Bishop Kurra Kristhu Raju"
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
              priority
            />
            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 text-white z-10">
              <p className="text-xs uppercase tracking-widest font-bold text-orange-300">Senior Pastor</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">Bishop Kurra Kristhu Raju</h3>
            </div>
          </div>

          {/* Right Column: "Get in to touch" Form */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Get in to touch
            </h2>

            {/* Success Banner */}
            {status === "success" && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Message Sent Successfully!</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Thank you for reaching out. We have received your inquiry and will connect with you shortly.
                  </p>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {status === "error" && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name */}
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  First Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f95700] focus:border-transparent transition-colors text-sm"
                />
              </div>

              {/* Email & Mobile Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    E mail
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your e-mail"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f95700] focus:border-transparent transition-colors text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mobile Number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Mobile Number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f95700] focus:border-transparent transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Message
                </label>
                <div className="relative">
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Write message"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f95700] focus:border-transparent transition-colors text-sm resize-none"
                  />
                  {/* Right Accent Indicator matching mockup */}
                  <span className="absolute right-0 top-3 bottom-3 w-1 bg-[#f95700] rounded-r-md pointer-events-none" />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#f95700] hover:bg-[#ea580c] text-white font-bold text-sm px-8 py-3.5 rounded-full inline-flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending...</span>
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

      <Footer />
    </div>
  );
}