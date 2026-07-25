"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import BackToHome from "@/components/ui/BackToHome";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Church,
  BookOpen,
  Users,
  Map as MapIcon,
  Youtube
} from "lucide-react";
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
        id: "subhash",
        name: isTelugu
          ? "సుభాష్ నగర్ (ప్రధాన మందిరం)"
          : isHindi
          ? "सुभाष नगर (मुख्य अभयारण्य)"
          : "Subhash Nagar (Main Sanctuary)",
        title: t.services?.subhash?.title || "Subhash Nagar Morning Prayer",
        description: `${t.services?.subhash?.desc || "Start your Sunday with early morning worship and powerful prayer."} ${t.services?.subhash?.secondDesc || ""}`,
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
        gradient: "from-purple-600 to-indigo-600",
        accentColor: "text-purple-600 dark:text-purple-400",
        serviceBorder: "border-l-purple-500",
        badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        btnColor: "bg-purple-600 hover:bg-purple-700 text-white shadow-md",
        isMain: true,
        Icon: Church,
        iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      },
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
            type: isTelugu ? "ప్రార్థన కూడిక" : isHindi ? "प्रार्थना सभा" : "Prayer Meeting",
          },
          {
            day: isTelugu ? "ఆదివారం" : isHindi ? "रविवार" : "Sunday",
            time: "6:00 PM",
            type: isTelugu ? "ఆరాధన సేవ" : isHindi ? "आराधना सेवा" : "Worship Service",
          },
        ],
        gradient: "from-blue-600 to-indigo-600",
        accentColor: "text-blue-600 dark:text-blue-400",
        serviceBorder: "border-l-blue-500",
        badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        btnColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-md",
        isMain: false,
        Icon: BookOpen,
        iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
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
          ? "बहादुरपल्ली, हैदराबाद, तेलंगाना 500043"
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
        gradient: "from-emerald-600 to-teal-600",
        accentColor: "text-emerald-600 dark:text-emerald-400",
        serviceBorder: "border-l-emerald-500",
        badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md",
        isMain: false,
        Icon: Users,
        iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      },
    ];

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
      gradient: "from-amber-600 to-orange-600",
      accentColor: "text-amber-600 dark:text-amber-400",
      serviceBorder: "border-l-amber-500",
      badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      btnColor: "bg-amber-600 hover:bg-amber-700 text-white shadow-md",
      isMain: false,
      Icon: MapIcon,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    }));

    return [...defaultBranches, ...extraBranches];
  };

  const branches = getBranchData();

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-purple-500 selection:text-white">
      {/* 🧭 Global Navigation Bar */}
      <Navbar />

      {/* 🌌 Hero Header - Deep Slate with Ambient Glows */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-slate-950 text-white overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="mb-6 flex justify-center">
            <BackToHome label={t?.nav?.home || "Home"} />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-xs sm:text-sm mb-6 shadow-md">
            <MapPin className="w-4 h-4 text-purple-300" />
            <span>
              {isTelugu
                ? "హైదరాబాద్‌లోని 3 బ్రాంచ్ ప్రాంతాలు"
                : isHindi
                ? "हैदराबाद में 3 शाखा स्थान"
                : "3 Branch Locations Across Hyderabad"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 font-serif text-white">
            {isTelugu ? "మా ప్రాంతాలు & ఆరాధనలు" : isHindi ? "हमारे स्थान और आराधना" : "Our Locations & Services"}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
            {isTelugu
              ? "హైదరాబాద్ అంతటా మా బ్రాంచ్‌లలో ఒకదానిలో మాతో చేరి దేవుని ఆశీర్వాదాలను పొందుకోవచ్చు."
              : isHindi
              ? "हैदराबाद में हमारी शाखाओं में से किसी एक में हमसे जुड़ें और परमेश्वर के आशीर्वाद का अनुभव करें।"
              : "Join us at any of our branches across Hyderabad to fellowship and grow in faith."}
          </p>
        </div>
      </section>

      {/* 🗺️ Main Locations & Map Layout */}
      <main className="container mx-auto px-4 py-16 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Branch Cards */}
          <div className="lg:col-span-5 space-y-6 lg:max-h-[680px] lg:overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-500/30">
            {branches.map((branch) => {
              const BranchIcon = branch.Icon;
              const isSelected = selectedBranchId === branch.id;
              return (
                <div
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  className={`cursor-pointer rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "bg-purple-500/10 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/50 shadow-xl"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-500/50 shadow-sm hover:shadow-xl"
                  }`}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${branch.iconBg}`}>
                          <BranchIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                            {isTelugu ? "బ్రాంచ్" : isHindi ? "शाखा" : "Branch"}
                          </span>
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                            {branch.name}
                          </h2>
                        </div>
                      </div>
                      {branch.isMain && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold border border-amber-500/20 uppercase tracking-wider">
                          {isTelugu ? "ప్రధాన మందిరం" : isHindi ? "मुख्य Sanctuary" : "Main Hub"}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-5">
                      {branch.description}
                    </p>

                    {/* Service Schedule */}
                    <div className="space-y-2 mb-5">
                      <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        {isTelugu ? "ఆరాధన సమయాలు" : isHindi ? "आराधना समय" : "Service Schedule"}
                      </h3>
                      <div className="space-y-2">
                        {branch.services.map((srv: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 border-l-4 ${branch.serviceBorder} flex items-center justify-between text-xs`}
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {srv.day}
                            </span>
                            <div className="text-right">
                              <div className="font-semibold text-slate-900 dark:text-white">{srv.type}</div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">{srv.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address & Contacts */}
                    <div className="mb-4 text-xs space-y-1.5">
                      <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{branch.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                        <Phone className="w-4 h-4 text-purple-500 shrink-0" />
                        <a href="tel:+919704090069" className="hover:text-purple-600 transition-colors">
                          +91 97040 90069 (Senior Pastor)
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBranchSelect(branch);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>{isTelugu ? "మ్యాప్ లో చూడు" : isHindi ? "मानचित्र" : "View Map"}</span>
                    </button>

                    <a
                      href={branch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`flex-1 py-2.5 px-3 rounded-xl ${branch.btnColor} text-xs font-bold transition-all flex items-center justify-center gap-1.5`}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isTelugu ? "రూట్" : isHindi ? "मार्ग" : "Directions"}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Map */}
          <div className="lg:col-span-7 lg:sticky lg:top-28 h-[450px] lg:h-[680px] w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative z-20">
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
                      <span className={`absolute -inset-2.5 rounded-full bg-gradient-to-r ${branch.gradient} opacity-40 blur-xs group-hover:scale-125 transition-transform duration-300 animate-pulse`} />
                      <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${branch.gradient} flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-lg text-white hover:scale-110 active:scale-95 transition-all duration-200`}>
                        <branch.Icon className="w-5 h-5" />
                      </div>
                      <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded-lg border border-slate-700 shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                        {branch.name}
                      </div>
                    </div>
                  </MarkerContent>

                  <MarkerPopup className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-[280px] shadow-2xl relative">
                    <div className="flex flex-col gap-2 text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${branch.iconBg} flex items-center justify-center`}>
                          <branch.Icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold font-serif leading-none">
                          {branch.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        {branch.address}
                      </p>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                        <a
                          href={branch.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full py-1.5 rounded-lg ${branch.btnColor} text-[11px] font-bold text-center text-white`}
                        >
                          {isTelugu ? "రూట్" : isHindi ? "नेविगेट" : "Directions"}
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

        {/* 📺 Live Streaming Banner */}
        <div className="max-w-4xl mx-auto mt-16 bg-slate-950 text-white border border-slate-800 rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative">
          <div className="w-14 h-14 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Youtube className="w-7 h-7" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 font-serif">
            {isTelugu ? "లైవ్ ఆరాధన కూడా అందుబాటులో ఉంది" : isHindi ? "लाइव आराधना भी उपलब्ध है" : "Live Streaming Available"}
          </h3>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-6 font-light leading-relaxed">
            {isTelugu
              ? "ఒకవేళ మీరు స్వయంగా రాలేకపోతే, మా యూట్యూబ్ ఛానెల్‌లో ప్రతి ఆదివారం ప్రత్యక్ష ఆరాధనలో పాలుపొందవచ్చు."
              : isHindi
              ? "यदि आप व्यक्तिगत रूप से नहीं आ सकते हैं, तो आप हमारे YouTube चैनल पर प्रत्येक रविवार लाइव स्ट्रीम में शामिल हो सकते हैं।"
              : "If you are unable to join us in person, stream our Sunday Worship Services live on our official YouTube channel."}
          </p>
          <a
            href="https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:scale-105"
          >
            <Youtube className="w-4 h-4" />
            <span>{isTelugu ? "యూట్యూబ్ లో చూడండి" : isHindi ? "YouTube पर देखें" : "Watch Live on YouTube"}</span>
          </a>
        </div>
      </main>

      {/* 🦶 Global Footer */}
      <Footer />
    </div>
  );
}