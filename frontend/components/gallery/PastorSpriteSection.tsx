"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Camera,
  Play,
  Pause,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Share2,
  Download,
  Heart,
  BookOpen,
  MapPin,
  Calendar,
  Layers,
  X,
  Crown,
  Video,
  Award,
  Copy,
  Check,
  Expand,
  FileText,
  Volume2,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { PASTOR_MEDIA_ITEMS, PastorMediaItem } from "@/lib/pastorMediaData";

interface PastorSpriteSectionProps {
  language: "en" | "te" | "hi";
  onToast?: (message: string, type?: "success" | "info" | "heart") => void;
}

export default function PastorSpriteSection({
  language = "en",
  onToast,
}: PastorSpriteSectionProps) {
  // Category Filter: "all" | "photos" | "videos"
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [autoPlayProgress, setAutoPlayProgress] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);

  // Lightbox / Modal States
  const [modalItem, setModalItem] = useState<PastorMediaItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [copiedScripture, setCopiedScripture] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Inline video playing state for hero stage
  const [isInlineVideoPlaying, setIsInlineVideoPlaying] = useState<boolean>(false);
  const stageVideoRef = useRef<HTMLVideoElement>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);

  // Filtered Media List
  const filteredItems = useMemo(() => {
    if (filterCategory === "photos") {
      return PASTOR_MEDIA_ITEMS.filter((item) => item.type === "image");
    }
    if (filterCategory === "videos") {
      return PASTOR_MEDIA_ITEMS.filter((item) => item.type === "video");
    }
    return PASTOR_MEDIA_ITEMS;
  }, [filterCategory]);

  // Active item
  const currentItem = filteredItems[activeIndex] || filteredItems[0] || PASTOR_MEDIA_ITEMS[0];

  // Helper for localized title and details
  const getLocalized = useCallback(
    (item: PastorMediaItem) => {
      let title = item.title;
      let subtitle = item.subtitle;
      let desc = item.description;
      let scripture = item.scriptureText || "";

      if (language === "te") {
        title = item.titleTe || item.title;
        subtitle = item.subtitleTe || item.subtitle;
        desc = item.descriptionTe || item.description;
        scripture = item.scriptureTextTe || item.scriptureText || "";
      } else if (language === "hi") {
        title = item.titleHi || item.title;
        subtitle = item.subtitleHi || item.subtitle;
        desc = item.descriptionHi || item.description;
        scripture = item.scriptureTextHi || item.scriptureText || "";
      }

      return { title, subtitle, desc, scripture };
    },
    [language]
  );

  const [isStageHovered, setIsStageHovered] = useState<boolean>(false);

  // Auto-play timer for hero stage (0% CPU, single setTimeout transition)
  useEffect(() => {
    if (!isAutoPlaying || modalItem !== null || isInlineVideoPlaying || isStageHovered) {
      return;
    }

    const timer = setTimeout(() => {
      setSlideDirection(1);
      setActiveIndex((cur) => (cur + 1) % filteredItems.length);
    }, 16000);

    return () => clearTimeout(timer);
  }, [isAutoPlaying, filteredItems.length, modalItem, isInlineVideoPlaying, isStageHovered, activeIndex]);

  // Reset zoom & pan whenever modal item changes
  useEffect(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [modalItem]);

  // Handle select thumbnail
  const handleSelectSprite = (index: number) => {
    setSlideDirection(index > activeIndex ? 1 : -1);
    setIsInlineVideoPlaying(false);
    setActiveIndex(index);
    setAutoPlayProgress(0);
    if (filmstripRef.current) {
      const targetCard = filmstripRef.current.children[index] as HTMLElement;
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  };

  const handleNext = useCallback(() => {
    setSlideDirection(1);
    setIsInlineVideoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % filteredItems.length);
    setAutoPlayProgress(0);
  }, [filteredItems.length]);

  const handlePrev = useCallback(() => {
    setSlideDirection(-1);
    setIsInlineVideoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    setAutoPlayProgress(0);
  }, [filteredItems.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalItem) {
        if (e.key === "Escape") setModalItem(null);
        if (e.key === "ArrowRight") {
          const idx = filteredItems.findIndex((i) => i.id === modalItem.id);
          if (idx !== -1) {
            const nextItem = filteredItems[(idx + 1) % filteredItems.length];
            setModalItem(nextItem);
          }
        }
        if (e.key === "ArrowLeft") {
          const idx = filteredItems.findIndex((i) => i.id === modalItem.id);
          if (idx !== -1) {
            const prevItem = filteredItems[(idx - 1 + filteredItems.length) % filteredItems.length];
            setModalItem(prevItem);
          }
        }
        if (e.key === "+" || e.key === "=") {
          setZoomLevel((z) => Math.min(z + 0.5, 3.5));
        }
        if (e.key === "-") {
          setZoomLevel((z) => Math.max(z - 0.5, 1));
        }
        if (e.key === "0") {
          setZoomLevel(1);
          setPanOffset({ x: 0, y: 0 });
        }
      } else {
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === " " && document.activeElement?.tagName !== "BUTTON" && document.activeElement?.tagName !== "INPUT") {
          e.preventDefault();
          setIsAutoPlaying((p) => !p);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalItem, filteredItems, handleNext, handlePrev]);

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        onToast?.("Removed from saved highlights", "info");
      } else {
        next.add(id);
        onToast?.("Saved to your Pastor highlights ❤️", "heart");
      }
      return next;
    });
  };

  // Share handler
  const handleShare = async (item: PastorMediaItem) => {
    const loc = getLocalized(item);
    const shareUrl = `${window.location.origin}${item.url}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: loc.title,
          text: `${loc.title} — Kingdom of Christ Ministries Pastor Spotlight`,
          url: shareUrl,
        });
        onToast?.("Shared successfully!", "success");
        return;
      } catch {}
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      onToast?.("Link copied to clipboard!", "success");
    }
  };

  // Copy scripture text
  const handleCopyScripture = (text: string, ref?: string) => {
    const fullText = `"${text}" — ${ref || "Scripture Reflection"}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText);
      setCopiedScripture(true);
      onToast?.("Scripture copied to clipboard", "success");
      setTimeout(() => setCopiedScripture(false), 2000);
    }
  };

  // Mouse pan handlers for Lightbox
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const locCurrent = getLocalized(currentItem);
  const isFav = favorites.has(currentItem.id);

  // Section Headers by Language
  const labels = {
    sectionBadge:
      language === "te"
        ? "రెవరెండ్ కుర్ర క్రీస్తు రాజు గారు • వైస్ ప్రెసిడెంట్, TUCS"
        : language === "hi"
        ? "रेवरेंड कुर्रा क्रिस्टु राजू • उपाध्यक्ष (Vice President), TUCS"
        : "Reverend Kurra Christu Raju • Vice President, TUCS",
    sectionTitle:
      language === "te"
        ? "సీనియర్ పాస్టర్ రెవరెండ్ కుర్ర క్రీస్తు రాజు గారి ప్రత్యేక గ్యాలరీ"
        : language === "hi"
        ? "वरिष्ठ पादरी रेवरेंड कुर्रा क्रिस्टु राजू विशेष गैलरी"
        : "Senior Pastor Reverend Kurra Christu Raju Spotlight & Moments",
    sectionSubtitle:
      language === "te"
        ? "తెలంగాణ సైనాడ్ ప్రమాణ స్వీకారోత్సవ పత్రికా ప్రకటనలు, చారిత్రక సభలు మరియు ప్రత్యక్ష ఆశీర్వాద వీడియో."
        : language === "hi"
        ? "सिनॉड कार्यकारिणी शपथ ग्रहण प्रेस कवरेज, विशेष सभाएं एवं सेवकाई वीडियो संग्रह।"
        : "Official Synod press announcements, leadership consecration assemblies, and exclusive pastoral ministry video archive.",
    filterAll: language === "te" ? "అన్నీ" : language === "hi" ? "सभी मीडिया" : "All Media",
    filterPhotos: language === "te" ? "ఫోటోలు" : language === "hi" ? "फ़ोटो" : "Photos",
    filterVideos: language === "te" ? "వీడియో" : language === "hi" ? "वीडियो" : "Video",
    viewHighRes: language === "te" ? "పూర్తి సైజు చూడండి" : language === "hi" ? "उच्च रेजोल्यूशन देखें" : "Inspect High-Res",
    watchVideo: language === "te" ? "వీడియో ప్లే చేయండి" : language === "hi" ? "वीडियो चलाएं" : "Play Full Video",
    stripTitle: language === "te" ? "ప్రత్యేక క్షణాల సేకరణ" : language === "hi" ? "विशेष पलों का संग्रह" : "Curated Moments Strip",
    stripHint: language === "te" ? "పరిశీలించడానికి క్లిక్ చేయండి" : language === "hi" ? "देखने के लिए कार्ड चुनें" : "Click card to preview",
    scriptureHeading: language === "te" ? "వాక్య ధ్యానం" : language === "hi" ? "वचन मनन" : "Scripture Reflection",
    openLightbox: language === "te" ? "సినిమాటిక్ వ్యూ తెరవండి" : language === "hi" ? "सिनेमैटिक व्यू खोलें" : "Open Full Theater Mode",
    prevBtn: language === "te" ? "మునుపటిది" : language === "hi" ? "पिछला" : "Previous",
    nextBtn: language === "te" ? "తదుపరిది" : language === "hi" ? "अगला" : "Next",
  };

  return (
    <section
      id="pastor-spotlight-section"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/95 via-slate-50/95 to-white/95 dark:from-[#0b0d1e]/95 dark:via-[#070914]/98 dark:to-[#0b0d1e]/95 border border-slate-200/90 dark:border-purple-500/25 shadow-2xl p-3 sm:p-6 md:p-8 my-8 backdrop-blur-3xl text-slate-900 dark:text-slate-100 transition-all duration-300"
    >
      {/* ══════════════════════ AMBIENT GLOW BACKDROPS ══════════════════════ */}
      <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-transparent dark:from-purple-600/20 dark:via-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] bg-gradient-to-tl from-amber-500/10 via-purple-500/10 to-transparent dark:from-amber-500/15 dark:via-purple-600/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.03)_0,transparent_70%)] pointer-events-none" />

      {/* ══════════════════════ EXECUTIVE SECTION HEADER ══════════════════════ */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-white/10">
        <div className="space-y-3.5 max-w-3xl">
          {/* Ministerial Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 dark:from-amber-400/20 dark:via-purple-500/20 dark:to-indigo-500/20 border border-amber-400/40 dark:border-amber-400/30 text-amber-900 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-md">
            <Crown className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-400/30 animate-pulse" />
            <span>{labels.sectionBadge}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping ml-1" />
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] font-outfit">
            {labels.sectionTitle}
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
            {labels.sectionSubtitle}
          </p>
        </div>

        {/* Filter Switcher Pills - 100% Visible on all mobile screens */}
        <div className="w-full lg:w-auto grid grid-cols-3 sm:flex sm:items-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-inner shrink-0">
          {[
            { id: "all", label: labels.filterAll, icon: Layers, count: 5 },
            { id: "photos", label: labels.filterPhotos, icon: Camera, count: 4 },
            { id: "videos", label: labels.filterVideos, icon: Video, count: 1 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = filterCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterCategory(tab.id);
                  setActiveIndex(0);
                  setAutoPlayProgress(0);
                  setIsInlineVideoPlaying(false);
                }}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3.5 md:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold transition-all duration-200 select-none ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 scale-[1.01]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/80"
                }`}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 hidden xs:inline-block sm:inline-block" />
                <span className="truncate">{tab.label}</span>
                <span
                  className={`px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-xs font-mono font-bold shrink-0 ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════ HERO MEDIA STAGE & CONTEXT PANEL ══════════════════════ */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch pt-6">
        {/* Left Column: Visual Showcase Deck (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-2">
          {/* Top Info Bar Above Image (Zero obstruction over newspaper headlines) */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-extrabold uppercase shadow-sm border ${
                  currentItem.type === "video"
                    ? "bg-rose-600 text-white border-rose-500/30"
                    : "bg-purple-700 dark:bg-purple-900 text-white dark:text-purple-200 border-purple-500/30"
                }`}
              >
                {currentItem.type === "video" ? (
                  <>
                    <Play className="w-2.5 h-2.5 fill-current animate-pulse" />
                    <span>Video</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-2.5 h-2.5 text-purple-200" />
                    <span>Photo</span>
                  </>
                )}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                <MapPin className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                <span>{currentItem.branchName}</span>
              </span>
            </div>

            {/* Counter Index */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-purple-700 dark:text-purple-300 font-bold shadow-sm">
              <span>{activeIndex + 1}</span>
              <span className="opacity-40 font-normal">/</span>
              <span>{filteredItems.length}</span>
            </div>
          </div>

          {/* Main Visual Display Deck - 100% Unobstructed Clean Canvas */}
          <div
            onMouseEnter={() => setIsStageHovered(true)}
            onMouseLeave={() => setIsStageHovered(false)}
            className="relative h-[280px] xs:h-[320px] sm:h-[380px] lg:h-[440px] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 dark:border-purple-500/20 shadow-2xl group flex flex-col justify-between"
          >
            {/* Inline Video Player Mode */}
            {currentItem.type === "video" && isInlineVideoPlaying ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  ref={stageVideoRef}
                  src={currentItem.videoUrl || currentItem.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div
                onClick={() => setModalItem(currentItem)}
                className="relative w-full h-full overflow-hidden bg-slate-950 cursor-pointer flex items-center justify-center"
              >
                {/* Dynamic Ambient Background Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0,transparent_75%)] pointer-events-none" />

                {/* Animated Slide Transitions - Full Size 100% Clean Image */}
                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.div
                    key={currentItem.id}
                    custom={slideDirection}
                    initial={{ opacity: 0, x: slideDirection * 40, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -slideDirection * 40, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="relative w-full h-full flex items-center justify-center p-2"
                  >
                    <Image
                      src={currentItem.thumbnailUrl || currentItem.url}
                      alt={locCurrent.title}
                      fill
                      unoptimized
                      priority
                      className="object-contain z-10 transition-transform duration-700 ease-out group-hover:scale-[1.02] drop-shadow-2xl"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Video Play Button Pulse Overlay */}
                {currentItem.type === "video" && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsInlineVideoPlaying(true);
                    }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer bg-black/25 group/play backdrop-blur-[2px] transition-all hover:bg-black/15"
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-purple-600/30 animate-ping pointer-events-none" />
                      <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-2xl shadow-purple-600/50 border border-white/40 transform group-hover/play:scale-110 active:scale-95 transition-all">
                        <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white ml-1" />
                      </div>
                    </div>
                    <span className="mt-2.5 px-3 py-1 rounded-full bg-slate-950/80 border border-white/20 text-xs font-bold text-white tracking-wide shadow-lg backdrop-blur-md">
                      {labels.watchVideo}
                    </span>
                  </div>
                )}

                {/* Linear Auto Play Progress Line */}
                {isAutoPlaying && !isInlineVideoPlaying && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
                    <div
                      key={currentItem.id}
                      className="h-full bg-gradient-to-r from-amber-400 via-purple-500 to-indigo-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                      style={{
                        animation: `kcmSpriteProgress 16s linear forwards`,
                        animationPlayState: isStageHovered ? "paused" : "running",
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Under-Stage Media Control Bar */}
          <div className="w-full flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setModalItem(currentItem)}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 transform hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{currentItem.type === "video" ? labels.watchVideo : labels.viewHighRes}</span>
              </button>

              {/* Auto Play Toggle */}
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                title={isAutoPlaying ? "Pause slideshow (Space)" : "Play slideshow (Space)"}
                className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
              >
                {isAutoPlaying ? (
                  <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-purple-500" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(currentItem.id)}
                title="Save highlight"
                className={`p-1.5 sm:p-2 rounded-xl border transition-all shadow-sm ${
                  isFav
                    ? "bg-rose-500/20 border-rose-400 text-rose-500 scale-105"
                    : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? "fill-current text-rose-500" : ""}`} />
              </button>

              {/* Share Button */}
              <button
                onClick={() => handleShare(currentItem)}
                title="Share moment"
                className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Quick Glide Navigation Controls - 100% Fit in Flexbox on Mobile */}
          <div className="w-full flex items-center justify-between gap-1.5 pt-1 overflow-hidden">
            <button
              onClick={handlePrev}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm text-[11px] sm:text-xs font-bold transition-all active:scale-95 shrink-0 whitespace-nowrap"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>{labels.prevBtn}</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-400 font-mono">
                ←
              </kbd>
            </button>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 px-1">
              {filteredItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSprite(idx)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-5 sm:w-8 bg-gradient-to-r from-purple-600 to-indigo-600"
                      : "w-1.5 sm:w-2 bg-slate-300 dark:bg-slate-700 hover:bg-purple-400"
                  }`}
                  title={`Go to item ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm text-[11px] sm:text-xs font-bold transition-all active:scale-95 shrink-0 whitespace-nowrap"
            >
              <span>{labels.nextBtn}</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-400 font-mono">
                →
              </kbd>
            </button>
          </div>
        </div>

        {/* Right Column: Editorial & Scripture Revelation Deck (5 Cols) */}
        <div
          onMouseEnter={() => setIsStageHovered(true)}
          onMouseLeave={() => setIsStageHovered(false)}
          className="lg:col-span-5 flex flex-col justify-between space-y-4 p-5 sm:p-7 rounded-2xl bg-white/90 dark:bg-slate-950/70 border border-slate-200/90 dark:border-purple-500/20 shadow-xl backdrop-blur-2xl"
        >
          <div className="space-y-4">
            {/* Category & Date Pills */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 text-purple-800 dark:text-purple-300 text-xs font-bold tracking-wide">
                <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{currentItem.category}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-purple-500/80" />
                <span>{currentItem.date}</span>
              </span>
            </div>

            {/* Main Title */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug tracking-tight font-outfit">
              {locCurrent.title}
            </h3>

            {/* Subtitle Accent */}
            <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 font-semibold leading-relaxed">
              {locCurrent.subtitle}
            </p>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {locCurrent.desc}
            </p>

            {/* Illuminated Scripture Revelation Card */}
            {currentItem.scriptureRef && locCurrent.scripture && (
              <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-indigo-500/10 dark:from-amber-400/[0.07] dark:via-purple-500/[0.08] dark:to-indigo-500/[0.06] border border-amber-400/30 dark:border-purple-400/30 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>
                      {labels.scriptureHeading} — {currentItem.scriptureRef}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopyScripture(locCurrent.scripture, currentItem.scriptureRef)}
                    title="Copy Scripture"
                    className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-800"
                  >
                    {copiedScripture ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <blockquote className="text-xs sm:text-sm italic text-slate-800 dark:text-slate-100 leading-relaxed font-serif relative z-10 pl-2 border-l-2 border-amber-500/60 dark:border-amber-400/60">
                  &ldquo;{locCurrent.scripture}&rdquo;
                </blockquote>
              </div>
            )}

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentItem.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300 shadow-sm hover:border-purple-400/50 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-white/10">
            <button
              onClick={() => setModalItem(currentItem)}
              className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-purple-600/30 transform hover:scale-[1.01] active:scale-95 transition-all"
            >
              {currentItem.type === "video" ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{labels.watchVideo}</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>{labels.openLightbox}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════ SPRITE FILMSTRIP SELECTOR ══════════════════════ */}
      <div className="relative z-10 pt-8">
        <div className="flex items-center justify-between pb-3 text-xs font-bold text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold">{labels.stripTitle}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400">
              {filteredItems.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            {labels.stripHint}
          </span>
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={filmstripRef}
          className="flex items-center gap-3.5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-purple-500/40 scrollbar-track-slate-100 dark:scrollbar-track-slate-900/60 snap-x"
        >
          {filteredItems.map((item, idx) => {
            const isSelected = idx === activeIndex;
            const loc = getLocalized(item);
            return (
              <button
                key={item.id}
                onClick={() => handleSelectSprite(idx)}
                className={`group relative flex-shrink-0 w-44 sm:w-48 md:w-56 rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left bg-white dark:bg-slate-950 snap-start ${
                  isSelected
                    ? "border-purple-600 dark:border-purple-400 scale-[1.02] shadow-xl shadow-purple-600/25 ring-4 ring-purple-500/20"
                    : "border-slate-200 dark:border-slate-800/80 opacity-80 hover:opacity-100 hover:border-purple-300 dark:hover:border-purple-500/50 shadow-md hover:scale-[1.01]"
                }`}
              >
                {/* Thumbnail Image */}
                <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={item.thumbnailUrl || item.url}
                    alt={loc.title}
                    fill
                    unoptimized
                    sizes="240px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Top Type Pill */}
                  <div className="absolute top-2 left-2 z-10">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-md ${
                        item.type === "video"
                          ? "bg-rose-600 text-white"
                          : "bg-purple-900/90 text-purple-200 backdrop-blur-md border border-purple-400/30"
                      }`}
                    >
                      {item.type === "video" ? <Play className="w-2.5 h-2.5 fill-current" /> : <Camera className="w-2.5 h-2.5" />}
                      <span>{item.type === "video" ? "VIDEO" : "PHOTO"}</span>
                    </span>
                  </div>

                  {/* Active Selection Glow */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-purple-500/15 border-2 border-purple-500 dark:border-purple-400 pointer-events-none rounded-2xl" />
                  )}
                </div>

                {/* Bottom Card Footer - Multi-line Full Title Visibility */}
                <div className="p-2.5 bg-slate-50/95 dark:bg-slate-950/95 space-y-1 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug min-h-[2.4em] group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    {loc.title}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {item.category}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════ ULTRA-HD LIGHTBOX & PAN-ZOOM MODAL (Portaled to document.body) ══════════════════════ */}
      {isMounted &&
        modalItem &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-[#070913] flex flex-col items-center justify-between p-2 sm:p-4 md:p-6 text-white select-none shadow-2xl overflow-hidden w-screen h-[100dvh]"
            >
              {/* Modal Top Floating Control Bar */}
              <div className="w-full max-w-7xl flex items-center justify-between pb-1.5 sm:pb-2.5 border-b border-white/15 text-white z-30 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 truncate max-w-[65vw] sm:max-w-xl">
                  <span
                    className={`px-2 sm:px-2.5 py-0.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold uppercase shrink-0 shadow-lg ${
                      modalItem.type === "video" ? "bg-rose-600 text-white" : "bg-purple-600 text-white"
                    }`}
                  >
                    {modalItem.type === "video" ? "Video" : "Press Reader"}
                  </span>
                  <h4 className="text-xs sm:text-sm md:text-base font-black truncate text-white drop-shadow-sm">
                    {getLocalized(modalItem).title}
                  </h4>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {modalItem.type === "image" && (
                    <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-white/20 shadow-lg shrink-0">
                      <button
                        onClick={() => setZoomLevel((z) => Math.min(z + 0.5, 3.5))}
                        className="p-1 sm:p-1.5 rounded-md sm:rounded-lg hover:bg-white/20 text-white transition-all active:scale-95"
                        title="Zoom In (+)"
                      >
                        <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <span className="text-[10px] sm:text-xs font-mono font-bold px-1 sm:px-1.5 py-0.5 rounded bg-white/15 text-white tabular-nums">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        onClick={() => {
                          setZoomLevel((z) => {
                            const next = Math.max(z - 0.5, 1);
                            if (next === 1) setPanOffset({ x: 0, y: 0 });
                            return next;
                          });
                        }}
                        className="p-1 sm:p-1.5 rounded-md sm:rounded-lg hover:bg-white/20 text-white transition-all active:scale-95"
                        title="Zoom Out (-)"
                      >
                        <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setZoomLevel(1);
                          setPanOffset({ x: 0, y: 0 });
                        }}
                        className="p-1 sm:p-1.5 rounded-md sm:rounded-lg hover:bg-white/20 text-white transition-all active:scale-95"
                        title="Reset View (0)"
                      >
                        <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <a
                        href={modalItem.url}
                        download
                        className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all ml-0.5 shadow-md"
                        title="Download Original High-Res"
                      >
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </a>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setModalItem(null);
                      setZoomLevel(1);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-rose-600 text-white border border-white/20 transition-all shadow-md active:scale-95"
                    title="Close (Esc)"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body & Interactive Canvas */}
              <div
                className="relative w-full max-w-7xl flex-1 min-h-0 flex items-center justify-center my-1 sm:my-2 overflow-hidden rounded-xl sm:rounded-3xl bg-black border border-white/15"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
              >
                {modalItem.type === "video" ? (
                  <div className="w-full h-full min-h-0 flex items-center justify-center p-1 sm:p-2">
                    <video
                      src={modalItem.videoUrl || modalItem.url}
                      controls
                      autoPlay
                      playsInline
                      className="max-w-full max-h-full object-contain rounded-lg sm:rounded-2xl shadow-2xl"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full min-h-0 flex items-center justify-center p-1 sm:p-3 overflow-hidden">
                    <div
                      style={{
                        transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomLevel})`,
                        transformOrigin: "center center",
                        transition: isDragging ? "none" : "transform 0.2s ease-out",
                      }}
                      className="relative w-full h-full max-w-full max-h-full flex items-center justify-center select-none"
                    >
                      <img
                        src={modalItem.url}
                        alt={getLocalized(modalItem).title}
                        draggable={false}
                        className="object-contain rounded-lg sm:rounded-xl shadow-2xl pointer-events-none"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          width: "auto",
                          height: "auto",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Prev / Next Modal Glide Chevrons */}
                <button
                  onClick={() => {
                    const idx = filteredItems.findIndex((i) => i.id === modalItem.id);
                    if (idx !== -1) {
                      const prevItem = filteredItems[(idx - 1 + filteredItems.length) % filteredItems.length];
                      setModalItem(prevItem);
                      setZoomLevel(1);
                      setPanOffset({ x: 0, y: 0 });
                    }
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/80 hover:bg-purple-600 text-white border border-white/20 transition-all shadow-2xl hover:scale-110 active:scale-95 z-30"
                  title="Previous Moment"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>

                <button
                  onClick={() => {
                    const idx = filteredItems.findIndex((i) => i.id === modalItem.id);
                    if (idx !== -1) {
                      const nextItem = filteredItems[(idx + 1) % filteredItems.length];
                      setModalItem(nextItem);
                      setZoomLevel(1);
                      setPanOffset({ x: 0, y: 0 });
                    }
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/80 hover:bg-purple-600 text-white border border-white/20 transition-all shadow-2xl hover:scale-110 active:scale-95 z-30"
                  title="Next Moment"
                >
                  <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Modal Bottom Strip & Mini Thumbnail Strip */}
              <div className="w-full max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 pt-1.5 sm:pt-2 pb-0.5 border-t border-white/15 text-slate-100 shrink-0">
                <div className="space-y-0.5 sm:space-y-1 max-w-2xl">
                  <p className="text-[11px] sm:text-xs md:text-sm leading-snug sm:leading-relaxed text-slate-100 line-clamp-1 sm:line-clamp-2 font-medium">
                    {getLocalized(modalItem).desc}
                  </p>
                  {modalItem.scriptureRef && (
                    <p className="text-[10px] sm:text-xs font-serif italic text-amber-300 font-normal truncate sm:whitespace-normal">
                      &ldquo;{getLocalized(modalItem).scripture}&rdquo; <span className="font-sans not-italic font-bold text-amber-400">— {modalItem.scriptureRef}</span>
                    </p>
                  )}
                </div>

                {/* Quick Switcher inside modal */}
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 shrink-0">
                  {filteredItems.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setModalItem(item);
                        setZoomLevel(1);
                        setPanOffset({ x: 0, y: 0 });
                      }}
                      className={`relative w-8 h-6 sm:w-11 sm:h-8 md:w-12 md:h-10 rounded-md sm:rounded-lg overflow-hidden border transition-all ${
                        item.id === modalItem.id
                          ? "border-purple-400 ring-2 ring-purple-400/60 scale-105 shadow-lg"
                          : "border-white/20 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={item.thumbnailUrl || item.url}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
