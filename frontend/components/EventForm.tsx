"use client";

import React, { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import {
  Calendar,
  MapPin,
  FileText,
  Tag,
  Building2,
  Clock,
  Type,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Shield,
  User,
  Phone,
  Mail,
  ListPlus,
  Palette,
  Eye,
  Search,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

// ── Validation schema ──────────────────────────────────────────────────────────
const EventFormSchema = z.object({
  title: z.string().min(2, "Event name must be at least 2 characters"),
  slug: z.string().optional(),
  shortDescription: z.string().max(200, "Short description can be max 200 chars").optional().nullable(),
  description: z.string().min(10, "Full description must be at least 10 characters"),
  date: z.string().min(1, "Start Date is required"),
  endDate: z.string().optional().nullable(),
  time: z.string().default("09:00"),
  endTime: z.string().optional().nullable(),
  timezone: z.string().default("Asia/Kolkata"),
  location: z.string().min(2, "Venue is required"),
  googleMapsUrl: z.string().optional().nullable(),
  category: z.string().min(1, "Category is required"),
  organizer: z.string().optional().nullable(),
  speaker: z.string().optional().nullable(),
  pastor: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  registrationRequired: z.boolean().default(false),
  registrationLimit: z.number().optional().nullable(),
  image: z.string().optional().nullable(), // Cover image URL
  coverImagePublicId: z.string().optional().nullable(),
  eventBanner: z.string().optional().nullable(),
  eventBannerPublicId: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  colorTheme: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED", "ARCHIVED"]).default("DRAFT"),
  visibility: z.enum(["PUBLIC", "MEMBERS_ONLY", "PRIVATE"]).default("PUBLIC"),
  registrationOpenDate: z.string().optional().nullable(),
  registrationCloseDate: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
});

export type EventFormData = z.infer<typeof EventFormSchema>;

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  branches?: { id: string; name: string }[];
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel?: () => void;
  isEditMode?: boolean;
}

const CATEGORIES = [
  { value: "service", label: "Service", emoji: "⛪" },
  { value: "conference", label: "Conference", emoji: "🎤" },
  { value: "youth", label: "Youth", emoji: "⚡" },
  { value: "prayer", label: "Prayer", emoji: "🙏" },
  { value: "womens-fellowship", label: "Women's Fellowship", emoji: "🌸" },
  { value: "mens-fellowship", label: "Men's Fellowship", emoji: "💪" },
  { value: "children", label: "Children", emoji: "🌟" },
  { value: "bible-study", label: "Bible Study", emoji: "📖" },
  { value: "outreach", label: "Outreach", emoji: "❤️" },
  { value: "ngo", label: "NGO", emoji: "🤝" },
  { value: "camp", label: "Camp", emoji: "⛺" },
  { value: "special-meeting", label: "Special Meeting", emoji: "✨" },
];

const PRESETS = [
  { label: "Indigo Glow", value: "from-indigo-600 to-violet-600 bg-indigo-600" },
  { label: "Emerald Breeze", value: "from-emerald-600 to-teal-500 bg-emerald-600" },
  { label: "Sunset Amber", value: "from-orange-500 to-rose-500 bg-orange-500" },
  { label: "Ocean Blue", value: "from-sky-500 to-blue-600 bg-sky-500" },
  { label: "Amethyst Violet", value: "from-fuchsia-600 to-pink-500 bg-fuchsia-600" },
];

export default function EventForm({
  initialData,
  branches = [],
  onSubmit,
  onCancel,
  isEditMode = false,
}: EventFormProps) {
  const { getIdToken } = useAuth();
  
  // Format initial strings
  const formatInitialDate = (dateVal: any) => {
    if (!dateVal) return "";
    if (typeof dateVal === "string") return dateVal.split("T")[0];
    return new Date(dateVal).toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    shortDescription: initialData?.shortDescription || "",
    description: initialData?.description || "",
    date: formatInitialDate(initialData?.date),
    endDate: formatInitialDate(initialData?.endDate),
    time: initialData?.time || "09:00",
    endTime: initialData?.endTime || "",
    timezone: initialData?.timezone || "Asia/Kolkata",
    location: initialData?.location || "",
    googleMapsUrl: initialData?.googleMapsUrl || "",
    category: initialData?.category || "service",
    organizer: initialData?.organizer || "",
    speaker: initialData?.speaker || "",
    pastor: initialData?.pastor || "",
    contactPerson: initialData?.contactPerson || "",
    contactPhone: initialData?.contactPhone || "",
    contactEmail: initialData?.contactEmail || "",
    registrationRequired: initialData?.registrationRequired || false,
    registrationLimit: initialData?.registrationLimit || null,
    image: initialData?.image || "",
    coverImagePublicId: initialData?.coverImagePublicId || "",
    eventBanner: initialData?.eventBanner || "",
    eventBannerPublicId: initialData?.eventBannerPublicId || "",
    tags: initialData?.tags || [],
    featured: initialData?.featured || false,
    priority: initialData?.priority || "NORMAL",
    colorTheme: initialData?.colorTheme || PRESETS[0].value,
    status: initialData?.status || "DRAFT",
    visibility: initialData?.visibility || "PUBLIC",
    registrationOpenDate: formatInitialDate(initialData?.registrationOpenDate),
    registrationCloseDate: formatInitialDate(initialData?.registrationCloseDate),
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    branchId: initialData?.branchId || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [tagInput, setTagInput] = useState(initialData?.tags?.join(", ") || "");

  // Cloudinary uploading state
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const validate = useCallback((): boolean => {
    // Parse tags array
    const parsedTags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    
    const dataToValidate = {
      ...formData,
      tags: parsedTags,
      registrationLimit: formData.registrationLimit ? Number(formData.registrationLimit) : null,
    };

    const result = EventFormSchema.safeParse(dataToValidate);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        errs[e.path[0] as string] = e.message;
      });
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  }, [formData, tagInput]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  }, [errors]);

  // Handle cover image and banner uploads to Cloudinary
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "cover" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "cover") setIsUploadingCover(true);
    else setIsUploadingBanner(true);

    try {
      const token = await getIdToken();
      const fd = new FormData();
      fd.append("file", file);
      if (formData.branchId) {
        const selectedBranch = branches.find((b) => b.id === formData.branchId);
        if (selectedBranch) fd.append("branchName", selectedBranch.name);
      }

      const res = await fetch("/api/upload/event-image", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data.success) {
        if (field === "cover") {
          setFormData((prev) => ({
            ...prev,
            image: data.cloudinary.url,
            coverImagePublicId: data.cloudinary.publicId,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            eventBanner: data.cloudinary.url,
            eventBannerPublicId: data.cloudinary.publicId,
          }));
        }
      }
    } catch (err: any) {
      alert("Media upload failed. Please try again.");
    } finally {
      setIsUploadingCover(false);
      setIsUploadingBanner(false);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const parsedTags = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await onSubmit({
        ...formData,
        tags: parsedTags,
        registrationLimit: formData.registrationLimit ? Number(formData.registrationLimit) : null,
      });
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: any) {
      setErrors({ _global: err.message || "Failed to save event." });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, tagInput, onSubmit, validate]);

  const inputCls = (field: string) =>
    `w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all ${
      errors[field]
        ? "border-rose-400 dark:border-rose-600/50 bg-rose-50/50 dark:bg-rose-950/10"
        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/15"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
      {/* Global Error Banner */}
      {errors._global && (
        <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 rounded-2xl p-4 text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-4.5 h-4.5 mt-0.5 shrink-0" />
          <p className="text-xs font-semibold leading-relaxed">{errors._global}</p>
        </div>
      )}

      {/* Success Banner */}
      {submitSuccess && (
        <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-4 text-emerald-700 dark:text-emerald-400 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
          <p className="text-xs font-semibold">
            Event {isEditMode ? "updated" : "created"} successfully! 🎉
          </p>
        </div>
      )}

      {/* Section: Basic Details */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 pb-1 border-b border-slate-100 dark:border-white/5 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5" /> Basic Details
        </h4>
        
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Event Name *</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="KCM Sunday Service, Worship Night, Youth Camp..."
            className={inputCls("title")}
          />
          {errors.title && <p className="text-[10px] text-rose-500 font-semibold">{errors.title}</p>}
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">URL Slug (leave blank to auto-generate)</label>
          <input
            name="slug"
            value={formData.slug || ""}
            onChange={handleChange}
            placeholder="e.g. youth-camp-2026"
            className={inputCls("slug")}
          />
        </div>

        {/* Category & Branch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1"><Tag className="w-3 h-3" /> Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} className={inputCls("category")}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1"><Building2 className="w-3 h-3" /> Branch</label>
            <select name="branchId" value={formData.branchId || ""} onChange={handleChange} className={inputCls("branchId")}>
              <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Branches (General)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Short & Full Description */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Short Description (Summary)</label>
          <input
            name="shortDescription"
            value={formData.shortDescription || ""}
            onChange={handleChange}
            placeholder="A brief 1-sentence summary of the event (max 200 characters)..."
            className={inputCls("shortDescription")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1"><FileText className="w-3 h-3" /> Full Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Provide a detailed description of the event, schedule, expectations..."
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all resize-none"
          />
          {errors.description && <p className="text-[10px] text-rose-500 font-semibold">{errors.description}</p>}
        </div>
      </div>

      {/* Section: Schedule & Location */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 pb-1 border-b border-slate-100 dark:border-white/5 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Schedule & Location
        </h4>

        {/* Date & End Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Start Date *</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputCls("date")} />
            {errors.date && <p className="text-[10px] text-rose-500 font-semibold">{errors.date}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">End Date</label>
            <input type="date" name="endDate" value={formData.endDate || ""} onChange={handleChange} className={inputCls("endDate")} />
          </div>
        </div>

        {/* Times & Timezone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Start Time</label>
            <input type="time" name="time" value={formData.time} onChange={handleChange} className={inputCls("time")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> End Time</label>
            <input type="time" name="endTime" value={formData.endTime || ""} onChange={handleChange} className={inputCls("endTime")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1"><Globe className="w-3 h-3" /> Timezone</label>
            <input name="timezone" value={formData.timezone} onChange={handleChange} placeholder="Asia/Kolkata" className={inputCls("timezone")} />
          </div>
        </div>

        {/* Venue & Maps URL */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> Venue (Location) *</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Shapur Nagar Church Hall"
            className={inputCls("location")}
          />
          {errors.location && <p className="text-[10px] text-rose-500 font-semibold">{errors.location}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Google Maps Embed/Search Link</label>
          <input
            name="googleMapsUrl"
            value={formData.googleMapsUrl || ""}
            onChange={handleChange}
            placeholder="https://maps.google.com/..."
            className={inputCls("googleMapsUrl")}
          />
        </div>
      </div>

      {/* Section: Contacts & Roles */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 pb-1 border-b border-slate-100 dark:border-white/5 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" /> Contacts & Organizers
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Organizer Name</label>
            <input name="organizer" value={formData.organizer || ""} onChange={handleChange} placeholder="Media Team, Youth Council..." className={inputCls("organizer")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Speaker</label>
            <input name="speaker" value={formData.speaker || ""} onChange={handleChange} placeholder="Guest Preacher, Pastor..." className={inputCls("speaker")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Assigned Pastor</label>
            <input name="pastor" value={formData.pastor || ""} onChange={handleChange} placeholder="Pastor Joseph, etc." className={inputCls("pastor")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1"><User className="w-3 h-3" /> Contact Person</label>
            <input name="contactPerson" value={formData.contactPerson || ""} onChange={handleChange} placeholder="Brother John..." className={inputCls("contactPerson")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone Number</label>
            <input name="contactPhone" value={formData.contactPhone || ""} onChange={handleChange} placeholder="+91 98765 43210" className={inputCls("contactPhone")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" /> Contact Email</label>
            <input type="email" name="contactEmail" value={formData.contactEmail || ""} onChange={handleChange} placeholder="info@kcm.org" className={inputCls("contactEmail")} />
          </div>
        </div>
      </div>

      {/* Section: Upload Media & Design */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 pb-1 border-b border-slate-100 dark:border-white/5 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> Media Uploads & Design
        </h4>

        {/* Cover Image Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-white/5 rounded-2xl">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Cover Image</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "cover")}
                className="hidden"
                id="cover-file-input"
              />
              <label
                htmlFor="cover-file-input"
                className="cursor-pointer h-10 px-4 rounded-xl border border-violet-500/30 hover:border-violet-500 text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-500/5 hover:bg-violet-500/10 flex items-center gap-2 transition-all"
              >
                {isUploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                {formData.image ? "Change Cover Image" : "Upload Cover Image"}
              </label>
              {formData.image && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
            {formData.image && (
              <img src={formData.image} alt="Cover Preview" className="h-16 w-32 object-cover rounded-xl mt-2 border border-slate-200/50 dark:border-white/10" />
            )}
          </div>

          {/* Banner Image Upload */}
          <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-white/5 rounded-2xl">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Event Wide Banner</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "banner")}
                className="hidden"
                id="banner-file-input"
              />
              <label
                htmlFor="banner-file-input"
                className="cursor-pointer h-10 px-4 rounded-xl border border-violet-500/30 hover:border-violet-500 text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-500/5 hover:bg-violet-500/10 flex items-center gap-2 transition-all"
              >
                {isUploadingBanner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                {formData.eventBanner ? "Change Banner" : "Upload Banner"}
              </label>
              {formData.eventBanner && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
            {formData.eventBanner && (
              <img src={formData.eventBanner} alt="Banner Preview" className="h-16 w-32 object-cover rounded-xl mt-2 border border-slate-200/50 dark:border-white/10" />
            )}
          </div>
        </div>

        {/* Color Theme & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1"><Palette className="w-3 h-3" /> Color Theme (Tailwind Gradient Class)</label>
            <select name="colorTheme" value={formData.colorTheme || ""} onChange={handleChange} className={inputCls("colorTheme")}>
              {PRESETS.map((p) => (
                <option key={p.value} value={p.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{p.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Tags (comma-separated)</label>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. sermon, prayer, Jeedimetla"
              className={inputCls("tags")}
            />
          </div>
        </div>
      </div>

      {/* Section: Capacity & Registrations */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 pb-1 border-b border-slate-100 dark:border-white/5 flex items-center gap-1.5">
          <ListPlus className="w-3.5 h-3.5" /> Capacity & Registration Settings
        </h4>
        
        <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-white/5 rounded-2xl">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="registrationRequired"
              checked={formData.registrationRequired}
              onChange={handleChange}
              className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300 dark:border-white/10"
            />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">Registration Required</p>
              <p className="text-[9px] text-slate-400 font-medium">Tick if members need a ticket to attend this event</p>
            </div>
          </label>
        </div>

        {formData.registrationRequired && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Seats Capacity Limit</label>
                <input
                  type="number"
                  name="registrationLimit"
                  value={formData.registrationLimit || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, registrationLimit: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="e.g. 200"
                  className={inputCls("registrationLimit")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Registration Open Date</label>
                <input type="date" name="registrationOpenDate" value={formData.registrationOpenDate || ""} onChange={handleChange} className={inputCls("registrationOpenDate")} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Registration Close Date</label>
                <input type="date" name="registrationCloseDate" value={formData.registrationCloseDate || ""} onChange={handleChange} className={inputCls("registrationCloseDate")} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section: Publishing & Security */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 pb-1 border-b border-slate-100 dark:border-white/5 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> Publishing & Visibility Settings
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1"><Eye className="w-3 h-3" /> Visibility</label>
            <select name="visibility" value={formData.visibility} onChange={handleChange} className={inputCls("visibility")}>
              <option value="PUBLIC" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Public (Visible to All)</option>
              <option value="MEMBERS_ONLY" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Members Only (Requires Login)</option>
              <option value="PRIVATE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Private (Invite Link Only)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Priority Level</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className={inputCls("priority")}>
              <option value="LOW" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Low Priority</option>
              <option value="NORMAL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Normal Priority</option>
              <option value="HIGH" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">High Priority</option>
              <option value="URGENT" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Urgent Priority</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1"><Globe className="w-3 h-3" /> Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className={inputCls("status")}>
              <option value="DRAFT" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Draft (Hidden)</option>
              <option value="PUBLISHED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Published (Visible)</option>
              <option value="CANCELLED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Cancelled</option>
              <option value="COMPLETED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Completed</option>
              <option value="ARCHIVED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Archived</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-white/5 rounded-2xl">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300 dark:border-white/10"
            />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">Feature this Event</p>
              <p className="text-[9px] text-slate-400 font-medium">Pin this event to the prominent featured positions on the landing page</p>
            </div>
          </label>
        </div>
      </div>

      {/* Section: SEO Tags */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 pb-1 border-b border-slate-100 dark:border-white/5 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" /> SEO Settings
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">SEO Custom Title</label>
            <input name="seoTitle" value={formData.seoTitle || ""} onChange={handleChange} placeholder="Custom SEO browser title..." className={inputCls("seoTitle")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">SEO Custom Meta Description</label>
            <input name="seoDescription" value={formData.seoDescription || ""} onChange={handleChange} placeholder="Custom meta description for search engines..." className={inputCls("seoDescription")} />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 pt-4 sticky bottom-0 bg-white dark:bg-[#0f1021] py-3 border-t border-slate-100 dark:border-white/5">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || isUploadingCover || isUploadingBanner}
          className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold transition-all shadow-lg hover:shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEditMode ? "Saving..." : "Creating Event..."}
            </>
          ) : (
            <>{isEditMode ? "Save Changes" : "Create Event"}</>
          )}
        </button>
      </div>
    </form>
  );
}
