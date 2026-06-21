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
  Link as LinkIcon
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

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      
      {/* 1. Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121324] p-6 rounded-3xl border border-slate-100 dark:border-white/[0.04] shadow-sm">
        <div className="text-left">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Heart className="w-5 h-5 text-indigo-500 fill-current" />
            KCM NGO Administration
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage your physical outreaches, YouTube/Cloudinary media feeds, and volunteer rosters.
          </p>
        </div>

        {/* Create Buttons */}
        <div className="flex gap-2">
          {subView === "projects" && (
            <button
              onClick={handleOpenAddProject}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          )}
          {subView === "media" && (
            <button
              onClick={handleOpenAddMedia}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Media
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-Tabs switching */}
      <div className="flex border-b border-slate-100 dark:border-white/[0.05] gap-4">
        {[
          { id: "projects", label: "Projects Roster", icon: Heart },
          { id: "media", label: "Media Library Logs", icon: ImageIcon },
          { id: "volunteers", label: "Volunteer Requests", icon: Users },
        ].map((tab) => {
          const isActive = subView === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                isActive
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-400 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Data Panel Rendering */}
      {loading ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* A. PROJECTS TAB */}
          {subView === "projects" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400 border border-dashed rounded-3xl border-slate-200 dark:border-white/10">
                  No NGO projects added yet. Click &quot;Add Project&quot; above to create one.
                </div>
              ) : (
                projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-white/[0.04] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {proj.imageUrl && (
                        <div className="relative aspect-video w-full">
                          <img src={proj.imageUrl} alt={proj.title} className="object-cover w-full h-full" />
                        </div>
                      )}
                      <div className="p-5 space-y-3 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-black bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full uppercase">
                            {proj.status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {formatDate(proj.createdAt)}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">{proj.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{proj.description}</p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex gap-2">
                      <button
                        onClick={() => handleOpenEditProject(proj)}
                        className="flex-1 py-2 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleDeleteProject(proj.id)}
                        className="flex-1 py-2 border border-red-200 dark:border-red-500/20 hover:bg-red-550/10 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* B. MEDIA TAB */}
          {subView === "media" && (
            <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-white/[0.04] rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-white/[0.02] text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase border-b border-slate-100 dark:border-white/[0.04]">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">URL</th>
                      <th className="px-6 py-4">Created At</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {media.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          No media logs found. Click &quot;Add Media&quot; above to link pictures or video playlists.
                        </td>
                      </tr>
                    ) : (
                      media.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                            {item.title || "Untitled"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                              item.type === "IMAGE" 
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-red-500/10 text-red-500"
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{item.category || "General"}</td>
                          <td className="px-6 py-4 max-w-[200px] truncate text-slate-400 font-mono text-[10px]">
                            {item.url}
                          </td>
                          <td className="px-6 py-4 text-gray-450">{formatDate(item.createdAt)}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleDeleteMedia(item.id)}
                              className="p-1.5 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-400"
                              title="Delete media reference"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* C. VOLUNTEERS TAB */}
          {subView === "volunteers" && (
            <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-white/[0.04] rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-white/[0.02] text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase border-b border-slate-100 dark:border-white/[0.04]">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">Assigned Initiative</th>
                      <th className="px-6 py-4">Experience / Skills</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Applied Date</th>
                      <th className="px-6 py-4 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {volunteers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                          No volunteer applications registered yet.
                        </td>
                      </tr>
                    ) : (
                      volunteers.map((vol) => (
                        <tr key={vol.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                            {vol.name}
                          </td>
                          <td className="px-6 py-4 space-y-0.5">
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Mail className="w-3 h-3" /> {vol.email}
                            </div>
                            {vol.phone && (
                              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Phone className="w-3 h-3" /> {vol.phone}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-indigo-500">
                            {vol.project?.title || "General / Any Project"}
                          </td>
                          <td className="px-6 py-4 max-w-[200px] truncate text-slate-400 leading-normal" title={vol.skills || ""}>
                            {vol.skills || "None provided"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                              vol.status === "APPROVED" 
                                ? "bg-emerald-500/10 text-emerald-500"
                                : vol.status === "REJECTED"
                                ? "bg-rose-500/10 text-rose-550"
                                : "bg-amber-500/10 text-amber-500"
                            }`}>
                              {vol.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-450">{formatDate(vol.createdAt)}</td>
                          <td className="px-6 py-4 text-right">
                            {vol.status === "PENDING" ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateVolunteerStatus(vol.id, "APPROVED")}
                                  className="p-1 hover:bg-emerald-500/20 text-emerald-500 rounded border border-emerald-500/20"
                                  title="Approve volunteer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateVolunteerStatus(vol.id, "REJECTED")}
                                  className="p-1 hover:bg-rose-500/20 text-rose-550 rounded border border-rose-550/20"
                                  title="Decline volunteer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                disabled={actionLoading}
                                onClick={() => handleDeleteVolunteer(vol.id)}
                                className="p-1.5 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-400"
                                title="Delete application record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

      {/* 4. MODALS FOR FORMS */}
      {/* Project modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden text-slate-800 dark:text-slate-100 text-left">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {editingProject ? "Update NGO Project" : "Add NGO Project"}
              </h3>
              <button 
                onClick={() => setIsProjectModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08]"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveProject} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-550 uppercase mb-1.5">Project Title</label>
                <input 
                  type="text" required placeholder="e.g. Gandhi Hospital Food Drive" value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-555 uppercase mb-1.5">Brief Description</label>
                <input 
                  type="text" required placeholder="e.g. Distributing grocery and medical kits." value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-555 uppercase mb-1.5">Full Details Story</label>
                <textarea 
                  rows={4} required placeholder="Detailed story of the outreach campaign..." value={projectForm.details}
                  onChange={(e) => setProjectForm({ ...projectForm, details: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-555 uppercase mb-1.5">Target Amount (INR)</label>
                  <input 
                    type="number" placeholder="e.g. 150000" value={projectForm.targetAmount}
                    onChange={(e) => setProjectForm({ ...projectForm, targetAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-555 uppercase mb-1.5">Project Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PLANNED">PLANNED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-555 uppercase mb-1.5">Cover Image URL</label>
                <input 
                  type="text" placeholder="https://images.unsplash.com/... or Cloudinary URL" value={projectForm.imageUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button" onClick={() => setIsProjectModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={actionLoading}
                  className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden text-slate-800 dark:text-slate-100 text-left">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Link Media File
              </h3>
              <button 
                onClick={() => setIsMediaModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08]"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveMedia} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-550 uppercase mb-1.5">Media Title (Optional)</label>
                <input 
                  type="text" placeholder="e.g. Distribution photo log #1" value={mediaForm.title}
                  onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-550 uppercase mb-1.5">Description (Optional)</label>
                <input 
                  type="text" placeholder="e.g. Packing medical aid packets." value={mediaForm.description}
                  onChange={(e) => setMediaForm({ ...mediaForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-555 uppercase mb-1.5">Media Type</label>
                  <select
                    value={mediaForm.type}
                    onChange={(e) => setMediaForm({ ...mediaForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="IMAGE">IMAGE</option>
                    <option value="VIDEO_YOUTUBE">VIDEO (YOUTUBE)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-555 uppercase mb-1.5">Category</label>
                  <select
                    value={mediaForm.category}
                    onChange={(e) => setMediaForm({ ...mediaForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">General Gallery</option>
                    <option value="GANDHI-HOSPITAL">GANDHI HOSPITAL</option>
                    <option value="NIMS-HOSPITAL">NIMS HOSPITAL</option>
                    <option value="GOVT-HOSPITAL">GOVT HOSPITAL</option>
                    <option value="ASHRAMAM">ASHRAMAMS</option>
                    <option value="DISABLED-AASHRAMAM">DISABLED CARE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-555 uppercase mb-1.5">Associated NGO Project</label>
                <select
                  value={mediaForm.projectId}
                  onChange={(e) => setMediaForm({ ...mediaForm, projectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">None / Independent Media</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>{proj.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-555 uppercase mb-1.5">Resource Link / Embed URL</label>
                <input 
                  type="text" required placeholder="Cloudinary URL or YouTube Embed Link" value={mediaForm.url}
                  onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button" onClick={() => setIsMediaModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={actionLoading}
                  className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
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
