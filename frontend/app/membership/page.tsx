"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Heart,
  Shield,
  Award,
  ChevronRight,
  Crown,
  BookOpen,
  FileCheck,
  FileText,
  UserCheck,
  Sparkles,
  X,
  Send,
  MessageSquare,
  Calendar,
  Check,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  ChevronDown
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function MembershipPage() {
  const { language, t } = useLanguage();
  const m = t?.pages?.membership || {};

  // Modal State for Class Registration
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredBranch: "Shapur Main Campus",
    preferredDate: "Upcoming Sunday • 11:30 AM"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    try {
      const { submitToFormspark } = await import("@/lib/formspark");
      await submitToFormspark({
        formType: "Church Membership Application",
        name: regForm.name,
        email: regForm.email,
        phone: regForm.phone,
        preferredBranch: regForm.preferredBranch,
        preferredDate: regForm.preferredDate,
        subject: `Membership Application: ${regForm.name} (${regForm.preferredBranch})`,
      });
    } catch (err) {
      console.warn("[MEMBERSHIP] Formspark submit notice:", err);
    }

    setTimeout(() => {
      setIsSubmitted(false);
      setIsModalOpen(false);
      setRegForm({
        name: "",
        email: "",
        phone: "",
        preferredBranch: "Shapur Main Campus",
        preferredDate: "Upcoming Sunday • 11:30 AM"
      });
    }, 2500);
  };

  // 4 Core Membership Pillars
  const benefits = [
    {
      pillar: "01",
      icon: Users,
      title: m.belongingTitle || (language === "te" ? "ఆధ్యాత్మిక కుటుంబం" : language === "hi" ? "आत्मिक परिवार" : "Spiritual Family"),
      desc: m.belongingDesc || (language === "te" ? "ప్రతి పరిస్థితిలో మిమ్మల్ని ప్రేమించే మరియు ప్రార్థించే విశ్వాసుల సహవాసంలో భాగస్వామ్యం." : language === "hi" ? "हर परिस्थिति में आपके लिए प्रार्थना करने वाले और साथ चलने वाले विश्वासियों की संगति।" : "Be part of a devoted fellowship that cares for your soul and walks with you through every season."),
      accent: "from-purple-500 to-indigo-500",
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBox: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-200/80 dark:border-purple-800/60",
      badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60"
    },
    {
      pillar: "02",
      icon: BookOpen,
      title: m.coveringTitle || (language === "te" ? "కాపరి సంరక్షణ & మార్గదర్శకత్వం" : language === "hi" ? "पादरी देखभाल और मार्गदर्शन" : "Pastoral Care & Guidance"),
      desc: m.coveringDesc || (language === "te" ? "మా నాయకత్వం నుండి వ్యక్తిగత ప్రార్థన మద్దతు, దైవిక సలహాలు మరియు శిష్యరికం." : language === "hi" ? "हमारे नेतृत्व से व्यक्तिगत प्रार्थना, आत्मिक परामर्श और समर्पित शिष्यता प्राप्त करें।" : "Receive personal prayer support, biblical counsel, and dedicated discipleship from our leadership."),
      accent: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBox: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-200/80 dark:border-blue-800/60",
      badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60"
    },
    {
      pillar: "03",
      icon: Shield,
      title: m.serviceTitle || (language === "te" ? "నాయకత్వ అవకాశాలు & భాగస్వామ్యం" : language === "hi" ? "नेतृत्व अवसर और सहभागिता" : "Ministry Voting & Leadership"),
      desc: m.serviceDesc || (language === "te" ? "సంఘ నిర్ణయాలు మరియు సేవా విభాగాలలో క్రియాశీల పాత్రను కలిగి ఉండటం." : language === "hi" ? "कलीसियाई निर्णयों, सेवकाई और दूरदर्शी पहलों में सक्रिय भूमिका निभाएं।" : "Have an active voice in church decisions, ministry opportunities, and visionary leadership initiatives."),
      accent: "from-pink-500 to-rose-500",
      iconColor: "text-pink-600 dark:text-pink-400",
      iconBox: "bg-pink-500/10 dark:bg-pink-500/20 border-pink-200/80 dark:border-pink-800/60",
      badge: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-200/80 dark:border-pink-800/60"
    },
    {
      pillar: "04",
      icon: Heart,
      title: m.growthTitle || (language === "te" ? "శిష్యరికం & ఆధ్యాత్మిక ఎదుగుదల" : language === "hi" ? "शिष्यता और आत्मिक विकास" : "Discipleship & Growth"),
      desc: m.growthDesc || (language === "te" ? "మీ విశ్వాస జీవితాన్ని బలోపేతం చేయడానికి శిక్షణా తరగతులు మరియు అధ్యయన సామగ్రి." : language === "hi" ? "अपने विश्वास को गहरा करने के लिए विशेष प्रशिक्षण कक्षाएं और सेल ग्रुप मेंटरशिप।" : "Access dedicated training classes, small group mentorship, and resources to deepen your faith walk."),
      accent: "from-amber-500 to-orange-500",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBox: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-200/80 dark:border-amber-800/60",
      badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60"
    }
  ];

  // 4-Step Sequential Pathway Data with Tone-on-Tone Harmonies & Logical Parity
  const pathwaySteps = [
    {
      step: "1",
      title: m.step1Title || (language === "te" ? "సభ్యత్వ తరగతికి హాజరవ్వండి" : language === "hi" ? "सदस्यता कक्षा में भाग लें" : "Attend the Membership Class"),
      desc: m.step1Desc || (language === "te" ? "మా చరిత్ర, నమ్మకాలు, దర్శనం మరియు విలువలను తెలుసుకోవడానికి మా 'డిస్కవర్ కింగ్‌డమ్' తరగతిలో చేరండి." : language === "hi" ? "हमारे इतिहास, विश्वासों, दृष्टिकोण और मूल्यों के बारे में जानने के लिए हमारे 'डिस्कवर किंगडम' वर्ग में शामिल हों।" : "Join our 'Discover Kingdom' class to learn about our history, beliefs, vision, and values."),
      icon: BookOpen,
      duration: language === "te" ? "60 నిమిషాల సెషన్" : language === "hi" ? "60 मिनट सत्र" : "60 Min Session",
      accent: "from-purple-500 to-indigo-500",
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-200/80 dark:border-purple-800/80",
      badgeStyle: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300/80 dark:border-purple-700/60",
      durationStyle: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60",
      glow: "hover:border-purple-400 dark:hover:border-purple-500/60",
    },
    {
      step: "2",
      title: m.step2Title || (language === "te" ? "సభ్యత్వ నిబంధనపై సంతకం చేయండి" : language === "hi" ? "सदस्यता वाचा पर हस्ताक्षर करें" : "Sign the Membership Covenant"),
      desc: m.step2Desc || (language === "te" ? "చర్చి సభ్యత్వం యొక్క బాధ్యతలకు కట్టుబడి ఉండండి." : language === "hi" ? "चर्च की सदस्यता की बाइबिल की जिम्मेदारियों के प्रति प्रतिबद्ध हों।" : "Commit to the biblical responsibilities of church membership."),
      icon: FileCheck,
      duration: language === "te" ? "నిబద్ధత పత్రం" : language === "hi" ? "पवित्र अनुबंध" : "Biblical Covenant",
      accent: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-200/80 dark:border-blue-800/80",
      badgeStyle: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300/80 dark:border-blue-700/60",
      durationStyle: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60",
      glow: "hover:border-blue-400 dark:hover:border-blue-500/60",
    },
    {
      step: "3",
      title: m.step3Title || (language === "te" ? "పాస్టోరల్ ఇంటర్వ్యూ" : language === "hi" ? "देहाती साक्षात्कार" : "Pastoral Interview"),
      desc: m.step3Desc || (language === "te" ? "మీ సాక్ష్యాన్ని పంచుకోవడానికి మా పాస్టర్లలో ఒకరిని కలవండి." : language === "hi" ? "अपनी गवाही साझा करने के लिए हमारे पादरियों में से एक के साथ संक्षेप में मिलें।" : "Meet briefly with one of our pastors to share your testimony."),
      icon: MessageSquare,
      duration: language === "te" ? "15 నిమిషాల భేటీ" : language === "hi" ? "15 मिनट बातचीत" : "15 Min Meeting",
      accent: "from-pink-500 to-rose-500",
      iconColor: "text-pink-600 dark:text-pink-400",
      iconBg: "bg-pink-500/10 dark:bg-pink-500/20 border-pink-200/80 dark:border-pink-800/80",
      badgeStyle: "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-300/80 dark:border-pink-700/60",
      durationStyle: "bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200/80 dark:border-pink-800/60",
      glow: "hover:border-pink-400 dark:hover:border-pink-500/60",
    },
    {
      step: "4",
      title: m.step4Title || (language === "te" ? "కుటుంబంలోకి స్వాగతం!" : language === "hi" ? "परिवार में आपका स्वागत है!" : "Welcome to the Family!"),
      desc: m.step4Desc || (language === "te" ? "ఆదివారం ఆరాధనలో చర్చి కుటుంబంలోకి అధికారికంగా స్వాగతించబడండి." : language === "hi" ? "रविवार की सेवा के दौरान चर्च परिवार में आधिकारिक तौर पर स्वागत किया जाए।" : "Be officially welcomed into the church family during a Sunday service."),
      icon: Award,
      duration: language === "te" ? "ఆదివారం సంబరం" : language === "hi" ? "रविवार उत्सव" : "Sunday Service",
      accent: "from-emerald-500 to-teal-500",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-200/80 dark:border-emerald-800/80",
      badgeStyle: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-700/60",
      durationStyle: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60",
      glow: "hover:border-emerald-400 dark:hover:border-emerald-500/60",
    }
  ];

  // Membership Covenant Commitments
  const covenantPromises = [
    {
      num: "01",
      title: language === "te" ? "సంఘ ఐక్యత" : language === "hi" ? "कलीसिया की एकता" : "Protect Unity",
      text: m.covenant1 || (language === "te" ? "ఇతర సభ్యుల పట్ల ప్రేమతో ప్రవర్తిస్తూ, సంఘ ఐక్యతను కాపాడుతాను." : language === "hi" ? "अन्य सदस्यों के प्रति प्रेम से व्यवहार करते हुए कलीसिया की एकता की रक्षा करूंगा।" : "I will protect the unity of my church by acting in love toward other members and refusing to gossip.")
    },
    {
      num: "02",
      title: language === "te" ? "బాధ్యతాయుత ప్రార్థన" : language === "hi" ? "प्रार्थना जिम्मेदारी" : "Share Responsibility",
      text: m.covenant2 || (language === "te" ? "నిరంతరం ప్రార్థిస్తూ, ఇతరులను దేవుని సన్నిధికి ఆహ్వానిస్తూ సంఘ బాధ్యతను పంచుకుంటాను." : language === "hi" ? "प्रार्थना करते हुए और दूसरों को आमंत्रित करते हुए कलीसिया की जिम्मेदारी निभाऊंगा।" : "I will share the responsibility of my church by praying and inviting the unchurched.")
    },
    {
      num: "03",
      title: language === "te" ? "వరాల ద్వారా సేవ" : language === "hi" ? "वरदानों से सेवकाई" : "Serve Faithfully",
      text: m.covenant3 || (language === "te" ? "నా ఆధ్యాత్మిక వరాలను కనుగొని, నమ్మకంగా సంఘ పరిచర్యలో సేవ చేస్తాను." : language === "hi" ? "अपने आत्मिक वरदानों को पहचान कर विश्वासयोग्यता से कलीसिया की सेवा करूंगा।" : "I will serve the ministry of my church by discovering my gifts and serving faithfully.")
    },
    {
      num: "04",
      title: language === "te" ? "పరిశుద్ధ జీవితం & దశమభాగం" : language === "hi" ? "गवाही और दशमांश" : "Support Testimony",
      text: m.covenant4 || (language === "te" ? "పరిశుద్ధమైన జీవితాన్ని జీవిస్తూ, నమ్మకంగా దశాంశ భాగాలను చెల్లిస్తూ సంఘ సాక్ష్యాన్ని నిలబెడతాను." : language === "hi" ? "पवित्र जीवन जीते हुए और विश्वासयोग्यता से दशमांश देते हुए कलीसिया की गवाही को बनाए रखूंगा।" : "I will support the testimony of my church by living a godly life and tithing faithfully.")
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-purple-500 selection:text-white">
      {/* 🧭 Global Navigation Bar */}
      <Navbar />

      {/* 🌌 Hero Section - Adaptive Light/Dark Design */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden border-b border-purple-100/80 dark:border-slate-800/80 shadow-xs transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-25 dark:opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Inline Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="mb-5 flex justify-center">
              <ol className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-purple-200/60 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-2xs">
                <li className="inline-flex items-center">
                  <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {(t as any)?.nav?.home || (language === "te" ? "హోమ్" : language === "hi" ? "होम" : "Home")}
                  </Link>
                </li>
                <li className="text-slate-400 dark:text-slate-600">/</li>
                <li className="text-purple-700 dark:text-purple-300 font-bold" aria-current="page">
                  {m.title || (language === "te" ? "సభ్యత్వం" : language === "hi" ? "सदस्यता" : "Become a Member")}
                </li>
              </ol>
            </nav>

            {/* Subtle Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/90 dark:border-purple-800/80 text-purple-900 dark:text-purple-200 font-extrabold text-xs sm:text-sm mb-6 shadow-2xs backdrop-blur-md">
              <Crown className="w-4 h-4 text-purple-600 dark:text-amber-400" />
              <span>
                {language === "te" 
                  ? "మా సంఘ కుటుంబంలో చేరండి • సభ్యత్వం పొందండి" 
                  : language === "hi" 
                  ? "हमारे कलीसियाई परिवार में शामिल हों • सदस्य बनें" 
                  : "Join Our Church Family • Become a Member"}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 font-outfit text-slate-900 dark:text-white leading-tight">
              {m.title || (language === "te" ? "సంఘ సభ్యత్వం పొందండి" : language === "hi" ? "कलीसिया सदस्य बनें" : "Become a Member")}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
              {m.whyDesc ? m.subtitle || "Church membership is about committing to a spiritual family where you can be known, cared for, and encouraged in Christ." : (language === "te" ? "సంఘ సభ్యత్వం అనేది ఒక ఆధ్యాత్మిక కుటుంబంలో భాగస్వామ్యం పొందడం, ఇక్కడ మీరు క్రీస్తులో ప్రేమించబడతారు మరియు ప్రోత్సహించబడతారు." : language === "hi" ? "कलीसिया की सदस्यता एक आत्मिक परिवार का हिस्सा बनने के बारे में है जहाँ आपकी देखभाल की जाती है और मसीह में प्रोत्साहित किया जाता है।" : "Church membership is about committing to a spiritual family where you can be known, cared for, and encouraged in Christ.")}
            </p>

            {/* Quick Jump Action Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-purple-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{language === "te" ? "తరగతి నమోదు (దశ 1) →" : language === "hi" ? "कक्षा पंजीकरण (चरण 1) →" : "Register for Class (Step 1) →"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <a
                href="#pathway"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-purple-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold border border-slate-200/90 dark:border-slate-800 shadow-xs transition-all active:scale-95"
              >
                <span>{language === "te" ? "4 దశల మార్గం ↓" : language === "hi" ? "4-चरणीय मार्ग ↓" : "Explore 4 Steps ↓"}</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </a>
              <a
                href="#covenant"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-purple-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold border border-slate-200/90 dark:border-slate-800 shadow-xs transition-all active:scale-95"
              >
                <span>{language === "te" ? "సభ్యత్వ నిబంధన ↓" : language === "hi" ? "सदस्यता वाचा ↓" : "Read Covenant ↓"}</span>
              </a>
            </div>

            {/* Executive Metric Highlights Deck — Modern Frosted Glass with Tone-on-Tone Halos */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 max-w-4xl mx-auto pt-6 border-t border-purple-100/80 dark:border-slate-800">
              
              {/* Stat 1: Members */}
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-90" />
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight mb-0.5">1,200+</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "క్రియాశీల సభ్యులు" : language === "hi" ? "सक्रिय सदस्य" : "Active Members"}</div>
              </div>

              {/* Stat 2: Hubs */}
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-90" />
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight mb-0.5">3</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "సంఘ కేంద్రాలు" : language === "hi" ? "कलीसिया केंद्र" : "Church Hubs"}</div>
              </div>

              {/* Stat 3: Simple Steps */}
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500 opacity-90" />
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 border border-pink-200/80 dark:border-pink-800/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                  <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight mb-0.5">4 Steps</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "సులభమైన ప్రక్రియ" : language === "hi" ? "सरल मार्ग" : "Simple Pathway"}</div>
              </div>

              {/* Stat 4: Belonging */}
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-90" />
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                  <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight mb-0.5">100%</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === "te" ? "ఆధ్యాత్మిక గృహం" : language === "hi" ? "आत्मिक घर" : "Belonging"}</div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 💡 Why Membership Matters Section — 4 Pillar Cards */}
      <section id="pillars" className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 relative z-10 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Four Pillars of Kingdom Belonging</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 font-outfit tracking-tight">
              {m.whyTitle || (language === "te" ? "సభ్యత్వం ఎందుకు ముఖ్యం?" : language === "hi" ? "सदस्यता क्यों महत्वपूर्ण है?" : "Why Membership Matters")}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
              {m.whyDesc || (language === "te" ? "సభ్యత్వం అనేది కేవలం జాబితాలో పేరు నమోదు చేసుకోవడం మాత్రమే కాదు. ఇది క్రీస్తు శరీరంలో కలిసి ఎదగడానికి, సేవ చేయడానికి ఒక పవిత్రమైన నిబద్ధత." : language === "hi" ? "सदस्यता केवल सूची में नाम होने से कहीं अधिक है। यह मसीह के शरीर में एक साथ बढ़ने और सेवा करने की एक महत्वपूर्ण प्रतिबद्धता है।" : "Church membership is more than just having your name on a list. It's about committing to a spiritual family where you can be known, cared for, and encouraged in your walk with Jesus.")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div
                  key={index}
                  className="relative p-6 sm:p-7 rounded-3xl bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                >
                  {/* Top Accent Gradient Ribbon */}
                  <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${item.accent} opacity-85 group-hover:opacity-100 transition-opacity`} />

                  <div>
                    {/* Header: Pillar Badge & Tone-on-Tone Halo */}
                    <div className="flex items-center justify-between mb-5">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-2xs ${item.badge}`}>
                        Pillar {item.pillar}
                      </span>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs group-hover:scale-110 transition-transform ${item.iconBox}`}>
                        <IconComp className={`w-6 h-6 ${item.iconColor}`} />
                      </div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2.5 font-outfit tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  <a
                    href="#covenant"
                    className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group/link cursor-pointer"
                  >
                    <span>{language === "te" ? "నిబంధన ప్రమాణాలు చూడండి" : language === "hi" ? "वाचा प्रतिज्ञाएं देखें" : "Read Covenant Promises"}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform text-purple-600 dark:text-purple-400" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 👣 4-Step Membership Pathway — Compact 2x2 on Mobile, 4-Column on Desktop */}
      <section id="pathway" className="py-16 md:py-24 bg-slate-50/70 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 relative z-10 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Simple 4-Step Pathway</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 font-outfit tracking-tight">
              {m.stepsTitle || (language === "te" ? "సభ్యత్వ ప్రక్రియ దశలు" : language === "hi" ? "सदस्यता के चरण" : "Steps to Membership")}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
              {language === "te" ? "మా 4-దశల సులభమైన ప్రక్రియ మిమ్మల్ని సంఘ కుటుంబంలోకి సజావుగా నడిపిస్తుంది." : language === "hi" ? "हमारी सरल चार-चरणीय प्रक्रिया आपको कलीसिया की सदस्यता में मार्गदर्शन करती है।" : "Our simple four-step process guides you seamlessly into church membership."}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {pathwaySteps.map((item, index) => {
              const StepIcon = item.icon;
              return (
                <div
                  key={index}
                  className={`relative bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 text-center overflow-hidden group flex flex-col justify-between ${item.glow}`}
                >
                  {/* Top Accent Gradient Ribbon */}
                  <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${item.accent} opacity-85 group-hover:opacity-100 group-hover:h-2 transition-all`} />
                  
                  {/* Ambient top corner glow */}
                  <div className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${item.accent} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity pointer-events-none`} />

                  <div>
                    {/* Header: Step Pill + Duration Chip */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 mb-3 sm:mb-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider border shadow-2xs ${item.badgeStyle}`}>
                        Step {item.step}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs ${item.durationStyle}`}>
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 opacity-80" />
                        <span>{item.duration}</span>
                      </span>
                    </div>

                    {/* Tone-on-tone Icon Halo */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 ${item.iconBg} border rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-xs`}>
                      <StepIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.iconColor}`} />
                    </div>

                    {/* Symmetrical Title Block */}
                    <div className="min-h-[44px] sm:min-h-[48px] flex items-center justify-center mb-2 px-0.5">
                      <h3 className="font-black text-xs sm:text-base text-slate-900 dark:text-white tracking-tight font-outfit leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-4">
                      {item.desc}
                    </p>
                  </div>

                  {/* Interactive Card Action / Status */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    {item.step === "1" ? (
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 shadow-sm shadow-purple-600/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>{language === "te" ? "దశ 1 నమోదు" : language === "hi" ? "चरण 1 पंजीकरण" : "Register for Step 1"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 py-0.5">
                        <CheckCircle2 className={`w-3 h-3 ${item.iconColor}`} />
                        <span>{item.step === "4" ? (language === "te" ? "ఆదివారం సంబరం" : language === "hi" ? "रविवार उत्सव" : "Sunday Celebration") : `${language === "te" ? "దశ" : language === "hi" ? "चरण" : "Step"} 0${item.step}`}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Step 1 Pathway Callout Banner */}
          <div className="mt-10 max-w-3xl mx-auto p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-purple-200/80 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-outfit">
                  {language === "te" ? "రాబోయే ఆదివారం తదుపరి సభ్యత్వ తరగతి ప్రారంభం" : language === "hi" ? "अगले रविवार अगली सदस्यता कक्षा शुरू हो रही है" : "Next Discover Kingdom Class starts this Sunday"}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {language === "te" ? "ఉదయం 11:30 గంటలకు • షాపూర్, సుభాష్ నగర్ మరియు ఆన్‌లైన్ జూమ్" : language === "hi" ? "सुबह 11:30 बजे • शापुर, सुभाष नगर और ऑनलाइन ज़ूम" : "11:30 AM • Shapur, Subhash Nagar & Online Zoom"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md shadow-purple-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <span>{m.signup || (language === "te" ? "తరగతి నమోదు చేసుకోండి" : language === "hi" ? "कक्षा के लिए साइन अप करें" : "Register Free →")}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 📜 Membership Covenant & Class Sign Up CTA */}
      <section id="covenant" className="py-20 relative z-10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border-t border-purple-100/80 dark:border-slate-800 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gradient-to-br from-purple-50/90 via-indigo-50/50 to-white dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 border border-purple-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-12 text-center shadow-2xl shadow-purple-900/5 dark:shadow-black/40 relative overflow-hidden text-slate-900 dark:text-white">
            
            {/* Top Accent Ribbon */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 opacity-90" />

            {/* Ambient Background Glow Orbs */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 border border-purple-400 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-600/30">
                <FileCheck className="w-7 h-7 text-white" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Biblical Commitments</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black mb-3 font-outfit tracking-tight text-slate-900 dark:text-white">
                {m.covenantTitle || (language === "te" ? "మా సంఘ సభ్యత్వ నిబంధన" : language === "hi" ? "हमारा सदस्यता अनुबंध" : "Our Membership Covenant")}
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 font-normal leading-relaxed">
                {language === "te" ? "కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్‌లో సభ్యులుగా చేరడం ద్వారా, మేము 4 ప్రధాన బైబిల్ నిబద్ధతలను కలిగి ఉంటాము:" : language === "hi" ? "किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज में शामिल होकर, सदस्य चार मुख्य बाइबिल प्रतिबद्धताओं के तहत भागीदारी करते हैं:" : "By joining Kingdom of Christ Ministries, members partner together under four core biblical commitments:"}
              </p>

              {/* 4 Covenant Commitment Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 max-w-3xl mx-auto text-left mb-10">
                {covenantPromises.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-slate-800/80 border border-purple-100/90 dark:border-slate-700/80 shadow-xs hover:border-purple-300 dark:hover:border-purple-600/50 transition-all flex items-start gap-3.5 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/60 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      {item.num}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-outfit mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{item.title}</span>
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* High-Contrast Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="min-h-[50px] px-8 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] text-white font-black text-sm rounded-2xl transition-all duration-200 shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{m.signup || (language === "te" ? "తదుపరి తరగతి కోసం నమోదు చేసుకోండి" : language === "hi" ? "अगली कक्षा के लिए साइन अप करें" : "Sign Up for Next Class")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  href="/login"
                  className="min-h-[50px] px-8 py-3.5 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-800 dark:text-white border border-purple-200/90 dark:border-slate-700 rounded-2xl font-black text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{language === "te" ? "ఇప్పటికే సభ్యులా? లాగిన్ అవ్వండి" : language === "hi" ? "पहले से सदस्य हैं? लॉगिन करें" : "Already a Member? Log In"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📥 Interactive Class Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            
            {/* Top Accent Ribbon */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 opacity-90" />

            <div className="p-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              
              <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 mb-2 inline-block shadow-sm">
                {language === "te" ? "తరగతి నమోదు" : language === "hi" ? "कक्षा पंजीकरण" : "Class Registration"}
              </span>
              
              <h3 className="text-2xl font-black font-outfit tracking-tight text-white">
                {language === "te" ? "కింగ్‌డమ్ డిస్కవర్ తరగతి" : language === "hi" ? "किंगडम डिस्कवर क्लास" : "Discover Kingdom Class"}
              </h3>
              
              <p className="text-xs text-purple-100 mt-1">
                {language === "te" ? "రాబోయే ఆదివారం సభ్యత్వ అవగాహన సెషన్ కోసం నమోదు చేసుకోండి." : language === "hi" ? "रविवार के सदस्यता ओरिएंटेशन सत्र के लिए पंजीकरण करें।" : "Register for our upcoming Sunday membership orientation session."}
              </p>
            </div>

            <div className="p-6 sm:p-7 text-slate-900 dark:text-slate-100">
              {isSubmitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2 font-outfit tracking-tight">
                    Registration Successful!
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                    Thank you, <strong>{regForm.name || "friend"}</strong>! We look forward to welcoming you at <strong>{regForm.preferredBranch}</strong> for the Discover Kingdom class.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1.5 font-outfit">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. David Raju"
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-slate-900 dark:text-slate-100 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1.5 font-outfit">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="david@example.com"
                          value={regForm.email}
                          onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-slate-900 dark:text-slate-100 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1.5 font-outfit">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={regForm.phone}
                          onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-slate-900 dark:text-slate-100 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1.5 font-outfit">
                      Select Location / Campus <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 dark:text-purple-400 pointer-events-none" />
                      <select
                        value={regForm.preferredBranch}
                        onChange={(e) => setRegForm({ ...regForm, preferredBranch: e.target.value })}
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-slate-900 dark:text-slate-100 transition-all cursor-pointer appearance-none"
                      >
                        <option value="Shapur Main Campus">Shapur Main Campus</option>
                        <option value="Subhash Nagar Campus">Subhash Nagar Campus</option>
                        <option value="Bahadurpally Campus">Bahadurpally Campus</option>
                        <option value="Online Zoom Session">Online Zoom Session</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1.5 font-outfit">
                      Preferred Date & Session <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 dark:text-purple-400 pointer-events-none" />
                      <select
                        value={regForm.preferredDate}
                        onChange={(e) => setRegForm({ ...regForm, preferredDate: e.target.value })}
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-slate-900 dark:text-slate-100 transition-all cursor-pointer appearance-none"
                      >
                        <option value="Upcoming Sunday • 11:30 AM">
                          {language === "te" ? "ఈ ఆదివారం • 11:30 AM" : language === "hi" ? "इस रविवार • 11:30 AM" : "Upcoming Sunday • 11:30 AM"}
                        </option>
                        <option value="1st Sunday Next Month • 11:30 AM">
                          {language === "te" ? "వచ్చే నెల 1వ ఆదివారం • 11:30 AM" : language === "hi" ? "अगले महीने का पहला रविवार • 11:30 AM" : "1st Sunday Next Month • 11:30 AM"}
                        </option>
                        <option value="Wednesday Online • 7:00 PM (Zoom)">
                          {language === "te" ? "బుధవారం ఆన్‌లైన్ • 7:00 PM (జూమ్)" : language === "hi" ? "बुधवार ऑनलाइन • 7:00 PM (ज़ूम)" : "Wednesday Online • 7:00 PM (Zoom)"}
                        </option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[50px] py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 mt-5 active:scale-[0.98] cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Complete Class Registration</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🦶 Global Footer */}
      <Footer />
    </div>
  );
}
