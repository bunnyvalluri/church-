"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";
import {
  User, Phone, MapPin, Check, Loader2, Save,
  RefreshCw, Shield, Star, Camera, Wifi, WifiOff,
  Mail, Edit3, CheckCircle2, AlertCircle, Info, Lock, RotateCcw, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ProfileSnapshot {
  name: string;
  phone: string;
  address: string;
  image: string;
  role: string;
  createdAt: string;
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality jpeg
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AdminProfile() {
  const { user, status, refreshUser, updateUser } = useAuth();
  const { language } = useLanguage();

  const t = adminTranslations[language as keyof typeof adminTranslations] || adminTranslations.en;
  const tp = (t as any).profile || adminTranslations.en.profile;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [joinedAt, setJoinedAt] = useState("");
  const [image, setImage] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const original = useRef<ProfileSnapshot>({ name: "", phone: "", address: "", image: "", role: "ADMIN", createdAt: "" });
  const syncTimer = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const loadProfile = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    if (!silent) setSyncing(true);
    try {
      const res = await fetch(`/api/admin/users`);
      const data = await res.json();
      if (res.ok && data.success) {
        const p = data.users.find((u: any) => u.id === user?.uid || u.uid === user?.uid);
        if (p) {
          const snap: ProfileSnapshot = {
            name: p.name || user?.name || "",
            phone: p.phone || "",
            address: p.address || "",
            image: p.image || user?.image || "", // ensure never null
            role: p.role || user?.role || "ADMIN",
            createdAt: p.createdAt || "",
          };
          setName(snap.name);
          setPhone(snap.phone);
          setAddress(snap.address);
          setRole(snap.role);
          setJoinedAt(snap.createdAt);
          setImage(snap.image || ""); // guard null from DB
          original.current = snap;
          setHasChanges(false);
        }
      }
      setLastSynced(new Date());
    } catch {
      if (!silent) showToast(tp.tryAgain, "error");
    } finally {
      setSyncing(false);
    }
  }, [user?.uid, user?.name, user?.image, user?.role, tp.tryAgain]);

  const handleSave = useCallback(async (e?: React.FormEvent, currentImage?: string) => {
    if (e) e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    setSaveState("saving");
    const imageToSave = currentImage !== undefined ? currentImage : image;
    try {
      const res = await fetch("/api/member/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid, name, phone, address, image: imageToSave }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        original.current = { ...original.current, name, phone, address, image: imageToSave };
        setHasChanges(false);
        setSaveState("saved");
        setLastSynced(new Date());
        showToast(tp.saved, "success");
        if (updateUser) {
          updateUser({ name, image: imageToSave });
        }
        if (refreshUser) {
          await refreshUser();
        }
        setTimeout(() => setSaveState("idle"), 3000);
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (err: any) {
      setSaveState("error");
      showToast(err.message || tp.tryAgain, "error");
      setTimeout(() => setSaveState("idle"), 3000);
    } finally {
      setSaving(false);
    }
  }, [user?.uid, name, phone, address, image, refreshUser, updateUser, tp.saved, tp.tryAgain]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
      await handleSave(undefined, compressed);
    } catch (err) {
      showToast(tp.tryAgain, "error");
    } finally {
      setPhotoUploading(false);
    }
  };

  const resetToOriginal = () => {
    setName(original.current.name);
    setPhone(original.current.phone);
    setAddress(original.current.address);
    setImage(original.current.image);
    setHasChanges(false);
    showToast(tp.originalRestored, "success");
  };

  useEffect(() => {
    let activeSyncTimer: NodeJS.Timeout | null = null;
    if (status === "authenticated" && user?.uid) {
      loadProfile();
      activeSyncTimer = setInterval(() => loadProfile(true), 60000);
      syncTimer.current = activeSyncTimer;
    }
    return () => {
      if (activeSyncTimer) clearInterval(activeSyncTimer);
    };
  }, [status, user, loadProfile]);

  useEffect(() => {
    const changed =
      name !== original.current.name ||
      phone !== original.current.phone ||
      address !== original.current.address ||
      image !== original.current.image;
    setHasChanges(changed);

    if (changed) {
      if (saveState === "saved") setSaveState("idle");

      // Debounce auto-save for 10s
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      const timer = setTimeout(() => {
        if (isOnline) {
          handleSave();
        }
      }, 10000);

      autoSaveTimer.current = timer;

      return () => {
        clearTimeout(timer);
      };
    }
  }, [name, phone, address, image, isOnline, saveState, handleSave]);

  const getRoleBadgeStyles = (r: string) => {
    switch (r) {
      case "SUPER_ADMIN":
        return {
          label: t.members.superAdmins.split(" (")[0].split(" / ")[0],
          bg: "bg-purple-50 dark:bg-purple-500/10 text-purple-750 dark:text-purple-350 border-purple-100 dark:border-purple-500/20",
          grad: "from-purple-500 to-indigo-600 shadow-purple-500/15",
          icon: Shield
        };
      default:
        return {
          label: t.members.admins.split(" (")[0].split(" / ")[0],
          bg: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-750 dark:text-indigo-350 border-indigo-100 dark:border-indigo-500/20",
          grad: "from-indigo-500 to-blue-600 shadow-indigo-500/15",
          icon: Shield
        };
    }
  };

  const badge = getRoleBadgeStyles(role);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto px-4 md:px-0">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold border max-w-xs backdrop-blur-xl ${
              toast.type === "success"
                ? "bg-emerald-500 text-white border-emerald-400/30 shadow-emerald-500/20"
                : "bg-rose-500 text-white border-rose-400/30 shadow-rose-500/20"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Status Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-950 dark:text-white uppercase tracking-tight truncate">
            {tp.title}
          </h2>
          <p className="text-xs text-slate-455 dark:text-gray-500 mt-1 font-semibold">
            {tp.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 ml-auto sm:ml-0">
          {lastSynced && (
            <span className="text-[10px] text-slate-400 dark:text-gray-500 font-bold hidden sm:inline">
              {t.members.registered} {lastSynced.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => loadProfile(false)}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-150 transition-all text-[10px] font-bold uppercase tracking-wider"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {tp.refresh || "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Visual Identity & Roster Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] overflow-hidden relative backdrop-blur-xl">
            {/* Ambient Background Gradient Banner */}
            <div className="h-28 bg-gradient-to-r from-indigo-500 via-indigo-655 to-violet-600 relative">
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
                }}
              />
            </div>
            
            <div className="px-6 pb-6">
              {/* Avatar Uploader Wrapper */}
              <div className="relative -mt-10 mb-4 mx-auto w-fit z-10">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={photoUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative w-20 h-20 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center border-4 border-white dark:border-[#0E0F1E] shadow-2xl overflow-hidden cursor-pointer focus:outline-none transition-transform active:scale-95 disabled:opacity-50"
                  title={tp.changePhoto}
                >
                  {photoUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : image && typeof image === "string" && image.length > 0 ? (
                    <Image src={image} alt={name || "Admin"} fill unoptimized className="object-cover" />
                  ) : (
                    <span className="text-white font-black text-xl uppercase">
                      {(name || "AD").substring(0, 2)}
                    </span>
                  )}
                  
                  {!photoUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-[#0E0F1E] shadow-md flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug truncate">
                  {name || user?.name || "Administrator"}
                </h3>
                <p className="text-xs text-slate-400 dark:text-gray-500 truncate mt-1 font-semibold">
                  {user?.email}
                </p>
              </div>

              {/* Consolidated Identity Details Table */}
              <div className="border-t border-slate-100 dark:border-white/[0.04] pt-5 space-y-4 text-xs font-semibold text-slate-700 dark:text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center text-slate-450 dark:text-gray-500 border border-slate-150 dark:border-white/[0.04] shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                      {tp.credentialsTitle}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center text-slate-450 dark:text-gray-500 border border-slate-150 dark:border-white/[0.04] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                      {t.dashboard.emailAddress}
                    </p>
                    <p className="font-bold text-slate-800 dark:text-white truncate" title={user?.email || ""}>
                      {user?.email || "—"}
                    </p>
                  </div>
                </div>

                {phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center text-slate-455 dark:text-gray-500 border border-slate-150 dark:border-white/[0.04] shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                        {tp.phone}
                      </p>
                      <p className="font-bold text-slate-800 dark:text-white">
                        {phone}
                      </p>
                    </div>
                  </div>
                )}

                {joinedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center text-slate-455 dark:text-gray-500 border border-slate-150 dark:border-white/[0.04] shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                        {tp.joined}
                      </p>
                      <p className="font-bold text-slate-800 dark:text-white">
                        {new Date(joinedAt).toLocaleDateString(undefined, {
                          month: "long",
                          year: "numeric",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center text-slate-455 dark:text-gray-500 border border-slate-150 dark:border-white/[0.04] shrink-0">
                    {isOnline ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-rose-500" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                      Network Link Status
                    </p>
                    <p className={`font-bold uppercase tracking-wider text-[10px] ${isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 animate-pulse"}`}>
                      {isOnline ? tp.connected : tp.offline}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Editor Panel */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] overflow-hidden backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.04] bg-slate-50/20 dark:bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <h3 className="font-extrabold text-slate-950 dark:text-white text-xs uppercase tracking-wider">
                  Edit Identity Settings
                </h3>
              </div>
              
              {hasChanges && (
                <span className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider shrink-0">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  Unsaved Info
                </span>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-[9px] font-black text-slate-450 dark:text-gray-500 uppercase tracking-wider mb-2">
                  {tp.fullName}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Samuel Raju"
                    className="w-full py-3 pl-10 pr-4 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 hover:border-slate-350 dark:hover:border-white/[0.15] transition-all duration-300 font-semibold"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                </div>
              </div>

              {/* Email (Read-only/Locked) */}
              <div>
                <label className="block text-[9px] font-black text-slate-455 dark:text-gray-500 uppercase tracking-wider mb-2">
                  {tp.emailAddress}
                </label>
                <div className="relative group/email">
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full py-3 pl-10 pr-24 text-xs bg-slate-100 dark:bg-[#16172D]/30 border border-slate-200 dark:border-white/[0.04] text-slate-400 dark:text-gray-600 cursor-not-allowed rounded-xl font-semibold select-all"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-gray-700" />
                  
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[8px] font-black text-slate-400 bg-slate-200 dark:bg-white/[0.08] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Lock className="w-2.5 h-2.5" />
                    Locked
                  </span>
                </div>
                <div className="mt-2.5 p-3.5 bg-indigo-50/40 dark:bg-indigo-500/[0.02] border border-indigo-100/50 dark:border-indigo-500/10 rounded-xl flex gap-2.5">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-indigo-850 dark:text-indigo-300 leading-normal font-semibold">
                    {tp.emailLockTooltip}
                  </p>
                </div>
              </div>

              {/* Grid for Contact inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div>
                  <label className="block text-[9px] font-black text-slate-455 dark:text-gray-500 uppercase tracking-wider mb-2">
                    {tp.phone}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full py-3 pl-10 pr-4 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 hover:border-slate-350 dark:hover:border-white/[0.15] transition-all duration-300 font-semibold"
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-[9px] font-black text-slate-455 dark:text-gray-500 uppercase tracking-wider mb-2">
                    {tp.address}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, City, Pin details..."
                      className="w-full py-3 pl-10 pr-4 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 hover:border-slate-350 dark:hover:border-white/[0.15] transition-all duration-300 font-semibold"
                    />
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Card Bar */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-[#0E0F1E]/55 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-550">
                {hasChanges && (
                  <div className="flex items-center gap-1 text-[#6366F1] dark:text-indigo-400 font-extrabold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
                    {tp.autosave}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 ml-auto">
                {hasChanges && (
                  <button
                    type="button"
                    onClick={resetToOriginal}
                    className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.03] text-slate-500 dark:text-gray-400 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all active:scale-95 shrink-0"
                    title="Undo all modifications"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={saving || !hasChanges}
                  className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 border shrink-0 ${
                    saveState === "saved"
                      ? "bg-emerald-500 text-white border-transparent shadow-lg shadow-emerald-500/15"
                      : saveState === "error"
                      ? "bg-rose-500 text-white border-transparent"
                      : hasChanges
                      ? "bg-gradient-to-r from-indigo-500 via-indigo-650 to-violet-605 text-white hover:opacity-90 shadow-lg shadow-indigo-500/15 border-transparent hover:scale-[1.01] active:scale-[0.98]"
                      : "bg-slate-100 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.04] text-slate-400 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {saveState === "saving" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {tp.saving}
                    </>
                  ) : saveState === "saved" ? (
                    <>
                      <Check className="w-4 h-4" />
                      {tp.saved}
                    </>
                  ) : saveState === "error" ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      {tp.tryAgain}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {tp.saveChanges}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
