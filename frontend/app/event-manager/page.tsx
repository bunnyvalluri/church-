"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { getQueuedReports, syncOfflineReports, registerAutoSync, OfflineReport } from "@/lib/offlineSync";
import { io } from "socket.io-client";
import { 
  Camera, 
  PlusCircle, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  MapPin, 
  Users, 
  DollarSign, 
  AlertCircle,
  FileText,
  Trash2,
  Building2,
  Clock,
  Check,
  X,
  Filter,
  Activity,
  LogOut,
  Calendar,
  Maximize2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

interface MediaItem {
  id: string;
  url: string;
}

interface DBReport {
  id: string;
  branchId: string;
  branch: { name: string };
  title: string;
  description: string;
  attendanceCount: number;
  offeringAmount: number;
  reportDate: string;
  gpsLocation: string | null;
  volunteerNames: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdBy: { name: string; email: string };
  createdAt: string;
  media: MediaItem[];
}

interface FeedActivity {
  id: string;
  text: string;
  time: string;
  type: "upload" | "status" | "sys";
}

export default function UnifiedEventManagementPortal() {
  const router = useRouter();
  const { user, getIdToken, logout } = useAuth();
  
  // Offline outbox states
  const [isOnline, setIsOnline] = useState(true);
  const [queuedReports, setQueuedReports] = useState<OfflineReport[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Database reports states
  const [reports, setReports] = useState<DBReport[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [feed, setFeed] = useState<FeedActivity[]>([
    { id: "1", text: "Portal system initialized.", time: "Just now", type: "sys" }
  ]);

  // Filters
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // UI state
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const role = user?.role ?? "MEMBER";
  const isManagerOrAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(role);

  // Monitor network status
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch branches
  const loadBranches = async () => {
    try {
      const response = await fetch("/api/field-volunteer/branches");
      if (response.ok) {
        const data = await response.json();
        if (data.success) setBranches(data.branches);
      }
    } catch (err) {
      console.error("[PORTAL] Error fetching branches:", err);
    }
  };

  // Fetch reports list
  const loadReports = async () => {
    setIsLoadingReports(true);
    try {
      const token = await getIdToken();
      const query = new URLSearchParams();
      if (branchFilter !== "all") query.set("branchId", branchFilter);
      if (statusFilter !== "all") query.set("status", statusFilter);

      const response = await fetch(`/api/event-manager/reports?${query.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) setReports(data.reports);
      }
    } catch (err) {
      console.error("[PORTAL] Error loading db reports:", err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  // Fetch offline queue size
  const loadQueue = async () => {
    try {
      const offlineQueue = await getQueuedReports();
      setQueuedReports(offlineQueue);
    } catch (err) {
      console.error("[PORTAL] Failed to load offline queue:", err);
    }
  };

  useEffect(() => {
    loadBranches();
    loadReports();
    loadQueue();

    // Register auto sync listener when device goes back online
    const unregister = registerAutoSync(getIdToken, () => {
      loadQueue();
      loadReports();
      setSyncMessage("Auto-sync completed successfully! 🎉");
      setTimeout(() => setSyncMessage(null), 5000);
    });

    return () => unregister();
  }, [getIdToken]);

  // Reload reports when filters change
  useEffect(() => {
    loadReports();
  }, [branchFilter, statusFilter]);

  // Socket.io listeners
  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.info("[SOCKET] Unified portal connected to realtime companion.");
    });

    socket.on("new_event_report", (payload: any) => {
      setToastMessage({
        title: "🔔 New Field Report",
        desc: `Branch: ${payload.branchName} · Title: ${payload.title} (${payload.imagesCount} images)`,
      });
      setTimeout(() => setToastMessage(null), 8000);

      setFeed((prev) => [
        {
          id: String(Date.now()),
          text: `Report "${payload.title}" submitted by ${payload.branchName} (${payload.attendanceCount} attended)`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "upload"
        },
        ...prev
      ]);
      loadReports();
    });

    socket.on("report_status_changed", (payload: any) => {
      setFeed((prev) => [
        {
          id: String(Date.now()),
          text: `Report "${payload.title}" has been ${payload.status.toLowerCase()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "status"
        },
        ...prev
      ]);
      loadReports();
    });

    return () => {
      socket.disconnect();
    };
  }, [branchFilter, statusFilter]);

  // Handle manual sync trigger
  const triggerManualSync = async () => {
    if (queuedReports.length === 0 || isSyncing) return;
    setIsSyncing(true);
    setSyncMessage("Synchronizing files...");

    try {
      const token = await getIdToken();
      const results = await syncOfflineReports(token);
      await loadQueue();
      await loadReports();
      
      if (results.failedCount === 0) {
        setSyncMessage(`Sync complete! Successfully uploaded ${results.successCount} reports.`);
      } else {
        setSyncMessage(`Sync partially complete. Success: ${results.successCount}, Failed: ${results.failedCount}. Check connection.`);
      }
    } catch (err) {
      console.error("[PORTAL] Sync error:", err);
      setSyncMessage("Sync failed. Server unreachable.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 6000);
    }
  };

  // Handle report approvals
  const handleStatusChange = async (reportId: string, status: "APPROVED" | "REJECTED") => {
    setActionLoadingId(reportId);
    try {
      const token = await getIdToken();
      const response = await fetch("/api/event-manager/reports", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reportId, status })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReports((prev) =>
            prev.map((r) => (r.id === reportId ? { ...r, status } : r))
          );
        }
      }
    } catch (err) {
      console.error("[PORTAL] Error changing status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Summary counts
  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "PENDING").length,
    attendance: reports.reduce((acc, curr) => acc + curr.attendanceCount, 0),
    offering: reports.reduce((acc, curr) => acc + curr.offeringAmount, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col pb-16">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-white/[0.05] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
            <Image src="/logo.png" alt="KCM Logo" fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">Event Management</h1>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Field Reporting & Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection status */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
            isOnline 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
              : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-ping"}`} />
            <span>{isOnline ? "ONLINE" : "OFFLINE MODE"}</span>
          </div>

          {["SUPER_ADMIN", "ADMIN"].includes(role) && (
            <button 
              onClick={() => router.push("/portal-select")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold transition-all border border-slate-200/65 dark:border-white/10 text-slate-700 dark:text-slate-300"
            >
              Portal Selection
            </button>
          )}

          <ThemeToggle />

          <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user?.name || "User"}</p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase mt-0.5 tracking-wider">
                {role === "SUPER_ADMIN" ? "Super Admin" : role === "ADMIN" ? "Admin" : role === "EVENT_MANAGER" ? "Event Manager" : "Volunteer"}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all border border-red-500/10"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-2xl flex items-start gap-3.5 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-violet-500/10 p-2.5 rounded-2xl text-violet-600 dark:text-violet-400 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">{toastMessage.title}</h4>
            <p className="text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {expandedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setExpandedImage(null)}>
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] relative w-full h-full" onClick={(e) => e.stopPropagation()}>
            <img src={expandedImage} alt="Expanded Outbox Asset" className="w-full h-full object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}

      {/* Main Grid Wrapper */}
      <main className="max-w-7xl mx-auto w-full px-6 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left main content block (takes 3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Welcome Block + Outbox Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Welcome banner */}
            <div className="md:col-span-2 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                <Camera className="w-40 h-40" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[9px] font-bold uppercase tracking-widest text-violet-100">
                  Operations Console
                </span>
                <h2 className="text-2xl font-black mt-1 tracking-tight">Hello, {user?.name?.split(" ")[0] || "User"}! 🙏</h2>
                <p className="text-xs text-violet-100/80 leading-relaxed max-w-md">
                  Submit real-time reports of branch service attendance, tithes, prayers, and media captures. Offline data automatically syncs once connection is restored.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <Link
                  href="/event-manager/report"
                  className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white text-violet-700 hover:bg-violet-50 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Field Report
                </Link>

                <Link
                  href="/event-manager/report?openCamera=true"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/10 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Camera className="w-4 h-4" />
                  Quick Capture
                </Link>
              </div>
            </div>

            {/* Offline outbox display */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Offline Outbox</h3>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">Queue status</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  queuedReports.length > 0
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-slate-100 border-slate-200/60 text-slate-500 dark:bg-white/5 dark:border-white/10 dark:text-slate-400"
                }`}>
                  {queuedReports.length} pending
                </span>
              </div>

              {queuedReports.length === 0 ? (
                <div className="py-5 text-center text-slate-400 dark:text-slate-500 my-auto">
                  <CheckCircle className="w-8 h-8 mx-auto mb-1.5 text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">All data in sync</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Ready for offline usage</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-24 overflow-y-auto my-3 pr-1 custom-scrollbar">
                  {queuedReports.map((report) => (
                    <div 
                      key={report.id}
                      className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.04] p-2.5 rounded-xl flex items-center justify-between gap-3 text-[10px] hover:border-amber-500/30 transition-colors"
                    >
                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate flex-1">{report.title}</span>
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/20 rounded">Queued</span>
                    </div>
                  ))}
                </div>
              )}

              {queuedReports.length > 0 && isOnline ? (
                <button
                  onClick={triggerManualSync}
                  disabled={isSyncing}
                  className="w-full h-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 hover:shadow-md hover:scale-[1.01]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  Sync Outbox Now
                </button>
              ) : (
                <div className="h-10 flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-white/10 rounded-xl font-bold bg-slate-50/50 dark:bg-white/[0.01]">
                  {isOnline ? "Outbox in sync" : "Sync requires connection"}
                </div>
              )}
            </div>

          </div>

          {/* Sync notification banner */}
          {syncMessage && (
            <div className="bg-indigo-50/80 border border-indigo-200/50 dark:bg-indigo-950/20 dark:border-indigo-800/30 p-4 rounded-2xl flex items-start gap-3 text-indigo-700 dark:text-indigo-300 shadow-sm animate-in fade-in duration-200">
              <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-semibold leading-relaxed">{syncMessage}</p>
            </div>
          )}

          {/* Summary counters for managers/admins */}
          {isManagerOrAdmin && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-2xl p-4.5 shadow-sm hover:border-slate-350 dark:hover:border-white/10 transition-colors">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Total Reports</span>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stats.total}</p>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">submitted</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-2xl p-4.5 shadow-sm hover:border-slate-350 dark:hover:border-white/10 transition-colors">
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block mb-1.5">Pending Approval</span>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-amber-500 tracking-tight">{stats.pending}</p>
                  <span className="text-[10px] font-bold text-amber-500/80">requires review</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-2xl p-4.5 shadow-sm hover:border-slate-350 dark:hover:border-white/10 transition-colors">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Total Attendance</span>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stats.attendance}</p>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">people</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-2xl p-4.5 shadow-sm hover:border-slate-350 dark:hover:border-white/10 transition-colors">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Offerings (INR)</span>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">₹{stats.offering.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search toolbar */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-4.5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Reports Database</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 dark:text-white text-xs font-bold focus:outline-none flex-1 md:flex-initial"
              >
                <option value="all">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 dark:text-white text-xs font-bold focus:outline-none flex-1 md:flex-initial"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Database Reports Feed */}
          {isLoadingReports ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.05] rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.05] rounded-3xl text-slate-400 dark:text-slate-500 shadow-sm">
              <AlertCircle className="w-12 h-12 mx-auto mb-3.5 text-slate-300 dark:text-slate-800" />
              <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300">No reports found</p>
              <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">Submit activity reports to display database records here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reports.map((report) => (
                <div 
                  key={report.id}
                  className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md hover:border-slate-300/80 dark:hover:border-white/10 transition-all duration-300"
                >
                  {/* Header info */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/15 rounded-lg">
                          {report.branch.name}
                        </span>
                        
                        <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-lg border flex items-center gap-1 ${
                          report.status === "APPROVED"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : report.status === "REJECTED"
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            report.status === "APPROVED" ? "bg-emerald-500" : report.status === "REJECTED" ? "bg-rose-500" : "bg-amber-500"
                          }`} />
                          {report.status}
                        </span>
                      </div>
                      <h3 className="text-md font-black text-slate-900 dark:text-white leading-tight tracking-tight">{report.title}</h3>
                    </div>

                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left md:text-right space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(report.reportDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="text-[9px] font-semibold text-slate-400 dark:text-slate-600">Created by: {report.createdBy.name}</div>
                    </div>
                  </div>

                  {/* Notes description */}
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                    {report.description}
                  </p>

                  {/* Grid details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-250/20 dark:border-white/[0.03] p-4 rounded-2xl text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Attendance</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{report.attendanceCount}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Offering Collected</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">₹{report.offeringAmount.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="space-y-0.5 col-span-2">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">GPS coordinates</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate tracking-wide">{report.gpsLocation || "Not recorded"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Attending list */}
                  {report.volunteerNames.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Attending Volunteers</span>
                      <div className="flex flex-wrap gap-1.5">
                        {report.volunteerNames.map((name, idx) => (
                          <span key={idx} className="bg-slate-100 dark:bg-white/5 border border-slate-205 dark:border-white/10 px-2.5 py-1 rounded-xl text-[9px] font-bold text-slate-600 dark:text-slate-400">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Photo attachment list */}
                  {report.media.length > 0 && (
                    <div className="space-y-2 border-t border-slate-100 dark:border-white/5 pt-4">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Event Snaps ({report.media.length})</span>
                      <div className="grid grid-cols-4 gap-3">
                        {report.media.map((item) => (
                          <div 
                            key={item.id}
                            onClick={() => setExpandedImage(item.url)}
                            className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/10 cursor-pointer group shadow-sm hover:shadow-md transition-shadow"
                          >
                            <img src={item.url} alt="Field Outbox" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                              <Maximize2 className="w-4.5 h-4.5 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approvals Action Menu (Only visible for managers/admins) */}
                  {isManagerOrAdmin && report.status === "PENDING" && (
                    <div className="flex items-center justify-end gap-2.5 border-t border-slate-150/40 dark:border-white/5 pt-4">
                      <button
                        onClick={() => handleStatusChange(report.id, "REJECTED")}
                        disabled={actionLoadingId === report.id}
                        className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-450 text-xs font-bold hover:bg-rose-500/10 active:scale-[0.97] transition-all disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>

                      <button
                        onClick={() => handleStatusChange(report.id, "APPROVED")}
                        disabled={actionLoadingId === report.id}
                        className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:from-emerald-500 hover:to-teal-500 shadow-md hover:shadow-emerald-500/15 active:scale-[0.97] transition-all disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Sidebar: Real-time Live Activity logs (takes 1 col) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
              <Activity className="w-4 h-4 text-violet-550 dark:text-violet-400" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Live Updates</h3>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">Real-time companion feed</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-auto" />
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
              {feed.map((act) => (
                <div key={act.id} className="text-xs space-y-1 border-l border-slate-200 dark:border-white/10 pl-3.5 relative py-0.5">
                  <div className="absolute w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400 -left-[4.5px] top-[7px] border border-white dark:border-slate-900 shadow-sm" />
                  <p className="font-semibold text-slate-600 dark:text-slate-350 leading-relaxed">{act.text}</p>
                  <span className="text-[9px] text-slate-400 dark:text-slate-550 font-bold">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
