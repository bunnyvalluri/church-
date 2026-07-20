/**
 * hooks/useCmsData.ts
 * Custom hooks for fetching CMS data with SWR-style caching, error handling, and retry logic.
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  HeroContent,
  SiteStatistic,
  SiteContact,
  FooterConfig,
  FooterNavGroups,
  NavigationItem,
  AboutConfig,
  Pastor,
} from "@/types/cms";

// ── Generic fetch hook ─────────────────────────────────────────────────────────

interface UseCmsFetchOptions<T> {
  revalidateMs?: number; // How often to recheck (0 = no revalidation)
  initialData?: T; // Initial data from server component to bypass initial fetch loading state
}

export function useCmsFetch<T>(
  url: string,
  fallback: T,
  options: UseCmsFetchOptions<T> = {}
): { data: T; loading: boolean; error: string | null; refetch: () => void } {
  const { revalidateMs = 60000, initialData } = options;
  const [data, setData] = useState<T>(initialData ?? fallback);
  const [loading, setLoading] = useState(initialData === undefined);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);

  const fetch_ = useCallback(async (force = false) => {
    // Serve from cache if valid
    if (!force && cacheRef.current) {
      const age = Date.now() - cacheRef.current.timestamp;
      if (age < revalidateMs) {
        setData(cacheRef.current.data);
        setLoading(false);
        return;
      }
    }

    try {
      setError(null);
      const res = await fetch(url, {
        headers: { "Cache-Control": "no-cache" },
        next: { revalidate: 60 },
      } as RequestInit);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const result = json.data ?? fallback;

      cacheRef.current = { data: result, timestamp: Date.now() };
      setData(result);
    } catch (err: any) {
      console.error(`[useCmsFetch] ${url}:`, err);
      setError(err.message || "Failed to load content");
      // Keep showing cached or fallback data
      if (!cacheRef.current) setData(fallback);
    } finally {
      setLoading(false);
    }
  }, [url, fallback, revalidateMs]);

  useEffect(() => {
    // If we have initial data, we don't immediately fetch on mount unless it's a revalidation strategy, 
    // but for now, we just skip it to prevent waterfalls.
    if (initialData === undefined) {
      fetch_();
    }
  }, [fetch_, initialData]);

  return { data, loading, error, refetch: () => fetch_(true) };
}

// ── Hero Hook ──────────────────────────────────────────────────────────────────

export const HERO_FALLBACK: HeroContent = {
  id: "hero",
  headline: "Welcome to Kingdom of Christ",
  subheadline: "Ministries",
  subtitle: "A place of Love, Faith, and Miracles",
  badgeText: "We are here for you 24/7",
  ctaPrimaryText: "Join Worship",
  ctaPrimaryHref: "#services",
  ctaSecondaryText: "Watch Sermons",
  ctaSecondaryHref: "#sermons",
  ctaTertiaryText: "Prayer Request",
  ctaTertiaryHref: "/prayer",
  backgroundImageUrl: null,
  backgroundImageId: null,
  backgroundVideoUrl: null,
  backgroundType: "gradient",
  isActive: true,
  updatedById: null,
  updatedAt: new Date().toISOString(),
};

export function useHeroContent(initialData?: HeroContent) {
  return useCmsFetch<HeroContent>("/api/cms/hero", HERO_FALLBACK, { initialData });
}

// ── Statistics Hook ────────────────────────────────────────────────────────────

export const STATS_FALLBACK: SiteStatistic[] = [
  {
    id: "fallback-1",
    key: "members",
    label: "Members",
    labelTe: "సభ్యులు",
    labelHi: "सदस्य",
    value: "1000+",
    icon: "Users",
    colorScheme: "violet",
    autoCompute: false,
    computeFrom: null,
    displayOrder: 0,
    isActive: true,
    updatedById: null,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    key: "volunteers",
    label: "Volunteers",
    labelTe: "స్వచ్ఛంద సేవకులు",
    labelHi: "स्वयंसेवक",
    value: "150+",
    icon: "HeartHandshake",
    colorScheme: "emerald",
    autoCompute: false,
    computeFrom: null,
    displayOrder: 1,
    isActive: true,
    updatedById: null,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-3",
    key: "years",
    label: "Years of Ministry",
    labelTe: "సంవత్సరాల పరిచర్య",
    labelHi: "मंत्रालय के वर्ष",
    value: "25+",
    icon: "Award",
    colorScheme: "amber",
    autoCompute: false,
    computeFrom: null,
    displayOrder: 2,
    isActive: true,
    updatedById: null,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-4",
    key: "programs",
    label: "Community Programs",
    labelTe: "సామాజిక కార్యక్రమాలు",
    labelHi: "सामुदायिक कार्यक्रम",
    value: "100+",
    icon: "BookOpen",
    colorScheme: "rose",
    autoCompute: false,
    computeFrom: null,
    displayOrder: 3,
    isActive: true,
    updatedById: null,
    updatedAt: new Date().toISOString(),
  },
];

export function useStatistics(initialData?: SiteStatistic[]) {
  const { data, loading, error, refetch } = useCmsFetch<SiteStatistic[]>(
    "/api/cms/statistics",
    STATS_FALLBACK,
    { initialData }
  );
  return { statistics: data, loading, error, refetch };
}

// ── Contact Hook ───────────────────────────────────────────────────────────────

export const CONTACT_FALLBACK: SiteContact[] = [
  {
    id: "fallback-shapur",
    branchKey: "shapur",
    branchName: "Shapur Nagar",
    branchNameTe: "షాపూర్ నగర్",
    branchNameHi: "शापुर नगर",
    address: "Kingdom of Christ Ministries,\n15-201, Vivekananda Nagar, Srinivas Nagar,\nJeedimetla, Hyderabad,\nTelangana 500055",
    addressTe: "కింగ్డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్,\n15-201, వివేకానంద నగర్, శ్రీనివాస్ నగర్,\nజీడిమెట్ల, హైదరాబాద్,\nతెలంగాణ 500055",
    addressHi: "किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज,\n15-201, विवेकानंद नगर, श्रीनिवास नगर,\nजीडीमेटला, हैदराबाद,\nतेलंगाना 500055",
    phones: [
      { label: "Senior Pastor", number: "+91 97040 90069" },
      { label: "Office", number: "+91 96409 43777" },
      { label: "Office", number: "+91 73964 33856" },
    ],
    email: "kingofchristministries23@gmail.com",
    mapsUrl: "https://maps.google.com/?q=Kingdom+of+Christ+Ministries,+15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.5369!2d78.43506!3d17.52098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91e2f02d5555%3A0x2a6c6c6b6a6a6a6a!2sVivekananda+Nagar%2C+Jeedimetla%2C+Hyderabad%2C+Telangana+500055!5e0!3m2!1sen!2sin!4v1716000000000",
    isStreetView: false,
    serviceHours: "Friday & Sunday: 6:00 PM",
    whatsappUrl: null,
    displayOrder: 0,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-subhash",
    branchKey: "subhash",
    branchName: "Subhash Nagar",
    branchNameTe: "సుభాష్ నగర్",
    branchNameHi: "सुभाष नगर",
    address: "Subhash Nagar,\nJeedimetla, Hyderabad,\nTelangana 500055",
    addressTe: "సుభాష్ నగర్,\nజీడిమెట్ల, హైదరాబాద్,\nతెలంగాణ 500055",
    addressHi: "सुभाष नगर,\nजीडीमेटला, हैदराबाद,\nतेलंगाना 500055",
    phones: [
      { label: "Office", number: "+91 96409 43777" },
    ],
    email: null,
    mapsUrl: "https://maps.google.com/?q=Subhash+nagar+jeedimetla+119lp",
    embedUrl: "https://www.google.com/maps/embed?pb=!4v1780922610976!6m8!1m7!1sPfdOpDBV-AUaCAX-pavx_g!2m2!1d17.51769104998973!2d78.46098218561453!3f42.5558951222148!4f33.27373317227213!5f0.4000000000000002",
    isStreetView: true,
    serviceHours: "Sunday: 5:45 AM – 8:30 AM",
    whatsappUrl: null,
    displayOrder: 1,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-bahadur",
    branchKey: "bahadur",
    branchName: "Bahadurpally",
    branchNameTe: "బహదూర్‌పల్లి",
    branchNameHi: "बहादुरपल्ली",
    address: "Bahadurpally,\nQuthbullapur, Hyderabad,\nTelangana 500043",
    addressTe: "బహదూర్‌పల్లి,\nకుత్బుల్లాపూర్, హైదరాబాద్,\nతెలంగాణ 500043",
    addressHi: "बहादुरपल्ली,\nकुतुबुल्लापुर, हैदराबाद,\nतेलंगाना 500043",
    phones: [
      { label: "Office", number: "+91 73964 33856" },
    ],
    email: null,
    mapsUrl: "https://maps.google.com/?q=17.567689,78.443963",
    embedUrl: "https://www.google.com/maps/embed?pb=!4v1780922487353!6m8!1m7!1sB6MuJsAZw1kA_ZCw4b2pGw!2m2!1d17.56771525177928!2d78.44416184725885!3f298.8926008480041!4f-1.3244437518344796!5f0.7820865974627469",
    isStreetView: true,
    serviceHours: "Sunday: 11:00 AM – 2:00 PM",
    whatsappUrl: null,
    displayOrder: 2,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
];

export function useContacts(initialData?: SiteContact[]) {
  const { data, loading, error, refetch } = useCmsFetch<SiteContact[]>(
    "/api/cms/contact",
    CONTACT_FALLBACK,
    { initialData }
  );
  return { contacts: data, loading, error, refetch };
}

// ── Footer Hook ────────────────────────────────────────────────────────────────

export const FOOTER_FALLBACK: FooterConfig = {
  id: "footer",
  tagline: '"Time is fulfilled, and the Kingdom of God is at hand; repent and believe in the Gospel." — Mark 1:15',
  taglineTe: 'కాలము సంభవమైయున్నది, దేవునిరాజ్యము సమీపించియున్నది, మారుమనస్సు పొంది సువార్త నమ్ముడి. — మార్కు 1:15',
  address: "Kingdom of Christ Ministries, 15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad – 500055",
  mapsUrl: "https://maps.google.com/?q=Kingdom+of+Christ+Ministries,+15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055",
  phones: [
    { label: "Senior Pastor", number: "+91 97040 90069" },
    { label: "Office", number: "+91 96409 43777" },
    { label: "Office", number: "+91 73964 33856" },
  ],
  email: "kingofchristministries23@gmail.com",
  instagramUrl: "https://instagram.com",
  youtubeUrl: "https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO",
  facebookUrl: null,
  twitterUrl: null,
  copyright: null,
  updatedById: null,
  updatedAt: new Date().toISOString(),
};

export function useFooterConfig(initialData?: FooterConfig) {
  return useCmsFetch<FooterConfig>("/api/cms/footer", FOOTER_FALLBACK, { initialData });
}

// ── Navigation Hook ────────────────────────────────────────────────────────────

export const FOOTER_NAV_FALLBACK: FooterNavGroups = {
  about: [
    { id: "f-1", label: "Our Story", labelTe: null, labelHi: null, href: "/about/story", placement: "FOOTER_ABOUT", displayOrder: 0, isActive: true, openInNew: false, icon: null, updatedAt: "" },
    { id: "f-2", label: "Leadership", labelTe: null, labelHi: null, href: "/about/leadership", placement: "FOOTER_ABOUT", displayOrder: 1, isActive: true, openInNew: false, icon: null, updatedAt: "" },
    { id: "f-3", label: "Our Beliefs", labelTe: null, labelHi: null, href: "/about/beliefs", placement: "FOOTER_ABOUT", displayOrder: 2, isActive: true, openInNew: false, icon: null, updatedAt: "" },
    { id: "f-4", label: "Ministries", labelTe: null, labelHi: null, href: "/about/ministries", placement: "FOOTER_ABOUT", displayOrder: 3, isActive: true, openInNew: false, icon: null, updatedAt: "" },
    { id: "f-5", label: "Mission", labelTe: null, labelHi: null, href: "/about/mission", placement: "FOOTER_ABOUT", displayOrder: 4, isActive: true, openInNew: false, icon: null, updatedAt: "" },
  ],
  resources: [
    { id: "f-6", label: "Sermons", labelTe: null, labelHi: null, href: "/sermons", placement: "FOOTER_RESOURCES", displayOrder: 0, isActive: true, openInNew: false, icon: null, updatedAt: "" },
    { id: "f-7", label: "Events", labelTe: null, labelHi: null, href: "/events", placement: "FOOTER_RESOURCES", displayOrder: 1, isActive: true, openInNew: false, icon: null, updatedAt: "" },
    { id: "f-8", label: "Blog", labelTe: null, labelHi: null, href: "/blog", placement: "FOOTER_RESOURCES", displayOrder: 2, isActive: true, openInNew: false, icon: null, updatedAt: "" },
    { id: "f-9", label: "Prayer", labelTe: null, labelHi: null, href: "/prayer", placement: "FOOTER_RESOURCES", displayOrder: 3, isActive: true, openInNew: false, icon: null, updatedAt: "" },
  ],
  involved: [
    { id: "f-10", label: "Small Groups", labelTe: null, labelHi: null, href: "/get-involved/small-groups", placement: "FOOTER_INVOLVED", displayOrder: 0, isActive: true, openInNew: false, icon: null, updatedAt: "" },
    { id: "f-11", label: "Volunteer", labelTe: null, labelHi: null, href: "/get-involved/volunteer", placement: "FOOTER_INVOLVED", displayOrder: 1, isActive: true, openInNew: false, icon: null, updatedAt: "" },
    { id: "f-12", label: "Give", labelTe: null, labelHi: null, href: "/give", placement: "FOOTER_INVOLVED", displayOrder: 2, isActive: true, openInNew: false, icon: null, updatedAt: "" },
    { id: "f-13", label: "Membership", labelTe: null, labelHi: null, href: "/membership", placement: "FOOTER_INVOLVED", displayOrder: 3, isActive: true, openInNew: false, icon: null, updatedAt: "" },
  ],
  connect: [
    { id: "f-14", label: "Contact Us", labelTe: null, labelHi: null, href: "#contact", placement: "FOOTER_CONNECT", displayOrder: 0, isActive: true, openInNew: false, icon: null, updatedAt: "" },
    { id: "f-15", label: "Visit Us", labelTe: null, labelHi: null, href: "#about", placement: "FOOTER_CONNECT", displayOrder: 1, isActive: true, openInNew: false, icon: null, updatedAt: "" },
    { id: "f-16", label: "Services", labelTe: null, labelHi: null, href: "#services", placement: "FOOTER_CONNECT", displayOrder: 2, isActive: true, openInNew: false, icon: null, updatedAt: "" },
    { id: "f-17", label: "Locations", labelTe: null, labelHi: null, href: "/locations", placement: "FOOTER_CONNECT", displayOrder: 3, isActive: true, openInNew: false, icon: null, updatedAt: "" },
  ],
};

export function useFooterNavigation(initialData?: FooterNavGroups | Record<string, NavigationItem[]>) {
  const { data, loading, error, refetch } = useCmsFetch<FooterNavGroups | Record<string, NavigationItem[]>>(
    "/api/cms/navigation",
    FOOTER_NAV_FALLBACK,
    { initialData }
  );

  // Normalize grouped data
  const groups = data as any;
  const navigation: FooterNavGroups = {
    about: groups.FOOTER_ABOUT ?? groups.about ?? FOOTER_NAV_FALLBACK.about,
    resources: groups.FOOTER_RESOURCES ?? groups.resources ?? FOOTER_NAV_FALLBACK.resources,
    involved: groups.FOOTER_INVOLVED ?? groups.involved ?? FOOTER_NAV_FALLBACK.involved,
    connect: groups.FOOTER_CONNECT ?? groups.connect ?? FOOTER_NAV_FALLBACK.connect,
  };

  return { navigation, loading, error, refetch };
}

// ── About Hook ─────────────────────────────────────────────────────────────────

export const ABOUT_FALLBACK: AboutConfig = {
  id: "about",
  sectionBadge: "Who We Are",
  heading: "About Our Ministry",
  headingTe: null,
  headingHi: null,
  subtitle: "Kingdom of Christ Ministries is a vibrant, Spirit-filled community in Hyderabad, dedicated to spreading the love of Christ through worship, fellowship, discipleship, and community service.",
  subtitleTe: null,
  subtitleHi: null,
  missionTitle: "Our Mission",
  missionText: "To preach the Gospel of the Kingdom of Christ, make disciples of all nations, and serve the community with compassion.",
  values: [
    { icon: "Church", title: "Worship", titleTe: "ఆరాధన", description: "We worship God in Spirit and truth.", gradient: "from-purple-500 to-violet-600" },
    { icon: "Heart", title: "Community", titleTe: "సమాజం", description: "Building a loving community where every person is welcomed.", gradient: "from-rose-500 to-pink-600" },
    { icon: "Users", title: "Fellowship", titleTe: "సహవాసం", description: "Growing together through small groups and shared faith.", gradient: "from-blue-500 to-cyan-600" },
    { icon: "BookOpen", title: "Teaching", titleTe: "బోధ", description: "Grounding believers in God's Word.", gradient: "from-emerald-500 to-teal-600" },
  ],
  updatedById: null,
  updatedAt: new Date().toISOString(),
};

export function useAboutContent(initialData?: AboutConfig) {
  return useCmsFetch<AboutConfig>("/api/cms/about", ABOUT_FALLBACK, { initialData });
}

// ── Pastor Hook (uses existing API) ───────────────────────────────────────────

export function usePastors(initialData?: Pastor[]) {
  const { data, loading, error, refetch } = useCmsFetch<Pastor[]>(
    "/api/pastor",
    [],
    { initialData }
  );
  return { pastors: data, loading, error, refetch };
}
