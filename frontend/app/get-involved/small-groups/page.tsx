"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Heart,
  Coffee,
  BookOpen,
  Calendar,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  X,
  CheckCircle2,
  Send,
  PlusCircle,
  MessageSquare,
  UserCheck,
  ChevronRight,
  Flame,
  Globe
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";

export default function SmallGroupsPage() {
  const { language, t } = useLanguage();
  const sg = (t as any)?.pages?.smallGroups || {};

  // Interactive filter & search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDay, setSelectedDay] = useState("all");

  // Modal states
  const [activeModalGroup, setActiveModalGroup] = useState<any | null>(null);
  const [isJoinSuccess, setIsJoinSuccess] = useState(false);
  const [joinForm, setJoinForm] = useState({ name: "", email: "", phone: "", message: "" });

  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [isLeaderSuccess, setIsLeaderSuccess] = useState(false);
  const [leaderForm, setLeaderForm] = useState({ name: "", email: "", phone: "", groupIdea: "" });

  // Localized categories
  const categories = useMemo(
    () => [
      { id: "all", label: language === "te" ? "అన్ని గ్రూపులు" : language === "hi" ? "सभी समूह" : "All Groups" },
      { id: "young-adults", label: language === "te" ? "యువజనులు" : language === "hi" ? "युवा" : "Young Adults" },
      { id: "women", label: language === "te" ? "స్త్రీలు" : language === "hi" ? "महिलाएं" : "Women" },
      { id: "men", label: language === "te" ? "పురుషులు" : language === "hi" ? "पुरुष" : "Men" },
      { id: "couples", label: language === "te" ? "దంపతులు" : language === "hi" ? "दंपति" : "Couples" },
      { id: "bible-study", label: language === "te" ? "బైబిల్ స్టడీ" : language === "hi" ? "बाइबिल अध्ययन" : "Bible Study" },
      { id: "prayer", label: language === "te" ? "ప్రార్థన" : language === "hi" ? "प्रार्थना" : "Prayer" },
    ],
    [language]
  );

  // Localized days
  const days = useMemo(
    () => [
      { id: "all", label: language === "te" ? "అన్ని రోజులు" : language === "hi" ? "सभी दिन" : "All Days" },
      { id: "tue", label: language === "te" ? "మంగళవారం" : language === "hi" ? "मंगलवार" : "Tuesdays" },
      { id: "wed", label: language === "te" ? "బుధవారం" : language === "hi" ? "बुधवार" : "Wednesdays" },
      { id: "thu", label: language === "te" ? "గురువారం" : language === "hi" ? "गुरुवार" : "Thursdays" },
      { id: "fri", label: language === "te" ? "శుక్రవారం" : language === "hi" ? "शुक्रवार" : "Fridays" },
      { id: "sat", label: language === "te" ? "శనివారం" : language === "hi" ? "शनिवार" : "Saturdays" },
    ],
    [language]
  );

  // Localized groups list
  const groups = useMemo(
    () => [
      {
        id: "young-adults",
        categoryId: "young-adults",
        dayId: "fri",
        title: language === "te" ? "యువజన సహవాసం" : language === "hi" ? "युवा संगति" : (sg.youngAdults || "Young Adults Fellowship"),
        categoryLabel: language === "te" ? "యువజనులు" : language === "hi" ? "युवा" : "Young Adults",
        dayLabel: language === "te" ? "శుక్రవారం" : language === "hi" ? "शुक्रवार" : "Fridays",
        description:
          language === "te"
            ? "18-30 సంవత్సరాల యువతీయువకులు విశ్వాసంలో ఎదగడానికి, సవాళ్లను కలిసి ఎదుర్కోవడానికి మరియు నిజమైన స్నేహాన్ని పెంపొందించుకోవడానికి ఒక శక్తివంతమైన వేదిక."
            : language === "hi"
            ? "18-30 वर्ष के युवाओं के लिए विश्वास में बढ़ने, जीवन की चुनौतियों पर चर्चा करने और वास्तविक मित्रता बनाने का एक जीवंत मंच।"
            : (sg.youngAdultsDesc || "A vibrant community for ages 18-30 to grow in faith, share real talks, and navigate life together."),
        time: language === "te" ? "ప్రతి శుక్రవారం సాయంత్రం 7:00 గంటలకు" : language === "hi" ? "हर शुक्रवार शाम 7:00 बजे" : "Fridays at 7:00 PM",
        location: language === "te" ? "ఫెలోషిప్ హాల్ (షాపూర్ నగర్)" : language === "hi" ? "फ़ेलोशिप हॉल (शापुर नगर)" : "Fellowship Hall (Shapur)",
        format: language === "te" ? "ప్రత్యక్ష కూటం" : language === "hi" ? "प्रत्यक्ष बैठक" : "In-Person",
        leader: language === "te" ? "డేనియల్ & బృందం" : language === "hi" ? "डेनियल और टीम" : "Daniel & Team",
        members: language === "te" ? "18 సభ్యులు" : language === "hi" ? "18 सदस्य" : "18 Members",
        icon: Users,
      },
      {
        id: "women-fellowship",
        categoryId: "women",
        dayId: "wed",
        title: language === "te" ? "స్త్రీల కృపా సహవాసం" : language === "hi" ? "महिला अनुग्रह संगति" : (sg.women || "Women's Grace Fellowship"),
        categoryLabel: language === "te" ? "స్త్రీలు" : language === "hi" ? "महिलाएं" : "Women",
        dayLabel: language === "te" ? "బుధవారం" : language === "hi" ? "बुधवार" : "Wednesdays",
        description:
          language === "te"
            ? "ప్రార్థన, వాక్య ధ్యానం మరియు ఆత్మీయ ప్రోత్సాహం ద్వారా స్త్రీలు తమ దైవిక పిలుపులో మరియు కుటుంబ బాధ్యతలలో స్థిరపడటానికి సహాయపడుతుంది."
            : language === "hi"
            ? "प्रार्थना, वचन अध्ययन और प्रोत्साहन के माध्यम से महिलाओं को उनके ईश्वरीय उद्देश्य में सशक्त बनाना।"
            : (sg.womenDesc || "Empowering women to walk in their God-given identity and purpose through prayer, study, and encouragement."),
        time: language === "te" ? "ప్రతి బుధవారం ఉదయం 10:00 గంటలకు" : language === "hi" ? "हर बुधवार सुबह 10:00 बजे" : "Wednesdays at 10:00 AM",
        location: language === "te" ? "రూమ్ 204 (సుభాష్ నగర్)" : language === "hi" ? "कक्ष 204 (सुभाष नगर)" : "Room 204 (Subhash Nagar)",
        format: language === "te" ? "ప్రత్యక్ష కూటం" : language === "hi" ? "प्रत्यक्ष बैठक" : "In-Person",
        leader: language === "te" ? "సిస్టర్ మేరీ & హన్నా" : language === "hi" ? "सिस्टर मैरी और हन्ना" : "Sister Mary & Hannah",
        members: language === "te" ? "24 సభ్యులు" : language === "hi" ? "24 सदस्य" : "24 Members",
        icon: Heart,
      },
      {
        id: "mens-ministry",
        categoryId: "men",
        dayId: "sat",
        title: language === "te" ? "పురుషుల ఆత్మీయ కూటమి" : language === "hi" ? "सत्यनिष्ठ पुरुष संगति" : (sg.men || "Men of Integrity"),
        categoryLabel: language === "te" ? "పురుషులు" : language === "hi" ? "पुरुष" : "Men",
        dayLabel: language === "te" ? "శనివారం" : language === "hi" ? "शनिवार" : "Saturdays",
        description:
          language === "te"
            ? "కుటుంబంలో, సమాజంలో మరియు సంఘంలో పురుషులు నమ్మకమైన నాయకులుగా జీవించడానికి ఆత్మీయ బలాన్ని మరియు మార్గదర్శకత్వాన్ని అందిస్తుంది."
            : language === "hi"
            ? "पुरुषों को अपने घर, कलीसिया, करियर और समाज में विश्वासयोग्यता से नेतृत्व करने के लिए मजबूत बनाना।"
            : (sg.menDesc || "Equipping and strengthening men to lead faithfully in their homes, church, careers, and community."),
        time: language === "te" ? "ప్రతి శనివారం ఉదయం 7:00 గంటలకు" : language === "hi" ? "हर शनिवार सुबह 7:00 बजे" : "Saturdays at 7:00 AM",
        location: language === "te" ? "ప్రధాన ప్రార్థనా మందిరం (జీడిమెట్ల)" : language === "hi" ? "मुख्य प्रार्थना भवन (जीडीमेटला)" : "Main Sanctuary (Jeedimetla)",
        format: language === "te" ? "ప్రత్యక్ష కూటం" : language === "hi" ? "प्रत्यक्ष बैठक" : "In-Person",
        leader: language === "te" ? "బ్రదర్ జోసెఫ్ & మార్క్" : language === "hi" ? "ब्रदर जोसेफ और मार्क" : "Brother Joseph & Mark",
        members: language === "te" ? "20 సభ్యులు" : language === "hi" ? "20 सदस्य" : "20 Members",
        icon: ShieldCheck,
      },
      {
        id: "couples-connection",
        categoryId: "couples",
        dayId: "sat",
        title: language === "te" ? "దంపతుల అనుబంధ కూటమి" : language === "hi" ? "दंपति सहभागिता" : (sg.couples || "Couples Connection"),
        categoryLabel: language === "te" ? "దంపతులు" : language === "hi" ? "दंपति" : "Couples",
        dayLabel: language === "te" ? "శనివారం" : language === "hi" ? "शनिवार" : "Saturdays",
        description:
          language === "te"
            ? "బైబిల్ సూత్రాల ప్రకారం క్రీస్తు కేంద్రీకృత వివాహ బంధాన్ని నిర్మించుకోవడానికి, కుటుంబ సమస్యలను అధిగమించడానికి మరియు ఒకరినొకరు ప్రోత్సహించుకోవడానికి వేదిక."
            : language === "hi"
            ? "बाइबिल के सिद्धांतों और संगति के माध्यम से मसीह-केंद्रित विवाहों का निर्माण और मजबूती।"
            : (sg.couplesDesc || "Building Christ-centered marriages through biblically grounded principles, dates, and supportive fellowship."),
        time: language === "te" ? "నెలకు ఒకసారి, 2వ శనివారం సాయంత్రం 6:00 గంటలకు" : language === "hi" ? "माह में एक बार, दूसरे शनिवार शाम 6:00 बजे" : "Monthly, 2nd Saturday at 6:00 PM",
        location: language === "te" ? "ఫ్యామిలీ సెంటర్ / గృహ కూటం" : language === "hi" ? "पारिवारिक केंद्र / गृह संगति" : "Family Center / Rotational",
        format: language === "te" ? "హైబ్రిడ్ (ప్రత్యక్ష & ఆన్‌లైన్)" : language === "hi" ? "हाइब्रिड (प्रत्यक्ष और ऑनलाइन)" : "Hybrid",
        leader: language === "te" ? "పాస్టర్ డేవిడ్ & గ్రేస్" : language === "hi" ? "पास्टर डेविड और ग्रेस" : "Pastor David & Grace",
        members: language === "te" ? "15 జంటలు" : language === "hi" ? "15 जोड़े" : "15 Couples",
        icon: Sparkles,
      },
      {
        id: "midweek-bible-study",
        categoryId: "bible-study",
        dayId: "thu",
        title: language === "te" ? "మధ్యవార వచన పఠన బైబిల్ స్టడీ" : language === "hi" ? "साप्ताहिक पद-दर-पद बाइबिल अध्ययन" : (sg.bibleStudy || "Midweek Verse-by-Verse"),
        categoryLabel: language === "te" ? "బైబిల్ స్టడీ" : language === "hi" ? "बाइबिल अध्ययन" : "Bible Study",
        dayLabel: language === "te" ? "గురువారం" : language === "hi" ? "गुरुवार" : "Thursdays",
        description:
          language === "te"
            ? "లేఖనాలను లోతుగా పరిశీలిస్తూ, ప్రాచీన సత్యాలను దైనందిన జీవితంలో ఆచరించడానికి ఇంటరాక్టివ్ అధ్యయన కూటమి."
            : language === "hi"
            ? "गहन चर्चा और व्यावहारिक अनुप्रयोग के साथ पद-दर-पद पवित्र शास्त्र का अध्ययन।"
            : (sg.bibleStudyDesc || "Interactive verse-by-verse scripture exploration with engaging discussion and practical application."),
        time: language === "te" ? "ప్రతి గురువారం సాయంత్రం 6:30 గంటలకు" : language === "hi" ? "हर गुरुवार शाम 6:30 बजे" : "Thursdays at 6:30 PM",
        location: language === "te" ? "ఆన్‌లైన్ (Zoom & YouTube Live)" : language === "hi" ? "ऑनलाइन (Zoom और YouTube Live)" : "Online (Zoom)",
        format: language === "te" ? "ఆన్‌లైన్" : language === "hi" ? "ऑनलाइन" : "Online",
        leader: language === "te" ? "పాస్టర్ కుర్రా & పెద్దలు" : language === "hi" ? "पास्टर कुर्रा और प्राचीन" : "Pastor Kurra & Elders",
        members: language === "te" ? "45+ ఆన్‌లైన్" : language === "hi" ? "45+ ऑनलाइन" : "45 Online",
        icon: BookOpen,
      },
      {
        id: "prayer-warriors",
        categoryId: "prayer",
        dayId: "tue",
        title: language === "te" ? "విజ్ఞాపన ప్రార్థన యోధులు" : language === "hi" ? "प्रार्थना योद्धा" : (sg.prayer || "Prayer Warriors"),
        categoryLabel: language === "te" ? "ప్రార్థన" : language === "hi" ? "प्रार्थना" : "Prayer",
        dayLabel: language === "te" ? "మంగళవారం" : language === "hi" ? "मंगलवार" : "Tuesdays",
        description:
          language === "te"
            ? "సంఘం, దేశం, రోగుల స్వస్థత మరియు ఆత్మీయ పునరుజ్జీవనం కొరకు నిరంతరం విజ్ఞాపన చేసే అంకితభావం గల ప్రార్థన బృందం."
            : language === "hi"
            ? "कलीसिया, राष्ट्र, बीमारों की चंगाई और आत्मिक जागृति के लिए मध्यस्थता करने वाला समर्पित समूह।"
            : (sg.prayerDesc || "Dedicated time of intercession for the church, sick members, missionaries, and revival in our nation."),
        time: language === "te" ? "ప్రతి మంగళవారం సాయంత్రం 6:00 గంటలకు" : language === "hi" ? "हर मंगलवार शाम 6:00 बजे" : "Tuesdays at 6:00 PM",
        location: language === "te" ? "ప్రార్థన గది (బహదూర్‌పల్లి)" : language === "hi" ? "प्रार्थना कक्ष (बहादुरपल्ली)" : "Prayer Tower Room (Bahadurpally)",
        format: language === "te" ? "ప్రత్యక్ష కూటం" : language === "hi" ? "प्रत्यक्ष बैठक" : "In-Person",
        leader: language === "te" ? "పాస్టర్ శామ్యూల్ & ప్రార్థన బృందం" : language === "hi" ? "पास्टर सैमुअल और प्रार्थना टीम" : "Pastor Samuel & Prayer Team",
        members: language === "te" ? "30 సభ్యులు" : language === "hi" ? "30 सदस्य" : "30 Members",
        icon: Flame,
      },
    ],
    [language, sg]
  );

  // Filtered groups
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchesCategory = selectedCategory === "all" || group.categoryId === selectedCategory;
      const matchesDay = selectedDay === "all" || group.dayId === selectedDay;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        group.title.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query) ||
        group.location.toLowerCase().includes(query) ||
        group.leader.toLowerCase().includes(query);

      return matchesCategory && matchesDay && matchesSearch;
    });
  }, [groups, selectedCategory, selectedDay, searchQuery]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoinSuccess(true);
    setTimeout(() => {
      setIsJoinSuccess(false);
      setActiveModalGroup(null);
      setJoinForm({ name: "", email: "", phone: "", message: "" });
    }, 2500);
  };

  const handleLeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLeaderSuccess(true);
    setTimeout(() => {
      setIsLeaderSuccess(false);
      setIsLeaderModalOpen(false);
      setLeaderForm({ name: "", email: "", phone: "", groupIdea: "" });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-purple-500 selection:text-white">
      {/* 🧭 Global Navigation Bar */}
      <Navbar />

      {/* 🌌 Hero Section - Adaptive Light/Dark Design */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden border-b border-purple-100/80 dark:border-slate-800/80 shadow-sm transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-25 dark:opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-400/25 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-400/25 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Back to Home Button */}
            <div className="mb-6 flex justify-center">
              <BackToHome label={(t as any)?.nav?.home || (language === "te" ? "హోమ్" : language === "hi" ? "होम" : "Home")} />
            </div>

            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/90 dark:bg-white/10 backdrop-blur-md border border-purple-200/90 dark:border-white/20 text-purple-800 dark:text-purple-200 font-extrabold text-xs sm:text-sm mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-300" />
              <span>
                {language === "te"
                  ? "కలిసి జీవించడం ఆశీర్వాదం • కనెక్ట్ అవ్వండి & ఎదగండి"
                  : language === "hi"
                  ? "एक साथ जीवन जीना बेहतर है • जुड़ें और बढ़ें"
                  : "Life is Better Together • Connect & Grow"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 font-serif text-slate-900 dark:text-white">
              {sg.title || (language === "te" ? "చిన్న సమూహాలు (సెల్ గ్రూపులు)" : language === "hi" ? "छोटे समूह (सेल ग्रुप्स)" : "Small Groups")}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
              {sg.subtitle ||
                (language === "te"
                  ? "విశ్వాసులతో కలిసి సహవాసం చేస్తూ, ఆత్మీయ ప్రయాణాన్ని పంచుకుంటూ, కుటుంబ వాతావరణంలో శాశ్వత స్నేహాలను నిర్మించుకోండి."
                  : language === "hi"
                  ? "विश्वासियो से जुड़ें, आत्मिक यात्रा साझा करें और एक स्वागतयोग्य गृह समूह में आजीवन मित्रता बनाएं।"
                  : "Connect with believers, share faith journeys, and build lifelong friendships in a welcoming home group.")}
            </p>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-3xl mx-auto pt-6 border-t border-purple-200/60 dark:border-slate-800">
              <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-md border border-purple-100 dark:border-slate-800 shadow-md shadow-purple-900/5 dark:shadow-black/20 hover:scale-[1.02] transition-transform">
                <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mb-0.5">6+</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "చురుకైన గ్రూపులు" : language === "hi" ? "सक्रिय समूह" : "Active Groups"}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-md border border-purple-100 dark:border-slate-800 shadow-md shadow-purple-900/5 dark:shadow-black/20 hover:scale-[1.02] transition-transform">
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-0.5">150+</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "సహవాస సభ్యులు" : language === "hi" ? "समूह सदस्य" : "Group Members"}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-md border border-purple-100 dark:border-slate-800 shadow-md shadow-purple-900/5 dark:shadow-black/20 hover:scale-[1.02] transition-transform">
                <div className="text-2xl sm:text-3xl font-black text-pink-600 dark:text-pink-400 mb-0.5">3</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "ప్రాంతీయ కేంద్రాలు" : language === "hi" ? "केंद्रीय स्थान" : "Hub Locations"}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-md border border-purple-100 dark:border-slate-800 shadow-md shadow-purple-900/5 dark:shadow-black/20 hover:scale-[1.02] transition-transform">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-0.5">100%</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "హృదయపూర్వక ఆహ్వానం" : language === "hi" ? "खुला स्वागत" : "Welcome"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💡 Why Join Section */}
      <section className="py-16 md:py-24 relative z-10 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 font-serif">
              {sg.whyTitle || (language === "te" ? "చిన్న సమూహంలో ఎందుకు చేరాలి?" : language === "hi" ? "छोटे समूह में क्यों शामिल हों?" : "Why Join a Small Group?")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed font-light">
              {sg.whyDesc ||
                (language === "te"
                  ? "మనం ఏకాకులుగా జీవించడానికి సృష్టించబడలేదు. సెల్ గ్రూపులు మన సంఘానికి జీవనాడి—ఇక్కడే నిజమైన సంబంధాలు ఏర్పడతాయి మరియు ఆత్మీయ ఎదుగుదల సాధ్యమవుతుంది."
                  : language === "hi"
                  ? "हम अकेले चलने के लिए नहीं बनाए गए हैं। छोटे समूह हमारी कलीसिया की धड़कन हैं—जहां वास्तविक संबंध बनते हैं और आत्मिक विकास होता है।"
                  : "We were created for community. Small groups are where genuine friendships form, spiritual growth happens, and support is found.")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-serif">
                {sg.connectTitle || (language === "te" ? "యథార్థమైన అనుబంధం" : language === "hi" ? "सच्चा जुड़ाव" : "Genuine Connection")}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                {sg.connectDesc ||
                  (language === "te"
                    ? "విశ్వాసంలో ఉన్నవారితో బలమైన స్నేహాన్ని నిర్మించుకోండి మరియు రోజువారీ జీవితంలో పరస్పర సహకారాన్ని పొందండి."
                    : language === "hi"
                    ? "विश्वास साझा करने वाले लोगों के साथ स्थायी मित्रता बनाएं और रोजमर्रा के जीवन में समर्थन पाएं।"
                    : "Build authentic relationships with people who share your values and support you in everyday life.")}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-serif">
                {sg.growTitle || (language === "te" ? "ఆత్మీయ ఎదుగుదల" : language === "hi" ? "आत्मिक विकास" : "Spiritual Growth")}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                {sg.growDesc ||
                  (language === "te"
                    ? "స్నేహపూర్వక వాతావరణంలో దేవుని వాక్యాన్ని లోతుగా అర్థం చేసుకుంటూ ఆధ్యాత్మికంగా పరిపక్వత చెందండి."
                    : language === "hi"
                    ? "एक सहायक और खुले वातावरण में परमेश्वर के वचन की अपनी समझ को गहरा करें।"
                    : "Deepen your understanding of God's Word in an open, conversational, and encouraging setting.")}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-2xl bg-pink-600 text-white shadow-lg shadow-pink-600/30 flex items-center justify-center mb-6">
                <Coffee className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-serif">
                {sg.supportTitle || (language === "te" ? "ప్రార్థన & ఆదరణ" : language === "hi" ? "प्रार्थना और देखभाल" : "Prayer & Care")}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                {sg.supportDesc ||
                  (language === "te"
                    ? "జీవితంలోని సంతోషాలలో మరియు కష్టాలలో విశ్వాస కుటుంబంగా ఒకరికొకరు తోడుగా నిలబడండి."
                    : language === "hi"
                    ? "जीवन के सुख और दुख में एक परवाह करने वाले विश्वास परिवार के साथ मिलकर चलें।"
                    : "Walk through life's celebrations and trials together with a caring family of faith.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🔍 Group Directory Section */}
      <section className="py-16 md:py-24 bg-slate-100/70 dark:bg-slate-900/50 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 font-serif">
                {sg.find || (language === "te" ? "మీ గ్రూపును కనుగొనండి" : language === "hi" ? "अपना समूह खोजें" : "Find Your Group")}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                {language === "te"
                  ? "వర్గం, సమావేశమయ్యే రోజు లేదా ప్రాంతం ఆధారంగా గ్రూపులను అన్వేషించండి."
                  : language === "hi"
                  ? "श्रेणी, बैठक के दिन या प्रारूप के अनुसार समूहों का अन्वेषण करें।"
                  : "Explore our groups by category, meeting day, or format."}
              </p>
            </div>

            {/* Live Search Bar */}
            <div className="relative min-w-[280px] sm:min-w-[340px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={language === "te" ? "గ్రూపులు, ప్రాంతాలు, అంశాలను శోధించండి..." : language === "hi" ? "समूह, स्थान, विषय खोजें..." : "Search groups, topics, locations..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6 pb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> {language === "te" ? "వర్గం:" : language === "hi" ? "श्रेणी:" : "Category:"}
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/20 scale-105"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Day Filter Sub-row */}
          <div className="flex flex-wrap items-center gap-2 mb-10 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider mr-1">{language === "te" ? "వారం రోజు:" : language === "hi" ? "दिन:" : "Day:"}</span>
            {days.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDay(d.id)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  selectedDay === d.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Group Cards Grid */}
          {filteredGroups.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGroups.map((group) => {
                const IconComponent = group.icon;
                return (
                  <div
                    key={group.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1 group"
                  >
                    {/* Header Banner - Elegant Light & Dark Gradient Accent */}
                    <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/40 to-slate-50 dark:from-slate-800/90 dark:via-slate-800 dark:to-slate-850 p-6 border-b border-purple-100/90 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200/90 dark:border-purple-700/50 text-[11px] font-extrabold uppercase tracking-wider mb-2 shadow-xs">
                          {group.categoryLabel}
                        </span>
                        <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white leading-tight">
                          {group.title}
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4 text-xs">
                          <span className="px-2.5 py-1 rounded-lg bg-purple-50/70 dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-slate-700 font-semibold">
                            {group.format}
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            {group.members}
                          </span>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                          {group.description}
                        </p>
                      </div>

                      <div>
                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 mb-6">
                          <div className="flex items-center gap-2.5">
                            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{group.time}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                            <span>{group.location}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                            <span>
                              {language === "te" ? "నాయకత్వం: " : language === "hi" ? "नेतृत्व: " : "Led by: "}
                              <strong className="text-slate-800 dark:text-slate-200 font-bold">{group.leader}</strong>
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveModalGroup(group)}
                          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-98"
                        >
                          <span>{language === "te" ? "ఈ గ్రూపులో చేరండి" : language === "hi" ? "इस समूह में शामिल हों" : "Join This Group"}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-lg mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {language === "te" ? "గ్రూపులు కనుగొనబడలేదు" : language === "hi" ? "कोई समूह नहीं मिला" : "No groups match your filters"}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                {language === "te" ? "దయచేసి మీ శోధనను మార్చండి లేదా ఫిల్టర్‌లను రీసెట్ చేయండి." : language === "hi" ? "कृपया अपनी खोज बदलें या फ़िल्टर रीसेट करें।" : "Try clearing your search query or selecting a different category."}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedDay("all");
                }}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors shadow-md"
              >
                {language === "te" ? "ఫిల్టర్‌లను రీసెట్ చేయండి" : language === "hi" ? "फ़िल्टर रीसेट करें" : "Reset All Filters"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 🚀 Start a Group Section - Adaptive Light/Dark CTA Card */}
      <section className="py-20 relative z-10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border-t border-purple-100/80 dark:border-slate-800/80">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-gradient-to-br from-purple-50/90 via-indigo-50/50 to-white dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 border border-purple-200/90 dark:border-purple-700/40 rounded-3xl p-8 sm:p-12 text-center shadow-xl shadow-purple-900/5 dark:shadow-black/30 relative overflow-hidden text-slate-900 dark:text-white">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 border border-purple-400 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center mx-auto mb-6">
              <PlusCircle className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 font-serif text-slate-900 dark:text-white">
              {sg.startTitle || (language === "te" ? "చిన్న సమూహాన్ని నడిపించాలనుకుంటున్నారా?" : language === "hi" ? "एक छोटे समूह का नेतृत्व करने में रुचि रखते हैं?" : "Interested in Leading a Small Group?")}
            </h2>

            <p className="text-slate-600 dark:text-slate-200 text-base sm:text-lg max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              {sg.startDesc ||
                (language === "te"
                  ? "మీరు విజయవంతంగా సమూహాన్ని నడిపించడానికి అవసరమైన శిక్షణ, అధ్యయన సామగ్రి మరియు నిరంతర సహకారాన్ని మేము అందిస్తాము."
                  : language === "hi"
                  ? "हम आपको एक संपन्न सामुदायिक समूह का नेतृत्व करने में मदद करने के लिए प्रशिक्षण, अध्ययन सामग्री और निरंतर मार्गदर्शन प्रदान करते हैं।"
                  : "We provide training, study materials, and ongoing coaching to help you facilitate a thriving community group.")}
            </p>

            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10 text-left">
              <div className="p-5 rounded-2xl bg-white/95 dark:bg-white/10 backdrop-blur-md border border-purple-100 dark:border-white/15 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-wider mb-1">{language === "te" ? "దశ 1" : language === "hi" ? "चरण 1" : "Step 1"}</div>
                <div className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">{language === "te" ? "ఆసక్తిని తెలియజేయండి" : language === "hi" ? "रुचि व्यक्त करें" : "Express Interest"}</div>
                <div className="text-xs text-slate-500 dark:text-slate-300 font-medium">{language === "te" ? "చిన్న దరఖాస్తును సమర్పించండి" : language === "hi" ? "लीडर फॉर्म भरें" : "Submit a quick leader form"}</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/95 dark:bg-white/10 backdrop-blur-md border border-purple-100 dark:border-white/15 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-wider mb-1">{language === "te" ? "దశ 2" : language === "hi" ? "चरण 2" : "Step 2"}</div>
                <div className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">{language === "te" ? "అవగాహన & శిక్షణ" : language === "hi" ? "प्रशिक्षण प्राप्त करें" : "Orientation"}</div>
                <div className="text-xs text-slate-500 dark:text-slate-300 font-medium">{language === "te" ? "అధ్యయన గైడ్‌లు & మద్దతు పొందండి" : language === "hi" ? "गाइड और सहयोग पाएं" : "Receive study guides & support"}</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/95 dark:bg-white/10 backdrop-blur-md border border-purple-100 dark:border-white/15 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-wider mb-1">{language === "te" ? "దశ 3" : language === "hi" ? "चरण 3" : "Step 3"}</div>
                <div className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">{language === "te" ? "గ్రూపును ప్రారంభించండి" : language === "hi" ? "समूह शुरू करें" : "Launch Your Group"}</div>
                <div className="text-xs text-slate-500 dark:text-slate-300 font-medium">{language === "te" ? "స్నేహితులు & ఇరుగుపొరుగు వారిని ఆహ్వానించండి" : language === "hi" ? "मित्रों को आमंत्रित करें" : "Gather friends & neighbors"}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setIsLeaderModalOpen(true)}
                className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 group hover:scale-105"
              >
                <span>{sg.becomeLeader || (language === "te" ? "గ్రూప్ లీడర్‌గా దరఖాస్తు చేసుకోండి" : language === "hi" ? "ग्रुप लीडर के लिए आवेदन करें" : "Apply to Lead a Group")}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                href="/contact"
                className="px-8 py-3.5 bg-white dark:bg-white/10 hover:bg-purple-50 dark:hover:bg-white/20 text-slate-800 dark:text-white border border-purple-200/90 dark:border-white/20 rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-105"
              >
                <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                <span>{language === "te" ? "నాయకులను సంప్రదించండి" : language === "hi" ? "नेताओं से संपर्क करें" : "Contact Leaders"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🦶 Global Footer */}
      <Footer />

      {/* 📥 Join Group Modal */}
      {activeModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative">
              <button
                onClick={() => setActiveModalGroup(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs uppercase font-bold px-3 py-1 rounded-full bg-white/20 text-white mb-2 inline-block">
                {language === "te" ? "రిజిస్ట్రేషన్" : language === "hi" ? "पंजीकरण" : "Sign Up"}
              </span>
              <h3 className="text-2xl font-bold font-serif text-white">{activeModalGroup.title}</h3>
              <p className="text-xs text-purple-100 mt-1">{activeModalGroup.time} • {activeModalGroup.location}</p>
            </div>

            <div className="p-6 text-slate-900 dark:text-slate-100">
              {isJoinSuccess ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {language === "te" ? "మీ అభ్యర్థన అందింది!" : language === "hi" ? "अनुरोध प्राप्त हुआ!" : "Request Received!"}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {language === "te"
                      ? `ధన్యవాదాలు, ${joinForm.name || "మిత్రమా"}! గ్రూప్ లీడర్ ${activeModalGroup.leader} త్వరలోనే సమావేశ వివరాలతో మిమ్మల్ని సంప్రదిస్తారు.`
                      : language === "hi"
                      ? `धन्यवाद, ${joinForm.name || "मित्र"}! समूह नेता ${activeModalGroup.leader} बैठक के विवरण के साथ आपसे संपर्क करेंगे।`
                      : `Thank you, ${joinForm.name || "friend"}! Group leader ${activeModalGroup.leader} will contact you with meeting details.`}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {language === "te" ? "పూర్తి పేరు *" : language === "hi" ? "पूरा नाम *" : "Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={joinForm.name}
                      onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {language === "te" ? "ఈమెయిల్ *" : language === "hi" ? "ईमेल *" : "Email Address *"}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={joinForm.email}
                        onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {language === "te" ? "ఫోన్ నంబర్ *" : language === "hi" ? "फोन नंबर *" : "Phone Number *"}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={joinForm.phone}
                        onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {language === "te" ? "ఏవైనా సందేహాలు లేదా ప్రార్థన అవసరాలు ఉన్నాయా? (ఐచ్ఛికం)" : language === "hi" ? "कोई प्रश्न या प्रार्थना निवेदन? (वैकल्पिक)" : "Any questions or prayer requests? (Optional)"}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={language === "te" ? "నేను గ్రూప్ గురించి మరింత తెలుసుకోవాలనుకుంటున్నాను..." : language === "hi" ? "मैं समूह के बारे में और जानना चाहता हूं..." : "I'd love to know more about..."}
                      value={joinForm.message}
                      onChange={(e) => setJoinForm({ ...joinForm, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>{language === "te" ? "ఆసక్తిని సమర్పించండి" : language === "hi" ? "आवेदन जमा करें" : "Submit Interest"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 👥 Leader Application Modal */}
      {isLeaderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative">
              <button
                onClick={() => setIsLeaderModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold font-serif text-white">
                {language === "te" ? "గ్రూప్ లీడర్‌షిప్ దరఖాస్తు" : language === "hi" ? "समूह नेतृत्व आवेदन" : "Group Leadership Application"}
              </h3>
              <p className="text-xs text-purple-100 mt-1">
                {language === "te" ? "కొత్త చిన్న సమూహాన్ని ప్రారంభించండి లేదా సహ-నాయకత్వం వహించండి." : language === "hi" ? "एक नया छोटा समूह शुरू करें या सह-नेतृत्व करें।" : "Start a new small group or co-lead an existing group."}
              </p>
            </div>

            <div className="p-6 text-slate-900 dark:text-slate-100">
              {isLeaderSuccess ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {language === "te" ? "దరఖాస్తు సమర్పించబడింది!" : language === "hi" ? "आवेदन जमा हो गया!" : "Application Submitted!"}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {language === "te"
                      ? "సేవ చేయడానికి ముందుకు వచ్చినందుకు ధన్యవాదాలు! మా శిష్యత్వ బృందం 48 గంటల్లో మిమ్మల్ని సంప్రదిస్తుంది."
                      : language === "hi"
                      ? "सेवा के लिए आगे आने के लिए धन्यवाद! हमारी शिष्यता टीम 48 घंटों के भीतर आपसे संपर्क करेगी।"
                      : "Thank you for stepping up to serve! Our Discipleship Team will reach out to you within 48 hours."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeaderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {language === "te" ? "పూర్తి పేరు *" : language === "hi" ? "पूरा नाम *" : "Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Connor"
                      value={leaderForm.name}
                      onChange={(e) => setLeaderForm({ ...leaderForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {language === "te" ? "ఈమెయిల్ *" : language === "hi" ? "ईमेल *" : "Email Address *"}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="sarah@example.com"
                        value={leaderForm.email}
                        onChange={(e) => setLeaderForm({ ...leaderForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {language === "te" ? "ఫోన్ నంబర్ *" : language === "hi" ? "फोन नंबर *" : "Phone Number *"}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={leaderForm.phone}
                        onChange={(e) => setLeaderForm({ ...leaderForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {language === "te" ? "మీరు ఎలాంటి గ్రూపును నడిపించాలనుకుంటున్నారు?" : language === "hi" ? "आप किस प्रकार के समूह का नेतृत्व करना चाहते हैं?" : "What type of group would you like to lead/start?"}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={language === "te" ? "ఉదా: యువ దంపతుల అధ్యయనం, కళాశాల విద్యార్థుల బైబిల్ స్టడీ, పరిసర ప్రాంత ప్రార్థన గ్రూప్..." : language === "hi" ? "उदा: युवा दंपत्ति अध्ययन, कॉलेज बाइबिल अध्ययन, पड़ोस प्रार्थना समूह..." : "e.g. Young Couples Study, College Bible Study, Neighborhood Prayer Group..."}
                      value={leaderForm.groupIdea}
                      onChange={(e) => setLeaderForm({ ...leaderForm, groupIdea: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>{language === "te" ? "దరఖాస్తును సమర్పించండి" : language === "hi" ? "आवेदन जमा करें" : "Submit Application"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
