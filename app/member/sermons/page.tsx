"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, User, Calendar, ArrowLeft, Play, ExternalLink, Sparkles, Video, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

interface Sermon {
  id: string;
  title: string;
  description: string;
  pastor: string;
  date: string;
  videoUrl: string | null;
  audioUrl: string | null;
  thumbnail: string | null;
  category: string;
  tags: string[];
}

export default function MemberSermons() {
  const { status, mounted } = useAuth();
  const router = useRouter();

  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [mounted, status, router]);

  useEffect(() => {
    async function fetchSermons() {
      try {
        const res = await fetch("/api/pastor/sermons");
        const data = await res.json();
        if (res.ok && data.success) {
          setSermons(data.sermons || []);
        }
      } catch (err) {
        console.error("Failed to load sermons:", err);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchSermons();
    }
  }, [status]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-800 dark:text-gray-200 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          href="/member"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline transition-all"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Back to Dashboard
        </Link>

        <div>
          <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-purple-500" />
            Sermons & Bible Messages
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Nourish your spirit with life-changing messages from Bishop Kurra Kristhu Raju Garu
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-white dark:bg-gray-800/20 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800/40 rounded-3xl p-8 border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500">No sermons published yet. Pastor uploader updates arriving soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {sermons.map((sermon) => (
              <div 
                key={sermon.id}
                className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-150 dark:border-white/5 shadow-md overflow-hidden flex flex-col justify-between transition-all hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900/40"
              >
                <div>
                  <div className="relative h-44 bg-slate-900 overflow-hidden flex items-center justify-center">
                    <Image 
                      src={sermon.thumbnail || 'https://images.unsplash.com/photo-1438032005730-c779502df39b?q=80&w=600'} 
                      alt={sermon.title}
                      fill
                      unoptimized
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    
                    {sermon.videoUrl && (
                      <a 
                        href={sermon.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute w-12 h-12 bg-white/20 backdrop-blur-md hover:bg-purple-600 border border-white/30 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-purple-500/20"
                      >
                        <Play className="w-5 h-5 fill-white" />
                      </a>
                    )}

                    <span className="absolute bottom-4 left-4 bg-purple-600 text-white text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
                      {sermon.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold text-gray-950 dark:text-white leading-tight">
                      {sermon.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                      {sermon.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-4">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-white/5 pt-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-purple-500" />
                      {sermon.pastor}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" />
                      {new Date(sermon.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {sermon.videoUrl ? (
                      <a
                        href={sermon.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all active:scale-[0.98]"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Watch Video
                      </a>
                    ) : null}

                    {sermon.audioUrl ? (
                      <a
                        href={sermon.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-150 dark:border-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-[0.98]"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Listen Audio
                      </a>
                    ) : null}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
