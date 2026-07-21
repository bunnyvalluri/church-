"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  User, Phone, MapPin, Check, Loader2, Save,
  RefreshCw, Shield, Star, Camera, Wifi, WifiOff,
  Mail, Bell, Edit3, CheckCircle2, AlertCircle
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
    title: "à°¨à°¾ à°ªà±à°°à±Šà°«à±ˆà°²à±",
    subtitle: "à°®à±€ à°–à°¾à°¤à°¾ à°¸à°®à°¾à°šà°¾à°°à°‚ à°®à°°à°¿à°¯à± à°¸à±†à°Ÿà±à°Ÿà°¿à°‚à°—à±à°²à°¨à± à°¨à°¿à°°à±à°µà°¹à°¿à°‚à°šà°‚à°¡à°¿",
    refresh: "à°°à°¿à°«à±à°°à±†à°·à±",
    syncedAt: "à°¸à°®à°•à°¾à°²à±€à°•à°°à°¿à°‚à°šà°¬à°¡à°¿à°‚à°¦à°¿",
    avatarRole: {
      ADMIN: "à°¨à°¿à°°à±à°µà°¾à°¹à°•à±à°¡à±",
      PASTOR: "à°ªà°¾à°¸à±à°Ÿà°°à±",
      MEMBER: "à°¸à°­à±à°¯à±à°¡à±"
    },
    accountInfo: "à°–à°¾à°¤à°¾ à°¸à°®à°¾à°šà°¾à°°à°‚",
    email: "à°ˆà°®à±†à°¯à°¿à°²à±",
    phone: "à°«à±‹à°¨à±",
    memberSince: "à°¸à°­à±à°¯à°¤à±à°µà°‚ à°ªà±à°°à°¾à°°à°‚à°­à°®à±ˆà°¨ à°¤à±‡à°¦à±€",
    editProfile: "à°ªà±à°°à±Šà°«à±ˆà°²à± à°¸à°µà°°à°¿à°‚à°šà°‚à°¡à°¿",
    unsavedChanges: "à°¸à±‡à°µà± à°šà±‡à°¯à°¨à°¿ à°®à°¾à°°à±à°ªà±à°²à±",
    fullName: "à°ªà±‚à°°à±à°¤à°¿ à°ªà±‡à°°à± *",
    fullNamePlaceholder: "à°®à±€ à°ªà±‚à°°à±à°¤à°¿ à°ªà±‡à°°à±",
    emailAddress: "à°ˆà°®à±†à°¯à°¿à°²à± à°šà°¿à°°à±à°¨à°¾à°®à°¾",
    locked: "à°²à°¾à°•à± à°šà±‡à°¯à°¬à°¡à°¿à°‚à°¦à°¿",
    mobileNumber: "à°®à±Šà°¬à±ˆà°²à± à°¸à°‚à°–à±à°¯",
    homeAddress: "à°‡à°‚à°Ÿà°¿ à°šà°¿à°°à±à°¨à°¾à°®à°¾",
    homeAddressPlaceholder: "à°‡à°‚à°Ÿà°¿ à°¨à°‚à°¬à°°à±, à°µà±€à°§à°¿, à°¨à°—à°°à°‚...",
    connected: "à°•à°¨à±†à°•à±à°Ÿà± à°šà±‡à°¯à°¬à°¡à°¿à°‚à°¦à°¿",
    offline: "à°†à°«à±â€Œà°²à±ˆà°¨à±",
    autoSave: "à°†à°Ÿà±‹-à°¸à±‡à°µà± à°¸à°•à±à°°à°¿à°¯à°‚à°—à°¾ à°‰à°‚à°¦à°¿",
    saveChanges: "à°®à°¾à°°à±à°ªà±à°²à°¨à± à°¸à±‡à°µà± à°šà±‡à°¯à°¿",
    saving: "à°¸à±‡à°µà± à°…à°µà±à°¤à±‹à°‚à°¦à°¿...",
    saved: "à°¸à±‡à°µà± à°šà±‡à°¯à°¬à°¡à°¿à°‚à°¦à°¿!",
    tryAgain: "à°®à°³à±à°³à±€ à°ªà±à°°à°¯à°¤à±à°¨à°¿à°‚à°šà°‚à°¡à°¿",
    toastSuccess: "à°ªà±à°°à±Šà°«à±ˆà°²à± à°µà°¿à°œà°¯à°µà°‚à°¤à°‚à°—à°¾ à°¸à±‡à°µà± à°šà±‡à°¯à°¬à°¡à°¿à°‚à°¦à°¿!",
    toastError: "à°ªà±à°°à±Šà°«à±ˆà°²à± à°¡à±‡à°Ÿà°¾à°¨à± à°²à±‹à°¡à± à°šà±‡à°¯à°¡à°‚ à°µà°¿à°«à°²à°®à±ˆà°‚à°¦à°¿",
    toastSaveError: "à°ªà±à°°à±Šà°«à±ˆà°²à± à°†à°Ÿà±‹-à°¸à±‡à°µà± à°šà±‡à°¯à°¡à°‚ à°µà°¿à°«à°²à°®à±ˆà°‚à°¦à°¿",
    uploadingPhoto: "à°…à°ªà±â€Œà°²à±‹à°¡à± à°…à°µà±à°¤à±‹à°‚à°¦à°¿...",
    photoUpdated: "à°«à±‹à°Ÿà±‹ à°…à°ªà±â€Œà°¡à±‡à°Ÿà± à°šà±‡à°¯à°¬à°¡à°¿à°‚à°¦à°¿!",
    photoFailed: "à°«à±‹à°Ÿà±‹ à°…à°ªà±â€Œà°²à±‹à°¡à± à°µà°¿à°«à°²à°®à±ˆà°‚à°¦à°¿"
  },
  hi: {
    title: "à¤®à¥‡à¤°à¥€ à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤²",
    subtitle: "à¤…à¤ªà¤¨à¥‡ à¤–à¤¾à¤¤à¥‡ à¤•à¥€ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤”à¤° à¤¸à¥‡à¤Ÿà¤¿à¤‚à¤—à¥à¤¸ à¤ªà¥à¤°à¤¬à¤‚à¤§à¤¿à¤¤ à¤•à¤°à¥‡à¤‚",
    refresh: "à¤°à¤¿à¤«à¥à¤°à¥‡à¤¶",
    syncedAt: "à¤¸à¤¿à¤‚à¤• à¤•à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾",
    avatarRole: {
      ADMIN: "à¤ªà¥à¤°à¤¶à¤¾à¤¸à¤•",
      PASTOR: "à¤ªà¤¾à¤¦à¤°à¥€",
      MEMBER: "à¤¸à¤¦à¤¸à¥à¤¯"
    },
    accountInfo: "à¤–à¤¾à¤¤à¤¾ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€",
    email: "à¤ˆà¤®à¥‡à¤²",
    phone: "à¤«à¤¼à¥‹à¤¨",
    memberSince: "à¤¸à¤¦à¤¸à¥à¤¯à¤¤à¤¾ à¤•à¥€ à¤¶à¥à¤°à¥à¤†à¤¤",
    editProfile: "à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤² à¤¸à¤‚à¤ªà¤¾à¤¦à¤¿à¤¤ à¤•à¤°à¥‡à¤‚",
    unsavedChanges: "à¤…à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤ à¤ªà¤°à¤¿à¤µà¤°à¥à¤¤à¤¨",
    fullName: "à¤ªà¥‚à¤°à¤¾ à¤¨à¤¾à¤® *",
    fullNamePlaceholder: "à¤†à¤ªà¤•à¤¾ à¤ªà¥‚à¤°à¤¾ à¤¨à¤¾à¤®",
    emailAddress: "à¤ˆà¤®à¥‡à¤² à¤ªà¤¤à¤¾",
    locked: "à¤²à¥‰à¤• à¤•à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾",
    mobileNumber: "à¤®à¥‹à¤¬à¤¾à¤‡à¤² à¤¨à¤‚à¤¬à¤°",
    homeAddress: "à¤˜à¤° à¤•à¤¾ à¤ªà¤¤à¤¾",
    homeAddressPlaceholder: "à¤®à¤•à¤¾à¤¨ à¤¨à¤‚à¤¬à¤°, à¤—à¤²à¥€, à¤¶à¤¹à¤°...",
    connected: "à¤•à¤¨à¥‡à¤•à¥à¤Ÿà¥‡à¤¡",
    offline: "à¤‘à¤«à¤¼à¤²à¤¾à¤‡à¤¨",
    autoSave: "à¤‘à¤Ÿà¥‹-à¤¸à¥‡à¤µ à¤¸à¤•à¥à¤°à¤¿à¤¯ à¤¹à¥ˆ",
    saveChanges: "à¤ªà¤°à¤¿à¤µà¤°à¥à¤¤à¤¨ à¤¸à¤¹à¥‡à¤œà¥‡à¤‚",
    saving: "à¤¸à¤¹à¥‡à¤œ à¤°à¤¹à¤¾ à¤¹à¥ˆ...",
    saved: "à¤¸à¤¹à¥‡à¤œà¤¾ à¤—à¤¯à¤¾!",
    tryAgain: "à¤ªà¥à¤¨à¤ƒ à¤ªà¥à¤°à¤¯à¤¾à¤¸ à¤•à¤°à¥‡à¤‚",
    toastSuccess: "à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤² à¤¸à¤«à¤²à¤¤à¤¾à¤ªà¥‚à¤°à¥à¤µà¤• à¤¸à¤¹à¥‡à¤œà¥€ à¤—à¤ˆ!",
    toastError: "à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤² à¤¡à¥‡à¤Ÿà¤¾ à¤²à¥‹à¤¡ à¤•à¤°à¤¨à¥‡ à¤®à¥‡à¤‚ à¤µà¤¿à¤«à¤²",
    toastSaveError: "à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤² à¤‘à¤Ÿà¥‹-à¤¸à¥‡à¤µ à¤•à¤°à¤¨à¥‡ à¤®à¥‡à¤‚ à¤µà¤¿à¤«à¤²",
    uploadingPhoto: "à¤…à¤ªà¤²à¥‹à¤¡ à¤¹à¥‹ à¤°à¤¹à¤¾ à¤¹à¥ˆ...",
    photoUpdated: "à¤«à¤¼à¥‹à¤Ÿà¥‹ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤¹à¥‹ à¤—à¤ˆ!",
    photoFailed: "à¤«à¤¼à¥‹à¤Ÿà¥‹ à¤…à¤ªà¤²à¥‹à¤¡ à¤µà¤¿à¤«à¤²"
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
      const res = await fetch(`/api/admin/users`);
      const data = await res.json();
      if (res.ok && data.success) {
        const p = data.users.find((u: any) => u.id === user?.uid);
        if (p) {
          const snap: ProfileSnapshot = {
            name: p.name || user?.name || "",
            phone: p.phone || "",
            address: p.address || "",
            role: p.role || "MEMBER",
            joinedAt: p.createdAt || "",
            image: p.image || "",
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
      }
      setLastSynced(new Date());
    } catch {
      if (!silent) showToast(pt.toastError, "error");
    } finally {
      setSyncing(false);
    }
  }, [user?.uid, user?.name, pt.toastError]);

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
      
      // Debounce auto-save for 10s
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
    ADMIN: { label: pt.avatarRole.ADMIN, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/30" },
    PASTOR: { label: pt.avatarRole.PASTOR, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/30" },
    MEMBER: { label: pt.avatarRole.MEMBER, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/30" },
  };
  const rc = roleConfig[role] || roleConfig.MEMBER;

  if (!mounted || status === "loading" || status === "unauthenticated") return null;

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl mx-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold border max-w-[90vw] sm:max-w-xs backdrop-blur-xl ${
              toast.type === "success"
                ? "bg-green-500 text-white border-green-400/30"
                : "bg-red-500 text-white border-red-400/30"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span className="truncate">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* â”€â”€ PAGE HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">{pt.title}</h1>
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))]/20 dark:hover:border-[hsl(var(--primary))]/30 transition-all text-xs font-semibold shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{pt.refresh}</span>
          </button>
        </div>
      </div>

      {/* â”€â”€ MAIN GRID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 items-start">

        {/* â”€â”€ LEFT COLUMN: Profile Identity â”€â”€ */}
        <div className="md:col-span-1 xl:col-span-1 space-y-4">

          {/* Avatar Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
          >
            {/* Gradient banner */}
            <div className="h-20 sm:h-24 bg-gradient-to-br from-gradient-start via-purple-500 to-gradient-end relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")" }} />
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full translate-x-6 translate-y-6" />
            </div>
            <div className="px-4 sm:px-5 pb-5">
              <div className="relative -mt-8 mb-3 w-fit">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <button
                  type="button"
                  disabled={photoUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative w-16 h-16 bg-gradient-to-br from-gradient-start to-gradient-end rounded-2xl flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden cursor-pointer focus:outline-none transition-transform active:scale-95 disabled:opacity-50"
                  title="Upload profile picture"
                >
                  {photoUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : image && typeof image === "string" && image.length > 0 ? (
                    <Image src={image} alt={name || "Member"} fill unoptimized className="object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                  {!photoUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              </div>
              <h2 className="font-black text-gray-900 dark:text-white text-base sm:text-lg leading-tight">{name || user?.name || "Member"}</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>
              <div className={`inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-xs font-bold border ${rc.bg} ${rc.color}`}>
                <Shield className="w-3 h-3" />
                {rc.label}
              </div>
            </div>
          </motion.div>

          {/* Account Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 sm:p-5 space-y-3"
          >
            <h3 className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{pt.accountInfo}</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[hsl(var(--accent))] dark:bg-[hsl(var(--accent))]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{pt.email}</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.email || "â€”"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[hsl(var(--accent))] dark:bg-[hsl(var(--accent))]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{pt.phone}</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{phone || "â€”"}</p>
                </div>
              </div>
              {joinedAt && (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-amber-50 dark:bg-amber-950/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{pt.memberSince}</p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date(joinedAt).toLocaleDateString(language === "en" ? "en-US" : "en-IN", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* â”€â”€ RIGHT COLUMN: Edit Form â”€â”€ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 xl:col-span-3"
        >
          <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Form header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[hsl(var(--primary))]" />
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{pt.editProfile}</h3>
              </div>
              {hasChanges && (
                <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                  <span className="hidden sm:inline">{pt.unsavedChanges}</span>
                  <span className="sm:hidden">Unsaved</span>
                </span>
              )}
            </div>

            {/* Form fields */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Name + Email â€” side-by-side on lg+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{pt.fullName}</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder={pt.fullNamePlaceholder}
                      className="w-full py-2.5 sm:py-3 px-4 pl-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent focus:outline-none transition-all text-sm"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
                {/* Email (Read-only) */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{pt.emailAddress}</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full py-2.5 sm:py-3 px-4 pl-9 pr-16 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed text-sm truncate"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">{pt.locked}</span>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{pt.mobileNumber}</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full py-2.5 sm:py-3 px-4 pl-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent focus:outline-none transition-all text-sm"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{pt.homeAddress}</label>
                <div className="relative">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={pt.homeAddressPlaceholder}
                    rows={3}
                    className="w-full py-2.5 sm:py-3 px-4 pl-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent focus:outline-none transition-all resize-none text-sm"
                  />
                  <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Save Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center flex-wrap gap-3 text-xs text-gray-400">
                {isOnline
                  ? <div className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-green-500" /> {pt.connected}</div>
                  : <div className="flex items-center gap-1.5"><WifiOff className="w-3.5 h-3.5 text-red-500" /> {pt.offline}</div>
                }
                <div className="flex items-center gap-1.5 text-[hsl(var(--primary))] dark:text-purple-400 font-bold uppercase tracking-wider text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                  {pt.autoSave}
                </div>
              </div>
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  saveState === "saved"
                    ? "bg-green-500 text-white"
                    : saveState === "error"
                    ? "bg-red-500 text-white"
                    : hasChanges
                    ? "bg-gradient-to-r from-gradient-start to-gradient-end hover:opacity-90 text-white shadow-lg shadow-[hsl(var(--primary))]/20 hover:shadow-xl active:scale-[0.98]"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
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

