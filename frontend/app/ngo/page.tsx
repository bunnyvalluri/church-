"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Users,
  Video,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Award,
  Star,
  CheckCircle2,
  Sparkles,
  HandHeart,
  FileText,
  Gift,
  PlayCircle,
  Camera,
  Stethoscope,
  Home,
  TrendingUp,
  Globe,
  Phone,
  FileCheck,
  MapPin,
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
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
    {
      value: "3+",
      label: language === "te" ? "సేవలు అందించిన ఆసుపత్రులు" : language === "hi" ? "सहयोगी अस्पताल" : "Hospitals Supported",
      desc: language === "te" ? "నిమ్స్, గాంధీ & ప్రభుత్వ ఆసుపత్రులు" : language === "hi" ? "निम्स, गांधी और सरकारी अस्पताल" : "NIMS, Gandhi & Government Hospitals",
      icon: Stethoscope,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      value: "100+",
      label: language === "te" ? "క్రియాశీల వాలంటీర్లు" : language === "hi" ? "सक्रिय स्वयंसेवक" : "Volunteers Active",
      desc: language === "te" ? "అంకితభావం కలిగిన సేవా బృందం" : language === "hi" ? "समर्पित समाज सेवा टीम" : "Dedicated social service team",
      icon: Users,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      value: "2+",
      label: language === "te" ? "ఆశ్రమాలకు నిరంతర మద్దతు" : language === "hi" ? "सहयोगी आश्रम" : "Ashramams Supported",
      desc: language === "te" ? "పునరావాస & ఆశ్రయ సంరక్షణ" : language === "hi" ? "पुनर्वास एवं आश्रय देखभाल" : "Rehabilitation & shelter care",
      icon: Home,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  const initiatives = [
    {
      category: "01 / HEALTHCARE",
      title: ngoT.hospitalOutreachTitle || (language === "te" ? "ఆసుపత్రి సేవా కార్యక్రమాలు" : language === "hi" ? "अस्पताल सेवा अभियान" : "Hospital Outreaches"),
      desc: ngoT.hospitalOutreachDesc || (language === "te" ? "గాంధీ, నిమ్స్ మరియు ప్రభుత్వ జనరల్ ఆసుపత్రులలోని రోగులకు మందులు, ఆహారం మరియు ఆధ్యాత్మిక ఓదార్పుని అందించడం." : language === "hi" ? "गांधी, निम्स और सरकारी जनरल अस्पतालों में मरीजों को दवाएं, भोजन और आध्यात्मिक सांत्वना प्रदान करना।" : "Providing medicine, food supplies, and spiritual comfort to patients in Gandhi, NIMS, and Government General Hospitals across Hyderabad."),
      icon: Stethoscope,
      badge: language === "te" ? "క్రమం తప్పని సేవ" : language === "hi" ? "नियमित सेवा" : "Weekly Outreach",
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      badgeColor: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
      href: "/ngo/projects/preset-gandhi",
    },
    {
      category: "02 / SHELTER",
      title: ngoT.ashramamSupportTitle || (language === "te" ? "ఆశ్రమ సహాయ సేవ" : language === "hi" ? "आश्रम सहायता सेवा" : "Ashramam Support"),
      desc: ngoT.ashramamSupportDesc || (language === "te" ? "బెథానీ సంరక్షణ ఆశ్రమం మరియు దివ్యాంగుల కేంద్రాలకు నెలవారీ నిత్యావసరాలు, బెడ్డింగ్ మరియు వైద్య సహాయం అందించడం." : language === "hi" ? "बेथानी संरक्षण आश्रम और दिव्यांग केंद्रों को मासिक राशन, बिस्तर और चिकित्सा सहायता प्रदान करना।" : "Aiding Bethany Samrakshana Ashramam and disabled care shelters with monthly provisions, bedding, and medical assistance."),
      icon: Home,
      badge: language === "te" ? "ఆశ్రయ సంరక్షణ" : language === "hi" ? "आश्रय देखभाल" : "Shelter Care",
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      badgeColor: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60",
      href: "/ngo/projects/preset-bethany",
    },
    {
      category: "03 / TRANSPARENCY",
      title: ngoT.impactGalleryTitle || (language === "te" ? "సేవా ఫోటో గ్యాలరీ" : language === "hi" ? "सेवा फोटो गैलरी" : "Impact Photo Logs"),
      desc: ngoT.impactGalleryDesc || (language === "te" ? "తెలంగాణ అంతటా జరిగిన వాలంటీర్ సేవలు, అన్నదాన డ్రైవ్‌లు మరియు సహాయ శిబిరాల వాస్తవ ఫోటోలను ఇక్కడ చూడండి." : language === "hi" ? "तेलंगाना भर में स्वयंसेवक सेवाओं, भोजन वितरण और सहायता शिविरों की वास्तविक तस्वीरों का संग्रह देखें।" : "Browse high-definition photo logs capturing real-time volunteer services, food distribution drives, and relief camps across Telangana."),
      icon: Camera,
      badge: language === "te" ? "ఫోటో లాగ్స్" : language === "hi" ? "फोटो लॉग्स" : "Verified Photos",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      badgeColor: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
      href: "/ngo/gallery",
    },
    {
      category: "04 / VIDEO EVIDENCE",
      title: ngoT.videoLogsTitle || (language === "te" ? "సేవా వీడియో లాగ్స్" : language === "hi" ? "सेवा वीडियो लॉग्स" : "Service Video Logs"),
      desc: ngoT.videoLogsDesc || (language === "te" ? "మా సామాజిక సేవ, ఆసుపత్రి సహాయ పంపిణీ మరియు కమ్యూనిటీ సహాయ కార్యక్రమాల ప్రత్యక్ష వీడియోలను వీక్షించండి." : language === "hi" ? "हमारे सामाजिक कार्य, अस्पताल सहायता वितरण और समुदाय राहत कार्यों के लाइव वीडियो देखें।" : "Watch direct video evidence of our social work, including specialized hospital care distribution and community relief operations."),
      icon: PlayCircle,
      badge: language === "te" ? "వీడియో సాక్ష్యం" : language === "hi" ? "वीडियो प्रमाण" : "HD Video Records",
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      badgeColor: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
      href: "/ngo/videos",
    },
  ];

  const impactTiers = [
    {
      amount: "₹500",
      rawAmount: 500,
      title: language === "te" ? "వైద్య & భోజన ప్యాక్" : language === "hi" ? "चिकित्सा एवं भोजन किट" : "Medical & Meal Pack",
      desc: language === "te" ? "ఆసుపత్రి రోగులకు 1 అవసరమైన ఔషధ కిట్ & పోషకాహార భోజనం." : language === "hi" ? "अस्पताल के मरीजों के लिए 1 आवश्यक दवा किट और पौष्टिक भोजन।" : "1 essential medicine kit & nutritious meals for hospital patients.",
      impactBadge: language === "te" ? "1 రోగికి సహాయం" : language === "hi" ? "1 मरीज की सहायता" : "1 Patient Aided",
      icon: HandHeart,
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    {
      amount: "₹1,500",
      rawAmount: 1500,
      title: language === "te" ? "ఆశ్రమ నిత్యావసర కిట్" : language === "hi" ? "आश्रम राशन किट" : "Ashramam Care Kit",
      desc: language === "te" ? "వృద్ధులకు నెలవారీ కిరాణా సరుకులు, బెడ్డింగ్ & పరిశుభ్రత కిట్." : language === "hi" ? "बुजुर्गों के लिए मासिक राशन सामग्री, बिस्तर और स्वच्छता किट।" : "Monthly grocery provisions, bedding & hygiene kits for elderly residents.",
      impactBadge: language === "te" ? "వృద్ధుల సంరక్షణ" : language === "hi" ? "बुजुर्ग देखभाल" : "Elderly Care",
      icon: ShieldCheck,
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      amount: "₹3,000",
      rawAmount: 3000,
      title: language === "te" ? "వీల్‌చైర్ & మొబిలిటీ సాయం" : language === "hi" ? "व्हीलचेयर एवं सहायता" : "Mobility & Medical Aid",
      desc: language === "te" ? "దివ్యాంగులకు వీల్‌చైర్లు, వాకర్లు & ప్రత్యేక వైద్య సంరక్షణ." : language === "hi" ? "दिव्यांगों के लिए व्हीलचेयर, वॉकर और विशेष चिकित्सा देखभाल।" : "Mobility equipment & specialized medical care in relief camps.",
      impactBadge: language === "te" ? "మొబిలిటీ సాయం" : language === "hi" ? "गतिशीलता सहायता" : "Mobility Gear",
      icon: Award,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      amount: "₹5,000+",
      rawAmount: 5000,
      title: language === "te" ? "సంపూర్ణ ఆశ్రయ స్పాన్సర్‌షిప్" : language === "hi" ? "पूर्ण आश्रय प्रायोजन" : "Sponsor a Resident",
      desc: language === "te" ? "నిరుపేద వ్యక్తికి నెల మొత్తం అవసరమైన సంరక్షణ, భోజనం & వైద్యం." : language === "hi" ? "जरूरतमंद व्यक्ति के लिए पूरे महीने की देखभाल, भोजन और इलाज।" : "Total monthly care, food & medical treatment for vulnerable individuals.",
      impactBadge: language === "te" ? "పూర్తి స్పాన్సర్‌షిప్" : language === "hi" ? "पूर्ण प्रायोजन" : "Full Sponsorship",
      icon: Star,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="relative py-6 sm:py-10">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[320px] bg-gradient-to-tr from-rose-500/10 via-purple-500/10 to-indigo-500/5 blur-3xl rounded-full -z-10"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-20">

        {/* ═══ 1. HERO ═══ */}
        <section
          id="overview"
          aria-label="NGO Overview Hero"
          className="scroll-mt-[100px] sm:scroll-mt-[120px] grid lg:grid-cols-2 gap-8 lg:gap-14 items-center"
        >
          <div className="space-y-5 sm:space-y-6 text-left">
            {/* Badges row: refined micro-pills with accessible contrast */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 shadow-xs">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/30 animate-pulse" />
                {ngoT.subtitle || "NGO • Non-Profit Organization"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>80G Tax Exempted</span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.4rem] font-black tracking-tight leading-[1.12]">
              <span className="text-slate-900 dark:text-white">
                {language === "te" ? "మానవ సేవయే," : language === "hi" ? "मानव सेवा ही," : "Serving Humanity,"}
              </span>{" "}
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 dark:from-rose-400 dark:via-pink-300 dark:to-purple-300 bg-clip-text text-transparent">
                {language === "te" ? "మాధవ సేవ" : language === "hi" ? "माधव सेवा" : "Spreading Hope"}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl font-normal">
              {ngoT.desc || "Kingdom of Christ Ministries extends its mission beyond chapel walls — delivering medical aid, food, shelter support, and rehabilitation care across Hyderabad through selfless active faith."}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href="/ngo/donations"
                className="group justify-center px-6 py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all flex items-center gap-2 text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <Gift className="w-4 h-4" />
                <span>{ngoT.supportBtn || "Support Our Cause"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/ngo/volunteers"
                className="justify-center px-6 py-3.5 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm active:scale-[0.98] transition-all flex items-center gap-2 text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{ngoT.volunteerBtn || "Join as Volunteer"}</span>
              </Link>
            </div>

            {/* Trust credentials: clean 3-col micro-strip (NOT full-width clickable buttons) */}
            <div className="pt-2 sm:pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 text-center sm:text-left">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Regd No</span>
                    <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 truncate font-mono">206/2024</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 text-center sm:text-left">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">IT Status</span>
                    <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 truncate">12A & 80G</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 text-center sm:text-left">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Direct Aid</span>
                    <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{language === "te" ? "100% ప్రత్యక్షం" : language === "hi" ? "100% प्रत्यक्ष" : "100% Field"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Banner & Leadership Certification Showcase Card */}
          <div className="space-y-3">
            <div className="relative group rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
              {/* Photo Stage with adaptive background */}
              <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-2 sm:p-3 flex items-center justify-center">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner">
                  <Image
                    src="/kcm_society_ngo.jpg"
                    alt="KCM Society NGO Registration Certificate & Leadership"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                    priority
                  />
                </div>

                {/* Subtle verified chip that does NOT overlap banner face or text */}
                <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-[11px] font-semibold shadow-lg flex items-center gap-1.5 z-10">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Govt. Verified Society</span>
                </div>
              </div>

              {/* Integrated Organization Metadata Strip */}
              <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                        {ngoT.bannerTitle || "KCM Society NGO"}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-mono">
                        Regd: 206/2024
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      Bishop Kristhuraju Kurra • Society President
                    </p>
                  </div>
                  <Link
                    href="tel:9704090069"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition-colors shadow-xs"
                    aria-label="Call KCM Society President Phone 9704090069"
                  >
                    <Phone className="w-3.5 h-3.5 text-rose-500" />
                    <span>9704090069</span>
                  </Link>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ngoT.bannerDesc || "Active social service: daily necessities, blankets, medical funds, and care programs across orphanages and clinics in Hyderabad."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 2. STATS (2x2 GRID ON MOBILE — NO ENDLESS SCROLLING) ═══ */}
        <section aria-label="Measured Humanitarian Impact" className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/40 px-3.5 py-1 rounded-full shadow-xs">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{language === "te" ? "మా సేవా ప్రభావం" : language === "hi" ? "हमारा सेवा प्रभाव" : "Our Measured Impact"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === "te" ? "వాస్తవ ఫలితాలు, మారిన జీవితాలు" : language === "hi" ? "वास्तविक परिणाम, बदले हुए जीवन" : "Real Outcomes, Real Lives Changed"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
              {language === "te" ? "తెలంగాణ అంతటా దాతల విరాళాలు మరియు 100+ వాలంటీర్ల నిరంతర సేవతో సాధ్యమవుతోంది." : language === "hi" ? "उदार दाताओं और 100+ समर्पित स्वयंसेवकों के सहयोग से संचालित।" : "Powered by generous donors and 100+ dedicated volunteers across Telangana."}
            </p>
          </div>

          {/* 2 columns on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="group relative p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center mb-2.5 sm:mb-3 shadow-xs`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-0.5">
                      {stat.value}
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm line-clamp-1">
                      {stat.label}
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {stat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ 3. 12A / 80G TRUST & TAX EXEMPTION BANNER ═══ */}
        <section
          aria-label="Government Registration and Tax Deductibility"
          className="relative overflow-hidden rounded-3xl border border-emerald-200/90 dark:border-emerald-800/70 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/25 p-5 sm:p-8 lg:p-10 shadow-lg"
        >
          <div className="relative z-10 grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="space-y-3 sm:space-y-4 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 text-xs font-semibold uppercase tracking-wider shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{language === "te" ? "పన్ను మినహాయింపు అర్హత — సెక్షన్ 80G" : language === "hi" ? "आयकर छूट योग्य — धारा 80G" : "Tax Exemption Eligible — Section 80G"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === "te" ? "12A & 80G అనుమతులు కలిగిన ప్రభుత్వ రిజిస్టర్డ్ NGO" : language === "hi" ? "12A एवं 80G स्वीकृतियों के साथ सरकारी पंजीकृत एनजीओ" : "Government Registered NGO with 12A & 80G Approvals"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {language === "te" ? "KCM సొసైటీ NGOకి ఇచ్చే అన్ని విరాళాలు ఆదాయపు పన్ను చట్టం సెక్షన్ 80G(5)(VI) కింద 50% పన్ను మినహాయింపునకు అర్హమైనవి. అధికారిక రసీదులు తక్షణమే జారీ చేయబడతాయి." : language === "hi" ? "केसीएम सोसाइटी एनजीओ को दिए गए सभी दान आयकर अधिनियम की धारा 80G के तहत कर कटौती के योग्य हैं। आधिकारिक रसीदें तुरंत जारी की जाती हैं।" : "All donations to KCM Society NGO qualify for tax deduction under Section 80G(5)(VI) of the Indian Income Tax Act. Official vouchers and 80G receipts issued automatically."}
              </p>
            </div>

            {/* Credential items: Clean 2x2 grid with unified, authoritative styling */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
              {[
                {
                  label: language === "te" ? "సొసైటీ రిజిస్ట్రేషన్" : language === "hi" ? "सोसाइटी पंजीकरण" : "Society Reg Number",
                  value: "206 / 2024",
                  icon: ShieldCheck,
                },
                {
                  label: language === "te" ? "ఐటీ సెక్షన్ ఆమోదం" : language === "hi" ? "आयकर धारा स्वीकृति" : "IT Section Approval",
                  value: "12A & 80G(5)(VI)",
                  icon: FileCheck,
                },
                {
                  label: language === "te" ? "క్షేత్ర కార్యకలాపాలు" : language === "hi" ? "कार्यक्षेत्र" : "Field Operations",
                  value: "Hyderabad, TG",
                  icon: MapPin,
                },
                {
                  label: language === "te" ? "పన్ను ప్రయోజనం" : language === "hi" ? "कर लाभ" : "Tax Benefit",
                  value: language === "te" ? "50% మినహాయింపు" : language === "hi" ? "50% छूट" : "50% Deduction",
                  icon: Award,
                  badge: true,
                },
              ].map((item, i) => {
                const CredIcon = item.icon;
                return (
                  <div
                    key={i}
                    className="p-3 sm:p-3.5 rounded-xl bg-white/90 dark:bg-slate-850/80 border border-emerald-100 dark:border-emerald-900/40 shadow-xs flex flex-col justify-between text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                        {item.label}
                      </span>
                      <CredIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold font-mono text-emerald-900 dark:text-emerald-200 truncate">
                      {item.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ 4. CORE INITIATIVES ═══ */}
        <section
          id="projects"
          aria-label="Core Humanitarian Initiatives"
          className="scroll-mt-[100px] sm:scroll-mt-[120px] space-y-6 sm:space-y-8"
        >
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/40 px-3.5 py-1 rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{language === "te" ? "మేము ఏమి చేస్తాము" : language === "hi" ? "हम क्या करते हैं" : "What We Do"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {ngoT.initiativesTitle || "Our Core Initiatives"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              {ngoT.initiativesDesc || "Four pillars of active humanitarian service — delivered consistently every month across Telangana."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {initiatives.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 text-left"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                        {item.category}
                      </span>
                    </div>
                    <div>
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${item.badgeColor} mb-2 shadow-xs`}>
                        {item.badge}
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors uppercase tracking-wider"
                    >
                      <span>{ngoT.exploreMore || "Explore Initiative"}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ 5. GIVING IMPACT TIERS (2x2 GRID ON MOBILE) ═══ */}
        <section
          id="donations"
          aria-label="Giving Impact Tiers"
          className="scroll-mt-[100px] sm:scroll-mt-[120px] rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-lg p-5 sm:p-8 lg:p-10 space-y-6 sm:space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/40 px-3.5 py-1 rounded-full shadow-xs">
                <Gift className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{language === "te" ? "మీ సహాయం చేసే మార్పు చూడండి" : language === "hi" ? "आपके दान का प्रभाव देखें" : "See What Your Gift Does"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === "te" ? "మీ విరాళ ప్రభావ శ్రేణిని ఎంచుకోండి" : language === "hi" ? "दान राशि और उसका प्रभाव चुनें" : "Select Your Giving Impact Tier"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-md">
                {language === "te" ? "మీ విరాళం క్షేత్రస్థాయిలో ఎవరికి ఎలా సహాయపడుతుందో తెలుసుకోవడానికి ఒక మొత్తాన్ని ఎంచుకోండి." : language === "hi" ? "यह जानने के लिए एक राशि चुनें कि आपका दान जमीनी स्तर पर कैसे मदद करता है।" : "Choose an amount to see exactly what your donation funds on the ground."}
              </p>
            </div>
            <Link
              href={mounted ? `/ngo/donations?amount=${impactTiers[selectedImpactIndex].rawAmount}` : "/ngo/donations"}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-md shadow-purple-500/20 active:scale-[0.98] transition-all text-sm whitespace-nowrap w-full sm:w-auto"
            >
              <span>{language === "te" ? `${impactTiers[selectedImpactIndex].amount} విరాళం ఇవ్వండి` : language === "hi" ? `${impactTiers[selectedImpactIndex].amount} दान करें` : `Donate ${impactTiers[selectedImpactIndex].amount}`}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 2x2 grid on mobile for instant side-by-side comparison */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {impactTiers.map((tier, idx) => {
              const isSelected = selectedImpactIndex === idx;
              const Icon = tier.icon;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedImpactIndex(idx)}
                  className={`text-left p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 border-purple-600 dark:border-purple-400 ring-2 ring-purple-500/20 shadow-md -translate-y-0.5"
                      : "bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${tier.iconBg} flex items-center justify-center shadow-xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className={`text-lg sm:text-2xl font-black mb-0.5 ${isSelected ? "text-purple-600 dark:text-purple-400" : "text-slate-900 dark:text-white"}`}>
                      {tier.amount}
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm mb-1 line-clamp-1">
                      {tier.title}
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 mb-2.5 line-clamp-2">
                      {tier.desc}
                    </p>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-center ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}>
                    {tier.impactBadge}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ═══ 6. MEDIA SHOWCASE ═══ */}
        <section
          id="gallery"
          aria-label="Field Transparency and Media Archive"
          className="scroll-mt-[100px] sm:scroll-mt-[120px] rounded-3xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800 shadow-lg overflow-hidden"
        >
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center p-5 sm:p-8 lg:p-10">
            <div className="space-y-4 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs font-semibold uppercase tracking-wider shadow-xs">
                <Video className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
                <span>{language === "te" ? "క్షేత్రస్థాయి పారదర్శకత" : language === "hi" ? "जमीनी पारदर्शिता" : "Real-Time Field Transparency"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {language === "te" ? "మా సేవా కార్యాలను ప్రత్యక్షంగా చూడండి" : language === "hi" ? "हमारे सेवा कार्यों को प्रत्यक्ष देखें" : "Witness Our Work in Action"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {language === "te" ? "మేము ప్రతి అన్నదానం, ఆసుపత్రి సందర్శన మరియు ఆశ్రమ సహాయ కార్యక్రమాన్ని నమోదు చేస్తాము. కొనసాగుతున్న సేవా ప్రయత్నాల ఫోటోలు మరియు హై-డెఫినిషన్ వీడియో లాగ్‌లను వీక్షించండి." : language === "hi" ? "हम हर भोजन वितरण, अस्पताल यात्रा और आश्रम सहायता कार्यक्रम का दस्तावेजीकरण करते हैं। हमारे सेवा प्रयासों के फोटो और वीडियो देखें।" : "We document every distribution drive, hospital visit, and ashramam aid program. Browse verified photo archives and high-definition video logs of ongoing humanitarian efforts."}
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <Link
                  href="/ngo/gallery"
                  className="justify-center px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold rounded-xl shadow-xs hover:border-emerald-500 transition-all flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === "te" ? "ఫోటో గ్యాలరీ చూడండి" : language === "hi" ? "फोटो गैलरी देखें" : "View Photo Gallery"}</span>
                </Link>
                <Link
                  href="/ngo/videos"
                  className="justify-center px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 text-xs sm:text-sm"
                >
                  <PlayCircle className="w-4 h-4 text-white" />
                  <span>{language === "te" ? "వీడియో లాగ్స్ చూడండి" : language === "hi" ? "वीडियो लॉग्स देखें" : "Watch Video Logs"}</span>
                </Link>
              </div>
            </div>

            {/* Media previews: 2-column cards */}
            <div
              id="videos"
              className="scroll-mt-[100px] sm:scroll-mt-[120px] grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {[
                {
                  label: language === "te" ? "ఆసుపత్రి వైద్య సహాయం" : language === "hi" ? "अस्पताल चिकित्सा सहायता" : "Hospital Medical Aid",
                  sub: "Gandhi & NIMS Hospitals",
                  image: "/gandhi_hospital_support_image.png",
                  href: "/ngo/projects/preset-gandhi",
                  Ico: ImageIcon,
                },
                {
                  label: language === "te" ? "ఆశ్రమ నిత్యావసర సేవ" : language === "hi" ? "आश्रम राशन एवं सहायता" : "Ashramam Care & Provisions",
                  sub: "Bethany Shelter Support",
                  image: "/bethany_ashramam_care_image.png",
                  href: "/ngo/projects/preset-bethany",
                  Ico: Video,
                },
              ].map(({ label, sub, image, href, Ico }, i) => (
                <Link
                  key={i}
                  href={href}
                  className="group block rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 sm:p-3 space-y-2 shadow-xs hover:shadow-md transition-all text-left"
                >
                  <div className="aspect-video rounded-xl bg-slate-900 overflow-hidden relative">
                    <Image
                      src={image}
                      alt={label}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg">
                        <Ico className="w-5 h-5 text-rose-600" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {label}
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {sub}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 7. CTA BOTTOM ═══ */}
        <section
          id="volunteers"
          aria-label="Call to Action"
          className="scroll-mt-[100px] sm:scroll-mt-[120px] relative overflow-hidden rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-r from-purple-50/80 via-white to-rose-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 shadow-lg"
        >
          <div className="relative z-10 space-y-2.5 max-w-xl text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full shadow-xs">
              <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
              <span>{ngoT.ctaHeading || "Be the Change Today"}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              {language === "te" ? "ఒకరి జీవితంలో నేరుగా మార్పు తీసుకురండి" : language === "hi" ? "किसी के जीवन में सीधा बदलाव लाएं" : "Make a Direct Difference in Someone's Life"}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              {ngoT.ctaText || "Every small action counts. Your donation funds medical supplies and food packs for government hospitals, while volunteering gives us the hands needed to deliver them."}
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
            <Link
              href="/ngo/donations"
              className="justify-center px-6 py-3 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-md shadow-purple-500/20 active:scale-95 transition-all text-sm flex items-center gap-2"
            >
              <Gift className="w-4 h-4" />
              <span>{ngoT.donateNow || "Donate Now"}</span>
            </Link>
            <Link
              href="/ngo/volunteers"
              className="justify-center px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-slate-800 dark:text-slate-100 font-bold rounded-xl shadow-xs active:scale-95 transition-all text-sm flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{ngoT.becomeVolunteer || "Become a Volunteer"}</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
