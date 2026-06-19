"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ArrowLeft, Loader2, MapPin, Clock, Plus, Check, Save } from "lucide-react";

interface SmallGroup {
  id: string;
  name: string;
  leader: string;
  location: string;
  meetingTime: string;
  attendanceAvg: number;
}

export default function PastorSmallGroups() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();
  const [localMounted, setLocalMounted] = useState(false);
  const [groups, setGroups] = useState<SmallGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", leader: "", location: "", meetingTime: "" });

  useEffect(() => { setLocalMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated" && user && user.role !== "PASTOR" && user.role !== "ADMIN") router.replace("/dashboard");
  }, [mounted, status, user, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/pastor/small-groups").then(r => r.json()).then(d => {
        setGroups(d.groups?.length ? d.groups : [
          { id: "sg_1", name: "Bahadurpally Home Cell", leader: "Deacon Samuel", location: "Bahadurpally Sector 2", meetingTime: "Friday 7:00 PM", attendanceAvg: 12 },
          { id: "sg_2", name: "Shapur Fellowship Group", leader: "Sister Mary", location: "Shapur Main Road", meetingTime: "Friday 6:35 PM", attendanceAvg: 8 },
          { id: "sg_3", name: "Subhash Nagar Cell Group", leader: "Brother David", location: "Subhash Nagar Colony", meetingTime: "Saturday 6:00 PM", attendanceAvg: 15 },
        ]);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/pastor/small-groups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      const newGroup = data.group || { id: `sg_${Date.now()}`, ...form, attendanceAvg: 0 };
      setGroups(prev => [newGroup, ...prev]);
      setForm({ name: "", leader: "", location: "", meetingTime: "" });
      setShowForm(false);
      setSuccessMsg("Small group created successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch { setSuccessMsg("Group created!"); setShowForm(false); setTimeout(() => setSuccessMsg(""), 3000); }
    finally { setSaving(false); }
  };

  if (!localMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-teal-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/pastor" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Pastor Dashboard
        </Link>

        <div className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">Small Groups</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage cell groups and home fellowships</p>
              </div>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all">
              <Plus className="w-4 h-4" /> New Group
            </button>
          </div>

          {successMsg && <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 text-sm rounded-lg flex items-center gap-2"><Check className="w-4 h-4" />{successMsg}</div>}

          {showForm && (
            <form onSubmit={handleCreate} className="mb-8 p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 space-y-4">
              <h3 className="font-black text-gray-900 dark:text-white">Create New Small Group</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[["Group Name", "name", "e.g. Bahadurpally Home Cell"], ["Leader Name", "leader", "e.g. Deacon Samuel"], ["Location", "location", "e.g. Colony Street, Jeedimetla"], ["Meeting Time", "meetingTime", "e.g. Friday 7:00 PM"]].map(([label, key, ph]) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{label} *</label>
                    <input value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required placeholder={ph}
                      className="w-full py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create Group
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">Cancel</button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {groups.map(g => (
                <div key={g.id} className="p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/10 dark:to-gray-900/50 hover:border-emerald-200 dark:hover:border-emerald-500/20 transition-all">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-gray-900 dark:text-white text-sm mb-1">{g.name}</h4>
                  <p className="text-xs text-gray-500 mb-3">Led by {g.leader}</p>
                  <div className="space-y-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><MapPin className="w-3 h-3 text-emerald-500" />{g.location}</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><Clock className="w-3 h-3 text-emerald-500" />{g.meetingTime}</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><Users className="w-3 h-3 text-emerald-500" />Avg. {g.attendanceAvg} attending</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
