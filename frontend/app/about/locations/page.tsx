"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MapPin, Clock, Phone, Navigation, ArrowLeft, ExternalLink, ShieldCheck, Church, BookOpen, Users, Map as MapIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from "@/components/ui/map";

export default function LocationsPage() {
  const { t, language } = useLanguage();
  const [selectedBranchId, setSelectedBranchId] = useState<string>("subhash");
  const [dbBranches, setDbBranches] = useState<any[]>([]);
  const mapRef = useRef<any>(null);

  const isTelugu = language === "te";
  const isHindi = language === "hi";

  useEffect(() => {
    fetch("/api/branches")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.branches)) {
          setDbBranches(data.branches);
        }
      })
      .catch((err) => console.error("Failed to load DB branches:", err));
  }, []);

  const handleBranchSelect = (branch: any) => {
    setSelectedBranchId(branch.id);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: branch.coordinates,
        zoom: 14.5,
        pitch: 45,
        essential: true,
        duration: 1500
      });
    }
  };

  const getBranchData = () => {
    const defaultBranches = [
      {
        id: "shapur",
        name: isTelugu
          ? "షాపూర్ బ్రాంచ్"
          : isHindi
          ? "शापुर शाखा"
          : "Shapur Branch",
        title: t.services?.shapur?.title || "Shapur Prayer Service",
        description: t.services?.shapur?.desc || "Join us for powerful worship and prayer at our Shapur location.",
        address: isTelugu
          ? "15-201, వివేకానంద నగర్, శ్రీనివాస్ నగర్, జీడిమెట్ల, హైదరాబాద్, తెలంగాణ 500055"
          : isHindi
          ? "15-201, विवेकानंद नगर, श्रीनिवास नगर, जीडीमेटला, हैदराबाद, तेलंगाना 500055"
          : "15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad, Telangana 500055",
        phone: "+91 97040 90069",
        alternatePhone: "+91 96409 43777",
        mapUrl: "https://maps.google.com/?q=Kingdom+of+Christ+Ministries,+15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055",
        coordinates: [78.4532, 17.5123] as [number, number],
        services: [
          {
            day: isTelugu ? "శుక్రవారం" : isHindi ? "शुक्रवार" : "Friday",
            time: "6:00 PM",
            type: isTelugu ? "ప్రార్థన కూడిక" : isHindi ? "ప్రार्थना सभा" : "Prayer Meeting",
          },
          {
            day: isTelugu ? "ఆదివారం" : isHindi ? "रविवार" : "Sunday",
            time: "6:00 PM",
            type: isTelugu ? "ఆరాధన సేవ" : isHindi ? "ఆరాధన సేవ" : "Worship Service",
          },
        ],
        gradient: "from-indigo-600 to-blue-500",
        glowGradient: "from-indigo-500/10 via-blue-500/5 to-transparent",
        accentColor: "text-indigo-600 dark:text-indigo-400",
        hoverBorder: "hover:border-indigo-500/40 hover:shadow-[0_0_40px_-5px_rgba(99,102,241,0.12)]",
        hoverTitle: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
        serviceBorder: "border-l-indigo-500/80 dark:border-l-indigo-400/80",
        badgeBg: "bg-indigo-50 dark:bg-indigo-950/40",
        badgeText: "text-indigo-700 dark:text-indigo-300",
        btnColor: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30",
        mapIconColor: "text-indigo-600 dark:text-indigo-400",
        mapBtnHover: "hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20",
        isMain: false,
        Icon: BookOpen,
        iconBg: "from-indigo-500/20 to-blue-500/10 dark:from-indigo-500/15 dark:to-blue-500/5",
        iconColor: "text-indigo-600 dark:text-indigo-400",
      },
      {
        id: "subhash",
        name: isTelugu
          ? "సుభాష్ నగర్ (ప్రధాన మందిరం)"
          : isHindi
          ? "सुभाष नगर (मुख्य अभयारण्य)"
          : "Subhash Nagar (Main Sanctuary)",
        title: t.services?.subhash?.title || "Subhash Nagar Morning Prayer",
        description: `${t.services?.subhash?.desc || "Start your Sunday with early morning worship and powerful prayer."} ${t.services?.subhash?.secondDesc || ""} ${t.services?.subhash?.thursdayDesc || ""}`,
        address: isTelugu
          ? "సుభాష్ నగర్, జీడిమెట్ల, LP 119, హైదరాబాద్, తెలంగాణ 500055"
          : isHindi
          ? "सुभाष नगर, जीडीमेटला, हैदराबाद, तेलंगाना 500055"
          : "Subhash Nagar, Jeedimetla, LP 119, Hyderabad, Telangana 500055",
        phone: "+91 97040 90069",
        mapUrl: "https://maps.google.com/?q=Subhash+nagar+jeedimetla+119lp",
        coordinates: [78.4610, 17.5177] as [number, number],
        services: [
          {
            day: isTelugu ? "ఆదివారం" : isHindi ? "रविवार" : "Sunday",
            time: "5:45 AM – 8:30 AM",
            type: isTelugu ? "ఆదివారం ఉదయకాల ప్రార్థన (వాచ్ టవర్)" : isHindi ? "रविवार सुबह की प्रार्थना (वॉच टॉवर)" : "Sunday Morning Watch Tower",
          },
          {
            day: isTelugu ? "ఆదివారం" : isHindi ? "रविवार" : "Sunday",
            time: "8:30 AM – 10:30 AM",
            type: isTelugu ? "రెండవ ఆరాధన" : isHindi ? "दूसरी आराधना सेवा" : "Second Worship Service",
          },
          {
            day: isTelugu ? "గురువారం" : isHindi ? "गुरुवार" : "Thursday",
            time: "6:30 PM",
            type: isTelugu ? "ఆయిల్ అభిషేక ప్రార్థనా సేవ" : isHindi ? "तेल अभिषेक प्रार्थना सेवा" : "Oil Anointing Prayer Service",
          },
        ],
        gradient: "from-violet-600 via-fuchsia-500 to-rose-500",
        glowGradient: "from-violet-500/10 via-rose-500/5 to-transparent",
        accentColor: "text-violet-600 dark:text-violet-400",
        hoverBorder: "hover:border-violet-500/40 hover:shadow-[0_0_40px_-5px_rgba(167,139,250,0.12)]",
        hoverTitle: "group-hover:text-violet-600 dark:group-hover:text-violet-400",
        serviceBorder: "border-l-violet-500/80 dark:border-l-violet-400/80",
        badgeBg: "bg-violet-50 dark:bg-violet-950/40",
        badgeText: "text-violet-700 dark:text-violet-300",
        btnColor: "bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-500 hover:to-rose-450 text-white shadow-md shadow-violet-600/20 hover:shadow-violet-600/30",
        mapIconColor: "text-violet-600 dark:text-violet-400",
        mapBtnHover: "hover:bg-violet-50/50 dark:hover:bg-violet-950/20",
        isMain: true,
        Icon: Church,
        iconBg: "from-violet-500/20 to-rose-500/10 dark:from-violet-500/15 dark:to-rose-500/5",
        iconColor: "text-violet-600 dark:text-violet-400",
      },
      {
        id: "bahadur",
        name: isTelugu
          ? "బహదూర్‌పల్లి బ్రాంచ్"
          : isHindi
          ? "बहादुरपल्ली शाखा"
          : "Bahadurpally Branch",
        title: t.services?.bahadur?.title || "Bahadurpally Afternoon Service",
        description: `${t.services?.bahadur?.desc || "Afternoon worship and fellowship at our Bahadurpally location."} ${t.services?.bahadur?.tuesdayDesc || ""}`,
        address: isTelugu
          ? "బహదూర్‌పల్లి, హైదరాబాద్, తెలంగాణ 500043"
          : isHindi
          ? "बहादुरपल्ली, హైదరాబాద్, తెలంగాణ 500043"
          : "Bahadurpally, Hyderabad, Telangana 500043",
        phone: "+91 97040 90069",
        mapUrl: "https://maps.google.com/?q=17.567689,78.443963",
        coordinates: [78.4440, 17.5677] as [number, number],
        services: [
          {
            day: isTelugu ? "ఆదివారం" : isHindi ? "रविवार" : "Sunday",
            time: "11:00 AM – 2:00 PM",
            type: isTelugu ? "మధ్యాహ్న ఆరాధన" : isHindi ? "दोपहर आराधना सेवा" : "Afternoon Worship Service",
          },
          {
            day: isTelugu ? "2వ మంగళవారం" : isHindi ? "दूसरा मंगलवार" : "2nd Tuesday",
            time: "11:00 AM",
            type: isTelugu ? "నెలవారీ ప్రత్యేక ప్రార్థన" : isHindi ? "मासिक विशेष प्रार्थना" : "Monthly Special Prayer",
          },
        ],
        gradient: "from-emerald-600 to-teal-500",
        glowGradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
        accentColor: "text-emerald-650 dark:text-emerald-400",
        hoverBorder: "hover:border-emerald-500/40 hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.12)]",
        hoverTitle: "group-hover:text-emerald-650 dark:group-hover:text-emerald-400",
        serviceBorder: "border-l-emerald-500/80 dark:border-l-emerald-400/80",
        badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
        badgeText: "text-emerald-700 dark:text-emerald-355",
        btnColor: "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30",
        mapIconColor: "text-emerald-650 dark:text-emerald-400",
        mapBtnHover: "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
        isMain: false,
        Icon: Users,
        iconBg: "from-emerald-500/20 to-teal-500/10 dark:from-emerald-500/15 dark:to-teal-500/5",
        iconColor: "text-emerald-600 dark:text-emerald-400",
      },
    ];

    // Dynamically append any custom branches created via forms
    const extraBranches = dbBranches.filter(
      (b) =>
        !b.name.toLowerCase().includes("shapur") &&
        !b.name.toLowerCase().includes("subhash") &&
        !b.name.toLowerCase().includes("bahadur")
    ).map((b, idx) => ({
      id: b.id,
      name: b.name.endsWith("Branch") ? b.name : `${b.name} Branch`,
      title: `${b.name} Service & Fellowship`,
      description: `Worship, community outreach, and prayer services at our ${b.name} location.`,
      address: b.name,
      phone: "+91 97040 90069",
      mapUrl: `https://maps.google.com/?q=${encodeURIComponent(b.name)}`,
      coordinates: [78.45 + (idx + 1) * 0.02, 17.51 + (idx + 1) * 0.02] as [number, number],
      services: [
        {
          day: isTelugu ? "ఆదివారం" : isHindi ? "रविवार" : "Sunday",
          time: "10:00 AM",
          type: isTelugu ? "ఆరాధన సేవ" : isHindi ? "आराधना सेवा" : "Worship Service",
        },
      ],
      gradient: "from-amber-600 to-orange-500",
      glowGradient: "from-amber-500/10 via-orange-500/5 to-transparent",
      accentColor: "text-amber-600 dark:text-amber-400",
      hoverBorder: "hover:border-amber-500/40 hover:shadow-[0_0_40px_-5px_rgba(245,158,11,0.12)]",
      hoverTitle: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
      serviceBorder: "border-l-amber-500/80 dark:border-l-amber-400/80",
      badgeBg: "bg-amber-50 dark:bg-amber-950/40",
      badgeText: "text-amber-700 dark:text-amber-300",
      btnColor: "bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-500 text-white shadow-md shadow-amber-600/20",
      mapIconColor: "text-amber-600 dark:text-amber-400",
      mapBtnHover: "hover:bg-amber-50/50 dark:hover:bg-amber-950/20",
      isMain: false,
      Icon: MapIcon,
      iconBg: "from-amber-500/20 to-orange-500/10 dark:from-amber-500/15 dark:to-orange-500/5",
      iconColor: "text-amber-600 dark:text-amber-400",
    }));

    return [...defaultBranches, ...extraBranches];
  };

  const branches = getBranchData();

  // Trigger initial map fly to default selected branch when map loads
  useEffect(() => {
    if (mapRef.current) {
      const defaultBranch = branches.find(b => b.id === selectedBranchId);
      if (defaultBranch) {
        mapRef.current.jumpTo({
          center: defaultBranch.coordinates,
          zoom: 12.5,
          pitch: 30
        });
      }
    }
  }, [mapRef.current]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 60, damping: 14 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05050a] transition-colors duration-300">
      <Navbar />

      {/* Hero Header */}
      <section className="relative py-28 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 overflow-hidden mt-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm transition-all text-xs font-semibold hover:-translate-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {isTelugu ? "తిరిగి వెళ్ళండి" : isHindi ? "वापस जाएं" : "Back to Home"}
          </a>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight font-outfit">
            {isTelugu ? "మా ప్రాంతాలు & ఆరాధనలు" : isHindi ? "हमारे स्थान और आराधना" : "Our Locations & Services"}
          </h1>
          <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
            {isTelugu
              ? "హైదరాబాద్ అంతటా మా 3 బ్రాంచ్‌లలో ఏదైనా ఒకదానిలో మాతో చేరండి మరియు దేవుని ఆశీర్వాదాలను పొందండి."
              : isHindi
              ? "हैदराबाद में हमारी 3 शाखाओं में से किसी एक में हमसे जुड़ें और परमेश्वर के आशीर्वाद का अनुभव करें।"
              : "Join us at any of our 3 branches across Hyderabad to fellowship and grow in faith."}
          </p>
        </div>
      </section>

      {/* Interactive split locations area */}
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Branch Cards List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 space-y-6 lg:h-[650px] lg:overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent"
          >
            {branches.map((branch) => (
              <motion.article
                key={branch.id}
                variants={itemVariants}
                onClick={() => handleBranchSelect(branch)}
                className={`group relative bg-white dark:bg-white/[0.02] backdrop-blur-xl rounded-[2rem] border p-6 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer ${
                  selectedBranchId === branch.id
                    ? "border-purple-500 dark:border-purple-400 shadow-xl shadow-purple-500/5 ring-1 ring-purple-500"
                    : `border-slate-200/60 dark:border-white/[0.06] shadow-sm ${branch.hoverBorder}`
                }`}
              >
                {/* Glow decorations */}
                <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full bg-gradient-to-br ${branch.glowGradient} blur-[50px] pointer-events-none group-hover:scale-125 transition-transform duration-700 opacity-60`} />
                <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${branch.gradient}`} />

                <div className="relative z-10">
                  {/* Header info */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${branch.iconBg} flex items-center justify-center border border-slate-200/50 dark:border-white/10 shadow-xs`}>
                        <branch.Icon className={`w-5 h-5 ${branch.iconColor}`} />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-505 block">
                          {isTelugu ? "బ్రాంచ్" : isHindi ? "शाखा" : "Branch"}
                        </span>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
                          {branch.name}
                        </h2>
                      </div>
                    </div>
                    {branch.isMain && (
                      <span className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                        {isTelugu ? "ప్రధాన మందిరం" : isHindi ? "मुख्य Sanctuary" : "Main"}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-650 dark:text-slate-450 text-xs leading-relaxed mb-6">
                    {branch.description}
                  </p>

                  {/* Services time */}
                  <div className="space-y-2 mb-6">
                    <h3 className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-505 tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {isTelugu ? "ఆరాధన సమయాలు" : isHindi ? "ఆరాధన సమయాలు" : "Service Schedule"}
                    </h3>
                    <div className="space-y-2">
                      {branch.services.map((srv, index) => (
                        <div
                          key={index}
                          className={`bg-slate-50/50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.02] p-3 rounded-xl flex items-center justify-between border-l-4 ${branch.serviceBorder} shadow-2xs`}
                        >
                          <span className={`font-extrabold text-[9px] uppercase tracking-wider ${branch.badgeBg} ${branch.badgeText} px-2 py-0.5 rounded-md`}>
                            {srv.day}
                          </span>
                          <div className="text-right">
                            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                              {srv.type}
                            </div>
                            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                              {srv.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address info */}
                  <div className="mb-4">
                    <h3 className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-550 tracking-widest mb-1">
                      {isTelugu ? "చిరునామా" : isHindi ? "पता" : "Address"}
                    </h3>
                    <p className="text-slate-700 dark:text-slate-350 text-xs leading-relaxed">
                      {branch.address}
                    </p>
                  </div>
                </div>

                {/* Call & Direct Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/[0.04] mt-auto relative z-10 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBranchSelect(branch);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-purple-500/10 dark:bg-purple-400/5 hover:bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[11px] font-extrabold transition-all`}
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    {isTelugu ? "మ్యాప్ లో చూడు" : isHindi ? "मानचित्र पर देखें" : "View on Map"}
                  </button>

                  <a
                    href={branch.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 ${branch.mapBtnHover} text-slate-800 dark:text-white text-[11px] font-bold transition-all group/btn`}
                  >
                    <Navigation className={`w-3.5 h-3.5 ${branch.mapIconColor}`} />
                    {isTelugu ? "రూట్" : isHindi ? "मार्ग" : "Route"}
                  </a>

                  <a
                    href={`tel:${branch.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl ${branch.btnColor} text-[11px] font-bold transition-all`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {isTelugu ? "కాల్" : isHindi ? "कॉल" : "Call"}
                  </a>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Right Column: Sticky Interactive Map */}
          <div className="lg:col-span-7 lg:sticky lg:top-28 h-[400px] lg:h-[650px] w-full rounded-[2.5rem] overflow-hidden border border-slate-200/60 dark:border-white/[0.06] shadow-xl z-20">
            <Map
              ref={mapRef}
              center={[78.452, 17.532]}
              zoom={11.5}
              pitch={30}
              className="h-full w-full"
            >
              {branches.map((branch) => (
                <MapMarker
                  key={branch.id}
                  longitude={branch.coordinates[0]}
                  latitude={branch.coordinates[1]}
                  onClick={() => handleBranchSelect(branch)}
                >
                  <MarkerContent>
                    <div className="relative group cursor-pointer flex flex-col items-center">
                      {/* Pulsing ring visual */}
                      <span className={`absolute -inset-2.5 rounded-full bg-gradient-to-r ${branch.gradient} opacity-40 blur-xs group-hover:scale-125 transition-transform duration-300 animate-pulse`} />
                      
                      {/* Circle pin with custom icon */}
                      <div className={`relative w-9 h-9 rounded-full bg-gradient-to-br ${branch.gradient} flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-lg text-white hover:scale-110 active:scale-95 transition-all duration-200`}>
                        <branch.Icon className="w-4.5 h-4.5" />
                      </div>

                      {/* Tooltip label above marker */}
                      <div className="absolute bottom-full mb-2 bg-slate-900/95 dark:bg-[#0c0d21]/95 text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/10 shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                        {branch.name}
                      </div>
                    </div>
                  </MarkerContent>

                  <MarkerPopup className="rounded-3xl p-5 bg-white dark:bg-[#0f1021] border border-slate-200 dark:border-white/[0.06] max-w-[280px] shadow-2xl relative">
                    <div className="flex flex-col gap-2.5 text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${branch.iconBg} flex items-center justify-center border border-slate-200/50 dark:border-white/10 shadow-xs`}>
                          <branch.Icon className={`w-4 h-4 ${branch.iconColor}`} />
                        </div>
                        <h4 className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">
                          {branch.name}
                        </h4>
                      </div>
                      
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                        {branch.address}
                      </p>
                      
                      <div className="pt-2.5 border-t border-slate-100 dark:border-white/[0.04] flex flex-col gap-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                          {isTelugu ? "సేవా సమయాలు" : isHindi ? "आराधना समय" : "Service Timings"}
                        </span>
                        <div className="space-y-1">
                          {branch.services.map((srv, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[10px] font-bold text-slate-650 dark:text-slate-300">
                              <span className="text-purple-600 dark:text-purple-400">{srv.day}:</span>
                              <span>{srv.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex gap-2">
                        <a
                          href={`tel:${branch.phone}`}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 text-[10px] font-bold text-center text-slate-800 dark:text-white"
                        >
                          {isTelugu ? "కాల్" : isHindi ? "कॉल" : "Call"}
                        </a>
                        <a
                          href={branch.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 py-1.5 px-2 rounded-lg ${branch.btnColor} text-[10px] font-bold text-center text-white`}
                        >
                          {isTelugu ? "రూట్" : isHindi ? "नेविगेट" : "Route"}
                        </a>
                      </div>
                    </div>
                  </MarkerPopup>
                </MapMarker>
              ))}
              <MapControls position="bottom-right" showZoom showLocate showFullscreen />
            </Map>
          </div>

        </div>

        {/* Footer info box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="max-w-4xl mx-auto mt-20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-purple-500/10 rounded-3xl p-8 text-center"
        >
          <ShieldCheck className="w-10 h-10 text-purple-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            {isTelugu ? "లైవ్ ఆరాధన కూడా అందుబాటులో ఉంది" : isHindi ? "लाइव आराधना भी उपलब्ध है" : "Live Streaming Available"}
          </h3>
          <p className="text-sm text-slate-650 dark:text-slate-400 max-w-xl mx-auto mb-6">
            {isTelugu
              ? "ఒకవేళ మీరు మా ఏ ప్రాంతానికైనా రాలేకపోతే, మా ప్రతి ఆదివారం ఆరాధనలను మా యూట్యూబ్ ఛానెల్‌లో లైవ్ స్ట్రీమింగ్ ద్వారా వీక్షించవచ్చు."
              : isHindi
              ? "यदि आप व्यक्तिगत रूप से किसी भी स्थान पर नहीं आ सकते हैं, तो आप हमारे YouTube चैनल पर प्रत्येक रविवार को लाइव स्ट्रीम में शामिल हो सकते हैं।"
              : "If you are unable to join us in person, you can stream our Sunday Worship Services live on our official YouTube channel."}
          </p>
          <a
            href="https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-extrabold text-sm group"
          >
            {isTelugu ? "యూట్యూబ్ లో లైవ్ చూడండి" : isHindi ? "YouTube पर लाइव देखें" : "Watch on YouTube"}
            <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
