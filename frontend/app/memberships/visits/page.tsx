"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  Users, Calendar, Clock, Mail, Phone, Shield, Search, ArrowLeft,
  CheckCircle2, XCircle, Loader2, AlertCircle, Sparkles, Filter, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function MembershipsVisitsPage() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();
  const [localMounted, setLocalMounted] = useState(false);

  useEffect(() => {
    setLocalMounted(true);
  }, []);

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Client-side route protection
  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user && user.role !== "PASTOR" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [mounted, status, user, router]);

  // Fetch all member/visit requests
  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/pastor/member-requests");
      const data = await res.json();
      if (res.ok && data.success) {
        // Filter requests of type 'Visit'
        const visitReqs = (data.requests || []).filter((r: any) => r.type === "Visit");
        setRequests(visitReqs);
      } else {
        throw new Error(data.error || "Failed to load visit requests");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred while loading visit requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && (user?.role === "PASTOR" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN")) {
      fetchRequests();
    }
  }, [status, user, fetchRequests]);

  // Handle Accept/Reject action
  const handleUpdateStatus = async (id: string, newStatus: "Approved" | "Rejected" | "New") => {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/pastor/member-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        showToast(
          `Visit request ${newStatus === "Approved" ? "approved" : "rejected"} successfully!`,
          "success"
        );
      } else {
        throw new Error(data.error || "Failed to update request status");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update visit request.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!localMounted) {
    return null;
  }

  // Loading/Unauthenticated Screen
  if (status === "loading" || (user && user.role !== "PASTOR" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-650 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Validating credentials...</p>
        </div>
      </div>
    );
  }

  // Filter requests based on search term & status filter
  const filteredRequests = requests.filter((r) => {
    const matchesSearch = 
      (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.time || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === "ALL" || 
      (statusFilter === "PENDING" && r.status === "New") ||
      (statusFilter === "APPROVED" && r.status === "Approved") ||
      (statusFilter === "REJECTED" && r.status === "Rejected");

    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter((r) => r.status === "New").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-800 dark:text-gray-200 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Toast Alert */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold border max-w-xs ${
                toast.type === "success" 
                  ? "bg-emerald-500 text-white border-emerald-400/20 shadow-emerald-500/10" 
                  : "bg-rose-500 text-white border-rose-400/20 shadow-rose-500/10"
              }`}
            >
              <Sparkles className="w-4.5 h-4.5 flex-shrink-0 animate-bounce" />
              <span>{toast.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Link */}
        <Link
          href={user?.role === "PASTOR" ? "/pastor" : "/admin"}
          className="inline-flex items-center gap-2 text-purple-650 dark:text-purple-400 font-bold hover:underline transition-all"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Back to Dashboard
        </Link>

        {/* Title block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-150 dark:border-white/5 shadow-md p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-955 dark:text-white tracking-tight">Visitor Registrations</h2>
              <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">Review scheduled church visits and verify passport photo credentials</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-450 border border-amber-100 dark:border-amber-900/25 rounded-2xl text-[10px] font-black uppercase tracking-wider">
              {pendingCount} Pending
            </span>
            <span className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/25 rounded-2xl text-[10px] font-black uppercase tracking-wider">
              {approvedCount} Confirmed
            </span>
            <span className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/25 rounded-2xl text-[10px] font-black uppercase tracking-wider">
              {rejectedCount} Declined
            </span>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Filters and search block */}
        <div className="grid md:grid-cols-3 gap-4 bg-white dark:bg-gray-800/30 p-4 rounded-2xl border border-gray-150 dark:border-white/5 shadow-md">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by visitor name, email, phone number..."
              className="w-full py-3 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-909 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-909 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm font-semibold"
            >
              <option value="ALL">Filter Status (All Requests)</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Confirmed Visits</option>
              <option value="REJECTED">Declined Visits</option>
            </select>
          </div>
        </div>

        {/* Visit Requests Cards */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-650 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading visit applications...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-gray-850/10 py-16 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 animate-pulse" />
            <h4 className="text-lg font-bold text-gray-955 dark:text-white">No Visits Found</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
              We couldn't find any visit registrations matching your query. Try editing your filters or search keywords.
            </p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredRequests.map((req) => (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-150 dark:border-white/5 shadow-md p-6 hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Decorative background glow based on status */}
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none ${
                    req.status === "Approved" 
                      ? "bg-emerald-500" 
                      : req.status === "Rejected" 
                      ? "bg-rose-500" 
                      : "bg-amber-500"
                  }`} />

                  <div className="space-y-4">
                    {/* Visitor Header details */}
                    <div className="flex gap-4 items-start">
                      {/* PASSPORT PHOTO */}
                      <div className="relative w-18 h-22 bg-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shrink-0 shadow-sm">
                        {req.avatar ? (
                          <Image 
                            src={req.avatar} 
                            alt={`${req.name}'s passport photo`} 
                            fill 
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-[8px] font-black uppercase text-center p-1 leading-tight">
                            <Users className="w-5 h-5 mb-1" />
                            No Photo
                          </div>
                        )}
                      </div>

                      <div className="overflow-hidden flex-1 min-w-0">
                        <h4 className="font-extrabold text-gray-955 dark:text-white leading-snug truncate" title={req.name}>
                          {req.name}
                        </h4>
                        
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 text-[8px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full ${
                            req.status === "Approved" 
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30" 
                              : req.status === "Rejected" 
                              ? "bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30"
                              : "bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30"
                          }`}>
                            {req.status === "Approved" ? "Confirmed" : req.status === "Rejected" ? "Declined" : "Pending Approval"}
                          </span>
                        </div>

                        <div className="text-[9px] font-bold text-gray-400 mt-2 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-purple-500" />
                          <span>Type: {req.type || "Visit"}</span>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-100 dark:border-white/5" />

                    {/* Contact & Scheduled Time */}
                    <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400 font-medium">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <Mail className="w-4 h-4 text-purple-500/70 flex-shrink-0" />
                        <span className="truncate" title={req.email}>{req.email}</span>
                      </div>
                      {req.phone && (
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-purple-500/70 flex-shrink-0" />
                          <span>{req.phone}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2.5">
                        <Calendar className="w-4 h-4 text-purple-550 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug text-gray-950 dark:text-white font-extrabold">{req.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
                    {req.status === "New" ? (
                      <div className="flex gap-2">
                        {/* Decline button */}
                        <button
                          disabled={actionLoadingId !== null}
                          onClick={() => handleUpdateStatus(req.id, "Rejected")}
                          className="flex-1 py-2 px-3 border border-rose-250 dark:border-rose-900/30 bg-rose-50/30 hover:bg-rose-500 dark:bg-rose-955/10 dark:hover:bg-rose-950 text-rose-600 hover:text-white dark:text-rose-400 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          {actionLoadingId === req.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Decline
                            </>
                          )}
                        </button>

                        {/* Approve button */}
                        <button
                          disabled={actionLoadingId !== null}
                          onClick={() => handleUpdateStatus(req.id, "Approved")}
                          className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-emerald-500/15 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          {actionLoadingId === req.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Confirm
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-semibold">Review Status Locked</span>
                        <button
                          onClick={() => handleUpdateStatus(req.id, "New")}
                          className="text-[10px] font-black text-purple-650 dark:text-purple-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          Re-open review
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
