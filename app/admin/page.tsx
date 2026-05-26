"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  Users, 
  IndianRupee, 
  Sliders, 
  TrendingUp, 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Printer, 
  AlertCircle,
  LogOut,
  ChevronRight,
  Settings,
  MailCheck,
  RefreshCw
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

const adminTranslations = {
  en: {
    portalName: "KCM Console",
    roleName: "System Admin",
    welcome: "Welcome, Chief Admin",
    signOut: "Sign Out",
    rootControl: "Kingdom System Root Control",
    panelTitle: "System Administration",
    panelDesc: "Review user databases, instantly promote pastors/administrators, analyze secure Razorpay donations reports, and adjust church ministry variables.",
    tabUsers: "User Role Manager",
    tabFinancials: "Donations Ledger",
    tabSettings: "System Variable Board",
    searchUsers: "Filter by believer name, email, or telephone...",
    filterRoles: "Filter by Roles (All)",
    roleMember: "Believers (MEMBER)",
    rolePastor: "Shepherds (PASTOR)",
    roleAdmin: "Command Center (ADMIN)",
    loadingUsers: "Querying platform members...",
    noUsers: "No Matching Users",
    noUsersDesc: "Try modifying your text filters or selecting another role from the dropdown.",
    updating: "Updating...",
    changeRole: "Change Platform Role",
    totalIncome: "Aggregate Income",
    tithesLedger: "Tithes Ledger",
    worshipOfferings: "Worship Offerings",
    ledgerVolume: "Ledger Volume",
    searchLedger: "Search ledger by donor name, email, order ID...",
    allCategories: "All Categories",
    titheOnly: "Tithe Only",
    offeringOnly: "Offering Only",
    btnPrint: "Print Statement",
    colDonor: "Donor Information",
    colOrder: "Order & Tx IDs",
    colCategory: "Offering Type",
    colAmount: "Amount (INR)",
    colDate: "Date",
    colReceipt: "Receipt",
    btnSync: "Sync Systems",
    btnSave: "Save Settings",
    authenticating: "Authenticating Administrator Console...",
    systemSettings: "System Settings",
    systemSettingsDesc: "Configure global app parameters & database configurations",
    contactEmail: "Primary Contact / Support Email *",
    contactEmailDesc: "Used across the public homepage, footer, email updates, and tax receipt generation fields.",
    maintenanceMode: "Maintenance Override Mode",
    maintenanceModeDesc: "Toggles a full-screen maintenance message for all non-admin believers.",
    allowRegistrations: "Allow Public Registrations",
    allowRegistrationsDesc: "Enables users to sign up and establish new member portals.",
    saving: "Saving configurations...",
    syncSuccess: "System synchronization complete!",
    syncNotice: "Notice:",
    noFinancials: "No Financial Transactions",
    noFinancialsDesc: "No completed donation checkout slips match your active search terms.",
    statementTitle: "ANNUAL FINANCIAL STATEMENT & DONATION AUDIT LEDGER",
    incomeSub: "Aggregated Completed Transactions",
    tithesSub: "10% spiritual offerings total",
    offeringsSub: "Sunday & weekly offerings total",
    ledgerSub: "Completed checkout orders count",
    successRole: "User role successfully updated to"
  },
  te: {
    portalName: "కింగ్డమ్ ఆఫ్ క్రైస్ట్ కన్సోల్",
    roleName: "సిస్టమ్ అడ్మిన్",
    welcome: "స్వాగతం, చీఫ్ అడ్మిన్",
    signOut: "లాగ్ అవుట్",
    rootControl: "కింగ్డమ్ సిస్టమ్ రూట్ కంట్రోల్",
    panelTitle: "సిస్టమ్ అడ్మినిస్ట్రేషన్",
    panelDesc: "యూజర్ డేటాబేస్‌లను సమీక్షించండి, పాస్టర్లను/అడ్మిన్లను ప్రమోట్ చేయండి, రేజర్‌పే విరాళాల నివేదికలను విశ్లేషించండి మరియు సిస్టమ్ వేరియబుల్స్ సర్దుబాటు చేయండి.",
    tabUsers: "యూజర్ రోల్ మేనేజర్",
    tabFinancials: "విరాళాల రిజిస్టర్",
    tabSettings: "సిస్టమ్ వేరియబుల్ బోర్డు",
    searchUsers: "విశ్వాసి పేరు, ఇమెయిల్ లేదా ఫోన్ ద్వారా శోధించండి...",
    filterRoles: "రోల్స్ ద్వారా ఫిల్టర్ చేయండి (అన్నీ)",
    roleMember: "విశ్వాసులు (MEMBER)",
    rolePastor: "పాస్టర్లు (PASTOR)",
    roleAdmin: "సిస్టమ్ అడ్మిన్ (ADMIN)",
    loadingUsers: "సభ్యుల జాబితాను క్వెరీ చేస్తోంది...",
    noUsers: "సరిపోలే వినియోగదారులు లేరు",
    noUsersDesc: "మీ వచన ఫిల్టర్‌లను సవరించడానికి లేదా డ్రాప్‌డౌన్ నుండి మరొక పాత్రను ఎంచుకోవడానికి ప్రయత్నించండి.",
    updating: "నవీకరిస్తోంది...",
    changeRole: "ప్లాట్‌ఫారమ్ రోల్‌ను మార్చండి",
    totalIncome: "మొత్తం ఆదాయం",
    tithesLedger: "దశమభాగాల రిజిస్టర్",
    worshipOfferings: "ఆరాధన కానుకలు",
    ledgerVolume: "లావాదేవీల సంఖ్య",
    searchLedger: "దాత పేరు, ఇమెయిల్ లేదా ఆర్డర్ ID ద్వారా శోధించండి...",
    allCategories: "అన్ని విభాగాలు",
    titheOnly: "దశమభాగాలు మాత్రమే",
    offeringOnly: "కానుకలు మాత్రమే",
    btnPrint: "స్టేట్‌మెంట్ ప్రింట్ చేయండి",
    colDonor: "దాత సమాచారం",
    colOrder: "ఆర్డర్ & లావాదేవీ IDలు",
    colCategory: "కానుక రకం",
    colAmount: "మొత్తం (INR)",
    colDate: "తేదీ",
    colReceipt: "రసీదు",
    btnSync: "సిస్టమ్స్ సింక్ చేయండి",
    btnSave: "సెట్టింగులను సేవ్ చేయి",
    authenticating: "అడ్మినిస్ట్రేటర్ కన్సోల్‌ను ధృవీకరిస్తోంది...",
    systemSettings: "సిస్టమ్ సెట్టింగులు",
    systemSettingsDesc: "గ్లోబల్ యాప్ పారామితులు & డేటాబేస్ కాన్ఫిగరేషన్‌లను కాన్ఫిగర్ చేయండి",
    contactEmail: "ప్రాథమిక సంప్రదింపు ఇమెయిల్ *",
    contactEmailDesc: "పబ్లిక్ హోమ్‌పేజీ, ఫుటర్, ఇమెయిల్ అప్‌డేట్‌లు మరియు పన్ను రసీదు జనరేషన్ ఫీల్డ్‌లలో ఉపయోగించబడుతుంది.",
    maintenanceMode: "మెయింటెనెన్స్ ఓవర్‌రైడ్ మోడ్",
    maintenanceModeDesc: "అడ్మిన్ కాని విశ్వాసులందరికీ పూర్తి స్క్రీన్ మెయింటెనెన్స్ సందేశాన్ని చూపుతుంది.",
    allowRegistrations: "పబ్లిక్ రిజిస్ట్రేషన్లను అనుమతించు",
    allowRegistrationsDesc: "వినియోగదారులు సైన్ అప్ చేయడానికి మరియు కొత్త సభ్యుల పోర్టల్‌లను సృష్టించడానికి అనుమతిస్తుంది.",
    saving: "కాన్ఫిగరేషన్‌లను సేవ్ చేస్తోంది...",
    syncSuccess: "సిస్టమ్ సింక్రొనైజేషన్ పూర్తయింది!",
    syncNotice: "గమనిక:",
    noFinancials: "ఆర్థిక లావాదేవీలు లేవు",
    noFinancialsDesc: "మీ శోధనకు సరిపోయే పూర్తయిన విరాళాల రసీదులు ఏవీ లేవు.",
    statementTitle: "వార్షిక ఆర్థిక ప్రకటన & విరాళాల ఆడిట్ రిజిస్టర్",
    incomeSub: "పూర్తయిన మొత్తం లావాదేవీలు",
    tithesSub: "10% దశమభాగాల మొత్తం",
    offeringsSub: "ఆదివారం & వారంతపు కానుకల మొత్తం",
    ledgerSub: "పూర్తయిన ఆర్డర్‌ల సంఖ్య",
    successRole: "వినియోగదారు రోల్ విజయవంతంగా దీనికి నవీకరించబడింది:"
  },
  hi: {
    portalName: "केसीएम कंसोल",
    roleName: "सिस्टम एडमिन",
    welcome: "स्वागत है, मुख्य एडमिन",
    signOut: "साइन आउट",
    rootControl: "किंगडम सिस्टम रूट कंट्रोल",
    panelTitle: "सिस्टम प्रशासन",
    panelDesc: "उपयोगकर्ता डेटाबेस की समीक्षा करें, पादरियों/प्रशासकों को बढ़ावा दें, रेज़रपे दान रिपोर्ट का विश्लेषण करें, और सिस्टम चर को समायोजित करें।",
    tabUsers: "भूमिका प्रबंधक",
    tabFinancials: "दान बहीखाता",
    tabSettings: "सिस्टम चर बोर्ड",
    searchUsers: "नाम, ईमेल या फोन द्वारा खोजें...",
    filterRoles: "भूमिकाओं द्वारा फ़िल्टर करें (सभी)",
    roleMember: "विश्वासी (MEMBER)",
    rolePastor: "चरवाहा (PASTOR)",
    roleAdmin: "सिस्टम एडमिन (ADMIN)",
    loadingUsers: "मंच सदस्यों की खोज की जा रही है...",
    noUsers: "कोई मिलानकर्ता नहीं",
    noUsersDesc: "अपने फ़िल्टर बदलने या ड्रॉपडाउन से कोई अन्य भूमिका चुनने का प्रयास करें।",
    updating: "अपडेट किया जा रहा है...",
    changeRole: "भूमिका बदलें",
    totalIncome: "कुल आय",
    tithesLedger: "दशमांश बहीखाता",
    worshipOfferings: "आराधना प्रसाद",
    ledgerVolume: "बहीखाता मात्रा",
    searchLedger: "दाता नाम, ईमेल या ऑर्डर आईडी द्वारा बहीखाता खोजें...",
    allCategories: "सभी श्रेणियां",
    titheOnly: "केवल दशमांश",
    offeringOnly: "केवल प्रसाद",
    btnPrint: "विवरण प्रिंट करें",
    colDonor: "दाता की जानकारी",
    colOrder: "ऑर्डर और भुगतान आईडी",
    colCategory: "प्रसाद प्रकार",
    colAmount: "राशि (INR)",
    colDate: "तारीख",
    colReceipt: "रसीद",
    btnSync: "सिस्टम सिंक करें",
    btnSave: "सेटिंग्स सहेजें",
    authenticating: "प्रशासक कंसोल को सत्यापित किया जा रहा है...",
    systemSettings: "सिस्टम सेटिंग्स",
    systemSettingsDesc: "वैश्विक ऐप मापदंडों और डेटाबेस कॉन्फ़िगरेशन को कॉन्फ़िगर करें",
    contactEmail: "प्राथमिक संपर्क ईमेल *",
    contactEmailDesc: "सार्वजनिक होमपेज, पाद लेख, ईमेल अपडेट और कर रसीद निर्माण क्षेत्रों में उपयोग किया जाता है।",
    maintenanceMode: "रखरखाव मोड",
    maintenanceModeDesc: "सभी गैर-प्रशासक विश्वासियों के लिए एक पूर्ण-स्क्रीन रखरखाव संदेश को सक्षम करता है।",
    allowRegistrations: "सार्वजनिक पंजीकरण की अनुमति दें",
    allowRegistrationsDesc: "उपयोगकर्ताओं को साइन अप करने और नए सदस्य पोर्टल स्थापित करने में सक्षम बनाता है।",
    saving: "कॉन्फ़िगरेशन सहेजा जा रहा है...",
    syncSuccess: "सिस्टम सिंक्रनाइज़ेशन पूरा हुआ!",
    syncNotice: "सूचना:",
    noFinancials: "कोई वित्तीय लेनदेन नहीं",
    noFinancialsDesc: "कोई भी पूर्ण दान रसीद आपके सक्रिय खोज शब्दों से मेल नहीं खाती।",
    statementTitle: "वार्षिक वित्तीय विवरण और दान लेखा परीक्षा बहीखाता",
    incomeSub: "पूर्ण किए गए लेनदेन का योग",
    tithesSub: "10% दशमांश का कुल योग",
    offeringsSub: "रविवार और साप्ताहिक प्रसाद का कुल योग",
    ledgerSub: "पूर्ण किए गए ऑर्डर्स की संख्या",
    successRole: "उपयोगकर्ता की भूमिका सफलतापूर्वक अपडेट की गई:"
  }
};

export default function AdminDashboard() {
  const { user, status, mounted, logout } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const at = adminTranslations[language] || adminTranslations.en;

  // Active Tab
  const [activeTab, setActiveTab] = useState<"users" | "financials" | "settings">("users");

  // State arrays
  const [users, setUsers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  
  // Loading & Messages
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");

  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [donationSearch, setDonationSearch] = useState("");
  const [donationTypeFilter, setDonationTypeFilter] = useState("ALL");

  // Settings State Mock
  const [contactEmail, setContactEmail] = useState("kingofchristministries23@gmail.com");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Client-side route protection
  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [mounted, status, user, router]);

  // Load Users Data
  async function loadUsers() {
    setLoadingUsers(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users || []);
        if (data.warning) {
          setWarningMsg(data.warning);
        }
      } else {
        throw new Error(data.error || "Failed to load members list");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not retrieve users list.");
    } finally {
      setLoadingUsers(false);
    }
  }

  // Load Donations Data
  async function loadDonations() {
    setLoadingDonations(true);
    try {
      const res = await fetch("/api/admin/donations");
      const data = await res.json();
      if (res.ok && data.success) {
        setDonations(data.donations || []);
      } else {
        throw new Error(data.error || "Failed to load financial records");
      }
    } catch (err: any) {
      console.error("Donation history error:", err);
    } finally {
      setLoadingDonations(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && user?.role === "ADMIN") {
      loadUsers();
      loadDonations();
    }
  }, [status, user]);

  // Handle User Role Promotion / Demotion
  const handleRoleChange = async (userId: string, newRole: string) => {
    setRoleUpdatingId(userId);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Sync local state
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setSuccessMsg(`${at.successRole} ${newRole}!`);
      } else {
        throw new Error(data.error || "Failed to update role");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to modify role. Please try again.");
    } finally {
      setRoleUpdatingId(null);
    }
  };

  // Handle Settings Save Mock
  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSuccessMsg("");
    
    setTimeout(() => {
      setSettingsLoading(false);
      setSuccessMsg("System administration settings saved successfully!");
    }, 800);
  };

  // Role Protection UI loader
  if (!mounted || status === "loading" || (user && user.role !== "ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-purple-50 dark:from-gray-955 dark:via-gray-900 dark:to-purple-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">{at.authenticating}</p>
        </div>
      </div>
    );
  }

  // Financial Calculations
  const completedDonations = donations.filter(d => d.status === "COMPLETED");
  const totalFinancials = completedDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalTithes = completedDonations.filter(d => d.type === "TITHE").reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalOfferings = completedDonations.filter(d => d.type === "OFFERING").reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  // Client Side Filtering
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone || "").toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredDonations = completedDonations.filter((d) => {
    const matchesSearch = 
      (d.donorName || "").toLowerCase().includes(donationSearch.toLowerCase()) ||
      (d.donorEmail || "").toLowerCase().includes(donationSearch.toLowerCase()) ||
      (d.razorpayOrderId || "").toLowerCase().includes(donationSearch.toLowerCase()) ||
      (d.razorpayPaymentId || "").toLowerCase().includes(donationSearch.toLowerCase());
    const matchesType = donationTypeFilter === "ALL" || d.type === donationTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-955 text-gray-800 dark:text-gray-200">
      
      {/* Header Panel */}
      <header className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-150 dark:border-white/5 sticky top-0 z-40 transition-colors print:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-black bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent tracking-tight font-display">
              {at.portalName}
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full">
              {at.roleName}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold hidden md:inline">
              {at.welcome}, {user?.name || "Admin"}
            </span>
            <button
              onClick={logout}
              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-955/20 dark:hover:bg-red-955/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl font-bold text-xs flex items-center gap-1.5 active:scale-[0.98] transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              {at.signOut}
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Console */}
      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-8">
        
        {/* Banner Greeting */}
        <div className="bg-gradient-to-br from-red-600 to-purple-700 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl print:hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl transform translate-x-20 -translate-y-20 animate-pulse" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-red-200 block mb-2 flex items-center gap-1 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-red-300" />
            {at.rootControl}
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight mb-3">
            {at.panelTitle}
          </h2>
          <p className="text-red-100 max-w-xl leading-relaxed text-sm">
            {at.panelDesc}
          </p>
        </div>

        {/* Global Messages */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-green-50 dark:bg-green-955/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 text-sm rounded-xl flex items-center gap-2 print:hidden shadow-sm"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 dark:bg-red-955/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded-xl flex items-center gap-2 print:hidden shadow-sm"
            >
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {warningMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-yellow-50 dark:bg-yellow-955/20 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 text-xs rounded-xl flex items-center gap-2 print:hidden shadow-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span><strong>{at.syncNotice}</strong> {warningMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-white/5 gap-2 print:hidden">
          {[
            { id: "users", label: at.tabUsers, icon: Users },
            { id: "financials", label: at.tabFinancials, icon: IndianRupee },
            { id: "settings", label: at.tabSettings, icon: Sliders },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-red-600 text-red-600 dark:text-red-400"
                  : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Panel Section */}
        <div className="min-h-[400px]">
          
          {/* TAB 1: User Role Manager */}
          {activeTab === "users" && (
            <div className="space-y-6 print:hidden">
              {/* Toolbar */}
              <div className="grid md:grid-cols-3 gap-4 bg-white dark:bg-gray-800/30 p-4 rounded-2xl border border-gray-150 dark:border-white/5 shadow-md">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder={at.searchUsers}
                    className="w-full py-3 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none transition-all text-sm outline-none"
                  />
                </div>
                <div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none transition-all text-sm font-semibold outline-none"
                  >
                    <option value="ALL">{at.filterRoles}</option>
                    <option value="MEMBER">{at.roleMember}</option>
                    <option value="PASTOR">{at.rolePastor}</option>
                    <option value="ADMIN">{at.roleAdmin}</option>
                  </select>
                </div>
              </div>

              {/* User Grid Cards */}
              {loadingUsers ? (
                <div className="py-24 text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{at.loadingUsers}</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800/20 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h4 className="font-bold text-gray-905 dark:text-white text-lg">{at.noUsers}</h4>
                  <p className="text-sm text-gray-450 max-w-sm mx-auto mt-1">{at.noUsersDesc}</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map((u) => (
                    <div 
                      key={u.id}
                      className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-150 dark:border-white/5 shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-purple-505 text-white font-extrabold rounded-2xl flex items-center justify-center shadow-inner uppercase text-sm">
                            {(u.name || "U").substring(0, 2)}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-extrabold text-gray-955 dark:text-white leading-tight truncate">{u.name || "Anonymous Member"}</h4>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{u.email}</p>
                          </div>
                        </div>

                        <hr className="border-gray-100 dark:border-white/5" />

                        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-red-500/70" />
                            <span>{u.phone || (language === "te" ? "ఫోన్ లేదు" : language === "hi" ? "कोई फोन नहीं" : "No phone added")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-red-500/70" />
                            <span>Joined: {new Date(u.createdAt).toLocaleDateString("en-IN")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Role Selector */}
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {at.changeRole}
                        </label>
                        <div className="relative">
                          {roleUpdatingId === u.id ? (
                            <div className="w-full py-2 bg-gray-55 dark:bg-gray-900 rounded-xl flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                              <span className="text-[10px] font-bold text-gray-400">{at.updating}</span>
                            </div>
                          ) : (
                            <select
                              value={u.role || "MEMBER"}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="w-full py-2 px-3.5 bg-gray-55 dark:bg-gray-905 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all cursor-pointer outline-none"
                            >
                              <option value="MEMBER">{at.roleMember}</option>
                              <option value="PASTOR">{at.rolePastor}</option>
                              <option value="ADMIN">{at.roleAdmin}</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Financials & Reports */}
          {activeTab === "financials" && (
            <div className="space-y-8">
              
              {/* Financial Counter Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                {[
                  { label: at.totalIncome, count: `₹${totalFinancials.toLocaleString("en-IN")}`, desc: at.incomeSub, icon: IndianRupee, color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-955/20 border-green-100" },
                  { label: at.tithesLedger, count: `₹${totalTithes.toLocaleString("en-IN")}`, desc: at.tithesSub, icon: TrendingUp, color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-955/20 border-purple-100" },
                  { label: at.worshipOfferings, count: `₹${totalOfferings.toLocaleString("en-IN")}`, desc: at.offeringsSub, icon: FileText, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-955/20 border-indigo-100" },
                  { label: at.ledgerVolume, count: completedDonations.length, desc: at.ledgerSub, icon: CheckCircle, color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-955/20 border-red-100" },
                ].map((card, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-150 dark:border-white/5 shadow-md flex items-center justify-between gap-4">
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider block leading-none mb-1.5">{card.label}</span>
                      <span className="text-2xl font-black text-gray-905 dark:text-white block tracking-tight">
                        {loadingDonations ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : card.count}
                      </span>
                      <span className="text-[9px] text-gray-400 mt-1 block leading-tight">{card.desc}</span>
                    </div>
                    <div className={`p-3 rounded-xl flex-shrink-0 ${card.color}`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Toolbar & Filters (Hidden on Print) */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800/30 p-4 rounded-2xl border border-gray-150 dark:border-white/5 shadow-md print:hidden">
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    value={donationSearch}
                    onChange={(e) => setDonationSearch(e.target.value)}
                    placeholder={at.searchLedger}
                    className="w-full py-3 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none transition-all text-sm outline-none"
                  />
                </div>
                
                <div className="flex w-full md:w-auto gap-3 items-center">
                  <select
                    value={donationTypeFilter}
                    onChange={(e) => setDonationTypeFilter(e.target.value)}
                    className="flex-1 md:flex-initial py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-gray-955 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none transition-all text-sm font-semibold outline-none cursor-pointer"
                  >
                    <option value="ALL">{at.allCategories}</option>
                    <option value="TITHE">{at.titheOnly}</option>
                    <option value="OFFERING">{at.offeringOnly}</option>
                  </select>

                  <button
                    onClick={() => window.print()}
                    className="py-3 px-5 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <Printer className="w-4 h-4" />
                    {at.btnPrint}
                  </button>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-150 dark:border-white/5 shadow-md overflow-hidden">
                
                {/* Print Invoice Header Block */}
                <div className="hidden print:block p-8 border-b border-gray-200 dark:border-gray-700 text-center space-y-2">
                  <h1 className="text-3xl font-black tracking-tight text-purple-950">KINGDOM OF CHRIST MINISTRIES</h1>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{at.statementTitle}</p>
                  <p className="text-[10px] text-gray-400">Statement Generated: {new Date().toLocaleString("en-IN")} • Contact Email: {contactEmail}</p>
                </div>

                {loadingDonations ? (
                  <div className="py-24 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pulling financial registers...</p>
                  </div>
                ) : filteredDonations.length === 0 ? (
                  <div className="text-center py-16">
                    <IndianRupee className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h4 className="font-bold text-gray-905 dark:text-white text-lg">{at.noFinancials}</h4>
                    <p className="text-sm text-gray-450 max-w-sm mx-auto mt-1">{at.noFinancialsDesc}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-55/50 dark:bg-gray-900/40 text-gray-500 dark:text-gray-450 text-[10px] uppercase font-black tracking-wider border-b border-gray-150 dark:border-white/5">
                          <th className="py-4.5 px-6">{at.colDonor}</th>
                          <th className="py-4.5 px-6">{at.colOrder}</th>
                          <th className="py-4.5 px-6">{at.colCategory}</th>
                          <th className="py-4.5 px-6">{at.colAmount}</th>
                          <th className="py-4.5 px-6">{at.colDate}</th>
                          <th className="py-4.5 px-6 text-center print:hidden">{at.colReceipt}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {filteredDonations.map((d) => (
                          <tr key={d.id} className="hover:bg-gray-55/30 dark:hover:bg-white/1 flex-row text-xs">
                            {/* Donor Info */}
                            <td className="py-4 px-6 space-y-1">
                              <span className="font-bold text-gray-955 dark:text-white block">{d.donorName || "Believer"}</span>
                              <span className="text-[10px] text-gray-400 block">{d.donorEmail || "No email"}</span>
                            </td>
                            {/* Tx IDs */}
                            <td className="py-4 px-6 font-mono text-[10px] text-gray-400 dark:text-gray-500 space-y-0.5">
                              <span className="block">ORDER: {d.razorpayOrderId || "N/A"}</span>
                              <span className="block text-purple-500 font-semibold">PAYID: {d.razorpayPaymentId || "N/A"}</span>
                            </td>
                            {/* Category Type */}
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-0.5 font-bold uppercase tracking-widest text-[9px] rounded-full ${
                                d.type === 'TITHE' 
                                  ? 'bg-purple-100 dark:bg-purple-955/20 text-purple-700 dark:text-purple-300' 
                                  : 'bg-green-100 dark:bg-green-955/20 text-green-700 dark:text-green-300'
                              }`}>
                                {d.type}
                              </span>
                            </td>
                            {/* Amount */}
                            <td className="py-4 px-6">
                              <span className="font-extrabold text-gray-955 dark:text-white text-sm">
                                ₹{d.amount.toLocaleString("en-IN")}
                              </span>
                            </td>
                            {/* Date */}
                            <td className="py-4 px-6 text-gray-400 dark:text-gray-500">
                              {new Date(d.createdAt).toLocaleDateString("en-IN", {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            {/* Receipt Button Link */}
                            <td className="py-4 px-6 text-center print:hidden">
                              <Link
                                href={`/give/receipt/${d.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-55 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-400 rounded-xl font-extrabold text-[10px] uppercase border border-gray-150 dark:border-white/5 active:scale-[0.98] transition-all"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                80G Receipt
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: System Variables Board */}
          {activeTab === "settings" && (
            <div className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-150 dark:border-white/5 shadow-xl p-8 backdrop-blur-xl max-w-2xl mx-auto print:hidden animate-fade-in">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center animate-pulse">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-955 dark:text-white tracking-tight">{at.systemSettings}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{at.systemSettingsDesc}</p>
                </div>
              </div>

              <form onSubmit={handleSettingsSave} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    {at.contactEmail}
                  </label>
                  <div className="relative">
                    <MailCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                      placeholder="support@church.com"
                      className="w-full py-3.5 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none transition-all text-sm font-semibold outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 leading-relaxed">
                    {at.contactEmailDesc}
                  </p>
                </div>

                <hr className="border-gray-100 dark:border-white/5" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-955 dark:text-white text-sm block">{at.maintenanceMode}</span>
                      <span className="text-[10px] text-gray-450 dark:text-gray-500 block max-w-sm mt-0.5">{at.maintenanceModeDesc}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={maintenanceMode} 
                        onChange={() => setMaintenanceMode(!maintenanceMode)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-250 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-955 dark:text-white text-sm block">{at.allowRegistrations}</span>
                      <span className="text-[10px] text-gray-455 dark:text-gray-500 block max-w-sm mt-0.5">{at.allowRegistrationsDesc}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={allowRegistrations} 
                        onChange={() => setAllowRegistrations(!allowRegistrations)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-255 dark:bg-gray-750 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600" />
                    </label>
                  </div>
                </div>

                <hr className="border-gray-100 dark:border-white/5" />

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-wider"
                  >
                    {settingsLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {at.saving}
                      </>
                    ) : (
                      <>
                        <Sliders className="w-4 h-4" />
                        {at.btnSave}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      loadUsers();
                      loadDonations();
                      setSuccessMsg(at.syncSuccess);
                    }}
                    className="py-3.5 px-5 bg-gray-55 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-250 rounded-xl font-extrabold border border-gray-150 dark:border-white/5 text-xs uppercase tracking-wider flex items-center gap-1.5 active:scale-[0.98] transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {at.btnSync}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
