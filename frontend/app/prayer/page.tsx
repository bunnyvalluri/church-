"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import { 
  Heart, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Bell, 
  HeartHandshake, 
  Sparkles, 
  CheckCircle2, 
  Quote, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
  User,
  Calendar,
  Activity,
  Users,
  Briefcase,
  Sprout,
  Compass,
  Flame,
  HelpCircle,
  Copy,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

// ---------------------------------------------------------------------------
// 8 Canonical Prayer Categories with Language-Agnostic IDs
// ---------------------------------------------------------------------------
const CATEGORY_DEFINITIONS = [
  { 
    id: "healing",
    key: "healing", 
    defaultLabel: "Health & Healing", 
    icon: Activity,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-500/10 dark:bg-rose-500/20 border-rose-200/80 dark:border-rose-800/60"
  },
  { 
    id: "family",
    key: "family", 
    defaultLabel: "Family & Relationships", 
    icon: Users,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-200/80 dark:border-indigo-800/60"
  },
  { 
    id: "finance",
    key: "finance", 
    defaultLabel: "Financial Needs", 
    icon: Briefcase,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-200/80 dark:border-amber-800/60"
  },
  { 
    id: "growth",
    key: "growth", 
    defaultLabel: "Spiritual Growth", 
    icon: Sprout,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-200/80 dark:border-emerald-800/60"
  },
  { 
    id: "guidance",
    key: "guidance", 
    defaultLabel: "Guidance & Direction", 
    icon: Compass,
    iconColor: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-500/10 dark:bg-sky-500/20 border-sky-200/80 dark:border-sky-800/60"
  },
  { 
    id: "thanksgiving",
    key: "thanksgiving", 
    defaultLabel: "Thanksgiving & Praise", 
    icon: Sparkles,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-200/80 dark:border-amber-800/60"
  },
  { 
    id: "salvation",
    key: "salvation", 
    defaultLabel: "Salvation & Deliverance", 
    icon: Flame,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-200/80 dark:border-purple-800/60"
  },
  { 
    id: "other",
    key: "other", 
    defaultLabel: "Other Needs", 
    icon: HelpCircle,
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-500/10 dark:bg-violet-500/20 border-violet-200/80 dark:border-violet-800/60"
  }
];

// ---------------------------------------------------------------------------
// Isolated Prayer Request Form Component for Sub-100ms INP Response
// ---------------------------------------------------------------------------
interface PrayerFormCardProps {
  pageT: Record<string, any>;
  language: string;
}

const PrayerRequestFormCard = React.memo(function PrayerRequestFormCard({ pageT, language }: PrayerFormCardProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("healing");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [request, setRequest] = useState<string>("");
  const [anonymous, setAnonymous] = useState<boolean>(false);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  // Resolved Category Objects with localized labels
  const categories = useMemo(() => {
    return CATEGORY_DEFINITIONS.map((cat) => ({
      ...cat,
      label: pageT[cat.key] || cat.defaultLabel
    }));
  }, [pageT]);

  // Current active category label
  const activeCategory = useMemo(() => {
    const found = categories.find((c) => c.id === selectedCategoryId);
    return found ? found.label : categories[0].label;
  }, [categories, selectedCategoryId]);

  // Real-time client-side validation logic
  const isNameValid = anonymous || name.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isRequestValid = request.trim().length >= 5 && request.length <= 1000;
  const isFormValid = isNameValid && isEmailValid && isRequestValid;

  const handleCategoryClick = (catId: string) => {
    startTransition(() => {
      setSelectedCategoryId(catId);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { submitToFormspark } = await import("@/lib/formspark");
      const submitName = anonymous ? "Anonymous Prayer Request" : name.trim();

      const res = await submitToFormspark({
        formType: "Prayer Request",
        name: submitName,
        email: email.trim(),
        category: activeCategory,
        message: request.trim(),
        request: request.trim(),
        anonymous,
        urgent: isUrgent,
        subject: `${isUrgent ? "[URGENT PRAYER] " : ""}Prayer Request: [${activeCategory}] from ${submitName}`,
      });

      if (res && res.error) {
        throw new Error(res.error);
      }
      setIsSubmitted(true);
    } catch (err: any) {
      console.warn("[PRAYER_PAGE] Form submission notice:", err);
      setSubmitError(
        err?.message || (language === "te" 
          ? "ప్రార్థన విన్నపాన్ని సమర్పించడంలో సమస్య తలెత్తింది. దయచేసి మళ్ళీ ప్రయత్నించండి." 
          : language === "hi" 
          ? "प्रार्थना अनुरोध जमा करने में समस्या आई। कृपया पुनः प्रयास करें।" 
          : "Unable to submit your prayer request right now. Please check your network connection and try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setRequest("");
    setSelectedCategoryId("healing");
    setAnonymous(false);
    setIsUrgent(false);
    setSubmitError(null);
    setIsSubmitted(false);
  };

  return (
    <div 
      id="prayer-form" 
      className="scroll-mt-24 sm:scroll-mt-28 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-900/5 dark:shadow-black/25 mb-16 relative overflow-hidden transition-all duration-300"
    >
      {isSubmitted ? (
        /* Success Confirmation View */
        <div className="py-10 text-center animate-fade-in space-y-6">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 animate-bounce-in" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {pageT.successTitle || "Prayer Request Received!"}
          </h3>

          <p className="text-slate-700 dark:text-slate-300 max-w-lg mx-auto text-base sm:text-lg leading-relaxed font-medium">
            {pageT.successMessage || "Thank you for sharing your prayer request. Our prayer team will stand with you in faith and lift you up in prayer."}
          </p>

          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 max-w-md mx-auto text-xs text-purple-800 dark:text-purple-200 font-semibold italic">
            &quot;{pageT.verseText || "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."}&quot;
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={handleReset}
              className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{pageT.submitAnother || "Submit Another Request"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Form View */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/80 dark:border-purple-800/60 rounded-2xl text-purple-600 dark:text-purple-400">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {pageT.formTitle || "Send a Prayer Request"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
                  {pageT.promise || "We promise to pray for you."}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold self-start sm:self-auto shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{pageT.confidentialBadge || "100% Confidential & Sacred"}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Submit Error Notification Banner */}
            {submitError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-bold">Notice: </span>
                  {submitError}
                </div>
              </div>
            )}

            {/* Name & Email Row with Clean Leading Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className="block text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                  {pageT.name || "Your Name"}{" "}
                  {anonymous ? (
                    <span className="text-xs font-normal text-purple-600 dark:text-purple-400">
                      ({language === "te" ? "అనామకంగా ఐచ్ఛికం" : language === "hi" ? "अनाम होने पर वैकल्पिक" : "Optional when anonymous"})
                    </span>
                  ) : (
                    <span className="text-rose-500">*</span>
                  )}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required={!anonymous}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-semibold outline-none"
                    placeholder={anonymous ? "Anonymous (Optional)" : (pageT.name || "Your Name")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                  {pageT.email || "Your Email"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-semibold outline-none"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Prayer Category Selection: Non-Truncated Responsive Grid with Clean Text Wrapping */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-extrabold text-slate-900 dark:text-slate-100 font-outfit">
                  {pageT.category || "Prayer Category"} <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-extrabold font-outfit">
                  {pageT.quickSelect || "Quick Select Category"}
                </span>
              </div>

              {/* 2 columns on mobile/tablet, 4 columns on desktop with natural height & full text visibility */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`w-full min-h-[64px] sm:min-h-[68px] h-auto p-3 sm:px-3.5 sm:py-3 rounded-2xl text-xs sm:text-[13px] font-outfit font-bold transition-all duration-200 flex items-center justify-between gap-2.5 border cursor-pointer select-none active:scale-[0.98] text-left group ${
                        isActive
                          ? "bg-purple-50/90 dark:bg-purple-950/60 border-2 border-purple-600 dark:border-purple-500 text-purple-950 dark:text-white shadow-md shadow-purple-600/15 ring-2 ring-purple-500/20"
                          : "bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 hover:border-purple-300 dark:hover:border-purple-600/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-xl ${cat.iconBg} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-4 h-4 ${cat.iconColor}`} />
                        </div>
                        <span className="font-bold sm:font-extrabold leading-tight tracking-tight break-normal whitespace-normal text-slate-800 dark:text-slate-200">
                          {cat.label}
                        </span>
                      </div>
                      {isActive ? (
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs ml-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0 ml-1 opacity-40 group-hover:opacity-80" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prayer Request Input with Isolated Character Counter (0/1000) */}
            <div>
              <label className="block text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                {pageT.request || "Your Prayer Request"} <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                maxLength={1000}
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium leading-relaxed outline-none min-h-[130px] resize-none"
                placeholder={pageT.request || "Please share your prayer request details..."}
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 px-1 font-medium">
                <span>All requests are held in strict pastoral confidence.</span>
                <span className={request.length >= 1000 ? "text-rose-500 font-bold" : ""}>
                  {request.length}/1000
                </span>
              </div>
            </div>

            {/* Toggles Container: Urgent & Anonymous */}
            <div className="space-y-3 pt-1">
              {/* Urgent Prayer Request Toggle */}
              <div className={`p-4 rounded-2xl border transition-all duration-200 ${
                isUrgent 
                  ? "bg-amber-500/10 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/70 shadow-sm" 
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}>
                <label htmlFor="isUrgent" className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="isUrgent"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded-md border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                      <span>{pageT.urgent || "Mark as Urgent Prayer (Requires Immediate Pastoral Intercession)"}</span>
                    </div>
                    {isUrgent && (
                      <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold mt-1">
                        {pageT.urgentNote || "Our pastoral intercessory prayer team will be notified immediately."}
                      </p>
                    )}
                  </div>
                </label>
              </div>

              {/* Anonymous Checkbox */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <label htmlFor="anonymous" className="flex items-start gap-3 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-purple-600 rounded-md border-slate-300 dark:border-slate-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-extrabold">
                    <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>{pageT.anonymous || "Keep my prayer request anonymous (only visible to prayer team)"}</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button with Disabled / Loading State */}
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer min-h-[52px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{pageT.submitting || "Submitting Request..."}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{pageT.submit || "Submit Request"}</span>
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Main Prayer Page Component
// ---------------------------------------------------------------------------
export default function PrayerPage() {
  const { language, t } = useLanguage();
  const pageT = (t as any)?.prayer || (t as any)?.pages?.prayer || {};

  // Copy email state
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  // Auto-scroll to #prayer-form if visited directly with hash
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#prayer-form") {
      const el = document.getElementById("prayer-form");
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  }, []);

  const handleCopyEmail = async () => {
    try {
      const emailStr = "kingofchristministries23@gmail.com";
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(emailStr);
      } else {
        const ta = document.createElement("textarea");
        ta.value = emailStr;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch (err) {
      console.warn("Could not copy email:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* 🌌 Hero Banner — Continuous Ambient Gradient */}
      <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-28 md:pt-44 md:pb-32 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-25 dark:opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-400/25 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-400/25 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            
            {/* Inline Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="mb-5 flex justify-center">
              <ol className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-purple-200/60 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-2xs">
                <li className="inline-flex items-center">
                  <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {pageT.breadcrumbHome || (language === "te" ? "హోమ్" : language === "hi" ? "होम" : "Home")}
                  </Link>
                </li>
                <li className="text-slate-400 dark:text-slate-600">/</li>
                <li className="text-purple-700 dark:text-purple-300 font-bold" aria-current="page">
                  {pageT.breadcrumbPrayer || (language === "te" ? "ప్రార్థన విన్నపాలు" : language === "hi" ? "प्रार्थना निवेदन" : "Prayer Requests")}
                </li>
              </ol>
            </nav>

            {/* Subtle Hero Section Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/80 dark:border-purple-800/80 rounded-full text-purple-900 dark:text-purple-200 text-xs sm:text-sm font-extrabold tracking-wide mb-6 shadow-2xs backdrop-blur-md animate-bounce-in">
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500/30 animate-pulse" />
              <span>{pageT.heroSubtitle || (language === "te" ? "మేము ప్రార్థన శక్తిని నమ్ముచున్నాము" : language === "hi" ? "हम प्रार्थना की शक्ति में विश्वास करते हैं" : "We believe in the power of prayer")}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-5 tracking-tight leading-tight font-outfit">
              {pageT.title || (language === "te" ? "ప్రార్థన విన్నపాలు" : language === "hi" ? "प्रार्थना निवेदन" : "Prayer Requests")}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              {pageT.subtitle || (language === "te" ? "ఈ రోజు మేము మీ కోసం ఎలా ప్రార్థించగలం?" : language === "hi" ? "आज हम आपके लिए कैसे प्रार्थना कर सकते हैं?" : "How can we pray for you today?")}
            </p>
          </div>
        </div>
      </section>

      {/* 📖 Encouraging Scripture Floating Section */}
      <section className="relative -mt-10 sm:-mt-14 z-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-purple-200/80 dark:border-purple-900/50 rounded-3xl p-6 md:p-8 shadow-xl shadow-purple-950/5 dark:shadow-black/30 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group hover:border-purple-400 dark:hover:border-purple-600/50 transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 opacity-80" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="w-13 h-13 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-700/50 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
            <Quote className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <p className="text-slate-800 dark:text-slate-100 text-base md:text-lg font-outfit font-black tracking-tight leading-relaxed mb-3.5">
              &quot;{pageT.verseText || "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."}&quot;
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/80 dark:border-purple-800/60 text-purple-800 dark:text-purple-200 uppercase tracking-wider shadow-2xs">
              — {pageT.verseRef || "Philippians 4:6-7"}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">

            {/* Introduction Header */}
            <div className="text-center mb-12 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{pageT.howItWorksBadge || "Prayer Process"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                {pageT.howItWorksTitle || "How We Stand With You in Faith"}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-2xl mx-auto">
                {pageT.intro || "Our prayer team is here to stand with you in faith. Submit your prayer request below, and we will lift you up in prayer."}
              </p>
            </div>

            {/* How It Works Progression — Compact 2x2 on Mobile, 4-Column on Desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 mb-16">
              {[
                { 
                  step: "1", 
                  title: pageT.step1Title || "Submit", 
                  desc: pageT.step1Desc || "Share your prayer request", 
                  icon: <Send className="w-5 h-5 sm:w-6 sm:h-6" />,
                  iconStyle: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60",
                  badgeStyle: "bg-blue-100/90 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60",
                  cardHover: "hover:border-blue-400 dark:hover:border-blue-500/50",
                  accentLine: "from-blue-500 to-indigo-500"
                },
                { 
                  step: "2", 
                  title: pageT.step2Title || "Receive", 
                  desc: pageT.step2Desc || "Our team gets notified", 
                  icon: <Bell className="w-5 h-5 sm:w-6 sm:h-6" />,
                  iconStyle: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/60",
                  badgeStyle: "bg-purple-100/90 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60",
                  cardHover: "hover:border-purple-400 dark:hover:border-purple-500/50",
                  accentLine: "from-purple-500 to-indigo-500"
                },
                { 
                  step: "3", 
                  title: pageT.step3Title || "Pray", 
                  desc: pageT.step3Desc || "We pray for you", 
                  icon: <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />,
                  iconStyle: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60",
                  badgeStyle: "bg-rose-100/90 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60",
                  cardHover: "hover:border-rose-400 dark:hover:border-rose-500/50",
                  accentLine: "from-rose-500 to-pink-500"
                },
                { 
                  step: "4", 
                  title: pageT.step4Title || "Updates", 
                  desc: pageT.step4Desc || "Receive encouragement", 
                  icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />,
                  iconStyle: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60",
                  badgeStyle: "bg-amber-100/90 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60",
                  cardHover: "hover:border-amber-400 dark:hover:border-amber-500/50",
                  accentLine: "from-amber-500 to-orange-500"
                },
              ].map((item, index) => (
                <div 
                  key={index} 
                  className={`relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between group overflow-hidden ${item.cardHover}`}
                >
                  <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${item.accentLine}`} />
                  
                  <div className="flex flex-col items-center w-full">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 ${item.iconStyle} rounded-2xl flex items-center justify-center shadow-2xs mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>

                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap justify-center">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs ${item.badgeStyle}`}>
                        Step {item.step}
                      </span>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 📝 Isolated Prayer Form Component with Zero Full-Page Re-renders */}
            <PrayerRequestFormCard pageT={pageT} language={language} />

            {/* Direct Pastoral Contact Cards Grid — Safe Clearance, Break-All & Copy Email Support */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 mb-12">
              
              {/* Phone Card */}
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between group hover:border-blue-400 dark:hover:border-blue-500/50">
                <div className="w-13 h-13 sm:w-14 sm:h-14 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-200/80 dark:border-blue-800/60 rounded-2xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 shadow-2xs group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                
                <div className="mb-5 space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    <a href="tel:+919704090069" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      +91 97040 90069
                    </a>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <a href="tel:+919640943777" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      +91 96409 43777
                    </a>
                    {" • "}
                    <a href="tel:+917396433856" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      +91 73964 33856
                    </a>
                  </p>
                </div>

                <a 
                  href="tel:+919704090069"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-black rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{pageT.callAction || "Call Now"}</span>
                </a>
              </div>

              {/* Email Card with Break-All & 1-Click Copy Support */}
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between group hover:border-purple-400 dark:hover:border-purple-500/50">
                <div className="w-13 h-13 sm:w-14 sm:h-14 bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/80 dark:border-purple-800/60 rounded-2xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400 shadow-2xs group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                
                <div className="mb-5 w-full px-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white break-all mb-1 leading-snug select-all">
                    <a href="mailto:kingofchristministries23@gmail.com" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      kingofchristministries23@gmail.com
                    </a>
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {pageT.emailTitle || "Email Us"}
                  </span>
                </div>

                <div className="w-full flex items-center gap-2">
                  <a 
                    href="mailto:kingofchristministries23@gmail.com"
                    className="flex-1 py-3 px-3 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-black rounded-xl shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>{pageT.emailAction || "Send Email"}</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    aria-label="Copy email address"
                    title={copiedEmail ? "Copied!" : "Copy email address"}
                    className="p-3 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl transition active:scale-95 cursor-pointer flex items-center justify-center min-h-[44px] shrink-0"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 24/7 Prayer Support Card */}
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between sm:col-span-2 md:col-span-1 group hover:border-rose-400 dark:hover:border-rose-500/50">
                <div className="w-13 h-13 sm:w-14 sm:h-14 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-200/80 dark:border-rose-800/60 rounded-2xl flex items-center justify-center mb-4 text-rose-600 dark:text-rose-400 shadow-2xs group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 fill-rose-600/30 animate-pulse" />
                </div>
                
                <div className="mb-5">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                    24/7
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {pageT.supportTitle || "24/7 Support"}
                  </span>
                </div>

                <a 
                  href="tel:+919704090069"
                  className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-black rounded-xl shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{pageT.supportDesc || "Always here for you"}</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 🌌 Prayer Meetings Section with Uniform Heights across all 3 Campuses */}
      <section className="py-20 pb-32 sm:pb-36 bg-purple-50/70 dark:bg-slate-950 border-t border-purple-100 dark:border-slate-900 transition-colors duration-300 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            
            {/* Section Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/80 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs backdrop-blur-md">
              <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Weekly & Monthly Gatherings</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight font-outfit">
              {pageT.meetingsTitle || "Join Our Prayer Meetings"}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
              {pageT.meetingsSubtitle || "Gather with believers across our three campuses for fervent corporate prayer, healing, and spiritual breakthrough."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-12 items-stretch">
              {/* Shapur Nagar Location Card */}
              <Link 
                href="/locations#shapur"
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500/60 rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-2xl hover:-translate-y-1 cursor-pointer transition-all duration-300 group/loc flex flex-col justify-between h-full relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="px-3 py-1 bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 rounded-full text-xs font-extrabold shadow-2xs">
                        {pageT.friday || "Friday Evening"}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-slate-700">
                        Main Campus
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl mb-1 group-hover/loc:text-rose-600 dark:group-hover/loc:text-rose-400 transition-colors">
                      {pageT.shapurLoc || "Shapur Nagar Location"}
                    </h3>

                    <p className="text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 mb-4 min-h-[40px]">
                      {pageT.shapurServiceType || "Weekly Fasting & Healing Prayer Service"}
                    </p>
                  </div>

                  <div className="space-y-2.5 mb-6 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{pageT.shapurTime || "Every Friday • 6:00 PM – 8:30 PM"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">Vivekananda Nagar, Jeedimetla, Hyderabad</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-extrabold text-rose-600 dark:text-rose-400 group-hover/loc:translate-x-0.5 transition-transform">
                  <span>{pageT.getDirections || "Get Directions & Campus Info"}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              {/* Subhash Nagar Location Card */}
              <Link 
                href="/locations#subhash"
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/60 rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-2xl hover:-translate-y-1 cursor-pointer transition-all duration-300 group/loc flex flex-col justify-between h-full relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="px-3 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full text-xs font-extrabold shadow-2xs">
                        {pageT.thursday || "Thursday Evening"}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-slate-700">
                        Midweek Service
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl mb-1 group-hover/loc:text-purple-600 dark:group-hover/loc:text-purple-400 transition-colors">
                      {pageT.subhashLoc || "Subhash Nagar Location"}
                    </h3>

                    <p className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400 mb-4 min-h-[40px]">
                      {pageT.subhashServiceType || "Oil Anointing & Deliverance Prayer Service"}
                    </p>
                  </div>

                  <div className="space-y-2.5 mb-6 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>{pageT.subhashTime || "Every Thursday • 6:30 PM – 9:00 PM"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">Subhash Nagar, LP 119, Jeedimetla, Hyderabad</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-extrabold text-purple-600 dark:text-purple-400 group-hover/loc:translate-x-0.5 transition-transform">
                  <span>{pageT.getDirections || "Get Directions & Campus Info"}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              {/* Bahadurpally Location Card */}
              <Link 
                href="/locations#bahadur"
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-2xl hover:-translate-y-1 cursor-pointer transition-all duration-300 group/loc flex flex-col justify-between h-full relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 rounded-full text-xs font-extrabold shadow-2xs">
                        {pageT.tuesday || "2nd Tuesday"}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-slate-700">
                        Monthly Special
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl mb-1 group-hover/loc:text-indigo-600 dark:group-hover/loc:text-indigo-400 transition-colors">
                      {pageT.bahadurLoc || "Bahadurpally Location"}
                    </h3>

                    <p className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-4 min-h-[40px]">
                      {pageT.bahadurServiceType || "Monthly Special Breakthrough Prayer Meeting"}
                    </p>
                  </div>

                  <div className="space-y-2.5 mb-6 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{pageT.bahadurTime || "2nd Tuesday • 11:00 AM – 1:30 PM"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">Bahadurpally Center, Hyderabad</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-extrabold text-indigo-600 dark:text-indigo-400 group-hover/loc:translate-x-0.5 transition-transform">
                  <span>{pageT.getDirections || "Get Directions & Campus Info"}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-2xl font-bold shadow-xl shadow-purple-600/25 hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              <span>{t?.links?.contact || "Contact Us"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
