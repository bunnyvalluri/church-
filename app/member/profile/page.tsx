"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { User, Phone, MapPin, ArrowLeft, Check, Loader2, Save, RefreshCw, Wifi, Shield, Star, Camera, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileData {
  name: string;
  phone: string;
  address: string;
  role?: string;
  joinedAt?: string;
  lastSeen?: string;
}

export default function MemberProfile() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [joinedAt, setJoinedAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const originalData = useRef<ProfileData>({ name: "", phone: "", address: "" });
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [mounted, status, router]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); showToast("Connection restored", "success"); };
    const handleOffline = () => { setIsOnline(false); showToast("You are offline", "error"); };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadProfileData = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    if (!silent) setSyncing(true);
    try {
      const res = await fetch(`/api/admin/users`);
      const data = await res.json();
      if (res.ok && data.success) {
        const currentProfile = data.users.find((u: any) => u.id === user?.uid);
        if (currentProfile) {
          const newName = currentProfile.name || user?.name || "";
          const newPhone = currentProfile.phone || "";
          const newAddress = currentProfile.address || "";
          const newRole = currentProfile.role || "MEMBER";
          const newJoinedAt = currentProfile.createdAt || "";
          setName(newName);
          setPhone(newPhone);
          setAddress(newAddress);
          setRole(newRole);
          setJoinedAt(newJoinedAt);
          originalData.current = { name: newName, phone: newPhone, address: newAddress };
          setHasChanges(false);
        }
      }
      setLastSynced(new Date());
    } catch (e) {
      if (!silent) showToast("Sync failed. Check connection.", "error");
    } finally {
      setSyncing(false);
    }
  }, [user?.uid, user?.name]);

  useEffect(() => {
    if (status === "authenticated" && user?.uid) {
      loadProfileData();
      // Live sync every 60s
      syncIntervalRef.current = setInterval(() => loadProfileData(true), 60000);
    }
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [user, status, loadProfileData]);

  // Track changes
  useEffect(() => {
    const changed =
      name !== originalData.current.name ||
      phone !== originalData.current.phone ||
      address !== originalData.current.address;
    setHasChanges(changed);
  }, [name, phone, address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/member/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid, name, phone, address }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        originalData.current = { name, phone, address };
        setHasChanges(false);
        setLastSynced(new Date());
        showToast("Profile saved successfully!", "success");
        setSuccessMsg("Profile updated successfully!");
      } else {
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      showToast(err.message || "Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
    PASTOR: "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400",
    MEMBER: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
  };

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl animate-pulse">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50 dark:from-gray-950 dark:via-purple-950/10 dark:to-gray-900 text-gray-800 dark:text-gray-200">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2.5 max-w-sm backdrop-blur-xl border ${
              toast.type === "success"
                ? "bg-green-500/90 text-white border-green-400/30"
                : toast.type === "error"
                ? "bg-red-500/90 text-white border-red-400/30"
                : "bg-gray-900/90 text-white border-gray-700/30"
            }`}
          >
            {toast.type === "success" ? <Check className="w-4 h-4" /> : toast.type === "error" ? <Bell className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/member"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:gap-3 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              isOnline
                ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400"
                : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              {isOnline ? "Live" : "Offline"}
            </div>

            <button
              onClick={() => loadProfileData(false)}
              disabled={syncing}
              className="p-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
              title="Refresh profile"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Hero Profile Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 rounded-3xl p-8 text-white overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-12" />
          </div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl font-black truncate">{name || user?.name || "Church Member"}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white border border-white/30`}>
                  {role}
                </span>
              </div>
              <p className="text-purple-200 text-sm truncate">{user?.email}</p>
              {joinedAt && (
                <p className="text-purple-300 text-xs mt-1 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Member since {new Date(joinedAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20 flex-shrink-0">
              <Shield className="w-4 h-4 text-purple-200" />
              <span className="text-xs font-bold text-purple-200">Verified Member</span>
            </div>
          </div>
        </motion.div>

        {/* Sync Status */}
        {lastSynced && (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-green-500" />
              <span>Last synced: {lastSynced.toLocaleTimeString("en-IN")}</span>
            </div>
            {hasChanges && (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse inline-block" />
                Unsaved changes
              </span>
            )}
          </div>
        )}

        {/* Profile Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl p-8 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-950 dark:text-white">Profile Settings</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Changes auto-sync with the church database</p>
            </div>
          </div>

          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 text-sm rounded-lg flex items-center gap-2"
              >
                <Check className="w-4 h-4 flex-shrink-0" />
                {successMsg}
              </motion.div>
            )}

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded-lg"
              >
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  className="w-full py-3.5 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:outline-none transition-all text-sm"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full py-3.5 px-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 cursor-not-allowed text-sm"
                />
                <Shield className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 w-4 h-4" />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full py-3.5 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:outline-none transition-all text-sm"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Residential Address
              </label>
              <div className="relative">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your house details and street address..."
                  rows={3}
                  className="w-full py-3.5 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:outline-none transition-all resize-none text-sm"
                />
                <MapPin className="absolute left-4 top-4 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !hasChanges}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm ${
                hasChanges
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20 hover:shadow-xl active:scale-[0.99]"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              } disabled:opacity-60`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving changes...
                </>
              ) : hasChanges ? (
                <>
                  <Save className="w-5 h-5" />
                  Save Profile Changes
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Profile is up to date
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
