"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  BookOpen,
  Tag,
  Calendar,
  Link as LinkIcon,
  Upload,
  Image as ImageIcon,
  Video,
} from "lucide-react";

interface SermonInlineFormProps {
  onClose: () => void;
  onSuccess: (title: string) => void;
  isEditMode?: boolean;
  initialData?: any;
}

const SERMON_CATEGORIES = [
  "Faith",
  "Prayer",
  "Grace",
  "Evangelism",
  "Holy Spirit",
  "Transformation",
  "Worship",
  "Youth",
  "Family",
  "Prophecy",
  "Other",
];

export default function SermonInlineForm({ onClose, onSuccess, isEditMode = false, initialData }: SermonInlineFormProps) {
  const { getIdToken } = useAuth();

  const [title, setTitle] = useState(initialData?.title || "");
  const [pastor, setPastor] = useState(initialData?.pastor || "");
  const [scripture, setScripture] = useState(initialData?.tags?.[0] || "");
  const [category, setCategory] = useState(initialData?.category || "Faith");
  const [sermonDate, setSermonDate] = useState(
    initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : ""
  );
  const [description, setDescription] = useState(initialData?.description || "");
  
  // Video Mode: "URL" or "FILE"
  const [videoMode, setVideoMode] = useState<"URL" | "FILE">("URL");
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Thumbnail
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnail || null);

  // Submission / Loading State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Sermon title is required."); return; }
    if (!pastor.trim()) { setError("Pastor name is required."); return; }
    if (!sermonDate) { setError("Sermon date is required."); return; }

    setIsSubmitting(true);
    setError(null);
    setUploadStep("Preparing upload data...");

    try {
      const token = await getIdToken();
      const formData = new FormData();
      formData.append("title", title);
      formData.append("pastor", pastor);
      formData.append("scripture", scripture);
      formData.append("category", category);
      formData.append("description", description || `Sermon by ${pastor} — ${scripture || category}`);
      formData.append("sermonDate", sermonDate);

      if (thumbnailFile) {
        setUploadStep("Uploading sermon thumbnail to Cloudinary...");
        formData.append("thumbnailFile", thumbnailFile);
      }

      if (videoMode === "URL") {
        formData.append("videoUrl", videoUrl);
      } else if (videoFile) {
        setUploadStep("Uploading video recording to Cloudinary (this may take a moment)...");
        formData.append("videoFile", videoFile);
      }

      setUploadStep(isEditMode ? "Saving sermon updates..." : "Saving sermon details & broadcasting real-time notification...");

      const url = isEditMode ? `/api/pastor/sermons?id=${initialData.id}` : "/api/pastor/sermons";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${isEditMode ? "update" : "create"} sermon.`);
      }

      setUploadStep("Done!");
      onSuccess(title);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setUploadStep("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    "w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
          <FileText className="w-3.5 h-3.5" /> Sermon Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Walking in Faith — Matthew 5:1"
          className={inputBase}
          disabled={isSubmitting}
        />
      </div>

      {/* Pastor */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
          <User className="w-3.5 h-3.5" /> Pastor / Speaker <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={pastor}
          onChange={(e) => setPastor(e.target.value)}
          placeholder="e.g. Pastor Samuel Valluri"
          className={inputBase}
          disabled={isSubmitting}
        />
      </div>

      {/* Scripture + Category row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Scripture
          </label>
          <input
            type="text"
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
            placeholder="e.g. John 3:16"
            className={inputBase}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
            <Tag className="w-3.5 h-3.5" /> Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputBase}
            disabled={isSubmitting}
          >
            {SERMON_CATEGORIES.map((c) => (
              <option
                key={c}
                value={c}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
          <Calendar className="w-3.5 h-3.5" /> Sermon Date <span className="text-rose-500">*</span>
        </label>
        <input
          type="date"
          value={sermonDate}
          onChange={(e) => setSermonDate(e.target.value)}
          className={inputBase}
          disabled={isSubmitting}
        />
      </div>

      {/* Video Source Option */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
          <Video className="w-3.5 h-3.5" /> Video Resource
        </label>
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl mb-3">
          <button
            type="button"
            onClick={() => setVideoMode("URL")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              videoMode === "URL"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
            disabled={isSubmitting}
          >
            Video URL (YouTube)
          </button>
          <button
            type="button"
            onClick={() => setVideoMode("FILE")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              videoMode === "FILE"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
            disabled={isSubmitting}
          >
            Upload Video File
          </button>
        </div>

        {videoMode === "URL" ? (
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className={inputBase}
            disabled={isSubmitting}
          />
        ) : (
          <div className="relative border border-dashed border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-150 transition-all">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isSubmitting}
            />
            <Upload className="w-6 h-6 text-slate-400 mb-2" />
            <span className="text-xs font-bold text-slate-655 dark:text-slate-400">
              {videoFile ? videoFile.name : "Select or drag video file"}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Upload */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> Sermon Thumbnail
        </label>
        <div className="flex gap-4 items-center">
          {thumbnailPreview && (
            <div className="w-20 h-12 relative rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 flex-shrink-0">
              <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="relative flex-1 border border-dashed border-slate-200 dark:border-white/10 rounded-xl p-3 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-150 transition-all">
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isSubmitting}
            />
            <Upload className="w-5 h-5 text-slate-400 mb-1" />
            <span className="text-[11px] font-bold text-slate-655 dark:text-slate-400">
              {thumbnailFile ? thumbnailFile.name : "Choose cover image"}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
          <FileText className="w-3.5 h-3.5" /> Description / Notes
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Brief summary or key points of this sermon..."
          className={`${inputBase} resize-none`}
          disabled={isSubmitting}
        />
      </div>

      {/* Submit Steps / Loading Progress */}
      {isSubmitting && (
        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/20 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            <span>{uploadStep}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 animate-pulse w-2/3 rounded-full" />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 rounded-xl transition-all shadow-lg shadow-rose-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {isEditMode ? "Saving..." : "Uploading..."}
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isEditMode ? "Save Changes" : "Create Sermon"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
