import { isBranchMatch } from './galleryData';

/**
 * Gallery Videos Data — Kingdom of Christ Ministries
 * Official Anointed Broadcast Videos by Bishop Kurra Kristhu Raju.
 */

export type VideoCategory =
  | "All"
  | "Faith & Miracles"
  | "Healing & Deliverance"
  | "Holy Spirit & Revival";

export interface GalleryVideoItem {
  branchId: string;
  branchName: string;
  branchSlug: string;
  id: string;
  videoId: string;
  title: string;
  titleTe?: string;
  titleHi?: string;
  description: string;
  category: VideoCategory;
  duration: string;
  date: string;
  embedUrl: string;
  thumbnail: string;
  videoUrl: string;
  directVideoUrl: string;
  views: string;
  speaker: string;
  speakerTe?: string;
  speakerHi?: string;
  siParam?: string;
}

export const GALLERY_VIDEO_ITEMS: GalleryVideoItem[] = [
  {
    id: "sermon-faith-miracles",
    branchId: "cmskewevf0000lz9gnoh1n8ve",
    branchName: "Shapur Nagar",
    branchSlug: "shapur-nagar",
    videoId: "B1M_Ls_vi4o",
    title: "The Power of Unwavering Faith & Divine Miracles",
    titleTe: "విశ్వాసము యొక్క అద్భుత శక్తి మరియు దైవిక జయం",
    titleHi: "विश्वास की सामर्थ्य और ईश्वरीय चमत्कार",
    description: "Official broadcast message by Bishop Kurra Kristhu Raju on the power of unwavering faith, spiritual victory, and divine miracles.",
    category: "Faith & Miracles",
    duration: "52:14",
    date: "Sunday Celebration",
    thumbnail: "/gallery/pastor/1.0.jpeg",
    videoUrl: "https://www.youtube.com/watch?v=B1M_Ls_vi4o",
    directVideoUrl: "/gallery/pastor/pastor-video.mp4",
    embedUrl: "https://www.youtube.com/embed/B1M_Ls_vi4o",
    views: "4.8K",
    speaker: "Bishop Kurra Kristhu Raju",
    speakerTe: "బిషప్ కుర్రా క్రీస్తు రాజు",
    speakerHi: "बिशप कुर्रा क्रिस्तु राजू",
  },
  {
    id: "sermon-divine-healing",
    branchId: "cmskewevf0000lz9gnoh1n8ve",
    branchName: "Shapur Nagar",
    branchSlug: "shapur-nagar",
    videoId: "pwm60SVNAJM",
    title: "Walking in Divine Healing, Deliverance & Peace",
    titleTe: "దైవిక స్వస్థత, విడుదల మరియు శాంతిలో జీవించడం",
    titleHi: "ईश्वरीय चंगाई, छुटकारा और शांति में चलना",
    description: "Anointed deliverance and healing ministry message by Bishop Kurra Kristhu Raju bringing spiritual renewal, peace, and wholeness.",
    category: "Healing & Deliverance",
    duration: "48:30",
    date: "Friday Aradhana",
    thumbnail: "/gallery/pastor/2.0.jpeg",
    videoUrl: "https://www.youtube.com/watch?v=pwm60SVNAJM",
    directVideoUrl: "/gallery/pastor/pastor-video.mp4",
    embedUrl: "https://www.youtube.com/embed/pwm60SVNAJM",
    views: "3.6K",
    speaker: "Bishop Kurra Kristhu Raju",
    speakerTe: "బిషప్ కుర్రా క్రీస్తు రాజు",
    speakerHi: "बिशप कुर्रा क्रिस्तु राजू",
  },
  {
    id: "sermon-holy-spirit-anointing",
    branchId: "cmskewevf0000lz9gnoh1n8ve",
    branchName: "Shapur Nagar",
    branchSlug: "shapur-nagar",
    videoId: "3ECD57HpiW8",
    title: "The Anointing of the Holy Spirit for Everyday Victory",
    titleTe: "పరిశుద్ధాత్మ అభిషేకము మరియు అనుదిన విజయము",
    titleHi: "पवित्र आत्मा का अभिषेक और दैनिक विजय",
    description: "Transformative message on walking under the fresh anointing of the Holy Spirit for daily guidance, supernatural power, and lasting revival.",
    category: "Holy Spirit & Revival",
    duration: "58:45",
    date: "Revival Service",
    thumbnail: "/gallery/pastor/3.0.jpeg",
    videoUrl: "https://www.youtube.com/watch?v=3ECD57HpiW8",
    directVideoUrl: "/gallery/pastor/pastor-video.mp4",
    embedUrl: "https://www.youtube.com/embed/3ECD57HpiW8",
    views: "5.2K",
    speaker: "Bishop Kurra Kristhu Raju",
    speakerTe: "బిషప్ కుర్రా క్రీస్తు రాజు",
    speakerHi: "बिशप कुर्रा क्रिस्तु राजू",
  },
];

export const VIDEO_CATEGORIES: { name: VideoCategory; label: string }[] = [
  { name: "All", label: "All Videos" },
  { name: "Faith & Miracles", label: "Faith & Miracles" },
  { name: "Healing & Deliverance", label: "Healing & Deliverance" },
  { name: "Holy Spirit & Revival", label: "Holy Spirit & Revival" },
];

export const CATEGORY_COLORS: Record<VideoCategory, string> = {
  "All": "purple",
  "Faith & Miracles": "amber",
  "Healing & Deliverance": "rose",
  "Holy Spirit & Revival": "indigo",
};

export function filterAndSearchVideos(
  items: GalleryVideoItem[],
  category: VideoCategory,
  query: string,
  language: "en" | "te" | "hi",
  branchId?: string | null
): GalleryVideoItem[] {
  return items.filter((item) => {
    if (branchId && branchId !== "all") {
      if (!isBranchMatch(item.branchId, item.branchName, branchId)) {
        return false;
      }
    }
    if (category !== "All" && item.category !== category) return false;
    if (query && query.trim()) {
      const q = query.toLowerCase();
      const title = language === "te" ? (item.titleTe || item.title) : language === "hi" ? (item.titleHi || item.title) : item.title;
      return (
        title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.date.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.branchName && item.branchName.toLowerCase().includes(q))
      );
    }
    return true;
  });
}
