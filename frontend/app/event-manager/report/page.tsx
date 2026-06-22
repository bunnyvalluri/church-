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
  FileText
} from "lucide-react";
import Link from "next/link";

interface Branch {
  id: string;
  name: string;
}

export default function FieldReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getIdToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attendance, setAttendance] = useState("");
  const [offering, setOffering] = useState("");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [volunteerNames, setVolunteerNames] = useState("");
  const [gpsLocation, setGpsLocation] = useState<string | null>(null);
  
  // Media states
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  
  // Page status states
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch("/api/field-volunteer/branches");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
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

  // Retrieve current GPS location
  const getGpsCoordinates = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        setGpsLocation(coords);
        setGpsLoading(false);
      },
      (error) => {
        console.warn("[GPS] Geolocation error:", error.message);
        alert(`Failed to obtain GPS coordinates: ${error.message}`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Add camera captured image
  const handlePhotoCapture = (base64: string) => {
    setCapturedImages((prev) => [...prev, base64]);
    setShowCamera(false);
  };

  // Delete captured photo preview
  const removePhoto = (index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle uploading of existing images from file library
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Max size is 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
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
            setCapturedImages((prev) => [...prev, base64]);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
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

    const reportPayload = {
      branchId: selectedBranchId,
      branchName,
      title,
      description,
      attendanceCount: parseInt(attendance) || 0,
      offeringAmount: parseFloat(offering) || 0,
      reportDate: new Date(reportDate).toISOString(),
      gpsLocation,
      volunteerNames: volunteersList,
      images: capturedImages, // array of base64 strings
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-white transition-colors duration-300 flex flex-col pb-10">
      
      {/* Top Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-slate-200/85 dark:border-white/[0.06] px-4 py-4 flex items-center gap-3">
        <Link
          href="/event-manager"
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-sm font-black uppercase tracking-wider">Activity Report</h1>
          <p className="text-[10px] text-slate-400 dark:text-white/30 font-semibold uppercase tracking-widest mt-0.5">Submit branch data</p>
        </div>
      </header>

      {/* Camera Capture Modal Layer */}
      {showCamera && (
        <CameraCapture
          onCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Main Form container */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-5">
          
          {submitError && (
            <div className="bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800/30 p-4 rounded-2xl text-xs font-semibold text-red-600 dark:text-red-400">
              {submitError}
            </div>
          )}

          {/* Branch Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Branch Location</label>
            {isLoadingBranches ? (
              <div className="h-10 bg-slate-100 dark:bg-white/5 animate-pulse rounded-xl" />
            ) : (
              <select
                required
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="dark:bg-slate-900">{b.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Event Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Event / Activity Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sunday Service, Outreach Prayer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          {/* Date & Attendance & Offerings row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Report Date</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">People Count</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Users className="w-4 h-4" /></div>
                <input
                  type="number"
                  placeholder="0"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Offerings */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Offering Amount (INR)</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">₹</div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={offering}
                  onChange={(e) => setOffering(e.target.value)}
                  className="w-full h-11 pl-8 pr-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>
            </div>

            {/* GPS coordinates */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">GPS Geolocation</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={getGpsCoordinates}
                  disabled={gpsLoading}
                  className="px-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-white/60 flex items-center justify-center shrink-0 transition-all"
                  title="Capture GPS Coordinates"
                >
                  {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin text-pink-500" /> : <MapPin className="w-4 h-4" />}
                </button>
                <input
                  type="text"
                  placeholder="Tap pin to fetch"
                  value={gpsLocation || ""}
                  readOnly
                  className="w-full h-11 px-3 rounded-xl bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white/40 text-xs focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
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
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 resize-none"
            />
          </div>

          {/* Volunteer Names */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">Volunteers Attended (Comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. John Doe, Sarah Smith"
              value={volunteerNames}
              onChange={(e) => setVolunteerNames(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          {/* Photo Captures Box */}
          <div className="space-y-2 border-t border-slate-100 dark:border-white/5 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">Images Captured ({capturedImages.length})</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all text-slate-600 dark:text-white/70"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Upload
                </button>

                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Capture
                </button>
              </div>
            </div>

            {capturedImages.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 dark:text-white/20">
                <Camera className="w-6 h-6 mx-auto mb-1.5" />
                <p className="text-[11px] font-semibold">No pictures captured yet</p>
                <p className="text-[9px] mt-0.5">Capture snaps directly from the field camera.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {capturedImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group">
                    <img src={img} alt="Snapshot Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 rounded-lg text-white opacity-90 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-pink-600 hover:bg-pink-500 text-white rounded-xl flex items-center justify-center font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting report...
              </>
            ) : (
              "Submit Field Report"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
