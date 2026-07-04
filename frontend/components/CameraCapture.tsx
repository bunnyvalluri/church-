"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X, Check, Aperture, AlertTriangle, MonitorPlay } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

const CameraCapture = React.memo(function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Capture frame
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || isLoading || error) return;

    const canvas = document.createElement("canvas");
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
    <div className="fixed inset-0 z-50 bg-[#07070b]/90 backdrop-blur-md flex items-center justify-center p-0 md:p-6 overflow-hidden">
      
      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="w-full h-full md:h-auto md:max-w-2xl md:aspect-[4/5] bg-[#0c0c14] border-0 md:border md:border-white/10 rounded-none md:rounded-3xl shadow-2xl flex flex-col justify-between text-white overflow-hidden"
      >
        {/* Top Header controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#11111c]/90 border-b border-white/5 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Aperture className={`w-4 h-4 ${hasPhoto ? "text-emerald-400" : "text-violet-400 animate-spin"}`} />
            <h3 className="font-extrabold text-xs tracking-wider uppercase text-slate-200">
              {hasPhoto ? "Preview Photo Capture" : "Field Lens Live"}
            </h3>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white border border-white/5"
            title="Cancel Capture"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Lens window */}
        <div className="flex-1 relative bg-[#050508] overflow-hidden flex items-center justify-center">
          
          {/* Geolocation status pulser inside viewfinder */}
          {!hasPhoto && !isLoading && !error && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[8px] font-black tracking-widest text-white uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span>1080p Live Stream</span>
            </div>
          )}

          {/* Rule of Thirds Viewfinder Grid Overlay */}
          {!hasPhoto && !isLoading && !error && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/5 z-10">
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-white/5" />
              <div className="border-r border-white/5" />
              <div />
              
              {/* Focus Ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border border-violet-400/35 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-1.5 h-1.5 bg-violet-400/50 rounded-full" />
              </div>
            </div>
          )}

          {/* Error State */}
          {error ? (
            <div className="max-w-xs text-center p-6 bg-rose-950/20 border border-rose-500/30 rounded-3xl z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto text-rose-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-rose-450 font-bold text-xs leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all text-white active:scale-95 shadow-md"
              >
                Retry camera access
              </button>
            </div>
          ) : isLoading ? (
            /* Loading State */
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/10 border-t-violet-500 animate-spin" />
                <Camera className="w-6 h-6 text-violet-400 animate-pulse" />
              </div>
              <div className="text-center space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-350">Initializing Lens</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Calibrating autofocus...</p>
              </div>
            </div>
          ) : null}

          {/* Video feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              hasPhoto || error || isLoading ? "hidden" : "block"
            }`}
          />

          {/* Photo review */}
          {hasPhoto && photoData && (
            <img
              src={photoData}
              alt="Captured outcomes preview"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Bottom controls panel */}
        <div className="px-8 py-6 bg-[#11111c]/90 border-t border-white/5 shrink-0 flex items-center justify-center gap-8 relative">
          
          {!hasPhoto ? (
            /* Shoot Mode Actions */
            <>
              {/* Flip camera lens */}
              <button
                type="button"
                onClick={flipCamera}
                disabled={isLoading || !!error}
                className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-all disabled:opacity-30 disabled:scale-100 active:scale-90"
                title="Switch Camera Lens"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Shutter Button (High-End Styling) */}
              <button
                type="button"
                onClick={capturePhoto}
                disabled={isLoading || !!error}
                className="relative w-20 h-20 rounded-full border-4 border-white/90 dark:border-white/105 flex items-center justify-center p-1.5 active:scale-90 hover:scale-105 transition-all disabled:opacity-30 disabled:scale-100 shrink-0"
                title="Capture Photo"
              >
                <div className="w-full h-full bg-rose-600 hover:bg-rose-500 rounded-full flex items-center justify-center shadow-lg transition-colors" />
              </button>

              {/* Layout balancer spacing */}
              <div className="w-12" />
            </>
          ) : (
            /* Review Mode Actions */
            <>
              {/* Retake */}
              <button
                type="button"
                onClick={retakePhoto}
                className="flex flex-col items-center gap-1 group active:scale-95"
              >
                <div className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center transition-all text-slate-300 hover:text-white shadow-md">
                  <RefreshCw className="w-4.5 h-4.5 group-hover:rotate-45 transition-transform" />
                </div>
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Retake</span>
              </button>

              {/* Use photo */}
              <button
                type="button"
                onClick={confirmPhoto}
                className="flex flex-col items-center gap-1 group active:scale-95"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-full flex items-center justify-center transition-all text-white shadow-lg">
                  <Check className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Use Photo</span>
              </button>
            </>
          )}

        </div>
      </motion.div>
      
    </div>
  );
});

export default CameraCapture;
