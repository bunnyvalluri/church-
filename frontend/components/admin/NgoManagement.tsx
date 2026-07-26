"use client";

import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Image as ImageIcon, 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Loader2, 
  Globe, 
  Video, 
  Phone, 
  Mail, 
  Award,
  Link as LinkIcon,
  Search,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  description: string;
  details: string;
  imageUrl: string | null;
  targetAmount: number | null;
  raisedAmount: number;
  status: string;
  createdAt: string;
}

interface MediaItem {
  id: string;
  title: string | null;
  description: string | null;
  type: string;
  url: string;
  category: string | null;
  projectId: string | null;
  createdAt: string;
}

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  skills: string | null;
  status: string;
  project: { title: string } | null;
  createdAt: string;
}

export default function NgoManagement({ activeSubView }: { activeSubView?: "projects" | "media" | "volunteers" }) {
  const [subView, setSubView] = useState<"projects" | "media" | "volunteers">(activeSubView || "projects");
  
  useEffect(() => {
    if (activeSubView) {
      setSubView(activeSubView);
    }
  }, [activeSubView]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [volunteerStatusFilter, setVolunteerStatusFilter] = useState<string>("ALL");

  // Form modals / fields
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    details: "",
    imageUrl: "",
    targetAmount: "",
    status: "ACTIVE",
  });

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaForm, setMediaForm] = useState({
    title: "",
    description: "",
    type: "IMAGE",
    url: "",
    projectId: "",
    category: "",
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [resProjects, resMedia, resVolunteers] = await Promise.all([
        fetch("/api/ngo/projects?limit=100"),
        fetch("/api/ngo/media?limit=100"),
        fetch("/api/ngo/volunteers?limit=100"),
      ]);

      if (resProjects.ok && resMedia.ok && resVolunteers.ok) {
        const dataP = await resProjects.json();
        const dataM = await resMedia.json();
        const dataV = await resVolunteers.json();
        setProjects(dataP.projects || []);
        setMedia(dataM.media || []);
        setVolunteers(dataV.volunteers || []);
      }
    } catch (err) {
      console.error("Failed to load NGO admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ──────── PROJECTS MANAGEMENT ────────
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjectForm({
      title: "",
      description: "",
      details: "",
      imageUrl: "",
      targetAmount: "",
      status: "ACTIVE",
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (proj: Project) => {
    setEditingProject(proj);
    setProjectForm({
      title: proj.title,
      description: proj.description,
      details: proj.details,
      imageUrl: proj.imageUrl || "",
      targetAmount: proj.targetAmount?.toString() || "",
      status: proj.status,
    });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const url = editingProject 
        ? `/api/ngo/projects/${editingProject.id}`
        : "/api/ngo/projects";
      const method = editingProject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });

      if (res.ok) {
        setIsProjectModalOpen(false);
        loadAllData();
      }
    } catch (err) {
      console.error("Error saving project:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this NGO Project? All associated media will also be deleted.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/ngo/projects/${id}`, { method: "DELETE" });
      if (res.ok) loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // ──────── MEDIA MANAGEMENT ────────
  const handleOpenAddMedia = () => {
    setMediaForm({
      title: "",
      description: "",
      type: "IMAGE",
      url: "",
      projectId: "",
      category: "",
    });
    setIsMediaModalOpen(true);
  };

  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/ngo/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mediaForm),
      });

      if (res.ok) {
        setIsMediaModalOpen(false);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm("Remove this media log reference?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/ngo/media/${id}`, { method: "DELETE" });
      if (res.ok) loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // ──────── VOLUNTEERS MANAGEMENT ────────
  const handleUpdateVolunteerStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/ngo/volunteers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVolunteer = async (id: string) => {
    if (!confirm("Delete volunteer record?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/ngo/volunteers/${id}`, { method: "DELETE" });
      if (res.ok) loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Derived metrics
  const activeProjectsCount = projects.filter(p => p.status === "ACTIVE").length;
  const pendingVolunteersCount = volunteers.filter(v => v.status === "PENDING").length;

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 animate-in fade-in duration-200">
      
      {/* ─── 1. Summary Stats Bar ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Outreach Campaigns</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{projects.length}</h3>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                {activeProjectsCount} Active
              </span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-xl">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Media & Video Logs</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{media.length}</h3>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                Gallery Archives
              </span>
            </div>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-xl">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Volunteers Roster</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{volunteers.length}</h3>
              {pendingVolunteersCount > 0 ? (
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-500/20 animate-pulse">
                  {pendingVolunteersCount} Pending
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10">
                  Up to date
                </span>
              )}
            </div>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── 2. Controls & Tab Navigation Bar ─── */}
      <div className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/10 p-4 sm:p-5 rounded-2xl shadow-sm backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Tab Pills */}
        <div className="p-1.5 bg-slate-100 dark:bg-[#181932] border border-slate-200 dark:border-white/10 rounded-xl flex gap-1.5 items-center w-max max-w-full overflow-x-auto select-none scrollbar-none">
          {[
            { id: "projects", label: "Projects Roster", icon: Heart },
            { id: "media", label: "Media Library Logs", icon: ImageIcon },
            { id: "volunteers", label: `Volunteer Requests ${pendingVolunteersCount > 0 ? `(${pendingVolunteersCount})` : ''}`, icon: Users },
          ].map((tab) => {
            const isActive = subView === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSubView(tab.id as any)}
                className={`py-2 px-4 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-500"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Filter ${subView}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#181932] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
            />
          </div>

          {subView === "projects" && (
            <button
              onClick={handleOpenAddProject}
              className="py-2 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          )}

          {subView === "media" && (
            <button
              onClick={handleOpenAddMedia}
              className="py-2 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Media
            </button>
          )}
        </div>

      </div>

      {/* ─── 3. Main Data View Panel ─── */}
      {loading ? (
        <div className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/10 rounded-2xl p-12 min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading NGO records...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* ────────────────── A. PROJECTS TAB ────────────────── */}
          {subView === "projects" && (
            <div className="space-y-6">
              {projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                <div className="bg-white dark:bg-[#121324] border border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-12 text-center space-y-4 shadow-sm">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-500/20">
                    <Heart className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No NGO Projects Found</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Create your first community outreach project to track field initiatives, goals, and raised funding.</p>
                  </div>
                  <button
                    onClick={handleOpenAddProject}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Create First Project
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())).map((proj) => {
                    const percentRaised = proj.targetAmount && proj.targetAmount > 0 
                      ? Math.min(100, Math.round(((proj.raisedAmount || 0) / proj.targetAmount) * 100))
                      : null;

                    return (
                      <div
                        key={proj.id}
                        className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Image or Gradient Header */}
                          <div className="relative h-44 w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 overflow-hidden">
                            {proj.imageUrl ? (
                              <img src={proj.imageUrl} alt={proj.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-white/90 text-center space-y-1">
                                <Heart className="w-8 h-8 text-white/80" />
                                <span className="text-xs font-extrabold tracking-wide uppercase">Outreach Drive</span>
                              </div>
                            )}
                            
                            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md ${
                              proj.status === "ACTIVE" 
                                ? "bg-emerald-500/90 text-white border border-emerald-400/30"
                                : proj.status === "COMPLETED"
                                ? "bg-blue-600/90 text-white border border-blue-400/30"
                                : "bg-amber-500/90 text-white border border-amber-400/30"
                            }`}>
                              {proj.status}
                            </span>
                          </div>

                          {/* Content Body */}
                          <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                {formatDate(proj.createdAt)}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {proj.title}
                            </h4>

                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">
                              {proj.description}
                            </p>

                            {/* Funding Goal Bar if set */}
                            {proj.targetAmount && proj.targetAmount > 0 && (
                              <div className="pt-2 space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span className="text-slate-600 dark:text-slate-300">Raised: ₹{(proj.raisedAmount || 0).toLocaleString('en-IN')}</span>
                                  <span className="text-indigo-600 dark:text-indigo-400">Target: ₹{proj.targetAmount.toLocaleString('en-IN')} ({percentRaised}%)</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500"
                                    style={{ width: `${percentRaised}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="p-5 pt-0 flex gap-2">
                          <button
                            onClick={() => handleOpenEditProject(proj)}
                            className="flex-1 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleDeleteProject(proj.id)}
                            className="py-2 px-3 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/30 rounded-xl text-xs font-bold flex items-center justify-center transition-all"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ────────────────── B. MEDIA TAB ────────────────── */}
          {subView === "media" && (
            <div className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121324] backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
              {/* Mobile Card View (< sm) */}
              <div className="block sm:hidden p-3 space-y-3">
                {media.filter(m => (m.title || "").toLowerCase().includes(search.toLowerCase())).map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl space-y-2.5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">{item.title || "Untitled Media"}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border shrink-0 ${
                        item.type === "IMAGE" 
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20"
                          : "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/20"
                      }`}>{item.type}</span>
                    </div>
                    
                    <p className="text-[11px] text-slate-600 dark:text-slate-300"><strong>Category:</strong> {item.category || "General Gallery"}</p>

                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-full"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.url}</span>
                    </a>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{formatDate(item.createdAt)}</span>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleDeleteMedia(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete media log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= sm) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-white/[0.02]">
                      <th className="py-4 px-6">Media Title</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Resource Link</th>
                      <th className="py-4 px-6">Created At</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {media.filter(m => (m.title || "").toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                          No media logs found. Click &quot;Add Media&quot; above to link photo feeds or video playlists.
                        </td>
                      </tr>
                    ) : (
                      media.filter(m => (m.title || "").toLowerCase().includes(search.toLowerCase())).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                            {item.title || "Untitled Media"}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                              item.type === "IMAGE" 
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20"
                                : "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/20"
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-semibold">{item.category || "General Gallery"}</td>
                          <td className="py-4 px-6 max-w-[220px]">
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-full"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{item.url}</span>
                            </a>
                          </td>
                          <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{formatDate(item.createdAt)}</td>
                          <td className="py-4 px-6 text-right">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleDeleteMedia(item.id)}
                              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete media log"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ────────────────── C. VOLUNTEERS TAB ────────────────── */}
          {subView === "volunteers" && (
            <div className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121324] backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
              {/* Mobile Card View (< sm) */}
              <div className="block sm:hidden p-3 space-y-3">
                {volunteers.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase())).map((vol) => (
                  <div key={vol.id} className="p-4 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl space-y-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-extrabold text-xs flex items-center justify-center uppercase shrink-0 shadow-sm">
                          {(vol.name || "V").substring(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">{vol.name}</h4>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{vol.project?.title || "General Outreach"}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border shrink-0 ${
                        vol.status === "APPROVED" 
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20"
                          : vol.status === "REJECTED"
                          ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20"
                          : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                      }`}>{vol.status}</span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {vol.email}</div>
                      {vol.phone && <div className="flex items-center gap-1.5 font-mono"><Phone className="w-3.5 h-3.5 text-slate-400" /> {vol.phone}</div>}
                      <p className="text-[10px] text-slate-500 pt-1">Skills: {vol.skills || "General volunteer"}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{formatDate(vol.createdAt)}</span>
                      {vol.status === "PENDING" ? (
                        <div className="flex items-center gap-2">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateVolunteerStatus(vol.id, "APPROVED")}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg font-bold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateVolunteerStatus(vol.id, "REJECTED")}
                            className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg font-bold flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Decline
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleDeleteVolunteer(vol.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= sm) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[750px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-white/[0.02]">
                      <th className="py-4 px-6">Volunteer Name</th>
                      <th className="py-4 px-6">Contact Info</th>
                      <th className="py-4 px-6">Assigned Initiative</th>
                      <th className="py-4 px-6">Skills / Notes</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Applied Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {volunteers.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                          No volunteer applications registered yet.
                        </td>
                      </tr>
                    ) : (
                      volunteers.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase())).map((vol) => (
                        <tr key={vol.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-extrabold text-xs flex items-center justify-center uppercase shrink-0 shadow-sm">
                                {(vol.name || "V").substring(0, 2)}
                              </div>
                              <span className="font-extrabold text-slate-900 dark:text-white">{vol.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                              <Mail className="w-3.5 h-3.5 text-slate-400" /> {vol.email}
                            </div>
                            {vol.phone && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                <Phone className="w-3.5 h-3.5 text-slate-400" /> {vol.phone}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 font-bold text-indigo-600 dark:text-indigo-400">
                            {vol.project?.title || "General Outreach"}
                          </td>
                          <td className="py-4 px-6 max-w-[200px] truncate text-slate-500 dark:text-slate-400 font-medium" title={vol.skills || ""}>
                            {vol.skills || "General volunteer"}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border inline-flex items-center gap-1 ${
                              vol.status === "APPROVED" 
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20"
                                : vol.status === "REJECTED"
                                ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20"
                                : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                            }`}>
                              {vol.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                              {vol.status === "PENDING" && <Clock className="w-3 h-3" />}
                              {vol.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                              {vol.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{formatDate(vol.createdAt)}</td>
                          <td className="py-4 px-6 text-right">
                            {vol.status === "PENDING" ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateVolunteerStatus(vol.id, "APPROVED")}
                                  className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-500/20 transition-all"
                                  title="Approve volunteer application"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateVolunteerStatus(vol.id, "REJECTED")}
                                  className="p-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-500/20 transition-all"
                                  title="Decline application"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                disabled={actionLoading}
                                onClick={() => handleDeleteVolunteer(vol.id)}
                                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                title="Delete application record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}


        </div>
      )}

      {/* ─── 4. MODALS FOR FORMS ─── */}
      {/* Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden text-slate-800 dark:text-slate-100 text-left animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/[0.02]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Heart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingProject ? "Update NGO Project" : "Add NGO Project"}
              </h3>
              <button 
                onClick={() => setIsProjectModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProject} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Project Title</label>
                <input 
                  type="text" required placeholder="e.g. Gandhi Hospital Food Drive" value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs bg-slate-50 dark:bg-[#181932] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Brief Description</label>
                <input 
                  type="text" required placeholder="e.g. Distributing grocery and medical kits." value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs bg-slate-50 dark:bg-[#181932] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Full Story & Impact Details</label>
                <textarea 
                  rows={3} required placeholder="Detailed story of the outreach campaign..." value={projectForm.details}
                  onChange={(e) => setProjectForm({ ...projectForm, details: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs bg-slate-50 dark:bg-[#181932] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Target Budget (INR)</label>
                  <input 
                    type="number" placeholder="e.g. 150000" value={projectForm.targetAmount}
                    onChange={(e) => setProjectForm({ ...projectForm, targetAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs bg-slate-50 dark:bg-[#181932] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Project Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs bg-slate-50 dark:bg-[#181932] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PLANNED">PLANNED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Cover Image URL</label>
                <input 
                  type="text" placeholder="https://images.unsplash.com/... or Cloudinary URL" value={projectForm.imageUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs bg-slate-50 dark:bg-[#181932] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button" onClick={() => setIsProjectModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={actionLoading}
                  className="flex-[2] py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden text-slate-800 dark:text-slate-100 text-left animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/[0.02]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Link Media File Log
              </h3>
              <button 
                onClick={() => setIsMediaModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveMedia} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Media Title</label>
                <input 
                  type="text" placeholder="e.g. Distribution photo log #1" value={mediaForm.title}
                  onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs bg-slate-50 dark:bg-[#181932] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Media Type</label>
                  <select
                    value={mediaForm.type}
                    onChange={(e) => setMediaForm({ ...mediaForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs bg-slate-50 dark:bg-[#181932] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  >
                    <option value="IMAGE">IMAGE</option>
                    <option value="VIDEO_YOUTUBE">VIDEO (YOUTUBE)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Category</label>
                  <select
                    value={mediaForm.category}
                    onChange={(e) => setMediaForm({ ...mediaForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs bg-slate-50 dark:bg-[#181932] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  >
                    <option value="">General Gallery</option>
                    <option value="GANDHI-HOSPITAL">GANDHI HOSPITAL</option>
                    <option value="NIMS-HOSPITAL">NIMS HOSPITAL</option>
                    <option value="GOVT-HOSPITAL">GOVT HOSPITAL</option>
                    <option value="ASHRAMAM">ASHRAMAMS</option>
                    <option value="DISABLED-CARE">DISABLED CARE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Associated NGO Project</label>
                <select
                  value={mediaForm.projectId}
                  onChange={(e) => setMediaForm({ ...mediaForm, projectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs bg-slate-50 dark:bg-[#181932] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                >
                  <option value="">None / Independent Media</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>{proj.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Resource Link / Embed URL</label>
                <input 
                  type="text" required placeholder="Cloudinary URL or YouTube Embed Link" value={mediaForm.url}
                  onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs bg-slate-50 dark:bg-[#181932] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button" onClick={() => setIsMediaModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={actionLoading}
                  className="flex-[2] py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save Media Reference"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
