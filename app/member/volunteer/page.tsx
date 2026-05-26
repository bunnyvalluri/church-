"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Briefcase, ArrowLeft, Check, Loader2, Send, Bell, RefreshCw, Music, Tv, BookOpen, Heart, Megaphone, Settings, Star, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Ministry {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  badge: string;
  openSlots?: number;
}

const MINISTRIES: Ministry[] = [
  {
    id: "WORSHIP",
    name: "Worship Ministry",
    description: "Choir, music, singers & instrumentalists. Lead the congregation in Spirit-filled praise & worship.",
    icon: Music,
    gradient: "from-purple-500 to-violet-600",
    badge: "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300",
    openSlots: 5,
  },
  {
    id: "TECH",
    name: "Technical & Media",
    description: "Audio engineering, video production, live streaming, social media & graphics design.",
    icon: Tv,
    gradient: "from-blue-500 to-indigo-600",
    badge: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300",
    openSlots: 3,
  },
  {
    id: "KIDS",
    name: "Children's Ministry",
    description: "Sunday school teaching, vacation bible school, childcare, and youth discipleship programs.",
    icon: Heart,
    gradient: "from-rose-500 to-pink-600",
    badge: "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300",
    openSlots: 8,
  },
  {
    id: "HOSPITALITY",
    name: "Hospitality Team",
    description: "Greeters, ushers, welcome crew, refreshments & guest services for Sunday services.",
    icon: Star,
    gradient: "from-amber-500 to-orange-500",
    badge: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300",
    openSlots: 10,
  },
  {
    id: "OUTREACH",
    name: "Charitable Outreach",
    description: "Food distribution, medical camps, evangelism teams, village ministry & social welfare programs.",
    icon: Megaphone,
    gradient: "from-green-500 to-emerald-600",
    badge: "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300",
    openSlots: 15,
  },
  {
    id: "FACILITIES",
    name: "Facilities & Security",
    description: "Church maintenance, security, setup/teardown, property management & event logistics.",
    icon: Settings,
    gradient: "from-slate-500 to-gray-600",
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
    openSlots: 4,
  },
];

export default function MemberVolunteer() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();

  const [selectedMinistry, setSelectedMinistry] = useState<string | null>(null);
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [step, setStep] = useState<"select" | "form">("select");

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  const showToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMinistry) {
      showToast("Please select a ministry first", "error");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/member/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          name: user?.name,
          volunteerInterest: selectedMinistry,
          volunteerSkills: skills,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        showToast("🙌 Application submitted! A coordinator will reach out to you soon.", "success");
      } else {
        throw new Error(data.error || "Failed to submit");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to submit. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const selectedMinistryData = MINISTRIES.find(m => m.id === selectedMinistry);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl animate-pulse">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Loading volunteer portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-orange-50/30 dark:from-gray-950 dark:via-amber-950/5 dark:to-gray-900">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2.5 max-w-sm backdrop-blur-xl border ${
              toast.type === "success" ? "bg-green-500/90 text-white border-green-400/30" :
              toast.type === "error" ? "bg-red-500/90 text-white border-red-400/30" :
              "bg-amber-600/90 text-white border-amber-400/30"
            }`}
          >
            <Bell className="w-4 h-4 flex-shrink-0" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/member" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:gap-3 transition-all text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {MINISTRIES.reduce((sum, m) => sum + (m.openSlots || 0), 0)} Open Slots
          </div>
        </div>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl p-8 text-white overflow-hidden relative shadow-2xl"
        >
          <div className="absolute inset-0">
            <div className="absolute -top-10 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-5 h-5 text-amber-200" />
              <span className="text-amber-200 text-sm font-semibold uppercase tracking-wider">Volunteer Application Portal</span>
            </div>
            <h1 className="text-3xl font-black mb-2">Serve in Ministry</h1>
            <p className="text-amber-100 text-sm max-w-xl">
              "Each of you should use whatever gift you have received to serve others." — 1 Peter 4:10.
              Discover your calling and join our vibrant ministry teams.
            </p>
            <div className="flex gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20 text-center">
                <div className="text-xl font-black">{MINISTRIES.length}</div>
                <div className="text-amber-200 text-[10px] font-semibold uppercase">Departments</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20 text-center">
                <div className="text-xl font-black">{MINISTRIES.reduce((s, m) => s + (m.openSlots || 0), 0)}</div>
                <div className="text-amber-200 text-[10px] font-semibold uppercase">Open Slots</div>
              </div>
            </div>
          </div>
        </motion.div>

        {submitted ? (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800/50 rounded-3xl border border-green-200 dark:border-green-900/30 shadow-xl p-12 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-950 dark:text-white mb-3">Application Submitted!</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md mx-auto mb-6">
              Thank you for volunteering for the <strong>{selectedMinistryData?.name}</strong> ministry. 
              A ministry coordinator will reach out to you within 2-3 business days.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/member"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSelectedMinistry(null);
                  setSkills("");
                  setStep("select");
                }}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Apply for Another
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Step: Ministry Selection */}
            <div>
              <h2 className="text-lg font-black text-gray-950 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-black">1</span>
                Select Your Ministry Department
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MINISTRIES.map((ministry, i) => {
                  const Icon = ministry.icon;
                  const isSelected = selectedMinistry === ministry.id;
                  return (
                    <motion.button
                      key={ministry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        setSelectedMinistry(ministry.id);
                        setStep("form");
                      }}
                      className={`relative text-left p-5 rounded-2xl border-2 transition-all group ${
                        isSelected
                          ? "border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/20 shadow-lg shadow-amber-500/10"
                          : "border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className={`w-11 h-11 bg-gradient-to-br ${ministry.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5">{ministry.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{ministry.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${ministry.badge}`}>
                          {ministry.id}
                        </span>
                        {ministry.openSlots && (
                          <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {ministry.openSlots} slots
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Step: Application Form */}
            <AnimatePresence>
              {selectedMinistry && (
                <motion.div
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                >
                  <div className="bg-white dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl p-8">
                    <h2 className="text-lg font-black text-gray-950 dark:text-white mb-5 flex items-center gap-2">
                      <span className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-black">2</span>
                      Tell Us About Yourself
                      {selectedMinistryData && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ml-1 ${selectedMinistryData.badge}`}>
                          {selectedMinistryData.name}
                        </span>
                      )}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Full Name (from account)
                        </label>
                        <input
                          type="text"
                          value={user?.name || ""}
                          disabled
                          className="w-full py-3 px-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 cursor-not-allowed text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Skills, Gifts & Spiritual Testimony *
                        </label>
                        <textarea
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          required
                          placeholder={`For ${selectedMinistryData?.name}: Share your relevant skills, past experience, spiritual gifts, and why you feel called to serve in this department...`}
                          rows={5}
                          className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-300 focus:outline-none transition-all resize-none text-sm leading-relaxed"
                        />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{skills.length}/500 characters</p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => { setSelectedMinistry(null); setStep("select"); }}
                          className="flex-none px-5 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading || !skills.trim()}
                          className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-amber-500/20 transition-all active:scale-[0.99] disabled:opacity-50 text-sm"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Submitting Application...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Submit Volunteer Application
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
