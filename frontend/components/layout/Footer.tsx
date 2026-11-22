"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Quote, 
  ChevronRight, 
  Sparkles, 
  ExternalLink, 
  Heart, 
  ShieldCheck,
  Building2,
  HandHeart
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useFooterConfig, useFooterNavigation } from "@/hooks/useCmsData";
import type { NavigationItem } from "@/types/cms";
import { IndiaFlag } from "@/components/ui/IndiaFlag";

// Authentic Official YouTube Icon
function YouTubeLogoIcon({ className = "w-5 h-5 shrink-0" }: { className?: string }) {
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

const LINK_MAP: Record<string, { te: string; hi: string }> = {
  "/about/story": { te: "మా కథ", hi: "हमारी कहानी" },
  "/about/leadership": { te: "నాయకత్వం", hi: "नेतृत्व" },
  "/about/beliefs": { te: "మా నమ్మకాలు", hi: "हमारे विश्वास" },
  "/about/ministries": { te: "పరిచర్యలు", hi: "मंत्रालय" },
  "/about/mission": { te: "ధ్యేయం & దర్శనం", hi: "मिशन और विजन" },
  "/sermons": { te: "ప్రసంగాలు", hi: "प्रवचन" },
  "/events": { te: "కార్యక్రమాలు", hi: "कार्यक्रम" },
  "/prayer": { te: "ప్రార్థన", hi: "प्रार्थना" },
  "/get-involved/small-groups": { te: "చిన్న గుంపులు", hi: "छोटे समूह" },
  "/get-involved/volunteer": { te: "వాలంటీర్", hi: "स्वयंसेवक" },
  "/give": { te: "కానుకలు", hi: "दान दें" },
  "/ngo/donations": { te: "కానుకలు (80G)", hi: "दान दें (80G)" },
  "/membership": { te: "సభ్యత్వం", hi: "सदस्यता" },
  "/contact": { te: "సంప్రదించండి", hi: "संपर्क करें" },
  "#contact": { te: "సంప్రదించండి", hi: "संपर्क करें" },
  "#about": { te: "మమ్మల్ని సందర్శించండి", hi: "हमसे मिलें" },
  "#services": { te: "ఆరాధన సమయాలు", hi: "सेवा का समय" },
  "/locations": { te: "ప్రాంతాలు", hi: "स्थान" },
  "Our Story": { te: "మా కథ", hi: "हमारी कहानी" },
  "Leadership": { te: "నాయకత్వం", hi: "नेतृत्व" },
  "Our Beliefs": { te: "మా నమ్మకాలు", hi: "हमारे विश्वास" },
  "Ministries": { te: "పరిచర్యలు", hi: "मंत्रालय" },
  "Mission": { te: "ధ్యేయం & దర్శనం", hi: "मिशन और विजन" },
  "Sermons": { te: "ప్రసంగాలు", hi: "प्रवचन" },
  "Events": { te: "కార్యక్రమాలు", hi: "कार्यक्रम" },
  "Prayer": { te: "ప్రార్థన", hi: "प्रार्थना" },
  "Small Groups": { te: "చిన్న గుంపులు", hi: "छोटे समूह" },
  "Volunteer": { te: "వాలంటీర్", hi: "स्वयंसेवक" },
  "Give": { te: "కానుకలు", hi: "दान दें" },
  "Membership": { te: "సభ్యత్వం", hi: "सदस्यता" },
  "Contact Us": { te: "సంప్రదించండి", hi: "संपर्क करें" },
  "Visit Us": { te: "మమ్మల్ని సందర్శించండి", hi: "हमసే మిలే" },
  "Services": { te: "ఆరాధన సమయాలు", hi: "सेवा का समय" },
  "Locations": { te: "ప్రాంతాలు", hi: "स्थान" },
};

// ── Nav link resolver with micro-interaction ────────────────────────────────
function NavLink({
  item,
  resolveHref,
  language,
}: {
  item: NavigationItem;
  resolveHref: (href: string, label?: string) => string;
  language: string;
}) {
  const trans = LINK_MAP[item.href] || LINK_MAP[item.label];
  const label =
    language === "te"
      ? item.labelTe || trans?.te || item.label
      : language === "hi"
      ? item.labelHi || trans?.hi || item.label
      : item.label;

  const targetHref = resolveHref(item.href, item.label);

  return (
    <li>
      <Link
        href={targetHref}
        target={item.openInNew ? "_blank" : undefined}
        rel={item.openInNew ? "noopener noreferrer" : undefined}
        className="group inline-flex items-center gap-2 text-xs sm:text-[13px] text-slate-400 hover:text-white transition-colors duration-200 py-0.5"
      >
        <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-purple-400 group-hover:scale-125 transition-all duration-200 shrink-0" />
        <span className="group-hover:translate-x-0.5 transition-transform duration-200 font-medium">{label}</span>
      </Link>
    </li>
  );
}

// ── Main Premium Footer Component ─────────────────────────────────────────────
export default function Footer() {
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname() || "/";
  const isHomePage = pathname === "/";

  const { data: footer } = useFooterConfig();
  const { navigation } = useFooterNavigation();

  const resolveHref = (href: string, label?: string) => {
    if (
      label?.toLowerCase() === "contact us" ||
      label === "సంప్రదించండి" ||
      label === "संपर्क करें" ||
      href === "#contact" ||
      href === "/contact"
    ) {
      return "/contact";
    }
    return href.startsWith("/") ? href : isHomePage ? href : `/${href}`;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentYear = new Date().getFullYear();
  const copyright =
    footer?.copyright ??
    (mounted && language === "te"
      ? `© ${currentYear} కింగ్డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్. సర్వ హక్కులు ప్రత్యేకించబడ్డాయి.`
      : mounted && language === "hi"
      ? `© ${currentYear} किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज। सर्वाधिकार सुरक्षित।`
      : `© ${currentYear} Kingdom of Christ Ministries. All rights reserved.`);

  const tagline =
    mounted && language === "te"
      ? footer?.taglineTe || '"కాలము సంభవమైయున్నది, దేవునిరాజ్యము సమీపించియున్నది, మారుమనస్సు పొంది సువార్త నమ్ముడి." — మార్కు 1:15'
      : mounted && language === "hi"
      ? (footer as any)?.taglineHi || '"समय पूरा हो गया है, और परमेश्वर का राज्य निकट आ गया है; मन फिराओ और सुसमाचार पर विश्वास करो।" — मरकुस 1:15'
      : footer?.tagline ?? '"Time is fulfilled, and the Kingdom of God is at hand; repent and believe in the Gospel." — Mark 1:15';

  const sectionLabels = {
    about: t?.links?.about || "About",
    resources: t?.links?.resources || "Resources",
    involved: t?.links?.getInvolved || "Get Involved",
    connect: t?.links?.connect || "Connect",
  };

  const viewOnMapsText =
    mounted && language === "te"
      ? "గూగుల్ మ్యాప్‌లో చూడండి"
      : mounted && language === "hi"
      ? "गूगल मैप पर देखें"
      : "View on Google Maps";

  const officialSocialsText =
    mounted && language === "te"
      ? "సోషల్ మీడియా"
      : mounted && language === "hi"
      ? "सोशल मीडिया"
      : "Official Broadcasts";

  return (
    <footer className="relative bg-[#060813] text-slate-300 border-t border-purple-500/20 overflow-hidden font-sans">
      {/* 🌌 Ambient Luxury Glows */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/12 rounded-full blur-[140px] pointer-events-none contain-paint" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-[550px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none contain-paint" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

      {/* Top Gradient Accent Line with subtle glow */}
      <div className="relative h-[2px] w-full bg-gradient-to-r from-transparent via-purple-500/80 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-xs opacity-75" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12 relative z-10">
        
        {/* 🌟 Pre-Footer: Connect & Ministry Quick Action Banner */}
        <div className="mb-16 p-6 sm:p-8 lg:p-9 rounded-3xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900/60 border border-purple-500/25 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-purple-950/30">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-center lg:text-left space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-black uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>
                  {mounted && language === "te"
                    ? "దేవుని దైవిక సంకల్పం"
                    : mounted && language === "hi"
                    ? "ईश्वरीय उद्देश्य में जुड़ें"
                    : "Step Into Divine Purpose"}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-outfit">
                {mounted && language === "te"
                  ? "మాతో కలిసి పరిచర్యలో పాలుపంచుకోండి"
                  : mounted && language === "hi"
                  ? "प्रार्थना या सहभागिता के लिए हमसे जुड़ें"
                  : "Partner with Us in Prayer & Ministry"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
                {mounted && language === "te"
                  ? "హైదరాబాద్ మరియు పరిసర ప్రాంతాలలో క్రీస్తు ప్రేమను ప్రకటించడానికి, ఆరాధనలు మరియు సేవా కార్యక్రమాల్లో చేరండి."
                  : mounted && language === "hi"
                  ? "हैदराबाद में मसीह के प्रेम को साझा करने और जीवनों को रूपांतरित करने के लिए हमारे साथ जुड़ें।"
                  : "Experience vibrant Sunday services, prayer cells, and community outreach across Hyderabad."}
              </p>
            </div>

            {/* ── Responsive Action Hierarchy: High-Conversion Quick Actions ── */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
              {/* Primary Action: Prayer Request */}
              <Link
                href="/prayer"
                aria-label="Submit a prayer request"
                className="flex-1 sm:flex-none h-11 sm:h-12 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all hover:scale-[1.02] sm:hover:scale-105 active:scale-95 flex items-center justify-center gap-2 select-none shrink-0"
              >
                <HandHeart className="w-4 h-4 text-white shrink-0" />
                <span className="whitespace-nowrap font-bold">
                  {mounted && language === "te"
                    ? "ప్రార్థన విజ్ఞాపన"
                    : mounted && language === "hi"
                    ? "प्रार्थना अनुरोध"
                    : "Prayer Request"}
                </span>
              </Link>

              {/* Secondary Action: Donate (80G) */}
              <Link
                href="/ngo/donations"
                aria-label="Donate to KCM NGO (80G Tax Exempt)"
                className="flex-1 sm:flex-none h-11 sm:h-12 px-5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-100 hover:text-white font-bold text-xs sm:text-sm border border-rose-500/30 transition-all hover:scale-[1.02] sm:hover:scale-105 active:scale-95 flex items-center justify-center gap-2 select-none shrink-0 shadow-xs"
              >
                <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="whitespace-nowrap font-bold">
                  {mounted && language === "te" ? (
                    <>
                      <span className="sm:hidden">కానుకలు</span>
                      <span className="hidden sm:inline">కానుకలు (80G)</span>
                    </>
                  ) : mounted && language === "hi" ? (
                    <>
                      <span className="sm:hidden">दान दें</span>
                      <span className="hidden sm:inline">दान दें (80G)</span>
                    </>
                  ) : (
                    <>
                      <span className="sm:hidden">Donate</span>
                      <span className="hidden sm:inline">Donate (80G)</span>
                    </>
                  )}
                </span>
              </Link>

              {/* Tertiary Action: Campuses */}
              <Link
                href="/locations"
                aria-label="View our church branch locations"
                className="flex-1 sm:flex-none h-11 sm:h-12 px-5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.12] text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-white/15 transition-all hover:scale-[1.02] sm:hover:scale-105 active:scale-95 flex items-center justify-center gap-2 select-none shrink-0"
              >
                <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="whitespace-nowrap font-bold">
                  {mounted && language === "te"
                    ? "శాఖలు"
                    : mounted && language === "hi"
                    ? "शाखाएं"
                    : "Campuses"}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* 🏛️ Main Footer Columns: Perfectly Balanced 4 + 4 + 4 Grid (Zero Empty Space) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
          
          {/* ── 1. Brand & Mission Column (Span 4) ── */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3.5 group">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-purple-500/40 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-1 shadow-lg shadow-purple-600/20 group-hover:border-purple-400 group-hover:scale-105 transition-all duration-300">
                <Image
                  src="/logo.png"
                  alt="Kingdom of Christ Ministries Logo"
                  fill
                  sizes="56px"
                  loading="lazy"
                  decoding="async"
                  quality={80}
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg sm:text-xl leading-tight text-white tracking-tight group-hover:text-purple-300 transition-colors font-outfit">
                  Kingdom of Christ
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  MINISTRIES • OFFICIAL
                </span>
              </div>
            </Link>

            {/* Scripture Quote Card */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-purple-500/30 transition-all shadow-xs group">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Quote className="w-4 h-4" />
              </div>
              <p className="flex-1 text-xs text-slate-300 italic leading-relaxed font-serif pt-0.5">
                {tagline}
              </p>
            </div>

            {/* Address Micro-Card */}
            {footer?.address && (
              <a
                href={footer.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-500/40 transition-all text-xs text-slate-300 hover:text-white shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 group-hover:bg-purple-500/20 transition-all">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <span className="block leading-relaxed font-medium text-slate-300 group-hover:text-white transition-colors">{footer.address}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-purple-400 group-hover:text-purple-300 font-bold mt-1.5">
                    <span>{viewOnMapsText}</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            )}

            {/* Social Broadcast Badge */}
            <div className="pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                {officialSocialsText}
              </span>
              <a
                href={footer?.youtubeUrl || "https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Channel"
                className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold transition-all hover:scale-[1.02] shadow-xs group"
              >
                <YouTubeLogoIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform drop-shadow-xs" />
                <span>Watch Live Sermons & Worship</span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </a>
            </div>
          </div>

          {/* ── 2. Directory Navigation (Span 4) — Balanced 2x2 Layout ── */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-x-6 gap-y-7 pt-1">
            {/* About Group */}
            <div>
              <h4 className="text-white font-extrabold text-xs tracking-[0.18em] uppercase flex items-center gap-2 mb-3.5 font-outfit">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-xs shadow-purple-400" />
                <span>{sectionLabels.about}</span>
              </h4>
              <ul className="space-y-2">
                {navigation.about?.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    resolveHref={resolveHref}
                    language={language}
                  />
                ))}
              </ul>
            </div>

            {/* Resources Group */}
            <div>
              <h4 className="text-white font-extrabold text-xs tracking-[0.18em] uppercase flex items-center gap-2 mb-3.5 font-outfit">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-xs shadow-purple-400" />
                <span>{sectionLabels.resources}</span>
              </h4>
              <ul className="space-y-2">
                {navigation.resources?.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    resolveHref={resolveHref}
                    language={language}
                  />
                ))}
              </ul>
            </div>

            {/* Get Involved Group */}
            <div>
              <h4 className="text-white font-extrabold text-xs tracking-[0.18em] uppercase flex items-center gap-2 mb-3.5 font-outfit">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-xs shadow-purple-400" />
                <span>{sectionLabels.involved}</span>
              </h4>
              <ul className="space-y-2">
                {navigation.involved?.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    resolveHref={resolveHref}
                    language={language}
                  />
                ))}
              </ul>
            </div>

            {/* Connect Group */}
            <div>
              <h4 className="text-white font-extrabold text-xs tracking-[0.18em] uppercase flex items-center gap-2 mb-3.5 font-outfit">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-xs shadow-purple-400" />
                <span>{sectionLabels.connect}</span>
              </h4>
              <ul className="space-y-2">
                {navigation.connect?.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    resolveHref={resolveHref}
                    language={language}
                  />
                ))}
              </ul>
            </div>
          </div>

          {/* ── 3. Helpline, Pastoral Office & Accreditations (Span 4) ── */}
          <div className="lg:col-span-4 space-y-3.5 pt-1">
            <div>
              <h4 className="text-white font-extrabold text-xs tracking-[0.18em] uppercase flex items-center gap-2 mb-1.5 font-outfit">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400" />
                <span>
                  {mounted && language === "te"
                    ? "హెల్ప్‌లైన్ & ఆఫీస్"
                    : mounted && language === "hi"
                    ? "हेल्पलाइन और कार्यालय"
                    : "Helpline & Office"}
                </span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {mounted && language === "te"
                  ? "ప్రార్థన మరియు కౌన్సెలింగ్ కొరకు మా పాస్టర్స్ మరియు ఆఫీస్ సిబ్బంది అందుబాటులో ఉంటారు."
                  : mounted && language === "hi"
                  ? "प्रार्थना सहायता और परामर्श के लिए हमारे पादरी और कार्यालय से संपर्क करें।"
                  : "Direct pastoral support, emergency prayer cell, and church office guidance."}
              </p>
            </div>

            <div className="space-y-2">
              {footer?.phones?.map((phone, i) => (
                <a
                  key={i}
                  href={`tel:${phone.number.replace(/\s/g, "")}`}
                  className="group flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-500/40 transition-all text-xs text-slate-200 hover:text-white shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      i === 0 
                        ? "bg-amber-500/15 border border-amber-500/25 text-amber-400" 
                        : "bg-purple-500/15 border border-purple-500/25 text-purple-400"
                    }`}>
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm tracking-tight text-white group-hover:text-purple-200 transition-colors">
                      {phone.number}
                    </span>
                  </div>
                  {phone.label && (
                    <span className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg font-semibold shrink-0 tracking-wide uppercase ${
                      i === 0 
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" 
                        : "bg-white/5 text-slate-300 border border-white/10"
                    }`}>
                      {phone.label}
                    </span>
                  )}
                </a>
              ))}

              {/* Email Card */}
              {footer?.email && (
                <a
                  href={`mailto:${footer.email}`}
                  className="group flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-500/40 transition-all text-xs text-slate-200 hover:text-white shadow-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 text-purple-400 flex items-center justify-center shrink-0">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium break-all leading-tight text-slate-300 group-hover:text-white transition-colors">
                    {footer.email}
                  </span>
                </a>
              )}

              {/* Statutory Trust Badge */}
              <div className="pt-0.5">
                <Link
                  href="/about/story#statutory"
                  title="View Official Statutory Approvals & 80G Tax-Exemption Certificates"
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 hover:border-purple-500/40 text-xs text-purple-200 hover:text-white transition-all group cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold leading-tight">
                    Regd. Society 206/2012 • 80G Certified
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 ml-auto opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Legal, Developer Credit & Compliance Bar (Pixel-Perfect Alignment) ── */}
      <div className="border-t border-white/[0.08] bg-black/50 backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-28 sm:pb-7">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Left: Copyright & Location indicator */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs text-slate-400">
              <span>{mounted ? copyright : `© ${currentYear} Kingdom of Christ Ministries. All rights reserved.`}</span>
              <span className="hidden sm:inline text-slate-600 select-none">•</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-slate-300">
                <IndiaFlag className="w-3.5 h-3.5 shrink-0" />
                <span>Hyderabad, India</span>
              </span>
            </div>

            {/* Right: Legal links & Developer Credit cleanly aligned on a single baseline */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-4 gap-y-2 text-xs font-medium text-slate-400">
              <Link href="/privacy" className="hover:text-purple-300 transition-colors">
                {mounted && language === "te" ? "గోప్యతా విధానం" : mounted && language === "hi" ? "गोपनीयता नीति" : "Privacy Policy"}
              </Link>
              <span className="text-slate-600 select-none">•</span>
              <Link href="/terms" className="hover:text-purple-300 transition-colors">
                {mounted && language === "te" ? "సేవా నిబంధనలు" : mounted && language === "hi" ? "सेवा की शर्तें" : "Terms of Service"}
              </Link>
              <span className="text-slate-600 select-none">•</span>
              <Link href="/about/story#statutory" className="hover:text-purple-300 transition-colors">
                {mounted && language === "te" ? "చట్టబద్ధత & పత్రాలు" : mounted && language === "hi" ? "दस्तावेज और प्रमाणन" : "ROC & Statutory Docs"}
              </Link>
              <span className="hidden sm:inline text-slate-600 select-none">•</span>
              <a
                href="https://valluri-rahul-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 hover:border-purple-400/50 text-purple-300 hover:text-purple-200 text-xs font-bold tracking-wide transition-all shadow-xs hover:scale-105 active:scale-95"
                title="Designed & Developed by VALLURI RAHUL"
              >
                <span>✦ Developed by VALLURI RAHUL ✦</span>
              </a>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
