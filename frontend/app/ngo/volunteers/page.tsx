"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  HeartHandshake,
  Building2,
  Award,
  Sparkles,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Heart,
  MessageSquare,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Project {
  id: string;
  title: string;
}

export default function NgoVolunteersPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const ngoT = t.ngo || {};

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/ngo/projects");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setProjects(data.projects);
          }
        }
      } catch (err) {
        console.error("Failed to load projects for dropdown:", err);
      }
    }
    loadProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("IDLE");
    setErrorMsg("");

    if (!name.trim() || !email.trim()) {
      setErrorMsg(ngoT.volunteersPage?.errorFields || "Please enter your name and email address.");
      setStatus("ERROR");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ngo/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          skills: skills || null,
          projectId: projectId || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("SUCCESS");
        setName("");
        setEmail("");
        setPhone("");
        setSkills("");
        setProjectId("");
      } else {
        throw new Error(data.error || "Submission failed.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      setStatus("ERROR");
    } finally {
      setLoading(false);
    }
  };

  const vp = ngoT.volunteersPage || {};

  const volunteerRoles = [
    {
      id: "role-hospital",
      title: vp.role1Title || "Hospital Outreach Drive",
      desc: vp.role1Desc || "Distribute hot meals, patient care kits, and essential medicines to caretakers in Gandhi & NIMS hospitals.",
      badge: vp.role1Badge || "Weekly Drives",
      icon: HeartHandshake,
      cardStyle: "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-md",
      badgeStyle: "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-600 dark:border-blue-500 dark:text-white",
      iconStyle: "bg-blue-600 text-white",
      linkStyle: "text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300",
    },
    {
      id: "role-ashramam",
      title: vp.role2Title || "Ashramam Provisions & Care",
      desc: vp.role2Desc || "Package and deliver monthly groceries, rice bags, and blankets to Bethany Ashramam & care centers.",
      badge: vp.role2Badge || "Weekend Trips",
      icon: Building2,
      cardStyle: "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-purple-500 shadow-md",
      badgeStyle: "bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-600 dark:border-purple-500 dark:text-white",
      iconStyle: "bg-purple-600 text-white",
      linkStyle: "text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300",
    },
    {
      id: "role-logistics",
      title: vp.role3Title || "Medical & Logistics Aid",
      desc: vp.role3Desc || "Assist in organizing inventory, wheelchair distribution, and coordination at relief distribution points.",
      badge: vp.role3Badge || "Field Support",
      icon: Award,
      cardStyle: "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-md",
      badgeStyle: "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-600 dark:border-emerald-500 dark:text-white",
      iconStyle: "bg-emerald-600 text-white",
      linkStyle: "text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300",
    },
    {
      id: "role-media",
      title: vp.role4Title || "Media & Event Coordination",
      desc: vp.role4Desc || "Help document service projects through photography, volunteer registration, and event management.",
      badge: vp.role4Badge || "Media & Admin",
      icon: Sparkles,
      cardStyle: "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 shadow-md",
      badgeStyle: "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-600 dark:border-amber-500 dark:text-white",
      iconStyle: "bg-amber-600 text-white",
      linkStyle: "text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300",
    },
  ];

  return (
    <div className="py-6 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* 1. Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-600 dark:border-purple-500 dark:text-white text-xs font-extrabold uppercase tracking-wider shadow-sm">
            <Heart className="w-4 h-4 fill-current text-rose-500 dark:text-white animate-pulse" />
            <span>{vp.tag || "JOIN OUR OUTREACH MISSION"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] bg-gradient-to-r from-slate-900 via-slate-800 to-purple-600 dark:from-white dark:via-slate-100 dark:to-purple-300 bg-clip-text text-transparent">
            {vp.title || "Become a KCM Volunteer"}
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-lg leading-relaxed font-normal max-w-2xl mx-auto">
            {vp.desc || "Lend your hands to serve hospital patients, orphans, and elderly residents across Telangana. Whether you can give 2 hours on a weekend or manage relief drives, every effort transforms lives."}
          </p>

          {/* Quick Highlight Pills */}
          <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs font-bold text-slate-800 dark:text-white">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm w-full sm:w-auto justify-center">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{vp.flexibleHours || "Flexible Weekend Hours"}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm w-full sm:w-auto justify-center">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{vp.officialCert || "Official Volunteer Certificate"}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm w-full sm:w-auto justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{vp.directImpact || "100% Direct Field Impact"}</span>
            </div>
          </div>
        </div>

        {/* 2. Volunteer Opportunities Grid */}
        <div className="space-y-6">
          <div className="text-left space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {vp.rolesTitle || "Where You Can Help"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {vp.rolesSubtitle || "Choose an area of service that matches your skills and availability."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {volunteerRoles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.id}
                  onClick={() => {
                    const formEl = document.getElementById("volunteer-form");
                    if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group relative p-5 sm:p-6 rounded-3xl ${role.cardStyle} flex flex-col justify-between space-y-5 cursor-pointer hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className={`w-11 h-11 rounded-2xl ${role.iconStyle} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg ${role.badgeStyle} shadow-sm`}>
                        {role.badge}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                      {role.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {role.desc}
                    </p>
                  </div>

                  <div className={`pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-black uppercase tracking-wider ${role.linkStyle}`}>
                    <span>{vp.applyForRole || "Apply for Role"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Main Form & Step Timeline */}
        <div id="volunteer-form" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-4">
          
          {/* Left Column: How It Works & Perks */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-600 dark:border-purple-500 dark:text-white text-xs font-extrabold uppercase tracking-wider shadow-sm">
                <Users className="w-3.5 h-3.5" />
                <span>{vp.howItWorksTag || "Simple 3-Step Process"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {vp.howItWorks || "How Volunteering Works"}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                {vp.howItWorksDesc || "We make it seamless for individuals, students, and corporate groups to register and start making a difference immediately."}
              </p>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-purple-500/30">
              <div className="relative flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0 z-10">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {vp.step1Title || "Submit Application Details"}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                    {vp.step1Desc || "Fill out the registration form with your contact details, area of interest, and available hours."}
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0 z-10">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {vp.step2Title || "Orientation & Placement"}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                    {vp.step2Desc || "Our volunteer coordination team connects with you to assign a local hospital or Ashramam outreach project."}
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0 z-10">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {vp.step3Title || "Start Serving & Make an Impact"}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                    {vp.step3Desc || "Join our weekly field teams to distribute meals, medicines, and essential supplies directly to those in need."}
                  </p>
                </div>
              </div>
            </div>

            {/* Volunteer Perks Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-purple-50/90 via-indigo-50/50 to-white dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 border border-purple-200/80 dark:border-purple-500/30 text-slate-900 dark:text-white shadow-lg dark:shadow-2xl space-y-4 relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{vp.benefitsTag || "Volunteer Benefits"}</span>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {vp.benefitsTitle || "Why Join KCM Social Services?"}
              </h3>
              
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-200 font-bold">
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span>{vp.benefit1 || "Receive an official Certificate of Appreciation"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span>{vp.benefit2 || "Network with dedicated social service leaders"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span>{vp.benefit3 || "100% transparent field operations & direct impact"}</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Right Column: Application Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Top Gradient Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-indigo-500 to-rose-500" />

            <div className="space-y-2 text-left mb-6 sm:mb-8 border-b border-slate-200 dark:border-slate-800 pb-5 pt-2">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {vp.formTitle || "Volunteer Application"}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-600 dark:text-white text-[11px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-purple-600 dark:text-white" />
                  <span>{vp.quickReview || "Quick Review"}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                {vp.formSubtitle || "Fill in your details below and our team will get in touch with you shortly."}
              </p>
            </div>

            {status === "SUCCESS" && (
              <div className="mb-6 p-5 sm:p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3.5 sm:gap-4 text-left">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                    {vp.successTitle || "Application Submitted Successfully!"}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {vp.successDesc || "Thank you for stepping up to serve! Our volunteer coordinator will reach out via email or phone within 24-48 hours."}
                  </p>
                </div>
              </div>
            )}

            {status === "ERROR" && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-left text-xs sm:text-sm text-red-600 dark:text-red-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 dark:text-red-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                    {vp.fullName || "Full Name"} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full py-3 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all text-xs sm:text-sm shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                    {vp.email || "Email Address"} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full py-3 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all text-xs sm:text-sm shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Initiative */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                    {vp.phone || "Phone Number (Optional)"}
                  </label>
                  <div className="relative group">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full py-3 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all text-xs sm:text-sm shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                    {vp.initiative || "Preferred Initiative"}
                  </label>
                  <div className="relative group">
                    <HeartHandshake className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors" />
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full py-3 pl-10 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 appearance-none transition-all text-xs sm:text-sm shadow-sm cursor-pointer"
                    >
                      <option value="">{vp.initiativePlaceholder || "Any / General Social Service"}</option>
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Message / Skills */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                  {vp.skills || "Skills, Experience or Message"}
                </label>
                <div className="relative group">
                  <MessageSquare className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors" />
                  <textarea
                    rows={3}
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder={vp.skillsPlaceholder || "Tell us about yourself, your availability, or any specific skills you have..."}
                    className="w-full py-3 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all text-xs sm:text-sm shadow-sm resize-y min-h-[90px]"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{vp.submittingBtn || "Submitting Application..."}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <span>{vp.submitBtn || "Submit Volunteer Application"}</span>
                  </>
                )}
              </button>

              {/* Security & Privacy Footer */}
              <div className="pt-1 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{vp.confidential || "100% Confidential • Used only for volunteer coordination"}</span>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
