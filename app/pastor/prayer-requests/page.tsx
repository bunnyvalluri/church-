"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft, Loader2, Check, Clock } from "lucide-react";

interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  isAnonymous: boolean;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400",
  PRAYING: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  ANSWERED: "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400",
};

export default function PastorPrayerRequests() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();
  const [localMounted, setLocalMounted] = useState(false);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => { setLocalMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated" && user && user.role !== "PASTOR" && user.role !== "ADMIN") router.replace("/dashboard");
  }, [mounted, status, user, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/member/prayers?userId=all_admin_peek")
        .then(r => r.json())
        .then(d => { setPrayers(d.prayers || []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const updateStatus = (id: string, newStatus: string) => {
    setActionId(id);
    setTimeout(() => {
      setPrayers(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      setActionId(null);
      setSuccessMsg(`Status updated to ${newStatus}`);
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 600);
  };

  if (!localMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/pastor" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Pastor Dashboard
        </Link>

        <div className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl p-8 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Heart className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">Prayer Requests</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Intercede and manage congregation prayer needs</p>
            </div>
          </div>

          {successMsg && <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 text-sm rounded-lg flex items-center gap-2"><Check className="w-4 h-4" />{successMsg}</div>}

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-rose-400" /></div>
          ) : prayers.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold">No prayer requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prayers.map(p => (
                <div key={p.id} className="p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/3 hover:border-rose-200 dark:hover:border-rose-500/20 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${STATUS_COLORS[p.status] || STATUS_COLORS.PENDING}`}>{p.status}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 font-semibold">{p.category}</span>
                        {p.isAnonymous && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 font-semibold">Anonymous</span>}
                      </div>
                      <h4 className="font-black text-gray-900 dark:text-white text-sm mb-1">{p.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{p.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {!p.isAnonymous && p.user && <span className="text-xs text-gray-400">— {p.user.name}</span>}
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Recent"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {["PENDING", "PRAYING", "ANSWERED"].map(s => (
                        <button key={s} onClick={() => updateStatus(p.id, s)} disabled={actionId === p.id || p.status === s}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 ${p.status === s ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30"}`}>
                          {s === "PENDING" ? "Pending" : s === "PRAYING" ? "Praying" : "Answered"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
