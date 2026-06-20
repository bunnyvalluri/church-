"use client";

import React, { useState } from "react";
import { 
  Play, 
  Calendar, 
  Megaphone, 
  Image as ImageIcon, 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Edit2, 
  Search, 
  Sparkles,
  ChevronDown,
  X
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";
import Image from "next/image";


interface ContentManagementProps {
  sermons: any[];
  events: any[];
  announcements: any[];
  onAddSermon: (sermon: any) => void;
  onDeleteSermon: (id: string) => void;
  onAddEvent: (event: any) => void;
  onDeleteEvent: (id: string) => void;
  onAddAnnouncement: (announcement: any) => void;
  onDeleteAnnouncement: (id: string) => void;
  onOpenAddSermon?: () => void;
  onOpenAddEvent?: () => void;
  onOpenAddAnnouncement?: () => void;
  activeSubTab?: "sermons" | "events" | "announcements" | "media" | "pages";
}

export default function ContentManagement({
  sermons,
  events,
  announcements,
  onAddSermon,
  onDeleteSermon,
  onAddEvent,
  onDeleteEvent,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onOpenAddSermon,
  onOpenAddEvent,
  onOpenAddAnnouncement,
  activeSubTab = "sermons"
}: ContentManagementProps) {
  const [subView, setSubView] = useState<"sermons" | "events" | "announcements" | "media" | "pages">(activeSubTab);
  React.useEffect(() => {
    setSubView(activeSubTab);
  }, [activeSubTab]);
  const [search, setSearch] = useState("");
  
  const { language } = useLanguage();
  const t = adminTranslations[language as keyof typeof adminTranslations] || adminTranslations.en;

  // Translation helpers
  const getSermonCategoryTranslation = (cat: string) => {
    switch (cat) {
      case "Faith": return language === "te" ? "విశ్వాసం" : language === "hi" ? "विश्वास" : "Faith";
      case "Inspiration": return language === "te" ? "ప్రేరణ" : language === "hi" ? "प्रेरणा" : "Inspiration";
      case "Prayer": return language === "te" ? "ప్రార్థన" : language === "hi" ? "प्रार्थना" : "Prayer";
      case "Purpose": return language === "te" ? "ఉద్దేశ్యం" : language === "hi" ? "उद्देश्य" : "Purpose";
      default: return cat;
    }
  };

  const getEventCategoryTranslation = (cat: string) => {
    switch (cat?.toUpperCase()) {
      case "WORSHIP": return language === "te" ? "ఆరాధన సేవ" : language === "hi" ? "आराधना सेवा" : "Worship Service";
      case "PRAYER": return language === "te" ? "ప్రార్థన కూడిక" : language === "hi" ? "प्रार्थना सभा" : "Prayer Vigil";
      case "YOUTH": return language === "te" ? "యువజన కూడిక" : language === "hi" ? "युवा गतिविधि" : "Youth Activity";
      case "CHILDREN": return language === "te" ? "సండే స్కూల్" : language === "hi" ? "संडे स्कूल" : "Sunday School";
      case "SPECIAL": return language === "te" ? "ప్రత్యేక కార్యక్రమం" : language === "hi" ? "विशेष कार्यक्रम" : "Special Event";
      default: return cat;
    }
  };

  const getPriorityTranslation = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "LOW": return language === "te" ? "తక్కువ ప్రాధాన్యత" : language === "hi" ? "कम प्राथमिकता" : "Low priority";
      case "NORMAL": return language === "te" ? "సాధారణం" : language === "hi" ? "सामान्य" : "Normal";
      case "HIGH": return language === "te" ? "ఎక్కువ ప్రాధాన్యత" : language === "hi" ? "उच्च प्राथमिकता" : "High priority";
      case "URGENT": return language === "te" ? "అత్యవసరం!" : language === "hi" ? "अति आवश्यक!" : "Urgent!";
      default: return priority;
    }
  };

  const getLocationTranslation = (loc: string) => {
    switch (loc) {
      case "Subhash Nagar Sanctuary": return t.attendance.subhashNagar || loc;
      case "Shapur Location": return t.attendance.shapurLoc || loc;
      case "Bahadurpally Location": return t.attendance.bahadurpallyLoc || loc;
      default: return loc;
    }
  };

  const getPreacherTranslation = (pastor: string) => {
    switch (pastor) {
      case "Pastor John": return language === "te" ? "పాస్టర్ జాన్" : language === "hi" ? "पादरी जॉन" : "Pastor John";
      case "Bishop Kurra Kristhu Raju": return language === "te" ? "బిషప్ కుర్రా క్రీస్తు రాజు" : language === "hi" ? "बिशप कुर्रा क्रिस्तु राजू" : "Bishop Kurra Kristhu Raju";
      default: return pastor;
    }
  };

  const getMediaCategoryTranslation = (cat: string) => {
    switch (cat?.toUpperCase()) {
      case "BANNERS": return language === "te" ? "బ్యానర్లు" : language === "hi" ? "बैनर" : "BANNERS";
      case "PASTOR": return language === "te" ? "పాస్టర్" : language === "hi" ? "पादरी" : "PASTOR";
      case "EVENTS": return language === "te" ? "కార్యక్రమాలు" : language === "hi" ? "कार्यक्रम" : "EVENTS";
      default: return cat;
    }
  };

  const getMediaTitleTranslation = (title: string) => {
    switch (title) {
      case "Church Front Sanctuary": return language === "te" ? "చర్చి ముందు మందిరం" : language === "hi" ? "चर्च के सामने का अभयारण्य" : "Church Front Sanctuary";
      case "Bishop Kurra Kristhu Raju Portrait": return language === "te" ? "బిషప్ కుర్రా క్రీస్తు రాజు గారి చిత్రం" : language === "hi" ? "बिशप कुर्रा क्रिस्तु राजू चित्र" : "Bishop Kurra Kristhu Raju Portrait";
      case "Sunday worship choir banner": return language === "te" ? "ఆదివారం ఆరాధన గాయక బృందం బ్యానర్" : language === "hi" ? "रविवार आराधना गायक दल बैनर" : "Sunday worship choir banner";
      case "Youth Camp camp fire session": return language === "te" ? "యువజన క్యాంప్ క్యాంప్ ఫైర్ సమయం" : language === "hi" ? "युवा शिविर कैंप फायर सत्र" : "Youth Camp camp fire session";
      default: return title;
    }
  };

  const getPageTitleTranslation = (page: string) => {
    switch (page) {
      case "Home Page": return language === "te" ? "హోమ్ పేజీ" : language === "hi" ? "होम पेज" : "Home Page";
      case "Leadership Page": return language === "te" ? "నాయకత్వ పేజీ" : language === "hi" ? "नेतृत्व पेज" : "Leadership Page";
      case "Ministries Hub": return language === "te" ? "పరిచర్యల కేంద్రం" : language === "hi" ? "मंत्रालयों का केंद्र" : "Ministries Hub";
      case "Giving / Tithes Form": return language === "te" ? "కానుకలు / దశమభాగాల ఫారమ్" : language === "hi" ? "दान / दशमांश फॉर्म" : "Giving / Tithes Form";
      default: return page;
    }
  };

  const getPageDescTranslation = (desc: string) => {
    if (desc.includes("Main landing hero layout")) {
      return language === "te" ? "ప్రధాన ల్యాండింగ్ హీరో లేఅవుట్, స్వాగత గమనికలు మరియు సేవా సమయాల అవలోకనం." :
             language === "hi" ? "मुख्य लैंडिंग हीरो लेआउट, स्वागत नोट और सेवा समय का अवलोकन।" : desc;
    }
    if (desc.includes("Biography and credentials")) {
      return language === "te" ? "బిషప్ కుర్రా క్రీస్తు రాజు గారి బయోగ్రఫీ మరియు ఆధారాలు." :
             language === "hi" ? "बिशप कुर्रा क्रिस्तु राजू गरु की जीवनी और क्रेडेंशियल।" : desc;
    }
    if (desc.includes("Directory displaying active")) {
      return language === "te" ? "సక్రియ విభాగాలు మరియు సమన్వయకర్తలను ప్రదర్శించే డైరెక్టరీ." :
             language === "hi" ? "सक्रिय विभागों और समन्वयकों को प्रदर्शित करने वाली निर्देशिका।" : desc;
    }
    if (desc.includes("Tax exemption details")) {
      return language === "te" ? "పన్ను మినహాయింపు వివరాలు మరియు Razorpay/Stripe చెక్అవుట్ హ్యాండిల్స్." :
             language === "hi" ? "कर छूट विवरण और रेज़रपे/स्ट्राइप चेकआउट हैंडल।" : desc;
    }
    return desc;
  };

  const getPreacherAvatar = (pastor: string) => {
    const badge = pastor.includes("Bishop") 
      ? "from-purple-500 to-indigo-600 shadow-purple-500/15" 
      : "from-emerald-450 to-teal-500 shadow-emerald-500/15";
    return (
      <div className={`w-8.5 h-8.5 rounded-xl bg-gradient-to-br ${badge} text-white font-black flex items-center justify-center uppercase text-[10px] shrink-0 shadow-sm`}>
        {(pastor || "P").substring(0, 2)}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ─── Sub Navigation Tabs ─── */}
      <div className="p-1 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-2xl flex gap-1 items-center w-max max-w-full overflow-x-auto select-none scrollbar-none shadow-sm">
        {[
          { id: "sermons", label: language === "te" ? "ప్రసంగాలు (లైబ్రరీ)" : language === "hi" ? "उपदेश (पुस्तकालय)" : "Sermons (Library)", icon: Play },
          { id: "events", label: language === "te" ? "కార్యక్రమాల మేనేజర్" : language === "hi" ? "कार्यक्रम प्रबंधक" : "Events Manager", icon: Calendar },
          { id: "announcements", label: t.content.announcements, icon: Megaphone },
          { id: "media", label: t.content.media, icon: ImageIcon },
          { id: "pages", label: language === "te" ? "పేజీ సెట్టింగ్‌లు" : language === "hi" ? "पेज सेटिंग्स" : "Page Settings", icon: FileText }
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

      {/* ─── Control Bar ─── */}
      <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-550" />
          <input 
            type="text" 
            placeholder={
              language === "te" ? "వెతకండి..." :
              language === "hi" ? "खोजें..." :
              `Search ${subView}...`
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-semibold"
          />
        </div>
        
        {subView === "sermons" && (
          <button 
            onClick={onOpenAddSermon} 
            className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4.5 h-4.5" /> {t.content.addSermon}
          </button>
        )}
        {subView === "events" && (
          <button 
            onClick={onOpenAddEvent} 
            className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4.5 h-4.5" /> {t.content.createEvent}
          </button>
        )}
        {subView === "announcements" && (
          <button 
            onClick={onOpenAddAnnouncement} 
            className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4.5 h-4.5" /> {t.content.addAnnouncement}
          </button>
        )}
      </div>

      {/* ────────────────── SUB-VIEW: SERMONS ────────────────── */}
      {subView === "sermons" && (
        <div className="border border-slate-100 dark:border-white/[0.05] bg-white dark:bg-[#121324]/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[10px] font-bold text-slate-455 dark:text-gray-550 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                  <th className="py-4.5 px-6">{t.content.tableTitle}</th>
                  <th className="py-4.5 px-6">{t.content.tableSpeaker}</th>
                  <th className="py-4.5 px-6">{t.content.tableDate}</th>
                  <th className="py-4.5 px-6">{t.content.tableCategory}</th>
                  <th className="py-4.5 px-6">{t.content.tableViews}</th>
                  <th className="py-4.5 px-6 text-right">{t.content.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03] text-xs font-semibold text-slate-700 dark:text-gray-300">
                {sermons.filter(s => s.title.toLowerCase().includes(search.toLowerCase())).map((sermon) => (
                  <tr key={sermon.id} className="hover:bg-slate-50/35 dark:hover:bg-[#16172D]/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-[#6366F1] dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-500/20 flex items-center justify-center shrink-0">
                          <Play className="w-4 h-4 fill-current" />
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[200px]">{sermon.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        {getPreacherAvatar(sermon.pastor || sermon.speaker || "Pastor John")}
                        <span className="font-bold">{getPreacherTranslation(sermon.pastor || sermon.speaker || "Pastor John")}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-405 dark:text-gray-500">{formatDate(sermon.date)}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 bg-slate-50 dark:bg-white/[0.03] text-slate-550 dark:text-gray-400 rounded-lg text-[9px] font-bold border border-slate-150 dark:border-white/[0.06] uppercase tracking-wider">{getSermonCategoryTranslation(sermon.category)}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 dark:text-gray-500">{sermon.views || 0}</td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button 
                        onClick={() => onDeleteSermon(sermon.id)} 
                        className="p-1.5 text-slate-350 dark:text-gray-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Sermon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: EVENTS ────────────────── */}
      {subView === "events" && (
        <div className="border border-slate-100 dark:border-white/[0.05] bg-white dark:bg-[#121324]/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[10px] font-bold text-slate-455 dark:text-gray-550 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                  <th className="py-4.5 px-6">{t.content.tableTitle}</th>
                  <th className="py-4.5 px-6">{t.content.tableLocation}</th>
                  <th className="py-4.5 px-6">{t.dashboard.tableDate}</th>
                  <th className="py-4.5 px-6">{t.content.tableTime}</th>
                  <th className="py-4.5 px-6">{t.content.tableCategory}</th>
                  <th className="py-4.5 px-6 text-right">{t.content.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03] text-xs font-semibold text-slate-700 dark:text-gray-300">
                {events.filter(e => e.title.toLowerCase().includes(search.toLowerCase())).map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/35 dark:hover:bg-[#16172D]/20 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">{evt.title}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-gray-400">{getLocationTranslation(evt.location)}</td>
                    <td className="py-4 px-6 text-slate-405 dark:text-gray-500">{formatDate(evt.date)}</td>
                    <td className="py-4 px-6 text-slate-405 dark:text-gray-500 font-mono">{evt.time}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-[#F59E0B] rounded-lg text-[9px] font-bold border border-amber-100 dark:border-amber-500/20 uppercase tracking-wider">{getEventCategoryTranslation(evt.category)}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => onDeleteEvent(evt.id)} 
                        className="p-1.5 text-slate-350 dark:text-gray-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: ANNOUNCEMENTS ────────────────── */}
      {subView === "announcements" && (
        <div className="border border-slate-100 dark:border-white/[0.05] bg-white dark:bg-[#121324]/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[10px] font-bold text-slate-455 dark:text-gray-550 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                  <th className="py-4.5 px-6">{t.content.tableTitle}</th>
                  <th className="py-4.5 px-6">{t.content.tableContent}</th>
                  <th className="py-4.5 px-6">{t.content.tablePriority}</th>
                  <th className="py-4.5 px-6">{t.dashboard.tableDate}</th>
                  <th className="py-4.5 px-6 text-right">{t.content.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03] text-xs font-semibold text-slate-700 dark:text-gray-300">
                {announcements.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).map((anc) => (
                  <tr key={anc.id} className="hover:bg-slate-50/35 dark:hover:bg-[#16172D]/20 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">{anc.title}</td>
                    <td className="py-4 px-6 text-slate-650 dark:text-gray-400 max-w-[240px] truncate" title={anc.content}>{anc.content}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase border ${
                        anc.priority === "HIGH" || anc.priority === "URGENT" 
                          ? "bg-red-50 dark:bg-red-500/10 text-red-750 dark:text-red-450 border-red-100 dark:border-red-500/20" 
                          : "bg-slate-50 dark:bg-white/[0.04] text-slate-705 dark:text-gray-400 border border-slate-200 dark:border-white/[0.08]"
                      }`}>{getPriorityTranslation(anc.priority)}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-405 dark:text-gray-500">{formatDate(anc.createdAt)}</td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => onDeleteAnnouncement(anc.id)} 
                        className="p-1.5 text-slate-350 dark:text-gray-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: MEDIA LIBRARY ────────────────── */}
      {subView === "media" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: "Church Front Sanctuary", cat: "BANNERS", url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=300&q=80" },
            { title: "Bishop Kurra Kristhu Raju Portrait", cat: "PASTOR", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80" },
            { title: "Sunday worship choir banner", cat: "EVENTS", url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=300&q=80" },
            { title: "Youth Camp camp fire session", cat: "EVENTS", url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300&q=80" }
          ].map((media, idx) => (
            <div key={idx} className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl hover:-translate-y-1 hover:border-indigo-150 hover:shadow-lg transition-all duration-300 group">
              <div className="h-32 bg-slate-100 dark:bg-[#16172D]/60 relative overflow-hidden">
                <Image src={media.url} alt={media.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out" unoptimized />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-black/60 backdrop-blur-md border border-white/[0.1] text-white rounded text-[8px] font-bold tracking-wider uppercase">{getMediaCategoryTranslation(media.cat)}</span>
              </div>
              <div className="p-3.5">
                <h4 className="text-[10px] font-bold text-slate-800 dark:text-gray-300 line-clamp-1">{getMediaTitleTranslation(media.title)}</h4>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ────────────────── SUB-VIEW: PAGES ────────────────── */}
      {subView === "pages" && (
        <div className="space-y-4 max-w-xl">
          {[
            { page: "Home Page", path: "/", desc: "Main landing hero layout, welcome notes, and service times overview." },
            { page: "Leadership Page", path: "/about/leadership", desc: "Biography and credentials for Bishop Kurra Kristhu Raju Garu." },
            { page: "Ministries Hub", path: "/about/ministries", desc: "Directory displaying active departments and coordinators." },
            { page: "Giving / Tithes Form", path: "/give", desc: "Tax exemption details and Razorpay/Stripe checkout handles." }
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl flex items-center justify-between gap-4 hover:border-indigo-150 hover:shadow-md transition-all duration-300">
              <div className="space-y-1 overflow-hidden">
                <h4 className="font-extrabold text-sm text-slate-950 dark:text-white">{getPageTitleTranslation(item.page)}</h4>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold">{getPageDescTranslation(item.desc)}</p>
                <code className="text-[9px] text-[#6366F1] dark:text-indigo-400 bg-indigo-50/55 dark:bg-indigo-500/10 border border-indigo-100/30 dark:border-indigo-500/20 px-2 py-0.5 rounded font-mono block mt-1.5 w-max font-bold">{item.path}</code>
              </div>
              <button className="py-2 px-3.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-250 dark:border-white/[0.08] text-slate-700 dark:text-gray-300 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-50/20 hover:text-[#6366F1] hover:border-indigo-150 transition-all active:scale-95 shrink-0">
                <Edit2 className="w-3.5 h-3.5" /> {language === "te" ? "లేఅవుట్ సవరించు" : language === "hi" ? "लेआउट संपादित करें" : "Edit Layout"}
              </button>
            </div>
          ))}
        </div>
      )}


    </div>
  );
}
