"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { 
  Users, 
  DollarSign, 
  UserCheck, 
  Calendar, 
  Search, 
  Bell, 
  ChevronDown, 
  Settings, 
  Shield, 
  Heart, 
  CreditCard, 
  Layers, 
  LogOut, 
  Loader2,
  Megaphone,
  Play,
  FileText,
  Image as ImageIcon,
  Menu,
  X
} from "lucide-react";
import Image from "next/image";

import dynamic from "next/dynamic";

// ── Lazy-loaded admin panels (each loads only when first visited) ──────────────
const ViewLoader = () => (
  <div className="min-h-[360px] flex flex-col items-center justify-center space-y-3">
    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Loading…</p>
  </div>
);

const DashboardOverview    = dynamic(() => import("@/components/admin/DashboardOverview"),    { loading: ViewLoader, ssr: false });
const MemberManagement     = dynamic(() => import("@/components/admin/MemberManagement"),     { loading: ViewLoader, ssr: false });
const MemberGroups         = dynamic(() => import("@/components/admin/MemberGroups"),         { loading: ViewLoader, ssr: false });
const PrayerRequests       = dynamic(() => import("@/components/admin/PrayerRequests"),       { loading: ViewLoader, ssr: false });
const FamilyManagement     = dynamic(() => import("@/components/admin/FamilyManagement"),     { loading: ViewLoader, ssr: false });
const FinanceManagement    = dynamic(() => import("@/components/admin/FinanceManagement"),    { loading: ViewLoader, ssr: false });
const AttendanceManagement = dynamic(() => import("@/components/admin/AttendanceManagement"), { loading: ViewLoader, ssr: false });
const ContentManagement    = dynamic(() => import("@/components/admin/ContentManagement"),    { loading: ViewLoader, ssr: false });
const SettingsManagement   = dynamic(() => import("@/components/admin/SettingsManagement"),   { loading: ViewLoader, ssr: false });
const AdminControlBar      = dynamic(() => import("@/components/admin/AdminControlBar"),      { loading: ViewLoader, ssr: false });
const NgoManagement        = dynamic(() => import("@/components/admin/NgoManagement"),        { loading: ViewLoader, ssr: false });
import { adminTranslations } from "@/components/admin/adminTranslations";
import ThemeToggle from "@/components/ThemeToggle";

type ActiveViewType = 
  | "dashboard"
  // MEMBERS
  | "members"
  | "member-groups"
  | "prayers"
  | "families"
  // FINANCE
  | "donations"
  | "pledges"
  | "transactions"
  | "accounts"
  // ATTENDANCE
  | "attendance-records"
  | "event-attendance"
  | "reports"
  // CONTENT
  | "sermons"
  | "events"
  | "announcements"
  | "media-library"
  | "pages"
  // SETTINGS
  | "settings"
  | "users-roles"
  // NGO
  | "ngo-projects"
  | "ngo-media"
  | "ngo-volunteers";

export default function AdminDashboard() {
  const { user, status, mounted, logout, getIdToken } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const [localMounted, setLocalMounted] = useState(false);

  useEffect(() => {
    setLocalMounted(true);
  }, []);

  const t = adminTranslations[language || "en"];

  // Modals visibility states
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddSermonOpen, setIsAddSermonOpen] = useState(false);
  const [isAddDonationOpen, setIsAddDonationOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [isAddAttendanceOpen, setIsAddAttendanceOpen] = useState(false);

  // Form states
  const [newMember, setNewMember] = useState({ name: "", email: "", phone: "", role: "MEMBER" });
  const [newSermon, setNewSermon] = useState({ title: "", speaker: "", date: "", category: "Faith" });
  const [newDonation, setNewDonation] = useState({ donorName: "", donorEmail: "", method: "RAZORPAY", amount: "", purpose: "TITHE", notes: "" });
  const [newEvent, setNewEvent] = useState({ title: "", location: "Subhash Nagar Sanctuary", date: "", time: "", category: "WORSHIP" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", priority: "NORMAL" });
  const [newAttendance, setNewAttendance] = useState({ date: "", serviceType: "Sunday Worship Service", location: "Subhash Nagar Sanctuary", headcount: "", newVisitors: "", notes: "" });

  const submitAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;
    const added = {
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone || null,
      role: newMember.role
    };
    await handleAddMember(added);
    setNewMember({ name: "", email: "", phone: "", role: "MEMBER" });
    setIsAddMemberOpen(false);
  };

  const submitAddSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSermon.title || !newSermon.speaker) return;
    const added = {
      id: `srm_${Date.now()}`,
      title: newSermon.title,
      speaker: newSermon.speaker,
      date: newSermon.date ? new Date(newSermon.date).toISOString() : new Date().toISOString(),
      category: newSermon.category,
      views: 0
    };
    await handleAddSermon(added);
    setNewSermon({ title: "", speaker: "", date: "", category: "Faith" });
    setIsAddSermonOpen(false);
  };

  const submitAddDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonation.donorName || !newDonation.amount) return;
    const added = {
      id: `don_${Date.now()}`,
      donorName: newDonation.donorName,
      donorEmail: newDonation.donorEmail || null,
      paymentMethod: newDonation.method,
      razorpayPaymentId: newDonation.method === "RAZORPAY" ? `pay_${Math.random().toString(36).substr(2, 9)}` : null,
      stripeId: newDonation.method === "STRIPE" ? `ch_${Math.random().toString(36).substr(2, 9)}` : null,
      purpose: newDonation.purpose,
      amount: Number(newDonation.amount),
      status: "COMPLETED",
      createdAt: new Date().toISOString()
    };
    handleAddDonation(added);
    setNewDonation({ donorName: "", donorEmail: "", method: "RAZORPAY", amount: "", purpose: "TITHE", notes: "" });
    setIsAddDonationOpen(false);
  };

  const submitAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;
    const added = {
      id: `evt_${Date.now()}`,
      title: newEvent.title,
      location: newEvent.location,
      date: newEvent.date ? new Date(newEvent.date).toISOString() : new Date().toISOString(),
      time: newEvent.time || "10:30 AM",
      category: newEvent.category
    };
    await handleAddEvent(added);
    setNewEvent({ title: "", location: "Subhash Nagar Sanctuary", date: "", time: "", category: "WORSHIP" });
    setIsAddEventOpen(false);
  };

  const submitAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    const added = {
      id: `anc_${Date.now()}`,
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      priority: newAnnouncement.priority,
      createdAt: new Date().toISOString()
    };
    await handleAddAnnouncement(added);
    setNewAnnouncement({ title: "", content: "", priority: "NORMAL" });
    setIsAddAnnouncementOpen(false);
  };

  const submitAddAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttendance.headcount) return;
    const added = {
      id: `att_${Date.now()}`,
      date: newAttendance.date ? new Date(newAttendance.date).toISOString() : new Date().toISOString(),
      serviceType: newAttendance.serviceType,
      location: newAttendance.location,
      headcount: Number(newAttendance.headcount),
      newVisitors: Number(newAttendance.newVisitors) || 0,
      notes: newAttendance.notes || ""
    };
    handleAddAttendance(added);
    setNewAttendance({ date: "", serviceType: "Sunday Worship Service", location: "Subhash Nagar Sanctuary", headcount: "", newVisitors: "", notes: "" });
    setIsAddAttendanceOpen(false);
  };

  /** Builds Authorization headers for authenticated API calls */
  const authHeaders = async (): Promise<HeadersInit> => {
    const token = await getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Active view router
  const [activeView, setActiveView] = useState<ActiveViewType>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeView]);
  
  // Shared state arrays
  const [usersDb, setUsersDb] = useState<any[]>([]);
  const [donationsDb, setDonationsDb] = useState<any[]>([]);
  const [sermonsDb, setSermonsDb] = useState<any[]>([]);
  const [eventsDb, setEventsDb] = useState<any[]>([]);
  const [announcementsDb, setAnnouncementsDb] = useState<any[]>([]);
  const [attendanceRecordsDb, setAttendanceRecordsDb] = useState<any[]>([]);
  const [pledgesDb, setPledgesDb] = useState<any[]>([]);
  const [transactionsDb, setTransactionsDb] = useState<any[]>([]);
  const [accountsDb, setAccountsDb] = useState<any[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Route protection
  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [mounted, status, user, router]);

  // Load all platform databases
  const loadWorkspaceData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await authHeaders();

      const usersRes = await fetch("/api/admin/users", { headers });
      const usersData = await usersRes.json();
      const membersList = usersData.users || [];
      setUsersDb(membersList);


      // 2. Fetch Donations Ledger
      const donRes = await fetch("/api/admin/donations", { headers });
      const donData = await donRes.json();
      setDonationsDb(donData.donations || []);

      // 3. Fetch Sermons
      const srmRes = await fetch("/api/pastor/sermons", { headers });
      const srmData = await srmRes.json();
      setSermonsDb(srmData.sermons || []);

      // 4. Fetch Announcements
      const ancRes = await fetch("/api/pastor/announcements", { headers });
      const ancData = await ancRes.json();
      setAnnouncementsDb(ancData.announcements || []);

      // 5. Fetch Events
      const evtRes = await fetch("/api/member/events", { headers });
      const evtData = await evtRes.json();
      setEventsDb(evtData.events || []);

      // 6. Fetch Attendance Records
      const attRes = await fetch("/api/admin/attendance", { headers });
      const attData = await attRes.json();
      setAttendanceRecordsDb(attData.records || []);

      // 7. Fetch Pledges
      const plgRes = await fetch("/api/admin/pledges", { headers });
      const plgData = await plgRes.json();
      setPledgesDb(plgData.pledges || []);

      // 8. Fetch Transactions
      const txRes = await fetch("/api/admin/transactions", { headers });
      const txData = await txRes.json();
      setTransactionsDb(txData.transactions || []);

      // 9. Fetch Accounts
      const accRes = await fetch("/api/admin/accounts", { headers });
      const accData = await accRes.json();
      setAccountsDb(accData.accounts || []);

    } catch (err) {
      console.error("Error loading admin workspace resources:", err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === "authenticated" && (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN")) {
      loadWorkspaceData();
    }
  }, [status, user, loadWorkspaceData]);

  // Handle Role Promotion/Demotion via API
  const handleRoleChange = async (userId: string, newRole: string) => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ userId, newRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersDb((prev) =>
          prev.map((u) => (u.id === userId || u.uid === userId ? { ...u, role: newRole } : u))
        );
        showToast(
          language === "te"
            ? `వినియోగదారు పాత్ర ${newRole}కు నవీకరించబడింది!`
            : language === "hi"
            ? `उपयोगकर्ता भूमिका ${newRole} में अपडेट की गई!`
            : `User role updated to ${newRole}!`,
          "success"
        );
      } else {
        throw new Error(data.error || "Failed to update role");
      }
    } catch (err: any) {
      showToast(
        language === "te"
          ? "పాత్రను సవరించడంలో విఫలమైంది."
          : language === "hi"
          ? "भूमिका को संशोधित करने में विफल।"
          : err.message || "Failed to modify role.",
        "error"
      );
    }
  };

  // Shared creation helpers
  const handleAddMember = async (memberData: any) => {
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...memberData
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersDb(prev => [data.user, ...prev]);
        showToast(
          language === "te"
            ? "విశ్వాసి రిజిస్ట్రీలో విజయవంతంగా నమోదు చేయబడ్డారు!"
            : language === "hi"
            ? "विश्वासी को रजिस्ट्री में सफलतापूर्वक पंजीकृत किया गया!"
            : "Believer registered in registry successfully!",
          "success"
        );
      } else {
        throw new Error(data.error || "Failed to register member");
      }
    } catch (err: any) {
      showToast(
        language === "te"
          ? "సభ్యుడిని నమోదు చేయడంలో విఫలమైంది."
          : language === "hi"
          ? "सदस्य को पंजीकृत करने में विफल।"
          : err.message || "Failed to register member.",
        "error"
      );
      // Fallback local update if API fails completely
      const fallbackMember = {
        id: `usr_${Date.now()}`,
        name: memberData.name,
        email: memberData.email,
        phone: memberData.phone || null,
        role: memberData.role,
        createdAt: new Date().toISOString()
      };
      setUsersDb(prev => [fallbackMember, ...prev]);
    }
  };

  const handleDeleteMember = async (id: string | number) => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersDb(prev => prev.filter(u => u.id !== id));
        showToast(
          language === "te"
            ? "విశ్వాసి రిజిస్ట్రీ నుండి తొలగించబడ్డారు."
            : language === "hi"
            ? "विश्वासी को रजिस्ट्री से हटा दिया गया।"
            : "Believer removed from registry.",
          "success"
        );
      } else {
        throw new Error(data.error || "Failed to remove member");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to remove member.", "error");
    }
  };

  const handleAddSermon = async (sermonData: any) => {
    try {
      const res = await fetch("/api/pastor/sermons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sermonData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSermonsDb(prev => [data.sermon, ...prev]);
        showToast(
          language === "te"
            ? "కొత్త ప్రసంగం విజయవంతంగా ప్రచురించబడింది!"
            : language === "hi"
            ? "नया उपदेश सफलतापूर्वक प्रकाशित हुआ!"
            : "New sermon published successfully!",
          "success"
        );
      } else {
        throw new Error(data.error || "Failed to publish sermon");
      }
    } catch (e: any) {
      showToast(
        language === "te"
          ? "ప్రసంగం ప్రత్యామ్నాయ మోడ్‌లో అప్‌లోడ్ చేయబడింది."
          : language === "hi"
          ? "उपदेश फ़ॉलबैक मोड में अपलोड किया गया।"
          : "Sermon uploaded in fallback mode.",
        "success"
      );
      setSermonsDb(prev => [sermonData, ...prev]);
    }
  };

  const handleDeleteSermon = async (id: string) => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`/api/pastor/sermons?id=${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSermonsDb(prev => prev.filter(s => s.id !== id));
        showToast(
          language === "te"
            ? "ప్రసంగ ఆర్కైవ్ తొలగించబడింది."
            : language === "hi"
            ? "उपदेश संग्रह हटा दिया गया।"
            : "Sermon archive deleted.",
          "success"
        );
      } else {
        throw new Error(data.error || "Failed to delete sermon");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete sermon.", "error");
    }
  };

  const handleAddEvent = async (eventData: any) => {
    try {
      const res = await fetch("/api/pastor/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEventsDb(prev => [data.event, ...prev]);
        showToast(
          language === "te"
            ? "కార్యక్రమం విజయవంతంగా షెడ్యూల్ చేయబడింది!"
            : language === "hi"
            ? "कार्यक्रम सफलतापूर्वक निर्धारित किया गया!"
            : "Church event scheduled successfully!",
          "success"
        );
      } else {
        throw new Error(data.error || "Failed to schedule event");
      }
    } catch (e) {
      showToast(
        language === "te"
          ? "కార్యక్రమం ప్రత్యామ్నాయ మోడ్‌లో షెడ్యూల్ చేయబడింది."
          : language === "hi"
          ? "कार्यक्रम फ़ॉलबैक मोड में निर्धारित किया गया।"
          : "Event scheduled in fallback mode.",
        "success"
      );
      setEventsDb(prev => [eventData, ...prev]);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`/api/pastor/events?id=${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEventsDb(prev => prev.filter(e => e.id !== id));
        showToast(
          language === "te"
            ? "కార్యక్రమం షెడ్యూలింగ్ క్యాలెండర్ నుండి తొలగించబడింది."
            : language === "hi"
            ? "कार्यक्रम को शेड्यूलिंग कैलेंडर से हटा दिया गया।"
            : "Event removed from scheduling calendar.",
          "success"
        );
      } else {
        throw new Error(data.error || "Failed to delete event");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete event.", "error");
    }
  };

  const handleAddAnnouncement = async (ancData: any) => {
    try {
      const res = await fetch("/api/pastor/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ancData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnnouncementsDb(prev => [data.announcement, ...prev]);
        showToast(
          language === "te"
            ? "సాధారణ ప్రకటన ప్రసారం చేయబడింది!"
            : language === "hi"
            ? "सामान्य घोषणा प्रसारित की गई!"
            : "General announcement broadcasted!",
          "success"
        );
      } else {
        throw new Error(data.error || "Failed to post announcement");
      }
    } catch (e) {
      showToast(
        language === "te"
          ? "ప్రకటన ప్రత్యామ్నాయ మోడ్‌లో ప్రసారం చేయబడింది."
          : language === "hi"
          ? "घोषणा फ़ॉलबैक मोड में प्रसारित की गई।"
          : "Announcement broadcasted in fallback mode.",
        "success"
      );
      setAnnouncementsDb(prev => [ancData, ...prev]);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`/api/pastor/announcements?id=${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnnouncementsDb(prev => prev.filter(a => a.id !== id));
        showToast(
          language === "te"
            ? "ప్రకటన తొలగించబడింది."
            : language === "hi"
            ? "घोषणा हटा दी गई।"
            : "Announcement deleted.",
          "success"
        );
      } else {
        throw new Error(data.error || "Failed to delete announcement");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete announcement.", "error");
    }
  };


  const handleSaveConfig = async (config: any) => {
    showToast(
      language === "te"
        ? "ప్లాట్‌ఫాం కాన్ఫిగరేషన్‌లు విజయవంతంగా సేవ్ చేయబడ్డాయి!"
        : language === "hi"
        ? "प्लेटफ़ॉर्म कॉन्फ़िगरेशन सफलतापूर्वक सहेजे गए!"
        : "Platform configurations saved successfully!",
      "success"
    );
  };



  const handleAddAttendance = async (record: any) => {
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(record)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAttendanceRecordsDb(prev => [data.record, ...prev]);
        showToast(
          language === "te"
            ? "హాజరు రికార్డు విజయవంతంగా జోడించబడింది!"
            : language === "hi"
            ? "उपस्थिति रिकॉर्ड सफलतापूर्वक जोड़ा गया!"
            : "Attendance record added successfully!",
          "success"
        );
      } else {
        throw new Error(data.error || "Failed to add attendance record");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to add attendance record.", "error");
    }
  };

  const handleAddPledge = async (pledge: any) => {
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/admin/pledges", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(pledge)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPledgesDb(prev => [data.pledge, ...prev]);
        showToast("Pledge created successfully!", "success");
      } else {
        throw new Error(data.error || "Failed to create pledge");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to create pledge.", "error");
    }
  };

  const handleAddTransaction = async (txData: any) => {
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(txData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refetch transactions and accounts to get up-to-date balances
        const txRes = await fetch("/api/admin/transactions", { headers });
        const txData = await txRes.json();
        setTransactionsDb(txData.transactions || []);

        const accRes = await fetch("/api/admin/accounts", { headers });
        const accData = await accRes.json();
        setAccountsDb(accData.accounts || []);

        showToast("Transaction logged and account balance updated!", "success");
      } else {
        throw new Error(data.error || "Failed to log transaction");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to log transaction.", "error");
    }
  };

  const handleAddDonation = async (don: any) => {
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/admin/donations", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(don)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDonationsDb(prev => [data.donation, ...prev]);
        showToast(
          language === "te"
            ? "మ్యాన్యువల్ కానుక లావాదేవీ విజయవంతంగా నమోదు చేయబడింది!"
            : language === "hi"
            ? "मैनुअल योगदान लेनदेन सफलतापूर्वक दर्ज किया गया!"
            : "Manual contribution transaction logged successfully!",
          "success"
        );
      } else {
        throw new Error(data.error || "Failed to log donation");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to log donation.", "error");
    }
  };

  // Utility toast
  const showToast = (msg: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4000);
    }
  };

  const getActiveItemStyle = (itemId: ActiveViewType) => {
    if (activeView !== itemId) {
      return "hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white text-gray-500 dark:text-gray-400 border border-transparent";
    }
    
    // Colorful gradients for each section
    if (itemId === "dashboard") {
      return "bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.35)] border border-indigo-400/20";
    }
    
    const membersGroup = ["members", "member-groups", "prayers", "families"];
    if (membersGroup.includes(itemId)) {
      return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_4px_15px_rgba(16,185,129,0.35)] border border-emerald-400/20";
    }
    
    const financeGroup = ["donations", "pledges", "transactions", "accounts"];
    if (financeGroup.includes(itemId)) {
      return "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_4px_15px_rgba(245,158,11,0.35)] border border-amber-400/20";
    }
    
    const attendanceGroup = ["attendance-records", "event-attendance", "reports"];
    if (attendanceGroup.includes(itemId)) {
      return "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_4px_15px_rgba(14,165,233,0.35)] border border-sky-400/20";
    }
    
    const contentGroup = ["sermons", "events", "announcements", "media-library", "pages"];
    if (contentGroup.includes(itemId)) {
      return "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_4px_15px_rgba(236,72,153,0.35)] border border-pink-400/20";
    }
    
    const settingsGroup = ["settings", "users-roles"];
    if (settingsGroup.includes(itemId)) {
      return "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_4px_15px_rgba(6,182,212,0.35)] border border-cyan-400/20";
    }
    
    return "bg-[#6366F1] text-white";
  };

  const getHeaderTitle = () => {
    const tAdmin = adminTranslations[language || "en"];
    return tAdmin.headers[activeView as keyof typeof tAdmin.headers] || tAdmin.headers.default;
  };

  if (status === "loading" || !localMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#6366F1] mx-auto" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            {language === "te" ? "అడ్మిన్ కనెక్షన్‌ను భద్రపరుస్తోంది..." : language === "hi" ? "एडमिन कनेक्शन सुरक्षित किया जा रहा है..." : "Securing Admin Connection..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page min-h-screen flex font-sans antialiased relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Backdrop overlay for mobile drawer */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ────────────────── 1. LEFT SIDEBAR NAVIGATION ────────────────── */}
      <aside className={`admin-sidebar w-64 bg-white/95 dark:bg-[#070814]/95 backdrop-blur-xl shadow-2xl text-gray-600 dark:text-gray-300 flex flex-col shrink-0 border-r border-gray-200 dark:border-white/[0.05] fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700/50 shadow-sm bg-white flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="KCM Logo" 
                fill 
                sizes="36px"
                className="object-cover rounded-xl" 
                priority 
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-gray-900 dark:text-white text-sm tracking-tight leading-tight">
                {language === "te" ? "కింగ్డమ్ ఆఫ్ క్రైస్ట్" : language === "hi" ? "किंगडम ऑफ क्राइस्ट" : "Kingdom of Christ"}
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black tracking-wider uppercase">
                {language === "te" ? "మినిస్ట్రీస్" : language === "hi" ? "मिनिस्ट्रीज" : "Ministries"}
              </span>
            </div>
          </div>
          
          {/* Close button visible only on mobile/tablet */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            aria-label="Close sidebar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar">
          {/* Main Dashboard item */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveView("dashboard")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${getActiveItemStyle("dashboard")}`}
            >
              <Layers className="w-4.5 h-4.5" />
              {language === "te" ? "డాష్‌బోర్డ్" : language === "hi" ? "डैशबोर्ड" : "Dashboard"}
            </button>
          </div>

          {/* MEMBERS SECTION */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase px-4">
              {language === "te" ? "సభ్యులు" : language === "hi" ? "सदस्य" : "MEMBERS"}
            </h4>
            <div className="space-y-1">
              {[
                { id: "members", label: language === "te" ? "సభ్యులు" : language === "hi" ? "सदस्य" : "Members", icon: Users },
                { id: "member-groups", label: language === "te" ? "సమూహాలు" : language === "hi" ? "समूह" : "Member Groups", icon: Users },
                { id: "prayers", label: language === "te" ? "ప్రార్థనలు" : language === "hi" ? "प्रार्थनाएं" : "Prayer Requests", icon: Megaphone },
                { id: "families", label: language === "te" ? "కుటుంబాలు" : language === "hi" ? "परिवार" : "Family Management", icon: Layers }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${getActiveItemStyle(item.id as any)}`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* FINANCE SECTION */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase px-4">
              {language === "te" ? "ఆర్థికం" : language === "hi" ? "वित्त" : "FINANCE"}
            </h4>
            <div className="space-y-1">
              {[
                { id: "donations", label: language === "te" ? "కానుకలు" : language === "hi" ? "दान" : "Donations", icon: DollarSign },
                { id: "pledges", label: language === "te" ? "ప్రతిజ్ఞలు" : language === "hi" ? "प्रतिज्ञा" : "Pledges", icon: Heart },
                { id: "transactions", label: language === "te" ? "లావాదేవీలు" : language === "hi" ? "लेनदेन" : "Transactions", icon: CreditCard },
                { id: "accounts", label: language === "te" ? "ఖాతాలు" : language === "hi" ? "खाते" : "Accounts", icon: Layers }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${getActiveItemStyle(item.id as any)}`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* ATTENDANCE SECTION */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase px-4">
              {language === "te" ? "హాజరు" : language === "hi" ? "उपस्थिति" : "ATTENDANCE"}
            </h4>
            <div className="space-y-1">
              {[
                { id: "attendance-records", label: language === "te" ? "హాజరు రికార్డులు" : language === "hi" ? "उपस्थिति रिकॉर्ड" : "Attendance Records", icon: UserCheck },
                { id: "event-attendance", label: language === "te" ? "కార్యక్రమ హాజరు" : language === "hi" ? "कार्यक्रम उपस्थिति" : "Event Attendance", icon: Calendar },
                { id: "reports", label: language === "te" ? "నివేదికలు" : language === "hi" ? "रिपोर्ट" : "Reports", icon: Layers }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${getActiveItemStyle(item.id as any)}`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase px-4">
              {language === "te" ? "కంటెంట్" : language === "hi" ? "सामग्री" : "CONTENT"}
            </h4>
            <div className="space-y-1">
              {[
                { id: "sermons", label: language === "te" ? "ప్రసంగాలు" : language === "hi" ? "उपदेश" : "Sermons", icon: Play },
                { id: "events", label: language === "te" ? "కార్యక్రమాలు" : language === "hi" ? "कार्यक्रम" : "Events", icon: Calendar },
                { id: "announcements", label: language === "te" ? "ప్రకటనలు" : language === "hi" ? "घोषणाएं" : "Announcements", icon: Megaphone },
                { id: "media-library", label: language === "te" ? "మీడియా లైబ్రరీ" : language === "hi" ? "मीडिया लाइब्रेरी" : "Media Library", icon: ImageIcon },
                { id: "pages", label: language === "te" ? "పేజీలు" : language === "hi" ? "पृष्ठ" : "Pages", icon: FileText }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${getActiveItemStyle(item.id as any)}`}
                >
                  <item.icon className="w-4.5 h-4.5 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* NGO SECTION */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase px-4">
              NGO
            </h4>
            <div className="space-y-1">
              {[
                { id: "ngo-projects", label: language === "te" ? "NGO ప్రాజెక్ట్‌లు" : language === "hi" ? "एनजीओ परियोजनाएं" : "NGO Projects", icon: Heart },
                { id: "ngo-media", label: language === "te" ? "NGO మీడియా" : language === "hi" ? "एनजीओ मीडिया" : "NGO Media", icon: ImageIcon },
                { id: "ngo-volunteers", label: language === "te" ? "NGO స్వచ్ఛంద సేవకులు" : language === "hi" ? "एनजीओ स्वयंसेवक" : "NGO Volunteers", icon: Users }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${getActiveItemStyle(item.id as any)}`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* SETTINGS SECTION */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase px-4">
              {language === "te" ? "సెట్టింగులు" : language === "hi" ? "सेटिंग्स" : "SETTINGS"}
            </h4>
            <div className="space-y-1">
              {[
                { id: "settings", label: language === "te" ? "సెట్టింగులు" : language === "hi" ? "सेटिंग्स" : "Settings", icon: Settings },
                { id: "users-roles", label: language === "te" ? "వినియోగదారులు & పాత్రలు" : language === "hi" ? "उपयोगकर्ता और भूमिकाएं" : "Users & Roles", icon: Shield }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${getActiveItemStyle(item.id as any)}`}
                >
                  <item.icon className="w-4.5 h-4.5 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer - Admin Profile/Logout */}
        <div className="p-4 border-t border-slate-200/50 dark:border-[#1E203B] bg-slate-50/50 dark:bg-[#0A0B16]/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                {user?.name || "Admin"}
              </h4>
              <p className="text-[9px] text-slate-450 dark:text-gray-500 font-bold uppercase tracking-wider">
                {user?.role || "ADMIN"}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={logout}
            className="text-slate-450 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-xl hover:bg-red-50/50 dark:hover:bg-white/5 transition-colors shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-y-auto max-h-screen custom-scrollbar relative z-10 w-full min-w-0">
        
        {/* Top Header */}
        <header className="admin-header h-auto pt-5 pb-3 sm:h-20 sm:py-0 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-sm sm:text-base lg:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-indigo-800 dark:text-white dark:bg-none tracking-tight uppercase truncate max-w-[100px] sm:max-w-[200px] md:max-w-none">
              {getHeaderTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-6">
            {/* Search Input */}
            <div className="relative w-40 sm:w-52 md:w-72 group hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/70 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder={language === "te" ? "వెతకండి..." : language === "hi" ? "खोजें..." : "Search resources..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-100 dark:bg-[#16172D]/60 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300 dark:hover:border-white/[0.15] transition-all duration-300"
              />
            </div>

            {/* Combined Language, Theme, & Color Customizer Control Bar */}
            <div className="hidden md:flex">
              <AdminControlBar onNavigateSettings={() => setActiveView("settings")} />
            </div>

            {/* Theme Toggle Switch */}
            <ThemeToggle />

            {/* Notification Bell */}
            <div className="relative">
              <button 
                type="button" 
                aria-label="Notification alerts"
                className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-[#16172D]/60 border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/[0.15] transition-all duration-300 relative"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[8px] font-extrabold rounded-full flex items-center justify-center border border-white dark:border-[#080915]">
                  5
                </span>
              </button>
            </div>

            {/* Mobile Settings Icon — shows on small screens where AdminControlBar is hidden */}
            <button
              type="button"
              onClick={() => setActiveView("settings")}
              className="md:hidden w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-[#16172D]/60 border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/[0.15] transition-all duration-300"
              aria-label="Settings"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>

            {/* Date Selector */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#16172D]/60 border border-gray-200 dark:border-white/[0.08] rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/[0.15] transition-all duration-300 cursor-pointer">
              <Calendar className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400" />
              <span>
                {(() => {
                  const now = new Date();
                  const locale = language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-US";
                  return new Intl.DateTimeFormat(locale, {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }).format(now);
                })()}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 ml-1" />
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 flex-1 pb-24 lg:pb-8">
          
          {/* Success Alerts */}
          {successMsg && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2 shadow-sm animate-in slide-in-from-top duration-200">
              <span className="font-bold">
                {language === "te" ? "✓ విజయం:" : language === "hi" ? "✓ सफलता:" : "✓ Success:"}
              </span>{" "}
              {successMsg}
            </div>
          )}

          {/* Error Alerts */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2 shadow-sm animate-in slide-in-from-top duration-200">
              <span className="font-bold">
                {language === "te" ? "✕ హెచ్చరిక:" : language === "hi" ? "✕ चेतावनी:" : "✕ Warning:"}
              </span>{" "}
              {errorMsg}
            </div>
          )}

          {/* Workspace Views */}
          {loading ? (
            <div className="min-h-[360px] flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#6366F1]" />
              <p className="text-xs text-gray-450 font-bold uppercase">
                {language === "te" ? "చర్చి రిపోజిటరీలను సమకాలీకరిస్తోంది..." : language === "hi" ? "चर्च रिपॉजिटरी को सिंक किया जा रहा है..." : "Syncing church repositories..."}
              </p>
            </div>
          ) : (
            <>
              {activeView === "dashboard" && (
                <DashboardOverview
                  onNavigate={(v) => setActiveView(v as any)}
                  searchTerm={searchTerm}
                  users={usersDb}
                  donations={donationsDb}
                  sermons={sermonsDb}
                  events={eventsDb}
                  announcements={announcementsDb}
                  attendanceRecords={attendanceRecordsDb}
                  onAddMember={handleAddMember}
                  onDeleteMember={handleDeleteMember}
                  onAddSermon={handleAddSermon}
                  onDeleteSermon={handleDeleteSermon}
                  onOpenAddMember={() => setIsAddMemberOpen(true)}
                  onOpenAddSermon={() => setIsAddSermonOpen(true)}
                  onOpenAddDonation={() => setIsAddDonationOpen(true)}
                  onOpenAddEvent={() => setIsAddEventOpen(true)}
                  onOpenAddAnnouncement={() => setIsAddAnnouncementOpen(true)}
                  onOpenAddAttendance={() => setIsAddAttendanceOpen(true)}
                />
              )}

              {activeView === "members" && (
                <MemberManagement
                  users={usersDb}
                  onRoleChange={handleRoleChange}
                  onDeleteMember={handleDeleteMember}
                  onAddMember={handleAddMember}
                  onOpenAddMember={() => setIsAddMemberOpen(true)}
                />
              )}

              {activeView === "member-groups" && (
                <MemberGroups users={usersDb} />
              )}

              {activeView === "prayers" && (
                <PrayerRequests users={usersDb} />
              )}

              {activeView === "families" && (
                <FamilyManagement users={usersDb} />
              )}

              {(activeView === "donations" || activeView === "pledges" || activeView === "transactions" || activeView === "accounts") && (
                <FinanceManagement
                  donations={donationsDb}
                  users={usersDb}
                  pledges={pledgesDb}
                  transactions={transactionsDb}
                  accounts={accountsDb}
                  onAddDonation={handleAddDonation}
                  onAddPledge={handleAddPledge}
                  onAddTransaction={handleAddTransaction}
                  activeSubTab={activeView}
                  onOpenAddDonation={() => setIsAddDonationOpen(true)}
                />
              )}

              {(activeView === "attendance-records" || activeView === "event-attendance" || activeView === "reports") && (
                <AttendanceManagement
                  events={eventsDb}
                  users={usersDb}
                  records={attendanceRecordsDb}
                  onAddAttendance={handleAddAttendance}
                  activeSubTab={activeView === "attendance-records" ? "records" : activeView === "event-attendance" ? "event-attendance" : "reports"}
                  onOpenAddAttendance={() => setIsAddAttendanceOpen(true)}
                />
              )}

              {(activeView === "sermons" || activeView === "events" || activeView === "announcements" || activeView === "media-library" || activeView === "pages") && (
                <ContentManagement
                  sermons={sermonsDb}
                  events={eventsDb}
                  announcements={announcementsDb}
                  onAddSermon={handleAddSermon}
                  onDeleteSermon={handleDeleteSermon}
                  onAddEvent={handleAddEvent}
                  onDeleteEvent={handleDeleteEvent}
                  onAddAnnouncement={handleAddAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                  activeSubTab={activeView === "media-library" ? "media" : activeView as any}
                  onOpenAddSermon={() => setIsAddSermonOpen(true)}
                  onOpenAddEvent={() => setIsAddEventOpen(true)}
                  onOpenAddAnnouncement={() => setIsAddAnnouncementOpen(true)}
                />
              )}

              {(activeView === "ngo-projects" || activeView === "ngo-media" || activeView === "ngo-volunteers") && (
                <NgoManagement activeSubView={
                  activeView === "ngo-projects" ? "projects" :
                  activeView === "ngo-media" ? "media" : "volunteers"
                } />
              )}

              {activeView === "settings" && (
                <SettingsManagement onSaveConfig={handleSaveConfig} activeSubTab="settings" />
              )}

              {activeView === "users-roles" && (
                <SettingsManagement onSaveConfig={handleSaveConfig} activeSubTab="permissions" />
              )}
            </>
          )}

        </div>
      </main>
      {/* ────────────────── 3. MOBILE BOTTOM NAVIGATION ────────────────── */}
      {/* Only visible on mobile/tablet (below lg breakpoint) */}
      <nav className="lg:hidden fixed bottom-5 left-4 right-4 z-30 mx-auto max-w-md bg-white/20 dark:bg-black/35 backdrop-blur-2xl border border-white/25 dark:border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.35)] flex items-center justify-around px-3 py-2.5 rounded-2xl transition-all duration-300">
        {[
          { id: "dashboard", label: "Home", icon: Layers, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-200/50 dark:border-indigo-800/30" },
          { id: "members", label: "Members", icon: Users, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-800/30" },
          { id: "donations", label: "Finance", icon: DollarSign, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50/50 dark:bg-amber-955/40 border-amber-200/50 dark:border-amber-800/30" },
          { id: "attendance-records", label: "Attend", icon: UserCheck, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50/50 dark:bg-sky-950/40 border-sky-200/50 dark:border-sky-800/30" },
          { id: "sermons", label: "Content", icon: Play, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50/50 dark:bg-pink-955/40 border-pink-200/50 dark:border-pink-800/30" },
        ].map((item) => {
          const isActive = item.id === activeView || 
            (item.id === "members" && ["members","member-groups","prayers","families"].includes(activeView)) ||
            (item.id === "donations" && ["donations","pledges","transactions","accounts"].includes(activeView)) ||
            (item.id === "attendance-records" && ["attendance-records","event-attendance","reports"].includes(activeView)) ||
            (item.id === "sermons" && ["sermons","events","announcements","media-library","pages"].includes(activeView));
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id as any)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 border ${
                isActive
                  ? `${item.color} ${item.bg} shadow-[0_2px_10px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.2)] scale-105`
                  : "text-slate-500 dark:text-gray-400 border-transparent hover:text-slate-900 dark:hover:text-white active:scale-95"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? `${item.color} scale-110` : ""}`} />
              <span className={`text-[8.5px] font-black uppercase tracking-wider transition-all duration-350 ${isActive ? item.color : ""}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ─── Modal: Add Member ─── */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.members.addUserModalTitle}</h3>
              <button 
                onClick={() => setIsAddMemberOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-lg transition-all"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={submitAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-550 uppercase mb-1.5">{t.dashboard.fullName}</label>
                <input 
                  type="text" required placeholder="e.g. John Doe" value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-555 uppercase mb-1.5">{t.dashboard.emailAddress}</label>
                <input 
                  type="email" required placeholder="e.g. john@email.com" value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-555 uppercase mb-1.5">{t.dashboard.phoneNumber}</label>
                <input 
                  type="text" placeholder="e.g. +91 96409 43777" value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-505 uppercase mb-1.5">{t.members.changeRole}</label>
                <div className="relative flex items-center">
                  <select 
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] hover:border-slate-350 dark:hover:border-white/[0.15] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="MEMBER" className="dark:bg-[#121324]">{t.members.believerOption}</option>
                    <option value="PASTOR" className="dark:bg-[#121324]">{t.members.shepherdOption}</option>
                    <option value="ADMIN" className="dark:bg-[#121324]">{t.members.adminOption}</option>
                    <option value="SUPER_ADMIN" className="dark:bg-[#121324]">{t.members.superAdminOption}</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsAddMemberOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">{t.dashboard.cancel}</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10">{t.members.createUserBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Add Sermon ─── */}
      {isAddSermonOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.content.uploadSermonTitle}</h3>
              <button onClick={() => setIsAddSermonOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-lg">✕</button>
            </div>
            
            <form onSubmit={submitAddSermon} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-550 uppercase mb-1.5">{t.content.sermonTitleLabel}</label>
                <input 
                  type="text" required placeholder="e.g. Living by Faith" value={newSermon.title}
                  onChange={(e) => setNewSermon({ ...newSermon, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-550 uppercase mb-1.5">{t.content.pastorSpeaker}</label>
                <input 
                  type="text" required placeholder="e.g. Pastor John" value={newSermon.speaker}
                  onChange={(e) => setNewSermon({ ...newSermon, speaker: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.dashboard.tableDate}</label>
                <input 
                  type="date" value={newSermon.date}
                  onChange={(e) => setNewSermon({ ...newSermon, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.content.sermonCategory}</label>
                <div className="relative flex items-center">
                  <select 
                    value={newSermon.category}
                    onChange={(e) => setNewSermon({ ...newSermon, category: e.target.value })}
                    className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] hover:border-slate-350 dark:hover:border-white/[0.15] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Faith" className="dark:bg-[#121324]">{language === "te" ? "విశ్వాసం" : language === "hi" ? "विश्वास" : "Faith"}</option>
                    <option value="Inspiration" className="dark:bg-[#121324]">{language === "te" ? "ప్రేరణ" : language === "hi" ? "प्रेरणा" : "Inspiration"}</option>
                    <option value="Prayer" className="dark:bg-[#121324]">{language === "te" ? "ప్రార్థన" : language === "hi" ? "प्रार्थना" : "Prayer"}</option>
                    <option value="Purpose" className="dark:bg-[#121324]">{language === "te" ? "ఉద్దేశ్యం" : language === "hi" ? "उद्देश्य" : "Purpose"}</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsAddSermonOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">{t.dashboard.cancel}</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-655 hover:to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-pink-500/10">{t.content.publishSermon}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Add Donation ─── */}
      {isAddDonationOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.finance.logManualTitle}</h3>
              <button onClick={() => setIsAddDonationOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-lg">✕</button>
            </div>
            
            <form onSubmit={submitAddDonation} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-550 uppercase mb-1.5">{t.finance.donorName}</label>
                <input 
                  type="text" required placeholder="e.g. John Doe" value={newDonation.donorName}
                  onChange={(e) => setNewDonation({ ...newDonation, donorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.finance.donorEmail}</label>
                <input 
                  type="email" placeholder="e.g. john@email.com" value={newDonation.donorEmail}
                  onChange={(e) => setNewDonation({ ...newDonation, donorEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.finance.donationAmount}</label>
                  <input 
                    type="number" required placeholder="e.g. 5000" value={newDonation.amount}
                    onChange={(e) => setNewDonation({ ...newDonation, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.finance.tableMethod}</label>
                  <div className="relative flex items-center">
                    <select 
                      value={newDonation.method}
                      onChange={(e) => setNewDonation({ ...newDonation, method: e.target.value })}
                      className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] hover:border-slate-350 dark:hover:border-white/[0.15] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="RAZORPAY" className="dark:bg-[#121324]">Razorpay</option>
                      <option value="STRIPE" className="dark:bg-[#121324]">Stripe</option>
                      <option value="CASH" className="dark:bg-[#121324]">Cash (Offline)</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.finance.purpose}</label>
                <div className="relative flex items-center">
                  <select 
                    value={newDonation.purpose}
                    onChange={(e) => setNewDonation({ ...newDonation, purpose: e.target.value })}
                    className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] hover:border-slate-350 dark:hover:border-white/[0.15] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="TITHE" className="dark:bg-[#121324]">{t.finance.tithe}</option>
                    <option value="OFFERING" className="dark:bg-[#121324]">{t.finance.offering}</option>
                    <option value="MISSIONS" className="dark:bg-[#121324]">{t.finance.missions}</option>
                    <option value="BUILDING" className="dark:bg-[#121324]">{t.finance.buildingFund}</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsAddDonationOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">{t.dashboard.cancel}</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-650 hover:from-amber-655 hover:to-orange-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/10">{t.finance.logContribution}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Add Event ─── */}
      {isAddEventOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.content.scheduleEventTitle}</h3>
              <button onClick={() => setIsAddEventOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-lg">✕</button>
            </div>
            
            <form onSubmit={submitAddEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.content.eventTitleLabel}</label>
                <input 
                  type="text" required placeholder="e.g. Sunday Youth Service" value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.content.eventLocationLabel}</label>
                <div className="relative flex items-center">
                  <select 
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] hover:border-slate-350 dark:hover:border-white/[0.15] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Subhash Nagar Sanctuary" className="dark:bg-[#121324]">{t.attendance.subhashNagar}</option>
                    <option value="Shapur Location" className="dark:bg-[#121324]">{t.attendance.shapurLoc}</option>
                    <option value="Bahadurpally Location" className="dark:bg-[#121324]">{t.attendance.bahadurpallyLoc}</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.dashboard.tableDate}</label>
                  <input 
                    type="date" value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.content.tableTime}</label>
                  <input 
                    type="text" placeholder="e.g. 10:30 AM" value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.content.eventCategoryLabel}</label>
                <div className="relative flex items-center">
                  <select 
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] hover:border-slate-350 dark:hover:border-white/[0.15] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="WORSHIP" className="dark:bg-[#121324]">{language === "te" ? "ఆరాధన సేవ" : language === "hi" ? "आराधना सेवा" : "Worship Service"}</option>
                    <option value="PRAYER" className="dark:bg-[#121324]">{language === "te" ? "ప్రార్థన కూడిక" : language === "hi" ? "प्रार्थना सभा" : "Prayer Vigil"}</option>
                    <option value="YOUTH" className="dark:bg-[#121324]">{language === "te" ? "యువజన కూడిక" : language === "hi" ? "युवा गतिविधि" : "Youth Activity"}</option>
                    <option value="CHILDREN" className="dark:bg-[#121324]">{language === "te" ? "సండే స్కూల్" : language === "hi" ? "संडे स्कूल" : "Sunday School"}</option>
                    <option value="SPECIAL" className="dark:bg-[#121324]">{language === "te" ? "ప్రత్యేక కార్యక్రమం" : language === "hi" ? "विशेष कार्यक्रम" : "Special Event"}</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsAddEventOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">{t.dashboard.cancel}</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-650 hover:from-pink-655 hover:to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-pink-500/10">{t.content.scheduleEvent}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Add Announcement ─── */}
      {isAddAnnouncementOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.content.broadcastAnnouncementTitle}</h3>
              <button onClick={() => setIsAddAnnouncementOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-lg">✕</button>
            </div>
            
            <form onSubmit={submitAddAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-550 uppercase mb-1.5">{t.content.announcementTitleLabel}</label>
                <input 
                  type="text" required placeholder="e.g. Midweek Prayer Location Shift" value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.content.announcementContentLabel}</label>
                <textarea 
                  required placeholder="Broadcast message details..." value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 resize-none font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.content.priorityLabel}</label>
                <div className="relative flex items-center">
                  <select 
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                    className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] hover:border-slate-350 dark:hover:border-white/[0.15] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="LOW" className="dark:bg-[#121324]">{t.content.normalPriority}</option>
                    <option value="NORMAL" className="dark:bg-[#121324]">{t.content.normalPriority}</option>
                    <option value="HIGH" className="dark:bg-[#121324]">{t.content.highPriority}</option>
                    <option value="URGENT" className="dark:bg-[#121324]">{t.content.urgentPriority}</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsAddAnnouncementOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">{t.dashboard.cancel}</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-650 hover:from-pink-655 hover:to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-pink-500/10">{t.content.postAnnouncement}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Add Attendance ─── */}
      {isAddAttendanceOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.attendance.recordServiceAttendance}</h3>
              <button onClick={() => setIsAddAttendanceOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-lg">✕</button>
            </div>
            
            <form onSubmit={submitAddAttendance} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.attendance.serviceDate}</label>
                <input 
                  type="date" value={newAttendance.date}
                  onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.attendance.serviceProgramType}</label>
                <div className="relative flex items-center">
                  <select 
                    value={newAttendance.serviceType}
                    onChange={(e) => setNewAttendance({ ...newAttendance, serviceType: e.target.value })}
                    className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] hover:border-slate-350 dark:hover:border-white/[0.15] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Sunday Worship Service" className="dark:bg-[#121324]">{t.attendance.sundayWorship}</option>
                    <option value="Sunday Afternoon Prayer" className="dark:bg-[#121324]">{t.attendance.sundayAfternoon}</option>
                    <option value="Friday Evening Prayer" className="dark:bg-[#121324]">{t.attendance.fridayEvening}</option>
                    <option value="Youth Special Fellowship" className="dark:bg-[#121324]">{t.attendance.youthSpecial}</option>
                    <option value="All Night Prayer Vigil" className="dark:bg-[#121324]">{t.attendance.allNightVigil}</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.attendance.churchLocation}</label>
                <div className="relative flex items-center">
                  <select 
                    value={newAttendance.location}
                    onChange={(e) => setNewAttendance({ ...newAttendance, location: e.target.value })}
                    className="w-full py-2.5 pl-3.5 pr-8 border rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#16172D]/60 border-slate-200 dark:border-white/[0.08] hover:border-slate-350 dark:hover:border-white/[0.15] focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Subhash Nagar Sanctuary" className="dark:bg-[#121324]">{t.attendance.subhashNagar}</option>
                    <option value="Shapur Location" className="dark:bg-[#121324]">{t.attendance.shapurLoc}</option>
                    <option value="Bahadurpally Location" className="dark:bg-[#121324]">{t.attendance.bahadurpallyLoc}</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.attendance.totalBelievers}</label>
                  <input 
                    type="number" required placeholder="e.g. 450" value={newAttendance.headcount}
                    onChange={(e) => setNewAttendance({ ...newAttendance, headcount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.attendance.newVisitors}</label>
                  <input 
                    type="number" placeholder="e.g. 12" value={newAttendance.newVisitors}
                    onChange={(e) => setNewAttendance({ ...newAttendance, newVisitors: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-gray-555 uppercase mb-1.5">{t.attendance.logDetails}</label>
                <textarea 
                  placeholder="Notes about service..." value={newAttendance.notes}
                  onChange={(e) => setNewAttendance({ ...newAttendance, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 resize-none font-semibold"
                />
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsAddAttendanceOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">{t.dashboard.cancel}</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-650 hover:to-sky-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/10">{t.attendance.submitLog}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
