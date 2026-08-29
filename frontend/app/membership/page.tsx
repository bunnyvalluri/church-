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
  Check
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import BackToHome from "@/components/ui/BackToHome";

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
    preferredBranch: "Shapur Main Branch",
    preferredDate: "Next Available Sunday (11:30 AM)"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsModalOpen(false);
      setRegForm({
        name: "",
        email: "",
        phone: "",
        preferredBranch: "Shapur Main Branch",
        preferredDate: "Next Available Sunday (11:30 AM)"
      });
    }, 2000);
  };

  // Membership Benefits Data
  const benefits = [
    {
      icon: Users,
      title: m.benefit1Title || (language === "te" ? "ఆధ్యాత్మిక కుటుంబం" : language === "hi" ? "आत्मिक परिवार" : "Spiritual Family"),
      desc: m.benefit1Desc || (language === "te" ? "ప్రతి పరిస్థితిలో మిమ్మల్ని ప్రేమించే మరియు ప్రార్థించే విశ్వాసుల సహవాసంలో భాగస్వామ్యం." : language === "hi" ? "हर परिस्थिति में आपके लिए प्रार्थना करने वाले और साथ चलने वाले विश्वासियों की संगति।" : "Be part of a devoted fellowship that cares for your soul and walks with you through every season."),
      colorBg: "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30"
    },
    {
      icon: BookOpen,
      title: m.benefit2Title || (language === "te" ? "కాపరి సంరక్షణ & మార్గదర్శకత్వం" : language === "hi" ? "पादरी देखभाल और मार्गदर्शन" : "Pastoral Care & Guidance"),
      desc: m.benefit2Desc || (language === "te" ? "మా నాయకత్వం నుండి వ్యక్తిగత ప్రార్థన మద్దతు, దైవిక సలహాలు మరియు శిష్యరికం." : language === "hi" ? "हमारे नेतृत्व से व्यक्तिगत प्रार्थना, आत्मिक परामर्श और समर्पित शिष्यता प्राप्त करें।" : "Receive personal prayer support, biblical counsel, and dedicated discipleship from our leadership."),
      colorBg: "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
    },
    {
      icon: Shield,
      title: m.benefit3Title || (language === "te" ? "నాయకత్వ అవకాశాలు & భాగస్వామ్యం" : language === "hi" ? "नेतृत्व अवसर और सहभागिता" : "Ministry Voting & Leadership"),
      desc: m.benefit3Desc || (language === "te" ? "సంఘ నిర్ణయాలు మరియు సేవా విభాగాలలో క్రియాశీల పాత్రను కలిగి ఉండటం." : language === "hi" ? "कलीसियाई निर्णयों, सेवकाई और दूरदर्शी पहलों में सक्रिय भूमिका निभाएं।" : "Have an active voice in church decisions, ministry opportunities, and visionary leadership initiatives."),
      colorBg: "bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-600/30"
    },
    {
      icon: Heart,
      title: m.benefit4Title || (language === "te" ? "శిష్యరికం & ఆధ్యాత్మిక ఎదుగుదల" : language === "hi" ? "शिष्यता और आत्मिक विकास" : "Discipleship & Growth"),
      desc: m.benefit4Desc || (language === "te" ? "మీ విశ్వాస జీవితాన్ని బలోపేతం చేయడానికి శిక్షణా తరగతులు మరియు అధ్యయన సామగ్రి." : language === "hi" ? "अपने विश्वास को गहरा करने के लिए विशेष प्रशिक्षण कक्षाएं और सेल ग्रुप मेंटरशिप।" : "Access dedicated training classes, small group mentorship, and resources to deepen your faith walk."),
      colorBg: "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30"
    }
  ];

  // 4-Step Pathway Data
  const pathwaySteps = [
    {
      step: 1,
      title: m.step1Title || (language === "te" ? "సభ్యత్వ అవగాహన తరగతికి హాజరవ్వండి" : language === "hi" ? "कलीसिया डिस्कवर क्लास में भाग लें" : "Attend KCM Discover Class"),
      desc: m.step1Desc || (language === "te" ? "మా సంఘ చరిత్ర, మిషన్, సిద్ధాంతాలు మరియు నిర్మాణాన్ని అర్థం చేసుకోవడానికి 60 నిమిషాల సెషన్." : language === "hi" ? "हमारे इतिहास, मिशन, विश्वास और नेतृत्व को समझने के लिए 60 मिनट का सत्र।" : "A 60-minute interactive session to understand our history, mission, beliefs, and leadership structure."),
      icon: BookOpen,
      duration: language === "te" ? "1 గంట సెషన్" : language === "hi" ? "1 घंटे का सत्र" : "1 Hour Session"
    },
    {
      step: 2,
      title: m.step2Title || (language === "te" ? "మీ విశ్వాస సాక్ష్యాన్ని పంచుకోండి" : language === "hi" ? "अपनी विश्वास यात्रा साझा करें" : "Share Your Faith Story"),
      desc: m.step2Desc || (language === "te" ? "మీ వ్యక్తిగత రక్షణ అనుభవాన్ని మరియు సంఘంలో చేరాలనే కోరికను పాస్టర్ గారితో పంచుకోండి." : language === "hi" ? "अपनी व्यक्तिगत विश्वास यात्रा और कलीसिया का हिस्सा बनने की इच्छा पादरी के साथ साझा करें।" : "A brief conversation with a pastor or elder about your personal faith journey and desire to belong."),
      icon: MessageSquare,
      duration: language === "te" ? "15 నిమిషాల భేటీ" : language === "hi" ? "15 मिनट की बातचीत" : "15 Min Meeting"
    },
    {
      step: 3,
      title: m.step3Title || (language === "te" ? "సభ్యత్వ నిబంధనపై సంతకం చేయండి" : language === "hi" ? "सदस्यता अनुबंध पर हस्ताक्षर करें" : "Sign the Covenant"),
      desc: m.step3Desc || (language === "te" ? "సహవాసం, ప్రార్థన, దశాంశ భాగం మరియు సమాజ సేవ అనే బైబిల్ సూత్రాలకు కట్టుబడి ఉండండి." : language === "hi" ? "संगति, प्रार्थना, दान और सेवा के बाइबिल मूल्यों के अनुसार जीवन जीने की प्रतिबद्धता।" : "Commit to living out the biblical values of fellowship, prayer, giving, and service in our community."),
      icon: FileText,
      duration: language === "te" ? "నిబద్ధత పత్రం" : language === "hi" ? "प्रतिबद्धता पत्र" : "Commitment"
    },
    {
      step: 4,
      title: m.step4Title || (language === "te" ? "సంఘ కుటుంబంలోకి స్వాగతం & దీవెన" : language === "hi" ? "कलीसिया परिवार में स्वागत और आशीष" : "Celebration & Commissioning"),
      desc: m.step4Desc || (language === "te" ? "ఆదివారం ఆరాధనలో సంఘ కుటుంబం తరపున అధికారికంగా స్వాగతించబడి ప్రార్థన అందుకోండి!" : language === "hi" ? "रविवार की सुबह की आराधना के दौरान कलीसियाई परिवार में आपका आधिकारिक स्वागत और प्रार्थना!" : "Be officially welcomed into the church family during a Sunday morning worship celebration!"),
      icon: Award,
      duration: language === "te" ? "ఆదివారం సంబరం" : language === "hi" ? "रविवार उत्सव" : "Sunday Celebration"
    }
  ];

  // Membership Covenant Promises
  const covenantPromises = [
    m.covenant1 || (language === "te" ? "ఇతర సభ్యుల పట్ల ప్రేమతో ప్రవర్తిస్తూ, సంఘ ఐక్యతను కాపాడుతాను." : language === "hi" ? "अन्य सदस्यों के प्रति प्रेम से व्यवहार करते हुए कलीसिया की एकता की रक्षा करूंगा।" : "I will protect the unity of my church by acting in love toward other members and refusing to gossip."),
    m.covenant2 || (language === "te" ? "నిరంతరం ప్రార్థిస్తూ, ఇతరులను దేవుని సన్నిధికి ఆహ్వానిస్తూ సంఘ బాధ్యతను పంచుకుంటాను." : language === "hi" ? "प्रार्थना करते हुए और दूसरों को आमंत्रित करते हुए कलीसिया की जिम्मेदारी निभाऊंगा।" : "I will share the responsibility of my church by praying and inviting the unchurched."),
    m.covenant3 || (language === "te" ? "నా ఆధ్యాత్మిక వరాలను కనుగొని, నమ్మకంగా సంఘ పరిచర్యలో సేవ చేస్తాను." : language === "hi" ? "अपने आत्मिक वरदानों को पहचान कर विश्वासयोग्यता से कलीसिया की सेवा करूंगा।" : "I will serve the ministry of my church by discovering my gifts and serving faithfuly."),
    m.covenant4 || (language === "te" ? "పరిశుద్ధమైన జీవితాన్ని జీవిస్తూ, నమ్మకంగా దశాంశ భాగాలను చెల్లిస్తూ సంఘ సాక్ష్యాన్ని నిలబెడతాను." : language === "hi" ? "पवित्र जीवन जीते हुए और विश्वासयोग्यता से दशमांश देते हुए कलीसिया की गवाही को बनाए रखूंगा।" : "I will support the testimony of my church by living a godly life and tithing faithfully."),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-purple-500 selection:text-white">
      {/* 🧭 Global Navigation Bar */}
      <Navbar />

      {/* 🌌 Hero Section */}
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/90 dark:bg-white/10 backdrop-blur-md border border-purple-200/90 dark:border-white/20 text-purple-900 dark:text-white font-semibold text-xs sm:text-sm mb-6 shadow-sm">
              <Crown className="w-4 h-4 text-purple-600 dark:text-amber-300" />
              <span>{language === "te" ? "మా సంఘ కుటుంబంలో చేరండి • సభ్యత్వం పొందండి" : language === "hi" ? "हमारे कलीसियाई परिवार में शामिल हों • सदस्य बनें" : "Join Our Church Family • Become a Member"}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 font-serif text-slate-900 dark:text-white">
              {m.title || (language === "te" ? "సంఘ సభ్యత్వం పొందండి" : language === "hi" ? "कलीसिया सदस्य बनें" : "Become a Member")}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
              {m.subtitle || (language === "te" ? "సంఘ సభ్యత్వం అనేది ఒక ఆధ్యాత్మిక కుటుంబంలో భాగస్వామ్యం పొందడం, ఇక్కడ మీరు క్రీస్తులో ప్రేమించబడతారు మరియు ప్రోత్సహించబడతారు." : language === "hi" ? "कलीसिया की सदस्यता एक आत्मिक परिवार का हिस्सा बनने के बारे में है जहाँ आपकी देखभाल की जाती है और मसीह में प्रोत्साहित किया जाता है।" : "Church membership is about committing to a spiritual family where you can be known, cared for, and encouraged in Christ.")}
            </p>

            {/* Stats Highlights Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-purple-100/80 dark:border-slate-800">
              <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-sm border border-purple-100 dark:border-slate-800 shadow-sm">
                <div className="text-2xl font-black text-slate-900 dark:text-white">1,200+</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{language === "te" ? "క్రియాశీల సభ్యులు" : language === "hi" ? "सक्रिय सदस्य" : "Active Members"}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-sm border border-purple-100 dark:border-slate-800 shadow-sm">
                <div className="text-2xl font-black text-slate-900 dark:text-white">3</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{language === "te" ? "సంఘ కేంద్రాలు" : language === "hi" ? "कलीसिया केंद्र" : "Church Hubs"}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-sm border border-purple-100 dark:border-slate-800 shadow-sm">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{language === "te" ? "4 దశలు" : language === "hi" ? "4 चरण" : "4 Steps"}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{language === "te" ? "సులభమైన ప్రక్రియ" : language === "hi" ? "सरल मार्ग" : "Simple Pathway"}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-sm border border-purple-100 dark:border-slate-800 shadow-sm">
                <div className="text-2xl font-black text-slate-900 dark:text-white">100%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{language === "te" ? "ఆధ్యాత్మిక గృహం" : language === "hi" ? "आत्मिक घर" : "Belonging"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💡 Why Membership Matters Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 font-serif">
              {m.whyTitle || (language === "te" ? "సభ్యత్వం ఎందుకు ముఖ్యం?" : language === "hi" ? "सदस्यता क्यों महत्वपूर्ण है?" : "Why Membership Matters")}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-medium">
              {m.whyDesc || (language === "te" ? "సభ్యత్వం అనేది కేవలం జాబితాలో పేరు నమోదు చేసుకోవడం మాత్రమే కాదు. ఇది క్రీస్తు శరీరంలో కలిసి ఎదగడానికి, సేవ చేయడానికి ఒక పవిత్రమైన నిబద్ధత." : language === "hi" ? "सदस्यता केवल सूची में नाम होने से कहीं अधिक है। यह मसीह के शरीर में एक साथ बढ़ने और सेवा करने की एक महत्वपूर्ण प्रतिबद्धता है।" : "Membership is more than having your name on a list. It is a vital commitment to grow, serve, and flourish together as one body in Christ.")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-purple-100/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border ${item.colorBg}`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-serif">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 👣 4-Step Membership Pathway */}
      <section className="py-16 md:py-24 bg-slate-100/70 dark:bg-slate-900/50 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 font-serif">
              {m.stepsTitle || (language === "te" ? "సభ్యత్వ ప్రక్రియ దశలు" : language === "hi" ? "सदस्यता के चरण" : "Steps to Membership")}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-medium">
              {language === "te" ? "మా 4-దశల సులభమైన ప్రక్రియ మిమ్మల్ని సంఘ కుటుంబంలోకి సజావుగా నడిపిస్తుంది." : language === "hi" ? "हमारी सरल चार-चरणीय प्रक्रिया आपको कलीसिया की सदस्यता में मार्गदर्शन करती है।" : "Our simple four-step process guides you seamlessly into church membership."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {pathwaySteps.map((item) => {
              return (
                <div
                  key={item.step}
                  className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-purple-100/90 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex items-start gap-5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-purple-600/20">
                    {item.step}
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                        {item.title}
                      </h3>
                    </div>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 text-[11px] font-extrabold mb-3 shadow-sm border border-purple-200/80 dark:border-purple-700/50">
                      {item.duration}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 📜 Membership Covenant & Class Sign Up CTA */}
      <section className="py-20 relative z-10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border-t border-purple-100/80 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gradient-to-br from-purple-50/90 via-indigo-50/50 to-white dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 border border-purple-200/90 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-xl shadow-purple-900/5 dark:shadow-black/40 relative overflow-hidden text-slate-900 dark:text-white">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 border border-purple-400 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-600/30">
              <FileCheck className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 font-serif text-slate-900 dark:text-white">
              {m.covenantTitle || (language === "te" ? "మా సంఘ సభ్యత్వ నిబంధన" : language === "hi" ? "हमारा सदस्यता अनुबंध" : "Our Membership Covenant")}
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 font-medium leading-relaxed">
              {language === "te" ? "కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్‌లో సభ్యులుగా చేరడం ద్వారా, మేము 4 ప్రధాన బైబిల్ నిబద్ధతలను కలిగి ఉంటాము:" : language === "hi" ? "किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज में शामिल होकर, सदस्य चार मुख्य बाइबिल प्रतिबद्धताओं के तहत भागीदारी करते हैं:" : "By joining Kingdom of Christ Ministries, members partner together under four core biblical commitments:"}
            </p>

            {/* Checklist */}
            <div className="max-w-xl mx-auto space-y-3 text-left mb-10 bg-white/95 dark:bg-slate-800/60 p-6 rounded-2xl border border-purple-100 dark:border-slate-700/60 shadow-sm">
              {covenantPromises.map((text, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{text}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base rounded-2xl transition-all duration-200 shadow-lg shadow-purple-600/30 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{m.signup || (language === "te" ? "తదుపరి తరగతి కోసం నమోదు చేసుకోండి" : language === "hi" ? "अगली कक्षा के लिए साइन अप करें" : "Sign Up for Next Class")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/login"
                className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-purple-200/90 dark:border-slate-700 rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-105"
              >
                <span>{language === "te" ? "ఇప్పటికే సభ్యులా? లాగిన్ అవ్వండి" : language === "hi" ? "पहले से सदस्य हैं? लॉगिन करें" : "Already a Member? Log In"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📥 Interactive Class Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 mb-2 inline-block shadow-sm">
                {language === "te" ? "తరగతి నమోదు" : language === "hi" ? "कक्षा पंजीकरण" : "Class Registration"}
              </span>
              <h3 className="text-2xl font-bold font-serif text-white">{language === "te" ? "కింగ్‌డమ్ డిస్కవర్ తరగతి" : language === "hi" ? "किंगडम डिस्कवर क्लास" : "Discover Kingdom Class"}</h3>
              <p className="text-xs text-purple-100 mt-1">{language === "te" ? "రాబోయే ఆదివారం సభ్యత్వ అవగాహన సెషన్ కోసం నమోదు చేసుకోండి." : language === "hi" ? "रविवार के सदस्यता ओरिएंटेशन सत्र के लिए पंजीकरण करें।" : "Register for our upcoming Sunday membership orientation session."}</p>
            </div>

            <div className="p-6 text-slate-900 dark:text-slate-100">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-serif">Registration Successful!</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Thank you, <strong>{regForm.name || "friend"}</strong>! We look forward to seeing you at <strong>{regForm.preferredBranch}</strong> for the Discover Kingdom class.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Raju"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="david@example.com"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Select Location / Branch *
                    </label>
                    <select
                      value={regForm.preferredBranch}
                      onChange={(e) => setRegForm({ ...regForm, preferredBranch: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                    >
                      <option value="Shapur Main Branch">Shapur Main Branch</option>
                      <option value="Subhash Nagar Branch">Subhash Nagar Branch</option>
                      <option value="Bahadurpally Branch">Bahadurpally Branch</option>
                      <option value="Online Zoom Class">Online Zoom Class</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-98 cursor-pointer"
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