"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon, CheckCircle2, AlertCircle, Loader2, Film } from "lucide-react";

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  progress?: number;
}

interface UploadSectionProps {
  eventId: string;
  onUploadComplete?: (count: number) => void;
  onClose?: () => void;
  maxFiles?: number;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const TYPE_LABELS: Record<string, string> = {
  "image/jpeg": "JPEG",
  "image/jpg": "JPEG",
  "image/png": "PNG",
  "image/webp": "WebP",
};

const UploadSection = React.memo(function UploadSection({
  eventId,
  onUploadComplete,
  onClose,
  maxFiles = 10,
}: UploadSectionProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<{
    success: number;
    failed: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (rawFiles: FileList | File[]) => {
      const incoming = Array.from(rawFiles);
      const newItems: UploadFile[] = [];

      for (const file of incoming) {
        if (files.length + newItems.length >= maxFiles) break;

        let error: string | undefined;
        if (!ALLOWED_TYPES.includes(file.type)) {
          error = `Invalid type: ${file.type || "unknown"}. Use JPEG, PNG or WebP.`;
        } else if (file.size > MAX_SIZE) {
          error = `Too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max 5MB.`;
        }

        newItems.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          status: error ? "error" : "pending",
          error,
        });
      }

      setFiles((prev) => [...prev, ...newItems]);
    },
    [files.length, maxFiles]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = ""; // Reset so same file can be re-added
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const uploadAll = async (getIdToken: () => Promise<string | null>) => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    setUploadSummary(null);

    // Mark all as uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "pending" ? { ...f, status: "uploading", progress: 0 } : f
      )
    );

    const formData = new FormData();
    pendingFiles.forEach((f) => formData.append("images[]", f.file));

    try {
      const token = await getIdToken();
      const response = await fetch(`/api/events/${eventId}/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFiles((prev) =>
          prev.map((f) =>
            f.status === "uploading" ? { ...f, status: "done", progress: 100 } : f
          )
        );
        setUploadSummary({ success: data.uploaded, failed: data.failed || 0 });
        onUploadComplete?.(data.uploaded);
      } else {
        const errMsg = data.error || "Upload failed. Please try again.";
        setFiles((prev) =>
          prev.map((f) =>
            f.status === "uploading" ? { ...f, status: "error", error: errMsg } : f
          )
        );
        setUploadSummary({ success: 0, failed: pendingFiles.length });
      }
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading"
            ? { ...f, status: "error", error: "Network error. Please retry." }
            : f
        )
      );
      setUploadSummary({ success: 0, failed: pendingFiles.length });
    } finally {
      setIsUploading(false);
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 p-8 text-center group ${
          isDragging
            ? "border-violet-500 bg-violet-500/5 scale-[1.01]"
            : "border-slate-300 dark:border-white/10 hover:border-violet-400 dark:hover:border-violet-600/50 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-violet-50/30 dark:hover:bg-violet-950/10"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileInput}
        />

        <div className={`transition-transform duration-200 ${isDragging ? "scale-110" : "group-hover:scale-105"}`}>
          <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-colors ${
            isDragging ? "bg-violet-500 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-violet-500/10 group-hover:text-violet-500"
          }`}>
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {isDragging ? "Drop images here" : "Drag & drop or click to browse"}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            JPEG · PNG · WebP · Max 5MB per image · Up to {maxFiles} images
          </p>
        </div>

        {files.length >= maxFiles && (
          <div className="absolute inset-0 rounded-2xl bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
            <p className="text-white text-sm font-bold">Maximum {maxFiles} files reached</p>
          </div>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {files.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                item.status === "done"
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30"
                  : item.status === "error"
                  ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-800/30"
                  : item.status === "uploading"
                  ? "bg-violet-50/50 dark:bg-violet-950/10 border-violet-200/50 dark:border-violet-800/20"
                  : "bg-white dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5"
              }`}
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200/50 dark:border-white/10 shrink-0">
                <img src={item.preview} alt="" className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {item.file.name}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase">
                    {TYPE_LABELS[item.file.type] || "IMAGE"}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {(item.file.size / 1024).toFixed(0)} KB
                  </span>
                  {item.error && (
                    <span className="text-[9px] font-semibold text-rose-600 dark:text-rose-400 truncate">
                      {item.error}
                    </span>
                  )}
                </div>
                {item.status === "uploading" && (
                  <div className="h-1 bg-violet-100 dark:bg-violet-900/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-pulse w-3/4" />
                  </div>
                )}
              </div>

              {/* Status icon */}
              <div className="shrink-0">
                {item.status === "done" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {item.status === "error" && <AlertCircle className="w-5 h-5 text-rose-500" />}
                {item.status === "uploading" && <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />}
                {item.status === "pending" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                    className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {uploadSummary && (
        <div className={`rounded-2xl p-4 flex items-center gap-3 ${
          uploadSummary.failed === 0
            ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30"
            : "bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30"
        }`}>
          {uploadSummary.failed === 0 ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {uploadSummary.success > 0
              ? `✅ ${uploadSummary.success} image(s) uploaded successfully`
              : ""}
            {uploadSummary.failed > 0
              ? ` · ⚠️ ${uploadSummary.failed} failed — check file size/type`
              : ""}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => {
            // This will be called from parent with getIdToken
            const event = new CustomEvent("upload-request", { detail: { eventId } });
            document.dispatchEvent(event);
          }}
          disabled={pendingCount === 0 || isUploading}
          className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold transition-all shadow-md hover:shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading {pendingCount} file(s)...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload {pendingCount > 0 ? `${pendingCount} Image${pendingCount > 1 ? "s" : ""}` : "Images"}
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      {files.length > 0 && (
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
          <span className="text-slate-500">{files.length} / {maxFiles} files</span>
          {pendingCount > 0 && <span className="text-violet-500">{pendingCount} pending</span>}
          {doneCount > 0 && <span className="text-emerald-500">{doneCount} uploaded</span>}
          {errorCount > 0 && <span className="text-rose-500">{errorCount} failed</span>}
        </div>
      )}
    </div>
  );
});

// Export the upload trigger function for parent to wire with getIdToken
export { type UploadFile };
export default UploadSection;
