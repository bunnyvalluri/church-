"use client";

import React, { useState, useEffect } from "react";
import PastorPageHeader from "@/components/pastor/layout/PastorPageHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";
import { useAuth } from "@/components/providers/AuthProvider";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  FileText,
  Camera,
  Save,
  Check,
  AlertCircle,
  X,
  Sparkles,
  MapPin,
  Calendar,
  Award,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PastorProfilePage() {
  const { language } = useLanguage();
  const t = getPastorTranslation(language);
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [profile, setProfile] = useState({
    name: "Bishop Kurra Kristhu Raju",
    title: "Senior Pastor & Founder",
    email: "bishop.kraju@kcmchurch.org",
    phone: "+91 97040 90069",
    bio: "Bishop Kurra Kristhu Raju is the founder and Senior Pastor of Kingdom of Christ Ministries. With over 25 years of faithful ministry, his vision is to reach every soul with the Gospel of Jesus Christ.",
    image: "/pastor.png",
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch pastor profile from API
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch("/api/pastor/profile");
        const data = await res.json();
        if (res.ok && data.success && data.profile) {
          setProfile({
            name: data.profile.name || "Bishop Kurra Kristhu Raju",
            title: data.profile.title || "Senior Pastor & Founder",
            email: data.profile.email || "bishop.kraju@kcmchurch.org",
            phone: data.profile.phone || "+91 97040 90069",
            bio: data.profile.bio || "",
            image: data.profile.image || "/pastor.png",
          });
        }
      } catch (err) {
        console.error("Failed to load pastor profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Save profile changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim() || !profile.email.trim() || !profile.phone.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/pastor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Profile credentials updated successfully!", "success");
      } else {
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (err: any) {
      showToast(err.message || "Error updating profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 max-w-sm text-xs font-semibold backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-500/90 text-white border-emerald-400"
                : "bg-rose-500/90 text-white border-rose-400"
            }`}
          >
            {toast.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="flex-1">{toast.msg}</span>
            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <PastorPageHeader
        title={t.pastorProfileTitle || "Senior Pastor Profile & Ministry Credentials"}
        subtitle={t.pastorProfileSubtitle || "Personal bio, ordination details, contact info, pastoral role permissions, and ministry biography"}
        badge={t.pastoralCredentialsBadge || "Pastoral Credentials"}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Loading profile data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* ── Left Column: Profile Card ── */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-white/[0.03] p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-white/[0.08] shadow-sm text-center space-y-4">
              {/* Avatar with Camera Badge */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                <div className="w-full h-full rounded-3xl overflow-hidden border-2 border-indigo-200 dark:border-indigo-500/30 shadow-md relative bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40">
                  {profile.image ? (
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-3xl">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => showToast("Photo change is simulated. Ready for upload integration.", "success")}
                  className="absolute -bottom-1.5 -right-1.5 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md border-2 border-white dark:border-gray-900 transition-all active:scale-95"
                  title="Change Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Pastor Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                    {profile.name}
                  </h3>
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                </div>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {profile.title}
                </p>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 mt-1">
                  Verified Senior Minister
                </span>
              </div>

              {/* Quick Info List */}
              <div className="pt-3 border-t border-gray-100 dark:border-white/5 space-y-2 text-left text-xs">
                <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
                  <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
                  <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">Jeedimetla Sanctuary, Hyderabad</span>
                </div>
              </div>
            </div>

            {/* Ministry Credentials Badge Card */}
            <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-4 sm:p-5 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                <Award className="w-4 h-4" />
                <span>Ministry Leadership</span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                Authorized for sacerdotal duties, marriages, baptisms, church management, financial approvals, and pastoral council leadership.
              </p>
            </div>
          </div>

          {/* ── Right Column: Edit Profile Form ── */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-white/[0.03] p-5 sm:p-7 rounded-3xl border border-gray-100 dark:border-white/[0.08] shadow-sm space-y-5">
              <div className="border-b border-gray-100 dark:border-white/5 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  Edit Profile Information
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Update your contact phone, displayed designation, bio, and account credentials
                </p>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Pastor Name & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      {t.profileNameLabel || "Pastor Name"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                      {t.profileTitleLabel || "Title / Designation"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.title}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Email Address & Contact Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      {t.profileEmailLabel || "Email Address"} *
                    </label>
                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      {t.profilePhoneLabel || "Contact Phone"} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Biography */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      {t.profileBioLabel || "Biography"}
                    </label>
                    <span className="text-[10px] text-gray-400">
                      {profile.bio.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Write a brief ministry bio, pastoral calling, and vision for the church..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 leading-relaxed resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end pt-3 border-t border-gray-100 dark:border-white/5">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{t.saveProfileBtn || "Save Profile"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
