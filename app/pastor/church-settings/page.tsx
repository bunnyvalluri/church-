"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings, ArrowLeft, Loader2, Check, Save, Building, Mail, Phone, MapPin, Clock, Globe } from "lucide-react";

export default function PastorChurchSettings() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();
  const [localMounted, setLocalMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [settings, setSettings] = useState({
    churchName: "Kingdom of Christ Ministries",
    tagline: "The Truth Shall Set You Free",
    primaryEmail: "kingofchristministries23@gmail.com",
    contactPhone: "+91 97040 90069",
    address: "15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad, Telangana – 500055",
    worshipServices: "Sunday: 5:45 AM | 8:30 AM | 10:30 AM",
    bilingualSupport: true,
    visitorRegistrationEnabled: true,
  });

  useEffect(() => { setLocalMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated" && user && user.role !== "PASTOR" && user.role !== "ADMIN") router.replace("/dashboard");
  }, [mounted, status, user, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/pastor/church-settings").then(r => r.json()).then(d => {
        if (d.success && d.settings) setSettings(p => ({ ...p, ...d.settings }));
      }).catch(() => {});
    }
  }, [status]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/pastor/church-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      const data = await res.json();
      if (res.ok && data.success) { setSuccessMsg("Church settings updated successfully!"); setTimeout(() => setSuccessMsg(""), 4000); }
      else throw new Error();
    } catch { setErrorMsg("Failed to save settings."); setTimeout(() => setErrorMsg(""), 4000); }
    finally { setSaving(false); }
  };

  if (!localMounted) return null;

  const fields = [
    { label: "Church Name", key: "churchName", icon: Building, type: "text", placeholder: "Full church name" },
    { label: "Tagline / Motto", key: "tagline", icon: Globe, type: "text", placeholder: "Church motto or vision statement" },
    { label: "Primary Email", key: "primaryEmail", icon: Mail, type: "email", placeholder: "church@email.com" },
    { label: "Contact Phone", key: "contactPhone", icon: Phone, type: "tel", placeholder: "+91 XXXXX XXXXX" },
    { label: "Church Address", key: "address", icon: MapPin, type: "text", placeholder: "Full address" },
    { label: "Worship Service Times", key: "worshipServices", icon: Clock, type: "text", placeholder: "e.g. Sunday: 10:00 AM, 12:30 PM" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link href="/pastor" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Pastor Dashboard
        </Link>

        <div className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl p-8 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Settings className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">Church Settings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage church information and configuration</p>
            </div>
          </div>

          {successMsg && <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 text-sm rounded-lg flex items-center gap-2"><Check className="w-4 h-4" />{successMsg}</div>}
          {errorMsg && <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded-lg">{errorMsg}</div>}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {fields.map(({ label, key, icon: Icon, type, placeholder }) => (
                <div key={key} className={key === "address" || key === "worshipServices" ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-purple-500" />{label}
                  </label>
                  <input type={type} value={settings[key as keyof typeof settings] as string}
                    onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" />
                </div>
              ))}
            </div>

            {/* Toggle Settings */}
            <div className="space-y-4 p-6 bg-purple-50/50 dark:bg-purple-950/10 rounded-2xl border border-purple-100 dark:border-purple-500/10">
              <h3 className="font-black text-gray-900 dark:text-white text-sm">Feature Toggles</h3>
              {[
                { key: "bilingualSupport", label: "Bilingual Support (English / Telugu)", desc: "Enable multilingual content across the portal" },
                { key: "visitorRegistrationEnabled", label: "Visitor Registration", desc: "Allow new visitors to register through the website" },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-start justify-between gap-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input type="checkbox" className="sr-only" checked={settings[key as keyof typeof settings] as boolean}
                      onChange={e => setSettings(p => ({ ...p, [key]: e.target.checked }))} />
                    <div onClick={() => setSettings(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                      className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${settings[key as keyof typeof settings] ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${settings[key as keyof typeof settings] ? "translate-x-6" : "translate-x-1"}`} />
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <button type="submit" disabled={saving} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50">
              {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving Settings...</> : <><Save className="w-5 h-5" /> Save Church Settings</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
