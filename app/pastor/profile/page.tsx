"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings, ArrowLeft, Loader2, Check, Save, User, Mail, Phone, FileText } from "lucide-react";
import Image from "next/image";

export default function PastorProfile() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();
  const [localMounted, setLocalMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [profile, setProfile] = useState({
    name: "Bishop Kurra Kristhu Raju",
    title: "Senior Pastor & Founder",
    email: "bishop.kraju@kcmchurch.org",
    phone: "+91 95052 02748",
    bio: "Bishop Kurra Kristhu Raju has been serving in ministry with unwavering dedication. His passion for souls and commitment to God's Word has transformed countless lives across Hyderabad and beyond.",
    image: "/pastor.png",
  });

  useEffect(() => { setLocalMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated" && user && user.role !== "PASTOR" && user.role !== "ADMIN") router.replace("/dashboard");
  }, [mounted, status, user, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/pastor/profile").then(r => r.json()).then(d => {
        if (d.success && d.profile) setProfile(p => ({ ...p, ...d.profile }));
      }).catch(() => {});
    }
  }, [status]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/pastor/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
      const data = await res.json();
      if (res.ok && data.success) { setSuccessMsg("Profile saved successfully!"); setTimeout(() => setSuccessMsg(""), 4000); }
      else throw new Error();
    } catch { setErrorMsg("Failed to save profile."); setTimeout(() => setErrorMsg(""), 4000); }
    finally { setSaving(false); }
  };

  if (!localMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link href="/pastor" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Pastor Dashboard
        </Link>

        <div className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 p-8 text-center relative">
            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
              {profile.image ? (
                <Image src={profile.image} alt={profile.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-black text-3xl">{profile.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <h3 className="text-white font-black text-xl">{profile.name}</h3>
            <p className="text-purple-200 text-sm mt-1">{profile.title}</p>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            {successMsg && <div className="p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 text-sm rounded-lg flex items-center gap-2"><Check className="w-4 h-4" />{successMsg}</div>}
            {errorMsg && <div className="p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded-lg">{errorMsg}</div>}

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: "Full Name", key: "name", icon: User, type: "text", placeholder: "Pastor's full name" },
                { label: "Title / Role", key: "title", icon: Settings, type: "text", placeholder: "e.g. Senior Pastor & Founder" },
                { label: "Email Address", key: "email", icon: Mail, type: "email", placeholder: "pastor@kcmchurch.org" },
                { label: "Phone Number", key: "phone", icon: Phone, type: "tel", placeholder: "+91 XXXXX XXXXX" },
              ].map(({ label, key, icon: Icon, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-purple-500" />{label}
                  </label>
                  <input type={type} value={profile[key as keyof typeof profile]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-500" /> Bio / About
              </label>
              <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={5}
                placeholder="Write a brief pastoral biography..."
                className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none text-sm leading-relaxed" />
            </div>

            <button type="submit" disabled={saving} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50">
              {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Profile</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
