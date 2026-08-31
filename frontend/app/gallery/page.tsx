"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  Youtube,
  ExternalLink,
  PlayCircle,
  Film,
  ListVideo,
  Clapperboard,
  Heart,
  SkipBack,
  SkipForward,
  ArrowUp,
  Sliders,
  Eye,
  Grid,
  Crown,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import { useBranch } from "@/components/providers/BranchProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";
import Navbar from "@/components/layout/Navbar";
import {
  CURATED_GALLERY_ITEMS,
  GalleryItem,
  isBranchMatch,
  SHAPUR_NAGAR_BRANCH_ID,
  SUBHASH_NAGAR_BRANCH_ID,
  BAHADURPALLI_BRANCH_ID,
} from "@/lib/galleryData";
import {
  GALLERY_VIDEO_ITEMS,
  VIDEO_CATEGORIES,
  CATEGORY_COLORS,
  filterAndSearchVideos,
  type GalleryVideoItem,
  type VideoCategory,
} from "@/lib/galleryVideosData";
import PastorSpriteSection from "@/components/gallery/PastorSpriteSection";
import { PASTOR_MEDIA_ITEMS } from "@/lib/pastorMediaData";

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

// Robust, High-Performance YouTube Thumbnail component with automatic fallback chain & no-referrer
const YouTubeThumbnail = React.memo(function YouTubeThumbnail({
  videoId,
  alt,
  className = "w-full h-full object-cover",
}: {
  videoId: string;
  alt: string;
  className?: string;
}) {
  const [srcIndex, setSrcIndex] = useState(0);

  const fallbackUrls = [
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/0.jpg`,
  ];

  const currentSrc = fallbackUrls[srcIndex] || fallbackUrls[0];

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => {
          if (srcIndex < fallbackUrls.length - 1) {
            setSrcIndex((prev) => prev + 1);
          }
        }}
        className={className}
      />
    </div>
  );
});

// Authentic Official YouTube Icon
function YouTubeLogoIcon({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
        fill="#FF0000"
      />
      <polygon points="9.545,15.568 15.818,12 9.545,8.432" fill="#FFFFFF" />
    </svg>
  );
}

// Toast notification interface
interface ToastMessage {
  id: string;
  text: string;
  type?: "success" | "info" | "heart";
}

interface GalleryTranslations {
  titleMain: string;
  titleHighlight: string;
  subtitle: string;
  allCategory: string;
  categoryTranslations: Record<string, string>;
  allBranches: string;
  subhashBranch: string;
  shapurBranch: string;
  bahadurBranch: string;
  sortOrderAsc: string;
  sortOrderDesc: string;
  sortTitleAsc: string;
  viewMasonry: string;
  viewStandard: string;
  viewCompact: string;
  savedPhotos: string;
  searchPlaceholder: string;
  videoSearchPlaceholder: string;
  loadingPhotos: string;
  noMomentsFound: string;
  adjustSearchTip: string;
  resetAllFilters: string;
  expandLightbox: string;
  downloadHighRes: string;
  saveFavorite: string;
  removeFavorite: string;
  download: string;
  sharePhoto: string;
  linkCopied: string;
  loadMore: string;
  remaining: string;
  playSlideshow: string;
  pauseSlideshow: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  prevPhoto: string;
  nextPhoto: string;
  closeEsc: string;
  photoInfo: string;
  hideInfo: string;
}

const GALLERY_I18N: Record<"en" | "te" | "hi", GalleryTranslations> = {
  en: {
    titleMain: "Church",
    titleHighlight: "Photo Gallery & Video Theater",
    subtitle:
      "Relive powerful revival services, explore 80+ church family blessing moments, and watch 44 live YouTube worship broadcasts.",
    allCategory: "All",
    categoryTranslations: {
      All: "All",
      "Family Blessings": "Family Blessings",
      "Pastoral Ministry": "Pastoral Ministry",
      "Worship & Praise": "Worship & Praise",
      "Youth & Children": "Youth & Children",
      "Fellowship & Joy": "Fellowship & Joy",
      "Special Events": "Special Events",
    },
    allBranches: "All Church Branches",
    subhashBranch: "Subhash Nagar Branch",
    shapurBranch: "Shapur Nagar Branch",
    bahadurBranch: "Bahadurpalli Branch",
    sortOrderAsc: "Order-Wise Photos (1 — {count})",
    sortOrderDesc: "Newest First ({count} Photos)",
    sortTitleAsc: "Title (A — Z)",
    viewMasonry: "Masonry Layout",
    viewStandard: "Standard Grid",
    viewCompact: "Compact Grid",
    savedPhotos: "Saved Favorites",
    searchPlaceholder: "Search 80+ photos...",
    videoSearchPlaceholder: "Search 44 videos...",
    loadingPhotos: "Loading sacred moments...",
    noMomentsFound: "No sacred moments found",
    adjustSearchTip:
      "Try adjusting your search query, selecting another branch, or resetting category filters.",
    resetAllFilters: "Reset All Filters",
    expandLightbox: "Expand Fullscreen Lightbox",
    downloadHighRes: "Download High-Res Photo",
    saveFavorite: "Saved to Favorites ❤️",
    removeFavorite: "Removed from Favorites",
    download: "Download",
    sharePhoto: "Shared successfully!",
    linkCopied: "Link copied to clipboard!",
    loadMore: "Load More Photos",
    remaining: "remaining",
    playSlideshow: "Play Slideshow",
    pauseSlideshow: "Pause",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    resetZoom: "Reset Zoom",
    prevPhoto: "Previous Photo",
    nextPhoto: "Next Photo",
    closeEsc: "Close (ESC)",
    photoInfo: "Photo Information",
    hideInfo: "Hide Details",
  },
  te: {
    titleMain: "చర్చి",
    titleHighlight: "ఫోటో గ్యాలరీ & వీడియో థియేటర్",
    subtitle:
      "ఆధ్యాత్మిక పునరుజ్జీవ కూడికలు, 80+ కుటుంబ ఆశీర్వాద క్షణాలు, మరియు 44 యూట్యూబ్ ఆరాధన ప్రసారాలను చూడండి.",
    allCategory: "అన్నీ",
    categoryTranslations: {
      All: "అన్నీ",
      "Family Blessings": "కుటుంబ ఆశీర్వాదాలు",
      "Pastoral Ministry": "పాస్టరల్ పరిచర్య",
      "Worship & Praise": "ఆరాధన & స్తుతి",
      "Youth & Children": "యువత & పిల్లలు",
      "Fellowship & Joy": "సహవాస ఆనందం",
      "Special Events": "ప్రత్యేక కార్యక్రమాలు",
    },
    allBranches: "అన్ని చర్చి బ్రాంచ్‌లు",
    subhashBranch: "సుభాష్ నగర్ బ్రాంచ్",
    shapurBranch: "షాపూర్ నగర్ బ్రాంచ్",
    bahadurBranch: "బహదూర్‌పల్లి బ్రాంచ్",
    sortOrderAsc: "వరుస క్రమ ఫోటోలు (1 — {count})",
    sortOrderDesc: "ఇటీవలి ఫోటోలు ({count})",
    sortTitleAsc: "శీర్షిక (A — Z)",
    viewMasonry: "మేసన్రీ లేఅవుట్",
    viewStandard: "గ్రిడ్ లేఅవుట్",
    viewCompact: "కాంపాక్ట్ గ్రిడ్",
    savedPhotos: "సేవ్ చేసిన ఫోటోలు",
    searchPlaceholder: "ఫోటోలను శోధించండి...",
    videoSearchPlaceholder: "వీడియోలను శోధించండి...",
    loadingPhotos: "ఫోటోలు లోడ్ అవుతున్నాయి...",
    noMomentsFound: "ఎలాంటి ఫోటోలు కనుగొనబడలేదు",
    adjustSearchTip: "మీ శోధనను మార్చండి లేదా ఫిల్టర్లను రీసెట్ చేయండి.",
    resetAllFilters: "అన్ని ఫిల్టర్లను రీసెట్ చేయండి",
    expandLightbox: "పూర్తి స్క్రీన్ లైట్‌బాక్స్",
    downloadHighRes: "హై-రెస్ ఫోటో డౌన్‌లోడ్ చేయండి",
    saveFavorite: "ఇష్టమైన వాటిలో చేర్చబడింది ❤️",
    removeFavorite: "ఇష్టమైన వాటి నుండి తీసివేయబడింది",
    download: "డౌన్‌లోడ్",
    sharePhoto: "విజయవంతంగా భాగస్వామ్యం చేయబడింది!",
    linkCopied: "లింక్ కాపీ చేయబడింది!",
    loadMore: "మరిన్ని ఫోటోలు లోడ్ చేయండి",
    remaining: "మిగిలి ఉన్నాయి",
    playSlideshow: "స్లైడ్‌షో ప్రారంభించండి",
    pauseSlideshow: "పాజ్",
    zoomIn: "జూమ్ ఇన్",
    zoomOut: "జూమ్ అవుట్",
    resetZoom: "రీసెట్ జూమ్",
    prevPhoto: "మునుపటి ఫోటో",
    nextPhoto: "తరువాతి ఫోటో",
    closeEsc: "మూసివేయి (ESC)",
    photoInfo: "ఫోటో వివరాలు",
    hideInfo: "వివరాలను దాచండి",
  },
  hi: {
    titleMain: "चर्च",
    titleHighlight: "फोटो गैलरी एवं वीडियो थिएटर",
    subtitle:
      "आत्मिक पुनरुद्धार सभाएं, 80+ पारिवारिक आशीष के क्षण, और 44 यूट्यूब आराधना प्रसारण देखें।",
    allCategory: "सभी",
    categoryTranslations: {
      All: "सभी",
      "Family Blessings": "पारिवारिक आशीषें",
      "Pastoral Ministry": "पास्टोरल सेवकाई",
      "Worship & Praise": "आराधना एवं स्तुति",
      "Youth & Children": "युवा एवं बच्चे",
      "Fellowship & Joy": "संगति एवं आनंद",
      "Special Events": "विशेष कार्यक्रम",
    },
    allBranches: "सभी चर्च शाखाएं",
    subhashBranch: "सुभाष नगर शाखा",
    shapurBranch: "शापुर नगर शाखा",
    bahadurBranch: "बहादुरपल्ली शाखा",
    sortOrderAsc: "क्रमवार फोटो (1 — {count})",
    sortOrderDesc: "नवीनतम फोटो ({count})",
    sortTitleAsc: "शीर्षक (A — Z)",
    viewMasonry: "मेसनरी लेआउट",
    viewStandard: "मानक ग्रिड",
    viewCompact: "कॉम्पैक्ट ग्रिड",
    savedPhotos: "सहेजे गए फोटो",
    searchPlaceholder: "फोटो खोजें...",
    videoSearchPlaceholder: "वीडियो खोजें...",
    loadingPhotos: "फोटो लोड हो रहे हैं...",
    noMomentsFound: "कोई फोटो नहीं मिला",
    adjustSearchTip: "अपनी खोज बदलें या फिल्टर रीसेट करें।",
    resetAllFilters: "सभी फिल्टर रीसेट करें",
    expandLightbox: "पूर्ण स्क्रीन लाइटबॉक्स",
    downloadHighRes: "हाई-रेज फोटो डाउनलोड करें",
    saveFavorite: "पसंदीदा में सहेजा गया ❤️",
    removeFavorite: "पसंदीदा से हटाया गया",
    download: "डाउनलोड",
    sharePhoto: "सफलतापूर्वक साझा किया गया!",
    linkCopied: "लिंक कॉपी किया गया!",
    loadMore: "और फोटो लोड करें",
    remaining: "शेष",
    playSlideshow: "स्लाइडशो चलाएं",
    pauseSlideshow: "रोकें",
    zoomIn: "ज़ूम इन",
    zoomOut: "ज़ूम आउट",
    resetZoom: "ज़ूम रीसेट करें",
    prevPhoto: "पिछला फोटो",
    nextPhoto: "अगला फोटो",
    closeEsc: "बंद करें (ESC)",
    photoInfo: "फोटो जानकारी",
    hideInfo: "विवरण छिपाएं",
  },
};

// Localize gallery item titles and descriptions dynamically
function getLocalizedItem(
  item: GalleryItem,
  language: "en" | "te" | "hi",
  gt: GalleryTranslations
) {
  let title = item.title;
  let description = item.description;
  let category =
    gt.categoryTranslations?.[item.category as keyof typeof gt.categoryTranslations] ||
    item.category;
  let branchName = item.branchName || "Subhash Nagar";

  if (language === "te") {
    if (branchName.includes("Subhash")) branchName = "సుభాష్ నగర్ బ్రాంచ్";
    else if (branchName.includes("Shapur")) branchName = "షాపూర్ నగర్ బ్రాంచ్";
    else if (branchName.includes("Bahadur")) branchName = "బహదూర్‌పల్లి బ్రాంచ్";

    if (item.id.startsWith("subhash-family-blessing-") && !item.id.includes("poster")) {
      const numMatch = item.title.match(/#(\d+)/);
      const num = numMatch ? numMatch[1] : "";
      if (item.title.includes("Family Dedication & Covenant Blessing")) {
        title = `కుటుంబ సమర్పణ & ఆశీర్వాద ప్రార్థన ${num ? `#${num}` : ""}`;
        description =
          "కుటుంబాలపై దైవిక సంరక్షణ, ఆరోగ్యం మరియు గృహ అభివృద్ధి కొరకు ప్రత్యేక పాస్టరల్ ప్రార్థన.";
      }
    }
  } else if (language === "hi") {
    if (branchName.includes("Subhash")) branchName = "सुभाष नगर शाखा";
    else if (branchName.includes("Shapur")) branchName = "शापुर नगर शाखा";
    else if (branchName.includes("Bahadur")) branchName = "बहादुरपल्ली शाखा";

    if (item.id.startsWith("subhash-family-blessing-") && !item.id.includes("poster")) {
      const numMatch = item.title.match(/#(\d+)/);
      const num = numMatch ? numMatch[1] : "";
      if (item.title.includes("Family Dedication & Covenant Blessing")) {
        title = `पारिवारिक समर्पण एवं आशीष प्रार्थना ${num ? `#${num}` : ""}`;
        description =
          "परिवारों पर ईश्वरीय सुरक्षा, उत्तम स्वास्थ्य और समृद्धि के लिए विशेष पास्टोरल प्रार्थना।";
      }
    }
  }

  return { title, description, category, branchName };
}

// Localize video item title
function getLocalizedVideoTitle(
  video: GalleryVideoItem,
  language: "en" | "te" | "hi"
): string {
  if (language === "te" && video.titleTe) return video.titleTe;
  if (language === "hi" && video.titleHi) return video.titleHi;
  return video.title;
}

export default function ChurchGalleryPage() {
  const { language } = useLanguage();
  const currentLang = (language as "en" | "te" | "hi") || "en";
  const gt = GALLERY_I18N[currentLang] || GALLERY_I18N.en;
  const { selectedBranchId, setSelectedBranchId } = useBranch();

  // Top-Level Media Section Tab: "photos" | "videos" | "pastor" | "all"
  const [activeMediaTab, setActiveMediaTab] = useState<"photos" | "videos" | "pastor" | "all">("all");

  // ══════════════════════ PHOTO GALLERY STATE ══════════════════════
  const [items, setItems] = useState<GalleryItem[]>(CURATED_GALLERY_ITEMS);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"order-asc" | "order-desc" | "newest" | "title-asc">("order-asc");
  const [viewMode, setViewMode] = useState<"masonry" | "standard" | "compact">("masonry");
  const [cardDisplayMode, setCardDisplayMode] = useState<"immersive" | "detailed">("immersive");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Progressive batch rendering for photos
  const INITIAL_BATCH = 24;
  const BATCH_SIZE = 16;
  const [displayCount, setDisplayCount] = useState(INITIAL_BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Progressive video grid display count
  const [videoDisplayCount, setVideoDisplayCount] = useState(16);

  // Photo Lightbox & Slideshow state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
  const [slideshowProgress, setSlideshowProgress] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // ══════════════════════ VIDEO THEATER STATE ══════════════════════
  const [activeVideoId, setActiveVideoId] = useState<string>(GALLERY_VIDEO_ITEMS[0].id);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoFilterCategory, setVideoFilterCategory] = useState<VideoCategory>("All");
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>("");
  const [playlistTab, setPlaylistTab] = useState<VideoCategory>("All");
  const [videoModalActive, setVideoModalActive] = useState<boolean>(false);
  const [videoModalIndex, setVideoModalIndex] = useState<number | null>(null);
  const [videoLinkCopied, setVideoLinkCopied] = useState<boolean>(false);

  // Scroll to top visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Refs for smooth navigation
  const photoGalleryRef = useRef<HTMLDivElement>(null);
  const videoTheaterRef = useRef<HTMLDivElement>(null);
  const cinemaIframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active Video item
  const activeVideo = useMemo(() => {
    return GALLERY_VIDEO_ITEMS.find((v) => v.id === activeVideoId) || GALLERY_VIDEO_ITEMS[0];
  }, [activeVideoId]);

  // Tab Switch Handlers
  const handleSwitchToPastor = useCallback(() => {
    setActiveMediaTab("pastor");
    setTimeout(() => {
      const el = document.getElementById("pastor-spotlight-section");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }, []);

  const handleSwitchToVideoTheater = useCallback(() => {
    setActiveMediaTab("videos");
    setActiveVideoId(GALLERY_VIDEO_ITEMS[0].id); // Always set to 1st video
    setTimeout(() => {
      videoTheaterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }, []);

  const handleSwitchToPhotoGallery = useCallback(() => {
    setActiveMediaTab("photos");
    setTimeout(() => {
      photoGalleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }, []);

  const handleSwitchToAllMedia = useCallback(() => {
    setActiveMediaTab("all");
  }, []);

  // Filtered video list for main grid
  const filteredVideos = useMemo(() => {
    return filterAndSearchVideos(
      GALLERY_VIDEO_ITEMS,
      videoFilterCategory,
      videoSearchQuery,
      language as "en" | "te" | "hi"
    );
  }, [videoFilterCategory, videoSearchQuery, language]);

  // Playlist items for sidebar based on playlistTab
  const playlistItems = useMemo(() => {
    if (playlistTab === "All") return GALLERY_VIDEO_ITEMS;
    return GALLERY_VIDEO_ITEMS.filter((v) => v.category === playlistTab);
  }, [playlistTab]);

  // Active index in current playlist
  const currentVideoIndexInAll = useMemo(() => {
    return GALLERY_VIDEO_ITEMS.findIndex((v) => v.id === activeVideo.id);
  }, [activeVideo.id]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kcm-gallery-favorites");
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    } catch {}
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = useCallback(
    (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          showToast(gt?.removeFavorite || "Removed from Favorites", "info");
        } else {
          next.add(id);
          showToast(gt?.saveFavorite || "Saved to Favorites ❤️", "heart");
        }
        try {
          localStorage.setItem("kcm-gallery-favorites", JSON.stringify(Array.from(next)));
        } catch {}
        return next;
      });
    },
    [gt?.removeFavorite, gt?.saveFavorite]
  );

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

  // Derive photo categories dynamically with count
  const photoCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    const unique = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return [
      { name: "All", label: gt.categoryTranslations?.["All"] || gt.allCategory, count: items.length },
      ...unique.map((cat) => ({
        name: cat,
        label: gt.categoryTranslations?.[cat as keyof typeof gt.categoryTranslations] || cat,
        count: counts[cat],
      })),
    ];
  }, [items, gt]);

  // Filter & sort photo items
  const filteredItems = useMemo(() => {
    const result = items.filter((item) => {
      if (activeCategory !== "All" && item.category !== activeCategory) return false;
      if (favoritesOnly && !favorites.has(item.id)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const loc = getLocalizedItem(item, language, gt);
        const matchesTitle = item.title.toLowerCase().includes(q) || loc.title.toLowerCase().includes(q);
        const matchesDesc = (item.description?.toLowerCase() || "").includes(q) || loc.description.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q) || loc.category.toLowerCase().includes(q);
        const matchesEvent = item.eventName?.toLowerCase().includes(q);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesEvent && !matchesTags) {
          return false;
        }
      }
      return true;
    });

    return [...result].sort((a, b) => {
      if (sortOrder === "order-desc" || sortOrder === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === "title-asc") {
        return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" });
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    });
  }, [items, activeCategory, favoritesOnly, favorites, searchQuery, sortOrder, language, gt, selectedBranch]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, displayCount);
  }, [filteredItems, displayCount]);

  const hasMore = filteredItems.length > displayCount;

  // Infinite scroll intersection observer for photos
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

  // Navigation handlers for video theater
  const handleSelectVideo = (video: GalleryVideoItem) => {
    setActiveVideoId(video.id);
    setIsVideoPlaying(true);
    if (videoTheaterRef.current) {
      videoTheaterRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const pauseCinemaVideo = useCallback(() => {
    try {
      if (cinemaIframeRef.current?.contentWindow) {
        cinemaIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "*"
        );
      }
    } catch {}
    setIsVideoPlaying(false);
  }, []);

  const playCinemaVideo = useCallback(() => {
    try {
      if (cinemaIframeRef.current?.contentWindow) {
        cinemaIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "*"
        );
      }
    } catch {}
    setIsVideoPlaying(true);
  }, []);

  const handlePrevVideo = () => {
    const idx = GALLERY_VIDEO_ITEMS.findIndex((v) => v.id === activeVideo.id);
    const prevIdx = idx > 0 ? idx - 1 : GALLERY_VIDEO_ITEMS.length - 1;
    setActiveVideoId(GALLERY_VIDEO_ITEMS[prevIdx].id);
    setIsVideoPlaying(true);
  };

  const handleNextVideo = () => {
    const idx = GALLERY_VIDEO_ITEMS.findIndex((v) => v.id === activeVideo.id);
    const nextIdx = idx < GALLERY_VIDEO_ITEMS.length - 1 ? idx + 1 : 0;
    setActiveVideoId(GALLERY_VIDEO_ITEMS[nextIdx].id);
    setIsVideoPlaying(true);
  };

  const handleShareVideo = async (video: GalleryVideoItem) => {
    const locTitle = getLocalizedVideoTitle(video, language);
    const shareUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: locTitle,
          text: `${locTitle} — Kingdom of Christ Ministries`,
          url: shareUrl,
        });
        showToast(gt.sharePhoto || "Shared successfully!", "success");
        return;
      } catch {}
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setVideoLinkCopied(true);
      showToast(gt.linkCopied || "YouTube video link copied!", "success");
      setTimeout(() => setVideoLinkCopied(false), 2000);
    }
  };

  // Lightbox navigation
  const currentLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

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

  // Keyboard navigation for photo lightbox
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

  // Download Handler
  const handleDownload = async (item: GalleryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    showToast(gt.downloadHighRes, "info");
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
      showToast(gt.download, "success");
    } catch {
      window.open(item.url, "_blank");
    }
  };

  // Subhash Nagar event stats
  const subhashPhotosCount = items.filter(
    (i) => i.branchName?.includes("Subhash") || i.url.includes("subhash-nagar")
  ).length;

  const currentLightboxLocalized = currentLightboxItem
    ? getLocalizedItem(currentLightboxItem, language, gt)
    : null;

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

      {/* ══════════════════════════ HERO SECTION ══════════════════════════ */}
      <section className="relative pt-32 pb-14 md:pt-36 md:pb-16 overflow-hidden bg-gradient-to-b from-purple-100/70 via-slate-50 to-slate-50 dark:from-purple-950/40 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-white/5">
        {/* Ambient Lights & Sacred Aura */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.18),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.35),rgba(255,255,255,0))]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-purple-500/15 dark:bg-purple-600/20 blur-[130px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-10 right-10 w-80 h-80 bg-rose-500/10 dark:bg-rose-500/15 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-blue-600/10 dark:bg-blue-600/15 blur-[110px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              <BackToHome variant="glass" />
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 dark:border-purple-400/30 text-purple-700 dark:text-purple-300 text-xs font-extrabold uppercase tracking-widest backdrop-blur-xl shadow-sm shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-spin shrink-0" style={{ animationDuration: "6s" }} />
                <span className="whitespace-nowrap">Captured Moments of Faith & Praise</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white font-outfit">
              {gt.titleMain || "Church"}{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 dark:from-purple-400 dark:via-pink-400 dark:to-rose-300 bg-clip-text text-transparent">
                {gt.titleHighlight || "Photo Gallery & Video Theater"}
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300/90 leading-relaxed font-medium max-w-2xl mx-auto">
              {gt.subtitle || "Relive powerful revival services, explore 80+ church family blessing moments, and watch 44 live YouTube worship broadcasts."}
            </p>

            {/* Quick Media Switcher Tabs in Hero — Liquid Glass Segmented Pill */}
            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-purple-950/10 max-w-full mx-auto">
              {/* 0. Pastor Spotlight Tab */}
              <button
                onClick={handleSwitchToPastor}
                className={`relative inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
                  activeMediaTab === "pastor"
                    ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/40"
                    : "text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/80 dark:hover:bg-purple-950/30"
                }`}
              >
                <Crown className={`w-4 h-4 shrink-0 ${activeMediaTab === "pastor" ? "text-amber-300 fill-amber-300" : "text-amber-500"}`} />
                <span>Pastor Spotlight</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-black shrink-0 ${
                    activeMediaTab === "pastor"
                      ? "bg-white/25 text-white"
                      : "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300"
                  }`}
                >
                  {PASTOR_MEDIA_ITEMS.length}
                </span>
                {activeMediaTab === "pastor" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
                )}
              </button>

              {/* 1. Photo Gallery Tab */}
              <button
                onClick={handleSwitchToPhotoGallery}
                className={`relative inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
                  activeMediaTab === "photos"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/40"
                    : "text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/80 dark:hover:bg-purple-950/30"
                }`}
              >
                <Camera className={`w-4 h-4 shrink-0 ${activeMediaTab === "photos" ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
                <span>Photo Gallery</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-black shrink-0 ${
                    activeMediaTab === "photos"
                      ? "bg-white/25 text-white"
                      : "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300"
                  }`}
                >
                  {filteredItems.length}+
                </span>
              </button>

              {/* 2. Video Theater Tab */}
              <button
                onClick={handleSwitchToVideoTheater}
                className={`relative inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
                  activeMediaTab === "videos"
                    ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400/40"
                    : "text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30"
                }`}
              >
                <YouTubeLogoIcon className="w-4 h-4 shrink-0" />
                <span>Video Theater</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-black shrink-0 ${
                    activeMediaTab === "videos"
                      ? "bg-white/25 text-white"
                      : "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {filteredVideos.length}
                </span>
              </button>

              {/* 3. All Media Tab */}
              <button
                onClick={handleSwitchToAllMedia}
                className={`relative inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
                  activeMediaTab === "all"
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40"
                    : "text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/30"
                }`}
              >
                <Layers className={`w-4 h-4 shrink-0 ${activeMediaTab === "all" ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`} />
                <span>All Media</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-black shrink-0 ${
                    activeMediaTab === "all"
                      ? "bg-white/25 text-white"
                      : "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
                  }`}
                >
                  {filteredVideos.length + filteredItems.length}+
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════════
           PASTOR SPOTLIGHT & SPRITE REEL SHOWCASE SECTION
      ══════════════════════════════════════════════════════════════════════════════ */}
      {(activeMediaTab === "all" || activeMediaTab === "pastor") && (
        <div className="container mx-auto px-4 sm:px-6">
          <PastorSpriteSection language={currentLang} onToast={showToast} />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════
           FIRST SECTION: 📸 HIGH-RESOLUTION PHOTO GALLERY & BLESSING MOMENTS
      ══════════════════════════════════════════════════════════════════════════════ */}
      {(activeMediaTab === "all" || activeMediaTab === "photos") && (
        <main ref={photoGalleryRef} className="container mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Photo Gallery Header & Control Bar */}
          <div className="space-y-6 mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 mb-2">
                  <Camera className="w-3.5 h-3.5" />
                  PHOTO ARCHIVE & FAMILY BLESSINGS
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  High-Resolution Moments of Faith
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  Explore {items.length}+ curated photographs capturing pastoral blessings, worship, prayer services, and church family milestones.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {filteredItems.length > 0 && (
                  <button
                    onClick={() => {
                      setLightboxIndex(0);
                      setIsSlideshowPlaying(true);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/25 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Launch Slideshow ({filteredItems.length} Photos)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Photo Search Bar & Controls Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-md">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={gt.searchPlaceholder}
                  className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Controls Group */}
              <div className="grid grid-cols-1 sm:flex sm:flex-nowrap items-center gap-2">
                {/* Branch Dropdown */}
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    aria-label="Filter photos by church branch"
                    className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer pr-2 text-xs sm:text-sm w-full truncate"
                  >
                    <option value="all" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                      {gt.allBranches} ({items.length})
                    </option>
                    <option value="cmrgwqhc30001fsk8mysbmp50" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                      {gt.subhashBranch} ({subhashPhotosCount})
                    </option>
                    <option value="cmskewevf0000lz9gnoh1n8ve" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                      {gt.shapurBranch}
                    </option>
                    <option value="cmrgwqhc30002fsk8ncn255w5" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                      {gt.bahadurBranch}
                    </option>
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    aria-label="Sort gallery photos"
                    className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer pr-2 text-xs sm:text-sm w-full truncate"
                  >
                    <option value="order-asc" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                      {gt.sortOrderAsc.replace("{count}", items.length.toString())}
                    </option>
                    <option value="order-desc" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                      {gt.sortOrderDesc.replace("{count}", items.length.toString())}
                    </option>
                    <option value="title-asc" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                      {gt.sortTitleAsc}
                    </option>
                  </select>
                </div>

                {/* View Layout Switcher */}
                <div className="hidden sm:flex items-center p-1 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl">
                  <button
                    onClick={() => setViewMode("masonry")}
                    title="Masonry Gallery"
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
                    title="Compact Dense"
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "compact"
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Style Mode Toggle (Immersive vs Detailed) */}
                <button
                  onClick={() => setCardDisplayMode((m) => (m === "immersive" ? "detailed" : "immersive"))}
                  title={cardDisplayMode === "immersive" ? "Switch to Detailed Cards with Captions" : "Switch to Immersive Photos"}
                  className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                    cardDisplayMode === "immersive"
                      ? "bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-600/50 text-purple-700 dark:text-purple-300"
                      : "bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{cardDisplayMode === "immersive" ? "Visual Grid" : "With Details"}</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills for Photos */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-600/30">
              {photoCategories.map((cat) => {
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
                        : "bg-white dark:bg-slate-900/70 border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
                    }`}
                  >
                    <span>{cat.label}</span>
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
                    : "bg-white dark:bg-slate-900/70 border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? "fill-white" : "text-rose-500 dark:text-rose-400"}`} />
                <span>{gt.savedPhotos}</span>
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

          {/* Photos Grid */}
          {isLoading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wide">
                {gt.loadingPhotos}
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-24 px-4 rounded-3xl bg-slate-100/70 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-white/10 backdrop-blur-md max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{gt.noMomentsFound}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{gt.adjustSearchTip}</p>
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
                {gt.resetAllFilters}
              </button>
            </div>
          ) : (
            <div>
              <div
                className={
                  viewMode === "masonry"
                    ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5"
                    : viewMode === "compact"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                }
              >
                {visibleItems.map((item, index) => {
                  const isFav = favorites.has(item.id);
                  const globalIndex = filteredItems.findIndex((fi) => fi.id === item.id);
                  const actualLightboxIndex = globalIndex !== -1 ? globalIndex : index;
                  const localizedItem = getLocalizedItem(item, language, gt);

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setLightboxIndex(actualLightboxIndex);
                        setIsSlideshowPlaying(false);
                      }}
                      className={`cv-card group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/10 hover:border-purple-500/60 shadow-md hover:shadow-2xl dark:shadow-lg dark:hover:shadow-purple-950/40 transition-all duration-300 hover:-translate-y-1 transform-gpu cursor-pointer flex flex-col justify-between ${
                        viewMode === "masonry" ? "break-inside-avoid mb-5" : ""
                      }`}
                    >
                      {/* Media Box */}
                      <div
                        className={`relative w-full overflow-hidden bg-slate-950 ${
                          viewMode === "compact"
                            ? "aspect-square"
                            : viewMode === "standard"
                            ? "aspect-[4/3]"
                            : item.url.includes("poster") || item.category === "Special Events"
                            ? "aspect-[3/4] sm:min-h-[280px]"
                            : "aspect-[4/3] sm:min-h-[230px]"
                        }`}
                      >
                        <GalleryCardImage
                          src={item.url}
                          title={localizedItem.title}
                          priority={index < 12}
                        />

                        {/* Top Badges */}
                        <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent p-3 flex items-center justify-between pointer-events-none z-20">
                          <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold tracking-wider border border-white/20 shadow-sm">
                            #{actualLightboxIndex + 1}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-extrabold tracking-wider border border-purple-400/40 shadow-sm">
                            {localizedItem.category.toUpperCase()}
                          </span>
                        </div>

                        {/* Bottom Gradient Overlay on Photos (for Immersive Mode) */}
                        {cardDisplayMode === "immersive" && viewMode !== "compact" && (
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3.5 pt-8 z-20 pointer-events-none">
                            <p className="text-white text-xs sm:text-sm font-bold line-clamp-1 drop-shadow-md">
                              {localizedItem.title}
                            </p>
                            <p className="text-slate-300 text-[10px] font-medium flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-purple-400" />
                              {localizedItem.branchName}
                            </p>
                          </div>
                        )}

                        {/* Glass Hover Overlay with Quick Actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-30 backdrop-blur-[2px]">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex(actualLightboxIndex);
                              }}
                              title={gt.expandLightbox}
                              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-950 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all backdrop-blur-md border border-white/20"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDownload(item, e)}
                              title={gt.downloadHighRes}
                              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-950 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all backdrop-blur-md border border-white/20"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => toggleFavorite(item.id, e)}
                              title={isFav ? gt.removeFavorite : gt.saveFavorite}
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

                      {/* Card Details (when in detailed mode) */}
                      {cardDisplayMode === "detailed" && viewMode !== "compact" && (
                        <div className="p-4 sm:p-5 bg-white/95 dark:bg-slate-900/90 border-t border-slate-100 dark:border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-300">
                              <MapPin className="w-3 h-3" />
                              {localizedItem.branchName}
                            </span>
                            <span>{item.eventDate || "July 2026"}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                            {localizedItem.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                            {localizedItem.description}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Load More button */}
              {hasMore && (
                <div ref={sentinelRef} className="pt-12 pb-6 flex flex-col items-center justify-center gap-3">
                  <button
                    onClick={() => setDisplayCount((prev) => Math.min(prev + BATCH_SIZE, filteredItems.length))}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-purple-50 dark:bg-purple-600/20 hover:bg-purple-600 text-purple-700 dark:text-purple-300 hover:text-white border border-purple-200 dark:border-purple-500/30 text-xs sm:text-sm font-bold transition-all shadow-md hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {gt.loadMore} ({filteredItems.length - displayCount} {gt.remaining})
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════
           SECOND SECTION: 🎬 VIDEO THEATER & LIVE BROADCAST ARCHIVE (USER REQUESTED UX)
      ══════════════════════════════════════════════════════════════════════════════ */}
      {(activeMediaTab === "all" || activeMediaTab === "videos") && (
        <section
          ref={videoTheaterRef}
          className="relative bg-slate-100/90 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 sm:py-16 transition-colors"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* ─── Header & Stat Pill Row ─── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                  <Youtube className="w-3.5 h-3.5" />
                  KCM LIVE CHURCH VIDEO THEATER
                </span>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2 max-w-3xl">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Video Theater & Worship Broadcasts
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                    Watch 44 live YouTube video recordings of KCM Sunday services, revival blessings, Christmas celebrations, and spiritual messages.
                  </p>
                </div>

                {/* Quick Stat Pill Cards */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => {
                      setActiveMediaTab("photos");
                      photoGalleryRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-400 shadow-sm transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/30 shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base sm:text-lg font-black leading-none">{items.length}+</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Photo Logs</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setVideoFilterCategory("All");
                      setPlaylistTab("All");
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left transition-all ${
                      videoFilterCategory === "All"
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-600/50 ring-2 ring-rose-500/30 shadow-md shadow-rose-500/10"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-400 shadow-sm"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-500/30 shrink-0">
                      <Youtube className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base sm:text-lg font-black leading-none">{GALLERY_VIDEO_ITEMS.length}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">YouTube</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* ─── Search & Category Control Bar ─── */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {VIDEO_CATEGORIES.map((cat) => {
                    const isActive = videoFilterCategory === cat.name;
                    const count =
                      cat.name === "All"
                        ? GALLERY_VIDEO_ITEMS.length
                        : GALLERY_VIDEO_ITEMS.filter((v) => v.category === cat.name).length;

                    return (
                      <button
                        key={cat.name}
                        onClick={() => {
                          setVideoFilterCategory(cat.name);
                          setPlaylistTab(cat.name);
                        }}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-extrabold text-xs transition-all ${
                          isActive
                            ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-500/30"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 shadow-sm"
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                            isActive
                              ? "bg-white/25 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Video Search Input */}
                <div className="relative w-full md:w-80 lg:w-96 shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={gt.videoSearchPlaceholder || "Search 44 videos..."}
                    value={videoSearchQuery}
                    onChange={(e) => setVideoSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                  {videoSearchQuery && (
                    <button
                      onClick={() => setVideoSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ════════════════════════ THEATER & PLAYLIST 2-COLUMN STAGE ════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* ── LEFT COLUMN: MAIN CINEMA PLAYER SCREEN (8 Cols) ── */}
              <div className="lg:col-span-8 space-y-5">
                {/* 16:9 Screen - Direct Embedded YouTube Cinema Player with Ambilight Glow */}
                <div className="relative group/cinema">
                  {/* Dynamic Cinema Ambilight Glow */}
                  <div className="video-ambilight-glow" />

                  <div
                    className="relative rounded-3xl overflow-hidden bg-black border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-rose-950/25 transition-all duration-300 w-full z-10"
                    style={{ aspectRatio: "16/9" }}
                  >
                    {isVideoPlaying ? (
                      <iframe
                        ref={cinemaIframeRef}
                        key={activeVideo.id + "-playing"}
                        src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&playsinline=1&controls=1&fs=1&rel=0&iv_load_policy=3&enablejsapi=1`}
                        title={activeVideo.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                        allowFullScreen
                      />
                    ) : (
                      <div
                        className="absolute inset-0 w-full h-full group cursor-pointer"
                        onClick={() => setIsVideoPlaying(true)}
                      >
                        {/* High-definition Cover Thumbnail */}
                        <YouTubeThumbnail
                          videoId={activeVideo.videoId}
                          alt={activeVideo.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Gradient Vignette Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/45 pointer-events-none" />

                        {/* Top Header Badge inside player */}
                        <div className="absolute top-3 left-3 right-3 sm:top-5 sm:left-5 sm:right-5 flex items-center justify-between z-10 pointer-events-none">
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg">
                            <YouTubeLogoIcon className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[180px] sm:max-w-md">{activeVideo.category}</span>
                          </div>
                          <span className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-white/90 text-[11px] font-mono font-bold">
                            {activeVideo.date}
                          </span>
                        </div>

                        {/* Center Animated High-Contrast Touch-Friendly Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          <div className="relative flex items-center justify-center">
                            {/* Animated Glow Ping Ring */}
                            <span className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-600/40 animate-ping" />

                            {/* Authentic YouTube Play Pill Button */}
                            <div className="relative w-16 h-12 sm:w-20 sm:h-14 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-90 flex items-center justify-center shadow-2xl shadow-red-600/60 transition-all duration-200 border border-white/25 group-hover:scale-110">
                              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white ml-1" />
                            </div>
                          </div>
                        </div>

                        {/* Bottom Title Bar & Tap Prompt */}
                        <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 z-10 space-y-1 pointer-events-none">
                          <p className="text-white font-black text-sm sm:text-base md:text-xl line-clamp-2 drop-shadow-md">
                            {getLocalizedVideoTitle(activeVideo, language)}
                          </p>
                          <p className="text-white/90 text-xs font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span>Click to start instant broadcast playback</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Info & Controls Card */}
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-md space-y-4">
                  {/* Controls & Badges Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    {/* Active Indicator & Category */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        YOUTUBE BROADCAST • {activeVideo.category}
                      </span>
                    </div>

                    {/* Interactive Player Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Play / Pause Toggle Button */}
                      <button
                        onClick={isVideoPlaying ? pauseCinemaVideo : playCinemaVideo}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl text-xs font-black transition-all shadow-md active:scale-95 ${
                          isVideoPlaying
                            ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400/50"
                            : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25 ring-2 ring-rose-500/30"
                        }`}
                        title={isVideoPlaying ? "Pause Video" : "Play Video"}
                      >
                        {isVideoPlaying ? (
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
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[40px]">
                        <button
                          onClick={handlePrevVideo}
                          title="Previous Video"
                          className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 active:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <SkipBack className="w-4 h-4" />
                        </button>
                        <span className="text-xs px-2.5 font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                          {currentVideoIndexInAll + 1}/{filteredVideos.length || GALLERY_VIDEO_ITEMS.length}
                        </span>
                        <button
                          onClick={handleNextVideo}
                          title="Next Video"
                          className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 active:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <SkipForward className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Fullscreen Modal Player Button */}
                      <button
                        onClick={() => {
                          setVideoModalIndex(currentVideoIndexInAll);
                          setVideoModalActive(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors active:scale-95"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Fullscreen</span>
                      </button>

                      {/* Share Link */}
                      <button
                        onClick={() => handleShareVideo(activeVideo)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors active:scale-95"
                      >
                        {videoLinkCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                        <span>{videoLinkCopied ? "Copied" : "Share"}</span>
                      </button>

                      {/* Watch on YouTube External */}
                      <a
                        href={`https://www.youtube.com/watch?v=${activeVideo.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm active:scale-95"
                      >
                        <YouTubeLogoIcon className="w-3.5 h-3.5" />
                        <span>YouTube</span>
                      </a>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                      {getLocalizedVideoTitle(activeVideo, language)}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      {activeVideo.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN: PLAYLIST SIDEBAR (4 Cols) ── */}
              <div className="lg:col-span-4">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md flex flex-col">
                  {/* Playlist Header */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                        <ListVideo className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white leading-none">
                          Up Next Playlist
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          Tap any track to switch video
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                      {playlistItems.length} videos
                    </span>
                  </div>

                  {/* Toggle Filter Tabs on Playlist */}
                  <div className="p-2.5 bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 dark:bg-slate-900/90 rounded-2xl border border-slate-300/60 dark:border-slate-700/60 w-full">
                      <button
                        onClick={() => setPlaylistTab("All")}
                        className={`w-full py-1.5 px-1 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                          playlistTab === "All"
                            ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <Youtube className="w-3 h-3" />
                        <span>All</span>
                        <span className="opacity-80 font-bold">({playlistItems.length})</span>
                      </button>

                      <button
                        onClick={() => setPlaylistTab("Revival & Blessings")}
                        className={`w-full py-1.5 px-1 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                          playlistTab === "Revival & Blessings"
                            ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <span>Revival</span>
                      </button>

                      <button
                        onClick={() => setPlaylistTab("Christmas Events")}
                        className={`w-full py-1.5 px-1 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                          playlistTab === "Christmas Events"
                            ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <span>Christmas</span>
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Playlist Rows with Equalizer */}
                  <div className="p-3 space-y-2 max-h-[520px] overflow-y-auto custom-thin-scrollbar">
                    {playlistItems.map((item, idx) => {
                      const isActive = activeVideo.id === item.id;
                      const localizedTitle = getLocalizedVideoTitle(item, language);

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectVideo(item)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all duration-200 group ${
                            isActive
                              ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/25 ring-2 ring-rose-400/40 scale-[1.01]"
                              : "bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/50 text-slate-800 dark:text-slate-100"
                          }`}
                        >
                          {/* 16:9 Thumbnail */}
                          <div
                            className="relative flex-shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-black/10 dark:border-white/10 shadow-sm"
                            style={{ width: 96, aspectRatio: "16/9" }}
                          >
                            <YouTubeThumbnail videoId={item.videoId} alt={localizedTitle} />
                            <div
                              className={`absolute inset-0 flex items-center justify-center transition-colors ${
                                isActive ? "bg-black/25" : "bg-black/45 group-hover:bg-black/25"
                              }`}
                            >
                              {isActive ? (
                                <div className="flex items-end gap-0.5 h-4 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                                  <span className="w-1 bg-rose-400 rounded-full animate-equalizer-1" />
                                  <span className="w-1 bg-white rounded-full animate-equalizer-2" />
                                  <span className="w-1 bg-rose-400 rounded-full animate-equalizer-3" />
                                </div>
                              ) : (
                                <PlayCircle className="w-5 h-5 text-white/85 group-hover:scale-110 transition-transform" />
                              )}
                            </div>
                            <span className="absolute bottom-1 right-1 text-[8px] font-black text-white bg-black/75 px-1 rounded tabular-nums">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <p
                              className={`text-xs font-bold leading-snug line-clamp-2 ${
                                isActive
                                  ? "text-white"
                                  : "text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400"
                              }`}
                            >
                              {localizedTitle}
                            </p>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span
                                className={`inline-flex items-center gap-1 font-bold ${
                                  isActive ? "text-white/90" : "text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                <Youtube className="w-3 h-3" />
                                {item.category.split(" & ")[0]}
                              </span>
                              {isActive && (
                                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-black uppercase tracking-wider">
                                  Now Playing
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ════════════ SHOWCASE VIDEO GRID BELOW THEATER ════════════ */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Clapperboard className="w-5 h-5 text-rose-500" />
                    All Church Video Logs & Sermons
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Showing {filteredVideos.length} broadcast records{selectedBranch !== "all" ? ` (${selectedBranchLabel})` : ""} • Click any card to play in Cinema Stage
                  </p>
                </div>
              </div>

              {filteredVideos.length > 0 ? (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredVideos.slice(0, videoDisplayCount).map((video, idx) => {
                      const isCurrent = activeVideo.id === video.id;
                      const localizedTitle = getLocalizedVideoTitle(video, language);

                      return (
                        <div
                          key={video.id}
                          onClick={() => handleSelectVideo(video)}
                          className={`cv-card group relative w-full text-left overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col ${
                            isCurrent
                              ? "border-rose-500 ring-2 ring-rose-500/30 shadow-xl shadow-rose-950/20"
                              : "border-slate-200/80 dark:border-slate-800 hover:border-rose-400/60 shadow-sm hover:shadow-xl"
                          }`}
                        >
                          {/* 16:9 Thumbnail Box */}
                          <div className="relative w-full overflow-hidden bg-slate-950" style={{ aspectRatio: "16/9" }}>
                            <YouTubeThumbnail videoId={video.videoId} alt={localizedTitle} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                            {/* Play Ring */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div
                                className={`relative flex items-center justify-center rounded-full transition-all duration-300 shadow-2xl w-12 h-12 ${
                                  isCurrent
                                    ? "bg-rose-600 text-white scale-110 shadow-rose-600/50 ring-4 ring-rose-500/30"
                                    : "bg-white/95 dark:bg-slate-900/90 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white group-hover:scale-110 border border-white/50 shadow-black/40 backdrop-blur-md"
                                }`}
                              >
                                <Play className="w-5 h-5 ml-0.5 fill-current drop-shadow-sm" />
                              </div>
                            </div>

                            {/* Top Badges */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-black/65 backdrop-blur-md text-white text-[10px] font-black border border-white/15 tabular-nums">
                                #{String(GALLERY_VIDEO_ITEMS.indexOf(video) + 1).padStart(2, "0")}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg shadow-md backdrop-blur-md border bg-rose-600/90 text-white border-rose-400/40">
                                <Youtube className="w-3 h-3" />
                                {video.category.split(" & ")[0]}
                              </span>
                            </div>

                            {/* Bottom Details Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-3.5 pt-8">
                              <p className="text-white font-extrabold text-sm leading-snug line-clamp-1 group-hover:text-rose-300 transition-colors drop-shadow-md">
                                {localizedTitle}
                              </p>
                              <div className="flex items-center justify-between mt-1 text-[10px] text-white/70 font-semibold">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-300" />
                                  {video.date}
                                </span>
                                <span className="text-rose-400 font-bold uppercase tracking-wider">
                                  {isCurrent ? "Playing" : "Watch"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Load More Videos Button if not all shown */}
                  {filteredVideos.length > videoDisplayCount && (
                    <div className="pt-8 flex justify-center">
                      <button
                        onClick={() => setVideoDisplayCount((c) => Math.min(c + 16, filteredVideos.length))}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-200 dark:border-rose-800 text-xs sm:text-sm font-bold transition-all shadow-md hover:scale-105 active:scale-95"
                      >
                        <Clapperboard className="w-4 h-4" />
                        <span>Explore All {filteredVideos.length} Videos ({filteredVideos.length - videoDisplayCount} more)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <Search className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-slate-700 dark:text-slate-300 font-bold">
                    No video logs match your search query
                  </p>
                  <button
                    onClick={() => {
                      setVideoSearchQuery("");
                      setVideoFilterCategory("All");
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Clear Search Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ CINEMA VIDEO MODAL PLAYER ══════════ */}
      <AnimatePresence>
        {videoModalActive && videoModalIndex !== null && (() => {
          const vid = GALLERY_VIDEO_ITEMS[videoModalIndex];
          if (!vid) return null;
          const localizedTitle = getLocalizedVideoTitle(vid, language);

          return (
            <motion.div
              key="video-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-black">
                    {videoModalIndex + 1} / {GALLERY_VIDEO_ITEMS.length}
                  </span>
                  <span className="hidden sm:block text-xs text-slate-400 font-semibold truncate max-w-xs">
                    {localizedTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVideoModalIndex((i) => (i !== null ? Math.max(0, i - 1) : 0))}
                    disabled={videoModalIndex === 0}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 border border-white/10 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setVideoModalIndex((i) => (i !== null ? Math.min(GALLERY_VIDEO_ITEMS.length - 1, i + 1) : 0))}
                    disabled={videoModalIndex === GALLERY_VIDEO_ITEMS.length - 1}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 border border-white/10 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <a
                    href={`https://www.youtube.com/watch?v=${vid.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white border border-red-400/30 transition-all"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      setVideoModalActive(false);
                      setVideoModalIndex(null);
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-200 border border-white/10 transition-all ml-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Video Display */}
              <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
                <div className="w-full max-w-5xl">
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ paddingTop: "56.25%" }}>
                    <iframe
                      key={vid.id + "-modal"}
                      src={`https://www.youtube.com/embed/${vid.videoId}?enablejsapi=1&playsinline=1&controls=1&fs=1&rel=0&autoplay=1`}
                      title={localizedTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full rounded-2xl"
                      style={{ border: 0 }}
                    />
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600/30 text-rose-400 font-black border border-rose-500/30">
                        {vid.category}
                      </span>
                      <span className="text-xs text-slate-500">{vid.date}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">{localizedTitle}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{vid.description}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Thumbnail Scrubber */}
              <div className="flex-shrink-0 px-4 py-3 bg-slate-950 border-t border-white/10">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scroll-smooth" style={{ scrollbarWidth: "thin" }}>
                  {GALLERY_VIDEO_ITEMS.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => setVideoModalIndex(i)}
                      className={`relative flex-shrink-0 w-16 h-10 sm:w-20 sm:h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        i === videoModalIndex
                          ? "border-rose-500 scale-105 shadow-lg shadow-rose-600/40 ring-2 ring-rose-400/50"
                          : "border-white/10 opacity-50 hover:opacity-100 hover:border-white/40"
                      }`}
                    >
                      <YouTubeThumbnail videoId={v.videoId} alt={v.title} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ══════════ FULLSCREEN PHOTO LIGHTBOX & SLIDESHOW ══════════ */}
      <AnimatePresence>
        {lightboxIndex !== null && currentLightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex flex-col bg-black/95 backdrop-blur-2xl select-none"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const diff = touchStartX.current - e.changedTouches[0].clientX;
              if (diff > 50) nextPhoto();
              else if (diff < -50) prevPhoto();
              touchStartX.current = null;
            }}
          >
            {/* Top Toolbar */}
            <div className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-black tracking-widest uppercase">
                  {lightboxIndex + 1} / {filteredItems.length}
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-400">
                  {currentLightboxLocalized?.category} • {currentLightboxItem.eventName || currentLightboxLocalized?.branchName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Slideshow Play / Pause */}
                <button
                  onClick={() => setIsSlideshowPlaying((prev) => !prev)}
                  title={isSlideshowPlaying ? gt.pauseSlideshow : gt.playSlideshow}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSlideshowPlaying
                      ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30"
                      : "bg-white/10 hover:bg-white/20 text-slate-200 border-white/10"
                  }`}
                >
                  {isSlideshowPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">{gt.pauseSlideshow}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      <span className="hidden sm:inline">{gt.playSlideshow}</span>
                    </>
                  )}
                </button>

                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(z + 0.5, 3))}
                    title={gt.zoomIn}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-200"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(z - 0.5, 1))}
                    title={gt.zoomOut}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-200"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  {zoomLevel > 1 && (
                    <button
                      onClick={() => setZoomLevel(1)}
                      title={gt.resetZoom}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-purple-300"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Download */}
                <button
                  onClick={(e) => handleDownload(currentLightboxItem, e)}
                  title={gt.downloadHighRes}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Favorite */}
                <button
                  onClick={(e) => toggleFavorite(currentLightboxItem.id, e)}
                  title={favorites.has(currentLightboxItem.id) ? gt.removeFavorite : gt.saveFavorite}
                  className={`p-2 rounded-xl border transition-colors ${
                    favorites.has(currentLightboxItem.id)
                      ? "bg-rose-600 text-white border-rose-400"
                      : "bg-white/10 hover:bg-white/20 text-slate-200 border-white/10"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${favorites.has(currentLightboxItem.id) ? "fill-white" : ""}`}
                  />
                </button>

                {/* Toggle Info */}
                <button
                  onClick={() => setShowInfoPanel((prev) => !prev)}
                  title={showInfoPanel ? gt.hideInfo : gt.photoInfo}
                  className={`p-2 rounded-xl border transition-colors ${
                    showInfoPanel
                      ? "bg-purple-600 text-white border-purple-400"
                      : "bg-white/10 hover:bg-white/20 text-slate-200 border-white/10"
                  }`}
                >
                  <Info className="w-4 h-4" />
                </button>

                {/* Close */}
                <button
                  onClick={() => {
                    setLightboxIndex(null);
                    setIsSlideshowPlaying(false);
                  }}
                  title={gt.closeEsc}
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
              <button
                onClick={prevPhoto}
                title={gt.prevPhoto}
                className="absolute left-2 sm:left-5 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-black/40 hover:bg-purple-600 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                onClick={nextPhoto}
                title={gt.nextPhoto}
                className="absolute right-2 sm:right-5 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-black/40 hover:bg-purple-600 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <motion.div
                key={currentLightboxItem.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
              >
                <div
                  className="relative w-full h-full max-w-6xl max-h-[calc(100vh-220px)] sm:max-h-[calc(100vh-190px)] flex items-center justify-center transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <Image
                    src={encodeSrc(currentLightboxItem.url)}
                    alt={currentLightboxLocalized?.title || currentLightboxItem.title}
                    fill
                    unoptimized
                    priority
                    className="object-contain drop-shadow-2xl select-none"
                  />
                </div>
              </motion.div>

              {/* Info Drawer */}
              {showInfoPanel && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute bottom-2 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-4 sm:max-w-md p-4 rounded-2xl bg-slate-950/90 border border-white/20 backdrop-blur-2xl shadow-2xl z-30 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-md border border-purple-500/30">
                      {currentLightboxLocalized?.category}
                    </span>
                    <button
                      onClick={() => setShowInfoPanel(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title={gt.hideInfo}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {currentLightboxLocalized?.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {currentLightboxLocalized?.description}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1 text-amber-300 font-bold">
                      <MapPin className="w-3 h-3" />
                      {currentLightboxLocalized?.branchName}
                    </span>
                    <button
                      onClick={(e) => handleDownload(currentLightboxItem, e)}
                      className="text-purple-400 hover:text-purple-300 font-bold inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      {gt.download}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Bottom Reel */}
            <div className="relative z-30 px-4 py-3 bg-slate-950 border-t border-white/10">
              <div
                ref={thumbnailContainerRef}
                className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-purple-600/50 scrollbar-track-transparent scroll-smooth max-w-full"
              >
                {filteredItems.map((thumbItem, tIdx) => {
                  const isSelected = tIdx === lightboxIndex;
                  const thumbLocalized = getLocalizedItem(thumbItem, language, gt);
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
                        alt={thumbLocalized.title}
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

// High-Performance Optimized Gallery Card Image (Single image decode, zero GPU blur churn, instant 60fps scroll)
const GalleryCardImage = React.memo(function GalleryCardImage({
  src,
  title,
  priority = false,
}: {
  src: string;
  title: string;
  priority?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(() => loadedCache.has(src));
  const [hasError, setHasError] = useState(false);
  const safeSrc = encodeSrc(src);

  return (
    <div className="relative w-full h-full min-h-[200px] bg-slate-900 overflow-hidden flex items-center justify-center">
      {/* Lightweight skeleton pulse while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-800/80 animate-pulse flex items-center justify-center z-10">
          <Camera className="w-8 h-8 text-slate-500" />
        </div>
      )}

      {/* Subtle dark ambient gradient backdrop instead of heavy duplicate blurred image */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.12)_0,transparent_75%)] pointer-events-none" />

      {/* Primary Image */}
      <Image
        src={safeSrc}
        alt={title}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        className={`object-contain z-10 transform-gpu group-hover:scale-105 transition-all duration-300 ease-out drop-shadow-md ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => {
          loadedCache.add(src);
          setIsLoaded(true);
        }}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
      />
    </div>
  );
});