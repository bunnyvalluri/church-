"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  Eye,
  Heart,
  Users,
  BookOpen,
  Globe,
  Flame,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Search,
  X,
  ChevronRight,
  Copy,
  Check,
  Compass,
  Layers,
  HeartHandshake,
  Home,
  Printer,
  Quote
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function MissionPage() {
  const { language, t } = useLanguage();
  const pageT = (t as any)?.pages?.mission || {};

  // Filter & Search states for Core Values
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Selected item modal state
  const [selectedModalItem, setSelectedModalItem] = useState<{
    title: string;
    subtitle?: string;
    category?: string;
    desc: string;
    verse: string;
    quote?: string;
    details: string[];
    icon: any;
    accent: string;
    color: string;
    bg: string;
    badgeBg?: string;
    badgeText?: string;
    quoteBg?: string;
    quoteText?: string;
    quoteBorder?: string;
  } | null>(null);

  // Prevent background scroll and support Escape key when modal is open
  useEffect(() => {
    if (selectedModalItem !== null) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedModalItem(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [selectedModalItem]);

  // Executive Tone-on-Tone Stats (Zero Trailing Ellipsis, Clean Responsive Design)
  const stats = [
    {
      value: "1",
      label: pageT.statCalling || (language === "te" ? "ప్రధాన పిలుపు" : language === "hi" ? "मुख्य बुलाहट" : "Core Calling"),
      icon: Target,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-200/50 dark:border-purple-700/50",
      accent: "from-purple-500 to-indigo-500"
    },
    {
      value: "4",
      label: pageT.statPillars || (language === "te" ? "సేవా స్తంభాలు" : language === "hi" ? "मिशन के स्तंभ" : "Mission Pillars"),
      icon: Layers,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-200/50 dark:border-indigo-700/50",
      accent: "from-indigo-500 to-cyan-500"
    },
    {
      value: "5",
      label: pageT.statVision || (language === "te" ? "దర్శన లక్ష్యాలు" : language === "hi" ? "दृष्टिकोण लक्ष्य" : "Vision Objectives"),
      icon: Eye,
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-500/10 dark:bg-rose-500/20 border-rose-200/50 dark:border-rose-700/50",
      accent: "from-rose-500 to-pink-500"
    },
    {
      value: "6",
      label: pageT.statValues || (language === "te" ? "రాజ్య విలువలు" : language === "hi" ? "राज्य के मूल्य" : "Kingdom Values"),
      icon: Sparkles,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-200/50 dark:border-amber-700/50",
      accent: "from-amber-500 to-orange-500"
    },
  ];

  // 4 Core Mission Pillars with Tone-on-Tone Palettes
  const missionPillars = [
    {
      id: "worship",
      title: language === "te" ? "ఆరాధన" : language === "hi" ? "आराधना" : "Worship",
      subtitle: language === "te" ? "మన పూర్ణ హృదయంతో దేవుని ఆరాధించడం" : language === "hi" ? "पूर्ण हृदय से परमेश्वर की आराधना" : "God with all our hearts",
      desc: language === "te" ? "ఆత్మతోను సత్యముతోను ఉత్సాహభరితమైన స్తుతి, ప్రార్థన మరియు జీవిత సమర్పణ ద్వారా దేవుని ఘనపరచడం." : language === "hi" ? "आत्मा और सच्चाई में उत्साही स्तुति, प्रार्थना और जीवन शैली के माध्यम से परमेश्वर का आदर करना।" : "Honoring God in spirit and truth through passionate praise, prayer, and lifestyle devotion.",
      verse: "John 4:24",
      quote: language === "te" ? "దేవుడు ఆత్మయై యున్నాడు; ఆయనను ఆరాధించువారు ఆత్మతోను సత్యముతోను ఆరాధింపవలెను." : language === "hi" ? "परमेश्वर आत्मा है, और अवश्य है कि उसकी आराधना करने वाले आत्मा और सच्चाई से आराधना करें।" : "God is spirit, and his worshipers must worship in the Spirit and in truth.",
      details: language === "te" ? [
        "ఆత్మతో నిండిన ఆదివారపు సంఘ ఆరాధనలు",
        "వ్యక్తిగత రోజువారీ ప్రార్థన మరియు ఆధ్యాత్మిక సహవాసం",
        "మన ప్రతి పనిలో దేవునికి కృతజ్ఞత మరియు ఘనత చెల్లించడం",
      ] : language === "hi" ? [
        "पवित्र आत्मा से प्रेरित रविवार की कलीसियाई आराधना",
        "व्यक्तिगत दैनिक प्रार्थना और आत्मिक संगति",
        "अपने हर काम में परमेश्वर को धन्यवाद और आदर देना",
      ] : [
        "Dynamic, Spirit-led Sunday corporate worship services",
        "Cultivating personal daily devotion and intimate prayer",
        "Expressing gratitude and honor to God in all we do",
      ],
      icon: Flame,
      accent: "from-purple-500 to-indigo-500",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/60 dark:border-purple-800/60",
      badgeBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80",
      badgeText: "text-purple-700 dark:text-purple-300 font-bold",
      borderHover: "hover:border-purple-400/50 dark:hover:border-purple-600/50",
      btnHover: "hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white",
      quoteBg: "bg-purple-50/70 dark:bg-purple-950/30",
      quoteText: "text-purple-950 dark:text-purple-200",
      quoteBorder: "border-purple-400/70 dark:border-purple-800/60",
    },
    {
      id: "grow",
      title: language === "te" ? "ఎదుగుదల" : language === "hi" ? "विकास" : "Grow",
      subtitle: language === "te" ? "యేసును ప్రేమించే శిష్యులుగా మారడం" : language === "hi" ? "यीशु से प्रेम करने वाले शिष्य बनना" : "Disciples who love Jesus",
      desc: language === "te" ? "బైబిల్ బోధన మరియు శిష్యరికం ద్వారా విశ్వాసులను ఆధ్యాత్మిక పరిపక్వతకు చేర్చడం." : language === "hi" ? "बाइबिल की शिक्षा और शिष्यता के माध्यम से विश्वासियों को आत्मिक परिपक्वता तक पहुंचाना।" : "Nurturing believers to reach spiritual maturity through biblical teaching and discipleship.",
      verse: "2 Peter 3:18",
      quote: language === "te" ? "మన ప్రభువును రక్షకుడునైన యేసుక్రీస్తు అనుగ్రహమందును జ్ఞానమందును అభివృద్ధిపొందుడి." : language === "hi" ? "हमारे प्रभु और उद्धारकर्ता यीशु मसीह के अनुग्रह और ज्ञान में बढ़ते जाओ।" : "Grow in the grace and knowledge of our Lord and Savior Jesus Christ.",
      details: language === "te" ? [
        "జీవితాన్ని మార్చే వారపు బైబిల్ అధ్యయనాలు మరియు సెల్ గ్రూపులు",
        "పునాది క్రైస్తవ జీవితం కోసం శిష్యత్వ శిక్షణ",
        "విశ్వాసులు తమ ఆత్మ వరాలను గుర్తించి ఉపయోగించేలా ప్రోత్సహించడం",
      ] : language === "hi" ? [
        "जीवन बदलने वाले साप्ताहिक बाइबिल अध्ययन और सेल समूह",
        "मजबूत मसीही जीवन के लिए शिष्यता प्रशिक्षण",
        "विश्वासियो को अपने आत्मिक वरदानों को खोजने और उपयोग करने के लिए प्रेरित करना",
      ] : [
        "Weekly life-transforming Bible studies and cell groups",
        "Discipleship training for foundational Christian living",
        "Empowering members to discover and use their spiritual gifts",
      ],
      icon: BookOpen,
      accent: "from-indigo-500 to-cyan-500",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-200/60 dark:border-indigo-800/60",
      badgeBg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80",
      badgeText: "text-indigo-700 dark:text-indigo-300 font-bold",
      borderHover: "hover:border-indigo-400/50 dark:hover:border-indigo-600/50",
      btnHover: "hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white",
      quoteBg: "bg-indigo-50/70 dark:bg-indigo-950/30",
      quoteText: "text-indigo-950 dark:text-indigo-200",
      quoteBorder: "border-indigo-400/70 dark:border-indigo-800/60",
    },
    {
      id: "serve",
      title: language === "te" ? "సేవ" : language === "hi" ? "सेवा" : "Serve",
      subtitle: language === "te" ? "సమాజానికి క్రీస్తు ప్రేమతో సేవ చేయడం" : language === "hi" ? "करुणा के साथ हमारे समुदाय की सेवा" : "Our community with compassion",
      desc: language === "te" ? "ఆహార పంపిణీ, వైద్య సాయం మరియు సంరక్షణ ద్వారా క్రీస్తు ప్రేమను చేతల్లో చూపించడం." : language === "hi" ? "दान, सहायता और प्रत्यक्ष सहयोग के माध्यम से मसीह के प्रेम को प्रदर्शित करना।" : "Demonstrating Christ's love through hands-on charitable outreach, care, and practical support.",
      verse: "Galatians 5:13",
      quote: language === "te" ? "ప్రేమ కలిగి ఒకరికొకరు దాసులుగా ఉండుడి." : language === "hi" ? "प्रेम से एक दूसरे के दास बनो।" : "Serve one another humbly in love.",
      details: language === "te" ? [
        "ఆసుపత్రుల్లో ఆహార పంపిణీ, దుస్తులు మరియు ప్రాథమిక వైద్య సహాయం",
        "విధవరాండ్రు, అనాథలు మరియు పేద కుటుంబాలకు ఆసరా",
        "వివిధ సేవా విభాగాలలో చురుకుగా పనిచేసే వాలంటీర్ బృందాలు",
      ] : language === "hi" ? [
        "सामुदायिक भोजन वितरण, वस्त्र दान और चिकित्सा सहायता",
        "विधवाओं, अनाथों और जरूरतमंद परिवारों की सहायता",
        "विभिन्न सेवा विभागों में कार्यरत सक्रिय स्वयंसेवक दल",
      ] : [
        "Community food distribution, clothing drives, and medical assistance",
        "Supporting widows, orphans, and underprivileged families",
        "Active volunteer teams serving in various ministry departments",
      ],
      icon: HeartHandshake,
      accent: "from-pink-500 to-rose-500",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10 dark:bg-rose-500/20 border border-rose-200/60 dark:border-rose-800/60",
      badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80",
      badgeText: "text-rose-700 dark:text-rose-300 font-bold",
      borderHover: "hover:border-rose-400/50 dark:hover:border-rose-600/50",
      btnHover: "hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white",
      quoteBg: "bg-rose-50/70 dark:bg-rose-950/30",
      quoteText: "text-rose-950 dark:text-rose-200",
      quoteBorder: "border-rose-400/70 dark:border-rose-800/60",
    },
    {
      id: "reach",
      title: language === "te" ? "సువార్త వ్యాప్తి" : language === "hi" ? "सुसमाचार प्रचार" : "Reach",
      subtitle: language === "te" ? "నశించిన వారికి సువార్తను అందించడం" : language === "hi" ? "खोए हुओं तक सुसमाचार पहुंचाना" : "The lost with the Gospel",
      desc: language === "te" ? "హైదరాబాద్ మరియు పరిసర ప్రాంతాలలో రక్షణ సువార్తను ధైర్యంగా ప్రకటించడం." : language === "hi" ? "हैदराबाद और उससे आगे उद्धार के सुसमाचार की घोषणा करना।" : "Boldly proclaiming the Good News of salvation locally across Hyderabad and beyond.",
      verse: "Mark 16:15",
      quote: language === "te" ? "సర్వలోకమునకు వెళ్లి సర్వసృష్టికి సువార్తను ప్రకటించుడి." : language === "hi" ? "सारे जगत में जाकर सारी सृष्टि के लोगों को सुसमाचार प्रचार करो।" : "Go into all the world and preach the gospel to all creation.",
      details: language === "te" ? [
        "వీధి సువార్త, బహిరంగ సభలు మరియు గృహ దర్శనాలు",
        "కొత్త ప్రాంతాలలో ప్రార్థన సెల్స్ మరియు సహవాసాల స్థాపన",
        "డిజిటల్ మీడియా ద్వారా ప్రపంచవ్యాప్తంగా ప్రసంగాలు మరియు సాక్ష్యాల వ్యాప్తి",
      ] : language === "hi" ? [
        "सड़क प्रचार, सुसमाचार सभाएं और गृह मिलन",
        "नए क्षेत्रों में प्रार्थना सेल और संगति की स्थापना",
        "डिजिटल मीडिया के माध्यम से दुनिया भर में गवाही और संदेश साझा करना",
      ] : [
        "Street evangelism, gospel rallies, and door-to-door visits",
        "Planting prayer cells and fellowship groups in new areas",
        "Digital media outreach sharing testimony and sermons globally",
      ],
      icon: Globe,
      accent: "from-emerald-500 to-teal-500",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-200/60 dark:border-emerald-800/60",
      badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80",
      badgeText: "text-emerald-700 dark:text-emerald-300 font-bold",
      borderHover: "hover:border-emerald-400/50 dark:hover:border-emerald-600/50",
      btnHover: "hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white",
      quoteBg: "bg-emerald-50/70 dark:bg-emerald-950/30",
      quoteText: "text-emerald-950 dark:text-emerald-200",
      quoteBorder: "border-emerald-400/70 dark:border-emerald-800/60",
    },
  ];

  // 5 Vision Goals with Tone-on-Tone Palettes
  const visionGoals = [
    {
      id: "v1",
      title: language === "te" ? "ఆధ్యాత్మిక కుటుంబ సహవాసం" : language === "hi" ? "समावेशी आत्मिक परिवार" : "Inclusive Spiritual Family",
      text: language === "te" ? "ప్రతి ఒక్కరూ సమానంగా ప్రేమించబడుతూ, ఆధ్యాత్మిక గృహాన్ని కనుగొనే సమాజం." : language === "hi" ? "एक ऐसा समुदाय जहां हर कोई जुड़ाव महसूस करता है और अपना आत्मिक घर पाता है।" : "A community where everyone belongs, feels valued, and finds spiritual home.",
      verse: "Romans 12:5",
      icon: Users,
      accent: "from-purple-500 to-indigo-500",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/60 dark:border-purple-800/60",
      badgeBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80",
      borderHover: "hover:border-purple-400/50 dark:hover:border-purple-600/50",
    },
    {
      id: "v2",
      title: language === "te" ? "ఆధ్యాత్మిక పరిపక్వత & శిష్యరికం" : language === "hi" ? "आत्मिक परिपक्वता और शिष्यता" : "Spiritual Maturity & Discipleship",
      text: language === "te" ? "విశ్వాసంలో, వాక్య జ్ఞానంలో మరియు క్రీస్తు స్వభావంలో ఎదిగే విశ్వాసులు." : language === "hi" ? "विश्वासी जो विश्वास, बाइबिल के ज्ञान और मसीह जैसे चरित्र में बढ़ते हैं।" : "Believers growing in faith, biblical wisdom, and Christ-like character.",
      verse: "Ephesians 4:14-15",
      icon: BookOpen,
      accent: "from-indigo-500 to-cyan-500",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-200/60 dark:border-indigo-800/60",
      badgeBg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80",
      borderHover: "hover:border-indigo-400/50 dark:hover:border-indigo-600/50",
    },
    {
      id: "v3",
      title: language === "te" ? "బలపరచబడిన కుటుంబాలు" : language === "hi" ? "मजबूत परिवार" : "Strengthened Families",
      text: language === "te" ? "దేవుని వాక్యంలో, నిరంతర ప్రార్థనలో మరియు పరస్పర ప్రేమలో స్థిరపడిన కుటుంబాలు." : language === "hi" ? "परमेश्वर के वचन, प्रार्थना और आपसी प्रेम में स्थापित परिवार।" : "Families anchored in God's Word, prayer, and mutual love.",
      verse: "Joshua 24:15",
      icon: Heart,
      accent: "from-pink-500 to-rose-500",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10 dark:bg-rose-500/20 border border-rose-200/60 dark:border-rose-800/60",
      badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80",
      borderHover: "hover:border-rose-400/50 dark:hover:border-rose-600/50",
    },
    {
      id: "v4",
      title: language === "te" ? "రూపాంతరం చెందిన జీవితాలు" : language === "hi" ? "परिवर्तित जीवन" : "Transformed Lives",
      text: language === "te" ? "దేవుని అద్భుత శక్తి ద్వారా స్వస్థత, విమోచన మరియు నూతన నిరీక్షణ పొందిన వ్యక్తులు." : language === "hi" ? "परमेश्वर के सामर्थ्य द्वारा चंगाई, छुटकारा और नया जीवन पाने वाले लोग।" : "Lives redeemed, healed, and set free by God's supernatural power.",
      verse: "2 Corinthians 5:17",
      icon: Sparkles,
      accent: "from-amber-500 to-orange-500",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20 border border-amber-200/60 dark:border-amber-800/60",
      badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80",
      borderHover: "hover:border-amber-400/50 dark:hover:border-amber-600/50",
    },
    {
      id: "v5",
      title: language === "te" ? "పరిసరాలలో సువార్త వెలుగు" : language === "hi" ? "पड़ोस में सुसमाचार का प्रभाव" : "Gospel Impacting Neighborhoods",
      text: language === "te" ? "హైదరాబాద్ నగరంలోని ప్రతి వాడలో మరియు పరిసర ప్రాంతాలలో క్రీస్తు వెలుగు వ్యాపించడం." : language === "hi" ? "हैदराबाद और आसपास के हर कोने में मसीह की ज्योति का फैलना।" : "The light of Christ saturating every corner of Hyderabad and surrounding regions.",
      verse: "Matthew 28:19-20",
      icon: Globe,
      accent: "from-emerald-500 to-teal-500",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-200/60 dark:border-emerald-800/60",
      badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80",
      borderHover: "hover:border-emerald-400/50 dark:hover:border-emerald-600/50",
    },
  ];

  // 6 Core Values with Tone-on-Tone Palettes
  const coreValues = useMemo(
    () => [
      {
        id: "val-prayer",
        title: language === "te" ? "ప్రార్థనకు మొదటి స్థానం" : language === "hi" ? "प्रार्थना सर्वप्रथम" : "Prayer First",
        category: "spiritual",
        desc: language === "te" ? "ఏ నిర్ణయం తీసుకునే ముందైనా వ్యక్తిగత మరియు సమాజ ప్రార్థన ద్వారా దేవుని చిత్తాన్ని కోరతాము." : language === "hi" ? "किसी भी निर्णय से पहले हम व्यक्तिगत और सामूहिक प्रार्थना के माध्यम से परमेश्वर को खोजते हैं।" : "We seek God in everything through personal & corporate intercession before making any decision.",
        verse: "1 Thessalonians 5:17",
        quote: language === "te" ? "ఎడతెగక ప్రార్థనచేయుడి; ప్రతి విషయమునందును కృతజ్ఞతాస్తుతులు చెల్లించుడి." : language === "hi" ? "निरंतर प्रार्थना में लगे रहो। हर बात में धन्यवाद करो।" : "Pray continually, give thanks in all circumstances; for this is God's will for you in Christ Jesus.",
        details: language === "te" ? [
          "విశ్వాసులు మరియు అవసరంలో ఉన్నవారి కోసం 24/7 ప్రార్థన హెల్ప్‌లైన్",
          "శుక్రవారం మరియు గురువారం ప్రత్యేక సమాజ విజ్ఞాపన ప్రార్థనలు",
          "ఆధ్యాత్మిక పునరుజ్జీవనం కొరకు ఉపవాస ప్రార్థన కూటములు",
        ] : language === "hi" ? [
          "सभी विश्वासियों और साधकों के लिए 24/7 प्रार्थना हेल्पलाइन",
          "विशेष शुक्रवार और गुरुवार की सामूहिक मध्यस्थता प्रार्थना",
          "आत्मिक जागृति और छुटकारे के लिए उपवास प्रार्थना",
        ] : [
          "24/7 Prayer support helpline for all believers and seekers",
          "Special Friday & Thursday corporate intercession meetings",
          "Fast & Prayer retreats for breakthroughs and revival",
        ],
        icon: Flame,
        accent: "from-purple-500 to-indigo-500",
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/60 dark:border-purple-800/60",
        badgeBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80",
        badgeText: "text-purple-700 dark:text-purple-300 font-bold",
        borderHover: "hover:border-purple-400/50 dark:hover:border-purple-600/50",
        btnHover: "hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white",
        quoteBg: "bg-purple-50/70 dark:bg-purple-950/30",
        quoteText: "text-purple-950 dark:text-purple-200",
        quoteBorder: "border-purple-400/70 dark:border-purple-800/60",
      },
      {
        id: "val-bible",
        title: language === "te" ? "వాక్యాధారితం" : language === "hi" ? "बाइबिल आधारित" : "Bible-Based",
        category: "spiritual",
        desc: language === "te" ? "పరిశుద్ధ గ్రంథ వాక్యమే మన జీవితాలకు, బోధనలకు మరియు నాయకత్వానికి తుది ప్రామాణికం." : language === "hi" ? "पवित्र शास्त्र हमारे जीवन, शिक्षाओं और निर्णयों का अचूक मार्गदर्शन करता है।" : "Scripture guides our lives, teachings, and decision-making as the uncompromised Word of God.",
        verse: "2 Timothy 3:16",
        quote: language === "te" ? "దైవజనుడు సంపూర్ణుడై ప్రతి సత్కార్యమునకు పూర్ణముగా సిద్ధపడియుండునట్లు దైవప్రేరితమైన ప్రతి లేఖనము ఉపదేశించుటకును... ప్రయోజనకరమై యున్నది." : language === "hi" ? "हर एक पवित्र शास्त्र परमेश्वर की प्रेरणा से रचा गया है और उपदेश, और समझाने, और सुधारने के लिये लाभदायक है।" : "All Scripture is God-breathed and useful for teaching, rebuking, correcting and training in righteousness.",
        details: language === "te" ? [
          "క్రమబద్ధమైన వచనాలవారీ ప్రత్యక్షతా వాక్య బోధన",
          "దైనిందిన బైబిల్ పఠన ప్రణాళికలు మరియు కంఠస్థ వాక్యాలు",
          "సంఘ విధానాలను బైబిల్ సత్యంపై మాత్రమే నిర్మించడం",
        ] : language === "hi" ? [
          "गहन पद-दर-पद बाइबिल उपदेश",
          "दैनिक बाइबिल पठन योजनाएं और वचन स्मरण",
          "कलीसिया के सभी दिशा-निर्देशों को बाइबिल सत्य पर आधारित करना",
        ] : [
          "In-depth verse-by-verse expository preaching",
          "Structured Bible reading plans and memory verses",
          "Anchoring all church leadership guidelines in Biblical truth",
        ],
        icon: BookOpen,
        accent: "from-indigo-500 to-cyan-500",
        color: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-200/60 dark:border-indigo-800/60",
        badgeBg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80",
        badgeText: "text-indigo-700 dark:text-indigo-300 font-bold",
        borderHover: "hover:border-indigo-400/50 dark:hover:border-indigo-600/50",
        btnHover: "hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white",
        quoteBg: "bg-indigo-50/70 dark:bg-indigo-950/30",
        quoteText: "text-indigo-950 dark:text-indigo-200",
        quoteBorder: "border-indigo-400/70 dark:border-indigo-800/60",
      },
      {
        id: "val-love",
        title: language === "te" ? "ప్రేమతో నడిపించబడటం" : language === "hi" ? "प्रेम से प्रेरित" : "Love-Driven",
        category: "community",
        desc: language === "te" ? "ఎటువంటి భేదం లేకుండా ప్రతి ఒక్కరి పట్ల క్రీస్తు యొక్క షరతులు లేని త్యాగపూరిత ప్రేమను వ్యక్తపరుస్తాము." : language === "hi" ? "हम पृष्ठभूमि की परवाह किए बिना सभी के प्रति मसीह के बिना शर्त प्रेम को प्रदर्शित करते हैं।" : "We show Christ's sacrificial and unconditional love to everyone, regardless of background.",
        verse: "1 Corinthians 13:13",
        quote: language === "te" ? "విశ్వాసము, నిరీక్షణ, ప్రేమ యీ మూడూ నిలుచును; వీటిలో శ్రేష్ఠమైనది ప్రేమయే." : language === "hi" ? "पर अब विश्वास, आशा, प्रेम ये तीनों बने हैं, पर इन में सब से बड़ा प्रेम है।" : "And now these three remain: faith, hope and love. But the greatest of these is love.",
        details: language === "te" ? [
          "ప్రతి వ్యక్తిని హృదయపూర్వకంగా మరియు సమానంగా ఆహ్వానించడం",
          "పేద కుటుంబాలకు ప్రేమతో కూడిన సహాయ పరిచర్య",
          "క్షమాపణ మరియు కృపతో కూడిన వాతావరణాన్ని పెంపొందించడం",
        ] : language === "hi" ? [
          "बिना किसी भेदभाव के हर व्यक्ति का खुले दिल से स्वागत",
          "जरूरतमंद परिवारों की दयालुता से सेवा",
          "क्षमा और अनुग्रह के वातावरण को बढ़ावा देना",
        ] : [
          "Welcoming every individual with open arms and zero judgment",
          "Active compassion ministry serving needy families",
          "Fostering an atmosphere of forgiveness and grace",
        ],
        icon: Heart,
        accent: "from-pink-500 to-rose-500",
        color: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-500/10 dark:bg-rose-500/20 border border-rose-200/60 dark:border-rose-800/60",
        badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80",
        badgeText: "text-rose-700 dark:text-rose-300 font-bold",
        borderHover: "hover:border-rose-400/50 dark:hover:border-rose-600/50",
        btnHover: "hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white",
        quoteBg: "bg-rose-50/70 dark:bg-rose-950/30",
        quoteText: "text-rose-950 dark:text-rose-200",
        quoteBorder: "border-rose-400/70 dark:border-rose-800/60",
      },
      {
        id: "val-community",
        title: language === "te" ? "సమాజ కేంద్రీకృతం" : language === "hi" ? "समुदाय-केंद्रित" : "Community-Focused",
        category: "community",
        desc: language === "te" ? "కలిసికట్టుగా జీవిస్తూ, వాస్తవిక సంబంధాలను ఏర్పరచుకుంటూ విశ్వాసంలో ఒకరికొకరు తోడ్పడతాము." : language === "hi" ? "हम एक साथ जीवन जीते हैं, सच्चे रिश्ते बनाते हैं और विश्वास में एक-दूसरे का समर्थन करते हैं।" : "We do life together, building authentic relationships and supporting one another in faith.",
        verse: "Acts 2:42",
        quote: language === "te" ? "వీరు అపొస్తలుల బోధయందును సహవాసమందును రొట్టె విరుచుటయందును ప్రార్థన చేయుటయందును ఎడతెగక యుండిరి." : language === "hi" ? "और वे प्रेरितों से शिक्षा पाने, और संगति रखने, और रोटी तोड़ने, और प्रार्थना करने में लौलीन रहे।" : "They devoted themselves to the apostles' teaching and to fellowship, to the breaking of bread and to prayer.",
        details: language === "te" ? [
          "హైదరాబాద్ అంతటా క్రమం తప్పకుండా జరిగే సెల్ గ్రూప్ కూటములు",
          "సహవాస విందులు, కుటుంబ కూటములు మరియు యువజన సదస్సులు",
          "కష్టాలలో మరియు సంతోషాలలో ఒకరినొకరు ప్రోత్సహించుకోవడం",
        ] : language === "hi" ? [
          "हैदराबाद में नियमित रूप से मिलने वाले छोटे सेल समूह",
          "संगति भोजन, पारिवारिक कार्यक्रम और युवा सम्मेलन",
          "जीवन की चुनौतियों और खुशियों में एक दूसरे का हौसला बढ़ाना",
        ] : [
          "Small cell groups meeting regularly across Hyderabad",
          "Fellowship meals, family events, and youth retreats",
          "Mutual encouragement during life challenges and celebrations",
        ],
        icon: Users,
        accent: "from-emerald-500 to-teal-500",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-200/60 dark:border-emerald-800/60",
        badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80",
        badgeText: "text-emerald-700 dark:text-emerald-300 font-bold",
        borderHover: "hover:border-emerald-400/50 dark:hover:border-emerald-600/50",
        btnHover: "hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white",
        quoteBg: "bg-emerald-50/70 dark:bg-emerald-950/30",
        quoteText: "text-emerald-950 dark:text-emerald-200",
        quoteBorder: "border-emerald-400/70 dark:border-emerald-800/60",
      },
      {
        id: "val-mission",
        title: language === "te" ? "సువార్త దృక్పథం" : language === "hi" ? "मिशन-केंद्रित" : "Mission-Minded",
        category: "outreach",
        desc: language === "te" ? "మన నగరంలో, రాష్ట్రంలో మరియు ప్రపంచంలో క్రీస్తు నిరీక్షణను అందరికీ పంచుతాము." : language === "hi" ? "हम अपने शहर, देश और दुनिया में मसीह की आशा को बांटते हैं।" : "We reach the lost and share the hope of Christ in our city, nation, and beyond.",
        verse: "Mark 16:15",
        quote: language === "te" ? "సర్వలోకమునకు వెళ్లి సర్వసృష్టికి సువార్తను ప్రకటించుడి." : language === "hi" ? "सारे जगत में जाकर सारी सृष्टि के लोगों को सुसमाचार प्रचार करो।" : "Go into all the world and preach the gospel to all creation.",
        details: language === "te" ? [
          "షాపూర్, సుభాష్ నగర్ మరియు బహదూర్‌పల్లిలలో పరిసర ప్రాంత సువార్త పరిచర్యలు",
          "స్వదేశీ సువార్తికులకు మరియు మిషన్ విస్తరణకు మద్దతు",
          "యువజన మిషన్ యాత్రలు మరియు సమాజ అవగాహన ర్యాలీలు",
        ] : language === "hi" ? [
          "शापुर, सुभाष नगर और बहादुरपल्ली में स्थानीय आउटरीच कार्यक्रम",
          "सुसमाचार प्रचारकों और मिशन विस्तार का समर्थन",
          "युवा मिशन यात्राएं और सामाजिक जागरूकता अभियान",
        ] : [
          "Local neighborhood outreach programs in Shapur, Subhash Nagar, and Bahadurpally",
          "Supporting native evangelists and mission expansion",
          "Youth mission trips and community awareness rallies",
        ],
        icon: Globe,
        accent: "from-amber-500 to-orange-500",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10 dark:bg-amber-500/20 border border-amber-200/60 dark:border-amber-800/60",
        badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80",
        badgeText: "text-amber-700 dark:text-amber-300 font-bold",
        borderHover: "hover:border-amber-400/50 dark:hover:border-amber-600/50",
        btnHover: "hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white",
        quoteBg: "bg-amber-50/70 dark:bg-amber-950/30",
        quoteText: "text-amber-950 dark:text-amber-200",
        quoteBorder: "border-amber-400/70 dark:border-amber-800/60",
      },
      {
        id: "val-spirit",
        title: language === "te" ? "ఆత్మానుసార బలం" : language === "hi" ? "आत्मा से सामर्थी" : "Spirit-Empowered",
        category: "spiritual",
        desc: language === "te" ? "ప్రతి పరిచర్యలోను పరిశుద్ధాత్మ దేవుని నడిపింపు, కృపావరాలు మరియు అద్భుత శక్తిపై ఆధారపడతాము." : language === "hi" ? "हम हर सेवा में पवित्र आत्मा के मार्गदर्शन, वरदानों और अलौकिक सामर्थ्य पर निर्भर करते हैं।" : "We depend on the Holy Spirit's guidance, gifts, and supernatural power in every ministry endeavor.",
        verse: "Acts 1:8",
        quote: language === "te" ? "పరిశుద్ధాత్మ మీ మీదికి వచ్చునప్పుడు మీరు శక్తినొందెదరు; మీరు నాకు సాక్షులై యుందురు." : language === "hi" ? "परन्तु जब पवित्र आत्मा तुम पर आएगा तब तुम सामर्थ पाओगे; और मेरे गवाह होगे।" : "But you will receive power when the Holy Spirit comes on you; and you will be my witnesses.",
        details: language === "te" ? [
          "సంఘ క్షేమాభివృద్ధి కొరకు ఆత్మ వరాలను ఉపయోగించడం",
          "దైవిక స్వస్థత, విడుదల మరియు అద్భుతాల కొరకు ప్రార్థన",
          "పరిచర్య ప్రణాళికలలో పరిశుద్ధాత్మ ప్రేరణలను వినడం",
        ] : language === "hi" ? [
          "कलीसिया की उन्नति के लिए आत्मिक वरदानों को प्रोत्साहित करना",
          "दैवीय चंगाई, छुटकारे और सफलताओं के लिए प्रार्थना",
          "सेवा की योजनाओं में पवित्र आत्मा की आवाज को सुनना",
        ] : [
          "Encouraging spiritual gifts for the edification of the Church",
          "Praying for divine healing, deliverance, and breakthroughs",
          "Listening for the Holy Spirit's promptings in ministry planning",
        ],
        icon: Sparkles,
        accent: "from-purple-500 to-pink-500",
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/60 dark:border-purple-800/60",
        badgeBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80",
        badgeText: "text-purple-700 dark:text-purple-300 font-bold",
        borderHover: "hover:border-purple-400/50 dark:hover:border-purple-600/50",
        btnHover: "hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white",
        quoteBg: "bg-purple-50/70 dark:bg-purple-950/30",
        quoteText: "text-purple-950 dark:text-purple-200",
        quoteBorder: "border-purple-400/70 dark:border-purple-800/60",
      },
    ],
    [language]
  );

  // Filtered Core Values
  const filteredCoreValues = useMemo(() => {
    return coreValues.filter((val) => {
      const matchesCategory = selectedCategory === "all" || val.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        val.title.toLowerCase().includes(query) ||
        val.desc.toLowerCase().includes(query) ||
        val.verse.toLowerCase().includes(query) ||
        val.quote.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [coreValues, selectedCategory, searchQuery]);

  // Copy Mission Statement summary
  const handleCopyMission = () => {
    const missionMotto =
      language === "te"
        ? '"క్రీస్తును తెలుసుకోవడం మరియు ఆయనను ఇతరులకు తెలియజేయడం"'
        : language === "hi"
        ? '"मसीह को जानना और उन्हें सभी को बताना"'
        : '"To know Christ and make Him known"';

    const visionStatement =
      language === "te"
        ? '"క్రీస్తు ద్వారా ప్రతి వ్యక్తి రూపాంతరం పొందే సంఘం"'
        : language === "hi"
        ? '"एक ऐसी कलीसिया जहां हर व्यक्ति मसीह के द्वारा रूपांतरण का अनुभव करे"'
        : '"A church where every person experiences transformation through Christ"';

    const textToCopy = `KINGDOM OF CHRIST MINISTRIES - MISSION & VISION\n\n` +
      `Mission: ${missionMotto}\n` +
      `Vision: ${visionStatement}\n\n` +
      `Core Values:\n` +
      coreValues.map((v, i) => `${i + 1}. ${v.title} (${v.verse}): ${v.desc}`).join("\n") +
      `\n\nKingdom of Christ Ministries | Hyderabad, Telangana`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Print or Save as PDF
  const handlePrintMission = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const mottoText =
    pageT.mottoText ||
    (language === "te"
      ? '"క్రీస్తును తెలుసుకోవడం మరియు ఆయనను ఇతరులకు తెలియజేయడం"'
      : language === "hi"
      ? '"मसीह को जानना और उन्हें सभी को बताना"'
      : '"To know Christ and make Him known"');

  const visionBannerText =
    language === "te"
      ? '"క్రీస్తు ద్వారా ప్రతి వ్యక్తి రూపాంతరం పొందే సంఘం"'
      : language === "hi"
      ? '"एक ऐसी कलीसिया जहां हर व्यक्ति मसीह के द्वारा रूपांतरण का अनुभव करे"'
      : '"A church where every person experiences transformation through Christ"';

  const categoryTabs = [
    { id: "all", label: pageT.filterAll || (language === "te" ? "అన్ని విలువలు" : language === "hi" ? "सभी मूल्य" : "All Values") },
    { id: "spiritual", label: pageT.filterSpiritual || (language === "te" ? "ఆధ్యాత్మిక పునాదులు" : language === "hi" ? "आत्मिक आधार" : "Spiritual Foundations") },
    { id: "community", label: pageT.filterCommunity || (language === "te" ? "సహవాసం & ప్రేమ" : language === "hi" ? "समुदाय और प्रेम" : "Community & Love") },
    { id: "outreach", label: pageT.filterOutreach || (language === "te" ? "సువార్త & మిషన్" : language === "hi" ? "आउटरीच और मिशन" : "Outreach & Mission") },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* 🌌 Hero Section — Continuous Ambient Gradient Flow (No cutting bottom seam) */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 md:pt-44 md:pb-28 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-25 dark:opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Inline Breadcrumb Navigation (Replaces Stacked Home Button) */}
            <nav aria-label="Breadcrumb" className="mb-5 flex justify-center">
              <ol className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-purple-200/60 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-xs">
                <li className="inline-flex items-center">
                  <Link href="/" className="inline-flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <Home className="h-3.5 w-3.5" />
                    <span>{pageT.breadcrumbHome || "Home"}</span>
                  </Link>
                </li>
                <li className="flex items-center text-slate-400 dark:text-slate-600">/</li>
                <li className="inline-flex items-center">
                  <Link href="/about" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {pageT.breadcrumbAbout || "About"}
                  </Link>
                </li>
                <li className="flex items-center text-slate-400 dark:text-slate-600">/</li>
                <li className="text-purple-700 dark:text-purple-300 font-bold truncate max-w-[140px] sm:max-w-none">
                  {pageT.breadcrumbCurrent || "Mission & Vision"}
                </li>
              </ol>
            </nav>

            {/* Purposeful Section Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/10 dark:bg-purple-500/20 border border-purple-300/40 dark:border-purple-500/30 rounded-full text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-bold tracking-wide mb-5 backdrop-blur-md animate-fade-in-up">
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>{pageT.badge || (language === "te" ? "మిషన్, దర్శనం & ప్రాథమిక విలువలు" : language === "hi" ? "मिशन, दृष्टिकोण और मूल मूल्य" : "Mission, Vision & Core Values")}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight animate-fade-in-up animate-delay-100">
              {pageT.heroTitle || (language === "te" ? "మా ఉద్దేశ్యం & గమ్యం" : language === "hi" ? "हमारा उद्देश्य और दिशा" : "Our Purpose & Direction")}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 animate-fade-in-up animate-delay-200 font-medium max-w-2xl mx-auto leading-relaxed mb-6">
              {pageT.heroSubtitle || (language === "te" ? "వాక్యంతో నడిపించబడుతూ, ప్రేమతో ప్రేరేపించబడి, పరిశుద్ధాత్మ శక్తితో నింపబడుట." : language === "hi" ? "पवित्र शास्त्र द्वारा निर्देशित, प्रेम से प्रेरित, पवित्र आत्मा से सामर्थी।" : "Guided by Holy Scripture, Motivated by Love, Empowered by the Holy Spirit.")}
            </p>

            {/* Section Quick Navigation Anchor Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4">
              <a
                href="#mission"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-purple-200/70 dark:border-purple-800/60 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 shadow-xs transition-all active:scale-95"
              >
                <Target className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>{pageT.missionHeading || "Our Mission"}</span>
              </a>
              <a
                href="#vision"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-200/70 dark:border-indigo-800/60 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 shadow-xs transition-all active:scale-95"
              >
                <Eye className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{pageT.visionHeading || "Our Vision"}</span>
              </a>
              <a
                href="#values"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200/70 dark:border-amber-800/60 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 shadow-xs transition-all active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>{pageT.valuesHeading || "Core Values"}</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 📊 Tone-on-Tone Floating Stats Bar (No Slicing Dividing Seam, Zero Truncation) */}
      <section className="relative z-20 -mt-10 sm:-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group overflow-hidden"
              >
                {/* Subtle Top Accent Ribbon */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${stat.accent} opacity-75 group-hover:opacity-100 transition-opacity`} />

                {/* Tone-on-Tone Icon Container */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 ${stat.iconBg} border rounded-xl sm:rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconColor}`} />
                </div>

                {/* Metric Value */}
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                  {stat.value}
                </div>

                {/* Metric Label — Zero broken ellipsis or awkward truncation */}
                <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🎯 Section 1: Our Mission */}
      <section id="mission" className="py-16 sm:py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
              <Target className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>{pageT.mandateBadge || (language === "te" ? "మా ప్రధాన కర్తవ్యం" : language === "hi" ? "हमारा मुख्य कर्तव्य" : "Our Primary Mandate")}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
              {pageT.missionHeading || (language === "te" ? "మా మిషన్" : language === "hi" ? "हमारा मिशन" : "Our Mission")}
            </h2>

            {/* Executive Mission Statement Card — Tone-on-Tone Glassmorphism, Zero Solid Bricks */}
            <div className="relative max-w-2xl mx-auto p-6 sm:p-8 bg-gradient-to-r from-purple-50/80 via-white/95 to-indigo-50/80 dark:from-slate-900/90 dark:via-purple-950/30 dark:to-slate-900/90 border border-purple-200/70 dark:border-purple-800/60 rounded-3xl shadow-xl shadow-purple-950/5 dark:shadow-black/25 backdrop-blur-xl overflow-hidden group mb-6">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 opacity-80" />
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center">
                <Quote className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500 dark:text-purple-400 mb-3 opacity-75" />
                <p className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-relaxed font-outfit">
                  {mottoText}
                </p>
                <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mt-4 mb-2 opacity-60" />
                <span className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {language === "te" ? "క్రీస్తు సువార్తను ప్రకటించడం & శిష్యులను చేయడం" : language === "hi" ? "मसीह के सुसमाचार का प्रचार करना और चेला बनाना" : "Proclaiming the Gospel & Making Disciples"}
                </span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              {language === "te"
                ? "కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్‌గా మేము చేసే ప్రతి పరిచర్య ఈ ఏకైక నిబద్ధత నుండే ఉద్భవిస్తుంది: యేసుతో మన సంబంధాన్ని బలపరుచుకోవడం మరియు ఆయన రక్షణను అందరికీ అందించడం."
                : language === "hi"
                ? "किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज के रूप में हम जो कुछ भी करते हैं वह इसी प्रतिबद्धता से निकलता है: यीशु के साथ अपने संबंध को गहरा करना और उनके उद्धार को सभी तक पहुंचाना।"
                : "Everything we do as Kingdom of Christ Ministries flows from this singular commitment: deepening our relationship with Jesus and bringing His salvation to our neighbors and the world."}
            </p>
          </div>

          {/* 4 Mission Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {missionPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  className={`relative group bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/25 border border-slate-200/80 dark:border-slate-800 ${pillar.borderHover} transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden text-left`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${pillar.accent}`} />

                  <div>
                    {/* Top Header: Tone-on-tone Icon & Scripture Badge */}
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 ${pillar.bg} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs`}>
                        <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${pillar.color}`} />
                      </div>
                      <span className={`text-xs font-bold ${pillar.badgeText} ${pillar.badgeBg} px-3 py-1 rounded-full shadow-2xs`}>
                        {pillar.verse}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className={`text-xs sm:text-sm font-bold ${pillar.color} mb-3`}>
                      {pillar.subtitle}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                      {pillar.desc}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedModalItem({
                        title: pillar.title,
                        subtitle: pillar.subtitle,
                        desc: pillar.desc,
                        verse: pillar.verse,
                        quote: pillar.quote,
                        details: pillar.details,
                        icon: pillar.icon,
                        accent: pillar.accent,
                        color: pillar.color,
                        bg: pillar.bg,
                        quoteBg: pillar.quoteBg,
                        quoteText: pillar.quoteText,
                        quoteBorder: pillar.quoteBorder,
                      })
                    }
                    className="w-full py-2.5 px-4 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-bold rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 group/btn border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md active:scale-[0.99]"
                  >
                    <span>{pageT.detailsBtn || (language === "te" ? "స్తంభం వివరాలు" : language === "hi" ? "स्तंभ विवरण" : "Pillar Details")}</span>
                    <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 👁️ Section 2: Our Vision */}
      <section id="vision" className="py-16 sm:py-24 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs backdrop-blur-md">
              <Eye className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{pageT.futureBadge || (language === "te" ? "మా భవిష్యత్ దర్శనం" : language === "hi" ? "हमारा भविष्य का दर्शन" : "Our Future Picture")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
              {pageT.visionHeading || (language === "te" ? "మా దర్శనం" : language === "hi" ? "हमारा दृष्टिकोण" : "Our Vision")}
            </h2>

            {/* Executive Vision Statement Card — Tone-on-Tone Glassmorphic Centerpiece */}
            <div className="relative max-w-2xl mx-auto p-6 sm:p-8 bg-gradient-to-r from-indigo-50/80 via-white/95 to-purple-50/80 dark:from-slate-900/90 dark:via-indigo-950/30 dark:to-slate-900/90 border border-indigo-200/70 dark:border-indigo-800/60 rounded-3xl shadow-xl shadow-indigo-950/5 dark:shadow-black/25 backdrop-blur-xl overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-80" />
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center">
                <Quote className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-500 dark:text-indigo-400 mb-3 opacity-75" />
                <p className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-relaxed font-outfit">
                  {visionBannerText}
                </p>
                <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-4 mb-2 opacity-60" />
                <span className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {pageT.visionSubtext || (language === "te" ? "క్రీస్తు ద్వారా రూపాంతరం చెందే సమాజం" : language === "hi" ? "मसीह के द्वारा रूपांतरित समाज" : "Transforming lives and communities through Jesus Christ")}
                </span>
              </div>
            </div>
          </div>

          {/* Vision Objectives List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
            {visionGoals.map((goal) => {
              const Icon = goal.icon;
              return (
                <div
                  key={goal.id}
                  className={`relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 ${goal.borderHover} hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between group overflow-hidden text-left`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${goal.accent}`} />

                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4 mt-1">
                      <div className={`w-12 h-12 ${goal.bg} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs`}>
                        <Icon className={`h-6 w-6 ${goal.color}`} />
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${goal.badgeBg} rounded-full text-xs font-bold shadow-2xs`}>
                        <CheckCircle2 className={`h-3.5 w-3.5 ${goal.color}`} />
                        <span>{goal.verse}</span>
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                      {goal.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                      {goal.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🌟 Section 3: Core Values with Search & Filter Track */}
      <section id="values" className="py-16 sm:py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/15 border border-amber-300/40 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>{pageT.livingBadge || (language === "te" ? "దైనిందిన జీవితంలో సువార్త" : language === "hi" ? "दैनिक जीवन में सुसमाचार" : "Living the Gospel Daily")}</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              {pageT.valuesHeading || (language === "te" ? "రాజ్య ప్రాథమిక విలువలు" : language === "hi" ? "राज्य के मूल मूल्य" : "Core Values")}
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg font-medium">
              {language === "te"
                ? "మన ఆరాధన, సంస్కృతి మరియు సమాజ సహవాసాన్ని నడిపించే తిరుగులేని ఆధ్యాత్మిక ప్రమాణాలు."
                : language === "hi"
                ? "हमारी आराधना, संस्कृति और सामुदायिक सहभागिता को आकार देने वाले आध्यात्मिक मानक।"
                : "The non-negotiable spiritual standards that shape our worship, culture, and community interaction."}
            </p>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="max-w-3xl mx-auto mb-10 space-y-4">
            
            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={pageT.searchPlaceholder || (language === "te" ? "విలువలు లేదా వాక్యాలను శోధించండి..." : language === "hi" ? "मूल्य या वचन खोजें..." : "Search values or scripture...")}
                className="w-full pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Tabs (Mobile Ergonomic Horizontal Swipe Track — Zero Ragged Wrapping) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 sm:justify-center flex-nowrap">
              {categoryTabs.map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-[1.02]"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Values Grid */}
          {filteredCoreValues.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl mx-auto p-6 shadow-sm">
              <Sparkles className="h-12 w-12 text-slate-400 mx-auto mb-4 opacity-60" />
              <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                {pageT.noResultsTitle || "No core values found matching"} "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-4 px-5 py-2.5 bg-purple-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-purple-700 active:scale-95 transition-all shadow-md shadow-purple-600/20"
              >
                {pageT.resetFilter || "Reset Search Filters"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredCoreValues.map((val) => {
                const Icon = val.icon;
                return (
                  <div
                    key={val.id}
                    className={`relative group bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 ${val.borderHover} transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden text-left`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${val.accent}`} />

                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4 mt-1">
                        <div className={`w-12 h-12 ${val.bg} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs`}>
                          <Icon className={`h-6 w-6 ${val.color}`} />
                        </div>
                        <span className={`text-xs font-bold ${val.badgeText} ${val.badgeBg} px-3 py-1 rounded-full shadow-2xs`}>
                          {val.verse}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                        {val.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                        {val.desc}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setSelectedModalItem({
                          title: val.title,
                          category: val.category,
                          desc: val.desc,
                          verse: val.verse,
                          quote: val.quote,
                          details: val.details,
                          icon: val.icon,
                          accent: val.accent,
                          color: val.color,
                          bg: val.bg,
                          quoteBg: val.quoteBg,
                          quoteText: val.quoteText,
                          quoteBorder: val.quoteBorder,
                        })
                      }
                      className={`w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800/80 ${val.btnHover} text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 group/btn shadow-2xs active:scale-[0.99]`}
                    >
                      <span>{pageT.deepDiveBtn || (language === "te" ? "పూర్తి వివరణ & వాక్యాలు" : language === "hi" ? "गहन विवरण और वचन" : "Deep Dive & Verses")}</span>
                      <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 📄 Downloadable / Copy Statement Section (Dual Actions: Copy + Print/Save PDF) */}
      <section className="py-16 sm:py-24 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-900/5 via-slate-900/5 to-indigo-900/5 dark:from-purple-950/40 dark:via-slate-900/60 dark:to-indigo-950/40 border border-purple-200/60 dark:border-purple-800/40 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Compass className="h-3.5 w-3.5" />
                  <span>{pageT.shareBadge || (language === "te" ? "సారాంశం & భాగస్వామ్యం" : language === "hi" ? "सारांश और साझाकरण" : "Summary & Sharing")}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {pageT.shareTitle || (language === "te" ? "మా మిషన్ & దర్శనాన్ని పంచుకోండి" : language === "hi" ? "हमारा मिशन और दृष्टिकोण साझा करें" : "Share Our Mission & Vision")}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed font-normal">
                  {pageT.shareDesc || (language === "te"
                    ? "గ్రూప్ అధ్యయనం, వ్యక్తిగత ధ్యానం లేదా స్నేహితులతో పంచుకోవడానికి మా మిషన్, దర్శనం మరియు ప్రాథమిక విలువల సారాంశాన్ని కాపీ చేయండి లేదా ప్రింట్ చేయండి."
                    : language === "hi"
                    ? "समूह अध्ययन, व्यक्तिगत मनन या मित्रों के साथ साझा करने के लिए हमारे मिशन, विज़न और मूल मूल्यों का सारांश कॉपी या प्रिंट करें।"
                    : "Copy or print our complete Mission, Vision & Core Values statement for group study, personal reflection, or sharing with friends.")}
                </p>
              </div>

              {/* Dual Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={handleCopyMission}
                  className="w-full sm:w-auto px-5 py-3 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" />
                      <span>{pageT.copiedToast || (language === "te" ? "కాపీ చేయబడింది!" : language === "hi" ? "कॉपी किया गया!" : "Copied to Clipboard!")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>{pageT.copyStatement || (language === "te" ? "సారాంశాన్ని కాపీ చేయండి" : language === "hi" ? "सारांश कॉपी करें" : "Copy Summary Statement")}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrintMission}
                  className="w-full sm:w-auto px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-95 font-bold rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span>{pageT.printStatement || (language === "te" ? "ప్రింట్ / సేవ్ PDF" : language === "hi" ? "प्रिंट / सेव PDF" : "Print / Save PDF")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 Call To Action (CTA) Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden text-white border-t border-slate-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/10 border border-purple-400/30 text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>{pageT.ctaBadge || (language === "te" ? "దైవిక సంకల్పంలోకి అడుగుపెట్టండి" : language === "hi" ? "ईश्वरीय उद्देश्य में कदम रखें" : "Step Into Purpose")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              {pageT.ctaHeading || (language === "te" ? "నేడే మా మిషన్‌లో చేరండి" : language === "hi" ? "आज ही हमारे मिशन से जुड़ें" : "Join Our Mission Today")}
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-normal mb-8 leading-relaxed max-w-2xl mx-auto">
              {pageT.ctaDesc || (language === "te"
                ? "గొప్ప లక్ష్యంలో భాగస్వాములు కండి. ఆత్మీయ సహవాసాన్ని అనుభవిస్తూ, విశ్వాసంలో ఎదుగుతూ హైదరాబాద్ అంతటా శాశ్వత ప్రభావం చూపించండి."
                : language === "hi"
                ? "किसी महान उद्देश्य का हिस्सा बनें। आत्मिक संगति का अनुभव करें, विश्वास में बढ़ें और हैदराबाद में एक स्थायी प्रभाव छोड़ें।"
                : "Be part of something greater. Experience fellowship, grow in faith, and make a lasting impact across Hyderabad.")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-center">
              <Link
                href="/membership"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-xl shadow-purple-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base text-center"
              >
                <span>{pageT.ctaMember || (language === "te" ? "సభ్యత్వాన్ని పొందండి" : language === "hi" ? "सदस्य बनें" : "Become a Member")}</span>
              </Link>

              <Link
                href="/about/story"
                className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white border border-white/20 backdrop-blur-md rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base text-center"
              >
                <span>{pageT.ctaStory || (language === "te" ? "మా చరిత్ర" : language === "hi" ? "हमारी कहानी" : "Our Story")}</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/about/beliefs"
                className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white border border-white/20 backdrop-blur-md rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base text-center"
              >
                <span>{pageT.ctaBeliefs || (language === "te" ? "మా విశ్వాసాలు" : language === "hi" ? "हमारे विश्वास" : "Our Beliefs")}</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📖 Deep Dive Detail Modal */}
      {selectedModalItem && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedModalItem(null);
          }}
          className="fixed inset-0 z-[10005] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mission-modal-title"
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90dvh] flex flex-col animate-scale-in"
          >
            {/* Modal Header */}
            <div className={`p-5 sm:p-6 md:p-7 bg-gradient-to-r ${selectedModalItem.accent} text-white relative shrink-0 z-10 pr-14 sm:pr-16 shadow-sm`}>
              <button
                onClick={() => setSelectedModalItem(null)}
                aria-label="Close modal"
                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 bg-black/25 hover:bg-black/40 active:scale-95 rounded-xl text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wide mb-2.5 border border-white/20 shadow-xs">
                <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{selectedModalItem.verse}</span>
              </div>

              <h3 id="mission-modal-title" className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                {selectedModalItem.title}
              </h3>

              {selectedModalItem.subtitle && (
                <p className="text-white/90 text-xs sm:text-sm font-semibold mt-1 leading-snug">
                  {selectedModalItem.subtitle}
                </p>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 md:p-8 overflow-y-auto space-y-4 sm:space-y-6 text-slate-700 dark:text-slate-300 text-left flex-1 overscroll-contain">
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider ${selectedModalItem.color || 'text-purple-600 dark:text-purple-400'} mb-2`}>
                  {language === "te" ? "పరిచర్య లక్ష్యం & ప్రాముఖ్యత" : language === "hi" ? "अवलोकन और उद्देश्य" : "Overview & Purpose"}
                </h4>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed font-normal">
                  {selectedModalItem.desc}
                </p>
              </div>

              {selectedModalItem.quote && (
                <div className={`p-4 sm:p-5 ${selectedModalItem.quoteBg || 'bg-purple-50/70 dark:bg-purple-950/30'} rounded-2xl border-l-4 ${selectedModalItem.quoteBorder || 'border-purple-500'}`}>
                  <p className={`text-xs sm:text-sm md:text-base italic font-medium leading-relaxed ${selectedModalItem.quoteText || 'text-purple-950 dark:text-purple-200'}`}>
                    "{selectedModalItem.quote}"
                  </p>
                </div>
              )}

              {selectedModalItem.details && selectedModalItem.details.length > 0 && (
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${selectedModalItem.color || 'text-purple-600 dark:text-purple-400'} mb-3`}>
                    {language === "te" ? "ఆచరణాత్మక జీవితం & పరిచర్య ప్రణాళిక" : language === "hi" ? "व्यावहारिक जीवन और सेवा कार्य" : "Practical Living & Ministry Action"}
                  </h4>
                  <div className="space-y-2.5">
                    {selectedModalItem.details.map((item: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start sm:items-center gap-3 p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
                      >
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0 z-10">
              <button
                onClick={() => setSelectedModalItem(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-purple-600/20 cursor-pointer"
              >
                {pageT.modalClose || (language === "te" ? "మూసివేయి" : language === "hi" ? "बंद करें" : "Close")}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
