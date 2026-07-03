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
  glow = true,
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
    violet: "bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 text-white border border-violet-400/40 shadow-lg shadow-violet-600/30",
    emerald: "bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white border border-emerald-400/40 shadow-lg shadow-emerald-600/30",
    indigo: "bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-600 text-white border border-indigo-400/40 shadow-lg shadow-indigo-600/30",
    cyan: "bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 text-white border border-cyan-400/40 shadow-lg shadow-cyan-600/30",
    amber: "bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white border border-amber-400/40 shadow-lg shadow-amber-600/30",
    rose: "bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-500 text-white border border-rose-400/40 shadow-lg shadow-rose-600/30",
    purple: "bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-violet-600 text-white border border-purple-400/40 shadow-lg shadow-purple-600/30",
    slate: "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/15 shadow-sm",
  };

  const glowColors = {
    violet: "bg-violet-500/30",
    emerald: "bg-emerald-500/30",
    indigo: "bg-indigo-500/30",
    cyan: "bg-cyan-500/30",
    amber: "bg-amber-500/30",
    rose: "bg-rose-500/30",
    purple: "bg-purple-500/30",
    slate: "bg-slate-400/10",
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {glow && variant !== "slate" && (
        <div className={`absolute inset-0 rounded-2xl ${glowColors[variant]} blur-md pointer-events-none transform scale-110 -z-10`} />
      )}
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
    
    // Split by commas just in case they pasted comma-separated names
    const names = trimmed.split(",").map(n => n.trim()).filter(Boolean);
    
    setVolunteers(prev => {
      // Avoid duplicates
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

    // Check if camera should open on load
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
      setUploadError(`Unsupported file "${file.name}". Please upload a valid image or video.`);
      return;
    }
    
    // Validate sizes
    if (isImage && file.size > 10 * 1024 * 1024) {
      setUploadError(`Image "${file.name}" exceeds the 10MB limit.`);
      return;
    }
    if (isVideo && file.size > 100 * 1024 * 1024) {
      setUploadError(`Video "${file.name}" exceeds the 100MB limit.`);
      return;
    }

    setUploadError(null);

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
  const numVolunteers = volunteers.length;
  
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
    <div className="min-h-screen bg-transparent text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col pb-16 relative overflow-hidden">
      
      {/* Background Liquid Glass Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
        {/* Blurry backing filter */}
        <div className="absolute inset-0 bg-white/10 dark:bg-slate-950/20 backdrop-blur-[120px] z-10" />
        
        {/* Liquid Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-[40%] bg-gradient-to-tr from-violet-600/20 to-indigo-600/15 dark:from-violet-500/25 dark:to-indigo-500/20 blur-[60px] animate-liquid-one" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-[50%] bg-gradient-to-tr from-cyan-500/15 to-emerald-500/10 dark:from-cyan-400/20 dark:to-emerald-500/15 blur-[70px] animate-liquid-two" />
        <div className="absolute top-[30%] right-[10%] w-[550px] h-[550px] rounded-[30%] bg-gradient-to-br from-pink-500/15 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/15 blur-[60px] animate-liquid-three" />
        <div className="absolute bottom-[20%] left-[-5%] w-[500px] h-[500px] rounded-[45%] bg-gradient-to-tr from-amber-500/10 to-orange-500/5 dark:from-amber-400/25 dark:to-orange-500/20 blur-[55px] animate-liquid-four" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between shadow-sm border-b border-slate-200/50 dark:border-white/10">
        
        {/* Bottom Border Gradient Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500" />

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/event-manager"
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl border border-slate-200/60 dark:border-white/10 transition-all text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white shadow-sm active:scale-95 group flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div className="flex items-center gap-3">
            <IconBadge icon={FileSpreadsheet} variant="violet" size="md" />
            <div>
              <h1 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                {t.eventManager?.activityReportTitle || "Activity Report"}
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5 hidden sm:block">
                {t.eventManager?.submitBranchDataSub || "Submit branch data & field logs"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all shadow-sm ${
            isOnline 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" 
              : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.9)]" : "bg-amber-500 animate-ping"}`} />
            <span className="hidden sm:inline tracking-wide">{isOnline ? (t.eventManager?.online || "ONLINE") : (t.eventManager?.offline || "OFFLINE MODE")}</span>
          </div>

          <LanguageToggle />

          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2.5 bg-slate-100/80 dark:bg-white/5 px-3 py-1.5 rounded-2xl border border-slate-200/50 dark:border-white/10">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
              {((user?.name?.replace(/Joseph/gi, "").trim() || "Event Manager"))[0].toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{user?.name?.replace(/Joseph/gi, "").trim() || "Event Manager"}</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {role === "SUPER_ADMIN" ? "Super Admin" : role === "ADMIN" ? "Admin" : role === "EVENT_MANAGER" ? (t.eventManager?.title || "Event Manager") : "Volunteer"}
              </p>
            </div>
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
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Side: Real-time Draft Card & Checklist (Sticky) */}
        <div className="md:col-span-5 space-y-6 md:sticky md:top-24 h-fit order-2 md:order-1">
          
          {/* Real-time Draft Card (Executive Senior UI/UX Redesign) */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 shadow-xl shadow-slate-200/50 dark:shadow-black/40 transition-all duration-300 group">
            
            {/* Ambient Top Gradient Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500" />

            <div className="relative space-y-6 pt-1">
              
              {/* Badge & Score Header */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200/80 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30 text-[10px] font-black tracking-wider uppercase shadow-sm">
                  <IconBadge icon={Sparkles} variant="purple" size="xs" glow={false} animate />
                  {t.eventManager?.liveDraftPreview || "Live Draft Preview"}
                </span>
                
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 px-3 py-1 rounded-full shadow-sm">
                  <IconBadge icon={Zap} variant="emerald" size="xs" glow={false} />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">
                    {t.eventManager?.readyScoreLabel || "Ready Score"}
                  </span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                    {completionScore()}%
                  </span>
                </div>
              </div>

              {/* Ready Score Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-white/10 shadow-inner">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-500 rounded-full shadow-sm"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionScore()}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Title & Branch */}
              <div className="space-y-2.5 pt-1">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-slate-900 dark:text-white min-h-[3rem] line-clamp-2">
                  {title.trim() || t.eventManager?.untitledReport || "Untitled Activity Report"}
                </h2>
                <div className="flex items-center">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-extrabold text-slate-700 dark:text-slate-200 shadow-sm">
                    <IconBadge icon={Church} variant="indigo" size="xs" glow={false} />
                    {selectedBranchName} {t.eventManager?.branchText || "Branch"}
                  </span>
                </div>
              </div>

              {/* Volunteers Count Card */}
              <div className="flex items-center gap-3.5 bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:border-violet-500/30 transition-all">
                <IconBadge icon={Users} variant="violet" size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {numVolunteers} {t.eventManager?.volunteersAttendingUnit || "Volunteers Attending"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    {volunteers.length > 0 ? volunteers.slice(0, 3).join(", ") + (volunteers.length > 3 ? ` +${volunteers.length - 3} more` : "") : "No volunteers assigned yet"}
                  </p>
                </div>
              </div>

              {/* Thumbnail Attachments */}
              {attachedMedia.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                    <Paperclip className="w-3 h-3 text-violet-500" />
                    {t.eventManager?.attachedAssets || "Attached Assets"} ({attachedMedia.length})
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {attachedMedia.slice(0, 5).map((item) => (
                      <div key={item.id} className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200 dark:border-white/20 shadow-sm bg-slate-100 dark:bg-slate-950 flex items-center justify-center group/thumb">
                        {item.isUploading ? (
                          <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                        ) : item.type === "IMAGE" ? (
                          <img src={item.base64} className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                          </div>
                        )}
                      </div>
                    ))}
                    {attachedMedia.length > 5 && (
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs font-black border border-slate-200 dark:border-white/20 text-slate-700 dark:text-white shadow-sm">
                        +{attachedMedia.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Form Completion Checklist */}
          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2.5">
              <IconBadge icon={ClipboardCheck} variant="violet" size="sm" />
              {t.eventManager?.checklistTitle || "Report Checklist"}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2.5">
                <span className="font-bold">{t.eventManager?.currentStatusLabel || "Current status"}</span>
                <span className="font-extrabold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
                  {isOnline ? (t.eventManager?.onlineUploadText || "Online Upload") : (t.eventManager?.queueOfflineText || "Queue Offline")}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${selectedBranchId ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30" : "bg-slate-100 dark:bg-white/10 text-slate-400"}`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className={selectedBranchId ? "text-slate-900 dark:text-slate-100 font-extrabold" : "text-slate-400 font-medium"}>
                      {t.eventManager?.branchSelectedText || "Branch Selected"}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${selectedBranchId ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                    {selectedBranchId ? "OK" : (t.eventManager?.requiredText || "Required")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${title.trim() ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30" : "bg-slate-100 dark:bg-white/10 text-slate-400"}`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className={title.trim() ? "text-slate-900 dark:text-slate-100 font-extrabold" : "text-slate-400 font-medium"}>
                      {t.eventManager?.titleDefinedText || "Event Title Defined"}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${title.trim() ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                    {title.trim() ? "OK" : (t.eventManager?.requiredText || "Required")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${description.trim() ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30" : "bg-slate-100 dark:bg-white/10 text-slate-400"}`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className={description.trim() ? "text-slate-900 dark:text-slate-100 font-extrabold" : "text-slate-400 font-medium"}>
                      {t.eventManager?.notesProvidedText || "Daily Notes Provided"}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${description.trim() ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                    {description.trim() ? "OK" : (t.eventManager?.requiredText || "Required")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${attachedMedia.length > 0 ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30" : "bg-slate-100 dark:bg-white/10 text-slate-400"}`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className={attachedMedia.length > 0 ? "text-slate-900 dark:text-slate-100 font-extrabold" : "text-slate-400 font-medium"}>
                      {t.eventManager?.mediaAttachedText || "Media Attached"}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${attachedMedia.length > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                    {attachedMedia.length > 0 ? `${attachedMedia.length} ${t.eventManager?.filesUnit || "files"}` : (t.eventManager?.optionalText || "Optional")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Redesigned High-Fidelity Form */}
        <div className="md:col-span-7 order-1 md:order-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {submitError && (
              <div className="bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/40 p-4.5 rounded-2xl flex items-start gap-3 text-rose-600 dark:text-rose-400 shadow-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs font-bold">{submitError}</div>
              </div>
            )}

            {/* Panel 1: Core Identification */}
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              <div className="border-b border-slate-100 dark:border-white/10 pb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-2.5">
                  <IconBadge icon={Church} variant="violet" size="sm" />
                  {t.eventManager?.formSection1 || "1. Core Identification"}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {t.eventManager?.formSection1Sub || "Where & when did this activity take place"}
                </p>
              </div>

              {/* Branch Dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                  {t.eventManager?.branchLocationLabel || "Branch Location"}
                </label>
                {isLoadingBranches ? (
                  <div className="h-12 bg-slate-100 dark:bg-white/5 animate-pulse rounded-2xl" />
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <IconBadge icon={Church} variant="slate" size="xs" glow={false} />
                      </div>
                      <select
                        required
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        className="w-full h-12 pl-12 pr-10 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-950/50 dark:border-white/10 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 dark:focus:border-violet-400 transition-all appearance-none cursor-pointer shadow-sm"
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id} className="dark:bg-slate-900 text-xs font-semibold">{b.name} {t.eventManager?.branchText || "Branch"}</option>
                        ))}
                        <option value="other" className="dark:bg-slate-900 text-xs font-bold text-violet-600 dark:text-violet-400">
                          ➕ {(t.eventManager as any)?.otherBranchOpt || "Other / Add New Location..."}
                        </option>

                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-slate-200 dark:border-white/10 pl-2.5">
                        <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                      </div>
                    </div>

                    {selectedBranchId === "other" && (
                      <div className="p-3.5 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/80 dark:border-violet-800/40 rounded-2xl space-y-2 animate-fadeIn">
                        <label className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest block">
                          Enter New Branch Location / Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={customBranchName}
                          onChange={(e) => setCustomBranchName(e.target.value)}
                          placeholder="e.g. Miyapur Branch, Hydernagar, Hyderabad"
                          className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-900 border border-violet-300 dark:border-violet-700 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Event Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                  {t.eventManager?.activityNameLabel || "Event / Activity Name"}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <IconBadge icon={FileText} variant="slate" size="xs" glow={false} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunday Worship Service, Youth Fellowship"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-950/50 dark:border-white/10 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 dark:focus:border-violet-400 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Date selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                  {t.eventManager?.reportDateLabel || "Report Date"}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <IconBadge icon={CalendarIcon} variant="slate" size="xs" glow={false} />
                  </div>
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-950/50 dark:border-white/10 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 dark:focus:border-violet-400 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Panel 2: Outcomes & Volunteer Attendance */}
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              <div className="border-b border-slate-100 dark:border-white/10 pb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-2.5">
                  <IconBadge icon={Activity} variant="indigo" size="sm" />
                  {t.eventManager?.formSection2 || "2. Outcomes & Attendance"}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {t.eventManager?.formSection2Sub || "Describe what happened and list helpers"}
                </p>
              </div>

              {/* Daily Activity Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                  {t.eventManager?.notesLabel || "Daily Activity Notes & outcomes"}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide a detailed report of the ministry outcome, prayer needs, and notable event actions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-950/50 dark:border-white/10 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 dark:focus:border-violet-400 transition-all resize-none shadow-sm"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                  💡 {t.eventManager?.notesTip || "Tips: Note down highlights, prayer items, and new member details."}
                </p>
              </div>

              {/* Volunteer Names Tags Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                  {t.eventManager?.volunteersLabel || "Volunteers Attended"}
                </label>
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-950/50 dark:border-white/10 focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-500 dark:focus-within:border-violet-400 transition-all min-h-12 cursor-text shadow-sm">
                  <div className="flex items-center text-slate-400 dark:text-slate-500 pl-0.5 mr-1 shrink-0">
                    <IconBadge icon={UserPlus} variant="slate" size="xs" glow={false} />
                  </div>
                  
                  {/* Render Tags */}
                  <AnimatePresence>
                    {volunteers.map((name) => (
                      <motion.span
                        key={name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-violet-500/15 to-indigo-500/15 border border-violet-500/30 dark:border-violet-400/30 text-xs font-bold text-violet-700 dark:text-violet-300 shadow-sm"
                      >
                        {name}
                        <button
                          type="button"
                          onClick={() => setVolunteers(prev => prev.filter(v => v !== name))}
                          className="hover:bg-rose-500/20 text-violet-600 dark:text-violet-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>

                  <input
                    type="text"
                    placeholder={volunteers.length === 0 ? (t.eventManager?.volunteersPlaceholder || "e.g. John Doe, Sarah Smith (Press Enter or comma)") : ""}
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
                    className="flex-1 bg-transparent border-none text-xs font-semibold focus:outline-none focus:ring-0 dark:text-white min-w-[140px] py-1"
                  />
                </div>
              </div>
            </div>

            {/* Panel 3: Executive Senior UI/UX Media Drag-and-Drop Uploader */}
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              
              <div className="border-b border-slate-100 dark:border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-2.5">
                    <IconBadge icon={UploadCloud} variant="cyan" size="sm" />
                    {t.eventManager?.formSection3 || "3. Media Attachments"}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {t.eventManager?.formSection3Sub || "Drag and drop files to attach reports logs"}
                  </p>
                </div>
                <span className="text-[10px] font-extrabold px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full border border-violet-500/20 shadow-sm">
                  {attachedMedia.length} {t.eventManager?.filesAttachedText || "files attached"}
                </span>
              </div>

              {/* Validation Toast Error Banner */}
              <AnimatePresence>
                {uploadError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 dark:bg-rose-950/40 dark:border-rose-800/50 flex items-center justify-between gap-3 text-rose-700 dark:text-rose-300 text-xs font-bold shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-rose-600 dark:text-rose-400" />
                      <span className="truncate">{uploadError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadError(null)}
                      className="p-1 hover:bg-rose-500/20 rounded-lg transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Executive Drag & Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-7 sm:p-9 text-center cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center min-h-[200px] overflow-hidden ${
                  isDragging 
                    ? "border-violet-500 bg-gradient-to-b from-violet-500/15 via-indigo-500/10 to-transparent dark:bg-violet-500/20 scale-[1.01] shadow-2xl shadow-violet-500/20 ring-4 ring-violet-500/20" 
                    : "border-slate-200 hover:border-violet-500/60 dark:border-white/10 dark:hover:border-violet-400/50 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
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

                {/* Executive Multi-Layer Glowing Icon Badge Container */}
                <div className="relative mb-4 pointer-events-none">
                  <IconBadge 
                    icon={UploadCloud} 
                    variant="violet" 
                    size="xl" 
                    glow={true} 
                    className={`transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${isDragging ? "animate-bounce" : ""}`} 
                  />
                </div>

                {/* Central Labels */}
                <div className="space-y-1.5 max-w-md pointer-events-none z-10">
                  <p className="text-sm font-black tracking-tight text-slate-800 dark:text-slate-100">
                    {isDragging ? (
                      <span className="text-violet-600 dark:text-violet-400 animate-pulse">Release to upload files immediately!</span>
                    ) : (
                      <>
                        {t.eventManager?.dragDropText || "Drag new images/videos here, or"}{" "}
                        <span className="text-violet-600 dark:text-violet-400 underline decoration-violet-500/40 underline-offset-4 group-hover:decoration-violet-500">
                          {t.eventManager?.browseFilesText || "browse files"}
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
                    {t.eventManager?.uploadRequirements || "Images (JPG, PNG, WEBP up to 10MB) & Videos (MP4, WEBM up to 100MB)"}
                  </p>
                </div>

                {/* Integrated Action Buttons Bar */}
                <div className="mt-5 flex items-center justify-center gap-3 w-full max-w-xs z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-extrabold transition-all active:scale-95 shadow-sm border border-slate-200/80 dark:border-white/10"
                  >
                    <IconBadge icon={Paperclip} variant="slate" size="xs" glow={false} />
                    <span>Choose Files</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCamera(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-violet-600/25 active:scale-95"
                  >
                    <IconBadge icon={Camera} variant="purple" size="xs" glow={false} />
                    <span>{t.eventManager?.liveSnapshotBtn || "Live Snapshot"}</span>
                  </button>
                </div>
              </div>

              {/* Previews and Progress Lists */}
              {attachedMedia.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-violet-500" />
                      {t.eventManager?.uploadQueueTitle || "Upload Queue & Preview"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      Click media to inspect preview
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {attachedMedia.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 group shadow-sm bg-slate-950 cursor-pointer"
                          onClick={() => !item.isUploading && setPreviewMediaItem(item)}
                        >
                          {item.isUploading ? (
                            /* Uploading Skeleton UI */
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-950 text-white space-y-2">
                              <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                              <div className="min-w-0 w-full">
                                <p className="text-[9px] font-bold truncate text-slate-300 px-1">{item.name}</p>
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
                                <img src={item.base64} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-full h-full relative flex items-center justify-center">
                                  <video src={item.base64} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-110 transition-transform">
                                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                                    </div>
                                  </div>
                                  <span className="absolute bottom-2 left-2 text-[8px] font-black uppercase bg-violet-600/90 text-white px-2 py-0.5 rounded-lg tracking-wider border border-violet-500/20 backdrop-blur-sm">
                                    Video
                                  </span>
                                </div>
                              )}

                              {/* Hover Action Overlay */}
                              <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-white">
                                <div className="flex justify-between items-start">
                                  <span className="text-[8px] font-black bg-white/20 px-2 py-0.5 rounded-md border border-white/10 tracking-wide uppercase backdrop-blur-sm">
                                    {formatBytes(item.size)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeMediaItem(item.id);
                                    }}
                                    className="p-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-white transition-colors active:scale-95 shadow-md flex items-center justify-center"
                                    title={t.eventManager?.deleteTitle || "Delete Attachment"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                  <p className="text-[9px] font-extrabold truncate pr-1">{item.name}</p>
                                  <Eye className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                </div>
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
              className="w-full h-14 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 active:scale-[0.99] disabled:opacity-50 disabled:scale-100 text-white rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-xl shadow-indigo-500/25 mt-8 gap-3 cursor-pointer group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.eventManager?.uploadingSyncingText || "Uploading and Syncing data..."}
                </>
              ) : (
                <>
                  <IconBadge icon={Send} variant="emerald" size="sm" glow={true} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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

      {/* Senior UI/UX Interactive Media Lightbox Modal */}
      <AnimatePresence>
        {previewMediaItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewMediaItem(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-slate-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/50">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 text-[10px] font-black uppercase tracking-wider">
                    {previewMediaItem.type}
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                    {previewMediaItem.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewMediaItem(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Container */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60 min-h-[300px]">
                {previewMediaItem.type === "IMAGE" ? (
                  <img
                    src={previewMediaItem.base64}
                    alt={previewMediaItem.name}
                    className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                  />
                ) : (
                  <video
                    src={previewMediaItem.base64}
                    controls
                    autoPlay
                    className="max-h-[70vh] w-auto max-w-full rounded-xl shadow-lg"
                  />
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950/80 border-t border-white/10 text-xs text-slate-400 font-medium">
                <span>File size: {formatBytes(previewMediaItem.size)}</span>
                <button
                  type="button"
                  onClick={() => setPreviewMediaItem(null)}
                  className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-colors"
                >
                  Close Preview
                </button>
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
