"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

// ── Validation schema ──────────────────────────────────────────────────────────
const EventFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().default("09:00"),
  location: z.string().min(2, "Location is required"),
  category: z.enum(["WORSHIP", "PRAYER", "YOUTH", "CHILDREN", "WOMEN", "MEN", "SPECIAL"]),
  branchId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  image: z.string().optional(),
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
  { value: "WORSHIP", label: "Worship", emoji: "🙏" },
  { value: "PRAYER", label: "Prayer", emoji: "📿" },
  { value: "YOUTH", label: "Youth", emoji: "⚡" },
  { value: "CHILDREN", label: "Children", emoji: "🌟" },
  { value: "WOMEN", label: "Women", emoji: "🌸" },
  { value: "MEN", label: "Men", emoji: "💪" },
  { value: "SPECIAL", label: "Special", emoji: "✨" },
] as const;

export default function EventForm({
  initialData,
  branches = [],
  onSubmit,
  onCancel,
  isEditMode = false,
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    date: initialData?.date || "",
    time: initialData?.time || "09:00",
    location: initialData?.location || "",
    category: initialData?.category || "WORSHIP",
    branchId: initialData?.branchId || "",
    status: initialData?.status || "PUBLISHED",
    image: initialData?.image || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validate = (): boolean => {
    const result = EventFormSchema.safeParse(formData);
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
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      if (!isEditMode) {
        // Reset on create
        setFormData({
          title: "", description: "", date: "", time: "09:00",
          location: "", category: "WORSHIP", branchId: "", status: "PUBLISHED", image: "",
        });
      }
    } catch (err: any) {
      setErrors({ _global: err.message || "Failed to save event." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all ${
      errors[field]
        ? "border-rose-400 dark:border-rose-600/50 bg-rose-50/50 dark:bg-rose-950/10"
        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/15"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Global error */}
      {errors._global && (
        <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 rounded-2xl p-4 text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-4.5 h-4.5 mt-0.5 shrink-0" />
          <p className="text-xs font-semibold leading-relaxed">{errors._global}</p>
        </div>
      )}

      {/* Success banner */}
      {submitSuccess && (
        <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-4 text-emerald-700 dark:text-emerald-400 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
          <p className="text-xs font-semibold">
            Event {isEditMode ? "updated" : "created"} successfully! 🎉
          </p>
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Type className="w-3 h-3" /> Event Title *
        </label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Sunday Outreach — Shapur Nagar"
          className={inputCls("title")}
        />
        {errors.title && <p className="text-[10px] text-rose-500 font-semibold">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <FileText className="w-3 h-3" /> Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Describe the event — purpose, activities, who should attend..."
          className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all resize-none ${
            errors.description
              ? "border-rose-400 dark:border-rose-600/50"
              : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/15"
          }`}
        />
        {errors.description && <p className="text-[10px] text-rose-500 font-semibold">{errors.description}</p>}
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Calendar className="w-3 h-3" /> Event Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={inputCls("date")}
          />
          {errors.date && <p className="text-[10px] text-rose-500 font-semibold">{errors.date}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Clock className="w-3 h-3" /> Time
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={inputCls("time")}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <MapPin className="w-3 h-3" /> Location *
        </label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., Shapur Nagar Community Hall, Hyderabad"
          className={inputCls("location")}
        />
        {errors.location && <p className="text-[10px] text-rose-500 font-semibold">{errors.location}</p>}
      </div>

      {/* Category & Branch */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Tag className="w-3 h-3" /> Category *
          </label>
          <select name="category" value={formData.category} onChange={handleChange} className={inputCls("category")}>
            {CATEGORIES.map((c) => (
              <option
                key={c.value}
                value={c.value}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </div>

        {branches.length > 0 && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Building2 className="w-3 h-3" /> Branch
            </label>
            <select name="branchId" value={formData.branchId || ""} onChange={handleChange} className={inputCls("branchId")}>
              <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Branches</option>
              {branches.map((b) => (
                <option
                  key={b.id}
                  value={b.id}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Globe className="w-3 h-3" /> Publication Status
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["PUBLISHED", "DRAFT"] as const).map((s) => (
            <label
              key={s}
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                formData.status === s
                  ? s === "PUBLISHED"
                    ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/10"
                    : "border-slate-400/30 bg-slate-50 dark:bg-slate-950/30"
                  : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/15"
              }`}
            >
              <input
                type="radio"
                name="status"
                value={s}
                checked={formData.status === s}
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                formData.status === s
                  ? s === "PUBLISHED" ? "border-emerald-500 bg-emerald-500" : "border-slate-500 bg-slate-500"
                  : "border-slate-300 dark:border-white/20"
              }`}>
                {formData.status === s && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  {s === "PUBLISHED" ? "Publish Now" : "Save as Draft"}
                </p>
                <p className="text-[9px] text-slate-400 font-medium">
                  {s === "PUBLISHED" ? "Visible on landing page" : "Hidden until published"}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Cover image URL */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <ImageIcon className="w-3 h-3" /> Cover Image URL (optional)
        </label>
        <input
          name="image"
          value={formData.image || ""}
          onChange={handleChange}
          placeholder="https://res.cloudinary.com/..."
          className={inputCls("image")}
        />
        <p className="text-[9px] text-slate-400 font-medium">
          You can upload photos after creating the event using the Upload Images button.
        </p>
      </div>

      {/* Submit buttons */}
      <div className="flex items-center gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold transition-all shadow-lg hover:shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
