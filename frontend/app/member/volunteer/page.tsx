"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Briefcase, Send, Loader2, Check, Bell, Users, Gift, Lock, Info,
  Music, Tv, Heart, Star, Megaphone, Settings, Compass, ClipboardList,
  AlertCircle, CheckCircle2, MapPin, Phone, MessageSquare, Clock,
  Calendar, ShieldCheck, Sparkles, X, ChevronRight, HelpCircle, PhoneCall
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VolunteerApplication {
  id: string;
  ministryId: string;
  ministryName: string;
  campus: string;
  availability: string[];
  skills: string;
  phone: string;
  contactMethod: string;
  status: "Pending" | "Approved";
  appliedAt: string;
}

const MINISTRIES = [
  {
    id: "WORSHIP",
    icon: Music,
    gradient: "from-purple-500 to-violet-600",
    badgeBg: "bg-purple-600 dark:bg-purple-700",
    badgeText: "text-white font-extrabold",
    badgeBorder: "border-purple-500 dark:border-purple-500 shadow-xs",
    slots: 5,
    urgent: true,
    quickTags: ["Vocals / Choir", "Keyboard / Piano", "Guitar", "Drums / Percussion", "Sound Mixing", "Telugu Worship"],
  },
  {
    id: "TECH",
    icon: Tv,
    gradient: "from-blue-500 to-indigo-600",
    badgeBg: "bg-indigo-600 dark:bg-indigo-700",
    badgeText: "text-white font-extrabold",
    badgeBorder: "border-indigo-500 dark:border-indigo-500 shadow-xs",
    slots: 3,
    urgent: true,
    quickTags: ["Camera Operator", "OBS / Live Stream", "Video Editing", "Sound Engineering", "Graphics / Slides"],
  },
  {
    id: "KIDS",
    icon: Heart,
    gradient: "from-rose-500 to-pink-600",
    badgeBg: "bg-rose-600 dark:bg-rose-700",
    badgeText: "text-white font-extrabold",
    badgeBorder: "border-rose-500 dark:border-rose-500 shadow-xs",
    slots: 8,
    urgent: false,
    quickTags: ["Sunday School Teacher", "Action Songs", "Bible Storytelling", "Childcare", "Youth Discipleship"],
  },
  {
    id: "HOSPITALITY",
    icon: Star,
    gradient: "from-amber-500 to-orange-500",
    badgeBg: "bg-amber-600 dark:bg-amber-700",
    badgeText: "text-white font-extrabold",
    badgeBorder: "border-amber-500 dark:border-amber-500 shadow-xs",
    slots: 10,
    urgent: false,
    quickTags: ["Ushering / Seating", "Welcome Desk", "Guest Relations", "Communion Assistant", "First Time Guest Care"],
  },
  {
    id: "OUTREACH",
    icon: Megaphone,
    gradient: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-600 dark:bg-emerald-700",
    badgeText: "text-white font-extrabold",
    badgeBorder: "border-emerald-500 dark:border-emerald-500 shadow-xs",
    slots: 15,
    urgent: true,
    quickTags: ["Food Distribution", "Medical / First Aid", "Evangelism Outreach", "Community Visits", "Elderly Care"],
  },
  {
    id: "FACILITIES",
    icon: Settings,
    gradient: "from-slate-500 to-gray-600",
    badgeBg: "bg-slate-700 dark:bg-slate-700",
    badgeText: "text-white font-extrabold",
    badgeBorder: "border-slate-600 dark:border-slate-600 shadow-xs",
    slots: 4,
    urgent: false,
    quickTags: ["Sanctuary Setup", "Electrical Maintenance", "Security & Parking", "Stage & Lighting", "Event Logistics"],
  },
];

const volunteerTranslations = {
  en: {
    title: "Volunteer Application Portal",
    subtitle: '"Each of you should use whatever gift you have received to serve others." — 1 Peter 4:10',
    openPositions: "Open Positions",
    acrossDepts: "Across {count} active ministry departments",
    nowAccepting: "Now Accepting Applications",
    tabAll: "All Departments",
    tabUrgent: "High Need (Urgent)",
    tabMyApps: "My Applications",
    step1: "Step 1 — Choose Your Ministry Department",
    step2: "Step 2 — Submit Your Ministry Credentials",
    selectCampus: "Preferred Church Campus / Branch *",
    campusSubhash: "Subhash Nagar (Main Campus)",
    campusShapur: "Shapur Nagar Branch",
    campusBahadurpally: "Bahadurpally Branch",
    campusAll: "Flexible / Any Campus",
    availabilityLabel: "Service Availability (Select all that apply) *",
    availSunday: "Sunday Services (7 AM / 10 AM)",
    availFriday: "Friday Fasting Prayer (11 AM)",
    availMidweek: "Midweek Fellowship / Bible Study",
    availOutreach: "Weekend Outreach & Medical Camps",
    availYouth: "Youth & Kids Special Camps",
    quickTagsLabel: "Click Quick Skills to Add to Testimony",
    phoneLabel: "Phone / WhatsApp Number *",
    preferredContact: "Preferred Contact Method",
    contactWhatsApp: "WhatsApp",
    contactCall: "Phone Call",
    contactEmail: "Email",
    fullName: "Your Registered Name",
    skillsLabel: "Skills, Experience & Testimony *",
    skillsPlaceholder: "For {name}: share your spiritual gifts, related skills, past church experience, and why you feel led to serve...",
    btnSubmit: "Submit Volunteer Application",
    btnSubmitting: "Registering Credentials...",
    characters: "characters typed",
    promptSelect: "Select a ministry department from the grid to configure and begin your application",
    successTitle: "Application Submitted Successfully! 🙌",
    successDesc: "Thank you for stepping forward to serve in the {name} at {campus}. A pastoral coordinator will evaluate your testimony and contact you via {contact} within 2-3 business days.",
    btnApplyAnother: "Apply for Another Ministry",
    btnViewStatus: "View My Applications",
    noApplications: "You haven't submitted any volunteer applications yet.",
    noApplicationsDesc: "Choose a ministry department above to offer your talents and serve in God's house.",
    appStatusPending: "Under Pastoral Review",
    appStatusApproved: "Approved & Active Servant",
    appliedOn: "Applied on",
    campusLabel: "Campus",
    coordinatorHelp: "Pastoral Volunteer Intercession & Helpline",
    coordinatorHelpDesc: "Unsure where your gifts fit best? Speak directly with our Pastoral Care Team for prayer and guidance.",
    callCoordinator: "Call +91 95052 88171",
    chatWhatsApp: "WhatsApp Prayer Care",
    toastSuccess: "Volunteer application registered! Our pastoral team will reach out to you soon 🙌",
    toastFail: "Failed to submit application. Please try again.",
    slotsSuffix: "slots open",
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
    tabAll: "అన్ని విభాగాలు",
    tabUrgent: "అత్యవసర విభాగాలు",
    tabMyApps: "నా దరఖాస్తులు",
    step1: "దశ 1 — మీ పరిచర్య విభాగాన్ని ఎంచుకోండి",
    step2: "దశ 2 — మీ వివరాలు మరియు ఆత్మీయ సాక్ష్యం",
    selectCampus: "పరిచర్య చేయదలచిన చర్చి బ్రాంచ్ *",
    campusSubhash: "సుభాష్ నగర్ (ప్రధాన శాఖ)",
    campusShapur: "షాపూర్ నగర్ శాఖ",
    campusBahadurpally: "బహదూర్‌పల్లి శాఖ",
    campusAll: "ఏ శాఖలోనైనా / అవకాశం బట్టి",
    availabilityLabel: "పరిచర్యకు అనుకూలమైన సమయాలు *",
    availSunday: "ఆదివారం ఆరాధనలు (7 AM / 10 AM)",
    availFriday: "శుక్రవారం ఉపవాస ప్రార్థన (11 AM)",
    availMidweek: "మంగళవారం బైబిల్ స్టడీ & సహవాసం",
    availOutreach: "గ్రామీణ సేవా శిబిరాలు & అన్నదానం",
    availYouth: "యూత్ & పిల్లల శిక్షణ కార్యక్రమాలు",
    quickTagsLabel: "నైపుణ్యాలను ఎంచుకోవడానికి ట్యాగ్స్‌పై నొక్కండి",
    phoneLabel: "మొబైల్ / వాట్సాప్ నంబర్ *",
    preferredContact: "సంప్రదించడానికి ప్రాధాన్యత",
    contactWhatsApp: "వాట్సాప్",
    contactCall: "ఫోన్ కాల్",
    contactEmail: "ఈమెయిల్",
    fullName: "నమోదిత పూర్తి పేరు",
    skillsLabel: "నైపుణ్యాలు, అనుభవం & సాక్ష్యం *",
    skillsPlaceholder: "{name} కొరకు: మీ ఆత్మీయ వరాలు, నైపుణ్యాలు, గత అనుభవాలు మరియు మీరు ఎందుకు పరిచర్య చేయాలనుకుంటున్నారో పంచుకోండి...",
    btnSubmit: "దరఖాస్తు సమర్పించు",
    btnSubmitting: "సమర్పించబడుతోంది...",
    characters: "అక్షరాలు నమోదయ్యాయి",
    promptSelect: "మీ దరఖాస్తును ప్రారంభించడానికి గ్రిడ్ నుండి ఒక పరిచర్య విభాగాన్ని ఎంచుకోండి",
    successTitle: "దరఖాస్తు విజయవంతంగా సమర్పించబడింది! 🙌",
    successDesc: "{campus} శాఖలోని {name} కొరకు వాలంటీర్ చేసినందుకు ధన్యవాదాలు. పాస్టోరల్ సమన్వయకర్త 2-3 పనిదినాల్లో {contact} ద్వారా మిమ్మల్ని సంప్రదిస్తారు.",
    btnApplyAnother: "మరో పరిచర్యకు దరఖాస్తు చేయండి",
    btnViewStatus: "నా దరఖాస్తులు చూడండి",
    noApplications: "మీరు ఇంకా వాలంటీర్ దరఖాస్తులేవీ సమర్పించలేదు.",
    noApplicationsDesc: "దేవుని మందిరంలో సేవ చేయడానికి పైన ఉన్న పరిచర్యలలో ఒకదాన్ని ఎంచుకోండి.",
    appStatusPending: "పాస్టర్ గారి పరిశీలనలో ఉంది",
    appStatusApproved: "ఆమోదించబడింది & పరిచర్యలో ఉన్నారు",
    appliedOn: "దరఖాస్తు తేదీ",
    campusLabel: "శాఖ",
    coordinatorHelp: "పాస్టోరల్ వాలంటీర్ సహాయం & హెల్ప్‌లైన్",
    coordinatorHelpDesc: "మీ వరాలకు సరిపోయే పరిచర్యను ఎంచుకోవడంలో మార్గదర్శనం కొరకు మా పాస్టోరల్ కేర్ టీమ్‌తో మాట్లాడండి.",
    callCoordinator: "కాల్ చేయండి +91 95052 88171",
    chatWhatsApp: "వాట్సాప్ కేర్",
    toastSuccess: "వాలంటీర్ దరఖాస్తు సమర్పించబడింది! మా పాస్టోరల్ టీమ్ త్వరలోనే మిమ్మల్ని సంప్రదిస్తారు 🙌",
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
    tabAll: "सभी विभाग",
    tabUrgent: "आवश्यक विभाग",
    tabMyApps: "मेरे आवेदन",
    step1: "चरण 1 — अपना मंत्रालय विभाग चुनें",
    step2: "चरण 2 — अपने विवरण और आत्मिक गवाही",
    selectCampus: "प्राथमिक चर्च शाखा *",
    campusSubhash: "सुभाष नगर (मुख्य शाखा)",
    campusShapur: "शापुर नगर शाखा",
    campusBahadurpally: "बहादुरपल्ली शाखा",
    campusAll: "किसी भी शाखा में / लचीला",
    availabilityLabel: "सेवा के लिए उपलब्ध समय *",
    availSunday: "रविवार आराधना (7 AM / 10 AM)",
    availFriday: "शुक्रवार उपवास प्रार्थना (11 AM)",
    availMidweek: "सप्ताह के मध्य बाइबिल अध्ययन",
    availOutreach: "सप्ताहांत सेवा और चिकित्सा शिविर",
    availYouth: "युवा और बाल मंत्रालय शिविर",
    quickTagsLabel: "कौशल जोड़ने के लिए टैग पर क्लिक करें",
    phoneLabel: "मोबाइल / व्हाट्सएप नंबर *",
    preferredContact: "संपर्क का पसंदीदा माध्यम",
    contactWhatsApp: "व्हाट्सएप",
    contactCall: "फ़ोन कॉल",
    contactEmail: "ईमेल",
    fullName: "आपका पंजीकृत नाम",
    skillsLabel: "कौशल, अनुभव और गवाही *",
    skillsPlaceholder: "{name} के लिए: अपने आत्मिक उपहार, अनुभव और सेवा की प्रेरणा साझा करें...",
    btnSubmit: "आवेदन जमा करें",
    btnSubmitting: "पंजीकरण किया जा रहा है...",
    characters: "वर्ण टाइप किए गए",
    promptSelect: "अपना आवेदन शुरू करने के लिए ग्रिड से एक मंत्रालय विभाग चुनें",
    successTitle: "आवेदन सफलतापूर्वक पंजीकृत! 🙌",
    successDesc: "{campus} में {name} के लिए स्वयंसेवा करने के लिए धन्यवाद। एक पादरी समन्वयक 2-3 कार्य दिवसों के भीतर {contact} द्वारा आपसे संपर्क करेगा।",
    btnApplyAnother: "अन्य मंत्रालय के लिए आवेदन करें",
    btnViewStatus: "मेरे आवेदन देखें",
    noApplications: "आपने अभी तक कोई स्वयंसेवक आवेदन जमा नहीं किया है।",
    noApplicationsDesc: "परमेश्वर के भवन में सेवा करने के लिए ऊपर दिए गए मंत्रालयों में से एक चुनें।",
    appStatusPending: "पादरी समीक्षाधीन",
    appStatusApproved: "स्वीकृत और सक्रिय सेवक",
    appliedOn: "आवेदन की तिथि",
    campusLabel: "शाखा",
    coordinatorHelp: "पादरी स्वयंसेवक सहायता और हेल्पलाइन",
    coordinatorHelpDesc: "अपने आत्मिक वरदानों के अनुसार सही मंत्रालय चुनने के लिए हमारी पादरी टीम से संपर्क करें।",
    callCoordinator: "कॉल करें +91 95052 88171",
    chatWhatsApp: "व्हाट्सएप सहायता",
    toastSuccess: "आवेदन जमा हो गया! एक समन्वयक जल्द ही आपसे संपर्क करेगा 🙌",
    toastFail: "जमा करने में विफल। कृपया पुन: प्रयास करें।",
    slotsSuffix: "पद खुले हैं",
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

  // View & Filter states
  const [activeTab, setActiveTab] = useState<"ALL" | "URGENT" | "MY_APPS">("ALL");
  const [selected, setSelected] = useState<string | null>(null);

  // Form Fields
  const [campus, setCampus] = useState("Subhash Nagar (Main Branch)");
  const [phone, setPhone] = useState("");
  const [contactMethod, setContactMethod] = useState<"WhatsApp" | "Call" | "Email">("WhatsApp");
  const [availability, setAvailability] = useState<string[]>([vt.availSunday]);
  const [skills, setSkills] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // State & Feedback
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmittedApp, setLastSubmittedApp] = useState<VolunteerApplication | null>(null);
  const [myApplications, setMyApplications] = useState<VolunteerApplication[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  // Load existing user info & stored volunteer applications
  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if ((user as any)?.phone) {
      setPhone((user as any).phone);
    }
    // Load local persisted applications for this user
    if (typeof window !== "undefined") {
      const storageKey = `kcm_volunteers_${user?.email || "member"}`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setMyApplications(JSON.parse(saved));
        }
      } catch {
        // Ignore JSON error
      }
    }
  }, [mounted, status, router, user]);

  // Smooth scroll to form on mobile when ministry is selected
  useEffect(() => {
    if (selected && typeof window !== "undefined") {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [selected]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const selectedData = MINISTRIES.find(m => m.id === selected);
  const selectedDetails = selected ? vt.ministries[selected as keyof typeof vt.ministries] : null;

  // Toggle availability
  const toggleAvailability = (item: string) => {
    setAvailability(prev =>
      prev.includes(item) ? (prev.length > 1 ? prev.filter(x => x !== item) : prev) : [...prev, item]
    );
  };

  // Toggle Quick Skills Tags
  const toggleQuickTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
      setSkills(prev => prev.replace(tag, "").replace(/,\s*,/g, ",").trim());
    } else {
      setSelectedTags(prev => [...prev, tag]);
      setSkills(prev => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed}, ${tag}` : tag;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !selectedDetails) return;
    setLoading(true);

    const targetMinistryName = selectedDetails.name;
    const applicationRecord: VolunteerApplication = {
      id: `vol-${Date.now()}`,
      ministryId: selected,
      ministryName: targetMinistryName,
      campus,
      availability,
      skills,
      phone: phone || (user as any)?.phone || "Not specified",
      contactMethod,
      status: "Pending",
      appliedAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    try {
      // 1. Submit to Pastor Volunteer API
      await fetch("/api/pastor/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name || "Church Member",
          email: user?.email || "member@kcmchurch.org",
          phone: phone || (user as any)?.phone || null,
          ministry: `${targetMinistryName} — ${campus}`,
          status: "Pending",
          appliedAt: new Date().toISOString().slice(0, 10),
        }),
      }).catch(() => {});

      // 2. Also persist in local applications state for immediate member visibility
      const updatedList = [applicationRecord, ...myApplications.filter(a => a.ministryId !== selected)];
      setMyApplications(updatedList);
      setLastSubmittedApp(applicationRecord);

      if (typeof window !== "undefined") {
        const storageKey = `kcm_volunteers_${user?.email || "member"}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      }

      setSubmitted(true);
      showToast(vt.toastSuccess, "success");
    } catch (err: any) {
      showToast(err.message || vt.toastFail, "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter ministries based on active tab
  const displayedMinistries = useMemo(() => {
    if (activeTab === "URGENT") {
      return MINISTRIES.filter(m => m.urgent);
    }
    return MINISTRIES;
  }, [activeTab]);

  const totalSlots = MINISTRIES.reduce((acc, m) => acc + m.slots, 0);

  if (status === "unauthenticated" && mounted) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-6 pb-28 sm:pb-32 lg:pb-12 animate-in fade-in duration-300">
      {/* Floating Bottom Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold border max-w-[92vw] sm:max-w-md backdrop-blur-xl transition-all ${
              toast.type === "success"
                ? "bg-emerald-600 text-white border-emerald-400/40 shadow-emerald-600/30"
                : "bg-rose-600 text-white border-rose-400/40 shadow-rose-600/30"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-white" />
            )}
            <span className="leading-snug whitespace-normal">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="relative overflow-hidden p-5 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 dark:bg-indigo-700 text-white border border-indigo-500 text-[10px] font-black uppercase tracking-wider shadow-xs">
            <Gift className="w-3.5 h-3.5 text-white" />
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

      {/* INTERACTIVE NAVIGATION & STATS BAR (Fitts's Law) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-3.5 sm:p-5 rounded-3xl shadow-xl border border-indigo-500/30">
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20 shrink-0 shadow-md">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl font-black text-white leading-none">
                {totalSlots} {vt.openPositions}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {vt.nowAccepting}
              </span>
            </div>
            <p className="text-[11px] text-indigo-200 mt-1 font-semibold">
              {vt.acrossDepts.replace("{count}", MINISTRIES.length.toString())}
            </p>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-0.5 scrollbar-none flex-nowrap shrink-0">
          {[
            { key: "ALL" as const, label: vt.tabAll },
            { key: "URGENT" as const, label: vt.tabUrgent },
            {
              key: "MY_APPS" as const,
              label: `${vt.tabMyApps}${myApplications.length ? ` (${myApplications.length})` : ""}`,
            },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key === "MY_APPS") setSelected(null);
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-2xl text-xs font-black transition-all border whitespace-nowrap cursor-pointer active:scale-95 ${
                activeTab === tab.key
                  ? "bg-white text-indigo-900 border-white shadow-md font-black"
                  : "bg-white/10 text-white/80 border-white/10 hover:bg-white/20 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MY APPLICATIONS VIEW ─────────────────────────────────────────── */}
      {activeTab === "MY_APPS" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {vt.tabMyApps}
            </h2>
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Browse All Ministries →
            </button>
          </div>

          {myApplications.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm">
              <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                {vt.noApplications}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">
                {vt.noApplicationsDesc}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className="mt-4 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Apply for Ministry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myApplications.map(app => {
                const ministryObj = MINISTRIES.find(m => m.id === app.ministryId);
                const Icon = ministryObj?.icon || Gift;
                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ministryObj?.gradient || "from-indigo-500 to-purple-600"} flex items-center justify-center text-white shadow-xs`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 dark:text-white text-sm sm:text-base">
                              {app.ministryName}
                            </h4>
                            <p className="text-[11px] text-gray-400 font-semibold">
                              {vt.campusLabel}: {app.campus}
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {vt.appStatusPending}
                        </span>
                      </div>

                      {app.skills && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 mb-3 font-medium">
                          &ldquo;{app.skills}&rdquo;
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1 mb-2">
                        {app.availability.map((av, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-100 dark:border-indigo-900/50"
                          >
                            {av}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 font-semibold flex items-center justify-between">
                      <span>{vt.appliedOn} {app.appliedAt}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">Contact via {app.contactMethod}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : submitted ? (
        /* ── APPLICATION SUCCESS SCREEN ────────────────────────────────── */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/30 shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden max-w-2xl mx-auto"
        >
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 animate-bounce">
            <Check className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">
            {vt.successTitle}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto mb-6 font-medium">
            {vt.successDesc
              .replace("{name}", selectedDetails?.name || "")
              .replace("{campus}", campus)
              .replace("{contact}", contactMethod)}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setSelected(null);
                setSkills("");
                setSelectedTags([]);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {vt.btnApplyAnother}
            </button>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setActiveTab("MY_APPS");
              }}
              className="w-full sm:w-auto px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border border-gray-200 dark:border-gray-700 hover:bg-gray-200 active:scale-95 cursor-pointer"
            >
              {vt.btnViewStatus}
            </button>
          </div>
        </motion.div>
      ) : (
        /* ── APPLICATION FLOW (STEP 1 & STEP 2) ────────────────────────── */
        <div className="space-y-6">
          {/* STEP 1: Department Grid — Responsive 2-Col Mobile, 3-Col Desktop */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                {vt.step1}
              </h2>
              {selected && (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear selection
                </button>
              )}
            </div>

            {/* Grid: 2 columns on small screens, 3 columns on large screens */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
              {displayedMinistries.map((m, i) => {
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
                    className={`relative text-left p-3.5 sm:p-5 rounded-3xl border-2 transition-all duration-300 group flex flex-col justify-between h-full cursor-pointer select-none ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-xl shadow-indigo-600/10 ring-2 ring-indigo-500/30 scale-[1.01]"
                        : "border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-purple-300 dark:hover:border-purple-700/60 hover:shadow-lg"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 w-5 h-5 sm:w-6 sm:h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                      </div>
                    )}

                    <div>
                      <div
                        className={`w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br ${m.gradient} rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3.5 shadow-md group-hover:scale-105 transition-transform shrink-0`}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h3 className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-base tracking-tight mb-1 leading-snug">
                        {localDetails.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3 font-medium hidden sm:block">
                        {localDetails.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between w-full pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-800 mt-auto">
                      <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.badgeBg} ${m.badgeText} ${m.badgeBorder}`}>
                        {m.id}
                      </span>
                      <span className="text-[10px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                        <Users className="w-3 h-3" />
                        <span>{m.slots}</span>
                        <span className="hidden sm:inline">{vt.slotsSuffix}</span>
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
                  {/* Form Header */}
                  <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-gray-100 dark:border-gray-800 bg-indigo-50/40 dark:bg-indigo-950/20">
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-black text-gray-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider">
                        {vt.step2}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 shadow-xs">
                      {selectedDetails?.name}
                    </span>
                  </div>

                  <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5">
                    {/* Active Selected Ministry Banner */}
                    <div className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border ${selectedData?.badgeBg} ${selectedData?.badgeBorder}`}>
                      {selectedData && <selectedData.icon className={`w-6 h-6 ${selectedData.badgeText} shrink-0`} />}
                      <div className="min-w-0">
                        <p className={`text-xs sm:text-sm font-black ${selectedData?.badgeText} tracking-tight`}>
                          {selectedDetails?.name} • {selectedData?.slots} slots open
                        </p>
                        <p className="text-[11px] text-gray-200 mt-0.5">
                          {selectedDetails?.desc}
                        </p>
                      </div>
                    </div>

                    {/* FIELD 1: Church Branch / Campus Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        {vt.selectCampus}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { key: "Subhash Nagar (Main Campus)", label: vt.campusSubhash },
                          { key: "Shapur Nagar Branch", label: vt.campusShapur },
                          { key: "Bahadurpally Branch", label: vt.campusBahadurpally },
                          { key: "Flexible / Any Campus", label: vt.campusAll },
                        ].map(c => (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => setCampus(c.key)}
                            className={`p-3 rounded-2xl text-left border text-xs font-bold transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                              campus === c.key
                                ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                                : "bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                            }`}
                          >
                            <span>{c.label}</span>
                            {campus === c.key && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* FIELD 2: Applicant Contact Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name (Locked from profile) */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {vt.fullName}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={user?.name || "Church Member"}
                            disabled
                            className="w-full py-2.5 sm:py-3 pl-10 pr-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 cursor-not-allowed text-xs sm:text-sm font-semibold"
                          />
                          <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      {/* Phone / WhatsApp */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
                          <span>{vt.phoneLabel}</span>
                          <span className="text-[10px] text-indigo-500 font-bold lowercase">Required for coordinator call</span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            required
                            className="w-full py-2.5 sm:py-3 pl-10 pr-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-xs sm:text-sm font-semibold shadow-2xs"
                          />
                          <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    </div>

                    {/* FIELD 3: Preferred Contact Mode */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {vt.preferredContact}
                      </label>
                      <div className="flex gap-2">
                        {[
                          { key: "WhatsApp" as const, label: vt.contactWhatsApp, icon: MessageSquare },
                          { key: "Call" as const, label: vt.contactCall, icon: PhoneCall },
                          { key: "Email" as const, label: vt.contactEmail, icon: Send },
                        ].map(c => (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => setContactMethod(c.key)}
                            className={`flex-1 py-2 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                              contactMethod === c.key
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <c.icon className="w-3.5 h-3.5" />
                            <span>{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* FIELD 4: Service Availability Selection */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {vt.availabilityLabel}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          vt.availSunday,
                          vt.availFriday,
                          vt.availMidweek,
                          vt.availOutreach,
                          vt.availYouth,
                        ].map(av => {
                          const isChecked = availability.includes(av);
                          return (
                            <button
                              key={av}
                              type="button"
                              onClick={() => toggleAvailability(av)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                isChecked
                                  ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                                  : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-300"
                              }`}
                            >
                              {isChecked ? <Check className="w-3 h-3" /> : <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />}
                              <span>{av}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* FIELD 5: Recommended Skills & Spiritual Gifts Tags */}
                    {selectedData && selectedData.quickTags && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          {vt.quickTagsLabel}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedData.quickTags.map(tag => {
                            const isTagged = selectedTags.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => toggleQuickTag(tag)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1 cursor-pointer active:scale-95 ${
                                  isTagged
                                    ? "bg-amber-500 text-white border-amber-500 shadow-2xs"
                                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {isTagged ? <Check className="w-2.5 h-2.5" /> : <span>+</span>}
                                <span>{tag}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* FIELD 6: Skills & Testimony Textarea */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {vt.skillsLabel}
                      </label>
                      <textarea
                        value={skills}
                        onChange={e => setSkills(e.target.value)}
                        required
                        rows={4}
                        placeholder={vt.skillsPlaceholder.replace("{name}", selectedDetails?.name || "")}
                        className="w-full py-3 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none text-xs sm:text-sm leading-relaxed font-medium"
                      />
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 font-semibold">
                          <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          {language === "te"
                            ? "వివరాలు పాస్టర్ గారి పరిశీలనకు అత్యవసరం"
                            : language === "hi"
                            ? "पादरी मूल्यांकन के लिए विवरण आवश्यक है"
                            : "Details mandatory for ministry coordinator review"}
                        </span>
                        <p className="text-[11px] font-bold text-gray-400 uppercase">
                          {skills.length} {vt.characters}
                        </p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || !skills.trim() || !phone.trim()}
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                /* Hint Box when no ministry is selected */
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

      {/* ── PASTORAL VOLUNTEER CARE & HELPLINE BANNER ──────────────────────── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-850 border border-purple-200/80 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
              {vt.coordinatorHelp}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
              {vt.coordinatorHelpDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:+919505288171"
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{vt.callCoordinator}</span>
          </a>
          <a
            href="https://wa.me/919505288171?text=Praise%20the%20Lord%20Pastor,%20I%20want%20to%20volunteer%20in%20KCM%20Ministries."
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{vt.chatWhatsApp}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
