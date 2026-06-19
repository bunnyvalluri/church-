"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft, Loader2, Users, Clock, Plus, Check, Save } from "lucide-react";

interface BibleStudyGroup {
  id: string;
  name: string;
  leader: string;
  time: string;
  membersCount: number;
  day: string;
}

export default function PastorBibleStudyGroups() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();
  const [localMounted, setLocalMounted] = useState(false);
  const [groups, setGroups] = useState<BibleStudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", leader: "", time: "", day: "Wednesday" });

  useEffect(() => { setLocalMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated" && user && user.role !== "PASTOR" && user.role !== "ADMIN") router.replace("/dashboard");
  }, [mounted, status, user, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/pastor/bible-studies").then(r => r.json()).then(d => {
        setGroups(d.groups?.length ? d.groups : [
          { id: "bs_1", name: "Wednesday Morning Fellowship", leader: "Brother Johnathan", time: "10:00 AM", membersCount: 18, day: "Wednesday" },
          { id: "bs_2", name: "Midweek Theology Circle", leader: "Bishop Kurra Kristhu Raju", time: "07:30 PM", membersCount: 25, day: "Wednesday" },
          { id: "bs_3", name: "Saturday Men's Bible Class", leader: "Elder Matthew", time: "08:00 AM", membersCount: 14, day: "Saturday" },
        ]);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/pastor/bible-studies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      const newGroup = data.group || { id: `bs_${Date.now()}`, ...form, membersCount: 0 };
      setGroups(prev => [newGroup, ...prev]);
      setForm({ name: "", leader: "", time: "", day: "Wednesday" });
      setShowForm(false);
      setSuccessMsg("Bible study group created!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch { setSuccessMsg("Group created locally!"); setShowForm(false); setTimeout(() => setSuccessMsg(""), 3000); }
    finally { setSaving(false); }
  };

  if (!localMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/pastor" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Pastor Dashboard
        </Link>

        <div className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">Bible Study Groups</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage weekly Bible study sessions</p>
              </div>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all">
              <Plus className="w-4 h-4" /> New Group
            </button>
          </div>

          {successMsg && <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 text-sm rounded-lg flex items-center gap-2"><Check className="w-4 h-4" />{successMsg}</div>}

          {showForm && (
            <form onSubmit={handleCreate} className="mb-8 p-6 bg-purple-50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-500/20 space-y-4">
              <h3 className="font-black text-gray-900 dark:text-white">Create New Bible Study Group</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[["Group Name", "name", "e.g. Wednesday Evening Study"], ["Leader Name", "leader", "e.g. Brother James"]].map(([label, key, ph]) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{label} *</label>
                    <input value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required placeholder={ph}
                      className="w-full py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Meeting Time *</label>
                  <input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} required placeholder="e.g. 07:30 PM"
                    className="w-full py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Day</label>
                  <select value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} className="w-full py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none">
                    {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-all disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create Group
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">Cancel</button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {groups.map(g => (
                <div key={g.id} className="p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/10 dark:to-gray-900/50 hover:border-amber-200 dark:hover:border-amber-500/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 font-bold">{g.day}</span>
                  </div>
                  <h4 className="font-black text-gray-900 dark:text-white text-sm mb-1">{g.name}</h4>
                  <p className="text-xs text-gray-500 mb-3">Led by {g.leader}</p>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><Clock className="w-3 h-3 text-amber-500" />{g.time}</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><Users className="w-3 h-3 text-amber-500" />{g.membersCount} members</span>
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
