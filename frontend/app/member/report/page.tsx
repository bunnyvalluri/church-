"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Bug,
  Wifi,
  WifiOff,
  Monitor,
  Smartphone,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  RefreshCw,
  X,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  Phone,
  Mail,
  ExternalLink,
  HelpCircle,
  Info,
  Sparkles,
  Layers,
  ArrowLeft,
  Eye,
  AlertCircle,
  Laptop,
  Globe,
  Loader2,
  Check,
  Search,
  Calendar,
  ShieldCheck,
  Activity,
  Image as ImageIcon,
  Sparkle,
} from "lucide-react";
import { captureBrowserDiagnostics, BrowserDiagnostics } from "@/lib/issueDiagnostics";
import { getRecentErrorContext } from "@/lib/clientErrorCollector";

// Supported Categories with Rich Brand Colors
const ISSUE_CATEGORIES = [
  {
    id: "SOMETHING_IS_BROKEN",
    label: "Something is Broken",
    icon: AlertTriangle,
    desc: "A button, form, or action isn't responding",
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/20",
    glowColor: "group-hover:border-rose-300 dark:group-hover:border-rose-700",
  },
  {
    id: "PAGE_NOT_LOADING",
    label: "Page Not Loading",
    icon: Globe,
    desc: "Page hangs, blank screen, or fails to fetch",
    iconColor: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-500/10 dark:bg-sky-500/20 border-sky-500/20",
    glowColor: "group-hover:border-sky-300 dark:group-hover:border-sky-700",
  },
  {
    id: "LOGIN_ACCOUNT",
    label: "Login & Account",
    icon: ShieldAlert,
    desc: "Trouble signing in, profile, or session expired",
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/20",
    glowColor: "group-hover:border-violet-300 dark:group-hover:border-violet-700",
  },
  {
    id: "MOBILE_RESPONSIVE",
    label: "Mobile Display Issue",
    icon: Smartphone,
    desc: "Content cut off or overlapping on phones/tablets",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20",
    glowColor: "group-hover:border-amber-300 dark:group-hover:border-amber-700",
  },
  {
    id: "WEBSITE_DISPLAY",
    label: "Display & Styling",
    icon: Monitor,
    desc: "Visual glitches, colors, or misaligned layouts",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/20",
    glowColor: "group-hover:border-indigo-300 dark:group-hover:border-indigo-700",
  },
  {
    id: "NETWORK_CONNECTION",
    label: "Network & Sync",
    icon: WifiOff,
    desc: "Slow requests, timeout, or offline problems",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    iconBg: "bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/20",
    glowColor: "group-hover:border-cyan-300 dark:group-hover:border-cyan-700",
  },
  {
    id: "BUG_UNEXPECTED",
    label: "Unexpected Error",
    icon: Bug,
    desc: "An error dialog or unhandled exception occurred",
    iconColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-500/10 dark:bg-red-500/20 border-red-500/20",
    glowColor: "group-hover:border-red-300 dark:group-hover:border-red-700",
  },
  {
    id: "SUGGESTION",
    label: "Suggestion / Feedback",
    icon: Sparkles,
    desc: "Ideas to enhance the portal experience",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20",
    glowColor: "group-hover:border-emerald-300 dark:group-hover:border-emerald-700",
  },
  {
    id: "OTHER",
    label: "Other Technical Issue",
    icon: HelpCircle,
    desc: "Anything else that needs technical attention",
    iconColor: "text-slate-600 dark:text-slate-400",
    iconBg: "bg-slate-500/10 dark:bg-slate-500/20 border-slate-500/20",
    glowColor: "group-hover:border-slate-300 dark:group-hover:border-slate-700",
  },
];

const SEVERITIES = [
  {
    id: "LOW",
    label: "Low",
    badge: "Minor aesthetic or convenience",
    activeClass: "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/30",
    dotClass: "bg-emerald-500",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    id: "MEDIUM",
    label: "Medium",
    badge: "Feature works with workaround",
    activeClass: "border-amber-500 bg-amber-500/10 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/30",
    dotClass: "bg-amber-500",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  {
    id: "HIGH",
    label: "High",
    badge: "Important feature completely blocked",
    activeClass: "border-orange-500 bg-orange-500/10 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 ring-2 ring-orange-500/30",
    dotClass: "bg-orange-500",
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30",
  },
  {
    id: "CRITICAL",
    label: "Critical",
    badge: "Unable to access portal or service",
    activeClass: "border-rose-500 bg-rose-500/10 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/30",
    dotClass: "bg-rose-500",
    color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  OPEN: { label: "Received", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30", icon: Clock },
  INVESTIGATING: { label: "Investigating", color: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30", icon: Search },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30", icon: RefreshCw },
  RESOLVED: { label: "Resolved", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30", icon: CheckCircle },
  CLOSED: { label: "Closed", color: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/30", icon: Check },
  DUPLICATE: { label: "Duplicate", color: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30", icon: AlertCircle },
};

interface MemberReport {
  reportId: string;
  category: string;
  title: string;
  description: string;
  expectedBehavior?: string | null;
  actualBehavior?: string | null;
  severity: string;
  status: string;
  pagePath?: string | null;
  pageTitle?: string | null;
  browser?: string | null;
  operatingSystem?: string | null;
  deviceType?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  screenshotUrl?: string | null;
}

export default function MemberReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state: 'submit' | 'history'
  const [activeTab, setActiveTab] = useState<"submit" | "history">("submit");

  // Diagnostics captured
  const [diagnostics, setDiagnostics] = useState<BrowserDiagnostics | null>(null);
  const [showDiagnosticsDetail, setShowDiagnosticsDetail] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Form states
  const [category, setCategory] = useState<string>("SOMETHING_IS_BROKEN");
  const [severity, setSeverity] = useState<string>("MEDIUM");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [expectedBehavior, setExpectedBehavior] = useState<string>("");
  const [actualBehavior, setActualBehavior] = useState<string>("");

  // Screenshot upload
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // History state
  const [reports, setReports] = useState<MemberReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MemberReport | null>(null);

  // Initial diagnostics capture and error digest parsing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const diag = captureBrowserDiagnostics();
      setDiagnostics(diag);

      // Pre-fill from query params if navigated from error boundary
      const source = searchParams?.get("source");
      const errorDigest = searchParams?.get("errorDigest");
      if (source === "error_boundary") {
        setCategory("BUG_UNEXPECTED");
        setSeverity("HIGH");
        setTitle(`Application Error (Digest: ${errorDigest || "system"})`);
        setDescription("An unexpected application error occurred while using the portal. Details have been captured.");
      }
    }
  }, [searchParams]);

  // Load member's reports
  const fetchMyReports = useCallback(async () => {
    if (!user) return;
    setIsLoadingReports(true);
    try {
      const res = await fetch("/api/member/reports?limit=25");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setIsLoadingReports(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchMyReports();
    }
  }, [activeTab, fetchMyReports]);

  // Handle Screenshot selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processSelectedFile(file);
  };

  const processSelectedFile = (file?: File | null) => {
    if (!file) return;

    // Check size <= 5MB
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Screenshot exceeds 5MB limit. Please choose a smaller image.");
      return;
    }

    // Check format
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSubmitError("Please upload a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    setScreenshotFile(file);
    setSubmitError(null);

    // Generate local preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshotPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setScreenshotUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setDuplicateWarning(null);

    if (!title.trim() || title.trim().length < 3) {
      setSubmitError("Please enter a descriptive problem summary (at least 3 characters).");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setSubmitError("Please describe what happened with at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalScreenshotUrl: string | null = screenshotUrl;

      // If screenshot file selected but not yet uploaded, upload first
      if (screenshotFile && !finalScreenshotUrl) {
        setIsUploadingScreenshot(true);
        const formData = new FormData();
        formData.append("file", screenshotFile);

        const uploadRes = await fetch("/api/member/reports/upload-screenshot", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalScreenshotUrl = uploadData.url;
          setScreenshotUrl(finalScreenshotUrl);
        } else {
          console.warn("Screenshot upload failed, proceeding with report submission.");
        }
        setIsUploadingScreenshot(false);
      }

      // Collect real client error context
      const errorCtx = getRecentErrorContext();
      const currentDiag = captureBrowserDiagnostics();

      const payload = {
        category,
        title: title.trim(),
        description: description.trim(),
        expectedBehavior: expectedBehavior.trim() || undefined,
        actualBehavior: actualBehavior.trim() || undefined,
        severity,
        pageUrl: currentDiag.currentUrl,
        pagePath: currentDiag.pathname,
        pageTitle: currentDiag.pageTitle,
        referrer: currentDiag.referrer,
        browser: currentDiag.browser,
        browserVersion: currentDiag.browserVersion,
        operatingSystem: currentDiag.operatingSystem,
        deviceType: currentDiag.deviceType,
        viewportWidth: currentDiag.viewportWidth,
        viewportHeight: currentDiag.viewportHeight,
        screenWidth: currentDiag.screenWidth,
        screenHeight: currentDiag.screenHeight,
        timezone: currentDiag.timezone,
        language: currentDiag.language,
        onlineStatus: currentDiag.onlineStatus,
        connectionType: currentDiag.connectionType,
        appVersion: currentDiag.appVersion,
        errorType: errorCtx.errorType || undefined,
        errorMessageSanitized: errorCtx.errorMessage || undefined,
        screenshotUrl: finalScreenshotUrl || undefined,
      };

      const res = await fetch("/api/member/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report. Please try again.");
      }

      if (data.isDuplicate) {
        setDuplicateWarning(data.duplicateWarning);
      }

      setSubmittedReportId(data.reportId || data.report?.reportId);
      // Reset form fields
      setTitle("");
      setDescription("");
      setExpectedBehavior("");
      setActualBehavior("");
      removeScreenshot();
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
      setIsUploadingScreenshot(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-50 dark:from-slate-950 dark:via-slate-900/80 dark:to-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb & Quality Assurance Pill */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/member")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Member Portal</span>
          </button>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span>Support & Quality Assurance</span>
          </div>
        </div>

        {/* Hero Header Card with Royal Gradient Glassmorphism */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-200/60 dark:border-purple-500/20 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 dark:from-slate-900/90 dark:via-purple-950/20 dark:to-slate-900/90 p-6 sm:p-8 shadow-xl shadow-purple-950/5">
          {/* Subtle Ambient Background Orbs */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-2xl shadow-lg shadow-rose-500/25 shrink-0">
                <Bug className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Report a Problem
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                  Found something that isn't working correctly? Tell us what happened and our technical team will investigate it.
                </p>
              </div>
            </div>

            {/* Direct Support Contact Button with Live Pulse */}
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 backdrop-blur-md">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-slate-500 dark:text-slate-400">Urgent Support:</span>
              <a
                href="tel:+919505288171"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 font-bold hover:underline"
              >
                +91 9505288171
              </a>
            </div>
          </div>

          {/* Segmented Pill Navigation Tabs */}
          <div className="relative z-10 flex border-b border-slate-200/80 dark:border-slate-800 mt-8 -mb-2 gap-3">
            <button
              onClick={() => setActiveTab("submit")}
              className={`pb-3.5 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "submit"
                  ? "border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Submit Report</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-3.5 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "history"
                  ? "border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>My Submitted Reports</span>
              {reports.length > 0 && (
                <span className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {reports.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: SUBMIT REPORT */}
        {activeTab === "submit" && (
          <div className="space-y-6">

            {/* Submission Success Banner */}
            {submittedReportId && (
              <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-3xl p-6 sm:p-7 text-emerald-950 dark:text-emerald-200 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                      Thank you! Your report has been logged.
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Our ministry technical team has received your diagnostics and issue description. We are on it!
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-bold px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-xl border border-emerald-300 dark:border-emerald-700">
                        Reference ID: {submittedReportId}
                      </span>
                      <button
                        onClick={() => {
                          setSubmittedReportId(null);
                          setActiveTab("history");
                        }}
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-900 dark:hover:text-emerald-100"
                      >
                        Track Status in My Reports &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Duplicate Notice Banner */}
            {duplicateWarning && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Notice:</span> {duplicateWarning}
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-rose-900 dark:text-rose-200 flex items-center gap-3 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="font-medium">{submitError}</span>
              </div>
            )}

            {/* Main Interactive Form Card */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-9 space-y-8 shadow-xl shadow-slate-900/5">
              
              {/* SECTION 1: Issue Classification */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Step 1</span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      What kind of issue are you experiencing? <span className="text-rose-500">*</span>
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">Select one</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ISSUE_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`group relative p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all duration-200 ${
                          isSelected
                            ? "border-purple-600 dark:border-purple-400 bg-purple-50/60 dark:bg-purple-950/40 ring-2 ring-purple-600/20 shadow-md shadow-purple-950/5 scale-[1.01]"
                            : `border-slate-200/90 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 hover:bg-slate-50/80 dark:hover:bg-slate-850 bg-slate-50/40 dark:bg-slate-900/40`
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl border shrink-0 transition-transform group-hover:scale-110 ${cat.iconBg}`}>
                          <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-bold leading-tight ${isSelected ? "text-purple-950 dark:text-purple-200" : "text-slate-900 dark:text-slate-100"}`}>
                            {cat.label}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {cat.desc}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: Impact / Severity Rating */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Step 2</span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      How severely does this impact your use of the portal? <span className="text-rose-500">*</span>
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">Choose impact level</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SEVERITIES.map((sev) => {
                    const isSelected = severity === sev.id;
                    return (
                      <button
                        key={sev.id}
                        type="button"
                        onClick={() => setSeverity(sev.id)}
                        className={`p-4 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center ${
                          isSelected
                            ? sev.activeClass
                            : "border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-2 h-2 rounded-full ${sev.dotClass}`} />
                          <span className="text-sm font-extrabold">{sev.label}</span>
                        </div>
                        <div className="text-[11px] opacity-75 leading-tight">
                          {sev.badge}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: Problem Details */}
              <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Step 3</span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Tell us what happened
                  </h2>
                </div>

                {/* Title Input */}
                <div className="space-y-1.5">
                  <label htmlFor="issue-title" className="block text-sm font-bold text-slate-900 dark:text-slate-200">
                    Problem Summary / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="issue-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 'Giving page donation form won't open after clicking Submit'"
                    maxLength={150}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                  <div className="flex justify-between text-xs text-slate-400 px-1">
                    <span>Be specific and concise</span>
                    <span>{title.length}/150</span>
                  </div>
                </div>

                {/* Description Input */}
                <div className="space-y-1.5">
                  <label htmlFor="issue-description" className="block text-sm font-bold text-slate-900 dark:text-slate-200">
                    What happened? <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="issue-description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe the steps you took, what happened, and any error message you noticed on screen..."
                    maxLength={3000}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all leading-relaxed"
                  />
                  <div className="flex justify-between text-xs text-slate-400 px-1">
                    <span>Include any details you remember</span>
                    <span>{description.length}/3000</span>
                  </div>
                </div>

                {/* Optional: Expandable Expected vs Actual Behavior Accordion */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 p-4">
                  <button
                    type="button"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span>Additional Context: Expected vs Actual Behavior (Optional)</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showOptionalFields ? "rotate-180" : ""}`} />
                  </button>

                  {showOptionalFields && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800">
                      <div className="space-y-1">
                        <label htmlFor="expected-behavior" className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                          What did you expect to happen?
                        </label>
                        <input
                          id="expected-behavior"
                          type="text"
                          value={expectedBehavior}
                          onChange={(e) => setExpectedBehavior(e.target.value)}
                          placeholder="e.g. Receive confirmation email"
                          maxLength={500}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="actual-behavior" className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                          What actually happened instead?
                        </label>
                        <input
                          id="actual-behavior"
                          type="text"
                          value={actualBehavior}
                          onChange={(e) => setActualBehavior(e.target.value)}
                          placeholder="e.g. Screen remained loading continuously"
                          maxLength={500}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Screenshot Attachment Dropzone */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-slate-900 dark:text-slate-200">
                      Attach a Screenshot (Optional)
                    </label>
                    <span className="text-xs text-slate-400">JPEG, PNG, WebP up to 5MB</span>
                  </div>

                  {screenshotPreview ? (
                    <div className="relative inline-block border-2 border-purple-500/30 rounded-2xl overflow-hidden p-3 bg-purple-50/30 dark:bg-purple-950/20 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={screenshotPreview}
                        alt="Screenshot preview"
                        className="max-h-56 max-w-full rounded-xl object-contain shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={removeScreenshot}
                        className="absolute top-4 right-4 p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                        title="Remove screenshot"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        processSelectedFile(file);
                      }}
                      className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                        isDragging
                          ? "border-purple-500 bg-purple-500/10 scale-[1.01]"
                          : "border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-purple-50/20 dark:hover:bg-purple-950/20"
                      }`}
                    >
                      <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl mb-2.5 shadow-sm">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Click to upload an image screenshot
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Drag and drop or browse from your computer or phone
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Real Browser Diagnostics Card (Transparency Widget) */}
                <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Real Device Diagnostics (Captured Automatically)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDiagnosticsDetail(!showDiagnosticsDetail)}
                      className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1"
                    >
                      {showDiagnosticsDetail ? "Hide Details" : "View Captured Data"}
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    To diagnose and solve issues quickly, we include real browser technical attributes with your report. Sensitive information like passwords and tokens are never captured.
                  </p>

                  {showDiagnosticsDetail && diagnostics && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Browser</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold">{diagnostics.browser} {diagnostics.browserVersion || ""}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Operating System</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold">{diagnostics.operatingSystem}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Device Type</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold capitalize">{diagnostics.deviceType}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Viewport</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold">{diagnostics.viewportWidth} × {diagnostics.viewportHeight}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Timezone</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold">{diagnostics.timezone}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Connection</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold">{diagnostics.connectionType || (diagnostics.onlineStatus ? "Online" : "Offline")}</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Form Action Buttons with Radiant Gradient */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => router.push("/member")}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingScreenshot}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-700 hover:via-indigo-700 hover:to-violet-700 text-white text-sm font-bold shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting || isUploadingScreenshot ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Report...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Submit Problem Report</span>
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Direct Contact Support Card */}
            <div className="bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 border border-purple-200/60 dark:border-purple-500/20 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-purple-600 text-white rounded-2xl shrink-0 shadow-md shadow-purple-600/20">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Need Immediate Help with your Church Account?
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    You can contact our lead support coordinator directly by email or phone.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold shrink-0">
                <a
                  href="mailto:codewithrahul3@gmail.com?subject=KCM%20Portal%20Support%20Request"
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  Email Support
                </a>
                <a
                  href="tel:+919505288171"
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/25 transition-all"
                >
                  Call +91 9505288171
                </a>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MY SUBMITTED REPORTS */}
        {activeTab === "history" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Your Submitted Reports ({reports.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Track the real-time investigation and resolution status of your reported issues.
                </p>
              </div>
              <button
                onClick={fetchMyReports}
                disabled={isLoadingReports}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-purple-600 dark:text-purple-400 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1.5 font-bold shadow-sm transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReports ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            {isLoadingReports ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-14 text-center shadow-sm">
                <Loader2 className="w-9 h-9 animate-spin mx-auto text-purple-600 mb-3" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Loading your submitted reports...</p>
                <p className="text-xs text-slate-400 mt-1">Connecting to ministry database</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-14 text-center space-y-3 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No issues reported</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  You haven't submitted any technical reports yet. If you encounter any problems with the portal, report it here.
                </p>
                <button
                  onClick={() => setActiveTab("submit")}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all"
                >
                  <Bug className="w-4 h-4" />
                  <span>Submit a Report</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => {
                  const statusInfo = STATUS_CONFIG[rep.status] || {
                    label: rep.status,
                    color: "bg-slate-100 text-slate-700",
                    icon: Clock,
                  };
                  const StatusIcon = statusInfo.icon;
                  const severityConfig = SEVERITIES.find((s) => s.id === rep.severity);

                  return (
                    <div
                      key={rep.reportId}
                      onClick={() => setSelectedReport(rep)}
                      className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
                            {rep.reportId}
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1.5 ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                          {severityConfig && (
                            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${severityConfig.color}`}>
                              {severityConfig.label}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {rep.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {rep.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-xs text-slate-400">
                        <div className="text-right">
                          <div className="text-slate-600 dark:text-slate-300 font-medium">
                            {new Date(rep.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(rep.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/40 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Member Safe Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {selectedReport.reportId}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${STATUS_CONFIG[selectedReport.status]?.color || ""}`}>
                      {STATUS_CONFIG[selectedReport.status]?.label || selectedReport.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2.5">
                    {selectedReport.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">Description</span>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedReport.description}
                  </div>
                </div>

                {(selectedReport.expectedBehavior || selectedReport.actualBehavior) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedReport.expectedBehavior && (
                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">Expected Behavior</span>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300">
                          {selectedReport.expectedBehavior}
                        </div>
                      </div>
                    )}
                    {selectedReport.actualBehavior && (
                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">Actual Behavior</span>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300">
                          {selectedReport.actualBehavior}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedReport.screenshotUrl && (
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">Attached Screenshot</span>
                    <div className="relative border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden p-2 bg-slate-50 dark:bg-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedReport.screenshotUrl}
                        alt="Issue Screenshot"
                        className="max-h-60 max-w-full rounded-xl object-contain mx-auto"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Submitted on {new Date(selectedReport.createdAt).toLocaleString()}</span>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
