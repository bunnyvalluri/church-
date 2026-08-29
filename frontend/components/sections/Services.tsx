"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Music, Users2, Heart, BookHeart, Mic2, Calendar,
  MapPin, Clock, Flame, Star, Loader2, RefreshCw,
  Sparkles, ChevronRight, Globe, Shield,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Icon registry — maps icon name string from DB to Lucide component ─────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Music,
  Users2,
  Heart,
  BookHeart,
  Mic2,
  Calendar,
  MapPin,
  Clock,
  Flame,
  Star,
  Globe,
  Shield,
  Sparkles,
};

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name] || Heart;
}

// ── Fallback gradient map if cardColor is a Tailwind class ────────────────────────
const GRADIENT_FALLBACKS: Record<string, string> = {
  "from-blue-500 to-cyan-500": "linear-gradient(135deg, #3b82f6, #06b6d4)",
  "from-violet-500 to-purple-600": "linear-gradient(135deg, #8b5cf6, #9333ea)",
  "from-green-500 to-emerald-500": "linear-gradient(135deg, #22c55e, #10b981)",
  "from-yellow-500 to-orange-500": "linear-gradient(135deg, #eab308, #f97316)",
  "from-pink-500 to-rose-500": "linear-gradient(135deg, #ec4899, #f43f5e)",
  "from-purple-600 to-violet-500": "linear-gradient(135deg, #9333ea, #8b5cf6)",
};

function resolveGradient(cardColor: string): { gradient: string; topBorder: string } {
  // If it's a CSS gradient value directly
  if (cardColor.startsWith("linear-gradient") || cardColor.startsWith("radial-gradient")) {
    return { gradient: cardColor, topBorder: cardColor };
  }
  // Lookup Tailwind class → CSS gradient
  const resolved = GRADIENT_FALLBACKS[cardColor];
  if (resolved) return { gradient: resolved, topBorder: resolved };
  // Default fallback
  return {
    gradient: "linear-gradient(135deg, #8b5cf6, #9333ea)",
    topBorder: "linear-gradient(135deg, #8b5cf6, #9333ea)",
  };
}

// ── Format time "08:30" → "8:30 AM" ─────────────────────────────────────────────
function formatTime(t: string | null | undefined): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function buildScheduleLabels(service: any): string[] {
  if (service.occurrence && (service.occurrence.includes("\n") || service.occurrence.includes("|") || service.occurrence.includes(";"))) {
    return service.occurrence
      .split(/[\n|;]/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  if (service.occurrence) {
    const hasTime = /\b(AM|PM|am|pm|\d{1,2}:\d{2})\b/.test(service.occurrence);
    if (hasTime) {
      return [service.occurrence.trim()];
    }
    const parts: string[] = [service.occurrence.trim()];
    if (service.startTime) {
      const start = formatTime(service.startTime);
      const end = service.endTime ? ` – ${formatTime(service.endTime)}` : "";
      parts.push(`${start}${end}`);
    }
    return [parts.join(" - ")];
  }

  const parts: string[] = [];
  if (service.serviceDay) {
    parts.push(service.serviceDay);
  }
  if (service.startTime) {
    const start = formatTime(service.startTime);
    const end = service.endTime ? ` – ${formatTime(service.endTime)}` : "";
    parts.push(`${start}${end}`);
  }
  const single = parts.join(" - ");
  return single ? [single] : [];
}

// ── Service type definition ───────────────────────────────────────────────────────
interface ChurchService {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  icon: string;
  iconColor: string;
  cardColor: string;
  badgeColor: string;
  serviceType: string;
  serviceDay?: string;
  occurrence?: string;
  startTime?: string;
  endTime?: string;
  frequency: string;
  location?: string;
  featured: boolean;
  status: string;
  displayOrder: number;
  branch?: { id: string; name: string };
  tags: string[];
}

// ── Comprehensive Multi-language Translation Helpers ──────────────────────────
const SERVICE_TITLES: Record<string, { te: string; hi: string }> = {
  "Sunday Evening Service": { te: "ఆదివారం సాయంత్రపు ఆరాధన", hi: "रविवार संध्याकालीन सेवा" },
  "Sunday Worship & Thursday Prayer": { te: "ఆదివారం ఆరాధన & గురువారం ప్రార్థన", hi: "रविवार आराधना एवं गुरुवार प्रार्थना" },
  "Sunday Worship & Prayer Meetings": { te: "ఆదివారం ఆరాధన & ప్రార్థన కూడికలు", hi: "रविवार आराधना एवं प्रार्थना सभाएं" },
  "Monthly Fasting Prayer": { te: "నెలవారీ ఉపవాస ప్రార్థన", hi: "मासिक उपवास प्रार्थना" },
  "Youth Ministry": { te: "యువజన పరిచర్య", hi: "युवा सेवकाई" },
  "Women's Fellowship": { te: "మహిళా సహవాసం", hi: "महिला संगति" },
  "English Worship": { te: "ఇంగ్లీష్ ఆరాధన", hi: "अंग्रेजी आराधना" },
  "Men's Fellowship": { te: "పురుషుల సహవాసం", hi: "पुरुष संगति" },
  "Bible Study": { te: "బైబిల్ అధ్యయనం", hi: "बाइबिल अध्ययन" },
  "Prayer Meeting": { te: "ప్రార్థన కూడిక", hi: "प्रार्थना सभा" },
};

const SERVICE_DESCRIPTIONS: Record<string, { short: { te: string; hi: string }; long: { te: string; hi: string } }> = {
  "shapur-sunday-service": {
    short: {
      te: "షాపూర్ నగర్‌లో ఉత్సాహభరితమైన ఆరాధన, ప్రార్థన మరియు దేవుని వాక్యాన్ని అనుభవించండి.",
      hi: "शापूर नगर में उत्साहवर्धक आराधना, प्रार्थना और परमेश्वर के वचन का अनुभव करें।",
    },
    long: {
      te: "ప్రతి ఆదివారం సాయంత్రం 6:00 నుండి 9:00 వరకు మరియు ప్రతి శుక్రవారం సాయంత్రం 6:30 నుండి 8:30 వరకు మా షాపూర్ నగర్ బ్రాంచ్‌లో ఉపవాస, స్వస్థత & అభిషేక ఆరాధనలో పాల్గొనండి.",
      hi: "हर रविवार शाम 6:00 से 9:00 बजे तक और हर शुक्रवार शाम 6:30 से 8:30 बजे तक हमारी शापूर नगर शाखा में उपवास, चंगाई और अभिषेक आराधना के लिए शामिल हों।",
    },
  },
  "subhash-nagar-service": {
    short: {
      te: "సుభాష్ నగర్‌లో మా ఉదయకాల ఆరాధనలు మరియు గురువారం సాయంత్రపు ప్రార్థనలో పాల్గొనండి.",
      hi: "सुभाष नगर में हमारी सुबह की आराधना और गुरुवार शाम की प्रार्थना में शामिल हों।",
    },
    long: {
      te: "ఆదివారం ఉదయం జరిగే రెండు ఆరాధనలలో మరియు గురువారం సాయంత్రపు ఉపవాస, స్వస్థత & అభిషేక ఆరాధనలలో దేవుని శక్తిని అనుభవించండి.",
      hi: "रविवार सुबह की दो आराधनाओं और गुरुवार शाम की उपवास, चंगाई और अभिषेक आराधना में परमेश्वर की सामर्थ्य का अनुभव करें।",
    },
  },
  "sunday-worship-service": {
    short: {
      te: "బహదూర్‌పల్లిలో జరిగే మా ఆదివారం ఆరాధన మరియు మంగళవారం ప్రార్థన కూడికలలో దేవుని సన్నిధిని అనుభవించండి.",
      hi: "बहादुरपल्ली में हमारी रविवार आराधना और मंगलवार प्रार्थना सभाओं में परमेश्वर की उपस्थिति का अनुभव करें।",
    },
    long: {
      te: "ప్రతి ఆదివారం దైవిక ఆరాధన మరియు ప్రతి 3వ మంగళవారం సాయంత్రం ఉపవాస, స్వస్థత & అభిషేక ఆరాధనలో పాల్గొనండి. మా ఆరాధనలు తెలుగు, హిందీ, ఇంగ్లీషులలో నిర్వహించబడతాయి.",
      hi: "हर रविवार शक्तिशाली स्तुति-आराधना और हर तीसरे मंगलवार शाम उपवास, चंगाई और अभिषेक आराधना में शामिल हों। हमारी सेवाएं तेलुगु, हिंदी और अंग्रेजी में आयोजित की जाती हैं।",
    },
  },
  "monthly-fasting-prayer": {
    short: {
      te: "దేవుని సన్నిధి కొరకు ప్రతి నెలా నిర్వహించే కలీసియా ఉపవాస ప్రార్థన కూడిక.",
      hi: "परमेश्वर की उपस्थिति पाने के लिए कलीसिया-व्यापी मासिक उपवास एवं प्रार्थना सभा।",
    },
    long: {
      te: "ప్రతి నెలా 2వ సోమవారం షాపూర్ నగర్ ప్రధాన శాఖలో ఉదయం 10:00 నుండి మధ్యాహ్నం 3:00 వరకు ఉపవాసం, మధ్యవర్తిత్వ ప్రార్థన, ఆరాధన మరియు ఆత్మీయ పునరుజ్జీవన కూడికలో పాల్గొనండి.",
      hi: "हर महीने के दूसरे सोमवार को हमारी शापूर नगर मुख्य शाखा में सुबह 10:00 से दोपहर 3:00 बजे तक उपवास, मध्यस्थता प्रार्थना, आराधना और आत्मिक नवीनीकरण के लिए शामिल हों।",
    },
  },
  "youth-ministry": {
    short: {
      te: "క్రీస్తు కొరకు ధైర్యంగా జీవించేందుకు తర్వాతి తరాన్ని బలపరచడం.",
      hi: "मसीह के लिए साहसपूर्वक जीने हेतु अगली पीढ़ी को सशक्त बनाना।",
    },
    long: {
      te: "KCM యూత్ 13-25 సంవత్సరాల వయస్సు గల యువత కొరకు నిర్వహించే ప్రత్యేక పరిచర్య. ప్రతి నెలా 2వ శనివారం సాయంత్రం 6:30 నుండి 8:30 వరకు ఆరాధన, వాక్యం మరియు సహవాసం కొరకు కలుస్తాము.",
      hi: "KCM यूथ 13-25 आयु वर्ग के युवाओं के लिए एक गतिशील सेवकाई है। हम हर महीने के दूसरे शनिवार को शाम 6:30 से 8:30 बजे तक आराधना, वचन और संगति के लिए मिलते हैं।",
    },
  },
  "womens-fellowship": {
    short: {
      te: "ఆత్మీయ సహోదరిత్వం మరియు ఆత్మీయ బలాన్ని కలిసి నిర్మించడం.",
      hi: "एकता, आत्मिक संगति और आत्मिक सामर्थ्य का निर्माण।",
    },
    long: {
      te: "KCM మహిళా సహవాసం ప్రతి నెలా 3వ శనివారం సాయంత్రం 6:30 నుండి 8:30 వరకు ఆరాధన, సాక్ష్యాలు మరియు పరస్పర పరిచర్య కొరకు కూడుకుంటుంది. స్త్రీలందరికీ స్వాగతం.",
      hi: "KCM महिला संगति हर महीने के तीसरे शनिवार को शाम 6:30 से 8:30 बजे तक आराधना, गवाही और एक-दूसरे की सेवकाई के लिए एकत्रित होती है। सभी महिलाओं का स्वागत है।",
    },
  },
  "mens-fellowship": {
    short: {
      te: "షాపూర్ నగర్‌లో ఇంగ్లీష్ స్తుతి, ఆరాధన మరియు బైబిల్ ఉపదేశం.",
      hi: "शापूर नगर में अंग्रेजी स्तुति, आराधना और बाइबिल शिक्षण।",
    },
    long: {
      te: "ప్రతి నెలా 3వ ఆదివారం సాయంత్రం 4:00 నుండి 6:00 వరకు షాపూర్ నగర్‌లో మా ఇంగ్లీష్ ఆరాధనలో పాల్గొనండి. శక్తివంతమైన ఆరాధన మరియు వాక్య సందేశాలను అనుభవించండి.",
      hi: "हर महीने के तीसरे रविवार को शाम 4:00 से 6:00 बजे तक शापूर नगर में हमारी अंग्रेजी आराधना में शामिल हों। शक्तिशाली आराधना और वचन का अनुभव करें।",
    },
  },
};

const LOCATION_NAMES: Record<string, { te: string; hi: string }> = {
  "Shapur Nagar": { te: "షాపూర్ నగర్", hi: "शापूर नगर" },
  "Subhash Nagar": { te: "సుభాష్ నగర్", hi: "सुभाष नगर" },
  "Bahadurpally": { te: "బహదూర్‌పల్లి", hi: "बहादुरपल्ली" },
  "KCM Fellowship Hall": { te: "KCM ఫెలోషిప్ హాల్", hi: "KCM फेलोशिप हॉल" },
  "KCM Main Auditorium": { te: "KCM మెయిన్ ఆడిటోరియం", hi: "KCM मुख्य सभागार" },
};

const TAG_TRANSLATIONS: Record<string, { te: string; hi: string }> = {
  worship: { te: "ఆరాధన", hi: "आराधना" },
  sunday: { te: "ఆదివారం", hi: "रविवार" },
  friday: { te: "శుక్రవారం", hi: "शुक्रवार" },
  thursday: { te: "గురువారం", hi: "गुरुवार" },
  tuesday: { te: "మంగళవారం", hi: "मंगलवार" },
  monday: { te: "సోమవారం", hi: "सोमवार" },
  saturday: { te: "శనివారం", hi: "शनिवार" },
  prayer: { te: "ప్రార్థన", hi: "प्रार्थना" },
  healing: { te: "స్వస్థత", hi: "चंगाई" },
  anointing: { te: "అభిషేకం", hi: "अभिषेक" },
  youth: { te: "యువత", hi: "युवा" },
  fellowship: { te: "సహవాసం", hi: "संगति" },
  women: { te: "మహిళలు", hi: "महिलाएं" },
  men: { te: "పురుషులు", hi: "पुरुष" },
  english: { te: "ఇంగ్లీష్", hi: "अंग्रेजी" },
  fasting: { te: "ఉపవాసం", hi: "उपवास" },
  monthly: { te: "నెలవారీ", hi: "मासिक" },
  intercession: { te: "విజ్ఞాపన", hi: "मध्यस्थता" },
  evening: { te: "సాయంత్రం", hi: "शाम" },
  shapur: { te: "షాపూర్", hi: "शापूर" },
  "subhash-nagar": { te: "సుభాష్ నగర్", hi: "सुभाष नगर" },
};

function translateLocation(loc?: string, lang?: string): string {
  if (!loc) return "";
  if (lang === "te" && LOCATION_NAMES[loc]?.te) return LOCATION_NAMES[loc].te;
  if (lang === "hi" && LOCATION_NAMES[loc]?.hi) return LOCATION_NAMES[loc].hi;
  return loc;
}

function translateTitle(title: string, lang?: string): string {
  if (lang === "te" && SERVICE_TITLES[title]?.te) return SERVICE_TITLES[title].te;
  if (lang === "hi" && SERVICE_TITLES[title]?.hi) return SERVICE_TITLES[title].hi;
  return title;
}

function translateDescription(desc: string | undefined, slug: string, isShort: boolean, lang?: string): string {
  if (!desc) return "";
  const entry = SERVICE_DESCRIPTIONS[slug];
  if (entry) {
    if (lang === "te") return isShort ? entry.short.te : entry.long.te;
    if (lang === "hi") return isShort ? entry.short.hi : entry.long.hi;
  }
  return desc;
}

function translateScheduleBadge(label: string, lang?: string): string {
  if (!label || lang === "en") return label;

  if (lang === "te") {
    return label
      .replace(/Every Sunday \(1st Service\)/gi, "ప్రతి ఆదివారం (1వ ఆరాధన)")
      .replace(/Every Sunday \(2nd Service\)/gi, "ప్రతి ఆదివారం (2వ ఆరాధన)")
      .replace(/Every Sunday/gi, "ప్రతి ఆదివారం")
      .replace(/Every Friday/gi, "ప్రతి శుక్రవారం")
      .replace(/Every Thursday/gi, "ప్రతి గురువారం")
      .replace(/Every 3rd Tuesday/gi, "ప్రతి 3వ మంగళవారం")
      .replace(/Every 3rd Wednesday/gi, "ప్రతి 3వ బుధవారం")
      .replace(/Every Month 2nd Monday/gi, "ప్రతి నెలా 2వ సోమవారం")
      .replace(/2nd Saturday of the month/gi, "నెలలో 2వ శనివారం")
      .replace(/3rd Saturday of the month/gi, "నెలలో 3వ శనివారం")
      .replace(/3rd Sunday of the month/gi, "నెలలో 3వ ఆదివారం")
      .replace(/Fasting, Healing & Anointing Service - "Aradhana"/gi, 'ఉపవాస, స్వస్థత & అభిషేక ఆరాధన - "ఆరాధన"')
      .replace(/Fasting, Healing & Anointing Service/gi, "ఉపవాస, స్వస్థత & అభిషేక ఆరాధన")
      .replace(/Fasting Prayer/gi, "ఉపవాస ప్రార్థన")
      .replace(/Prayer Meeting/gi, "ప్రార్థన కూడిక")
      .replace(/\bat\b/gi, "")
      .replace(/\bAM\b/g, "AM")
      .replace(/\bPM\b/g, "PM");
  }

  if (lang === "hi") {
    return label
      .replace(/Every Sunday \(1st Service\)/gi, "हर रविवार (पहली सेवा)")
      .replace(/Every Sunday \(2nd Service\)/gi, "हर रविवार (दूसरी सेवा)")
      .replace(/Every Sunday/gi, "हर रविवार")
      .replace(/Every Friday/gi, "हर शुक्रवार")
      .replace(/Every Thursday/gi, "हर गुरुवार")
      .replace(/Every 3rd Tuesday/gi, "हर तीसरे मंगलवार")
      .replace(/Every 3rd Wednesday/gi, "हर तीसरे बुधवार")
      .replace(/Every Month 2nd Monday/gi, "हर महीने का दूसरा सोमवार")
      .replace(/2nd Saturday of the month/gi, "महीने का दूसरा शनिवार")
      .replace(/3rd Saturday of the month/gi, "महीने का तीसरा शनिवार")
      .replace(/3rd Sunday of the month/gi, "महीने का तीसरा रविवार")
      .replace(/Fasting, Healing & Anointing Service - "Aradhana"/gi, 'उपवास, चंगाई एवं अभिषेक सेवा - "आराधना"')
      .replace(/Fasting, Healing & Anointing Service/gi, "उपवास, चंगाई एवं अभिषेक सेवा")
      .replace(/Fasting Prayer/gi, "उपवास प्रार्थना")
      .replace(/Prayer Meeting/gi, "प्रार्थना सभा")
      .replace(/\bat\b/gi, "")
      .replace(/\bAM\b/g, "AM")
      .replace(/\bPM\b/g, "PM");
  }

  return label;
}

function translateTag(tag: string, lang?: string): string {
  if (lang === "te" && TAG_TRANSLATIONS[tag]?.te) return TAG_TRANSLATIONS[tag].te;
  if (lang === "hi" && TAG_TRANSLATIONS[tag]?.hi) return TAG_TRANSLATIONS[tag].hi;
  return tag;
}

// ── Memoized Service Card Component ───────────────────────────────────────────
const ServiceCard = memo(function ServiceCard({
  service,
  index,
  isExpanded,
  onToggleExpand,
}: {
  service: ChurchService;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}) {
  const { language, isTelugu, isHindi } = useLanguage();
  const Icon = getIcon(service.icon);
  const { gradient } = resolveGradient(service.cardColor);
  const scheduleLabels = buildScheduleLabels(service);

  const translatedTitle = translateTitle(service.title, language);
  const translatedShortDesc = translateDescription(service.shortDescription || service.description, service.slug, true, language);
  const translatedLongDesc = translateDescription(service.description, service.slug, false, language);
  const translatedLocation = translateLocation(service.location || service.branch?.name, language);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.21, 0.47, 0.32, 0.98] }}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      aria-label={`${translatedTitle} service details`}
      className="services-card group relative bg-white dark:bg-white/[0.02] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-white/[0.06] shadow-sm overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onClick={() => onToggleExpand(service.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggleExpand(service.id);
        }
      }}
    >
      {/* Top Badges: Location & Featured */}
      <div className="absolute top-4 right-4 flex items-center flex-wrap justify-end gap-1.5 z-20">
        {translatedLocation && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/50 shadow-sm backdrop-blur-sm">
            <MapPin className="w-3 h-3 text-violet-600 dark:text-violet-400 shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-none">{translatedLocation}</span>
          </div>
        )}
        {service.featured && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 dark:bg-amber-400/10 dark:text-amber-300 border border-amber-200 dark:border-amber-400/20">
            <Star className="w-3 h-3 fill-current" /> {isTelugu ? "ప్రత్యేకమైనది" : isHindi ? "विशेष" : "Featured"}
          </div>
        )}
      </div>

      {/* Top border glow on hover */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-3xl"
        style={{ background: gradient }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg services-icon"
          style={{ background: gradient }}
        >
          <Icon className="h-8 w-8" style={{ color: service.iconColor || "#ffffff" }} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight group-hover:text-[hsl(var(--primary))] dark:group-hover:text-[hsl(var(--primary))] transition-colors duration-300">
          {translatedTitle}
        </h3>

        {/* Schedule badges */}
        {scheduleLabels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {scheduleLabels.map((label, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold"
                style={{ background: gradient }}
              >
                <span>⏰</span>
                <span>{translateScheduleBadge(label.replace(/^⏰\s*/, ""), language)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-slate-600 dark:text-white/60 leading-relaxed text-sm">
          {translatedShortDesc}
        </p>

        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
                {translatedLongDesc && (
                  <p className="text-slate-500 dark:text-white/50 text-xs leading-relaxed">
                    {translatedLongDesc}
                  </p>
                )}
                {translatedLocation && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/40">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{translatedLocation}</span>
                  </div>
                )}
                {service.branch && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/40">
                    <Globe className="w-3 h-3 shrink-0" />
                    <span>
                      {translateLocation(service.branch.name, language)} {isTelugu ? "శాఖ" : isHindi ? "शाखा" : "Branch"}
                    </span>
                  </div>
                )}
                {service.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 text-[10px] font-medium"
                      >
                        #{translateTag(tag, language)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand hint */}
        <div className="flex items-center gap-1 mt-3 text-xs text-[hsl(var(--primary)/0.7)] font-medium">
          <ChevronRight
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
          />
          <span>
            {isExpanded
              ? isTelugu
                ? "తక్కువ"
                : isHindi
                ? "कम"
                : "Less"
              : isTelugu
              ? "మరిన్ని వివరాలు"
              : isHindi
              ? "अधिक जानकारी"
              : "More info"}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

export default function Services({ initialServices = [] }: { initialServices?: ChurchService[] }) {
  const { t } = useLanguage();
  const [services, setServices] = useState<ChurchService[]>(initialServices);
  const [loading, setLoading] = useState(initialServices.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // ── Fetch published services ────────────────────────────────────────────────────
  const fetchServices = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/services?status=PUBLISHED", {
        cache: "no-store",
        next: { tags: ["services"] },
      } as any);
      if (!res.ok) throw new Error("Failed to load services");
      const data = await res.json();
      setServices(data.services || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialServices.length === 0) {
      fetchServices();
    }
  }, [fetchServices, initialServices]);

  // ── Socket.IO — real-time updates from admin ──────────────────────────────────
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    let socket: any = null;

    const connectSocket = async () => {
      try {
        const { io } = await import("socket.io-client");
        socket = io(socketUrl, { transports: ["websocket", "polling"] });

        socket.on("service.created", () => fetchServices());
        socket.on("service.updated", () => fetchServices());
        socket.on("service.deleted", () => fetchServices());
        socket.on("service.restored", () => fetchServices());
        socket.on("service.archived", () => fetchServices());
        socket.on("service.reordered", () => fetchServices());

        socketRef.current = socket;
      } catch {
        /* Socket.IO not available — polling fallback */
        const interval = setInterval(fetchServices, 30000);
        return () => clearInterval(interval);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [fetchServices]);

  return (
    <section
      id="services"
      className="py-14 sm:py-20 md:py-28 bg-white dark:bg-transparent relative z-10 overflow-hidden transition-colors duration-300"
    >
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[hsl(var(--primary))] mb-3 px-3 py-1.5 rounded-full bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.15)]">
            {t.services.title}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white tracking-tight leading-tight">
            {t.services.title.split(" ").length > 1 ? (
              <>
                {t.services.title.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] bg-clip-text text-transparent">
                  {t.services.title.split(" ").slice(-1)[0]}
                </span>
              </>
            ) : (
              <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] bg-clip-text text-transparent">
                {t.services.title}
              </span>
            )}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-white/60 leading-relaxed px-2">
            {t.services.subtitle}
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary)/0.3)]" />
            <div className="w-8 h-[2px] bg-gradient-to-r from-[hsl(var(--primary)/0.3)] to-[hsl(var(--primary))]" />
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_10px_hsl(var(--primary)/0.4)]" />
            <div className="w-8 h-[2px] bg-gradient-to-l from-[hsl(var(--primary)/0.3)] to-[hsl(var(--primary))]" />
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary)/0.3)]" />
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--primary))]" />
            <p className="text-slate-500 dark:text-white/50 text-sm">Loading services…</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-rose-500 text-sm">{error}</p>
            <button
              onClick={fetchServices}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-sm font-medium hover:bg-[hsl(var(--primary)/0.2)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && (
          <>
            {services.length === 0 ? (
              <div className="text-center py-20 text-slate-400 dark:text-white/30 text-sm">
                No services published yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                <AnimatePresence mode="popLayout">
                  {services.map((service, index) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      index={index}
                      isExpanded={expandedId === service.id}
                      onToggleExpand={handleToggleExpand}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}


        {/* CTA */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20 text-center"
          >
            <p className="text-lg text-slate-600 dark:text-white/60 mb-8 max-w-2xl mx-auto">
              {t.services.ctaDesc}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow duration-300 hover:scale-105 active:scale-95"
            >
              {t.services.cta}
              <span className="text-white/70">→</span>
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
