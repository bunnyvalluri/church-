"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  User, Phone, MapPin, Check, Loader2, Save,
  RefreshCw, Shield, Star, Camera, Wifi, WifiOff,
  Mail, Edit3, CheckCircle2, AlertCircle, Copy, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileSnapshot {
  name: string;
  phone: string;
  address: string;
  role: string;
  joinedAt: string;
  image: string;
}

const profileTranslations = {
  en: {
    title: "My Profile",
    subtitle: "Manage your account information and settings",
    refresh: "Refresh",
    syncedAt: "Synced",
    avatarRole: {
      ADMIN: "Administrator",
      PASTOR: "Pastor",
      MEMBER: "Member"
    },
    accountInfo: "Account Info",
    email: "Email",
    phone: "Phone",
    memberSince: "Member Since",
    editProfile: "Edit Profile",
    unsavedChanges: "Unsaved changes",
    fullName: "Full Name *",
    fullNamePlaceholder: "Your full name",
    emailAddress: "Email Address",
    locked: "LOCKED",
    mobileNumber: "Mobile Number",
    homeAddress: "Home Address",
    homeAddressPlaceholder: "House number, street, city...",
    connected: "Connected",
    offline: "Offline",
    autoSave: "Auto-save Active",
    saveChanges: "Save Changes",
    saving: "Saving...",
    saved: "Saved!",
    tryAgain: "Try Again",
    toastSuccess: "Profile auto-saved successfully!",
    toastError: "Failed to load profile data",
    toastSaveError: "Failed to auto-save profile",
    uploadingPhoto: "Uploading...",
    photoUpdated: "Photo updated!",
    photoFailed: "Photo upload failed"
  },
  te: {
    title: "నా ప్రొఫైల్",
    subtitle: "మీ ఖాతా సమాచారం మరియు సెట్టింగ్‌లను నిర్వహించండి",
    refresh: "రిఫ్రెష్",
    syncedAt: "సమకాలీకరించబడింది",
    avatarRole: {
      ADMIN: "నిర్వాహకుడు",
      PASTOR: "పాస్టర్",
      MEMBER: "సభ్యుడు"
    },
    accountInfo: "ఖాతా సమాచారం",
    email: "ఈమెయిల్",
    phone: "ఫోన్",
    memberSince: "సభ్యత్వం ప్రారంభమైన తేదీ",
    editProfile: "ప్రొఫైల్ సవరించండి",
    unsavedChanges: "సేవ్ చేయని మార్పులు",
    fullName: "పూర్తి పేరు *",
    fullNamePlaceholder: "మీ పూర్తి పేరు",
    emailAddress: "ఈమెయిల్ చిరునామా",
    locked: "లాక్ చేయబడింది",
    mobileNumber: "మొబైల్ సంఖ్య",
    homeAddress: "ఇంటి చిరునామా",
    homeAddressPlaceholder: "ఇంటి నంబర్, వీధి, నగరం...",
    connected: "కనెక్ట్ చేయబడింది",
    offline: "ఆఫ్‌లైన్",
    autoSave: "ఆటో-సేవ్ సక్రియంగా ఉంది",
    saveChanges: "మార్పులను సేవ్ చేయి",
    saving: "సేవ్ అవుతోంది...",
    saved: "సేవ్ చేయబడింది!",
    tryAgain: "మళ్ళీ ప్రయత్నించండి",
    toastSuccess: "ప్రొఫైల్ విజయవంతంగా సేవ్ చేయబడింది!",
    toastError: "ప్రొఫైల్ డేటాను లోడ్ చేయడం విఫలమైంది",
    toastSaveError: "ప్రొఫైల్ ఆటో-సేవ్ చేయడం విఫలమైంది",
    uploadingPhoto: "అప్‌లోడ్ అవుతోంది...",
    photoUpdated: "ఫోటో అప్‌డేట్ చేయబడింది!",
    photoFailed: "ఫోటో అప్‌లోడ్ విఫలమైంది"
  },
  hi: {
    title: "मेरी प्रोफाइल",
    subtitle: "अपने खाते की जानकारी और सेटिंग्स प्रबंधित करें",
    refresh: "रिफ्रेश",
    syncedAt: "सिंक किया गया",
    avatarRole: {
      ADMIN: "प्रशासक",
      PASTOR: "पादरी",
      MEMBER: "सदस्य"
    },
    accountInfo: "खाता जानकारी",
    email: "ईमेल",
    phone: "फ़ोन",
    memberSince: "सदस्यता की शुरुआत",
    editProfile: "प्रोफ़ाइल संपादित करें",
    unsavedChanges: "असुरक्षित परिवर्तन",
    fullName: "पूरा नाम *",
    fullNamePlaceholder: "आपका पूरा नाम",
    emailAddress: "ईमेल पता",
    locked: "लॉक किया गया",
    mobileNumber: "मोबाइल नंबर",
    homeAddress: "घर का पता",
    homeAddressPlaceholder: "मकान नंबर, गली, शहर...",
    connected: "कनेक्टेड",
    offline: "ऑफ़लाइन",
    autoSave: "ऑटो-सेव सक्रिय है",
    saveChanges: "परिवर्तन सहेजें",
    saving: "सहेज रहा है...",
    saved: "सहेजा गया!",
    tryAgain: "पुनः प्रयास करें",
    toastSuccess: "प्रोफ़ाइल सफलतापूर्वक सहेजी गई!",
    toastError: "प्रोफ़ाइल डेटा लोड करने में विफल",
    toastSaveError: "प्रोफ़ाइल ऑटो-सेव करने में विफल",
    uploadingPhoto: "अपलोड हो रहा है...",
    photoUpdated: "फ़ोटो अपडेट हो गई!",
    photoFailed: "फ़ोटो अपलोड विफल"
  }
};

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
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
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
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

export default function MemberProfile() {
  const { user, status, mounted, refreshUser, updateUser } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const pt = profileTranslations[language as keyof typeof profileTranslations] || profileTranslations.en;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [joinedAt, setJoinedAt] = useState("");
  const [image, setImage] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const original = useRef<ProfileSnapshot>({ name: "", phone: "", address: "", role: "MEMBER", joinedAt: "", image: "" });
  const syncTimer = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  // Pre-fill name/image from auth user if state is empty
  useEffect(() => {
    if (user) {
      if (!name && user.name && !original.current.name) {
        setName(user.name);
      }
      if (!image && user.image && !original.current.image) {
        setImage(user.image);
      }
    }
  }, [user, name, image]);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const loadProfile = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    if (!silent) setSyncing(true);
    try {
      const res = await fetch(`/api/member/profile?userId=${user.uid}&email=${encodeURIComponent(user.email || "")}`);
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const p = data.user;
        const snap: ProfileSnapshot = {
          name: p.name || user?.name || "",
          phone: p.phone || "",
          address: p.address || "",
          role: p.role || "MEMBER",
          joinedAt: p.createdAt || "",
          image: p.image || user?.image || "",
        };
        setName(snap.name);
        setPhone(snap.phone);
        setAddress(snap.address);
        setRole(snap.role);
        setJoinedAt(snap.joinedAt);
        setImage(snap.image);
        original.current = snap;
        setHasChanges(false);
      }
      setLastSynced(new Date());
    } catch {
      if (!silent) showToast(pt.toastError, "error");
    } finally {
      setSyncing(false);
    }
  }, [user?.uid, user?.email, user?.name, user?.image, pt.toastError]);

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
        body: JSON.stringify({ userId: user?.uid, email: user?.email, name, phone, address, image: imageToSave }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        original.current = { ...original.current, name, phone, address, image: imageToSave };
        setHasChanges(false);
        setSaveState("saved");
        setLastSynced(new Date());
        showToast(pt.toastSuccess, "success");
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
      showToast(err.message || pt.toastSaveError, "error");
      setTimeout(() => setSaveState("idle"), 3000);
    } finally {
      setSaving(false);
    }
  }, [user?.uid, name, phone, address, image, refreshUser, updateUser, pt.toastSuccess, pt.toastSaveError]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
      await handleSave(undefined, compressed);
    } catch (err) {
      showToast(pt.photoFailed, "error");
    } finally {
      setPhotoUploading(false);
    }
  };

  const copyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
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
    const changed = name !== original.current.name || phone !== original.current.phone || address !== original.current.address || image !== original.current.image;
    setHasChanges(changed);
    if (changed) {
      if (saveState === "saved") setSaveState("idle");

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

  const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
    ADMIN: { label: pt.avatarRole.ADMIN, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/40" },
    PASTOR: { label: pt.avatarRole.PASTOR, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/40" },
    MEMBER: { label: pt.avatarRole.MEMBER, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40" },
  };
  const rc = roleConfig[role] || roleConfig.MEMBER;

  if (status === "unauthenticated" && mounted) return null;

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-4">
      {/* Toast Notification Pop-up */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 sm:bottom-8 sm:left-auto sm:right-6 sm:translate-x-0 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold border max-w-[92vw] sm:max-w-md backdrop-blur-xl transition-all ${
              toast.type === "success"
                ? "bg-emerald-600 text-white border-emerald-400/40 shadow-emerald-600/30"
                : "bg-red-600 text-white border-red-400/40 shadow-red-600/30"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 text-white" />}
            <span className="leading-snug whitespace-normal">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">{pt.title}</h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Shield className="w-3 h-3" /> Member Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{pt.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {mounted && lastSynced && (
            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
              {pt.syncedAt} {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => loadProfile(false)}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 transition-all text-xs font-semibold shadow-sm active:scale-95"
            title="Refresh profile data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-purple-600" : ""}`} />
            <span className="hidden sm:inline">{pt.refresh}</span>
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">

        {/* LEFT COLUMN: Unified Profile Hero & Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 space-y-4"
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-xl overflow-hidden backdrop-blur-xl">
            {/* Banner Cover */}
            <div className="h-24 sm:h-28 bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            </div>

            {/* Profile Avatar & Primary Info */}
            <div className="px-5 pb-5">
              <div className="relative -mt-10 mb-3 flex items-end justify-between">
                <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 border-4 border-white dark:border-gray-900 shadow-2xl overflow-hidden group">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  <button
                    type="button"
                    disabled={photoUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full flex items-center justify-center cursor-pointer focus:outline-none disabled:opacity-50"
                    title="Upload profile photo"
                  >
                    {photoUploading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : image && typeof image === "string" && image.length > 0 ? (
                      <Image src={image} alt={name || user?.name || "Member"} fill unoptimized className="object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                    {!photoUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                  <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                </div>

                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-sm ${rc.bg} ${rc.color}`}>
                  <Shield className="w-3.5 h-3.5" />
                  {rc.label}
                </div>
              </div>

              <h2 className="font-black text-gray-900 dark:text-white text-base sm:text-lg leading-tight truncate">
                {name || user?.name || "Member"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>

              {/* Quick Details List */}
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800/80 space-y-3">
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 bg-purple-100 dark:bg-purple-950/50 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{pt.email}</p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-[180px]">{user?.email || "-"}</p>
                    </div>
                  </div>
                  <button
                    onClick={copyEmail}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                    title="Copy email"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{pt.phone}</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{phone || "-"}</p>
                  </div>
                </div>

                {joinedAt && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                    <div className="w-7 h-7 bg-amber-100 dark:bg-amber-950/50 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                      <Star className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{pt.memberSince}</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {new Date(joinedAt).toLocaleDateString(language === "en" ? "en-US" : "en-IN", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Edit Settings Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="lg:col-span-8"
        >
          <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-xl overflow-hidden backdrop-blur-xl">
            {/* Form Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{pt.editProfile}</h3>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 hidden sm:block">Update your details & contact preferences</p>
                </div>
              </div>
              {hasChanges && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  {pt.unsavedChanges}
                </span>
              )}
            </div>

            {/* Form Fields */}
            <div className="p-5 space-y-4 sm:space-y-5">
              {/* Full Name + Locked Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    {pt.fullName}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder={pt.fullNamePlaceholder}
                      className="w-full py-2.5 sm:py-3 px-4 pl-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all text-xs sm:text-sm font-medium"
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Email (Read-Only) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      {pt.emailAddress}
                    </label>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                      <Lock className="w-2.5 h-2.5" /> {pt.locked}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full py-2.5 sm:py-3 px-4 pl-10 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-100/70 dark:bg-gray-800/30 text-gray-400 dark:text-gray-500 cursor-not-allowed text-xs sm:text-sm font-medium truncate"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400/60" />
                  </div>
                </div>
              </div>

              {/* Mobile Phone Number */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  {pt.mobileNumber}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full py-2.5 sm:py-3 px-4 pl-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all text-xs sm:text-sm font-medium"
                  />
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Home Address */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  {pt.homeAddress}
                </label>
                <div className="relative">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={pt.homeAddressPlaceholder}
                    rows={3}
                    className="w-full py-2.5 sm:py-3 px-4 pl-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all resize-none text-xs sm:text-sm font-medium"
                  />
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Save Footer */}
            <div className="px-5 py-4 bg-gray-50/80 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center justify-between sm:justify-start gap-4 text-xs text-gray-400">
                {isOnline
                  ? <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 font-semibold"><Wifi className="w-3.5 h-3.5 text-green-500" /> {pt.connected}</div>
                  : <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 font-semibold"><WifiOff className="w-3.5 h-3.5 text-red-500" /> {pt.offline}</div>
                }
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-black uppercase tracking-wider text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  {pt.autoSave}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || !hasChanges}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] ${
                  saveState === "saved"
                    ? "bg-green-500 text-white"
                    : saveState === "error"
                    ? "bg-red-500 text-white"
                    : hasChanges
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25 hover:shadow-lg"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none"
                }`}
              >
                {saveState === "saving" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {pt.saving}</>
                ) : saveState === "saved" ? (
                  <><CheckCircle2 className="w-4 h-4" /> {pt.saved}</>
                ) : saveState === "error" ? (
                  <><AlertCircle className="w-4 h-4" /> {pt.tryAgain}</>
                ) : (
                  <><Save className="w-4 h-4" /> {pt.saveChanges}</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
