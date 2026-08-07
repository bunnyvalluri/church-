"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  PlayCircle,
  Clock,
  Search,
  Filter,
  Film,
  Sparkles,
  CheckCircle2,
  Play,
  Share2,
  Tv,
  Layers,
  Volume2,
  ArrowUpRight,
  ChevronDown,
  RotateCcw,
  Building2,
  HeartHandshake,
  MonitorPlay,
  X,
  Tag,
  Check,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  type: "VIDEO_YOUTUBE" | "VIDEO_LOCAL" | string;
  url: string;
  thumbnailUrl: string;
  category: "ALL" | "BETHANY-ASHRAMAM" | "HOSPITALS" | "DISABLED-ASHRAMAM" | string;
  date?: string;
  fileSize?: string;
}

// 30 Direct MP4 Video Logs from Bethany Samrakshana Ashramam (May 15 & April 21 drives)
const BETHANY_MP4_VIDEOS: VideoItem[] = [
  // ── 11 MP4 Logs: April 21, 2026 Drive ────────────────────────────────────
  {
    id: "mp4-bethany-20260421-01",
    title: "Bethany Ashramam (Apr 21) Log 1 - Volunteer Arrival",
    description: "KCM social service volunteers arriving at Bethany Samrakshana Ashramam with groceries, food packets, and care items.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/VID-20260421-WA0015.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0013.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "21-04-2026",
    fileSize: "3.3 MB",
  },
  {
    id: "mp4-bethany-20260421-02",
    title: "Bethany Ashramam (Apr 21) Log 2 - Grocery Supplies Handover",
    description: "Handing over essential cooking oils, pulses, and monthly groceries to the Ashramam kitchen team.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/VID-20260421-WA0036.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0018.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "21-04-2026",
    fileSize: "0.3 MB",
  },
  {
    id: "mp4-bethany-20260421-03",
    title: "Bethany Ashramam (Apr 21) Log 3 - Kitchen Rice Bag Delivery",
    description: "Unloading heavy rice bags for long-term meal support for children and elderly residents.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/VID-20260421-WA0037.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0019.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "21-04-2026",
    fileSize: "0.3 MB",
  },
  {
    id: "mp4-bethany-20260421-04",
    title: "Bethany Ashramam (Apr 21) Log 4 - Resident Care & Fellowship",
    description: "Interacting with residents, offering words of encouragement, and sharing fellowship.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/VID-20260421-WA0139.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0022.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "21-04-2026",
    fileSize: "2.6 MB",
  },
  {
    id: "mp4-bethany-20260421-05",
    title: "Bethany Ashramam (Apr 21) Log 5 - Nutrition Packet Distribution",
    description: "Distributing healthy meal packets and nutritious snacks directly to Ashramam residents.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/VID-20260421-WA0140.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0027.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "21-04-2026",
    fileSize: "1.3 MB",
  },
  {
    id: "mp4-bethany-20260421-06",
    title: "Bethany Ashramam (Apr 21) Log 6 - Warm Milk & Snack Drive",
    description: "Serving fresh warm milk and healthy refreshments during the afternoon session.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/VID-20260421-WA0141.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0031.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "21-04-2026",
    fileSize: "2.3 MB",
  },
  {
    id: "mp4-bethany-20260421-07",
    title: "Bethany Ashramam (Apr 21) Log 7 - Children's Study Book Handover",
    description: "Providing notebooks, pens, and educational kits for young resident children.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/VID-20260421-WA0142.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0034.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "21-04-2026",
    fileSize: "3.4 MB",
  },
  {
    id: "mp4-bethany-20260421-08",
    title: "Bethany Ashramam (Apr 21) Log 8 - Health & Hygiene Kit Drive",
    description: "Handing over hygiene supplies, soaps, antiseptics, and clean towels to residents.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/VID-20260421-WA0144.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0040.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "21-04-2026",
    fileSize: "4.7 MB",
  },
  {
    id: "mp4-bethany-20260421-09",
    title: "Bethany Ashramam (Apr 21) Log 9 - Clothing & Bedding Delivery",
    description: "Distributing warm blankets, bedsheets, and fresh clothing items for residents.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/VID-20260421-WA0146.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0044.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "21-04-2026",
    fileSize: "5.5 MB",
  },
  {
    id: "mp4-bethany-20260421-10",
    title: "Bethany Ashramam (Apr 21) Log 10 - Afternoon Meal Service",
    description: "Serving hot lunch meals and water bottles to all Ashramam residents.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/VID-20260421-WA0147.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0047.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "21-04-2026",
    fileSize: "9.0 MB",
  },
  {
    id: "mp4-bethany-20260421-11",
    title: "Bethany Ashramam (Apr 21) Log 11 - Full Service Documentary",
    description: "Complete video footage capturing the April 21, 2026 Bethany Ashramam support drive.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/VID-20260421-WA0148.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0050.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "21-04-2026",
    fileSize: "8.6 MB",
  },

  // ── 19 MP4 Logs: May 15, 2026 Drive ─────────────────────────────────────
  {
    id: "mp4-bethany-01",
    title: "Bethany Ashramam (May 15) Log 1 - Volunteer Arrival & Greetings",
    description: "KCM volunteers arrive at Bethany Samrakshana Ashramam with vehicle loads of fresh food packages, groceries, and essential care kits for the residents.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0036.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0018.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "40.0 MB",
  },
  {
    id: "mp4-bethany-02",
    title: "Bethany Ashramam (May 15) Log 2 - Provisions & Groceries Unloading",
    description: "Footage of team members unloading heavy rice bags, pulses, cooking oil, and nutritious food supplies for the Ashramam kitchen.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0037.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0019.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "7.1 MB",
  },
  {
    id: "mp4-bethany-03",
    title: "Bethany Ashramam (May 15) Log 3 - Community Opening Prayer",
    description: "Commencing the community service event with opening prayers and warm interaction with children and elderly residents.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0039.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0020.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "1.3 MB",
  },
  {
    id: "mp4-bethany-04",
    title: "Bethany Ashramam (May 15) Log 4 - Staple Food Packet Distribution",
    description: "Distributing freshly prepared hot food packets and healthy snacks directly to each resident of the Ashramam.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0041.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0021.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "50.3 MB",
  },
  {
    id: "mp4-bethany-05",
    title: "Bethany Ashramam (May 15) Log 5 - Personal Hygiene Kits Handover",
    description: "Handing over essential hygiene supplies, bathing soaps, towels, and sanitary items to maintain resident health and dignity.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0042.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0022.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "9.6 MB",
  },
  {
    id: "mp4-bethany-06",
    title: "Bethany Ashramam (May 15) Log 6 - Resident Interaction & Fellowship",
    description: "Volunteers sitting down with residents, listening to their life stories, and sharing words of comfort and affection.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0044.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0023.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "1.2 MB",
  },
  {
    id: "mp4-bethany-07",
    title: "Bethany Ashramam (May 15) Log 7 - Educational Kits for Children",
    description: "Providing notebooks, drawing sets, pens, and school bags to young resident children to support their education.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0046.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0024.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "13.3 MB",
  },
  {
    id: "mp4-bethany-08",
    title: "Bethany Ashramam (May 15) Log 8 - Children's Care Activity",
    description: "Engaging in fun games, songs, and uplifting activities with resident children.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0047.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0025.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "1.6 MB",
  },
  {
    id: "mp4-bethany-09",
    title: "Bethany Ashramam (May 15) Log 9 - Refreshment & Nutrition Drive",
    description: "Serving fresh warm milk and nutritional snacks to elderly and young residents.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0050.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0026.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "2.1 MB",
  },
  {
    id: "mp4-bethany-10",
    title: "Bethany Ashramam (May 15) Log 10 - Monthly Ration Delivery",
    description: "Delivering raw food rations including wheat flour, lentils, cooking oil, and salt for long-term kitchen operations.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0052.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0027.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "16.6 MB",
  },
  {
    id: "mp4-bethany-11",
    title: "Bethany Ashramam (May 15) Log 11 - Volunteer Fellowship & Sharing",
    description: "KCM volunteers sharing thoughts on community service and the importance of supporting underprivileged homes.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0056.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0028.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "0.9 MB",
  },
  {
    id: "mp4-bethany-12",
    title: "Bethany Ashramam (May 15) Log 12 - Group Prayer & Blessing",
    description: "Gathering with residents and staff for a special prayer session asking for health, peace, and prosperity.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0057.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0029.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "4.8 MB",
  },
  {
    id: "mp4-bethany-13",
    title: "Bethany Ashramam (May 15) Log 13 - Bedding & Pillow Handover",
    description: "Distributing comfortable bedsheets, warm blankets, and pillows for resident beds.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0058.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0030.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "6.1 MB",
  },
  {
    id: "mp4-bethany-14",
    title: "Bethany Ashramam (May 15) Log 14 - Medical First-Aid Kit Handover",
    description: "Providing essential first-aid kits, antiseptics, bandages, and basic health checkup tools to the Ashramam caretakers.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0059.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0031.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "21.0 MB",
  },
  {
    id: "mp4-bethany-15",
    title: "Bethany Ashramam (May 15) Log 15 - Clothing & Essentials Handover",
    description: "Gifting fresh clothes and footwear to children and elderly residents.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0060.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0032.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "12.9 MB",
  },
  {
    id: "mp4-bethany-16",
    title: "Bethany Ashramam (May 15) Log 16 - Hot Meal Service Drive",
    description: "Footage of team members serving warm lunch meals in the Ashramam dining hall.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VID-20260515-WA0256.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0033.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "19.6 MB",
  },
  {
    id: "mp4-bethany-17",
    title: "Bethany Ashramam (May 15) Log 17 - Afternoon Food Service",
    description: "Video log capturing direct food plate distribution and volunteer hospitality.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VN20260515_162903.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0034.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "19.3 MB",
  },
  {
    id: "mp4-bethany-18",
    title: "Bethany Ashramam (May 15) Log 18 - Complete Event Summary",
    description: "Comprehensive video footage covering all aspects of the May 15, 2026 Bethany Ashramam support drive.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VN20260515_165016.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0035.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "172.0 MB",
  },
  {
    id: "mp4-bethany-19",
    title: "Bethany Ashramam (May 15) Log 19 - Extended Documentary & Testimonials",
    description: "In-depth documentary log featuring resident feedback, caretaker appreciation, and volunteer experiences.",
    type: "VIDEO_LOCAL",
    url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/VN20260515_165757.mp4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0038.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
    fileSize: "268.3 MB",
  },
];

// 42 Direct MP4 Video Logs from Home for the Disabled Ashramam (June 17, 2026 drive)
const DISABLED_MP4_VIDEOS: VideoItem[] = [
  {
    "id": "mp4-disabled-01",
    "title": "Home for Disabled Log 1 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260615-WA0018.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260615-WA0015.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "8.1 MB"
  },
  {
    "id": "mp4-disabled-02",
    "title": "Home for Disabled Log 2 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0003.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260615-WA0017.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "6.6 MB"
  },
  {
    "id": "mp4-disabled-03",
    "title": "Home for Disabled Log 3 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0005.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260615-WA0019.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "3.2 MB"
  },
  {
    "id": "mp4-disabled-04",
    "title": "Home for Disabled Log 4 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0006.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0010.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "1.8 MB"
  },
  {
    "id": "mp4-disabled-05",
    "title": "Home for Disabled Log 5 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0008.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0012.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "20.3 MB"
  },
  {
    "id": "mp4-disabled-06",
    "title": "Home for Disabled Log 6 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0009.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0013.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "12.9 MB"
  },
  {
    "id": "mp4-disabled-07",
    "title": "Home for Disabled Log 7 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0098.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0014.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "13.2 MB"
  },
  {
    "id": "mp4-disabled-08",
    "title": "Home for Disabled Log 8 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0099.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0015.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "17.7 MB"
  },
  {
    "id": "mp4-disabled-09",
    "title": "Home for Disabled Log 9 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0112.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0019.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "4.4 MB"
  },
  {
    "id": "mp4-disabled-10",
    "title": "Home for Disabled Log 10 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0196.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0022.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "3.7 MB"
  },
  {
    "id": "mp4-disabled-11",
    "title": "Home for Disabled Log 11 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0198.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0024.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "6.2 MB"
  },
  {
    "id": "mp4-disabled-12",
    "title": "Home for Disabled Log 12 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0199.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0029.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "8.2 MB"
  },
  {
    "id": "mp4-disabled-13",
    "title": "Home for Disabled Log 13 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0200.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0033.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "7.7 MB"
  },
  {
    "id": "mp4-disabled-14",
    "title": "Home for Disabled Log 14 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0201.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0035.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "12.8 MB"
  },
  {
    "id": "mp4-disabled-15",
    "title": "Home for Disabled Log 15 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0202.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0038.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "12.7 MB"
  },
  {
    "id": "mp4-disabled-16",
    "title": "Home for Disabled Log 16 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0203.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0043.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "10.3 MB"
  },
  {
    "id": "mp4-disabled-17",
    "title": "Home for Disabled Log 17 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0204.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0045.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "11.6 MB"
  },
  {
    "id": "mp4-disabled-18",
    "title": "Home for Disabled Log 18 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0205.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0046.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "13.0 MB"
  },
  {
    "id": "mp4-disabled-19",
    "title": "Home for Disabled Log 19 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0206.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0049.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "13.9 MB"
  },
  {
    "id": "mp4-disabled-20",
    "title": "Home for Disabled Log 20 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0207.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0051.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "9.4 MB"
  },
  {
    "id": "mp4-disabled-21",
    "title": "Home for Disabled Log 21 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0208.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0052.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "16.0 MB"
  },
  {
    "id": "mp4-disabled-22",
    "title": "Home for Disabled Log 22 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0209.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0053.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "12.2 MB"
  },
  {
    "id": "mp4-disabled-23",
    "title": "Home for Disabled Log 23 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0210.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0054.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "20.5 MB"
  },
  {
    "id": "mp4-disabled-24",
    "title": "Home for Disabled Log 24 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0211.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0057.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "32.1 MB"
  },
  {
    "id": "mp4-disabled-25",
    "title": "Home for Disabled Log 25 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0212.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0058.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "38.5 MB"
  },
  {
    "id": "mp4-disabled-26",
    "title": "Home for Disabled Log 26 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0213.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0059.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "35.7 MB"
  },
  {
    "id": "mp4-disabled-27",
    "title": "Home for Disabled Log 27 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0214.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0062.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "42.3 MB"
  },
  {
    "id": "mp4-disabled-28",
    "title": "Home for Disabled Log 28 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/VID-20260617-WA0215.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0063.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "30.0 MB"
  },
  {
    "id": "mp4-disabled-29",
    "title": "Home for Disabled Log 29 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/micro_movie_20260617_115304.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0066.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "341.5 MB"
  },
  {
    "id": "mp4-disabled-30",
    "title": "Home for Disabled Log 30 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_111020.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0069.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "134.4 MB"
  },
  {
    "id": "mp4-disabled-31",
    "title": "Home for Disabled Log 31 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_111521.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0070.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "395.2 MB"
  },
  {
    "id": "mp4-disabled-32",
    "title": "Home for Disabled Log 32 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_111945.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0073.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "234.9 MB"
  },
  {
    "id": "mp4-disabled-33",
    "title": "Home for Disabled Log 33 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_112341.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0075.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "4.2 MB"
  },
  {
    "id": "mp4-disabled-34",
    "title": "Home for Disabled Log 34 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_112349.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0077.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "908.7 MB"
  },
  {
    "id": "mp4-disabled-35",
    "title": "Home for Disabled Log 35 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_113314.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0079.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "218.8 MB"
  },
  {
    "id": "mp4-disabled-36",
    "title": "Home for Disabled Log 36 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_113511.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0081.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "440.8 MB"
  },
  {
    "id": "mp4-disabled-37",
    "title": "Home for Disabled Log 37 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_115751.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0082.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "54.1 MB"
  },
  {
    "id": "mp4-disabled-38",
    "title": "Home for Disabled Log 38 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_120115.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0083.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "166.5 MB"
  },
  {
    "id": "mp4-disabled-39",
    "title": "Home for Disabled Log 39 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_121404.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0084.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "229.6 MB"
  },
  {
    "id": "mp4-disabled-40",
    "title": "Home for Disabled Log 40 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_122323.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0087.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "126.2 MB"
  },
  {
    "id": "mp4-disabled-41",
    "title": "Home for Disabled Log 41 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_122738.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0088.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "51.0 MB"
  },
  {
    "id": "mp4-disabled-42",
    "title": "Home for Disabled Log 42 - Care & Support Outreach",
    "description": "Field video log capturing volunteer visitation, wheelchair assistance, blanket delivery, and comfort care at Home for the Disabled.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/video_20260617_161035.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0089.jpg",
    "category": "DISABLED-ASHRAMAM",
    "date": "17-06-2026",
    "fileSize": "218.9 MB"
  }
];

// 25 Direct MP4 Video Logs from Hospitals (NIMS, Govt & Gandhi Hospitals)
const HOSPITALS_MP4_VIDEOS: VideoItem[] = [
  {
    "id": "mp4-hospital-01",
    "title": "NIMS Hospital Log 1 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at NIMS Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0101.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0037.jpg",
    "category": "HOSPITALS",
    "date": "11-03-2026",
    "fileSize": "5.4 MB"
  },
  {
    "id": "mp4-hospital-02",
    "title": "NIMS Hospital Log 2 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at NIMS Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0102.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0043.jpg",
    "category": "HOSPITALS",
    "date": "11-03-2026",
    "fileSize": "1.4 MB"
  },
  {
    "id": "mp4-hospital-03",
    "title": "NIMS Hospital Log 3 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at NIMS Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0103.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0045.jpg",
    "category": "HOSPITALS",
    "date": "11-03-2026",
    "fileSize": "5.4 MB"
  },
  {
    "id": "mp4-hospital-04",
    "title": "NIMS Hospital Log 4 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at NIMS Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0133.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0047.jpg",
    "category": "HOSPITALS",
    "date": "11-03-2026",
    "fileSize": "1.5 MB"
  },
  {
    "id": "mp4-hospital-05",
    "title": "NIMS Hospital Log 5 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at NIMS Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0139.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0049.jpg",
    "category": "HOSPITALS",
    "date": "11-03-2026",
    "fileSize": "0.4 MB"
  },
  {
    "id": "mp4-hospital-06",
    "title": "NIMS Hospital Log 6 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at NIMS Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0172.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0052.jpg",
    "category": "HOSPITALS",
    "date": "11-03-2026",
    "fileSize": "22.1 MB"
  },
  {
    "id": "mp4-hospital-07",
    "title": "NIMS Hospital Log 7 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at NIMS Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0173.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0055.jpg",
    "category": "HOSPITALS",
    "date": "11-03-2026",
    "fileSize": "25.9 MB"
  },
  {
    "id": "mp4-hospital-08",
    "title": "NIMS Hospital Log 8 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at NIMS Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0174.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0057.jpg",
    "category": "HOSPITALS",
    "date": "11-03-2026",
    "fileSize": "159.6 MB"
  },
  {
    "id": "mp4-hospital-09",
    "title": "NIMS Hospital Log 9 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at NIMS Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0178.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0059.jpg",
    "category": "HOSPITALS",
    "date": "11-03-2026",
    "fileSize": "8.6 MB"
  },
  {
    "id": "mp4-hospital-10",
    "title": "NIMS Hospital Log 10 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at NIMS Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0179.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0060.jpg",
    "category": "HOSPITALS",
    "date": "11-03-2026",
    "fileSize": "2.7 MB"
  },
  {
    "id": "mp4-hospital-11",
    "title": "NIMS Hospital Log 11 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at NIMS Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0180.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0062.jpg",
    "category": "HOSPITALS",
    "date": "11-03-2026",
    "fileSize": "3.4 MB"
  },
  {
    "id": "mp4-hospital-12",
    "title": "NIMS Hospital Log 12 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at NIMS Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0181.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0063.jpg",
    "category": "HOSPITALS",
    "date": "11-03-2026",
    "fileSize": "4.6 MB"
  },
  {
    "id": "mp4-hospital-13",
    "title": "NIMS Hospital Log 13 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at NIMS Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID-20260311-WA0182.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0064.jpg",
    "category": "HOSPITALS",
    "date": "11-03-2026",
    "fileSize": "5.3 MB"
  },
  {
    "id": "mp4-hospital-14",
    "title": "NIMS Hospital Log 14 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at NIMS Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/VID_20260312_004446_628.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0065.jpg",
    "category": "HOSPITALS",
    "date": "11-03-2026",
    "fileSize": "21.9 MB"
  },
  {
    "id": "mp4-hospital-15",
    "title": "Govt Hospital Log 1 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at Govt Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/VID-20260222-WA0048.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0018.jpg",
    "category": "HOSPITALS",
    "date": "23-02-2026",
    "fileSize": "20.8 MB"
  },
  {
    "id": "mp4-hospital-16",
    "title": "Govt Hospital Log 2 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at Govt Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/VID-20260223-WA0086.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0019.jpg",
    "category": "HOSPITALS",
    "date": "23-02-2026",
    "fileSize": "19.6 MB"
  },
  {
    "id": "mp4-hospital-17",
    "title": "Govt Hospital Log 3 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at Govt Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/VID-20260225-WA0018.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0020.jpg",
    "category": "HOSPITALS",
    "date": "23-02-2026",
    "fileSize": "26.6 MB"
  },
  {
    "id": "mp4-hospital-18",
    "title": "Govt Hospital Log 4 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at Govt Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/VID-20260225-WA0019.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0021.jpg",
    "category": "HOSPITALS",
    "date": "23-02-2026",
    "fileSize": "48.0 MB"
  },
  {
    "id": "mp4-hospital-19",
    "title": "Gandhi Hospital Log 1 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at Gandhi Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260325-WA0033.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0031.jpg",
    "category": "HOSPITALS",
    "date": "25-03-2026",
    "fileSize": "2.5 MB"
  },
  {
    "id": "mp4-hospital-20",
    "title": "Gandhi Hospital Log 2 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at Gandhi Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260325-WA0039.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0034.jpg",
    "category": "HOSPITALS",
    "date": "25-03-2026",
    "fileSize": "0.3 MB"
  },
  {
    "id": "mp4-hospital-21",
    "title": "Gandhi Hospital Log 3 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at Gandhi Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260325-WA0040.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0035.jpg",
    "category": "HOSPITALS",
    "date": "25-03-2026",
    "fileSize": "13.3 MB"
  },
  {
    "id": "mp4-hospital-22",
    "title": "Gandhi Hospital Log 4 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at Gandhi Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260325-WA0041.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0036.jpg",
    "category": "HOSPITALS",
    "date": "25-03-2026",
    "fileSize": "8.1 MB"
  },
  {
    "id": "mp4-hospital-23",
    "title": "Gandhi Hospital Log 5 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at Gandhi Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260326-WA0040.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0037.jpg",
    "category": "HOSPITALS",
    "date": "25-03-2026",
    "fileSize": "10.6 MB"
  },
  {
    "id": "mp4-hospital-24",
    "title": "Gandhi Hospital Log 6 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at Gandhi Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260418-WA0033.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0038.jpg",
    "category": "HOSPITALS",
    "date": "25-03-2026",
    "fileSize": "5.7 MB"
  },
  {
    "id": "mp4-hospital-25",
    "title": "Gandhi Hospital Log 7 - Patient Care & Food Outreach",
    "description": "Direct hospital field video log capturing patient food distribution, medicine handovers, and volunteer care at Gandhi Hospital.",
    "type": "VIDEO_LOCAL",
    "url": "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260418-WA0034.mp4",
    "thumbnailUrl": "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0042.jpg",
    "category": "HOSPITALS",
    "date": "25-03-2026",
    "fileSize": "9.8 MB"
  }
];

const ALL_MP4_VIDEOS = [...BETHANY_MP4_VIDEOS, ...DISABLED_MP4_VIDEOS, ...HOSPITALS_MP4_VIDEOS];

// YouTube Embed Videos (8 Total)
const YOUTUBE_VIDEOS: VideoItem[] = [
  {
    id: "vid-bethany-yt-20260515",
    title: "Bethany Samrakshana Ashramam Official Video Coverage",
    description: "Official YouTube video coverage showing Kingdom of Christ Ministries volunteers distributing groceries, meals, and medical supplies at Bethany Samrakshana Ashramam.",
    type: "VIDEO_YOUTUBE",
    url: "https://www.youtube.com/embed/bVh2ipzvRlI?si=70m7eA3IijU3AZHC",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0055.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
  },
  {
    id: "vid-bethany-yt-20260421",
    title: "Bethany Samrakshana Ashramam April 21 Drive Highlights",
    description: "YouTube video coverage of Kingdom of Christ Ministries volunteers serving food, clothes, and provisions at Bethany Samrakshana Ashramam.",
    type: "VIDEO_YOUTUBE",
    url: "https://www.youtube.com/embed/yBuQroMa5t0?si=pVto2gBF8EWn6Yl4",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0013.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "21-04-2026",
  },
  {
    id: "vid-gandhi-new",
    title: "Gandhi Hospital Food & Care Outreach",
    description: "Detailed video coverage of KCM volunteers distributing warm milk, food boxes, and basic sanitary kits to patient caretakers and critical care wards at Gandhi Hospital.",
    type: "VIDEO_YOUTUBE",
    url: "https://www.youtube.com/embed/cugBnrzyPF4?si=JRM4VEcma5_hRW8r",
    thumbnailUrl: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0031.jpg",
    category: "HOSPITALS",
    date: "25-03-2026",
  },
  {
    id: "vid-nims-new",
    title: "NIMS Hospital Care & Support Campaign",
    description: "Watch our volunteers distribute specialized medications, patient clothes, and nutritional foods to patients in the oncology and orthopedic departments at NIMS.",
    type: "VIDEO_YOUTUBE",
    url: "https://www.youtube.com/embed/y7gLEkS9CcI?si=YRzU4aaeORdjaGLw",
    thumbnailUrl: "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0037.jpg",
    category: "HOSPITALS",
    date: "11-03-2026",
  },
  {
    id: "vid-govt-new",
    title: "Government General Hospital Distribution Drive",
    description: "Direct footage showing wheelchair provisions, walkers, patient beds, and food packet distribution drives organized at the local government hospital.",
    type: "VIDEO_YOUTUBE",
    url: "https://www.youtube.com/embed/u4-lrU41HAc?si=vgAb5MnRZhG2Awwd",
    thumbnailUrl: "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0018.jpg",
    category: "HOSPITALS",
    date: "23-02-2026",
  },
  {
    id: "vid-ashramam-yt",
    title: "Bethany Samrakshana Ashramam Support Highlights",
    description: "Delivering monthly groceries, rice bags, academic books, and healthy food items to children and residents at Bethany Samrakshana Ashramam.",
    type: "VIDEO_YOUTUBE",
    url: "https://www.youtube.com/embed/IhcbOLPMmM8?si=tOGhSKfBExTLmAT0",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0019.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
  },
  {
    id: "vid-disabled-ashramam",
    title: "Disabled Care Ashramam Visitation",
    description: "Providing comfort kits, warm blankets, bedsheets, wheelchairs, and physical support to the residents of the Home for the Disabled.",
    type: "VIDEO_YOUTUBE",
    url: "https://www.youtube.com/embed/mE5NiqLGVSw?si=Fm7E9ViV7TL57mzi",
    thumbnailUrl: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0010.jpg",
    category: "DISABLED-ASHRAMAM",
    date: "17-06-2026",
  },
  {
    id: "vid-outreach-pnv",
    title: "Kingdom of Christ Ministries Social Service Drive",
    description: "Inspirational video log showing our team and volunteers actively involved in social service, food distribution, and community empowerment.",
    type: "VIDEO_YOUTUBE",
    url: "https://www.youtube.com/embed/pnvJ8UDfgCg?si=JWrL87G_bwZYZLS5",
    thumbnailUrl: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0018.jpg",
    category: "BETHANY-ASHRAMAM",
    date: "15-05-2026",
  },
];

const ALL_VIDEOS = [...YOUTUBE_VIDEOS, ...ALL_MP4_VIDEOS];

export default function NgoVideosPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem>(YOUTUBE_VIDEOS[0]);
  const [playlistTab, setPlaylistTab] = useState<"YOUTUBE" | "MP4">("YOUTUBE");
  const [playlistSearch, setPlaylistSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState<number>(16);
  const [copiedToast, setCopiedToast] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectAndPlayVideo = (video: VideoItem) => {
    setActiveVideo(video);
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleShareVideo = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/ngo/videos?v=${activeVideo.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  const isLocalMp4 = activeVideo.type === "VIDEO_LOCAL" || activeVideo.url.endsWith(".mp4");
  const ngoT = t.ngo || {};

  // Reset pagination limit when filters change
  const handleCategoryChange = (categoryVal: string) => {
    setFilterCategory(categoryVal);
    setDisplayLimit(16);
  };

  const handleSearchChange = (queryVal: string) => {
    setSearchQuery(queryVal);
    setDisplayLimit(16);
  };

  const handleMetricCardClick = (targetFilter: string, targetPlaylistTab?: "YOUTUBE" | "MP4") => {
    if (targetFilter === "SERVICE_WARDS") {
      if (filterCategory === "BETHANY-ASHRAMAM") {
        setFilterCategory("DISABLED-ASHRAMAM");
      } else if (filterCategory === "DISABLED-ASHRAMAM") {
        setFilterCategory("HOSPITALS");
      } else {
        setFilterCategory("BETHANY-ASHRAMAM");
      }
    } else {
      setFilterCategory(targetFilter);
    }

    if (targetPlaylistTab) {
      setPlaylistTab(targetPlaylistTab);
    }

    setDisplayLimit(16);

    if (galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Filtered list for the video library grid
  const filteredLibraryVideos = ALL_VIDEOS.filter((v) => {
    const matchesCategory =
      filterCategory === "ALL"
        ? true
        : filterCategory === "MP4_ONLY"
        ? v.type === "VIDEO_LOCAL" || v.url.endsWith(".mp4")
        : filterCategory === "YOUTUBE_ONLY"
        ? v.type === "VIDEO_YOUTUBE"
        : v.category === filterCategory;

    const matchesSearch =
      searchQuery.trim() === "" ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Items to show on gallery grid based on displayLimit
  const visibleGalleryVideos = filteredLibraryVideos.slice(0, displayLimit);

  // Filtered list for the right sidebar playlist
  const activePlaylistRaw = playlistTab === "YOUTUBE" ? YOUTUBE_VIDEOS : ALL_MP4_VIDEOS;
  const filteredPlaylistItems = activePlaylistRaw.filter((v) =>
    playlistSearch.trim() === ""
      ? true
      : v.title.toLowerCase().includes(playlistSearch.toLowerCase()) ||
        v.description.toLowerCase().includes(playlistSearch.toLowerCase())
  );

  // Helper for category badges styling
  const getCategoryBadgeStyle = (cat: string, isMp4: boolean) => {
    if (!isMp4) return "bg-rose-600 text-white shadow-rose-500/20";
    if (cat === "BETHANY-ASHRAMAM") return "bg-purple-600 text-white shadow-purple-500/20";
    if (cat === "DISABLED-ASHRAMAM") return "bg-indigo-600 text-white shadow-indigo-500/20";
    if (cat === "HOSPITALS") return "bg-emerald-600 text-white shadow-emerald-500/20";
    return "bg-slate-800 text-white";
  };

  const getCategoryLabel = (cat: string, isMp4: boolean) => {
    if (!isMp4) return "YouTube Stream";
    if (cat === "BETHANY-ASHRAMAM") return "Bethany Log";
    if (cat === "DISABLED-ASHRAMAM") return "Disabled Care";
    if (cat === "HOSPITALS") return "Hospital Log";
    return "MP4 Log";
  };

  return (
    <div className="py-6 sm:py-10 bg-slate-50/80 dark:bg-slate-950/80 min-h-screen relative">
      
      {/* Floating Share Copy Notification Toast */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span className="text-xs font-bold font-mono">Video link copied to clipboard!</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        
        {/* ========================================================================= */}
        {/* 1. HERO PAGE HEADER & METRICS DASHBOARD BAR                               */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm space-y-6 text-left">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>NGO Field Media Archives</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {ngoT.videosPage?.title || "Service Video Vault"}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed">
                Explore 97 raw MP4 field video logs from Bethany Ashramam, Home for Disabled, and Hospital outreach drives alongside official YouTube coverages.
              </p>
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full lg:w-96 flex-shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search across all 105 service videos..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-xs rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Metric Action Cards with Instant Filters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2 border-t border-slate-100 dark:border-white/5">
            
            {/* Card 1: Total Collection */}
            <button
              type="button"
              onClick={() => handleMetricCardClick("ALL")}
              className={`p-3.5 sm:p-4 rounded-2xl text-left space-y-2 transition-all duration-200 cursor-pointer shadow-sm group hover:-translate-y-0.5 hover:shadow-md ${
                filterCategory === "ALL" && !searchQuery
                  ? "bg-purple-500/10 dark:bg-purple-500/20 border-2 border-purple-500 ring-2 ring-purple-500/30"
                  : "bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-300">
                  Total Collection
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  filterCategory === "ALL" && !searchQuery
                    ? "bg-purple-600 text-white"
                    : "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white"
                }`}>
                  <MonitorPlay className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-none">105 Videos</p>
                {filterCategory === "ALL" && !searchQuery && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-600 text-white">ALL</span>
                )}
              </div>
            </button>

            {/* Card 2: Direct MP4 Logs */}
            <button
              type="button"
              onClick={() => handleMetricCardClick("MP4_ONLY", "MP4")}
              className={`p-3.5 sm:p-4 rounded-2xl text-left space-y-2 transition-all duration-200 cursor-pointer shadow-sm group hover:-translate-y-0.5 hover:shadow-md ${
                filterCategory === "MP4_ONLY"
                  ? "bg-indigo-500/10 dark:bg-indigo-500/20 border-2 border-indigo-500 ring-2 ring-indigo-500/30"
                  : "bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                  Direct MP4 Logs
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  filterCategory === "MP4_ONLY"
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white"
                }`}>
                  <Film className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-none">97 Field Logs</p>
                {filterCategory === "MP4_ONLY" && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white">MP4</span>
                )}
              </div>
            </button>

            {/* Card 3: YouTube Coverages */}
            <button
              type="button"
              onClick={() => handleMetricCardClick("YOUTUBE_ONLY", "YOUTUBE")}
              className={`p-3.5 sm:p-4 rounded-2xl text-left space-y-2 transition-all duration-200 cursor-pointer shadow-sm group hover:-translate-y-0.5 hover:shadow-md ${
                filterCategory === "YOUTUBE_ONLY"
                  ? "bg-rose-500/10 dark:bg-rose-500/20 border-2 border-rose-500 ring-2 ring-rose-500/30"
                  : "bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-500/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider leading-tight group-hover:text-rose-600 dark:group-hover:text-rose-300">
                  YouTube Coverages
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  filterCategory === "YOUTUBE_ONLY"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white"
                }`}>
                  <Video className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-none">8 Streams</p>
                {filterCategory === "YOUTUBE_ONLY" && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white">YOUTUBE</span>
                )}
              </div>
            </button>

            {/* Card 4: Service Wards */}
            <button
              type="button"
              onClick={() => handleMetricCardClick("SERVICE_WARDS")}
              className={`p-3.5 sm:p-4 rounded-2xl text-left space-y-2 transition-all duration-200 cursor-pointer shadow-sm group hover:-translate-y-0.5 hover:shadow-md ${
                ["BETHANY-ASHRAMAM", "DISABLED-ASHRAMAM", "HOSPITALS"].includes(filterCategory)
                  ? "bg-emerald-500/10 dark:bg-emerald-500/20 border-2 border-emerald-500 ring-2 ring-emerald-500/30"
                  : "bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
                  Service Wards
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  ["BETHANY-ASHRAMAM", "DISABLED-ASHRAMAM", "HOSPITALS"].includes(filterCategory)
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white"
                }`}>
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-none">5 Outreaches</p>
                {["BETHANY-ASHRAMAM", "DISABLED-ASHRAMAM", "HOSPITALS"].includes(filterCategory) && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white truncate max-w-[85px]">
                    {filterCategory === "BETHANY-ASHRAMAM" ? "Bethany" : filterCategory === "DISABLED-ASHRAMAM" ? "Disabled" : "Hospitals"}
                  </span>
                )}
              </div>
            </button>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 2. UNIFIED CINEMA THEATER PLAYER (PREMIUM SINGLE-PLAYER EXPERIENCE)      */}
        {/* ========================================================================= */}
        <section ref={playerRef} className="space-y-6 scroll-mt-24">
          
          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left: Cinema Video Player Stage (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              
              {/* Responsive 16:9 Video Display Container */}
              <div className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-950/20 dark:border-white/15 shadow-2xl bg-slate-950 flex items-center justify-center group">
                {isLocalMp4 ? (
                  <video
                    key={activeVideo.id}
                    src={activeVideo.url}
                    poster={activeVideo.thumbnailUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <iframe
                    src={activeVideo.url}
                    title={activeVideo.title}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                )}
              </div>

              {/* Active Video Meta Details Card */}
              <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 rounded-2xl sm:rounded-3xl text-left shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600"></span>
                    </span>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                      Now Playing Cinema Stage
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShareVideo}
                      className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Share Video</span>
                    </button>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                      isLocalMp4
                        ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40"
                        : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40"
                    }`}>
                      {isLocalMp4 ? `Direct MP4 (${activeVideo.fileSize || "Original Log"})` : "YouTube Stream"}
                    </span>
                    {activeVideo.date && (
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        {activeVideo.date}
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-normal leading-snug break-words">
                  {activeVideo.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {activeVideo.description}
                </p>
              </div>

            </div>

            {/* Right: Unified Cinema Playlist (4 Columns) */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
              
              {/* Playlist Header with Category Tabs */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-white/10 space-y-3 bg-slate-50/80 dark:bg-slate-800/40">
                <div className="flex items-center justify-between text-left">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      Playlist Console
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                    playlistTab === "YOUTUBE"
                      ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40"
                      : "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40"
                  }`}>
                    {playlistTab === "YOUTUBE" ? `${YOUTUBE_VIDEOS.length} YouTube` : `${ALL_MP4_VIDEOS.length} MP4`}
                  </span>
                </div>

                {/* Playlist Source Selector */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-950/60 text-xs font-bold">
                  <button
                    onClick={() => setPlaylistTab("YOUTUBE")}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      playlistTab === "YOUTUBE"
                        ? "bg-rose-600 text-white shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>8 YouTube</span>
                  </button>
                  <button
                    onClick={() => setPlaylistTab("MP4")}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      playlistTab === "MP4"
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>97 MP4 Logs</span>
                  </button>
                </div>

                {/* Playlist Quick Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Filter ${playlistTab === "YOUTUBE" ? "8 YouTube" : "97 MP4"} items...`}
                    value={playlistSearch}
                    onChange={(e) => setPlaylistSearch(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 text-[11px] rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  {playlistSearch && (
                    <button
                      onClick={() => setPlaylistSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Playlist Items */}
              <div className="overflow-y-auto divide-y divide-slate-200 dark:divide-white/5 max-h-[460px] sm:max-h-[540px] flex-1">
                {filteredPlaylistItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    No videos match your playlist search filter.
                  </div>
                ) : (
                  filteredPlaylistItems.map((vid, idx) => {
                    const isActive = activeVideo.id === vid.id;
                    return (
                      <div
                        key={vid.id}
                        onClick={() => selectAndPlayVideo(vid)}
                        className={`p-3 flex gap-3 cursor-pointer text-left transition-colors ${
                          isActive
                            ? "bg-purple-100/90 dark:bg-purple-950/50 border-l-4 border-purple-600"
                            : "hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-20 sm:w-24 aspect-video rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-200 dark:border-white/10 flex items-center justify-center group shadow-sm">
                          <img
                            src={vid.thumbnailUrl}
                            alt={vid.title}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center">
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md fill-white" />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-1 select-none flex-1 min-w-0">
                          <h4 className={`text-xs font-bold leading-snug truncate ${
                            isActive ? "text-purple-700 dark:text-purple-300 font-extrabold" : "text-slate-900 dark:text-slate-200"
                          }`}>
                            {idx + 1}. {vid.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            <span>{vid.type === "VIDEO_LOCAL" ? "MP4 Log" : "YouTube"}</span>
                            {vid.fileSize && (
                              <>
                                <span>•</span>
                                <span>{vid.fileSize}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Playlist Footer status */}
              <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 font-mono text-center">
                Click any item to load in the Cinema Player
              </div>

            </div>

          </div>

        </section>

        {/* ========================================================================= */}
        {/* 3. UNIFIED VIDEO LIBRARY & RESPONSIVE CATEGORY TABS                        */}
        {/* ========================================================================= */}
        <section ref={galleryRef} className="space-y-6 pt-6 border-t border-slate-200 dark:border-white/10 text-left scroll-mt-24">
          
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Service Video Vault Gallery</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                Showing {visibleGalleryVideos.length} of {filteredLibraryVideos.length} videos matching your filter.
              </p>
            </div>

            {/* Filter Pills Bar - Non-overflowing Responsive Wrap Grid */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {[
                { label: `All Videos (105)`, value: "ALL" },
                { label: `YouTube Highlights (8)`, value: "YOUTUBE_ONLY" },
                { label: `Direct MP4s (97)`, value: "MP4_ONLY" },
                { label: `Bethany Ashramam (30)`, value: "BETHANY-ASHRAMAM" },
                { label: `Home for Disabled (42)`, value: "DISABLED-ASHRAMAM" },
                { label: `Hospitals (25)`, value: "HOSPITALS" },
              ].map((pill) => {
                const isSelected = filterCategory === pill.value;
                return (
                  <button
                    key={pill.value}
                    onClick={() => handleCategoryChange(pill.value)}
                    className={`px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-2xl border transition-all flex-shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-purple-600 text-white border-transparent shadow-lg shadow-purple-500/25 scale-[1.02]"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Empty State when zero match */}
          {filteredLibraryVideos.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No videos found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No service videos matched "{searchQuery}". Try searching another keyword or reset filters.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterCategory("ALL");
                  setDisplayLimit(16);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <>
              {/* Responsive Card Grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {visibleGalleryVideos.map((vid, idx) => {
                  const isActive = activeVideo.id === vid.id;
                  const isMp4 = vid.type === "VIDEO_LOCAL" || vid.url.endsWith(".mp4");
                  const badgeClass = getCategoryBadgeStyle(vid.category, isMp4);
                  const badgeLabel = getCategoryLabel(vid.category, isMp4);

                  return (
                    <div
                      key={vid.id}
                      onClick={() => selectAndPlayVideo(vid)}
                      className={`group rounded-2xl sm:rounded-3xl overflow-hidden border bg-white dark:bg-slate-900 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl flex flex-col justify-between ${
                        isActive
                          ? "border-2 border-purple-600 ring-4 ring-purple-500/20 dark:border-purple-500 shadow-purple-500/10"
                          : "border-slate-200/90 dark:border-white/10 hover:border-purple-400"
                      }`}
                    >
                      <div>
                        {/* Card Thumbnail */}
                        <div className="relative aspect-video bg-black overflow-hidden">
                          <img
                            src={vid.thumbnailUrl}
                            alt={vid.title}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                          
                          {/* Play Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-colors flex items-center justify-center">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                              isActive ? "bg-purple-600" : "bg-slate-900/80 group-hover:bg-purple-600"
                            }`}>
                              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                            </div>
                          </div>

                          {/* Category Badge */}
                          <div className="absolute top-2.5 left-2.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold shadow-md backdrop-blur-md ${badgeClass}`}>
                              {badgeLabel}
                            </span>
                          </div>

                          {/* File Size or Tag */}
                          {vid.fileSize && (
                            <div className="absolute bottom-2.5 right-2.5">
                              <span className="px-2 py-0.5 rounded-full bg-slate-950/80 text-white font-mono text-[9px] font-bold backdrop-blur-md border border-white/20">
                                {vid.fileSize}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Details */}
                        <div className="p-3.5 sm:p-4 space-y-1.5 text-left">
                          <h3 className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 ${
                            isActive ? "text-purple-600 dark:text-purple-300 font-extrabold" : "text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400"
                          }`}>
                            {vid.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                            {vid.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>{vid.date || "2026 Drive"}</span>
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold group-hover:underline">
                          <span>Watch Video</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progressive Loading Controls (Load More / Show All) */}
              {filteredLibraryVideos.length > displayLimit && (
                <div className="pt-6 sm:pt-8 pb-4 flex flex-col items-center justify-center gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Showing {visibleGalleryVideos.length} of {filteredLibraryVideos.length} service videos
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                    <button
                      onClick={() => setDisplayLimit((prev) => prev + 16)}
                      className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 cursor-pointer hover:scale-105"
                    >
                      <ChevronDown className="w-4 h-4" />
                      <span>Load 16 More Videos</span>
                    </button>

                    <button
                      onClick={() => setDisplayLimit(filteredLibraryVideos.length)}
                      className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-bold transition-all cursor-pointer"
                    >
                      <span>Show All ({filteredLibraryVideos.length})</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </section>

      </div>
    </div>
  );
}
