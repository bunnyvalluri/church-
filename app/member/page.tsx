"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  User, 
  Calendar, 
  Heart, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  LogOut,
  Bell,
  Clock,
  Briefcase,
  Flame,
  Bookmark,
  Gift
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

const memberTranslations = {
  en: {
    portalName: "KCM Portal",
    roleName: "Believer Member",
    welcome: "Welcome,",
    signOut: "Sign Out",
    portalDashboard: "Member Fellowship Space",
    hello: "Welcome Home,",
    description: "We are so glad to have you in our spiritual family. Access your events, review sermons, submit prayers, and volunteer in active ministries.",
    registeredEvents: "Registered Events",
    prayerRequests: "Prayer Requests",
    directoryTitle: "Believer Services Directory",
    latestAnnouncements: "Latest Announcements",
    noAnnouncements: "No active church announcements currently.",
    urgent: "Urgent Notification",
    loadingFeeds: "Loading member portal feeds...",
    loadingPortal: "Securing Member Fellowship Space...",
    scriptureTitle: "Scripture of the Day",
    scriptureText: '"The Lord is my shepherd; I shall not want."',
    scriptureRef: "— Psalm 23:1",
    services: {
      profile: { title: "My Profile", desc: "Update phone numbers, profile images, and address." },
      events: { title: "Church Events", desc: "Browse upcoming schedules and secure seats." },
      prayers: { title: "Prayer Requests", desc: "Submit, edit, and keep track of prayer lines." },
      sermons: { title: "Sermon Library", desc: "Watch recent bible sessions and pastorships." },
      volunteer: { title: "Volunteer Sign Up", desc: "Serve in active church programs and ministries." },
      giving: { title: "Giving & Receipts", desc: "Make offerings, tithe, and download statements." }
    }
  },
  te: {
    portalName: "కింగ్డమ్ ఆఫ్ క్రైస్ట్ పోర్టల్",
    roleName: "సభ్యుడు",
    welcome: "స్వాగతం,",
    signOut: "లాగ్ అవుట్",
    portalDashboard: "సభ్యుల పోర్టల్ డాష్‌బోర్డ్",
    hello: "హలో,",
    description: "మా ఆత్మీయ కుటుంబంలో మిమ్మల్ని కలిగి ఉన్నందుకు మేము చాలా సంతోషిస్తున్నాము. మీ ఈవెంట్‌లను యాక్సెస్ చేయండి, ప్రసంగాలను సమీక్షించండి, ప్రార్థనలను సమర్పించండి మరియు పరిచర్యలలో వాలంటీర్‌గా ఉండండి.",
    registeredEvents: "నమోదైన కార్యక్రమాలు",
    prayerRequests: "ప్రార్థన విన్నపాలు",
    directoryTitle: "సభ్యుల సేవల డైరెక్టరీ",
    latestAnnouncements: "తాజా ప్రకటనలు",
    noAnnouncements: "ప్రస్తుతం చర్చి ప్రకటనలు ఏవీ లేవు.",
    urgent: "అత్యవసరం",
    loadingFeeds: "ఫీడ్‌లను లోడ్ చేస్తోంది...",
    loadingPortal: "సభ్యుల పోర్టల్ లోడ్ అవుతోంది...",
    scriptureTitle: "నేటి దైవ వాక్యం",
    scriptureText: '"యెహోవా నా కాపరి, నాకు లేమి కలుగదు."',
    scriptureRef: "— కీర్తనలు 23:1",
    services: {
      profile: { title: "నా ప్రొఫైల్", desc: "ఫోన్ నంబర్లు, ప్రొఫైల్ చిత్రాలు మరియు చిరునామాను నవీకరించండి." },
      events: { title: "చర్చి కార్యక్రమాలు", desc: "రాబోయే షెడ్యూల్‌లను బ్రౌజ్ చేయండి మరియు సీట్లను బుక్ చేసుకోండి." },
      prayers: { title: "ప్రార్థన విన్నపాలు", desc: "ప్రార్థన విన్నపాలను సమర్పించండి మరియు ట్రాక్ చేయండి." },
      sermons: { title: "ప్రసంగాల లైబ్రరీ", desc: "ఇటీవలి బైబిల్ సందేశాలు మరియు ప్రసంగాలు వీక్షించండి." },
      volunteer: { title: "వాలంటీర్ నమోదు", desc: "సక్రియ చర్చి కార్యక్రమాలు మరియు పరిచర్యలలో సేవ చేయండి." },
      giving: { title: "కానుకలు & రసీదులు", desc: "దశమభాగాలు, కానుకలు ఇవ్వండి మరియు రసీదులు డౌన్‌లోడ్ చేసుకోండి." }
    }
  },
  hi: {
    portalName: "केसीएम पोर्टल",
    roleName: "सदस्य",
    welcome: "स्वागत है,",
    signOut: "साइन आउट",
    portalDashboard: "सदस्य पोर्टल डैशबोर्ड",
    hello: "नमस्ते,",
    description: "हमें अपने आध्यात्मिक परिवार में पाकर बहुत खुशी हुई है। अपने कार्यक्रमों तक पहुँचें, प्रवचनों की समीक्षा करें, प्रार्थनाएँ जमा करें, और सक्रिय मंत्रालयों में स्वयंसेवा करें।",
    registeredEvents: "पंजीकृत कार्यक्रम",
    prayerRequests: "प्रार्थना निवेदन",
    directoryTitle: "सदस्य सेवा निर्देशिका",
    latestAnnouncements: "नवीनतम घोषणाएं",
    noAnnouncements: "वर्तमान में कोई सक्रिय घोषणा नहीं है।",
    urgent: "अति आवश्यक",
    loadingFeeds: "फ़ीड लोड हो रहा है...",
    loadingPortal: "सदस्य पोर्टल लोड हो रहा है...",
    scriptureTitle: "आज का पवित्र वचन",
    scriptureText: '"यहोवा मेरा चरवाहा है, मुझे कोई घटी न होगी।"',
    scriptureRef: "— भजन संहिता 23:1",
    services: {
      profile: { title: "मेरी प्रोफाइल", desc: "फ़ोन नंबर, प्रोफ़ाइल चित्र और पता अपडेट करें।" },
      events: { title: "चर्च कार्यक्रम", desc: "आगामी कार्यक्रम देखें और सीटें सुरक्षित करें।" },
      prayers: { title: "प्रार्थना निवेदन", desc: "प्रार्थना निवेदन जमा करें, संपादित करें और ट्रैक करें।" },
      sermons: { title: "प्रवचन लाइब्रेरी", desc: "हाल के बाइबिल सत्र और संदेश देखें।" },
      volunteer: { title: "स्वयंसेवक पंजीकरण", desc: "सक्रिय चर्च कार्यक्रमों और मंत्रालयों में सेवा करें।" },
      giving: { title: "दान और रसीदें", desc: "दशमांश, प्रसाद दें और रसीदें डाउनलोड करें।" }
    }
  }
};

export default function MemberDashboard() {
  const { user, status, mounted, logout } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const mt = memberTranslations[language] || memberTranslations.en;

  const [stats, setStats] = useState({ prayers: 0, events: 0 });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);

  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [mounted, status, router]);

  useEffect(() => {
    async function loadFeeds() {
      if (user?.uid) {
        try {
          // Fetch statistics
          const eventsRes = await fetch(`/api/member/events?userId=${user.uid}`);
          const eventsData = await eventsRes.json();
          
          const prayersRes = await fetch(`/api/member/prayers?userId=${user.uid}`);
          const prayersData = await prayersRes.json();

          // Fetch announcements
          const announcementsFileRes = await fetch('/api/pastor/announcements', { method: 'GET' }).catch(() => null);
          let loadedAnnouncements: any[] = [];
          if (announcementsFileRes && announcementsFileRes.ok) {
            const fileData = await announcementsFileRes.json();
            loadedAnnouncements = fileData.announcements || [];
          } else {
            loadedAnnouncements = [
              { id: '1', title: 'Sunday Worship Reschedule', content: 'Our main worship service will start at 9:00 AM instead of 10:00 AM this Sunday only.', priority: 'HIGH', createdAt: new Date().toISOString() },
              { id: '2', title: 'Youth Spiritual Fellowship', content: 'Weekly youth meetups every Friday night at Bahadurpally location. Join us for fellowship and study.', priority: 'NORMAL', createdAt: new Date().toISOString() }
            ];
          }

          setAnnouncements(loadedAnnouncements);
          setStats({
            prayers: prayersData.prayers?.length || 0,
            events: eventsData.registeredEventIds?.length || 0
          });
        } catch (err) {
          console.error("Error loading member dashboard feeds:", err);
        } finally {
          setLoadingFeeds(false);
        }
      }
    }

    if (status === "authenticated" && user?.uid) {
      loadFeeds();
    }
  }, [user, status]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="text-center">
          <LoaderSpinner label={mt.loadingPortal} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-800 dark:text-gray-200 transition-colors duration-500">
      
      {/* Header Portal */}
      <header className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-150 dark:border-white/5 sticky top-0 z-40 transition-colors">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight group-hover:opacity-80 transition-opacity">
              {mt.portalName}
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200/30">
              {mt.roleName}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold hidden md:inline">
              {mt.welcome} {user?.name || "Member"}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-955/20 dark:hover:bg-red-955/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl font-bold text-xs flex items-center gap-1.5 active:scale-[0.98] transition-all shadow-sm shadow-red-500/5"
            >
              <LogOut className="w-3.5 h-3.5" />
              {mt.signOut}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Welcomer, Stats, and Navigation Grid */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Welcome banner */}
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl shadow-purple-500/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl transform translate-x-20 -translate-y-20 animate-pulse" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-500/10 rounded-full filter blur-2xl animate-pulse" />
              
              <span className="text-xs uppercase font-extrabold tracking-widest text-purple-200 block mb-2">{mt.portalDashboard}</span>
              <h2 className="text-4xl font-extrabold tracking-tight mb-3">
                {mt.hello} {user?.name || "Believer"}!
              </h2>
              <p className="text-purple-100 max-w-lg leading-relaxed text-sm">
                {mt.description}
              </p>
            </div>

            {/* Scripture of the Day widget ( Frosted Glass luxury widget ) */}
            <div className="relative p-6 bg-white/60 dark:bg-gray-900/30 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between overflow-hidden">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl text-amber-500 flex-shrink-0 animate-pulse shadow-sm">
                  <Flame className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-center md:text-left">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 dark:text-amber-400 block">
                    {mt.scriptureTitle}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 italic leading-relaxed">
                    {mt.scriptureText}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap bg-purple-50 dark:bg-purple-950/30 px-3 py-1 rounded-full">
                {mt.scriptureRef}
              </span>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 dark:bg-gray-800/20 backdrop-blur-md p-6 rounded-3xl border border-gray-150 dark:border-white/5 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full filter blur-xl transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform" />
                <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider block leading-none">{mt.registeredEvents}</span>
                <span className="text-4xl font-black text-purple-600 dark:text-purple-400 block mt-2.5 tracking-tight">{stats.events}</span>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/20 backdrop-blur-md p-6 rounded-3xl border border-gray-150 dark:border-white/5 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full filter blur-xl transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform" />
                <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider block leading-none">{mt.prayerRequests}</span>
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 block mt-2.5 tracking-tight">{stats.prayers}</span>
              </div>
            </div>

            {/* Navigation Directory Grid */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                {mt.directoryTitle}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: mt.services.profile.title, desc: mt.services.profile.desc, href: "/member/profile", icon: User, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20 border-purple-100" },
                  { title: mt.services.events.title, desc: mt.services.events.desc, href: "/member/events", icon: Calendar, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100" },
                  { title: mt.services.prayers.title, desc: mt.services.prayers.desc, href: "/member/prayers", icon: Heart, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-100" },
                  { title: mt.services.sermons.title, desc: mt.services.sermons.desc, href: "/member/sermons", icon: BookOpen, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-100" },
                  { title: mt.services.volunteer.title, desc: mt.services.volunteer.desc, href: "/member/volunteer", icon: Briefcase, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100" },
                  { title: mt.services.giving.title, desc: mt.services.giving.desc, href: "/give", icon: Gift, color: "text-green-500 bg-green-50 dark:bg-green-950/20 border-green-100" },
                ].map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    className="group bg-white/40 dark:bg-gray-800/20 backdrop-blur-md rounded-3xl border border-gray-150 dark:border-white/5 shadow-md p-6 hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900/40 hover:scale-[1.01] transition-all duration-300 flex items-start gap-4"
                  >
                    <div className={`p-3.5 rounded-2xl flex-shrink-0 group-hover:scale-110 group-hover:rotate-[360deg] transition-all duration-500 ${link.color}`}>
                      <link.icon className="w-5.5 h-5.5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {link.title}
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {link.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Right Side: Announcements broadsheet */}
          <div className="lg:col-span-4 bg-white/40 dark:bg-gray-800/20 backdrop-blur-md rounded-3xl border border-gray-150 dark:border-white/5 shadow-xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
              <Bell className="w-5 h-5 text-purple-600 animate-bounce" />
              {mt.latestAnnouncements}
            </h3>

            {loadingFeeds ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-gray-50 dark:bg-gray-800/20 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-450">{mt.noAnnouncements}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {announcements.map((anc) => {
                  const isUrgent = anc.priority === 'URGENT' || anc.priority === 'HIGH';
                  return (
                    <div 
                      key={anc.id} 
                      className={`p-5 rounded-2xl border text-sm leading-relaxed transition-all duration-300 hover:scale-[1.01] ${
                        isUrgent
                          ? 'bg-red-50/40 dark:bg-red-950/10 border-red-200/50 dark:border-red-900/30'
                          : 'bg-white/40 dark:bg-gray-905/30 border-gray-150 dark:border-white/5 shadow-inner'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="font-bold text-gray-900 dark:text-white block tracking-tight leading-tight">{anc.title}</span>
                        {isUrgent && (
                          <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 tracking-widest animate-pulse">
                            {mt.urgent}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                        {anc.content}
                      </p>
                      <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1.5 uppercase tracking-wide">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        {new Date(anc.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

function LoaderSpinner({ label }: { label: string }) {
  return (
    <div className="space-y-4">
      <div className="relative w-12 h-12 mx-auto">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500/10 border-t-purple-600" />
        <div className="absolute inset-1.5 rounded-full bg-purple-500/20 animate-ping" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
}
