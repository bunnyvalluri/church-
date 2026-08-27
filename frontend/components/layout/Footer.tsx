"use client";

import Image from "next/image";
import Link from "next/link";
import { Youtube, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";
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
  "/membership": { te: "సభ్యత్వం", hi: "सदस्यता" },
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
  "Visit Us": { te: "మమ్మల్ని సందర్శించండి", hi: "हमसे मिलें" },
  "Services": { te: "ఆరాధన సమయాలు", hi: "सेवा का समय" },
  "Locations": { te: "ప్రాంతాలు", hi: "स्थान" },
};

// ── Nav link resolver ─────────────────────────────────────────────────────────
function NavLink({
  item,
  resolveHref,
  language,
}: {
  item: NavigationItem;
  resolveHref: (href: string) => string;
  language: string;
}) {
  const trans = LINK_MAP[item.href] || LINK_MAP[item.label];
  const label =
    language === "te"
      ? item.labelTe || trans?.te || item.label
      : language === "hi"
      ? item.labelHi || trans?.hi || item.label
      : item.label;

  return (
    <li>
      <Link
        href={resolveHref(item.href)}
        target={item.openInNew ? "_blank" : undefined}
        rel={item.openInNew ? "noopener noreferrer" : undefined}
        className="hover:text-[hsl(var(--primary))] transition-colors"
      >
        {label}
      </Link>
    </li>
  );
}

// ── Footer Skeleton ────────────────────────────────────────────────────────────
function FooterSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
      <div className="lg:col-span-1 space-y-4">
        <div className="w-48 h-16 bg-slate-800 rounded-lg" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-800 rounded w-5/6" />
          <div className="h-3 bg-slate-800 rounded w-4/5" />
        </div>
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-5 bg-slate-800 rounded w-24" />
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-3 bg-slate-900 rounded w-3/4" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Main Footer Component ─────────────────────────────────────────────────────
export default function Footer() {
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname() || "/";
  const isHomePage = pathname === "/";

  const { data: footer, loading: footerLoading } = useFooterConfig();
  const { navigation, loading: navLoading } = useFooterNavigation();

  const loading = footerLoading || navLoading;

  const resolveHref = (href: string) =>
    href.startsWith("/") ? href : isHomePage ? href : `/${href}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentYear = new Date().getFullYear();
  const copyright =
    footer?.copyright ??
    (mounted && language === "te"
      ? `© ${currentYear} కింగ్డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్. అన్ని హక్కులు ప్రత్యేకించబడినవి.`
      : mounted && language === "hi"
      ? `© ${currentYear} किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज। सर्वाधिकार सुरक्षित।`
      : `© ${currentYear} Kingdom of Christ Ministries. All rights reserved.`);

  const tagline =
    mounted && language === "te"
      ? footer?.taglineTe || 'కాలము సంభవమైయున్నది, దేవునిరాజ్యము సమీపించియున్నది, మారుమనస్సు పొంది సువార్త నమ్ముడి. — మార్కు 1:15'
      : mounted && language === "hi"
      ? (footer as any)?.taglineHi || 'समय पूरा हो गया है, और परमेश्वर का राज्य निकट आ गया है; मन फिराओ और सुसमाचार पर विश्वास करो। — मरकुस 1:15'
      : footer?.tagline ?? '"Time is fulfilled, and the Kingdom of God is at hand." — Mark 1:15';

  // Footer nav section labels (from translation or defaults)
  const sectionLabels = {
    about: t.links.about,
    resources: t.links.resources,
    involved: t.links.getInvolved,
    connect: t.links.connect,
  };

  return (
    <footer className="relative bg-slate-950 dark:bg-black/40 dark:backdrop-blur-2xl text-slate-300 border-t border-white/10 dark:border-white/5">
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--primary-gradient-start))] to-[hsl(var(--primary-gradient-end))]" />

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <a href="/" className="flex items-center space-x-3 mb-6">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/30 bg-white flex-shrink-0 flex items-center justify-center shadow-lg">
                  <Image
                    src="/logo.png"
                    alt="Kingdom of Christ Ministries Logo"
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-tight text-white">
                    Kingdom of Christ Ministries
                  </span>
                  <span className="text-xs text-purple-300 font-semibold tracking-wider">
                    KCM • Official Website
                  </span>
                </div>
              </a>

              {/* Tagline */}
              <p className="text-gray-400 mb-2 text-sm leading-relaxed">{tagline}</p>

              {/* Address link */}
              {footer?.address && (
                <a
                  href={footer.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[hsl(var(--primary))] mb-6 flex items-start gap-2 hover:text-[hsl(var(--primary-gradient-end))] transition-colors mt-3"
                >
                  <MapPin className="h-5 w-5 flex-shrink-0" />
                  <span>{footer.address}</span>
                </a>
              )}

              {/* Social Links */}
              <div className="flex gap-3 mt-4 flex-wrap">
                {footer?.youtubeUrl && (
                  <a
                    href={footer.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#FF0000]/40 hover:brightness-110 group"
                  >
                    <Youtube className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[360deg]" />
                  </a>
                )}
                {footer?.facebookUrl && (
                  <a
                    href={footer.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/40 hover:brightness-110 group"
                  >
                    <Facebook className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[360deg]" />
                  </a>
                )}
                {footer?.twitterUrl && (
                  <a
                    href={footer.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter / X"
                    className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/20 hover:brightness-125 group border border-white/20"
                  >
                    <Twitter className="h-4 w-4 transition-transform duration-500 group-hover:rotate-[360deg]" />
                  </a>
                )}
              </div>
            </div>

            {/* Dynamic Nav Link Groups */}
            {(Object.entries(navigation) as [keyof typeof navigation, NavigationItem[]][]).map(
              ([key, items]) => (
                <div key={key}>
                  <h3 className="text-white font-bold text-lg mb-6">
                    {sectionLabels[key] ?? key}
                  </h3>
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <NavLink
                        key={item.id}
                        item={item}
                        resolveHref={resolveHref}
                        language={language}
                      />
                    ))}
                  </ul>

                  {/* Connect column — add contact details below links */}
                  {key === "connect" && (
                    <div className="mt-6 pt-6 border-t border-gray-800">
                      {footer?.phones?.map((phone, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <Phone className={`h-4 w-4 ${i === 0 ? "text-[hsl(var(--primary))]" : "opacity-0"}`} />
                          <a
                            href={`tel:${phone.number.replace(/\s/g, "")}`}
                            className="hover:text-[hsl(var(--primary))] transition-colors block"
                          >
                            {phone.number}
                            {phone.label && (
                              <span className="text-xs text-gray-400 dark:text-gray-300 font-medium ml-1">({phone.label})</span>
                            )}
                          </a>
                        </div>
                      ))}
                      {footer?.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Mail className="h-4 w-4 text-[hsl(var(--primary))]" />
                          <a
                            href={`mailto:${footer.email}`}
                            className="hover:text-[hsl(var(--primary))] transition-colors"
                          >
                            {footer.email}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div
          className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-5"
          style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 1.25rem))" }}
        >
          {/* Mobile: vertical stack · Desktop: horizontal space-between */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">

            {/* Left group — copyright + credit + India badge */}
            <div
              className="flex flex-col items-center md:items-start gap-1.5 min-w-0 text-center md:text-left"
              suppressHydrationWarning
            >
              {/* Copyright — split so it wraps on 320px without clipping */}
              <p className="text-sm text-gray-400 leading-snug break-words overflow-wrap-anywhere w-full">
                {mounted
                  ? copyright
                  : (
                    <>
                      <span>© {currentYear} Kingdom of Christ Ministries.</span>
                      <span className="sm:hidden"><br /></span>
                      <span className="hidden sm:inline"> </span>
                      <span>All rights reserved.</span>
                    </>
                  )
                }
              </p>

              {/* Developer credit + India badge — inline on all sizes */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <a
                  href="https://valluri-rahul-portfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-sm tracking-wider transition-colors duration-200 text-purple-400 hover:text-purple-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
                >
                  ✦ Developed by VALLURI RAHUL. ✦
                </a>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 select-none flex-shrink-0">
                  <IndiaFlag className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>India</span>
                </span>
              </div>
            </div>

            {/* Right group — legal links */}
            <div className="flex items-center justify-center md:justify-end gap-4 sm:gap-6 text-sm font-medium flex-shrink-0">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-purple-400 dark:hover:text-purple-300 transition-colors focus-visible:outline-none focus-visible:underline"
              >
                {mounted && language === "te"
                  ? "గోప్యతా విధానం"
                  : mounted && language === "hi"
                  ? "गोपनीयता नीति"
                  : "Privacy Policy"}
              </Link>
              <span className="text-gray-700 select-none" aria-hidden="true">·</span>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-purple-400 dark:hover:text-purple-300 transition-colors focus-visible:outline-none focus-visible:underline"
              >
                {mounted && language === "te"
                  ? "సేవా నిబంధనలు"
                  : mounted && language === "hi"
                  ? "सेवा की शर्तें"
                  : "Terms of Service"}
              </Link>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
