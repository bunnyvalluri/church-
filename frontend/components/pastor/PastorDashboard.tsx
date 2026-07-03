"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Play, 
  Calendar, 
  MessageSquare, 
  Megaphone, 
  FileText, 
  Clock, 
  BookOpen, 
  ChevronDown, 
  Search, 
  Bell, 
  Plus, 
  X, 
  Check, 
  AlertCircle,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Heart,
  Image as ImageIcon,
  ChevronRight,
  Sparkles,
  LogOut,
  Loader2,
  Layers,
  MapPin,
  Mail,
  Phone,
  Edit,
  Trash2,
  CheckCircle,
  Save,
  Info,
  UserPlus,
  Menu,
  IndianRupee,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import DonationsView from "@/components/pastor/views/DonationsView";
import NgoManagement from "@/components/admin/NgoManagement";

// Types
interface RecentSermon {
  id: string;
  title: string;
  description?: string;
  pastor?: string;
  date: string | Date;
  scripture: string;
  duration: string;
  status: "Published" | "Draft";
  thumbnail: string;
  category: string;
  videoUrl?: string;
  audioUrl?: string;
  tags?: string[];
}

interface MemberRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "Membership" | "Transfer" | "Baptism" | "Reinstatement";
  time: string;
  status: "New" | "Pending" | "Approved" | "Rejected";
  avatar: string;
}

interface PrayerRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: "HEALTH" | "FAMILY" | "FINANCIAL" | "SPIRITUAL" | "GUIDANCE" | "OTHER" | "THANKSGIVING";
  isAnonymous: boolean;
  status: "PENDING" | "PRAYING" | "ANSWERED";
  time?: string;
  createdAt: string;
  priority: "Urgent" | "Medium" | "Low";
  avatar?: string;
  user?: {
    name: string;
    email: string;
  };
}

interface EventItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  attending: number;
  location: string;
  category: "WORSHIP" | "PRAYER" | "YOUTH" | "CHILDREN" | "WOMEN" | "MEN" | "SPECIAL";
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  createdAt: string;
}

interface BibleStudyGroup {
  id: string;
  name: string;
  leader: string;
  time: string;
  membersCount: number;
  day: string;
}

interface SmallGroup {
  id: string;
  name: string;
  leader: string;
  location: string;
  meetingTime: string;
  attendanceAvg: number;
}

interface VolunteerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  ministry: "Choir" | "Ushering" | "Media & AV" | "Outreach" | "Sunday School";
  status: "Pending" | "Approved";
  appliedAt: string;
}

interface NotificationItem {
  id: string;
  type: "NEW_MEMBER" | "PRAYER_REQUEST" | "DONATION" | "CONTACT_MESSAGE" | "EVENT_REGISTRATION";
  title: string;
  content: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

const BIBLE_VERSES: Record<string, string[]> = {
  HEALTH: [
    "Heal me, Lord, and I will be healed; save me and I will be saved, for you are the one I praise. - Jeremiah 17:14",
    "Is anyone among you sick? Let them call the elders of the church to pray over them... - James 5:14"
  ],
  FAMILY: [
    "Believe in the Lord Jesus, and you will be saved—you and your household. - Acts 16:31",
    "As for me and my household, we will serve the Lord. - Joshua 24:15"
  ],
  FINANCIAL: [
    "And my God will meet all your needs according to the riches of his glory in Christ Jesus. - Philippians 4:19",
    "The Lord is my shepherd, I lack nothing. - Psalm 23:1"
  ],
  SPIRITUAL: [
    "Draw near to God, and he will draw near to you. - James 4:8",
    "Create in me a pure heart, O God, and renew a steadfast spirit within me. - Psalm 51:10"
  ],
  GUIDANCE: [
    "Trust in the Lord with all your heart and lean not on your own understanding... - Proverbs 3:5-6",
    "Your word is a lamp for my feet, a light on my path. - Psalm 119:105"
  ],
  OTHER: [
    "Do not be anxious about anything, but in every situation, by prayer and petition... - Philippians 4:6"
  ]
};

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const getNotifIcon = (type: string) => {
  switch (type) {
    case 'DONATION':
      return <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case 'PRAYER_REQUEST':
      return <Heart className="w-4 h-4 text-rose-650 dark:text-rose-400 fill-rose-500/10" />;
    case 'NEW_MEMBER':
      return <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    case 'CONTACT_MESSAGE':
      return <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    case 'EVENT_REGISTRATION':
      return <Calendar className="w-4 h-4 text-purple-650 dark:text-purple-400" />;
    default:
      return <Info className="w-4 h-4 text-gray-500" />;
  }
};

const getNotifIconBg = (type: string) => {
  switch (type) {
    case 'DONATION':
      return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-500/20';
    case 'PRAYER_REQUEST':
      return 'bg-rose-50 dark:bg-rose-955/30 border-rose-100 dark:border-rose-500/20';
    case 'NEW_MEMBER':
      return 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-500/20';
    case 'CONTACT_MESSAGE':
      return 'bg-amber-50 dark:bg-amber-955/30 border-amber-100 dark:border-amber-500/20';
    case 'EVENT_REGISTRATION':
      return 'bg-purple-50 dark:bg-purple-955/30 border-purple-100 dark:border-purple-500/20';
    default:
      return 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10';
  }
};

export default function PastorDashboard() {
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active navigation tab
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Search query & loading triggers
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Platform resource lists
  const [sermons, setSermons] = useState<RecentSermon[]>([]);
  const [memberRequests, setMemberRequests] = useState<MemberRequest[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [usersCount, setUsersCount] = useState(0);

  // Ministry groups & volunteers
  const [bibleStudyGroups, setBibleStudyGroups] = useState<BibleStudyGroup[]>([]);
  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerItem[]>([]);


  // Calendar dates
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number>(12);
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  // Selected details
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequest | null>(null);
  const [assignedPartner, setAssignedPartner] = useState("");

  // Modals Visibility
  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  
  // Input Form States
  const [newSermon, setNewSermon] = useState({
    title: "",
    description: "",
    scripture: "",
    duration: "35:00",
    category: "Worship",
    videoUrl: "",
    audioUrl: "",
    tags: "",
    status: "Published" as "Published" | "Draft"
  });

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "10:00 AM",
    location: "Kingdom of Christ Sanctuary",
    category: "WORSHIP" as any
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "NORMAL" as any
  });

  // Profile Form State
  const [pastorProfile, setPastorProfile] = useState({
    name: "Bishop Kurra Kristhu Raju",
    title: "Senior Pastor & Founder",
    email: "bishop.kraju@kcmchurch.org",
    phone: "+91 97040 90069",
    bio: "Bishop Kurra Kristhu Raju has been serving in ministry with unwavering dedication. His passion for souls and commitment to God's Word has transformed countless lives across Hyderabad and beyond.",
    image: "/pastor.png"
  });

  // Church Settings Form State
  const [churchSettings, setChurchSettings] = useState({
    churchName: "Kingdom of Christ Ministries",
    tagline: "Grace Community Sanctuary",
    primaryEmail: "info@kcmchurch.org",
    contactPhone: "+91 40 2345 6789",
    address: "Subhash Nagar Colony, Jeedimetla, Hyderabad, Telangana - 500055",
    worshipServices: "Sundays at 10:00 AM, 12:30 PM & 6:00 PM",
    bilingualSupport: true,
    visitorRegistrationEnabled: true
  });

  useEffect(() => {
    // Parse URL queries for tabs
    const tab = searchParams.get("tab");
    if (tab) {
      if (tab.startsWith("ngo-")) {
        const sub = tab.replace("ngo-", "");
        const formatted = "NGO " + sub.charAt(0).toUpperCase() + sub.slice(1);
        setActiveNav(formatted);
      } else {
        const formatted = tab.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        setActiveNav(formatted);
      }
    }
  }, [searchParams]);

  // Handle clicking outside the "+ New" dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNewDropdownOpen(false);
      }
    }
    if (isNewDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNewDropdownOpen]);

  // Handle clicking outside the notifications dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    }
    if (isNotifDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifDropdownOpen]);

  // Client-side session check & route protection
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user && user.role !== "PASTOR" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [status, user, router]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: null })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        triggerToast("All notifications marked as read.", "success");
      }
    } catch (err) {
      console.error("Error marking all read:", err);
      triggerToast("Failed to mark notifications as read.", "error");
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
      }
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const handleDeleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        triggerToast("Notification dismissed.", "success");
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      triggerToast("Failed to dismiss notification.", "error");
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id);
    }
    if (notif.link) {
      let tabName = "Dashboard";
      if (notif.link === "donations") {
        tabName = "Donations";
      } else if (notif.link === "members") {
        tabName = "Member Requests";
      } else if (notif.link === "prayers") {
        tabName = "Prayer Requests";
      } else if (notif.link === "messages") {
        tabName = "Messages";
      } else if (notif.link === "events") {
        tabName = "Events";
      }
      setActiveNav(tabName);
    }
    setIsNotifDropdownOpen(false);
  };

  // Fetch notifications initially and set up 10s polling
  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Fetch all database resources on load
  const loadDashboardResources = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch initial notifications
      fetchNotifications();

      // 1. Fetch Users Count (via pastor-accessible members endpoint)
      const usersRes = await fetch("/api/pastor/members");
      const usersData = await usersRes.json();
      if (usersRes.ok && usersData.success) {
        setUsersCount(usersData.total || usersData.users?.length || 0);
      }

      // 2. Fetch Sermons
      const srmRes = await fetch("/api/pastor/sermons");
      const srmData = await srmRes.json();
      const sermonList = srmData.sermons || [];
      setSermons(sermonList);

      // 3. Fetch Prayer Requests
      const pryRes = await fetch("/api/member/prayers?userId=all_admin_peek");
      const pryData = await pryRes.json();
      let prayerList = pryData.prayers || [];
      if (prayerList.length > 0) {
        const allUsers = usersData.users || [];
        prayerList = prayerList.map((p: any) => {
          const userObj = allUsers.find((u: any) => u.id === p.userId || u.uid === p.userId) || { name: "Congregation Believer", email: "believer@gmail.com" };
          return {
            ...p,
            priority: p.category === "HEALTH" ? "Urgent" : p.category === "FINANCIAL" ? "Medium" : "Low",
            user: userObj
          };
        });
      }
      setPrayerRequests(prayerList);

      // 4. Fetch Events
      const evtRes = await fetch("/api/member/events");
      const evtData = await evtRes.json();
      const eventList = evtData.events || [];
      setEvents(eventList);

      // 5. Fetch Announcements
      const ancRes = await fetch("/api/pastor/announcements");
      const ancData = await ancRes.json();
      setAnnouncements(ancData.announcements || []);

      // Fetch Member Requests from API
      const memRes = await fetch("/api/pastor/member-requests");
      const memData = await memRes.json();
      setMemberRequests(memData.requests || []);

      // Fetch Volunteers from API
      const volRes = await fetch("/api/pastor/volunteers");
      const volData = await volRes.json();
      setVolunteers(volData.volunteers || []);

      // Fetch Bible Study Groups from API
      const bsRes = await fetch("/api/pastor/bible-studies");
      const bsData = await bsRes.json();
      setBibleStudyGroups(bsData.groups || []);

      // Fetch Small Groups from API
      const sgRes = await fetch("/api/pastor/small-groups");
      const sgData = await sgRes.json();
      setSmallGroups(sgData.groups || []);

      // Fetch Church Settings from API
      const setRes = await fetch("/api/pastor/church-settings");
      const setData = await setRes.json();
      if (setData.success && setData.settings) {
        setChurchSettings(setData.settings);
      }

      // Fetch Pastor Profile from API
      const profRes = await fetch("/api/pastor/profile");
      const profData = await profRes.json();
      if (profData.success && profData.profile) {
        setPastorProfile(profData.profile);
      }

    } catch (err) {
      console.error("Error loading pastor resources:", err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      loadDashboardResources();
    }
  }, [status, loadDashboardResources]);

  const triggerToast = (msg: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4000);
    }
  };

  // ─── HANDLERS ───
  const handleApproveRequest = async (id: string) => {
    try {
      const res = await fetch("/api/pastor/member-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Approved" })
      });
      if (res.ok) {
        setMemberRequests(prev =>
          prev.map(r => r.id === id ? { ...r, status: "Approved" } : r)
        );
        triggerToast("Membership request approved successfully!", "success");
      } else {
        throw new Error();
      }
    } catch {
      triggerToast("Failed to approve membership request.", "error");
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      const res = await fetch("/api/pastor/member-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Rejected" })
      });
      if (res.ok) {
        setMemberRequests(prev =>
          prev.map(r => r.id === id ? { ...r, status: "Rejected" } : r)
        );
        triggerToast("Membership request rejected.", "success");
      } else {
        throw new Error();
      }
    } catch {
      triggerToast("Failed to reject membership request.", "error");
    }
  };

  const handleCreateSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSermon.title || !newSermon.description) return;
    
    const sermonPayload = {
      title: newSermon.title,
      description: newSermon.description,
      pastor: pastorProfile.name,
      videoUrl: newSermon.videoUrl || null,
      audioUrl: newSermon.audioUrl || null,
      thumbnail: "/sermons/default.jpg",
      category: newSermon.category,
      tags: newSermon.tags ? newSermon.tags.split(",").map(t => t.trim()) : [],
    };

    try {
      const res = await fetch("/api/pastor/sermons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sermonPayload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const added = {
          id: data.sermon.id,
          title: data.sermon.title,
          description: data.sermon.description,
          date: data.sermon.date,
          scripture: newSermon.scripture || "Jeremiah 29:11",
          duration: newSermon.duration,
          status: newSermon.status,
          thumbnail: data.sermon.thumbnail || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=300&q=80",
          category: data.sermon.category
        };
        setSermons([added, ...sermons]);
        triggerToast("Sermon published and saved successfully!", "success");
      } else {
        throw new Error(data.error || "Failed to publish sermon");
      }
    } catch (err: any) {
      const fallbackSermon: RecentSermon = {
        id: `srm_manual_${Date.now()}`,
        title: newSermon.title,
        description: newSermon.description,
        date: new Date().toISOString(),
        scripture: newSermon.scripture || "Selected Scripture",
        duration: newSermon.duration,
        status: newSermon.status,
        thumbnail: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=300&q=80",
        category: newSermon.category
      };
      setSermons([fallbackSermon, ...sermons]);
      triggerToast("Sermon added in fallback storage mode.", "success");
    } finally {
      setIsSermonModalOpen(false);
      setNewSermon({
        title: "",
        description: "",
        scripture: "",
        duration: "35:00",
        category: "Worship",
        videoUrl: "",
        audioUrl: "",
        tags: "",
        status: "Published"
      });
    }
  };

  const handleDeleteSermon = (id: string) => {
    setSermons(prev => prev.filter(s => s.id !== id));
    triggerToast("Sermon archive deleted successfully.", "success");
  };

  const handleUpdatePrayerStatus = (id: string, statusVal: "PENDING" | "PRAYING" | "ANSWERED") => {
    setPrayerRequests(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, status: statusVal };
        if (selectedPrayer?.id === id) {
          setSelectedPrayer(updated);
        }
        return updated;
      }
      return p;
    }));
    triggerToast(`Prayer status updated to ${statusVal}!`, "success");
  };

  const handleAssignIntercessor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrayer || !assignedPartner) return;
    triggerToast(`Prayer partner '${assignedPartner}' assigned to support this request.`, "success");
    setAssignedPartner("");
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.description) return;

    const eventPayload = {
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      category: newEvent.category
    };

    try {
      const res = await fetch("/api/pastor/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const added = {
          id: data.event.id,
          title: data.event.title,
          date: newEvent.date,
          time: newEvent.time,
          attending: 0,
          location: data.event.location,
          category: data.event.category
        };
        setEvents([added, ...events]);
        triggerToast("Church event scheduled successfully!", "success");
      } else {
        throw new Error(data.error || "Failed to schedule event");
      }
    } catch (err: any) {
      const fallbackEvent: EventItem = {
        id: `evt_${Date.now()}`,
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        attending: 1,
        location: newEvent.location,
        category: newEvent.category
      };
      setEvents([fallbackEvent, ...events]);
      triggerToast("Event scheduled in offline storage mode.", "success");
    } finally {
      setIsEventModalOpen(false);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "10:00 AM",
        location: "Kingdom of Christ Sanctuary",
        category: "WORSHIP"
      });
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    triggerToast("Event removed from scheduling calendar.", "success");
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;

    try {
      const res = await fetch("/api/pastor/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          priority: newAnnouncement.priority
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAnnouncements([data.announcement, ...announcements]);
        triggerToast("Announcement broadcasted successfully!", "success");
      } else {
        throw new Error(data.error || "Failed to broadcast announcement");
      }
    } catch (err: any) {
      const fallbackAnc: AnnouncementItem = {
        id: `anc_${Date.now()}`,
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        priority: newAnnouncement.priority,
        createdAt: new Date().toISOString()
      };
      setAnnouncements([fallbackAnc, ...announcements]);
      triggerToast("Announcement broadcasted in offline mode.", "success");
    } finally {
      setIsAnnouncementModalOpen(false);
      setNewAnnouncement({
        title: "",
        content: "",
        priority: "NORMAL"
      });
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    triggerToast("Announcement deleted from feeds.", "success");
  };

  const [newBibleStudy, setNewBibleStudy] = useState({ name: "", leader: "", time: "07:30 PM", day: "Wednesday" });
  const handleAddBibleStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBibleStudy.name || !newBibleStudy.leader) return;
    try {
      const res = await fetch("/api/pastor/bible-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBibleStudy)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBibleStudyGroups(prev => [...prev, data.group]);
        setNewBibleStudy({ name: "", leader: "", time: "07:30 PM", day: "Wednesday" });
        triggerToast("Bible study group registered successfully!", "success");
      } else {
        throw new Error();
      }
    } catch {
      triggerToast("Failed to create Bible study group.", "error");
    }
  };

  const [newSmallGroup, setNewSmallGroup] = useState({ name: "", leader: "", location: "", meetingTime: "", attendanceAvg: 10 });
  const handleAddSmallGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSmallGroup.name || !newSmallGroup.leader || !newSmallGroup.location || !newSmallGroup.meetingTime) return;
    try {
      const res = await fetch("/api/pastor/small-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSmallGroup)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmallGroups(prev => [...prev, data.group]);
        setNewSmallGroup({ name: "", leader: "", location: "", meetingTime: "", attendanceAvg: 10 });
        triggerToast("Cell group created successfully!", "success");
      } else {
        throw new Error();
      }
    } catch {
      triggerToast("Failed to create cell group.", "error");
    }
  };

  const handleApproveVolunteer = async (id: string) => {
    try {
      const res = await fetch("/api/pastor/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Approved" })
      });
      if (res.ok) {
        setVolunteers(prev =>
          prev.map(v => v.id === id ? { ...v, status: "Approved" } : v)
        );
        triggerToast("Volunteer registration approved!", "success");
      } else {
        throw new Error();
      }
    } catch {
      triggerToast("Failed to approve volunteer application.", "error");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/pastor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pastorProfile)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("Pastor profile saved successfully!", "success");
      } else {
        throw new Error();
      }
    } catch {
      triggerToast("Failed to save pastor profile.", "error");
    }
  };

  const handleSaveChurchSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/pastor/church-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(churchSettings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("Church settings updated successfully!", "success");
      } else {
        throw new Error();
      }
    } catch {
      triggerToast("Failed to update church settings.", "error");
    }
  };

  const getVerseSuggestion = (cat: string) => {
    const verses = BIBLE_VERSES[cat.toUpperCase()] || BIBLE_VERSES.OTHER;
    return verses[0];
  };

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const dateParts = e.date.split("-");
      const eventDay = parseInt(dateParts[2]);
      return eventDay === day;
    });
  };

  const renderSidebarContent = (onLinkClick?: () => void) => {
    return (
      <>
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-200/50 dark:border-white/[0.04]">
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
            <span className="font-black text-slate-800 dark:text-white text-sm tracking-tight leading-tight">
              Kingdom of Christ
            </span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black tracking-wider uppercase">
              Ministries
            </span>
          </div>
        </div>

        {/* Brand Banner */}
        <div className="px-4 pt-5">
          <div className="w-full bg-indigo-500/5 dark:bg-white/5 border border-indigo-500/10 dark:border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-650 dark:text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-750 dark:text-purple-300">Pastor Portal</span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-7 custom-scrollbar">
          
          {/* MAIN MENU */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-4 mb-2">MAIN</h4>
            {[
              { name: "Dashboard", icon: Layers },
              { name: "Sermons", icon: Play },
              { name: "Donations", icon: IndianRupee },
              { name: "Member Requests", icon: Users },
              { name: "Prayer Requests", icon: Heart },
              { name: "Events", icon: Calendar },
              { name: "Messages", icon: MessageSquare }
            ].map(item => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setActiveNav(item.name);
                  if (onLinkClick) onLinkClick();
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all relative overflow-hidden group ${
                  activeNav === item.name 
                    ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/15 dark:to-purple-500/15 text-[#6366F1] dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 font-black shadow-sm" 
                    : "hover:bg-indigo-50/50 dark:hover:bg-white/5 text-slate-650 dark:text-gray-400 hover:text-[#6366F1] dark:hover:text-white"
                }`}
              >
                {activeNav === item.name && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-[#6366F1] dark:bg-indigo-400 rounded-r-full" />
                )}
                <item.icon className="w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={activeNav === item.name ? 1.85 : 1.5} />
                {item.name}
              </button>
            ))}
          </div>

          {/* MINISTRY SECTION */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-4 mb-2">MINISTRY</h4>
            {[
              { name: "Bible Study Groups", icon: BookOpen },
              { name: "Small Groups", icon: Users },
              { name: "Volunteers", icon: UserCheck }
            ].map(item => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setActiveNav(item.name);
                  if (onLinkClick) onLinkClick();
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all relative overflow-hidden group ${
                  activeNav === item.name 
                    ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/15 dark:to-purple-500/15 text-[#6366F1] dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 font-black shadow-sm" 
                    : "hover:bg-indigo-50/50 dark:hover:bg-white/5 text-slate-650 dark:text-gray-400 hover:text-[#6366F1] dark:hover:text-white"
                }`}
              >
                {activeNav === item.name && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-[#6366F1] dark:bg-indigo-400 rounded-r-full" />
                )}
                <item.icon className="w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={activeNav === item.name ? 1.85 : 1.5} />
                {item.name}
              </button>
            ))}
          </div>

          {/* NGO SECTION */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-4 mb-2">NGO</h4>
            {[
              { name: "NGO Projects", icon: Heart },
              { name: "NGO Media", icon: ImageIcon },
              { name: "NGO Volunteers", icon: Users }
            ].map(item => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setActiveNav(item.name);
                  if (onLinkClick) onLinkClick();
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all relative overflow-hidden group ${
                  activeNav === item.name 
                    ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/15 dark:to-purple-500/15 text-[#6366F1] dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 font-black shadow-sm" 
                    : "hover:bg-indigo-50/50 dark:hover:bg-white/5 text-slate-650 dark:text-gray-400 hover:text-[#6366F1] dark:hover:text-white"
                }`}
              >
                {activeNav === item.name && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-[#6366F1] dark:bg-indigo-400 rounded-r-full" />
                )}
                <item.icon className="w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={activeNav === item.name ? 1.85 : 1.5} />
                {item.name}
              </button>
            ))}
          </div>

          {/* SETTINGS SECTION */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-4 mb-2">SETTINGS</h4>
            {[
              { name: "Profile", icon: Settings },
              { name: "Church Settings", icon: Settings }
            ].map(item => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setActiveNav(item.name);
                  if (onLinkClick) onLinkClick();
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all relative overflow-hidden group ${
                  activeNav === item.name 
                    ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/15 dark:to-purple-500/15 text-[#6366F1] dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 font-black shadow-sm" 
                    : "hover:bg-indigo-50/50 dark:hover:bg-white/5 text-slate-650 dark:text-gray-400 hover:text-[#6366F1] dark:hover:text-white"
                }`}
              >
                {activeNav === item.name && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-[#6366F1] dark:bg-indigo-400 rounded-r-full" />
                )}
                <item.icon className="w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={activeNav === item.name ? 1.85 : 1.5} />
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer - Pastor Profile Card */}
        <div className="p-4 border-t border-slate-200/50 dark:border-[#1E203B] bg-slate-50/50 dark:bg-[#0A0B16]/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl border border-slate-200/60 dark:border-gray-805 overflow-hidden relative shrink-0">
              {pastorProfile.image && typeof pastorProfile.image === 'string' && pastorProfile.image.length > 0 ? (
                <Image 
                  src={pastorProfile.image} 
                  alt={pastorProfile.name} 
                  fill 
                  sizes="40px"
                  className="object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-black text-sm">{(pastorProfile.name || 'P').charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{pastorProfile.name}</h4>
              <p className="text-[10px] text-slate-450 dark:text-gray-500 font-medium uppercase tracking-wider">{pastorProfile.title}</p>
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
      </>
    );
  };

  if (status === "loading" || (user && user.role !== "PASTOR" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100/20 dark:bg-gray-950">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#6366F1] mx-auto" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Securing Pastor Connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50/30 dark:bg-[#05060e] text-[#1E293B] dark:text-gray-200 font-sans antialiased overflow-hidden relative transition-colors duration-300 pb-16 lg:pb-0">
      {/* Ambient Premium Glow Background */}
      <div className="premium-glow-bg" />
      
      {/* Floating Ambient Mesh-Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 blur-[120px] pointer-events-none z-0 animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-pink-500/10 to-blue-500/10 dark:from-pink-500/5 dark:to-blue-500/5 blur-[120px] pointer-events-none z-0 animate-float animation-delay-2000" />
      
      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 lg:hidden"
            />
            {/* Sidebar Container */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-64 bg-white/90 dark:bg-[#070814]/95 backdrop-blur-xl text-slate-800 dark:text-gray-300 flex flex-col z-50 shadow-2xl lg:hidden border-r border-slate-200/50 dark:border-white/[0.04]"
            >
              {renderSidebarContent(() => setIsMobileSidebarOpen(false))}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 1. Left Sidebar Navigation (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-white/80 dark:bg-[#070814]/90 backdrop-blur-xl text-slate-800 dark:text-gray-300 flex flex-col shrink-0 border-r border-slate-200/40 dark:border-white/[0.04] relative z-20 shadow-lg">
        {renderSidebarContent()}
      </aside>

      <nav className="lg:hidden fixed bottom-5 left-4 right-4 z-30 mx-auto max-w-md bg-white/20 dark:bg-black/35 backdrop-blur-2xl border border-white/25 dark:border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.35)] flex items-center justify-around px-3 py-2.5 rounded-2xl transition-all duration-300">
        {[
          { name: "Dashboard", icon: Layers, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-200/50 dark:border-indigo-800/30" },
          { name: "Sermons", icon: Play, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50/50 dark:bg-pink-955/40 border-pink-200/50 dark:border-pink-800/30" },
          { name: "Member Requests", icon: Users, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-800/30" },
          { name: "Prayer Requests", icon: Heart, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50/50 dark:bg-rose-950/40 border-rose-200/50 dark:border-rose-800/30" },
          { name: "Profile", icon: Settings, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50/50 dark:bg-cyan-950/40 border-cyan-200/50 dark:border-cyan-800/30" }
        ].map(item => {
          const isActive = activeNav === item.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setActiveNav(item.name)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 border ${
                isActive
                  ? `${item.color} ${item.bg} shadow-[0_2px_10px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.2)] scale-105`
                  : "text-slate-500 dark:text-gray-400 border-transparent hover:text-slate-900 dark:hover:text-white active:scale-95"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? `${item.color} scale-110` : ""}`} />
              <span className={`text-[8.5px] font-black uppercase tracking-wider transition-all duration-350 ${isActive ? item.color : ""}`}>{item.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>

      <main className="flex-1 flex flex-col overflow-y-auto max-h-screen custom-scrollbar bg-slate-50/40 dark:bg-[#05060e] text-[#1E293B] dark:text-gray-200 transition-colors duration-300 relative z-10">
        {/* Main Top Header */}
        <header className="h-auto pt-5 pb-3 sm:h-20 sm:py-0 bg-white/40 dark:bg-[#070814]/40 backdrop-blur-xl border-b border-slate-200/40 dark:border-white/[0.04] px-3 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-all duration-300">
          <div className="flex items-center min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/[0.08] rounded-xl transition-all mr-3 shrink-0"
              title="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white leading-tight truncate">
                Welcome back, <span className="sm:hidden">{user?.name?.split(" ")[0] || "Pastor"}</span><span className="hidden sm:inline">{user?.name || pastorProfile.name}</span>! 👋
              </h2>
              <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 truncate">Here&apos;s what&apos;s happening in your ministry today.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            {/* Search Input */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input 
                type="text" 
                placeholder="Search resources, requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all hover:border-gray-300 dark:hover:border-white/[0.15]"
              />
            </div>

            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button 
                type="button" 
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="w-9 h-9 flex items-center justify-center bg-gray-100/20 dark:bg-white/[0.02] border border-gray-150 dark:border-white/[0.08] rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#6366F1] text-white text-[8px] font-extrabold rounded-full flex items-center justify-center border border-white dark:border-[#0F1021] animate-pulse">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute -right-20 sm:right-0 mt-2.5 w-80 sm:w-96 bg-white/95 dark:bg-[#0E0F24]/95 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.08] rounded-2xl shadow-xl z-30 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.03] flex items-center justify-between bg-slate-50/50 dark:bg-[#0A0B16]/50">
                      <div>
                        <span className="text-xs font-black text-slate-800 dark:text-white">Notifications</span>
                        {notifications.filter(n => !n.isRead).length > 0 && (
                          <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold ml-2">
                            ({notifications.filter(n => !n.isRead).length} new)
                          </span>
                        )}
                      </div>
                      {notifications.filter(n => !n.isRead).length > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-[#6366F1] dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.03] custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-550 dark:text-indigo-400 flex items-center justify-center mx-auto">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-gray-300">All caught up!</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">No new notifications from the ministry.</p>
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 ${
                              !notif.isRead ? "bg-indigo-50/[0.15] dark:bg-indigo-500/[0.02]" : ""
                            }`}
                          >
                            {/* Unread Status Dot */}
                            {!notif.isRead && (
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#6366F1] rounded-full" />
                            )}
                            
                            {/* Icon wrapper */}
                            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${getNotifIconBg(notif.type)}`}>
                              {getNotifIcon(notif.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className={`text-xs truncate font-bold ${
                                  !notif.isRead ? "text-slate-900 dark:text-white" : "text-slate-755 dark:text-gray-300"
                                }`}>
                                  {notif.title}
                                </h4>
                                <span className="text-[9px] text-gray-400 dark:text-gray-500 shrink-0 font-medium">
                                  {formatTimeAgo(notif.createdAt)}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-455 dark:text-gray-400 leading-snug mt-0.5 break-words line-clamp-2">
                                {notif.content}
                              </p>
                            </div>

                            {/* Dismiss button */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteNotif(notif.id, e)}
                              className="absolute right-2.5 top-3.5 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all"
                              title="Dismiss notification"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Switcher */}
            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>

            {/* Quick Action dropdown trigger */}
            <div className="relative" ref={dropdownRef}>
              <button 
                type="button"
                onClick={() => setIsNewDropdownOpen(!isNewDropdownOpen)}
                className="w-9 h-9 sm:w-auto sm:h-auto sm:py-2.5 sm:px-5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053E4] hover:to-[#7C3AED] text-white rounded-full font-black text-xs flex items-center justify-center sm:gap-1.5 shadow-lg shadow-indigo-650/15 active:scale-[0.96] transition-all border border-white/10 dark:border-white/[0.06] select-none"
              >
                <Plus className={`w-4 h-4 transition-transform duration-300 ${isNewDropdownOpen ? "rotate-45" : ""}`} />
                <span className="hidden sm:inline">New</span>
              </button>
              <AnimatePresence>
                {isNewDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2.5 w-56 bg-white/95 dark:bg-[#0E0F24]/95 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.08] rounded-2xl shadow-xl py-2 z-30 overflow-hidden"
                  >
                    <div className="px-4 py-1.5 border-b border-gray-100 dark:border-white/[0.03] mb-1">
                      <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Quick Create</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsSermonModalOpen(true);
                        setIsNewDropdownOpen(false);
                      }} 
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-750 dark:text-gray-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 hover:text-[#6366F1] dark:hover:text-indigo-400 font-bold flex items-center gap-2.5 transition-colors group"
                    >
                      <Play className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform" /> Upload New Sermon
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEventModalOpen(true);
                        setIsNewDropdownOpen(false);
                      }} 
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-750 dark:text-gray-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 hover:text-[#6366F1] dark:hover:text-indigo-400 font-bold flex items-center gap-2.5 transition-colors group"
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform" /> Add New Event
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsAnnouncementModalOpen(true);
                        setIsNewDropdownOpen(false);
                      }} 
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-750 dark:text-gray-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 hover:text-[#6366F1] dark:hover:text-indigo-400 font-bold flex items-center gap-2.5 transition-colors group"
                    >
                      <Megaphone className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform" /> New Announcement
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Feedback Toasts */}
        <div className="px-8 pt-6">
          {successMsg && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-700 dark:text-green-400 text-xs rounded-xl flex items-center gap-2 shadow-sm">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-xs rounded-xl flex items-center gap-2 shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Dynamic Views Switcher */}
        <div className="pastor-body-padding space-y-6 sm:space-y-8 flex-1">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeNav === "Dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Stats Grid */}
              <section className="pastor-stats-grid">
                {/* Total Sermons */}
                <div 
                  onClick={() => setActiveNav("Sermons")} 
                  className="relative overflow-hidden bg-white/60 dark:bg-[#0f1021]/45 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_20px_40px_rgba(139,92,246,0.25)] hover:border-violet-500/30 dark:hover:border-violet-500/30 hover:-translate-y-1.5 transition-all duration-350 flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] to-transparent pointer-events-none" />
                  <div className="space-y-1.5 relative z-10">
                    <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block">Total Sermons</span>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none">{sermons.length}</h3>
                    <span className="text-[9px] font-black text-violet-600 dark:text-violet-400 group-hover:underline block pt-1.5">View all sermons →</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 text-violet-650 dark:text-violet-400 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.12)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center shrink-0 relative z-10">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                </div>

                {/* Member Requests */}
                <div 
                  onClick={() => setActiveNav("Member Requests")} 
                  className="relative overflow-hidden bg-white/60 dark:bg-[#0f1021]/45 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_20px_40px_rgba(16,185,129,0.25)] hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:-translate-y-1.5 transition-all duration-350 flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
                  <div className="space-y-1.5 relative z-10">
                    <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block">Member Requests</span>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
                      {memberRequests.filter(r => r.status === "New" || r.status === "Pending").length}
                    </h3>
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 block pt-1.5">New this week ▲</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.12)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center shrink-0 relative z-10">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                {/* Prayer Requests */}
                <div 
                  onClick={() => setActiveNav("Prayer Requests")} 
                  className="relative overflow-hidden bg-white/60 dark:bg-[#0f1021]/45 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(244,63,94,0.15)] dark:hover:shadow-[0_20px_40px_rgba(244,63,94,0.25)] hover:border-rose-500/30 dark:hover:border-rose-500/30 hover:-translate-y-1.5 transition-all duration-350 flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.02] to-transparent pointer-events-none" />
                  <div className="space-y-1.5 relative z-10">
                    <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block">Prayer Requests</span>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none">{prayerRequests.length}</h3>
                    <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 block pt-1.5">New this week ▲</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-455 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.12)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center shrink-0 relative z-10">
                    <Heart className="w-5 h-5" />
                  </div>
                </div>

                {/* Upcoming Events */}
                <div 
                  onClick={() => setActiveNav("Events")} 
                  className="relative overflow-hidden bg-white/60 dark:bg-[#0f1021]/45 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_20px_40px_rgba(59,130,246,0.25)] hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:-translate-y-1.5 transition-all duration-350 flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
                  <div className="space-y-1.5 relative z-10">
                    <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block">Upcoming Events</span>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none">{events.length}</h3>
                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 block pt-1.5">Next 30 days</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.12)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center shrink-0 relative z-10">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                {/* Total Members */}
                <div 
                  onClick={() => setActiveNav("Volunteers")} 
                  className="relative overflow-hidden bg-white/60 dark:bg-[#0f1021]/45 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_20px_40px_rgba(245,158,11,0.25)] hover:border-amber-500/30 dark:hover:border-amber-500/30 hover:-translate-y-1.5 transition-all duration-350 flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent pointer-events-none" />
                  <div className="space-y-1.5 relative z-10">
                    <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block">Total Members</span>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none">{usersCount}</h3>
                    <span className="text-[9px] font-black text-amber-655 dark:text-amber-400 group-hover:underline block pt-1.5">View all members →</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-655 dark:text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.12)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center shrink-0 relative z-10">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </section>

              {/* Middle Row (Recent Sermons, Member Requests, Prayer Requests) */}
              <section className="pastor-main-grid">
                
                {/* 1. Recent Sermons */}
                <div className="bg-white/60 dark:bg-[#0f1021]/45 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_24px_48px_rgba(99,102,241,0.08)] dark:hover:shadow-none hover:border-indigo-500/20 dark:hover:border-indigo-500/25 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative">
                  <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/[0.03] flex items-center justify-between bg-gradient-to-b from-violet-500/[0.02] to-transparent">
                    <div>
                      <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Pastor Tools</h3>
                      <h2 className="text-sm font-black text-slate-800 dark:text-white mt-0.5">Recent Sermons</h2>
                    </div>
                    <button type="button" onClick={() => setActiveNav("Sermons")} className="text-xs font-bold text-[#6366F1] dark:text-indigo-400 hover:underline">View All</button>
                  </div>

                  <div className="p-6 py-4 space-y-4 flex-1">
                    {sermons.slice(0, 4).map(sermon => (
                      <div key={sermon.id} className="flex items-center gap-3 p-2 rounded-2xl bg-slate-50/30 dark:bg-white/[0.01] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] border border-slate-100/30 dark:border-white/[0.02] hover:border-indigo-500/10 dark:hover:border-indigo-500/10 transition-all duration-200">
                        <div className="w-16 h-10 rounded-xl overflow-hidden relative shrink-0 border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-white/5 shadow-sm">
                          <Image src={sermon.thumbnail || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=100&q=80"} alt={sermon.title} fill sizes="64px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="overflow-hidden flex-1">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate leading-snug">{sermon.title}</h4>
                          <p className="text-[10px] text-slate-450 dark:text-gray-500 truncate mt-0.5">{sermon.scripture} • {sermon.duration || "30m"}</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                            sermon.status === "Published" 
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-[#10B981] border border-emerald-100/60 dark:border-emerald-500/10" 
                              : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10"
                          }`}>
                            {sermon.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 pt-0">
                    <button 
                      type="button"
                      onClick={() => setIsSermonModalOpen(true)}
                      className="w-full py-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053E4] hover:to-[#7C3AED] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4" />
                      Upload New Sermon
                    </button>
                  </div>
                </div>

                {/* 2. Member Requests */}
                <div className="bg-white/60 dark:bg-[#0f1021]/45 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_24px_48px_rgba(16,185,129,0.08)] dark:hover:shadow-none hover:border-emerald-500/20 dark:hover:border-emerald-500/25 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative">
                  <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/[0.03] flex items-center justify-between bg-gradient-to-b from-emerald-500/[0.02] to-transparent">
                    <div>
                      <h3 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Administration</h3>
                      <h2 className="text-sm font-black text-slate-800 dark:text-white mt-0.5">Member Requests</h2>
                    </div>
                    <button type="button" onClick={() => setActiveNav("Member Requests")} className="text-xs font-bold text-[#6366F1] dark:text-indigo-400 hover:underline">View All</button>
                  </div>

                  <div className="p-6 py-4 space-y-4 flex-1">
                    {memberRequests.slice(0, 4).map(req => (
                      <div key={req.id} className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-50/30 dark:bg-white/[0.01] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] border border-slate-100/30 dark:border-white/[0.02] hover:border-emerald-50/10 dark:hover:border-emerald-500/10 transition-all duration-200">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-2xl overflow-hidden relative shrink-0 border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-white/5 shadow-sm">
                            {req.avatar && typeof req.avatar === 'string' && req.avatar.length > 0 ? (
                              <Image src={req.avatar} alt={req.name} fill sizes="40px" className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-black text-xs">{(req.name || 'U').charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate leading-snug">{req.name}</h4>
                            <p className="text-[10px] text-slate-455 dark:text-gray-500 truncate mt-0.5">{req.type} Request • {req.time}</p>
                          </div>
                        </div>
                        
                        <div className="shrink-0">
                          {req.status === "New" ? (
                            <div className="flex items-center gap-1">
                              <button 
                                type="button"
                                onClick={() => handleApproveRequest(req.id)}
                                className="p-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-500/20 rounded-lg transition-colors"
                                title="Approve Request"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleRejectRequest(req.id)}
                                className="p-1 bg-red-50 hover:bg-red-100 dark:bg-red-955/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-250 dark:border-red-500/20 rounded-lg transition-colors"
                                title="Reject Request"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                              req.status === "Approved" 
                                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border border-emerald-150 dark:border-emerald-500/10" 
                                : req.status === "Pending"
                                ? "bg-amber-50 dark:bg-amber-955/20 text-amber-500 border border-amber-150 dark:border-amber-500/10"
                                : "bg-red-50 dark:bg-red-955/20 text-red-500 border border-red-150 dark:border-red-500/10"
                            }`}>
                              {req.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 pt-0">
                    <button 
                      type="button" 
                      onClick={() => setActiveNav("Member Requests")} 
                      className="w-full py-2.5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-700 dark:text-gray-300 border border-slate-200/50 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/10 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                    >
                      View All Requests
                    </button>
                  </div>
                </div>

                {/* 3. Prayer Requests */}
                <div className="bg-white/60 dark:bg-[#0f1021]/45 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_24px_48px_rgba(244,63,94,0.08)] dark:hover:shadow-none hover:border-rose-500/20 dark:hover:border-rose-500/25 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative">
                  <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/[0.03] flex items-center justify-between bg-gradient-to-b from-rose-500/[0.02] to-transparent">
                    <div>
                      <h3 className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Congregation Feeds</h3>
                      <h2 className="text-sm font-black text-slate-800 dark:text-white mt-0.5">Prayer Requests</h2>
                    </div>
                    <button type="button" onClick={() => setActiveNav("Prayer Requests")} className="text-xs font-bold text-[#6366F1] dark:text-indigo-400 hover:underline">View All</button>
                  </div>

                  <div className="p-6 py-4 space-y-4 flex-1">
                    {prayerRequests.slice(0, 4).map(prayer => (
                      <div key={prayer.id} className="flex items-start gap-3 justify-between p-2 rounded-2xl bg-slate-50/30 dark:bg-white/[0.01] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] border border-slate-100/30 dark:border-white/[0.02] hover:border-rose-500/10 dark:hover:border-rose-500/10 transition-all duration-200">
                        <div className="flex items-start gap-3 overflow-hidden">
                          <div className="w-9 h-9 rounded-2xl overflow-hidden bg-purple-500/10 dark:bg-purple-500/25 text-[#6366F1] dark:text-indigo-450 font-black flex items-center justify-center text-xs shrink-0 relative border border-purple-500/20 shadow-sm">
                            {(prayer.user?.name || "CB").substring(0, 2)}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-snug">{prayer.isAnonymous ? "Anonymous" : prayer.user?.name}</h4>
                            <p className="text-[10px] text-slate-455 dark:text-gray-400 leading-relaxed mt-0.5 line-clamp-1">{prayer.description}</p>
                          </div>
                        </div>
                        
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                            prayer.priority === "Urgent" 
                              ? "bg-red-50 dark:bg-red-955/20 text-red-500 border border-red-100 dark:border-red-500/10" 
                              : prayer.priority === "Medium"
                              ? "bg-amber-50 dark:bg-amber-955/20 text-amber-500 border border-amber-100 dark:border-amber-500/10"
                              : "bg-blue-50 dark:bg-blue-955/20 text-blue-500 border border-blue-100 dark:border-blue-500/10"
                          }`}>
                            {prayer.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 pt-0">
                    <button 
                      type="button" 
                      onClick={() => setActiveNav("Prayer Requests")} 
                      className="w-full py-2.5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-700 dark:text-gray-300 border border-slate-200/50 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/10 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                    >
                      View All Prayer Requests
                    </button>
                  </div>
                </div>

              </section>

              {/* Bottom Row (Upcoming Events, Ministry Calendar, Quick Actions) */}
              <section className="pastor-main-grid">
                
                {/* 1. Upcoming Events */}
                <div className="bg-white/60 dark:bg-[#0f1021]/45 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_24px_48px_rgba(59,130,246,0.08)] dark:hover:shadow-none hover:border-blue-500/20 dark:hover:border-blue-500/25 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative">
                  <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/[0.03] flex items-center justify-between bg-gradient-to-b from-blue-500/[0.02] to-transparent">
                    <div>
                      <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Worship & Ministry</h3>
                      <h2 className="text-sm font-black text-slate-800 dark:text-white mt-0.5">Upcoming Events</h2>
                    </div>
                    <button type="button" onClick={() => setActiveNav("Events")} className="text-xs font-bold text-[#6366F1] dark:text-indigo-400 hover:underline">View Calendar</button>
                  </div>

                  <div className="p-6 py-4 space-y-4 flex-1">
                    {events.slice(0, 4).map((ev, idx) => {
                      const eventDate = new Date(ev.date);
                      const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                      const dayStr = eventDate.getDate();
                      
                      return (
                        <div key={ev.id || idx} className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-50/30 dark:bg-white/[0.01] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] border border-slate-100/30 dark:border-white/[0.02] hover:border-blue-500/10 dark:hover:border-blue-500/10 transition-all duration-200">
                          <div className="flex items-center gap-3 overflow-hidden">
                            {/* Date Badge */}
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex flex-col items-center justify-center shrink-0">
                              <span className="text-[9px] font-bold text-[#6366F1] dark:text-indigo-400 leading-none uppercase">{month || "MAY"}</span>
                              <span className="text-xs font-extrabold text-slate-800 dark:text-white leading-none mt-0.5">{dayStr || "19"}</span>
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate leading-snug">{ev.title}</h4>
                              <p className="text-[10px] text-slate-455 dark:text-gray-500 truncate mt-0.5">{ev.time} • {ev.attending} Attending</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setActiveNav("Events")} 
                            className="py-1.5 px-3 bg-slate-100/80 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-white/10 text-[#6366F1] dark:text-indigo-400 border border-slate-200/40 dark:border-white/[0.05] rounded-xl text-[9px] font-bold shrink-0 transition-all active:scale-95"
                          >
                            Manage
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Ministry Calendar Widget */}
                <div className="bg-white/60 dark:bg-[#0f1021]/45 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_24px_48px_rgba(99,102,241,0.08)] dark:hover:shadow-none hover:border-indigo-500/20 dark:hover:border-indigo-500/25 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative">
                  <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/[0.03] flex items-center justify-between bg-gradient-to-b from-indigo-500/[0.02] to-transparent">
                    <div>
                      <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Church Timeline</h3>
                      <h2 className="text-sm font-black text-slate-800 dark:text-white mt-0.5">Ministry Calendar</h2>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-gray-450">May 2026</span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {/* Empty spaces prior to Friday (start of May 2026 is Friday) */}
                      <span className="aspect-square" />
                      <span className="aspect-square" />
                      <span className="aspect-square" />
                      <span className="aspect-square" />
                      <span className="aspect-square" />

                      {calendarDays.map(day => {
                        const dayEvents = getEventsForDay(day);
                        const hasEvents = dayEvents.length > 0;
                        const isSelected = selectedCalendarDate === day;

                        return (
                          <div 
                            key={day} 
                            onClick={() => setSelectedCalendarDate(day)}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-semibold relative cursor-pointer border ${
                              isSelected 
                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-[0_4px_12px_rgba(99,102,241,0.3)]" 
                                : hasEvents
                                ? "bg-indigo-50/70 dark:bg-indigo-950/40 text-[#6366F1] dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/10"
                                : "hover:bg-slate-100 dark:hover:bg-white/5 border-transparent text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <span>{day}</span>
                            {/* Event dot markers */}
                            {hasEvents && (
                              <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[#6366F1] dark:bg-indigo-400"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Events detailed popup based on selected calendar date */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
                      <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase block tracking-wider">Events on May {selectedCalendarDate}</span>
                      {getEventsForDay(selectedCalendarDate).length > 0 ? (
                        getEventsForDay(selectedCalendarDate).map(ev => (
                          <span key={ev.id} className="text-[11px] font-bold text-gray-800 dark:text-gray-250 block mt-1">• {ev.title} ({ev.time})</span>
                        ))
                      ) : (
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 italic block mt-1">No ministry activities scheduled</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Quick Actions Panel */}
                <div className="bg-white/60 dark:bg-[#0f1021]/45 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_24px_48px_rgba(245,158,11,0.08)] dark:hover:shadow-none hover:border-amber-500/20 dark:hover:border-amber-500/25 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative">
                  <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/[0.03] bg-gradient-to-b from-amber-500/[0.02] to-transparent">
                    <h3 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Operations</h3>
                    <h2 className="text-sm font-black text-slate-800 dark:text-white mt-0.5">Quick Actions</h2>
                  </div>
                  
                  <div className="p-6 py-5 flex-1 space-y-3">
                    {[
                      { label: "Upload New Sermon", sub: "Share God's Word", icon: Play, color: "bg-purple-50 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 border-purple-100/40 dark:border-purple-500/10", act: () => setIsSermonModalOpen(true) },
                      { label: "Add New Event", sub: "Create church event", icon: Calendar, color: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100/40 dark:border-emerald-500/10", act: () => setIsEventModalOpen(true) },
                      { label: "New Announcement", sub: "Send to all members", icon: Megaphone, color: "bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 border-amber-100/40 dark:border-amber-500/10", act: () => setIsAnnouncementModalOpen(true) },
                      { label: "Message Members", sub: "Send a message", icon: MessageSquare, color: "bg-blue-50 dark:bg-blue-955/20 text-blue-650 dark:text-blue-400 border-blue-100/40 dark:border-blue-500/10", act: () => setActiveNav("Messages") },
                      { label: "View Reports", sub: "Ministry insights", icon: FileText, color: "bg-pink-50 dark:bg-pink-955/20 text-pink-600 dark:text-pink-400 border-pink-100/40 dark:border-pink-500/10", act: () => triggerToast("Direct reports and analytics will open in a separate tab.", "success") }
                    ].map((act, idx) => (
                      <button 
                        key={idx}
                        type="button"
                        onClick={act.act}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50/30 dark:bg-white/[0.01] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] border border-slate-100/30 dark:border-white/[0.02] hover:border-indigo-500/10 dark:hover:border-indigo-500/10 rounded-2xl transition-all duration-300 text-left group hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(99,102,241,0.03)]"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-10 h-10 rounded-2xl ${act.color} flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                            <act.icon className="w-4.5 h-4.5" />
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-slate-700 dark:text-gray-250 group-hover:text-[#6366F1] dark:group-hover:text-indigo-400 transition-colors duration-300 block">{act.label}</span>
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 block">{act.sub}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}
          {/* TAB 2: SERMONS VIEW */}
          {activeNav === "Sermons" && (
            <div className="admin-card p-6 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b admin-divider">
                <div>
                  <h2 className="admin-title text-base">Sermon & Teachings Archive</h2>
                  <p className="admin-subtitle mt-1">Upload and manage church bible study records and video feeds</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsSermonModalOpen(true)}
                  className="py-2.5 px-5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053E4] hover:to-[#7C3AED] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" /> Upload Sermon
                </button>
              </div>

              {/* Sermon Lists */}
              <div className="pastor-card-grid">
                {sermons.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())).map(sermon => (
                  <div key={sermon.id} className="admin-card p-5 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 group relative">
                    <button 
                      type="button"
                      onClick={() => handleDeleteSermon(sermon.id)}
                      className="absolute top-4 right-4 p-1.5 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-500/10 z-10 transition-colors"
                      title="Delete Sermon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-4">
                      <div className="w-full h-32 rounded-xl bg-gray-200 dark:bg-white/5 overflow-hidden relative border border-gray-150 dark:border-white/5">
                        <Image src={sermon.thumbnail || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=300&q=80"} alt={sermon.title} fill sizes="300px" className="object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-10 h-10 text-white fill-white cursor-pointer hover:scale-110 transition-transform" />
                        </div>
                      </div>

                      <div>
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-[#6366F1] dark:text-indigo-400 rounded text-[9px] font-bold uppercase tracking-wider border border-indigo-100/60 dark:border-indigo-500/10">{sermon.category}</span>
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mt-2.5 truncate">{sermon.title}</h4>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Preached on {new Date(sermon.date).toLocaleDateString()} • {sermon.scripture}</p>
                        {sermon.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">{sermon.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t admin-divider flex items-center justify-between">
                      <span className="text-[9px] text-[#10B981] font-bold uppercase tracking-wider">{sermon.status}</span>
                      <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">{sermon.pastor || "Bishop Kurra Kristhu Raju"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MEMBER REQUESTS VIEW */}
          {activeNav === "Member Requests" && (
            <div className="admin-card p-6 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="admin-title text-base">Membership Applications</h2>
                  <p className="admin-subtitle mt-1">Review church registration, transfers, reinstatement, and baptism requests</p>
                </div>
                <Link
                  href="/memberships/visits"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-md transition-all self-start sm:self-center"
                >
                  <Activity className="w-4 h-4" />
                  Review Visit Requests
                </Link>
              </div>

              <div className="admin-table-wrapper overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="admin-table-head">
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Request Type</th>
                      <th className="py-3 px-4">Applied</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberRequests.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map(req => (
                      <tr key={req.id} className="admin-table-row">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-white/5">
                              {req.avatar && typeof req.avatar === 'string' && req.avatar.length > 0 ? (
                                <Image src={req.avatar} alt={req.name} fill sizes="32px" className="object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                  <span className="text-white font-black text-xs">{(req.name || 'U').charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-800 dark:text-white block">{req.name}</span>
                              <span className="text-[9px] text-gray-400 dark:text-gray-500">{req.email} • {req.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">{req.type}</td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{req.time}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            req.status === "Approved" 
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border border-emerald-150 dark:border-emerald-500/10" 
                              : req.status === "Rejected"
                              ? "bg-red-50 dark:bg-red-955/20 text-red-500 border border-red-150 dark:border-red-500/10"
                              : "bg-amber-50 dark:bg-amber-955/20 text-amber-500 border border-amber-150 dark:border-amber-500/10"
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {req.status === "New" || req.status === "Pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                type="button"
                                onClick={() => handleApproveRequest(req.id)}
                                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-500/20 transition-colors"
                              >
                                Approve
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleRejectRequest(req.id)}
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-955/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold border border-red-205 dark:border-red-500/20 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">No Actions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PRAYER REQUESTS VIEW */}
          {activeNav === "Prayer Requests" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
              
              {/* Prayer Requests List (Left Column) */}
              <div className="lg:col-span-1 space-y-6">
                <div className="admin-card p-6 space-y-4">
                  <h2 className="admin-title text-sm uppercase tracking-tight flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#6366F1]" /> Prayer Requests
                  </h2>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1.5 custom-scrollbar">
                    {prayerRequests.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map(p => {
                      const isSelected = selectedPrayer?.id === p.id;
                      return (
                        <div 
                          key={p.id}
                          onClick={() => setSelectedPrayer(p)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
                            isSelected 
                              ? "bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-500/40 dark:border-indigo-500/50 shadow-[0_2px_8px_rgba(99,102,241,0.05)]" 
                              : "bg-gray-50/50 dark:bg-white/[0.01] hover:bg-gray-100 dark:hover:bg-white/5 border-gray-150 dark:border-white/5 hover:border-gray-250 dark:hover:border-white/10"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                              p.status === "ANSWERED" 
                                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100/60 dark:border-emerald-500/10" 
                                : p.status === "PRAYING" 
                                ? "bg-blue-50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-400 border-blue-100/60 dark:border-blue-500/10" 
                                : "bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border-amber-100/60 dark:border-amber-500/10"
                            }`}>
                              {p.status}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate mt-2">{p.title}</h4>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{p.description}</p>
                          
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200 dark:border-white/5">
                            <span className="inline-block text-[9px] font-bold text-[#6366F1] dark:text-indigo-400 uppercase tracking-wide">{p.category}</span>
                            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">
                              {p.isAnonymous ? "Anonymous" : p.user?.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Prayer Details & Interactive Actions (Right Column) */}
              <div className="lg:col-span-2 space-y-6">
                {selectedPrayer ? (
                  <div className="space-y-6">
                    <div className="admin-card p-6 space-y-5">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-[#6366F1] dark:text-indigo-400 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-indigo-100/60 dark:border-indigo-500/10">{selectedPrayer.category}</span>
                            {selectedPrayer.isAnonymous && (
                              <span className="px-2.5 py-0.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-lg text-[9px] font-bold border border-gray-150 dark:border-white/10">Anonymous Request</span>
                            )}
                          </div>
                          <h2 className="admin-title text-base mt-3 leading-none tracking-tight">{selectedPrayer.title}</h2>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-semibold">Submitted: {new Date(selectedPrayer.createdAt).toLocaleString()}</p>
                        </div>

                        {/* Status selection toggles */}
                        <div className="p-1 bg-gray-50 dark:bg-white/[0.02] border border-gray-150 dark:border-white/[0.05] rounded-xl flex gap-1 items-center">
                          <button 
                            type="button"
                            onClick={() => handleUpdatePrayerStatus(selectedPrayer.id, "PENDING")}
                            className={`py-2 px-3 rounded-lg flex items-center gap-1.5 text-[10px] font-bold transition-all ${
                              selectedPrayer.status === "PENDING"
                                ? "bg-white dark:bg-[#12132A] text-amber-600 shadow-sm border border-gray-200 dark:border-white/10"
                                : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleUpdatePrayerStatus(selectedPrayer.id, "PRAYING")}
                            className={`py-2 px-3 rounded-lg flex items-center gap-1.5 text-[10px] font-bold transition-all ${
                              selectedPrayer.status === "PRAYING"
                                ? "bg-white dark:bg-[#12132A] text-blue-600 shadow-sm border border-gray-200 dark:border-white/10"
                                : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                          >
                            <Heart className="w-3.5 h-3.5" /> Praying
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleUpdatePrayerStatus(selectedPrayer.id, "ANSWERED")}
                            className={`py-2 px-3 rounded-lg flex items-center gap-1.5 text-[10px] font-bold transition-all ${
                              selectedPrayer.status === "ANSWERED"
                                ? "bg-white dark:bg-[#12132A] text-emerald-600 shadow-sm border border-gray-200 dark:border-white/10"
                                : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Answered
                          </button>
                        </div>
                      </div>

                      <hr className="admin-divider" />

                      <div className="space-y-2">
                        <h4 className="admin-label">Request Content</h4>
                        <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed bg-gray-50/50 dark:bg-[#0f1021]/40 p-4 border border-gray-150 dark:border-white/[0.04] rounded-xl font-medium">{selectedPrayer.description}</p>
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-1 font-semibold">
                        <span>Request ID: <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500">{selectedPrayer.id}</span></span>
                        {!selectedPrayer.isAnonymous && (
                          <span>Believer: <strong className="text-gray-800 dark:text-white font-bold">{selectedPrayer.user?.name} ({selectedPrayer.user?.email})</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Bible Verse Support */}
                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-500/10 dark:border-indigo-500/20 text-indigo-950 dark:text-indigo-200 p-6 rounded-3xl shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#6366F1] dark:text-indigo-400 shrink-0" />
                        <h3 className="font-extrabold text-sm">Suggested Scripture</h3>
                      </div>
                      <p className="text-xs leading-relaxed italic font-bold">
                        &quot;{getVerseSuggestion(selectedPrayer.category)}&quot;
                      </p>
                      <p className="text-[10px] opacity-75 font-semibold">Encourage the member by sharing this Bible verse via messages or direct calls.</p>
                    </div>

                    {/* Assign Intercessors Panel */}
                    <div className="admin-card p-6 space-y-4">
                      <h3 className="admin-title text-sm uppercase tracking-tight flex items-center gap-2">
                        <UserPlus className="w-4.5 h-4.5 text-[#6366F1]" /> Assign Intercessors
                      </h3>
                      
                      <form onSubmit={handleAssignIntercessor} className="flex gap-3">
                        <input 
                          type="text" required placeholder="Search prayer partner name..." value={assignedPartner}
                          onChange={(e) => setAssignedPartner(e.target.value)}
                          className="admin-input flex-1"
                        />
                        <button type="submit" className="py-2.5 px-5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053E4] hover:to-[#7C3AED] text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-md shadow-indigo-550/10 active:scale-[0.98]">
                          Assign
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="admin-card p-16 text-center flex flex-col items-center justify-center gap-2.5">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-[#6366F1] dark:text-indigo-400 flex items-center justify-center mb-1.5 border border-indigo-100/50 dark:border-indigo-500/10 shadow-sm">
                      <Heart className="w-7 h-7 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                    </div>
                    <h3 className="admin-title text-sm mt-1">Select a Prayer Request</h3>
                    <p className="admin-subtitle max-w-xs leading-relaxed">Select any request from the left list to review detailed messages, suggested scripture verses, and update praying statuses.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: EVENTS VIEW */}
          {activeNav === "Events" && (
            <div className="admin-card p-6 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b admin-divider">
                <div>
                  <h2 className="admin-title text-base">Worship & Ministry Calendar</h2>
                  <p className="admin-subtitle mt-1">Schedule services, Bible classes, youth meetings, and outreach programs</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsEventModalOpen(true)}
                  className="py-2.5 px-5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053E4] hover:to-[#7C3AED] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Event
                </button>
              </div>

              {/* Events Grid Table */}
              <div className="pastor-card-grid">
                {events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase())).map(ev => (
                  <div key={ev.id} className="admin-card p-5 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 group relative">
                    <button 
                      type="button"
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="absolute top-4 right-4 p-1.5 bg-red-50 dark:bg-red-955/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-500/10 transition-colors"
                      title="Remove Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-[#6366F1] dark:text-indigo-400 rounded text-[9px] font-bold uppercase tracking-wider border border-indigo-100/60 dark:border-indigo-500/10">{ev.category}</span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">{ev.date} at {ev.time}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white truncate">{ev.title}</h4>
                      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span>{ev.location}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t admin-divider flex items-center justify-between text-xs text-gray-500">
                      <span className="font-bold dark:text-gray-400">{ev.attending} Attending</span>
                      <button type="button" onClick={() => triggerToast("Direct registrations management details is coming soon.", "success")} className="text-xs font-bold text-[#6366F1] dark:text-indigo-400 hover:underline">Manage Registrations</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: MESSAGES & ANNOUNCEMENTS VIEW */}
          {activeNav === "Messages" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
              
              {/* Post Announcement Form (Left Column) */}
              <div className="lg:col-span-1 space-y-6">
                <div className="admin-card p-6 space-y-4">
                  <h2 className="admin-title text-sm uppercase tracking-tight flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-[#6366F1]" /> Broadcast Message
                  </h2>

                  <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <div>
                      <label className="admin-modal-label">Announcement Title</label>
                      <input 
                        type="text" required placeholder="e.g. Vacation Bible School Registration" value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-modal-label">Message Content</label>
                      <textarea 
                        required placeholder="Type message outlining the announcement details..." rows={5} value={newAnnouncement.content}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                        className="admin-input w-full resize-none leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="admin-modal-label">Priority Level</label>
                      <select 
                        value={newAnnouncement.priority}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as any })}
                        className="admin-select w-full"
                      >
                        <option value="LOW">LOW</option>
                        <option value="NORMAL">NORMAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="URGENT">URGENT</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053E4] hover:to-[#7C3AED] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95">
                      <Megaphone className="w-4 h-4" /> Send Announcement
                    </button>
                  </form>
                </div>
              </div>

              {/* Past Broadcast Messages (Right Column) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="admin-card p-6 space-y-6">
                  <div>
                    <h2 className="admin-title text-base">Broadcast History</h2>
                    <p className="admin-subtitle mt-1">Review active, pending, or expired announcements sent to the congregation</p>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1.5 custom-scrollbar">
                    {announcements.map(ann => (
                      <div key={ann.id} className="admin-card p-5 relative group">
                        <button 
                          type="button"
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="absolute top-4 right-4 p-1.5 bg-red-50 dark:bg-red-955/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-500/10 transition-colors"
                          title="Delete Announcement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                              ann.priority === "URGENT" 
                                ? "bg-red-50 dark:bg-red-955/20 text-red-700 dark:text-red-400 border-red-100/60 dark:border-red-500/10" 
                                : ann.priority === "HIGH"
                                ? "bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border-amber-100/60 dark:border-amber-500/10"
                                : "bg-gray-100 dark:bg-white/5 text-gray-650 dark:text-gray-400 border border-gray-250 dark:border-white/10"
                            }`}>
                              {ann.priority}
                            </span>
                            <span className="text-[10px] text-gray-405 dark:text-gray-500 font-semibold">{new Date(ann.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{ann.title}</h4>
                          <p className="text-xs text-gray-650 dark:text-gray-300 leading-relaxed font-semibold">{ann.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: BIBLE STUDY GROUPS VIEW */}
          {activeNav === "Bible Study Groups" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
              
              {/* Form to Register Bible Study (Left Column) */}
              <div className="lg:col-span-1 space-y-6">
                <div className="admin-card p-6 space-y-4">
                  <h2 className="admin-title text-sm uppercase tracking-tight flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#6366F1]" /> Register Group
                  </h2>

                  <form onSubmit={handleAddBibleStudy} className="space-y-4">
                    <div>
                      <label className="admin-modal-label">Study Group Name</label>
                      <input 
                        type="text" required placeholder="e.g. Wednesday Theology Circle" value={newBibleStudy.name}
                        onChange={(e) => setNewBibleStudy({ ...newBibleStudy, name: e.target.value })}
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-modal-label">Group Leader</label>
                      <input 
                        type="text" required placeholder="Preacher or Elder name..." value={newBibleStudy.leader}
                        onChange={(e) => setNewBibleStudy({ ...newBibleStudy, leader: e.target.value })}
                        className="admin-input w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="admin-modal-label">Meeting Day</label>
                        <select 
                          value={newBibleStudy.day}
                          onChange={(e) => setNewBibleStudy({ ...newBibleStudy, day: e.target.value })}
                          className="admin-select w-full"
                        >
                          <option value="Wednesday">Wednesday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>
                      <div>
                        <label className="admin-modal-label">Meeting Time</label>
                        <input 
                          type="text" required placeholder="e.g. 07:30 PM" value={newBibleStudy.time}
                          onChange={(e) => setNewBibleStudy({ ...newBibleStudy, time: e.target.value })}
                          className="admin-input w-full"
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95">
                      <Plus className="w-4 h-4" /> Create Study Group
                    </button>
                  </form>
                </div>
              </div>

              {/* Bible Study Directory (Right Column) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="admin-card p-6 space-y-6">
                  <div>
                    <h2 className="admin-title text-base">Bible Study Groups</h2>
                    <p className="admin-subtitle mt-1">Directory of regular theological and discipleship classes scheduled weekly</p>
                  </div>

                  <div className="pastor-card-grid md:grid-cols-2">
                    {bibleStudyGroups.map(bs => (
                      <div key={bs.id} className="admin-card p-5 space-y-3">
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-[#6366F1] dark:text-indigo-400 rounded text-[9px] font-bold border border-indigo-100/60 dark:border-indigo-500/10 uppercase tracking-wider">{bs.day}s</span>
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{bs.name}</h4>
                        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                          <p>Leader: <strong className="text-gray-800 dark:text-gray-200">{bs.leader}</strong></p>
                          <p>Meeting Time: <strong>{bs.time}</strong></p>
                          <p>Members: <strong>{bs.membersCount} Registered</strong></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: SMALL GROUPS VIEW */}
          {activeNav === "Small Groups" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
              
              {/* Form to Create Small Group (Left Column) */}
              <div className="lg:col-span-1 space-y-6">
                <div className="admin-card p-6 space-y-4">
                  <h2 className="admin-title text-sm uppercase tracking-tight flex items-center gap-2">
                    🏠 Create Cell Group
                  </h2>

                  <form onSubmit={handleAddSmallGroup} className="space-y-4">
                    <div>
                      <label className="admin-modal-label">Group Name</label>
                      <input 
                        type="text" required placeholder="e.g. Miyapur Home Cell" value={newSmallGroup.name}
                        onChange={(e) => setNewSmallGroup({ ...newSmallGroup, name: e.target.value })}
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-modal-label">Leader Name</label>
                      <input 
                        type="text" required placeholder="Deacon or Brother name..." value={newSmallGroup.leader}
                        onChange={(e) => setNewSmallGroup({ ...newSmallGroup, leader: e.target.value })}
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-modal-label">Location Address</label>
                      <input 
                        type="text" required placeholder="e.g. Miyapur Sector 3" value={newSmallGroup.location}
                        onChange={(e) => setNewSmallGroup({ ...newSmallGroup, location: e.target.value })}
                        className="admin-input w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="admin-modal-label">Meeting Time</label>
                        <input 
                          type="text" required placeholder="e.g. Friday 7:00 PM" value={newSmallGroup.meetingTime}
                          onChange={(e) => setNewSmallGroup({ ...newSmallGroup, meetingTime: e.target.value })}
                          className="admin-input w-full"
                        />
                      </div>
                      <div>
                        <label className="admin-modal-label">Avg Attendance</label>
                        <input 
                          type="number" required min="1" value={newSmallGroup.attendanceAvg}
                          onChange={(e) => setNewSmallGroup({ ...newSmallGroup, attendanceAvg: parseInt(e.target.value) || 10 })}
                          className="admin-input w-full"
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95">
                      <Plus className="w-4 h-4" /> Create Cell Group
                    </button>
                  </form>
                </div>
              </div>

              {/* Cell Groups Directory (Right Column) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="admin-card p-6 space-y-6">
                  <div>
                    <h2 className="admin-title text-base">Home Cell & Small Groups</h2>
                    <p className="admin-subtitle mt-1">Directory of community cell groups meeting across various locations for prayer and support</p>
                  </div>

                  <div className="pastor-card-grid md:grid-cols-2">
                    {smallGroups.map(sg => (
                      <div key={sg.id} className="admin-card p-5 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 flex items-center justify-center border border-purple-100/40 dark:border-purple-500/10 font-bold text-xs shrink-0">
                            🏠
                          </div>
                          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{sg.name}</h4>
                          <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                            <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {sg.location}</p>
                            <p>Leader: <strong className="text-gray-800 dark:text-gray-200">{sg.leader}</strong></p>
                            <p>Meets: <strong>{sg.meetingTime}</strong></p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t admin-divider flex items-center justify-between text-xs text-gray-400">
                          <span>Avg Attendance</span>
                          <strong className="text-gray-955 dark:text-gray-200 font-bold">{sg.attendanceAvg} Believers</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 9: VOLUNTEERS VIEW */}
          {activeNav === "Volunteers" && (
            <div className="admin-card p-6 space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="admin-title text-base">Volunteer Applications</h2>
                <p className="admin-subtitle mt-1">Review registrations for choir, ushering, technical, outreach, and Sunday School departments</p>
              </div>

              <div className="admin-table-wrapper overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="admin-table-head">
                      <th className="py-3 px-4">Volunteer</th>
                      <th className="py-3 px-4">Ministry Area</th>
                      <th className="py-3 px-4">Applied Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase())).map(vol => (
                      <tr key={vol.id} className="admin-table-row">
                        <td className="py-3 px-4">
                          <div>
                            <span className="text-xs font-bold text-gray-800 dark:text-white block">{vol.name}</span>
                            <span className="text-[9px] text-gray-400 dark:text-gray-500">{vol.email} • {vol.phone}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">{vol.ministry}</td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{vol.appliedAt}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            vol.status === "Approved" 
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border border-emerald-150 dark:border-emerald-500/10" 
                              : "bg-amber-50 dark:bg-amber-955/20 text-amber-500 border border-amber-150 dark:border-amber-500/10"
                          }`}>
                            {vol.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {vol.status === "Pending" ? (
                            <button 
                              type="button"
                              onClick={() => handleApproveVolunteer(vol.id)}
                              className="px-3 py-1 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053E4] hover:to-[#7C3AED] text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">No Actions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: PROFILE VIEW */}
          {activeNav === "Profile" && (
            <div className="admin-card p-6 space-y-6 max-w-2xl mx-auto animate-in fade-in duration-200">
              <div>
                <h2 className="admin-title text-base">My Pastor Profile</h2>
                <p className="admin-subtitle mt-1">Manage biography details, profiles pictures, contact phone, and account credentials</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="flex items-center gap-4 pb-4 border-b admin-divider">
                  <div className="w-16 h-16 rounded-full overflow-hidden relative border border-gray-250 dark:border-white/10 shrink-0 bg-gray-50 dark:bg-white/5">
                    {pastorProfile.image && typeof pastorProfile.image === 'string' && pastorProfile.image.length > 0 ? (
                      <Image src={pastorProfile.image} alt={pastorProfile.name} fill sizes="64px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-black text-xl">{(pastorProfile.name || 'P').charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <button type="button" onClick={() => triggerToast("Picture upload is mock-simulated.", "success")} className="admin-btn-ghost">
                      Change Photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="admin-modal-label">Pastor Name</label>
                    <input 
                      type="text" value={pastorProfile.name}
                      onChange={(e) => setPastorProfile({ ...pastorProfile, name: e.target.value })}
                      className="admin-input w-full font-semibold"
                    />
                  </div>
                  <div>
                    <label className="admin-modal-label">Title / Designation</label>
                    <input 
                      type="text" value={pastorProfile.title}
                      onChange={(e) => setPastorProfile({ ...pastorProfile, title: e.target.value })}
                      className="admin-input w-full font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="admin-modal-label">Email Address</label>
                    <input 
                      type="email" value={pastorProfile.email}
                      onChange={(e) => setPastorProfile({ ...pastorProfile, email: e.target.value })}
                      className="admin-input w-full font-semibold"
                    />
                  </div>
                  <div>
                    <label className="admin-modal-label">Contact Phone</label>
                    <input 
                      type="text" value={pastorProfile.phone}
                      onChange={(e) => setPastorProfile({ ...pastorProfile, phone: e.target.value })}
                      className="admin-input w-full font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-modal-label">Biography</label>
                  <textarea 
                    rows={4} value={pastorProfile.bio}
                    onChange={(e) => setPastorProfile({ ...pastorProfile, bio: e.target.value })}
                    className="admin-input w-full resize-none leading-relaxed"
                  />
                </div>

                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053E4] hover:to-[#7C3AED] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5">
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </form>
            </div>
          )}

          {/* TAB: NGO VIEWS */}
          {(activeNav === "NGO Projects" || activeNav === "NGO Media" || activeNav === "NGO Volunteers") && (
            <NgoManagement activeSubView={
              activeNav === "NGO Projects" ? "projects" :
              activeNav === "NGO Media" ? "media" : "volunteers"
            } />
          )}

          {/* TAB: DONATIONS VIEW */}
          {activeNav === "Donations" && (
            <DonationsView triggerToast={triggerToast} />
          )}

          {/* TAB 11: CHURCH SETTINGS VIEW */}
          {activeNav === "Church Settings" && (
            <div className="admin-card p-6 space-y-6 max-w-2xl mx-auto animate-in fade-in duration-200">
              <div>
                <h2 className="admin-title text-base">Church Platform Configurations</h2>
                <p className="admin-subtitle mt-1">Configure general parameters, helpline contacts, address tags, and visitor toggles</p>
              </div>

              <form onSubmit={handleSaveChurchSettings} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="admin-modal-label">Church Title</label>
                    <input 
                      type="text" value={churchSettings.churchName}
                      onChange={(e) => setChurchSettings({ ...churchSettings, churchName: e.target.value })}
                      className="admin-input w-full font-semibold"
                    />
                  </div>
                  <div>
                    <label className="admin-modal-label">Tagline / Organization</label>
                    <input 
                      type="text" value={churchSettings.tagline}
                      onChange={(e) => setChurchSettings({ ...churchSettings, tagline: e.target.value })}
                      className="admin-input w-full font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="admin-modal-label">Help Desk Email</label>
                    <input 
                      type="email" value={churchSettings.primaryEmail}
                      onChange={(e) => setChurchSettings({ ...churchSettings, primaryEmail: e.target.value })}
                      className="admin-input w-full"
                    />
                  </div>
                  <div>
                    <label className="admin-modal-label">Contact Landline</label>
                    <input 
                      type="text" value={churchSettings.contactPhone}
                      onChange={(e) => setChurchSettings({ ...churchSettings, contactPhone: e.target.value })}
                      className="admin-input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-modal-label">Physical Address Location</label>
                  <input 
                    type="text" value={churchSettings.address}
                    onChange={(e) => setChurchSettings({ ...churchSettings, address: e.target.value })}
                    className="admin-input w-full"
                  />
                </div>

                <div>
                  <label className="admin-modal-label">Worship Services Timings</label>
                  <input 
                    type="text" value={churchSettings.worshipServices}
                    onChange={(e) => setChurchSettings({ ...churchSettings, worshipServices: e.target.value })}
                    className="admin-input w-full"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-[#6366F1] dark:hover:text-indigo-400 transition-colors">
                    <input 
                      type="checkbox" checked={churchSettings.bilingualSupport}
                      onChange={(e) => setChurchSettings({ ...churchSettings, bilingualSupport: e.target.checked })}
                      className="w-4 h-4 rounded text-[#6366F1] border-gray-250 dark:border-white/10 focus:ring-[#6366F1]/20 bg-gray-50 dark:bg-white/[0.02]"
                    />
                    Enable Bilingual Telugu / Hindi Language Translations
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-[#6366F1] dark:hover:text-indigo-400 transition-colors">
                    <input 
                      type="checkbox" checked={churchSettings.visitorRegistrationEnabled}
                      onChange={(e) => setChurchSettings({ ...churchSettings, visitorRegistrationEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-[#6366F1] border-gray-250 dark:border-white/10 focus:ring-[#6366F1]/20 bg-gray-50 dark:bg-white/[0.02]"
                    />
                    Allow New Visitor Self-Registration Forms
                  </label>
                </div>

                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053E4] hover:to-[#7C3AED] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5">
                  <Save className="w-4 h-4" /> Save Configurations
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* --- POPUP MODAL: UPLOAD SERMON --- */}
      {isSermonModalOpen && (
        <div className="fixed inset-0 admin-modal-bg z-50 flex items-center justify-center p-4">
          <div className="admin-modal w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b admin-divider flex items-center justify-between bg-gray-100/20 dark:bg-white/[0.02]">
              <h3 className="admin-title text-base">Upload New Sermon Content</h3>
              <button type="button" onClick={() => setIsSermonModalOpen(false)} className="admin-btn-ghost p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSermon} className="p-6 space-y-4">
              <div>
                <label className="admin-modal-label">Sermon Title</label>
                <input 
                  type="text" required placeholder="e.g. Walking in His Grace" value={newSermon.title}
                  onChange={(e) => setNewSermon({ ...newSermon, title: e.target.value })}
                  className="admin-input w-full"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="admin-modal-label">Scripture Reference</label>
                  <input 
                    type="text" placeholder="e.g. John 3:16" value={newSermon.scripture}
                    onChange={(e) => setNewSermon({ ...newSermon, scripture: e.target.value })}
                    className="admin-input w-full"
                  />
                </div>
                <div>
                  <label className="admin-modal-label">Duration</label>
                  <input 
                    type="text" placeholder="e.g. 35:00" value={newSermon.duration}
                    onChange={(e) => setNewSermon({ ...newSermon, duration: e.target.value })}
                    className="admin-input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="admin-modal-label">Category</label>
                <select 
                  value={newSermon.category}
                  onChange={(e) => setNewSermon({ ...newSermon, category: e.target.value })}
                  className="admin-select w-full"
                >
                  <option value="Worship">Sunday Worship Sermon</option>
                  <option value="Prayer">Prayer Meeting Message</option>
                  <option value="Youth">Youth Session Message</option>
                  <option value="Faith">Faith & Discipleship</option>
                  <option value="Special">Special Event Message</option>
                </select>
              </div>
              <div>
                <label className="admin-modal-label">Description Outline</label>
                <textarea 
                  required placeholder="Enter key scripture notes and outline summary..." rows={3} value={newSermon.description}
                  onChange={(e) => setNewSermon({ ...newSermon, description: e.target.value })}
                  className="admin-input w-full resize-none leading-relaxed"
                />
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsSermonModalOpen(false)} className="flex-1 py-3 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all">
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL: ADD EVENT --- */}
      {isEventModalOpen && (
        <div className="fixed inset-0 admin-modal-bg z-50 flex items-center justify-center p-4">
          <div className="admin-modal w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b admin-divider flex items-center justify-between bg-gray-100/20 dark:bg-white/[0.02]">
              <h3 className="admin-title text-base">Schedule New Church Event</h3>
              <button type="button" onClick={() => setIsEventModalOpen(false)} className="admin-btn-ghost p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="admin-modal-label">Event Title</label>
                <input 
                  type="text" required placeholder="e.g. Sunday Worship Service" value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="admin-input w-full"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="admin-modal-label">Date</label>
                  <input 
                    type="date" required value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="admin-input w-full text-gray-700 dark:text-gray-200 font-bold"
                  />
                </div>
                <div>
                  <label className="admin-modal-label">Time</label>
                  <input 
                    type="text" required placeholder="e.g. 10:00 AM" value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="admin-input w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="admin-modal-label">Category</label>
                  <select 
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
                    className="admin-select w-full"
                  >
                    <option value="WORSHIP">WORSHIP</option>
                    <option value="PRAYER">PRAYER</option>
                    <option value="YOUTH">YOUTH</option>
                    <option value="SPECIAL">SPECIAL</option>
                  </select>
                </div>
                <div>
                  <label className="admin-modal-label">Location Venue</label>
                  <input 
                    type="text" required value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="admin-input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="admin-modal-label">Brief Description</label>
                <textarea 
                  required placeholder="Enter event timeline and guidelines..." rows={2} value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="admin-input w-full resize-none leading-relaxed"
                />
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsEventModalOpen(false)} className="flex-1 py-3 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all">
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL: NEW ANNOUNCEMENT --- */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 admin-modal-bg z-50 flex items-center justify-center p-4">
          <div className="admin-modal w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b admin-divider flex items-center justify-between bg-gray-100/20 dark:bg-white/[0.02]">
              <h3 className="admin-title text-base">Send General Broadcast</h3>
              <button type="button" onClick={() => setIsAnnouncementModalOpen(false)} className="admin-btn-ghost p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="admin-modal-label">Announcement Title</label>
                <input 
                  type="text" required placeholder="e.g. Relief Fund Collection Drive" value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="admin-input w-full"
                />
              </div>
              <div>
                <label className="admin-modal-label">Announcement Content</label>
                <textarea 
                  required placeholder="Write a broadcast message for congregation..." rows={4} value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="admin-input w-full resize-none leading-relaxed"
                />
              </div>
              <div>
                <label className="admin-modal-label">Priority</label>
                <select 
                  value={newAnnouncement.priority}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                  className="admin-select w-full"
                >
                  <option value="LOW">LOW</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsAnnouncementModalOpen(false)} className="flex-1 py-3 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#6366F1] hover:bg-[#5053E4] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all">
                  Broadcast Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
