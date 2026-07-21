"use client";

import React, { useState, useEffect } from "react";
import { Video, Loader2, PlayCircle, Clock } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  thumbnailUrl: string;
}

export default function NgoVideosPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ngoT = t.ngo; // LanguageProvider guards t to en before mount � no double-guard needed

  // The 5 required YouTube embeds provided by the user
  const presetVideos: VideoItem[] = [
    {
      id: "vid-gandhi-new",
      title: "Gandhi Hospital Food & Care Outreach",
      description: "Detailed video coverage of KCM volunteers distributing warm milk, food boxes, and basic sanitary kits to patient caretakers and critical care wards at Gandhi Hospital.",
      type: "VIDEO_YOUTUBE",
      url: "https://www.youtube.com/embed/cugBnrzyPF4?si=JRM4VEcma5_hRW8r",
      thumbnailUrl: "https://img.youtube.com/vi/cugBnrzyPF4/maxresdefault.jpg",
    },
    {
      id: "vid-nims-new",
      title: "NIMS Hospital Care & Support Campaign",
      description: "Watch our volunteers distribute specialized medications, patient clothes, and nutritional foods to patients in the oncology and orthopedic departments at NIMS.",
      type: "VIDEO_YOUTUBE",
      url: "https://www.youtube.com/embed/y7gLEkS9CcI?si=YRzU4aaeORdjaGLw",
      thumbnailUrl: "https://img.youtube.com/vi/y7gLEkS9CcI/maxresdefault.jpg",
    },
    {
      id: "vid-govt-new",
      title: "Government General Hospital Distribution Drive",
      description: "Direct footage showing wheelchair provisions, walkers, patient beds, and food packet distribution drives organized at the local government hospital.",
      type: "VIDEO_YOUTUBE",
      url: "https://www.youtube.com/embed/u4-lrU41HAc?si=vgAb5MnRZhG2Awwd",
      thumbnailUrl: "https://img.youtube.com/vi/u4-lrU41HAc/maxresdefault.jpg",
    },
    {
      id: "vid-ashramam",
      title: "Bethany Samrakshana Ashramam Support",
      description: "Delivering monthly groceries, rice bags, academic books, and healthy food items to children and residents at Bethany Samrakshana Ashramam.",
      type: "VIDEO_YOUTUBE",
      url: "https://www.youtube.com/embed/IhcbOLPMmM8?si=tOGhSKfBExTLmAT0",
      thumbnailUrl: "https://img.youtube.com/vi/IhcbOLPMmM8/maxresdefault.jpg",
    },
    {
      id: "vid-disabled-ashramam",
      title: "Disabled Care Ashramam Visitation",
      description: "Providing comfort kits, warm blankets, bedsheets, wheelchairs, and physical support to the residents of the Home for the Disabled.",
      type: "VIDEO_YOUTUBE",
      url: "https://www.youtube.com/embed/mE5NiqLGVSw?si=Fm7E9ViV7TL57mzi",
      thumbnailUrl: "https://img.youtube.com/vi/mE5NiqLGVSw/maxresdefault.jpg",
    },
  ];

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/ngo/media?type=VIDEO_YOUTUBE");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.media.length > 0) {
            // Combine database videos with preset ones
            const dbVideos = data.media.map((item: any) => ({
              id: item.id,
              title: item.title || "Social Service Video Log",
              description: item.description || "Video showing KCM outreach programs.",
              type: item.type,
              url: item.url,
              thumbnailUrl: item.thumbnailUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
            }));
            const allVids = [...presetVideos, ...dbVideos];
            setVideos(allVids);
            setActiveVideo(allVids[0]);
          } else {
            setVideos(presetVideos);
            setActiveVideo(presetVideos[0]);
          }
        } else {
          setVideos(presetVideos);
          setActiveVideo(presetVideos[0]);
        }
      } catch (err) {
        console.error("Failed to fetch videos:", err);
        setVideos(presetVideos);
        setActiveVideo(presetVideos[0]);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="space-y-4 max-w-2xl text-left">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-purple-600 dark:from-white dark:to-purple-400 bg-clip-text text-transparent">
            {ngoT.videosPage.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {ngoT.videosPage.desc}
          </p>
        </div>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          </div>
        ) : (
          /* Split-Screen Player Layout */
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Active Player Card */}
            <div className="lg:col-span-8 space-y-6">
              {activeVideo && (
                <div className="space-y-6">
                  {/* Aspect Ratio Container for iFrame */}
                  <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-950">
                    <iframe
                      src={activeVideo.url}
                      title={activeVideo.title}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>

                  {/* Active Video Info */}
                  <div className="space-y-3 p-6 bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl text-left">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-mono uppercase tracking-wider">
                      <PlayCircle className="w-4 h-4" />
                      {ngoT.videosPage.nowPlaying}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {activeVideo.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                      {activeVideo.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Playlist Panel */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-lg dark:shadow-xl max-h-[80vh] flex flex-col">
              <div className="p-5 border-b border-slate-200 dark:border-white/5 flex items-center gap-2 text-left">
                <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-sm sm:text-base uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {ngoT.videosPage.playlistTitle}
                </h3>
              </div>

              <div className="overflow-y-auto divide-y divide-slate-200 dark:divide-white/5 max-h-[60vh] sm:max-h-[500px]">
                {videos.map((vid) => {
                  const isActive = activeVideo?.id === vid.id;
                  return (
                    <div
                      key={vid.id}
                      onClick={() => setActiveVideo(vid)}
                      className={`p-4 flex gap-4 cursor-pointer text-left transition-colors ${
                        isActive
                          ? "bg-purple-600/10 dark:bg-purple-600/15 hover:bg-purple-600/15"
                          : "hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      {/* Thumbnail wrapper */}
                      <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <PlayCircle className="w-6 h-6 text-white/80" />
                        </div>
                      </div>

                      {/* Text */}
                      <div className="space-y-1 select-none">
                        <h4 className={`text-sm font-bold leading-snug line-clamp-2 ${
                          isActive ? "text-purple-600 dark:text-purple-400" : "text-slate-800 dark:text-white"
                        }`}>
                          {vid.title}
                        </h4>
                        <p className="text-slate-500 text-[10px] sm:text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{ngoT.videosPage.typeLabel}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
