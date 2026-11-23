"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
  Compass,
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
  const [selectedRole, setSelectedRole] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const ngoT = t.ngo || {};
  const vp = ngoT.volunteersPage || {};

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/ngo/projects?limit=50");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.projects)) {
            setProjects(data.projects);
          }
        }
      } catch (err) {
        console.error("Failed to load projects for dropdown:", err);
      }
    }
    loadProjects();
  }, []);

  const handleSelectRole = (roleTitle: string) => {
    setSelectedRole(roleTitle);

    // If an existing project matches the role title, automatically bind its projectId
    const matched = projects.find(
      (p) =>
        p.title.toLowerCase().includes(roleTitle.toLowerCase().split(" ")[0]) ||
        roleTitle.toLowerCase().includes(p.title.toLowerCase().split(" ")[0])
    );
    if (matched) {
      setProjectId(matched.id);
    }

    // Scroll smoothly to the form
    const formEl = document.getElementById("volunteer-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleClearRole = () => {
    setSelectedRole("");
    setProjectId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("IDLE");
    setErrorMsg("");

    if (!name.trim() || !email.trim()) {
      setErrorMsg(vp.errorFields || "Please enter your full name and email address.");
      setStatus("ERROR");
      setLoading(false);
      return;
    }

    const finalSkills = selectedRole
      ? skills
        ? `[Preferred Program: ${selectedRole}] ${skills}`
        : `[Preferred Program: ${selectedRole}]`
      : skills;

    try {
      const res = await fetch("/api/ngo/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          skills: finalSkills || null,
          projectId: projectId || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Forward to Formspark for direct email notification
        try {
          const { submitToFormspark } = await import("@/lib/formspark");
          await submitToFormspark({
            formType: "NGO Community Volunteer",
            name,
            email,
            phone: phone || undefined,
            skills: finalSkills || undefined,
            projectId: projectId || undefined,
            notes: finalSkills || undefined,
            subject: `NGO Volunteer Application from ${name} (${selectedRole || 'General'})`,
          });
        } catch (fsErr) {
          console.warn("[NGO_VOLUNTEER] Formspark submit notice:", fsErr);
        }

        setStatus("SUCCESS");
        setName("");
        setEmail("");
        setPhone("");
        setSkills("");
        setProjectId("");
        setSelectedRole("");
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

  const volunteerRoles = [
    {
      id: "role-hospital",
      title: vp.role1Title || "Hospital Outreach Drive",
      desc: vp.role1Desc || "Distribute hot meals, patient care kits, and essential medicines to caretakers in Gandhi & NIMS hospitals.",
      badge: vp.role1Badge || "Weekly Drives",
      icon: HeartHandshake,
      badgeStyle: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
      iconStyle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      accentHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    },
    {
      id: "role-ashramam",
      title: vp.role2Title || "Ashramam Provisions & Care",
      desc: vp.role2Desc || "Package and deliver monthly groceries, rice bags, and blankets to Bethany Ashramam & care centers.",
      badge: vp.role2Badge || "Weekend Trips",
      icon: Building2,
      badgeStyle: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
      iconStyle: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      accentHover: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
    },
    {
      id: "role-logistics",
      title: vp.role3Title || "Medical & Logistics Aid",
      desc: vp.role3Desc || "Assist in organizing inventory, wheelchair distribution, and coordination at relief distribution points.",
      badge: vp.role3Badge || "Field Support",
      icon: Award,
      badgeStyle: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
      iconStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      accentHover: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    },
    {
      id: "role-media",
      title: vp.role4Title || "Media & Event Coordination",
      desc: vp.role4Desc || "Help document service projects through photography, volunteer registration, and event management.",
      badge: vp.role4Badge || "Media & Admin",
      icon: Sparkles,
      badgeStyle: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
      iconStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      accentHover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    },
  ];

  return (
    <div className="py-8 sm:py-16 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* ── 1. HERO SECTION ────────────────────────────────────────────── */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-wider shadow-xs">
            <Heart className="w-3.5 h-3.5 fill-purple-500/20 text-purple-600 dark:text-purple-400 animate-pulse" />
            <span>{vp.tag || "Join Our Outreach Mission"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-800 dark:from-white dark:via-purple-100 dark:to-purple-200 bg-clip-text text-transparent">
            {vp.title || "Become a KCM Volunteer"}
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-medium max-w-2xl mx-auto">
            {vp.desc || "Lend your hands to serve hospital patients, orphans, and elderly residents across Telangana. Whether you can give 2 hours on a weekend or manage relief drives, every effort transforms lives."}
          </p>

          {/* Quick Highlight Badges: Compact, wrapped flex row for mobile & desktop */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-extrabold text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span>{vp.flexibleHours || "Flexible Weekend Hours"}</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Award className="w-3.5 h-3.5" />
              </div>
              <span>{vp.officialCert || "Official Volunteer Certificate"}</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span>{vp.directImpact || "100% Direct Field Impact"}</span>
            </div>
          </div>
        </div>

        {/* ── 2. WHERE YOU CAN HELP (ROLE CARDS) ─────────────────────────── */}
        <div className="space-y-6">
          <div className="text-left space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {vp.rolesTitle || "Where You Can Help"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {vp.rolesSubtitle || "Choose an area of service that matches your skills and availability. Click any role to begin."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {volunteerRoles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.title;

              return (
                <div
                  key={role.id}
                  onClick={() => handleSelectRole(role.title)}
                  className={`group relative p-5 sm:p-6 rounded-3xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 backdrop-blur-xl border touch-manipulation select-none active:scale-[0.99] ${
                    isSelected
                      ? "bg-purple-50/90 dark:bg-purple-950/40 border-purple-500 dark:border-purple-400 shadow-md shadow-purple-500/15 ring-2 ring-purple-500/25"
                      : "bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/40 hover:-translate-y-1 shadow-xs hover:shadow-md"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className={`w-11 h-11 rounded-2xl border ${role.iconStyle} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-xs">
                            <CheckCircle2 className="w-3 h-3" /> Selected
                          </span>
                        )}
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-xl border ${role.badgeStyle} shadow-xs`}>
                          {role.badge}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className={`font-black text-slate-900 dark:text-white text-base ${role.accentHover} transition-colors leading-snug`}>
                        {role.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {role.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                    <span>{isSelected ? "Selected for Application" : (vp.applyForRole || "Apply for Role")}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. MAIN APPLICATION & STEP TIMELINE ───────────────────────── */}
        <div id="volunteer-form" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-2">
          
          {/* Left Column: How It Works & Perks */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-wider shadow-xs">
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

            {/* Timeline Steps with Pixel-Perfect Alignment */}
            <div className="space-y-6 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:via-indigo-500 before:to-purple-500/20">
              <div className="relative flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-purple-500/25 flex-shrink-0 z-10 ring-4 ring-white dark:ring-slate-950">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">
                    {vp.step1Title || "Submit Application Details"}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                    {vp.step1Desc || "Fill out the registration form with your contact details, area of interest, and available hours."}
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-purple-500/25 flex-shrink-0 z-10 ring-4 ring-white dark:ring-slate-950">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">
                    {vp.step2Title || "Orientation & Placement"}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                    {vp.step2Desc || "Our volunteer coordination team connects with you to assign a local hospital or Ashramam outreach project."}
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-purple-500/25 flex-shrink-0 z-10 ring-4 ring-white dark:ring-slate-950">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">
                    {vp.step3Title || "Start Serving & Make an Impact"}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                    {vp.step3Desc || "Join our weekly field teams to distribute meals, medicines, and essential supplies directly to those in need."}
                  </p>
                </div>
              </div>
            </div>

            {/* Volunteer Perks Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{vp.benefitsTag || "Volunteer Benefits"}</span>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {vp.benefitsTitle || "Why Join KCM Social Services?"}
              </h3>
              
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-200 font-bold">
                <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>{vp.benefit1 || "Receive an official Certificate of Appreciation"}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>{vp.benefit2 || "Network with dedicated social service leaders"}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>{vp.benefit3 || "100% transparent field operations & direct impact"}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Application Form */}
          <div className="lg:col-span-7 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-9 shadow-xl relative overflow-hidden">
            {/* Top Gradient Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-indigo-500 to-rose-500" />

            <div className="space-y-2 text-left mb-6 sm:mb-8 border-b border-slate-100 dark:border-white/10 pb-5 pt-1">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {vp.formTitle || "Volunteer Application"}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>{vp.quickReview || "Quick Review"}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                {vp.formSubtitle || "Fill in your details below and our team will get in touch with you shortly."}
              </p>
            </div>

            {/* Active Role Highlight Chip */}
            {selectedRole && (
              <div className="mb-6 p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700/60 flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-purple-950 dark:text-purple-200 font-bold truncate">
                    Applying for: <span className="font-black text-purple-700 dark:text-purple-300">{selectedRole}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearRole}
                  aria-label="Clear selected role"
                  className="p-1 rounded-lg hover:bg-purple-200/60 dark:hover:bg-purple-800/60 text-purple-700 dark:text-purple-300 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {status === "SUCCESS" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-5 sm:p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3.5 sm:gap-4 text-left"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-black text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                    {vp.successTitle || "Application Submitted Successfully!"}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                    {vp.successDesc || "Thank you for stepping up to serve! Our volunteer coordinator will reach out via email or phone within 24-48 hours."}
                  </p>
                </div>
              </motion.div>
            )}

            {status === "ERROR" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-left text-xs sm:text-sm text-red-600 dark:text-red-300 font-medium"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 dark:text-red-400 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-left">
              
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    {vp.fullName || "Full Name"} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full py-3.5 pl-10 pr-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-xs sm:text-sm shadow-xs touch-manipulation"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    {vp.email || "Email Address"} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full py-3.5 pl-10 pr-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-xs sm:text-sm shadow-xs touch-manipulation"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Initiative */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    {vp.phone || "Phone Number (Optional)"}
                  </label>
                  <div className="relative group">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full py-3.5 pl-10 pr-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-xs sm:text-sm shadow-xs touch-manipulation"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    {vp.initiative || "Preferred Initiative"}
                  </label>
                  <div className="relative group">
                    <HeartHandshake className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                    <select
                      value={projectId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProjectId(val);
                        const match = projects.find((p) => p.id === val);
                        if (match) setSelectedRole(match.title);
                        else if (!val) setSelectedRole("");
                      }}
                      className="w-full py-3.5 pl-10 pr-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 appearance-none transition-all text-xs sm:text-sm shadow-xs cursor-pointer touch-manipulation truncate"
                    >
                      <option value="">{vp.initiativePlaceholder || "Any / General Community Relief"}</option>
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
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  {vp.skills || "Skills, Experience or Message"}
                </label>
                <div className="relative group">
                  <MessageSquare className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                  <textarea
                    rows={3}
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder={vp.skillsPlaceholder || "Tell us about yourself, your availability, or any specific skills you have..."}
                    className="w-full py-3.5 pl-10 pr-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-xs sm:text-sm shadow-xs resize-y min-h-[95px] touch-manipulation"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full py-4 min-h-[48px] rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-purple-500/25 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden cursor-pointer disabled:opacity-50 touch-manipulation select-none"
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
