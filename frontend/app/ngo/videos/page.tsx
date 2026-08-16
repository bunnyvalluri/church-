"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Film, X, ChevronLeft, ChevronRight, Play, Pause,
  Youtube, PlayCircle, Calendar, Maximize2,
  ListVideo, Clapperboard, Sparkles, Clock,
  ExternalLink, Share2, Search, Filter, Layers, Check,
  SkipBack, SkipForward, ArrowUpRight, Volume2, Video, Heart
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";

/* ══════════════════════════ YOUTUBE BRAND LOGO ══════════════════════════ */
const YouTubeLogoIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#FF0000" />
    <path d="M9.5 8.5L16.5 12L9.5 15.5V8.5Z" fill="white" />
  </svg>
);

/* ════════════════════════════════ UTILS ════════════════════════════════ */
function encodeSrc(src: string | null | undefined): string {
  if (!src) return "";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("//") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }
  try {
    const [path, ...queryAndHash] = src.split(/(?=[?#])/);
    const encodedPath = path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return [encodedPath, ...queryAndHash].join("");
  } catch {
    return src;
  }
}

/* ════════════════════════════════ TYPES ════════════════════════════════ */
export interface MediaItem {
  id: string;
  title: string;
  description: string;
  source: "yt" | "mp4";
  videoId?: string;
  url?: string;
  src?: string;
  thumbnail: string;
  category: "hospital" | "ashramam" | "disabled";
  categoryLabel: string;
  date: string;
  clipNumber?: number;
  isSession?: boolean;
}

/* ════════════════════════════ UNIFIED MEDIA DATA ════════════════════════════ */
const YOUTUBE_ITEMS: MediaItem[] = [
  {
    id: "yt-gandhi",
    title: "Gandhi Hospital Food & Care Outreach",
    description: "Detailed video coverage of KCM volunteers distributing warm milk, food boxes, and basic sanitary kits to patient caretakers and critical care wards at Gandhi Hospital.",
    source: "yt",
    videoId: "cugBnrzyPF4",
    url: "https://www.youtube.com/embed/cugBnrzyPF4?si=JRM4VEcma5_hRW8r",
    thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0031.jpg",
    category: "hospital",
    categoryLabel: "Hospital Outreach",
    date: "25 MAR 2026"
  },
  {
    id: "yt-nims",
    title: "NIMS Hospital Care & Support Campaign",
    description: "Watch our volunteers distribute specialized medications, patient clothes, and nutritional foods to patients in the oncology and orthopedic departments at NIMS.",
    source: "yt",
    videoId: "y7gLEkS9CcI",
    url: "https://www.youtube.com/embed/y7gLEkS9CcI?si=YRzU4aaeORdjaGLw",
    thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0037.jpg",
    category: "hospital",
    categoryLabel: "Hospital Outreach",
    date: "11 MAR 2026"
  },
  {
    id: "yt-govt",
    title: "Government General Hospital Distribution Drive",
    description: "Direct footage showing wheelchair provisions, walkers, patient beds, and food packet distribution drives organized at the local government hospital.",
    source: "yt",
    videoId: "u4-lrU41HAc",
    url: "https://www.youtube.com/embed/u4-lrU41HAc?si=vgAb5MnRZhG2Awwd",
    thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0018.jpg",
    category: "hospital",
    categoryLabel: "Hospital Outreach",
    date: "23 FEB 2026"
  },
  {
    id: "yt-ashramam",
    title: "Bethany Samrakshana Ashramam Support",
    description: "Delivering monthly groceries, rice bags, academic books, and healthy food items to children and residents at Bethany Samrakshana Ashramam.",
    source: "yt",
    videoId: "IhcbOLPMmM8",
    url: "https://www.youtube.com/embed/IhcbOLPMmM8?si=tOGhSKfBExTLmAT0",
    thumbnail: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0013.jpg",
    category: "ashramam",
    categoryLabel: "Ashramam Care",
    date: "21 APR 2026"
  },
  {
    id: "yt-disabled",
    title: "Disabled Care Ashramam Visitation",
    description: "Providing comfort kits, warm blankets, bedsheets, wheelchairs, and physical support to the residents of the Home for the Disabled.",
    source: "yt",
    videoId: "mE5NiqLGVSw",
    url: "https://www.youtube.com/embed/mE5NiqLGVSw?si=Fm7E9ViV7TL57mzi",
    thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0010.jpg",
    category: "disabled",
    categoryLabel: "Disabled Care",
    date: "17 JUN 2026"
  }
];

const BASE_PATH = "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)";
const BASE_PATH_APRIL = "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)";

const RAW_MP4_ITEMS = [
  // 15 May 2026 Bethany Ashramam Drive (19 Clips)
  { id: "mp4-1",  title: "Bethany Ashramam May – Clip 1",         src: `${BASE_PATH}/VID-20260515-WA0036.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0018.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 1,  source: "mp4" as const },
  { id: "mp4-2",  title: "Bethany Ashramam May – Clip 2",         src: `${BASE_PATH}/VID-20260515-WA0037.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0019.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 2,  source: "mp4" as const },
  { id: "mp4-3",  title: "Bethany Ashramam May – Clip 3",         src: `${BASE_PATH}/VID-20260515-WA0039.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0020.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 3,  source: "mp4" as const },
  { id: "mp4-4",  title: "Bethany Ashramam May – Clip 4",         src: `${BASE_PATH}/VID-20260515-WA0041.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0021.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 4,  source: "mp4" as const },
  { id: "mp4-5",  title: "Bethany Ashramam May – Clip 5",         src: `${BASE_PATH}/VID-20260515-WA0042.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0022.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 5,  source: "mp4" as const },
  { id: "mp4-6",  title: "Bethany Ashramam May – Clip 6",         src: `${BASE_PATH}/VID-20260515-WA0044.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0023.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 6,  source: "mp4" as const },
  { id: "mp4-7",  title: "Bethany Ashramam May – Clip 7",         src: `${BASE_PATH}/VID-20260515-WA0046.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0024.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 7,  source: "mp4" as const },
  { id: "mp4-8",  title: "Bethany Ashramam May – Clip 8",         src: `${BASE_PATH}/VID-20260515-WA0047.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0025.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 8,  source: "mp4" as const },
  { id: "mp4-9",  title: "Bethany Ashramam May – Clip 9",         src: `${BASE_PATH}/VID-20260515-WA0050.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0026.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 9,  source: "mp4" as const },
  { id: "mp4-10", title: "Bethany Ashramam May – Clip 10",        src: `${BASE_PATH}/VID-20260515-WA0052.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0027.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 10, source: "mp4" as const },
  { id: "mp4-11", title: "Bethany Ashramam May – Clip 11",        src: `${BASE_PATH}/VID-20260515-WA0056.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0028.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 11, source: "mp4" as const },
  { id: "mp4-12", title: "Bethany Ashramam May – Clip 12",        src: `${BASE_PATH}/VID-20260515-WA0057.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0029.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 12, source: "mp4" as const },
  { id: "mp4-13", title: "Bethany Ashramam May – Clip 13",        src: `${BASE_PATH}/VID-20260515-WA0058.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0030.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 13, source: "mp4" as const },
  { id: "mp4-14", title: "Bethany Ashramam May – Clip 14",        src: `${BASE_PATH}/VID-20260515-WA0059.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0031.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 14, source: "mp4" as const },
  { id: "mp4-15", title: "Bethany Ashramam May – Clip 15",        src: `${BASE_PATH}/VID-20260515-WA0060.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0032.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 15, source: "mp4" as const },
  { id: "mp4-16", title: "Bethany Ashramam May – Clip 16",        src: `${BASE_PATH}/VID-20260515-WA0256.mp4`, thumbnail: `${BASE_PATH}/IMG-20260515-WA0033.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam Field Log", date: "15 MAY 2026", clipNumber: 16, source: "mp4" as const },
  { id: "mp4-17", title: "Full Coverage – Morning Session",   src: `${BASE_PATH}/VN20260515_162903.mp4`,   thumbnail: `${BASE_PATH}/IMG-20260515-WA0034.jpg`, category: "ashramam" as const, categoryLabel: "Full Coverage",     date: "15 MAY 2026", clipNumber: 17, isSession: true, source: "mp4" as const },
  { id: "mp4-18", title: "Full Coverage – Afternoon Session", src: `${BASE_PATH}/VN20260515_165016.mp4`,   thumbnail: `${BASE_PATH}/IMG-20260515-WA0035.jpg`, category: "ashramam" as const, categoryLabel: "Full Coverage",     date: "15 MAY 2026", clipNumber: 18, isSession: true, source: "mp4" as const },
  { id: "mp4-19", title: "Full Coverage – Evening Session",   src: `${BASE_PATH}/VN20260515_165757.mp4`,   thumbnail: `${BASE_PATH}/IMG-20260515-WA0038.jpg`, category: "ashramam" as const, categoryLabel: "Full Coverage",     date: "15 MAY 2026", clipNumber: 19, isSession: true, source: "mp4" as const },

  // 21 April 2026 Bethany Ashramam Drive (11 Clips)
  { id: "mp4-apr-1",  title: "Bethany Ashramam April Drive – Clip 1",  src: `${BASE_PATH_APRIL}/VID-20260421-WA0015.mp4`, thumbnail: `${BASE_PATH_APRIL}/IMG-20260421-WA0013.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam April Log", date: "21 APR 2026", clipNumber: 1,  source: "mp4" as const },
  { id: "mp4-apr-2",  title: "Bethany Ashramam April Drive – Clip 2",  src: `${BASE_PATH_APRIL}/VID-20260421-WA0036.mp4`, thumbnail: `${BASE_PATH_APRIL}/IMG-20260421-WA0016.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam April Log", date: "21 APR 2026", clipNumber: 2,  source: "mp4" as const },
  { id: "mp4-apr-3",  title: "Bethany Ashramam April Drive – Clip 3",  src: `${BASE_PATH_APRIL}/VID-20260421-WA0037.mp4`, thumbnail: `${BASE_PATH_APRIL}/IMG-20260421-WA0017.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam April Log", date: "21 APR 2026", clipNumber: 3,  source: "mp4" as const },
  { id: "mp4-apr-4",  title: "Bethany Ashramam April Drive – Clip 4",  src: `${BASE_PATH_APRIL}/VID-20260421-WA0139.mp4`, thumbnail: `${BASE_PATH_APRIL}/IMG-20260421-WA0018.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam April Log", date: "21 APR 2026", clipNumber: 4,  source: "mp4" as const },
  { id: "mp4-apr-5",  title: "Bethany Ashramam April Drive – Clip 5",  src: `${BASE_PATH_APRIL}/VID-20260421-WA0140.mp4`, thumbnail: `${BASE_PATH_APRIL}/IMG-20260421-WA0019.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam April Log", date: "21 APR 2026", clipNumber: 5,  source: "mp4" as const },
  { id: "mp4-apr-6",  title: "Bethany Ashramam April Drive – Clip 6",  src: `${BASE_PATH_APRIL}/VID-20260421-WA0141.mp4`, thumbnail: `${BASE_PATH_APRIL}/IMG-20260421-WA0020.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam April Log", date: "21 APR 2026", clipNumber: 6,  source: "mp4" as const },
  { id: "mp4-apr-7",  title: "Bethany Ashramam April Drive – Clip 7",  src: `${BASE_PATH_APRIL}/VID-20260421-WA0142.mp4`, thumbnail: `${BASE_PATH_APRIL}/IMG-20260421-WA0021.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam April Log", date: "21 APR 2026", clipNumber: 7,  source: "mp4" as const },
  { id: "mp4-apr-8",  title: "Bethany Ashramam April Drive – Clip 8",  src: `${BASE_PATH_APRIL}/VID-20260421-WA0144.mp4`, thumbnail: `${BASE_PATH_APRIL}/IMG-20260421-WA0022.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam April Log", date: "21 APR 2026", clipNumber: 8,  source: "mp4" as const },
  { id: "mp4-apr-9",  title: "Bethany Ashramam April Drive – Clip 9",  src: `${BASE_PATH_APRIL}/VID-20260421-WA0146.mp4`, thumbnail: `${BASE_PATH_APRIL}/IMG-20260421-WA0024.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam April Log", date: "21 APR 2026", clipNumber: 9,  source: "mp4" as const },
  { id: "mp4-apr-10", title: "Bethany Ashramam April Drive – Clip 10", src: `${BASE_PATH_APRIL}/VID-20260421-WA0147.mp4`, thumbnail: `${BASE_PATH_APRIL}/IMG-20260421-WA0025.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam April Log", date: "21 APR 2026", clipNumber: 10, source: "mp4" as const },
  { id: "mp4-apr-11", title: "Bethany Ashramam April Drive – Clip 11", src: `${BASE_PATH_APRIL}/VID-20260421-WA0148.mp4`, thumbnail: `${BASE_PATH_APRIL}/IMG-20260421-WA0027.jpg`, category: "ashramam" as const, categoryLabel: "Ashramam April Log", date: "21 APR 2026", clipNumber: 11, source: "mp4" as const },

  // 17 June 2026 Home for Disabled Care Ashramam Drive (42 Field Video Clips)
  { id: "mp4-dis-1", title: "Disabled Care Ashramam – Clip 1", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/micro_movie_20260617_115304.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260615-WA0015.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 1, source: "mp4" as const },
  { id: "mp4-dis-2", title: "Disabled Care Ashramam – Clip 2", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260615-WA0018.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260615-WA0017.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 2, source: "mp4" as const },
  { id: "mp4-dis-3", title: "Disabled Care Ashramam – Clip 3", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0003.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260615-WA0019.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 3, source: "mp4" as const },
  { id: "mp4-dis-4", title: "Disabled Care Ashramam – Clip 4", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0005.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0010.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 4, source: "mp4" as const },
  { id: "mp4-dis-5", title: "Disabled Care Ashramam – Clip 5", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0006.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0012.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 5, source: "mp4" as const },
  { id: "mp4-dis-6", title: "Disabled Care Ashramam – Clip 6", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0008.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0013.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 6, source: "mp4" as const },
  { id: "mp4-dis-7", title: "Disabled Care Ashramam – Clip 7", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0009.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0014.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 7, source: "mp4" as const },
  { id: "mp4-dis-8", title: "Disabled Care Ashramam – Clip 8", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0098.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0015.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 8, source: "mp4" as const },
  { id: "mp4-dis-9", title: "Disabled Care Ashramam – Clip 9", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0099.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0019.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 9, source: "mp4" as const },
  { id: "mp4-dis-10", title: "Disabled Care Ashramam – Clip 10", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0112.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0022.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 10, source: "mp4" as const },
  { id: "mp4-dis-11", title: "Disabled Care Ashramam – Clip 11", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0196.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0024.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 11, source: "mp4" as const },
  { id: "mp4-dis-12", title: "Disabled Care Ashramam – Clip 12", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0198.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0029.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 12, source: "mp4" as const },
  { id: "mp4-dis-13", title: "Disabled Care Ashramam – Clip 13", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0199.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0033.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 13, source: "mp4" as const },
  { id: "mp4-dis-14", title: "Disabled Care Ashramam – Clip 14", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0200.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0035.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 14, source: "mp4" as const },
  { id: "mp4-dis-15", title: "Disabled Care Ashramam – Clip 15", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0201.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0038.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 15, source: "mp4" as const },
  { id: "mp4-dis-16", title: "Disabled Care Ashramam – Clip 16", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0202.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0043.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 16, source: "mp4" as const },
  { id: "mp4-dis-17", title: "Disabled Care Ashramam – Clip 17", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0203.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0045.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 17, source: "mp4" as const },
  { id: "mp4-dis-18", title: "Disabled Care Ashramam – Clip 18", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0204.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0046.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 18, source: "mp4" as const },
  { id: "mp4-dis-19", title: "Disabled Care Ashramam – Clip 19", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0205.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0049.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 19, source: "mp4" as const },
  { id: "mp4-dis-20", title: "Disabled Care Ashramam – Clip 20", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0206.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0051.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 20, source: "mp4" as const },
  { id: "mp4-dis-21", title: "Disabled Care Ashramam – Clip 21", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0207.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0052.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 21, source: "mp4" as const },
  { id: "mp4-dis-22", title: "Disabled Care Ashramam – Clip 22", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0208.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0053.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 22, source: "mp4" as const },
  { id: "mp4-dis-23", title: "Disabled Care Ashramam – Clip 23", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0209.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0054.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 23, source: "mp4" as const },
  { id: "mp4-dis-24", title: "Disabled Care Ashramam – Clip 24", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0210.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0057.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 24, source: "mp4" as const },
  { id: "mp4-dis-25", title: "Disabled Care Ashramam – Clip 25", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0211.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0058.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 25, source: "mp4" as const },
  { id: "mp4-dis-26", title: "Disabled Care Ashramam – Clip 26", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0212.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0059.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 26, source: "mp4" as const },
  { id: "mp4-dis-27", title: "Disabled Care Ashramam – Clip 27", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0213.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0062.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 27, source: "mp4" as const },
  { id: "mp4-dis-28", title: "Disabled Care Ashramam – Clip 28", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0214.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0063.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 28, source: "mp4" as const },
  { id: "mp4-dis-29", title: "Disabled Care Ashramam – Clip 29", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0215.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0066.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 29, source: "mp4" as const },
  { id: "mp4-dis-30", title: "Disabled Care Ashramam – Clip 30", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_111020.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0069.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 30, source: "mp4" as const },
  { id: "mp4-dis-31", title: "Disabled Care Ashramam – Clip 31", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_111521.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0070.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 31, source: "mp4" as const },
  { id: "mp4-dis-32", title: "Disabled Care Ashramam – Clip 32", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_111945.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0073.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 32, source: "mp4" as const },
  { id: "mp4-dis-33", title: "Disabled Care Ashramam – Clip 33", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_112341.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0075.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 33, source: "mp4" as const },
  { id: "mp4-dis-34", title: "Disabled Care Ashramam – Clip 34", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_112349.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0077.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 34, source: "mp4" as const },
  { id: "mp4-dis-35", title: "Disabled Care Ashramam – Clip 35", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_113314.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0079.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 35, source: "mp4" as const },
  { id: "mp4-dis-36", title: "Disabled Care Ashramam – Clip 36", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_113511.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0081.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 36, source: "mp4" as const },
  { id: "mp4-dis-37", title: "Disabled Care Ashramam – Clip 37", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_115751.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0082.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 37, source: "mp4" as const },
  { id: "mp4-dis-38", title: "Disabled Care Ashramam – Clip 38", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_120115.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0083.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 38, source: "mp4" as const },
  { id: "mp4-dis-39", title: "Disabled Care Ashramam – Clip 39", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_121404.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0084.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 39, source: "mp4" as const },
  { id: "mp4-dis-40", title: "Disabled Care Ashramam – Clip 40", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_122323.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0087.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 40, source: "mp4" as const },
  { id: "mp4-dis-41", title: "Disabled Care Ashramam – Clip 41", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_122738.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0088.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 41, source: "mp4" as const },
  { id: "mp4-dis-42", title: "Disabled Care Ashramam – Clip 42", src: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_161035.mp4", thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0089.jpg", category: "disabled" as const, categoryLabel: "Disabled Care Field Log", date: "17 JUN 2026", clipNumber: 42, source: "mp4" as const },

  // Hospital Outreach Drive Videos (25 Field Video Clips across NIMS, Govt, and Gandhi Hospitals)
  { id: "mp4-hosp-nims-hospital-1", title: "NIMS Hospital Outreach - Clip 1", src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0101.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0037.jpg", category: "hospital" as const, categoryLabel: "NIMS Hospital Care Log", date: "11 MAR 2026", clipNumber: 1, source: "mp4" as const },
  { id: "mp4-hosp-nims-hospital-2", title: "NIMS Hospital Outreach - Clip 2", src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0102.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0043.jpg", category: "hospital" as const, categoryLabel: "NIMS Hospital Care Log", date: "11 MAR 2026", clipNumber: 2, source: "mp4" as const },
  { id: "mp4-hosp-nims-hospital-3", title: "NIMS Hospital Outreach - Clip 3", src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0103.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0045.jpg", category: "hospital" as const, categoryLabel: "NIMS Hospital Care Log", date: "11 MAR 2026", clipNumber: 3, source: "mp4" as const },
  { id: "mp4-hosp-nims-hospital-4", title: "NIMS Hospital Outreach - Clip 4", src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0133.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0047.jpg", category: "hospital" as const, categoryLabel: "NIMS Hospital Care Log", date: "11 MAR 2026", clipNumber: 4, source: "mp4" as const },
  { id: "mp4-hosp-nims-hospital-5", title: "NIMS Hospital Outreach - Clip 5", src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0139.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0049.jpg", category: "hospital" as const, categoryLabel: "NIMS Hospital Care Log", date: "11 MAR 2026", clipNumber: 5, source: "mp4" as const },
  { id: "mp4-hosp-nims-hospital-6", title: "NIMS Hospital Outreach - Clip 6", src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0172.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0052.jpg", category: "hospital" as const, categoryLabel: "NIMS Hospital Care Log", date: "11 MAR 2026", clipNumber: 6, source: "mp4" as const },
  { id: "mp4-hosp-nims-hospital-7", title: "NIMS Hospital Outreach - Clip 7", src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0173.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0055.jpg", category: "hospital" as const, categoryLabel: "NIMS Hospital Care Log", date: "11 MAR 2026", clipNumber: 7, source: "mp4" as const },
  { id: "mp4-hosp-nims-hospital-8", title: "NIMS Hospital Outreach - Clip 8", src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0174.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0057.jpg", category: "hospital" as const, categoryLabel: "NIMS Hospital Care Log", date: "11 MAR 2026", clipNumber: 8, source: "mp4" as const },
  { id: "mp4-hosp-nims-hospital-9", title: "NIMS Hospital Outreach - Clip 9", src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0178.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0059.jpg", category: "hospital" as const, categoryLabel: "NIMS Hospital Care Log", date: "11 MAR 2026", clipNumber: 9, source: "mp4" as const },
  { id: "mp4-hosp-nims-hospital-10", title: "NIMS Hospital Outreach - Clip 10", src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0179.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0060.jpg", category: "hospital" as const, categoryLabel: "NIMS Hospital Care Log", date: "11 MAR 2026", clipNumber: 10, source: "mp4" as const },
  { id: "mp4-hosp-nims-hospital-11", title: "NIMS Hospital Outreach - Clip 11", src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0180.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0062.jpg", category: "hospital" as const, categoryLabel: "NIMS Hospital Care Log", date: "11 MAR 2026", clipNumber: 11, source: "mp4" as const },
  { id: "mp4-hosp-nims-hospital-12", title: "NIMS Hospital Outreach - Clip 12", src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0181.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0063.jpg", category: "hospital" as const, categoryLabel: "NIMS Hospital Care Log", date: "11 MAR 2026", clipNumber: 12, source: "mp4" as const },
  { id: "mp4-hosp-nims-hospital-13", title: "NIMS Hospital Outreach - Clip 13", src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0182.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0064.jpg", category: "hospital" as const, categoryLabel: "NIMS Hospital Care Log", date: "11 MAR 2026", clipNumber: 13, source: "mp4" as const },
  { id: "mp4-hosp-nims-hospital-14", title: "NIMS Hospital Outreach - Clip 14", src: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID_20260312_004446_628.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0065.jpg", category: "hospital" as const, categoryLabel: "NIMS Hospital Care Log", date: "11 MAR 2026", clipNumber: 14, source: "mp4" as const },
  { id: "mp4-hosp-govt-hospital-1", title: "Govt Hospital Outreach - Clip 1", src: "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/VID-20260222-WA0048.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0018.jpg", category: "hospital" as const, categoryLabel: "Govt Hospital Relief Log", date: "23 FEB 2026", clipNumber: 1, source: "mp4" as const },
  { id: "mp4-hosp-govt-hospital-2", title: "Govt Hospital Outreach - Clip 2", src: "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/VID-20260223-WA0086.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0019.jpg", category: "hospital" as const, categoryLabel: "Govt Hospital Relief Log", date: "23 FEB 2026", clipNumber: 2, source: "mp4" as const },
  { id: "mp4-hosp-govt-hospital-3", title: "Govt Hospital Outreach - Clip 3", src: "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/VID-20260225-WA0018.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0020.jpg", category: "hospital" as const, categoryLabel: "Govt Hospital Relief Log", date: "23 FEB 2026", clipNumber: 3, source: "mp4" as const },
  { id: "mp4-hosp-govt-hospital-4", title: "Govt Hospital Outreach - Clip 4", src: "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/VID-20260225-WA0019.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0021.jpg", category: "hospital" as const, categoryLabel: "Govt Hospital Relief Log", date: "23 FEB 2026", clipNumber: 4, source: "mp4" as const },
  { id: "mp4-hosp-gandhi-hospital-1", title: "Gandhi Hospital Outreach - Clip 1", src: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260325-WA0033.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0031.jpg", category: "hospital" as const, categoryLabel: "Gandhi Hospital Food Log", date: "25 MAR 2026", clipNumber: 1, source: "mp4" as const },
  { id: "mp4-hosp-gandhi-hospital-2", title: "Gandhi Hospital Outreach - Clip 2", src: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260325-WA0039.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0034.jpg", category: "hospital" as const, categoryLabel: "Gandhi Hospital Food Log", date: "25 MAR 2026", clipNumber: 2, source: "mp4" as const },
  { id: "mp4-hosp-gandhi-hospital-3", title: "Gandhi Hospital Outreach - Clip 3", src: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260325-WA0040.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0035.jpg", category: "hospital" as const, categoryLabel: "Gandhi Hospital Food Log", date: "25 MAR 2026", clipNumber: 3, source: "mp4" as const },
  { id: "mp4-hosp-gandhi-hospital-4", title: "Gandhi Hospital Outreach - Clip 4", src: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260325-WA0041.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0036.jpg", category: "hospital" as const, categoryLabel: "Gandhi Hospital Food Log", date: "25 MAR 2026", clipNumber: 4, source: "mp4" as const },
  { id: "mp4-hosp-gandhi-hospital-5", title: "Gandhi Hospital Outreach - Clip 5", src: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260326-WA0040.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0037.jpg", category: "hospital" as const, categoryLabel: "Gandhi Hospital Food Log", date: "25 MAR 2026", clipNumber: 5, source: "mp4" as const },
  { id: "mp4-hosp-gandhi-hospital-6", title: "Gandhi Hospital Outreach - Clip 6", src: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260418-WA0033.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0038.jpg", category: "hospital" as const, categoryLabel: "Gandhi Hospital Food Log", date: "25 MAR 2026", clipNumber: 6, source: "mp4" as const },
  { id: "mp4-hosp-gandhi-hospital-7", title: "Gandhi Hospital Outreach - Clip 7", src: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260418-WA0034.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0042.jpg", category: "hospital" as const, categoryLabel: "Gandhi Hospital Food Log", date: "25 MAR 2026", clipNumber: 7, source: "mp4" as const },
];

const MP4_ITEMS: MediaItem[] = RAW_MP4_ITEMS.map(item => ({
  ...item,
  description: item.category === "disabled"
    ? `Authentic field video recording captured live during KCM's Home for the Disabled Ashramam aid and provisions distribution drive on ${item.date}.`
    : item.category === "hospital"
    ? `Authentic field video recording captured live during KCM's ${item.categoryLabel} relief drive on ${item.date}.`
    : `Authentic video recording captured live during KCM's Bethany Samrakshana Ashramam grocery and provisions distribution drive on ${item.date}.`
}));


const ALL_MEDIA_DATABASE: MediaItem[] = [...YOUTUBE_ITEMS, ...MP4_ITEMS];

/* ════════════════════════════ LIGHTBOX COMPONENT ════════════════════════════ */
function Lightbox({ videos, index, onClose, onPrev, onNext, onJump }: {
  videos: MediaItem[]; index: number;
  onClose: () => void; onPrev: () => void; onNext: () => void; onJump: (i: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const vRef = useRef<HTMLVideoElement>(null);
  const sRef = useRef<HTMLDivElement>(null);
  const item = videos[index];

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [mounted, onClose, onPrev, onNext]);

  useEffect(() => {
    if (!mounted) return;
    vRef.current?.load();
    vRef.current?.play().catch(() => {});
    (sRef.current?.children[index] as HTMLElement)?.scrollIntoView({ inline: "center", behavior: "smooth" });
  }, [index, mounted]);

  if (!mounted || !item) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] w-screen h-screen bg-black/98 backdrop-blur-2xl flex flex-col select-none overflow-hidden"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      
      {/* Top Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 text-white">
            <Film className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-white font-extrabold text-sm sm:text-base truncate leading-snug">{item.title}</p>
            <p className="text-slate-400 text-xs leading-none mt-1 flex items-center gap-2">
              <span>Clip {index + 1} of {videos.length}</span>
              <span>•</span>
              <span>{item.date}</span>
            </p>
          </div>
        </div>

        <button onClick={onClose} title="Close (Esc)"
          className="flex-shrink-0 ml-4 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all flex items-center justify-center border border-white/10 shadow-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Video Stage */}
      <div className="flex-1 relative flex items-center justify-center px-4 sm:px-16 py-6 min-h-0 bg-black/90">
        {item.source === "yt" ? (
          <iframe
            src={`https://www.youtube.com/embed/${item.videoId || item.url?.split("/embed/")[1]?.split("?")[0]}?autoplay=1&playsinline=1&controls=1&fs=1&rel=0&enablejsapi=1`}
            title={item.title}
            className="w-full max-w-5xl h-full rounded-2xl border border-white/10 shadow-2xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
          />
        ) : (
          <video ref={vRef} src={encodeSrc(item.src)} controls autoPlay playsInline className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain bg-black" />
        )}

        {index > 0 && (
          <button onClick={onPrev} title="Previous (←)"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center bg-black/80 hover:bg-emerald-600 border border-white/20 text-white transition-all duration-200 hover:scale-110 shadow-2xl z-10">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {index < videos.length - 1 && (
          <button onClick={onNext} title="Next (→)"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center bg-black/80 hover:bg-emerald-600 border border-white/20 text-white transition-all duration-200 hover:scale-110 shadow-2xl z-10">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Film Strip */}
      <div className="flex-shrink-0 border-t border-white/10 px-6 py-3.5 bg-slate-950/90 backdrop-blur-md z-10">
        <div ref={sRef} className="flex gap-3 overflow-x-auto py-1 items-center" style={{ scrollbarWidth: "none" }}>
          {videos.map((v, i) => (
            <button key={v.id} onClick={() => onJump(i)}
              className={`relative flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                i === index
                  ? "border-emerald-400 scale-105 ring-4 ring-emerald-500/30 shadow-xl opacity-100"
                  : "border-transparent opacity-40 hover:opacity-85 hover:scale-102"
              }`} style={{ width: 84, aspectRatio: "16/9" }}>
              <img
                src={encodeSrc(v.thumbnail)}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "/ngo_outreach_drive_thumbnail.png"; }}
              />
              {i === index && (
                <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white drop-shadow-md fill-white" />
                </div>
              )}
              <span className="absolute bottom-1 right-1 text-[9px] text-white font-extrabold bg-black/80 px-1 rounded tabular-nums">
                {i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ════════════════════════════ MEDIA THUMBNAIL CARD ════════════════════════════ */
function MediaCard({ item, index, onPlay }: {
  item: MediaItem; index: number; onPlay: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isYt = item.source === "yt";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onPlay}
      className="group relative w-full text-left overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col"
    >
      {/* Thumbnail Aspect Box */}
      <div className="relative w-full overflow-hidden bg-slate-950" style={{ aspectRatio: "16/9" }}>
        <img
          src={encodeSrc(item.thumbnail)}
          alt={item.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? "scale-108" : "scale-100"}`}
          onError={(e) => { e.currentTarget.src = "/ngo_outreach_drive_thumbnail.png"; }}
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Play Ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`flex items-center justify-center rounded-full border-2 border-white/50 transition-all duration-300 shadow-2xl w-12 h-12 ${
            hovered
              ? isYt
                ? "bg-rose-600 border-rose-400 scale-110 shadow-rose-600/50"
                : "bg-emerald-600 border-emerald-400 scale-110 shadow-emerald-600/50"
              : "bg-black/50 backdrop-blur-sm scale-100"
          }`}>
            <Play className="w-5 h-5 text-white ml-0.5 fill-white" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-black/65 backdrop-blur-md text-white text-[10px] font-black border border-white/15 tabular-nums">
            #{String(index + 1).padStart(2, '0')}
          </span>

          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg shadow-md backdrop-blur-md border ${
            isYt
              ? "bg-rose-600/90 text-white border-rose-400/40"
              : "bg-emerald-600/90 text-white border-emerald-400/40"
          }`}>
            {isYt ? <Youtube className="w-3 h-3" /> : <Film className="w-3 h-3" />}
            {isYt ? "YouTube" : item.isSession ? "Full Session" : "MP4 Clip"}
          </span>
        </div>

        {/* Bottom Details Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5 pt-8">
          <p className="text-white font-extrabold text-sm leading-snug line-clamp-1 group-hover:text-emerald-300 transition-colors drop-shadow-md">
            {item.title}
          </p>
          <div className="flex items-center justify-between mt-1 text-[10px] text-white/70 font-semibold">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-300" />
              {item.date}
            </span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">
              {item.categoryLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════ SIDEBAR PLAYLIST ROW ════════════════════════════ */
function PlaylistRow({ item, index, active, onSelect }: {
  item: MediaItem; index: number; active: boolean; onSelect: () => void;
}) {
  const isYt = item.source === "yt";

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200 group ${
        active
          ? isYt
            ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/25 ring-1 ring-rose-400/30"
            : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400/30"
          : "bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/50 text-slate-800 dark:text-slate-100"
      }`}
    >
      <div className="relative flex-shrink-0 rounded-lg overflow-hidden bg-slate-950 border border-black/10 dark:border-white/10" style={{ width: 92, aspectRatio: "16/9" }}>
        <img src={item.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className={`absolute inset-0 flex items-center justify-center transition-colors ${active ? "bg-black/20" : "bg-black/40 group-hover:bg-black/25"}`}>
          {active ? (
            <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center animate-pulse">
              <Play className="w-3 h-3 text-white fill-white ml-0.5" />
            </div>
          ) : (
            <PlayCircle className="w-5 h-5 text-white/85 group-hover:scale-110 transition-transform" />
          )}
        </div>
        <span className="absolute bottom-1 right-1 text-[8px] font-black text-white bg-black/75 px-1 rounded tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <p className={`text-xs font-bold leading-snug line-clamp-2 ${active ? "text-white" : "text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"}`}>
          {item.title}
        </p>
        <div className="flex items-center gap-2 text-[10px]">
          <span className={`inline-flex items-center gap-1 font-bold ${active ? "text-white/90" : isYt ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {isYt ? <Youtube className="w-3 h-3" /> : <Film className="w-3 h-3" />}
            {isYt ? "YouTube" : item.isSession ? "Session" : "MP4"}
          </span>
          {active && (
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-black uppercase tracking-wider">
              Now Playing
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ════════════════════════════ MAIN PAGE COMPONENT ════════════════════════════ */
export default function NgoVideosPage() {
  const { t } = useLanguage();

  // Active state
  const [activeMediaId, setActiveMediaId] = useState<string>(YOUTUBE_ITEMS[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<"all" | "yt" | "mp4" | "hospital" | "ashramam" | "disabled">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [playlistTab, setPlaylistTab] = useState<"yt" | "mp4" | "all">("yt");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Smooth scroll reference to top stage
  const playerStageRef = useRef<HTMLDivElement>(null);
  const cinemaIframeRef = useRef<HTMLIFrameElement>(null);

  const pauseCinemaVideo = () => {
    try {
      if (cinemaIframeRef.current?.contentWindow) {
        cinemaIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "*"
        );
      }
    } catch {}
    setIsPlaying(false);
  };

  const playCinemaVideo = () => {
    try {
      if (cinemaIframeRef.current?.contentWindow) {
        cinemaIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "*"
        );
      }
    } catch {}
    setIsPlaying(true);
  };

  // Selected media object
  const activeMedia = useMemo(() => {
    return ALL_MEDIA_DATABASE.find(m => m.id === activeMediaId) || ALL_MEDIA_DATABASE[0];
  }, [activeMediaId]);

  // Active index in database
  const activeIndex = useMemo(() => {
    return ALL_MEDIA_DATABASE.findIndex(m => m.id === activeMedia.id);
  }, [activeMedia]);

  // Playlist items filtering for sidebar
  const playlistItems = useMemo(() => {
    if (playlistTab === "yt") return YOUTUBE_ITEMS;
    if (playlistTab === "mp4") return MP4_ITEMS;
    return ALL_MEDIA_DATABASE;
  }, [playlistTab]);

  // Filtered Media for bottom showcase
  const filteredShowcaseMedia = useMemo(() => {
    let items = ALL_MEDIA_DATABASE;

    if (filterCategory === "yt") items = items.filter(m => m.source === "yt");
    else if (filterCategory === "mp4") items = items.filter(m => m.source === "mp4");
    else if (filterCategory === "hospital") items = items.filter(m => m.category === "hospital");
    else if (filterCategory === "ashramam") items = items.filter(m => m.category === "ashramam");
    else if (filterCategory === "disabled") items = items.filter(m => m.category === "disabled");

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(m => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.categoryLabel.toLowerCase().includes(q));
    }

    return items;
  }, [filterCategory, searchQuery]);

  // Handlers
  const handlePlayMedia = (media: MediaItem) => {
    setActiveMediaId(media.id);
    setIsPlaying(true);
    playerStageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNextMedia = () => {
    const nextIdx = (activeIndex + 1) % ALL_MEDIA_DATABASE.length;
    setActiveMediaId(ALL_MEDIA_DATABASE[nextIdx].id);
    setIsPlaying(true);
  };

  const handlePrevMedia = () => {
    const prevIdx = (activeIndex - 1 + ALL_MEDIA_DATABASE.length) % ALL_MEDIA_DATABASE.length;
    setActiveMediaId(ALL_MEDIA_DATABASE[prevIdx].id);
    setIsPlaying(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const vT = (t as any).videosPage || {
    badge: "KCM NGO Field Service Video Logs",
    heroTitle: "Video Theater & Outreach Logs",
    heroSubtitle: "Watch live video recordings of KCM's Bethany Samrakshana Ashramam, Home for Disabled Care, and Hospital food & relief distribution drives.",
    searchPlaceholder: "Search videos by title, date, or hospital...",
    filterAll: "All Videos",
    filterYt: "YouTube Series",
    filterAshramam: "Ashramam Field Clips",
    filterHospital: "Hospital Drives",
    filterDisabled: "Disabled Care",
    playlistTitle: "Up Next Playlist",
    playlistSubtitle: "Select Video to Play",
    featuredTitle: "Featured Video Collections",
    featuredSubtitle: "Showing video logs • Click any card to play in main stage",
    clickToPlay: "Click to Play Video",
    fieldLog: "Field Video Log",
    youtubeDoc: "YouTube Documentary",
    noResults: "No video logs match your search query",
    clearFilters: "Clear Filters"
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">

      {/* ══════════════════════════ HERO TOP HEADER ══════════════════════════════ */}
      <div className="relative border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 overflow-hidden">
        
        {/* Glow ambient background lights */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-rose-500/10 dark:bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
          
          {/* Top Utility Row with Badge & Language Toggle */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              {vT.badge}
            </span>
            <LanguageToggle align="right" />
          </div>

          {/* Main Hero Title & Quick Stat Pill Cards */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {vT.heroTitle}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                {vT.heroSubtitle}
              </p>
            </div>

            {/* Quick Stat Pill Cards */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
              <button
                onClick={() => { setPlaylistTab("yt"); setFilterCategory("yt"); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left transition-all ${
                  filterCategory === "yt"
                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-600/50 ring-2 ring-rose-500/30 shadow-md shadow-rose-500/10"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-rose-400 shadow-sm"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-500/30 shrink-0">
                  <Youtube className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-black leading-none">{YOUTUBE_ITEMS.length}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">YouTube</p>
                </div>
              </button>

              <button
                onClick={() => { setPlaylistTab("mp4"); setFilterCategory("mp4"); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left transition-all ${
                  filterCategory === "mp4"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/50 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400 shadow-sm"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 shrink-0">
                  <Film className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-black leading-none">{MP4_ITEMS.length}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Field Logs</p>
                </div>
              </button>
            </div>

          </div>

          {/* ════════════ SEARCH & FILTER CATEGORY CONTROL BAR ════════════ */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
            
            {/* Filter Tabs - Step-by-Step Box Buttons */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row lg:flex-wrap items-stretch gap-2.5 w-full md:w-auto">
              
              {/* 1. YouTube Series */}
              <button
                onClick={() => { setFilterCategory("yt"); setPlaylistTab("yt"); }}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl font-extrabold text-xs transition-all w-full lg:w-auto ${
                  filterCategory === "yt"
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-500/30"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-700/80 border border-slate-200/90 dark:border-slate-700/90 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    filterCategory === "yt" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                  }`}>
                    <Youtube className="w-3.5 h-3.5" />
                  </div>
                  <span className="whitespace-nowrap">{vT.filterYt}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
                  filterCategory === "yt" ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}>
                  {YOUTUBE_ITEMS.length}
                </span>
              </button>

              {/* 2. Ashramam Field Clips */}
              <button
                onClick={() => { setFilterCategory("mp4"); setPlaylistTab("mp4"); }}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl font-extrabold text-xs transition-all w-full lg:w-auto ${
                  filterCategory === "mp4"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/30"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700/80 border border-slate-200/90 dark:border-slate-700/90 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    filterCategory === "mp4" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                  }`}>
                    <Film className="w-3.5 h-3.5" />
                  </div>
                  <span className="whitespace-nowrap">{vT.filterAshramam}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
                  filterCategory === "mp4" ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}>
                  {MP4_ITEMS.length}
                </span>
              </button>

              {/* 3. All Videos */}
              <button
                onClick={() => { setFilterCategory("all"); setPlaylistTab("all"); }}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl font-extrabold text-xs transition-all w-full lg:w-auto ${
                  filterCategory === "all"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg ring-2 ring-slate-800/30"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/90 dark:border-slate-700/90 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    filterCategory === "all" ? "bg-white/20 dark:bg-slate-800 text-white dark:text-slate-200" : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  }`}>
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span className="whitespace-nowrap">{vT.filterAll}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
                  filterCategory === "all" ? "bg-white/25 text-white dark:bg-slate-800 dark:text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}>
                  {ALL_MEDIA_DATABASE.length}
                </span>
              </button>

              {/* 4. Hospital Drives */}
              <button
                onClick={() => setFilterCategory("hospital")}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl font-extrabold text-xs transition-all w-full lg:w-auto ${
                  filterCategory === "hospital"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 ring-2 ring-violet-500/30"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-slate-700/80 border border-slate-200/90 dark:border-slate-700/90 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    filterCategory === "hospital" ? "bg-white/20 text-white" : "bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
                  }`}>
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                  <span className="whitespace-nowrap">{vT.filterHospital}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
                  filterCategory === "hospital" ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}>
                  {ALL_MEDIA_DATABASE.filter(m => m.category === "hospital").length}
                </span>
              </button>

              {/* 5. Disabled Care */}
              <button
                onClick={() => setFilterCategory("disabled")}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl font-extrabold text-xs transition-all w-full lg:w-auto ${
                  filterCategory === "disabled"
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-500/30"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-700/80 border border-slate-200/90 dark:border-slate-700/90 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    filterCategory === "disabled" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                  }`}>
                    <Film className="w-3.5 h-3.5" />
                  </div>
                  <span className="whitespace-nowrap">{vT.filterDisabled}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
                  filterCategory === "disabled" ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}>
                  {ALL_MEDIA_DATABASE.filter(m => m.category === "disabled").length}
                </span>
              </button>

            </div>

            {/* Search Input Box */}
            <div className="relative w-full md:w-96 lg:w-[420px] shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={vT.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* ════════════════════════ MAIN THEATER & PLAYLIST STAGE ════════════════════════ */}
      <div ref={playerStageRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT COLUMN: MAIN THEATER PLAYER ── */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Player Container */}
            <div
              className={`relative rounded-3xl overflow-hidden bg-black border shadow-2xl transition-all duration-300 ${
                activeMedia.source === "yt"
                  ? "border-slate-200 dark:border-slate-800 shadow-rose-950/15"
                  : "border-emerald-500/30 shadow-emerald-950/25"
              }`}
              style={{ aspectRatio: "16/9" }}
            >
              {activeMedia.source === "yt" ? (
                isPlaying ? (
                  <iframe
                    ref={cinemaIframeRef}
                    key={activeMedia.id + "-playing"}
                    src={`https://www.youtube.com/embed/${activeMedia.videoId || activeMedia.url?.split("/embed/")[1]?.split("?")[0]}?autoplay=1&playsinline=1&controls=1&fs=1&rel=0&iv_load_policy=3&enablejsapi=1`}
                    title={activeMedia.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <div
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 cursor-pointer group flex flex-col justify-between p-3 sm:p-6 bg-slate-950 select-none z-10 overflow-hidden"
                  >
                    <img
                      src={encodeSrc(activeMedia.thumbnail)}
                      alt={activeMedia.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-all duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/ngo_outreach_drive_thumbnail.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="relative z-10 flex items-center justify-between gap-2 pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-white bg-rose-600/90 backdrop-blur-md shadow-lg border border-rose-400/30">
                        <YouTubeLogoIcon className="w-3.5 h-3.5" />
                        YouTube Broadcast
                      </span>
                      <span className="text-white/90 text-xs font-extrabold bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 font-mono">
                        {activeMedia.date}
                      </span>
                    </div>

                    {/* Center Animated High-Contrast Red YouTube Play Button */}
                    <div className="relative z-10 flex items-center justify-center my-auto py-2 pointer-events-none">
                      <div className="relative flex items-center justify-center">
                        <span className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-600/40 animate-ping" />
                        <div className="relative w-16 h-12 sm:w-20 sm:h-14 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-90 flex items-center justify-center shadow-2xl shadow-red-600/60 transition-all duration-200 border border-white/20">
                          <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Title Preview & Tap Prompt */}
                    <div className="relative z-10 space-y-1 max-w-2xl pointer-events-none">
                      <h3 className="text-white font-black text-sm sm:text-xl leading-snug drop-shadow-md line-clamp-2">
                        {activeMedia.title}
                      </h3>
                      <p className="text-white/80 text-xs font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span>Tap anywhere to play video • 1080p HD</span>
                      </p>
                    </div>
                  </div>
                )
              ) : isPlaying ? (
                <video
                  key={activeMedia.id}
                  src={encodeSrc(activeMedia.src)}
                  controls
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                />
              ) : (
                /* Manual Click-to-Play Poster Screen for MP4 Videos Section */
                <div
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 cursor-pointer group flex flex-col justify-between p-3 sm:p-6 bg-slate-950 select-none z-10 overflow-hidden"
                >
                  <img
                    src={encodeSrc(activeMedia.thumbnail)}
                    alt={activeMedia.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-all duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "/ngo_outreach_drive_thumbnail.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 pointer-events-none" />

                  {/* Top Badges Tag */}
                  <div className="relative z-10 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black text-white bg-emerald-600/90 backdrop-blur-md shadow-lg border border-emerald-400/30">
                      <Film className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Field Video Log
                    </span>
                    <span className="text-white/90 text-[10px] sm:text-xs font-extrabold bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15">
                      {activeMedia.date}
                    </span>
                  </div>

                  {/* Center Single Play Button Circle */}
                  <div className="relative z-10 flex items-center justify-center my-auto py-2 pointer-events-none">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 sm:border-4 border-white/80 flex items-center justify-center text-white shadow-2xl transition-all duration-300 bg-emerald-600/90 group-hover:bg-emerald-500 group-hover:shadow-emerald-500/60 group-hover:scale-110">
                      <Play className="w-6 h-6 sm:w-10 sm:h-10 text-white fill-white ml-0.5 sm:ml-1" />
                    </div>
                  </div>

                  {/* Bottom Title Preview */}
                  <div className="relative z-10 space-y-0.5 sm:space-y-1 max-w-2xl pointer-events-none">
                    <h3 className="text-white font-black text-sm sm:text-xl leading-snug drop-shadow-md line-clamp-1 sm:line-clamp-2">
                      {activeMedia.title}
                    </h3>
                    <p className="text-white/80 text-xs font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Tap to play field recording</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Control & Info Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
              
              {/* Controls & Badges Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                
                {/* Active Indicator & Category */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      activeMedia.source === "yt" ? "bg-rose-400" : "bg-emerald-400"
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${
                      activeMedia.source === "yt" ? "bg-rose-500" : "bg-emerald-500"
                    }`}></span>
                  </span>

                  <span className={`text-xs font-black uppercase tracking-wider leading-tight ${
                    activeMedia.source === "yt" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {activeMedia.source === "yt" ? "YouTube Broadcast" : `Bethany Ashramam • Clip ${activeMedia.clipNumber || 1} of ${MP4_ITEMS.length}`}
                  </span>
                </div>

                {/* Interactive Player Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Play / Pause Toggle Button */}
                  <button
                    onClick={isPlaying ? pauseCinemaVideo : playCinemaVideo}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl text-xs font-black transition-all shadow-md active:scale-95 ${
                      isPlaying
                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400/50"
                        : activeMedia.source === "yt"
                        ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25 ring-2 ring-rose-500/30"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 ring-2 ring-emerald-500/30"
                    }`}
                    title={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause Video</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        <span>Play Video</span>
                      </>
                    )}
                  </button>
                  
                  {/* Prev/Next Video Controls */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[40px]">
                    <button
                      onClick={handlePrevMedia}
                      title="Previous Video"
                      className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <span className="text-xs px-2.5 font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                      {activeIndex + 1}/{ALL_MEDIA_DATABASE.length}
                    </span>
                    <button
                      onClick={handleNextMedia}
                      title="Next Video"
                      className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Theater Fullscreen for MP4 */}
                  {activeMedia.source === "mp4" && (
                    <button
                      onClick={() => setLightboxIndex(MP4_ITEMS.findIndex(m => m.id === activeMedia.id))}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors shadow-sm active:scale-95"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Theater Mode</span>
                    </button>
                  )}

                  {/* Share Link */}
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors active:scale-95"
                  >
                    {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{linkCopied ? "Copied" : "Share"}</span>
                  </button>

                  {/* Watch on YouTube External */}
                  {activeMedia.source === "yt" && (
                    <a
                      href={`https://www.youtube.com/watch?v=${activeMedia.videoId || activeMedia.url?.split("/embed/")[1]?.split("?")[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm active:scale-95"
                    >
                      <YouTubeLogoIcon className="w-3.5 h-3.5" />
                      <span>YouTube</span>
                    </a>
                  )}
                </div>

              </div>

              {/* Title & Full Description */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {activeMedia.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {activeMedia.description}
                </p>
              </div>

            </div>

          </div>

          {/* ── RIGHT COLUMN: PLAYLIST SIDEBAR WITH INSTANT FILTER BUTTONS ── */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
              
              {/* Header Title */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    playlistTab === "yt" ? "bg-rose-500/15 text-rose-600" : "bg-emerald-500/15 text-emerald-600"
                  }`}>
                    <ListVideo className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">
                      {vT.playlistTitle}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {vT.playlistSubtitle}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                  {playlistItems.length} videos
                </span>
              </div>

              {/* ═════════ TOGGLE BUTTONS RIGHT ON PLAYLIST CARD ═════════ */}
              <div className="p-2.5 sm:p-3 bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800">
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 dark:bg-slate-900/90 rounded-2xl border border-slate-300/60 dark:border-slate-700/60 w-full overflow-hidden">
                  
                  {/* 1. YouTube Button */}
                  <button
                    onClick={() => setPlaylistTab("yt")}
                    className={`w-full py-2 px-1 sm:px-1.5 rounded-xl text-[11px] font-black transition-all duration-200 flex items-center justify-center gap-1 min-w-0 ${
                      playlistTab === "yt"
                        ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Youtube className={`w-3.5 h-3.5 flex-shrink-0 ${playlistTab === "yt" ? "text-white" : "text-rose-500"}`} />
                    <span className="truncate">YouTube</span>
                    <span className="opacity-80 font-bold shrink-0">({YOUTUBE_ITEMS.length})</span>
                  </button>

                  {/* 2. Videos Button */}
                  <button
                    onClick={() => setPlaylistTab("mp4")}
                    className={`w-full py-2 px-1 sm:px-1.5 rounded-xl text-[11px] font-black transition-all duration-200 flex items-center justify-center gap-1 min-w-0 ${
                      playlistTab === "mp4"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Film className={`w-3.5 h-3.5 flex-shrink-0 ${playlistTab === "mp4" ? "text-white" : "text-emerald-500"}`} />
                    <span className="truncate">Videos</span>
                    <span className="opacity-80 font-bold shrink-0">({MP4_ITEMS.length})</span>
                  </button>

                  {/* 3. All Button */}
                  <button
                    onClick={() => setPlaylistTab("all")}
                    className={`w-full py-2 px-1 sm:px-1.5 rounded-xl text-[11px] font-black transition-all duration-200 flex items-center justify-center gap-1 min-w-0 ${
                      playlistTab === "all"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Layers className={`w-3.5 h-3.5 flex-shrink-0 ${playlistTab === "all" ? "text-white dark:text-slate-900" : "text-slate-500 dark:text-slate-400"}`} />
                    <span className="truncate">All</span>
                    <span className="opacity-80 font-bold shrink-0">({ALL_MEDIA_DATABASE.length})</span>
                  </button>

                </div>
              </div>

              {/* Playlist Item Scroll List */}
              <div className="p-3 space-y-2 max-h-[520px] overflow-y-auto custom-scrollbar">
                {playlistItems.map((item, idx) => (
                  <PlaylistRow
                    key={item.id}
                    item={item}
                    index={idx}
                    active={activeMedia.id === item.id}
                    onSelect={() => handlePlayMedia(item)}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>

        {/* ════════════════════ SHOWCASE MEDIA GRID (NO DUPLICATION) ════════════════════ */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-emerald-500" />
                {vT.featuredTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {vT.featuredSubtitle} ({filteredShowcaseMedia.length})
              </p>
            </div>
          </div>

          {/* Gallery Grid */}
          {filteredShowcaseMedia.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredShowcaseMedia.map((media, idx) => (
                <MediaCard
                  key={media.id}
                  item={media}
                  index={idx}
                  onPlay={() => handlePlayMedia(media)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Search className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-slate-700 dark:text-slate-300 font-bold">No video logs match your search query</p>
              <button onClick={() => { setSearchQuery(""); setFilterCategory("all"); }} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                Clear Filters
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <Lightbox
          videos={MP4_ITEMS}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(i => (i !== null && i > 0 ? i - 1 : i))}
          onNext={() => setLightboxIndex(i => (i !== null && i < MP4_ITEMS.length - 1 ? i + 1 : i))}
          onJump={i => setLightboxIndex(i)}
        />
      )}

    </div>
  );
}

