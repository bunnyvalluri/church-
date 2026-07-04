"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Heart, CheckCircle, Clock, BookOpen, UserPlus, Filter, ShieldCheck, ChevronRight, ChevronDown } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface PrayerRequestsProps {
  users: any[];
}

interface Prayer {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  isAnonymous: boolean;
  status: "PENDING" | "PRAYING" | "ANSWERED";
  createdAt: string;
  user?: any;
}

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
      "యెహోవా, నీవు నన్ను స్వస్థపరచుము, నేను స్వస్థత పొందుదును; నన్ను రక్షించుము, నేను రక్షింపబడుదును; నీవే నా స్తోత్రపాత్రుడవు. - యిర్మీయా 17:14",
      "మీలో ఎవడైనను రోగియై యున్నాడా? అతడు సంఘపు పెద్దలను పిలిపించి వారిచేత ప్రార్థన చేయించవలెను... - యాకోబు 5:14"
    ],
    FAMILY: [
      "ప్రభువైన యేసునందు విశ్వాసముంచుము, అప్పుడు నీవును నీ యింటివారును రక్షణ పొందుదురు. - అపొస్తలుల కార్యములు 16:31",
      "నేనును నా యింటివారును యెహోవాను సేవించెదము. - యెహోషువ 24:15"
    ],
    FINANCIAL: [
      "కాగా దేవుడు తన ఐశ్వర్యము చొప్పున క్రీస్తుయేసునందు మహిమలో మీ ప్రతి అవసరమును తీర్చును. - ఫిలిప్పీయులకు 4:19",
      "యెహోవా నా కాపరి, నాకు లేమి కలుగదు. - కీర్తనల గ్రంథము 23:1"
    ],
    SPIRITUAL: [
      "దేవుని యొద్దకు రండి, అప్పుడాయన మీ యొద్దకు వచ్చును. - యాకోబు 4:8",
      "దేవా, నా యందు శుద్ధహృదయము కలుగజేయుము, నా అంతరంగములో స్థిరమైన మనస్సును నూతనముగా పుట్టించుము. - కీర్తనల గ్రంథము 51:10"
    ],
    GUIDANCE: [
      "నీ స్వబుద్ధిని ఆధారము చేసికొనక నీ పూర్ణహృదయముతో యెహోవాయందు నమ్మకముంచుము... - సామెతలు 3:5-6",
      "నీ వాక్యము నా పాదములకు దీపమును నా త్రోవకు వెలుగునై యున్నది. - కీర్తనల గ్రంథము 119:105"
    ],
    OTHER: [
      "దేనిని గూర్చియు చింతపడకుడి గాని ప్రతి విషయములోను ప్రార్థన విజ్ఞాపనముల చేత... - ఫిలిప్పీయులకు 4:6"
    ]
  },
  hi: {
    HEALTH: [
      "हे यहोवा, मुझे चंगा कर, तब मैं चंगा हो जाऊंगा; मुझे बचा, तब मैं बच जाऊंगा; क्योंकि मैं तेरी ही स्तुति करता हूँ। - यिर्मयाह 17:14",
      "यदि तुम में कोई बीमार हो, तो वह कलीसिया के प्राचीनों को बुलाए, और वे उस पर प्रार्थना करें... - याकूब 5:14"
    ],
    FAMILY: [
      "प्रभु यीशु पर विश्वास कर, तो तू और तेरा घराना उद्धार पाएगा। - प्रेरितों के काम 16:31",
      "परन्तु मैं और तेरा घराना तो यहोवा ही की सेवा करेंगे। - यहोशू 24:15"
    ],
    FINANCIAL: [
      "और मेरा परमेश्वर अपने उस धन के अनुसार जो महिमा सहित मसीह यीशु में है, तुम्हारी हर एक घटी को पूरी करेगा। - फिलिप्पियों 4:19",
      "यहोवा मेरा चरवाहा है, मुझे कोई घटी न होगी। - भजन संहिता 23:1"
    ],
    SPIRITUAL: [
      "परमेश्वर के निकट आओ, तो वह भी तुम्हारे निकट आएगा। - याकूब 4:8",
      "हे परमेश्वर, मेरे अन्दर शुद्ध मन उत्पन्न कर, और मेरे भीतर स्थिर आत्मा नये सिरे से उत्पन्न कर। - भजन संहिता 51:10"
    ],
    GUIDANCE: [
      "तू अपनी समझ का सहारा न लेना, वरन सम्पूर्ण मन से यहोवा पर भरोसा रखना... - नीतिवचन 3:5-6",
      "तेरा वचन मेरे पांव के लिये दीपक, और मेरे मार्ग के लिये उजियाला है। - भजन संहिता 119:105"
    ],
    OTHER: [
      "किसी भी बात की चिन्ता न करो; परन्तु हर एक बात में तुम्हारे प्रार्थना और निवेदन के द्वारा... - फिलिप्पियों 4:6"
    ]
  }
};

export default function PrayerRequests({ users }: PrayerRequestsProps) {
  const { language } = useLanguage();
  const activeLang = language === "te" || language === "hi" ? language : "en";
  const t = adminTranslations[activeLang].prayers;

  const getCategoryTranslation = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "HEALTH": return t.health;
      case "FAMILY": return t.family;
      case "FINANCIAL": case "FINANCE": return t.finance;
      case "SPIRITUAL": return t.spiritual;
      case "GUIDANCE": return t.guidance;
      default: return cat;
    }
  };

  const getStatusTranslation = (stat: string) => {
    switch (stat.toUpperCase()) {
      case "PENDING": return t.pending;
      case "PRAYING": return t.praying;
      case "ANSWERED": return t.answered;
      default: return stat;
    }
  };

  const getPrayerTitleTranslation = (title: string) => {
    switch (title) {
      case "Complete Healing of Joint Pains": return activeLang === "te" ? "కీళ్ల నొప్పుల నుండి సంపూర్ణ స్వస్థత" : activeLang === "hi" ? "जोड़ों के दर्द से पूर्ण चंगाई" : title;
      case "Job Opening & Job Security": return activeLang === "te" ? "ఉద్యోగ అవకాశం & ఉద్యోగ భద్రత" : activeLang === "hi" ? "नौकरी के अवसर और नौकरी की सुरक्षा" : title;
      case "Grace for spiritual growth": return activeLang === "te" ? "ఆత్మీయ వృద్ధి కొరకు కృప" : activeLang === "hi" ? "आध्यात्मिक विकास के लिए अनुग्रह" : title;
      default: return title;
    }
  };

  const getPrayerDescTranslation = (desc: string) => {
    if (desc.includes("Please pray for my mother who is suffering from severe arthritis")) {
      return activeLang === "te" ? "హైదరాబాద్‌లో తీవ్రమైన కీళ్లవాతం మరియు కీళ్ల నొప్పులతో బాధపడుతున్న నా తల్లి కొరకు దయచేసి ప్రార్థించండి." :
             activeLang === "hi" ? "कृपया मेरी माँ के लिए प्रार्थना करें जो हैदराबाद में गंभीर गठिया और जोड़ों के दर्द से पीड़ित हैं।" : desc;
    }
    if (desc.includes("Praying for a break in corporate job search")) {
      return activeLang === "te" ? "కార్పొరేట్ ఉద్యోగ అన్వేషణలో విజయం కొరకు ప్రార్థన. నా కుటుంబ అవసరాలకు మద్దతుగా స్థిరత్వం అవసరం." :
             activeLang === "hi" ? "कॉर्पोरेट नौकरी खोज में सफलता के लिए प्रार्थना। मेरे परिवार की जरूरतों का समर्थन करने के लिए स्थिरता की आवश्यकता है।" : desc;
    }
    if (desc.includes("Fasting and seeking wisdom")) {
      return activeLang === "te" ? "ఉపవాసం ఉండి జ్ఞానాన్ని కోరుకుంటున్నాను. నా దినసరి ప్రార్థన షెడ్యూల్‌లో స్థిరంగా ఉండటానికి ప్రార్థనలు అవసరం." :
             activeLang === "hi" ? "उपवास और बुद्धि की खोज। मेरी दैनिक भक्ति दिनचर्या में निरंतर बने रहने के लिए प्रार्थना की आवश्यकता है।" : desc;
    }
    return desc;
  };

  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assignedPartner, setAssignedPartner] = useState("");

  useEffect(() => {
    const loadAllPrayers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/member/prayers?userId=all_admin_peek");
        const data = await res.json();
        
        let list = data.prayers || [];
        
        const mapped = list.map((p: any) => {
          const user = users.find(u => u.id === p.userId || u.uid === p.userId) || { name: "Congregation Believer", email: "believer@gmail.com" };
          return { ...p, user };
        });
        setPrayers(mapped);
      } catch (e) {
        console.warn("Failed to load prayers, using rich mock registry", e);
      } finally {
        setLoading(false);
      }
    };

    loadAllPrayers();
  }, [users]);

  const handleStatusChange = (prayerId: string, newStatus: "PENDING" | "PRAYING" | "ANSWERED") => {
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
  };

  const handleAssignPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrayer || !assignedPartner) return;
    alert(`Prayer partner '${assignedPartner}' has been assigned to support this request.`);
    setAssignedPartner("");
  };

  const filteredPrayers = prayers.filter(p => {
    const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const getVerseSuggestion = (category: string) => {
    const langVerses = BIBLE_VERSES[activeLang] || BIBLE_VERSES.en;
    const verses = langVerses[category] || langVerses.OTHER;
    return verses[0];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
      
      {/* ─── Sidebar: Prayers List ─── */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-955 dark:text-white tracking-tight uppercase flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#6366F1]" /> {t.prayerRequests}
            </h2>
            <Filter className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex gap-2">
            <div className="relative w-1/2 flex items-center">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full py-2 pl-3 pr-8 bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-gray-300 rounded-xl text-[10px] font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500"
              >
                <option value="ALL">{t.allCategories}</option>
                <option value="HEALTH">{t.health}</option>
                <option value="FAMILY">{t.family}</option>
                <option value="FINANCIAL">{t.finance}</option>
                <option value="SPIRITUAL">{t.spiritual}</option>
                <option value="GUIDANCE">{t.guidance}</option>
              </select>
              <ChevronDown className="absolute right-2.5 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative w-1/2 flex items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2 pl-3 pr-8 bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-gray-300 rounded-xl text-[10px] font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500"
              >
                <option value="ALL">{t.allStatuses}</option>
                <option value="PENDING">{t.pending}</option>
                <option value="PRAYING">{t.praying}</option>
                <option value="ANSWERED">{t.answered}</option>
              </select>
              <ChevronDown className="absolute right-2.5 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1.5 custom-scrollbar">
            {loading ? (
              <div className="text-center py-12 text-xs text-slate-400 dark:text-gray-500">{t.loading}</div>
            ) : filteredPrayers.map(p => {
              const isSelected = selectedPrayer?.id === p.id;
              return (
                <div 
                  key={p.id}
                  onClick={() => setSelectedPrayer(p)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-0.5 ${
                    isSelected 
                      ? "bg-indigo-50/35 dark:bg-indigo-500/5 border-indigo-500/55 dark:border-indigo-500/40 shadow-[0_2px_8px_rgba(99,102,241,0.05)]" 
                      : "bg-slate-50/45 hover:bg-slate-50 dark:bg-[#16172D]/30 dark:hover:bg-[#16172D]/50 border-slate-150/60 dark:border-white/[0.04] hover:border-slate-250"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                      p.status === "ANSWERED" 
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border-emerald-100 dark:border-emerald-500/20" 
                        : p.status === "PRAYING" 
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-455 border-blue-100 dark:border-blue-500/20" 
                        : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-450 border-amber-100 dark:border-amber-500/20"
                    }`}>
                      {getStatusTranslation(p.status)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500">{formatDate(p.createdAt)}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-2">{getPrayerTitleTranslation(p.title)}</h4>
                  <p className="text-[10px] text-slate-450 dark:text-gray-400 line-clamp-1 mt-0.5 leading-normal font-medium">{getPrayerDescTranslation(p.description)}</p>
                  
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.03]">
                    <span className="inline-block text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{getCategoryTranslation(p.category)}</span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500">
                      {p.isAnonymous ? t.anonymousRequest : (p.user?.name || "Member")}
                    </span>
                  </div>
                </div>
              );
            })}
            {!loading && filteredPrayers.length === 0 && (
              <p className="text-center text-xs text-slate-400 dark:text-gray-500 py-8 font-semibold">{t.noRequests}</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Detail View: Prayer Details & Actions ─── */}
      <div className="lg:col-span-2 space-y-6">
        {selectedPrayer ? (
          <div className="space-y-6">
            {/* Main Details Card */}
            <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl space-y-5">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-[#6366F1] dark:text-indigo-400 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-500/20">{getCategoryTranslation(selectedPrayer.category)}</span>
                    {selectedPrayer.isAnonymous && (
                      <span className="px-2.5 py-0.5 bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-gray-400 rounded-lg text-[9px] font-bold border border-slate-150 dark:border-white/[0.06]">{t.anonymousRequest}</span>
                    )}
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-950 dark:text-white mt-3 leading-none tracking-tight">{getPrayerTitleTranslation(selectedPrayer.title)}</h2>
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1.5 font-semibold">{t.submitted}: {new Date(selectedPrayer.createdAt).toLocaleString(activeLang === "te" ? "te-IN" : activeLang === "hi" ? "hi-IN" : "en-IN")}</p>
                </div>

                {/* Status selection tab buttons */}
                <div className="p-1 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl flex gap-1 items-center">
                  <button 
                    onClick={() => handleStatusChange(selectedPrayer.id, "PENDING")}
                    className={`py-2 px-3 rounded-lg flex items-center gap-1.5 text-[10px] font-bold transition-all ${
                      selectedPrayer.status === "PENDING"
                        ? "bg-white dark:bg-white/[0.06] text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/50 dark:border-white/[0.02]"
                        : "text-slate-400 hover:text-slate-650"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" /> {t.pending}
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedPrayer.id, "PRAYING")}
                    className={`py-2 px-3 rounded-lg flex items-center gap-1.5 text-[10px] font-bold transition-all ${
                      selectedPrayer.status === "PRAYING"
                        ? "bg-white dark:bg-white/[0.06] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-white/[0.02]"
                        : "text-slate-400 hover:text-slate-650"
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" /> {t.praying}
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedPrayer.id, "ANSWERED")}
                    className={`py-2 px-3 rounded-lg flex items-center gap-1.5 text-[10px] font-bold transition-all ${
                      selectedPrayer.status === "ANSWERED"
                        ? "bg-white dark:bg-white/[0.06] text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-white/[0.02]"
                        : "text-slate-400 hover:text-slate-650"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> {t.answered}
                  </button>
                </div>
              </div>

              <hr className="border-t border-slate-100 dark:border-white/[0.03]" />

              {/* Testimony content wrapper */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">{t.testimonyTitle}</h4>
                <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed bg-slate-50/40 dark:bg-[#16172D]/20 p-4 border border-slate-100 dark:border-white/[0.03] rounded-xl font-medium">{getPrayerDescTranslation(selectedPrayer.description)}</p>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-450 dark:text-gray-500 pt-1 font-semibold">
                <span>{t.requestId}: <span className="font-mono text-[10px] text-slate-400 dark:text-gray-650">{selectedPrayer.id}</span></span>
                {!selectedPrayer.isAnonymous && (
                  <span>{t.believer}: <strong className="text-slate-800 dark:text-white font-bold">{selectedPrayer.user?.name} ({selectedPrayer.user?.email})</strong></span>
                )}
              </div>
            </div>

            {/* Smart Scripture Support - Premium quote layout */}
            <div className="bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-650/15 dark:to-purple-650/15 border border-indigo-100/55 dark:border-indigo-500/10 text-indigo-950 dark:text-indigo-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-550 dark:text-indigo-400 shrink-0" />
                <h3 className="font-extrabold text-sm">{t.suggestedScripture}</h3>
              </div>
              <p className="text-xs leading-relaxed italic font-bold">
                "{getVerseSuggestion(selectedPrayer.category)}"
              </p>
              <p className="text-[10px] opacity-75 font-semibold">{t.suggestedTip}</p>
            </div>

            {/* Assign Intercessors Panel */}
            <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl space-y-4">
              <h3 className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <UserPlus className="w-4.5 h-4.5 text-[#6366F1]" /> {t.partnerAssignment}
              </h3>
              
              <form onSubmit={handleAssignPartner} className="flex gap-3">
                <input 
                  type="text" required placeholder={activeLang === "te" ? "ప్రసంగీకుడు, నాయకుడు లేదా భాగస్వామి పేరు..." : activeLang === "hi" ? "प्रचारक, नेता या भागीदार का नाम..." : "Preacher, Leader, or Partner Name..."} value={assignedPartner}
                  onChange={(e) => setAssignedPartner(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
                <button type="submit" className="py-2.5 px-5 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-md shadow-indigo-500/10 active:scale-[0.98]">
                  {t.assignPartnerBtn}
                </button>
              </form>
              <p className="text-[9px] text-slate-400 dark:text-gray-500 font-semibold">{t.assignTip}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-16 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl text-center flex flex-col items-center justify-center gap-2.5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-1.5 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
              <Heart className="w-7 h-7 text-indigo-500 animate-pulse" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mt-1">{t.selectRequest}</h3>
            <p className="text-xs text-slate-400 dark:text-gray-500 max-w-xs leading-relaxed font-semibold">{t.selectRequestDesc}</p>
          </div>
        )}
      </div>

    </div>
  );
}
