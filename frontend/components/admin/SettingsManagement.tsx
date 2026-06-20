"use client";

import React, { useState } from "react";
import { Settings, Shield, Plus, Check, Save, Info, Key, CheckSquare, Square } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface SettingsManagementProps {
  onSaveConfig: (config: any) => Promise<void>;
  activeSubTab?: "settings" | "permissions";
}

interface PermissionRow {
  module: string;
  desc: string;
  SUPER_ADMIN: boolean;
  ADMIN: boolean;
  PASTOR: boolean;
  MEMBER: boolean;
}

export default function SettingsManagement({ onSaveConfig, activeSubTab = "settings" }: SettingsManagementProps) {
  const [subView, setSubView] = useState<"settings" | "permissions">(activeSubTab);
  React.useEffect(() => {
    setSubView(activeSubTab);
  }, [activeSubTab]);
  const { language } = useLanguage();
  const t = adminTranslations[language as keyof typeof adminTranslations] || adminTranslations.en;

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-gradient-to-r from-indigo-500 to-violet-650" : "bg-slate-205 dark:bg-white/[0.08]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  const CustomCheckbox = ({ checked, onClick, id }: { checked: boolean, onClick: () => void, id?: string }) => (
    <div 
      onClick={onClick}
      id={id}
      data-testid={id}
      className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 shadow-sm ${
        checked 
          ? "bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] border-transparent text-white shadow-indigo-500/20 animate-in zoom-in-95 duration-100" 
          : "bg-white dark:bg-white/[0.02] border-slate-300 dark:border-white/[0.08] hover:border-indigo-400"
      }`}
    >
      {checked && (
        <svg className="w-3.5 h-3.5 stroke-[3.5] stroke-current" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );

  const LockedCheckbox = () => (
    <div className="w-5.5 h-5.5 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30 bg-indigo-50/40 dark:bg-indigo-950/10 flex items-center justify-center shadow-sm select-none cursor-not-allowed">
      <svg className="w-3 h-3 text-[#6366F1] dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    </div>
  );
  
  // Settings Form States
  const [contactEmail, setContactEmail] = useState("kingofchristministries23@gmail.com");
  const [contactPhone, setContactPhone] = useState("+91 96409 43777");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [loading, setLoading] = useState(false);

  // Office Locations & service times schedules
  const [locations, setLocations] = useState([
    { name: "Subhash Nagar Sanctuary", schedule: "Sun 5:45 AM, 8:30 AM | Thu Evening Prayer" },
    { name: "Shapur Location", schedule: "Fri 6:00 PM | Sun 6:00 PM" },
    { name: "Bahadurpally Location", schedule: "Sun Afternoon 11:00 AM | Monthly 2nd Tuesday" }
  ]);

  // Roles & Permissions matrix state
  const [permissions, setPermissions] = useState<PermissionRow[]>([
    { module: "Dashboard Overview", desc: "Access the admin workspace dashboard screen.", SUPER_ADMIN: true, ADMIN: true, PASTOR: true, MEMBER: false },
    { module: "Believers Directory", desc: "Read, edit, delete user profiles and register offline believers.", SUPER_ADMIN: true, ADMIN: true, PASTOR: false, MEMBER: false },
    { module: "Donations Ledger", desc: "Audit tax-deductible contributions, export logs, print tax receipts.", SUPER_ADMIN: true, ADMIN: true, PASTOR: false, MEMBER: false },
    { module: "Prayer Request Dispatcher", desc: "Approve prayer requests, assign intercessors, add scriptures.", SUPER_ADMIN: true, ADMIN: true, PASTOR: true, MEMBER: false },
    { module: "Content Manager (Sermons, Events)", desc: "Upload preaching files, create calendar events, post alerts.", SUPER_ADMIN: true, ADMIN: true, PASTOR: true, MEMBER: false },
    { module: "System Console / Settings", desc: "Global variables edit, maintenance toggle, permissions matrix.", SUPER_ADMIN: true, ADMIN: false, PASTOR: false, MEMBER: false }
  ]);

  // Translation helpers
  const getLocationNameTranslation = (name: string) => {
    switch (name) {
      case "Subhash Nagar Sanctuary": return t.attendance.subhashNagar || name;
      case "Shapur Location": return t.attendance.shapurLoc || name;
      case "Bahadurpally Location": return t.attendance.bahadurpallyLoc || name;
      default: return name;
    }
  };

  const getLocationScheduleTranslation = (schedule: string) => {
    if (schedule.includes("Sun 5:45 AM")) {
      return language === "te" ? "ఆది 5:45 AM, 8:30 AM | గురువారం సాయంత్రం ప్రార్థన" :
             language === "hi" ? "रवि 5:45 AM, 8:30 AM | गुरु शाम की प्रार्थना" : schedule;
    }
    if (schedule.includes("Fri 6:00 PM")) {
      return language === "te" ? "శుక్ర 6:00 PM | ఆది 6:00 PM" :
             language === "hi" ? "शुक्र 6:00 PM | रवि 6:00 PM" : schedule;
    }
    if (schedule.includes("Sun Afternoon 11:00 AM")) {
      return language === "te" ? "ఆదివారం మధ్యాహ్నం 11:00 AM | నెలవారీ 2వ మంగళవారం" :
             language === "hi" ? "रवि दोपहर 11:00 AM | मासिक द्वितीय मंगलवार" : schedule;
    }
    return schedule;
  };

  const getModuleTranslation = (module: string) => {
    switch (module) {
      case "Dashboard Overview": return t.headers.dashboard;
      case "Believers Directory": return language === "te" ? "వినియోగదారుల డైరెక్టరీ" : language === "hi" ? "विश्वासियों की निर्देशिका" : "Believers Directory";
      case "Donations Ledger": return t.headers.donations;
      case "Prayer Request Dispatcher": return t.headers.prayers;
      case "Content Manager (Sermons, Events)": return language === "te" ? "కంటెంట్ మేనేజర్ (ప్రసంగాలు, ఈవెంట్‌లు)" : language === "hi" ? "सामग्री प्रबंधक (उपदेश, कार्यक्रम)" : "Content Manager (Sermons, Events)";
      case "System Console / Settings": return language === "te" ? "సిస్టమ్ కన్సోల్ / సెట్టింగ్‌లు" : language === "hi" ? "सिस्टम कंसोल / सेटिंग्स" : "System Console / Settings";
      default: return module;
    }
  };

  const getModuleDescTranslation = (desc: string) => {
    if (desc.includes("Access the admin workspace")) {
      return language === "te" ? "అడ్మిన్ వర్క్‌స్పేస్ డాష్‌బోర్డ్ స్క్రీన్‌ను యాక్సెస్ చేయండి." :
             language === "hi" ? "एडमिन कार्यक्षेत्र डैशबोर्ड स्क्रीन तक पहुंचें।" : desc;
    }
    if (desc.includes("Read, edit, delete user profiles")) {
      return language === "te" ? "వినియోగదారు ప్రొఫైల్‌లను చదవండి, సవరించండి, తొలగించండి మరియు ఆఫ్‌లైన్ విశ్వాసులను నమోదు చేయండి." :
             language === "hi" ? "उपयोगकर्ता प्रोफाइल पढ़ें, संशोधित करें, हटाएं और ऑफ़लाइन विश्वासियों को पंजीकृत करें।" : desc;
    }
    if (desc.includes("Audit tax-deductible contributions")) {
      return language === "te" ? "పన్ను మినహాయింపు కానుకలను ఆడిట్ చేయండి, లాగ్‌లను ఎగుమతి చేయండి, పన్ను రసీదులను ప్రింట్ చేయండి." :
             language === "hi" ? "कर-कटौती योग्य योगदानों का ऑडिट करें, लॉग निर्यात करें, कर रसीदें प्रिंट करें।" : desc;
    }
    if (desc.includes("Approve prayer requests")) {
      return language === "te" ? "ప్రార్థన విన్నపాలను ఆమోదించండి, ప్రార్థన భాగస్వాములను కేటాయించండి, లేఖనాలను జోడించండి." :
             language === "hi" ? "प्रार्थना अनुरोधों को स्वीकृत करें, मध्यस्थों को सौंपें, शास्त्र जोड़ें।" : desc;
    }
    if (desc.includes("Upload preaching files")) {
      return language === "te" ? "ప్రసంగ ఫైల్‌లను అప్‌లోడ్ చేయండి, క్యాలెండర్ ఈవెంట్‌లను సృష్టించండి, హెచ్చరికలను పోస్ట్ చేయండి." :
             language === "hi" ? "उपदेश फ़ाइलें अपलोड करें, कैलेंडर कार्यक्रम बनाएं, अलर्ट पोस्ट करें।" : desc;
    }
    if (desc.includes("Global variables edit")) {
      return language === "te" ? "గ్లోబల్ వేరియబుల్స్ సవరణ, మెయింటెనెన్స్ టోగుల్, అనుమతుల మాత్రిక." :
             language === "hi" ? "वैश्विक चर संपादित करें, रखरखाव टॉगल, अनुमति मैट्रिक्स।" : desc;
    }
    return desc;
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSaveConfig({
        contactEmail,
        contactPhone,
        maintenanceMode,
        allowRegistrations,
        locations
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (moduleName: string, roleName: "SUPER_ADMIN" | "ADMIN" | "PASTOR" | "MEMBER") => {
    // Super admin role must remain lock-enabled for security
    if (roleName === "SUPER_ADMIN") return;

    setPermissions(prev => prev.map(row => {
      if (row.module === moduleName) {
        return {
          ...row,
          [roleName]: !row[roleName]
        };
      }
      return row;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ─── Sub Navigation Tabs ─── */}
      <div className="p-1 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-2xl flex gap-1 items-center w-max max-w-full overflow-x-auto select-none scrollbar-none shadow-sm">
        {[
          { id: "settings", label: language === "te" ? "చర్చి & సైట్ సెట్టింగ్‌లు" : language === "hi" ? "चर्च और साइट सेटिंग्स" : "Church & Site Settings", icon: Settings },
          { id: "permissions", label: language === "te" ? "వినియోగదారు పాత్రలు & అనుమతులు" : language === "hi" ? "उपयोगकर्ता भूमिकाएं और अनुमतियां" : "User Roles & Permissions", icon: Shield }
        ].map((tab) => {
          const isSelected = subView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${
                isSelected
                  ? "bg-white dark:bg-white/[0.06] text-[#6366F1] dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-white/[0.02]"
                  : "text-slate-400 hover:text-slate-650 dark:hover:text-gray-300 hover:bg-slate-50/50 dark:hover:bg-white/[0.01]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ────────────────── SUB-VIEW: SETTINGS ────────────────── */}
      {subView === "settings" && (
        <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-8 max-w-2xl mx-auto space-y-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl">
          <div className="border-b border-slate-100 dark:border-white/[0.03] pb-5">
            <h2 className="text-base font-extrabold text-slate-950 dark:text-white uppercase tracking-tight">{t.settings.platformConfig}</h2>
            <p className="text-xs text-slate-455 dark:text-gray-500 mt-1 font-semibold">{language === "te" ? "గ్లోబల్ అప్లికేషన్ వేరియబుల్స్, ఓవర్‌రైడ్‌లు మరియు అడ్మినిస్ట్రేటివ్ ఈమెయిల్ రూట్‌లను కాన్గర్ చేయండి." : language === "hi" ? "ग्लोबल एप्लिकेशन वेरिएबल्स, ओवरराइड्स और प्रशासनिक ईमेल रूट कॉन्फ़िगर करें।" : "Configure global application variables, overrides, and administrative email routes."}</p>
          </div>

          <form onSubmit={handleSettingsSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-2">{language === "te" ? "ప్రాథమిక సంప్రదింపు ఈమెయిల్" : language === "hi" ? "प्राथमिक संपर्क ईमेल" : "Primary Contact Email"}</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-2">{language === "te" ? "ప్రాథమిక సహాయ ఫోన్" : language === "hi" ? "प्राथमिक सहायता फ़ोन" : "Primary Help Phone"}</label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-semibold"
                />
              </div>
            </div>

            <hr className="border-t border-slate-100 dark:border-white/[0.03]" />

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white block">{language === "te" ? "మెయింటెనెన్స్ ఓవర్‌రైడ్ మోడ్" : language === "hi" ? "रखरखाव ओवरराइड मोड" : "Maintenance Override Mode"}</span>
                <span className="text-[10px] text-slate-450 dark:text-gray-500 block leading-snug font-medium">{language === "te" ? "సేవ నిలిపివేత సమయాల్లో పాస్టర్ మరియు అడ్మిన్ పాత్రలకు మాత్రమే సైట్ యాక్సెస్‌ను పరిమితం చేయండి." : language === "hi" ? "सेवा बंद होने के दौरान केवल पादरी और एडमिन भूमिकाओं तक साइट पहुंच को प्रतिबंधित करें।" : "Restrict site access only to pastor and admin roles during service shutdowns."}</span>
              </div>
              <ToggleSwitch checked={maintenanceMode} onChange={setMaintenanceMode} />
            </div>

            <hr className="border-t border-slate-100 dark:border-white/[0.03]" />

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white block">{language === "te" ? "పబ్లిక్ రిజిస్ట్రేషన్‌లను అనుమతించు" : language === "hi" ? "सार्वजनिक पंजीकरण की अनुमति दें" : "Allow Public Registrations"}</span>
                <span className="text-[10px] text-slate-455 dark:text-gray-550 block leading-snug font-medium">{language === "te" ? "కొత్త విశ్వాసులు అడ్మిన్ ప్రమేయం లేకుండా పోర్టల్‌లో ప్రొఫైల్‌లను సృష్టించుకోవడానికి అనుమతిస్తుంది." : language === "hi" ? "नए विश्वासियों को एडमिन प्रविष्टि के बिना पोर्टल पर प्रोफाइल स्थापित करने में सक्षम बनाता है।" : "Enables new believers to establish profiles on the portal without admin seed."}</span>
              </div>
              <ToggleSwitch checked={allowRegistrations} onChange={setAllowRegistrations} />
            </div>

            <hr className="border-t border-slate-100 dark:border-white/[0.03]" />

            {/* Sanctuary Locations List */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase tracking-wider">{language === "te" ? "మందిరం ప్రాంతాలు & వారాంతపు సమయాలు" : language === "hi" ? "अभयारण्य स्थान और साप्ताहिक समय" : "Sanctuary Locations & Weekly Times"}</h4>
              <div className="space-y-3">
                {locations.map((loc, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/50 dark:bg-[#16172D]/30 border border-slate-150/60 dark:border-white/[0.04] rounded-xl flex flex-col gap-1.5 hover:border-indigo-150/40 dark:hover:border-indigo-500/10 transition-colors duration-300">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{getLocationNameTranslation(loc.name)}</span>
                    <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono font-bold">{getLocationScheduleTranslation(loc.schedule)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 active:scale-[0.98]"
              >
                <Save className="w-4.5 h-4.5" />
                {loading 
                  ? (language === "te" ? "సెట్టింగ్‌లను సేవ్ చేస్తోంది..." : language === "hi" ? "सेटिंग्स सहेजी जा रही हैं..." : "Saving Settings...") 
                  : (language === "te" ? "సెట్టింగ్‌లను సేవ్ చేయి" : language === "hi" ? "सेटिंग्स सहेजें" : "Save Settings")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: PERMISSIONS ────────────────── */}
      {subView === "permissions" && (
        <div className="border border-slate-100 dark:border-white/[0.05] bg-white dark:bg-[#121324]/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.015)] flex flex-col">
          {/* Top premium gradient bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899]" />
          
          <div className="p-6 pb-4">
            <h2 className="text-base font-extrabold text-slate-950 dark:text-white tracking-tight uppercase flex items-center gap-2">
              <Key className="w-5 h-5 text-[#6366F1]" /> {language === "te" ? "భద్రతా ఆధారాలు & అనుమతుల మాత్రిక" : language === "hi" ? "सुरक्षा क्रेडेंशियल और अनुमति मैट्रिक्स" : "Security Credentials & Permissions Matrix"}
            </h2>
            <p className="text-xs text-slate-455 dark:text-gray-550 mt-1 font-semibold">{t.settings.matricesSubtitle}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                  <th className="py-4 px-6 pl-10">{language === "te" ? "యాక్సెస్ మాడ్యూల్" : language === "hi" ? "पहुंच मॉड्यूल" : "Access module"}</th>
                  <th className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-purple-50 dark:bg-purple-950/20 text-purple-705 dark:text-purple-300 border border-purple-100/50 dark:border-purple-900/50 shadow-sm">
                      🔐 {language === "te" ? "సూపర్ అడ్మిన్" : language === "hi" ? "सुपर एडमिन" : "Super Admin"}
                    </span>
                  </th>
                  <th className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950/20 text-indigo-705 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-900/50 shadow-sm">
                      🛡️ {language === "te" ? "అడ్మిన్" : language === "hi" ? "एडमिन" : "Admin"}
                    </span>
                  </th>
                  <th className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-rose-50 dark:bg-rose-950/20 text-rose-705 dark:text-rose-300 border border-rose-100/50 dark:border-rose-900/50 shadow-sm">
                      ❤️ {language === "te" ? "కాపరి / పాస్టర్" : language === "hi" ? "पादरी" : "Pastor"}
                    </span>
                  </th>
                  <th className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-slate-100 dark:bg-slate-850 text-slate-705 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800 shadow-sm">
                      👥 {language === "te" ? "సభ్యుడు" : language === "hi" ? "सदस्य" : "Member"}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03] text-xs font-semibold text-slate-700 dark:text-gray-300">
                {permissions.map((row) => (
                  <tr key={row.module} className="group/row hover:bg-slate-50/35 dark:hover:bg-[#16172D]/20 transition-all duration-200">
                    <td className="py-5 px-6 pl-10 border-l-4 border-transparent group-hover/row:border-[#6366F1] group-hover/row:pl-11 transition-all duration-200">
                      <span className="font-extrabold text-slate-900 dark:text-white block transition-colors group-hover/row:text-[#6366F1]">{getModuleTranslation(row.module)}</span>
                      <span className="text-[10px] text-slate-400 dark:text-gray-500 block mt-1.5 leading-snug font-medium">{getModuleDescTranslation(row.desc)}</span>
                    </td>
                    
                    <td className="py-5 px-6 text-center">
                      <div className="flex justify-center">
                        <LockedCheckbox />
                      </div>
                    </td>

                    <td className="py-5 px-6 text-center">
                      <div className="flex justify-center">
                        <CustomCheckbox 
                          checked={row.ADMIN} 
                          onClick={() => handlePermissionToggle(row.module, "ADMIN")} 
                          id={`check-admin-${row.module.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`}
                        />
                      </div>
                    </td>

                    <td className="py-5 px-6 text-center">
                      <div className="flex justify-center">
                        <CustomCheckbox 
                          checked={row.PASTOR} 
                          onClick={() => handlePermissionToggle(row.module, "PASTOR")} 
                          id={`check-pastor-${row.module.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`}
                        />
                      </div>
                    </td>

                    <td className="py-5 px-6 text-center">
                      <div className="flex justify-center">
                        <CustomCheckbox 
                          checked={row.MEMBER} 
                          onClick={() => handlePermissionToggle(row.module, "MEMBER")} 
                          id={`check-member-${row.module.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-white/[0.03] bg-slate-50/20 dark:bg-white/[0.01] flex">
            <div className="bg-indigo-50/50 dark:bg-indigo-550/10 border border-indigo-100/50 dark:border-indigo-500/20 rounded-xl p-4 flex items-center gap-3 max-w-xl shadow-sm">
              <Info className="w-5 h-5 text-[#6366F1] shrink-0 animate-pulse" />
              <div className="text-[11px] font-bold text-indigo-750 dark:text-indigo-300 leading-normal">
                {language === "te" ? "టోగుల్స్ స్వయంచాలకంగా మెమరీకి సేవ్ చేయబడతాయి మరియు భద్రత దృష్ట్యా ప్రతి పాత్రకు తక్షణమే వర్తిస్తాయి." : 
                 language === "hi" ? "टॉगल स्वचालित रूप से मेमोरी में सहेजे जाते हैं और सुरक्षा के लिए प्रत्येक भूमिका पर तुरंत लागू होते हैं।" : 
                 "Toggles are autosaved to memory and take effect immediately for the designated roles."}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
