"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  User, Phone, MapPin, Check, Loader2, Save,
  RefreshCw, Shield, Star, Camera, Wifi, WifiOff,
  Mail, Edit3, CheckCircle2, AlertCircle, Copy, Lock,
  Calendar, Heart, ChevronRight, Church, Bell, MessageSquare,
  Sparkles, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ────────────────────────── Types & Helpers ────────────────────────── */
interface ProfileSnapshot {
  name: string;
  phone: string;
  address: string;
  role: string;
  joinedAt: string;
  image: string;
}

function getHumanFriendlyName(rawName: string | null | undefined): string {
  if (!rawName) return "Believer";
  const trimmed = rawName.trim();
  if (!trimmed) return "Believer";

  const parts = trimmed.split(/\s+/);
  // Find first token that is purely alphabetical (at least 2 letters)
  const humanPart = parts.find((p) => /^[a-zA-Z]{2,}$/.test(p));
  if (humanPart) {
    return humanPart.charAt(0).toUpperCase() + humanPart.slice(1).toLowerCase();
  }

  const first = parts[0].replace(/[^a-zA-Z0-9]/g, "");
  if (/^[a-zA-Z]+$/.test(first)) {
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }
  return parts.length > 1 ? parts[1] : first || "Believer";
}

function parseCampusAndAddress(rawAddress: string | null | undefined): { campus: string; street: string } {
  if (!rawAddress) return { campus: "Subhash Nagar", street: "" };
  const trimmed = rawAddress.trim();
  const match = trimmed.match(/^(?:\[(Subhash Nagar|Shapur Nagar|Bahadurpally)\]|(Subhash Nagar|Shapur Nagar|Bahadurpally)\s*\|\s*)([\s\S]*)$/i);
  if (match) {
    const matchedCampus = match[1] || match[2];
    const street = (match[3] || "").trim();
    // Normalize campus name
    const campus = matchedCampus.toLowerCase().includes("shapur")
      ? "Shapur Nagar"
      : matchedCampus.toLowerCase().includes("bahadur")
      ? "Bahadurpally"
      : "Subhash Nagar";
    return { campus, street };
  }
  return { campus: "Subhash Nagar", street: trimmed };
}

function formatCampusAndAddress(campus: string, street: string): string {
  const cleanStreet = street.trim();
  if (!cleanStreet) return campus ? `[${campus}]` : "";
  return campus ? `[${campus}] ${cleanStreet}` : cleanStreet;
}

function cleanIndianPhone(rawPhone: string | null | undefined): string {
  if (!rawPhone) return "";
  let digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }
  return digits;
}

/* ────────────────────────── Translations ────────────────────────── */
const profileTranslations = {
  en: {
    title: "My Profile",
    subtitle: "Manage your spiritual account information, campus & contact preferences",
    refresh: "Refresh",
    syncedAt: "Synced",
    memberPortalTag: "Member Portal",
    avatarRole: {
      ADMIN: "Administrator",
      PASTOR: "Pastor",
      MEMBER: "Verified Believer"
    },
    fellowship: {
      heading: "Spiritual Identity",
      verifiedBadge: "Verified Member",
      memberSince: "Believer Since",
      primaryCampus: "Home Campus",
      mainSanctuary: "Subhash Nagar (Main Sanctuary)",
      shapurBranch: "Shapur Nagar Campus",
      bahadurpallyBranch: "Bahadurpally Campus",
      fellowshipStatus: "Fellowship Status",
      activeMember: "Active Church Member",
      copyEmail: "Copy Email",
      copied: "Copied!",
      changePhoto: "Update Photo",
      quickActions: "Quick Member Links",
      eventsLink: "Church Events",
      prayersLink: "Prayer Requests",
    },
    form: {
      editTitle: "Edit Profile Details",
      editSub: "Update your personal, campus, and contact information",
      personalSection: "Personal & Church Identity",
      personalSub: "Your legal name, calling name & local fellowship campus",
      contactSection: "Contact & Residential Address",
      contactSub: "How pastoral staff and emergency prayer coordinators reach you",
      preferencesSection: "Spiritual & Communication Preferences",
      preferencesSub: "Stay updated with Sunday gatherings and prayer chains",
      fullName: "Full Official / Legal Name *",
      fullNameHelp: "As recorded in church baptismal registers and official identification",
      fullNamePlaceholder: "e.g. Rahul Valluri",
      preferredCampus: "Home Campus / Fellowship Branch",
      campusHelp: "Your regular weekly worship gathering campus",
      emailAddress: "Registered Email Address",
      emailLocked: "LOCKED CREDENTIAL",
      emailHelp: "Linked to your login credentials. Contact church office to update primary email.",
      mobileNumber: "Mobile Number (WhatsApp Enabled)",
      mobileHelp: "Used by pastoral care for prayer requests and service alerts",
      mobilePlaceholder: "95052 88171",
      homeAddress: "Residential Address",
      homeAddressHelp: "House/Door number, street, landmark, area, Hyderabad",
      homeAddressPlaceholder: "Flat 201, Street No. 4, Jeedimetla, Hyderabad...",
      whatsappPref: "WhatsApp Prayer & Scripture Alerts",
      whatsappPrefDesc: "Receive weekly anointed sermon notes and emergency prayer chain notifications",
      serviceReminderPref: "Sunday Gathering & Event Alerts",
      serviceReminderPrefDesc: "Get reminders 1 hour before Sunday celebration service starts",
    },
    saveBar: {
      connected: "Cloud Connected",
      offline: "Offline Mode",
      allSaved: "All changes saved to cloud",
      autoSaving: "Saving in 2s...",
      saving: "Syncing with cloud...",
      saveNow: "Save Changes",
      saved: "Saved Successfully!",
      tryAgain: "Retry Save",
      unsavedPill: "Unsaved Changes",
    },
    toasts: {
      savedSuccess: "Profile saved successfully!",
      loadError: "Failed to load profile data",
      saveError: "Failed to save profile changes",
      photoSuccess: "Profile photo updated successfully!",
      photoError: "Failed to upload photo. Please choose a smaller image.",
    }
  },
  te: {
    title: "నా ప్రొఫైల్",
    subtitle: "మీ ఆత్మీయ ఖాతా సమాచారం, చర్చి బ్రాంచ్ మరియు సంప్రదింపు ప్రాధాన్యతలను నిర్వహించండి",
    refresh: "రిఫ్రెష్",
    syncedAt: "సమకాలీకరించబడింది",
    memberPortalTag: "సభ్యుల పోర్టల్",
    avatarRole: {
      ADMIN: "నిర్వాహకుడు",
      PASTOR: "పాస్టర్",
      MEMBER: "ధృవీకరించబడిన సభ్యుడు"
    },
    fellowship: {
      heading: "ఆత్మీయ గుర్తింపు",
      verifiedBadge: "ధృవీకరించబడిన సభ్యుడు",
      memberSince: "సభ్యత్వం ప్రారంభమైన తేదీ",
      primaryCampus: "చర్చి బ్రాంచ్",
      mainSanctuary: "సుభాష్ నగర్ (ప్రధాన ఆలయం)",
      shapurBranch: "షాపూర్ నగర్ బ్రాంచ్",
      bahadurpallyBranch: "బహదూర్‌పల్లి బ్రాంచ్",
      fellowshipStatus: "సహవాస స్థితి",
      activeMember: "క్రియాశీల చర్చి సభ్యుడు",
      copyEmail: "ఈమెయిల్ కాపీ చేయండి",
      copied: "కాపీ చేయబడింది!",
      changePhoto: "ఫోటో మార్చండి",
      quickActions: "త్వరిత లింకులు",
      eventsLink: "చర్చి కార్యక్రమాలు",
      prayersLink: "ప్రార్థన విన్నపాలు",
    },
    form: {
      editTitle: "ప్రొఫైల్ వివరాలను సవరించండి",
      editSub: "మీ వ్యక్తిగత, బ్రాంచ్ మరియు చిరునామా సమాచారాన్ని నవీకరించండి",
      personalSection: "వ్యక్తిగత & చర్చి గుర్తింపు",
      personalSub: "మీ పూర్తి పేరు మరియు చర్చి బ్రాంచ్",
      contactSection: "సంప్రదింపు & నివాస చిరునామా",
      contactSub: "పాస్టర్ గారు మరియు ప్రార్థన బృందం మిమ్మల్ని సంప్రదించే వివరాలు",
      preferencesSection: "ఆత్మీయ & నోటిఫికేషన్ ప్రాధాన్యతలు",
      preferencesSub: "ఆదివారం ఆరాధనలు మరియు ప్రార్థన హెచ్చరికలతో కనెక్ట్ అవ్వండి",
      fullName: "పూర్తి పేరు *",
      fullNameHelp: "చర్చి రికార్డులు మరియు అధికారిక గుర్తింపు ప్రకారం",
      fullNamePlaceholder: "ఉదా: రాహుల్ వల్లూరి",
      preferredCampus: "చర్చి బ్రాంచ్ / క్యాంపస్",
      campusHelp: "మీరు క్రమం తప్పకుండా హాజరయ్యే ప్రార్థనా మందిరం",
      emailAddress: "నమోదిత ఈమెయిల్ చిరునామా",
      emailLocked: "లాక్ చేయబడింది",
      emailHelp: "మీ లాగిన్ ఖాతాకు లింక్ చేయబడింది. మార్చడానికి చర్చి కార్యాలయాన్ని సంప్రదించండి.",
      mobileNumber: "మొబైల్ సంఖ్య (వాట్సాప్)",
      mobileHelp: "ప్రార్థన విన్నపాలు మరియు చర్చి సమాచారం కోసం ఉపయోగించబడుతుంది",
      mobilePlaceholder: "95052 88171",
      homeAddress: "నివాస చిరునామా",
      homeAddressHelp: "ఇంటి నంబర్, వీధి, ప్రాంతం, హైదరాబాద్",
      homeAddressPlaceholder: "ఫ్లాట్ నెం. 201, సుభాష్ నగర్, హైదరాబాద్...",
      whatsappPref: "వాట్సాప్ ప్రార్థన & వాక్య హెచ్చరికలు",
      whatsappPrefDesc: "వారంవారీ ప్రసంగ నోట్స్ మరియు అత్యవసర ప్రార్థన హెచ్చరికలను అందుకోండి",
      serviceReminderPref: "ఆదివారం ఆరాధన హెచ్చరికలు",
      serviceReminderPrefDesc: "ఆదివారం ఆరాధనకు 1 గంట ముందు నోటిఫికేషన్ పొందండి",
    },
    saveBar: {
      connected: "కనెక్ట్ చేయబడింది",
      offline: "ఆఫ్‌లైన్ మోడ్",
      allSaved: "అన్ని మార్పులు భద్రపరచబడ్డాయి",
      autoSaving: "2 సెకన్లలో సేవ్ అవుతోంది...",
      saving: "సేవ్ అవుతోంది...",
      saveNow: "మార్పులను సేవ్ చేయి",
      saved: "విజయవంతంగా సేవ్ చేయబడింది!",
      tryAgain: "మళ్ళీ ప్రయత్నించండి",
      unsavedPill: "సేవ్ చేయని మార్పులు",
    },
    toasts: {
      savedSuccess: "ప్రొఫైల్ విజయవంతంగా సేవ్ చేయబడింది!",
      loadError: "ప్రొఫైల్ డేటాను లోడ్ చేయడం విఫలమైంది",
      saveError: "ప్రొఫైల్ సేవ్ చేయడం విఫలమైంది",
      photoSuccess: "ప్రొఫైల్ ఫోటో విజయవంతంగా అప్‌డేట్ చేయబడింది!",
      photoError: "ఫోటో అప్‌లోడ్ విఫలమైంది. దయచేసి చిన్న ఇమేజ్‌ని ఎంచుకోండి.",
    }
  },
  hi: {
    title: "मेरी प्रोफाइल",
    subtitle: "अपने आत्मिक खाते की जानकारी, चर्च शाखा और संपर्क प्राथमिकताएं प्रबंधित करें",
    refresh: "रिफ्रेश",
    syncedAt: "सिंक किया गया",
    memberPortalTag: "सदस्य पोर्टल",
    avatarRole: {
      ADMIN: "प्रशासक",
      PASTOR: "पादरी",
      MEMBER: "सत्यापित विश्वासी"
    },
    fellowship: {
      heading: "आत्मिक पहचान",
      verifiedBadge: "सत्यापित सदस्य",
      memberSince: "सदस्यता की शुरुआत",
      primaryCampus: "चर्च शाखा",
      mainSanctuary: "सुभाष नगर (मुख्य अभयारण्य)",
      shapurBranch: "शापुर नगर शाखा",
      bahadurpallyBranch: "बहादुरपल्ली शाखा",
      fellowshipStatus: "संगति की स्थिति",
      activeMember: "सक्रिय चर्च सदस्य",
      copyEmail: "ईमेल कॉपी करें",
      copied: "कॉपी किया गया!",
      changePhoto: "फ़ोटो अपडेट करें",
      quickActions: "त्वरित लिंक",
      eventsLink: "चर्च कार्यक्रम",
      prayersLink: "प्रार्थना निवेदन",
    },
    form: {
      editTitle: "प्रोफ़ाइल विवरण संपादित करें",
      editSub: "अपनी व्यक्तिगत, शाखा और संपर्क जानकारी अपडेट करें",
      personalSection: "व्यक्तिगत और चर्च पहचान",
      personalSub: "आपका कानूनी नाम और स्थानीय संगति शाखा",
      contactSection: "संपर्क और आवासीय पता",
      contactSub: "पादरी और प्रार्थना दल आपसे कैसे संपर्क करें",
      preferencesSection: "आत्मिक और अधिसूचना प्राथमिकताएं",
      preferencesSub: "रविवार की सभाओं और प्रार्थना सूचनाओं से जुड़े रहें",
      fullName: "पूरा नाम *",
      fullNameHelp: "चर्च रिकॉर्ड और आधिकारिक पहचान के अनुसार",
      fullNamePlaceholder: "उदा: राहुल वल्लूरी",
      preferredCampus: "चर्च शाखा / परिसर",
      campusHelp: "आपका नियमित साप्ताहिक आराधना परिसर",
      emailAddress: "पंजीकृत ईमेल पता",
      emailLocked: "लॉक किया गया",
      emailHelp: "आपके लॉगिन खाते से जुड़ा हुआ है। अपडेट करने के लिए चर्च कार्यालय से संपर्क करें।",
      mobileNumber: "मोबाइल नंबर (व्हाट्सएप)",
      mobileHelp: "प्रार्थना अनुरोधों और चर्च सूचनाओं के लिए उपयोग किया जाता है",
      mobilePlaceholder: "95052 88171",
      homeAddress: "आवासीय पता",
      homeAddressHelp: "मकान नंबर, सड़क, लैंडमार्क, क्षेत्र, हैदराबाद",
      homeAddressPlaceholder: "फ्लैट 201, सुभाष नगर, हैदराबाद...",
      whatsappPref: "व्हाट्सएप प्रार्थना और वचन सूचनाएं",
      whatsappPrefDesc: "साप्ताहिक संदेश नोट्स और आपातकालीन प्रार्थना सूचनाएं प्राप्त करें",
      serviceReminderPref: "रविवार आराधना स्मरणपत्र",
      serviceReminderPrefDesc: "रविवार की सेवा शुरू होने से 1 घंटा पहले सूचना प्राप्त करें",
    },
    saveBar: {
      connected: "क्लाउड कनेक्टेड",
      offline: "ऑफ़लाइन मोड",
      allSaved: "सभी परिवर्तन सुरक्षित हैं",
      autoSaving: "2 सेकंड में सहेज रहा है...",
      saving: "सिंक हो रहा है...",
      saveNow: "परिवर्तन सहेजें",
      saved: "सफलतापूर्वक सहेजा गया!",
      tryAgain: "पुनः प्रयास करें",
      unsavedPill: "असुरक्षित परिवर्तन",
    },
    toasts: {
      savedSuccess: "प्रोफ़ाइल सफलतापूर्वक सहेजी गई!",
      loadError: "प्रोफ़ाइल डेटा लोड करने में विफल",
      saveError: "प्रोफ़ाइल सहेजने में विफल",
      photoSuccess: "प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट की गई!",
      photoError: "फ़ोटो अपलोड विफल। कृपया एक छोटा चित्र चुनें।",
    }
  }
};

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function MemberProfile() {
  const { user, status, mounted, refreshUser, updateUser } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const pt = profileTranslations[language as keyof typeof profileTranslations] || profileTranslations.en;

  // Form State
  const [name, setName] = useState("");
  const [campus, setCampus] = useState("Subhash Nagar");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [serviceReminders, setServiceReminders] = useState(true);

  const [role, setRole] = useState("MEMBER");
  const [joinedAt, setJoinedAt] = useState("");
  const [image, setImage] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const original = useRef<ProfileSnapshot>({ name: "", phone: "", address: "", role: "MEMBER", joinedAt: "", image: "" });
  const syncTimer = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/login");
  }, [mounted, status, router]);

  // Pre-fill name/image from auth user if state is empty
  useEffect(() => {
    if (user) {
      if (!name && user.name && !original.current.name) {
        setName(user.name);
      }
      if (!image && user.image && !original.current.image) {
        setImage(user.image);
      }
    }
  }, [user, name, image]);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  /* ── Load Profile Data ───────────────────────────────────── */
  const loadProfile = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    if (!silent) setSyncing(true);
    try {
      const res = await fetch(`/api/member/profile?userId=${user.uid}&email=${encodeURIComponent(user.email || "")}`);
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const p = data.user;
        const snap: ProfileSnapshot = {
          name: p.name || user?.name || "",
          phone: p.phone || "",
          address: p.address || "",
          role: p.role || "MEMBER",
          joinedAt: p.createdAt || "",
          image: p.image || user?.image || "",
        };

        setName(snap.name);
        setPhoneDigits(cleanIndianPhone(snap.phone));

        const parsed = parseCampusAndAddress(snap.address);
        setCampus(parsed.campus);
        setStreetAddress(parsed.street);

        setRole(snap.role);
        setJoinedAt(snap.joinedAt);
        setImage(snap.image);
        original.current = snap;
        setHasChanges(false);
      }
      setLastSynced(new Date());
    } catch {
      if (!silent) showToast(pt.toasts.loadError, "error");
    } finally {
      setSyncing(false);
    }
  }, [user?.uid, user?.email, user?.name, user?.image, pt.toasts.loadError]);

  /* ── Save Profile Handler ────────────────────────────────── */
  const handleSave = useCallback(async (e?: React.FormEvent, currentImage?: string) => {
    if (e) e.preventDefault();
    if (!user?.uid) return;

    setSaving(true);
    setSaveState("saving");

    const imageToSave = currentImage !== undefined ? currentImage : image;
    const formattedAddress = formatCampusAndAddress(campus, streetAddress);
    const formattedPhone = phoneDigits ? `+91 ${phoneDigits}` : "";

    try {
      const res = await fetch("/api/member/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          email: user?.email,
          name,
          phone: formattedPhone,
          address: formattedAddress,
          image: imageToSave
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        original.current = {
          ...original.current,
          name,
          phone: formattedPhone,
          address: formattedAddress,
          image: imageToSave
        };
        setHasChanges(false);
        setSaveState("saved");
        setLastSynced(new Date());
        showToast(pt.toasts.savedSuccess, "success");

        if (updateUser) {
          updateUser({ name, image: imageToSave });
        }
        if (refreshUser) {
          await refreshUser();
        }
        setTimeout(() => setSaveState("idle"), 2500);
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (err: any) {
      setSaveState("error");
      showToast(err.message || pt.toasts.saveError, "error");
      setTimeout(() => setSaveState("idle"), 3000);
    } finally {
      setSaving(false);
    }
  }, [user?.uid, user?.email, name, campus, streetAddress, phoneDigits, image, refreshUser, updateUser, pt.toasts.savedSuccess, pt.toasts.saveError]);

  /* ── Photo Upload Handler ────────────────────────────────── */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
      await handleSave(undefined, compressed);
      showToast(pt.toasts.photoSuccess, "success");
    } catch (err) {
      showToast(pt.toasts.photoError, "error");
    } finally {
      setPhotoUploading(false);
    }
  };

  const copyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  useEffect(() => {
    let activeSyncTimer: NodeJS.Timeout | null = null;
    if (status === "authenticated" && user?.uid) {
      loadProfile();
      activeSyncTimer = setInterval(() => loadProfile(true), 60000);
      syncTimer.current = activeSyncTimer;
    }
    return () => {
      if (activeSyncTimer) clearInterval(activeSyncTimer);
    };
  }, [status, user, loadProfile]);

  /* ── Smart Debounced Auto-Save (2.5s) ────────────────────── */
  useEffect(() => {
    const currentCombinedAddress = formatCampusAndAddress(campus, streetAddress);
    const currentFormattedPhone = phoneDigits ? `+91 ${phoneDigits}` : "";

    const changed =
      name !== original.current.name ||
      currentFormattedPhone !== original.current.phone ||
      currentCombinedAddress !== original.current.address ||
      image !== original.current.image;

    setHasChanges(changed);

    if (changed) {
      if (saveState === "saved") setSaveState("idle");

      // Professional 2.5-second debounce (standard in modern cloud software)
      const timer = setTimeout(() => {
        if (isOnline) {
          handleSave();
        }
      }, 2500);

      autoSaveTimer.current = timer;

      return () => {
        clearTimeout(timer);
      };
    }
  }, [name, campus, streetAddress, phoneDigits, image, isOnline, saveState, handleSave]);

  const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
    ADMIN: { label: pt.avatarRole.ADMIN, color: "text-red-700 dark:text-red-300 font-extrabold", bg: "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800" },
    PASTOR: { label: pt.avatarRole.PASTOR, color: "text-purple-700 dark:text-purple-300 font-extrabold", bg: "bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800" },
    MEMBER: { label: pt.avatarRole.MEMBER, color: "text-purple-700 dark:text-purple-300 font-extrabold", bg: "bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800" },
  };
  const rc = roleConfig[role] || roleConfig.MEMBER;

  const humanFriendlyName = getHumanFriendlyName(name || user?.name);

  if (status === "unauthenticated" && mounted) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6">
      {/* Toast Notification Pop-up */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`fixed bottom-20 left-1/2 -translate-x-1/2 sm:bottom-8 sm:left-auto sm:right-6 sm:translate-x-0 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold border max-w-[92vw] sm:max-w-md backdrop-blur-xl transition-all ${
              toast.type === "success"
                ? "bg-emerald-600 text-white border-emerald-400/40 shadow-emerald-600/30"
                : "bg-red-600 text-white border-red-400/40 shadow-red-600/30"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 text-white" />}
            <span className="leading-snug whitespace-normal">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900/60 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-white/5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{pt.title}</h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-600 text-white border border-purple-500 shadow-xs">
              <Shield className="w-3 h-3 text-white" /> {pt.memberPortalTag}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{pt.subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          {mounted && lastSynced && (
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">
              {pt.syncedAt} {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => loadProfile(false)}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Refresh profile data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-purple-600" : ""}`} />
            <span>{pt.refresh}</span>
          </button>
        </div>
      </div>

      {/* ── Main 2-Column Responsive Layout ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

        {/* ── LEFT COLUMN: Spiritual Identity & Member Badge Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 space-y-4"
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-white/5 shadow-xl overflow-hidden backdrop-blur-xl">
            {/* Banner Cover with Church Cross Motif & Campus Pill */}
            <div className="h-28 sm:h-32 bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 relative overflow-hidden p-3 flex justify-between items-start">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-xl" />

              <span className="relative z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 shadow-xs">
                <Church className="w-3 h-3 text-amber-300" />
                <span>{campus}</span>
              </span>

              <div className="relative z-10 flex items-center gap-1 text-[10px] font-extrabold text-amber-300 uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                <span>KCM Family</span>
              </div>
            </div>

            {/* Profile Avatar & Identity Information */}
            <div className="px-5 pb-5">
              <div className="relative -mt-10 sm:-mt-12 mb-3.5 flex items-end justify-between gap-3">
                {/* Avatar with Accessible Camera Button for Touch & Desktop */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden group shrink-0 cursor-pointer"
                  title="Click or tap to change profile photo"
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                  {photoUploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-purple-900/50">
                      <Loader2 className="w-7 h-7 text-white animate-spin" />
                    </div>
                  ) : image && typeof image === "string" && image.length > 0 ? (
                    <Image src={image} alt={humanFriendlyName || "Member"} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white">
                      <User className="w-10 h-10" />
                    </div>
                  )}

                  {/* Desktop Hover Overlay */}
                  {!photoUploading && (
                    <div
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* Online Presence Indicator */}
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse pointer-events-none z-10" />
                </div>

                {/* Role Pill */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${rc.bg} ${rc.color} shrink-0 mb-1`}>
                  <Shield className="w-3.5 h-3.5" />
                  {rc.label}
                </div>
              </div>

              {/* Explicit Mobile / Touch Photo Upload Trigger */}
              <button
                type="button"
                disabled={photoUploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:underline mb-2.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{pt.fellowship.changePhoto}</span>
              </button>

              {/* Human-Friendly Name & Account Tag */}
              <div className="space-y-1">
                <h2 className="font-black text-gray-900 dark:text-white text-lg sm:text-xl leading-tight">
                  {humanFriendlyName}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {name || user?.name || "Member"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    ID Verified
                  </span>
                </div>
              </div>

              {/* Fellowship Details Stack */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-2.5">
                {/* Home Campus Info */}
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9.5px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                      {pt.fellowship.primaryCampus}
                    </p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {campus}
                    </p>
                  </div>
                </div>

                {/* Email with One-Tap Copy */}
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9.5px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Email Address
                      </p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[160px] sm:max-w-[190px]">
                        {user?.email || "-"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={copyEmail}
                    className="p-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors shrink-0"
                    title={pt.fellowship.copyEmail}
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-white/5">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9.5px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Mobile
                    </p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white font-mono">
                      {phoneDigits ? `+91 ${phoneDigits.replace(/(\d{5})(\d{5})/, "$1 $2")}` : "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Member Since Milestone */}
                {joinedAt && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-950/60 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <Star className="w-4 h-4 fill-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9.5px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        {pt.fellowship.memberSince}
                      </p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {new Date(joinedAt).toLocaleDateString(language === "en" ? "en-US" : "en-IN", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Fellowship Links */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 grid grid-cols-2 gap-2">
                <Link
                  href="/member/events"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{pt.fellowship.eventsLink}</span>
                </Link>
                <Link
                  href="/member/prayers"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>{pt.fellowship.prayersLink}</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT COLUMN: Edit Settings Form ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="lg:col-span-8"
        >
          <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-white/5 shadow-xl overflow-hidden backdrop-blur-xl">

            {/* Form Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Edit3 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">{pt.form.editTitle}</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:block">{pt.form.editSub}</p>
                </div>
              </div>

              {hasChanges && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  {pt.saveBar.unsavedPill}
                </span>
              )}
            </div>

            {/* Form Content */}
            <div className="p-5 sm:p-6 space-y-6">

              {/* ── Section 1: Personal & Church Identity ───────── */}
              <div className="space-y-4">
                <div className="border-b border-gray-100 dark:border-white/5 pb-2">
                  <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    {pt.form.personalSection}
                  </h4>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">{pt.form.personalSub}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      {pt.form.fullName}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder={pt.form.fullNamePlaceholder}
                        className="w-full py-2.5 sm:py-3 px-4 pl-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all text-xs sm:text-sm font-medium"
                      />
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{pt.form.fullNameHelp}</p>
                  </div>

                  {/* Home Campus Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      {pt.form.preferredCampus}
                    </label>
                    <div className="relative">
                      <select
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                        className="w-full py-2.5 sm:py-3 px-4 pl-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all text-xs sm:text-sm font-medium appearance-none cursor-pointer"
                      >
                        <option value="Subhash Nagar">{pt.fellowship.mainSanctuary}</option>
                        <option value="Shapur Nagar">{pt.fellowship.shapurBranch}</option>
                        <option value="Bahadurpally">{pt.fellowship.bahadurpallyBranch}</option>
                      </select>
                      <Church className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 dark:text-purple-400 pointer-events-none" />
                      <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{pt.form.campusHelp}</p>
                  </div>
                </div>
              </div>

              {/* ── Section 2: Contact & Residential Details ─────── */}
              <div className="space-y-4">
                <div className="border-b border-gray-100 dark:border-white/5 pb-2">
                  <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    {pt.form.contactSection}
                  </h4>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">{pt.form.contactSub}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email (Locked Auth Identity) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {pt.form.emailAddress}
                      </label>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                        <Lock className="w-2.5 h-2.5" /> {pt.form.emailLocked}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full py-2.5 sm:py-3 px-4 pl-10 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-gray-100/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 cursor-not-allowed text-xs sm:text-sm font-medium truncate"
                      />
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{pt.form.emailHelp}</p>
                  </div>

                  {/* Mobile Number with India (+91) Badge */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      {pt.form.mobileNumber}
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center gap-1 px-3 py-2.5 sm:py-3 rounded-l-2xl border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 select-none">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </span>
                      <input
                        type="tel"
                        value={phoneDigits}
                        onChange={(e) => setPhoneDigits(cleanIndianPhone(e.target.value))}
                        placeholder={pt.form.mobilePlaceholder}
                        maxLength={10}
                        className="w-full py-2.5 sm:py-3 px-4 rounded-r-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all text-xs sm:text-sm font-medium"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{pt.form.mobileHelp}</p>
                  </div>
                </div>

                {/* Home Address */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    {pt.form.homeAddress}
                  </label>
                  <div className="relative">
                    <textarea
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder={pt.form.homeAddressPlaceholder}
                      rows={3}
                      className="w-full py-2.5 sm:py-3 px-4 pl-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all resize-none text-xs sm:text-sm font-medium leading-relaxed"
                    />
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{pt.form.homeAddressHelp}</p>
                </div>
              </div>

              {/* ── Section 3: Spiritual & Communication Preferences ── */}
              <div className="space-y-4">
                <div className="border-b border-gray-100 dark:border-white/5 pb-2">
                  <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    {pt.form.preferencesSection}
                  </h4>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">{pt.form.preferencesSub}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* WhatsApp Alerts Toggle */}
                  <div
                    onClick={() => setWhatsappAlerts(!whatsappAlerts)}
                    className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 flex items-start gap-3 cursor-pointer hover:border-purple-300 dark:hover:border-purple-800 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {pt.form.whatsappPref}
                        </span>
                        <input
                          type="checkbox"
                          checked={whatsappAlerts}
                          onChange={(e) => setWhatsappAlerts(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </div>
                      <p className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        {pt.form.whatsappPrefDesc}
                      </p>
                    </div>
                  </div>

                  {/* Sunday Reminders Toggle */}
                  <div
                    onClick={() => setServiceReminders(!serviceReminders)}
                    className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 flex items-start gap-3 cursor-pointer hover:border-purple-300 dark:hover:border-purple-800 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {pt.form.serviceReminderPref}
                        </span>
                        <input
                          type="checkbox"
                          checked={serviceReminders}
                          onChange={(e) => setServiceReminders(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </div>
                      <p className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        {pt.form.serviceReminderPrefDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Save Footer Bar (Resolved Usability Paradox) ── */}
            <div className="px-5 sm:px-6 py-4 bg-gray-50/90 dark:bg-gray-800/60 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Connection Status & Auto-Save Feedback */}
              <div className="flex items-center justify-between sm:justify-start gap-4">
                {isOnline ? (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-semibold">
                    <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{pt.saveBar.connected}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-semibold">
                    <WifiOff className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{pt.saveBar.offline}</span>
                  </div>
                )}

                {/* Cloud Sync State Text */}
                <div className="flex items-center gap-1.5 text-xs">
                  {saveState === "saving" ? (
                    <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> {pt.saveBar.saving}
                    </span>
                  ) : hasChanges ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> {pt.saveBar.autoSaving}
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {pt.saveBar.allSaved}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button: Never a dead, broken-looking disabled grey element */}
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 ${
                  saveState === "saved"
                    ? "bg-emerald-600 text-white shadow-emerald-500/20"
                    : saveState === "error"
                    ? "bg-red-600 text-white shadow-red-500/20"
                    : hasChanges
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25 cursor-pointer hover:shadow-lg"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 cursor-default shadow-none"
                }`}
              >
                {saveState === "saving" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {pt.saveBar.saving}
                  </>
                ) : saveState === "saved" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" /> {pt.saveBar.saved}
                  </>
                ) : saveState === "error" ? (
                  <>
                    <AlertCircle className="w-4 h-4" /> {pt.saveBar.tryAgain}
                  </>
                ) : hasChanges ? (
                  <>
                    <Save className="w-4 h-4" /> {pt.saveBar.saveNow}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" /> {pt.saveBar.allSaved}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
