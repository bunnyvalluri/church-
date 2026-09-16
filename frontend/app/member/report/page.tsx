"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Bug,
  Wifi,
  WifiOff,
  Monitor,
  Smartphone,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  RefreshCw,
  X,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  Phone,
  Mail,
  ExternalLink,
  HelpCircle,
  Info,
  Sparkles,
  Layers,
  ArrowLeft,
  Eye,
  AlertCircle,
  Laptop,
  Globe,
  Loader2,
  Check,
  Search,
  Calendar,
  ShieldCheck,
  Activity,
  Image as ImageIcon,
  Sparkle,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import { captureBrowserDiagnostics, BrowserDiagnostics } from "@/lib/issueDiagnostics";
import { getRecentErrorContext } from "@/lib/clientErrorCollector";

/* ────────────────────────── Translations ────────────────────── */
const reportTranslations = {
  en: {
    backToPortal: "Back to Member Portal",
    qualityAssurance: "Support & Quality Assurance",
    urgentSupport: "Urgent Support:",
    reportProblemTitle: "Report a Problem",
    reportProblemDesc: "Found something that isn't working correctly? Tell us what happened and our technical team will investigate it.",
    tabSubmit: "Submit Report",
    tabHistory: "My Submitted Reports",
    historyHeading: "Your Submitted Reports",
    historyDesc: "Track the real-time investigation and resolution status of your reported issues.",
    refreshBtn: "Refresh",
    loadingReports: "Loading your submitted reports...",
    connectingDb: "Connecting to ministry database",
    noReportsTitle: "No issues reported",
    noReportsDesc: "You haven't submitted any technical reports yet. If you encounter any problems with the portal, report it here.",
    submitFirstReportBtn: "Submit a Report",

    // Step 1
    step1Tag: "Step 1",
    step1Title: "What kind of issue are you experiencing?",
    selectOne: "Select one",
    categories: {
      SOMETHING_IS_BROKEN: {
        title: "Something is Broken",
        desc: "A button, form, or action isn't responding as expected",
      },
      PAGE_NOT_LOADING: {
        title: "Page Not Loading",
        desc: "Page hangs, blank screen, or fails to fetch content",
      },
      LOGIN_ACCOUNT: {
        title: "Login & Account",
        desc: "Trouble signing in, profile, or session authentication",
      },
      MOBILE_RESPONSIVE: {
        title: "Mobile Display Issue",
        desc: "Content cut off or overlapping on phones/tablets",
      },
      WEBSITE_DISPLAY: {
        title: "Display & Styling",
        desc: "Visual glitches, colors, or misaligned layouts",
      },
      NETWORK_CONNECTION: {
        title: "Network & Sync",
        desc: "Slow requests, timeout, or offline problems",
      },
      BUG_UNEXPECTED: {
        title: "Unexpected Error",
        desc: "An error dialog or unhandled exception occurred",
      },
      SUGGESTION: {
        title: "Suggestion / Feedback",
        desc: "Ideas to enhance the portal experience or workflow",
      },
      OTHER: {
        title: "Other Technical Issue",
        desc: "Anything else that needs technical attention or help",
      },
    },

    // Step 2
    step2Tag: "Step 2",
    step2Title: "How severely does this impact your use of the portal?",
    chooseImpact: "Choose impact level",
    severities: {
      LOW: {
        title: "Low",
        level: "Level 1",
        desc: "Minor aesthetic or convenience",
      },
      MEDIUM: {
        title: "Medium",
        level: "Level 2",
        desc: "Feature works with workaround",
      },
      HIGH: {
        title: "High",
        level: "Level 3",
        desc: "Important feature completely blocked",
      },
      CRITICAL: {
        title: "Critical",
        level: "Level 4",
        desc: "Unable to access portal or service",
      },
    },

    // Step 3
    step3Tag: "Step 3",
    step3Title: "Tell us what happened",
    problemSummaryLabel: "Problem Summary / Title",
    problemSummaryPlaceholder: "e.g., 'Giving page donation form won't open after clicking Submit'",
    problemSummaryHelper: "Be specific and concise",
    whatHappenedLabel: "What happened?",
    whatHappenedPlaceholder: "Please describe the steps you took, what happened, and any error message you noticed on screen...",
    whatHappenedHelper: "Include any details you remember",
    expectedVsActualTitle: "Additional Context: Expected vs Actual Behavior (Optional)",
    expectedLabel: "What did you expect to happen? (Optional)",
    expectedPlaceholder: "e.g. Receive confirmation email",
    actualLabel: "What actually happened instead? (Optional)",
    actualPlaceholder: "e.g. Screen remained loading continuously",

    // Screenshot
    screenshotTitle: "Attach a Screenshot (Optional)",
    screenshotLimit: "PNG, JPG, or WebP up to 5MB",
    clickToUpload: "Click to upload an image screenshot",
    dragDropHelp: "Drag and drop or browse from your computer or phone",
    removeScreenshot: "Remove screenshot",

    // Diagnostics
    diagnosticsTitle: "Real Device Diagnostics (Captured Automatically)",
    diagnosticsDesc: "To diagnose and solve issues quickly, we include real browser technical attributes with your report. Sensitive information like passwords and tokens are never captured.",
    viewCapturedData: "View Captured Data",
    hideCapturedData: "Hide Details",
    diagBrowser: "Browser",
    diagOS: "Operating System",
    diagDevice: "Device Type",
    diagViewport: "Viewport",
    diagTimezone: "Timezone",
    diagConnection: "Connection",

    // Buttons
    cancelBtn: "Cancel",
    submitReportBtn: "Submit Problem Report",
    submittingBtn: "Submitting Report...",
    uploadingScreenshotBtn: "Uploading Screenshot...",

    // Alerts & Banners
    successTitle: "Thank you! Your report has been logged.",
    successDesc: "Our ministry technical team has received your diagnostics and issue description. We are on it!",
    referenceIdLabel: "Reference ID:",
    trackStatusBtn: "Track Status in My Reports →",
    noticeLabel: "Notice:",

    // Urgent card
    needHelpTitle: "Need Immediate Help with your Church Account?",
    needHelpDesc: "You can contact our lead support coordinator directly by email or phone.",
    emailSupport: "Email Support",
    callSupport: "Call +91 9505288171",

    // Modal
    modalDescription: "Description",
    modalExpected: "Expected Behavior",
    modalActual: "Actual Behavior",
    modalScreenshot: "Attached Screenshot",
    modalSubmittedOn: "Submitted on",
    modalClose: "Close",

    // Statuses
    statuses: {
      OPEN: "Received",
      INVESTIGATING: "Investigating",
      IN_PROGRESS: "In Progress",
      RESOLVED: "Resolved",
      CLOSED: "Closed",
      DUPLICATE: "Duplicate",
    }
  },

  te: {
    backToPortal: "సభ్యుల పోర్టల్‌కు తిరిగి వెళ్లండి",
    qualityAssurance: "మద్దతు & నాణ్యత హామీ",
    urgentSupport: "అత్యవసర సహాయం:",
    reportProblemTitle: "సమస్యను నివేదించండి",
    reportProblemDesc: "ఏదైనా సరిగ్గా పనిచేయడం లేదా? ఏమి జరిగిందో మాకు తెలపండి, మా సాంకేతిక బృందం వెంటనే పరిశీలిస్తుంది.",
    tabSubmit: "సమస్యను నివేదించండి",
    tabHistory: "నా నివేదికలు",
    historyHeading: "మీ సమర్పించిన నివేదికలు",
    historyDesc: "మీ సాంకేతిక టిక్కెట్ల నిజ-సమయ స్థితిని మరియు పరిష్కారాలను ఇక్కడ చూడండి.",
    refreshBtn: "రిఫ్రెష్ చేయండి",
    loadingReports: "మీ నివేదికలు లోడ్ అవుతున్నాయి...",
    connectingDb: "పరిచర్య డేటాబేస్‌కు అనుసంధానిస్తోంది",
    noReportsTitle: "ఇంకా ఎలాంటి సమస్యలు నమోదు కాలేదు",
    noReportsDesc: "మీరు ఇంకా సాంకేతిక నివేదికలేవీ సమర్పించలేదు. పోర్టల్‌లో ఏదైనా సమస్య ఎదురైతే, ఇక్కడ నివేదించండి.",
    submitFirstReportBtn: "సమస్యను నివేదించండి",

    // Step 1
    step1Tag: "దశ 1",
    step1Title: "మీరు ఎలాంటి సమస్యను ఎదుర్కొంటున్నారు?",
    selectOne: "ఒకటి ఎంచుకోండి",
    categories: {
      SOMETHING_IS_BROKEN: {
        title: "ఏదో పనిచేయడం లేదు",
        desc: "బటన్, ఫారమ్ లేదా ఫీచర్ ఆశించిన విధంగా స్పందించడం లేదు",
      },
      PAGE_NOT_LOADING: {
        title: "పేజీ లోడ్ కావడం లేదు",
        desc: "పేజీ నిలిచిపోయింది, ఖాళీ స్క్రీన్ లేదా కంటెంట్ లోడ్ కావడం లేదు",
      },
      LOGIN_ACCOUNT: {
        title: "లాగిన్ & ఖాతా సమస్య",
        desc: "సైన్ ఇన్, ప్రొఫైల్ లేదా సెషన్ ధృవీకరణ లోపాలు",
      },
      MOBILE_RESPONSIVE: {
        title: "మొబైల్ డిస్‌ప్లే సమస్య",
        desc: "ఫోన్ లేదా టాబ్లెట్ స్క్రీన్‌పై కంటెంట్ సరిగ్గా కనిపించడం లేదు",
      },
      WEBSITE_DISPLAY: {
        title: "రూపం & డిస్‌ప్లే లోపం",
        desc: "రంగులు, డార్క్ మోడ్ లేదా అమరికలో కనిపించే లోపాలు",
      },
      NETWORK_CONNECTION: {
        title: "నెట్‌వర్క్ & సింక్ ఆలస్యం",
        desc: "నెమ్మదైన అభ్యర్థనలు, సమయం ముగియడం లేదా ఆఫ్‌లైన్ లోపాలు",
      },
      BUG_UNEXPECTED: {
        title: "అనుకోని లోపం (Error)",
        desc: "స్క్రీన్‌పై ఎర్రర్ డైలాగ్ లేదా క్రాష్ కనిపించింది",
      },
      SUGGESTION: {
        title: "సలహా / అభిప్రాయం",
        desc: "పోర్టల్ అనుభవాన్ని మెరుగుపరచడానికి మీ సూచనలు",
      },
      OTHER: {
        title: "ఇతర సాంకేతిక సమస్య",
        desc: "సాంకేతిక శ్రద్ధ అవసరమయ్యే ఏదైనా ఇతర సమస్య",
      },
    },

    // Step 2
    step2Tag: "దశ 2",
    step2Title: "ఈ సమస్య మీ పోర్టల్ వాడకాన్ని ఎంత తీవ్రంగా ప్రభావితం చేస్తోంది?",
    chooseImpact: "తీవ్రత స్థాయిని ఎంచుకోండి",
    severities: {
      LOW: {
        title: "తక్కువ (Low)",
        level: "స్థాయి 1",
        desc: "చిన్న సౌలభ్య లేదా రూప సమస్య",
      },
      MEDIUM: {
        title: "మధ్యస్థం (Medium)",
        level: "స్థాయి 2",
        desc: "ఫీచర్ పనిచేస్తోంది కానీ ఇబ్బందిగా ఉంది",
      },
      HIGH: {
        title: "ఎక్కువ (High)",
        level: "స్థాయి 3",
        desc: "ముఖ్యమైన ఫీచర్ పూర్తిగా నిలిచిపోయింది",
      },
      CRITICAL: {
        title: "కీలకం (Critical)",
        level: "స్థాయి 4",
        desc: "పోర్టల్ లేదా సేవను అసలు ఉపయోగించలేకపోతున్నారు",
      },
    },

    // Step 3
    step3Tag: "దశ 3",
    step3Title: "ఏమి జరిగిందో మాకు వివరించండి",
    problemSummaryLabel: "సమస్య సారాంశం / శీర్షిక",
    problemSummaryPlaceholder: "ఉదా: 'సమర్పించు క్లిక్ చేసిన తర్వాత విరాళం ఫారమ్ తెరవడం లేదు'",
    problemSummaryHelper: "ఖచ్చితంగా మరియు క్లుప్తంగా రాయండి",
    whatHappenedLabel: "ఏమి జరిగింది?",
    whatHappenedPlaceholder: "దయచేసి మీరు చేసిన చర్యలు, ఏమి జరిగిందో మరియు స్క్రీన్‌పై కనిపించిన సందేశాన్ని వివరించండి...",
    whatHappenedHelper: "మీకు గుర్తున్న వివరాలను చేర్చండి",
    expectedVsActualTitle: "అదనపు సందర్భం: ఆశించిన & వాస్తవ ఫలితాలు (ఐచ్ఛికం)",
    expectedLabel: "మీరు ఏమి జరుగుతుందని ఆశించారు? (ఐచ్ఛికం)",
    expectedPlaceholder: "ఉదా: నిర్ధారణ ఇమెయిల్ అందుకోవడం",
    actualLabel: "దానికి బదులుగా వాస్తవంగా ఏమి జరిగింది? (ఐచ్ఛికం)",
    actualPlaceholder: "ఉదా: స్క్రీన్ నిరంతరం లోడ్ అవుతూనే ఉంది",

    // Screenshot
    screenshotTitle: "స్క్రీన్‌షాట్‌ను జతచేయండి (ఐచ్ఛికం)",
    screenshotLimit: "PNG, JPG, లేదా WebP గరిష్టంగా 5MB",
    clickToUpload: "స్క్రీన్‌షాట్‌ను అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి",
    dragDropHelp: "చిత్రాన్ని లాగండి లేదా మీ ఫోన్/కంప్యూటర్ నుండి ఎంచుకోండి",
    removeScreenshot: "స్క్రీన్‌షాట్ తొలగించండి",

    // Diagnostics
    diagnosticsTitle: "నిజమైన పరికర సాంకేతిక విశ్లేషణలు (ఆటోమేటిక్)",
    diagnosticsDesc: "సమస్యలను త్వరగా పరిష్కరించడానికి, మేము మీ బ్రౌజర్ సాంకేతిక వివరాలను నివేదికతో కలుపుతాము. పాస్‌వర్డ్‌లు లేదా రహస్య వివరాలు ఎప్పుడూ సేకరించబడవు.",
    viewCapturedData: "సంగ్రహించిన వివరాలను చూడండి",
    hideCapturedData: "వివరాలను దాచండి",
    diagBrowser: "బ్రౌజర్",
    diagOS: "ఆపరేటింగ్ సిస్టమ్",
    diagDevice: "పరికర రకం",
    diagViewport: "రిజల్యూషన్",
    diagTimezone: "సమయ మండలం",
    diagConnection: "కనెక్షన్",

    // Buttons
    cancelBtn: "రద్దు చేయండి",
    submitReportBtn: "సమస్య నివేదికను సమర్పించండి",
    submittingBtn: "సమర్పిస్తోంది...",
    uploadingScreenshotBtn: "స్క్రీన్‌షాట్ అప్‌లోడ్ అవుతోంది...",

    // Alerts & Banners
    successTitle: "ధన్యవాదాలు! మీ నివేదిక నమోదు చేయబడింది.",
    successDesc: "మా పరిచర్య సాంకేతిక బృందం మీ విశ్లేషణలు మరియు సమస్య వివరణను అందుకుంది. మేము దీనిపై పనిచేస్తున్నాము!",
    referenceIdLabel: "రిఫరెన్స్ ID:",
    trackStatusBtn: "నా నివేదికలలో స్థితిని చూడండి →",
    noticeLabel: "గమనిక:",

    // Urgent card
    needHelpTitle: "మీ చర్చి ఖాతాతో తక్షణ సహాయం కావాలా?",
    needHelpDesc: "మీరు మా ముఖ్య సహాయ సమన్వయకర్తను నేరుగా ఇమెయిల్ లేదా ఫోన్ ద్వారా సంప్రదించవచ్చు.",
    emailSupport: "ఇమెయిల్ సహాయం",
    callSupport: "కాల్ చేయండి: +91 9505288171",

    // Modal
    modalDescription: "వివరణ",
    modalExpected: "ఆశించిన ప్రవర్తన",
    modalActual: "వాస్తవ ప్రవర్తన",
    modalScreenshot: "జతచేయబడిన స్క్రీన్‌షాట్",
    modalSubmittedOn: "సమర్పించిన తేదీ",
    modalClose: "మూసివేయి",

    // Statuses
    statuses: {
      OPEN: "స్వీకరించబడింది",
      INVESTIGATING: "పరిశీలిస్తున్నారు",
      IN_PROGRESS: "ప్రగతిలో ఉంది",
      RESOLVED: "పరిష్కరించబడింది",
      CLOSED: "ముగించబడింది",
      DUPLICATE: "డూప్లికేట్",
    }
  },

  hi: {
    backToPortal: "सदस्य पोर्टल पर वापस जाएं",
    qualityAssurance: "सहायता और गुणवत्ता आश्वासन",
    urgentSupport: "अत्यावश्यक सहायता:",
    reportProblemTitle: "समस्या की रिपोर्ट करें",
    reportProblemDesc: "क्या कुछ सही ढंग से काम नहीं कर रहा है? हमें बताएं कि क्या हुआ और हमारी तकनीकी टीम इसकी जांच करेगी।",
    tabSubmit: "समस्या रिपोर्ट करें",
    tabHistory: "मेरी सबमिट की गई रिपोर्ट",
    historyHeading: "आपकी सबमिट की गई रिपोर्ट",
    historyDesc: "अपने तकनीकी टिकटों और समाधानों की वास्तविक समय स्थिति यहां देखें।",
    refreshBtn: "रीफ्रेश करें",
    loadingReports: "आपकी रिपोर्ट लोड हो रही है...",
    connectingDb: "मंत्रालय डेटाबेस से कनेक्ट हो रहा है",
    noReportsTitle: "अभी तक कोई समस्या दर्ज नहीं हुई",
    noReportsDesc: "आपने अभी तक कोई तकनीकी रिपोर्ट सबमिट नहीं की है। यदि आपको पोर्टल में कोई समस्या आती है, तो यहां रिपोर्ट करें।",
    submitFirstReportBtn: "समस्या रिपोर्ट करें",

    // Step 1
    step1Tag: "चरण 1",
    step1Title: "आप किस प्रकार की समस्या का सामना कर रहे हैं?",
    selectOne: "एक चुनें",
    categories: {
      SOMETHING_IS_BROKEN: {
        title: "कुछ काम नहीं कर रहा",
        desc: "कोई बटन, फ़ॉर्म या सुविधा अपेक्षा के अनुसार काम नहीं कर रही है",
      },
      PAGE_NOT_LOADING: {
        title: "पेज लोड नहीं हो रहा",
        desc: "पेज हैंग हो गया, खाली स्क्रीन या सामग्री लोड नहीं हो रही है",
      },
      LOGIN_ACCOUNT: {
        title: "लॉगिन और खाता समस्या",
        desc: "साइन इन, प्रोफ़ाइल या सत्र प्रमाणीकरण से संबंधित समस्याएं",
      },
      MOBILE_RESPONSIVE: {
        title: "मोबाइल डिस्प्ले समस्या",
        desc: "फ़ोन या टैबलेट स्क्रीन पर सामग्री कटी हुई या अव्यवस्थित दिख रही है",
      },
      WEBSITE_DISPLAY: {
        title: "प्रदर्शन और स्टाइलिंग",
        desc: "दृश्य गड़बड़ियां, रंग, डार्क मोड या संरेखण दोष",
      },
      NETWORK_CONNECTION: {
        title: "नेटवर्क और सिंक",
        desc: "धीमे अनुरोध, समय समाप्ति या ऑफ़लाइन सिंक्रनाइज़ेशन में देरी",
      },
      BUG_UNEXPECTED: {
        title: "अप्रत्याशित त्रुटि",
        desc: "स्क्रीन पर एक त्रुटि संवाद या क्रैश दिखाई दिया",
      },
      SUGGESTION: {
        title: "सुझाव / प्रतिक्रिया",
        desc: "पोर्टल अनुभव या कार्यप्रवाह को बढ़ाने के लिए आपके विचार",
      },
      OTHER: {
        title: "अन्य तकनीकी समस्या",
        desc: "कुछ भी अन्य जिसके लिए तकनीकी ध्यान या सहायता की आवश्यकता है",
      },
    },

    // Step 2
    step2Tag: "चरण 2",
    step2Title: "यह समस्या पोर्टल के आपके उपयोग को कितनी गंभीरता से प्रभावित करती है?",
    chooseImpact: "प्रभाव का स्तर चुनें",
    severities: {
      LOW: {
        title: "निम्न (Low)",
        level: "स्तर 1",
        desc: "मामूली सौंदर्य या सुविधा संबंधी",
      },
      MEDIUM: {
        title: "मध्यम (Medium)",
        level: "स्तर 2",
        desc: "सुविधा समाधान के साथ काम कर रही है",
      },
      HIGH: {
        title: "उच्च (High)",
        level: "स्तर 3",
        desc: "महत्वपूर्ण सुविधा पूरी तरह से अवरुद्ध है",
      },
      CRITICAL: {
        title: "गंभीर (Critical)",
        level: "स्तर 4",
        desc: "पोर्टल या सेवा तक पहुंचने में असमर्थ",
      },
    },

    // Step 3
    step3Tag: "चरण 3",
    step3Title: "हमें बताएं कि क्या हुआ",
    problemSummaryLabel: "समस्या सारांश / शीर्षक",
    problemSummaryPlaceholder: "उदा., 'जमा करें पर क्लिक करने के बाद दान फ़ॉर्म नहीं खुल रहा है'",
    problemSummaryHelper: "विशिष्ट और संक्षिप्त रहें",
    whatHappenedLabel: "क्या हुआ?",
    whatHappenedPlaceholder: "कृपया आपके द्वारा उठाए गए कदमों, क्या हुआ और स्क्रीन पर दिखी किसी त्रुटि का वर्णन करें...",
    whatHappenedHelper: "याद रखे गए विवरण शामिल करें",
    expectedVsActualTitle: "अतिरिक्त संदर्भ: अपेक्षित बनाम वास्तविक व्यवहार (वैकल्पिक)",
    expectedLabel: "आप क्या होने की उम्मीद कर रहे थे? (वैकल्पिक)",
    expectedPlaceholder: "उदा. पुष्टि ईमेल प्राप्त करना",
    actualLabel: "इसके बजाय वास्तव में क्या हुआ? (वैकल्पिक)",
    actualPlaceholder: "उदा. स्क्रीन लगातार लोड होती रही",

    // Screenshot
    screenshotTitle: "स्क्रीनशॉट संलग्न करें (वैकल्पिक)",
    screenshotLimit: "PNG, JPG, या WebP 5MB तक",
    clickToUpload: "छवि स्क्रीनशॉट अपलोड करने के लिए क्लिक करें",
    dragDropHelp: "कंप्यूटर या फ़ोन से फ़ोटो खींचें या ब्राउज़ करें",
    removeScreenshot: "स्क्रीनशॉट हटाएं",

    // Diagnostics
    diagnosticsTitle: "वास्तविक डिवाइस डायग्नोस्टिक्स (स्वचालित रूप से कैप्चर)",
    diagnosticsDesc: "समस्याओं का शीघ्र निदान और समाधान करने के लिए, हम आपकी रिपोर्ट के साथ वास्तविक ब्राउज़र तकनीकी विशेषताएं शामिल करते हैं। पासवर्ड जैसी गोपनीय जानकारी कभी कैप्चर नहीं की जाती है।",
    viewCapturedData: "कैप्चर किया गया डेटा देखें",
    hideCapturedData: "विवरण छिपाएं",
    diagBrowser: "ब्राउज़र",
    diagOS: "ऑपरेटिंग सिस्टम",
    diagDevice: "डिवाइस प्रकार",
    diagViewport: "रिज़ॉल्यूशन",
    diagTimezone: "समय क्षेत्र",
    diagConnection: "कनेक्शन",

    // Buttons
    cancelBtn: "रद्द करें",
    submitReportBtn: "समस्या रिपोर्ट सबमिट करें",
    submittingBtn: "रिपोर्ट सबमिट हो रही है...",
    uploadingScreenshotBtn: "स्क्रीनशॉट अपलोड हो रहा है...",

    // Alerts & Banners
    successTitle: "धन्यवाद! आपकी रिपोर्ट दर्ज कर ली गई है।",
    successDesc: "हमारी तकनीकी टीम को आपका विवरण और डायग्नोस्टिक्स प्राप्त हो गए हैं। हम इस पर काम कर रहे हैं!",
    referenceIdLabel: "संदर्भ आईडी:",
    trackStatusBtn: "मेरी रिपोर्ट में स्थिति ट्रैक करें →",
    noticeLabel: "सूचना:",

    // Urgent card
    needHelpTitle: "क्या आपको अपने चर्च खाते में तुरंत सहायता चाहिए?",
    needHelpDesc: "आप हमारे प्रमुख सहायता समन्वयक से सीधे ईमेल या फ़ोन द्वारा संपर्क कर सकते हैं।",
    emailSupport: "ईमेल सहायता",
    callSupport: "कॉल करें: +91 9505288171",

    // Modal
    modalDescription: "विवरण",
    modalExpected: "अपेक्षित व्यवहार",
    modalActual: "वास्तविक व्यवहार",
    modalScreenshot: "संलग्न स्क्रीनशॉट",
    modalSubmittedOn: "सबमिट किया गया",
    modalClose: "बंद करें",

    // Statuses
    statuses: {
      OPEN: "प्राप्त हुआ",
      INVESTIGATING: "जांच जारी है",
      IN_PROGRESS: "प्रगति पर है",
      RESOLVED: "हल हो गया",
      CLOSED: "बंद कर दिया",
      DUPLICATE: "डुप्लिकेट",
    }
  }
};

// Base Categories with Visual Theming
const BASE_ISSUE_CATEGORIES = [
  {
    id: "SOMETHING_IS_BROKEN",
    defaultLabel: "Something is Broken",
    defaultDesc: "A button, form, or action isn't responding",
    icon: AlertTriangle,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/20",
    glowColor: "group-hover:border-rose-300 dark:group-hover:border-rose-700",
  },
  {
    id: "PAGE_NOT_LOADING",
    defaultLabel: "Page Not Loading",
    defaultDesc: "Page hangs, blank screen, or fails to fetch",
    icon: Globe,
    iconColor: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-500/10 dark:bg-sky-500/20 border-sky-500/20",
    glowColor: "group-hover:border-sky-300 dark:group-hover:border-sky-700",
  },
  {
    id: "LOGIN_ACCOUNT",
    defaultLabel: "Login & Account",
    defaultDesc: "Trouble signing in, profile, or session expired",
    icon: ShieldAlert,
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/20",
    glowColor: "group-hover:border-violet-300 dark:group-hover:border-violet-700",
  },
  {
    id: "MOBILE_RESPONSIVE",
    defaultLabel: "Mobile Display Issue",
    defaultDesc: "Content cut off or overlapping on phones/tablets",
    icon: Smartphone,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20",
    glowColor: "group-hover:border-amber-300 dark:group-hover:border-amber-700",
  },
  {
    id: "WEBSITE_DISPLAY",
    defaultLabel: "Display & Styling",
    defaultDesc: "Visual glitches, colors, or misaligned layouts",
    icon: Monitor,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/20",
    glowColor: "group-hover:border-indigo-300 dark:group-hover:border-indigo-700",
  },
  {
    id: "NETWORK_CONNECTION",
    defaultLabel: "Network & Sync",
    defaultDesc: "Slow requests, timeout, or offline problems",
    icon: WifiOff,
    iconColor: "text-cyan-600 dark:text-cyan-400",
    iconBg: "bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/20",
    glowColor: "group-hover:border-cyan-300 dark:group-hover:border-cyan-700",
  },
  {
    id: "BUG_UNEXPECTED",
    defaultLabel: "Unexpected Error",
    defaultDesc: "An error dialog or unhandled exception occurred",
    icon: Bug,
    iconColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-500/10 dark:bg-red-500/20 border-red-500/20",
    glowColor: "group-hover:border-red-300 dark:group-hover:border-red-700",
  },
  {
    id: "SUGGESTION",
    defaultLabel: "Suggestion / Feedback",
    defaultDesc: "Ideas to enhance the portal experience",
    icon: Sparkles,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20",
    glowColor: "group-hover:border-emerald-300 dark:group-hover:border-emerald-700",
  },
  {
    id: "OTHER",
    defaultLabel: "Other Technical Issue",
    defaultDesc: "Anything else that needs technical attention",
    icon: HelpCircle,
    iconColor: "text-slate-600 dark:text-slate-400",
    iconBg: "bg-slate-500/10 dark:bg-slate-500/20 border-slate-500/20",
    glowColor: "group-hover:border-slate-300 dark:group-hover:border-slate-700",
  },
];

// Base Severities
const BASE_SEVERITIES = [
  {
    id: "LOW",
    defaultLabel: "Low",
    defaultBadge: "Minor aesthetic or convenience",
    activeClass: "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/30",
    dotClass: "bg-emerald-500",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    id: "MEDIUM",
    defaultLabel: "Medium",
    defaultBadge: "Feature works with workaround",
    activeClass: "border-amber-500 bg-amber-500/10 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/30",
    dotClass: "bg-amber-500",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  {
    id: "HIGH",
    defaultLabel: "High",
    defaultBadge: "Important feature completely blocked",
    activeClass: "border-orange-500 bg-orange-500/10 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 ring-2 ring-orange-500/30",
    dotClass: "bg-orange-500",
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30",
  },
  {
    id: "CRITICAL",
    defaultLabel: "Critical",
    defaultBadge: "Unable to access portal or service",
    activeClass: "border-rose-500 bg-rose-500/10 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/30",
    dotClass: "bg-rose-500",
    color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
  },
];

const STATUS_ICONS: Record<string, any> = {
  OPEN: Clock,
  INVESTIGATING: Search,
  IN_PROGRESS: RefreshCw,
  RESOLVED: CheckCircle,
  CLOSED: Check,
  DUPLICATE: AlertCircle,
};

interface MemberReport {
  reportId: string;
  category: string;
  title: string;
  description: string;
  expectedBehavior?: string | null;
  actualBehavior?: string | null;
  severity: string;
  status: string;
  pagePath?: string | null;
  pageTitle?: string | null;
  browser?: string | null;
  operatingSystem?: string | null;
  deviceType?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  screenshotUrl?: string | null;
}

export default function MemberReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, formatDate } = useLanguage();

  // Active translation dictionary
  const rt = reportTranslations[language as keyof typeof reportTranslations] || reportTranslations.en;

  // Tab state: 'submit' | 'history'
  const [activeTab, setActiveTab] = useState<"submit" | "history">("submit");

  // Diagnostics captured
  const [diagnostics, setDiagnostics] = useState<BrowserDiagnostics | null>(null);
  const [showDiagnosticsDetail, setShowDiagnosticsDetail] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Form states
  const [category, setCategory] = useState<string>("SOMETHING_IS_BROKEN");
  const [severity, setSeverity] = useState<string>("MEDIUM");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [expectedBehavior, setExpectedBehavior] = useState<string>("");
  const [actualBehavior, setActualBehavior] = useState<string>("");

  // Screenshot upload
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // History state
  const [reports, setReports] = useState<MemberReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MemberReport | null>(null);

  // Initial diagnostics capture and error digest parsing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const diag = captureBrowserDiagnostics();
      setDiagnostics(diag);

      // Pre-fill from query params if navigated from error boundary
      const source = searchParams?.get("source");
      const errorDigest = searchParams?.get("errorDigest");
      if (source === "error_boundary") {
        setCategory("BUG_UNEXPECTED");
        setSeverity("HIGH");
        setTitle(`Application Error (Digest: ${errorDigest || "system"})`);
        setDescription("An unexpected application error occurred while using the portal. Details have been captured.");
      }
    }
  }, [searchParams]);

  // Load member's reports
  const fetchMyReports = useCallback(async () => {
    if (!user) return;
    setIsLoadingReports(true);
    try {
      const res = await fetch("/api/member/reports?limit=25");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setIsLoadingReports(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchMyReports();
    }
  }, [activeTab, fetchMyReports]);

  // Handle Screenshot selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processSelectedFile(file);
  };

  const processSelectedFile = (file?: File | null) => {
    if (!file) return;

    // Check size <= 5MB
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Screenshot exceeds 5MB limit. Please choose a smaller image.");
      return;
    }

    // Check format
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSubmitError("Please upload a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    setScreenshotFile(file);
    setSubmitError(null);

    // Generate local preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshotPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setScreenshotUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setDuplicateWarning(null);

    if (!title.trim() || title.trim().length < 3) {
      setSubmitError("Please enter a descriptive problem summary (at least 3 characters).");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setSubmitError("Please describe what happened with at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalScreenshotUrl: string | null = screenshotUrl;

      // If screenshot file selected but not yet uploaded, upload first
      if (screenshotFile && !finalScreenshotUrl) {
        setIsUploadingScreenshot(true);
        const formData = new FormData();
        formData.append("file", screenshotFile);

        const uploadRes = await fetch("/api/member/reports/upload-screenshot", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalScreenshotUrl = uploadData.url;
          setScreenshotUrl(finalScreenshotUrl);
        } else {
          console.warn("Screenshot upload failed, proceeding with report submission.");
        }
        setIsUploadingScreenshot(false);
      }

      // Collect real client error context
      const errorCtx = getRecentErrorContext();
      const currentDiag = captureBrowserDiagnostics();

      const payload = {
        category,
        title: title.trim(),
        description: description.trim(),
        expectedBehavior: expectedBehavior.trim() || undefined,
        actualBehavior: actualBehavior.trim() || undefined,
        severity,
        pageUrl: currentDiag.currentUrl,
        pagePath: currentDiag.pathname,
        pageTitle: currentDiag.pageTitle,
        referrer: currentDiag.referrer,
        browser: currentDiag.browser,
        browserVersion: currentDiag.browserVersion,
        operatingSystem: currentDiag.operatingSystem,
        deviceType: currentDiag.deviceType,
        viewportWidth: currentDiag.viewportWidth,
        viewportHeight: currentDiag.viewportHeight,
        screenWidth: currentDiag.screenWidth,
        screenHeight: currentDiag.screenHeight,
        timezone: currentDiag.timezone,
        language: currentDiag.language,
        onlineStatus: currentDiag.onlineStatus,
        connectionType: currentDiag.connectionType,
        appVersion: currentDiag.appVersion,
        errorType: errorCtx.errorType || undefined,
        errorMessageSanitized: errorCtx.errorMessage || undefined,
        screenshotUrl: finalScreenshotUrl || undefined,
      };

      const res = await fetch("/api/member/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report. Please try again.");
      }

      if (data.isDuplicate) {
        setDuplicateWarning(data.duplicateWarning);
      }

      setSubmittedReportId(data.reportId || data.report?.reportId);
      // Reset form fields
      setTitle("");
      setDescription("");
      setExpectedBehavior("");
      setActualBehavior("");
      removeScreenshot();
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
      setIsUploadingScreenshot(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-50 dark:from-slate-950 dark:via-slate-900/80 dark:to-slate-950 text-slate-900 dark:text-slate-100 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Navigation Breadcrumb, Language Selector & QA Pill */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => router.push("/member")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors p-1 -ml-1 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[170px] xs:max-w-xs">{rt.backToPortal}</span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle align="right" />
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{rt.qualityAssurance}</span>
            </span>
          </div>
        </div>

        {/* Hero Header Banner with Royal Ambient Orbs */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5 p-4 sm:p-7 md:p-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-purple-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div className="p-2.5 sm:p-3.5 bg-gradient-to-br from-rose-500/10 via-purple-500/15 to-indigo-500/20 text-rose-600 dark:text-rose-400 rounded-xl sm:rounded-2xl border border-rose-500/20 shadow-sm shrink-0">
                <Bug className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight" aria-label="Report a Problem">
                  {rt.reportProblemTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mt-1">
                  {rt.reportProblemDesc}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
              <a
                href="tel:+919505288171"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition-all shadow-xs"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{rt.urgentSupport} +919505288171</span>
              </a>
            </div>
          </div>

          {/* Segmented Pill Tabs Navigation */}
          <div className="relative z-10 flex border-b border-slate-200/80 dark:border-slate-800 mt-5 sm:mt-8 -mb-2 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("submit")}
              aria-label="Submit Report"
              className={`pb-3 px-2.5 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                activeTab === "submit"
                  ? "border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>{rt.tabSubmit}</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              aria-label="My Submitted Reports"
              className={`pb-3 px-2.5 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                activeTab === "history"
                  ? "border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>{rt.tabHistory}</span>
              {reports.length > 0 && (
                <span className="ml-1 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {reports.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: SUBMIT REPORT */}
        {activeTab === "submit" && (
          <div className="space-y-4 sm:space-y-6">

            {/* Submission Success Banner */}
            {submittedReportId && (
              <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-emerald-950 dark:text-emerald-200 shadow-md">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
                    <h3 className="font-extrabold text-base sm:text-xl text-slate-900 dark:text-white leading-tight">
                      {rt.successTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rt.successDesc}
                    </p>
                    <div className="pt-2 flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3">
                      <span className="font-mono text-xs font-bold px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-xl border border-emerald-300 dark:border-emerald-700 inline-block w-fit">
                        {rt.referenceIdLabel} {submittedReportId}
                      </span>
                      <button
                        onClick={() => {
                          setSubmittedReportId(null);
                          setActiveTab("history");
                        }}
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-900 dark:hover:text-emerald-100 text-left"
                      >
                        {rt.trackStatusBtn}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Duplicate Notice Banner */}
            {duplicateWarning && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-amber-900 dark:text-amber-200 flex items-start gap-2.5 text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{rt.noticeLabel}</span> {duplicateWarning}
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-rose-900 dark:text-rose-200 flex items-center gap-2.5 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
                <span className="font-medium">{submitError}</span>
              </div>
            )}

            {/* Main Interactive Form Card */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-9 space-y-6 sm:space-y-8 shadow-xl shadow-slate-900/5">
              
              {/* SECTION 1: Issue Classification */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">{rt.step1Tag}</span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {rt.step1Title} <span className="text-rose-500">*</span>
                    </h2>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-400">{rt.selectOne}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {BASE_ISSUE_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    const localized = rt.categories[cat.id as keyof typeof rt.categories];
                    const label = localized ? localized.title : cat.defaultLabel;
                    const desc = localized ? localized.desc : cat.defaultDesc;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        aria-label={cat.defaultLabel}
                        className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 ${
                          isSelected
                            ? "border-purple-600 dark:border-purple-400 bg-purple-50/60 dark:bg-purple-950/40 ring-2 ring-purple-600/20 shadow-md shadow-purple-950/5 scale-[1.01]"
                            : `border-slate-200/90 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 hover:bg-slate-50/80 dark:hover:bg-slate-850 bg-slate-50/40 dark:bg-slate-900/40`
                        }`}
                      >
                        <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 transition-transform group-hover:scale-110 ${cat.iconBg}`}>
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${cat.iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1 pr-6 sm:pr-0">
                          <div className={`text-xs sm:text-sm font-bold leading-tight ${isSelected ? "text-purple-950 dark:text-purple-200" : "text-slate-900 dark:text-slate-100"}`}>
                            {label}
                          </div>
                          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed line-clamp-2">
                            {desc}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-sm">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: Impact / Severity Rating */}
              <div className="space-y-3 sm:space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">{rt.step2Tag}</span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {rt.step2Title} <span className="text-rose-500">*</span>
                    </h2>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-400">{rt.chooseImpact}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {BASE_SEVERITIES.map((sev) => {
                    const isSelected = severity === sev.id;
                    const localized = rt.severities[sev.id as keyof typeof rt.severities];
                    const label = localized ? localized.title : sev.defaultLabel;
                    const desc = localized ? localized.desc : sev.defaultBadge;

                    return (
                      <button
                        key={sev.id}
                        type="button"
                        onClick={() => setSeverity(sev.id)}
                        aria-label={sev.defaultLabel}
                        className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[68px] sm:min-h-[84px] ${
                          isSelected
                            ? sev.activeClass
                            : "border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40"
                        }`}
                      >
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                          <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${sev.dotClass} ${sev.id === "CRITICAL" ? "animate-ping" : ""}`} />
                          <span className="text-xs sm:text-sm font-extrabold">{label}</span>
                        </div>
                        <div className="text-[10px] sm:text-[11px] opacity-75 leading-tight line-clamp-2">
                          {desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: Problem Details */}
              <div className="space-y-4 sm:space-y-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">{rt.step3Tag}</span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {rt.step3Title}
                  </h2>
                </div>

                {/* Title Input */}
                <div className="space-y-1.5">
                  <label htmlFor="issue-title" className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200">
                    {rt.problemSummaryLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="issue-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={rt.problemSummaryPlaceholder}
                    maxLength={150}
                    required
                    className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                  <div className="flex justify-between text-[11px] sm:text-xs text-slate-400 px-1">
                    <span className="truncate">{rt.problemSummaryHelper}</span>
                    <span className="shrink-0">{title.length}/150</span>
                  </div>
                </div>

                {/* Description Input */}
                <div className="space-y-1.5">
                  <label htmlFor="issue-description" className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200">
                    {rt.whatHappenedLabel} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="issue-description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={rt.whatHappenedPlaceholder}
                    maxLength={3000}
                    required
                    className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all leading-relaxed"
                  />
                  <div className="flex justify-between text-[11px] sm:text-xs text-slate-400 px-1">
                    <span className="truncate">{rt.whatHappenedHelper}</span>
                    <span className="shrink-0">{description.length}/3000</span>
                  </div>
                </div>

                {/* Optional: Expandable Expected vs Actual Behavior Accordion */}
                <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 p-3 sm:p-4">
                  <button
                    type="button"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="truncate">{rt.expectedVsActualTitle}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${showOptionalFields ? "rotate-180" : ""}`} />
                  </button>

                  {showOptionalFields && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800">
                      <div className="space-y-1">
                        <label htmlFor="expected-behavior" className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {rt.expectedLabel}
                        </label>
                        <input
                          id="expected-behavior"
                          type="text"
                          value={expectedBehavior}
                          onChange={(e) => setExpectedBehavior(e.target.value)}
                          placeholder={rt.expectedPlaceholder}
                          maxLength={500}
                          className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="actual-behavior" className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {rt.actualLabel}
                        </label>
                        <input
                          id="actual-behavior"
                          type="text"
                          value={actualBehavior}
                          onChange={(e) => setActualBehavior(e.target.value)}
                          placeholder={rt.actualPlaceholder}
                          maxLength={500}
                          className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Screenshot Attachment Dropzone */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200">
                      {rt.screenshotTitle}
                    </label>
                    <span className="text-[11px] sm:text-xs text-slate-400">{rt.screenshotLimit}</span>
                  </div>

                  {screenshotPreview ? (
                    <div className="relative inline-block border-2 border-purple-500/30 rounded-xl sm:rounded-2xl overflow-hidden p-2 sm:p-3 bg-purple-50/30 dark:bg-purple-950/20 shadow-sm max-w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={screenshotPreview}
                        alt="Screenshot preview"
                        className="max-h-48 sm:max-h-56 max-w-full rounded-lg sm:rounded-xl object-contain shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={removeScreenshot}
                        className="absolute top-3 right-3 p-1.5 sm:p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                        title={rt.removeScreenshot}
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        processSelectedFile(file);
                      }}
                      className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-5 sm:p-7 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                        isDragging
                          ? "border-purple-500 bg-purple-500/10 scale-[1.01]"
                          : "border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-purple-50/20 dark:hover:bg-purple-950/20"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 sm:mb-3">
                        <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {rt.clickToUpload}
                      </span>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                        {rt.dragDropHelp}
                      </p>
                    </div>
                  )}
                </div>

                {/* Real-time Diagnostics Transparency Box */}
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <Laptop className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {rt.diagnosticsTitle}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDiagnosticsDetail(!showDiagnosticsDetail)}
                      aria-label="View Captured Data"
                      className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline shrink-0"
                    >
                      {showDiagnosticsDetail ? rt.hideCapturedData : rt.viewCapturedData}
                    </button>
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {rt.diagnosticsDesc}
                  </p>

                  {showDiagnosticsDetail && diagnostics && (
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 min-w-0">
                        <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">{rt.diagBrowser}</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold truncate block" title={`${diagnostics.browser} ${diagnostics.browserVersion || ""}`}>
                          {diagnostics.browser} {diagnostics.browserVersion || ""}
                        </span>
                      </div>
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 min-w-0">
                        <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">{rt.diagOS}</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold truncate block" title={diagnostics.operatingSystem}>
                          {diagnostics.operatingSystem}
                        </span>
                      </div>
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 min-w-0">
                        <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">{rt.diagDevice}</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold capitalize truncate block">
                          {diagnostics.deviceType}
                        </span>
                      </div>
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 min-w-0">
                        <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">{rt.diagViewport}</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold truncate block">
                          {diagnostics.viewportWidth} × {diagnostics.viewportHeight}
                        </span>
                      </div>
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 min-w-0">
                        <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">{rt.diagTimezone}</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold truncate block" title={diagnostics.timezone}>
                          {diagnostics.timezone}
                        </span>
                      </div>
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 min-w-0">
                        <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">{rt.diagConnection}</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold truncate block">
                          {diagnostics.connectionType || (diagnostics.onlineStatus ? "Online" : "Offline")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Form Action Buttons with Radiant Gradient */}
              <div className="pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => router.push("/member")}
                  className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors text-center"
                >
                  {rt.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingScreenshot}
                  aria-label="Submit Problem Report"
                  className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-700 hover:via-indigo-700 hover:to-violet-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting || isUploadingScreenshot ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isUploadingScreenshot ? rt.uploadingScreenshotBtn : rt.submittingBtn}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{rt.submitReportBtn}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Direct Contact Support Card */}
            <div className="bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 border border-purple-200/60 dark:border-purple-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5 shadow-sm">
              <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
                <div className="p-2.5 sm:p-3 bg-purple-600 text-white rounded-xl sm:rounded-2xl shrink-0 shadow-md shadow-purple-600/20">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                    {rt.needHelpTitle}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {rt.needHelpDesc}
                  </p>
                </div>
              </div>
              <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2 sm:gap-3 text-xs font-bold w-full md:w-auto shrink-0">
                <a
                  href="mailto:codewithrahul3@gmail.com?subject=KCM%20Portal%20Support%20Request"
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors text-center"
                >
                  {rt.emailSupport}
                </a>
                <a
                  href="tel:+919505288171"
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/25 transition-all text-center"
                >
                  {rt.callSupport}
                </a>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MY SUBMITTED REPORTS */}
        {activeTab === "history" && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate" aria-label="Your Submitted Reports">
                  {rt.historyHeading} ({reports.length})
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {rt.historyDesc}
                </p>
              </div>
              <button
                onClick={fetchMyReports}
                disabled={isLoadingReports}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-purple-600 dark:text-purple-400 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1.5 font-bold shadow-sm transition-all shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReports ? "animate-spin" : ""}`} />
                <span>{rt.refreshBtn}</span>
              </button>
            </div>

            {isLoadingReports ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-14 text-center shadow-sm">
                <Loader2 className="w-8 h-8 sm:w-9 sm:h-9 animate-spin mx-auto text-purple-600 mb-3" />
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">{rt.loadingReports}</p>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1">{rt.connectingDb}</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-14 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{rt.noReportsTitle}</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {rt.noReportsDesc}
                </p>
                <button
                  onClick={() => setActiveTab("submit")}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all"
                >
                  <Bug className="w-4 h-4" />
                  <span>{rt.submitFirstReportBtn}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                {reports.map((rep) => {
                  const StatusIcon = STATUS_ICONS[rep.status] || Clock;
                  const localizedStatus = rt.statuses[rep.status as keyof typeof rt.statuses] || rep.status;
                  const severityConfig = BASE_SEVERITIES.find((s) => s.id === rep.severity);
                  const localizedSev = rt.severities[rep.severity as keyof typeof rt.severities];

                  return (
                    <div
                      key={rep.reportId}
                      onClick={() => setSelectedReport(rep)}
                      className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 rounded-xl sm:rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="font-mono text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-md sm:rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
                            {rep.reportId}
                          </span>
                          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30">
                            <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {localizedStatus}
                          </span>
                          {severityConfig && (
                            <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full border font-semibold ${severityConfig.color}`}>
                              {localizedSev ? localizedSev.title : severityConfig.defaultLabel}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {rep.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {rep.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs text-slate-400 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                        <div className="text-left sm:text-right">
                          <div className="text-slate-600 dark:text-slate-300 font-medium text-[11px] sm:text-xs">
                            {formatDate(rep.createdAt)}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-400">
                            {new Date(rep.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/40 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Member Safe Report Detail Modal (Bottom Drawer on Mobile, Centered Modal on Desktop) */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {selectedReport.reportId}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full border font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30">
                      {rt.statuses[selectedReport.status as keyof typeof rt.statuses] || selectedReport.status}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white mt-2 leading-snug">
                    {selectedReport.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">{rt.modalDescription}</span>
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedReport.description}
                  </div>
                </div>

                {(selectedReport.expectedBehavior || selectedReport.actualBehavior) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {selectedReport.expectedBehavior && (
                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">{rt.modalExpected}</span>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs">
                          {selectedReport.expectedBehavior}
                        </div>
                      </div>
                    )}
                    {selectedReport.actualBehavior && (
                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">{rt.modalActual}</span>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs">
                          {selectedReport.actualBehavior}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedReport.screenshotUrl && (
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">{rt.modalScreenshot}</span>
                    <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden p-2 bg-slate-50 dark:bg-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedReport.screenshotUrl}
                        alt="Issue Screenshot"
                        className="max-h-48 sm:max-h-60 max-w-full rounded-lg sm:rounded-xl object-contain mx-auto"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-400 text-[10px] sm:text-[11px] gap-2">
                  <span className="truncate">{rt.modalSubmittedOn} {formatDate(selectedReport.createdAt)}</span>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all shrink-0"
                  >
                    {rt.modalClose}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
