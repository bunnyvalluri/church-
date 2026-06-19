"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { UserCheck, ArrowLeft, Loader2, Check, X, Mail, Phone, Clock } from "lucide-react";

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ministry: string;
  status: string;
  appliedAt: string;
}

export default function PastorVolunteers() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();
  const [localMounted, setLocalMounted] = useState(false);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
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
      fetch("/api/pastor/volunteers").then(r => r.json()).then(d => {
        setVolunteers(d.volunteers?.length ? d.volunteers : [
          { id: "v_1", name: "Emily Davis", email: "emily.davis@gmail.com", phone: "+91 98765 43210", ministry: "Choir", status: "Pending", appliedAt: "2026-06-10" },
          { id: "v_2", name: "Michael Brown", email: "michael.b@email.com", phone: "+91 98480 22338", ministry: "Ushering", status: "Approved", appliedAt: "2026-06-08" },
          { id: "v_3", name: "Sarah Johnson", email: "sarah.johnson@yahoo.com", phone: "+91 96521 88776", ministry: "Sunday School", status: "Pending", appliedAt: "2026-06-11" },
          { id: "v_4", name: "Robert Taylor", email: "robert.t@outlook.com", phone: "+91 90001 54321", ministry: "Media & AV", status: "Approved", appliedAt: "2026-06-05" },
        ]);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status]);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch("/api/pastor/volunteers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "Approved" }) });
      if (res.ok) {
        setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: "Approved" } : v));
        setSuccessMsg("Volunteer approved!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch { }
    finally { setActionId(null); }
  };

  const MINISTRY_COLORS: Record<string, string> = {
    "Choir": "bg-pink-50 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400",
    "Ushering": "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    "Sunday School": "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
    "Media & AV": "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
    "Outreach": "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400",
  };

  if (!localMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/pastor" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Pastor Dashboard
        </Link>

        <div className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl p-8 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-violet-50 dark:bg-violet-950/20 text-violet-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">Volunteers</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage volunteer applications and ministry teams</p>
            </div>
          </div>

          {successMsg && <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 text-sm rounded-lg flex items-center gap-2"><Check className="w-4 h-4" />{successMsg}</div>}

          <div className="flex gap-4 mb-6">
            {["All", "Pending", "Approved"].map(f => (
              <span key={f} className="text-xs px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 font-bold">
                {f} ({f === "All" ? volunteers.length : volunteers.filter(v => v.status === f).length})
              </span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-violet-400" /></div>
          ) : volunteers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-sm">No volunteer applications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {volunteers.map(v => (
                <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/3 hover:border-violet-200 dark:hover:border-violet-500/20 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {v.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{v.name}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Mail className="w-3 h-3" />{v.email}</span>
                        {v.phone && <span className="flex items-center gap-1 text-xs text-gray-500"><Phone className="w-3 h-3" />{v.phone}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${MINISTRY_COLORS[v.ministry] || "bg-gray-100 text-gray-600"}`}>{v.ministry}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${v.status === "Approved" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>{v.status}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{v.appliedAt}</span>
                      </div>
                    </div>
                  </div>
                  {v.status !== "Approved" && (
                    <button onClick={() => handleApprove(v.id)} disabled={actionId === v.id} className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex-shrink-0">
                      {actionId === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
