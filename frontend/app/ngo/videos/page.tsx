"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Film, X, ChevronLeft, ChevronRight, Play,
  Youtube, PlayCircle, Calendar, Maximize2,
  ListVideo, Clapperboard, Sparkles, Clock,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface VideoItem {
  id: string; title: string; description: string; type: string; url: string; thumbnailUrl: string;
}
interface Mp4VideoItem {
  id: string; title: string; src: string; thumbnail: string;
}

const PRESET_VIDEOS: VideoItem[] = [
  { id:"vid-gandhi-new",         title:"Gandhi Hospital Food & Care Outreach",
    description:"Detailed video coverage of KCM volunteers distributing warm milk, food boxes, and basic sanitary kits to patient caretakers and critical care wards at Gandhi Hospital.",
    type:"VIDEO_YOUTUBE", url:"https://www.youtube.com/embed/cugBnrzyPF4?si=JRM4VEcma5_hRW8r",
    thumbnailUrl:"/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0031.jpg" },
  { id:"vid-nims-new",           title:"NIMS Hospital Care & Support Campaign",
    description:"Watch our volunteers distribute specialized medications, patient clothes, and nutritional foods to patients in the oncology and orthopedic departments at NIMS.",
    type:"VIDEO_YOUTUBE", url:"https://www.youtube.com/embed/y7gLEkS9CcI?si=YRzU4aaeORdjaGLw",
    thumbnailUrl:"/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0037.jpg" },
  { id:"vid-govt-new",           title:"Government General Hospital Distribution Drive",
    description:"Direct footage showing wheelchair provisions, walkers, patient beds, and food packet distribution drives organized at the local government hospital.",
    type:"VIDEO_YOUTUBE", url:"https://www.youtube.com/embed/u4-lrU41HAc?si=vgAb5MnRZhG2Awwd",
    thumbnailUrl:"/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0018.jpg" },
  { id:"vid-ashramam",           title:"Bethany Samrakshana Ashramam Support",
    description:"Delivering monthly groceries, rice bags, academic books, and healthy food items to children and residents at Bethany Samrakshana Ashramam.",
    type:"VIDEO_YOUTUBE", url:"https://www.youtube.com/embed/IhcbOLPMmM8?si=tOGhSKfBExTLmAT0",
    thumbnailUrl:"/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0013.jpg" },
  { id:"vid-disabled-ashramam",  title:"Disabled Care Ashramam Visitation",
    description:"Providing comfort kits, warm blankets, bedsheets, wheelchairs, and physical support to the residents of the Home for the Disabled.",
    type:"VIDEO_YOUTUBE", url:"https://www.youtube.com/embed/mE5NiqLGVSw?si=Fm7E9ViV7TL57mzi",
    thumbnailUrl:"/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0010.jpg" },
];

const BASE = "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)";
const BETHANY_MP4_VIDEOS: Mp4VideoItem[] = [
  { id:"1",  title:"Bethany Ashramam – Clip 1",         src:`${BASE}/VID-20260515-WA0036.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0018.jpg` },
  { id:"2",  title:"Bethany Ashramam – Clip 2",         src:`${BASE}/VID-20260515-WA0037.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0019.jpg` },
  { id:"3",  title:"Bethany Ashramam – Clip 3",         src:`${BASE}/VID-20260515-WA0039.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0020.jpg` },
  { id:"4",  title:"Bethany Ashramam – Clip 4",         src:`${BASE}/VID-20260515-WA0041.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0021.jpg` },
  { id:"5",  title:"Bethany Ashramam – Clip 5",         src:`${BASE}/VID-20260515-WA0042.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0022.jpg` },
  { id:"6",  title:"Bethany Ashramam – Clip 6",         src:`${BASE}/VID-20260515-WA0044.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0023.jpg` },
  { id:"7",  title:"Bethany Ashramam – Clip 7",         src:`${BASE}/VID-20260515-WA0046.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0024.jpg` },
  { id:"8",  title:"Bethany Ashramam – Clip 8",         src:`${BASE}/VID-20260515-WA0047.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0025.jpg` },
  { id:"9",  title:"Bethany Ashramam – Clip 9",         src:`${BASE}/VID-20260515-WA0050.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0026.jpg` },
  { id:"10", title:"Bethany Ashramam – Clip 10",        src:`${BASE}/VID-20260515-WA0052.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0027.jpg` },
  { id:"11", title:"Bethany Ashramam – Clip 11",        src:`${BASE}/VID-20260515-WA0056.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0028.jpg` },
  { id:"12", title:"Bethany Ashramam – Clip 12",        src:`${BASE}/VID-20260515-WA0057.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0029.jpg` },
  { id:"13", title:"Bethany Ashramam – Clip 13",        src:`${BASE}/VID-20260515-WA0058.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0030.jpg` },
  { id:"14", title:"Bethany Ashramam – Clip 14",        src:`${BASE}/VID-20260515-WA0059.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0031.jpg` },
  { id:"15", title:"Bethany Ashramam – Clip 15",        src:`${BASE}/VID-20260515-WA0060.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0032.jpg` },
  { id:"16", title:"Bethany Ashramam – Clip 16",        src:`${BASE}/VID-20260515-WA0256.mp4`, thumbnail:`${BASE}/IMG-20260515-WA0033.jpg` },
  { id:"17", title:"Full Coverage – Morning Session",   src:`${BASE}/VN20260515_162903.mp4`,   thumbnail:`${BASE}/IMG-20260515-WA0034.jpg` },
  { id:"18", title:"Full Coverage – Afternoon Session", src:`${BASE}/VN20260515_165016.mp4`,   thumbnail:`${BASE}/IMG-20260515-WA0035.jpg` },
  { id:"19", title:"Full Coverage – Evening Session",   src:`${BASE}/VN20260515_165757.mp4`,   thumbnail:`${BASE}/IMG-20260515-WA0038.jpg` },
];

/* ══════════════════════════════════ LIGHTBOX ══════════════════════════════════ */
function Lightbox({ videos, index, onClose, onPrev, onNext, onJump }: {
  videos: Mp4VideoItem[]; index: number;
  onClose:()=>void; onPrev:()=>void; onNext:()=>void; onJump:(i:number)=>void;
}) {
  const [mounted, setMounted] = useState(false);
  const vRef = useRef<HTMLVideoElement>(null);
  const sRef = useRef<HTMLDivElement>(null);
  const vid  = videos[index];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const h = (e: KeyboardEvent) => {
      if (e.key==="Escape") onClose();
      if (e.key==="ArrowLeft") onPrev();
      if (e.key==="ArrowRight") onNext();
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [mounted, onClose, onPrev, onNext]);

  useEffect(() => {
    if (!mounted) return;
    vRef.current?.load(); vRef.current?.play().catch(()=>{});
    (sRef.current?.children[index] as HTMLElement)?.scrollIntoView({ inline:"center", behavior:"smooth" });
  }, [index, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] w-screen h-screen bg-black/98 backdrop-blur-xl flex flex-col select-none overflow-hidden"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* ── top header bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-slate-950/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
            <Film className="w-4 h-4 text-white" />
          </span>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate leading-snug">{vid.title}</p>
            <p className="text-slate-400 text-xs leading-none mt-0.5">
              Clip {index+1} of {videos.length} · Bethany Samrakshana Ashramam · 15 May 2026
            </p>
          </div>
        </div>
        <button onClick={onClose} title="Close (Esc)"
          className="flex-shrink-0 ml-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all flex items-center justify-center border border-white/10 shadow-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── main video stage ── */}
      <div className="flex-1 relative flex items-center justify-center px-4 sm:px-16 py-4 min-h-0 bg-black/80">
        <video ref={vRef} src={vid.src} controls autoPlay
          className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain bg-black" />

        {/* ── navigation arrows ── */}
        {index > 0 && (
          <button onClick={onPrev} title="Previous (←)"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center
              bg-black/70 hover:bg-emerald-600 border border-white/20 text-white transition-all duration-200 hover:scale-110 shadow-2xl z-10">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {index < videos.length-1 && (
          <button onClick={onNext} title="Next (→)"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center
              bg-black/70 hover:bg-emerald-600 border border-white/20 text-white transition-all duration-200 hover:scale-110 shadow-2xl z-10">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* ── bottom film strip ── */}
      <div className="flex-shrink-0 border-t border-white/10 px-6 py-3 bg-slate-950/90 backdrop-blur-md z-10">
        <div ref={sRef} className="flex gap-2.5 overflow-x-auto py-1 items-center" style={{ scrollbarWidth:"none" }}>
          {videos.map((v, i) => (
            <button key={v.id} onClick={() => onJump(i)}
              className={`relative flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                i===index
                  ? "border-emerald-400 scale-105 ring-4 ring-emerald-500/30 shadow-xl shadow-emerald-500/20 opacity-100"
                  : "border-transparent opacity-40 hover:opacity-80 hover:scale-102"
              }`} style={{ width:76, aspectRatio:"16/9" }}>
              <img src={v.thumbnail} alt="" className="w-full h-full object-cover" />
              {i===index && (
                <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-white drop-shadow-md" />
                </div>
              )}
              <span className="absolute bottom-1 right-1 text-[9px] text-white font-extrabold bg-black/70 px-1 rounded leading-none tabular-nums">
                {i+1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ══════════════════════════════ MP4 THUMBNAIL CARD ════════════════════════════ */
function Mp4Thumb({ video, n, featured=false, onClick }: {
  video: Mp4VideoItem; n: number; featured?: boolean; onClick: ()=>void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      onClick={onClick}
      className={`group relative w-full text-left overflow-hidden rounded-2xl
        bg-slate-100 dark:bg-slate-800
        border border-slate-200/70 dark:border-slate-700/40
        shadow-sm hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/40
        transition-all duration-300 hover:-translate-y-1
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500`}>
      {/* thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio:"16/9" }}>
        <img src={video.thumbnail} alt={video.title} loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ${hov ? "scale-108" : "scale-100"}`} />

        {/* gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        {/* subtle top vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

        {/* play ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`flex items-center justify-center rounded-full border-2 border-white/40 transition-all duration-300 shadow-2xl
            ${hov
              ? "bg-gradient-to-br from-violet-600 to-purple-700 border-violet-400 scale-110 shadow-violet-500/50"
              : "bg-black/40 backdrop-blur-sm scale-100"}
            ${featured ? "w-16 h-16" : "w-11 h-11"}`}>
            <Play className={`text-white ml-0.5 ${featured ? "w-7 h-7" : "w-4 h-4"}`} />
          </div>
        </div>

        {/* badges */}
        <span className="absolute top-2.5 left-2.5 inline-flex items-center justify-center
          w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm
          text-white text-[10px] font-black border border-white/15 tabular-nums">
          {n}
        </span>
        <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-0.5
          bg-gradient-to-r from-emerald-500 to-teal-500 text-white
          text-[9px] font-extrabold px-1.5 py-0.5 rounded-lg shadow tracking-wide">
          <Film className="w-2.5 h-2.5" />MP4
        </span>

        {/* title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-8">
          <p className={`text-white font-bold leading-snug drop-shadow-md line-clamp-1 ${featured ? "text-sm" : "text-[11px]"}`}>
            {video.title}
          </p>
          <p className="text-white/45 text-[9px] mt-0.5 font-medium tracking-wide">15 MAY 2026</p>
        </div>
      </div>
    </button>
  );
}

/* ════════════════════════════ YOUTUBE PLAYLIST ITEM ═══════════════════════════ */
function PlaylistRow({ vid, idx, active, onSelect }: {
  vid: VideoItem; idx: number; active: boolean; onSelect: ()=>void;
}) {
  return (
    <button onClick={onSelect}
      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl mx-2 text-left transition-all duration-150 ${
        active
          ? "bg-violet-600 shadow-lg shadow-violet-500/25"
          : "hover:bg-slate-100 dark:hover:bg-slate-800/70"
      }`} style={{ width:"calc(100% - 16px)" }}>
      <div className="relative flex-shrink-0 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700"
        style={{ width:90, aspectRatio:"16/9" }}>
        <img src={vid.thumbnailUrl} alt={vid.title}
          className="w-full h-full object-cover"
          onError={e=>{ e.currentTarget.src=PRESET_VIDEOS[idx%PRESET_VIDEOS.length].thumbnailUrl; }} />
        <div className={`absolute inset-0 flex items-center justify-center transition-colors ${active?"bg-black/20":"bg-black/35"}`}>
          {active
            ? <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center"><Play className="w-3.5 h-3.5 text-white ml-0.5" /></div>
            : <PlayCircle className="w-6 h-6 text-white/80" />}
        </div>
      </div>
      <div className="flex-1 min-w-0 pt-0.5 space-y-1">
        <p className={`text-[12px] font-semibold leading-snug line-clamp-2 ${active?"text-white":"text-slate-800 dark:text-slate-100"}`}>
          {vid.title}
        </p>
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${active?"text-violet-200":"text-slate-400 dark:text-slate-500"}`}>
          <Youtube className={`w-3 h-3 ${active?"text-white/70":"text-red-500"}`} />YouTube
        </span>
      </div>
    </button>
  );
}

/* ══════════════════════════════════ MAIN PAGE ═════════════════════════════════ */
export default function NgoVideosPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"mp4"|"yt">("mp4");
  const [videos, setVideos] = useState<VideoItem[]>(PRESET_VIDEOS);
  const [playing, setPlaying] = useState<VideoItem>(PRESET_VIDEOS[0]);
  const [lbIdx, setLbIdx] = useState<number|null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/ngo/media?type=VIDEO_YOUTUBE");
        if (!r.ok) return;
        const d = await r.json();
        if (d.success && d.media?.length) {
          const db = d.media.map((x:any,i:number)=>({ id:x.id, title:x.title||"Video Log",
            description:x.description||"", type:x.type, url:x.url,
            thumbnailUrl:x.thumbnailUrl||PRESET_VIDEOS[i%PRESET_VIDEOS.length].thumbnailUrl }));
          setVideos(p=>{ const s=new Set(p.map(v=>v.id)); return [...p,...db.filter((v:VideoItem)=>!s.has(v.id))]; });
        }
      } catch {}
    })();
  }, []);

  const ngoT = (t as any).ngo || {};
  const [hero, ...rest] = BETHANY_MP4_VIDEOS;
  const sideGrid = rest.slice(0, 6);
  const bottomGrid = rest.slice(6);

  return (
    <div className="bg-white dark:bg-slate-950">

      {/* ══════════════════════════ HEADER ══════════════════════════════════ */}
      <div className="relative overflow-hidden
        bg-gradient-to-br from-violet-50 via-white to-purple-50/60
        dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/40
        border-b border-slate-200/80 dark:border-slate-800">

        {/* decorative blobs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-purple-500/8 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-9 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">

            {/* left: title */}
            <div className="space-y-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                bg-violet-100 dark:bg-violet-500/12
                border border-violet-200 dark:border-violet-500/25
                text-violet-700 dark:text-violet-400
                text-[11px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />Video Archive
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight
                text-slate-900 dark:text-white leading-tight">
                Service Video Logs
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-lg">
                {ngoT.videosPage?.desc || "Authentic video documentation of KCM outreach — hospital drives, Ashramam visits, and community relief programs."}
              </p>
            </div>

            {/* right: stat cards */}
            <div className="flex gap-3 flex-shrink-0">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl
                bg-white dark:bg-slate-800/80
                border border-slate-200 dark:border-slate-700/60
                shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Film className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{BETHANY_MP4_VIDEOS.length}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide mt-0.5">MP4 clips</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl
                bg-white dark:bg-slate-800/80
                border border-slate-200 dark:border-slate-700/60
                shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <Youtube className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{videos.length}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide mt-0.5">YouTube</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tab switcher ── */}
          <div className="flex items-center gap-2">
            {/* MP4 tab */}
            <button onClick={() => setTab("mp4")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-2xl border-x border-t text-sm font-bold transition-all duration-200 ${
                tab==="mp4"
                  ? "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white -mb-px pb-[11px]"
                  : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/40"
              }`}>
              <Film className={`w-4 h-4 ${tab==="mp4"?"text-emerald-500":""}`} />
              {BETHANY_MP4_VIDEOS.length} MP4 Logs
              {tab==="mp4" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />}
            </button>

            {/* YouTube tab */}
            <button onClick={() => setTab("yt")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-2xl border-x border-t text-sm font-bold transition-all duration-200 ${
                tab==="yt"
                  ? "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white -mb-px pb-[11px]"
                  : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/40"
              }`}>
              <Youtube className={`w-4 h-4 ${tab==="yt"?"text-rose-500":""}`} />
              {videos.length} YouTube
              {tab==="yt" && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════ TAB CONTENT ══════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {/* ──────────── MP4 TAB ────────────────────────────────────────── */}
        {tab==="mp4" && (
          <div className="space-y-6">

            {/* location info strip */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3
              px-5 py-4 rounded-2xl
              bg-gradient-to-r from-emerald-50 to-teal-50/60
              dark:from-emerald-500/8 dark:to-teal-500/5
              border border-emerald-200/70 dark:border-emerald-500/20">
              <div className="flex items-center gap-3.5">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
                  <Clapperboard className="w-5 h-5 text-white" />
                </span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Bethany Samrakshana Ashramam</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    15 May 2026 · Service Visit · {BETHANY_MP4_VIDEOS.length} clips
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Maximize2 className="w-3.5 h-3.5 flex-shrink-0" />
                Click any clip to play fullscreen · ← → to navigate
              </div>
            </div>

            {/* ── Feature layout: big hero left + 2×3 right ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* hero clip */}
              <div className="lg:col-span-5">
                <Mp4Thumb video={hero} n={1} featured onClick={() => setLbIdx(0)} />
              </div>
              {/* side 2×3 */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sideGrid.map((v, i) => (
                  <Mp4Thumb key={v.id} video={v} n={i+2} onClick={() => setLbIdx(i+1)} />
                ))}
              </div>
            </div>

            {/* ── Remaining clips ── */}
            {bottomGrid.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap px-1">
                    Clips 8 – {BETHANY_MP4_VIDEOS.length}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-l from-slate-200 dark:from-slate-800 to-transparent" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {bottomGrid.map((v, i) => (
                    <Mp4Thumb key={v.id} video={v} n={i+8} onClick={() => setLbIdx(i+7)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──────────── YOUTUBE TAB ────────────────────────────────────── */}
        {tab==="yt" && (
          <div className="grid lg:grid-cols-12 gap-5 items-start">

            {/* ── LEFT: player + now-playing ── */}
            <div className="lg:col-span-8 space-y-4">
              {/* player */}
              <div className="relative rounded-2xl overflow-hidden bg-black
                border border-slate-200 dark:border-slate-800
                shadow-xl shadow-slate-900/10 dark:shadow-black/30"
                style={{ aspectRatio:"16/9" }}>
                <iframe key={playing.id} src={playing.url} title={playing.title}
                  className="absolute inset-0 w-full h-full" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
              </div>

              {/* now-playing */}
              <div className="bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-800
                rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-rose-600 dark:text-rose-400 text-[10px] font-extrabold uppercase tracking-widest">
                          Now Playing
                        </span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                        <Youtube className="w-3 h-3 text-rose-500" />YouTube
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                      {playing.title}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">
                      {playing.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: split panel ── */}
            <div className="lg:col-span-4 flex flex-col gap-3">

              {/* ─ YouTube playlist ─ */}
              <div className="bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-800
                rounded-2xl overflow-hidden shadow-sm flex flex-col"
                style={{ maxHeight:320 }}>
                {/* header */}
                <div className="flex items-center justify-between px-4 py-3
                  border-b border-slate-100 dark:border-slate-800
                  bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900
                  flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <ListVideo className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200">
                      Service Playlist
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full
                    bg-violet-100 dark:bg-violet-500/15
                    text-violet-700 dark:text-violet-400
                    border border-violet-200 dark:border-violet-500/20">
                    {videos.length} videos
                  </span>
                </div>
                {/* scrollable list */}
                <div className="overflow-y-auto flex-1 py-2 space-y-0.5">
                  {videos.map((v, i) => (
                    <PlaylistRow key={v.id} vid={v} idx={i}
                      active={playing.id===v.id}
                      onSelect={()=>setPlaying(v)} />
                  ))}
                </div>
              </div>

              {/* ─ Bethany Ashramam MP4 clips ─ */}
              <div className="bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-800
                rounded-2xl overflow-hidden shadow-sm flex flex-col"
                style={{ maxHeight:360 }}>
                {/* header */}
                <div className="flex items-center justify-between px-4 py-3
                  border-b border-slate-100 dark:border-slate-800
                  bg-gradient-to-r from-emerald-50/60 to-white dark:from-emerald-500/6 dark:to-slate-900
                  flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600
                      flex items-center justify-center shadow-sm shadow-emerald-500/30">
                      <Film className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
                        Bethany Ashramam
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-1 leading-tight">
                        <Calendar className="w-2.5 h-2.5" />15 May 2026
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full
                    bg-emerald-100 dark:bg-emerald-500/15
                    text-emerald-700 dark:text-emerald-400
                    border border-emerald-200 dark:border-emerald-500/20">
                    {BETHANY_MP4_VIDEOS.length} clips
                  </span>
                </div>
                {/* scrollable 2-col grid */}
                <div className="overflow-y-auto flex-1 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {BETHANY_MP4_VIDEOS.map((v, i) => (
                      <button key={v.id} onClick={() => setLbIdx(i)}
                        className="group relative overflow-hidden rounded-xl
                          border border-slate-200 dark:border-slate-700/50
                          bg-slate-100 dark:bg-slate-800
                          hover:border-emerald-400/70 dark:hover:border-emerald-500/60
                          hover:-translate-y-0.5 hover:shadow-md
                          transition-all duration-200
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        style={{ aspectRatio:"16/9" }}>
                        <img src={v.thumbnail} alt={v.title} loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-black/40 border border-white/25
                            group-hover:bg-emerald-500 group-hover:border-emerald-400
                            transition-all duration-200 flex items-center justify-center shadow">
                            <Play className="w-3 h-3 text-white ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute top-1 left-1 text-[8px] font-black text-white/75 bg-black/50 px-1 py-px rounded tabular-nums">
                          {String(i+1).padStart(2,"0")}
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 px-1.5 pb-1">
                          <p className="text-white text-[9px] font-semibold leading-tight line-clamp-1 drop-shadow">
                            {v.title}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-[9px] text-slate-400 dark:text-slate-600 mt-2.5 pb-0.5">
                    Click any clip · use ← → in fullscreen
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* lightbox */}
      {lbIdx !== null && (
        <Lightbox
          videos={BETHANY_MP4_VIDEOS}
          index={lbIdx}
          onClose={() => setLbIdx(null)}
          onPrev={() => setLbIdx(i => (i!==null&&i>0 ? i-1 : i))}
          onNext={() => setLbIdx(i => (i!==null&&i<BETHANY_MP4_VIDEOS.length-1 ? i+1 : i))}
          onJump={i => setLbIdx(i)}
        />
      )}
    </div>
  );
}
