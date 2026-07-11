"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
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
  ChevronDown,
  Sparkles,
  Paperclip,
  X,
  Church,
  ShieldCheck,
  Layers,
  Activity,
  ClipboardCheck,
  NotebookPen,
  Send,
  Sparkle,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Zap,
  UserPlus
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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

interface IconBadgeProps {
  icon: React.ElementType;
  variant?: "violet" | "emerald" | "indigo" | "amber" | "rose" | "cyan" | "purple" | "slate";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  animate?: boolean;
  className?: string;
}

function IconBadge({
  icon: Icon,
  variant = "violet",
  size = "md",
  glow = false, // disabled glow blur by default for optimal performance
  animate = false,
  className = "",
}: IconBadgeProps) {
  const sizeClasses = {
    xs: "w-6 h-6 rounded-lg text-xs p-1",
    sm: "w-8.5 h-8.5 rounded-xl text-sm p-1.5",
    md: "w-10 h-10 rounded-2xl text-base p-2",
    lg: "w-12 h-12 rounded-2xl text-lg p-2.5",
    xl: "w-16 h-16 rounded-3xl text-2xl p-3.5",
  };

  const iconSizes = {
    xs: "w-3.5 h-3.5",
    sm: "w-4.5 h-4.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  const variantClasses = {
    violet: "bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 text-white border border-violet-400/40 shadow-sm",
    emerald: "bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white border border-emerald-400/40 shadow-sm",
    indigo: "bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-600 text-white border border-indigo-400/40 shadow-sm",
    cyan: "bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 text-white border border-cyan-400/40 shadow-sm",
    amber: "bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white border border-amber-400/40 shadow-sm",
    rose: "bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-500 text-white border border-rose-400/40 shadow-sm",
    purple: "bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-violet-600 text-white border border-purple-400/40 shadow-sm",
    slate: "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/15 shadow-sm",
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <div className={`flex items-center justify-center transition-all duration-300 ${sizeClasses[size]} ${variantClasses[variant]} ${animate ? "animate-pulse" : ""}`}>
        <Icon className={`${iconSizes[size]} stroke-[2.2]`} />
      </div>
    </div>
  );
}

function FieldReportFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, getIdToken } = useAuth();
  const role = user?.role ?? "MEMBER";
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [customBranchName, setCustomBranchName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [volunteers, setVolunteers] = useState<string[]>([]);
  const [volunteerInput, setVolunteerInput] = useState("");

  const addVolunteerTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const names = trimmed.split(",").map(n => n.trim()).filter(Boolean);
    setVolunteers(prev => {
      const uniqueNames = names.filter(name => !prev.includes(name));
      return [...prev, ...uniqueNames];
    });
    setVolunteerInput("");
  };

  const handleVolunteerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addVolunteerTag(volunteerInput);
    } else if (e.key === "Backspace" && !volunteerInput && volunteers.length > 0) {
      setVolunteers(prev => prev.slice(0, -1));
    }
  };
  
  // Media states
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewMediaItem, setPreviewMediaItem] = useState<AttachedMedia | null>(null);
  
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

    if (searchParams?.get("openCamera") === "true") {
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
      size: Math.round((base64.length * 3) / 4),
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
    e.target.value = "";
  };

  const processFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      setUploadError(`Unsupported file "${file.name}". Please upload a valid image or video.`);
      return;
    }
    
    if (isImage && file.size > 10 * 1024 * 1024) {
      setUploadError(`Image "${file.name}" exceeds 10MB limit.`);
      return;
    }
    if (isVideo && file.size > 100 * 1024 * 1024) {
      setUploadError(`Video "${file.name}" exceeds 100MB limit.`);
      return;
    }

    setUploadError(null);
    const tempId = Math.random().toString(36).substring(2, 9);
    
    setAttachedMedia(prev => [...prev, {
      id: tempId,
      type: isImage ? "IMAGE" : "VIDEO",
      base64: "",
      name: file.name,
      size: file.size,
      progress: 10,
      isUploading: true
    }]);

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
    if (selectedBranchId === "other" && !customBranchName.trim()) {
      setSubmitError("Please specify the new branch location / address.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    let finalBranchId = selectedBranchId;
    let branchName = branches.find((b) => b.id === selectedBranchId)?.name || "Branch";

    if (selectedBranchId === "other") {
      try {
        const createRes = await fetch("/api/branches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: customBranchName.trim() }),
        });
        const createData = await createRes.json();
        if (createRes.ok && createData.success && createData.branch) {
          finalBranchId = createData.branch.id;
          branchName = createData.branch.name;
        } else {
          throw new Error(createData.error || "Failed to register new branch");
        }
      } catch (err: any) {
        setSubmitError(err.message || "Failed to create new branch location.");
        setIsSubmitting(false);
        return;
      }
    }

    const images = attachedMedia.filter(item => item.type === "IMAGE" && !item.isUploading).map(item => item.base64);
    const videos = attachedMedia.filter(item => item.type === "VIDEO" && !item.isUploading).map(item => item.base64);

    const reportPayload = {
      branchId: finalBranchId,
      branchName,
      title,
      description,
      attendanceCount: 0,
      offeringAmount: 0,
      reportDate: new Date(reportDate).toISOString(),
      gpsLocation: null,
      volunteerNames: volunteers,
      images,
      videos,
    };

    const isOffline = !navigator.onLine;

    if (isOffline) {
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

  const selectedBranchName = branches.find(b => b.id === selectedBranchId)?.name || "Select Branch";
  const numVolunteers = volunteers.length;
  
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
    <div className="min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col pb-20 relative overflow-hidden"
      style={{ background: "var(--color-bg, #f8fafc)" }}>
      
      {/* Subtle static gradient background — NO animations for performance */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-violet-50/60 via-slate-50 to-indigo-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30 transition-colors duration-500" />

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm border-b border-slate-200/80 dark:border-slate-800/80">
        
        {/* Bottom Border Gradient Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500" />

        <div className="flex items-center gap-3">
          <Link
            href="/event-manager"
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl border border-slate-200/60 dark:border-white/10 transition-colors text-slate-600 hover:text-slate-955 dark:text-slate-300 dark:hover:text-white flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <IconBadge icon={FileSpreadsheet} variant="violet" size="sm" />
            <div>
              <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white leading-none">
                {t.eventManager?.activityReportTitle || "Activity Report"}
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 hidden sm:block">
                {t.eventManager?.submitBranchDataSub || "Submit branch data & field logs"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold border transition-colors shadow-sm ${
            isOnline 
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400" 
              : "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span className="hidden sm:inline tracking-wide">{isOnline ? (t.eventManager?.online || "ONLINE") : (t.eventManager?.offline || "OFFLINE MODE")}</span>
          </div>

          <LanguageToggle />

          <div className="h-5 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-slate-200/50 dark:border-white/5">
            <div className="w-5 h-5 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-black text-xs">
              {((user?.name?.replace(/Joseph/gi, "").trim() || "Event Manager"))[0].toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 leading-none truncate max-w-[80px]">{user?.name?.replace(/Joseph/gi, "").trim() || "Event Manager"}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Side Info Card */}
        <div className="md:col-span-5 space-y-5 order-2 md:order-1">
          
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 p-5 shadow-sm transition-all duration-200 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500" />

            <div className="relative space-y-5 pt-1">
              
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20 text-[9px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  {t.eventManager?.liveDraftPreview || "Live Draft Preview"}
                </span>
                
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <span className="text-[9px] font-bold uppercase">Score</span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                    {completionScore()}%
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/40 dark:border-white/5 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-500 rounded-full"
                  style={{ width: `${completionScore()}%` }}
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <h2 className="text-base font-black tracking-tight leading-snug text-slate-900 dark:text-white min-h-[2.5rem] line-clamp-2">
                  {title.trim() || t.eventManager?.untitledReport || "Untitled Activity Report"}
                </h2>
                <div className="flex items-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs font-bold text-slate-650 dark:text-slate-350">
                    <Church className="w-3.5 h-3.5 text-indigo-500" />
                    {selectedBranchName} {t.eventManager?.branchText || "Branch"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/60 dark:border-white/5 rounded-xl p-3.5">
                <Users className="w-5 h-5 text-violet-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-800 dark:text-white truncate">
                    {numVolunteers} {t.eventManager?.volunteersAttendingUnit || "Volunteers Attending"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                    {volunteers.length > 0 ? volunteers.slice(0, 3).join(", ") + (volunteers.length > 3 ? ` +${volunteers.length - 3} more` : "") : "No volunteers assigned yet"}
                  </p>
                </div>
              </div>

              {attachedMedia.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                    <Paperclip className="w-3 h-3 text-violet-500" />
                    {t.eventManager?.attachedAssets || "Attached Assets"} ({attachedMedia.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {attachedMedia.slice(0, 5).map((item) => (
                      <div key={item.id} className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm bg-slate-100 dark:bg-slate-950 flex items-center justify-center shrink-0">
                        {item.isUploading ? (
                          <Loader2 className="w-3.5 h-3.5 text-violet-600 animate-spin" />
                        ) : item.type === "IMAGE" ? (
                          <img src={item.base64} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                          </div>
                        )}
                      </div>
                    ))}
                    {attachedMedia.length > 5 && (
                      <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-xs font-black border border-slate-200 dark:border-white/10 text-slate-650 dark:text-white shadow-sm shrink-0">
                        +{attachedMedia.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Form Completion Checklist */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-violet-500" />
              {t.eventManager?.checklistTitle || "Report Checklist"}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">
                <span className="font-bold">{t.eventManager?.currentStatusLabel || "Current status"}</span>
                <span className="font-extrabold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                  {isOnline ? (t.eventManager?.onlineUploadText || "Online Upload") : (t.eventManager?.queueOfflineText || "Queue Offline")}
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center transition-colors ${selectedBranchId ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-400"}`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className={selectedBranchId ? "text-slate-800 dark:text-slate-250 font-bold" : "text-slate-450 font-semibold"}>
                      {t.eventManager?.branchSelectedText || "Branch Selected"}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${selectedBranchId ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                    {selectedBranchId ? "OK" : (t.eventManager?.requiredText || "Required")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center transition-colors ${title.trim() ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-400"}`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className={title.trim() ? "text-slate-800 dark:text-slate-250 font-bold" : "text-slate-450 font-semibold"}>
                      {t.eventManager?.titleDefinedText || "Event Title Defined"}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${title.trim() ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                    {title.trim() ? "OK" : (t.eventManager?.requiredText || "Required")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center transition-colors ${description.trim() ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-400"}`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className={description.trim() ? "text-slate-800 dark:text-slate-250 font-bold" : "text-slate-450 font-semibold"}>
                      {t.eventManager?.notesProvidedText || "Daily Notes Provided"}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${description.trim() ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                    {description.trim() ? "OK" : (t.eventManager?.requiredText || "Required")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="md:col-span-7 order-1 md:order-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {submitError && (
              <div className="bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900/40 p-4 rounded-xl flex items-start gap-2.5 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <div className="text-xs font-bold">{submitError}</div>
              </div>
            )}

            {/* Core Identification */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-2">
                  <Church className="w-4.5 h-4.5" />
                  {t.eventManager?.formSection1 || "1. Core Identification"}
                </h3>
              </div>

              {/* Branch Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">
                  {t.eventManager?.branchLocationLabel || "Branch Location"}
                </label>
                {isLoadingBranches ? (
                  <div className="h-10 bg-slate-100 dark:bg-white/5 animate-pulse rounded-xl" />
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Church className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <select
                        required
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        className="w-full h-11 pl-10 pr-9 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/80 dark:border-white/10 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 w-full appearance-none cursor-pointer"
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id} className="dark:bg-slate-900">{b.name} {t.eventManager?.branchText || "Branch"}</option>
                        ))}
                        <option value="other" className="dark:bg-slate-900 font-bold">
                          ➕ Other / Add New Location...
                        </option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 pointer-events-none text-slate-400 top-1/2 -translate-y-1/2" />
                    </div>

                    {selectedBranchId === "other" && (
                      <div className="p-3.5 bg-violet-50/50 dark:bg-violet-955/20 border border-violet-200 dark:border-violet-800/30 rounded-xl space-y-1.5">
                        <label className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest block">
                          Enter New Branch Location / Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={customBranchName}
                          onChange={(e) => setCustomBranchName(e.target.value)}
                          placeholder="e.g. Miyapur Branch, Hyderabad"
                          className="w-full h-10 px-3.5 rounded-lg bg-white dark:bg-slate-900 border border-violet-300 dark:border-violet-700 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Event Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">
                  {t.eventManager?.activityNameLabel || "Event / Activity Name"}
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunday Worship Service, Youth Fellowship"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/80 dark:border-white/10 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Date selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">
                  {t.eventManager?.reportDateLabel || "Report Date"}
                </label>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/80 dark:border-white/10 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Outcomes & Volunteer Attendance */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5" />
                  {t.eventManager?.formSection2 || "2. Outcomes & Attendance"}
                </h3>
              </div>

              {/* Daily Activity Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">
                  {t.eventManager?.notesLabel || "Daily Activity Notes & outcomes"}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide a detailed report of the ministry outcome..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-55 border border-slate-200 dark:bg-slate-950/80 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none shadow-sm"
                />
              </div>

              {/* Volunteers Tags Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">
                  {t.eventManager?.volunteersLabel || "Volunteers Attended"}
                </label>
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/80 dark:border-white/10 focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition-all min-h-[44px]">
                  <UserPlus className="w-4 h-4 text-slate-400 ml-1 mr-0.5 shrink-0" />
                  
                  {volunteers.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-xs font-bold text-violet-750 dark:text-violet-300"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => setVolunteers(prev => prev.filter(v => v !== name))}
                        className="text-violet-600 dark:text-violet-400 hover:text-rose-500 rounded p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    placeholder={volunteers.length === 0 ? "e.g. John Doe, Sarah Smith (Press Enter)" : ""}
                    value={volunteerInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.endsWith(",")) {
                        addVolunteerTag(val.slice(0, -1));
                      } else {
                        setVolunteerInput(val);
                      }
                    }}
                    onKeyDown={handleVolunteerKeyDown}
                    onBlur={() => addVolunteerTag(volunteerInput)}
                    className="flex-1 bg-transparent border-none text-xs font-semibold focus:outline-none focus:ring-0 dark:text-white min-w-[120px]"
                  />
                </div>
              </div>
            </div>

            {/* Media Uploader */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-white/5 pb-3 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-2">
                  <UploadCloud className="w-4.5 h-4.5" />
                  {t.eventManager?.formSection3 || "3. Media Attachments"}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full border border-violet-500/20">
                  {attachedMedia.length} files
                </span>
              </div>

              {uploadError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{uploadError}</span>
                  </div>
                  <button type="button" onClick={() => setUploadError(null)} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}

              {/* Drag Zone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                  isDragging 
                    ? "border-violet-500 bg-violet-500/5" 
                    : "border-slate-200 hover:border-violet-450 dark:border-white/10 dark:hover:border-violet-500/30"
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

                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-violet-500 transition-colors" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {t.eventManager?.dragDropText || "Drag images/videos here, or"}{" "}
                    <span className="text-violet-650 dark:text-violet-400 hover:underline">
                      {t.eventManager?.browseFilesText || "browse"}
                    </span>
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 w-full max-w-[240px]">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-250 rounded-xl text-[10px] font-bold border border-slate-200/50 dark:border-white/10 shadow-sm"
                  >
                    <Paperclip className="w-3.5 h-3.5" /> Select Files
                  </button>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowCamera(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-[10px] font-bold shadow-md shadow-violet-500/10"
                  >
                    <Camera className="w-3.5 h-3.5" /> Snapshot
                  </button>
                </div>
              </div>

              {/* Previews and Progress Lists */}
              {attachedMedia.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t.eventManager?.uploadQueueTitle || "Upload Queue"}</span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {attachedMedia.map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950 cursor-pointer"
                        onClick={() => !item.isUploading && setPreviewMediaItem(item)}
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
                              <div className="w-full h-full relative flex items-center justify-center">
                                <video src={item.base64} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
                                    <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-slate-950/70 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                              <div className="flex justify-between items-start">
                                <span className="text-[8px] font-bold bg-white/25 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                                  {formatBytes(item.size)}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); removeMediaItem(item.id); }}
                                  className="p-1 bg-rose-600 hover:bg-rose-500 rounded text-white transition-colors active:scale-95 shadow-md flex items-center justify-center"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-[8px] font-bold truncate">{item.name}</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || attachedMedia.some(item => item.isUploading)}
              className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl flex items-center justify-center font-black text-xs transition-all shadow-md shadow-violet-500/10 mt-6 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  {t.eventManager?.uploadingSyncingText || "Uploading..."}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {isOnline 
                      ? (t.eventManager?.submitReportBtn || "Submit Field Report") 
                      : (t.eventManager?.queueReportBtn || "Queue Report in Offline Outbox")}
                  </span>
                </>
              )}
            </button>

          </form>
        </div>

      </main>

      {/* Media Lightbox */}
      <AnimatePresence>
        {previewMediaItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewMediaItem(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-slate-950/40">
                <span className="text-xs font-bold text-white truncate max-w-xs">{previewMediaItem.name}</span>
                <button type="button" onClick={() => setPreviewMediaItem(null)} className="p-1 rounded bg-white/10 text-white hover:bg-white/20"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40 min-h-[260px]">
                {previewMediaItem.type === "IMAGE" ? (
                  <img src={previewMediaItem.base64} alt={previewMediaItem.name} className="max-h-[60vh] w-auto max-w-full object-contain rounded-lg" />
                ) : (
                  <video src={previewMediaItem.base64} controls autoPlay className="max-h-[60vh] w-auto max-w-full rounded-lg" />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FieldReportForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    }>
      <FieldReportFormContent />
    </Suspense>
  );
}
