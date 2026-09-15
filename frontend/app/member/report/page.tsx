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
} from "lucide-react";
import { captureBrowserDiagnostics, BrowserDiagnostics } from "@/lib/issueDiagnostics";
import { getRecentErrorContext } from "@/lib/clientErrorCollector";

// Supported Categories
const ISSUE_CATEGORIES = [
  { id: "SOMETHING_IS_BROKEN", label: "Something is Broken", icon: AlertTriangle, desc: "A button, form, or action isn't responding" },
  { id: "PAGE_NOT_LOADING", label: "Page Not Loading", icon: Globe, desc: "Page hangs, blank screen, or fails to fetch" },
  { id: "LOGIN_ACCOUNT", label: "Login & Account", icon: ShieldAlert, desc: "Trouble signing in, profile, or session expired" },
  { id: "MOBILE_RESPONSIVE", label: "Mobile Display Issue", icon: Smartphone, desc: "Content cut off or overlapping on phones/tablets" },
  { id: "WEBSITE_DISPLAY", label: "Display & Styling", icon: Monitor, desc: "Visual glitches, colors, or misaligned layouts" },
  { id: "NETWORK_CONNECTION", label: "Network & Sync", icon: WifiOff, desc: "Slow requests, timeout, or offline problems" },
  { id: "BUG_UNEXPECTED", label: "Unexpected Error", icon: Bug, desc: "An error dialog or unhandled exception occurred" },
  { id: "SUGGESTION", label: "Suggestion / Feedback", icon: Sparkles, desc: "Ideas to enhance the portal experience" },
  { id: "OTHER", label: "Other Technical Issue", icon: HelpCircle, desc: "Anything else that needs technical attention" },
];

const SEVERITIES = [
  { id: "LOW", label: "Low", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", badge: "Minor aesthetic or convenience" },
  { id: "MEDIUM", label: "Medium", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30", badge: "Feature works with workaround" },
  { id: "HIGH", label: "High", color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30", badge: "Important feature completely blocked" },
  { id: "CRITICAL", label: "Critical", color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30", badge: "Unable to access portal or service" },
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

  // Handle screenshot selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Screenshot must be under 5MB.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Only JPG, PNG, and WebP images are supported.");
      return;
    }

    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = () => setScreenshotPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setScreenshotUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit report handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setDuplicateWarning(null);

    if (!title.trim() || title.trim().length < 5) {
      setSubmitError("Please enter a descriptive title (at least 5 characters).");
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      setSubmitError("Please explain what happened in more detail (at least 15 characters).");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalScreenshotUrl = screenshotUrl;

      // Upload screenshot if file is selected
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

      setSubmittedReportId(data.report.reportId);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/member")}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Member Portal
          </button>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Support & Quality Assurance
          </span>
        </div>

        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                  <Bug className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Report a Problem</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Found something that isn't working correctly? Tell us what happened and our technical team will investigate it.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Support Contact Button */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>Urgent Support:</span>
              <a href="tel:+919505288171" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                +91 9505288171
              </a>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mt-6 -mb-2 gap-4">
            <button
              onClick={() => setActiveTab("submit")}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "submit"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <FileText className="w-4 h-4" />
              Submit Report
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "history"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <Clock className="w-4 h-4" />
              My Submitted Reports
              {reports.length > 0 && (
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
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
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-emerald-900 dark:text-emerald-200 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-lg">Thank you! Your report has been logged.</h3>
                    <p className="text-sm mt-1 text-emerald-800 dark:text-emerald-300">
                      Our ministry technical team has received your diagnostics and issue description.
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900 rounded-lg border border-emerald-300 dark:border-emerald-700">
                        Reference ID: {submittedReportId}
                      </span>
                      <button
                        onClick={() => {
                          setSubmittedReportId(null);
                          setActiveTab("history");
                        }}
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-900"
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
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Notice:</span> {duplicateWarning}
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 text-rose-900 dark:text-rose-200 flex items-center gap-3 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Report Form Card */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              
              {/* Category Selector */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  What kind of issue are you experiencing? <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {ISSUE_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600/20"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"
                        }`}
                      >
                        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`} />
                        <div>
                          <div className={`text-sm font-semibold ${isSelected ? "text-indigo-900 dark:text-indigo-200" : "text-slate-800 dark:text-slate-200"}`}>
                            {cat.label}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {cat.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity Selector */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  How severely does this impact your use of the portal? <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SEVERITIES.map((sev) => {
                    const isSelected = severity === sev.id;
                    return (
                      <button
                        key={sev.id}
                        type="button"
                        onClick={() => setSeverity(sev.id)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? `${sev.color} ring-2 ring-indigo-500/30 font-bold border-current`
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-sm">{sev.label}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{sev.badge}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label htmlFor="issue-title" className="block text-sm font-semibold mb-1">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Be specific and concise</span>
                  <span>{title.length}/150</span>
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label htmlFor="issue-description" className="block text-sm font-semibold mb-1">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Include any details you remember</span>
                  <span>{description.length}/3000</span>
                </div>
              </div>

              {/* Optional: Expected vs Actual Behavior */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expected-behavior" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    What did you expect to happen? (Optional)
                  </label>
                  <input
                    id="expected-behavior"
                    type="text"
                    value={expectedBehavior}
                    onChange={(e) => setExpectedBehavior(e.target.value)}
                    placeholder="e.g. Receive confirmation email"
                    maxLength={500}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="actual-behavior" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    What actually happened instead? (Optional)
                  </label>
                  <input
                    id="actual-behavior"
                    type="text"
                    value={actualBehavior}
                    onChange={(e) => setActualBehavior(e.target.value)}
                    placeholder="e.g. Screen remained loading continuously"
                    maxLength={500}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Optional: Screenshot Attachment */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Attach a Screenshot (Optional)
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Helps our engineers identify the visual bug quickly (JPEG, PNG, WebP up to 5MB).
                </p>

                {screenshotPreview ? (
                  <div className="relative inline-block border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden p-2 bg-slate-50 dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenshotPreview}
                      alt="Screenshot preview"
                      className="max-h-48 max-w-full rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="absolute top-3 right-3 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow transition-colors"
                      title="Remove screenshot"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/50"
                  >
                    <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1.5" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Click to upload an image screenshot
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, or WebP up to 5MB</p>
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

              {/* Real Browser Diagnostics Card (Transparency) */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Real Device Diagnostics (Captured Automatically)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDiagnosticsDetail(!showDiagnosticsDetail)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
                  >
                    {showDiagnosticsDetail ? "Hide Details" : "View Captured Data"}
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  To diagnose and solve issues quickly, we include real browser technical attributes with your report. Sensitive information like passwords and tokens are never captured.
                </p>

                {showDiagnosticsDetail && diagnostics && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Browser</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{diagnostics.browser} {diagnostics.browserVersion || ""}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Operating System</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{diagnostics.operatingSystem}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Device Type</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold capitalize">{diagnostics.deviceType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Viewport</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{diagnostics.viewportWidth} × {diagnostics.viewportHeight}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Timezone</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{diagnostics.timezone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Connection</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{diagnostics.connectionType || (diagnostics.onlineStatus ? "Online" : "Offline")}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/member")}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingScreenshot}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

            {/* Direct Contact Assistance Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Need Immediate Help with your Church Account?</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    You can contact our lead support coordinator directly by email or phone.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <a
                  href="mailto:codewithrahul3@gmail.com?subject=KCM%20Portal%20Support%20Request"
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  Email Support
                </a>
                <a
                  href="tel:+919505288171"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  Call +91 9505288171
                </a>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MY SUBMITTED REPORTS */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Your Submitted Reports ({reports.length})
              </h2>
              <button
                onClick={fetchMyReports}
                disabled={isLoadingReports}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReports ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {isLoadingReports ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
                <p className="text-sm text-slate-500">Loading your submitted reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <CheckCircle className="w-10 h-10 mx-auto text-emerald-500" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No issues reported</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  You haven't submitted any technical reports yet. If you encounter any problems with the portal, report it here.
                </p>
                <button
                  onClick={() => setActiveTab("submit")}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  <Bug className="w-4 h-4" />
                  Submit a Report
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
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-5 cursor-pointer transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {rep.reportId}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                          {severityConfig && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${severityConfig.color}`}>
                              {severityConfig.label}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {rep.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {rep.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-xs text-slate-400">
                        <div className="text-right">
                          <div className="text-slate-500 dark:text-slate-400">
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
                        <ChevronRight className="w-5 h-5 text-slate-400" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {selectedReport.reportId}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${STATUS_CONFIG[selectedReport.status]?.color || ""}`}>
                      {STATUS_CONFIG[selectedReport.status]?.label || selectedReport.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">
                    {selectedReport.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Description</span>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {selectedReport.description}
                  </div>
                </div>

                {(selectedReport.expectedBehavior || selectedReport.actualBehavior) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedReport.expectedBehavior && (
                      <div>
                        <span className="text-xs font-semibold text-slate-400 block mb-1">Expected Behavior</span>
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                          {selectedReport.expectedBehavior}
                        </div>
                      </div>
                    )}
                    {selectedReport.actualBehavior && (
                      <div>
                        <span className="text-xs font-semibold text-slate-400 block mb-1">Actual Behavior</span>
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                          {selectedReport.actualBehavior}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedReport.screenshotUrl && (
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Screenshot Attached</span>
                    <a
                      href={selectedReport.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedReport.screenshotUrl}
                        alt="Report screenshot"
                        className="max-h-60 rounded-lg object-contain"
                      />
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Submitted At</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Last Updated</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {new Date(selectedReport.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  {selectedReport.resolvedAt && (
                    <div>
                      <span className="text-emerald-500 block text-[10px] font-semibold">Resolved On</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {new Date(selectedReport.resolvedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
