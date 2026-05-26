"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Heart, Send, ArrowLeft, Check, Clock, EyeOff, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  isAnonymous: boolean;
  status: "PENDING" | "PRAYING" | "ANSWERED";
  createdAt: string;
}

export default function MemberPrayers() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();

  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("HEALTH");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [mounted, status, router]);

  const loadPrayers = useCallback(async () => {
    if (user?.uid) {
      try {
        const res = await fetch(`/api/member/prayers?userId=${user.uid}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setPrayers(data.prayers || []);
        }
      } catch (err) {
        console.error("Failed to load prayers:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [user?.uid]);

  useEffect(() => {
    if (status === "authenticated" && user?.uid) {
      loadPrayers();
    }
  }, [user, status, loadPrayers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/member/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          title,
          description,
          category,
          isAnonymous,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.warning ? `Prayer request submitted! (${data.warning})` : "Prayer request submitted successfully! Our pastoral team is interceding for you.");
        setTitle("");
        setDescription("");
        setIsAnonymous(false);
        // Reload list
        loadPrayers();
      } else {
        throw new Error(data.error || "Failed to submit prayer request");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
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
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          href="/member"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline transition-all"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Back to Dashboard
        </Link>

        <div>
          <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500/10" />
            Prayer Request Center
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            "For where two or three gather in My name, there am I with them." — Matthew 18:20
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Submit Prayer Request */}
          <div className="md:col-span-5 bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-150 dark:border-white/5 shadow-xl p-6 md:p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold text-gray-950 dark:text-white mb-6 flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Send a Prayer Request
            </h3>

            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 text-xs rounded-lg flex items-start gap-2">
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Request Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Health Healing for Mother"
                  className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm"
                >
                  <option value="HEALTH">Health & Healing</option>
                  <option value="FAMILY">Family & Relations</option>
                  <option value="FINANCIAL">Financial Needs</option>
                  <option value="SPIRITUAL">Spiritual Guidance</option>
                  <option value="GUIDANCE">Direction & Choices</option>
                  <option value="THANKSGIVING">Thanksgiving & Praise</option>
                  <option value="OTHER">Other Requests</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Prayer Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Detail your request so our pastoral team can pray specifically..."
                  rows={5}
                  className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all resize-none text-sm leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 py-2 select-none">
                <input
                  type="checkbox"
                  id="anonymous-chk"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 bg-gray-50 dark:bg-gray-900"
                />
                <label htmlFor="anonymous-chk" className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 cursor-pointer">
                  <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                  Keep my prayer request anonymous
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all active:scale-[0.99] disabled:opacity-50 text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Submitted Prayers Tracker */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="text-xl font-bold text-gray-950 dark:text-white mb-2 flex items-center gap-1.5 uppercase tracking-wide">
              <Clock className="w-5 h-5 text-purple-600" />
              Prayer Requests Status
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-28 bg-white dark:bg-gray-800/20 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : prayers.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800/40 rounded-3xl p-6 border border-dashed border-gray-200 dark:border-gray-700">
                <Heart className="w-10 h-10 text-purple-300 dark:text-purple-800 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-500">You haven't submitted any prayer requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prayers.map((prayer) => (
                  <div 
                    key={prayer.id}
                    className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-150 dark:border-white/5 shadow-md p-6 space-y-3"
                  >
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-950 dark:text-white text-base">
                          {prayer.title}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          {prayer.category}
                        </span>
                      </div>
                      
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                        prayer.status === 'ANSWERED'
                          ? 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                          : prayer.status === 'PRAYING'
                            ? 'bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400'
                            : 'bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                      }`}>
                        {prayer.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {prayer.description}
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-white/5">
                      <span>
                        Submitted: {new Date(prayer.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                      {prayer.isAnonymous ? (
                        <span className="flex items-center gap-1 text-gray-400">
                          <EyeOff className="w-3 h-3" />
                          Anonymous Request
                        </span>
                      ) : (
                        <span>Public Request</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
