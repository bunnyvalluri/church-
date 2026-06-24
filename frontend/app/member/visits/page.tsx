"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { 
  Calendar, Clock, User, Mail, Phone, Upload, Camera, X, Check, 
  Loader2, AlertCircle, Sparkles, Shield, Bookmark, ArrowRight, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Client-side image compressor (canvas, 300x300, 75% JPEG)
const compressImage = (file: File, maxPx = 300): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (ev) => {
      const img = new window.Image();
      img.src = ev.target?.result as string;
      img.onload = () => {
        const scale = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.75));
        } else {
          resolve(ev.target?.result as string);
        }
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

export default function MemberVisitsPage() {
  const { user, status, mounted } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  // Protect client route
  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [mounted, status, router]);

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 AM");
  const [purpose, setPurpose] = useState("Sunday Worship");
  const [phone, setPhone] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const triggerToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch past visits
  const fetchVisits = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/member/visits?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setVisits(data.visits || []);
      }
    } catch (err) {
      console.error("Failed to load visit requests history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (status === "authenticated" && user?.email) {
      fetchVisits();
    }
  }, [status, user?.email, fetchVisits]);

  // Image upload selection handler
  const handlePhotoSelect = useCallback(async (file: File) => {
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validMimes.includes(file.type)) {
      triggerToast("Invalid format. Please upload JPG, PNG or WebP.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      triggerToast("File size too large. Max 5MB.", "error");
      return;
    }

    try {
      const compressed = await compressImage(file);
      setPhotoPreview(compressed);
    } catch {
      triggerToast("Failed to process photo.", "error");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePhotoSelect(file);
  }, [handlePhotoSelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !timeSlot || !purpose) {
      triggerToast("Please fill in all required fields.", "error");
      return;
    }
    if (!photoPreview) {
      triggerToast("Please upload a passport-size photo.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/member/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          name: user?.name || "Church Believer",
          email: user?.email,
          phone: phone || null,
          time: `${date} at ${timeSlot}`,
          avatar: photoPreview,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("Visit request submitted successfully!", "success");
        setDate("");
        setPhone("");
        setPhotoPreview(null);
        fetchVisits(); // refresh lists
      } else {
        throw new Error(data.error || "Failed to submit request.");
      }
    } catch (err: any) {
      triggerToast(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || status === "loading" || status === "unauthenticated") {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Toast alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4.5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold border max-w-xs ${
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

      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121324] border border-gray-100 dark:border-white/[0.04] shadow-sm">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/30 text-violet-650 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30 text-[10px] font-extrabold uppercase tracking-wider">
            <Bookmark className="w-3.5 h-3.5" />
            Plan A Visit
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            Church Visit Registration
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium italic border-l-2 border-violet-500 pl-3 py-0.5">
            "I was glad when they said unto me, Let us go into the house of the Lord." — Psalm 122:1
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* Visit Request Form (Left Column) */}
        <div className="lg:col-span-3 bg-white dark:bg-[#121324] rounded-3xl border border-gray-100 dark:border-white/[0.04] shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4.5 border-b border-gray-100 dark:border-white/[0.04] bg-violet-50/20 dark:bg-violet-950/10">
            <Calendar className="w-4.5 h-4.5 text-[#6366F1]" />
            <h3 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-wider">Register a Visit</h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Name (readonly) */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Visitor Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={user?.name || ""} 
                    disabled
                    className="w-full py-2.5 pl-10 pr-3.5 rounded-xl border border-gray-150 dark:border-white/[0.06] bg-gray-150 dark:bg-white/[0.02] text-gray-400 dark:text-gray-500 cursor-not-allowed text-xs font-bold"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Email (readonly) */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={user?.email || ""} 
                    disabled
                    className="w-full py-2.5 pl-10 pr-3.5 rounded-xl border border-gray-150 dark:border-white/[0.06] bg-gray-150 dark:bg-white/[0.02] text-gray-400 dark:text-gray-500 cursor-not-allowed text-xs font-bold"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Date selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Visit Date *</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full py-2.5 pl-10 pr-3.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.01] text-gray-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:outline-none transition-all"
                  />
                  <Calendar className="w-4 h-4 text-[#6366F1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Time selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Service / Time *</label>
                <div className="relative">
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-8 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.01] text-gray-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="10:00 AM">Sunday English Service (10:00 AM)</option>
                    <option value="12:30 PM">Sunday Telugu Service (12:30 PM)</option>
                    <option value="06:00 PM">Sunday Youth Worship (06:00 PM)</option>
                    <option value="07:30 PM">Wednesday Mid-week Prayer (07:30 PM)</option>
                    <option value="11:00 AM">Special Weekday Visit (11:00 AM)</option>
                  </select>
                  <Clock className="w-4 h-4 text-[#6366F1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Purpose */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Visit Purpose *</label>
                <div className="relative">
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-8 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.01] text-gray-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="Sunday Worship">Regular Worship / Service</option>
                    <option value="Become a Member">Become a Church Member</option>
                    <option value="Personal Counsel">Meeting Pastor / Counseling</option>
                    <option value="NGO Volunteering">NGO / Charity Service Visit</option>
                    <option value="Other">Other / Special Request</option>
                  </select>
                  <Shield className="w-4 h-4 text-[#6366F1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Phone number */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Contact Phone</label>
                <div className="relative">
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full py-2.5 pl-10 pr-3.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.01] text-gray-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:outline-none transition-all"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Passport Photo Upload Zone */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Passport Photo *
              </label>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !photoPreview && fileInputRef.current?.click()}
                className={`relative mx-auto flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                  photoPreview
                    ? "border-transparent cursor-default bg-transparent"
                    : isDragOver
                    ? "border-[#6366F1] bg-violet-500/5 scale-[1.01]"
                    : "border-gray-200 dark:border-white/[0.08] hover:border-[#6366F1]/50 hover:bg-[#6366F1]/5"
                }`}
                style={{ width: 170, height: 210 }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoSelect(file);
                  }}
                />

                <AnimatePresence mode="wait">
                  {photoPreview ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative w-full h-full rounded-2xl overflow-hidden group shadow-lg"
                    >
                      <Image src={photoPreview} alt="Passport preview" fill unoptimized className="object-cover" />
                      
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                      >
                        <Camera className="w-5.5 h-5.5 text-white" />
                        <span className="text-white text-[10px] font-black uppercase">Change Photo</span>
                      </button>
                      <div className="absolute inset-0 ring-4 ring-[#6366F1]/30 rounded-2xl pointer-events-none" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-2 px-3 text-center select-none"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                        <Upload className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-gray-700 dark:text-gray-300">Upload Photo</p>
                        <p className="text-[9px] text-gray-400 dark:text-gray-505 mt-0.5">Drag & drop here</p>
                      </div>
                      <span className="text-[9px] font-black text-[#6366F1] uppercase tracking-wider mt-1.5">
                        Passport Size
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                JPG · PNG · WebP · Max 5MB. Will be verified by security gateways.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-650 to-indigo-650 hover:from-violet-600 hover:to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Registration...
                </>
              ) : (
                <>
                  Submit Visit Request <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Visits History (Right Column) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
            My Visit History
          </h2>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {loadingHistory ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-[#121324] rounded-3xl border border-gray-150 dark:border-white/[0.04] p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-white/5 rounded-2xl" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-24 bg-gray-200 dark:bg-white/5 rounded-md" />
                      <div className="h-3 w-32 bg-gray-150 dark:bg-white/[0.03] rounded-md" />
                    </div>
                  </div>
                  <div className="h-0.5 bg-gray-100 dark:bg-white/5" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-white/5 rounded-md" />
                </div>
              ))
            ) : visits.length === 0 ? (
              <div className="bg-white dark:bg-[#121324] rounded-3xl border border-dashed border-gray-200 dark:border-white/[0.06] p-8 text-center flex flex-col items-center justify-center min-h-[220px] gap-3">
                <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                <div>
                  <h4 className="font-black text-sm text-gray-900 dark:text-white">No Visits Registered</h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-normal max-w-xs mx-auto">
                    You haven't scheduled any church visits yet. Use the form to plan your next visit!
                  </p>
                </div>
              </div>
            ) : (
              visits.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white dark:bg-[#121324] rounded-3xl border border-gray-100 dark:border-white/[0.04] p-5 shadow-sm space-y-3 hover:shadow-md hover:scale-[1.005] transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Passport Photo Thumbnail */}
                    <div className="relative w-12 h-15 rounded-xl overflow-hidden border border-gray-150 dark:border-white/10 shrink-0 bg-gray-50 dark:bg-white/5">
                      {item.avatar ? (
                        <Image src={item.avatar} alt="Passport thumbnail" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-gray-905 dark:text-white text-xs truncate">
                          {item.time.split(" at ")[0]}
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                          item.status === "Approved" 
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" 
                            : item.status === "Rejected" 
                            ? "bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30"
                            : "bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-450 border-amber-100 dark:border-amber-900/30"
                        }`}>
                          {item.status === "Approved" ? "Confirmed" : item.status === "Rejected" ? "Declined" : "Pending"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-[10px] text-gray-405 dark:text-gray-400 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
                        <span>{item.time.split(" at ")[1] || "10:00 AM"}</span>
                      </div>
                      
                      <div className="text-[10px] text-gray-400">
                        Purpose: <span className="font-bold text-gray-500 dark:text-gray-305">{item.type || "Visit"} ({item.time.includes("Sunday") ? "Worship" : "Special"})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[9px] text-gray-400">
                    <span>Registered on</span>
                    <span className="font-bold">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
