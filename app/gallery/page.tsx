"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Video, Play, X, Maximize2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Gallery Items Data
const galleryItems = [
  {
    id: 1,
    title: "Sunday Morning Praise & Worship",
    category: "Worship",
    type: "image",
    url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1000&q=80",
    description: "Our congregation coming together in powerful worship, seeking God's presence.",
  },
  {
    id: 2,
    title: "Youth Retreat 2026 Worship Night",
    category: "Worship",
    type: "image",
    url: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1000&q=80",
    description: "Young hearts lifted in adoration during the evening encounter service.",
  },
  {
    id: 3,
    title: "Summer Youth Bible Study Camp",
    category: "Youth",
    type: "image",
    url: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=1000&q=80",
    description: "The next generation diving deep into Scripture, building solid roots.",
  },
  {
    id: 4,
    title: "Friday Night Youth Fellowship",
    category: "Youth",
    type: "image",
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1000&q=80",
    description: "Fun, games, and authentic conversations about faith and life.",
  },
  {
    id: 5,
    title: "Community Food Distribution Drive",
    category: "Community",
    type: "image",
    url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1000&q=80",
    description: "Distributing relief packets to families in our local neighborhood.",
  },
  {
    id: 6,
    title: "Free Medical Camp & Consultation",
    category: "Community",
    type: "image",
    url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1000&q=80",
    description: "Providing healthcare checkups to those in need in our community.",
  },
  {
    id: 7,
    title: "Shapur Village Outreach Program",
    category: "Outreach",
    type: "image",
    url: "https://images.unsplash.com/photo-1445633814773-e68785c19ce0?w=1000&q=80",
    description: "Sharing the message of Christ's hope and grace with remote communities.",
  },
  {
    id: 8,
    title: "Special Healing Prayer Gathering",
    category: "Worship",
    type: "video",
    url: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1000&q=80",
    videoId: "K-C2O7bEopg", // YouTube video placeholder
    description: "A short highlight reel of the miracles and testimony from our healing night.",
  },
  {
    id: 9,
    title: "Youth Outdoor Sports Fellowship",
    category: "Youth",
    type: "image",
    url: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1000&q=80",
    description: "Building strong bonds and health through sports and active recreation.",
  },
];

const categories = ["All", "Worship", "Youth", "Community", "Outreach"];

export default function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const [lightboxItem, setLightboxItem] = useState<typeof galleryItems[0] | null>(null);

  const filteredItems = galleryItems.filter(
    (item) => filter === "All" || item.category === filter
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05050a] transition-colors duration-300">
      <Navbar />

      {/* Hero Header Section */}
      <section className="relative py-24 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 overflow-hidden mt-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/20 blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm transition-all text-xs font-semibold hover:-translate-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
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
        {/* Category Filters - Glassmorphic Horizontal Scroll */}
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
                  <Image
                    src={item.url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setLightboxItem(null)} />

            {/* Modal Body */}
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
                  <iframe
                    src={`https://www.youtube.com/embed/${lightboxItem.videoId}?autoplay=1`}
                    title="Church Video Player"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <Image
                    src={lightboxItem.url}
                    alt={lightboxItem.title}
                    fill
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
