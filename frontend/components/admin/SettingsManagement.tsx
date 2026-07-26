"use client";

import React, { useState } from "react";
import { 
  Settings, 
  Shield, 
  Plus, 
  Check, 
  Save, 
  Key, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Server, 
  Radio, 
  CheckCircle2, 
  Trash2,
  Lock,
  Globe
} from "lucide-react";
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
  const isTe = language === "te";
  const isHi = language === "hi";
  const t = adminTranslations[language as keyof typeof adminTranslations] || adminTranslations.en;

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-gradient-to-r from-indigo-500 to-violet-600" : "bg-slate-200 dark:bg-white/[0.08]"
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
          ? "bg-gradient-to-tr from-indigo-600 to-violet-600 border-transparent text-white shadow-indigo-500/20" 
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
    <div className="w-5.5 h-5.5 rounded-lg border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center shadow-sm select-none cursor-not-allowed">
      <Lock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
    </div>
  );
  
  // Settings Form States
  const [contactEmail, setContactEmail] = useState("kingofchristministries23@gmail.com");
  const [contactPhone, setContactPhone] = useState("+91 97040 90069");
  const [hqAddress, setHqAddress] = useState("Sanctuary Road, Jeedimetla, Hyderabad, Telangana 500055");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  const [autoReceipts, setAutoReceipts] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Office Locations & service times schedules
  const [locations, setLocations] = useState([
    { id: "loc_1", name: "Subhash Nagar Sanctuary", schedule: "Sun 5:45 AM, 8:30 AM | Thu Evening Prayer", phone: "+91 97040 90069" },
    { id: "loc_2", name: "Shapur Location", schedule: "Fri 6:00 PM | Sun 6:00 PM", phone: "+91 96409 43777" },
    { id: "loc_3", name: "Bahadurpally Location", schedule: "Sun Afternoon 11:00 AM | Monthly 2nd Tuesday", phone: "+91 87654 32109" }
  ]);

  const [newLocName, setNewLocName] = useState("");
  const [newLocSchedule, setNewLocSchedule] = useState("");
  const [isAddLocOpen, setIsAddLocOpen] = useState(false);

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
      case "Subhash Nagar Sanctuary": return isTe ? "సుభాష్ నగర్ మందిరం" : isHi ? "सुभाष नगर अभयारण्य" : name;
      case "Shapur Location": return isTe ? "షాపూర్ ప్రాంతం" : isHi ? "शापूर स्थान" : name;
      case "Bahadurpally Location": return isTe ? "బహదూర్ పల్లి ప్రాంతం" : isHi ? "बहादुरपल्ली स्थान" : name;
      default: return name;
    }
  };

  const getLocationScheduleTranslation = (schedule: string) => {
    if (schedule.includes("Sun 5:45 AM")) {
      return isTe ? "ఆది 5:45 AM, 8:30 AM | గురువారం సాయంత్రం ప్రార్థన" :
             isHi ? "रवि 5:45 AM, 8:30 AM | गुरु शाम की प्रार्थना" : schedule;
    }
    if (schedule.includes("Fri 6:00 PM")) {
      return isTe ? "శుక్ర 6:00 PM | ఆది 6:00 PM" :
             isHi ? "शुक्र 6:00 PM | रवि 6:00 PM" : schedule;
    }
    if (schedule.includes("Sun Afternoon 11:00 AM")) {
      return isTe ? "ఆదివారం మధ్యాహ్నం 11:00 AM | నెలవారీ 2వ మంగళవారం" :
             isHi ? "रवि दोपहर 11:00 AM | मासिक द्वितीय मंगलवार" : schedule;
    }
    return schedule;
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSaveConfig({
        contactEmail,
        contactPhone,
        hqAddress,
        maintenanceMode,
        allowRegistrations,
        requireEmailVerification,
        autoReceipts,
        locations
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName) return;
    setLocations(prev => [
      ...prev,
      {
        id: `loc_${Date.now()}`,
        name: newLocName,
        schedule: newLocSchedule || "Sundays 10:00 AM",
        phone: contactPhone
      }
    ]);
    setNewLocName("");
    setNewLocSchedule("");
    setIsAddLocOpen(false);
  };

  const handleRemoveLocation = (id: string) => {
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  const handlePermissionToggle = (moduleName: string, roleName: "SUPER_ADMIN" | "ADMIN" | "PASTOR" | "MEMBER") => {
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
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ─── Top Overview Metric Bar ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "సిస్టమ్ స్థితి" : isHi ? "सिस्टम स्थिति" : "System Health"}
            </span>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5" /> 99.9%
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "డేటాబేస్ హోస్ట్" : isHi ? "डेटाबेस होस्ट" : "Cloud Database"}
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">Neon SSL</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "మందిరం ప్రాంతాలు" : isHi ? "चर्च स्थान" : "Sanctuary Branches"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{locations.length}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "మెయింటెనెన్స్ మోడ్" : isHi ? "रखरखाव मोड" : "Maintenance Mode"}
            </span>
            <h3 className={`text-xl font-black mt-1 tracking-tight ${maintenanceMode ? "text-rose-600" : "text-slate-900 dark:text-white"}`}>
              {maintenanceMode ? "ACTIVE" : "OFF"}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <Globe className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── Sub Navigation Tabs ─── */}
      <div className="p-1 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl flex gap-1 items-center w-max max-w-full overflow-x-auto select-none scrollbar-none shadow-sm">
        {[
          { id: "settings", label: isTe ? "చర్చి & సైట్ సెట్టింగ్‌లు" : isHi ? "चर्च और साइट सेटिंग्स" : "Church & Site Settings", icon: Settings },
          { id: "permissions", label: isTe ? "వినియోగదారు పాత్రలు & అనుమతులు" : isHi ? "उपयोगकर्ता भूमिकाएं और अनुमतियां" : "User Roles & Permissions Matrix", icon: Shield }
        ].map((tab) => {
          const isSelected = subView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 text-xs font-black transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
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
        <form onSubmit={handleSettingsSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Platform Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm backdrop-blur-xl space-y-6">
              
              <div className="border-b border-slate-150 dark:border-white/[0.04] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {t.settings.platformConfig}
                  </h2>
                  <p className="text-xs text-slate-450 dark:text-gray-400 mt-0.5 font-semibold">
                    {isTe ? "గ్లోబల్ అప్లికేషన్ వేరియబుల్స్, ఓవర్‌రైడ్‌లు మరియు అడ్మినిస్ట్రేటివ్ ఈమెయిల్ రూట్‌లను కాన్గర్ చేయండి." : isHi ? "ग्लोबल एप्लिकेशन वेरिएबल्स, ओवरराइड्स और प्रशासनिक ईमेल रूट कॉन्फ़िगर करें।" : "Configure global application variables, overrides, and administrative email routes."}
                  </p>
                </div>
                {savedSuccess && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 rounded-full text-xs font-bold animate-in fade-in">
                    <Check className="w-3.5 h-3.5" /> Saved!
                  </span>
                )}
              </div>

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-indigo-500" />
                    {isTe ? "ప్రాథమిక సంప్రదింపు ఈమెయిల్" : isHi ? "प्राथमिक संपर्क ईमेल" : "Primary Contact Email"}
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-indigo-500" />
                    {isTe ? "ప్రాథమిక సహాయ ఫోన్" : isHi ? "प्राथमिक सहायता फ़ोन" : "Primary Help Phone"}
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-500" />
                    {isTe ? "ప్రధాన కార్యాలయం చిరునామా" : isHi ? "मुख्यालय का पता" : "Ministry Headquarters Address"}
                  </label>
                  <input
                    type="text"
                    required
                    value={hqAddress}
                    onChange={(e) => setHqAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <hr className="border-t border-slate-150 dark:border-white/[0.04]" />

              {/* Toggles List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {isTe ? "మెయింటెనెన్స్ ఓవర్‌రైడ్ మోడ్" : isHi ? "रखरखाव ओवरराइड मोड" : "Maintenance Override Mode"}
                    </span>
                    <span className="text-[10px] text-slate-450 dark:text-gray-400 block leading-snug font-medium">
                      {isTe ? "సేవ నిలిపివేత సమయాల్లో పాస్టర్ మరియు అడ్మిన్ పాత్రలకు మాత్రమే సైట్ యాక్సెస్‌ను పరిమితం చేయండి." : isHi ? "सेवा बंद होने के दौरान केवल पादरी और एडमिन भूमिकाओं तक साइट पहुंच को प्रतिबंधित करें।" : "Restrict site access only to pastor and admin roles during service shutdowns."}
                    </span>
                  </div>
                  <ToggleSwitch checked={maintenanceMode} onChange={setMaintenanceMode} />
                </div>

                <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {isTe ? "పబ్లిక్ రిజిస్ట్రేషన్‌లను అనుమతించు" : isHi ? "सार्वजनिक पंजीकरण की अनुमति दें" : "Allow Public Believer Registrations"}
                    </span>
                    <span className="text-[10px] text-slate-450 dark:text-gray-400 block leading-snug font-medium">
                      {isTe ? "కొత్త విశ్వాసులు అడ్మిన్ ప్రమేయం లేకుండా పోర్టల్‌లో ప్రొఫైల్‌లను సృష్టించుకోవడానికి అనుమతిస్తుంది." : isHi ? "नए विश्वासियों को एडमिन प्रविष्टि के बिना पोर्टल पर प्रोफाइल स्थापित करने में सक्षम बनाता है।" : "Enables new believers to establish profiles on the portal without admin seed."}
                    </span>
                  </div>
                  <ToggleSwitch checked={allowRegistrations} onChange={setAllowRegistrations} />
                </div>

                <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {isTe ? "ఆటోమాటిక్ టాక్స్ రశీదు ఉత్పత్తి" : isHi ? "स्वचालित कर रसीद निर्माण" : "Automatic Tax Receipt Emailing"}
                    </span>
                    <span className="text-[10px] text-slate-450 dark:text-gray-400 block leading-snug font-medium">
                      {isTe ? "కానుక పూర్తయిన వెంటనే 80G పన్ను మినహాయింపు రశీదును ఇమెయిల్ పంపుతుంది." : isHi ? "दान पूरा होने पर तुरंत 80G कर रसीद ईमेल भेजें।" : "Automatically dispatch 80G tax receipts to donor email upon payment completion."}
                    </span>
                  </div>
                  <ToggleSwitch checked={autoReceipts} onChange={setAutoReceipts} />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  {loading 
                    ? (isTe ? "సెట్టింగ్‌లను సేవ్ చేస్తోంది..." : isHi ? "सेटिंग्स सहेजी जा रही हैं..." : "Saving Settings...") 
                    : (isTe ? "సెట్టింగ్‌లను సేవ్ చేయి" : isHi ? "सेटिंग्स सहेजें" : "Save Platform Settings")}
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Interactive Sanctuary Locations */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm backdrop-blur-xl space-y-4">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {isTe ? "మందిరం ప్రాంతాలు & సమయాలు" : isHi ? "अभयारण्य स्थान" : "Sanctuary Branches"}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-gray-400 font-semibold mt-0.5">
                    {locations.length} {isTe ? "శాఖలు నమోదయ్యాయి" : isHi ? "शाखाएं पंजीकृत" : "active church locations"}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAddLocOpen(true)}
                  className="py-1.5 px-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isTe ? "చేర్చు" : isHi ? "जोड़ें" : "Add"}
                </button>
              </div>

              {/* Locations Cards List */}
              <div className="space-y-3">
                {locations.map((loc) => (
                  <div 
                    key={loc.id} 
                    className="p-4 bg-slate-50/50 hover:bg-white dark:bg-[#16172D]/30 dark:hover:bg-[#16172D]/60 border border-slate-200/60 dark:border-white/[0.04] hover:border-indigo-300 dark:hover:border-indigo-500/30 rounded-2xl space-y-2 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        {getLocationNameTranslation(loc.name)}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(loc.id)}
                        className="text-slate-300 dark:text-gray-600 hover:text-rose-600 p-1 transition-colors"
                        title="Remove location"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono font-bold flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                      {getLocationScheduleTranslation(loc.schedule)}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* ─── MODAL: ADD SANCTUARY BRANCH ─── */}
          {isAddLocOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
                  <h3 className="font-black text-slate-900 dark:text-white text-base">Add Sanctuary Location</h3>
                  <button 
                    type="button"
                    onClick={() => setIsAddLocOpen(false)} 
                    className="text-slate-400 hover:text-slate-700 p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-xl"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Branch Location Name</label>
                    <input 
                      type="text" required placeholder="e.g. Miyapur Sanctuary" value={newLocName}
                      onChange={(e) => setNewLocName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Service Schedule & Weekly Times</label>
                    <input 
                      type="text" placeholder="e.g. Sundays 9:00 AM | Wednesdays 7:00 PM" value={newLocSchedule}
                      onChange={(e) => setNewLocSchedule(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                    />
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button type="button" onClick={() => setIsAddLocOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase transition-colors">Cancel</button>
                    <button type="button" onClick={handleAddLocation} className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-md shadow-indigo-500/10 active:scale-95">Save Branch</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </form>
      )}

      {/* ────────────────── SUB-VIEW: PERMISSIONS MATRIX ────────────────── */}
      {subView === "permissions" && (
        <div className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm flex flex-col">
          
          <div className="p-6 border-b border-slate-150 dark:border-white/[0.04]">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-500" /> 
              {isTe ? "భద్రతా ఆధారాలు & అనుమతుల మాత్రిక" : isHi ? "सुरक्षा क्रेडेंशियल और अनुमति मैट्रिक्स" : "Security Credentials & Role Permissions Matrix"}
            </h2>
            <p className="text-xs text-slate-450 dark:text-gray-400 mt-1 font-semibold">
              {t.settings.matricesSubtitle}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-150 dark:border-white/[0.04] text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                  <th className="py-4 px-6 pl-8">{isTe ? "యాక్సెస్ మాడ్యూల్" : isHi ? "पहुंच मॉड्यूल" : "Access Module"}</th>
                  <th className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60">
                      Crown {isTe ? "సూపర్ అడ్మిన్" : isHi ? "सुपर एडमिन" : "Super Admin"}
                    </span>
                  </th>
                  <th className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60">
                      Shield {isTe ? "అడ్మిన్" : isHi ? "एडमिन" : "Admin"}
                    </span>
                  </th>
                  <th className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                      Star {isTe ? "పాస్టర్" : isHi ? "पास्टर" : "Pastor"}
                    </span>
                  </th>
                  <th className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200">
                      User {isTe ? "సభ్యుడు" : isHi ? "सदस्य" : "Member"}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03] text-xs font-semibold text-slate-700 dark:text-gray-300">
                {permissions.map((row) => (
                  <tr key={row.module} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 pl-8">
                      <span className="font-black text-slate-900 dark:text-white block">{row.module}</span>
                      <span className="text-[10px] text-slate-400 dark:text-gray-500 font-medium block mt-0.5">{row.desc}</span>
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      <div className="flex justify-center">
                        <LockedCheckbox />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      <div className="flex justify-center">
                        <CustomCheckbox checked={row.ADMIN} onClick={() => handlePermissionToggle(row.module, "ADMIN")} />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      <div className="flex justify-center">
                        <CustomCheckbox checked={row.PASTOR} onClick={() => handlePermissionToggle(row.module, "PASTOR")} />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      <div className="flex justify-center">
                        <CustomCheckbox checked={row.MEMBER} onClick={() => handlePermissionToggle(row.module, "MEMBER")} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
