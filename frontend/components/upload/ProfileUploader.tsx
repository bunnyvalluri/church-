"use client";

import React, { useState, useRef } from "react";
import { Camera, RefreshCw, CheckCircle, AlertCircle, User } from "lucide-react";

interface ProfileUploaderProps {
  currentImageUrl?: string | null;
  onSuccess?: (newUrl: string) => void;
}

export default function ProfileUploader({ currentImageUrl, onSuccess }: ProfileUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar image exceeds 5MB limit.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Profile upload failed.");
      }

      setPreview(data.imageUrl);
      setSuccess(true);
      if (onSuccess) onSuccess(data.imageUrl);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update avatar.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group w-28 h-28">
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-indigo-500 bg-slate-900 flex items-center justify-center shadow-xl transition-all duration-300">
          {preview ? (
            <img src={preview} alt="Profile Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-slate-500" />
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg border-2 border-slate-900 transition-transform group-hover:scale-110 disabled:opacity-50"
          title="Change profile picture"
        >
          {isUploading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />
      </div>

      {error && (
        <div className="flex items-center space-x-1.5 text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Profile photo updated!</span>
        </div>
      )}
    </div>
  );
}
