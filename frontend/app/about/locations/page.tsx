"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MapPin, Clock, Phone, Navigation, ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LocationsPage() {
  const { t, language } = useLanguage();

  const isTelugu = language === "te";
  const isHindi = language === "hi";

  const getBranchData = () => {
    return [
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
        gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
        accentColor: "text-blue-550 dark:text-blue-400",
        btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
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
          ? "सुभाष नगर, जीडीमेटला, एलपी 119, हैदराबाद, तेलंगाना 500055"
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
        gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
        accentColor: "text-purple-650 dark:text-purple-400",
        btnColor: "bg-purple-600 hover:bg-purple-700 text-white",
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
        gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
        accentColor: "text-emerald-650 dark:text-emerald-400",
        btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
      },
    ];
  };

  const branches = getBranchData();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm transition-all text-xs font-semibold hover:-translate-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {isTelugu ? "తిరిగి వెళ్ళండి" : isHindi ? "वापस जाएं" : "Back to About"}
          </Link>
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

      {/* Locations Main Grid */}
      <main className="container mx-auto px-4 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {branches.map((branch) => (
            <motion.article
              key={branch.id}
              variants={itemVariants}
              className="group relative bg-white dark:bg-white/[0.02] backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-white/[0.06] shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Gradient Banner decoration */}
              <div className={`absolute top-0 inset-x-0 h-4 bg-gradient-to-r ${branch.gradient}`} />

              <div className="p-8">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className={`w-5 h-5 ${branch.accentColor}`} />
                    <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                      {isTelugu ? "బ్రాంచ్" : isHindi ? "ब्रांच" : "Branch"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {branch.name}
                  </h2>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">
                  {branch.description}
                </p>

                {/* Service Times Block */}
                <div className="mb-8">
                  <h3 className="text-xs uppercase font-black text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {isTelugu ? "ఆరాధన సమయాలు" : isHindi ? "आराधना समय" : "Service Schedule"}
                  </h3>
                  <div className="space-y-3">
                    {branch.services.map((srv, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] p-3 rounded-2xl flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full">
                            {srv.day}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {srv.time}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-300">
                          {srv.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address Block */}
                <div className="mb-6">
                  <h3 className="text-xs uppercase font-black text-slate-400 tracking-wider mb-2">
                    {isTelugu ? "చిరునామా" : isHindi ? "पता" : "Address"}
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    {branch.address}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-8 pt-0 border-t border-slate-100 dark:border-white/[0.04] mt-auto">
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <a
                    href={branch.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-bold transition-all hover:scale-102 active:scale-98"
                  >
                    <Navigation className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    {isTelugu ? "రూట్ మ్యాప్" : isHindi ? "मार्ग नक्शा" : "Directions"}
                  </a>

                  <a
                    href={`tel:${branch.phone}`}
                    className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl ${branch.btnColor} text-xs font-bold transition-all hover:scale-102 active:scale-98 shadow-sm`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {isTelugu ? "కాల్ చేయండి" : isHindi ? "कॉल करें" : "Contact"}
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

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
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-6">
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
