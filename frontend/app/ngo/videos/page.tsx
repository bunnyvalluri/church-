"use client";

import React, { useState, useEffect } from "react";
import { Video, Loader2, PlayCircle, Clock } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  thumbnailUrl: string;
}

export default function NgoVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);

  // The 3 required YouTube embeds provided by the user
  const presetVideos: VideoItem[] = [
    {
      id: "vid-gandhi",
      title: "Gandhi General Hospital Service Camp",
      description: "Detailed video coverage of KCM volunteers distributing warm milk, food boxes, and basic sanitary kits to patient caretakers and critical care wards at Gandhi Hospital.",
      type: "VIDEO_YOUTUBE",
      url: "https://www.youtube.com/embed/Hjvka2JqFjs?si=IqwISjphvA_f3ujG",
      thumbnailUrl: "https://img.youtube.com/vi/Hjvka2JqFjs/maxresdefault.jpg",
    },
    {
      id: "vid-nims",
      title: "NIMS Hospital Specialized Outreach",
      description: "Watch our volunteers distribute specialized medications, patient clothes, and nutritional foods to patients in the oncology and orthopedic departments at NIMS.",
      type: "VIDEO_YOUTUBE",
      url: "https://www.youtube.com/embed/7qbYfF40FA4?si=ruUcBmIH8mqT5aQ1",
      thumbnailUrl: "https://img.youtube.com/vi/7qbYfF40FA4/maxresdefault.jpg",
    },
    {
      id: "vid-govt",
      title: "Government General Hospital Distribution",
      description: "Direct footage showing wheelchair provisions, walkers, patient beds, and food packet distribution drives organized at the local government hospital.",
      type: "VIDEO_YOUTUBE",
      url: "https://www.youtube.com/embed/qP7lg0XSfyY?si=JiNpi0JOXMLMbXC3",
      thumbnailUrl: "https://img.youtube.com/vi/qP7lg0XSfyY/maxresdefault.jpg",
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
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
            Service Video Logs
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Watch our social service activities, healthcare distribution drives, and community rehabilitation programs. Click a video from the playlist to watch.
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
                  <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
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
                  <div className="space-y-3 p-6 bg-slate-900/40 border border-white/5 rounded-3xl text-left">
                    <div className="flex items-center gap-2 text-red-400 text-xs font-mono uppercase tracking-wider">
                      <PlayCircle className="w-4 h-4" />
                      Now Playing
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {activeVideo.title}
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                      {activeVideo.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Playlist Panel */}
            <div className="lg:col-span-4 bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-xl max-h-[80vh] flex flex-col">
              <div className="p-5 border-b border-white/5 flex items-center gap-2 text-left">
                <Video className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm sm:text-base uppercase tracking-wider text-slate-200">
                  Service Playlist
                </h3>
              </div>

              <div className="overflow-y-auto divide-y divide-white/5 max-h-[60vh] sm:max-h-[500px]">
                {videos.map((vid) => {
                  const isActive = activeVideo?.id === vid.id;
                  return (
                    <div
                      key={vid.id}
                      onClick={() => setActiveVideo(vid)}
                      className={`p-4 flex gap-4 cursor-pointer text-left transition-colors ${
                        isActive
                          ? "bg-purple-600/10 hover:bg-purple-600/15"
                          : "hover:bg-white/5"
                      }`}
                    >
                      {/* Thumbnail wrapper */}
                      <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-white/10 flex items-center justify-center">
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
                          isActive ? "text-purple-400" : "text-white"
                        }`}>
                          {vid.title}
                        </h4>
                        <p className="text-slate-500 text-[10px] sm:text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>YouTube Embed</span>
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
