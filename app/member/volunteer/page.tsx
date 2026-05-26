"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase, Send, Loader2, Check, Bell, Users,
  Music, Tv, Heart, Star, Megaphone, Settings, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MINISTRIES = [
  {
    id: "WORSHIP",
    name: "Worship Ministry",
    desc: "Choir, singers, instrumentalists & worship leaders. Lead the congregation in Spirit-filled praise.",
    icon: Music,
    gradient: "from-purple-500 to-violet-600",
    badgeBg: "bg-purple-50 dark:bg-purple-950/30",
    badgeText: "text-purple-700 dark:text-purple-300",
    badgeBorder: "border-purple-200 dark:border-purple-900/30",
    slots: 5,
  },
  {
    id: "TECH",
    name: "Technical & Media",
    desc: "Audio, video production, live streaming, social media management & graphics.",
    icon: Tv,
    gradient: "from-blue-500 to-indigo-600",
    badgeBg: "bg-blue-50 dark:bg-blue-950/30",
    badgeText: "text-blue-700 dark:text-blue-300",
    badgeBorder: "border-blue-200 dark:border-blue-900/30",
    slots: 3,
  },
  {
    id: "KIDS",
    name: "Children's Ministry",
    desc: "Sunday school, vacation bible school, childcare & youth discipleship programs.",
    icon: Heart,
    gradient: "from-rose-500 to-pink-600",
    badgeBg: "bg-rose-50 dark:bg-rose-950/30",
    badgeText: "text-rose-700 dark:text-rose-300",
    badgeBorder: "border-rose-200 dark:border-rose-900/30",
    slots: 8,
  },
  {
    id: "HOSPITALITY",
    name: "Hospitality Team",
    desc: "Greeters, ushers, welcome crew, refreshments & guest services for all services.",
    icon: Star,
    gradient: "from-amber-500 to-orange-500",
    badgeBg: "bg-amber-50 dark:bg-amber-950/30",
    badgeText: "text-amber-700 dark:text-amber-300",
    badgeBorder: "border-amber-200 dark:border-amber-900/30",
    slots: 10,
  },
  {
    id: "OUTREACH",
    name: "Charitable Outreach",
    desc: "Food distribution, medical camps, evangelism teams, village ministry & social welfare.",
    icon: Megaphone,
    gradient: "from-green-500 to-emerald-600",
    badgeBg: "bg-green-50 dark:bg-green-950/30",
    badgeText: "text-green-700 dark:text-green-300",
    badgeBorder: "border-green-200 dark:border-green-900/30",
    slots: 15,
  },
  {
    id: "FACILITIES",
    name: "Facilities & Security",
    desc: "Church maintenance, security, setup/teardown, property management & event logistics.",
    icon: Settings,
    gradient: "from-slate-500 to-gray-600",
    badgeBg: "bg-gray-50 dark:bg-gray-800",
    badgeText: "text-gray-700 dark:text-gray-300",
    badgeBorder: "border-gray-200 dark:border-gray-700",
    slots: 4,
  },
];

export default function MemberVolunteer() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();

  const [selected, setSelected] = useState<string | null>(null);
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/member/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid, name: user?.name, volunteerInterest: selected, volunteerSkills: skills }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        showToast("Application submitted! A coordinator will reach out to you soon 🙌", "success");
      } else throw new Error(data.error || "Failed to submit");
    } catch (err: any) {
      showToast(err.message || "Failed to submit. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const selectedData = MINISTRIES.find(m => m.id === selected);

  if (!mounted || status === "loading") return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold border max-w-xs ${
              toast.type === "success" ? "bg-green-500 text-white border-green-400/30" : "bg-red-500 text-white border-red-400/30"
            }`}>
            <Bell className="w-4 h-4 flex-shrink-0" />{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Volunteer Application</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 italic">"Each of you should use whatever gift you have received to serve others." — 1 Peter 4:10</p>
      </div>

      {/* Total open slots banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="font-black text-lg leading-none">{MINISTRIES.reduce((s, m) => s + m.slots, 0)} Open Positions</p>
            <p className="text-amber-100 text-xs mt-0.5">Across {MINISTRIES.length} ministry departments</p>
          </div>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Now Accepting
        </span>
      </div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-green-200 dark:border-green-900/30 shadow-sm p-12 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/30">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Application Submitted!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-md mx-auto mb-6">
            Thank you for volunteering for <strong>{selectedData?.name}</strong>. A ministry coordinator will contact you within 2-3 business days.
          </p>
          <button
            onClick={() => { setSubmitted(false); setSelected(null); setSkills(""); }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all"
          >
            Apply for Another Ministry
          </button>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* Ministry Cards */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Step 1 — Choose Your Ministry
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {MINISTRIES.map((m, i) => {
                const Icon = m.icon;
                const isSelected = selected === m.id;
                return (
                  <motion.button
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelected(m.id)}
                    className={`relative text-left p-4 rounded-2xl border-2 transition-all group ${
                      isSelected
                        ? "border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/20 shadow-md shadow-amber-500/10"
                        : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`w-10 h-10 bg-gradient-to-br ${m.gradient} rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{m.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">{m.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.badgeBg} ${m.badgeText} ${m.badgeBorder}`}>{m.id}</span>
                      <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 flex items-center gap-0.5"><Users className="w-3 h-3" />{m.slots} slots</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden sticky top-20"
                >
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-amber-50 dark:bg-amber-950/20">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Step 2 — Your Details</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Selected ministry display */}
                    <div className={`flex items-center gap-2.5 p-3 rounded-xl border ${selectedData?.badgeBg} ${selectedData?.badgeBorder}`}>
                      {selectedData && <selectedData.icon className={`w-4 h-4 ${selectedData.badgeText} flex-shrink-0`} />}
                      <span className={`text-sm font-bold ${selectedData?.badgeText}`}>{selectedData?.name}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input type="text" value={user?.name || ""} disabled
                        className="w-full py-2.5 px-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Skills & Testimony *</label>
                      <textarea
                        value={skills} onChange={e => setSkills(e.target.value)} required rows={5}
                        placeholder={`For ${selectedData?.name}: share your relevant skills, gifts, past experience, and why you feel called to serve here...`}
                        className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:outline-none transition-all resize-none text-sm leading-relaxed"
                      />
                      <p className="text-[10px] text-gray-400 mt-1 text-right">{skills.length} characters</p>
                    </div>

                    <button type="submit" disabled={loading || !skills.trim()}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/20 transition-all active:scale-[0.99] disabled:opacity-50">
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
                        : <><Send className="w-4 h-4" />Submit Application</>}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center"
                >
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ChevronRight className="w-6 h-6 text-amber-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Select a ministry department from the left to begin your application</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
