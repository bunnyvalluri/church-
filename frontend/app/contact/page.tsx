"use client";

import { useState, useId } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Phone, 
  MapPin, 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ChevronLeft,
  ChevronDown,
  CheckCircle,
  HeartHandshake,
  MessageCircle,
  HelpCircle,
  Send,
  Calendar,
  Compass,
  Radio,
  BookOpen
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
  const [submittedName, setSubmittedName] = useState("");
  const [selectedBranchIdx, setSelectedBranchIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const messageId = useId();

  const categories = [
    { label: "General Inquiry", icon: "💬", desc: "Service info, timings, guidance" },
    { label: "Pastoral Prayer", icon: "✝️", desc: "Prayer support from Bishop & team" },
    { label: "Healing & Deliverance", icon: "✨", desc: "Special fasting prayer intercession" },
    { label: "Pastoral Counseling", icon: "🤝", desc: "Confidential spiritual guidance" },
    { label: "Volunteering & Ministry", icon: "🙋", desc: "Choir, media, NGO community outreach" },
    { label: "Donations & Giving", icon: "🎁", desc: "Tithes, building fund & receipts" }
  ];

  const faqs = [
    {
      q: "How can I request personal prayer support from Bishop Kurra Kristhu Raju?",
      a: "You can submit your prayer request using the form above (selecting 'Pastoral Prayer'), send a direct WhatsApp message to our pastoral desk at +91 9704090069, or join us in person during our Friday Fasting & Healing Prayer (6:30 PM – 8:30 PM) or Sunday Service (6:00 PM – 9:00 PM)."
    },
    {
      q: "What are the worship service schedules across the 3 church branches?",
      a: "Our Main Sanctuary in Shapur Nagar holds Sunday Worship Service (6:00 PM – 9:00 PM) and Friday Fasting, Healing & Anointing Service 'Aradhana' (6:30 PM – 8:30 PM). Subhash Nagar branch hosts Sunday 1st Service (5:45 AM – 7:45 AM), 2nd Service (8:30 AM – 10:30 AM), and Thursday Fasting, Healing & Anointing (6:30 PM – 8:30 PM). Bahadurpally branch hosts Sunday Worship (11:00 AM – 1:00 PM) and Monthly 3rd Tuesday Fasting, Healing & Anointing (6:30 PM – 8:30 PM)."
    },
    {
      q: "Are the services accessible online if I cannot attend in person?",
      a: "Yes! All major Sunday services and special events are broadcast live on our official YouTube channel and accessible through the Sermons & Live Streaming portal."
    },
    {
      q: "How do I get involved with KCM NGO Social Welfare and community volunteer projects?",
      a: "Select 'Volunteering & Ministry' in the form above or explore our dedicated NGO portal. We regularly organize food distribution, orphan sheltering, medical camps, and educational initiatives across Telangana."
    }
  ];

  const branches = [
    {
      id: "shapur",
      name: "Shapur Nagar",
      fullName: "Shapur Nagar Main Church",
      tag: "Headquarters",
      badge: "Main Church",
      address: "15-201, Vivekananda Nagar, Srinivas Nagar, Shapur Nagar, Jeedimetla, Hyderabad, Telangana - 500055",
      landmark: "Near Pipeline Road & Shapur Nagar Bus Stop",
      embedUrl: "https://maps.google.com/maps?q=15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055&hl=en&z=15&output=embed",
      mapsUrl: "https://maps.google.com/?q=Kingdom+of+Christ+Ministries,+15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055",
      phone: "+91 97040 90069",
      timings: [
        { service: "Sunday Worship Service", time: "6:00 PM – 9:00 PM" },
        { service: "Friday Fasting, Healing & Anointing Service - \"Aradhana\"", time: "6:30 PM – 8:30 PM" },
        { service: "Monthly Fasting Prayer (Every 2nd Monday)", time: "10:00 AM – 3:00 PM" },
        { service: "Youth Ministry (2nd Saturday of the month)", time: "6:30 PM – 8:30 PM" },
        { service: "Women's Fellowship (3rd Saturday of the month)", time: "6:30 PM – 8:30 PM" },
        { service: "English Worship (3rd Sunday of the month)", time: "4:00 PM – 6:00 PM" },
      ],
    },
    {
      id: "subhash",
      name: "Subhash Nagar",
      fullName: "Subhash Nagar Branch Church",
      tag: "Branch Church",
      badge: "Morning & Healing",
      address: "Subhash Nagar, LP 119, Jeedimetla, Hyderabad, Telangana - 500055",
      landmark: "Near LP 119, easily accessible via Quthbullapur & Chintal",
      embedUrl: "https://maps.google.com/maps?q=Subhash+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055&hl=en&z=15&output=embed",
      mapsUrl: "https://maps.google.com/?q=Subhash+nagar+jeedimetla+119lp",
      phone: "+91 97040 90069",
      timings: [
        { service: "Sunday 1st Service", time: "5:45 AM – 7:45 AM" },
        { service: "Sunday 2nd Service", time: "8:30 AM – 10:30 AM" },
        { service: "Thursday Fasting, Healing & Anointing Service - \"Aradhana\"", time: "6:30 PM – 8:30 PM" },
      ],
    },
    {
      id: "bahadur",
      name: "Bahadurpally",
      fullName: "Bahadurpally Branch Church",
      tag: "Branch Church",
      badge: "North Hyderabad",
      address: "Bahadurpally Main Road, Near Gandimaisamma / Tech Mahindra, Hyderabad - 500043",
      landmark: "Gandimaisamma-Medchal Road, near Tech Mahindra",
      embedUrl: "https://maps.google.com/maps?q=Bahadurpally,+Quthbullapur,+Hyderabad,+Telangana+500043&hl=en&z=15&output=embed",
      mapsUrl: "https://maps.google.com/?q=17.567689,78.443963",
      phone: "+91 97040 90069",
      timings: [
        { service: "Sunday Worship Service", time: "11:00 AM – 1:00 PM" },
        { service: "Every 3rd Tuesday Fasting, Healing & Anointing Service - \"Aradhana\"", time: "6:30 PM – 8:30 PM" },
      ],
    },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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
          subject: `[${formData.category}] Contact Form Inquiry`,
          message: formData.message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to send message. Please try again.");
      }

      setSubmittedName(formData.name.trim() || "Beloved Friend");
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        category: "General Inquiry",
        message: ""
      });
    } catch (err: any) {
      console.error("[CONTACT_FORM_ERROR]", err);
      setStatus("error");
      setErrorMessage(err?.message || "Unable to send message. Please try again or reach out directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentBranch = branches[selectedBranchIdx] || branches[0];

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-[#070814] font-sans antialiased text-slate-900 dark:text-slate-100 selection:bg-[#f95700] selection:text-white transition-colors duration-300">
      <Navbar />

      {/* ── Top Hero Banner (Spatial Lighting & Visual Depth) ── */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-gradient-to-b from-orange-100/50 via-slate-100/60 to-[#fafafc] dark:from-[#060710]/95 dark:via-[#0a0c1e]/95 dark:to-[#070814] border-b border-slate-200/80 dark:border-white/5 overflow-hidden transition-colors duration-300">
        
        {/* Glow Spheres & Ambient Spatial Grid */}
        <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-[#f95700]/15 dark:bg-[#f95700]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          
          {/* Header Action Bar: Back to Home + Live Pastoral Desk Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/95 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-slate-200/80 dark:border-white/15 text-xs font-bold text-slate-800 dark:text-white shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95 group backdrop-blur-md"
            >
              <ChevronLeft className="w-4 h-4 text-[#f95700] group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-white/5 border border-orange-200/80 dark:border-white/10 shadow-sm text-xs font-bold text-orange-600 dark:text-orange-400 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pastoral Office • Shapur Nagar, Hyderabad</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>24/7 Prayer Desk Available</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white font-outfit">
            Connect <span className="text-[#f95700] drop-shadow-sm">With Us</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mt-3 leading-relaxed font-medium">
            We are here to pray with you, walk alongside your spiritual journey, and welcome you into the loving fellowship of Christ across our Hyderabad sanctuary campuses.
          </p>

          {/* Quick Action Ribbon */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6 pt-2">
            <a
              href="https://wa.me/919704090069?text=Praise%20the%20Lord%20Pastor%20I%20would%20like%20to%20connect%20with%20Kingdom%20of%20Christ%20Ministries"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Instant WhatsApp</span>
            </a>

            <a
              href="tel:+919704090069"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 text-[#f95700]" />
              <span>+91 97040 90069</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── 3-Column Floating High-Impact Feature Cards ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-30">
        <div className="bg-white/95 dark:bg-[#0c0e22]/95 border border-slate-200/90 dark:border-white/10 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 sm:p-8 lg:p-9 backdrop-blur-xl transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 xl:gap-8 lg:divide-x lg:divide-slate-200/80 dark:lg:divide-white/10">
            
            {/* Card 1: Pastoral Phone Line */}
            <div className="flex flex-col justify-between space-y-4 lg:pr-6 group">
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-2xl border border-orange-200/60 dark:border-white/15 flex items-center justify-center shrink-0 bg-orange-50 dark:bg-white/5 shadow-sm group-hover:scale-105 group-hover:border-orange-500/50 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current text-slate-800 dark:text-slate-100 group-hover:text-[#f95700] transition-colors shrink-0" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.24 1.02l-2.21 2.2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Pastoral Line</h3>
                    <button
                      type="button"
                      onClick={() => handleCopy("9704090069", "phone")}
                      className="p-1 rounded-md text-slate-400 hover:text-[#f95700] hover:bg-orange-50 dark:hover:bg-white/5 transition-all flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      title="Copy phone number"
                    >
                      {copiedKey === "phone" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500 text-[10px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px] text-slate-400">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mt-1">
                    <a
                      href="tel:+919704090069"
                      className="text-base font-extrabold text-slate-900 dark:text-slate-100 hover:text-[#f95700] dark:hover:text-[#f95700] transition-colors block font-mono"
                    >
                      9704090069
                    </a>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Available for Prayer, Fasting, & Counseling
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Live Pastoral Support
                </span>
              </div>
            </div>

            {/* Card 2: Central Sanctuary Campus */}
            <div className="flex flex-col justify-between space-y-4 lg:px-6 group">
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-2xl border border-orange-200/60 dark:border-white/15 flex items-center justify-center shrink-0 bg-orange-50 dark:bg-white/5 shadow-sm group-hover:scale-105 group-hover:border-orange-500/50 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current text-slate-800 dark:text-slate-100 group-hover:text-[#f95700] transition-colors shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Main Church (HQ)</h3>
                    <a
                      href="https://maps.google.com/?q=Kingdom+of+Christ+Ministries+15-201+Vivekananda+Nagar+Shapur+Nagar+Jeedimetla+Hyderabad"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#f95700] hover:underline flex items-center gap-1"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-1 font-medium">
                    15-201, Vivekananda Nagar, Srinivas Nagar, Shapur Nagar, Jeedimetla, Hyderabad - 500055
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f95700] shadow-[0_0_10px_rgba(249,87,0,0.6)] animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Headquarters & Central Campus
                </span>
              </div>
            </div>

            {/* Card 3: Ministry Desk Email */}
            <div className="flex flex-col justify-between space-y-4 lg:pl-6 group">
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-2xl border border-orange-200/60 dark:border-white/15 flex items-center justify-center shrink-0 bg-orange-50 dark:bg-white/5 shadow-sm group-hover:scale-105 group-hover:border-orange-500/50 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current text-slate-800 dark:text-slate-100 group-hover:text-[#f95700] transition-colors shrink-0" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Ministry Inbox</h3>
                    <button
                      type="button"
                      onClick={() => handleCopy("kingofchristministries23@gmail.com", "email1")}
                      className="p-1 rounded-md text-slate-400 hover:text-[#f95700] hover:bg-orange-50 dark:hover:bg-white/5 transition-all flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      title="Copy email address"
                    >
                      {copiedKey === "email1" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500 text-[10px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px] text-slate-400">Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-1">
                    <a
                      href="mailto:kingofchristministries23@gmail.com"
                      className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-[#f95700] dark:hover:text-[#f95700] transition-colors block truncate"
                    >
                      kingofchristministries23@gmail.com
                    </a>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    General Inquiries, Tithes & NGO Affairs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Guaranteed 24-Hour Response
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Main Two-Column Interactive Portal (Pastor Showcase & Smart Form) ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column (5 cols): Bishop Kurra Kristhu Raju Founder Showcase */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Dedicated High-Definition Portrait Container */}
            <div className="relative w-full h-[400px] sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-white/15 bg-white dark:bg-slate-900 group">
              <Image
                src="/pastor.png"
                alt="Bishop Kurra Kristhu Raju - Senior Pastor & Founder"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                priority
                unoptimized
              />

              {/* Floating Top Founder Badge */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#f95700]" />
                  <span>Senior Pastor & Founder</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f95700] text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                  KCM
                </span>
              </div>
            </div>

            {/* 2. Dedicated Info & Scripture Card (Placed Below Image - 0% Overlap) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0e22]/90 border border-slate-200/90 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-3">
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase font-extrabold tracking-widest text-[#f95700] mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#f95700]" />
                  <span>Visionary Leadership</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-outfit">
                  Bishop Kurra Kristhu Raju
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Leading Kingdom of Christ Ministries across Hyderabad with prophetic faith, compassionate community care, and divine vision.
              </p>

              {/* Scripture Quote */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-start gap-2.5 text-xs text-slate-700 dark:text-orange-200/90 italic font-serif bg-orange-50/50 dark:bg-orange-500/5 p-3 rounded-2xl border border-orange-200/50 dark:border-orange-500/10">
                <BookOpen className="w-4 h-4 text-[#f95700] shrink-0 not-italic mt-0.5" />
                <span>"Come to me, all who are weary and burdened, and I will give you rest." — Matthew 11:28</span>
              </div>
            </div>

            {/* 3. Quick Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://wa.me/919704090069?text=Praise%20the%20Lord%20Pastor%20I%20need%20prayer%20and%20guidance"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#25D366]/10 dark:bg-[#25D366]/15 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current text-[#25D366] shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp Pastor</span>
              </a>

              <a
                href="tel:+919704090069"
                className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-orange-500/10 dark:bg-orange-500/15 hover:bg-orange-500/20 border border-orange-500/30 text-[#f95700] font-extrabold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.24 1.02l-2.21 2.2z" />
                </svg>
                <span>Call Directly</span>
              </a>
            </div>
          </div>

          {/* Right Column (7 cols): Senior-Engineered Prayer & Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0c0e22]/90 border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-10 lg:p-11 shadow-2xl shadow-slate-200/50 dark:shadow-2xl relative transition-colors duration-300">
            
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Direct Ministry Desk</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-outfit">
                Get in Touch & Request Prayer
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Whether you need urgent prayer, counseling, baptism info, or wish to connect with our church family, we are eager to hear from you.
              </p>
            </div>

            {/* Success Feedback Modal / Confirmation Screen */}
            {status === "success" && (
              <div className="mb-6 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 flex items-start gap-4 animate-in fade-in zoom-in-95 duration-300 shadow-lg shadow-emerald-500/10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-black text-emerald-950 dark:text-emerald-200">
                    Peace & Blessings, {submittedName}!
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                    Your request has been received with prayer and routed directly to our pastoral team. We will contact you shortly via your preferred channel.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <span>Send Another Inquiry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Error Feedback */}
            {status === "error" && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 animate-in fade-in duration-300">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-300">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              
              {/* Inquiry Purpose Category Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Purpose <span className="text-orange-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => {
                    const isSelected = formData.category === cat.label;
                    return (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, category: cat.label }))}
                        className={`text-xs p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#f95700] text-white border-[#f95700] shadow-md shadow-orange-500/25 font-bold scale-[1.02]"
                            : "bg-slate-50 dark:bg-white/5 border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-orange-400/50 hover:bg-slate-100 dark:hover:bg-white/10"
                        }`}
                      >
                        <span className="text-base mb-1">{cat.icon}</span>
                        <span className="font-bold leading-tight">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor={nameId} className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Full Name <span className="text-orange-500">*</span>
                </label>
                <input
                  id={nameId}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Samuel Raju"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#070814] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#070814] focus:outline-none focus:ring-2 focus:ring-[#f95700] focus:border-transparent transition-all text-sm font-medium"
                />
              </div>

              {/* Email & Mobile Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor={emailId} className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Email Address <span className="text-orange-500">*</span>
                  </label>
                  <input
                    id={emailId}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="yourname@gmail.com"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#070814] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#070814] focus:outline-none focus:ring-2 focus:ring-[#f95700] focus:border-transparent transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={phoneId} className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Phone / WhatsApp <span className="text-orange-500">*</span>
                  </label>
                  <input
                    id={phoneId}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#070814] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#070814] focus:outline-none focus:ring-2 focus:ring-[#f95700] focus:border-transparent transition-all text-sm font-medium font-mono"
                  />
                </div>
              </div>

              {/* Message / Prayer Request */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor={messageId} className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Your Message / Prayer Request <span className="text-orange-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    {formData.message.length}/1000
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    id={messageId}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    maxLength={1000}
                    rows={4}
                    placeholder="Write your prayer request, question, or message in detail..."
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#070814] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#070814] focus:outline-none focus:ring-2 focus:ring-[#f95700] focus:border-transparent transition-all text-sm font-medium resize-none"
                  />
                  {/* Vertical Accent Pill */}
                  <span className="absolute right-0 top-3 bottom-3 w-1.5 bg-[#f95700] rounded-r-md pointer-events-none" />
                </div>
              </div>

              {/* Confidentiality Assurance */}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>All prayer requests and messages are kept strictly confidential by our pastoral team.</span>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[#f95700] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white font-black text-sm px-10 py-4 rounded-full inline-flex items-center justify-center gap-2.5 shadow-xl shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Transmitting Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Prayer Request / Message</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* ── 3 Church Branch Campuses & Dynamic Interactive Maps ── */}
      <section className="border-t border-slate-200/90 dark:border-white/10 bg-slate-100/70 dark:bg-[#090a1b]/60 py-16 sm:py-24 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-100/70 dark:bg-orange-500/10 px-4 py-1.5 rounded-full mb-3 shadow-sm">
              <MapPin className="w-4 h-4" />
              <span>3 Church Campuses Across Hyderabad</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-outfit">
              Visit Our Church Locations
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Experience the presence of God, transformative fellowship, and vibrant biblical teachings at our 3 active worship locations.
            </p>
          </div>

          {/* Branch Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {branches.map((branch, idx) => {
              const isActive = selectedBranchIdx === idx;
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setSelectedBranchIdx(idx)}
                  className={`px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all duration-300 flex items-center gap-2.5 cursor-pointer border ${
                    isActive
                      ? "bg-[#f95700] text-white border-[#f95700] shadow-xl shadow-orange-500/30 scale-[1.03]"
                      : "bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-orange-400/50"
                  }`}
                >
                  <MapPin className={`w-4 h-4 ${isActive ? "text-white" : "text-[#f95700]"}`} />
                  <span>{branch.name}</span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {branch.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Branch Showcase: Schedule + Interactive Google Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left (5 cols): Timings & Campus Details */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-white dark:bg-[#0c0e22]/90 p-5 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    <Clock className="w-4 h-4" />
                    <span>{currentBranch.name} Schedule</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                    {currentBranch.tag}
                  </span>
                </div>

                <h4 className="text-2xl font-black text-slate-900 dark:text-white font-outfit">
                  {currentBranch.fullName}
                </h4>

                {/* Address & Landmark Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1.5">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#f95700] shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                      {currentBranch.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pl-6">
                    <Compass className="w-3.5 h-3.5 text-orange-400" />
                    <span>{currentBranch.landmark}</span>
                  </div>
                  <div className="pt-1 pl-6">
                    <a
                      href={currentBranch.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#f95700] hover:underline"
                    >
                      <span>Get Instant Driving Directions</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Service Schedule List */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Service Timings
                  </label>
                  <ul className="space-y-1.5 text-xs">
                    {currentBranch.timings.map((t, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 shadow-sm dark:shadow-none hover:border-orange-300 transition-colors"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200 leading-snug">{t.service}</span>
                        <span className="font-mono text-[#f95700] font-black shrink-0 ml-2">{t.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right (7 cols): Google Maps Embed (Equal Height Symmetrical to Left Card) */}
            <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-white/10 min-h-[420px] lg:min-h-[500px] h-full relative bg-slate-200 dark:bg-slate-900 group flex flex-col">
              {/* Floating Maps Overlay Badge */}
              <a
                href={currentBranch.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 dark:bg-slate-900/90 hover:bg-white text-xs font-bold text-slate-900 dark:text-white shadow-xl hover:scale-105 transition-all backdrop-blur-md border border-slate-200 dark:border-white/15"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#f95700]" />
              </a>

              <iframe
                key={currentBranch.id}
                title={`Kingdom of Christ Ministries ${currentBranch.name} Map Location`}
                src={currentBranch.embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[420px] lg:min-h-full flex-1"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ & Spiritual Support Accordion ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-100 dark:bg-orange-500/10 px-3.5 py-1.5 rounded-full mb-3">
            <HelpCircle className="w-4 h-4" />
            <span>Frequently Asked Questions</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white font-outfit">
            Common Inquiries & Pastoral Support
          </h3>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0c0e22]/90 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#f95700] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 24/7 Urgent Prayer & Emergency Hotline Strip ── */}
      <section className="bg-gradient-to-r from-orange-600 via-[#f95700] to-orange-700 text-white py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-orange-200">
                24/7 Immediate Spiritual Care
              </span>
              <h4 className="text-2xl sm:text-3xl font-black mt-1 font-outfit">
                Need Urgent Prayer or Hospital Visitation?
              </h4>
              <p className="text-xs sm:text-sm text-orange-100 mt-1 max-w-xl">
                Our pastoral prayer team is standing by day and night to lift your needs before God.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href="tel:+919704090069"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-orange-700 hover:bg-orange-50 font-black text-xs shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <Phone className="w-4 h-4 text-orange-600" />
                <span>Call Hotline Now</span>
              </a>
              <a
                href="https://wa.me/919704090069?text=URGENT%20PRAYER%20REQUEST"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-black/30 hover:bg-black/40 text-white border border-white/20 font-black text-xs transition-all hover:scale-105 active:scale-95"
              >
                <span>WhatsApp Urgent Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}