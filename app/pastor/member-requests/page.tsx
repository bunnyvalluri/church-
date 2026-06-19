"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ArrowLeft, Check, X, Loader2, Clock, Mail, Phone, UserCheck } from "lucide-react";

interface MemberRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  status: string;
  createdAt: string;
}

export default function PastorMemberRequests() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();
  const [localMounted, setLocalMounted] = useState(false);
  const [requests, setRequests] = useState<MemberRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => { setLocalMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated" && user && user.role !== "PASTOR" && user.role !== "ADMIN") router.replace("/dashboard");
  }, [mounted, status, user, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/pastor/member-requests")
        .then(r => r.json())
        .then(d => { setRequests(d.requests || []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const handleAction = async (id: string, action: "Approved" | "Rejected") => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/pastor/member-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: action }),
      });
      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
        setSuccessMsg(`Request ${action.toLowerCase()} successfully!`);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch { setErrorMsg("Action failed. Please try again."); setTimeout(() => setErrorMsg(""), 3000); }
    finally { setActionLoading(null); }
  };

  if (!localMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-800 dark:text-gray-200 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/pastor" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Pastor Dashboard
        </Link>

        <div className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl p-8 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">Member Requests</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and manage membership applications</p>
            </div>
          </div>

          {successMsg && <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 text-sm rounded-lg flex items-center gap-2"><Check className="w-4 h-4" />{successMsg}</div>}
          {errorMsg && <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded-lg">{errorMsg}</div>}

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold">No member requests found</p>
              <p className="text-sm mt-1">New membership applications will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/3 hover:border-purple-200 dark:hover:border-purple-500/20 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {req.name?.charAt(0) || "M"}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{req.name}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Mail className="w-3 h-3" />{req.email}</span>
                        {req.phone && <span className="flex items-center gap-1 text-xs text-gray-500"><Phone className="w-3 h-3" />{req.phone}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-semibold">{req.type || "Membership"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${req.status === "Approved" ? "bg-green-50 text-green-600" : req.status === "Rejected" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"}`}>{req.status || "Pending"}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Recent"}</span>
                      </div>
                    </div>
                  </div>
                  {req.status !== "Approved" && req.status !== "Rejected" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleAction(req.id, "Approved")} disabled={actionLoading === req.id} className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50">
                        {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Approve
                      </button>
                      <button onClick={() => handleAction(req.id, "Rejected")} disabled={actionLoading === req.id} className="flex items-center gap-1.5 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50">
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
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
