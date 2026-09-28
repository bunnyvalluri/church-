"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  Quote, 
  ChevronRight, 
  Sparkles, 
  ExternalLink, 
  Heart, 
  ShieldCheck,
  Building2
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useFooterConfig, useFooterNavigation } from "@/hooks/useCmsData";
import type { NavigationItem } from "@/types/cms";
import { IndiaFlag } from "@/components/ui/IndiaFlag";

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
  "Prayer": { te: "ప్రార్థన", hi: "प्रార్థना" },
  "Small Groups": { te: "చిన్న గుంపులు", hi: "छोटे समूह" },
  "Volunteer": { te: "వాలంటీర్", hi: "स्वयंसेवक" },
  "Give": { te: "కానుకలు", hi: "दान दें" },
  "Membership": { te: "సభ్యత్వం", hi: "सदस्यता" },
  "Contact Us": { te: "సంప్రదించండి", hi: "संपर्क करें" },
  "Visit Us": { te: "మమ్మల్ని సందర్శించండి", hi: "हमसे मिलें" },
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
        className="group inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-white transition-all duration-200"
      >
        <ChevronRight className="w-3.5 h-3.5 text-purple-400 opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
        <span className="group-hover:translate-x-0.5 transition-transform duration-200">{label}</span>
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

  const socialLinks = [
    {
      name: "YouTube",
      href: footer?.youtubeUrl || "https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO",
      icon: Youtube,
      className: "bg-red-600/15 border-red-500/30 text-[#FF0000] hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] hover:shadow-red-600/40 shadow-xs",
    },
  ];

  return (
    <footer className="relative bg-[#060813] text-slate-300 border-t border-purple-500/20 overflow-hidden font-sans">
      {/* 🌌 Ambient Luxury Glows */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-[550px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

      {/* Top Gradient Accent Line with subtle glow */}
      <div className="relative h-[2px] w-full bg-gradient-to-r from-transparent via-purple-500/80 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-xs opacity-75" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12 relative z-10">
        
        {/* 🌟 Pre-Footer: Connect & Ministry Quick Action Banner */}
        <div className="mb-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900/60 border border-purple-500/25 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-purple-950/30">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-center lg:text-left space-y-2">
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

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/prayer"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>🙏</span>
                <span>{mounted && language === "te" ? "ప్రార్థన విజ్ఞాపన" : mounted && language === "hi" ? "प्रार्थना अनुरोध" : "Prayer Request"}</span>
              </Link>
              <Link
                href="/ngo/donations"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Heart className="w-4 h-4 text-pink-400" />
                <span>{mounted && language === "te" ? "కానుకలు (80G)" : mounted && language === "hi" ? "दान दें (80G)" : "Donate (80G)"}</span>
              </Link>
              <Link
                href="/locations"
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm border border-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>{mounted && language === "te" ? "శాఖలు" : mounted && language === "hi" ? "शाखाएं" : "Campuses"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 🏛️ Main Footer Columns: 4 (Brand) + 5 (Links) + 3 (Connect) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* 1. Brand & Mission Column (Span 4) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3.5 group">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-purple-500/40 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-1 shadow-lg shadow-purple-600/20 group-hover:border-purple-400 group-hover:scale-105 transition-all duration-300">
                <Image
                  src="/logo.png"
                  alt="Kingdom of Christ Ministries Logo"
                  fill
                  sizes="56px"
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

            {/* Scripture Quote Glass Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md relative hover:border-purple-500/30 transition-colors shadow-xs">
              <Quote className="w-4 h-4 text-purple-400 mb-1.5 opacity-70" />
              <p className="text-xs text-slate-300 italic leading-relaxed font-serif">
                {tagline}
              </p>
            </div>

            {/* Address Micro-Card */}
            {footer?.address && (
              <a
                href={footer.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-purple-500/40 transition-all text-xs text-slate-300 hover:text-white"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                  <MapPin className="h-4 w-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <span className="block leading-relaxed font-medium">{footer.address}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-purple-400 group-hover:text-purple-300 font-bold mt-1.5">
                    <span>
                      {mounted && language === "te"
                        ? "గూగుల్ మ్యాప్‌లో చూడండి"
                        : mounted && language === "hi"
                        ? "गूगल मैप पर देखें"
                        : "View on Google Maps"}
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            )}

            {/* Social Links Row */}
            <div className="pt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2.5">
                {mounted && language === "te" ? "సోషల్ మీడియా" : mounted && language === "hi" ? "सोशल मीडिया" : "Official Socials"}
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group border ${social.className}`}
                    >
                      <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Directory Navigation Columns (Span 5 total - 3 sub-columns) */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* About Group */}
            <div>
              <h4 className="text-white font-extrabold text-xs tracking-[0.2em] uppercase flex items-center gap-2 mb-4 font-outfit">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-xs shadow-purple-500" />
                <span>{sectionLabels.about}</span>
              </h4>
              <ul className="space-y-2.5">
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
              <h4 className="text-white font-extrabold text-xs tracking-[0.2em] uppercase flex items-center gap-2 mb-4 font-outfit">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-xs shadow-indigo-500" />
                <span>{sectionLabels.resources}</span>
              </h4>
              <ul className="space-y-2.5">
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
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-white font-extrabold text-xs tracking-[0.2em] uppercase flex items-center gap-2 mb-4 font-outfit">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-xs shadow-pink-500" />
                <span>{sectionLabels.involved}</span>
              </h4>
              <ul className="space-y-2.5">
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
          </div>

          {/* 3. Connect & Helpline Support Column (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <h4 className="text-white font-extrabold text-xs tracking-[0.2em] uppercase flex items-center gap-2 mb-4 font-outfit">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400" />
                <span>{sectionLabels.connect}</span>
              </h4>
              
              {/* Quick Connect Navigation Links */}
              <ul className="grid grid-cols-2 gap-2 mb-4">
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

            {/* Helpline & Office Phone Cards */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 block mb-1">
                {mounted && language === "te" ? "హెల్ప్‌లైన్ & ఆఫీస్" : mounted && language === "hi" ? "हेल्पलाइन और कार्यालय" : "Helpline & Office"}
              </span>

              <div className="space-y-2">
                {footer?.phones?.map((phone, i) => (
                  <a
                    key={i}
                    href={`tel:${phone.number.replace(/\s/g, "")}`}
                    className="group flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-purple-500/40 transition-all text-xs text-slate-200 hover:text-white"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        i === 0 ? "bg-amber-500/20 text-amber-400" : "bg-purple-500/20 text-purple-400"
                      }`}>
                        <Phone className="h-3 w-3" />
                      </div>
                      <span className="font-bold text-xs whitespace-nowrap tracking-tight">{phone.number}</span>
                    </div>
                    {phone.label && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0 ${
                        i === 0 
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/25" 
                          : "bg-white/5 text-slate-400 border border-white/10"
                      }`}>
                        {phone.label}
                      </span>
                    )}
                  </a>
                ))}
              </div>

              {/* Email Card */}
              {footer?.email && (
                <a
                  href={`mailto:${footer.email}`}
                  className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-purple-500/40 transition-all text-xs text-slate-200 hover:text-white"
                >
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <Mail className="h-3 w-3" />
                  </div>
                  <span className="text-[11px] font-medium break-all leading-tight text-slate-300 group-hover:text-white">
                    {footer.email}
                  </span>
                </a>
              )}

              {/* Statutory Trust Badge */}
              <div className="pt-1">
                <Link
                  href="/about/story#80g"
                  title="View Official Statutory Approvals & 80G Tax-Exemption Certificates"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-[11px] text-purple-200 hover:text-white transition-all group"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold leading-tight">
                    Regd. Society 206/2012 • 80G Certified
                  </span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Legal, Developer Credit & Compliance Bar ── */}
      <div className="border-t border-white/[0.08] bg-black/40">
        <div
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Left group — Copyright + Credits */}
            <div className="flex flex-col items-center lg:items-start gap-2 text-center lg:text-left">
              <p className="text-xs text-slate-400 leading-relaxed">
                {mounted ? copyright : `© ${currentYear} Kingdom of Christ Ministries. All rights reserved.`}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-0.5">
                <a
                  href="https://valluri-rahul-portfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-purple-200 font-bold text-xs tracking-wide transition-all shadow-xs hover:scale-105"
                >
                  <span>✦ Developed by VALLURI RAHUL ✦</span>
                </a>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 select-none">
                  <IndiaFlag className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>India</span>
                </span>
                <Link
                  href="/about/story#80g"
                  title="View Official 80G Tax-Exempt Certificate & Compliance"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-all shadow-xs hover:scale-105 active:scale-95"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>80G Tax-Exempt Certified</span>
                </Link>
              </div>
            </div>

            {/* Right group — Legal links */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-5 gap-y-2 text-xs font-semibold text-slate-400">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                {mounted && language === "te"
                  ? "గోప్యతా విధానం"
                  : mounted && language === "hi"
                  ? "गोपनीयता नीति"
                  : "Privacy Policy"}
              </Link>
              <span className="text-slate-700 select-none">•</span>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                {mounted && language === "te"
                  ? "సేవా నిబంధనలు"
                  : mounted && language === "hi"
                  ? "सेवा की शर्तें"
                  : "Terms of Service"}
              </Link>
              <span className="text-slate-700 select-none">•</span>
              <Link
                href="/about/story"
                className="hover:text-white transition-colors"
              >
                {mounted && language === "te"
                  ? "చరిత్ర & చట్టబద్ధత"
                  : mounted && language === "hi"
                  ? "इतिहास और दस्तावेज"
                  : "ROC & Statutory Docs"}
              </Link>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
