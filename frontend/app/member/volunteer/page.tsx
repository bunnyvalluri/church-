"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Briefcase, Send, Loader2, Check, Bell, Users, Gift, Lock, Info,
  Music, Tv, Heart, Star, Megaphone, Settings, Compass, ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MINISTRIES = [
  {
    id: "WORSHIP",
    icon: Music,
    gradient: "from-purple-500 to-violet-600",
    badgeBg: "bg-purple-50 dark:bg-purple-950/30",
    badgeText: "text-purple-700 dark:text-purple-300",
    badgeBorder: "border-purple-200 dark:border-purple-900/30",
    slots: 5,
  },
  {
    id: "TECH",
    icon: Tv,
    gradient: "from-blue-500 to-indigo-600",
    badgeBg: "bg-blue-50 dark:bg-blue-950/30",
    badgeText: "text-blue-700 dark:text-blue-300",
    badgeBorder: "border-blue-200 dark:border-blue-900/30",
    slots: 3,
  },
  {
    id: "KIDS",
    icon: Heart,
    gradient: "from-rose-500 to-pink-600",
    badgeBg: "bg-rose-50 dark:bg-rose-950/30",
    badgeText: "text-rose-700 dark:text-rose-300",
    badgeBorder: "border-rose-200 dark:border-rose-900/30",
    slots: 8,
  },
  {
    id: "HOSPITALITY",
    icon: Star,
    gradient: "from-amber-500 to-orange-500",
    badgeBg: "bg-amber-50 dark:bg-amber-950/30",
    badgeText: "text-amber-700 dark:text-amber-300",
    badgeBorder: "border-amber-200 dark:border-amber-900/30",
    slots: 10,
  },
  {
    id: "OUTREACH",
    icon: Megaphone,
    gradient: "from-green-500 to-emerald-600",
    badgeBg: "bg-green-50 dark:bg-green-950/30",
    badgeText: "text-green-700 dark:text-green-300",
    badgeBorder: "border-green-200 dark:border-green-900/30",
    slots: 15,
  },
  {
    id: "FACILITIES",
    icon: Settings,
    gradient: "from-slate-500 to-gray-600",
    badgeBg: "bg-gray-50 dark:bg-gray-800",
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
        desc: "Choir, singers, instrumentalists & worship leaders. Lead the congregation in Spirit-filled praise."
      },
      TECH: {
        name: "Technical & Media",
        desc: "Audio, video production, live streaming, social media management & graphics."
      },
      KIDS: {
        name: "Children's Ministry",
        desc: "Sunday school, vacation bible school, childcare & youth discipleship programs."
      },
      HOSPITALITY: {
        name: "Hospitality Team",
        desc: "Greeters, ushers, welcome crew, refreshments & guest services for all services."
      },
      OUTREACH: {
        name: "Charitable Outreach",
        desc: "Food distribution, medical camps, evangelism teams, village ministry & social welfare."
      },
      FACILITIES: {
        name: "Facilities & Security",
        desc: "Church maintenance, security, setup/teardown, property management & event logistics."
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
    promptSelect: "మీ దరఖాస్తును ప్రారంభించడానికి కుడి వైపు గ్రిడ్ నుండి ఒక పరిచర్య విభాగాన్ని ఎంచుకోండి",
    successTitle: "దరఖాస్తు విజయవంతంగా సమర్పించబడింది!",
    successDesc: "{name} కోసం వాలంటీర్ చేసినందుకు ధన్యవాదాలు. ఒక పరిచర్య సమన్వయకర్త 2-3 పనిదినాల్లో మిమ్మల్ని సంప్రదిస్తారు.",
    btnApplyAnother: "మరో పరిచర్యకు దరఖాస్తు చేయండి",
    toastSuccess: "దరఖాస్తు సమర్పించబడింది! ఒక సమన్వయకర్త త్వరలోనే మిమ్మల్ని సంప్రదిస్తారు 🙌",
    toastFail: "సమర్పించడం విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    slotsSuffix: "ఖాళీలు",
    ministries: {
      WORSHIP: {
        name: "ఆరాధన పరిచర్య",
        desc: "గాయక బృందం, వాయిద్యకారులు & ఆరాధన నాయకులు. ఆరాధనలో సంఘాన్ని నడిపించడం."
      },
      TECH: {
        name: "టెక్నికల్ & మీడియా",
        desc: "ఆడియో, వీడియో ప్రొడక్షన్, లైవ్ స్ట్రీమింగ్, సోషల్ మీడియా మరియు గ్రాఫిక్స్."
      },
      KIDS: {
        name: "చిన్నపిల్లల పరిచర్య",
        desc: "సండే స్కూల్, బైబిల్ స్కూల్, పిల్లల సంరక్షణ & యవ్వనస్థుల శిక్షణా కార్యక్రమాలు."
      },
      HOSPITALITY: {
        name: "ఆతిథ్య బృందం",
        desc: "ఆహ్వానించే వారు, ద్వారపాలకులు, స్వచ్ఛంద సేవకులు మరియు అతిథి సేవలు."
      },
      OUTREACH: {
        name: "ధర్మకార్యాల పరిచర్య",
        desc: "ఆహార పంపిణీ, వైద్య శిబిరాలు, సువార్త బృందాలు & గ్రామీణ పరిచర్యలు."
      },
      FACILITIES: {
        name: "నిర్వహణ & భద్రత",
        desc: "చర్చి నిర్వహణ, భద్రత, అమరికలు మరియు కార్యక్రమ లాజిస్టిక్స్."
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
        desc: "गायक दल, गायक, वादक और आराधना नेता। आराधना में कलीसिया का नेतृत्व करना।"
      },
      TECH: {
        name: "तकनीकी और मीडिया",
        desc: "ऑडियो, वीडियो उत्पादन, लाइव स्ट्रीमिंग, सोशल media प्रबंधन और ग्राफिक्स।"
      },
      KIDS: {
        name: "बच्चों का मंत्रालय",
        desc: "संडे स्कूल, वेकेशन बाइबल स्कूल, बच्चों की देखभाल और युवा शिष्यता कार्यक्रम।"
      },
      HOSPITALITY: {
        name: "अतिथि सत्कार टीम",
        desc: "अतिथियों का स्वागत करने वाले, सेवादार, जलपान और अतिथि सेवाएं।"
      },
      OUTREACH: {
        name: "धर्मार्थ आउटरीच",
        desc: "खाद्य वितरण, चिकित्सा शिविर, सुसमाचार प्रचार दल, ग्रामीण मंत्रालय और कल्याण कार्य।"
      },
      FACILITIES: {
        name: "सुविधाएं और सुरक्षा",
        desc: "चर्च रखरखाव, सुरक्षा, सेटअप/टीयरडाउन और आयोजन रसद।"
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

  // Smooth scroll to form on mobile when selection happens
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

  if (!mounted || status === "loading" || status === "unauthenticated") return null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 sm:space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold border max-w-[90vw] sm:max-w-xs ${
              toast.type === "success" 
                ? "bg-emerald-500 text-white border-emerald-400/20 shadow-emerald-500/10" 
                : "bg-rose-500 text-white border-rose-400/20 shadow-rose-500/10"
            }`}
          >
            <Bell className="w-4.5 h-4.5 flex-shrink-0 animate-bounce" />
            <span className="truncate">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Profile Section */}
      <div className="relative overflow-hidden p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121324] border border-gray-100 dark:border-white/[0.04] shadow-sm">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-[#6366F1] border border-indigo-100 dark:border-indigo-900/30 text-[10px] font-extrabold uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" />
            {language === "te" ? "పరిచర్య పిలుపు" : language === "hi" ? "मंत्रालय सेवा" : "Ministry Calling"}
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            {vt.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium italic border-l-2 border-indigo-500 pl-3 py-0.5">
            {vt.subtitle}
          </p>
        </div>
      </div>

      {/* Total Open Slots Indicator Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 dark:from-indigo-950/40 dark:via-violet-950/40 dark:to-purple-950/40 border border-indigo-200/20 dark:border-indigo-900/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-3 sm:gap-4">
          <div className="w-12 h-12 bg-white/10 dark:bg-white/[0.04] border border-white/20 dark:border-white/[0.08] backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg text-white">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="font-black text-xl leading-none text-white tracking-tight">
              {MINISTRIES.reduce((s, m) => s + m.slots, 0)} {vt.openPositions}
            </p>
            <p className="text-indigo-100 dark:text-indigo-300 text-xs mt-1.5 font-bold">
              {vt.acrossDepts.replace("{count}", MINISTRIES.length.toString())}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-2 text-xs font-black bg-white/20 dark:bg-white/[0.06] border border-white/30 dark:border-white/[0.1] px-5 py-2.5 rounded-full text-white shadow-sm shrink-0 uppercase tracking-wider">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          {vt.nowAccepting}
        </span>
      </div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#121324] rounded-2xl sm:rounded-3xl border border-emerald-200 dark:border-emerald-900/30 shadow-xl p-6 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20 animate-bounce">
            <Check className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{vt.successTitle}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-md mx-auto mb-8 font-medium">
            {vt.successDesc.replace("{name}", selectedDetails?.name || "")}
          </p>
          
          <button
            onClick={() => { setSubmitted(false); setSelected(null); setSkills(""); }}
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02]"
          >
            {vt.btnApplyAnother}
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 lg:gap-8 items-start">
          {/* Ministry Cards Grid */}
          <div className="lg:col-span-3 space-y-4 w-full">
            <h2 className="text-xs font-black text-gray-400 dark:text-gray-555 uppercase tracking-widest pl-1">
              {vt.step1}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MINISTRIES.map((m, i) => {
                const Icon = m.icon;
                const isSelected = selected === m.id;
                const localDetails = vt.ministries[m.id as keyof typeof vt.ministries];
                return (
                  <motion.button
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelected(m.id)}
                    className={`relative text-left p-5 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 group flex flex-col justify-between ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/10"
                        : "border-gray-100 dark:border-white/[0.04] bg-white dark:bg-[#121324] hover:border-gray-250 dark:hover:border-white/[0.1] hover:shadow-xl hover:-translate-y-0.5"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-md shadow-indigo-500/30">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div>
                      <div className={`w-11 h-11 bg-gradient-to-br ${m.gradient} rounded-2xl flex items-center justify-center mb-3.5 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className="w-5.5 h-5.5 text-white" />
                      </div>
                      <h3 className="font-black text-gray-900 dark:text-white text-sm tracking-tight mb-1">{localDetails.name}</h3>
                      <p className="text-xs text-gray-550 dark:text-gray-455 leading-relaxed line-clamp-3 mb-5 font-medium">{localDetails.desc}</p>
                    </div>
                    
                    <div className="flex items-center justify-between w-full mt-auto pt-2">
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${m.badgeBg} ${m.badgeText} ${m.badgeBorder}`}>
                        {m.id}
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-650 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                        <Users className="w-3.5 h-3.5" />
                        {m.slots} {vt.slotsSuffix}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Form Panel */}
          <div ref={formRef} className="lg:col-span-2 w-full">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-[#121324] rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-white/[0.04] shadow-sm overflow-hidden lg:sticky lg:top-24"
                >
                  <div className="flex items-center gap-2 px-6 py-4.5 border-b border-gray-100 dark:border-white/[0.04] bg-indigo-50/20 dark:bg-indigo-950/10">
                    <Briefcase className="w-4.5 h-4.5 text-[#6366F1]" />
                    <h3 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-wider">{vt.step2}</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Active Selection Display Banner */}
                    <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${selectedData?.badgeBg} ${selectedData?.badgeBorder}`}>
                      {selectedData && <selectedData.icon className={`w-5 h-5 ${selectedData.badgeText} flex-shrink-0`} />}
                      <div className="min-w-0">
                        <p className={`text-xs font-black ${selectedData?.badgeText} tracking-tight`}>{selectedDetails?.name}</p>
                      </div>
                    </div>

                    {/* Disabled Name Field */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-gray-400 dark:text-gray-555 uppercase tracking-wider">{vt.fullName}</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={user?.name || ""} 
                          disabled
                          className="w-full py-2.5 pl-10 pr-3.5 rounded-xl border border-gray-150 dark:border-white/[0.06] bg-gray-100 dark:bg-white/[0.02] text-gray-400 dark:text-gray-555 cursor-not-allowed text-xs font-bold"
                        />
                        <Lock className="w-3.5 h-3.5 text-gray-455 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Testimony TextArea */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-gray-400 dark:text-gray-555 uppercase tracking-wider">{vt.skillsLabel}</label>
                      <textarea
                        value={skills} 
                        onChange={e => setSkills(e.target.value)} 
                        required 
                        rows={6}
                        placeholder={vt.skillsPlaceholder.replace("{name}", selectedDetails?.name || "")}
                        className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.01] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all resize-none text-xs leading-relaxed font-medium"
                      />
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] text-gray-400 flex items-center gap-1 font-semibold">
                          <Info className="w-3.5 h-3.5" />
                          {language === "te" ? "వివరాలు అత్యవసరం" : language === "hi" ? "विवरण आवश्यक है" : "Details are mandatory"}
                        </span>
                        <p className="text-[9px] font-bold text-gray-450 uppercase">{skills.length} {vt.characters}</p>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading || !skills.trim()}
                      className="w-full py-3 bg-gradient-to-r from-indigo-650 to-violet-650 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/15 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{vt.btnSubmitting}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{vt.btnSubmit}</span>
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-[#121324] rounded-2xl sm:rounded-3xl border border-dashed border-gray-200 dark:border-white/[0.08] p-8 text-center flex flex-col items-center justify-center min-h-[340px] gap-4"
                >
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-md">
                    <ClipboardList className="w-8 h-8 animate-float" />
                  </div>
                  <div className="space-y-1.5 max-w-xs">
                    <h4 className="font-black text-sm text-gray-900 dark:text-white">
                      {language === "te" ? "పరిచర్యను ఎంచుకోండి" : language === "hi" ? "मंत्रालय चुनें" : "No Department Configured"}
                    </h4>
                    <p className="text-xs text-gray-550 dark:text-gray-400 leading-relaxed font-semibold">
                      {vt.promptSelect}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
