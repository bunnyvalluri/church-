"use client";

import React, { useState, useEffect } from "react";
import { ImageIcon, X, ChevronLeft, ChevronRight, Loader2, Filter } from "lucide-react";

interface MediaItem {
  id: string;
  title: string | null;
  description: string | null;
  type: string;
  url: string;
  category: string | null;
}

export default function NgoGalleryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // High quality curated placeholder images representing KCM NGO services
  const presetMedia: MediaItem[] = [
    {
      id: "g1",
      title: "Gandhi General Hospital Outreach",
      description: "Volunteers distributing healthy food packets and essential commodities in the public wards.",
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200",
      category: "GANDHI-HOSPITAL",
    },
    {
      id: "g2",
      title: "Wheelchair Donation Campaign",
      description: "Distributing brand new wheelchairs to physically impaired individuals at the Government Hospital.",
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1200",
      category: "GOVT-HOSPITAL",
    },
    {
      id: "g3",
      title: "Patient Care Packages",
      description: "Packing emergency care kits containing medicines, water bottles, and hygiene materials.",
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200",
      category: "GANDHI-HOSPITAL",
    },
    {
      id: "g4",
      title: "Bethany Ashramam Provisions",
      description: "Delivering monthly supplies of groceries, flour bags, and fresh cooking oils to orphan children.",
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1200",
      category: "ASHRAMAM",
    },
    {
      id: "g5",
      title: "NIMS Specialized Care Kit",
      description: "Distributing specialized medicines and healthy snack boxes to long-term care patients in NIMS.",
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=1200",
      category: "NIMS-HOSPITAL",
    },
    {
      id: "g6",
      title: "Blanket and Bedding Drive",
      description: "Distributing warm blankets and soft pillows to the disabled elder home during the winter outreach.",
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1504159506876-f8338247a14a?auto=format&fit=crop&q=80&w=1200",
      category: "DISABLED-AASHRAMAM",
    },
    {
      id: "g7",
      title: "Volunteers Meeting",
      description: "KCM social service volunteers preparing maps and packet distributions for the weekly outreach.",
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1526976721720-6fe7f0ddb1ef?auto=format&fit=crop&q=80&w=1200",
      category: "ALL",
    },
    {
      id: "g8",
      title: "Children Nutrition Campaign",
      description: "Serving fresh fruit and nutritious breakfast boxes to orphans and underprivileged kids.",
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1200",
      category: "ASHRAMAM",
    },
  ];

  useEffect(() => {
    async function fetchMedia() {
      try {
        const res = await fetch("/api/ngo/media?type=IMAGE");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.media.length > 0) {
            setMedia(data.media);
          } else {
            setMedia(presetMedia);
          }
        } else {
          setMedia(presetMedia);
        }
      } catch (err) {
        console.error("Failed to fetch gallery:", err);
        setMedia(presetMedia);
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, []);

  const categories = [
    { label: "All Photos", value: "ALL" },
    { label: "Gandhi Hospital", value: "GANDHI-HOSPITAL" },
    { label: "NIMS Hospital", value: "NIMS-HOSPITAL" },
    { label: "Govt Hospital", value: "GOVT-HOSPITAL" },
    { label: "Ashramams", value: "ASHRAMAM" },
    { label: "Disabled Care", value: "DISABLED-AASHRAMAM" },
  ];

  const filteredMedia = selectedCategory === "ALL"
    ? media
    : media.filter(item => item.category === selectedCategory);

  const openLightbox = (url: string) => {
    const idx = filteredMedia.findIndex(item => item.url === url);
    if (idx !== -1) setLightboxIndex(idx);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && filteredMedia.length > 0) {
      setLightboxIndex(lightboxIndex === 0 ? filteredMedia.length - 1 : lightboxIndex - 1);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && filteredMedia.length > 0) {
      setLightboxIndex(lightboxIndex === filteredMedia.length - 1 ? 0 : lightboxIndex + 1);
    }
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="space-y-4 max-w-2xl text-left">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
            Service Gallery
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Witness our physical ministries in action. Browse through photographs showing food distributions, patient healthcare kits, and Ashramam support projects.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2 uppercase font-mono tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </div>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                selectedCategory === cat.value
                  ? "bg-purple-600/20 text-purple-300 border-purple-500/30 shadow-md shadow-purple-500/5"
                  : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="min-h-[30vh] flex items-center justify-center border border-white/5 rounded-3xl bg-slate-900/40">
            <div className="text-center space-y-2 text-slate-500">
              <ImageIcon className="w-12 h-12 mx-auto" />
              <p className="text-sm">No photos found in this category.</p>
            </div>
          </div>
        ) : (
          /* True CSS Masonry Layout */
          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => openLightbox(item.url)}
                className="break-inside-avoid relative group rounded-2xl overflow-hidden border border-white/5 bg-slate-900 cursor-pointer shadow-lg hover:border-purple-500/30 transition-all duration-300 hover:shadow-purple-500/5"
              >
                <img
                  src={item.url}
                  alt={item.title || "NGO Gallery Image"}
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                
                {/* Overlay details on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  {item.title && (
                    <h3 className="font-bold text-white text-base truncate">{item.title}</h3>
                  )}
                  {item.description && (
                    <p className="text-slate-300 text-xs mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lighbox Modal */}
        {lightboxIndex !== null && filteredMedia.length > 0 && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation controls */}
            <button
              onClick={prevImage}
              className="absolute left-4 sm:left-6 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 sm:right-6 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Content card */}
            <div
              className="max-w-4xl w-full max-h-[85vh] flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full flex-1 min-h-[50vh] flex items-center justify-center">
                <img
                  src={filteredMedia[lightboxIndex].url}
                  alt={filteredMedia[lightboxIndex].title || "Lightbox view"}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl border border-white/10 shadow-2xl"
                />
              </div>

              {filteredMedia[lightboxIndex].title && (
                <div className="text-center space-y-1.5 max-w-xl px-4">
                  <h3 className="text-lg font-bold text-white">
                    {filteredMedia[lightboxIndex].title}
                  </h3>
                  {filteredMedia[lightboxIndex].description && (
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {filteredMedia[lightboxIndex].description}
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
