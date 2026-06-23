"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { queueReport } from "@/lib/offlineSync";
import CameraCapture from "@/components/CameraCapture";
import { 
  Camera, 
  MapPin, 
  Users, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  CheckCircle,
  FileText,
  Video,
  Play,
  Compass,
  FileSpreadsheet,
  Check,
  RefreshCw,
  Eye,
  AlertTriangle,
  UploadCloud,
  ChevronRight,
  Sparkles,
  Paperclip,
  X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

interface Branch {
  id: string;
  name: string;
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

export default function FieldReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, getIdToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [volunteerNames, setVolunteerNames] = useState("");
  
  // Media states
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Page status states
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Connection state
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch("/api/field-volunteer/branches");
        if (response.ok) {
          const data = await response.json();
          if (data && data.success) {
            setBranches(data.branches);
            if (data.branches.length > 0) {
              setSelectedBranchId(data.branches[0].id);
            }
          }
        }
      } catch (err) {
        console.error("[REPORT] Failed to load branches:", err);
      } finally {
        setIsLoadingBranches(false);
      }
    };

    fetchBranches();

    // Check if camera should open on load
    if (searchParams.get("openCamera") === "true") {
      setShowCamera(true);
    }
  }, [searchParams]);



  // Add camera captured image
  const handlePhotoCapture = (base64: string) => {
    const tempId = Math.random().toString(36).substring(2, 9);
    const newItem: AttachedMedia = {
      id: tempId,
      type: "IMAGE",
      base64,
      name: `captured-snap-${Date.now()}.jpg`,
      size: Math.round((base64.length * 3) / 4), // Approximate bytes size
      progress: 100,
      isUploading: false
    };
    setAttachedMedia((prev) => [...prev, newItem]);
    setShowCamera(false);
  };

  // Drag & drop logic
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(processFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(processFile);
    }
    e.target.value = ""; // Reset
  };

  const processFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      alert("Unsupported file type. Please upload an image or video.");
      return;
    }
    
    // Validate sizes
    if (isImage && file.size > 10 * 1024 * 1024) {
      alert(`Image "${file.name}" exceeds the 10MB limit.`);
      return;
    }
    if (isVideo && file.size > 100 * 1024 * 1024) {
      alert(`Video "${file.name}" exceeds the 100MB limit.`);
      return;
    }

    const tempId = Math.random().toString(36).substring(2, 9);
    
    // Add temporary item with progress = 10
    const newItem: AttachedMedia = {
      id: tempId,
      type: isImage ? "IMAGE" : "VIDEO",
      base64: "",
      name: file.name,
      size: file.size,
      progress: 10,
      isUploading: true
    };
    
    setAttachedMedia(prev => [...prev, newItem]);

    // Simulate progress while reading
    let simulatedProgress = 10;
    const progressInterval = setInterval(() => {
      simulatedProgress = Math.min(simulatedProgress + 15, 95);
      setAttachedMedia(prev => 
        prev.map(item => item.id === tempId ? { ...item, progress: simulatedProgress } : item)
      );
    }, 100);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      if (isImage) {
        // Resize image via canvas
        const img = new Image();
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
            setAttachedMedia(prev => 
              prev.map(item => item.id === tempId ? { ...item, base64, progress: 100, isUploading: false } : item)
            );
          }
        };
        img.src = result;
      } else {
        // For video, write base64 directly
        clearInterval(progressInterval);
        setAttachedMedia(prev => 
          prev.map(item => item.id === tempId ? { ...item, base64: result, progress: 100, isUploading: false } : item)
        );
      }
    };
    
    reader.readAsDataURL(file);
  };

  const removeMediaItem = (id: string) => {
    setAttachedMedia(prev => prev.filter(item => item.id !== id));
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Submit report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || !title || !description || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const branchName = branches.find((b) => b.id === selectedBranchId)?.name || "Branch";
    const volunteersList = volunteerNames
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const images = attachedMedia.filter(item => item.type === "IMAGE" && !item.isUploading).map(item => item.base64);
    const videos = attachedMedia.filter(item => item.type === "VIDEO" && !item.isUploading).map(item => item.base64);

    const reportPayload = {
      branchId: selectedBranchId,
      branchName,
      title,
      description,
      attendanceCount: 0,
      offeringAmount: 0,
      reportDate: new Date(reportDate).toISOString(),
      gpsLocation: null,
      volunteerNames: volunteersList,
      images, // array of base64 strings
      videos, // array of base64 strings
    };

    const isOffline = !navigator.onLine;

    if (isOffline) {
      // Offline mode: queue in IndexedDB
      try {
        await queueReport(reportPayload);
        setIsSubmitting(false);
        router.push("/event-manager?syncQueued=true");
      } catch (dbErr: any) {
        console.error("[REPORT] IndexedDB save error:", dbErr);
        setSubmitError("Failed to store report in local outbox queue.");
        setIsSubmitting(false);
      }
    } else {
      // Online mode: upload directly to server API
      try {
        const token = await getIdToken();
        const response = await fetch("/api/field-volunteer/report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(reportPayload),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setIsSubmitting(false);
          router.push("/event-manager?uploadSuccess=true");
        } else {
          setSubmitError(result.error || "Server rejected report submission.");
          setIsSubmitting(false);
        }
      } catch (err: any) {
        console.error("[REPORT] Network submission error:", err);
        // Fallback: save to local queue anyway
        try {
          console.warn("[REPORT] Falling back to offline local queue...");
          await queueReport(reportPayload);
          setIsSubmitting(false);
          router.push("/event-manager?syncQueued=true");
        } catch (dbErr) {
          setSubmitError("Network request failed and local queue storage is unavailable.");
          setIsSubmitting(false);
        }
      }
    }
  };

  // Live draft tracking info
  const selectedBranchName = branches.find(b => b.id === selectedBranchId)?.name || "Select Branch";
  const numVolunteers = volunteerNames.split(",").map(v => v.trim()).filter(Boolean).length;
  
  // Calculate completion percentage
  const completionScore = () => {
    let score = 0;
    if (selectedBranchId) score += 25;
    if (title.trim()) score += 25;
    if (description.trim()) score += 35;
    if (attachedMedia.length > 0) score += 15;
    return score;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col pb-16">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-white/[0.05] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/event-manager"
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/[0.05] transition-all text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Activity Report</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-widest mt-0.5">Submit branch data</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
            isOnline 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
              : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-ping"}`} />
            <span>{isOnline ? "ONLINE" : "OFFLINE MODE"}</span>
          </div>

          <ThemeToggle />

          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user?.name || "Joseph"}</p>
            <p className="text-[9px] text-slate-400 dark:text-slate-550 font-semibold uppercase tracking-wider">Event Manager</p>
          </div>
        </div>
      </header>

      {/* Camera Capture Modal Layer */}
      {showCamera && (
        <CameraCapture
          onCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Real-time Draft Card & Checklist (Sticky) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 h-fit">
          
          {/* Real-time Draft Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 text-white p-6 shadow-xl border border-violet-500/20 group">
            
            {/* Ambient Background Glows */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-pink-500/20 blur-3xl group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-blue-500/20 blur-2xl" />

            <div className="relative space-y-5">
              
              {/* Badge */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-[9px] font-bold tracking-wider uppercase text-violet-100">
                  <Sparkles className="w-3 h-3 text-pink-300 animate-pulse" />
                  Live Draft Preview
                </span>
                <span className="text-[10px] font-semibold text-white/60">
                  Ready Score: {completionScore()}%
                </span>
              </div>

              {/* Title & Branch */}
              <div className="space-y-1">
                <h2 className="text-xl font-black tracking-tight leading-tight line-clamp-2">
                  {title.trim() || "Untitled Activity Report"}
                </h2>
                <p className="text-xs text-violet-100/70 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  {selectedBranchName} Branch
                </p>
              </div>

              {/* Volunteers Count */}
              <div className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 rounded-xl p-2.5">
                <Users className="w-4 h-4 shrink-0 text-violet-200" />
                <span className="truncate text-violet-100/90 font-medium">
                  {numVolunteers} Volunteer{numVolunteers !== 1 ? 's' : ''} Attending
                </span>
              </div>

              {/* Thumbnail Attachments */}
              {attachedMedia.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block">Attached Assets ({attachedMedia.length})</span>
                  <div className="flex flex-wrap gap-2">
                    {attachedMedia.slice(0, 5).map((item, i) => (
                      <div key={item.id} className="relative w-9 h-9 rounded-lg overflow-hidden border border-white/20 shadow-sm bg-black/20 flex items-center justify-center">
                        {item.isUploading ? (
                          <Loader2 className="w-3.5 h-3.5 text-white/60 animate-spin" />
                        ) : item.type === "IMAGE" ? (
                          <img src={item.base64} className="w-full h-full object-cover" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-white/80" />
                        )}
                      </div>
                    ))}
                    {attachedMedia.length > 5 && (
                      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold border border-white/10">
                        +{attachedMedia.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Form Completion Checklist */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-violet-500" />
              Report Completion Checklist
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">
                <span>Current status</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{isOnline ? "Online Upload" : "Queue Offline"}</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${selectedBranchId ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={selectedBranchId ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-400"}>Branch Selected</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{selectedBranchId ? "OK" : "Required"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${title.trim() ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={title.trim() ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-400"}>Event Title Defined</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{title.trim() ? "OK" : "Required"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${description.trim() ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={description.trim() ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-400"}>Daily Notes Provided</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{description.trim() ? "OK" : "Required"}</span>
                </div>



                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${attachedMedia.length > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={attachedMedia.length > 0 ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-400"}>Media Attached</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{attachedMedia.length > 0 ? `${attachedMedia.length} files` : "Optional"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Redesigned High-Fidelity Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {submitError && (
              <div className="bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/30 p-4 rounded-2xl flex items-start gap-2.5 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold">{submitError}</div>
              </div>
            )}

            {/* Panel 1: Core Identification */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">1. Core Identification</h3>
                <p className="text-[9px] text-slate-400 dark:text-slate-550 font-semibold uppercase tracking-widest mt-0.5">Where & when did this activity take place</p>
              </div>

              {/* Branch Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Branch Location</label>
                {isLoadingBranches ? (
                  <div className="h-11 bg-slate-100 dark:bg-white/5 animate-pulse rounded-xl" />
                ) : (
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                      <Compass className="w-4 h-4" />
                    </div>
                    <select
                      required
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all appearance-none cursor-pointer"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id} className="dark:bg-slate-900 text-xs font-semibold">{b.name} Branch</option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l border-slate-200 dark:border-white/10 pl-2">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-90" />
                    </div>
                  </div>
                )}
              </div>

              {/* Event Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Event / Activity Name</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunday Service, Youth Fellowship"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all"
                  />
                </div>
              </div>

              {/* Date selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Report Date</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Panel 2: Outcomes & Volunteer Attendance */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">2. Outcomes & Attendance</h3>
                <p className="text-[9px] text-slate-400 dark:text-slate-555 font-semibold uppercase tracking-widest mt-0.5">Describe what happened and list helpers</p>
              </div>

              {/* Daily Activity Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Daily Activity Notes & outcomes</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide a report of the ministry outcome, prayer needs, and notable event actions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all resize-none"
                />
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">
                  💡 Tips: Note down highlights, prayer items, and new member details.
                </p>
              </div>

              {/* Volunteer Names */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Volunteers Attended (Comma-separated)</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550">
                    <Users className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. John Doe, Sarah Smith, Michael John"
                    value={volunteerNames}
                    onChange={(e) => setVolunteerNames(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all"
                  />
                </div>
                {volunteerNames.trim() && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {volunteerNames.split(",").map(v => v.trim()).filter(Boolean).map((name, i) => (
                      <span key={i} className="text-[9px] font-bold bg-violet-500/10 border border-violet-500/10 px-2 py-0.5 rounded-lg text-violet-600 dark:text-violet-400">
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Panel 3: Redesigned Unified High-End Media Drag-and-Drop Uploader */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 dark:border-white/5 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-violet-500" />
                    3. Media Attachments
                  </h3>
                  <p className="text-[9px] text-slate-400 dark:text-slate-555 font-semibold uppercase tracking-widest mt-0.5">Drag and drop files to attach reports logs</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-lg border text-slate-550 border-slate-200/60 dark:border-white/10 dark:text-slate-400">
                  {attachedMedia.length} files attached
                </span>
              </div>

              {/* Combined Drag and Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center min-h-[160px] ${
                  isDragging 
                    ? "border-violet-500 bg-violet-500/5 dark:bg-violet-500/10 scale-[1.01]" 
                    : "border-slate-200 hover:border-violet-500/50 dark:border-white/10 dark:hover:border-violet-500/35 hover:bg-slate-50/50 dark:hover:bg-white/[0.01]"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/mp4,video/webm"
                  multiple
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                  <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-slate-400 group-hover:text-violet-500 transition-colors shadow-sm ${isDragging ? "animate-bounce" : ""}`}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                      Drag & drop images/videos here, or <span className="text-violet-600 dark:text-violet-400 group-hover:underline">browse files</span>
                    </p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium max-w-sm mx-auto">
                      Images (JPG, PNG, WEBP up to 10MB) & Videos (MP4, WEBM up to 100MB)
                    </p>
                  </div>
                </div>

                {/* Direct Camera Shortcut Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid triggering file browse click
                    setShowCamera(true);
                  }}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Live Snapshot
                </button>
              </div>

              {/* Previews and Progress Lists */}
              {attachedMedia.length > 0 && (
                <div className="space-y-4">
                  <span className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Upload Queue & Preview</span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {attachedMedia.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="relative aspect-video rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/10 group shadow-sm bg-slate-900"
                        >
                          {item.isUploading ? (
                            /* Uploading Skeleton UI */
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-900 text-white space-y-2">
                              <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                              <div className="min-w-0 w-full">
                                <p className="text-[9px] font-bold truncate text-slate-350 px-1">{item.name}</p>
                                <p className="text-[8px] text-slate-500 font-semibold uppercase">{formatBytes(item.size)}</p>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1 px-1.5">
                                <div 
                                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            /* Rendered Preview Card */
                            <>
                              {item.type === "IMAGE" ? (
                                <img src={item.base64} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full relative flex items-center justify-center">
                                  <video src={item.base64} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
                                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                                    </div>
                                  </div>
                                  <span className="absolute bottom-2 left-2 text-[8px] font-black uppercase bg-violet-650/90 text-white px-2 py-0.5 rounded-lg tracking-wider border border-violet-500/20">
                                    Video
                                  </span>
                                </div>
                              )}

                              {/* Hover Action Overlay */}
                              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-white">
                                <div className="flex justify-between items-start">
                                  <span className="text-[8px] font-black bg-white/20 px-2 py-0.5 rounded border border-white/10 tracking-wide uppercase">
                                    {formatBytes(item.size)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeMediaItem(item.id);
                                    }}
                                    className="p-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-white transition-colors active:scale-95 shadow-md"
                                    title="Delete Attachment"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <p className="text-[9px] font-bold truncate pr-1">{item.name}</p>
                              </div>
                            </>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || attachedMedia.some(item => item.isUploading)}
              className="w-full h-12 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 text-white rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-md mt-6 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Uploading and Syncing data...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4.5 h-4.5" />
                  {isOnline ? "Submit Field Report" : "Queue Report in Offline Outbox"}
                </>
              )}
            </button>

          </form>
        </div>

      </main>
    </div>
  );
}
