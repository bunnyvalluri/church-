"use client";

import React, { useState, useRef } from "react";
import { Video, Upload, X, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface EventVideoUploaderProps {
  eventId: string;
  onSuccess?: (media: any) => void;
}

export default function EventVideoUploader({ eventId, onSuccess }: EventVideoUploaderProps) {
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

    // 50MB size limit validation
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("Video exceeds maximum allowed size of 50MB.");
      return;
    }
    if (selectedFile.type !== "video/mp4") {
      setError("Only MP4 video files are permitted.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file || !eventId) return;

    setIsUploading(true);
    setProgress(15);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("eventId", eventId);
      if (caption) formData.append("caption", caption);

      setProgress(40);

      const res = await fetch("/api/upload/event-video", {
        method: "POST",
        body: formData,
      });

      setProgress(85);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Video upload failed.");
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
      setError(err.message || "Video upload error occurred.");
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
        <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
          <Video className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Upload Event Video</h3>
          <p className="text-xs text-slate-400">Streaming-ready MP4 videos (Max 50MB)</p>
        </div>
      </div>

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group cursor-pointer border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-xl p-8 text-center transition-all duration-300 bg-slate-950/40 hover:bg-purple-950/10"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            accept="video/mp4"
            className="hidden"
          />
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-800/80 group-hover:bg-purple-600/20 flex items-center justify-center text-slate-400 group-hover:text-purple-400 transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-200">Select Event Video File</p>
          <p className="text-xs text-slate-400 mt-1">MP4 format up to 50MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 max-h-56">
            <video src={preview} controls className="w-full h-full object-contain max-h-56" />
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
            placeholder="Video title or description (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isUploading}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
          />

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Processing video stream...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Video uploaded successfully!</span>
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
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-sm shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading Video...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Video</span>
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
