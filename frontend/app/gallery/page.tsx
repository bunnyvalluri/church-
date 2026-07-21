"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Video, Play, X, Maximize2, ArrowLeft, Loader2 } from "lucide-react";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import { useBranch } from "@/components/providers/BranchProvider";
import Navbar from "@/components/layout/Navbar";

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  type: "image" | "video";
  videoId?: string;
  createdAt: string;
}

// Encode a URL path so parentheses and spaces are safe for browsers
function encodeSrc(src: string): string {
  if (!src) return "";
  return src
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

// Session-wide cache of loaded image URLs to prevent skeleton flashes
const loadedImagesCache = new Set<string>();

function GalleryGridImage({ src, title }: { src: string; title: string }) {
  const [isLoaded, setIsLoaded] = useState(() => loadedImagesCache.has(src));

  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800/50 animate-pulse z-10" />
      )}
      <Image
        src={encodeSrc(src)}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        loading="lazy"
        className={`object-cover transform group-hover:scale-105 transition-all duration-700 ease-out ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onLoad={() => {
          loadedImagesCache.add(src);
          setIsLoaded(true);
        }}
      />
    </div>
  );
}

export default function GalleryPage() {
  const { selectedBranchId } = useBranch();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Fetch gallery items depending on selected branch
  useEffect(() => {
    const fetchGallery = async () => {
      setIsLoading(true);
      try {
        const url =
          selectedBranchId === "all"
            ? "/api/gallery"
            : `/api/branch/${selectedBranchId}/gallery`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setGalleryItems(data.galleryItems || data.media || []);
          }
        }
      } catch (err) {
        console.error("[Gallery] Failed to fetch media:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGallery();
  }, [selectedBranchId]);

  // Derive categories dynamically from the loaded items
  const categories = [
    "All",
    ...Array.from(new Set(galleryItems.map((item) => item.category))),
  ];

  const filteredItems = galleryItems.filter(
    (item) => filter === "All" || item.category === filter
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05050a] transition-colors duration-300">
      <Navbar />

      {/* Hero Header Section */}
      <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/20 blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="mb-6 flex justify-center">
            <BackToHome />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight font-outfit">
            Church Gallery
          </h1>
          <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
            Capturing the vibrant moments, fellowship, service, and moves of God at Kingdom of Christ Ministries.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            <p className="text-sm font-bold text-gray-500">Loading gallery items...</p>
          </div>
        ) : (
          <>
            {/* Category Filters - Glassmorphic Horizontal Scroll */}
            {galleryItems.length > 0 && (
              <div className="flex justify-center mb-12">
                <div className="flex gap-2 p-1.5 bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-2xl shadow-sm backdrop-blur-md overflow-x-auto max-w-full scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
                        filter === cat
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/10"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-white/5"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    key={item.id}
                    className="group relative bg-white dark:bg-white/[0.02] rounded-3xl overflow-hidden border border-gray-200/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-2xl dark:hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Media Container */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-gray-900">
                      <GalleryGridImage
                        src={item.url}
                        title={item.title}
                      />
                      {/* Glass Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <button
                          onClick={() => setLightboxItem(item)}
                          className="w-12 h-12 rounded-2xl bg-white text-gray-900 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                          title={item.type === "video" ? "Watch Video" : "View Image"}
                        >
                          {item.type === "video" ? (
                            <Play className="w-6 h-6 text-purple-600 fill-current ml-0.5" />
                          ) : (
                            <Maximize2 className="w-5 h-5 text-purple-600" />
                          )}
                        </button>
                      </div>

                      {/* Type Badge */}
                      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] font-bold tracking-wider flex items-center gap-1.5">
                        {item.type === "video" ? (
                          <>
                            <Video className="w-3 h-3" />
                            VIDEO
                          </>
                        ) : (
                          <>
                            <Camera className="w-3 h-3" />
                            PHOTO
                          </>
                        )}
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-purple-600 rounded-full text-white text-[10px] font-bold tracking-wider">
                        {item.category.toUpperCase()}
                      </div>
                    </div>

                    {/* Info Text Area */}
                    <div className="p-6 md:p-8">
                      <h3 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="text-center py-20 bg-white/40 dark:bg-white/[0.01] border border-dashed border-gray-300 dark:border-white/10 rounded-3xl backdrop-blur-md">
                <p className="text-gray-500 dark:text-gray-400 font-medium">No items found in this category.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Lightbox Modal / Player */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <div className="absolute inset-0" onClick={() => setLightboxItem(null)} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-gray-950/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                <span className="text-xs font-bold tracking-widest text-purple-400 uppercase">
                  {lightboxItem.category} • {lightboxItem.type}
                </span>
                <button
                  onClick={() => setLightboxItem(null)}
                  className="p-1 rounded-xl hover:bg-white/10 text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Media Display */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                {lightboxItem.type === "video" ? (
                  lightboxItem.url.includes("youtube.com") || lightboxItem.url.includes("youtu.be") ? (
                    <iframe
                      src={
                        lightboxItem.url.includes("embed")
                          ? lightboxItem.url
                          : `https://www.youtube.com/embed/${lightboxItem.videoId || lightboxItem.url.split("v=")[1]}`
                      }
                      title="Church Video Player"
                      className="absolute inset-0 w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={lightboxItem.url}
                      controls
                      autoPlay
                      className="absolute inset-0 w-full h-full"
                    />
                  )
                ) : (
                  <Image
                    src={lightboxItem.url}
                    alt={lightboxItem.title}
                    fill
                    unoptimized
                    className="object-contain"
                    priority
                  />
                )}
              </div>

              {/* Footer Information */}
              <div className="p-6 md:p-8 bg-black/40">
                <h4 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight">
                  {lightboxItem.title}
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {lightboxItem.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}