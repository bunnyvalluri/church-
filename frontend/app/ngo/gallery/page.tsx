"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  AlertCircle,
  Trash2,
  Calendar,
  Download,
  Share2,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import io from "socket.io-client";

// Encode a URL path so parentheses and spaces are safe for browsers
function encodeSrc(src: string): string {
  if (!src) return "";
  return src
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

// Category config
const CATEGORIES = [
  { label: "All Photos", value: "ALL" },
  { label: "NIMS Hospital", value: "NIMS-HOSPITAL" },
  { label: "Govt Hospital", value: "GOVT-HOSPITAL" },
  { label: "Gandhi Hospital", value: "GANDHI-HOSPITAL" },
  { label: "Bethany Ashramam", value: "ASHRAMAM" },
  { label: "Home for Disabled", value: "DISABLED-AASHRAMAM" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "NIMS-HOSPITAL": "from-blue-600 to-cyan-500",
  "GOVT-HOSPITAL": "from-green-600 to-emerald-400",
  "GANDHI-HOSPITAL": "from-orange-500 to-amber-400",
  "ASHRAMAM": "from-purple-600 to-pink-400",
  "DISABLED-AASHRAMAM": "from-rose-500 to-red-400",
};

// Memoized GalleryCard to prevent DOM re-renders and stabilize layouts
interface GalleryItem {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  title: string;
  category: string;
  createdAt: string;
  branchId?: string | null;
}

const GalleryCard = React.memo(function GalleryCard({
  item,
  onClick,
  isAdminMode,
  onDelete,
  priority,
}: {
  item: GalleryItem;
  onClick: () => void;
  isAdminMode: boolean;
  onDelete: (item: GalleryItem) => void;
  priority: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      onClick={onClick}
      className="break-inside-avoid mb-5 relative group rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-slate-900 cursor-pointer shadow-sm hover:border-purple-500/40 transition-all duration-500 hover:shadow-purple-500/10 hover:shadow-2xl aspect-[3/2] w-full"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Open ${item.title}`}
    >
      {/* Category badge */}
      <div className={`absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${CATEGORY_COLORS[item.category] ?? "from-slate-600 to-slate-500"} shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
        {item.category}
      </div>

      {/* Delete button (Admin Mode only) */}
      {isAdminMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white transition-all duration-200 shadow-lg"
          title="Delete image"
          aria-label="Delete image"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Image container */}
      <div className="relative overflow-hidden w-full h-full bg-slate-100 dark:bg-slate-950">
        {!isLoaded && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse z-10" />
        )}
        <Image
          src={encodeSrc(item.thumbnailUrl)}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFjMTkxZiIvPjwvc3ZnPg=="
          className={`object-cover transform group-hover:scale-105 transition-all duration-700 ease-out ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          onLoad={() => setIsLoaded(true)}
        />

        {/* Premium Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
          <div className="flex justify-end">
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-500 delay-75">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
          <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <p className="text-white text-xs font-bold font-sans drop-shadow-sm uppercase tracking-wider">{item.category}</p>
            <p className="text-white/70 text-[10px] font-medium drop-shadow-sm truncate mt-0.5">
              {item.title}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function NgoGalleryPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // Lightbox options state
  const [lbLoading, setLbLoading] = useState(false);
  const [lbError, setLbError] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [direction, setDirection] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [lastTap, setLastTap] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Admin controls
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [deletedUrls, setDeletedUrls] = useState<Set<string>>(new Set());
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);

  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  const queryClient = useQueryClient();

  useEffect(() => { setMounted(true); }, []);

  // 1. Fetch NGO gallery images
  const fetchGallery = async () => {
    const url = `/api/gallery?limit=1000&ngo=true&category=ALL`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch gallery");
    return res.json();
  };

  const {
    data,
    status,
    refetch,
  } = useQuery({
    queryKey: ["ngo-gallery-all"],
    queryFn: fetchGallery,
  });

  const allImages: GalleryItem[] = data?.images || [];
  const filteredItems = allImages.filter(
    (item) => (selectedCategory === "ALL" || item.category === selectedCategory) && !deletedUrls.has(item.imageUrl)
  );

  const [displayLimit, setDisplayLimit] = useState(24);

  // Reset display limit when selected category changes for instant switch
  useEffect(() => {
    setDisplayLimit(24);
  }, [selectedCategory]);

  const displayedItems = filteredItems.slice(0, displayLimit);
  const hasNextPage = displayLimit < filteredItems.length;

  // 2. Infinite Scroll progressive loading observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayLimit < filteredItems.length) {
          setDisplayLimit((prev) => prev + 24);
        }
      },
      { rootMargin: "300px" }
    );
    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }
    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [displayLimit, filteredItems.length]);

  // 3. Realtime updates with Socket.IO
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("gallery.image.created", (newImage: GalleryItem) => {
      queryClient.setQueryData(["ngo-gallery-all"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          images: [newImage, ...old.images]
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  // Admin Mode Toggles
  const handleTitleClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setIsAdminMode((curr) => {
          const nextVal = !curr;
          setToastMessage(nextVal ? "Admin Mode Enabled" : "Admin Mode Disabled");
          return nextVal;
        });
        return 0;
      }
      return next;
    });
  };

  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kcm_deleted_images");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setDeletedUrls(new Set(parsed));
          }
        } catch (e) {
          console.error("Failed to parse deleted images", e);
        }
      }
    }
  }, []);

  // Admin Shortcut Keys (Ctrl+Shift+D or Ctrl+Alt+D)
  useEffect(() => {
    const handleAdminKey = (e: KeyboardEvent) => {
      const isD = e.key === "D" || e.key === "d";
      if ((e.ctrlKey && e.shiftKey && isD) || (e.ctrlKey && e.altKey && isD)) {
        e.preventDefault();
        setIsAdminMode((prev) => {
          const nextVal = !prev;
          setToastMessage(nextVal ? "Admin Mode Enabled" : "Admin Mode Disabled");
          return nextVal;
        });
      }
    };
    window.addEventListener("keydown", handleAdminKey);
    return () => window.removeEventListener("keydown", handleAdminKey);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Lightbox methods
  const openLightbox = useCallback((idx: number) => {
    setLbLoading(true);
    setLbError(false);
    setLightboxIndex(idx);
    setShowMobileInfo(false);
    setZoomScale(1);
    setDirection(0);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setLbLoading(false);
    setLbError(false);
    setShowMobileInfo(false);
    setZoomScale(1);
    document.body.style.overflow = "";
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
  }, []);

  const goTo = useCallback((idx: number, customDirection = 0) => {
    setLbLoading(true);
    setLbError(false);
    setDirection(customDirection);
    setLightboxIndex(idx);
    setShowMobileInfo(false);
    setZoomScale(1);
  }, []);

  const prevImage = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    if (e && "stopPropagation" in e) e.stopPropagation();
    if (lightboxIndex === null) return;
    const prevIdx = lightboxIndex === 0 ? filteredItems.length - 1 : lightboxIndex - 1;
    goTo(prevIdx, -1);
  }, [lightboxIndex, filteredItems.length, goTo]);

  const nextImage = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    if (e && "stopPropagation" in e) e.stopPropagation();
    if (lightboxIndex === null) return;
    const nextIdx = lightboxIndex === filteredItems.length - 1 ? 0 : lightboxIndex + 1;
    goTo(nextIdx, 1);
  }, [lightboxIndex, filteredItems.length, goTo]);

  // Keyboard Navigation inside Lightbox
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") prevImage(e);
      if (e.key === "ArrowRight") nextImage(e);
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, prevImage, nextImage, closeLightbox]);

  // Auto-hide Lightbox controls
  useEffect(() => {
    if (lightboxIndex === null) return;
    let timer: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (zoomScale === 1) {
          setShowControls(false);
        }
      }, 3500);
    };
    window.addEventListener("mousemove", handleMouseMove);
    handleMouseMove();
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timer);
    };
  }, [lightboxIndex, zoomScale]);

  // Thumbnail Auto-scroll
  useEffect(() => {
    if (lightboxIndex !== null && thumbnailRefs.current[lightboxIndex]) {
      thumbnailRefs.current[lightboxIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [lightboxIndex]);

  // HTML5 Fullscreen helper
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error("Fullscreen error", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const handleDeleteImage = async (item: GalleryItem) => {
    setIsDeleting(true);
    try {
      const updated = new Set(deletedUrls);
      updated.add(item.imageUrl);
      setDeletedUrls(updated);
      localStorage.setItem("kcm_deleted_images", JSON.stringify(Array.from(updated)));

      if (lightboxIndex !== null) {
        const currentItem = filteredItems[lightboxIndex];
        if (currentItem && currentItem.imageUrl === item.imageUrl) {
          closeLightbox();
        }
      }

      const res = await fetch("/api/ngo/gallery/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: item.imageUrl }),
      });
      const data = await res.json();
      
      if (data.success) {
        setToastMessage("Image deleted successfully");
      } else {
        setToastMessage("Image hidden client-side");
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      setToastMessage("Image hidden client-side");
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  const ngoT = mounted ? t.ngo : translations.en.ngo;

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Admin Mode Banner */}
        {isAdminMode && (
          <div className="fixed top-4 inset-x-4 z-[150] flex justify-center pointer-events-none">
            <div className="bg-slate-900/90 dark:bg-slate-950/90 text-white border border-red-500/30 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-xs font-mono tracking-wider font-semibold uppercase text-red-400">Admin Mode Active</span>
              <span className="text-xs text-slate-400 border-l border-white/10 pl-3">Click title 5 times to exit</span>
            </div>
          </div>
        )}

        {/* Toast notifications */}
        {toastMessage && (
          <div className="fixed bottom-6 inset-x-6 z-[250] flex justify-center pointer-events-none">
            <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xs font-semibold">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Deletion Modal */}
        {deletingItem && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 to-rose-500" />
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Photo?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Are you sure you want to delete this image?
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeletingItem(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteImage(deletingItem)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="space-y-3 max-w-2xl">
          <h1
            onClick={handleTitleClick}
            className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-purple-600 dark:from-white dark:to-purple-400 bg-clip-text text-transparent cursor-pointer select-none"
            title="Click 5 times to toggle Admin Mode"
          >
            {ngoT.galleryTitle}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {ngoT.gallerySubtitle}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 font-mono">
            {filteredItems.length} photos loaded
            {selectedCategory !== "ALL" && ` · ${CATEGORIES.find((c) => c.value === selectedCategory)?.label}`}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2 uppercase font-mono tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            {ngoT.filterLabel}
          </div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              id={`gallery-filter-${cat.value.toLowerCase()}`}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                selectedCategory === cat.value
                  ? "bg-purple-600/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-300 border-purple-400/30 dark:border-purple-500/30 shadow-md"
                  : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {status === "pending" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-full aspect-[3/2] bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : status === "error" ? (
          <div className="min-h-[30vh] flex flex-col items-center justify-center border border-slate-200 dark:border-white/5 rounded-3xl bg-red-50/10 dark:bg-red-950/10 p-6 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Failed to load NGO gallery</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all"
            >
              Retry
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="min-h-[30vh] flex items-center justify-center border border-slate-200 dark:border-white/5 rounded-3xl bg-slate-100/40 dark:bg-slate-900/40">
            <div className="text-center space-y-2 text-slate-400">
              <ImageIcon className="w-12 h-12 mx-auto" />
              <p className="text-sm">{ngoT.noPhotos}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="columns-1 sm:columns-2 md:columns-3 gap-5">
              {displayedItems.map((item, index) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onClick={() => openLightbox(index)}
                  isAdminMode={isAdminMode}
                  onDelete={handleDeleteImage}
                  priority={index < 4}
                />
              ))}
            </div>

            {/* Infinite scroll pagination sentinel */}
            <div ref={sentinelRef} className="flex justify-center py-6">
              {hasNextPage ? (
                <span className="text-xs text-slate-400 font-mono">Scroll down for more</span>
              ) : (
                <span className="text-xs text-slate-400 font-mono">No more photos to load</span>
              )}
            </div>
          </div>
        )}

        {/* Lightbox Overlay */}
        <AnimatePresence>
          {lightboxIndex !== null && filteredItems.length > 0 && (() => {
            const currentItem = filteredItems[lightboxIndex];
            const gradient = CATEGORY_COLORS[currentItem?.category] ?? "from-slate-600 to-slate-500";
            
            const slideVariants = {
              enter: (dir: number) => ({
                x: dir > 0 ? "100vw" : dir < 0 ? "-100vw" : 0,
                opacity: 0,
                scale: 0.95,
              }),
              center: {
                x: 0,
                opacity: 1,
                scale: 1,
                zIndex: 10,
              },
              exit: (dir: number) => ({
                x: dir < 0 ? "100vw" : dir > 0 ? "-100vw" : 0,
                opacity: 0,
                scale: 0.95,
                zIndex: 0,
              }),
            };

            const handleImageTap = (e: React.MouseEvent | React.TouchEvent) => {
              e.stopPropagation();
              const now = Date.now();
              if (now - lastTap < 300) {
                setZoomScale((prev) => (prev > 1 ? 1 : 2.5));
              } else {
                setLastTap(now);
              }
            };

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 w-screen h-screen z-[200] flex flex-col justify-between items-center bg-black/95 backdrop-blur-sm overflow-hidden select-none"
                onClick={closeLightbox}
                role="dialog"
                aria-modal="true"
                aria-label="Image lightbox"
              >
                {/* Prefetch adjacent images */}
                {filteredItems[lightboxIndex + 1] && (
                  <img src={encodeSrc(filteredItems[lightboxIndex + 1].imageUrl)} className="hidden" alt="" />
                )}
                {filteredItems[lightboxIndex - 1] && (
                  <img src={encodeSrc(filteredItems[lightboxIndex - 1].imageUrl)} className="hidden" alt="" />
                )}

                {/* Top Toolbar */}
                <motion.div
                  animate={{ y: showControls ? 0 : -80, opacity: showControls ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute top-0 inset-x-0 z-50 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 pointer-events-auto">
                    <span className={`px-2.5 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${gradient} shadow-md`}>
                      {currentItem?.category}
                    </span>
                    <span className="text-white/70 text-xs font-mono font-bold">
                      {lightboxIndex + 1} / {filteredItems.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
                    <button
                      onClick={() => setZoomScale((prev) => (prev > 1 ? 1 : 2.5))}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
                      title={zoomScale > 1 ? "Zoom Out" : "Zoom In"}
                    >
                      {zoomScale > 1 ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
                      title="Toggle Fullscreen"
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => {
                        if (!currentItem) return;
                        const link = document.createElement("a");
                        link.href = encodeSrc(currentItem.imageUrl);
                        link.download = currentItem.imageUrl.substring(currentItem.imageUrl.lastIndexOf("/") + 1);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
                      title="Download Photo"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (!currentItem) return;
                        const absoluteUrl = window.location.origin + currentItem.imageUrl;
                        navigator.clipboard.writeText(absoluteUrl);
                        setToastMessage("Image link copied to clipboard");
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
                      title="Share Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setShowMobileInfo((prev) => !prev)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all backdrop-blur-md border ${
                        showMobileInfo
                          ? "bg-purple-600 border-purple-500 text-white"
                          : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                      }`}
                      title="Toggle Information"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    {isAdminMode && currentItem && (
                      <button
                        onClick={() => setDeletingItem(currentItem)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-600 text-red-400 hover:text-white transition-all duration-200"
                        title="Delete Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={closeLightbox}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
                      title="Close Lightbox"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>

                {/* Left/Right Navigation Buttons */}
                <AnimatePresence>
                  {showControls && zoomScale === 1 && (
                    <>
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={prevImage}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md"
                        aria-label="Previous Image"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </motion.button>

                      <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={nextImage}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md"
                        aria-label="Next Image"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </motion.button>
                    </>
                  )}
                </AnimatePresence>

                {/* Main Viewport */}
                <div
                  className="relative flex-1 w-full h-[calc(100vh-160px)] sm:h-[calc(100vh-200px)] flex items-center justify-center overflow-hidden"
                  onClick={closeLightbox}
                >
                  {lbLoading && !lbError && (
                    <div className="absolute z-20 flex flex-col items-center gap-3 bg-black/20 p-6 rounded-2xl backdrop-blur-sm">
                      <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                      <span className="text-white/60 text-xs font-mono">Loading Photo...</span>
                    </div>
                  )}

                  {lbError && (
                    <div className="absolute z-30 flex flex-col items-center gap-4 text-center max-w-xs p-6 bg-slate-900/90 border border-white/10 rounded-2xl backdrop-blur-lg">
                      <AlertCircle className="w-12 h-12 text-red-400" />
                      <p className="text-white text-sm font-semibold">Failed to load photo</p>
                      <button
                        onClick={() => { setLbLoading(true); setLbError(false); }}
                        className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={lightboxIndex}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.3 },
                      }}
                      drag={zoomScale === 1}
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      dragElastic={0.6}
                      onDragEnd={(e, info) => {
                        if (zoomScale === 1) {
                          const swipeThresholdX = 100;
                          const swipeThresholdY = 120;
                          if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
                            if (info.offset.x > swipeThresholdX) {
                              prevImage();
                            } else if (info.offset.x < -swipeThresholdX) {
                              nextImage();
                            }
                          } else {
                            if (info.offset.y > swipeThresholdY) {
                              closeLightbox();
                            }
                          }
                        }
                      }}
                      className="absolute inset-0 flex items-center justify-center p-4 sm:p-8"
                      onClick={closeLightbox}
                    >
                      <div
                        className="relative max-w-full max-h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <motion.div
                          animate={{ scale: zoomScale }}
                          transition={{ type: "spring", stiffness: 200, damping: 25 }}
                          className="relative max-w-full max-h-full flex items-center justify-center cursor-zoom-in"
                          onClick={handleImageTap}
                        >
                          <Image
                            src={encodeSrc(currentItem.imageUrl)}
                            alt={currentItem.title}
                            width={1620}
                            height={1080}
                            priority
                            placeholder="blur"
                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFjMTkxZiIvPjwvc3ZnPg=="
                            className={`max-w-[95vw] max-h-[70vh] sm:max-h-[75vh] w-auto h-auto object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
                              lbError ? "opacity-0" : "opacity-100"
                            }`}
                            onLoad={() => setLbLoading(false)}
                            onError={() => { setLbLoading(false); setLbError(true); }}
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Sidebar Info Panel */}
                <AnimatePresence>
                  {showMobileInfo && currentItem && (
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="absolute top-20 right-4 bottom-24 w-80 sm:w-96 z-[60] p-6 bg-slate-900/90 backdrop-blur-lg border border-white/10 rounded-2xl text-left text-white shadow-2xl flex flex-col justify-between overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                          <span className={`px-2.5 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${gradient} shadow-sm`}>
                            {currentItem.category}
                          </span>
                          <button
                            onClick={() => setShowMobileInfo(false)}
                            className="text-slate-400 hover:text-white transition-colors text-xs font-bold"
                          >
                            Hide details
                          </button>
                        </div>
                        <h2 className="text-base font-black text-white tracking-tight leading-snug">
                          {currentItem.title}
                        </h2>
                        {currentItem.createdAt && (
                          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                            <Calendar className="w-3.5 h-3.5 text-purple-400" />
                            <span>{new Date(currentItem.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-4 border-t border-white/5 space-y-2 mt-6">
                        <button
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = encodeSrc(currentItem.imageUrl);
                            link.download = currentItem.imageUrl.substring(currentItem.imageUrl.lastIndexOf("/") + 1);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Photo
                        </button>
                        <button
                          onClick={() => {
                            const absoluteUrl = window.location.origin + currentItem.imageUrl;
                            navigator.clipboard.writeText(absoluteUrl);
                            setToastMessage("Image link copied to clipboard");
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Copy Image URL
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom Thumbnail Strip */}
                <motion.div
                  animate={{ y: showControls ? 0 : 100, opacity: showControls ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute bottom-4 inset-x-0 z-50 flex flex-col items-center gap-3 w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-full max-w-4xl px-4 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-2 scrollbar-none select-none">
                    {filteredItems.map((item, idx) => (
                      <button
                        key={item.id}
                        ref={(el) => { thumbnailRefs.current[idx] = el; }}
                        onClick={() => goTo(idx, idx > lightboxIndex ? 1 : -1)}
                        className={`relative flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === lightboxIndex
                            ? "border-purple-500 scale-110 opacity-100 shadow-lg shadow-purple-500/40"
                            : "border-transparent opacity-40 hover:opacity-80"
                        }`}
                      >
                        <img
                          src={encodeSrc(item.thumbnailUrl)}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

      </div>
    </div>
  );
}
