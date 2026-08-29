"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart, Users, Video, Image as ImageIcon, ArrowRight, ShieldCheck,
  Award, Star, CheckCircle2, Sparkles, HandHeart, FileText, Gift,
  PlayCircle, Camera, Stethoscope, Home, TrendingUp, Globe,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function NgoOverviewPage() {
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [selectedImpactIndex, setSelectedImpactIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ngoT = t?.ngo || {};

  const stats = [
    {
      value: "5,000+",
      label: language === "te" ? "సహాయం పొందిన ప్రజలు" : language === "hi" ? "लाभार्थी नागरिक" : "People Assisted",
      desc: language === "te" ? "రోగులకు భోజనం, మందులు & సహాయం" : language === "hi" ? "मरीजों को भोजन, दवाएं और देखभाल" : "Patient food, medicines & care support",
      icon: HandHeart,
      accent: "border-rose-500",
      iconBg: "bg-rose-500",
      numColor: "text-rose-600 dark:text-rose-400"
    },
    {
      value: "3+",
      label: language === "te" ? "సేవలు అందించిన ఆసుపత్రులు" : language === "hi" ? "सहयोगी अस्पताल" : "Hospitals Supported",
      desc: language === "te" ? "నిమ్స్, గాంధీ & ప్రభుత్వ ఆసుపత్రులు" : language === "hi" ? "निम्स, गांधी और सरकारी अस्पताल" : "NIMS, Gandhi & Government Hospitals",
      icon: Stethoscope,
      accent: "border-blue-500",
      iconBg: "bg-blue-500",
      numColor: "text-blue-600 dark:text-blue-400"
    },
    {
      value: "100+",
      label: language === "te" ? "క్రియాశీల వాలంటీర్లు" : language === "hi" ? "सक्रिय स्वयंसेवक" : "Volunteers Active",
      desc: language === "te" ? "అంకితభావం కలిగిన సేవా బృందం" : language === "hi" ? "समर्पित समाज सेवा टीम" : "Dedicated social service team",
      icon: Users,
      accent: "border-amber-500",
      iconBg: "bg-amber-500",
      numColor: "text-amber-600 dark:text-amber-400"
    },
    {
      value: "2+",
      label: language === "te" ? "ఆశ్రమాలకు నిరంతర మద్దతు" : language === "hi" ? "सहयोगी आश्रम" : "Ashramams Supported",
      desc: language === "te" ? "పునరావాస & ఆశ్రయ సంరక్షణ" : language === "hi" ? "पुनर्वास एवं आश्रय देखभाल" : "Rehabilitation & shelter care",
      icon: Home,
      accent: "border-purple-500",
      iconBg: "bg-purple-500",
      numColor: "text-purple-600 dark:text-purple-400"
    },
  ];

  const initiatives = [
    {
      step: "01",
      title: ngoT.hospitalOutreachTitle || (language === "te" ? "ఆసుపత్రి సేవా కార్యక్రమాలు" : language === "hi" ? "अस्पताल सेवा अभियान" : "Hospital Outreaches"),
      desc: ngoT.hospitalOutreachDesc || (language === "te" ? "గాంధీ, నిమ్స్ మరియు ప్రభుత్వ జనరల్ ఆసుపత్రులలోని రోగులకు మందులు, ఆహారం మరియు ఆధ్యాత్మిక ఓదార్పుని అందించడం." : language === "hi" ? "गांधी, निम्स और सरकारी जनरल अस्पतालों में मरीजों को दवाएं, भोजन और आध्यात्मिक सांत्वना प्रदान करना।" : "Providing medicine, food supplies, and spiritual comfort to patients in Gandhi, NIMS, and Government General Hospitals across Hyderabad."),
      icon: Stethoscope,
      badge: language === "te" ? "క్రమం తప్పని సేవ" : language === "hi" ? "नियमित सेवा" : "Regular Outreach",
      accent: "border-l-blue-500",
      iconBg: "bg-blue-600",
      badgeColor: "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-600 dark:border-blue-500 dark:text-white",
      href: "/ngo/projects"
    },
    {
      step: "02",
      title: ngoT.ashramamSupportTitle || (language === "te" ? "ఆశ్రమ సహాయ సేవ" : language === "hi" ? "आश्रम सहायता सेवा" : "Ashramam Support"),
      desc: ngoT.ashramamSupportDesc || (language === "te" ? "బెథానీ సంరక్షణ ఆశ్రమం మరియు దివ్యాంగుల కేంద్రాలకు నెలవారీ నిత్యావసరాలు, బెడ్డింగ్ మరియు వైద్య సహాయం అందించడం." : language === "hi" ? "बेथानी संरक्षण आश्रम और दिव्यांग केंद्रों को मासिक राशन, बिस्तर और चिकित्सा सहायता प्रदान करना।" : "Aiding Bethany Samrakshana Ashramam and disabled care shelters with monthly provisions, bedding, and medical assistance."),
      icon: Home,
      badge: language === "te" ? "ఆశ్రయ సంరక్షణ" : language === "hi" ? "आश्रय देखभाल" : "Shelter Care",
      accent: "border-l-purple-500",
      iconBg: "bg-purple-600",
      badgeColor: "bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-600 dark:border-purple-500 dark:text-white",
      href: "/ngo/projects"
    },
    {
      step: "03",
      title: ngoT.impactGalleryTitle || (language === "te" ? "సేవా ఫోటో గ్యాలరీ" : language === "hi" ? "सेवा फोटो गैलरी" : "Impact Gallery"),
      desc: ngoT.impactGalleryDesc || (language === "te" ? "తెలంగాణ అంతటా జరిగిన వాలంటీర్ సేవలు, అన్నదాన డ్రైవ్‌లు మరియు సహాయ శిబిరాల వాస్తవ ఫోటోలను ఇక్కడ చూడండి." : language === "hi" ? "तेलंगाना भर में स्वयंसेवक सेवाओं, भोजन वितरण और सहायता शिविरों की वास्तविक तस्वीरों का संग्रह देखें।" : "Browse high-quality photo logs capturing real-time volunteer services, food distribution drives, and relief camps across Telangana."),
      icon: Camera,
      badge: language === "te" ? "ఫోటో లాగ్స్" : language === "hi" ? "फोटो लॉग्स" : "Photo Logs",
      accent: "border-l-emerald-500",
      iconBg: "bg-emerald-600",
      badgeColor: "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-600 dark:border-emerald-500 dark:text-white",
      href: "/ngo/gallery"
    },
    {
      step: "04",
      title: ngoT.videoLogsTitle || (language === "te" ? "సేవా వీడియో లాగ్స్" : language === "hi" ? "सेवा वीडियो लॉग्स" : "Service Video Logs"),
      desc: ngoT.videoLogsDesc || (language === "te" ? "మా సామాజిక సేవ, ఆసుపత్రి సహాయ పంపిణీ మరియు కమ్యూనిటీ సహాయ కార్యక్రమాల ప్రత్యక్ష వీడియోలను వీక్షించండి." : language === "hi" ? "हमारे सामाजिक कार्य, अस्पताल सहायता वितरण और समुदाय राहत कार्यों के लाइव वीडियो देखें।" : "Watch direct video evidence of our social work, including specialized hospital care distribution and community relief operations."),
      icon: PlayCircle,
      badge: language === "te" ? "వీడియో సాక్ష్యం" : language === "hi" ? "वीडियो प्रमाण" : "Video Evidence",
      accent: "border-l-rose-500",
      iconBg: "bg-rose-600",
      badgeColor: "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-600 dark:border-rose-500 dark:text-white",
      href: "/ngo/videos"
    },
  ];

  const impactTiers = [
    {
      amount: "₹500",
      rawAmount: 500,
      title: language === "te" ? "వైద్య & భోజన ప్యాక్" : language === "hi" ? "चिकित्सा एवं भोजन किट" : "Medical & Meal Pack",
      desc: language === "te" ? "ఆసుపత్రి రోగులకు 1 అవసరమైన ఔషధ కిట్ & పోషకాహార భోజనం." : language === "hi" ? "अस्पताल के मरीजों के लिए 1 आवश्यक दवा किट और पौष्टिक भोजन।" : "1 essential medicine kit & nutritious meals for hospital patients.",
      impactBadge: language === "te" ? "1 రోగికి సహాయం" : language === "hi" ? "1 मरीज की सहायता" : "1 Patient Helped",
      icon: HandHeart,
      gradient: "from-rose-500 to-pink-600"
    },
    {
      amount: "₹1,500",
      rawAmount: 1500,
      title: language === "te" ? "ఆశ్రమ నిత్యావసర కిట్" : language === "hi" ? "आश्रम राशन किट" : "Ashramam Care Kit",
      desc: language === "te" ? "వృద్ధులకు నెలవారీ కిరాణా సరుకులు, బెడ్డింగ్ & పరిశుభ్రత కిట్." : language === "hi" ? "बुजुर्गों के लिए मासिक राशन सामग्री, बिस्तर और स्वच्छता किट।" : "Monthly grocery provisions, bedding & hygiene kits for elderly residents.",
      impactBadge: language === "te" ? "వృద్ధుల సంరక్షణ" : language === "hi" ? "बुजुर्ग देखभाल" : "Elderly Care",
      icon: ShieldCheck,
      gradient: "from-purple-500 to-indigo-600"
    },
    {
      amount: "₹3,000",
      rawAmount: 3000,
      title: language === "te" ? "వీల్‌చైర్ & మొబిలిటీ సాయం" : language === "hi" ? "व्हीलचेयर एवं सहायता" : "Outreach & Wheelchair Aid",
      desc: language === "te" ? "దివ్యాంగులకు వీల్‌చైర్లు, వాకర్లు & ప్రత్యేక వైద్య సంరక్షణ." : language === "hi" ? "दिव्यांगों के लिए व्हीलचेयर, वॉकर और विशेष चिकित्सा देखभाल।" : "Mobility equipment & specialized medical care in relief camps.",
      impactBadge: language === "te" ? "మొబిలిటీ సాయం" : language === "hi" ? "गतिशीलता सहायता" : "Mobility & Aid",
      icon: Award,
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      amount: "₹5,000+",
      rawAmount: 5000,
      title: language === "te" ? "సంపూర్ణ ఆశ్రయ స్పాన్సర్‌షిప్" : language === "hi" ? "पूर्ण आश्रय प्रायोजन" : "Sponsor a Shelter Unit",
      desc: language === "te" ? "నిరుపేద వ్యక్తికి నెల మొత్తం అవసరమైన సంరక్షణ, భోజనం & వైద్యం." : language === "hi" ? "जरूरतमंद व्यक्ति के लिए पूरे महीने की देखभाल, भोजन और इलाज।" : "Total monthly care, food & medical treatment for vulnerable individuals.",
      impactBadge: language === "te" ? "పూర్తి స్పాన్సర్‌షిప్" : language === "hi" ? "पूर्ण प्रायोजन" : "Full Sponsorship",
      icon: Star,
      gradient: "from-amber-500 to-orange-600"
    },
  ];

  return (
    <div className="py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">

        {/* ═══ 1. HERO ═══ */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-6 sm:space-y-7 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-600 dark:border-rose-500 dark:text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
                {ngoT.subtitle || "NGO — Non-Governmental Organization"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-600 dark:border-emerald-500 dark:text-white text-[11px] font-extrabold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> 80G Tax Exempted
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight leading-[1.15] sm:leading-[1.1]">
              <span className="text-slate-900 dark:text-white">
                {language === "te" ? "మానవ సేవయే," : language === "hi" ? "मानव सेवा ही," : "Serving Humanity,"}
              </span>
              <br />
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 dark:from-rose-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                {language === "te" ? "మాధవ సేవ" : language === "hi" ? "माधव सेवा" : "Spreading Hope"}
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-lg leading-relaxed max-w-xl">
              {ngoT.desc || "Kingdom of Christ Ministries extends its mission beyond chapel walls — delivering medical aid, food, shelter support, and rehabilitation care across Hyderabad through selfless active faith."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/ngo/donations" className="group justify-center px-6 py-3.5 bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:opacity-90 text-white font-bold rounded-2xl shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5">
                <Gift className="w-4 h-4" />
                <span>{ngoT.supportBtn || "Support Our Cause"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/ngo/volunteers" className="justify-center px-6 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 text-slate-800 dark:text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{ngoT.volunteerBtn || "Join as Volunteer"}</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t-2 border-slate-200 dark:border-slate-800">
              {[
                { icon: ShieldCheck, text: "Regd No: 206/2024", color: "text-emerald-600 dark:text-emerald-400" },
                { icon: FileText, text: "12A & 80G Approval", color: "text-purple-600 dark:text-purple-400" },
                { icon: Globe, text: language === "te" ? "100% ప్రత్యక్ష సేవ" : language === "hi" ? "100% प्रत्यक्ष सहायता" : "100% Field Aid", color: "text-amber-600 dark:text-amber-400" },
              ].map(({ icon: Icon, text, color }, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-extrabold text-slate-800 dark:text-white shadow-sm">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
                  <span className="leading-tight">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative group rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-900 shadow-2xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-slate-900 to-slate-950 p-2 flex items-center justify-center relative">
                <Image
                  src="/kcm_society_ngo.jpg"
                  alt="KCM Society NGO"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain rounded-2xl group-hover:scale-[1.02] transition-transform duration-500"
                  priority
                />
              </div>
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-3 py-1.5 rounded-full bg-slate-950/90 border border-amber-400/50 text-amber-400 text-[10px] sm:text-[11px] font-bold font-mono shadow-xl flex items-center gap-1.5 z-10">
                <ShieldCheck className="w-3.5 h-3.5" /> Regd No: 206/2024
              </div>
            </div>

            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-lg flex items-start gap-3.5 sm:gap-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-100 dark:bg-rose-950 border-2 border-rose-200 dark:border-rose-800 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400 fill-rose-300 dark:fill-rose-900 animate-pulse" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">{ngoT.bannerTitle || "KCM Social Services"}</h3>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md bg-purple-600 text-white border border-purple-500 whitespace-nowrap shadow-sm">
                    {language === "te" ? "ప్రభుత్వ గుర్తింపు పొందినది" : language === "hi" ? "सरकारी पंजीकृत" : "Govt. Registered"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ngoT.bannerDesc || "Active social service: daily necessities, blankets, medical funds, and care programs across orphanages and clinics in Hyderabad."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ 2. STATS ═══ */}
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-purple-800 border border-purple-300 bg-purple-100 dark:bg-purple-600 dark:border-purple-500 dark:text-white px-3.5 py-1.5 rounded-full shadow-sm">
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-white" />
              <span>{language === "te" ? "మా సేవా ప్రభావం" : language === "hi" ? "हमारा सेवा प्रभाव" : "Our Measured Impact"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {language === "te" ? "వాస్తవ ఫలితాలు, మారిన జీవితాలు" : language === "hi" ? "वास्तविक परिणाम, बदले हुए जीवन" : "Real Outcomes, Real Lives Changed"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
              {language === "te" ? "తెలంగాణ అంతటా దాతల విరాళాలు మరియు 100+ వాలంటీర్ల నిరంతర సేవతో సాధ్యమవుతోంది." : language === "hi" ? "उदार दाताओं और 100+ समर्पित स्वयंसेवकों के सहयोग से संचालित।" : "Powered by generous donors and 100+ dedicated volunteers across Telangana."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`group relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 border-t-4 ${stat.accent} shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600">
                      {language === "te" ? "ధృవీకరించబడింది" : language === "hi" ? "सत्यापित" : "Verified"}
                    </span>
                  </div>
                  <div className={`text-3xl sm:text-4xl font-black tracking-tight ${stat.numColor} mb-1`}>{stat.value}</div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">{stat.label}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{stat.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ 3. 12A / 80G TRUST BANNER ═══ */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/80 via-white to-purple-50/50 dark:from-slate-800 dark:to-slate-800 p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="space-y-3 sm:space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-600 dark:border-emerald-500 dark:text-white text-xs font-extrabold uppercase tracking-wider shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-white" />
                <span>{language === "te" ? "పన్ను మినహాయింపు అర్హత — సెక్షన్ 80G" : language === "hi" ? "आयकर छूट योग्य — धारा 80G" : "Tax Exemption Eligible — Section 80G"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {language === "te" ? "12A & 80G అనుమతులు కలిగిన ప్రభుత్వ రిజిస్టర్డ్ NGO" : language === "hi" ? "12A एवं 80G स्वीकृतियों के साथ सरकारी पंजीकृत एनजीओ" : "Government Registered NGO with 12A & 80G Approvals"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {language === "te" ? "KCM సొసైటీ NGOకి ఇచ్చే అన్ని విరాళాలు ఆదాయపు పన్ను చట్టం సెక్షన్ 80G(5)(VI) కింద 50% పన్ను మినహాయింపునకు అర్హమైనవి. అధికారిక రసీదులు తక్షణమే జారీ చేయబడతాయి." : language === "hi" ? "केसीएम सोसाइटी एनजीओ को दिए गए सभी दान आयकर अधिनियम की धारा 80G के तहत कर कटौती के योग्य हैं। आधिकारिक रसीदें तुरंत जारी की जाती हैं।" : "All donations to KCM Society NGO qualify for tax deduction under Section 80G(5)(VI) of the Indian Income Tax Act. Official vouchers and receipts issued automatically."}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: language === "te" ? "సొసైటీ రిజిస్ట్రేషన్ నంబర్" : language === "hi" ? "सोसाइटी पंजीकरण संख्या" : "Society Reg Number", value: "206 / 2024", color: "text-amber-700 dark:text-amber-400" },
                { label: language === "te" ? "ఐటీ సెక్షన్ ఆమోదం" : language === "hi" ? "आयकर धारा स्वीकृति" : "IT Section Approval", value: "12A & 80G(5)(VI)", color: "text-emerald-700 dark:text-emerald-400" },
                { label: language === "te" ? "క్షేత్ర కార్యకలాపాలు" : language === "hi" ? "कार्यक्षेत्र" : "Field Operations", value: "Hyderabad, TG", color: "text-blue-700 dark:text-blue-400" },
                { label: language === "te" ? "పన్ను ప్రయోజనం" : language === "hi" ? "कर लाभ" : "Tax Benefit", value: language === "te" ? "50% మినహాయింపు" : language === "hi" ? "50% छूट" : "50% Deduction", color: "text-purple-700 dark:text-purple-400" },
              ].map((item, i) => (
                <div key={i} className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-center shadow-sm">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold mb-0.5">{item.label}</div>
                  <div className={`text-sm sm:text-base font-black font-mono ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ 4. CORE INITIATIVES ═══ */}
        <div className="space-y-8 sm:space-y-10">
          <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-purple-800 border border-purple-300 bg-purple-100 dark:bg-purple-600 dark:border-purple-500 dark:text-white px-3.5 py-1.5 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-white" />
              <span>{language === "te" ? "మేము ఏమి చేస్తాము" : language === "hi" ? "हम क्या करते हैं" : "What We Do"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">{ngoT.initiativesTitle || "Our Core Initiatives"}</h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed">{ngoT.initiativesDesc || "Four pillars of active humanitarian service — delivered consistently every month."}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {initiatives.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className={`group relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 border-l-4 ${item.accent} shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 sm:space-y-5 text-left`}>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${item.iconBg} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 font-mono mt-1">STEP {item.step}</span>
                    </div>
                    <div>
                      <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg ${item.badgeColor} mb-2 shadow-sm`}>{item.badge}</span>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 sm:mt-2 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <div className="pt-3 sm:pt-4 border-t-2 border-slate-100 dark:border-slate-700">
                    <Link href={item.href} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 transition-colors uppercase tracking-wide">
                      <span>{ngoT.exploreMore || "Explore Initiative"}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ 5. GIVING IMPACT TIERS ═══ */}
        <div className="rounded-3xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 shadow-xl p-5 sm:p-10 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-5 text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-purple-800 border border-purple-300 bg-purple-100 dark:bg-purple-600 dark:border-purple-500 dark:text-white px-3.5 py-1.5 rounded-full shadow-sm">
                <Gift className="w-4 h-4 text-purple-600 dark:text-white" />
                <span>{language === "te" ? "మీ సహాయం చేసే మార్పు చూడండి" : language === "hi" ? "आपके दान का प्रभाव देखें" : "See What Your Gift Does"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {language === "te" ? "మీ విరాళ ప్రభావ శ్రేణిని ఎంచుకోండి" : language === "hi" ? "दान राशि और उसका प्रभाव चुनें" : "Select Your Giving Impact Tier"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-md">
                {language === "te" ? "మీ విరాళం క్షేత్రస్థాయిలో ఎవరికి ఎలా సహాయపడుతుందో తెలుసుకోవడానికి ఒక మొత్తాన్ని ఎంచుకోండి." : language === "hi" ? "यह जानने के लिए एक राशि चुनें कि आपका दान जमीनी स्तर पर कैसे मदद करता है।" : "Choose an amount to see exactly what your donation funds on the ground."}
              </p>
            </div>
            <Link
              href={mounted ? `/ngo/donations?amount=${impactTiers[selectedImpactIndex].rawAmount}` : "/ngo/donations"}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm whitespace-nowrap w-full sm:w-auto"
            >
              <span>{language === "te" ? `${impactTiers[selectedImpactIndex].amount} విరాళం ఇవ్వండి` : language === "hi" ? `${impactTiers[selectedImpactIndex].amount} दान करें` : `Donate ${impactTiers[selectedImpactIndex].amount}`}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {impactTiers.map((tier, idx) => {
              const isSelected = selectedImpactIndex === idx;
              const Icon = tier.icon;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedImpactIndex(idx)}
                  className={`text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 relative ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 border-purple-600 dark:border-purple-500 ring-4 ring-purple-500/20 shadow-xl shadow-purple-500/20 -translate-y-1"
                      : "bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.gradient} text-white flex items-center justify-center mb-3 shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className={`text-xl sm:text-2xl font-black mb-1 ${isSelected ? "text-purple-600 dark:text-purple-400" : "text-slate-900 dark:text-white"}`}>{tier.amount}</div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm mb-1.5">{tier.title}</div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 mb-3">{tier.desc}</p>
                  <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  }`}>{tier.impactBadge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ 6. MEDIA SHOWCASE ═══ */}
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-50 via-white to-rose-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border-2 border-purple-200 dark:border-slate-700 shadow-xl overflow-hidden">
          <div className="relative z-10 grid lg:grid-cols-2 gap-6 sm:gap-8 items-center p-6 sm:p-12">
            <div className="space-y-4 sm:space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-600 dark:border-rose-500 dark:text-white text-xs font-extrabold uppercase tracking-wider shadow-sm">
                <Video className="w-3.5 h-3.5 text-rose-600 dark:text-white animate-pulse" />
                <span>{language === "te" ? "క్షేత్రస్థాయి పారదర్శకత" : language === "hi" ? "जमीनी पारदर्शिता" : "Real-Time Field Transparency"}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {language === "te" ? "మా సేవా కార్యాలను ప్రత్యక్షంగా చూడండి" : language === "hi" ? "हमारे सेवा कार्यों को प्रत्यक्ष देखें" : "Witness Our Work in Action"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed">
                {language === "te" ? "మేము ప్రతి అన్నదానం, ఆసుపత్రి సందర్శన మరియు ఆశ్రమ సహాయ కార్యక్రమాన్ని నమోదు చేస్తాము. కొనసాగుతున్న సేవా ప్రయత్నాల ఫోటోలు మరియు హై-డెఫినిషన్ వీడియో లాగ్‌లను వీక్షించండి." : language === "hi" ? "हम हर भोजन वितरण, अस्पताल यात्रा और आश्रम सहायता कार्यक्रम का दस्तावेजीकरण करते हैं। हमारे सेवा प्रयासों के फोटो और वीडियो देखें।" : "We document every distribution drive, hospital visit, and ashramam aid program. Browse verified photo archives and high-definition video logs of ongoing humanitarian efforts."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link href="/ngo/gallery" className="justify-center px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-xl shadow-md hover:border-emerald-500 transition-all flex items-center gap-2 text-sm">
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === "te" ? "ఫోటో గ్యాలరీ చూడండి" : language === "hi" ? "फोटो गैलरी देखें" : "View Photo Gallery"}</span>
                </Link>
                <Link href="/ngo/videos" className="justify-center px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm">
                  <PlayCircle className="w-4 h-4 text-white" />
                  <span>{language === "te" ? "వీడియో లాగ్స్ చూడండి" : language === "hi" ? "वीडियो लॉग्स देखें" : "Watch Video Logs"}</span>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { label: language === "te" ? "ఆసుపత్రి వైద్య సహాయం" : language === "hi" ? "अस्पताल चिकित्सा सहायता" : "Hospital Medical Aid", sub: "Gandhi & NIMS Hospitals", image: "/ngo_outreach_drive_thumbnail.png", Ico: ImageIcon },
                { label: language === "te" ? "ఆశ్రమ దుప్పట్ల పంపిణీ" : language === "hi" ? "आश्रम कंबल वितरण" : "Ashramam Blanket Drive", sub: "Bethany Shelter Support", image: "/bethany_ashramam_thumbnail.png", Ico: Video },
              ].map(({ label, sub, image, Ico }, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 space-y-2 shadow-sm text-left">
                  <div className="aspect-video rounded-xl bg-slate-900 overflow-hidden relative group">
                    <Image
                      src={image}
                      alt={label}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Ico className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{label}</div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ 7. CTA BOTTOM ═══ */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-purple-300 dark:border-purple-800 bg-gradient-to-r from-purple-100/70 via-white to-rose-100/70 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 p-6 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 shadow-xl">
          <div className="relative z-10 space-y-3 max-w-xl text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-800 border border-rose-300 bg-rose-100 dark:bg-rose-600 dark:border-rose-500 dark:text-white px-3.5 py-1.5 rounded-full shadow-sm">
              <Heart className="w-4 h-4 fill-current text-rose-500 dark:text-white" />
              <span>{ngoT.ctaHeading || "Be the Change Today"}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {language === "te" ? "ఒకరి జీవితంలో నేరుగా మార్పు తీసుకురండి" : language === "hi" ? "किसी के जीवन में सीधा बदलाव लाएं" : "Make a Direct Difference in Someone's Life"}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              {ngoT.ctaText || "Every small action counts. Your donation funds medical supplies and food packs for government hospitals, while volunteering gives us the hands needed to deliver them."}
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full sm:w-auto">
            <Link href="/ngo/donations" className="justify-center px-7 py-3.5 bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span>{ngoT.donateNow || "Donate Now"}</span>
            </Link>
            <Link href="/ngo/volunteers" className="justify-center px-7 py-3.5 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 hover:border-purple-500 text-slate-900 dark:text-white font-bold rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{ngoT.becomeVolunteer || "Become a Volunteer"}</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
