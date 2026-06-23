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
  AlertCircle,
  FileText,
  Building2,
  Clock,
  Check,
  X,
  Activity,
  LogOut,
  Calendar,
  Maximize2,
  Download,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  Loader2,
  ChevronDown,
  User,
  Pencil,
  Trash2,
  UploadCloud,
  Paperclip,
  Compass,
  Play
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import CameraCapture from "@/components/CameraCapture";

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
  createdById: string;
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

interface AttachedMedia {
  id: string;
  type: "IMAGE" | "VIDEO";
  base64: string;
  name: string;
  size: number;
  progress: number;
  isUploading: boolean;
}

export default function UnifiedEventManagementPortal() {
  const router = useRouter();
  const { user, getIdToken, logout } = useAuth();

  // Parse greeting name professionally
  const getGreetingName = (fullName?: string | null) => {
    if (!fullName) return "User";
    const parts = fullName.split(" ");
    if (fullName.toLowerCase().startsWith("event manager") && parts.length > 2) {
      return parts.slice(2).join(" ");
    }
    if (fullName.toLowerCase().startsWith("pastor") && parts.length > 1) {
      return parts.slice(1).join(" ");
    }
    return parts[0];
  };

  // Export Reports to CSV File
  const exportToCSV = () => {
    if (reports.length === 0) return;
    const headers = [
      "Report ID",
      "Branch",
      "Title",
      "Description",
      "Attendance",
      "Offering (INR)",
      "Report Date",
      "GPS Location",
      "Volunteers",
      "Status",
      "Created By"
    ];
    const rows = reports.map(r => [
      r.id,
      r.branch.name,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      r.attendanceCount,
      r.offeringAmount,
      r.reportDate,
      r.gpsLocation || "N/A",
      `"${r.volunteerNames.join(", ")}"`,
      r.status,
      `"${r.createdBy.name} (${r.createdBy.email})"`
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `KCM_Field_Reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Offline outbox states
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const [expandedReports, setExpandedReports] = useState<Record<string, boolean>>({});

  // Edit and Delete states
  const [editingReport, setEditingReport] = useState<DBReport | null>(null);
  const [deletingReport, setDeletingReport] = useState<DBReport | null>(null);

  // Edit Modal Form States
  const [editBranchId, setEditBranchId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editReportDate, setEditReportDate] = useState("");
  const [editAttendanceCount, setEditAttendanceCount] = useState<number>(0);
  const [editOfferingAmount, setEditOfferingAmount] = useState<number>(0);
  const [editVolunteerNames, setEditVolunteerNames] = useState("");
  const [existingMedia, setExistingMedia] = useState<MediaItem[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [newAttachedMedia, setNewAttachedMedia] = useState<AttachedMedia[]>([]);
  const [showEditCamera, setShowEditCamera] = useState(false);
  const [isEditDragging, setIsEditDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openEditModal = (report: DBReport) => {
    setEditingReport(report);
    setEditBranchId(report.branchId);
    setEditTitle(report.title);
    setEditDescription(report.description);
    setEditReportDate(report.reportDate.split("T")[0]);
    setEditAttendanceCount(report.attendanceCount);
    setEditOfferingAmount(report.offeringAmount);
    setEditVolunteerNames(report.volunteerNames.join(", "));
    setExistingMedia(report.media);
    setRemovedMediaIds([]);
    setNewAttachedMedia([]);
    setSaveError(null);
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    const volunteersList = editVolunteerNames
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const newImages = newAttachedMedia.filter(item => item.type === "IMAGE" && !item.isUploading).map(item => item.base64);
    const newVideos = newAttachedMedia.filter(item => item.type === "VIDEO" && !item.isUploading).map(item => item.base64);

    const updatePayload = {
      branchId: editBranchId,
      title: editTitle,
      description: editDescription,
      attendanceCount: editAttendanceCount,
      offeringAmount: editOfferingAmount,
      reportDate: new Date(editReportDate).toISOString(),
      volunteerNames: volunteersList,
      removedMediaIds,
      newImages,
      newVideos,
    };

    try {
      const token = await getIdToken();
      const response = await fetch(`/api/event-manager/reports/${editingReport.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update local state
        setReports(prev => prev.map(r => r.id === editingReport.id ? result.report : r));
        setEditingReport(null);
        setToastMessage({
          title: "✅ Report Updated",
          desc: `Successfully updated report "${editTitle}".`,
        });
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        setSaveError(result.error || "Failed to save updates.");
      }
    } catch (err: any) {
      console.error("[PORTAL] Update report error:", err);
      setSaveError("A network error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (actionLoadingId === reportId) return;
    setActionLoadingId(reportId);

    try {
      const token = await getIdToken();
      const response = await fetch(`/api/event-manager/reports/${reportId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setReports(prev => prev.filter(r => r.id !== reportId));
        setToastMessage({
          title: "🗑️ Report Deleted",
          desc: "The field report has been successfully deleted.",
        });
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        alert(result.error || "Failed to delete report.");
      }
    } catch (err) {
      console.error("[PORTAL] Delete report error:", err);
      alert("A network error occurred while deleting the report.");
    } finally {
      setActionLoadingId(null);
      setDeletingReport(null);
    }
  };

  // Edit media handling helpers
  const handleEditPhotoCapture = (base64: string) => {
    const tempId = Math.random().toString(36).substring(2, 9);
    const newItem: AttachedMedia = {
      id: tempId,
      type: "IMAGE",
      base64,
      name: `captured-snap-${Date.now()}.jpg`,
      size: Math.round((base64.length * 3) / 4),
      progress: 100,
      isUploading: false
    };
    setNewAttachedMedia((prev) => [...prev, newItem]);
    setShowEditCamera(false);
  };

  const processEditFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      alert("Unsupported file type. Please upload an image or video.");
      return;
    }
    
    if (isImage && file.size > 10 * 1024 * 1024) {
      alert(`Image "${file.name}" exceeds the 10MB limit.`);
      return;
    }
    if (isVideo && file.size > 100 * 1024 * 1024) {
      alert(`Video "${file.name}" exceeds the 100MB limit.`);
      return;
    }

    const tempId = Math.random().toString(36).substring(2, 9);
    const newItem: AttachedMedia = {
      id: tempId,
      type: isImage ? "IMAGE" : "VIDEO",
      base64: "",
      name: file.name,
      size: file.size,
      progress: 10,
      isUploading: true
    };
    
    setNewAttachedMedia(prev => [...prev, newItem]);

    let simulatedProgress = 10;
    const progressInterval = setInterval(() => {
      simulatedProgress = Math.min(simulatedProgress + 15, 95);
      setNewAttachedMedia(prev => 
        prev.map(item => item.id === tempId ? { ...item, progress: simulatedProgress } : item)
      );
    }, 100);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      if (isImage) {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 1024;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.floor((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const base64 = canvas.toDataURL("image/jpeg", 0.8);
            
            clearInterval(progressInterval);
            setNewAttachedMedia(prev => 
              prev.map(item => item.id === tempId ? { ...item, base64, progress: 100, isUploading: false } : item)
            );
          }
        };
        img.src = result;
      } else {
        clearInterval(progressInterval);
        setNewAttachedMedia(prev => 
          prev.map(item => item.id === tempId ? { ...item, base64: result, progress: 100, isUploading: false } : item)
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

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
        desc: `Branch: ${payload.branchName} · Title: ${payload.title} (${payload.imagesCount} snaps)`,
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

  const toggleReportExpanded = (id: string) => {
    setExpandedReports(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Summary counts
  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "PENDING").length,
    attendance: reports.reduce((acc, curr) => acc + curr.attendanceCount, 0),
    offering: reports.reduce((acc, curr) => acc + curr.offeringAmount, 0),
  };

  // Branch-wise Analytics Breakdown
  const branchStats = branches.map(branch => {
    const branchReports = reports.filter(r => r.branchId === branch.id);
    const totalOffering = branchReports.reduce((sum, r) => sum + r.offeringAmount, 0);
    const totalAttendance = branchReports.reduce((sum, r) => sum + r.attendanceCount, 0);
    return {
      name: branch.name,
      offering: totalOffering,
      attendance: totalAttendance,
      count: branchReports.length
    };
  }).filter(b => b.count > 0);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-150 transition-colors duration-300 flex flex-col pb-16 relative">
      
      {/* Background Luminous Neon Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-[130px] pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-float-delayed" />
      <div className="absolute top-1/2 left-10 w-[300px] h-[300px] bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-md">
        
        {/* Bottom Border Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500" />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm shrink-0">
            <Image src="/logo.png" alt="KCM Logo" fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">Event Management</h1>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 hidden sm:block">Field Reporting & Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Connection status */}
          <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
            isOnline 
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/5" 
              : "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm shadow-amber-500/5 animate-pulse"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-ping"}`} />
            <span className="hidden sm:inline">{isOnline ? "ONLINE" : "OFFLINE MODE"}</span>
          </div>

          {["SUPER_ADMIN", "ADMIN"].includes(role) && (
            <button 
              onClick={() => router.push("/portal-select")}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold transition-all border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-inner"
              title="Portal Selection"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Portal Selection</span>
            </button>
          )}

          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block text-right">
              <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{user?.name || "User"}</p>
              <p className="text-[9px] text-slate-400 dark:text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                {role === "SUPER_ADMIN" ? "Super Admin" : role === "ADMIN" ? "Admin" : role === "EVENT_MANAGER" ? "Event Manager" : "Volunteer"}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-black transition-all border border-rose-500/15"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-2xl flex items-start gap-3.5"
          >
            <div className="bg-violet-500/10 p-2.5 rounded-2xl text-violet-650 dark:text-violet-400 shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-650 dark:text-violet-400">{toastMessage.title}</h4>
              <p className="text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">{toastMessage.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" 
            onClick={() => setExpandedImage(null)}
          >
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-4xl max-h-[85vh] relative w-full h-full" 
              onClick={(e) => e.stopPropagation()}
            >
              <img src={expandedImage} alt="Expanded Asset Preview" className="w-full h-full object-contain rounded-2xl shadow-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Content Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 flex-1">
        
        {/* Left main content block (takes 3 cols) */}
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          
          {/* Welcome Block + Outbox Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Welcome banner */}
            <div className="sm:col-span-2 md:col-span-1 lg:col-span-2 relative overflow-hidden rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-violet-600 via-indigo-650 to-indigo-900 border border-white/10 flex flex-col justify-between group min-h-[220px]">
              
              {/* Luminous background blobs */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-yellow-300/10 blur-3xl group-hover:bg-yellow-300/20 transition-colors duration-700 pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none" />
              
              <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 pointer-events-none">
                <Camera className="w-40 h-40 text-white" />
              </div>
              <div className="space-y-2 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-indigo-50">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                  Operations Console
                </span>
                <h2 className="text-2xl md:text-3xl font-black mt-2 tracking-tight leading-tight bg-gradient-to-r from-white via-indigo-50 to-indigo-100 bg-clip-text text-transparent">
                  Welcome, Event Manager! 🙏
                </h2>
                <p className="text-xs text-white/90 leading-relaxed max-w-md font-medium mt-1">
                  Submit real-time reports of branch service attendance, tithes, prayers, and media captures. Offline data automatically syncs once connection is restored.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-6 relative z-10">
                <Link
                  href="/event-manager/report"
                  className="flex items-center gap-2 px-5 py-3 bg-white !text-[#0f1021] hover:bg-slate-50 rounded-xl text-xs font-black transition-all shadow-lg active:scale-95 hover:shadow-indigo-500/20"
                >
                  <PlusCircle className="w-4 h-4 !text-[#0f1021]" />
                  Create Field Report
                </Link>

                <Link
                  href="/event-manager/report?openCamera=true"
                  className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-black text-white transition-all active:scale-95"
                >
                  <Camera className="w-4 h-4 text-white/80" />
                  Quick Capture
                </Link>
              </div>
            </div>

            {/* Offline outbox display */}
            <div className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-950/70 backdrop-blur-xl border border-violet-500/20 dark:border-violet-500/30 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:shadow-xl hover:border-violet-500/40 dark:hover:border-violet-500/50 transition-all duration-300">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-violet-500/10 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-3 relative z-10">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Offline Outbox</h3>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">Queue status</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  queuedReports.length > 0
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse shadow-sm"
                    : "bg-slate-100 border-slate-200 text-slate-500 dark:bg-white/5 dark:border-white/10 dark:text-slate-400"
                }`}>
                  {queuedReports.length} pending
                </span>
              </div>

              {queuedReports.length === 0 ? (
                <div className="py-5 text-center text-slate-450 dark:text-slate-500 my-auto relative z-10">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2 shadow-inner shadow-emerald-500/5">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">All data in sync</p>
                  <p className="text-[9px] text-slate-450 dark:text-slate-500 mt-0.5 font-medium">Ready for offline usage</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-24 overflow-y-auto my-3 pr-1 custom-scrollbar relative z-10">
                  {queuedReports.map((report) => (
                    <div 
                      key={report.id}
                      className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.04] p-2.5 rounded-xl flex items-center justify-between gap-3 text-[10px] hover:border-amber-500/30 transition-colors"
                    >
                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate flex-1">{report.title}</span>
                      <span className="text-[8px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/25 rounded">Queued</span>
                    </div>
                  ))}
                </div>
              )}

              {queuedReports.length > 0 && isOnline ? (
                <button
                  onClick={triggerManualSync}
                  disabled={isSyncing}
                  className="w-full h-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-violet-500/10"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  Sync Outbox Now
                </button>
              ) : (
                <div className="h-10 flex items-center justify-center text-[10px] text-slate-405 dark:text-slate-500 border border-dashed border-slate-200 dark:border-white/10 rounded-xl font-bold bg-slate-50/50 dark:bg-white/[0.01] relative z-10">
                  {isOnline ? "Outbox in sync" : "Sync requires connection"}
                </div>
              )}
            </div>

          </div>

          {/* Sync notification banner */}
          <AnimatePresence>
            {syncMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-indigo-50/80 border border-indigo-200/50 dark:bg-indigo-950/20 dark:border-indigo-800/30 p-4 rounded-2xl flex items-start gap-3 text-indigo-700 dark:text-indigo-300 shadow-sm"
              >
                <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-semibold leading-relaxed">{syncMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Colorful Summary counters for managers/admins */}
          {isManagerOrAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Total Reports */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.01 }}
                className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 to-indigo-500/5 dark:from-violet-950/20 dark:to-indigo-950/5 border border-violet-500/20 dark:border-violet-500/30 rounded-3xl p-5 shadow-lg flex justify-between items-center group border-l-4 border-l-violet-500 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-violet-500/10 blur-xl pointer-events-none" />
                <div className="space-y-1 relative z-10">
                  <span className="text-[9px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest block">Total Reports</span>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-3xl font-black text-violet-700 dark:text-violet-300 tracking-tight">{stats.total}</p>
                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">logs</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-violet-500/20 dark:bg-violet-500/30 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <FileText className="w-5.5 h-5.5 text-violet-600 dark:text-violet-400" />
                </div>
              </motion.div>

              {/* Pending Review */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.01 }}
                className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-950/20 dark:to-orange-950/5 border border-amber-500/20 dark:border-amber-500/30 rounded-3xl p-5 shadow-lg flex justify-between items-center group border-l-4 border-l-amber-500 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
                <div className="space-y-1 relative z-10">
                  <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block">Pending Review</span>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-300 tracking-tight">{stats.pending}</p>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">needs action</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center text-amber-505 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <Clock className="w-5.5 h-5.5 text-amber-600 dark:text-amber-400" />
                </div>
              </motion.div>

              {/* Total Attendance */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.01 }}
                className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/20 dark:to-teal-950/5 border border-emerald-500/20 dark:border-emerald-500/30 rounded-3xl p-5 shadow-lg flex justify-between items-center group border-l-4 border-l-emerald-500 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
                <div className="space-y-1 relative z-10">
                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Total Attendance</span>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">{stats.attendance}</p>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">people</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <Users className="w-5.5 h-5.5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </motion.div>
            </div>
          )}

          {/* Filters and Search toolbar */}
          <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-violet-500/20 dark:border-violet-500/30 rounded-3xl p-4.5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Reports Database</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {reports.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5 active:scale-95"
                  title="Export reports data to CSV file"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              )}

              <div className="relative flex items-center flex-1 md:flex-initial">
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="h-10 pl-3.5 pr-8 rounded-xl bg-slate-100 dark:bg-slate-950 border border-violet-500/30 dark:border-violet-500/20 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/50 flex-grow md:flex-initial cursor-pointer appearance-none"
                >
                  <option value="all">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 pointer-events-none text-slate-400 dark:text-slate-500" />
              </div>

              <div className="relative flex items-center flex-1 md:flex-initial">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 pl-3.5 pr-8 rounded-xl bg-slate-100 dark:bg-slate-950 border border-violet-500/30 dark:border-violet-500/20 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/50 flex-grow md:flex-initial cursor-pointer appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING">Pending Approval</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 pointer-events-none text-slate-400 dark:text-slate-500" />
              </div>
            </div>
          </div>

          {/* Database Reports Feed */}
          {isLoadingReports ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 bg-white/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-white/10 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="py-20 text-center bg-white/40 dark:bg-slate-900/10 backdrop-blur-xl border border-slate-200/30 dark:border-white/5 rounded-3xl shadow-lg space-y-4 max-w-lg mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 rounded-full bg-violet-500/5 blur-2xl pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/20 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-550 shadow-inner">
                <AlertCircle className="w-8 h-8 text-violet-500" />
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-lg font-black text-slate-800 dark:text-white tracking-tight">No Reports Found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                  There are no submitted logs matching your filters. Submit a field report or check another branch.
                </p>
              </div>
              <div className="pt-2 relative z-10">
                <Link
                  href="/event-manager/report"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-500/20 active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create First Report
                </Link>
              </div>
            </div>
          ) : (
            <motion.div 
              layout
              className="space-y-6"
            >
              <AnimatePresence>
                {reports.map((report) => {
                  const isExpanded = expandedReports[report.id] || false;
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={report.id}
                      className={`relative bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900/40 dark:to-slate-950/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 shadow-lg space-y-4 hover:shadow-xl hover:border-violet-500/30 dark:hover:border-violet-500/20 transition-all duration-300 border-l-4 ${
                        report.status === "APPROVED" 
                          ? "border-l-emerald-500" 
                          : report.status === "REJECTED" 
                          ? "border-l-rose-500" 
                          : "border-l-amber-500"
                      }`}
                    >
                      {/* Header info */}
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-lg">
                              {report.branch.name}
                            </span>
                            
                            <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1 ${
                              report.status === "APPROVED"
                                ? "bg-emerald-600 text-white border-emerald-700"
                                : report.status === "REJECTED"
                                ? "bg-rose-600 text-white border-rose-700"
                                : "bg-amber-500 text-slate-950 border-amber-600"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                report.status === "APPROVED" ? "bg-white animate-pulse" : report.status === "REJECTED" ? "bg-white" : "bg-slate-950 animate-ping"
                              }`} />
                              {report.status}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight tracking-tight">{report.title}</h3>
                        </div>

                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left md:text-right space-y-1 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-violet-500" />
                            <span>{new Date(report.reportDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 dark:text-slate-400 flex items-center gap-1">
                            <User className="w-3 h-3 text-indigo-500" />
                            <span>By: {report.createdBy.name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Brief preview description (when collapsed) */}
                      {!isExpanded && (
                        <p className="text-xs leading-relaxed text-slate-550 dark:text-slate-400 font-semibold line-clamp-2">
                          {report.description || "No description provided."}
                        </p>
                      )}

                      {/* Grid details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-100/50 dark:bg-slate-950/60 border border-slate-200/40 dark:border-white/5 p-4 rounded-2xl text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider block">Attendance</span>
                          <span className="font-extrabold text-violet-600 dark:text-violet-400 text-sm flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-violet-500" />
                            {report.attendanceCount}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider block">Offering Collected</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-450 text-sm flex items-center gap-1">
                            <span className="text-emerald-500 font-extrabold">₹</span>
                            {report.offeringAmount.toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div className="space-y-0.5 col-span-2">
                          <span className="text-[9px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider block">GPS coordinates</span>
                          <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-bounce" />
                            <span className="truncate tracking-wide">{report.gpsLocation || "Not recorded"}</span>
                          </span>
                        </div>
                      </div>

                      {/* View Details / Collapse Toggle */}
                      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sm:justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => toggleReportExpanded(report.id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-[10px] font-bold text-violet-600 dark:text-violet-300 transition-all border border-violet-500/20 shadow-sm"
                          >
                            <span>{isExpanded ? "Show Less" : "View Full Details"}</span>
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} />
                          </button>

                          {/* Edit / Delete Buttons */}
                          {(isManagerOrAdmin || (report.createdById === user?.uid && report.status === "PENDING")) && (
                            <div className="flex items-center gap-1.5 ml-2">
                              <button
                                onClick={() => openEditModal(report)}
                                className="p-2 bg-slate-100 hover:bg-violet-500/10 dark:bg-white/5 dark:hover:bg-violet-500/20 rounded-xl border border-slate-200/50 dark:border-white/10 transition-all text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300 shadow-sm cursor-pointer"
                                title="Edit Report"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingReport(report)}
                                disabled={actionLoadingId === report.id}
                                className="p-2 bg-slate-100 hover:bg-rose-500/10 dark:bg-white/5 dark:hover:bg-rose-500/20 rounded-xl border border-slate-200/50 dark:border-white/10 transition-all text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 shadow-sm cursor-pointer"
                                title="Delete Report"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Approvals Action Menu (Only visible for managers/admins and when pending) */}
                        {isManagerOrAdmin && report.status === "PENDING" && (
                          <div className="flex items-center justify-end sm:justify-start gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleStatusChange(report.id, "REJECTED")}
                              disabled={actionLoadingId === report.id}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/10 transition-all disabled:opacity-50 active:scale-95"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>

                            <button
                              onClick={() => handleStatusChange(report.id, "APPROVED")}
                              disabled={actionLoadingId === report.id}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:from-emerald-500 hover:to-teal-500 shadow-md hover:shadow-emerald-500/10 transition-all disabled:opacity-50 active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Expandable Content Area (Description, Volunteers, Snaps) */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden space-y-4 border-t border-slate-100 dark:border-white/5 pt-4"
                          >
                            <div className="space-y-2">
                              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Report Notes</span>
                              <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-300 font-medium">
                                {report.description || "No description provided."}
                              </p>
                            </div>

                            {/* Attending list */}
                            {report.volunteerNames.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Attending Volunteers</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {report.volunteerNames.map((name, idx) => (
                                    <span key={idx} className="bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-xl text-[9px] font-bold text-violet-600 dark:text-violet-400">
                                      {name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Photo attachment list */}
                            {report.media.length > 0 && (
                              <div className="space-y-2 border-t border-slate-100 dark:border-white/5 pt-4">
                                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Event Snaps ({report.media.length})</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {report.media.map((item) => (
                                    <div 
                                      key={item.id}
                                      onClick={() => setExpandedImage(item.url)}
                                      className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/10 cursor-pointer group shadow-sm hover:shadow-md"
                                    >
                                      <img src={item.url} alt="Snap upload" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                        <Maximize2 className="w-4 h-4 text-white" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

        </div>

        {/* Right Sidebar: Real-time Live Activity logs (takes 1 col) */}
        <div className="space-y-6">
          {/* Branch metrics breakdown charts */}
          {branchStats.length > 0 && (
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-violet-500/20 dark:border-violet-500/30 rounded-3xl p-5 shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
                <Building2 className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Branch Share</h3>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">Offering & Log contribution</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {branchStats.map((stat, idx) => {
                  const maxOffering = Math.max(...branchStats.map(b => b.offering), 1);
                  const percentage = (stat.offering / maxOffering) * 100;
                  
                  // Distinct colorful gradients
                  const gradients = [
                    "from-emerald-500 to-teal-500",
                    "from-violet-500 to-pink-500",
                    "from-amber-500 to-orange-500",
                    "from-cyan-500 to-blue-500",
                    "from-fuchsia-500 to-purple-500"
                  ];
                  const gradient = gradients[idx % gradients.length];
                  
                  const textColors = [
                    "text-emerald-600 dark:text-emerald-400",
                    "text-violet-600 dark:text-violet-400",
                    "text-amber-600 dark:text-amber-400",
                    "text-cyan-600 dark:text-cyan-400",
                    "text-fuchsia-600 dark:text-fuchsia-400"
                  ];
                  const textColor = textColors[idx % textColors.length];

                  return (
                    <div key={stat.name} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-700 dark:text-slate-300 truncate pr-2 max-w-[120px]">{stat.name}</span>
                        <span className={`${textColor} shrink-0`}>₹{stat.offering.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className={`bg-gradient-to-r ${gradient} h-full rounded-full`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color-Coded Activity Feed */}
          <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-violet-500/20 dark:border-violet-500/30 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
              <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400 animate-pulse" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Live Updates</h3>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold font-medium">Real-time companion feed</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-auto" />
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar mt-4">
              {feed.map((act) => {
                const colorConfig = {
                  sys: {
                    border: "border-sky-500/20 dark:border-sky-500/30",
                    bullet: "bg-sky-500",
                    text: "text-sky-700 dark:text-sky-300",
                    bg: "bg-sky-500/5 dark:bg-sky-500/[0.03]"
                  },
                  upload: {
                    border: "border-violet-500/20 dark:border-violet-500/30",
                    bullet: "bg-violet-500",
                    text: "text-violet-700 dark:text-violet-300",
                    bg: "bg-violet-500/5 dark:bg-violet-500/[0.03]"
                  },
                  status: {
                    border: "border-amber-500/20 dark:border-amber-500/30",
                    bullet: "bg-amber-500",
                    text: "text-amber-700 dark:text-amber-300",
                    bg: "bg-amber-500/5 dark:bg-amber-500/[0.03]"
                  }
                };
                const config = colorConfig[act.type] || colorConfig.sys;

                return (
                  <div key={act.id} className={`text-xs p-2.5 rounded-xl border ${config.border} ${config.bg} space-y-1 border-l-2 pl-3 relative transition-all hover:translate-x-0.5 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-white/5 shadow-inner">
                        {act.type}
                      </span>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold">{act.time}</span>
                    </div>
                    <p className={`font-semibold ${config.text} leading-relaxed`}>{act.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDeletingReport(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl max-w-md w-full relative space-y-5 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-rose-500/10 blur-xl pointer-events-none" />
              
              <div className="flex items-start gap-4">
                <div className="bg-rose-500/10 p-3 rounded-2xl text-rose-600 dark:text-rose-400 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Delete Field Report</h3>
                  <p className="text-xs text-slate-505 dark:text-slate-400 font-medium leading-relaxed">
                    Are you sure you want to delete report <span className="font-bold text-slate-800 dark:text-white">"{deletingReport.title}"</span>? This action is permanent and will delete all associated media files from the disk.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeletingReport(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-405 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteReport(deletingReport.id)}
                  disabled={actionLoadingId === deletingReport.id}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-550 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-rose-500/15 flex items-center gap-1.5 cursor-pointer"
                >
                  {actionLoadingId === deletingReport.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Report Modal */}
      <AnimatePresence>
        {editingReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setEditingReport(null)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl max-w-2xl w-full mx-auto my-4 sm:my-8 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Banner Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600" />

              {/* Close Button */}
              <button
                onClick={() => setEditingReport(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 transition-all border border-slate-200/50 dark:border-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
                <div className="p-2.5 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Edit Field Report</h3>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase mt-0.5 tracking-wider">Update branch logs & media reports</p>
                </div>
              </div>

              {saveError && (
                <div className="bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/30 p-3.5 rounded-xl flex items-start gap-2.5 text-rose-600 dark:text-rose-400 mb-4 text-xs font-semibold">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <div>{saveError}</div>
                </div>
              )}

              <form onSubmit={handleUpdateReport} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Branch, Title, Date Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Branch select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Branch Location</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Compass className="w-4 h-4" />
                      </div>
                      <select
                        required
                        value={editBranchId}
                        onChange={(e) => setEditBranchId(e.target.value)}
                        className="w-full h-10 pl-9 pr-8 rounded-xl bg-slate-55 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all appearance-none cursor-pointer"
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id} className="dark:bg-slate-900">{b.name} Branch</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                    </div>
                  </div>

                  {/* Date picker */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Report Date</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        type="date"
                        required
                        value={editReportDate}
                        onChange={(e) => setEditReportDate(e.target.value)}
                        className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-slate-55 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all"
                      />
                    </div>
                  </div>

                </div>

                {/* Event Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Event / Activity Name</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sunday Service, Youth Fellowship"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-slate-55 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all"
                    />
                  </div>
                </div>

                {/* Attendance & Offering (INR) Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Attendance Count */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Attendance Count</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={editAttendanceCount}
                        onChange={(e) => setEditAttendanceCount(Number(e.target.value))}
                        className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-slate-55 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Offering Amount */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Offering Collected (INR)</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-xs">
                        ₹
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={editOfferingAmount}
                        onChange={(e) => setEditOfferingAmount(Number(e.target.value))}
                        className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-slate-55 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all"
                      />
                    </div>
                  </div>

                </div>

                {/* Description Textarea */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Daily Activity Notes & outcomes</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide a report of the ministry outcome, prayer needs, and notable event actions..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-55 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all resize-none"
                  />
                </div>

                {/* Volunteer Names */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Volunteers Attended (Comma-separated)</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. John Doe, Sarah Smith, Michael John"
                      value={editVolunteerNames}
                      onChange={(e) => setEditVolunteerNames(e.target.value)}
                      className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-slate-55 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all"
                    />
                  </div>
                </div>

                {/* Existing Media Section */}
                {existingMedia.length > 0 && (
                  <div className="space-y-2 border-t border-slate-100 dark:border-white/5 pt-4">
                    <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Existing Media Attachments</label>
                    <div className="grid grid-cols-4 gap-3">
                      {existingMedia.map((item) => {
                        const isRemoved = removedMediaIds.includes(item.id);
                        return (
                          <div 
                            key={item.id}
                            className={`relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 group shadow-sm transition-opacity ${isRemoved ? "opacity-30 border-rose-500/40" : ""}`}
                          >
                            <img src={item.url} alt="Uploaded snap" className="w-full h-full object-cover" />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              {isRemoved ? (
                                <button
                                  type="button"
                                  onClick={() => setRemovedMediaIds(prev => prev.filter(id => id !== item.id))}
                                  className="px-2 py-1 bg-violet-600 hover:bg-violet-550 rounded-lg text-white text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                >
                                  Undo Remove
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setRemovedMediaIds(prev => [...prev, item.id])}
                                  className="p-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-white transition-colors cursor-pointer"
                                  title="Remove media attachment"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Label showing removed status */}
                            {isRemoved && (
                              <span className="absolute bottom-2 left-2 text-[8px] font-black uppercase bg-rose-600 text-white px-1.5 py-0.5 border border-rose-750 rounded shadow-sm">
                                Marked for Deletion
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload New Media Section */}
                <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4">
                  <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Upload New Media Attachments</label>
                  
                  {/* File Upload drag-drop area */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsEditDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsEditDragging(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsEditDragging(false);
                      const files = e.dataTransfer.files;
                      if (files && files.length > 0) {
                        Array.from(files).forEach(processEditFile);
                      }
                    }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*,video/mp4,video/webm";
                      input.multiple = true;
                      input.onchange = (e: any) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          Array.from(files as FileList).forEach(processEditFile);
                        }
                      };
                      input.click();
                    }}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center min-h-[120px] ${
                      isEditDragging 
                        ? "border-violet-500 bg-violet-500/5 dark:bg-violet-500/10 scale-[1.01]" 
                        : "border-slate-200 hover:border-violet-500/50 dark:border-white/10 dark:hover:border-violet-500/35 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-slate-400 group-hover:text-violet-500 transition-colors shadow-sm">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-[11px] font-extrabold text-slate-705 dark:text-slate-200">
                        Drag new images/videos here, or <span className="text-violet-650 dark:text-violet-400 group-hover:underline">browse files</span>
                      </p>
                    </div>

                    {/* Camera Shortcut button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEditCamera(true);
                      }}
                      className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      Snapshot
                    </button>
                  </div>

                  {/* New attachments list */}
                  {newAttachedMedia.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {newAttachedMedia.map((item) => (
                        <div 
                          key={item.id}
                          className="relative aspect-video rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/10 group shadow-sm bg-slate-900"
                        >
                          {item.isUploading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-slate-900 text-white space-y-1.5">
                              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                              <p className="text-[8px] font-bold truncate w-full px-1">{item.name}</p>
                              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-1 px-1">
                                <div 
                                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              {item.type === "IMAGE" ? (
                                <img src={item.base64} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
                                  <video src={item.base64} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                      <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Hover Action overlay */}
                              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                                <div className="flex justify-between items-start">
                                  <span className="text-[8px] font-bold bg-white/20 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                                    {formatBytes(item.size)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setNewAttachedMedia(prev => prev.filter(media => media.id !== item.id))}
                                    className="p-1 bg-rose-600 hover:bg-rose-500 rounded text-white transition-all active:scale-95 shadow-md cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="text-[8px] font-bold truncate pr-1">{item.name}</p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditingReport(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-55 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || newAttachedMedia.some(item => item.isUploading)}
                    className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-650 text-white rounded-xl text-xs font-bold hover:from-violet-500 hover:to-indigo-500 shadow-md hover:shadow-violet-500/10 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Save Updates
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Camera Overlay */}
      {showEditCamera && (
        <CameraCapture
          onCapture={handleEditPhotoCapture}
          onClose={() => setShowEditCamera(false)}
        />
      )}
    </div>
  );
}
