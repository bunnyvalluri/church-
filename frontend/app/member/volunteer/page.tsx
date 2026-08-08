"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Briefcase, Send, Loader2, Check, Bell, Users, Gift, Lock, Info,
  Music, Tv, Heart, Star, Megaphone, Settings, Compass, ClipboardList,
  AlertCircle, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MINISTRIES = [
  {
    id: "WORSHIP",
    icon: Music,
    gradient: "from-purple-500 to-violet-600",
    badgeBg: "bg-purple-50 dark:bg-purple-950/40",
    badgeText: "text-purple-700 dark:text-purple-300",
    badgeBorder: "border-purple-200 dark:border-purple-800/40",
    slots: 5,
  },
  {
    id: "TECH",
    icon: Tv,
    gradient: "from-blue-500 to-indigo-600",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40",
    badgeText: "text-blue-700 dark:text-blue-300",
    badgeBorder: "border-blue-200 dark:border-blue-800/40",
    slots: 3,
  },
  {
    id: "KIDS",
    icon: Heart,
    gradient: "from-rose-500 to-pink-600",
    badgeBg: "bg-rose-50 dark:bg-rose-950/40",
    badgeText: "text-rose-700 dark:text-rose-300",
    badgeBorder: "border-rose-200 dark:border-rose-800/40",
    slots: 8,
  },
  {
    id: "HOSPITALITY",
    icon: Star,
    gradient: "from-amber-500 to-orange-500",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    badgeText: "text-amber-700 dark:text-amber-300",
    badgeBorder: "border-amber-200 dark:border-amber-800/40",
    slots: 10,
  },
  {
    id: "OUTREACH",
    icon: Megaphone,
    gradient: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    badgeBorder: "border-emerald-200 dark:border-emerald-800/40",
    slots: 15,
  },
  {
    id: "FACILITIES",
    icon: Settings,
    gradient: "from-slate-500 to-gray-600",
    badgeBg: "bg-gray-100 dark:bg-gray-800",
    badgeText: "text-gray-700 dark:text-gray-300",
    badgeBorder: "border-gray-200 dark:border-gray-700",
    slots: 4,
  },
];

const volunteerTranslations = {
  en: {
    title: "Volunteer Application Portal",
    subtitle: '"Each of you should use whatever gift you have received to serve others." — 1 Peter 4:10',
    openPositions: "Open Positions",
    acrossDepts: "Across {count} active ministry departments",
    nowAccepting: "Now Accepting Applications",
    step1: "Step 1 — Choose Your Ministry Department",
    step2: "Step 2 — Submit Your Credentials",
    fullName: "Your Registered Name",
    skillsLabel: "Skills, Experience & Testimony *",
    skillsPlaceholder: "For {name}: share your related skills, spiritual gifts, past experience, and why you feel led to serve in this capacity...",
    btnSubmit: "Submit Application",
    btnSubmitting: "Registering Credentials...",
    characters: "characters typed",
    promptSelect: "Select a ministry department from the grid to configure and begin your application",
    successTitle: "Credentials Registered Successfully!",
    successDesc: "Thank you for committing to serve in the {name}. A ministry coordinator will evaluate your testimony and contact you within 2-3 business days.",
    btnApplyAnother: "Apply for Another Ministry",
    toastSuccess: "Application submitted! A coordinator will reach out to you soon 🙌",
    toastFail: "Failed to submit. Please try again.",
    slotsSuffix: "slots",
    ministries: {
      WORSHIP: {
        name: "Worship Ministry",
        desc: "Choir, singers, instrumentalists & worship leaders."
      },
      TECH: {
        name: "Technical & Media",
        desc: "Audio, video production, live streaming & graphics."
      },
      KIDS: {
        name: "Children's Ministry",
        desc: "Sunday school, childcare & youth discipleship."
      },
      HOSPITALITY: {
        name: "Hospitality Team",
        desc: "Greeters, ushers, welcome crew & guest services."
      },
      OUTREACH: {
        name: "Charitable Outreach",
        desc: "Food distribution, medical camps & social welfare."
      },
      FACILITIES: {
        name: "Facilities & Security",
        desc: "Church maintenance, security & event logistics."
      }
    }
  },
  te: {
    title: "వాలంటీర్ దరఖాస్తు పోర్టల్",
    subtitle: '"ఒక్కొక్కడు తాను పొందిన వరమునుబట్టి ఇతరులకు పరిచర్య చేయుడి." — 1 పేతురు 4:10',
    openPositions: "ఖాళీ స్థానాలు",
    acrossDepts: "{count} పరిచర్య విభాగాలలో",
    nowAccepting: "దరఖాస్తులు స్వీకరించబడుతున్నాయి",
    step1: "దశ 1 — మీ పరిచర్య విభాగాన్ని ఎంచుకోండి",
    step2: "దశ 2 — మీ వివరాలను సమర్పించండి",
    fullName: "నమోదిత పూర్తి పేరు",
    skillsLabel: "నైపుణ్యాలు, అనుభవం & సాక్ష్యం *",
    skillsPlaceholder: "{name} కొరకు: మీ నైపుణ్యాలు, ఆత్మీయ వరాలు, గత అనుభవాలు మరియు మీరు ఎందుకు ఇక్కడ పరిచర్య చేయాలనుకుంటున్నారో పంచుకోండి...",
    btnSubmit: "దరఖాస్తు సమర్పించు",
    btnSubmitting: "సమర్పించబడుతోంది...",
    characters: "అక్షరాలు నమోదయ్యాయి",
    promptSelect: "మీ దరఖాస్తును ప్రారంభించడానికి గ్రిడ్ నుండి ఒక పరిచర్య విభాగాన్ని ఎంచుకోండి",
    successTitle: "దరఖాస్తు విజయవంతంగా సమర్పించబడింది!",
    successDesc: "{name} కోసం వాలంటీర్ చేసినందుకు ధన్యవాదాలు. ఒక పరిచర్య సమన్వయకర్త 2-3 పనిదినాల్లో మిమ్మల్ని సంప్రదిస్తారు.",
    btnApplyAnother: "మరో పరిచర్యకు దరఖాస్తు చేయండి",
    toastSuccess: "దరఖాస్తు సమర్పించబడింది! ఒక సమన్వయకర్త త్వరలోనే మిమ్మల్ని సంప్రదిస్తారు 🙌",
    toastFail: "సమర్పించడం విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    slotsSuffix: "ఖాళీలు",
    ministries: {
      WORSHIP: {
        name: "ఆరాధన పరిచర్య",
        desc: "గాయక బృందం, వాయిద్యకారులు & ఆరాధన నాయకులు."
      },
      TECH: {
        name: "టెక్నికల్ & మీడియా",
        desc: "ఆడియో, వీడియో ప్రొడక్షన్, లైవ్ స్ట్రీమింగ్ & గ్రాఫిక్స్."
      },
      KIDS: {
        name: "చిన్నపిల్లల పరిచర్య",
        desc: "సండే స్కూల్, పిల్లల సంరక్షణ & శిక్షణా కార్యక్రమాలు."
      },
      HOSPITALITY: {
        name: "ఆతిథ్య బృందం",
        desc: "ఆహ్వానించే వారు, ద్వారపాలకులు & అతిథి సేవలు."
      },
      OUTREACH: {
        name: "ధర్మకార్యాల పరిచర్య",
        desc: "ఆహార పంపిణీ, వైద్య శిబిరాలు & గ్రామీణ పరిచర్యలు."
      },
      FACILITIES: {
        name: "నిర్వహణ & భద్రత",
        desc: "చర్చి నిర్వహణ, భద్రత & లాజిస్టిక్స్."
      }
    }
  },
  hi: {
    title: "स्वयंसेवक आवेदन पोर्टल",
    subtitle: '"तुम में से हर एक को जैसा वरदान मिला है, उसे दूसरों की सेवा में लगाओ।" — 1 पतरस 4:10',
    openPositions: "खुले पद",
    acrossDepts: "{count} सक्रिय मंत्रालयों में",
    nowAccepting: "आवेदन स्वीकार किए जा रहे हैं",
    step1: "चरण 1 — अपना मंत्रालय विभाग चुनें",
    step2: "चरण 2 — अपनी साख जमा करें",
    fullName: "आपका पंजीकृत नाम",
    skillsLabel: "कौशल, अनुभव और गवाही *",
    skillsPlaceholder: "{name} के लिए: अपने संबंधित कौशल, आध्यात्मिक उपहार, अनुभव साझा करें और आप यहाँ सेवा क्यों करना चाहते हैं...",
    btnSubmit: "आवेदन जमा करें",
    btnSubmitting: "पंजीकरण किया जा रहा है...",
    characters: "वर्ण टाइप किए गए",
    promptSelect: "अपना आवेदन शुरू करने के लिए ग्रिड से एक मंत्रालय विभाग चुनें",
    successTitle: "आवेदन सफलतापूर्वक पंजीकृत!",
    successDesc: "{name} के लिए स्वयंसेवा करने के लिए धन्यवाद। एक मंत्रालय समन्वयक आपके विवरण का मूल्यांकन करेगा और 2-3 कार्य दिवसों के भीतर आपसे संपर्क करेगा।",
    btnApplyAnother: "अन्य मंत्रालय के लिए आवेदन करें",
    toastSuccess: "आवेदन जमा हो गया! एक समन्वयक जल्द ही आपसे संपर्क करेगा 🙌",
    toastFail: "जमा करने में विफल। कृपया पुन: प्रयास करें।",
    slotsSuffix: "पद",
    ministries: {
      WORSHIP: {
        name: "आराधना मंत्रालय",
        desc: "गायक दल, गायक, वादक और आराधना नेता।"
      },
      TECH: {
        name: "तकनीकी और मीडिया",
        desc: "ऑडियो, वीडियो उत्पादन, लाइव स्ट्रीमिंग और ग्राफिक्स।"
      },
      KIDS: {
        name: "बच्चों का मंत्रालय",
        desc: "संडे स्कूल, बच्चों की देखभाल और शिष्यता कार्यक्रम।"
      },
      HOSPITALITY: {
        name: "अतिथि सत्कार टीम",
        desc: "अतिथियों का स्वागत करने वाले, सेवादार और सेवाएं।"
      },
      OUTREACH: {
        name: "धर्मार्थ आउटरीच",
        desc: "खाद्य वितरण, चिकित्सा शिविर और कल्याण कार्य।"
      },
      FACILITIES: {
        name: "सुविधाएं और सुरक्षा",
        desc: "चर्च रखरखाव, सुरक्षा और आयोजन रसद।"
      }
    }
  }
};

export default function MemberVolunteer() {
  const { user, status, mounted } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const vt = volunteerTranslations[language as keyof typeof volunteerTranslations] || volunteerTranslations.en;

  const [selected, setSelected] = useState<string | null>(null);
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  useEffect(() => {
    if (selected && typeof window !== "undefined" && window.innerWidth < 1024) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selected]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/member/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid, name: user?.name, volunteerInterest: selected, volunteerSkills: skills }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        showToast(vt.toastSuccess, "success");
      } else throw new Error(data.error || "Failed to submit");
    } catch (err: any) {
      showToast(err.message || vt.toastFail, "error");
    } finally {
      setLoading(false);
    }
  };

  const selectedData = MINISTRIES.find(m => m.id === selected);
  const selectedDetails = selected ? vt.ministries[selected as keyof typeof vt.ministries] : null;

  if (status === "unauthenticated" && mounted) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Floating Bottom Pop-Up Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 sm:bottom-8 sm:left-auto sm:right-6 sm:translate-x-0 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold border max-w-[92vw] sm:max-w-md backdrop-blur-xl transition-all ${
              toast.type === "success"
                ? "bg-emerald-600 text-white border-emerald-400/40 shadow-emerald-600/30"
                : "bg-rose-600 text-white border-rose-400/40 shadow-rose-600/30"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 text-white" />}
            <span className="leading-snug whitespace-normal">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="relative overflow-hidden p-5 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 dark:bg-indigo-700 text-white border border-indigo-500 dark:border-indigo-500 text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
            <Gift className="w-3.5 h-3.5 text-white" />
            {language === "te" ? "పరిచర్య పిలుపు" : language === "hi" ? "मंत्रालय सेवा" : "Ministry Calling"}
          </div>
          <h1 className="text-lg sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            {vt.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium italic border-l-2 border-indigo-500 pl-3 py-0.5">
            {vt.subtitle}
          </p>
        </div>
      </div>

      {/* Total Open Slots Indicator Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 dark:from-indigo-950/60 dark:via-violet-950/60 dark:to-purple-950/60 border border-indigo-200/20 dark:border-indigo-900/20 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-5 text-center sm:text-left">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 dark:bg-white/[0.04] border border-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg text-white shrink-0">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <p className="font-black text-lg sm:text-xl leading-none text-white tracking-tight">
              {MINISTRIES.reduce((s, m) => s + m.slots, 0)} {vt.openPositions}
            </p>
            <p className="text-indigo-100 dark:text-indigo-300 text-xs mt-1 font-bold">
              {vt.acrossDepts.replace("{count}", MINISTRIES.length.toString())}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-2 text-[10px] sm:text-xs font-black bg-white/20 dark:bg-white/[0.06] border border-white/30 px-4 py-2 rounded-full text-white shadow-sm shrink-0 uppercase tracking-wider">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          {vt.nowAccepting}
        </span>
      </div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/30 shadow-2xl p-6 sm:p-12 text-center relative overflow-hidden max-w-3xl mx-auto"
        >
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 animate-bounce">
            <Check className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">{vt.successTitle}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto mb-6 font-medium">
            {vt.successDesc.replace("{name}", selectedDetails?.name || "")}
          </p>
          
          <button
            onClick={() => { setSubmitted(false); setSelected(null); setSkills(""); }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-indigo-500/20 hover:shadow-lg active:scale-95 cursor-pointer"
          >
            {vt.btnApplyAnother}
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* STEP 1: Department Grid — 3 Columns on Desktop */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                {vt.step1}
              </h2>
              {selected && (
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear selection
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {MINISTRIES.map((m, i) => {
                const Icon = m.icon;
                const isSelected = selected === m.id;
                const localDetails = vt.ministries[m.id as keyof typeof vt.ministries];
                return (
                  <motion.button
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelected(m.id)}
                    className={`relative text-left p-5 sm:p-6 rounded-3xl border-2 transition-all duration-300 group flex flex-col justify-between h-full cursor-pointer ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20"
                        : "border-gray-200/80 dark:border-white/5 bg-white dark:bg-gray-900 hover:border-purple-300 dark:hover:border-purple-700/50 hover:shadow-xl hover:-translate-y-1"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                    <div>
                      <div className={`w-12 h-12 bg-gradient-to-br ${m.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-extrabold text-gray-900 dark:text-white text-base tracking-tight mb-1.5 leading-tight">{localDetails.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 mb-4 font-medium">{localDetails.desc}</p>
                    </div>
                    
                    <div className="flex items-center justify-between w-full pt-3 border-t border-gray-100 dark:border-gray-800/80 mt-auto">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${m.badgeBg} ${m.badgeText} ${m.badgeBorder}`}>
                        {m.id}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
                        <Users className="w-3.5 h-3.5" />
                        {m.slots} {vt.slotsSuffix}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Application Form Panel */}
          <div ref={formRef}>
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xl overflow-hidden max-w-4xl mx-auto backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800/80 bg-indigo-50/40 dark:bg-indigo-950/20">
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-extrabold text-gray-900 dark:text-white text-sm uppercase tracking-wider">{vt.step2}</h3>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 shadow-xs">
                      {selectedDetails?.name}
                    </span>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                    {/* Active Selection Display Banner */}
                    <div className={`flex items-center gap-3.5 p-4 rounded-2xl border ${selectedData?.badgeBg} ${selectedData?.badgeBorder}`}>
                      {selectedData && <selectedData.icon className={`w-6 h-6 ${selectedData.badgeText} shrink-0`} />}
                      <div className="min-w-0">
                        <p className={`text-sm font-black ${selectedData?.badgeText} tracking-tight`}>{selectedDetails?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedDetails?.desc}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Disabled Name Field */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{vt.fullName}</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={user?.name || ""} 
                            disabled
                            className="w-full py-3 pl-10 pr-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 cursor-not-allowed text-xs sm:text-sm font-semibold"
                          />
                          <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      {/* Selected Ministry ID Field */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target Ministry</label>
                        <input 
                          type="text" 
                          value={`${selectedDetails?.name} (${selectedData?.slots} slots open)`} 
                          disabled
                          className="w-full py-3 px-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Testimony TextArea */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{vt.skillsLabel}</label>
                      <textarea
                        value={skills} 
                        onChange={e => setSkills(e.target.value)} 
                        required 
                        rows={5}
                        placeholder={vt.skillsPlaceholder.replace("{name}", selectedDetails?.name || "")}
                        className="w-full py-3 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none text-xs sm:text-sm leading-relaxed font-medium"
                      />
                      <div className="flex justify-between items-center px-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-semibold">
                          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                          {language === "te" ? "వివరాలు అత్యవసరం" : language === "hi" ? "विवरण आवश्यक है" : "Details mandatory for ministry evaluation"}
                        </span>
                        <p className="text-xs font-bold text-gray-400 uppercase">{skills.length} {vt.characters}</p>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading || !skills.trim()}
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          <span>{vt.btnSubmitting}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{vt.btnSubmit}</span>
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-center">
                  <p className="text-xs text-indigo-600 dark:text-indigo-300 font-bold">
                    💡 Click on any of the ministry cards above to begin your volunteer application.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
