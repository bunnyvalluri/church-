"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, ArrowLeft, Check, Sparkles, Loader2, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function MemberVolunteer() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();

  const [interest, setInterest] = useState("WORSHIP");
  const [skills, setSkills] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [mounted, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      // Volunteer applications will write to fallback_volunteers.json locally
      const res = await fetch("/api/member/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          name: user?.name,
          volunteerInterest: interest,
          volunteerSkills: skills,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Volunteer application submitted successfully! A ministry coordinator will reach out to you shortly.");
        setSkills("");
      } else {
        throw new Error(data.error || "Failed to submit application");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-800 dark:text-gray-200 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          href="/member"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline transition-all"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Back to Dashboard
        </Link>

        {/* Volunteer Form Card */}
        <div className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-150 dark:border-white/5 shadow-xl p-8 md:p-10 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">Serve in Ministry</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discover your calling by serve-volunteering</p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 text-sm rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Your Name (Registered)
              </label>
              <input
                type="text"
                value={user?.name || ""}
                disabled
                className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Select Ministry Department *
              </label>
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm"
              >
                <option value="WORSHIP">Worship Ministry (Choir / Music / Singers)</option>
                <option value="TECH">Technical & Media (Audio / Video / Live Stream)</option>
                <option value="KIDS">Children's Ministry (Sunday School Teaching / Childcare)</option>
                <option value="HOSPITALITY">Hospitality (Greeters / Ushers / Welcome Crew)</option>
                <option value="OUTREACH">Charitable Outreach (Food/Medical Camps / Evangelism)</option>
                <option value="FACILITIES">Facilities (Church maintenance / Security / Setup)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Skills & Spiritual Testimony *
              </label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
                placeholder="Share your musical skills, technical background, teaching experience, and why you feel called to serve in this area..."
                rows={6}
                className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all resize-none text-sm leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all active:scale-[0.99] disabled:opacity-50 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting application...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Volunteer Application
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
