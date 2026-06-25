"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Users,
  ImageIcon,
  Trash2,
  Edit3,
  Globe,
  Building2,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  Maximize2,
  Upload,
  MoreVertical,
} from "lucide-react";

export interface EventCardData {
  id: string;
  title: string;
  description: string;
  date: string | Date;
  time: string;
  location: string;
  category: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  image?: string | null;
  branch?: { id: string; name: string } | null;
  createdBy?: { name: string } | null;
  media?: { id: string; imageUrl: string; caption?: string | null }[];
  _count?: { registrations: number; media: number };
}

interface EventCardProps {
  event: EventCardData;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: "PUBLISHED" | "DRAFT" | "CANCELLED" | "COMPLETED") => void;
  onUploadImages?: (id: string) => void;
  onEdit?: (event: EventCardData) => void;
}

const categoryColors: Record<string, string> = {
  WORSHIP: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
  PRAYER: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  YOUTH: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
  CHILDREN: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/20",
  WOMEN: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
  MEN: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20",
  SPECIAL: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PUBLISHED: { label: "Published", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  DRAFT: { label: "Draft", color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20", icon: FileEdit },
  CANCELLED: { label: "Cancelled", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20", icon: XCircle },
  COMPLETED: { label: "Completed", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20", icon: CheckCircle2 },
};

export default function EventCard({
  event,
  isAdmin = false,
  onDelete,
  onStatusChange,
  onUploadImages,
  onEdit,
}: EventCardProps) {
  const [mounted, setMounted] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const status = statusConfig[event.status] || statusConfig.DRAFT;
  const StatusIcon = status.icon;
  const catColor = categoryColors[event.category] || categoryColors.SPECIAL;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const isUpcoming = mounted && eventDate > new Date();

  const thumbnailUrl =
    event.image || event.media?.[0]?.imageUrl || null;

  return (
    <>
      {/* Lightbox */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/10"
            onClick={() => setExpandedImage(null)}
          >
            <XCircle className="w-6 h-6" />
          </button>
          <div
            className="max-w-4xl max-h-[85vh] relative w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={expandedImage}
              alt="Event"
              className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      <div className="group bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.06] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-violet-500/20 dark:hover:border-violet-500/15 transition-all duration-300">

        {/* Thumbnail strip */}
        <div className="relative h-44 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Calendar className="w-24 h-24 text-white" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl border backdrop-blur-md bg-white/10 text-white border-white/20`}>
              {event.category}
            </span>

            <div className="flex items-center gap-1.5">
              {isUpcoming && (
                <span className="text-[9px] font-black px-2.5 py-1 rounded-xl bg-emerald-500/90 text-white border border-emerald-400/30 backdrop-blur-sm">
                  UPCOMING
                </span>
              )}
              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border flex items-center gap-1 backdrop-blur-md ${status.color} bg-white/80 dark:bg-black/60`}>
                <StatusIcon className="w-2.5 h-2.5" />
                {status.label}
              </span>
            </div>
          </div>

          {/* Admin actions overlay */}
          {isAdmin && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {onUploadImages && (
                <button
                  onClick={() => onUploadImages(event.id)}
                  className="p-2 bg-white/90 hover:bg-white dark:bg-black/70 dark:hover:bg-black/90 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-sm transition-all hover:scale-105"
                  title="Upload Images"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(event)}
                  className="p-2 bg-white/90 hover:bg-white dark:bg-black/70 dark:hover:bg-black/90 rounded-xl text-slate-700 dark:text-slate-300 shadow-sm transition-all hover:scale-105"
                  title="Edit Event"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(event.id)}
                  className="p-2 bg-rose-500/90 hover:bg-rose-500 rounded-xl text-white shadow-sm transition-all hover:scale-105"
                  title="Delete Event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Media count badge */}
          {(event._count?.media || 0) > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[9px] font-bold text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-xl border border-white/10">
              <ImageIcon className="w-3 h-3" />
              {event._count?.media} photos
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight tracking-tight line-clamp-1">
              {event.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">
              {event.description}
            </p>
          </div>

          {/* Meta row */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <span className="font-semibold" suppressHydrationWarning>{formattedDate}</span>
              {event.time && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{event.time}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate font-medium">{event.location}</span>
            </div>
            {event.branch && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-medium">{event.branch.name}</span>
              </div>
            )}
          </div>

          {/* Media grid preview */}
          {event.media && event.media.length > 0 && (
            <div className="border-t border-slate-100 dark:border-white/5 pt-3">
              <div className="grid grid-cols-4 gap-1.5">
                {event.media.slice(0, 4).map((m, idx) => (
                  <div
                    key={m.id}
                    onClick={() => setExpandedImage(m.imageUrl)}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group/img border border-slate-200/50 dark:border-white/5"
                  >
                    <img
                      src={m.imageUrl}
                      alt={m.caption || "Event photo"}
                      className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                    />
                    {idx === 3 && (event._count?.media || 0) > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xs font-black">+{(event._count?.media || 0) - 4}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          {event.createdBy && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                by {event.createdBy.name}
              </span>
              {event._count && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                  <Users className="w-2.5 h-2.5" />
                  {event._count.registrations} registered
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
