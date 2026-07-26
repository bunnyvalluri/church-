"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  MessageSquare, 
  Heart, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  UserPlus, 
  ChevronDown, 
  Search, 
  Plus, 
  X, 
  Copy, 
  Check, 
  Trash2,
  ShieldCheck
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface PrayerRequestsProps {
  users?: any[];
  externalSearchQuery?: string;
}

interface Prayer {
  id: string;
  userId?: string;
  title: string;
  description: string;
  category: "HEALTH" | "FAMILY" | "FINANCIAL" | "SPIRITUAL" | "GUIDANCE" | "OTHER";
  isAnonymous: boolean;
  status: "PENDING" | "PRAYING" | "ANSWERED";
  createdAt: string;
  user?: any;
  assignedPartners?: string[];
}

const DEFAULT_PRAYERS: Prayer[] = [
  {
    id: "pr_001",
    title: "Complete Healing & Recovery from Arthritis",
    description: "Please pray for my mother who is suffering from severe joint pains and arthritis in Hyderabad. Asking God for divine healing and comfort.",
    category: "HEALTH",
    isAnonymous: false,
    status: "PRAYING",
    createdAt: "2026-07-24T10:00:00.000Z",
    user: { name: "Mary Sunitha", email: "mary.sunitha@gmail.com" },
    assignedPartners: ["Sister Sarah Thomas", "Pastor David Raju"]
  },
  {
    id: "pr_002",
    title: "Breakthrough in Career & Job Security",
    description: "Praying for a breakthrough in corporate IT job search in Kompally. Need stability to support my family and parents.",
    category: "FINANCIAL",
    isAnonymous: false,
    status: "PENDING",
    createdAt: "2026-07-21T10:00:00.000Z",
    user: { name: "John Babu", email: "john.babu@gmail.com" },
    assignedPartners: []
  },
  {
    id: "pr_003",
    title: "Family Unity & Protection over Children",
    description: "Requesting intercession for family peace and guidance for our children as they enter college entrance exams.",
    category: "FAMILY",
    isAnonymous: true,
    status: "ANSWERED",
    createdAt: "2026-07-16T10:00:00.000Z",
    user: { name: "Anonymous Believer", email: "hidden@kcm.org" },
    assignedPartners: ["Pastor Samuel Valluri"]
  },
  {
    id: "pr_004",
    title: "Grace for Daily Spiritual Growth & Fasting",
    description: "Seeking wisdom and steadfast spirit in daily morning prayer devotions and youth fellowship leadership.",
    category: "SPIRITUAL",
    isAnonymous: false,
    status: "PRAYING",
    createdAt: "2026-07-25T10:00:00.000Z",
    user: { name: "Emmanuel Reddy", email: "emmanuel.reddy@gmail.com" },
    assignedPartners: ["Brother Daniel Rao"]
  }
];

const BIBLE_VERSES: Record<string, Record<string, string[]>> = {
  en: {
    HEALTH: [
      "Heal me, Lord, and I will be healed; save me and I will be saved, for you are the one I praise. - Jeremiah 17:14",
      "Is anyone among you sick? Let them call the elders of the church to pray over them... - James 5:14"
    ],
    FAMILY: [
      "Believe in the Lord Jesus, and you will be saved—you and your household. - Acts 16:31",
      "As for me and my household, we will serve the Lord. - Joshua 24:15"
    ],
    FINANCIAL: [
      "And my God will meet all your needs according to the riches of his glory in Christ Jesus. - Philippians 4:19",
      "The Lord is my shepherd, I lack nothing. - Psalm 23:1"
    ],
    SPIRITUAL: [
      "Draw near to God, and he will draw near to you. - James 4:8",
      "Create in me a pure heart, O God, and renew a steadfast spirit within me. - Psalm 51:10"
    ],
    GUIDANCE: [
      "Trust in the Lord with all your heart and lean not on your own understanding... - Proverbs 3:5-6",
      "Your word is a lamp for my feet, a light on my path. - Psalm 119:105"
    ],
    OTHER: [
      "Do not be anxious about anything, but in every situation, by prayer and petition... - Philippians 4:6"
    ]
  },
  te: {
    HEALTH: [
      "యెహోవా, నీవు నన్ను స్వస్థపరచుము, నేను స్వస్థత పొందుదును; నన్ను రక్షించుము, నేను రక్షింపబడుదును. - యిర్మీయా 17:14",
      "మీలో ఎవడైనను రోగియై యున్నాడా? అతడు సంఘపు పెద్దలను పిలిపించి ప్రార్థన చేయించవలెను... - యాకోబు 5:14"
    ],
    FAMILY: [
      "ప్రభువైన యేసునందు విశ్వాసముంచుము, అప్పుడు నీవును నీ యింటివారును రక్షణ పొందుదురు. - అపొస్తలుల కార్యములు 16:31",
      "నేనును నా యింటివారును యెహోవాను సేవించెదము. - యెహోషువ 24:15"
    ],
    FINANCIAL: [
      "కాగా దేవుడు తన ఐశ్వర్యము చొప్పున క్రీస్తుయేసునందు మీ ప్రతి అవసరమును తీర్చును. - ఫిలిప్పీయులకు 4:19",
      "యెహోవా నా కాపరి, నాకు లేమి కలుగదు. - కీర్తనల గ్రంథము 23:1"
    ],
    SPIRITUAL: [
      "దేవుని యొద్దకు రండి, అప్పుడాయన మీ యొద్దకు వచ్చును. - యాకోబు 4:8",
      "దేవా, నా యందు శుద్ధహృదయము కలుగజేయుము. - కీర్తనల గ్రంథము 51:10"
    ],
    GUIDANCE: [
      "నీ స్వబుద్ధిని ఆధారము చేసికొనక పూర్ణహృదయముతో యెహోవాయందు నమ్మకముంచుము... - సామెతలు 3:5-6",
      "నీ వాక్యము నా పాదములకు దీపమును నా త్రోవకు వెలుగునై యున్నది. - కీర్తనల గ్రంథము 119:105"
    ],
    OTHER: [
      "దేనిని గూర్చియు చింతపడకుడి గాని ప్రతి విషయములోను ప్రార్థన చేయుడి... - ఫిలిప్పీయులకు 4:6"
    ]
  },
  hi: {
    HEALTH: [
      "हे यहोवा, मुझे चंगा कर, तब मैं चंगा हो जाऊंगा; मुझे बचा, तब मैं बच जाऊंगा... - यिर्मयाह 17:14",
      "यदि तुम में कोई बीमार हो, तो वह कलीसिया के प्राचीनों को बुलाए... - याकूब 5:14"
    ],
    FAMILY: [
      "प्रभु यीशु पर विश्वास कर, तो तू और तेरा घराना उद्धार पाएगा। - प्रेरितों के काम 16:31",
      "परन्तु मैं और तेरा घराना तो यहोवा ही की सेवा करेंगे। - यहोशू 24:15"
    ],
    FINANCIAL: [
      "और मेरा परमेश्वर मसीह यीशु में तुम्हारी हर एक घटी को पूरी करेगा। - फिलिप्पियों 4:19",
      "यहोवा मेरा चरवाहा है, मुझे कोई घटी न होगी। - भजन संहिता 23:1"
    ],
    SPIRITUAL: [
      "परमेश्वर के निकट आओ, तो वह भी तुम्हारे निकट आएगा। - याकूब 4:8",
      "हे परमेश्वर, मेरे अन्दर शुद्ध मन उत्पन्न कर... - भजन संहिता 51:10"
    ],
    GUIDANCE: [
      "तू अपनी समझ का सहारा न लेना, वरन सम्पूर्ण मन से यहोवा पर भरोसा रखना... - नीतिवचन 3:5-6",
      "तेरा वचन मेरे पांव के लिये दीपक, और मेरे मार्ग के लिये उजियाला है। - भजन संहिता 119:105"
    ],
    OTHER: [
      "किसी भी बात की चिन्ता न करो; परन्तु हर एक बात में प्रार्थना करो... - फिलिप्पियों 4:6"
    ]
  }
};

export default function PrayerRequests({ users = [], externalSearchQuery }: PrayerRequestsProps) {
  const { language } = useLanguage();
  const isTe = language === "te";
  const isHi = language === "hi";
  const activeLang = isTe ? "te" : isHi ? "hi" : "en";
  const t = adminTranslations[activeLang]?.prayers || {
    prayerRequests: "Prayer Requests Dispatcher",
    allCategories: "All Categories",
    health: "Health & Healing",
    family: "Family Blessing",
    finance: "Financial & Career",
    spiritual: "Spiritual Growth",
    guidance: "Wisdom & Guidance",
    allStatuses: "All Statuses",
    pending: "Pending Review",
    praying: "Actively Praying",
    answered: "Answered Praise",
    loading: "Loading prayers...",
    noRequests: "No prayer requests found.",
    anonymousRequest: "ANONYMOUS REQUEST",
    submitted: "Submitted",
    testimonyTitle: "Believer Request & Details",
    requestId: "Request ID",
    believer: "Believer",
    suggestedScripture: "Suggested Bible Scripture Support",
    suggestedTip: "Tip: copy and share this Scripture with the believer for comfort.",
    partnerAssignment: "Intercessory Partner Assignment",
    assignPartnerBtn: "+ Assign Partner",
    assignTip: "Assigned intercessors will receive prayer points notification.",
    selectRequest: "Select a Prayer Request",
    selectRequestDesc: "Choose a prayer request from the list to view intercession details, Bible verses, or update status."
  };

  const getCategoryTranslation = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "HEALTH": return isTe ? "ఆరోగ్య స్వస్థత" : isHi ? "स्वास्थ्य चंगाई" : "Health & Healing";
      case "FAMILY": return isTe ? "కుటుంబ ఆశీర్వాదం" : isHi ? "परिवार आशीर्वाद" : "Family Blessing";
      case "FINANCIAL": case "FINANCE": return isTe ? "ఆర్థిక & ఉద్యోగం" : isHi ? "वित्तीय और करियर" : "Financial & Career";
      case "SPIRITUAL": return isTe ? "ఆత్మీయ వృద్ధి" : isHi ? "आध्यात्मिक विकास" : "Spiritual Growth";
      case "GUIDANCE": return isTe ? "జ్ఞానం & నడిపింపు" : isHi ? "मार्गदर्शन" : "Wisdom & Guidance";
      default: return cat;
    }
  };

  const getStatusTranslation = (stat: string) => {
    switch (stat.toUpperCase()) {
      case "PENDING": return isTe ? "పరిశీలనలో ఉంది" : isHi ? "समीक्षा लंबित" : "Pending Review";
      case "PRAYING": return isTe ? "ప్రార్థన జరుగుతోంది" : isHi ? "प्रार्थना जारी है" : "Actively Praying";
      case "ANSWERED": return isTe ? "జవాబు పొందిన ప్రార్థన" : isHi ? "उत्तरित प्रार्थना" : "Answered Praise";
      default: return stat;
    }
  };

  const getPrayerTitleTranslation = (title: string) => {
    if (!title) return "";
    const lower = title.toLowerCase();
    if (lower.includes("arthritis") || lower.includes("healing") || lower.includes("mother")) {
      return isTe ? "నా తల్లి స్వస్థత మరియు కోలుకోవడం కొరకు ప్రార్థన" : isHi ? "मेरी माँ के शीघ्र स्वस्थ होने की प्रार्थना" : title;
    }
    if (lower.includes("career") || lower.includes("job") || lower.includes("breakthrough")) {
      return isTe ? "ఉద్యోగ అవకాశము మరియు ఆర్థిక స్థిరత్వం" : isHi ? "करियर और नौकरी में सफलता के लिए प्रार्थना" : title;
    }
    if (lower.includes("family") || lower.includes("children") || lower.includes("unity")) {
      return isTe ? "కుటుంబ సమాధానం మరియు పిల్లల భద్రత" : isHi ? "पारिवारिक एकता और बच्चों की सुरक्षा" : title;
    }
    if (lower.includes("spiritual") || lower.includes("fasting") || lower.includes("growth")) {
      return isTe ? "ఆత్మీయ వృద్ధి మరియు ప్రార్థన జీవితం" : isHi ? "आध्यात्मिक विकास और प्रार्थना स्थिरता" : title;
    }
    if (lower.includes("thanksgiving") || lower.includes("born") || lower.includes("child")) {
      return isTe ? "కృతజ్ఞతా స్తుతి — బాబు ఆరోగ్యంగా జన్మించారు!" : isHi ? "धन्यवाद — बच्चा स्वस्थ जन्मा!" : title;
    }
    if (lower.includes("marriage") || lower.includes("restoration")) {
      return isTe ? "వివాహ జీవిత పునరుద్ధరణ" : isHi ? "वैवाहिक जीवन की बहाली" : title;
    }
    if (lower.includes("guidance") || lower.includes("decision")) {
      return isTe ? "ఉద్యోగ నిర్ణయంలో దేవుని నడిపింపు" : isHi ? "करियर निर्णय के लिए मार्गदर्शन" : title;
    }
    return title;
  };

  const getPrayerDescTranslation = (desc: string) => {
    if (!desc) return "";
    const lower = desc.toLowerCase();
    if (lower.includes("hyderabad") || lower.includes("mother") || lower.includes("joint pains")) {
      return isTe ? "హైదరాబాదులో నా తల్లి తీవ్రమైన కీళ్ల నొప్పులు మరియు ఆర్థరైటిస్‌తో బాధపడుతోంది. దైవిక స్వస్థత మరియు ఆదరణ కోసం ప్రార్థించండి." :
             isHi ? "हैदराबाद में मेरी माँ जोड़ों के दर्द से पीड़ित हैं। ईश्वरीय चंगाई और आराम के लिए प्रार्थना करें।" : desc;
    }
    if (lower.includes("kompally") || lower.includes("job") || lower.includes("corporate")) {
      return isTe ? "కొంపల్లిలో IT ఉద్యోగ వేటలో విజయం కొరకు ప్రార్థన. కుటుంబం మరియు తల్లిదండ్రులను పోషించడానికి స్థిరత్వం అవసరం." :
             isHi ? "कॉरपोरेट आईटी नौकरी की तलाश में सफलता के लिए प्रार्थना। परिवार की सहायता के लिए स्थिरता की आवश्यकता है।" : desc;
    }
    if (lower.includes("entrance exams") || lower.includes("children") || lower.includes("intercession")) {
      return isTe ? "మా పిల్లల కళాశాల ప్రవేశ పరీక్షల వేళ కుటుంబ సమాధానము మరియు దేవుని నడిపింపు కొరకు విజ్ఞాపన." :
             isHi ? "कॉलेज प्रवेश परीक्षाओं में प्रवेश करने वाले बच्चों के लिए पारिवारिक शांति और मार्गदर्शन की मांग।" : desc;
    }
    if (lower.includes("morning prayer") || lower.includes("youth") || lower.includes("fasting")) {
      return isTe ? "ఉదయాన్నే వ్యక్తిగత ప్రార్థనలు మరియు యూత్ ఫెలోషిప్ నాయకత్వంలో జ్ఞానం మరియు స్థిరమైన ఆత్మ కొరకు విజ్ఞాపన." :
             isHi ? "सुबह के प्रार्थना सत्रों और युवा संगति नेतृत्व में ज्ञान और स्थिर आत्मा की मांग।" : desc;
    }
    return desc;
  };

  const [prayers, setPrayers] = useState<Prayer[]>(DEFAULT_PRAYERS);
  const [loading, setLoading] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(DEFAULT_PRAYERS[0]);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || "");
  const [assignedPartnerInput, setAssignedPartnerInput] = useState("");
  const [copiedVerse, setCopiedVerse] = useState(false);
  const [mobileTab, setMobileTab] = useState<"list" | "detail">("list");

  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newPrayer, setNewPrayer] = useState({
    title: "",
    description: "",
    category: "HEALTH" as "HEALTH" | "FAMILY" | "FINANCIAL" | "SPIRITUAL" | "GUIDANCE" | "OTHER",
    isAnonymous: false,
    userName: "",
    userEmail: ""
  });

  // Load backend prayers in background without blocking initial instant render
  useEffect(() => {
    let isMounted = true;
    const loadAllPrayers = async () => {
      try {
        const res = await fetch("/api/member/prayers?userId=all_admin_peek");
        const data = await res.json();
        if (!isMounted) return;
        
        let list = data.prayers || [];
        if (list.length > 0) {
          const mapped = list.map((p: any) => {
            const user = p.user || users.find(u => u.id === p.userId || u.uid === p.userId) || { name: p.donorName || "Congregation Believer", email: p.donorEmail || "believer@gmail.com" };
            return { ...p, user, assignedPartners: p.assignedPartners || [] };
          });
          setPrayers(mapped);
          setSelectedPrayer(prev => prev || mapped[0]);
        }
      } catch (e) {
        // Retain initial DEFAULT_PRAYERS
      }
    };

    loadAllPrayers();
    return () => { isMounted = false; };
  }, [users]);

  // Calculations
  const stats = useMemo(() => {
    const total = prayers.length;
    const pending = prayers.filter(p => p.status === "PENDING").length;
    const praying = prayers.filter(p => p.status === "PRAYING").length;
    const answered = prayers.filter(p => p.status === "ANSWERED").length;
    return { total, pending, praying, answered };
  }, [prayers]);

  const filteredPrayers = useMemo(() => {
    return prayers.filter(p => {
      const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchesQuery = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getPrayerTitleTranslation(p.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getPrayerDescTranslation(p.description).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesStatus && matchesQuery;
    });
  }, [prayers, categoryFilter, statusFilter, searchQuery]);

  const handleStatusChange = async (prayerId: string, newStatus: "PENDING" | "PRAYING" | "ANSWERED") => {
    setPrayers(prev => prev.map(p => {
      if (p.id === prayerId) {
        const updated = { ...p, status: newStatus };
        if (selectedPrayer?.id === prayerId) {
          setSelectedPrayer(updated);
        }
        return updated;
      }
      return p;
    }));

    try {
      await fetch("/api/member/prayers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prayerId, status: newStatus }),
      });
    } catch (err) {
      console.warn("Failed to update status on server:", err);
    }
  };

  const handleAssignPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrayer || !assignedPartnerInput.trim()) return;
    
    const partnerName = assignedPartnerInput.trim();
    setPrayers(prev => prev.map(p => {
      if (p.id === selectedPrayer.id) {
        const currentPartners = p.assignedPartners || [];
        if (!currentPartners.includes(partnerName)) {
          const updated = { ...p, assignedPartners: [...currentPartners, partnerName] };
          setSelectedPrayer(updated);
          return updated;
        }
      }
      return p;
    }));
    setAssignedPartnerInput("");
  };

  const handleRemovePartner = (partnerName: string) => {
    if (!selectedPrayer) return;
    setPrayers(prev => prev.map(p => {
      if (p.id === selectedPrayer.id) {
        const updated = { ...p, assignedPartners: (p.assignedPartners || []).filter(name => name !== partnerName) };
        setSelectedPrayer(updated);
        return updated;
      }
      return p;
    }));
  };

  const handleDeletePrayer = async (prayerId: string) => {
    if (confirm(isTe ? "మీరు ఖచ్చితంగా ఈ ప్రార్థన అభ్యర్థనను తొలగించాలనుకుంటున్నారా?" : isHi ? "क्या आप वाकई इस प्रार्थना अनुरोध को हटाना चाहते हैं?" : "Are you sure you want to delete this prayer request?")) {
      setPrayers(prev => prev.filter(p => p.id !== prayerId));
      if (selectedPrayer?.id === prayerId) {
        const remaining = prayers.filter(p => p.id !== prayerId);
        setSelectedPrayer(remaining.length > 0 ? remaining[0] : null);
      }
      try {
        await fetch(`/api/member/prayers?id=${prayerId}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Failed to delete prayer request on server:", err);
      }
    }
  };

  const handleCreatePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayer.title) return;

    let created: Prayer;
    try {
      const res = await fetch("/api/member/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPrayer.title,
          description: newPrayer.description || "Believer prayer intercession request.",
          category: newPrayer.category,
          isAnonymous: newPrayer.isAnonymous,
        }),
      });
      const data = await res.json();
      if (data.success && data.prayer) {
        created = {
          ...data.prayer,
          user: data.prayer.user || {
            name: newPrayer.isAnonymous ? "Anonymous Believer" : (newPrayer.userName || "Congregation Member"),
            email: newPrayer.userEmail || "member@kcm.org"
          },
          assignedPartners: []
        };
      } else {
        created = {
          id: `pr_${Date.now()}`,
          title: newPrayer.title,
          description: newPrayer.description || "Believer prayer intercession request.",
          category: newPrayer.category,
          isAnonymous: newPrayer.isAnonymous,
          status: "PENDING",
          createdAt: new Date().toISOString(),
          user: {
            name: newPrayer.isAnonymous ? "Anonymous Believer" : (newPrayer.userName || "Congregation Member"),
            email: newPrayer.userEmail || "member@kcm.org"
          },
          assignedPartners: []
        };
      }
    } catch (err) {
      created = {
        id: `pr_${Date.now()}`,
        title: newPrayer.title,
        description: newPrayer.description || "Believer prayer intercession request.",
        category: newPrayer.category,
        isAnonymous: newPrayer.isAnonymous,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        user: {
          name: newPrayer.isAnonymous ? "Anonymous Believer" : (newPrayer.userName || "Congregation Member"),
          email: newPrayer.userEmail || "member@kcm.org"
        },
        assignedPartners: []
      };
    }

    setPrayers(prev => [created, ...prev]);
    setSelectedPrayer(created);
    setNewPrayer({ title: "", description: "", category: "HEALTH", isAnonymous: false, userName: "", userEmail: "" });
    setIsLogModalOpen(false);
  };

  const getVerseSuggestion = (category: string) => {
    const langVerses = BIBLE_VERSES[activeLang] || BIBLE_VERSES.en;
    const verses = langVerses[category] || langVerses.OTHER;
    return verses[0];
  };

  const handleCopyVerse = (verse: string) => {
    navigator.clipboard.writeText(verse);
    setCopiedVerse(true);
    setTimeout(() => setCopiedVerse(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ─── Top Metric Stats Bar ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Requests */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isTe ? "మొత్తం ప్రార్థనలు" : isHi ? "कुल प्रार्थनाएँ" : "Total Requests"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{stats.total}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {isTe ? "పరిశీలనలో ఉన్నవి" : isHi ? "समीक्षा लंबित" : "Pending Review"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{stats.pending}</h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Actively Praying */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
              {isTe ? "ప్రార్థన జరుగుతున్నవి" : isHi ? "प्रार्थना जारी है" : "Actively Praying"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{stats.praying}</h3>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800 rounded-xl">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        {/* Answered Praise */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {isTe ? "జవాబు పొందినవి" : isHi ? "उत्तरित प्रार्थनाएँ" : "Answered Praise"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{stats.answered}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Mobile View Segmented Switcher */}
      <div className="lg:hidden flex bg-slate-200/80 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-300/60 dark:border-slate-700">
        <button
          onClick={() => setMobileTab("list")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${
            mobileTab === "list"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          {isTe ? "అభ్యర్థనల జాబితా" : isHi ? "अनुरोध सूची" : "Requests List"} ({filteredPrayers.length})
        </button>
        <button
          onClick={() => setMobileTab("detail")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${
            mobileTab === "detail"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
          }`}
        >
          <Heart className="w-4 h-4" />
          {isTe ? "వివరాలు" : isHi ? "विवरण" : "Request Details"}
        </button>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ─── Left Column: Prayer Requests List ─── */}
        <div className={`lg:col-span-1 space-y-4 ${mobileTab === "list" ? "block" : "hidden lg:block"}`}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            
            {/* Header & New Action */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {isTe ? "ప్రార్థన అభ్యర్థనలు" : isHi ? "ప్రార్థన अनुरोध" : "Prayer Requests"}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  {filteredPrayers.length} {isTe ? "అభ్యర్థనలు" : isHi ? "अनुरोध" : "active items"}
                </p>
              </div>
              <button 
                onClick={() => setIsLogModalOpen(true)}
                className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> {isTe ? "క్రొత్తది" : isHi ? "నయా" : "New"}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder={isTe ? "ప్రార్థనల శోధన..." : isHi ? "ప్రార్థన खोजें..." : "Filter requests..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full py-2 pl-3 pr-7 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-[11px] font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">{t.allCategories}</option>
                  <option value="HEALTH">{getCategoryTranslation("HEALTH")}</option>
                  <option value="FAMILY">{getCategoryTranslation("FAMILY")}</option>
                  <option value="FINANCIAL">{getCategoryTranslation("FINANCIAL")}</option>
                  <option value="SPIRITUAL">{getCategoryTranslation("SPIRITUAL")}</option>
                  <option value="GUIDANCE">{getCategoryTranslation("GUIDANCE")}</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-2 pl-3 pr-7 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-[11px] font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">{t.allStatuses}</option>
                  <option value="PENDING">{getStatusTranslation("PENDING")}</option>
                  <option value="PRAYING">{getStatusTranslation("PRAYING")}</option>
                  <option value="ANSWERED">{getStatusTranslation("ANSWERED")}</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredPrayers.map(p => {
                const isSelected = selectedPrayer?.id === p.id;
                return (
                  <div 
                    key={p.id}
                    onClick={() => {
                      setSelectedPrayer(p);
                      setMobileTab("detail");
                    }}
                    className={`p-4 rounded-2xl cursor-pointer transition-all relative overflow-hidden group ${
                      isSelected 
                        ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-2 border-indigo-500 dark:border-indigo-500 shadow-md" 
                        : "bg-slate-50/80 hover:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 hover:border-indigo-300 dark:hover:border-indigo-500/40"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 dark:bg-indigo-400" />
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        p.status === "ANSWERED" 
                          ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800" 
                          : p.status === "PRAYING" 
                          ? "bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-800" 
                          : "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800"
                      }`}>
                        {getStatusTranslation(p.status)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500" suppressHydrationWarning>
                        {formatDate(p.createdAt)}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate mt-2">
                      {getPrayerTitleTranslation(p.title)}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5 leading-relaxed font-medium">
                      {getPrayerDescTranslation(p.description)}
                    </p>
                    
                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-wide">
                        {getCategoryTranslation(p.category)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {p.isAnonymous ? t.anonymousRequest : (p.user?.name || "Believer")}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredPrayers.length === 0 && (
                <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-4">
                  {isTe ? "అభ్యర్థనలు ఏవీ కనుగొనబడలేదు" : isHi ? "कोई अनुरोध नहीं मिला" : "No matching prayer requests found."}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ─── Right Column: Selected Prayer Details ─── */}
        <div className={`lg:col-span-2 space-y-6 ${mobileTab === "detail" ? "block" : "hidden lg:block"}`}>
          {selectedPrayer ? (
            <div className="space-y-6">
              
              {/* Mobile Back Button */}
              <button
                onClick={() => setMobileTab("list")}
                className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold transition-all active:scale-95"
              >
                ← {isTe ? "జాబితాకు తిరిగి వెళ్లు" : isHi ? "सूची पर वापस जाएं" : "Back to Requests List"}
              </button>

              {/* Main Details Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-5">
                
                {/* Header Info & Status Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
                        {getCategoryTranslation(selectedPrayer.category)}
                      </span>
                      {selectedPrayer.isAnonymous && (
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                          {t.anonymousRequest}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2.5 tracking-tight">
                      {getPrayerTitleTranslation(selectedPrayer.title)}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold" suppressHydrationWarning>
                      {t.submitted}: {new Date(selectedPrayer.createdAt).toLocaleString(activeLang === "te" ? "te-IN" : activeLang === "hi" ? "hi-IN" : "en-IN")}
                    </p>
                  </div>

                  {/* Interactive Status Selector Segmented Controls */}
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-1 w-full md:w-auto shrink-0">
                    <button 
                      onClick={() => handleStatusChange(selectedPrayer.id, "PENDING")}
                      className={`py-2 px-1.5 sm:px-3 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-black uppercase transition-all w-full text-center ${
                        selectedPrayer.status === "PENDING"
                          ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-700/80 font-bold"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span className="whitespace-nowrap">
                        <span className="inline sm:hidden">{isTe ? "పరిశీలన" : isHi ? "लंबित" : "Pending"}</span>
                        <span className="hidden sm:inline">{getStatusTranslation("PENDING")}</span>
                      </span>
                    </button>

                    <button 
                      onClick={() => handleStatusChange(selectedPrayer.id, "PRAYING")}
                      className={`py-2 px-1.5 sm:px-3 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-black uppercase transition-all w-full text-center ${
                        selectedPrayer.status === "PRAYING"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-700/80 font-bold"
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 shrink-0" />
                      <span className="whitespace-nowrap">
                        <span className="inline sm:hidden">{isTe ? "ప్రార్థన" : isHi ? "जारी" : "Praying"}</span>
                        <span className="hidden sm:inline">{getStatusTranslation("PRAYING")}</span>
                      </span>
                    </button>

                    <button 
                      onClick={() => handleStatusChange(selectedPrayer.id, "ANSWERED")}
                      className={`py-2 px-1.5 sm:px-3 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-black uppercase transition-all w-full text-center ${
                        selectedPrayer.status === "ANSWERED"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-700/80 font-bold"
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="whitespace-nowrap">
                        <span className="inline sm:hidden">{isTe ? "జవాబు" : isHi ? "उत्तरित" : "Answered"}</span>
                        <span className="hidden sm:inline">{getStatusTranslation("ANSWERED")}</span>
                      </span>
                    </button>
                  </div>
                </div>

                <hr className="border-t border-slate-200 dark:border-slate-800" />

                {/* Request Description Box */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isTe ? "విశ్వాసి ప్రార్థన అంశము వివరాలు" : isHi ? "विश्वासी प्रार्थना विवरण" : "Believer Prayer Details"}
                  </h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                    {getPrayerDescTranslation(selectedPrayer.description)}
                  </div>
                </div>

                {/* Believer Info Bar & Delete Action */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase">{t.believer}:</span>
                    <span className="font-bold text-slate-900 dark:text-white break-all">
                      {selectedPrayer.isAnonymous ? "Anonymous Believer" : `${selectedPrayer.user?.name || "Member"} (${selectedPrayer.user?.email || "believer@kcm.org"})`}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleDeletePrayer(selectedPrayer.id)}
                    className="py-1.5 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isTe ? "తొలగించు" : isHi ? "हटाएं" : "Delete Request"}
                  </button>
                </div>

              </div>

              {/* Smart Scripture Support Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-slate-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900/90 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      {t.suggestedScripture}
                    </h3>
                  </div>
                  
                  <button 
                    onClick={() => handleCopyVerse(getVerseSuggestion(selectedPrayer.category))}
                    className="py-1.5 px-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 w-full sm:w-auto"
                  >
                    {copiedVerse ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedVerse ? (isTe ? "కాపీ చేయబడింది!" : isHi ? "कॉपी किया गया!" : "Copied!") : (isTe ? "వాక్యాన్ని కాపీ చేయండి" : isHi ? "వచన కాపీ کریں" : "Copy Verse")}
                  </button>
                </div>

                <p className="text-sm leading-relaxed italic font-semibold text-slate-900 dark:text-indigo-100">
                  "{getVerseSuggestion(selectedPrayer.category)}"
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {t.suggestedTip}
                </p>
              </div>

              {/* Intercessory Partner Assignment Box */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                  {t.partnerAssignment}
                </h3>
                
                {/* Form to add intercessor */}
                <form onSubmit={handleAssignPartner} className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    placeholder={isTe ? "పాస్టర్, నాయకుడు లేదా ప్రార్థన యోధుల పేరు..." : isHi ? "పాస్టర్ या प्रार्थना योद्धा का नाम..." : "Assign pastor, leader, or prayer warrior..."} 
                    value={assignedPartnerInput}
                    onChange={(e) => setAssignedPartnerInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
                  />
                  <button 
                    type="submit" 
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-indigo-600/20 transition-all active:scale-95 shrink-0 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    {isTe ? "కేటాయించు" : isHi ? "आवंटित करें" : "Assign"}
                  </button>
                </form>

                {/* Assigned list pills */}
                {selectedPrayer.assignedPartners && selectedPrayer.assignedPartners.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedPrayer.assignedPartners.map(partner => (
                      <span 
                        key={partner}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-bold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        {partner}
                        <button 
                          onClick={() => handleRemovePartner(partner)}
                          className="hover:text-rose-500 ml-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {t.assignTip}
                </p>
              </div>

            </div>
          ) : (
            /* Interactive Dispatcher Showcase when nothing is selected */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {isTe ? "ప్రార్థన విజ్ఞాపన కేంద్రం" : isHi ? "ప్రార్థన केंद्र" : "Prayer Dispatcher Command Hub"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    {isTe ? "అభ్యర్థనను ఎంచుకోండి లేదా క్రొత్త రికార్డును జోడించండి" : isHi ? "अनुरोध चुनें या नया प्रार्थना अनुरोध जोड़ें" : "Inspect believer prayer items, assign intercessors, or log offline requests"}
                  </p>
                </div>
                
                <button 
                  onClick={() => setIsLogModalOpen(true)}
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  {isTe ? "క్రొత్త ప్రార్థన అభ్యర్థన" : isHi ? "నయా प्रार्थना अनुरोध" : "Log Prayer Request"}
                </button>
              </div>

              {filteredPrayers.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredPrayers.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => setSelectedPrayer(p)}
                      className="p-5 bg-slate-50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl cursor-pointer transition-all space-y-3 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 rounded-full text-[10px] font-extrabold uppercase">
                          {getCategoryTranslation(p.category)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500" suppressHydrationWarning>
                          {formatDate(p.createdAt)}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {getPrayerTitleTranslation(p.title)}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 font-medium leading-relaxed">
                          {getPrayerDescTranslation(p.description)}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        <span>{p.isAnonymous ? t.anonymousRequest : (p.user?.name || "Member")}</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 border border-slate-300/60 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                          {getStatusTranslation(p.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {isTe ? "అభ్యర్థనలు ఏవీ లభించలేదు" : isHi ? "कोई प्रार्थना अनुरोध नहीं मिला" : "No Prayer Requests Available"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                    {t.selectRequestDesc}
                  </p>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      {/* ─── MODAL: LOG NEW PRAYER REQUEST ─── */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {isTe ? "క్రొత్త ప్రార్థన అభ్యర్థన నమోదు" : isHi ? "नया प्रार्थना अनुरोध दर्ज करें" : "Log Prayer Request"}
              </h3>
              <button 
                onClick={() => setIsLogModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreatePrayer} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {isTe ? "ప్రార్థన అంశము శీర్షిక" : isHi ? "प्रार्थना शीर्षक" : "Prayer Title"} *
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Prayer for Healing and Recovery" 
                  value={newPrayer.title}
                  onChange={(e) => setNewPrayer({ ...newPrayer, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {isTe ? "విభాగం" : isHi ? "श्रेणी" : "Category"}
                </label>
                <div className="relative flex items-center">
                  <select 
                    value={newPrayer.category}
                    onChange={(e) => setNewPrayer({ ...newPrayer, category: e.target.value as any })}
                    className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
                  >
                    <option value="HEALTH">{getCategoryTranslation("HEALTH")}</option>
                    <option value="FAMILY">{getCategoryTranslation("FAMILY")}</option>
                    <option value="FINANCIAL">{getCategoryTranslation("FINANCIAL")}</option>
                    <option value="SPIRITUAL">{getCategoryTranslation("SPIRITUAL")}</option>
                    <option value="GUIDANCE">{getCategoryTranslation("GUIDANCE")}</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {isTe ? "వివరణ" : isHi ? "विवरण" : "Description"}
                </label>
                <textarea 
                  placeholder="Details of the prayer points..." 
                  value={newPrayer.description}
                  onChange={(e) => setNewPrayer({ ...newPrayer, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none font-semibold"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox"
                  id="anonCheck"
                  checked={newPrayer.isAnonymous}
                  onChange={(e) => setNewPrayer({ ...newPrayer, isAnonymous: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
                <label htmlFor="anonCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  {isTe ? "అనామకంగా నమోదు చేయండి (పేరు దాచబడుతుంది)" : isHi ? "गुमनाम रूप से दर्ज करें" : "Log as Anonymous Request"}
                </label>
              </div>

              {!newPrayer.isAnonymous && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      {isTe ? "విశ్వాసి పేరు" : isHi ? "विश्वासी का नाम" : "Believer Name"}
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mary Sunitha" 
                      value={newPrayer.userName}
                      onChange={(e) => setNewPrayer({ ...newPrayer, userName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      {isTe ? "ఈమెయిల్" : isHi ? "ఈమెయిల్" : "Email"}
                    </label>
                    <input 
                      type="email" 
                      placeholder="e.g. mary@gmail.com" 
                      value={newPrayer.userEmail}
                      onChange={(e) => setNewPrayer({ ...newPrayer, userEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsLogModalOpen(false)} 
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl font-bold text-xs uppercase transition-colors"
                >
                  {isTe ? "రద్దు" : isHi ? "రద్దు" : "Cancel"}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                >
                  {isTe ? "నమోదు చేయండి" : isHi ? "दर्ज करें" : "Log Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
