"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X, Check } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize camera stream
  const startCamera = async () => {
    setIsLoading(true);
    setError(null);

    // Stop current stream if running
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsLoading(false);
    } catch (err: any) {
      console.error("[CAMERA] Error accessing camera:", err);
      setError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please grant permission in your browser settings."
          : "Could not access camera. Please check if another app is using it."
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Capture frame
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || isLoading || error) return;

    const canvas = document.createElement("canvas");
    // Preserve aspect ratio
    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;

    // Scale down image to max width of 1024 to optimize size
    const maxWidth = 1024;
    let targetWidth = videoWidth;
    let targetHeight = videoHeight;

    if (videoWidth > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = Math.floor((videoHeight * maxWidth) / videoWidth);
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

    // Compress to JPEG with 0.8 quality
    const base64 = canvas.toDataURL("image/jpeg", 0.8);
    setPhotoData(base64);
    setHasPhoto(true);

    // Stop camera tracks to save battery/cpu since we have a photo
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setHasPhoto(false);
    setPhotoData(null);
    startCamera();
  };

  // Flip facing mode
  const flipCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Save photo
  const confirmPhoto = () => {
    if (photoData) {
      onCapture(photoData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between text-white md:p-6">
      {/* Top controls */}
      <div className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <h3 className="font-bold text-sm tracking-wide text-slate-200">
          {hasPhoto ? "PREVIEW CAPTURE" : "LIVE CAMERA"}
        </h3>
        <button
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewfinder / Canvas Preview */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black max-h-[70vh]">
        {error ? (
          <div className="max-w-xs text-center p-6 bg-red-950/20 border border-red-500/30 rounded-3xl">
            <p className="text-red-400 font-semibold text-sm mb-4">{error}</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold transition-all text-white"
            >
              Retry Camera Access
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Initializing lens...</p>
          </div>
        ) : null}

        {/* Video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover max-w-xl max-h-full ${
            hasPhoto || error || isLoading ? "hidden" : "block"
          }`}
        />

        {/* Photo review */}
        {hasPhoto && photoData && (
          <img
            src={photoData}
            alt="Captured outcome"
            className="w-full h-full object-contain max-w-xl max-h-full"
          />
        )}
      </div>

      {/* Bottom controls */}
      <div className="p-6 bg-slate-950 border-t border-white/5 flex items-center justify-center gap-8">
        {!hasPhoto ? (
          <>
            {/* Flip lens */}
            <button
              onClick={flipCamera}
              disabled={isLoading || !!error}
              className="p-4 bg-white/15 hover:bg-white/25 rounded-full transition-all text-white disabled:opacity-30"
              title="Flip Camera"
            >
              <RefreshCw className="w-6 h-6" />
            </button>

            {/* Shutter button */}
            <button
              onClick={capturePhoto}
              disabled={isLoading || !!error}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 hover:scale-105 transition-all disabled:opacity-30 disabled:scale-100"
              title="Capture Photo"
            >
              <div className="w-full h-full bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </button>

            {/* Dummy space for layout balancing */}
            <div className="w-14" />
          </>
        ) : (
          <>
            {/* Retake */}
            <button
              onClick={retakePhoto}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-14 h-14 bg-white/10 group-hover:bg-white/20 rounded-full flex items-center justify-center transition-all text-white">
                <RefreshCw className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retake</span>
            </button>

            {/* Accept / Save */}
            <button
              onClick={confirmPhoto}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-16 h-16 bg-emerald-600 group-hover:bg-emerald-500 rounded-full flex items-center justify-center shadow-lg transition-all text-white">
                <Check className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Use Photo</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
