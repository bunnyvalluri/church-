"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Server,
  UserCheck,
  Bell,
  Heart,
  Mail,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
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

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  const lastUpdated = "July 26, 2026";

  const sections = [
    { id: "overview", label: "1. Overview & Commitment", icon: ShieldCheck },
    { id: "collection", label: "2. Information We Collect", icon: FileText },
    { id: "usage", label: "3. How We Use Information", icon: Eye },
    { id: "security", label: "4. Security & Data Protection", icon: Lock },
    { id: "sharing", label: "5. Information Sharing", icon: Server },
    { id: "cookies", label: "6. Cookies & Technologies", icon: Bell },
    { id: "rights", label: "7. Your Rights & Control", icon: UserCheck },
    { id: "children", label: "8. Children's Privacy", icon: Heart },
    { id: "updates", label: "9. Updates to Policy", icon: Clock },
    { id: "contact", label: "10. Contact Privacy Officer", icon: Mail },
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
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 dark:from-slate-950 dark:via-purple-950/70 dark:to-slate-950 text-white border-b border-purple-500/30 dark:border-white/10 shadow-lg">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[200px] sm:h-[300px] bg-white/10 dark:bg-purple-600/20 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
            <BackToHome />
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/20 text-white text-xs font-semibold border border-white/25 backdrop-blur-md transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-white shrink-0" />
              <span>Print / Save PDF</span>
            </button>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 dark:bg-purple-500/20 border border-white/25 dark:border-purple-500/40 text-white dark:text-purple-300 text-[11px] sm:text-xs font-semibold tracking-wide uppercase mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-white shrink-0" /> Legal & Privacy Assurance
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight mb-3">
              Privacy Policy
            </h1>

            <p className="text-purple-100 dark:text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed mb-5">
              Kingdom of Christ Ministries (KCM) is committed to protecting your personal data, prayer requests, donation records, and privacy with the highest standards of trust and integrity.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-purple-100 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/15 dark:bg-white/5 border border-white/20 dark:border-white/10 text-white dark:text-slate-200 font-medium">
                <Clock className="w-3.5 h-3.5 text-white shrink-0" />
                Last Updated: <strong className="text-white dark:text-slate-100 ml-1">{lastUpdated}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/15 dark:bg-white/5 border border-white/20 dark:border-white/10 text-white dark:text-slate-200 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 dark:text-emerald-400 shrink-0" />
                GDPR & IT Act Compliant
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 py-8 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          {/* Mobile Collapsible Table of Contents */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm font-bold shadow-sm active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Jump to Section ({sections.length} Topics)</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isMobileTocOpen ? "rotate-180" : ""}`} />
            </button>

            {isMobileTocOpen && (
              <div className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-1 shadow-lg animate-fade-in">
                {sections.map(({ id, label, icon: Icon }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={() => {
                      setActiveSection(id);
                      setIsMobileTocOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      activeSection === id
                        ? "bg-purple-600 text-white"
                        : "text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${activeSection === id ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
                      <span className="truncate">{label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Desktop Sidebar Navigation */}
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
              <div className="sticky top-28 space-y-4 p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-xl dark:shadow-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 pb-2 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <span>Table of Contents</span>
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
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
                      <HelpCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Have Privacy Questions?
                    </p>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300/80 leading-relaxed mb-2">
                      Our Data Privacy Officer is available to assist you with any privacy inquiry.
                    </p>
                    <a
                      href="mailto:privacy@kcmministries.org"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-white hover:underline"
                    >
                      privacy@kcmministries.org <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Privacy Document Body */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6 sm:space-y-8">
              {/* Section 1: Overview */}
              <section id="overview" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">1. Overview & Our Sacred Commitment</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  Welcome to <strong>Kingdom of Christ Ministries (&quot;KCM&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)</strong>. Located in Jeedimetla, Hyderabad, KCM is dedicated to spreading the Gospel, supporting our congregation, providing prayer support, and facilitating charitable community programs.
                </p>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  We consider the personal data and spiritual prayer requests shared with us to be sacred responsibilities. This Privacy Policy details how we collect, store, safeguard, process, and respect your personal information across our website (<code>kcm-portal.vercel.app</code>), mobile-responsive platforms, member portals, and event check-in systems.
                </p>

                <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex gap-3 items-start">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-950 dark:text-white block mb-0.5 font-bold">Strict Non-Commercial Guarantee</strong>
                    We do <strong>NEVER</strong> sell, rent, trade, or monetize your personal details or prayer requests to commercial advertisers or data brokers under any circumstances.
                  </div>
                </div>
              </section>

              {/* Section 2: Information We Collect */}
              <section id="collection" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">2. Information We Collect</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  We collect information directly from you when you interact with our portal, register for membership, submit prayer requests, contribute tithes or offerings, or volunteer.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1.5">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" /> Member Registration Data
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Full name, email address, phone number, physical address, family member details, baptism records, and communication preferences.
                    </p>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1.5">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" /> Prayer Requests & Pastoral Care
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Prayer request descriptions, spiritual care notes, and counseling request topics (which can be submitted anonymously if desired).
                    </p>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1.5">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> Tithes, Offerings & Donations
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Transaction IDs, donation amounts, tax receipt information, and payment gateway references (processed via secure PCI-DSS compliant providers like Razorpay).
                    </p>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1.5">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                      <Server className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" /> Technical & Device Information
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      IP address, browser type, device identifiers, operating system, language preferences, and portal usage analytics for performance optimization.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3: How We Use Information */}
              <section id="usage" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">3. How We Use Your Information</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  Your information is utilized solely for ministry purposes, spiritual care, and operational integrity:
                </p>

                <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Pastoral Care & Prayer Support:</strong> Enabling Senior Pastors and designated intercessors to pray for your requests and provide spiritual guidance.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Church Communication:</strong> Sending service updates, Sunday timings, event invitations, newsletter devotionals, and urgent ministry announcements.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Financial Accounting & Receipts:</strong> Issuing official tax-exempt donation receipts, tracking 80G documentation, and accounting compliance.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Volunteer & Group Coordination:</strong> Managing Sunday school teachers, choir members, event volunteers, and small group leaders.</span>
                  </li>
                </ul>
              </section>

              {/* Section 4: Security & Protection */}
              <section id="security" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">4. Security & Data Protection Measures</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  We employ enterprise-grade physical, administrative, and technical safeguards to keep your data secure against unauthorized access, loss, or alteration.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs pt-1">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/30 text-slate-800 dark:text-slate-200 text-center space-y-1">
                    <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto" />
                    <strong className="block text-slate-900 dark:text-white text-xs sm:text-sm">TLS 1.3 Encryption</strong>
                    <span className="text-[11px] sm:text-xs">All web traffic and API endpoints are encrypted in transit via SSL/TLS.</span>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/30 text-slate-800 dark:text-slate-200 text-center space-y-1">
                    <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto" />
                    <strong className="block text-slate-900 dark:text-white text-xs sm:text-sm">Encrypted Storage</strong>
                    <span className="text-[11px] sm:text-xs">Databases & Firebase servers use AES-256 encryption at rest.</span>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/30 text-slate-800 dark:text-slate-200 text-center space-y-1">
                    <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <strong className="block text-slate-900 dark:text-white text-xs sm:text-sm">Role-Based Access</strong>
                    <span className="text-[11px] sm:text-xs">Strict pastoral role permissions prevent unauthorized access.</span>
                  </div>
                </div>
              </section>

              {/* Section 5: Information Sharing */}
              <section id="sharing" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Server className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">5. Information Sharing & Third Parties</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  We only share your information with essential infrastructure partners under strict confidentiality agreements:
                </p>

                <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <strong className="text-slate-900 dark:text-white">Hosting & Cloud Infrastructure:</strong> Vercel (Web Hosting) & Google Firebase (Authentication & Realtime Storage).
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <strong className="text-slate-900 dark:text-white">Payment Processing:</strong> Razorpay / Stripe (PCI-DSS Level 1 compliant financial gateways). We never store raw debit/credit card credentials.
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <strong className="text-slate-900 dark:text-white">Legal Requirements:</strong> We may disclose information if required by law or in good-faith belief that such action is necessary to comply with judicial proceedings or protect personal safety.
                  </div>
                </div>
              </section>

              {/* Section 6: Cookies */}
              <section id="cookies" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">6. Cookies & Tracking Technologies</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  We use essential session cookies and local storage to remember your authentication session, language selection (English, Telugu, Hindi), and theme preference (dark/light mode). You can control cookie preferences in your browser settings.
                </p>
              </section>

              {/* Section 7: Rights */}
              <section id="rights" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">7. Your Privacy Rights & Choices</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  You hold full control over your personal data:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                    <strong className="text-slate-900 dark:text-white block font-semibold">Right to Access & Export</strong>
                    <span className="text-slate-600 dark:text-slate-400">Request a copy of all personal details held in your member profile.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                    <strong className="text-slate-900 dark:text-white block font-semibold">Right to Rectification</strong>
                    <span className="text-slate-600 dark:text-slate-400">Update inaccurate phone numbers, addresses, or family information.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                    <strong className="text-slate-900 dark:text-white block font-semibold">Right to Erasure (&quot;Right to be Forgotten&quot;)</strong>
                    <span className="text-slate-600 dark:text-slate-400">Request permanent deletion of your account and non-financial records.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                    <strong className="text-slate-900 dark:text-white block font-semibold">Opt-Out of Broadcast SMS / Email</strong>
                    <span className="text-slate-600 dark:text-slate-400">Unsubscribe from non-essential church broadcast communications anytime.</span>
                  </div>
                </div>
              </section>

              {/* Section 8: Children's Privacy */}
              <section id="children" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 dark:text-rose-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">8. Children&apos;s Privacy</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  We prioritize protecting minors in Sunday School and Youth Ministry programs. Registration of children under 18 years of age requires explicit parental or legal guardian consent. We do not collect personal data from minors directly without parental knowledge.
                </p>
              </section>

              {/* Section 9: Updates */}
              <section id="updates" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm sm:shadow-md dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">9. Updates to This Privacy Policy</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-base">
                  We may periodically update this policy to reflect enhancements in portal features or legal compliance requirements. Material changes will be highlighted via a banner on the portal home page or direct email notice.
                </p>
              </section>

              {/* Section 10: Contact */}
              <section id="contact" className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-purple-950/50 dark:via-slate-900 dark:to-indigo-950/50 border border-purple-200 dark:border-purple-500/30 space-y-5 sm:space-y-6 shadow-md sm:shadow-lg dark:shadow-xl">
                <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-200" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">10. Contacting Our Privacy Team</h2>
                    <p className="text-[11px] sm:text-xs text-purple-700 dark:text-purple-200/80 font-medium">Kingdom of Christ Ministries — Data Protection & Privacy Office</p>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-base leading-relaxed">
                  If you have questions, data access requests, or privacy concerns, please contact our Data Protection Officer:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-xs">
                    <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <strong className="text-slate-900 dark:text-white block font-semibold">Church Office Address</strong>
                    <span className="text-slate-600 dark:text-slate-300">Jeedimetla, Hyderabad, Telangana 500055, India</span>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-xs">
                    <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <strong className="text-slate-900 dark:text-white block font-semibold">Email Privacy Desk</strong>
                    <a href="mailto:privacy@kcmministries.org" className="text-purple-600 dark:text-purple-300 font-medium hover:underline">privacy@kcmministries.org</a>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-xs">
                    <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <strong className="text-slate-900 dark:text-white block font-semibold">Phone Support</strong>
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
