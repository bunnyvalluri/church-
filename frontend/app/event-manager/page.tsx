"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import { getQueuedReports, syncOfflineReports, registerAutoSync, OfflineReport } from "@/lib/offlineSync";
import { io, Socket } from "socket.io-client";
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
  Play,
  Home,
  Settings,
  ClipboardList,
  BookOpen,
  Radio,
  BarChart3,
  Layers,
  Zap,
  HeartHandshake,
  ScrollText,
  Mic2,
  ListChecks,
  LayoutDashboard,
  Shield,
  Eye,
  CloudUpload,
  BadgeCheck,
  TrendingUp,
  WalletCards,
  Video,
  Star
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import CameraCapture from "@/components/CameraCapture";
import EventForm from "@/components/EventForm";
import SermonInlineForm from "@/components/SermonInlineForm";

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
  const { t } = useLanguage();
  const socketRef = useRef<Socket | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("[AUTH] Logout error:", e);
    }
    router.push("/");
  };

  // Parse greeting name professionally
  const getGreetingName = (fullName?: string | null) => {
    if (!fullName) return "Event Manager";
    const cleaned = fullName.replace(/Joseph/gi, "").trim();
    if (!cleaned) return "Event Manager";
    const parts = cleaned.split(" ");
    if (cleaned.toLowerCase().startsWith("event manager") && parts.length > 2) {
      return parts.slice(2).join(" ");
    }
    if (cleaned.toLowerCase().startsWith("pastor") && parts.length > 1) {
      return parts.slice(1).join(" ");
    }
    return parts[0];
  };

  // Export Reports to CSV File
  const exportToCSV = () => {
    if (reports.length === 0) return;
    const headers = [
      "Report ID", "Branch", "Title", "Description", "Attendance",
      "Offering (INR)", "Report Date", "GPS Location", "Volunteers", "Status", "Created By"
    ];
    const rows = reports.map(r => [
      r.id, r.branch.name,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      r.attendanceCount, r.offeringAmount, r.reportDate,
      r.gpsLocation || "N/A",
      `"${r.volunteerNames.join(", ")}"`,
      r.status,
      `"${r.createdBy.name} (${r.createdBy.email})"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
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
  const [editCustomBranchName, setEditCustomBranchName] = useState("");
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
  const [showCreateService, setShowCreateService] = useState(false);
  const [showCreateSermon, setShowCreateSermon] = useState(false);
  const [showManageSermons, setShowManageSermons] = useState(false);
  const [showManageServices, setShowManageServices] = useState(false);
  const [showManageEvents, setShowManageEvents] = useState(false);
  const [successEvent, setSuccessEvent] = useState<{ title: string; category: string; date: string; time: string; location: string } | null>(null);

  // Manage Sermons list states and handlers
  const [sermonsList, setSermonsList] = useState<any[]>([]);
  const [loadingSermons, setLoadingSermons] = useState(false);
  const [deletingSermonId, setDeletingSermonId] = useState<string | null>(null);
  const [clearingSeeded, setClearingSeeded] = useState(false);

  // Manage Services list states and handlers
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  // Manage Events list states and handlers
  const [eventsReportList, setEventsReportList] = useState<any[]>([]);
  const [loadingEventsReport, setLoadingEventsReport] = useState(false);
  const [deletingEventsReportId, setDeletingEventsReportId] = useState<string | null>(null);

  const fetchAllSermons = async () => {
    setLoadingSermons(true);
    try {
      const res = await fetch(`/api/pastor/sermons?t=${Date.now()}`);
      const data = await res.json();
      if (res.ok && data.success) setSermonsList(data.sermons || []);
    } catch (err) {
      console.error("Failed to fetch sermons list:", err);
    } finally {
      setLoadingSermons(false);
    }
  };

  useEffect(() => {
    if (showManageSermons) fetchAllSermons();
  }, [showManageSermons]);

  const handleDeleteSermon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sermon? This action cannot be undone.")) return;
    setDeletingSermonId(id);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/pastor/sermons?id=${id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("✅ Sermon Deleted", "Successfully deleted sermon from database.");
        fetchAllSermons();
      } else {
        throw new Error(data.error || "Failed to delete sermon");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete sermon");
    } finally {
      setDeletingSermonId(null);
    }
  };

  const clearSeededSermons = async () => {
    if (!confirm("This will permanently delete all 6 placeholder sermons seeded from the database. Only real sermons you create will remain. Proceed?")) return;
    setClearingSeeded(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/pastor/clear-seeded-sermons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("🗑️ Seeded Sermons Cleared", `Removed ${data.deletedCount} static sermons. The landing page is now fully dynamic!`);
        fetchAllSermons();
      } else {
        throw new Error(data.error || "Failed to clear seeded sermons");
      }
    } catch (err: any) {
      alert(err.message || "Failed to clear seeded sermons");
    } finally {
      setClearingSeeded(false);
    }
  };

  const fetchAllServices = async () => {
    setLoadingServices(true);
    try {
      const res = await fetch("/api/events?status=ALL&limit=100");
      const data = await res.json();
      if (res.ok && data.success) setServicesList(data.events || []);
    } catch (err) {
      console.error("Failed to fetch services list:", err);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    if (showManageServices) fetchAllServices();
  }, [showManageServices]);

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) return;
    setDeletingServiceId(id);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("✅ Service Deleted", "Successfully deleted service/event from database.");
        fetchAllServices();
      } else {
        throw new Error(data.error || "Failed to delete service");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete service");
    } finally {
      setDeletingServiceId(null);
    }
  };

  const fetchAllEventsReports = async () => {
    setLoadingEventsReport(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/event-manager/reports?branchId=all&status=all", {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (res.ok && data.success) setEventsReportList(data.reports || []);
    } catch (err) {
      console.error("Failed to fetch reports list:", err);
    } finally {
      setLoadingEventsReport(false);
    }
  };

  useEffect(() => {
    if (showManageEvents) fetchAllEventsReports();
  }, [showManageEvents]);

  const handleDeleteReportFromModal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event report? This action cannot be undone.")) return;
    setDeletingEventsReportId(id);
    try {
      const token = await getIdToken();
      const response = await fetch(`/api/event-manager/reports/${id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        showToast("🗑️ Report Deleted", "The field report has been successfully deleted.");
        fetchAllEventsReports();
        setReports(prev => prev.filter(r => r.id !== id));
      } else {
        alert(result.error || "Failed to delete report.");
      }
    } catch (err) {
      console.error("[PORTAL] Delete report error:", err);
      alert("A network error occurred while deleting the report.");
    } finally {
      setDeletingEventsReportId(null);
    }
  };

  const openEditModal = (report: DBReport) => {
    setEditingReport(report);
    setEditBranchId(report.branchId);
    setEditCustomBranchName("");
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
    if (editBranchId === "other" && !editCustomBranchName.trim()) {
      setSaveError("Please specify the new branch location / address.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    let finalBranchId = editBranchId;
    if (editBranchId === "other") {
      try {
        const createRes = await fetch("/api/branches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editCustomBranchName.trim() }),
        });
        const createData = await createRes.json();
        if (createRes.ok && createData.success && createData.branch) {
          finalBranchId = createData.branch.id;
          loadBranches();
        } else {
          throw new Error(createData.error || "Failed to register new branch");
        }
      } catch (err: any) {
        setSaveError(err.message || "Failed to create new branch location.");
        setIsSaving(false);
        return;
      }
    }

    const volunteersList = editVolunteerNames.split(",").map(n => n.trim()).filter(n => n.length > 0);
    const newImages = newAttachedMedia.filter(i => i.type === "IMAGE" && !i.isUploading).map(i => i.base64);
    const newVideos = newAttachedMedia.filter(i => i.type === "VIDEO" && !i.isUploading).map(i => i.base64);

    const updatePayload = {
      branchId: finalBranchId, title: editTitle, description: editDescription,
      attendanceCount: editAttendanceCount, offeringAmount: editOfferingAmount,
      reportDate: new Date(editReportDate).toISOString(),
      volunteerNames: volunteersList, removedMediaIds, newImages, newVideos,
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
        setReports(prev => prev.map(r => r.id === editingReport.id ? result.report : r));
        setEditingReport(null);
        showToast("✅ Report Updated", `Successfully updated report "${editTitle}".`);
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
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setReports(prev => prev.filter(r => r.id !== reportId));
        showToast("🗑️ Report Deleted", "The field report has been successfully deleted.");
      } else {
        alert(result.error || "Failed to delete report.");
      }
    } catch (err) {
      alert("A network error occurred while deleting the report.");
    } finally {
      setActionLoadingId(null);
      setDeletingReport(null);
    }
  };

  // Edit media handling helpers
  const handleEditPhotoCapture = (base64: string) => {
    const tempId = Math.random().toString(36).substring(2, 9);
    setNewAttachedMedia(prev => [...prev, {
      id: tempId, type: "IMAGE", base64,
      name: `captured-snap-${Date.now()}.jpg`,
      size: Math.round((base64.length * 3) / 4),
      progress: 100, isUploading: false
    }]);
    setShowEditCamera(false);
  };

  const processEditFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) { alert("Unsupported file type."); return; }
    if (isImage && file.size > 10 * 1024 * 1024) { alert(`Image "${file.name}" exceeds 10MB.`); return; }
    if (isVideo && file.size > 100 * 1024 * 1024) { alert(`Video "${file.name}" exceeds 100MB.`); return; }

    const tempId = Math.random().toString(36).substring(2, 9);
    setNewAttachedMedia(prev => [...prev, {
      id: tempId, type: isImage ? "IMAGE" : "VIDEO",
      base64: "", name: file.name, size: file.size, progress: 10, isUploading: true
    }]);

    let simulatedProgress = 10;
    const progressInterval = setInterval(() => {
      simulatedProgress = Math.min(simulatedProgress + 15, 95);
      setNewAttachedMedia(prev => prev.map(item => item.id === tempId ? { ...item, progress: simulatedProgress } : item));
    }, 100);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (isImage) {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 1024;
          let width = img.width, height = img.height;
          if (width > maxWidth) { height = Math.floor((height * maxWidth) / width); width = maxWidth; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const base64 = canvas.toDataURL("image/jpeg", 0.8);
            clearInterval(progressInterval);
            setNewAttachedMedia(prev => prev.map(item => item.id === tempId ? { ...item, base64, progress: 100, isUploading: false } : item));
          }
        };
        img.src = result;
      } else {
        clearInterval(progressInterval);
        setNewAttachedMedia(prev => prev.map(item => item.id === tempId ? { ...item, base64: result, progress: 100, isUploading: false } : item));
      }
    };
    reader.readAsDataURL(file);
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, dm = decimals < 0 ? 0 : decimals;
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
  const loadBranches = useCallback(async () => {
    try {
      const response = await fetch("/api/field-volunteer/branches");
      if (response.ok) {
        const data = await response.json();
        if (data.success) setBranches(data.branches);
      }
    } catch (err) {
      console.error("[PORTAL] Error fetching branches:", err);
    }
  }, []);

  // Fetch reports list
  const loadReports = useCallback(async (bFilter: string, sFilter: string) => {
    setIsLoadingReports(true);
    try {
      const token = await getIdToken();
      const query = new URLSearchParams();
      if (bFilter !== "all") query.set("branchId", bFilter);
      if (sFilter !== "all") query.set("status", sFilter);
      const response = await fetch(`/api/event-manager/reports?${query.toString()}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
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
  }, [getIdToken]);

  // Fetch offline queue size
  const loadQueue = async () => {
    try {
      const offlineQueue = await getQueuedReports();
      setQueuedReports(offlineQueue);
    } catch (err) {
      console.error("[PORTAL] Failed to load offline queue:", err);
    }
  };

  // Toast helper
  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Initial data load
  useEffect(() => {
    loadBranches();
    loadReports("all", "all");
    loadQueue();

    const unregister = registerAutoSync(getIdToken, () => {
      loadQueue();
      loadReports(branchFilter, statusFilter);
      setSyncMessage("Auto-sync completed successfully! 🎉");
      setTimeout(() => setSyncMessage(null), 5000);
    });
    return () => unregister();
  }, [loadBranches, loadReports, getIdToken]);

  // Reload reports when filters change (skip initial call)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    loadReports(branchFilter, statusFilter);
  }, [branchFilter, statusFilter, loadReports]);

  // Socket.io — connect ONCE, update refs for callbacks
  const branchFilterRef = useRef(branchFilter);
  const statusFilterRef = useRef(statusFilter);
  useEffect(() => { branchFilterRef.current = branchFilter; }, [branchFilter]);
  useEffect(() => { statusFilterRef.current = statusFilter; }, [statusFilter]);

  useEffect(() => {
    const socket = io("http://localhost:3001", { reconnectionDelay: 1000, reconnectionAttempts: 3 });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.info("[SOCKET] Unified portal connected to realtime companion.");
    });

    socket.on("new_event_report", (payload: any) => {
      showToast("🔔 New Field Report", `Branch: ${payload.branchName} · Title: ${payload.title} (${payload.imagesCount} snaps)`);
      setFeed(prev => [{
        id: String(Date.now()),
        text: `Report "${payload.title}" submitted by ${payload.branchName} (${payload.attendanceCount} attended)`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "upload"
      }, ...prev.slice(0, 19)]);
      loadReports(branchFilterRef.current, statusFilterRef.current);
    });

    socket.on("report_status_changed", (payload: any) => {
      setFeed(prev => [{
        id: String(Date.now()),
        text: `Report "${payload.title}" has been ${payload.status.toLowerCase()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "status"
      }, ...prev.slice(0, 19)]);
      loadReports(branchFilterRef.current, statusFilterRef.current);
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, []); // ← intentionally empty: socket connects once

  // Handle manual sync trigger
  const triggerManualSync = async () => {
    if (queuedReports.length === 0 || isSyncing) return;
    setIsSyncing(true);
    setSyncMessage("Synchronizing files...");
    try {
      const token = await getIdToken();
      const results = await syncOfflineReports(token);
      await loadQueue();
      await loadReports(branchFilter, statusFilter);
      setSyncMessage(results.failedCount === 0
        ? `Sync complete! Successfully uploaded ${results.successCount} reports.`
        : `Sync partially complete. Success: ${results.successCount}, Failed: ${results.failedCount}.`);
    } catch (err) {
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
        if (data.success) setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      }
    } catch (err) {
      console.error("[PORTAL] Error changing status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleReportExpanded = (id: string) => {
    setExpandedReports(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Summary counts
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "PENDING").length,
    attendance: reports.reduce((acc, curr) => acc + curr.attendanceCount, 0),
    offering: reports.reduce((acc, curr) => acc + curr.offeringAmount, 0),
  };

  // Branch-wise Analytics Breakdown
  const branchStats = branches.map(branch => {
    const branchReports = reports.filter(r => r.branchId === branch.id);
    return {
      name: branch.name,
      offering: branchReports.reduce((sum, r) => sum + r.offeringAmount, 0),
      attendance: branchReports.reduce((sum, r) => sum + r.attendanceCount, 0),
      count: branchReports.length
    };
  }).filter(b => b.count > 0);

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col pb-20 relative"
      style={{ background: "var(--color-bg, #f8fafc)" }}>
      
      {/* Subtle static gradient background — NO animations for performance */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-violet-50/60 via-slate-50 to-indigo-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30 transition-colors duration-500" />

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm" style={{ isolation: 'isolate' }}>
        {/* Bottom Border Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500" />

        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm shrink-0">
            <Image src="/logo.png" alt="KCM Logo" fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">{t.eventManager?.title || "Event Management"}</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 hidden sm:block">{t.eventManager?.subtitle || "Field Reporting & Operations"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connection status */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
            isOnline
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span>{isOnline ? (t.eventManager?.online || "ONLINE") : (t.eventManager?.offline || "OFFLINE MODE")}</span>
          </div>

          <div className="hidden sm:block"><LanguageToggle /></div>

          {["SUPER_ADMIN", "ADMIN"].includes(role) && (
            <button
              onClick={() => router.push("/portal-select")}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold transition-colors border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">{t.eventManager?.portalSelection || "Portal Selection"}</span>
            </button>
          )}

          <div className="h-5 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            {mounted && user && (
              <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-slate-200/50 dark:border-white/5">
                <div className="w-5 h-5 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-black text-xs uppercase shrink-0">
                  {(user.name || "EM").substring(0, 1).toUpperCase()}
                </div>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 max-w-[80px] truncate uppercase tracking-wide">
                  {user.name?.replace(/Joseph/gi, "").trim().split(" ")[0]}
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black transition-colors border border-rose-200/60 dark:border-rose-500/20 shrink-0"
              title={t.eventManager?.signOut || "Sign Out"}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t.eventManager?.signOut || "Sign Out"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-2xl flex items-start gap-3"
          >
            <div className="bg-violet-100 dark:bg-violet-500/15 p-2 rounded-xl text-violet-600 dark:text-violet-400 shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <h4 className="text-xs font-bold text-violet-700 dark:text-violet-300">{toastMessage.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{toastMessage.desc}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="shrink-0 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
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
            className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4"
            onClick={() => setExpandedImage(null)}
          >
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-5 right-5 p-2 bg-white/15 hover:bg-white/25 rounded-full text-white transition-colors border border-white/15"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              className="max-w-4xl max-h-[88vh] relative w-full h-full"
              onClick={e => e.stopPropagation()}
            >
              <img src={expandedImage} alt="Expanded Asset Preview" className="w-full h-full object-contain rounded-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 mt-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">

        {/* Left main content (3 cols) */}
        <div className="md:col-span-2 lg:col-span-3 space-y-5">

          {/* Welcome + Outbox Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            {/* Welcome Banner */}
            <div className="sm:col-span-2 relative overflow-hidden rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 border border-white/10 flex flex-col justify-between min-h-[180px]">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none" />
              <div className="absolute -right-4 -bottom-4 opacity-[0.04] pointer-events-none">
                <Building2 className="w-32 h-32 text-white" />
              </div>
              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/20 border border-white/20 text-[9px] font-black uppercase tracking-widest text-white/90">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    {t.eventManager?.welcomeConsole || "Operations Console"}
                  </span>
                  <div className="sm:hidden shrink-0"><LanguageToggle /></div>
                </div>
                <h2 className="text-xl md:text-2xl font-black mt-2 tracking-tight leading-tight text-white">
                  {t.eventManager?.welcomeTitle || "Welcome, Event Manager! 🙏"}
                </h2>
                <p className="text-xs text-white/75 leading-relaxed max-w-lg font-medium">
                  {t.eventManager?.welcomeDesc || "Submit real-time reports of branch service attendance, tithes, prayers, and media captures. Offline data syncs automatically."}
                </p>
              </div>
            </div>

            {/* Offline Outbox */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-violet-400/40 dark:hover:border-violet-500/40 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">{t.eventManager?.outboxTitle || "Offline Outbox"}</h3>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{t.eventManager?.outboxSubtitle || "Queue status"}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  queuedReports.length > 0
                    ? "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400"
                    : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-white/5 dark:border-white/10 dark:text-slate-400"
                }`}>
                  {queuedReports.length} {t.eventManager?.pendingOpt ? t.eventManager.pendingOpt.toLowerCase() : "pending"}
                </span>
              </div>

              {queuedReports.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.eventManager?.outboxInSync || "All data in sync"}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{t.eventManager?.outboxInSyncSub || "Ready for offline usage"}</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-24 overflow-y-auto mb-3">
                  {queuedReports.map(report => (
                    <div key={report.id} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-2 rounded-lg flex items-center justify-between gap-2 text-[10px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate flex-1">{report.title}</span>
                      <span className="text-[8px] text-amber-600 dark:text-amber-400 font-bold uppercase bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">Queued</span>
                    </div>
                  ))}
                </div>
              )}

              {queuedReports.length > 0 && isOnline ? (
                <button
                  onClick={triggerManualSync}
                  disabled={isSyncing}
                  className="w-full h-9 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  {t.eventManager?.syncNowBtn || "Sync Outbox Now"}
                </button>
              ) : (
                <div className="h-9 flex items-center justify-center text-[10px] text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-xl font-semibold">
                  {isOnline ? (t.eventManager?.outboxDone || "Outbox in sync") : (t.eventManager?.outboxNeedsConn || "Sync requires connection")}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Action Card 1: Event Reports */}
            <div className="bg-white dark:bg-slate-900/50 border border-violet-200/60 dark:border-violet-500/20 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-violet-400/60 dark:hover:border-violet-500/40 transition-all duration-200 border-t-2 border-t-violet-500">
              <div className="space-y-2.5">
                <div className="relative w-10 h-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/25">
                    <ClipboardList className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <Zap className="w-2 h-2 text-white" />
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Event Reports</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-normal">Submit branch logs, attendance & daily tithes</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Link href="/event-manager/report" className="flex items-center justify-center gap-1 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-[10px] font-black transition-all active:scale-95 shadow-sm text-center">
                  <ScrollText className="w-3 h-3" /> Create
                </Link>
                <button type="button" onClick={() => setShowManageEvents(true)} className="flex items-center justify-center gap-1 py-2 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20 rounded-xl text-[10px] font-black transition-all active:scale-95">
                  <ListChecks className="w-3 h-3" /> Manage
                </button>
              </div>
            </div>

            {/* Action Card 2: Worship Services */}
            <div className="bg-white dark:bg-slate-900/50 border border-indigo-200/60 dark:border-indigo-500/20 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-indigo-400/60 dark:hover:border-indigo-500/40 transition-all duration-200 border-t-2 border-t-indigo-500">
              <div className="space-y-2.5">
                <div className="relative w-10 h-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/25">
                    <HeartHandshake className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <Star className="w-2 h-2 text-white" />
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Worship Services</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-normal">Schedule new services or branch activities</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={() => setShowCreateService(true)} className="flex items-center justify-center gap-1 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-[10px] font-black transition-all active:scale-95 shadow-sm">
                  <Radio className="w-3 h-3" /> Schedule
                </button>
                <button type="button" onClick={() => setShowManageServices(true)} className="flex items-center justify-center gap-1 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 rounded-xl text-[10px] font-black transition-all active:scale-95">
                  <Layers className="w-3 h-3" /> Manage
                </button>
              </div>
            </div>

            {/* Action Card 3: Sermon Library */}
            <div className="bg-white dark:bg-slate-900/50 border border-fuchsia-200/60 dark:border-fuchsia-500/20 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-fuchsia-400/60 dark:hover:border-fuchsia-500/40 transition-all duration-200 border-t-2 border-t-fuchsia-500">
              <div className="space-y-2.5">
                <div className="relative w-10 h-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-md shadow-fuchsia-500/25">
                    <Mic2 className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <Video className="w-2 h-2 text-white" />
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Sermon Library</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-normal">Upload messages or record new sermons</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button type="button" onClick={() => setShowCreateSermon(true)} className="flex items-center justify-center gap-1 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-[10px] font-black transition-all active:scale-95 shadow-sm">
                  <CloudUpload className="w-3 h-3" /> Upload
                </button>
                <button type="button" onClick={() => setShowManageSermons(true)} className="flex items-center justify-center gap-1 py-2 bg-fuchsia-50 dark:bg-fuchsia-500/10 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-500/20 rounded-xl text-[10px] font-black transition-all active:scale-95">
                  <BookOpen className="w-3 h-3" /> Manage
                </button>
              </div>
            </div>
          </div>

          {/* Sync notification banner */}
          <AnimatePresence>
            {syncMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/30 p-3.5 rounded-xl flex items-start gap-2.5 text-indigo-700 dark:text-indigo-300"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-xs font-semibold leading-relaxed">{syncMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats counters (managers/admins only) */}
          {!mounted ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-slate-100 dark:bg-slate-900/20 border border-slate-200/50 dark:border-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            isManagerOrAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Reports */}
                <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 to-indigo-50/50 dark:from-violet-950/20 dark:to-indigo-950/10 border border-violet-200/60 dark:border-violet-500/20 rounded-2xl p-4 shadow-sm flex justify-between items-center border-l-4 border-l-violet-500">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest block">{t.eventManager?.totalReports || "Total Reports"}</span>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-black text-violet-700 dark:text-violet-300 tracking-tight">{stats.total}</p>
                      <span className="text-[10px] font-bold text-violet-500">{t.eventManager?.logsUnit || "logs"}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                    <BarChart3 className="w-4.5 h-4.5 text-white" />
                  </div>
                </div>

                {/* Pending Review */}
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/60 dark:border-amber-500/20 rounded-2xl p-4 shadow-sm flex justify-between items-center border-l-4 border-l-amber-500">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block">{t.eventManager?.pendingReview || "Pending Review"}</span>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-black text-amber-700 dark:text-amber-300 tracking-tight">{stats.pending}</p>
                      <span className="text-[10px] font-bold text-amber-500">{t.eventManager?.needsActionUnit || "needs action"}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
                    <WalletCards className="w-4.5 h-4.5 text-white" />
                  </div>
                </div>

                {/* Total Attendance */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-200/60 dark:border-emerald-500/20 rounded-2xl p-4 shadow-sm flex justify-between items-center border-l-4 border-l-emerald-500">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">{t.eventManager?.totalAttendance || "Total Attendance"}</span>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">{stats.attendance}</p>
                      <span className="text-[10px] font-bold text-emerald-500">{t.eventManager?.peopleUnit || "people"}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <TrendingUp className="w-4.5 h-4.5 text-white" />
                  </div>
                </div>
              </div>
            )
          )}

          {/* Filters and Search toolbar */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/70 dark:border-white/10 rounded-2xl p-3.5 sm:px-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-violet-500/20 shrink-0">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  {t.eventManager?.dbTitle || "Reports Database"}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                    {reports.length} {reports.length === 1 ? "Report" : "Reports"}
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {reports.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="h-9 px-3.5 rounded-xl bg-slate-900 dark:bg-violet-600 hover:bg-slate-700 dark:hover:bg-violet-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t.eventManager?.exportCsvBtn || "Export CSV"}
                </button>
              )}

              <div className="relative flex items-center flex-1 sm:flex-initial min-w-[120px]">
                <select
                  value={branchFilter}
                  onChange={e => setBranchFilter(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 w-full appearance-none transition-all cursor-pointer"
                >
                  <option value="all">{t.eventManager?.allBranchesOpt || "All Branches"}</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-slate-400" />
              </div>

              <div className="relative flex items-center flex-1 sm:flex-initial min-w-[130px]">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 w-full appearance-none transition-all cursor-pointer"
                >
                  <option value="all">{t.eventManager?.allStatusesOpt || "All Statuses"}</option>
                  <option value="PENDING">{t.eventManager?.pendingOpt || "Pending Approval"}</option>
                  <option value="APPROVED">{t.eventManager?.approvedOpt || "Approved"}</option>
                  <option value="REJECTED">{t.eventManager?.rejectedOpt || "Rejected"}</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-slate-400" />
              </div>
            </div>
          </div>

          {/* Database Reports Feed */}
          {isLoadingReports ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-36 bg-white dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900/20 border border-slate-200/40 dark:border-white/5 rounded-2xl shadow-sm space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7 text-violet-500" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-slate-800 dark:text-white tracking-tight">{t.eventManager?.noReportsTitle || "No Reports Found"}</p>
                <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                  {t.eventManager?.noReportsDesc || "There are no submitted logs matching your filters."}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link href="/event-manager/report" className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-500/15 active:scale-95">
                  <PlusCircle className="w-3.5 h-3.5" /> {t.eventManager?.createFirstReportBtn || "Create Events Report"}
                </Link>
                <button type="button" onClick={() => setShowManageEvents(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/15 rounded-xl text-xs font-bold transition-all active:scale-95">
                  <Settings className="w-3.5 h-3.5" /> {t.eventManager?.manageEventsBtn || "Manage Events"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {reports.map(report => {
                  const isExpanded = expandedReports[report.id] || false;
                  const statusColor = report.status === "APPROVED" ? "border-l-emerald-500" : report.status === "REJECTED" ? "border-l-rose-500" : "border-l-amber-500";
                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className={`relative bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md hover:border-violet-300/50 dark:hover:border-violet-500/20 transition-all duration-200 border-l-4 ${statusColor}`}
                    >
                      {/* Header info */}
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3.5">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 rounded-lg">
                              {report.branch.name}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1 ${
                              report.status === "APPROVED"
                                ? "bg-emerald-600 text-white border-emerald-700"
                                : report.status === "REJECTED"
                                ? "bg-rose-600 text-white border-rose-700"
                                : "bg-amber-500 text-white border-amber-600"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${report.status === "APPROVED" ? "bg-white" : report.status === "REJECTED" ? "bg-white" : "bg-white"}`} />
                              {report.status === "APPROVED" ? (t.eventManager?.approvedOpt || "Approved")
                                : report.status === "REJECTED" ? (t.eventManager?.rejectedOpt || "Rejected")
                                : (t.eventManager?.pendingOpt || "Pending")}
                            </span>
                          </div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{report.title}</h3>
                        </div>

                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-violet-500" />
                            <span>{new Date(report.reportDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="text-[9px] flex items-center gap-1">
                            <User className="w-3 h-3 text-indigo-500" />
                            <span>{t.eventManager?.byLabel || "By"}: {report.createdBy.name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Brief preview description (when collapsed) */}
                      {!isExpanded && (
                        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                          {report.description || "No description provided."}
                        </p>
                      )}

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/80 dark:bg-slate-950/40 border border-slate-100/80 dark:border-white/5 p-3.5 rounded-xl text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t.eventManager?.attendanceLabel || "Attendance"}</span>
                          <span className="font-extrabold text-violet-600 dark:text-violet-400 text-sm flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {report.attendanceCount}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t.eventManager?.offeringLabel || "Offering"}</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-0.5">
                            <span className="font-black">₹</span>{report.offeringAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="space-y-0.5 col-span-2">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t.eventManager?.gpsLabel || "GPS coordinates"}</span>
                          <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 text-xs">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            <span className="truncate">{report.gpsLocation || (t.eventManager?.notRecorded || "Not recorded")}</span>
                          </span>
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center sm:justify-between border-t border-slate-100 dark:border-white/5 pt-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleReportExpanded(report.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 text-[10px] font-bold text-violet-600 dark:text-violet-300 transition-colors border border-violet-200 dark:border-violet-500/20"
                          >
                            <span>{isExpanded ? "Show Less" : "View Details"}</span>
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                          </button>

                          {(isManagerOrAdmin || (report.createdById === user?.uid && report.status === "PENDING")) && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openEditModal(report)}
                                className="p-1.5 bg-slate-100 hover:bg-violet-50 dark:bg-white/5 dark:hover:bg-violet-500/10 rounded-xl border border-slate-200/50 dark:border-white/10 transition-colors text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300"
                                title="Edit Report"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingReport(report)}
                                disabled={actionLoadingId === report.id}
                                className="p-1.5 bg-slate-100 hover:bg-rose-50 dark:bg-white/5 dark:hover:bg-rose-500/10 rounded-xl border border-slate-200/50 dark:border-white/10 transition-colors text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
                                title="Delete Report"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Approval buttons */}
                        {isManagerOrAdmin && report.status === "PENDING" && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleStatusChange(report.id, "REJECTED")}
                              disabled={actionLoadingId === report.id}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-black hover:bg-rose-100 transition-colors disabled:opacity-50 active:scale-95 min-w-[90px]"
                            >
                              <X className="w-3.5 h-3.5 shrink-0" />
                              {t.eventManager?.rejectBtn || "Reject"}
                            </button>
                            <button
                              onClick={() => handleStatusChange(report.id, "APPROVED")}
                              disabled={actionLoadingId === report.id}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-600/15 transition-all disabled:opacity-50 active:scale-95 min-w-[90px]"
                            >
                              {actionLoadingId === report.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 shrink-0" />}
                              {t.eventManager?.approveBtn || "Approve"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Expandable Content */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden space-y-4 border-t border-slate-100 dark:border-white/5 pt-4"
                          >
                            <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t.eventManager?.notesLabel || "Report Notes"}</span>
                              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                                {report.description || "No description provided."}
                              </p>
                            </div>

                            {report.volunteerNames.length > 0 && (
                              <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">{t.eventManager?.attendingLabel || "Attending Volunteers"}</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {report.volunteerNames.map((name, idx) => (
                                    <span key={idx} className="bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 px-2 py-0.5 rounded-lg text-[9px] font-bold text-violet-600 dark:text-violet-400">
                                      {name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {report.media.length > 0 && (
                              <div className="border-t border-slate-100 dark:border-white/5 pt-4">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t.eventManager?.snapsLabel || "Event Snaps"} ({report.media.length})</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {report.media.map(item => (
                                    <div
                                      key={item.id}
                                      onClick={() => setExpandedImage(item.url)}
                                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200/50 dark:border-white/10 cursor-pointer group shadow-sm"
                                    >
                                      <img src={item.url} alt="Snap upload" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
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
            </div>
          )}

        </div>

        {/* Right Sidebar (1 col) */}
        <div className="space-y-5">

          {/* Branch metrics breakdown */}
          {branchStats.length > 0 && (
            <div className="bg-white dark:bg-slate-900/50 border border-violet-200/50 dark:border-violet-500/20 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shadow-emerald-500/20">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">{t.eventManager?.branchShareTitle || "Branch Share"}</h3>
                  <p className="text-[9px] text-slate-400 font-semibold">{t.eventManager?.branchShareDesc || "Offering & Log contribution"}</p>
                </div>
              </div>
              <div className="space-y-3.5">
                {branchStats.map((stat, idx) => {
                  const maxOffering = Math.max(...branchStats.map(b => b.offering), 1);
                  const percentage = (stat.offering / maxOffering) * 100;
                  const gradients = ["from-emerald-500 to-teal-500", "from-violet-500 to-pink-500", "from-amber-500 to-orange-500", "from-cyan-500 to-blue-500", "from-fuchsia-500 to-purple-500"];
                  const textColors = ["text-emerald-600 dark:text-emerald-400", "text-violet-600 dark:text-violet-400", "text-amber-600 dark:text-amber-400", "text-cyan-600 dark:text-cyan-400", "text-fuchsia-600 dark:text-fuchsia-400"];
                  return (
                    <div key={stat.name} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-700 dark:text-slate-300 truncate pr-2 max-w-[120px]">{stat.name}</span>
                        <span className={`${textColors[idx % textColors.length]} shrink-0`}>₹{stat.offering.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className={`bg-gradient-to-r ${gradients[idx % gradients.length]} h-full rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Activity Feed */}
          <div className="bg-white dark:bg-slate-900/50 border border-violet-200/50 dark:border-violet-500/20 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-violet-500/20">
                <Radio className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">{t.eventManager?.liveUpdatesTitle || "Live Updates"}</h3>
                <p className="text-[9px] text-slate-400 font-medium">{t.eventManager?.liveUpdatesDesc || "Real-time companion feed"}</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {feed.map(act => {
                const colorConfig = {
                  sys: { border: "border-sky-200 dark:border-sky-500/20", bullet: "bg-sky-500", text: "text-sky-700 dark:text-sky-300", bg: "bg-sky-50/80 dark:bg-sky-500/5" },
                  upload: { border: "border-violet-200 dark:border-violet-500/20", bullet: "bg-violet-500", text: "text-violet-700 dark:text-violet-300", bg: "bg-violet-50/80 dark:bg-violet-500/5" },
                  status: { border: "border-amber-200 dark:border-amber-500/20", bullet: "bg-amber-500", text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50/80 dark:bg-amber-500/5" }
                };
                const config = colorConfig[act.type] || colorConfig.sys;
                return (
                  <div key={act.id} className={`text-xs p-2.5 rounded-xl border ${config.border} ${config.bg} space-y-1 border-l-2 pl-3`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white dark:bg-slate-950/80 border border-slate-200/50 dark:border-white/5">
                        {act.type}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold">{act.time}</span>
                    </div>
                    <p className={`font-semibold ${config.text} leading-relaxed text-[11px]`}>{act.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </main>

      {/* ═══════════════════════════════════════ MODALS ═══════════════════════════════════════ */}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setDeletingReport(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl max-w-md w-full space-y-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-xl text-rose-600 dark:text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">{t.eventManager?.deleteTitle || "Delete Field Report"}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {(t.eventManager?.deleteConfirmText || 'Are you sure you want to delete report "{title}"? This action is permanent.').replace("{title}", deletingReport.title)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeletingReport(null)} className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  {t.eventManager?.cancelBtn || "Cancel"}
                </button>
                <button
                  onClick={() => handleDeleteReport(deletingReport.id)}
                  disabled={actionLoadingId === deletingReport.id}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 active:scale-95 shadow-md shadow-rose-500/10 flex items-center gap-1.5"
                >
                  {actionLoadingId === deletingReport.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {t.eventManager?.deleteBtn || "Delete Permanently"}
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
            className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setEditingReport(null)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl max-w-2xl w-full mx-auto my-4 sm:my-8 relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600" />
              <button onClick={() => setEditingReport(null)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
                <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">{t.eventManager?.editModalTitle || "Edit Field Report"}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">{t.eventManager?.editModalSub || "Update branch logs & media reports"}</p>
                </div>
              </div>

              {saveError && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 p-3 rounded-xl flex items-start gap-2 text-rose-600 dark:text-rose-400 mb-4 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{saveError}</div>
                </div>
              )}

              <form onSubmit={handleUpdateReport} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Branch select */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest block">{t.eventManager?.branchLocationLabel || "Branch Location"}</label>
                    <div className="relative">
                      <Compass className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <select required value={editBranchId} onChange={e => setEditBranchId(e.target.value)}
                        className="w-full h-10 pl-9 pr-8 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 appearance-none">
                        {branches.map(b => <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900">{b.name} Branch</option>)}
                        <option value="other" className="bg-white dark:bg-slate-900 font-bold">➕ Other / Add New Location...</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                    </div>
                    {editBranchId === "other" && (
                      <div className="mt-2 p-3 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/80 dark:border-violet-800/40 rounded-xl space-y-1.5">
                        <label className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest block">Enter New Branch Location *</label>
                        <input type="text" required value={editCustomBranchName} onChange={e => setEditCustomBranchName(e.target.value)}
                          placeholder="e.g. Miyapur Branch, Hyderabad"
                          className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-violet-300 dark:border-violet-700 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                      </div>
                    )}
                  </div>

                  {/* Date picker */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest block">{t.eventManager?.reportDateLabel || "Report Date"}</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="date" required value={editReportDate} onChange={e => setEditReportDate(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                    </div>
                  </div>

                  {/* Attendance Count */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest block">{t.eventManager?.attendanceLabel || "Attendance Count"}</label>
                    <div className="relative">
                      <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="number" min={0} required value={editAttendanceCount} onChange={e => setEditAttendanceCount(parseInt(e.target.value) || 0)}
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                    </div>
                  </div>

                  {/* Offering Amount */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest block">{t.eventManager?.offeringLabel || "Offering Amount (₹)"}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                      <input type="number" min={0} value={editOfferingAmount} onChange={e => setEditOfferingAmount(parseFloat(e.target.value) || 0)}
                        className="w-full h-10 pl-7 pr-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                    </div>
                  </div>
                </div>

                {/* Event Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest block">{t.eventManager?.activityNameLabel || "Event / Activity Name"}</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" required placeholder="e.g. Sunday Service, Youth Fellowship" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest block">{t.eventManager?.notesLabel || "Daily Activity Notes & outcomes"}</label>
                  <textarea required rows={3} placeholder="Provide a report of the ministry outcome..." value={editDescription} onChange={e => setEditDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none" />
                </div>

                {/* Volunteer Names */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest block">{t.eventManager?.volunteersLabel || "Volunteers Attended (Comma-separated)"}</label>
                  <div className="relative">
                    <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="e.g. John Doe, Sarah Smith" value={editVolunteerNames} onChange={e => setEditVolunteerNames(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                  </div>
                </div>

                {/* Existing Media Section */}
                {existingMedia.length > 0 && (
                  <div className="space-y-2 border-t border-slate-100 dark:border-white/5 pt-4">
                    <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest block">{t.eventManager?.existingMediaLabel || "Existing Media Attachments"}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {existingMedia.map(item => {
                        const isRemoved = removedMediaIds.includes(item.id);
                        return (
                          <div key={item.id} className={`relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group shadow-sm transition-opacity ${isRemoved ? "opacity-30 border-rose-500/40" : ""}`}>
                            <img src={item.url} alt="Uploaded snap" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              {isRemoved ? (
                                <button type="button" onClick={() => setRemovedMediaIds(prev => prev.filter(id => id !== item.id))} className="px-2 py-1 bg-violet-600 hover:bg-violet-500 rounded-lg text-white text-[9px] font-black uppercase">Undo</button>
                              ) : (
                                <button type="button" onClick={() => setRemovedMediaIds(prev => [...prev, item.id])} className="p-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-white transition-colors">
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {isRemoved && <span className="absolute bottom-1.5 left-1.5 text-[8px] font-black uppercase bg-rose-600 text-white px-1.5 py-0.5 rounded">Removed</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload New Media */}
                <div className="space-y-3 border-t border-slate-100 dark:border-white/5 pt-4">
                  <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest block">{t.eventManager?.uploadMediaLabel || "Upload New Media"}</label>
                  <div
                    onDragOver={e => { e.preventDefault(); setIsEditDragging(true); }}
                    onDragLeave={e => { e.preventDefault(); setIsEditDragging(false); }}
                    onDrop={e => { e.preventDefault(); setIsEditDragging(false); Array.from(e.dataTransfer.files).forEach(processEditFile); }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file"; input.accept = "image/*,video/mp4,video/webm"; input.multiple = true;
                      input.onchange = (e: any) => Array.from(e.target.files as FileList).forEach(processEditFile);
                      input.click();
                    }}
                    className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all group flex flex-col items-center justify-center min-h-[100px] ${
                      isEditDragging ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10" : "border-slate-200 hover:border-violet-400/60 dark:border-white/10 dark:hover:border-violet-500/30"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-violet-500 transition-colors" />
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        Drop files or <span className="text-violet-600 dark:text-violet-400 group-hover:underline">browse</span>
                      </p>
                    </div>
                    <button type="button" onClick={e => { e.stopPropagation(); setShowEditCamera(true); }}
                      className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors shadow-sm active:scale-95">
                      <Camera className="w-3 h-3" /> Snapshot
                    </button>
                  </div>

                  {newAttachedMedia.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {newAttachedMedia.map(item => (
                        <div key={item.id} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/10 group shadow-sm bg-slate-900">
                          {item.isUploading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-slate-900 text-white space-y-1">
                              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                              <p className="text-[8px] font-bold truncate w-full px-1">{item.name}</p>
                              <div className="w-full bg-white/10 h-1 rounded-full mt-1">
                                <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${item.progress}%` }} />
                              </div>
                            </div>
                          ) : (
                            <>
                              {item.type === "IMAGE" ? (
                                <img src={item.base64} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                  <video src={item.base64} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
                                      <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 text-white">
                                <div className="flex justify-between items-start">
                                  <span className="text-[8px] font-bold bg-white/20 px-1 py-0.5 rounded">{formatBytes(item.size)}</span>
                                  <button type="button" onClick={() => setNewAttachedMedia(prev => prev.filter(m => m.id !== item.id))} className="p-1 bg-rose-600 hover:bg-rose-500 rounded text-white transition-colors active:scale-95">
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-4">
                  <button type="button" onClick={() => setEditingReport(null)} className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    {t.eventManager?.cancelBtn || "Cancel"}
                  </button>
                  <button type="submit" disabled={isSaving || newAttachedMedia.some(i => i.isUploading)}
                    className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5">
                    {isSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t.eventManager?.savingChangesText || "Saving..."}</> : <><CheckCircle className="w-3.5 h-3.5" />{t.eventManager?.saveChangesBtn || "Save Updates"}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Service Modal */}
      <AnimatePresence>
        {showCreateService && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl max-w-lg w-full relative space-y-4 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600" />
              <button onClick={() => setShowCreateService(false)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4 mb-4">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><Calendar className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Create Worship Service / Event</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Schedule a new branch service or ministry activity</p>
                </div>
              </div>
              <div className="max-h-[70vh] overflow-y-auto pr-1">
                <EventForm
                  branches={branches}
                  onSubmit={async data => {
                    try {
                      const token = await getIdToken();
                      const res = await fetch("/api/events", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                        body: JSON.stringify(data),
                      });
                      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to create service."); }
                      setShowCreateService(false);
                      setSuccessEvent({ title: data.title, category: data.category, date: data.date, time: data.time, location: data.location });
                    } catch (err: any) { alert(err.message || "Failed to create service."); }
                  }}
                  onCancel={() => setShowCreateService(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Camera Overlay */}
      {showEditCamera && <CameraCapture onCapture={handleEditPhotoCapture} onClose={() => setShowEditCamera(false)} />}

      {/* Create Sermon Modal */}
      <AnimatePresence>
        {showCreateSermon && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowCreateSermon(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl max-w-lg w-full relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500" />
              <button type="button" onClick={() => setShowCreateSermon(false)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"><Play className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Create Sermon</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Upload a new sermon or message recording</p>
                </div>
              </div>
              <SermonInlineForm
                onClose={() => setShowCreateSermon(false)}
                onSuccess={(title: string) => {
                  setShowCreateSermon(false);
                  showToast("✅ Sermon Created", `Successfully created sermon "${title}".`);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Sermons Modal */}
      <AnimatePresence>
        {showManageSermons && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowManageSermons(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl max-w-2xl w-full relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
              <button type="button" onClick={() => setShowManageSermons(false)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"><Settings className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Manage Sermons</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Delete or update published sermons</p>
                </div>
              </div>
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {loadingSermons ? (
                  <div className="py-10 text-center text-slate-500"><Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-purple-500" /><p className="text-xs font-bold">Loading sermons...</p></div>
                ) : sermonsList.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 border border-dashed border-slate-200 dark:border-white/5 rounded-xl"><Play className="w-7 h-7 mx-auto mb-2 text-slate-300" /><p className="text-xs font-bold">No sermons found.</p></div>
                ) : (
                  sermonsList.map(sermon => (
                    <div key={sermon.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl hover:border-purple-300/40 dark:hover:border-purple-500/20 transition-colors">
                      <div className="min-w-0 flex-1 pr-4">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{sermon.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          <span>By {sermon.pastor}</span><span>•</span><span>{sermon.category}</span><span>•</span><span>{new Date(sermon.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleDeleteSermon(sermon.id)} disabled={deletingSermonId === sermon.id}
                        className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl transition-colors disabled:opacity-50">
                        {deletingSermonId === sermon.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
                <button type="button" onClick={clearSeededSermons} disabled={clearingSeeded || loadingSermons}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/40 disabled:opacity-50">
                  {clearingSeeded ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  {clearingSeeded ? "Clearing..." : "Clear All Static Sermons"}
                </button>
                <button type="button" onClick={() => setShowManageSermons(false)} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Services Modal */}
      <AnimatePresence>
        {showManageServices && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowManageServices(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl max-w-2xl w-full relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600" />
              <button type="button" onClick={() => setShowManageServices(false)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><Settings className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Manage Services</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Delete or update scheduled services</p>
                </div>
              </div>
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {loadingServices ? (
                  <div className="py-10 text-center text-slate-500"><Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-indigo-500" /><p className="text-xs font-bold">Loading services...</p></div>
                ) : servicesList.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 border border-dashed border-slate-200 dark:border-white/5 rounded-xl"><Calendar className="w-7 h-7 mx-auto mb-2 text-slate-300" /><p className="text-xs font-bold">No services found.</p></div>
                ) : (
                  servicesList.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl hover:border-indigo-300/40 dark:hover:border-indigo-500/20 transition-colors">
                      <div className="min-w-0 flex-1 pr-4">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{service.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          <span>{service.category}</span><span>•</span><span>{service.branch?.name || "General"}</span><span>•</span><span>{new Date(service.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleDeleteService(service.id)} disabled={deletingServiceId === service.id}
                        className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl transition-colors disabled:opacity-50">
                        {deletingServiceId === service.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="flex items-center justify-end mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
                <button type="button" onClick={() => setShowManageServices(false)} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 transition-colors">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Events Modal */}
      <AnimatePresence>
        {showManageEvents && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowManageEvents(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl max-w-2xl w-full relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600" />
              <button type="button" onClick={() => setShowManageEvents(false)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><ClipboardList className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Manage Events</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Delete or update submitted event reports</p>
                </div>
              </div>
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {loadingEventsReport ? (
                  <div className="py-10 text-center text-slate-500"><Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-indigo-500" /><p className="text-xs font-bold">Loading reports...</p></div>
                ) : eventsReportList.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 border border-dashed border-slate-200 dark:border-white/5 rounded-xl"><FileText className="w-7 h-7 mx-auto mb-2 text-slate-300" /><p className="text-xs font-bold">No event reports found.</p></div>
                ) : (
                  eventsReportList.map(report => (
                    <div key={report.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl hover:border-indigo-300/40 dark:hover:border-indigo-500/20 transition-colors">
                      <div className="min-w-0 flex-1 pr-4">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{report.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          <span className={`px-1.5 py-0.5 text-[8px] font-black rounded border ${
                            report.status === "APPROVED" ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : report.status === "REJECTED" ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
                            : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"
                          }`}>{report.status}</span>
                          <span>•</span><span>{report.branch?.name || "General"}</span><span>•</span><span>{new Date(report.reportDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleDeleteReportFromModal(report.id)} disabled={deletingEventsReportId === report.id}
                        className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl transition-colors disabled:opacity-50">
                        {deletingEventsReportId === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="flex items-center justify-end mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
                <button type="button" onClick={() => setShowManageEvents(false)} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 transition-colors">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Event Modal */}
      <AnimatePresence>
        {successEvent && (
          <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-7 shadow-2xl max-w-md w-full relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Event Scheduled!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                Your event <span className="font-bold text-slate-800 dark:text-slate-200">"{successEvent.title}"</span> has been created and is now active on the church calendar.
              </p>
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5 rounded-xl p-4 mb-6 text-left space-y-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-violet-500 shrink-0" />
                  <div><span className="text-slate-400 font-semibold">Category: </span><span className="font-bold text-slate-700 dark:text-slate-200">{successEvent.category}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div><span className="text-slate-400 font-semibold">Date: </span><span className="font-bold text-slate-700 dark:text-slate-200">{successEvent.date}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div><span className="text-slate-400 font-semibold">Time: </span><span className="font-bold text-slate-700 dark:text-slate-200">{successEvent.time}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <div><span className="text-slate-400 font-semibold">Location: </span><span className="font-bold text-slate-700 dark:text-slate-200">{successEvent.location}</span></div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setSuccessEvent(null)} className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95">
                  Done
                </button>
                <button onClick={() => { setSuccessEvent(null); setShowManageServices(true); }} className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl border border-slate-200 dark:border-white/10 transition-colors">
                  View All Services
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
