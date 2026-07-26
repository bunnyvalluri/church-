"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Scale,
  ScrollText,
  UserCheck,
  ShieldAlert,
  Heart,
  DollarSign,
  Calendar,
  AlertTriangle,
  Gavel,
  Mail,
  CheckCircle2,
  ChevronRight,
  Printer,
  Sparkles,
  HelpCircle,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState("acceptance");

  const lastUpdated = "July 26, 2026";

  const sections = [
    { id: "acceptance", label: "1. Acceptance of Terms", icon: Scale },
    { id: "services", label: "2. Ministry Portal & Services", icon: ScrollText },
    { id: "accounts", label: "3. User Registration & Security", icon: UserCheck },
    { id: "conduct", label: "4. Community Guidelines & Conduct", icon: Heart },
    { id: "ip", label: "5. Intellectual Property & Media", icon: Sparkles },
    { id: "giving", label: "6. Online Giving & Tithes", icon: DollarSign },
    { id: "events", label: "7. Events & Registrations", icon: Calendar },
    { id: "liability", label: "8. Disclaimers & Liability", icon: AlertTriangle },
    { id: "governing", label: "9. Governing Law & Disputes", icon: Gavel },
    { id: "changes", label: "10. Changes to Terms & Contact", icon: Mail },
  ];

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-700 dark:selection:text-purple-200">
      <Navbar />

      {/* Hero Header Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 dark:from-slate-950 dark:via-purple-950/70 dark:to-slate-950 text-white border-b border-purple-500/30 dark:border-white/10 shadow-lg">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/10 dark:bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-indigo-400/20 dark:bg-indigo-600/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <BackToHome />
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/20 text-white text-xs font-semibold border border-white/25 backdrop-blur-md transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-purple-200 dark:text-purple-400" />
                Print / Save PDF
              </button>
            </div>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 dark:bg-purple-500/20 border border-white/25 dark:border-purple-500/40 text-white dark:text-purple-300 text-xs font-semibold tracking-wide uppercase mb-4 shadow-xs">
              <Scale className="w-3.5 h-3.5" /> Governance & Agreement
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight mb-4">
              Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-purple-200 dark:from-purple-400 dark:via-indigo-300 dark:to-purple-200">Service</span>
            </h1>

            <p className="text-purple-100 dark:text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
              Welcome to Kingdom of Christ Ministries. These Terms govern your access to and use of our web portal, mobile features, online giving, prayer requests, and church events.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-purple-100 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 dark:bg-white/5 border border-white/20 dark:border-white/10 text-white dark:text-slate-200 font-medium">
                <Clock className="w-3.5 h-3.5 text-purple-200 dark:text-purple-400" />
                Effective Date: <strong className="text-white dark:text-slate-100">{lastUpdated}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 dark:bg-white/5 border border-white/20 dark:border-white/10 text-white dark:text-slate-200 font-medium">
                <Gavel className="w-3.5 h-3.5 text-indigo-200 dark:text-indigo-400" />
                Legally Binding Ministry Agreement
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 py-16 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-28 space-y-4 p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-xl dark:shadow-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 pb-2 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <span>Table of Contents</span>
                  <ScrollText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </h3>

                <nav className="space-y-1">
                  {sections.map(({ id, label, icon: Icon }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={() => setActiveSection(id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        activeSection === id
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                          : "text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-white/10 hover:text-purple-700 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${activeSection === id ? "text-white" : "text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300"}`} />
                        <span className="truncate">{label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${activeSection === id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                    </a>
                  ))}
                </nav>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10 mt-4 space-y-3">
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-200">
                    <p className="font-semibold mb-1 flex items-center gap-1.5 text-purple-800 dark:text-purple-300">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Need Legal Clarification?
                    </p>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300/80 leading-relaxed mb-2">
                      Reach out to our administration team regarding terms or agreements.
                    </p>
                    <a
                      href="mailto:legal@kcmministries.org"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-white hover:underline"
                    >
                      legal@kcmministries.org <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Terms Document Body */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-8">
              {/* Section 1: Acceptance */}
              <section id="acceptance" className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">1. Acceptance of Terms</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                  By accessing, browsing, or registering an account on the <strong>Kingdom of Christ Ministries (&quot;KCM&quot;)</strong> platform (including <code>kcm-portal.vercel.app</code> and associated subdomains), you confirm that you have read, understood, and agree to be bound by these Terms of Service, along with our <Link href="/privacy" className="text-purple-600 dark:text-purple-400 underline font-medium">Privacy Policy</Link>.
                </p>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                  If you do not agree to these Terms, please do not use our website or portal services.
                </p>
              </section>

              {/* Section 2: Services */}
              <section id="services" className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center">
                    <ScrollText className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">2. Ministry Portal Scope & Services</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                  KCM provides digital services for church members, visitors, and volunteers, including but not limited to:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>Church membership portal & member directory access</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>Sunday service timings, live stream links & sermon archives</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>Online prayer request submission & pastoral care tracking</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>Online tithes, offerings, building fund & NGO donations</span>
                  </div>
                </div>
              </section>

              {/* Section 3: User Registration */}
              <section id="accounts" className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">3. User Registration & Security Responsibilities</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                  When creating an account on the KCM Portal:
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>You agree to provide accurate, current, and truthful registration information.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>You are solely responsible for keeping your login password confidential and secure.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>You must immediately notify KCM administration of any unauthorized account access or security breach.</span>
                  </li>
                </ul>
              </section>

              {/* Section 4: Community Conduct */}
              <section id="conduct" className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">4. Community Guidelines & Conduct</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                  KCM is a house of prayer and spiritual growth. All users agree to treat fellow members, pastors, and leaders with Christ-like love, dignity, and respect.
                </p>

                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200 text-xs sm:text-sm space-y-2">
                  <strong className="text-rose-950 dark:text-white block font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Prohibited Portal Conduct:
                  </strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-xs">
                    <li>Posting profane, hateful, harassing, or discriminatory content.</li>
                    <li>Submitting false or malicious prayer requests intended to deceive.</li>
                    <li>Attempting unauthorized administrative access to member records or pastor dashboards.</li>
                    <li>Using the portal directory for unsolicited commercial advertising or spamming.</li>
                  </ul>
                </div>
              </section>

              {/* Section 5: Intellectual Property */}
              <section id="ip" className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">5. Intellectual Property & Sermon Media</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                  All logos, sermon videos, audio recordings, devotionals, photography, text, graphics, and software code on this website are the intellectual property of <strong>Kingdom of Christ Ministries</strong>.
                </p>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                  You may view, listen to, and share sermon content for personal, non-commercial, and devotional use. Commercial reproduction, broadcast, or modification without prior written authorization from KCM is strictly prohibited.
                </p>
              </section>

              {/* Section 6: Online Giving */}
              <section id="giving" className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">6. Online Giving, Tithes & Donation Policy</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                  Kingdom of Christ Ministries accepts tithes, free-will offerings, building fund contributions, and charitable NGO donations through verified payment partners (e.g., Razorpay / Stripe).
                </p>

                <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <strong className="text-slate-900 dark:text-white">Voluntary Contributions:</strong> All donations are voluntary acts of worship and charitable support.
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <strong className="text-slate-900 dark:text-white">Tax Receipts & 80G:</strong> Official receipts for tax deductions are issued electronically following successful payment confirmation.
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <strong className="text-slate-900 dark:text-white">Refund Policy:</strong> Tithes and offerings are generally non-refundable once processed. In the event of a technical duplicate charge, please contact <a href="mailto:finance@kcmministries.org" className="text-purple-600 dark:text-purple-300 font-medium underline">finance@kcmministries.org</a> within 7 days.
                  </div>
                </div>
              </section>

              {/* Section 7: Events */}
              <section id="events" className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">7. Church Events & Registrations</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                  When registering for special church conventions, youth retreats, or baptism services, attendees are expected to adhere to event venue safety rules, check-in procedures, and volunteer guidance.
                </p>
              </section>

              {/* Section 8: Disclaimers */}
              <section id="liability" className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">8. Disclaimers & Limitation of Liability</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                  The KCM Portal is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. While we strive for 100% uptime and data accuracy, KCM is not liable for temporary service interruptions, network delays, or third-party payment gateway failures.
                </p>
              </section>

              {/* Section 9: Governing Law */}
              <section id="governing" className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center">
                    <Gavel className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">9. Governing Law & Jurisdiction</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                  These Terms of Service are governed by and construed in accordance with the laws of <strong>India</strong> (Telangana jurisdiction). Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.
                </p>
              </section>

              {/* Section 10: Changes & Contact */}
              <section id="changes" className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-purple-950/50 dark:via-slate-900 dark:to-indigo-950/50 border border-purple-200 dark:border-purple-500/30 space-y-6 shadow-lg dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600 dark:text-purple-200" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">10. Modifications & Contact Details</h2>
                    <p className="text-xs text-purple-700 dark:text-purple-200/80 font-medium">Kingdom of Christ Ministries — Legal & Pastoral Administration</p>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                  KCM reserves the right to modify these Terms at any time. Continued usage of the platform following updates constitutes acceptance of the modified Terms.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-xs">
                    <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <strong className="text-slate-900 dark:text-white block">Church Office Address</strong>
                    <span className="text-slate-600 dark:text-slate-300">Jeedimetla, Hyderabad, Telangana 500055, India</span>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-xs">
                    <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <strong className="text-slate-900 dark:text-white block">Legal Enquiries</strong>
                    <a href="mailto:legal@kcmministries.org" className="text-purple-600 dark:text-purple-300 font-medium hover:underline">legal@kcmministries.org</a>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-xs">
                    <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <strong className="text-slate-900 dark:text-white block">Administration Office</strong>
                    <a href="tel:+919876543210" className="text-slate-600 dark:text-slate-300 hover:underline">+91 98765 43210</a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
