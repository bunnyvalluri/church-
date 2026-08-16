"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
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
  Search,
  ArrowUp,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import io from "socket.io-client";

// Encode a URL path so parentheses and spaces are safe for browsers
function encodeSrc(src: string | null | undefined): string {
  if (!src) return "";
  let clean = src.trim();
  if (clean.startsWith("https%3A") || clean.startsWith("http%3A")) {
    try {
      clean = decodeURIComponent(clean);
    } catch {}
  }
  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("//") ||
    clean.startsWith("data:") ||
    clean.startsWith("blob:")
  ) {
    return clean;
  }
  if (!clean.startsWith("/")) {
    clean = "/" + clean;
  }
  try {
    const [path, ...queryAndHash] = clean.split(/(?=[?#])/);
    const encodedPath = path
      .split("/")
      .map((segment) => {
        try {
          return encodeURIComponent(decodeURIComponent(segment));
        } catch {
          return encodeURIComponent(segment);
        }
      })
      .join("/");
    return [encodedPath, ...queryAndHash].join("");
  } catch {
    return clean;
  }
}

// Session-wide cache of loaded image URLs to prevent skeleton flashes
const loadedImagesCache = new Set<string>();

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
  "ALL": "from-purple-600 to-indigo-600",
  "NIMS-HOSPITAL": "from-blue-600 to-cyan-500",
  "GOVT-HOSPITAL": "from-emerald-600 to-teal-400",
  "GANDHI-HOSPITAL": "from-amber-500 to-orange-400",
  "ASHRAMAM": "from-fuchsia-600 to-pink-400",
  "DISABLED-AASHRAMAM": "from-rose-500 to-red-400",
};

const CATEGORY_STYLES: Record<string, {
  active: string;
  inactive: string;
  badgeActive: string;
  badgeInactive: string;
  dot: string;
}> = {
  "ALL": {
    active: "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white border-transparent shadow-lg shadow-purple-500/25 scale-[1.02]",
    inactive: "bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-purple-950/40 hover:border-purple-400",
    badgeActive: "bg-white/20 text-white font-black",
    badgeInactive: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold",
    dot: "bg-purple-500",
  },
  "NIMS-HOSPITAL": {
    active: "bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 text-white border-transparent shadow-lg shadow-blue-500/25 scale-[1.02]",
    inactive: "bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 hover:border-blue-400",
    badgeActive: "bg-white/20 text-white font-black",
    badgeInactive: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold",
    dot: "bg-blue-500",
  },
  "GOVT-HOSPITAL": {
    active: "bg-gradient-to-r from-emerald-600 via-teal-600 to-green-500 text-white border-transparent shadow-lg shadow-emerald-500/25 scale-[1.02]",
    inactive: "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 hover:border-emerald-400",
    badgeActive: "bg-white/20 text-white font-black",
    badgeInactive: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold",
    dot: "bg-emerald-500",
  },
  "GANDHI-HOSPITAL": {
    active: "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border-transparent shadow-lg shadow-orange-500/25 scale-[1.02]",
    inactive: "bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 hover:bg-amber-50/80 dark:hover:bg-amber-950/40 hover:border-amber-400",
    badgeActive: "bg-white/20 text-white font-black",
    badgeInactive: "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold",
    dot: "bg-amber-500",
  },
  "ASHRAMAM": {
    active: "bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-500 text-white border-transparent shadow-lg shadow-pink-500/25 scale-[1.02]",
    inactive: "bg-white dark:bg-slate-900 border-fuchsia-200 dark:border-fuchsia-900/50 text-fuchsia-700 dark:text-fuchsia-300 hover:bg-fuchsia-50/80 dark:hover:bg-fuchsia-950/40 hover:border-fuchsia-400",
    badgeActive: "bg-white/20 text-white font-black",
    badgeInactive: "bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-700 dark:text-fuchsia-300 font-bold",
    dot: "bg-fuchsia-500",
  },
  "DISABLED-AASHRAMAM": {
    active: "bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 text-white border-transparent shadow-lg shadow-rose-500/25 scale-[1.02]",
    inactive: "bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 hover:border-rose-400",
    badgeActive: "bg-white/20 text-white font-black",
    badgeInactive: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold",
    dot: "bg-rose-500",
  },
};

interface GalleryItem {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  title: string;
  category: string;
  createdAt: string;
  branchId?: string | null;
}

// Memoized GalleryCard to prevent DOM re-renders and stabilize layouts
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
  const [isLoaded, setIsLoaded] = useState(() => loadedImagesCache.has(item.thumbnailUrl) || loadedImagesCache.has(item.imageUrl));
  const [hasError, setHasError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="relative group rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-slate-950 cursor-pointer shadow-sm hover:border-purple-500/50 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-xl aspect-[4/3] sm:aspect-[3/2] w-full"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Open ${item.title}`}
    >
      {/* Category badge */}
      <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 z-20 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${CATEGORY_COLORS[item.category] ?? "from-slate-600 to-slate-500"} shadow-md transition-transform duration-300 group-hover:scale-105 backdrop-blur-md`}>
        {item.category}
      </div>

      {/* Delete button (Admin Mode only) */}
      {isAdminMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 p-1.5 sm:p-2 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white transition-all duration-200 shadow-lg"
          title="Delete image"
          aria-label="Delete image"
        >
          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      )}

      {/* Image container */}
      <div className="relative overflow-hidden w-full h-full bg-slate-950 flex items-center justify-center">
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-slate-800/80 animate-pulse z-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500/50 animate-spin" />
          </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center justify-center text-center p-3 space-y-1.5 bg-gradient-to-br from-slate-900 to-purple-950 text-white w-full h-full">
            <ImageIcon className="w-6 h-6 text-purple-400 opacity-60" />
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-300 truncate max-w-[90%]">{item.title}</span>
            <span className="text-[8px] uppercase tracking-widest text-purple-300/80 font-mono">Service Photo</span>
          </div>
        ) : (
          <>
            {/* Ambient Blurred Layer for color-matched background */}
            <Image
              src={encodeSrc(item.thumbnailUrl || item.imageUrl)}
              alt=""
              fill
              unoptimized
              aria-hidden="true"
              className="object-cover blur-md opacity-35 scale-110 pointer-events-none select-none"
            />

            {/* Crisp Contained Foreground Image - Never crops Telugu text or newspaper press release headlines! */}
            <Image
              src={encodeSrc(item.thumbnailUrl || item.imageUrl)}
              alt={item.title || "Service photo"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              unoptimized
              className={`object-contain z-10 transform group-hover:scale-105 transition-all duration-500 ease-out ${
                isLoaded ? "opacity-100 scale-100" : "opacity-90 blur-sm"
              }`}
              onLoad={() => {
                loadedImagesCache.add(item.thumbnailUrl);
                loadedImagesCache.add(item.imageUrl);
                setIsLoaded(true);
              }}
              onError={() => {
                setHasError(true);
                setIsLoaded(true);
              }}
            />
          </>
        )}

        {/* Premium Hover / Touch Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-3 sm:p-4 z-20">
          <div className="flex justify-end">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-300">
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out space-y-0.5">
            <p className="text-white text-[10px] sm:text-xs font-bold font-sans drop-shadow-sm uppercase tracking-wider">{item.category}</p>
            <p className="text-white/90 text-[11px] sm:text-xs font-medium drop-shadow-sm truncate">
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
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Lightbox options state
  const [lbLoading, setLbLoading] = useState(false);
  const [lbLoaded, setLbLoaded] = useState(false);
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

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const allImages: GalleryItem[] = useMemo(() => data?.images || [], [data]);

  // Category Photo Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0 };
    CATEGORIES.forEach((c) => { counts[c.value] = 0; });
    
    allImages.forEach((img) => {
      if (deletedUrls.has(img.imageUrl)) return;
      counts.ALL = (counts.ALL || 0) + 1;
      if (counts[img.category] !== undefined) {
        counts[img.category] += 1;
      }
    });
    return counts;
  }, [allImages, deletedUrls]);

  // Filtering items by Category & Search
  const filteredItems = useMemo(() => {
    return allImages.filter((item) => {
      if (deletedUrls.has(item.imageUrl)) return false;
      const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allImages, selectedCategory, searchQuery, deletedUrls]);

  const [displayLimit, setDisplayLimit] = useState(24);

  // Reset display limit when filter or search changes
  useEffect(() => {
    setDisplayLimit(24);
  }, [selectedCategory, searchQuery]);

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
    const item = filteredItems[idx];
    const isCached = item ? loadedImagesCache.has(item.imageUrl) || loadedImagesCache.has(item.thumbnailUrl) : false;
    setLbLoading(!isCached);
    setLbLoaded(isCached);
    setLbError(false);
    setLightboxIndex(idx);
    setShowMobileInfo(false);
    setZoomScale(1);
    setDirection(0);
    document.body.style.overflow = "hidden";
  }, [filteredItems]);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setLbLoading(false);
    setLbLoaded(false);
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
    const item = filteredItems[idx];
    const isCached = item ? loadedImagesCache.has(item.imageUrl) || loadedImagesCache.has(item.thumbnailUrl) : false;
    setLbLoading(!isCached);
    setLbLoaded(isCached);
    setLbError(false);
    setDirection(customDirection);
    setLightboxIndex(idx);
    setShowMobileInfo(false);
    setZoomScale(1);
  }, [filteredItems]);

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

  const ngoT = t.ngo || {};

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
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

        {/* Header & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-white/10 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Service Documentation</span>
            </div>
            <h1
              onClick={handleTitleClick}
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-purple-600 dark:from-white dark:via-slate-100 dark:to-purple-300 bg-clip-text text-transparent cursor-pointer select-none"
              title="Click 5 times to toggle Admin Mode"
            >
              {ngoT.galleryTitle || "Service Gallery"}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {ngoT.gallerySubtitle || "Witness our physical ministries in action. Browse through photographs showing food distributions, patient healthcare kits, and Ashramam support projects."}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono pt-1">
              <span>{filteredItems.length} photos displayed</span>
              <span>•</span>
              <span>{categoryCounts.ALL || 0} total photos</span>
            </div>
          </div>

          {/* Interactive Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search photo title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="sticky top-[104px] sm:top-[120px] z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl py-2.5 -mx-4 px-4 sm:mx-0 sm:px-0 border-y border-slate-200/60 dark:border-white/10 shadow-sm">

          {/* Mobile: 2-column structured grid (3 neat rows of 2) */}
          <div className="sm:hidden grid grid-cols-2 gap-1.5">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.value] || 0;
              const isSelected = selectedCategory === cat.value;
              const styles = CATEGORY_STYLES[cat.value] || CATEGORY_STYLES["ALL"];
              return (
                <button
                  key={cat.value}
                  id={`gallery-filter-${cat.value.toLowerCase()}`}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-2.5 py-2 text-[11px] font-bold rounded-xl border transition-all duration-200 flex items-center justify-between gap-1 cursor-pointer min-w-0 ${
                    isSelected ? styles.active : styles.inactive
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSelected ? "bg-white" : styles.dot}`} />
                    <span className="truncate">{cat.label}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono flex-shrink-0 ${isSelected ? styles.badgeActive : styles.badgeInactive}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desktop: single-row scroll */}
          <div className="hidden sm:flex items-center gap-2.5 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1 uppercase font-mono tracking-wider flex-shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </div>
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.value] || 0;
              const isSelected = selectedCategory === cat.value;
              const styles = CATEGORY_STYLES[cat.value] || CATEGORY_STYLES["ALL"];
              return (
                <button
                  key={cat.value}
                  id={`gallery-filter-${cat.value.toLowerCase()}-desktop`}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-2xl border transition-all duration-300 flex items-center gap-2.5 flex-shrink-0 cursor-pointer ${
                    isSelected ? styles.active : styles.inactive
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isSelected ? "bg-white animate-pulse" : styles.dot}`} />
                  <span>{cat.label}</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-colors ${isSelected ? styles.badgeActive : styles.badgeInactive}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        {status === "pending" ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-full aspect-[4/3] sm:aspect-[3/2] bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/5" />
            ))}
          </div>
        ) : status === "error" ? (
          <div className="min-h-[30vh] flex flex-col items-center justify-center border border-slate-200 dark:border-white/5 rounded-3xl bg-red-50/10 dark:bg-red-950/10 p-8 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-base font-bold text-slate-900 dark:text-white">Failed to load NGO gallery</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">Please check your internet connection or reload the photo gallery.</p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Loading
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="min-h-[35vh] flex items-center justify-center border border-slate-200 dark:border-white/5 rounded-3xl bg-slate-50 dark:bg-slate-900/40 p-8">
            <div className="text-center space-y-3 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center mx-auto">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Photos Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {searchQuery ? `No results for "${searchQuery}". Try clearing search keywords.` : (ngoT.noPhotos || "No service photographs found for this category.")}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <motion.div
              key={selectedCategory + searchQuery}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
            >
              {displayedItems.map((item, index) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onClick={() => openLightbox(index)}
                  isAdminMode={isAdminMode}
                  onDelete={handleDeleteImage}
                  priority={index < 6}
                />
              ))}
            </motion.div>

            {/* Infinite scroll pagination sentinel */}
            <div ref={sentinelRef} className="flex justify-center py-6">
              {hasNextPage ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading more service photos...</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-mono">End of gallery photos</span>
              )}
            </div>
          </div>
        )}

        {/* Floating Back to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-600/30 hover:scale-110 active:scale-95 transition-all duration-300 border border-purple-400/30"
            title="Back to Top"
            aria-label="Back to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {/* Lightbox Overlay */}
        {mounted && typeof document !== "undefined" && createPortal(
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
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 w-full h-[100dvh] z-[99999] flex flex-col justify-between items-center bg-black/95 backdrop-blur-md overflow-hidden select-none"
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
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="absolute top-0 inset-x-0 z-50 flex items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-black/90 via-black/60 to-transparent pointer-events-none gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto min-w-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${gradient} shadow-md truncate max-w-[120px] sm:max-w-none`}>
                        {currentItem?.category}
                      </span>
                      <span className="text-white/80 text-[11px] sm:text-xs font-mono font-bold whitespace-nowrap">
                        {lightboxIndex + 1} / {filteredItems.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto flex-shrink-0">
                      <button
                        onClick={() => setZoomScale((prev) => (prev > 1 ? 1 : 2.5))}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
                        title={zoomScale > 1 ? "Zoom Out" : "Zoom In"}
                      >
                        {zoomScale > 1 ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={toggleFullscreen}
                        className="w-8 h-8 sm:w-9 sm:h-9 hidden sm:flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
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
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
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
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
                        title="Share Link"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setShowMobileInfo((prev) => !prev)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition-all backdrop-blur-md border ${
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
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-600 text-red-400 hover:text-white transition-all duration-200"
                          title="Delete Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={closeLightbox}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 ml-1"
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
                          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-transform active:scale-95 shadow-lg"
                          aria-label="Previous Image"
                        >
                          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </motion.button>

                        <motion.button
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          onClick={nextImage}
                          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40 w-5 h-5 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-transform active:scale-95 shadow-lg"
                          aria-label="Next Image"
                        >
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                        </motion.button>
                      </>
                    )}
                  </AnimatePresence>

                  {/* Main Viewport */}
                  <div
                    className="relative flex-1 w-full h-[calc(100dvh-150px)] sm:h-[calc(100dvh-180px)] flex items-center justify-center overflow-hidden py-14 sm:py-16"
                    onClick={closeLightbox}
                  >
                    {lbLoading && !lbError && (
                      <div className="absolute z-20 flex flex-col items-center gap-3 bg-black/40 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                        <span className="text-white/80 text-xs font-mono">Loading Photo...</span>
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
                        className="absolute inset-0 flex items-center justify-center p-2 sm:p-6"
                        onClick={closeLightbox}
                      >
                        <div
                          className="relative max-w-full max-h-full flex items-center justify-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <motion.div
                            animate={{ scale: zoomScale }}
                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                            className="relative max-w-full max-h-full flex items-center justify-center cursor-zoom-in bg-black/40 rounded-lg overflow-hidden"
                            onClick={handleImageTap}
                          >
                            <Image
                              src={encodeSrc(currentItem.imageUrl || currentItem.thumbnailUrl)}
                              alt={currentItem.title || "Service Photo"}
                              width={1620}
                              height={1080}
                              priority
                              unoptimized
                              className="max-w-[92vw] sm:max-w-[85vw] max-h-[62dvh] sm:max-h-[72dvh] md:max-h-[78dvh] w-auto h-auto object-contain rounded-lg shadow-2xl transition-opacity duration-300"
                              onLoad={() => {
                                loadedImagesCache.add(currentItem.imageUrl);
                                setLbLoading(false);
                                setLbLoaded(true);
                              }}
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
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="fixed inset-x-3 bottom-20 sm:bottom-24 sm:right-4 sm:left-auto sm:w-96 z-[60] p-5 sm:p-6 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl text-left text-white shadow-2xl flex flex-col justify-between max-h-[50vh] sm:max-h-[70vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
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
                          <h2 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug">
                            {currentItem.title}
                          </h2>
                          {currentItem.createdAt && (
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                              <Calendar className="w-3.5 h-3.5 text-purple-400" />
                              <span>{new Date(currentItem.createdAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-3 border-t border-white/10 space-y-2 mt-4">
                          <button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = encodeSrc(currentItem.imageUrl);
                              link.download = currentItem.imageUrl.substring(currentItem.imageUrl.lastIndexOf("/") + 1);
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="w-full py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <Download className="w-3.5 h-3.5" /> Download Photo
                          </button>
                          <button
                            onClick={() => {
                              const absoluteUrl = window.location.origin + currentItem.imageUrl;
                              navigator.clipboard.writeText(absoluteUrl);
                              setToastMessage("Image link copied to clipboard");
                            }}
                            className="w-full py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
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
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="absolute bottom-3 inset-x-0 z-50 flex flex-col items-center gap-2 w-full pb-[env(safe-area-inset-bottom)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-full max-w-4xl px-3 flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto py-1.5 no-scrollbar select-none">
                      {filteredItems.map((item, idx) => (
                        <button
                          key={item.id}
                          ref={(el) => { thumbnailRefs.current[idx] = el; }}
                          onClick={() => goTo(idx, idx > lightboxIndex ? 1 : -1)}
                          className={`relative flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === lightboxIndex
                              ? "border-purple-500 scale-110 opacity-100 shadow-lg shadow-purple-500/40"
                              : "border-transparent opacity-40 hover:opacity-80"
                          }`}
                        >
                          <img
                            src={encodeSrc(item.thumbnailUrl || item.imageUrl)}
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
          </AnimatePresence>,
          document.body
        )}
      </div>
    </div>
  );
}
