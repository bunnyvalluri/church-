"use client";

import React, { useState, useMemo, useTransition } from "react";
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
  Home,
  HeartHandshake,
  Zap,
  RotateCcw,
  AlertCircle,
  Loader2,
  Check
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// ---------------------------------------------------------------------------
// Canonical Category Definitions with Language-Agnostic IDs & Icons
// ---------------------------------------------------------------------------
const CATEGORY_ITEMS = [
  { id: "all", key: "all", defaultLabel: "All Groups", icon: Users },
  { id: "young-adults", key: "youngAdults", defaultLabel: "Young Adults", icon: Zap },
  { id: "women", key: "women", defaultLabel: "Women", icon: Heart },
  { id: "men", key: "men", defaultLabel: "Men", icon: ShieldCheck },
  { id: "couples", key: "couples", defaultLabel: "Couples", icon: Sparkles },
  { id: "bible-study", key: "bibleStudy", defaultLabel: "Bible Study", icon: BookOpen },
  { id: "prayer", key: "prayer", defaultLabel: "Prayer", icon: Flame },
];

// ---------------------------------------------------------------------------
// Canonical Meeting Days with Language-Agnostic IDs
// ---------------------------------------------------------------------------
const DAY_ITEMS = [
  { id: "all", defaultLabel: "All Days", te: "అన్ని రోజులు", hi: "सभी दिन" },
  { id: "tue", defaultLabel: "Tuesdays", te: "మంగళవారం", hi: "मंगलवार" },
  { id: "wed", defaultLabel: "Wednesdays", te: "బుధవారం", hi: "बुधवार" },
  { id: "thu", defaultLabel: "Thursdays", te: "గురువారం", hi: "गुरुवार" },
  { id: "fri", defaultLabel: "Fridays", te: "శుక్రవారం", hi: "शुक्रवार" },
  { id: "sat", defaultLabel: "Saturdays", te: "శనివారం", hi: "शनिवार" },
];

export default function SmallGroupsPage() {
  const { language, t } = useLanguage();
  const sg = (t as any)?.pages?.smallGroups || {};

  // Concurrent UI transition hook for INP < 100ms
  const [isPending, startTransition] = useTransition();

  // Search and filter states (language-agnostic IDs preserve state on language switch)
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>("all");

  // Join Modal States
  const [activeModalGroup, setActiveModalGroup] = useState<any | null>(null);
  const [joinSelectedGroupId, setJoinSelectedGroupId] = useState<string>("");
  const [joinForm, setJoinForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmittingJoin, setIsSubmittingJoin] = useState<boolean>(false);
  const [isJoinSuccess, setIsJoinSuccess] = useState<boolean>(false);
  const [joinSubmitError, setJoinSubmitError] = useState<string | null>(null);

  // Leader Modal States
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState<boolean>(false);
  const [leaderForm, setLeaderForm] = useState({ name: "", email: "", phone: "", groupIdea: "" });
  const [isSubmittingLeader, setIsSubmittingLeader] = useState<boolean>(false);
  const [isLeaderSuccess, setIsLeaderSuccess] = useState<boolean>(false);
  const [leaderSubmitError, setLeaderSubmitError] = useState<string | null>(null);

  // Resolved categories with dynamic translation
  const categories = useMemo(() => {
    return CATEGORY_ITEMS.map((cat) => ({
      ...cat,
      label:
        cat.id === "all"
          ? language === "te"
            ? "అన్ని గ్రూపులు"
            : language === "hi"
            ? "सभी समूह"
            : "All Groups"
          : cat.id === "young-adults"
          ? language === "te"
            ? "యువజనులు"
            : language === "hi"
            ? "युवा"
            : sg.youngAdults || cat.defaultLabel
          : cat.id === "women"
          ? language === "te"
            ? "స్త్రీలు"
            : language === "hi"
            ? "महिलाएं"
            : sg.women || cat.defaultLabel
          : cat.id === "men"
          ? language === "te"
            ? "పురుషులు"
            : language === "hi"
            ? "पुरुष"
            : sg.men || cat.defaultLabel
          : cat.id === "couples"
          ? language === "te"
            ? "దంపతులు"
            : language === "hi"
            ? "दंपति"
            : sg.couples || cat.defaultLabel
          : cat.id === "bible-study"
          ? language === "te"
            ? "బైబిల్ స్టడీ"
            : language === "hi"
            ? "बाइबिल अध्ययन"
            : sg.bibleStudy || cat.defaultLabel
          : language === "te"
          ? "ప్రార్థన"
          : language === "hi"
          ? "प्रार्थना"
          : sg.prayer || cat.defaultLabel,
    }));
  }, [language, sg]);

  // Resolved days with dynamic translation
  const days = useMemo(() => {
    return DAY_ITEMS.map((d) => ({
      id: d.id,
      label: language === "te" ? d.te : language === "hi" ? d.hi : d.defaultLabel,
    }));
  }, [language]);

  // Visual card themes by category ID
  const getCategoryTheme = (categoryId: string) => {
    switch (categoryId) {
      case "young-adults":
        return {
          accent: "from-violet-500 to-indigo-500",
          badge: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/80",
          iconBox: "bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-200/80 dark:border-violet-800/80",
        };
      case "women":
        return {
          accent: "from-pink-500 to-rose-500",
          badge: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-200/80 dark:border-pink-800/80",
          iconBox: "bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-200/80 dark:border-pink-800/80",
        };
      case "men":
        return {
          accent: "from-blue-500 to-cyan-500",
          badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/80",
          iconBox: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/80",
        };
      case "couples":
        return {
          accent: "from-amber-500 to-orange-500",
          badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80",
          iconBox: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/80",
        };
      case "bible-study":
        return {
          accent: "from-purple-500 to-indigo-500",
          badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80",
          iconBox: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-200/80 dark:border-purple-800/80",
        };
      case "prayer":
        return {
          accent: "from-rose-500 to-orange-500",
          badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80",
          iconBox: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/80",
        };
      default:
        return {
          accent: "from-purple-500 to-indigo-500",
          badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80",
          iconBox: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-200/80 dark:border-purple-800/80",
        };
    }
  };

  const getFormatBadgeStyle = (format: string) => {
    const f = format.toLowerCase();
    if (f.includes("in-person") || f.includes("ప్రత్యక్ష") || f.includes("प्रत्यक्ष")) {
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80";
    }
    if (f.includes("online") || f.includes("ఆన్‌లైన్") || f.includes("ऑनलाइन")) {
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80";
    }
    return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80";
  };

  // Localized canonical groups list
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

  // Multi-criteria memoized filtering
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
        group.leader.toLowerCase().includes(query) ||
        group.categoryLabel.toLowerCase().includes(query) ||
        group.dayLabel.toLowerCase().includes(query);

      return matchesCategory && matchesDay && matchesSearch;
    });
  }, [groups, selectedCategory, selectedDay, searchQuery]);

  // Form Validation Logic
  const isJoinNameValid = joinForm.name.trim().length >= 2;
  const isJoinEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(joinForm.email.trim());
  const isJoinPhoneValid = joinForm.phone.trim().replace(/[^0-9]/g, "").length >= 10;
  const isJoinFormValid = isJoinNameValid && isJoinEmailValid && isJoinPhoneValid;

  const isLeaderNameValid = leaderForm.name.trim().length >= 2;
  const isLeaderEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leaderForm.email.trim());
  const isLeaderPhoneValid = leaderForm.phone.trim().replace(/[^0-9]/g, "").length >= 10;
  const isLeaderIdeaValid = leaderForm.groupIdea.trim().length >= 5;
  const isLeaderFormValid = isLeaderNameValid && isLeaderEmailValid && isLeaderPhoneValid && isLeaderIdeaValid;

  // Active modal group reference derived from joinSelectedGroupId or activeModalGroup
  const resolvedModalGroup = useMemo(() => {
    if (joinSelectedGroupId) {
      const found = groups.find((g) => g.id === joinSelectedGroupId);
      if (found) return found;
    }
    return activeModalGroup || groups[0];
  }, [groups, joinSelectedGroupId, activeModalGroup]);

  // Handler for category filter with useTransition
  const handleCategorySelect = (categoryId: string) => {
    startTransition(() => {
      setSelectedCategory(categoryId);
    });
  };

  // Handler for day filter with useTransition
  const handleDaySelect = (dayId: string) => {
    startTransition(() => {
      setSelectedDay(dayId);
    });
  };

  // Handler for search input
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    startTransition(() => {
      setSearchQuery(val);
    });
  };

  // Handler for resetting all filters
  const handleResetFilters = () => {
    setSearchInput("");
    startTransition(() => {
      setSearchQuery("");
      setSelectedCategory("all");
      setSelectedDay("all");
    });
  };

  // Smart modal trigger that pre-selects the clicked group
  const handleOpenJoinModal = (group: any) => {
    startTransition(() => {
      setActiveModalGroup(group);
      setJoinSelectedGroupId(group.id);
      setJoinSubmitError(null);
      setIsJoinSuccess(false);
    });
  };

  // Join form submission with robust error handling and loading state
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isJoinFormValid || isSubmittingJoin) return;

    setIsSubmittingJoin(true);
    setJoinSubmitError(null);

    try {
      const { submitToFormspark } = await import("@/lib/formspark");
      const targetGroup = resolvedModalGroup;

      const res = await submitToFormspark({
        formType: "Small Group Join Request",
        name: joinForm.name.trim(),
        email: joinForm.email.trim(),
        phone: joinForm.phone.trim(),
        groupName: targetGroup?.title || "Small Group",
        groupId: targetGroup?.id || joinSelectedGroupId,
        leaderName: targetGroup?.leader,
        location: targetGroup?.location,
        day: targetGroup?.dayLabel,
        time: targetGroup?.time,
        message: joinForm.message.trim(),
        notes: joinForm.message.trim(),
        subject: `Small Group Interest: [${targetGroup?.title || "General"}] from ${joinForm.name.trim()}`,
      });

      if (res && res.error) {
        throw new Error(res.error);
      }

      setIsJoinSuccess(true);
      setTimeout(() => {
        setIsJoinSuccess(false);
        setActiveModalGroup(null);
        setJoinForm({ name: "", email: "", phone: "", message: "" });
      }, 2500);
    } catch (err: any) {
      console.warn("[SMALL_GROUPS] Join submission notice:", err);
      setJoinSubmitError(
        err?.message || (language === "te"
          ? "సమర్పించడంలో సమస్య తలెత్తింది. దయచేసి నెట్‌వర్క్ తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి."
          : language === "hi"
          ? "अनुरोध जमा करने में समस्या आई। कृपया पुनः प्रयास करें।"
          : "Unable to submit your join request. Please check your network and try again.")
      );
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  // Leader form submission with robust error handling and loading state
  const handleLeaderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLeaderFormValid || isSubmittingLeader) return;

    setIsSubmittingLeader(true);
    setLeaderSubmitError(null);

    try {
      const { submitToFormspark } = await import("@/lib/formspark");
      const res = await submitToFormspark({
        formType: "Small Group Leader Application",
        name: leaderForm.name.trim(),
        email: leaderForm.email.trim(),
        phone: leaderForm.phone.trim(),
        message: leaderForm.groupIdea.trim(),
        notes: leaderForm.groupIdea.trim(),
        subject: `Group Leader Application from ${leaderForm.name.trim()}`,
      });

      if (res && res.error) {
        throw new Error(res.error);
      }

      setIsLeaderSuccess(true);
      setTimeout(() => {
        setIsLeaderSuccess(false);
        setIsLeaderModalOpen(false);
        setLeaderForm({ name: "", email: "", phone: "", groupIdea: "" });
      }, 2500);
    } catch (err: any) {
      console.warn("[SMALL_GROUPS] Leader submission notice:", err);
      setLeaderSubmitError(
        err?.message || (language === "te"
          ? "దరఖాస్తు సమర్పించడంలో సమస్య తలెత్తింది. దయచేసి మళ్ళీ ప్రయత్నించండి."
          : language === "hi"
          ? "आवेदन जमा करने में समस्या आई। कृपया पुनः प्रयास करें।"
          : "Unable to submit your leadership application. Please check your network and try again.")
      );
    } finally {
      setIsSubmittingLeader(false);
    }
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
            {/* Inline Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="mb-5 flex justify-center">
              <ol className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-purple-200/60 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-2xs">
                <li className="inline-flex items-center">
                  <Link href="/" className="inline-flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <Home className="w-3.5 h-3.5" />
                    <span>{(t as any)?.nav?.home || (language === "te" ? "హోమ్" : language === "hi" ? "होम" : "Home")}</span>
                  </Link>
                </li>
                <li className="text-slate-400 dark:text-slate-600">/</li>
                <li className="text-purple-700 dark:text-purple-300 font-bold" aria-current="page">
                  {sg.title || (language === "te" ? "చిన్న సమూహాలు" : language === "hi" ? "छोटे समूह" : "Small Groups")}
                </li>
              </ol>
            </nav>

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

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 text-slate-900 dark:text-white leading-tight font-outfit">
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

            {/* Quick Stats Bar — Executive Tone-on-Tone Frosted Glassmorphism */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-8 border-t border-purple-200/60 dark:border-slate-800/80">
              <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-purple-900/5 dark:shadow-black/20 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-80" />
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">6+</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "చురుకైన గ్రూపులు" : language === "hi" ? "सक्रिय समूह" : "Active Groups"}</div>
              </div>

              <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-indigo-900/5 dark:shadow-black/20 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-80" />
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">150+</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "సహవాస సభ్యులు" : language === "hi" ? "समूह सदस्य" : "Group Members"}</div>
              </div>

              <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-pink-900/5 dark:shadow-black/20 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500 opacity-80" />
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 border border-pink-200/60 dark:border-pink-800/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">3</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "ప్రాంతీయ కేంద్రాలు" : language === "hi" ? "केंद्रीय स्थान" : "Hub Locations"}</div>
              </div>

              <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-emerald-900/5 dark:shadow-black/20 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80" />
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">100%</div>
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/80 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{language === "te" ? "కమ్యూనిటీ విలువ" : language === "hi" ? "सामुदायिक लाभ" : "Community Life"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight font-outfit">
              {sg.whyTitle || (language === "te" ? "చిన్న సమూహంలో ఎందుకు చేరాలి?" : language === "hi" ? "छोटे समूह में क्यों शामिल हों?" : "Why Join a Small Group?")}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
              {sg.whyDesc ||
                (language === "te"
                  ? "మనం ఏకాకులుగా జీవించడానికి సృష్టించబడలేదు. సెల్ గ్రూపులు మన సంఘానికి జీవనాడి—ఇక్కడే నిజమైన సంబంధాలు ఏర్పడతాయి మరియు ఆత్మీయ ఎదుగుదల సాధ్యమవుతుంది."
                  : language === "hi"
                  ? "हम अकेले चलने के लिए नहीं बनाए गए हैं। छोटे समूह हमारी कलीसिया की धड़कन हैं—जहां वास्तविक संबंध बनते हैं और आत्मिक विकास होता है।"
                  : "We were created for community. Small groups are where genuine friendships form, spiritual growth happens, and support is found.")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-80" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-2xs">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight font-outfit">
                {sg.connectTitle || (language === "te" ? "యథార్థమైన అనుబంధం" : language === "hi" ? "सच्चा जुड़ाव" : "Genuine Connection")}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal">
                {sg.connectDesc ||
                  (language === "te"
                    ? "విశ్వాసంలో ఉన్నవారితో బలమైన స్నేహాన్ని నిర్మించుకోండి మరియు రోజువారీ జీవితంలో పరస్పర సహకారాన్ని పొందండి."
                    : language === "hi"
                    ? "विश्वास साझा करने वाले लोगों के साथ स्थायी मित्रता बनाएं और रोजमर्रा के जीवन में समर्थन पाएं।"
                    : "Build authentic relationships with people who share your values and support you in everyday life.")}
              </p>
            </div>

            <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-80" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-2xs">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight font-outfit">
                {sg.growTitle || (language === "te" ? "ఆత్మీయ ఎదుగుదల" : language === "hi" ? "आत्मिक विकास" : "Spiritual Growth")}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal">
                {sg.growDesc ||
                  (language === "te"
                    ? "స్నేహపూర్వక వాతావరణంలో దేవుని వాక్యాన్ని లోతుగా అర్థం చేసుకుంటూ ఆధ్యాత్మికంగా పరిపక్వత చెందండి."
                    : language === "hi"
                    ? "एक सहायक और खुले वातावरण में परमेश्वर के वचन की अपनी समझ को गहरा करें।"
                    : "Deepen your understanding of God's Word in an open, conversational, and encouraging setting.")}
              </p>
            </div>

            <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500 opacity-80" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-800/60 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-2xs">
                <Coffee className="w-6 h-6 sm:w-7 sm:h-7 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight font-outfit">
                {sg.supportTitle || (language === "te" ? "ప్రార్థన & ఆదరణ" : language === "hi" ? "प्रार्थना और देखभाल" : "Prayer & Care")}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal">
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
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight font-outfit">
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

            {/* Live Search Bar with Instant Local State & Deferred Filter Transition */}
            <div className="relative min-w-[280px] sm:min-w-[340px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  language === "te"
                    ? "గ్రూపులు, ప్రాంతాలు, అంశాలను శోధించండి..."
                    : language === "hi"
                    ? "समूह, स्थान, विषय खोजें..."
                    : "Search groups, topics, locations..."
                }
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Dual-Row Filter Controls — Smooth Horizontal Touch Scrolling on Mobile */}
          <div className="space-y-3.5 mb-10">
            {/* Row 1: Category Filter Row (overflow-x-auto, no clipping) */}
            <div className="relative">
              <div 
                className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1.5 -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0 mr-1 select-none">
                  <Filter className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>{language === "te" ? "వర్గం:" : language === "hi" ? "श्रेणी:" : "Category:"}</span>
                </span>
                {categories.map((cat) => {
                  const CatIcon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer select-none whitespace-nowrap active:scale-95 ${
                        isActive
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-400/40 scale-[1.02]"
                          : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200/90 dark:border-slate-700/80 hover:border-purple-300 dark:hover:border-purple-700/60 shadow-2xs"
                      }`}
                    >
                      <CatIcon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Day Filter Row (overflow-x-auto, no clipping) */}
            <div className="relative">
              <div 
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1.5 -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-2 shrink-0 select-none">
                  {language === "te" ? "వారం రోజు:" : language === "hi" ? "दिन:" : "Day:"}
                </span>
                {days.map((d) => {
                  const isActive = selectedDay === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleDaySelect(d.id)}
                      className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 shrink-0 cursor-pointer select-none whitespace-nowrap active:scale-95 ${
                        isActive
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-1 ring-slate-900/10"
                          : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Group Cards Grid — Uniform Heights in 3-Column Desktop Grid */}
          {filteredGroups.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {filteredGroups.map((group) => {
                const IconComponent = group.icon;
                const theme = getCategoryTheme(group.categoryId);
                const formatStyle = getFormatBadgeStyle(group.format);

                return (
                  <div
                    key={group.id}
                    className="relative bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 group overflow-hidden h-full"
                  >
                    {/* Top Accent Gradient Ribbon */}
                    <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${theme.accent}`} />

                    <div className="flex-1 flex flex-col">
                      {/* Card Top: High-Contrast Category Badge & Tone-on-Tone Icon Halo */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border shadow-2xs ${theme.badge}`}>
                          {group.categoryLabel}
                        </span>
                        
                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform shadow-xs shrink-0 ${theme.iconBox}`}>
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                      </div>

                      {/* Group Title */}
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2.5 tracking-tight font-outfit group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">
                        {group.title}
                      </h3>

                      {/* Format and Member Tags */}
                      <div className="flex items-center justify-between gap-2 mb-4 text-xs font-bold">
                        <span className={`px-2.5 py-1 rounded-lg border font-bold text-xs ${formatStyle}`}>
                          {group.format}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 font-semibold">
                          <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>{group.members}</span>
                        </span>
                      </div>

                      {/* Group Description with Uniform Min-Height */}
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-normal min-h-[72px] sm:min-h-[84px] flex-1">
                        {group.description}
                      </p>
                    </div>

                    {/* Card Footer: Metadata and Ergonomic Join Action aligned to bottom */}
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 mb-5 font-medium">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-white">{group.time}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>{group.location}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>
                            {language === "te" ? "నాయకత్వం: " : language === "hi" ? "नेतृत्व: " : "Led by: "}
                            <strong className="text-slate-900 dark:text-white font-bold">{group.leader}</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenJoinModal(group)}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 hover:shadow-lg active:scale-[0.98] cursor-pointer group/btn"
                      >
                        <span>{language === "te" ? "ఈ గ్రూపులో చేరండి" : language === "hi" ? "इस समूह में शामिल हों" : "Join This Group"}</span>
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Clear & Accessible Empty State with Reset Filters Action */
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-lg mx-auto shadow-sm animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4 border border-purple-200 dark:border-purple-800/60 shadow-xs">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 font-outfit">
                {language === "te" ? "గ్రూపులు కనుగొనబడలేదు" : language === "hi" ? "कोई समूह नहीं मिला" : "No Groups Found"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
                {language === "te"
                  ? "మీరు ఎంచుకున్న శోధన లేదా వర్గం/రోజు ఫిల్టర్‌లకు సరిపోయే గ్రూపులు ఏవీ లేవు. దయచేసి శోధనను మార్చండి లేదా ఫిల్టర్‌లను రీసెట్ చేయండి."
                  : language === "hi"
                  ? "आपके चुने गए खोज या श्रेणी/दिन फ़िल्टर से कोई समूह मेल नहीं खाता। कृपया खोज बदलें या फ़िल्टर रीसेट करें।"
                  : "No groups match your combined search criteria and filters. Try adjusting your search term or clearing the active filters."}
              </p>

              {/* Active Filter Badges */}
              {(searchQuery || selectedCategory !== "all" || selectedDay !== "all") && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs">
                  {searchQuery && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800 font-semibold">
                      Search: &quot;{searchQuery}&quot;
                    </span>
                  )}
                  {selectedCategory !== "all" && (
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 font-semibold">
                      Category: {categories.find((c) => c.id === selectedCategory)?.label}
                    </span>
                  )}
                  {selectedDay !== "all" && (
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 font-semibold">
                      Day: {days.find((d) => d.id === selectedDay)?.label}
                    </span>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-md shadow-purple-600/25 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>
                  {language === "te"
                    ? "ఫిల్టర్‌లను రీసెట్ చేయండి"
                    : language === "hi"
                    ? "फ़िल्टर रीसेट करें"
                    : "Reset All Filters"}
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 🚀 Start a Group Section - Senior-Grade Tone-on-Tone CTA Deck */}
      <section className="py-16 sm:py-24 relative z-10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative rounded-3xl p-6 sm:p-10 md:p-14 bg-gradient-to-b from-purple-50/90 via-white to-indigo-50/60 dark:from-slate-900/95 dark:via-purple-950/20 dark:to-slate-900/95 border border-purple-200/80 dark:border-purple-800/50 shadow-2xl shadow-purple-900/5 dark:shadow-black/40 overflow-hidden text-center">
            {/* Top Accent Ribbon */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 opacity-90" />
            
            {/* Ambient Background Glow Orbs */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Purposeful Section Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/80 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider mb-5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{language === "te" ? "నాయకత్వ అవకాశం" : language === "hi" ? "नेतृत्व अवसर" : "Leadership Opportunity"}</span>
              </div>

              {/* Luminous Tone-on-Tone Icon Halo */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/80 flex items-center justify-center mx-auto mb-5 shadow-xs">
                <PlusCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white tracking-tight font-outfit">
                {sg.startTitle || (language === "te" ? "చిన్న సమూహాన్ని ప్రారంభించండి" : language === "hi" ? "एक समूह शुरू करें" : "Start a Group")}
              </h2>

              {/* Subtitle */}
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
                {sg.startDesc ||
                  (language === "te"
                    ? "మీరు విజయవంతంగా సమూహాన్ని నడిపించడానికి అవసరమైన శిక్షణ, అధ్యయన సామగ్రి మరియు నిరంతర సహకారాన్ని మేము అందిస్తాము."
                    : language === "hi"
                    ? "हम आपको एक संपन्न सामुदायिक समूह का नेतृत्व करने में मदद करने के लिए प्रशिक्षण, अध्ययन सामग्री और निरंतर मार्गदर्शन प्रदान करते हैं।"
                    : "Interested in leading a small group? We provide training and resources to help you lead effectively.")}
              </p>

              {/* 3 Step Cards Progression */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-10 text-left">
                {/* Step 1 */}
                <div className="relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-850/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-80" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80 text-[10px] font-black uppercase tracking-wider">
                        {language === "te" ? "దశ 1" : language === "hi" ? "चरण 1" : "Step 1"}
                      </span>
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="font-black text-base text-slate-900 dark:text-white mb-1.5 font-outfit">
                      {language === "te" ? "ఆసక్తిని తెలియజేయండి" : language === "hi" ? "रुचि व्यक्त करें" : "Express Interest"}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                      {language === "te" ? "చిన్న నాయకత్వ ఫారమ్‌ను సమర్పించండి" : language === "hi" ? "त्वरित लीडर फॉर्म भरें" : "Submit a quick online leader application"}
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-850/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-80" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-[10px] font-black uppercase tracking-wider">
                        {language === "te" ? "దశ 2" : language === "hi" ? "चरण 2" : "Step 2"}
                      </span>
                      <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="font-black text-base text-slate-900 dark:text-white mb-1.5 font-outfit">
                      {language === "te" ? "అవగాహన & శిక్షణ" : language === "hi" ? "प्रशिक्षण प्राप्त करें" : "Orientation & Guides"}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                      {language === "te" ? "అధ్యయన గైడ్‌లు & పాస్టరల్ మద్దతు పొందండి" : language === "hi" ? "गाइड, टिप्स और कोचिंग प्राप्त करें" : "Receive curriculum, guides & pastoral coaching"}
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-850/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[10px] font-black uppercase tracking-wider">
                        {language === "te" ? "దశ 3" : language === "hi" ? "चरण 3" : "Step 3"}
                      </span>
                      <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="font-black text-base text-slate-900 dark:text-white mb-1.5 font-outfit">
                      {language === "te" ? "గ్రూపును ప్రారంభించండి" : language === "hi" ? "समूह शुरू करें" : "Launch Your Group"}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                      {language === "te" ? "స్నేహితులు & ఇరుగుపొరుగు వారిని ఆహ్వానించండి" : language === "hi" ? "मित्रों और पड़ोसियों को आमंत्रित करें" : "Gather friends, neighbors & begin meeting"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Unified Ergonomic Dock */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <button
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      setIsLeaderModalOpen(true);
                      setLeaderSubmitError(null);
                      setIsLeaderSuccess(false);
                    });
                  }}
                  className="w-full sm:w-auto min-h-[50px] px-8 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-purple-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                >
                  <PlusCircle className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform" />
                  <span>{sg.becomeLeader || (language === "te" ? "లీడర్‌గా దరఖాస్తు చేసుకోండి" : language === "hi" ? "लीडर के लिए आवेदन करें" : "Become a Leader")}</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </button>

                <Link
                  href="/contact"
                  className="w-full sm:w-auto min-h-[50px] px-8 py-3.5 bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-2xl font-black text-xs sm:text-sm shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] group"
                >
                  <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                  <span>{language === "te" ? "నాయకులను సంప్రదించండి" : language === "hi" ? "नेताओं से संपर्क करें" : "Contact Leaders"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🦶 Global Footer */}
      <Footer />

      {/* 📥 Join Group Modal with Smart Pre-Selection, Input Validation & Loading States */}
      {activeModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative">
              <button
                type="button"
                onClick={() => setActiveModalGroup(null)}
                aria-label="Close modal"
                className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs uppercase font-bold px-3 py-1 rounded-full bg-white/20 text-white mb-2 inline-block">
                {language === "te" ? "రిజిస్ట్రేషన్" : language === "hi" ? "पंजीकरण" : "Sign Up"}
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight font-outfit">{resolvedModalGroup.title}</h3>
              <p className="text-xs text-purple-100 mt-1">{resolvedModalGroup.time} • {resolvedModalGroup.location}</p>
            </div>

            <div className="p-6 text-slate-900 dark:text-slate-100">
              {isJoinSuccess ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-outfit">
                    {language === "te" ? "మీ అభ్యర్థన అందింది!" : language === "hi" ? "अनुरोध प्राप्त हुआ!" : "Request Received!"}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                    {language === "te"
                      ? `ధన్యవాదాలు, ${joinForm.name || "మిత్రమా"}! గ్రూప్ లీడర్ ${resolvedModalGroup.leader} త్వరలోనే సమావేశ వివరాలతో మిమ్మల్ని సంప్రదిస్తారు.`
                      : language === "hi"
                      ? `धन्यवाद, ${joinForm.name || "मित्र"}! समूह नेता ${resolvedModalGroup.leader} बैठक के विवरण के साथ आपसे संपर्क करेंगे।`
                      : `Thank you, ${joinForm.name || "friend"}! Group leader ${resolvedModalGroup.leader} will contact you with meeting details.`}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                  {/* Join Error Banner */}
                  {joinSubmitError && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                      <div className="flex-1">{joinSubmitError}</div>
                    </div>
                  )}

                  {/* Smart Pre-Selected Group Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === "te" ? "ఎంచుకున్న గ్రూప్ *" : language === "hi" ? "चयनित समूह *" : "Selected Group *"}
                    </label>
                    <select
                      value={joinSelectedGroupId}
                      onChange={(e) => setJoinSelectedGroupId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title} ({g.dayLabel} • {g.format})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === "te" ? "పూర్తి పేరు *" : language === "hi" ? "पूरा नाम *" : "Full Name *"}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={joinForm.name}
                      onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {language === "te" ? "ఈమెయిల్ *" : language === "hi" ? "ईमेल *" : "Email Address *"}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={joinForm.email}
                        onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {language === "te" ? "ఫోన్ నంబర్ *" : language === "hi" ? "फोन नंबर *" : "Phone Number *"}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={joinForm.phone}
                        onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === "te" ? "ఏవైనా సందేహాలు లేదా ప్రార్థన అవసరాలు ఉన్నాయా? (ఐచ్ఛికం)" : language === "hi" ? "कोई प्रश्न या प्रार्थना निवेदन? (वैकल्पिक)" : "Any questions or prayer requests? (Optional)"}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={language === "te" ? "నేను గ్రూప్ గురించి మరింత తెలుసుకోవాలనుకుంటున్నాను..." : language === "hi" ? "मैं समूह के बारे में और जानना चाहता हूं..." : "I'd love to know more about..."}
                      value={joinForm.message}
                      onChange={(e) => setJoinForm({ ...joinForm, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingJoin || !isJoinFormValid}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-98 cursor-pointer"
                  >
                    {isSubmittingJoin ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === "te" ? "సమర్పిస్తోంది..." : language === "hi" ? "जमा किया जा रहा है..." : "Submitting Request..."}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{language === "te" ? "ఆసక్తిని సమర్పించండి" : language === "hi" ? "आवेदन जमा करें" : "Submit Interest"}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 👥 Leader Application Modal with Input Validation & Loading States */}
      {isLeaderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative">
              <button
                type="button"
                onClick={() => setIsLeaderModalOpen(false)}
                aria-label="Close modal"
                className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold text-white tracking-tight font-outfit">
                {language === "te" ? "గ్రూప్ లీడర్‌షిప్ దరఖాస్తు" : language === "hi" ? "समूह नेतृत्व आवेदन" : "Group Leadership Application"}
              </h3>
              <p className="text-xs text-purple-100 mt-1">
                {language === "te" ? "కొత్త చిన్న సమూహాన్ని ప్రారంభించండి లేదా సహ-నాయకత్వం వహించండి." : language === "hi" ? "एक नया छोटा समूह शुरू करें या सह-नेतृत्व करें।" : "Start a new small group or co-lead an existing group."}
              </p>
            </div>

            <div className="p-6 text-slate-900 dark:text-slate-100">
              {isLeaderSuccess ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-outfit">
                    {language === "te" ? "దరఖాస్తు సమర్పించబడింది!" : language === "hi" ? "आवेदन जमा हो गया!" : "Application Submitted!"}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                    {language === "te"
                      ? "సేవ చేయడానికి ముందుకు వచ్చినందుకు ధన్యవాదాలు! మా శిష్యత్వ బృందం 48 గంటల్లో మిమ్మల్ని సంప్రదిస్తుంది."
                      : language === "hi"
                      ? "सेवा के लिए आगे आने के लिए धन्यवाद! हमारी शिष्यता टीम 48 घंटों के भीतर आपसे संपर्क करेगी।"
                      : "Thank you for stepping up to serve! Our Discipleship Team will reach out to you within 48 hours."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeaderSubmit} className="space-y-4">
                  {/* Leader Error Banner */}
                  {leaderSubmitError && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                      <div className="flex-1">{leaderSubmitError}</div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === "te" ? "పూర్తి పేరు *" : language === "hi" ? "पूरा नाम *" : "Full Name *"}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Connor"
                      value={leaderForm.name}
                      onChange={(e) => setLeaderForm({ ...leaderForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {language === "te" ? "ఈమెయిల్ *" : language === "hi" ? "ईमेल *" : "Email Address *"}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="sarah@example.com"
                        value={leaderForm.email}
                        onChange={(e) => setLeaderForm({ ...leaderForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {language === "te" ? "ఫోన్ నంబర్ *" : language === "hi" ? "फोन नंबर *" : "Phone Number *"}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={leaderForm.phone}
                        onChange={(e) => setLeaderForm({ ...leaderForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === "te" ? "మీరు ఎలాంటి గ్రూపును నడిపించాలనుకుంటున్నారు? *" : language === "hi" ? "आप किस प्रकार के समूह का नेतृत्व करना चाहते हैं? *" : "What type of group would you like to lead/start? *"}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder={language === "te" ? "ఉదా: యువ దంపతుల అధ్యయనం, కళాశాల విద్యార్థుల బైబిల్ స్టడీ, పరిసర ప్రాంత ప్రార్థన గ్రూప్..." : language === "hi" ? "उदा: युवा दंपत्ति अध्ययन, कॉलेज बाइबिल अध्ययन, पड़ोस प्रार्थना समूह..." : "e.g. Young Couples Study, College Bible Study, Neighborhood Prayer Group..."}
                      value={leaderForm.groupIdea}
                      onChange={(e) => setLeaderForm({ ...leaderForm, groupIdea: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingLeader || !isLeaderFormValid}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-98 cursor-pointer"
                  >
                    {isSubmittingLeader ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === "te" ? "దరఖాస్తు సమర్పిస్తోంది..." : language === "hi" ? "आवेदन जमा किया जा रहा है..." : "Submitting Application..."}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{language === "te" ? "దరఖాస్తును సమర్పించండి" : language === "hi" ? "आवेदन जमा करें" : "Submit Application"}</span>
                      </>
                    )}
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
