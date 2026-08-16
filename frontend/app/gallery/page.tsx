"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Video,
  Play,
  Pause,
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Heart,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Grid3X3,
  Columns,
  Sparkles,
  Calendar,
  MapPin,
  Tag,
  Check,
  Info,
  Loader2,
  Flame,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import { useBranch } from "@/components/providers/BranchProvider";
import Navbar from "@/components/layout/Navbar";
import { CURATED_GALLERY_ITEMS, GalleryItem } from "@/lib/galleryData";

// Session cache to prevent re-flashing loaded images
const loadedCache = new Set<string>();

// Helper to encode safe URLs
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

// Toast notification interface
interface ToastMessage {
  id: string;
  text: string;
  type?: "success" | "info" | "heart";
}

export default function ChurchGalleryPage() {
  const { selectedBranchId, setSelectedBranchId, branches } = useBranch();

  // Core state
  const [items, setItems] = useState<GalleryItem[]>(CURATED_GALLERY_ITEMS);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"order-asc" | "order-desc" | "newest" | "title-asc">("order-asc");
  const [viewMode, setViewMode] = useState<"masonry" | "standard" | "compact">("masonry");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Progressive batch rendering for instant 60fps performance
  const INITIAL_BATCH = 24;
  const BATCH_SIZE = 16;
  const [displayCount, setDisplayCount] = useState(INITIAL_BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Lightbox & Slideshow state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
  const [slideshowProgress, setSlideshowProgress] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kcm-gallery-favorites");
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("Removed from saved photos", "info");
      } else {
        next.add(id);
        showToast("Saved to your favorites ❤️", "heart");
      }
      try {
        localStorage.setItem("kcm-gallery-favorites", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  // Show Toast
  const showToast = (text: string, type: "success" | "info" | "heart" = "success") => {
    const id = Math.random().toString(36).substring(7);
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2800);
  };

  // Reset pagination when active filter or sort changes
  useEffect(() => {
    setDisplayCount(INITIAL_BATCH);
  }, [activeCategory, searchQuery, selectedBranch, favoritesOnly, sortOrder]);

  // Fetch gallery items from API (non-blocking background sync)
  useEffect(() => {
    let isMounted = true;
    const fetchGallery = async () => {
      if (items.length === 0) {
        setIsLoading(true);
      }
      try {
        const branchParam = selectedBranch === "all" ? "" : `&branch=${encodeURIComponent(selectedBranch)}`;
        const res = await fetch(`/api/gallery?limit=300&sort=${sortOrder}${branchParam}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.galleryItems) && data.galleryItems.length > 0) {
            setItems(data.galleryItems);
          }
        }
      } catch (err) {
        console.error("[Gallery] API fetch error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchGallery();
    return () => {
      isMounted = false;
    };
  }, [selectedBranch, sortOrder]);

  // Sync with global branch provider if set
  useEffect(() => {
    if (selectedBranchId && selectedBranchId !== "all") {
      setSelectedBranch(selectedBranchId);
    }
  }, [selectedBranchId]);

  // Derive categories dynamically with count
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    const unique = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return [
      { name: "All", count: items.length },
      ...unique.map((cat) => ({ name: cat, count: counts[cat] })),
    ];
  }, [items]);

  // Filter & sort items based on activeCategory, search, branch, favorites, and sortOrder
  const filteredItems = useMemo(() => {
    const result = items.filter((item) => {
      // Category filter
      if (activeCategory !== "All" && item.category !== activeCategory) {
        return false;
      }
      // Favorites filter
      if (favoritesOnly && !favorites.has(item.id)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesEvent = item.eventName?.toLowerCase().includes(q);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesEvent && !matchesTags) {
          return false;
        }
      }
      return true;
    });

    // Apply strict order-wise sorting
    return [...result].sort((a, b) => {
      if (sortOrder === "order-desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === "title-asc") {
        return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" });
      } else {
        // "order-asc" (Default chronological order: Photo #1 to #80)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    });
  }, [items, activeCategory, favoritesOnly, favorites, searchQuery, sortOrder]);

  // Derived visible items for progressive rendering
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, displayCount);
  }, [filteredItems, displayCount]);

  const hasMore = filteredItems.length > displayCount;

  // Infinite scroll intersection observer
  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prev) => Math.min(prev + BATCH_SIZE, filteredItems.length));
        }
      },
      { rootMargin: "350px" }
    );
    const target = sentinelRef.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, filteredItems.length]);

  // Current lightbox item
  const currentLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  // Navigate lightbox
  const nextPhoto = useCallback(() => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setZoomLevel(1);
    setLightboxIndex((prev) => ((prev ?? 0) + 1) % filteredItems.length);
    setSlideshowProgress(0);
  }, [lightboxIndex, filteredItems.length]);

  const prevPhoto = useCallback(() => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setZoomLevel(1);
    setLightboxIndex((prev) => ((prev ?? 0) - 1 + filteredItems.length) % filteredItems.length);
    setSlideshowProgress(0);
  }, [lightboxIndex, filteredItems.length]);

  // Slideshow auto-advance timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isSlideshowPlaying && lightboxIndex !== null) {
      const stepMs = 50;
      const durationMs = 4000;
      setSlideshowProgress(0);

      progressInterval = setInterval(() => {
        setSlideshowProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + (stepMs / durationMs) * 100;
        });
      }, stepMs);

      timer = setInterval(() => {
        nextPhoto();
      }, durationMs);
    } else {
      setSlideshowProgress(0);
    }

    return () => {
      clearInterval(timer);
      clearInterval(progressInterval);
    };
  }, [isSlideshowPlaying, lightboxIndex, nextPhoto]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") {
        setLightboxIndex(null);
        setIsSlideshowPlaying(false);
      } else if (e.key === "ArrowRight") {
        nextPhoto();
      } else if (e.key === "ArrowLeft") {
        prevPhoto();
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setIsSlideshowPlaying((prev) => !prev);
      } else if (e.key === "+" || e.key === "=") {
        setZoomLevel((prev) => Math.min(prev + 0.5, 3));
      } else if (e.key === "-") {
        setZoomLevel((prev) => Math.max(prev - 0.5, 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, nextPhoto, prevPhoto]);

  // Auto-scroll thumbnail strip
  useEffect(() => {
    if (lightboxIndex !== null && thumbnailContainerRef.current) {
      const activeThumb = thumbnailContainerRef.current.children[lightboxIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [lightboxIndex]);

  // Touch Swipe Handlers for Lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      nextPhoto();
    } else if (diff < -50) {
      prevPhoto();
    }
    touchStartX.current = null;
  };

  // Download Handler
  const handleDownload = async (item: GalleryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    showToast("Downloading high-resolution photo...", "info");
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${item.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showToast("Photo downloaded successfully!", "success");
    } catch {
      window.open(item.url, "_blank");
    }
  };

  // Share Handler
  const handleShare = async (item: GalleryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const fullUrl = `${window.location.origin}/gallery?photo=${encodeURIComponent(item.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `${item.title} — Kingdom of Christ Ministries Gallery`,
          url: fullUrl,
        });
        showToast("Shared successfully!", "success");
      } catch {}
    } else {
      navigator.clipboard.writeText(fullUrl);
      showToast("Link copied to clipboard!", "success");
    }
  };

  // Subhash Nagar event stats
  const subhashPhotosCount = items.filter(
    (i) => i.branchName?.includes("Subhash") || i.url.includes("subhash-nagar")
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-purple-500 selection:text-white transition-colors duration-300">
      <Navbar />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900/95 border border-purple-500/30 text-white shadow-2xl backdrop-blur-xl pointer-events-none"
          >
            {toast.type === "heart" ? (
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
            ) : toast.type === "info" ? (
              <Info className="w-5 h-5 text-sky-400" />
            ) : (
              <Check className="w-5 h-5 text-emerald-400" />
            )}
            <span className="text-sm font-semibold tracking-wide">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION - Deep Atmospheric Glow & Glassmorphism */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-purple-50/80 via-slate-50 to-slate-50 dark:from-purple-950/40 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-white/5">
        {/* Animated Background Mesh & Lights */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,40,200,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,40,200,0.35),rgba(255,255,255,0))]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-500/10 dark:bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-blue-600/10 dark:bg-blue-600/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <BackToHome variant="glass" />
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 dark:border-purple-400/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
                <span>Captured Moments of Faith</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white font-outfit">
              Church <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 dark:from-purple-400 dark:via-pink-400 dark:to-amber-300 bg-clip-text text-transparent">Gallery</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300/90 leading-relaxed font-medium max-w-2xl mx-auto">
              Relive the powerful moments of revival, family blessings, vibrant worship, and heartfelt fellowship across all Kingdom of Christ branches.
            </p>

            {/* Live Stats Chips */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                  {items.length}+ Photos Captured
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                  Subhash Nagar & Multi-Branch
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                  Family Blessing Gathering
                </span>
              </div>
            </div>

            {/* Quick Hero CTA Button */}
            {filteredItems.length > 0 && (
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => {
                    setLightboxIndex(0);
                    setIsSlideshowPlaying(true);
                  }}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-size-200 hover:bg-right text-white font-bold text-sm shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.03] active:scale-95 transition-all duration-300"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Launch Cinematic Slideshow ({filteredItems.length} Photos)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED EVENT HIGHLIGHT CARD - Subhash Nagar Family Blessing Gathering */}
      <section className="container mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-100/90 via-white/95 to-indigo-100/90 dark:from-purple-950/80 dark:via-slate-900/90 dark:to-indigo-950/80 border border-purple-200 dark:border-purple-500/20 shadow-xl dark:shadow-2xl backdrop-blur-xl p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[90px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 dark:border-amber-400/30 text-amber-700 dark:text-amber-300 text-xs font-black tracking-wider uppercase">
                  <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
                  Featured Revival Event
                </span>
                <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold">Subhash Nagar Branch</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Family Blessing Gathering — 78 Photos Logged
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                An unforgettable service with Bishop Kurra Kristhu Raju ministering prayers of blessing, unity, healing, and generational grace over every family in attendance.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => {
                  setActiveCategory("Family Blessings");
                  setSelectedBranch("all");
                  setFavoritesOnly(false);
                }}
                className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Filter 78 Photos</span>
              </button>
              <button
                onClick={() => {
                  const subhashFirstIdx = items.findIndex((i) => i.branchName?.includes("Subhash") || i.url.includes("subhash-nagar"));
                  setLightboxIndex(subhashFirstIdx !== -1 ? subhashFirstIdx : 0);
                  setIsSlideshowPlaying(false);
                }}
                className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-900 dark:text-white text-xs sm:text-sm font-bold border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              >
                <Maximize2 className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                <span>View Fullscreen</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MASTER CONTROL HUB - Filter Tabs, Search, View Switcher */}
      <main className="container mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-6 mb-10">
          {/* Top Bar: Search Bar & Branch Switcher & Layout Buttons */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-2 sm:p-3 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-md dark:shadow-lg">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photos..."
                className="w-full pl-9 sm:pl-11 pr-9 sm:pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Branch & Sort Selectors Dropdowns */}
            <div className="grid grid-cols-1 sm:flex sm:flex-nowrap items-center gap-2">
              {/* Branch Selector */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  aria-label="Filter photos by church branch"
                  className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer pr-2 text-xs sm:text-sm w-full truncate"
                >
                  <option value="all" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    All Church Branches ({items.length})
                  </option>
                  <option value="cmrgwqhc30001fsk8mysbmp50" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    Subhash Nagar Branch ({subhashPhotosCount})
                  </option>
                  <option value="cmskewevf0000lz9gnoh1n8ve" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    Shapur Nagar Branch
                  </option>
                  <option value="cmrgwqhc30002fsk8ncn255w5" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    Bahadurpally Branch
                  </option>
                </select>
              </div>

              {/* Sort Order Selector */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  aria-label="Sort gallery photos"
                  className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer pr-2 text-xs sm:text-sm w-full truncate"
                >
                  <option value="order-asc" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    Order Wise (Photo 1 → {items.length})
                  </option>
                  <option value="order-desc" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    Reverse Order ({items.length} → 1)
                  </option>
                  <option value="title-asc" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    Title (A → Z)
                  </option>
                </select>
              </div>

              {/* View Layout Switcher */}
              <div className="hidden sm:flex items-center p-1 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl">
                <button
                  onClick={() => setViewMode("masonry")}
                  title="Masonry View"
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "masonry"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Columns className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("standard")}
                  title="Standard Grid"
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "standard"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  title="Compact Grid"
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "compact"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Section */}
          <div>
            {/* Mobile View: Structured 2-column grid showing ALL categories & Saved Photos clearly */}
            <div className="sm:hidden grid grid-cols-2 gap-1.5">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.name && !favoritesOnly;
                return (
                  <button
                    key={cat.name}
                    id={`gallery-filter-m-${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => {
                      setActiveCategory(cat.name);
                      setFavoritesOnly(false);
                    }}
                    className={`px-3 py-2.5 text-[11px] font-bold rounded-xl border transition-all duration-200 flex items-center justify-between gap-1 cursor-pointer min-w-0 shadow-sm ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white border-purple-500/50 shadow-md shadow-purple-900/25"
                        : "bg-white dark:bg-slate-900/70 border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono flex-shrink-0 font-extrabold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}

              {/* Mobile Saved Photos Button */}
              <button
                id="gallery-filter-m-saved"
                onClick={() => setFavoritesOnly((prev) => !prev)}
                className={`px-3 py-2.5 text-[11px] font-bold rounded-xl border transition-all duration-200 flex items-center justify-between gap-1 cursor-pointer min-w-0 shadow-sm ${
                  favoritesOnly
                    ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-500/50 shadow-md shadow-rose-900/25"
                    : "bg-white dark:bg-slate-900/70 border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Heart className={`w-3.5 h-3.5 flex-shrink-0 ${favoritesOnly ? "fill-white" : "text-rose-500 dark:text-rose-400"}`} />
                  <span className="truncate">Saved Photos</span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono flex-shrink-0 font-extrabold ${
                    favoritesOnly
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {favorites.size}
                </span>
              </button>
            </div>

            {/* Desktop & Tablet: Horizontal Scrollable Pills */}
            <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-600/30 scrollbar-track-transparent">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.name && !favoritesOnly;
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setActiveCategory(cat.name);
                      setFavoritesOnly(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap flex items-center gap-2 border shadow-sm ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white border-purple-500/50 shadow-md shadow-purple-900/25 scale-[1.02]"
                        : "bg-white dark:bg-slate-900/70 border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-full font-extrabold font-mono ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}

              {/* Saved Favorites Toggle */}
              <button
                onClick={() => setFavoritesOnly((prev) => !prev)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap flex items-center gap-2 border shadow-sm ${
                  favoritesOnly
                    ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-500/50 shadow-md shadow-rose-900/25 scale-[1.02]"
                    : "bg-white dark:bg-slate-900/70 border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? "fill-white" : "text-rose-500 dark:text-rose-400"}`} />
                <span>Saved Photos</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-extrabold font-mono ${
                    favoritesOnly
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {favorites.size}
                </span>
              </button>
            </div>
          </div>

          {/* Active Filter Info Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <div>
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredItems.length}</span>{" "}
              {filteredItems.length === 1 ? "moment" : "moments"}
              {activeCategory !== "All" && (
                <span>
                  {" "}
                  in <span className="text-purple-600 dark:text-purple-400 font-semibold">{activeCategory}</span>
                </span>
              )}
              {searchQuery && (
                <span>
                  {" "}
                  matching &ldquo;<span className="text-amber-600 dark:text-amber-400 font-semibold">{searchQuery}</span>&rdquo;
                </span>
              )}
              {sortOrder !== "order-asc" && (
                <span className="text-slate-500 dark:text-slate-400">
                  {" "}
                  • Sorted: <span className="text-amber-600 dark:text-amber-300 font-semibold">{sortOrder === "order-desc" ? "Reverse" : "Title A-Z"}</span>
                </span>
              )}
            </div>

            {(activeCategory !== "All" || searchQuery || favoritesOnly || sortOrder !== "order-asc") && (
              <button
                onClick={() => {
                  setActiveCategory("All");
                  setSearchQuery("");
                  setFavoritesOnly(false);
                  setSortOrder("order-asc");
                }}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-bold underline transition-colors"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* GALLERY ITEMS GRID */}
        {isLoading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wide">
              Loading high-resolution gallery moments...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-24 px-4 rounded-3xl bg-slate-100/70 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-white/10 backdrop-blur-md max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No gallery moments found</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Try adjusting your search keywords or switching category filters to see more photos.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
                setFavoritesOnly(false);
                setSelectedBranch("all");
                setSortOrder("order-asc");
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div>
            <div
              className={
                viewMode === "masonry"
                  ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
                  : viewMode === "compact"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              }
            >
              {visibleItems.map((item, index) => {
                const isFav = favorites.has(item.id);
                const globalIndex = filteredItems.findIndex((fi) => fi.id === item.id);
                const actualLightboxIndex = globalIndex !== -1 ? globalIndex : index;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setLightboxIndex(actualLightboxIndex);
                      setIsSlideshowPlaying(false);
                    }}
                    className={`group relative bg-white dark:bg-slate-900/80 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 hover:border-purple-500/50 shadow-md hover:shadow-xl dark:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-purple-900/20 transition-all duration-300 hover:-translate-y-1 transform-gpu cursor-pointer flex flex-col justify-between ${
                      viewMode === "masonry" ? "break-inside-avoid mb-6" : ""
                    }`}
                  >
                    {/* Media Container */}
                    <div
                      className={`relative w-full overflow-hidden bg-slate-100 dark:bg-slate-950 ${
                        viewMode === "compact"
                          ? "aspect-square"
                          : viewMode === "standard"
                          ? "aspect-[4/3]"
                          : "aspect-[4/3] sm:aspect-auto sm:min-h-[220px]"
                      }`}
                    >
                      <GalleryCardImage
                        src={item.url}
                        title={item.title}
                        priority={index < 12}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                        <span className="px-2.5 py-1 rounded-full bg-slate-900/70 dark:bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold tracking-wider border border-white/20">
                          #{actualLightboxIndex + 1}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-extrabold tracking-wider border border-purple-400/30">
                          {item.category.toUpperCase()}
                        </span>
                      </div>

                      {/* Glass Hover Overlay with Action Buttons */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20 backdrop-blur-[2px]">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          {/* Zoom / Lightbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxIndex(actualLightboxIndex);
                            }}
                            title="Expand Lightbox"
                            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-950 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all backdrop-blur-md border border-white/20"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>

                          {/* Quick Download */}
                          <button
                            onClick={(e) => handleDownload(item, e)}
                            title="Download High-Res"
                            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-950 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all backdrop-blur-md border border-white/20"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Share */}
                          <button
                            onClick={(e) => handleShare(item, e)}
                            title="Share Photo"
                            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-950 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all backdrop-blur-md border border-white/20"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          {/* Favorite Heart */}
                          <button
                            onClick={(e) => toggleFavorite(item.id, e)}
                            title={isFav ? "Remove Favorite" : "Save Favorite"}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all backdrop-blur-md border ${
                              isFav
                                ? "bg-rose-600 text-white border-rose-400"
                                : "bg-white/20 hover:bg-white text-white hover:text-rose-500 border-white/20"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Caption (for non-compact views) */}
                    {viewMode !== "compact" && (
                      <div className="p-4 sm:p-5 bg-white/95 dark:bg-slate-900/90 border-t border-slate-100 dark:border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-300">
                            <MapPin className="w-3 h-3" />
                            {item.branchName || "Subhash Nagar"}
                          </span>
                          <span>{item.eventDate || "July 2026"}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Infinite Scroll Sentinel & Load More button */}
            {hasMore && (
              <div ref={sentinelRef} className="pt-12 pb-6 flex flex-col items-center justify-center gap-3">
                <button
                  onClick={() => setDisplayCount((prev) => Math.min(prev + BATCH_SIZE, filteredItems.length))}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-50 dark:bg-purple-600/20 hover:bg-purple-600 text-purple-700 dark:text-purple-300 hover:text-white border border-purple-200 dark:border-purple-500/30 text-xs sm:text-sm font-bold transition-all shadow-md hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Load More Moments ({filteredItems.length - displayCount} remaining)</span>
                </button>
                <span className="text-[11px] text-slate-500 font-medium">
                  Showing {visibleItems.length} of {filteredItems.length} photos
                </span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FULLSCREEN CINEMATIC LIGHTBOX & SLIDESHOW MODAL */}
      <AnimatePresence>
        {lightboxIndex !== null && currentLightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-2xl select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Toolbar */}
            <div className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
              {/* Photo Index Counter & Category */}
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-black tracking-widest uppercase">
                  {lightboxIndex + 1} / {filteredItems.length}
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-400">
                  {currentLightboxItem.category} • {currentLightboxItem.eventName || "Subhash Nagar Event"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Slideshow Play / Pause Button */}
                <button
                  onClick={() => setIsSlideshowPlaying((prev) => !prev)}
                  title={isSlideshowPlaying ? "Pause Slideshow (Space)" : "Play Slideshow (Space)"}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSlideshowPlaying
                      ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30"
                      : "bg-white/10 hover:bg-white/20 text-slate-200 border-white/10"
                  }`}
                >
                  {isSlideshowPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      <span className="hidden sm:inline">Slideshow</span>
                    </>
                  )}
                </button>

                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(z + 0.5, 3))}
                    title="Zoom In (+)"
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-200"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(z - 0.5, 1))}
                    title="Zoom Out (-)"
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-200"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  {zoomLevel > 1 && (
                    <button
                      onClick={() => setZoomLevel(1)}
                      title="Reset Zoom"
                      className="p-1.5 hover:bg-white/10 rounded-lg text-purple-300"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Download */}
                <button
                  onClick={(e) => handleDownload(currentLightboxItem, e)}
                  title="Download High-Res"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Share */}
                <button
                  onClick={(e) => handleShare(currentLightboxItem, e)}
                  title="Share Link"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Favorite */}
                <button
                  onClick={(e) => toggleFavorite(currentLightboxItem.id, e)}
                  title="Save Favorite"
                  className={`p-2 rounded-xl border transition-colors ${
                    favorites.has(currentLightboxItem.id)
                      ? "bg-rose-600 text-white border-rose-400"
                      : "bg-white/10 hover:bg-white/20 text-slate-200 border-white/10"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.has(currentLightboxItem.id) ? "fill-white" : ""
                    }`}
                  />
                </button>

                {/* Toggle Info */}
                <button
                  onClick={() => setShowInfoPanel((prev) => !prev)}
                  title="Toggle Info"
                  className={`p-2 rounded-xl border transition-colors ${
                    showInfoPanel
                      ? "bg-purple-600 text-white border-purple-400"
                      : "bg-white/10 hover:bg-white/20 text-slate-200 border-white/10"
                  }`}
                >
                  <Info className="w-4 h-4" />
                </button>

                {/* Close Lightbox */}
                <button
                  onClick={() => {
                    setLightboxIndex(null);
                    setIsSlideshowPlaying(false);
                  }}
                  title="Close (Esc)"
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 hover:text-white text-slate-200 border border-white/10 transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Slideshow Progress Bar */}
            {isSlideshowPlaying && (
              <div className="w-full h-1 bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-75"
                  style={{ width: `${slideshowProgress}%` }}
                />
              </div>
            )}

            {/* Main Lightbox Display Area */}
            <div className="relative flex-1 flex items-center justify-center p-1 sm:p-4 overflow-hidden">
              {/* Previous Photo Button */}
              <button
                onClick={prevPhoto}
                title="Previous Photo (Left Arrow)"
                className="absolute left-2 sm:left-5 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-black/40 hover:bg-purple-600 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Next Photo Button */}
              <button
                onClick={nextPhoto}
                title="Next Photo (Right Arrow)"
                className="absolute right-2 sm:right-5 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-black/40 hover:bg-purple-600 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Active Photo Container */}
              <motion.div
                key={currentLightboxItem.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
              >
                <div
                  className="relative w-full h-full max-w-6xl max-h-[82vh] sm:max-h-[85vh] flex items-center justify-center transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <Image
                    src={encodeSrc(currentLightboxItem.url)}
                    alt={currentLightboxItem.title}
                    fill
                    unoptimized
                    priority
                    className="object-contain drop-shadow-2xl select-none"
                  />
                </div>
              </motion.div>

              {/* Discreet Floating Photo Info Pill (when panel is collapsed) */}
              {!showInfoPanel && (
                <button
                  onClick={() => setShowInfoPanel(true)}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-slate-950/70 hover:bg-purple-600 text-white/90 hover:text-white border border-white/20 backdrop-blur-md text-[11px] font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5 text-purple-300" />
                  <span>Photo Info</span>
                </button>
              )}

              {/* Floating Info Drawer (collapsible) */}
              {showInfoPanel && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute bottom-2 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-4 sm:max-w-md p-4 rounded-2xl bg-slate-950/90 border border-white/20 backdrop-blur-2xl shadow-2xl z-30 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-md border border-purple-500/30">
                        {currentLightboxItem.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {currentLightboxItem.eventDate || "July 15, 2026"}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowInfoPanel(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Hide Info"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {currentLightboxItem.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {currentLightboxItem.description}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1 text-amber-300 font-bold">
                      <MapPin className="w-3 h-3" />
                      {currentLightboxItem.branchName || "Subhash Nagar Branch"}
                    </span>
                    <button
                      onClick={(e) => handleDownload(currentLightboxItem, e)}
                      className="text-purple-400 hover:text-purple-300 font-bold inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Bottom Interactive Thumbnail Reel */}
            <div className="relative z-30 px-4 py-3 bg-slate-950 border-t border-white/10">
              <div
                ref={thumbnailContainerRef}
                className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-purple-600/50 scrollbar-track-transparent scroll-smooth max-w-full"
              >
                {filteredItems.map((thumbItem, tIdx) => {
                  const isSelected = tIdx === lightboxIndex;
                  return (
                    <button
                      key={thumbItem.id}
                      onClick={() => {
                        setLightboxIndex(tIdx);
                        setZoomLevel(1);
                        setSlideshowProgress(0);
                      }}
                      className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? "border-purple-500 scale-105 shadow-lg shadow-purple-600/40 ring-2 ring-purple-400/50"
                          : "border-white/10 opacity-50 hover:opacity-100 hover:border-white/40"
                      }`}
                    >
                      <Image
                        src={encodeSrc(thumbItem.thumbnailUrl || thumbItem.url)}
                        alt={thumbItem.title}
                        fill
                        unoptimized
                        sizes="64px"
                        loading="lazy"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

// Progressive Image Component with Instant Direct Loading & Fast Decoding
function GalleryCardImage({
  src,
  title,
  priority = false,
}: {
  src: string;
  title: string;
  priority?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(() => loadedCache.has(src));
  const safeSrc = encodeSrc(src);

  return (
    <div className="relative w-full h-full min-h-[200px] bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200/80 dark:bg-slate-800/80 animate-pulse flex items-center justify-center">
          <Camera className="w-8 h-8 text-slate-400 dark:text-slate-600" />
        </div>
      )}
      <Image
        src={safeSrc}
        alt={title}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        className={`object-cover transform group-hover:scale-105 transition-transform duration-300 ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => {
          loadedCache.add(src);
          setIsLoaded(true);
        }}
      />
    </div>
  );
}