"use client";

import React, { useState, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, RefreshCw, Image as ImageIcon } from "lucide-react";

interface EventImageUploaderProps {
  eventId: string;
  branchName?: string;
  onSuccess?: (media: any) => void;
}

export default function EventImageUploader({ eventId, branchName, onSuccess }: EventImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setSuccess(false);

    // Frontend pre-validation (5MB limit, valid extension)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size exceeds maximum limit of 5MB.");
      return;
    }
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
      setError("Forbidden file format. Allowed formats: JPG, JPEG, PNG, WEBP.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !eventId) return;

    setIsUploading(true);
    setProgress(20);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("eventId", eventId);
      if (caption) formData.append("caption", caption);
      if (branchName) formData.append("branchName", branchName);

      setProgress(50);

      const res = await fetch("/api/upload/event-image", {
        method: "POST",
        body: formData,
      });

      setProgress(85);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image.");
      }

      setProgress(100);
      setSuccess(true);
      if (onSuccess) onSuccess(data.media);

      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setCaption("");
        setSuccess(false);
        setProgress(0);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
          <ImageIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Upload Event Photo</h3>
          <p className="text-xs text-slate-400">Store optimized event photos directly in Cloudinary</p>
        </div>
      </div>

      {!preview ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="group cursor-pointer border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-8 text-center transition-all duration-300 bg-slate-950/40 hover:bg-indigo-950/10"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-800/80 group-hover:bg-indigo-600/20 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-200">
            Click to upload or drag & drop image
          </p>
          <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP up to 5MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-48 group">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={clearSelection}
              disabled={isUploading}
              className="absolute top-3 right-3 p-1.5 bg-slate-900/80 text-slate-300 hover:text-white rounded-full hover:bg-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Image caption or description (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isUploading}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
          />

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Optimizing and uploading to Cloudinary...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={handleUpload} className="p-1 hover:bg-rose-500/20 rounded-lg">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Image successfully stored in Cloudinary and Neon DB!</span>
            </div>
          )}

          {!success && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={clearSelection}
                disabled={isUploading}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Confirm Upload</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
