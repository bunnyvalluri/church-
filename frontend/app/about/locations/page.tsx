"use client";

import { useState, useEffect } from "react";
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
  Church,
  BookOpen,
  Users,
  Map as MapIcon,
  Youtube
} from "lucide-react";

export default function LocationsPage() {
  const { t, language } = useLanguage();
  const [dbBranches, setDbBranches] = useState<any[]>([]);

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

  const getBranchData = () => {
    const defaultBranches = [
      {
        id: "shapur",
        name: isTelugu
          ? "షాపూర్ నగర్ బ్రాంచ్"
          : isHindi
          ? "शापुर नगर शाखा"
          : "Shapur Nagar Branch",
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
        serviceBorder: "border-l-blue-500",
        badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        btnColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20",
        isMain: true,
        Icon: BookOpen,
        iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      },
      {
        id: "subhash",
        name: isTelugu
          ? "సుభాష్ నగర్ బ్రాంచ్"
          : isHindi
          ? "सुभाष नगर शाखा"
          : "Subhash Nagar Branch",
        title: t.services?.subhash?.title || "Subhash Nagar Morning Prayer",
        description: `${t.services?.subhash?.desc || "Start your Sunday with early morning worship and powerful prayer."} ${t.services?.subhash?.secondDesc || ""}`,
        address: isTelugu
          ? "సుభాష్ నగర్, జీడిమెట్ల, LP 119, హైదరాబాద్, తెలంగాణ 500055"
          : isHindi
          ? "सुभाष नगर, जीडीमेटला, हैदराबाद, तेलंगाना 500055"
          : "Subhash Nagar, Jeedimetla, LP 119, Hyderabad, Telangana 500055",
        phone: "+91 97040 90069",
        mapUrl: "https://maps.google.com/?q=Subhash+nagar+jeedimetla+119lp",
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
        serviceBorder: "border-l-purple-500",
        badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        btnColor: "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20",
        isMain: false,
        Icon: Church,
        iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      },
      {
        id: "bahadur",
        name: isTelugu
          ? "బహదూర్‌పల్లి నగర్ బ్రాంచ్"
          : isHindi
          ? "बहादुरपल्ली नगर शाखा"
          : "Bahadurpally Nagar Branch",
        title: t.services?.bahadur?.title || "Bahadurpally Afternoon Service",
        description: `${t.services?.bahadur?.desc || "Afternoon worship and fellowship at our Bahadurpally location."} ${t.services?.bahadur?.tuesdayDesc || ""}`,
        address: isTelugu
          ? "బహదూర్‌పల్లి, హైదరాబాద్, తెలంగాణ 500043"
          : isHindi
          ? "बहादुरपल्ली, हैदराबाद, तेलंगाना 500043"
          : "Bahadurpally, Hyderabad, Telangana 500043",
        phone: "+91 97040 90069",
        mapUrl: "https://maps.google.com/?q=17.567689,78.443963",
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
        serviceBorder: "border-l-emerald-500",
        badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20",
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
    ).map((b) => ({
      id: b.id,
      name: b.name.endsWith("Branch") ? b.name : `${b.name} Branch`,
      title: `${b.name} Service & Fellowship`,
      description: `Worship, community outreach, and prayer services at our ${b.name} location.`,
      address: b.name,
      phone: "+91 97040 90069",
      mapUrl: `https://maps.google.com/?q=${encodeURIComponent(b.name)}`,
      services: [
        {
          day: isTelugu ? "ఆదివారం" : isHindi ? "रविवार" : "Sunday",
          time: "10:00 AM",
          type: isTelugu ? "ఆరాధన సేవ" : isHindi ? "आराधना सेवा" : "Worship Service",
        },
      ],
      serviceBorder: "border-l-amber-500",
      badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      btnColor: "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20",
      isMain: false,
      Icon: MapIcon,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    }));

    return [...defaultBranches, ...extraBranches];
  };

  const branches = getBranchData();

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

      {/* 🏙️ Main Locations Grid */}
      <main className="container mx-auto px-4 py-16 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {branches.map((branch) => {
            const BranchIcon = branch.Icon;
            return (
              <div
                key={branch.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${branch.iconBg}`}>
                        <BranchIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
                          {branch.name}
                        </h2>
                      </div>
                    </div>
                    {branch.isMain && (
                      <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold border border-amber-500/20 uppercase tracking-wider">
                        {isTelugu ? "ప్రధాన మందిరం" : isHindi ? "मुख्य Sanctuary" : "Main Hub"}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                    {branch.description}
                  </p>

                  {/* Service Schedule */}
                  <div className="space-y-3 mb-6">
                    <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-purple-500" />
                      {isTelugu ? "ఆరాధన సమయాలు" : isHindi ? "आराधना समय" : "Service Schedule"}
                    </h3>
                    <div className="space-y-2.5">
                      {branch.services.map((srv: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 border-l-4 ${branch.serviceBorder} flex items-center justify-between text-xs`}
                        >
                          <span className="font-bold text-slate-900 dark:text-white">
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
                  <div className="mb-6 text-xs sm:text-sm space-y-2">
                    <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-semibold pt-1">
                      <Phone className="w-4 h-4 text-purple-500 shrink-0" />
                      <a href="tel:+919704090069" className="hover:text-purple-600 transition-colors">
                        +91 97040 90069 (Senior Pastor)
                      </a>
                    </div>
                  </div>
                </div>

                {/* Direct Google Maps Navigation Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <a
                    href={branch.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3.5 px-4 rounded-xl ${branch.btnColor} text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98`}
                  >
                    <Navigation className="w-4 h-4" />
                    <span>{isTelugu ? "గూగుల్ మ్యాప్‌లో దిశలను పొందండి" : isHindi ? "गूगल मैप्स पर दिशा-निर्देश प्राप्त करें" : "Get Directions on Google Maps"}</span>
                  </a>
                </div>
              </div>
            );
          })}
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