"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Briefcase, Send, Loader2, Check, Bell, Users,
  Music, Tv, Heart, Star, Megaphone, Settings, ChevronRight
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
    title: "Volunteer Application",
    subtitle: '"Each of you should use whatever gift you have received to serve others." — 1 Peter 4:10',
    openPositions: "Open Positions",
    acrossDepts: "Across {count} ministry departments",
    nowAccepting: "Now Accepting",
    step1: "Step 1 — Choose Your Ministry",
    step2: "Step 2 — Your Details",
    fullName: "Full Name",
    skillsLabel: "Skills & Testimony *",
    skillsPlaceholder: "For {name}: share your relevant skills, gifts, past experience, and why you feel called to serve here...",
    btnSubmit: "Submit Application",
    btnSubmitting: "Submitting...",
    characters: "characters",
    promptSelect: "Select a ministry department from the left to begin your application",
    successTitle: "Application Submitted!",
    successDesc: "Thank you for volunteering for {name}. A ministry coordinator will contact you within 2-3 business days.",
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
    title: "వాలంటీర్ దరఖాస్తు",
    subtitle: '"ఒక్కొక్కడు తాను పొందిన వరమునుబట్టి ఇతరులకు పరిచర్య చేయుడి." — 1 పేతురు 4:10',
    openPositions: "ఖాళీ స్థానాలు",
    acrossDepts: "{count} పరిచర్య విభాగాలలో",
    nowAccepting: "ప్రక్రియ ప్రారంభమైంది",
    step1: "దశ 1 — మీ పరిచర్యను ఎంచుకోండి",
    step2: "దశ 2 — మీ వివరాలు",
    fullName: "పూర్తి పేరు",
    skillsLabel: "నైపుణ్యాలు & అనుభవం *",
    skillsPlaceholder: "{name} కొరకు: మీ నైపుణ్యాలు, వరాలు, అనుభవాలు మరియు మీరు ఎందుకు ఇక్కడ పరిచర్య చేయాలనుకుంటున్నారో పంచుకోండి...",
    btnSubmit: "దరఖాస్తు సమర్పించు",
    btnSubmitting: "సమర్పించబడుతోంది...",
    characters: "అక్షరాలు",
    promptSelect: "మీ దరఖాస్తును ప్రారంభించడానికి ఎడమ వైపు నుండి ఒక పరిచర్య విభాగాన్ని ఎంచుకోండి",
    successTitle: "దరఖాస్తు సమర్పించబడింది!",
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
    title: "स्वयंसेवक आवेदन",
    subtitle: '"तुम में से हर एक को जैसा वरदान मिला है, उसे दूसरों की सेवा में लगाओ।" — 1 पतरस 4:10',
    openPositions: "खुले पद",
    acrossDepts: "{count} मंत्रालयों में",
    nowAccepting: "आवेदन शुरू",
    step1: "चरण 1 — अपना मंत्रालय चुनें",
    step2: "चरण 2 — अपना विवरण",
    fullName: "पूरा नाम",
    skillsLabel: "कौशल और गवाही *",
    skillsPlaceholder: "{name} के लिए: अपने प्रासंगिक कौशल, उपहार, अनुभव साझा करें और आप यहाँ सेवा क्यों करना चाहते हैं...",
    btnSubmit: "आवेदन जमा करें",
    btnSubmitting: "जमा किया जा रहा है...",
    characters: "वर्ण",
    promptSelect: "अपना आवेदन शुरू करने के लिए बाईं ओर से एक मंत्रालय विभाग चुनें",
    successTitle: "आवेदन जमा हो गया!",
    successDesc: "{name} के लिए स्वयंसेवा करने के लिए धन्यवाद। एक मंत्रालय समन्वयक 2-3 कार्य दिवसों के भीतर आपसे संपर्क करेगा।",
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
        desc: "ऑडियो, वीडियो उत्पादन, लाइव स्ट्रीमिंग, सोशल मीडिया प्रबंधन और ग्राफिक्स।"
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

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

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

  if (!mounted || status === "loading") return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold border max-w-xs ${
              toast.type === "success" ? "bg-green-500 text-white border-green-400/30" : "bg-red-500 text-white border-red-400/30"
            }`}>
            <Bell className="w-4 h-4 flex-shrink-0" />{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">{vt.title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 italic">{vt.subtitle}</p>
      </div>

      {/* Total open slots banner */}
      <div className="bg-gradient-to-r from-gradient-start to-gradient-end rounded-2xl p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="font-black text-lg leading-none">{MINISTRIES.reduce((s, m) => s + m.slots, 0)} {vt.openPositions}</p>
            <p className="text-amber-100 text-xs mt-0.5">{vt.acrossDepts.replace("{count}", MINISTRIES.length.toString())}</p>
          </div>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          {vt.nowAccepting}
        </span>
      </div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-green-200 dark:border-green-900/30 shadow-sm p-12 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-gradient-start to-gradient-end rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[hsl(var(--primary))]/20">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{vt.successTitle}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-md mx-auto mb-6">
            {vt.successDesc.replace("{name}", selectedDetails?.name || "")}
          </p>
          <button
            onClick={() => { setSubmitted(false); setSelected(null); setSkills(""); }}
            className="px-6 py-3 bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all"
          >
            {vt.btnApplyAnother}
          </button>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* Ministry Cards */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              {vt.step1}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
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
                    className={`relative text-left p-4 rounded-2xl border-2 transition-all group ${
                      isSelected
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--accent))]/50 dark:bg-[hsl(var(--accent))]/20 shadow-md shadow-[hsl(var(--primary))]/10"
                        : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`w-10 h-10 bg-gradient-to-br ${m.gradient} rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{localDetails.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">{localDetails.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.badgeBg} ${m.badgeText} ${m.badgeBorder}`}>{m.id}</span>
                      <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 flex items-center gap-0.5"><Users className="w-3 h-3" />{m.slots} {vt.slotsSuffix}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden sticky top-20"
                >
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-[hsl(var(--accent))] dark:bg-[hsl(var(--accent))]/20">
                    <Briefcase className="w-4 h-4 text-[hsl(var(--primary))]" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{vt.step2}</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Selected ministry display */}
                    <div className={`flex items-center gap-2.5 p-3 rounded-xl border ${selectedData?.badgeBg} ${selectedData?.badgeBorder}`}>
                      {selectedData && <selectedData.icon className={`w-4 h-4 ${selectedData.badgeText} flex-shrink-0`} />}
                      <span className={`text-sm font-bold ${selectedData?.badgeText}`}>{selectedDetails?.name}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{vt.fullName}</label>
                      <input type="text" value={user?.name || ""} disabled
                        className="w-full py-2.5 px-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{vt.skillsLabel}</label>
                      <textarea
                        value={skills} onChange={e => setSkills(e.target.value)} required rows={5}
                        placeholder={vt.skillsPlaceholder.replace("{name}", selectedDetails?.name || "")}
                        className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent focus:outline-none transition-all resize-none text-sm leading-relaxed"
                      />
                      <p className="text-[10px] text-gray-400 mt-1 text-right">{skills.length} {vt.characters}</p>
                    </div>

                    <button type="submit" disabled={loading || !skills.trim()}
                      className="w-full py-3 bg-gradient-to-r from-gradient-start to-gradient-end hover:opacity-90 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/20 transition-all active:scale-[0.99] disabled:opacity-50">
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" />{vt.btnSubmitting}</>
                        : <><Send className="w-4 h-4" />{vt.btnSubmit}</>}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center"
                >
                  <div className="w-12 h-12 bg-[hsl(var(--accent))] dark:bg-[hsl(var(--accent))]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ChevronRight className="w-6 h-6 text-[hsl(var(--primary))]" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{vt.promptSelect}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
