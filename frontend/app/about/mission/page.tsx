"use client";

import { useState, useMemo } from "react";
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
  HeartHandshake
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
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
    category?: string;
    desc: string;
    verse: string;
    quote?: string;
    details: string[];
    icon: any;
    accent: string;
    color: string;
    bg: string;
    quoteBg?: string;
    quoteText?: string;
    quoteBorder?: string;
  } | null>(null);

  // Stats Data
  const stats = [
    {
      value: "1",
      label: language === "te" ? "ప్రధాన పిలుపు" : language === "hi" ? "मुख्य बुलाहट" : "Core Calling",
      subtext: language === "te" ? "క్రీస్తును తెలుసుకోవడం & ప్రకటించడం" : language === "hi" ? "मसीह को जानना और बताना" : "To Know Christ & Make Him Known",
      icon: Target,
      color: "text-white",
      bg: "bg-purple-600 shadow-md shadow-purple-600/30",
    },
    {
      value: "4",
      label: language === "te" ? "సేవా స్తంభాలు" : language === "hi" ? "मिशन के स्तंभ" : "Mission Pillars",
      subtext: language === "te" ? "ఆరాధన • ఎదుగుదల • సేవ • సువార్త" : language === "hi" ? "आराधना • विकास • सेवा • सुसमाचार" : "Worship • Grow • Serve • Reach",
      icon: Layers,
      color: "text-white",
      bg: "bg-indigo-600 shadow-md shadow-indigo-600/30",
    },
    {
      value: "5",
      label: language === "te" ? "దర్శన లక్ష్యాలు" : language === "hi" ? "दृष्टिकोण लक्ष्य" : "Vision Objectives",
      subtext: language === "te" ? "హైదరాబాద్ అంతటా జీవితాల మార్పు" : language === "hi" ? "हैदराबाद में जीवन परिवर्तन" : "Transforming Lives Across Hyderabad",
      icon: Eye,
      color: "text-white",
      bg: "bg-pink-600 shadow-md shadow-pink-600/30",
    },
    {
      value: "6",
      label: language === "te" ? "రాజ్య ప్రాథమిక విలువలు" : language === "hi" ? "राज्य के मूल मूल्य" : "Kingdom Core Values",
      subtext: language === "te" ? "శాశ్వత సత్యంలో స్థిరమైనవి" : language === "hi" ? "शाश्वत सत्य में स्थापित" : "Anchored in Eternal Truth",
      icon: Sparkles,
      color: "text-white",
      bg: "bg-amber-600 shadow-md shadow-amber-600/30",
    },
  ];

  // Mission Pillars
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
      color: "text-white",
      bg: "bg-purple-600 shadow-md shadow-purple-600/30",
      badgeBg: "bg-purple-600 border border-purple-500 shadow-sm",
      badgeText: "text-white font-extrabold",
      borderHover: "hover:border-purple-500/50",
      btnHover: "hover:bg-purple-600 dark:hover:bg-purple-600",
      quoteBg: "bg-purple-50 dark:bg-purple-950/40",
      quoteText: "text-purple-900 dark:text-purple-200",
      quoteBorder: "border-purple-200 dark:border-purple-900/50",
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
      color: "text-white",
      bg: "bg-indigo-600 shadow-md shadow-indigo-600/30",
      badgeBg: "bg-indigo-600 border border-indigo-500 shadow-sm",
      badgeText: "text-white font-extrabold",
      borderHover: "hover:border-indigo-500/50",
      btnHover: "hover:bg-indigo-600 dark:hover:bg-indigo-600",
      quoteBg: "bg-indigo-50 dark:bg-indigo-950/40",
      quoteText: "text-indigo-900 dark:text-indigo-200",
      quoteBorder: "border-indigo-200 dark:border-indigo-900/50",
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
      color: "text-white",
      bg: "bg-pink-600 shadow-md shadow-pink-600/30",
      badgeBg: "bg-pink-600 border border-pink-500 shadow-sm",
      badgeText: "text-white font-extrabold",
      borderHover: "hover:border-pink-500/50",
      btnHover: "hover:bg-pink-600 dark:hover:bg-pink-600",
      quoteBg: "bg-pink-50 dark:bg-pink-950/40",
      quoteText: "text-pink-900 dark:text-pink-200",
      quoteBorder: "border-pink-200 dark:border-pink-900/50",
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
      color: "text-white",
      bg: "bg-emerald-600 shadow-md shadow-emerald-600/30",
      badgeBg: "bg-emerald-600 border border-emerald-500 shadow-sm",
      badgeText: "text-white font-extrabold",
      borderHover: "hover:border-emerald-500/50",
      btnHover: "hover:bg-emerald-600 dark:hover:bg-emerald-600",
      quoteBg: "bg-emerald-50 dark:bg-emerald-950/40",
      quoteText: "text-emerald-900 dark:text-emerald-200",
      quoteBorder: "border-emerald-200 dark:border-emerald-900/50",
    },
  ];

  // Vision Goals
  const visionGoals = [
    {
      id: "v1",
      title: language === "te" ? "ఆధ్యాత్మిక కుటుంబ సహవాసం" : language === "hi" ? "समावेशी आत्मिक परिवार" : "Inclusive Spiritual Family",
      text: language === "te" ? "ప్రతి ఒక్కరూ సమానంగా ప్రేమించబడుతూ, ఆధ్యాత్మిక గృహాన్ని కనుగొనే సమాజం." : language === "hi" ? "एक ऐसा समुदाय जहां हर कोई जुड़ाव महसूस करता है और अपना आत्मिक घर पाता है।" : "A community where everyone belongs, feels valued, and finds spiritual home.",
      verse: "Romans 12:5",
      icon: Users,
      accent: "from-purple-500 to-indigo-500",
      color: "text-white",
      bg: "bg-purple-600 shadow-md shadow-purple-600/30",
      badgeBg: "bg-purple-600 border border-purple-500 shadow-sm",
      badgeText: "text-white font-extrabold",
      badgeBorder: "border-purple-500",
      borderHover: "hover:border-purple-500/50",
    },
    {
      id: "v2",
      title: language === "te" ? "ఆధ్యాత్మిక పరిపక్వత & శిష్యరికం" : language === "hi" ? "आत्मिक परिपक्वता और शिष्यता" : "Spiritual Maturity & Discipleship",
      text: language === "te" ? "విశ్వాసంలో, వాక్య జ్ఞానంలో మరియు క్రీస్తు స్వభావంలో ఎదిగే విశ్వాసులు." : language === "hi" ? "विश्वासी जो विश्वास, बाइबिल के ज्ञान और मसीह जैसे चरित्र में बढ़ते हैं।" : "Believers growing in faith, biblical wisdom, and Christ-like character.",
      verse: "Ephesians 4:14-15",
      icon: BookOpen,
      accent: "from-indigo-500 to-cyan-500",
      color: "text-white",
      bg: "bg-indigo-600 shadow-md shadow-indigo-600/30",
      badgeBg: "bg-indigo-600 border border-indigo-500 shadow-sm",
      badgeText: "text-white font-extrabold",
      badgeBorder: "border-indigo-500",
      borderHover: "hover:border-indigo-500/50",
    },
    {
      id: "v3",
      title: language === "te" ? "బలపరచబడిన కుటుంబాలు" : language === "hi" ? "मजबूत परिवार" : "Strengthened Families",
      text: language === "te" ? "దేవుని వాక్యంలో, నిరంతర ప్రార్థనలో మరియు పరస్పర ప్రేమలో స్థిరపడిన కుటుంబాలు." : language === "hi" ? "परमेश्वर के वचन, प्रार्थना और आपसी प्रेम में स्थापित परिवार।" : "Families anchored in God's Word, prayer, and mutual love.",
      verse: "Joshua 24:15",
      icon: Heart,
      accent: "from-pink-500 to-rose-500",
      color: "text-white",
      bg: "bg-pink-600 shadow-md shadow-pink-600/30",
      badgeBg: "bg-pink-600 border border-pink-500 shadow-sm",
      badgeText: "text-white font-extrabold",
      badgeBorder: "border-pink-500",
      borderHover: "hover:border-pink-500/50",
    },
    {
      id: "v4",
      title: language === "te" ? "రూపాంతరం చెందిన జీవితాలు" : language === "hi" ? "परिवर्तित जीवन" : "Transformed Lives",
      text: language === "te" ? "దేవుని అద్భుత శక్తి ద్వారా స్వస్థత, విమోచన మరియు నూతన నిరీక్షణ పొందిన వ్యక్తులు." : language === "hi" ? "परमेश्वर के सामर्थ्य द्वारा चंगाई, छुटकारा और नया जीवन पाने वाले लोग।" : "Lives redeemed, healed, and set free by God's supernatural power.",
      verse: "2 Corinthians 5:17",
      icon: Sparkles,
      accent: "from-amber-500 to-orange-500",
      color: "text-white",
      bg: "bg-amber-600 shadow-md shadow-amber-600/30",
      badgeBg: "bg-amber-600 border border-amber-500 shadow-sm",
      badgeText: "text-white font-extrabold",
      badgeBorder: "border-amber-500",
      borderHover: "hover:border-amber-500/50",
    },
    {
      id: "v5",
      title: language === "te" ? "పరిసరాలలో సువార్త వెలుగు" : language === "hi" ? "पड़ोस में सुसमाचार का प्रभाव" : "Gospel Impacting Neighborhoods",
      text: language === "te" ? "హైదరాబాద్ నగరంలోని ప్రతి వాడలో మరియు పరిసర ప్రాంతాలలో క్రీస్తు వెలుగు వ్యాపించడం." : language === "hi" ? "हैदराबाद और आसपास के हर कोने में मसीह की ज्योति का फैलना।" : "The light of Christ saturating every corner of Hyderabad and surrounding regions.",
      verse: "Matthew 28:19-20",
      icon: Globe,
      accent: "from-emerald-500 to-teal-500",
      color: "text-white",
      bg: "bg-emerald-600 shadow-md shadow-emerald-600/30",
      badgeBg: "bg-emerald-600 border border-emerald-500 shadow-sm",
      badgeText: "text-white font-extrabold",
      badgeBorder: "border-emerald-500",
      borderHover: "hover:border-emerald-500/50",
    },
  ];

  // Core Values Data
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
        color: "text-white",
        bg: "bg-purple-600 shadow-md shadow-purple-600/30",
        badgeBg: "bg-purple-600 border border-purple-500 shadow-sm",
        badgeText: "text-white font-extrabold",
        borderHover: "hover:border-purple-500/50",
        btnHover: "hover:bg-purple-600 dark:hover:bg-purple-600",
        quoteBg: "bg-purple-50 dark:bg-purple-950/40",
        quoteText: "text-purple-900 dark:text-purple-200",
        quoteBorder: "border-purple-200 dark:border-purple-900/50",
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
        color: "text-white",
        bg: "bg-indigo-600 shadow-md shadow-indigo-600/30",
        badgeBg: "bg-indigo-600 border border-indigo-500 shadow-sm",
        badgeText: "text-white font-extrabold",
        borderHover: "hover:border-indigo-500/50",
        btnHover: "hover:bg-indigo-600 dark:hover:bg-indigo-600",
        quoteBg: "bg-indigo-50 dark:bg-indigo-950/40",
        quoteText: "text-indigo-900 dark:text-indigo-200",
        quoteBorder: "border-indigo-200 dark:border-indigo-900/50",
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
        color: "text-white",
        bg: "bg-pink-600 shadow-md shadow-pink-600/30",
        badgeBg: "bg-pink-600 border border-pink-500 shadow-sm",
        badgeText: "text-white font-extrabold",
        borderHover: "hover:border-pink-500/50",
        btnHover: "hover:bg-pink-600 dark:hover:bg-pink-600",
        quoteBg: "bg-pink-50 dark:bg-pink-950/40",
        quoteText: "text-pink-900 dark:text-pink-200",
        quoteBorder: "border-pink-200 dark:border-pink-900/50",
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
        color: "text-white",
        bg: "bg-emerald-600 shadow-md shadow-emerald-600/30",
        badgeBg: "bg-emerald-600 border border-emerald-500 shadow-sm",
        badgeText: "text-white font-extrabold",
        borderHover: "hover:border-emerald-500/50",
        btnHover: "hover:bg-emerald-600 dark:hover:bg-emerald-600",
        quoteBg: "bg-emerald-50 dark:bg-emerald-950/40",
        quoteText: "text-emerald-900 dark:text-emerald-200",
        quoteBorder: "border-emerald-200 dark:border-emerald-900/50",
      },
      {
        id: "val-mission",
        title: language === "te" ? "సువార్త దృక్పథం" : language === "hi" ? "मिशन-केंद्रित" : "Mission-Minded",
        category: "outreach",
        desc: language === "te" ? "మన నగరంలో, రాష్ట్రంలో మరియు ప్రపంచంలో క్రీస్తు నిరీక్షణను అందరికీ పంచుతాము." : language === "hi" ? "हम अपने शहर, देश और दुनिया में मसीह की आशा को बांटते हैं।" : "We reach the lost and share the hope of Christ in our city, nation, and beyond.",
        verse: "Mark 16:15",
        quote: language === "te" ? "సర్వలోకమునకు వెళ్లి సర్వసృష్టికి సువార్తను ప్రకటించుడి." : language === "hi" ? "సారే జగత్ మే జాకర్ సారీ సృష్టి కే లోగోం కో సుసమాచార్ ప్రచార్ కరో." : "Go into all the world and preach the gospel to all creation.",
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
        color: "text-white",
        bg: "bg-amber-600 shadow-md shadow-amber-600/30",
        badgeBg: "bg-amber-600 border border-amber-500 shadow-sm",
        badgeText: "text-white font-extrabold",
        borderHover: "hover:border-amber-500/50",
        btnHover: "hover:bg-amber-600 dark:hover:bg-amber-600",
        quoteBg: "bg-amber-50 dark:bg-amber-950/40",
        quoteText: "text-amber-900 dark:text-amber-200",
        quoteBorder: "border-amber-200 dark:border-amber-900/50",
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
        color: "text-white",
        bg: "bg-purple-600 shadow-md shadow-purple-600/30",
        badgeBg: "bg-purple-600 border border-purple-500 shadow-sm",
        badgeText: "text-white font-extrabold",
        borderHover: "hover:border-purple-500/50",
        btnHover: "hover:bg-purple-600 dark:hover:bg-purple-600",
        quoteBg: "bg-purple-50 dark:bg-purple-950/40",
        quoteText: "text-purple-900 dark:text-purple-200",
        quoteBorder: "border-purple-200 dark:border-purple-900/50",
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

  const mottoText =
    language === "te"
      ? '"క్రీస్తును తెలుసుకోవడం మరియు ఆయనను ఇతరులకు తెలియజేయడం"'
      : language === "hi"
      ? '"मसीह को जानना और उन्हें सभी को बताना"'
      : '"To know Christ and make Him known"';

  const visionBannerText =
    language === "te"
      ? '"క్రీస్తు ద్వారా ప్రతి వ్యక్తి రూపాంతరం పొందే సంఘం"'
      : language === "hi"
      ? '"एक ऐसी कलीसिया जहां हर व्यक्ति मसीह के द्वारा रूपांतरण का अनुभव करे"'
      : '"A church where every person experiences transformation through Christ"';

  const categoryTabs = [
    { id: "all", label: language === "te" ? "అన్ని విలువలు" : language === "hi" ? "सभी मूल्य" : "All Values" },
    { id: "spiritual", label: language === "te" ? "ఆధ్యాత్మిక పునాదులు" : language === "hi" ? "आत्मिक आधार" : "Spiritual Foundations" },
    { id: "community", label: language === "te" ? "సహవాసం & ప్రేమ" : language === "hi" ? "समुदाय और प्रेम" : "Community & Love" },
    { id: "outreach", label: language === "te" ? "సువార్త & మిషన్" : language === "hi" ? "आउटरीच और मिशन" : "Outreach & Mission" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* 🌌 Hero Section */}
      <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden border-b border-purple-100/80 dark:border-slate-800/80 shadow-sm transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-25 dark:opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-400/25 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-400/25 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <BackToHome label={(t as any)?.nav?.home || (language === "te" ? "హోమ్" : language === "hi" ? "होम" : "Home")} />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-purple-100/90 dark:bg-purple-900/60 border border-purple-200/90 dark:border-purple-400/40 rounded-full text-purple-900 dark:text-white text-xs sm:text-sm font-extrabold tracking-wide mb-6 shadow-sm backdrop-blur-md animate-bounce-in">
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              <span>{pageT.badge || (language === "te" ? "మిషన్, దర్శనం & ప్రాథమిక విలువలు" : language === "hi" ? "मिशन, दृष्टिकोण और मूल मूल्य" : "Mission, Vision & Core Values")}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-300" />
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight animate-fade-in-up">
              {pageT.heroTitle || (language === "te" ? "మా ఉద్దేశ్యం & గమ్యం" : language === "hi" ? "हमारा उद्देश्य और दिशा" : "Our Purpose & Direction")}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-200 animate-fade-in-up animate-delay-200 font-medium max-w-2xl mx-auto leading-relaxed mb-8">
              {pageT.heroSubtitle || (language === "te" ? "వాక్యంతో నడిపించబడుతూ, ప్రేమతో ప్రేరేపించబడి, పరిశుద్ధాత్మ శక్తితో నింపబడుట." : language === "hi" ? "पवित्र शास्त्र द्वारा निर्देशित, प्रेम से प्रेरित, पवित्र आत्मा से सामर्थी।" : "Guided by Holy Scripture, Motivated by Love, Empowered by the Holy Spirit.")}
            </p>

            {/* Key Quote Pill */}
            <div className="inline-block p-4 sm:p-5 bg-white/95 dark:bg-purple-950/80 backdrop-blur-xl border border-purple-200/90 dark:border-purple-400/60 rounded-2xl max-w-xl mx-auto shadow-md dark:shadow-2xl animate-scale-in animate-delay-300">
              <p className="text-base sm:text-lg italic font-black tracking-wide text-purple-900 dark:text-white">
                {mottoText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Floating Stats & Pillars Overview Bar */}
      <section className="relative z-20 -mt-12 sm:-mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-0.5">
                  {stat.label}
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
                  {stat.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🎯 Section 1: Our Mission */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/20 animate-glow">
              <Target className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-600 text-white rounded-full text-xs font-extrabold uppercase tracking-widest mb-4 border border-purple-500 shadow-sm">
              <span>{language === "te" ? "మా ప్రధాన కర్తవ్యం" : language === "hi" ? "हमारा मुख्य कर्तव्य" : "Our Primary Mandate"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              {pageT.missionHeading || (language === "te" ? "మా మిషన్" : language === "hi" ? "हमारा मिशन" : "Our Mission")}
            </h2>
            <div className="my-4 inline-block px-6 py-3 bg-purple-600 text-white text-xl sm:text-2xl font-black rounded-2xl shadow-lg border border-purple-500 tracking-wide">
              {mottoText}
            </div>
            <p className="text-slate-600 dark:text-slate-200 text-base sm:text-lg max-w-2xl mx-auto font-medium mt-2">
              {language === "te"
                ? "కింగ్‌డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్‌గా మేము చేసే ప్రతి పరిచర్య ఈ ఏకైక నిబద్ధత నుండే ఉద్భవిస్తుంది: యేసుతో మన సంబంధాన్ని బలపరుచుకోవడం మరియు ఆయన రక్షణను అందరికీ అందించడం."
                : language === "hi"
                ? "किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज के रूप में हम जो कुछ भी करते हैं वह इसी प्रतिबद्धता से निकलता है: यीशु के साथ अपने संबंध को गहरा करना और उनके उद्धार को सभी तक पहुंचाना।"
                : "Everything we do as Kingdom of Christ Ministries flows from this singular commitment: deepening our relationship with Jesus and bringing His salvation to our neighbors and the world."}
            </p>
          </div>

          {/* 4 Mission Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {missionPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  className={`relative group bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/30 border border-slate-200/80 dark:border-slate-800 ${pillar.borderHover} transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden text-left`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${pillar.accent}`} />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-13 h-13 ${pillar.bg} border border-slate-200/50 dark:border-slate-700/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${pillar.color}`} />
                      </div>
                      <span className={`text-xs font-bold ${pillar.badgeText} ${pillar.badgeBg} px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-800/60`}>
                        {pillar.verse}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className="text-sm font-extrabold text-purple-700 dark:text-purple-300 mb-3">
                      {pillar.subtitle}
                    </p>
                    <p className="text-slate-600 dark:text-slate-200 text-sm leading-relaxed mb-5 font-medium">
                      {pillar.desc}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedModalItem({
                        title: pillar.title,
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
                    className={`w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800/70 ${pillar.btnHover} hover:text-white dark:hover:text-white text-slate-800 dark:text-slate-100 font-extrabold rounded-xl text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm`}
                  >
                    <span>{language === "te" ? "స్తంభం వివరాలు" : language === "hi" ? "स्तंभ विवरण" : "Pillar Details"}</span>
                    <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 👁️ Section 2: Our Vision */}
      <section className="py-20 bg-gradient-to-br from-purple-900/10 via-slate-900/5 to-indigo-900/10 dark:from-purple-950/40 dark:via-slate-950/60 dark:to-indigo-950/40 border-y border-purple-200/50 dark:border-purple-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
              <Eye className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-extrabold uppercase tracking-widest mb-4 border border-indigo-500 shadow-sm">
              <span>{pageT.visionBadge || (language === "te" ? "మా భవిష్యత్ దర్శనం" : language === "hi" ? "हमारा भविष्य का दर्शन" : "Our Future Picture")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              {pageT.visionHeading || (language === "te" ? "మా దర్శనం" : language === "hi" ? "हमारा दृष्टिकोण" : "Our Vision")}
            </h2>
            <div className="my-4 inline-block px-6 py-3 bg-indigo-600 text-white text-xl sm:text-2xl font-black rounded-2xl shadow-lg border border-indigo-500 tracking-wide max-w-3xl">
              {visionBannerText}
            </div>
          </div>

          {/* Vision Objectives List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto stagger-children">
            {visionGoals.map((goal) => {
              const Icon = goal.icon;
              return (
                <div
                  key={goal.id}
                  className={`relative bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/30 border border-slate-200/80 dark:border-slate-800 ${goal.borderHover} hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between group overflow-hidden text-left`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${goal.accent}`} />

                  <div>
                    <div className="flex items-center justify-between mb-4 mt-1">
                      <div className={`w-12 h-12 ${goal.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${goal.color}`} />
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${goal.badgeBg} ${goal.badgeText} rounded-full text-xs font-bold border ${goal.badgeBorder}`}>
                        <CheckCircle2 className={`h-3.5 w-3.5 ${goal.color}`} />
                        {goal.verse}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {goal.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-200 text-sm leading-relaxed font-medium">
                      {goal.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🌟 Section 3: Core Values with Search & Interactive Modal */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500 text-slate-950 rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-slate-950" />
              <span>{language === "te" ? "దైనిందిన జీవితంలో సువార్త" : language === "hi" ? "दैनिक जीवन में सुसमाचार" : "Living the Gospel Daily"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              {pageT.valuesHeading || (language === "te" ? "రాజ్య ప్రాథమిక విలువలు" : language === "hi" ? "राज्य के मूल मूल्य" : "Core Values")}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-medium">
              {language === "te"
                ? "మన ఆరాధన, సంస్కృతి మరియు సమాజ సహవాసాన్ని నడిపించే తిరుగులేని ఆధ్యాత్మిక ప్రమాణాలు."
                : language === "hi"
                ? "हमारी आराधना, संस्कृति और सामुदायिक सहभागिता को आकार देने वाले आध्यात्मिक मानक।"
                : "The non-negotiable spiritual standards that shape our worship, culture, and community interaction."}
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="max-w-4xl mx-auto mb-12 space-y-6">
            {/* Search Input Box */}
            <div className="max-w-xl mx-auto relative">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === "te" ? "విలువలు, వాక్యాలు లేదా కీలక పదాలను శోధించండి..." : language === "hi" ? "मूल्य, वचन या कीवर्ड खोजें..." : "Search values, scripture, or keywords..."}
                  className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg transition-all font-semibold"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                    selectedCategory === tab.id
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-105"
                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Core Values Grid */}
          {filteredCoreValues.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl mx-auto">
              <Sparkles className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                {language === "te" ? `"${searchQuery}" తో సరిపోలే విలువలు లేవు` : language === "hi" ? `"${searchQuery}" से मेल खाने वाला कोई मूल्य नहीं मिला` : `No core values found matching "${searchQuery}"`}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-4 px-6 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors"
              >
                {language === "te" ? "ఫిల్టర్‌లను రీసెట్ చేయండి" : language === "hi" ? "फ़िल्टर रीसेट करें" : "Reset Search Filters"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {filteredCoreValues.map((val) => {
                const Icon = val.icon;
                return (
                  <div
                    key={val.id}
                    className={`relative group bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/30 border border-slate-200/80 dark:border-slate-800 ${val.borderHover} transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden text-left`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${val.accent}`} />

                    <div>
                      <div className="flex items-center justify-between mb-4 mt-1">
                        <div className={`w-12 h-12 ${val.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-6 w-6 ${val.color}`} />
                        </div>
                        <span className={`text-xs font-bold ${val.badgeText} ${val.badgeBg} px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-800/60`}>
                          {val.verse}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {val.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-200 text-sm leading-relaxed mb-6 font-medium">
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
                      className={`w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800/80 ${val.btnHover} hover:text-white dark:hover:text-white text-slate-800 dark:text-slate-100 font-extrabold rounded-xl text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm`}
                    >
                      <span>{language === "te" ? "పూర్తి వివరణ & వాక్య ఆధారాలు" : language === "hi" ? "गहन विवरण और शास्त्रीय प्रमाण" : "Deep Dive & Scriptural Proof"}</span>
                      <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 📄 Downloadable / Copy Statement Section */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-900/10 via-slate-900/5 to-indigo-900/10 dark:from-purple-950/50 dark:via-slate-900/80 dark:to-indigo-950/50 border border-purple-200/80 dark:border-purple-800/60 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-black uppercase tracking-wider">
                  <Compass className="h-3.5 w-3.5" />
                  <span>{language === "te" ? "సారాంశం & భాగస్వామ్యం" : language === "hi" ? "सारांश और साझाकरण" : "Summary & Sharing"}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {language === "te" ? "మా మిషన్ & దర్శనాన్ని పంచుకోండి" : language === "hi" ? "हमारा मिशन और दृष्टिकोण साझा करें" : "Share Our Mission & Vision"}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-xl">
                  {language === "te"
                    ? "గ్రూప్ అధ్యయనం, వ్యక్తిగత ధ్యానం లేదా స్నేహితులతో పంచుకోవడానికి మా మిషన్, దర్శనం మరియు ప్రాథమిక విలువల సారాంశాన్ని కాపీ చేయండి."
                    : language === "hi"
                    ? "समूह अध्ययन, व्यक्तिगत मनन या मित्रों के साथ साझा करने के लिए हमारे मिशन, विज़न और मूल मूल्यों का सारांश कॉपी करें।"
                    : "Copy our complete Mission, Vision & Core Values statement for group study, personal reflection, or sharing with friends."}
                </p>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={handleCopyMission}
                  className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/30 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" />
                      <span>{language === "te" ? "కాపీ చేయబడింది!" : language === "hi" ? "क्लिपबोर्ड पर कॉपी किया गया!" : "Copied to Clipboard!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>{language === "te" ? "సారాంశాన్ని కాపీ చేయండి" : language === "hi" ? "सारांश कॉपी करें" : "Copy Summary Statement"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 Call To Action (CTA) Section */}
      <section className="py-24 bg-slate-950 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-600 border border-purple-400 rounded-full text-white text-xs sm:text-sm font-bold uppercase tracking-widest mb-8 shadow-lg shadow-purple-600/40">
              <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
              <span>{language === "te" ? "దైవిక సంకల్పంలోకి అడుగుపెట్టండి" : language === "hi" ? "ईश्वरीय उद्देश्य में कदम रखें" : "Step Into Purpose"}</span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight animate-fade-in-up">
              {language === "te" ? "నేడే మా మిషన్‌లో చేరండి" : language === "hi" ? "आज ही हमारे मिशन से जुड़ें" : "Join Our Mission Today"}
            </h2>

            <p className="text-xl sm:text-2xl text-slate-200 mb-12 animate-fade-in-up animate-delay-100 font-medium max-w-2xl mx-auto leading-relaxed">
              {language === "te"
                ? "గొప్ప లక్ష్యంలో భాగస్వాములు కండి. ఆత్మీయ సహవాసాన్ని అనుభవిస్తూ, విశ్వాసంలో ఎదుగుతూ హైదరాబాద్ అంతటా శాశ్వత ప్రభావం చూపించండి."
                : language === "hi"
                ? "किसी महान उद्देश्य का हिस्सा बनें। आत्मिक संगति का अनुभव करें, विश्वास में बढ़ें और हैदराबाद में एक स्थायी प्रभाव छोड़ें।"
                : "Be part of something greater. Experience fellowship, grow in faith, and make a lasting impact across Hyderabad."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in animate-delay-200">
              <Link
                href="/membership"
                className="group px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 rounded-2xl font-black shadow-xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2.5"
              >
                <span>{language === "te" ? "సభ్యత్వాన్ని పొందండి" : language === "hi" ? "सदस्य बनें" : "Become a Member"}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform text-purple-600" />
              </Link>

              <Link
                href="/about/story"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-purple-600/30 transition-all duration-300 hover:scale-105 flex items-center justify-center"
              >
                {language === "te" ? "మా చరిత్ర" : language === "hi" ? "हमारी कहानी" : "Our Story"}
              </Link>

              <Link
                href="/about/beliefs"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black transition-all duration-300 hover:scale-105 flex items-center justify-center"
              >
                {language === "te" ? "మా విశ్వాసాలు" : language === "hi" ? "हमारे विश्वास" : "Our Beliefs"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📖 Deep Dive Detail Modal */}
      {selectedModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col animate-scale-in">
            {/* Modal Header */}
            <div className={`p-6 sm:p-8 bg-gradient-to-r ${selectedModalItem.accent} text-white relative`}>
              <button
                onClick={() => setSelectedModalItem(null)}
                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{selectedModalItem.verse}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black">{selectedModalItem.title}</h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-left">
              <div>
                <h4 className={`text-xs font-extrabold uppercase tracking-widest ${selectedModalItem.color} mb-2`}>
                  {language === "te" ? "పరిచర్య లక్ష్యం & ప్రాముఖ్యత" : language === "hi" ? "अवलोकन और उद्देश्य" : "Overview & Purpose"}
                </h4>
                <p className="text-base sm:text-lg leading-relaxed font-medium">
                  {selectedModalItem.desc}
                </p>
              </div>

              {selectedModalItem.quote && (
                <div className={`p-5 ${selectedModalItem.quoteBg || 'bg-purple-50 dark:bg-purple-950/40'} rounded-2xl border ${selectedModalItem.quoteBorder || 'border-purple-200 dark:border-purple-900/50'}`}>
                  <p className={`text-sm sm:text-base italic font-semibold ${selectedModalItem.quoteText || 'text-purple-900 dark:text-purple-200'}`}>
                    "{selectedModalItem.quote}"
                  </p>
                </div>
              )}

              <div>
                <h4 className={`text-xs font-extrabold uppercase tracking-widest ${selectedModalItem.color} mb-3`}>
                  {language === "te" ? "ఆచరణాత్మక జీవితం & పరిచర్య ప్రణాళిక" : language === "hi" ? "व्यावहारिक जीवन और सेवा कार्य" : "Practical Living & Ministry Action"}
                </h4>
                <div className="space-y-2.5">
                  {selectedModalItem.details.map((item: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <CheckCircle2 className={`h-4 w-4 ${selectedModalItem.color} flex-shrink-0`} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedModalItem(null)}
                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
              >
                {language === "te" ? "మూసివేయి" : language === "hi" ? "बंद करें" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}