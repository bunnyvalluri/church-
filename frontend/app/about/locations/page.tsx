"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { KCM_BRANCHES } from "@/lib/locationsData";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  Church,
  Youtube,
  Sunrise,
  Heart,
  Sparkles,
  Home,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  X,
  Copy,
  Check,
  Share2,
  Calendar
} from "lucide-react";

export default function LocationsPage() {
  const { t, language } = useLanguage();
  const pathname = usePathname() || "/locations";
  const [dbBranches, setDbBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isTelugu = language === "te";
  const isHindi = language === "hi";
  const isDirectLocationsRoute = pathname === "/locations" || !pathname.includes("/about/");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/branches", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.success && Array.isArray(data.branches)) {
          setDbBranches(data.branches);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to load DB branches:", err);
        }
      });
    return () => controller.abort();
  }, []);

  // Body scroll lock and Keyboard Escape listener for accessible modal dismissal
  useEffect(() => {
    if (!selectedBranch) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedBranch) {
        startTransition(() => {
          setSelectedBranch(null);
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedBranch]);

  const handleOpenBranchModal = (branch: any) => {
    startTransition(() => {
      setSelectedBranch(branch);
      setCopiedAddress(false);
    });
  };

  const handleCloseBranchModal = () => {
    startTransition(() => {
      setSelectedBranch(null);
      setCopiedAddress(false);
    });
  };

  const handleCopyAddress = (address: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleScrollToBranch = (e: React.MouseEvent, branchId: string) => {
    e.preventDefault();
    startTransition(() => {
      const element = document.getElementById(branchId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `#${branchId}`);
      }
    });
  };

  const getBranchData = () => {
    const defaultBranches = [
      {
        id: "shapur",
        slug: "shapur-nagar",
        name: isTelugu
          ? "షాపూర్ నగర్ బ్రాంచ్"
          : isHindi
          ? "शापुर नगर शाखा"
          : "Shapur Nagar Branch",
        title: t.services?.shapur?.title || "Shapur Prayer Service",
        subtitle: isTelugu ? "ప్రధాన ఆరాధనా కేంద్రం" : isHindi ? "मुख्य आराधना केंद्र" : "Main Church & Apostolic Sanctuary",
        description: t.services?.shapur?.desc || "Join us for powerful worship and prayer at our Shapur main campus.",
        address: isTelugu
          ? "15-201, వివేకానంద నగర్, శ్రీనివాస్ నగర్, జీడిమెట్ల, హైదరాబాద్, తెలంగాణ 500055"
          : isHindi
          ? "15-201, विवेकानंद नगर, श्रीनिवास नगर, जीडीमेटला, हैदराबाद, तेलंगाना 500055"
          : "15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad, Telangana 500055",
        phone: "+91 97040 90069",
        alternatePhone: "+91 96409 43777",
        mapUrl: "https://maps.google.com/?q=Kingdom+of+Christ+Ministries,+15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055",
        directions: isTelugu
          ? "పైప్‌లైన్ రోడ్డు సమీపంలోని 15-201 వివేకానంద నగర్ వద్ద కలదు, జీడిమెట్ల మెయిన్ రోడ్ మరియు షాపూర్ నగర్ బస్ స్టాప్ ద్వారా సులభంగా చేరుకోవచ్చు."
          : isHindi
          ? "पाइपलाइन रोड के पास 15-201 विवेकानंद नगर में स्थित, जीडीमेटला मुख्य मार्ग और शापुर नगर बस स्टॉप से आसानी से पहुंचा जा सकता है।"
          : "Located at 15-201 Vivekananda Nagar near Pipeline Road, easily accessible via Jeedimetla Main Road and Shapur Nagar Bus Stop.",
        services: [
          {
            day: isTelugu ? "శుక్రవారం" : isHindi ? "शुक्रवार" : "Friday",
            time: "6:00 PM – 8:30 PM",
            type: isTelugu ? "ఉపవాస & స్వస్థత ప్రార్థన కూడిక" : isHindi ? "उपवास एवं चंगाई प्रार्थना सभा" : "Fasting & Healing Prayer",
            dayBadge: "bg-purple-600 text-white shadow-xs",
            border: "border-l-purple-500",
          },
          {
            day: isTelugu ? "ఆదివారం" : isHindi ? "रविवार" : "Sunday",
            time: "6:00 PM – 8:30 PM",
            type: isTelugu ? "సాయంకాల ఆరాధన సేవ" : isHindi ? "शाम की आराधना सेवा" : "Sunday Evening Worship Service",
            dayBadge: "bg-indigo-600 text-white shadow-xs",
            border: "border-l-indigo-500",
          },
        ],
        accent: "from-amber-500 via-orange-500 to-amber-600",
        badgeBg: "bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80 font-black",
        badgeText: isTelugu ? "ప్రధాన మందిరం" : isHindi ? "मुख्य Sanctuary" : "Main Hub",
        btnColor: "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-600/25",
        isMain: true,
        Icon: Church,
        iconBg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-200/80 dark:border-amber-800/60 text-amber-600 dark:text-amber-400",
      },
      {
        id: "subhash",
        slug: "subhash-nagar",
        name: isTelugu
          ? "సుభాష్ నగర్ బ్రాంచ్"
          : isHindi
          ? "सुभाष नगर शाखा"
          : "Subhash Nagar Branch",
        title: t.services?.subhash?.title || "Subhash Nagar Morning Prayer",
        subtitle: isTelugu ? "ఉదయకాల ఆరాధన & అభిషేక కూడిక" : isHindi ? "सुबह की आराधना एवं अभिषेक सभा" : "Morning Watch Tower & Anointing Services",
        description: `${t.services?.subhash?.desc || "Start your Sunday with early morning worship and powerful prayer."} ${t.services?.subhash?.secondDesc || ""}`,
        address: isTelugu
          ? "సుభాష్ నగర్, జీడిమెట్ల, LP 119, హైదరాబాద్, తెలంగాణ 500055"
          : isHindi
          ? "सुभाष नगर, जीडीमेटला, हैदराबाद, तेलंगाना 500055"
          : "Subhash Nagar, Jeedimetla, LP 119, Hyderabad, Telangana 500055",
        phone: "+91 97040 90069",
        alternatePhone: "+91 96409 43777",
        mapUrl: "https://maps.google.com/?q=Subhash+nagar+jeedimetla+119lp",
        directions: isTelugu
          ? "జీడిమెట్లలోని LP 119 సమీపంలో సుభాష్ నగర్ వద్ద కలదు. కుత్బుల్లాపూర్ మరియు చింతల్ నుండి త్వరగా చేరుకోవచ్చు."
          : isHindi
          ? "जीडीमेटला में एलपी 119 के पास सुभाष नगर में स्थित। कुथबुल्लापुर और चिंताल से आसानी से जुड़ा हुआ है।"
          : "Situated in Subhash Nagar near LP 119, Jeedimetla. Connects quickly from Quthbullapur and Chintal.",
        services: [
          {
            day: isTelugu ? "ఆదివారం" : isHindi ? "रविवार" : "Sunday",
            time: "5:45 AM – 8:30 AM",
            type: isTelugu ? "ఆదివారం ఉదయకాల ప్రార్థన (వాచ్ టవర్)" : isHindi ? "रविवार सुबह की प्रार्थना (वॉच टॉवर)" : "Sunday Morning Watch Tower",
            dayBadge: "bg-purple-600 text-white shadow-xs",
            border: "border-l-purple-500",
          },
          {
            day: isTelugu ? "ఆదివారం" : isHindi ? "रविवार" : "Sunday",
            time: "8:30 AM – 10:30 AM",
            type: isTelugu ? "రెండవ ఆరాధన సేవ" : isHindi ? "दूसरी आराधना सेवा" : "Second Worship Service",
            dayBadge: "bg-blue-600 text-white shadow-xs",
            border: "border-l-blue-500",
          },
          {
            day: isTelugu ? "గురువారం" : isHindi ? "गुरुवार" : "Thursday",
            time: "6:30 PM – 9:00 PM",
            type: isTelugu ? "ఆయిల్ అభిషేక ప్రార్థనా సేవ" : isHindi ? "तेल अभिषेक प्रार्थना सेवा" : "Oil Anointing Prayer Service",
            dayBadge: "bg-teal-600 text-white shadow-xs",
            border: "border-l-teal-500",
          },
        ],
        accent: "from-purple-500 via-indigo-500 to-cyan-500",
        badgeBg: "bg-purple-500/15 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700/80 font-black",
        badgeText: isTelugu ? "మిడ్‌వీక్ కేంద్రం" : isHindi ? "मध्य-सप्ताह केंद्र" : "Midweek Campus",
        btnColor: "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-600/25",
        isMain: false,
        Icon: Sunrise,
        iconBg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-200/80 dark:border-purple-800/60 text-purple-600 dark:text-purple-400",
      },
      {
        id: "bahadur",
        slug: "bahadurpally",
        name: isTelugu
          ? "బహదూర్‌పల్లి నగర్ బ్రాంచ్"
          : isHindi
          ? "बहादुरपल्ली नगर शाखा"
          : "Bahadurpally Nagar Branch",
        title: t.services?.bahadur?.title || "Bahadurpally Afternoon Service",
        subtitle: isTelugu ? "మధ్యాహ్న ఆరాధన & ప్రత్యేక ప్రార్థన" : isHindi ? "दोपहर आराधना एवं विशेष प्रार्थना" : "Afternoon Service & Monthly Breakthrough",
        description: `${t.services?.bahadur?.desc || "Afternoon worship and fellowship at our Bahadurpally location."} ${t.services?.bahadur?.tuesdayDesc || ""}`,
        address: isTelugu
          ? "బహదూర్‌పల్లి, హైదరాబాద్, తెలంగాణ 500043"
          : isHindi
          ? "बहादुरपल्ली, हैदराबाद, तेलंगाना 500043"
          : "Bahadurpally, Hyderabad, Telangana 500043",
        phone: "+91 97040 90069",
        alternatePhone: "+91 96409 43777",
        mapUrl: "https://maps.google.com/?q=17.567689,78.443963",
        directions: isTelugu
          ? "గాండిమైసమ్మ-మేడ్చల్ రోడ్డులోని బహదూర్‌పల్లిలో కలదు. సురారం, బహదూర్‌పల్లి మరియు పరిసర ప్రాంతాల వారికి సులభం."
          : isHindi
          ? "गांधीमैसम्मा-मेडचल रोड पर बहादुरपल्ली में स्थित। सुरारम और आसपास के क्षेत्रों के लिए सुविधाजनक।"
          : "Located in Bahadurpally on the Gandimaisamma-Medchal road, serving Bahadurpally, Suraram, and surrounding regions.",
        services: [
          {
            day: isTelugu ? "ఆదివారం" : isHindi ? "रविवार" : "Sunday",
            time: "11:00 AM – 1:00 PM",
            type: isTelugu ? "మధ్యాహ్న ఆరాధన సేవ" : isHindi ? "दोपहर आराधना सेवा" : "Afternoon Worship Service",
            dayBadge: "bg-rose-600 text-white shadow-xs",
            border: "border-l-rose-500",
          },
          {
            day: isTelugu ? "2వ మంగళవారం" : isHindi ? "दूसरा मंगलवार" : "2nd Tuesday",
            time: "11:00 AM – 1:30 PM",
            type: isTelugu ? "నెలవారీ ప్రత్యేక ప్రార్థన" : isHindi ? "मासिक विशेष प्रार्थना" : "Monthly Special Breakthrough",
            dayBadge: "bg-indigo-600 text-white shadow-xs",
            border: "border-l-indigo-500",
          },
        ],
        accent: "from-pink-500 via-rose-500 to-purple-600",
        badgeBg: "bg-rose-500/15 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700/80 font-black",
        badgeText: isTelugu ? "నెలవారీ కేంద్రం" : isHindi ? "मासिक केंद्र" : "Special Fellowship",
        btnColor: "bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg shadow-pink-600/25",
        isMain: false,
        Icon: Heart,
        iconBg: "bg-rose-500/10 dark:bg-rose-500/20 border-rose-200/80 dark:border-rose-800/60 text-rose-600 dark:text-rose-400",
      },
    ];

    const extraBranches = dbBranches.filter(
      (b) =>
        !b.name.toLowerCase().includes("shapur") &&
        !b.name.toLowerCase().includes("subhash") &&
        !b.name.toLowerCase().includes("bahadur")
    ).map((b) => ({
      id: b.id,
      slug: b.slug || b.id,
      name: b.name.endsWith("Branch") ? b.name : `${b.name} Branch`,
      title: `${b.name} Service & Fellowship`,
      subtitle: "Community Church Hub",
      description: `Worship, community outreach, and prayer services at our ${b.name} location.`,
      address: b.name,
      phone: "+91 97040 90069",
      mapUrl: `https://maps.google.com/?q=${encodeURIComponent(b.name)}`,
      directions: "Contact the church office for direct navigation assistance and parking details.",
      services: [
        {
          day: isTelugu ? "ఆదివారం" : isHindi ? "रविवार" : "Sunday",
          time: "10:00 AM",
          type: isTelugu ? "ఆరాధన సేవ" : isHindi ? "आराधना सेवा" : "Worship Service",
          dayBadge: "bg-purple-600 text-white shadow-xs",
          border: "border-l-purple-500",
        },
      ],
      accent: "from-purple-500 to-indigo-500",
      badgeBg: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700",
      badgeText: "Campus",
      btnColor: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-600/25",
      isMain: false,
      Icon: Church,
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-200/80 dark:border-purple-800/60 text-purple-600 dark:text-purple-400",
    }));

    return [...defaultBranches, ...extraBranches];
  };

  const branches = getBranchData();

  return (
    <div id="locations-page-wrapper" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-purple-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* 🧭 Global Navigation Bar */}
        <Navbar />

        {/* 🌌 Hero Header - Adaptive Light/Dark Theme */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-purple-100/80 dark:border-slate-800/80 overflow-hidden shadow-xs transition-colors duration-300">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-25 dark:opacity-15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 text-center">
            
            {/* Inline Breadcrumb Navigation: Route-Aware Matching */}
            <nav aria-label="Breadcrumb" className="mb-5 flex justify-center">
              <ol className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-purple-200/60 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-2xs">
                <li className="inline-flex items-center">
                  <Link href="/" className="inline-flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <Home className="h-3.5 w-3.5" />
                    <span>{t?.nav?.home || (isTelugu ? "హోమ్" : isHindi ? "होम" : "Home")}</span>
                  </Link>
                </li>
                <li className="flex items-center text-slate-400 dark:text-slate-600">/</li>
                {!isDirectLocationsRoute && (
                  <>
                    <li className="inline-flex items-center">
                      <Link href="/about" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        {isTelugu ? "మా గురించి" : isHindi ? "हमारे बारे में" : "About"}
                      </Link>
                    </li>
                    <li className="flex items-center text-slate-400 dark:text-slate-600">/</li>
                  </>
                )}
                <li className="text-purple-700 dark:text-purple-300 font-bold" aria-current="page">
                  {isTelugu ? "ప్రాంతాలు" : isHindi ? "स्थान" : "Locations"}
                </li>
              </ol>
            </nav>

            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/90 dark:border-purple-800/80 text-purple-900 dark:text-purple-200 font-extrabold text-xs sm:text-sm mb-6 shadow-2xs backdrop-blur-md">
              <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="font-extrabold tracking-wider uppercase">
                {isTelugu
                  ? "హైదరాబాద్‌లోని 3 బ్రాంచ్ ప్రాంతాలు"
                  : isHindi
                  ? "हैदराबाद में 3 शाखा स्थान"
                  : "3 Branch Locations Across Hyderabad"}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 font-outfit text-slate-900 dark:text-white leading-tight">
              {isTelugu ? "మా ప్రాంతాలు & ఆరాధనలు" : isHindi ? "हमारे स्थान और आराधना" : "Our Locations & Services"}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
              {isTelugu
                ? "హైదరాబాద్ అంతటా మా బ్రాంచ్‌లలో ఒకదానిలో మాతో చేరి దేవుని ఆశీర్వాదాలను పొందుకోవచ్చు."
                : isHindi
                ? "हैदराबाद में हमारी शाखाओं में से किसी एक में हमसे जुड़ें और परमेश्वर के आशीर्वाद का अनुभव करें।"
                : "Join us at any of our branches across Hyderabad to fellowship and grow in faith."}
            </p>

            {/* Quick Hub Navigation Bar: Full Pill Width (No Text Truncation ...) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl lg:max-w-5xl mx-auto w-full px-2 sm:px-4">
              {branches.map((b) => {
                const BIcon = b.Icon;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={(e) => handleScrollToBranch(e, b.id)}
                    className="w-full min-h-[52px] px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 hover:border-purple-400 dark:hover:border-purple-500/60 shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-1">
                      <div className={`w-8 h-8 rounded-xl ${b.iconBg} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <BIcon className="w-4 h-4" />
                      </div>
                      <span className="font-black whitespace-normal sm:whitespace-nowrap tracking-tight text-left">
                        {b.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                  </button>
                );
              })}
            </div>

          </div>
        </section>

        {/* 🏙️ Main Locations Grid: Uniform Card Heights & Equal Alignment */}
        <main className="container mx-auto px-4 py-16 md:py-24 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {branches.map((branch) => {
              const BranchIcon = branch.Icon;
              return (
                <div
                  key={branch.id}
                  id={branch.id}
                  className="scroll-mt-32 relative bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group overflow-hidden hover:-translate-y-1.5 h-full"
                >
                  {/* Top Accent Gradient Ribbon */}
                  <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${branch.accent} opacity-85 group-hover:opacity-100 transition-opacity`} />

                  {/* Upper Content Wrapper — flex-1 flex flex-col justify-between for Equal Card Geometry */}
                  <div className="flex-1 flex flex-col">
                    {/* Card Header: Row 1 Top Meta (Icon Halo on left, Campus Badge on right) */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center border shadow-2xs group-hover:scale-110 transition-transform shrink-0 ${branch.iconBg}`}>
                        <BranchIcon className="w-6 h-6 sm:w-6.5 sm:h-6.5" />
                      </div>
                      {branch.badgeText && (
                        <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-2xs shrink-0 ${branch.badgeBg}`}>
                          {branch.badgeText}
                        </span>
                      )}
                    </div>

                    {/* Card Header: Row 2 Full-Width Title & Subtitle */}
                    <div className="mb-4">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-outfit tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight mb-1">
                        {branch.name}
                      </h2>
                      <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                        {branch.subtitle}
                      </p>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                      {branch.description}
                    </p>

                    {/* Service Schedule — flex-1 flex flex-col justify-start so Bottom Buttons Align Perfectly */}
                    <div className="space-y-3 mb-6 flex-1 flex flex-col justify-start">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5 font-outfit">
                          <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>{isTelugu ? "ఆరాధన సమయాలు" : isHindi ? "आराधना समय" : "Service Schedule"}</span>
                        </h3>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>All Welcome</span>
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {branch.services.map((srv: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 border-l-4 ${srv.border || "border-l-purple-500"} shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider ${srv.dayBadge || "bg-purple-600 text-white"}`}>
                                {srv.day}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                                <Clock className="w-3 h-3 text-purple-500 shrink-0" />
                                <span>{srv.time}</span>
                              </div>
                            </div>
                            <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                              {srv.type}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Physical Address & Direct Pastoral Contact */}
                    <div className="mb-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-4 font-medium">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{branch.address}</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-bold text-slate-800 dark:text-slate-100 pt-0.5">
                        <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        <a href="tel:+919704090069" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                          +91 97040 90069 (Church Office & Pastoral Help)
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View Details Modal Trigger + Direct Google Maps Navigation — mt-auto for Perfectly Even Baseline */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleOpenBranchModal(branch)}
                      className="min-h-[46px] w-full py-2.5 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-800 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-2xs"
                    >
                      <Church className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>{isTelugu ? "వివరాలు చూడండి" : isHindi ? "विवरण देखें" : "Branch Details"}</span>
                    </button>
                    <a
                      href={branch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`min-h-[46px] w-full py-2.5 px-3 rounded-2xl ${branch.btnColor} text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-md`}
                    >
                      <Navigation className="w-4 h-4" />
                      <span>{isTelugu ? "దిశలను పొందండి" : isHindi ? "दिशा-निर्देश" : "Get Directions"}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 📺 Live Streaming Media Showcase — Executive Tone-on-Tone Card */}
          <div className="max-w-4xl mx-auto mt-16 sm:mt-20 bg-gradient-to-br from-red-50/90 via-white to-purple-50/50 dark:from-slate-900/95 dark:via-red-950/20 dark:to-slate-900/95 text-slate-900 dark:text-white border border-red-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl shadow-red-600/5 relative overflow-hidden group">
            {/* Top Accent Gradient Ribbon */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 opacity-90" />

            {/* Ambient Glow Orbs */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-500/10 dark:bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Live Broadcast Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-800/80 text-xs font-black uppercase tracking-wider mb-5 shadow-2xs backdrop-blur-md">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-xs" />
                <span>{isTelugu ? "గ్లోబల్ ఆన్‌లైన్ మినిస్ట్రీ" : isHindi ? "ग्लोबल ऑनलाइन सेवकाई" : "Global Live Broadcast & Ministry"}</span>
              </div>

              {/* Tone-on-Tone YouTube Luminous Halo */}
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-800/80 flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:scale-110 transition-transform">
                <Youtube className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>

              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 font-outfit tracking-tight leading-tight">
                {isTelugu ? "లైవ్ ఆరాధన కూడా అందుబాటులో ఉంది" : isHindi ? "लाइव आराधना भी उपलब्ध है" : "Live Streaming Available"}
              </h3>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-6 leading-relaxed font-normal">
                {isTelugu
                  ? "ఒకవేళ మీరు స్వయంగా రాలేకపోతే, మా అధికారిక యూట్యూబ్ ఛానెల్‌లో ప్రతి ఆదివారం మరియు శుక్రవారం ప్రత్యక్ష ఆరాధనలో పాలుపొందవచ్చు."
                  : isHindi
                  ? "यदि आप व्यक्तिगत रूप से नहीं आ सकते हैं, तो आप हमारे आधिकारिक YouTube चैनल पर प्रत्येक रविवार और शुक्रवार लाइव स्ट्रीम में शामिल हो सकते हैं।"
                  : "If you are unable to join us in person, stream our Sunday Worship Services and special prayer meetings live on our official YouTube channel."}
              </p>

              {/* Quick Broadcast Timing Pills */}
              <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  <span>Sundays: 6:00 PM • Fridays: 6:00 PM</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Full HD 1080p Stream</span>
                </span>
              </div>

              <div>
                <a
                  href="https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[50px] inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm rounded-2xl transition-all shadow-xl shadow-red-600/30 hover:scale-105 active:scale-[0.98] cursor-pointer"
                >
                  <Youtube className="w-5 h-5" />
                  <span>{isTelugu ? "యూట్యూబ్ లో చూడండి" : isHindi ? "YouTube पर देखें" : "Watch Live on YouTube"}</span>
                  <ExternalLink className="w-4 h-4 ml-0.5 opacity-80" />
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 🏛️ Accessible Interactive Branch Details Modal */}
      {selectedBranch && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="branch-modal-title"
          className="fixed inset-0 z-[10005] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={handleCloseBranchModal}
        >
          <div
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[min(90dvh,820px)] text-slate-900 dark:text-white transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Modal Header (Always visible, never scrolled away or covered by navbar) */}
            <div className="flex items-center justify-between gap-4 px-6 py-5 sm:px-7 sm:py-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 ${selectedBranch.iconBg}`}>
                  {selectedBranch.Icon && <selectedBranch.Icon className="w-6 h-6" />}
                </div>
                <div className="min-w-0">
                  <h3 id="branch-modal-title" className="text-lg sm:text-xl font-black font-outfit tracking-tight truncate">
                    {selectedBranch.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">
                    {selectedBranch.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseBranchModal}
                aria-label="Close modal"
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0 border border-slate-200/80 dark:border-slate-700 shadow-2xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="p-5 sm:p-7 pb-8 sm:pb-9 overflow-y-auto overscroll-contain flex-1 space-y-6">
              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {selectedBranch.description}
              </p>

              {/* Timetable Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{isTelugu ? "ఆరాధన సమయ పట్టిక" : isHindi ? "आराधना समय सारिणी" : "Service Timetable"}</span>
                </h4>
                <div className="space-y-2">
                  {selectedBranch.services.map((srv: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ${srv.dayBadge || "bg-purple-600 text-white"}`}>
                          {srv.day}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white truncate">{srv.type}</span>
                      </div>
                      <span className="font-extrabold text-purple-600 dark:text-purple-400 shrink-0">{srv.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address & Directions */}
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block mb-0.5">
                        {isTelugu ? "చిరునామా" : isHindi ? "पता" : "Physical Address"}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed block">
                        {selectedBranch.address}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyAddress(selectedBranch.address)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 text-xs flex items-center gap-1 cursor-pointer shrink-0"
                    title="Copy Address"
                  >
                    {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-bold">{copiedAddress ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {selectedBranch.directions && (
                  <div className="pt-2 border-t border-purple-100/80 dark:border-purple-900/30 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="font-bold text-purple-700 dark:text-purple-300 mr-1.5">
                      {isTelugu ? "మార్గదర్శనం:" : isHindi ? "दिशा-निर्देश:" : "Directions:"}
                    </span>
                    <span>{selectedBranch.directions}</span>
                  </div>
                )}
              </div>

              {/* Phone Pastoral Helpline */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedBranch.phone || "+91 97040 90069"}
                  </span>
                </div>
                <a
                  href={`tel:${(selectedBranch.phone || "+919704090069").replace(/\s/g, "")}`}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-2xs"
                >
                  {isTelugu ? "కాల్ చేయండి" : isHindi ? "कॉल करें" : "Call Now"}
                </a>
              </div>

              {/* Modal Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={selectedBranch.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[46px] rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{isTelugu ? "గూగుల్ మ్యాప్స్ లో తెరవండి" : isHindi ? "गूगल मैप्स में खोलें" : "Open in Google Maps"}</span>
                </a>
                <Link
                  href={`/locations/${selectedBranch.slug}`}
                  className="min-h-[46px] rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-all active:scale-[0.98]"
                >
                  <ExternalLink className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{isTelugu ? "పూర్తి పేజీ చూడండి" : isHindi ? "पूरा पृष्ठ देखें" : "View Full Page"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🦶 Global Footer (Single Canonical Instance) */}
      <Footer />
    </div>
  );
}
