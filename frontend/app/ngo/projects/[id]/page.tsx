"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Users, ChevronLeft, ChevronRight, Calendar, Loader2, Image as ImageIcon, Maximize2, X } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";

interface MediaItem {
  id: string;
  title: string | null;
  url: string;
  type: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  details: string;
  imageUrl: string | null;
  targetAmount: number | null;
  raisedAmount: number;
  status: string;
  createdAt: string;
  media: MediaItem[];
  _count: { volunteers: number };
}

// Encode a URL path so parentheses and spaces are safe for browsers
function encodeSrc(src: string | null | undefined): string {
  if (!src) return "";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("//") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }
  try {
    const [path, ...queryAndHash] = src.split(/(?=[?#])/);
    const encodedPath = path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return [encodedPath, ...queryAndHash].join("");
  } catch {
    return src;
  }
}

export default function NgoProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (activeLightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setActiveLightboxIndex((prev) =>
          prev !== null && project?.media && project.media.length > 0
            ? (prev - 1 + project.media.length) % project.media.length
            : null
        );
      } else if (e.key === "ArrowRight") {
        setActiveLightboxIndex((prev) =>
          prev !== null && project?.media && project.media.length > 0
            ? (prev + 1) % project.media.length
            : null
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, project?.media]);

  const ngoT = t?.ngo || {};
  const projectsPage = ngoT.projectsPage || {};

  useEffect(() => {
    async function loadProjectDetails() {
      try {
        const res = await fetch(`/api/ngo/projects/${params.id}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProject(data.project);
        } else {
          // If preset project matches from listing fallback
          if (params.id.startsWith("preset-")) {
            const presets: Record<string, Project> = {
              "preset-gandhi": {
                id: "preset-gandhi",
                title: "Gandhi General Hospital Support",
                description: "Distributing nutritious milk food, basic medical supplies, and sanitary items to critical care wards and patient caretakers.",
                details: "Every week, KCM volunteers visit Gandhi General Hospital in Hyderabad. Our primary activities include preparing and distributing fresh food packets, sanitary clothes, warm blankets, and direct financial aid to patients in cardiac, oncology, and general medicine wards. In addition to physical supplies, we offer counseling and emotional support to patient families.",
                imageUrl: "/gandhi_hospital_support_image.png",
                targetAmount: null,
                raisedAmount: 0,
                status: "ACTIVE",
                createdAt: "2026-03-25T00:00:00.000Z",
                media: [],
                _count: { volunteers: 0 },
              },
              "preset-bethany": {
                id: "preset-bethany",
                title: "Bethany Samrakshana Ashramam Care",
                description: "Supporting orphan children and elders in Bethany Ashramam with monthly groceries, school supplies, clean blankets, and care assistants.",
                details: "Bethany Samrakshana Ashramam provides refuge to underprivileged orphan children and abandoned elders. KCM NGO services finance their primary operating costs. This includes purchasing monthly dry grocery bags (rice, wheat, pulses), school books and uniforms for the children, medical checkups for the elderly residents, and contributing toward helper salaries.",
                imageUrl: "/bethany_ashramam_care_image.png",
                targetAmount: null,
                raisedAmount: 0,
                status: "ACTIVE",
                createdAt: "2026-04-21T00:00:00.000Z",
                media: [],
                _count: { volunteers: 0 },
              },
              "preset-disabled": {
                id: "preset-disabled",
                title: "Home for the Disabled Ashramam Aid",
                description: "Assisting physical rehabilitation centers with wheelchairs, walkers, monthly provisions, and critical healthcare monitoring programs.",
                details: "We partner with local disabled rehabilitation centers to supply mobility aids. Our support covers the purchase of high-quality wheelchairs, walkers, crutches, and orthotic accessories. We also organize monthly provisions deliveries and fund visiting healthcare nurses to manage therapy, medical needs, and daily rehabilitation audits.",
                imageUrl: "/home_for_disabled_rehab_care.png",
                targetAmount: null,
                raisedAmount: 0,
                status: "ACTIVE",
                createdAt: "2026-06-17T00:00:00.000Z",
                media: [],
                _count: { volunteers: 0 },
              },
              "preset-charity": {
                id: "preset-charity",
                title: "Missionaries of Charity Bhoiguda Outreach",
                description: "Providing wholesome nutrition, clean blankets, medical care items, and emotional comfort to residents at Missionaries of Charity, Bhoiguda.",
                details: "KCM volunteers organize dedicated compassionate care drives at Missionaries of Charity in Secunderabad Bhoiguda. We supply wholesome meals, fresh milk, fruits, clean bedding, warm blankets, and personal care hygiene kits to destitute residents and patients under specialized care.",
                imageUrl: "/missionaries_of_charity_bhoiguda_outreach.png",
                targetAmount: null,
                raisedAmount: 0,
                status: "ACTIVE",
                createdAt: "2026-05-25T00:00:00.000Z",
                media: [],
                _count: { volunteers: 0 },
              },
              "preset-disabled-secunderabad": {
                id: "preset-disabled-secunderabad",
                title: "Home for the Disabled (Secunderabad) Care",
                description: "Delivering clothing, monthly groceries, blankets, and essential hygiene provisions to special needs individuals and elderly at Home for the Disabled, Secunderabad.",
                details: "Regular monthly aid drives conducted at Home for the Disabled in Secunderabad. KCM distributes warm blankets, new clothing, sanitary supplies, nutritious food packages, and physical mobility devices, ensuring residents receive dignity, compassionate fellowship, and dependable support.",
                imageUrl: "/home_for_disabled_secunderabad.jpg",
                targetAmount: null,
                raisedAmount: 0,
                status: "ACTIVE",
                createdAt: "2026-07-23T00:00:00.000Z",
                media: [],
                _count: { volunteers: 0 },
              },
              "preset-sneha-trust": {
                id: "preset-sneha-trust",
                title: "Sneha Charitable Trust - ICU Beds & Care Mission",
                description: "Donating 2 ICU beds, 2.5 KV power inverter backup system, financial support cheque, and essential nutrition for children with multiple disabilities.",
                details: "In partnership with Sneha Charitable Trust in Yalampet (Medchal District), Kingdom of Christ Ministries & NGO Society fulfills its commitment to children suffering from multiple disabilities. Bishop Kurra Kristhu Raju and society leaders personally delivered two advanced ICU beds, a 2.5 KV inverter power backup system to ensure life-saving equipment runs uninterrupted, along with financial cheque assistance and essential provisions. Over 60 children under daily care benefit directly from this mission.",
                imageUrl: "/sneha_charitable_trust_icu_beds.jpg",
                targetAmount: null,
                raisedAmount: 0,
                status: "ACTIVE",
                createdAt: "2026-10-25T00:00:00.000Z",
                media: [
                  { id: "s-m-1", title: "Daivalayam Facility, 2 ICU Beds & Inverter Unit", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/7.jpeg" },
                  { id: "s-m-2", title: "2 ICU Beds Handover & Financial Support Cheque", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/25.jpeg" },
                  { id: "s-m-3", title: "Daivalayam Family Letter of Gratitude", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/2.jpeg" },
                  { id: "s-m-4", title: "St. Camillus Ashram & Trust Road Signboard", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/1.jpeg" },
                  { id: "s-m-5", title: "Telugu Newspaper Coverage Article", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/3.jpeg" },
                  { id: "s-m-6", title: "Local Media Press Report Clipping", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/4.jpeg" },
                  { id: "s-m-7", title: "Signing Cheque on Inverter Backup Unit", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/24.jpeg" },
                  { id: "s-m-8", title: "Bishop Christu Raju TV Broadcast Address", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/11.jpeg" },
                  { id: "s-m-9", title: "Bishop Endorsing Financial Aid Cheque", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/28.jpeg" },
                  { id: "s-m-10", title: "KCM Society Team, Staff & Special Children", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/30.jpeg" },
                  { id: "s-m-11", title: "Care Event Outreach Collage 1", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/5.jpeg" },
                  { id: "s-m-12", title: "Care Event Outreach Collage 2", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/6.jpeg" },
                  { id: "s-m-13", title: "High-Dependency ICU Bed Specifications", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/47.jpeg" }
                ],
                _count: { volunteers: 52 },
              },
            };

            const preset = presets[params.id];
            if (preset) {
              setProject(preset);
              return;
            }
          }
          setErrorMsg(data.error || "Project details not found.");
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg("Failed to load project details.");
      } finally {
        setLoading(false);
      }
    }

    loadProjectDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold text-red-500 dark:text-red-400">Error Occurred</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{errorMsg || "The project detail page could not load."}</p>
          <Link
            href="/ngo/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-700 dark:text-white font-bold transition-all shadow-sm active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" /> {ngoT.projectsPage.backToProjects}
          </Link>
        </div>
      </div>
    );
  }

  const target = project.targetAmount || 0;
  const raised = project.raisedAmount || 0;
  const percent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10 text-left">
        
        {/* Back Link */}
        <Link
          href="/ngo/projects"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{ngoT.projectsPage.backToProjects}</span>
        </Link>

        {/* Title */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold">
              {project.status}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(project.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {project.title}
          </h1>
        </div>

        {/* Banner Cover Image */}
        {project.imageUrl && (
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-950">
            <img
              src={encodeSrc(project.imageUrl)}
              alt={project.title}
              className="object-cover w-full h-full"
              onError={(e) => {
                const targetEl = e.currentTarget;
                if (project.title.toLowerCase().includes("bethany")) {
                  targetEl.src = "/bethany_ashramam_care_image.png";
                } else if (project.title.toLowerCase().includes("disabled")) {
                  targetEl.src = "/home_for_disabled_rehab_care.png";
                } else {
                  targetEl.src = "/gandhi_hospital_support_image.png";
                }
              }}
            />
          </div>
        )}

        {/* Action & Verification Card (No fake numbers) */}
        {target > 0 ? (
          <div className="grid md:grid-cols-3 gap-6 bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl backdrop-blur-sm shadow-sm">
            <div className="md:col-span-2 space-y-3 flex flex-col justify-center">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">{ngoT.projectsPage.fundsProgress}</span>
                <span className="text-purple-600 dark:text-purple-300 font-bold">{percent}% {ngoT.projectsPage.completeLabel}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-purple-600 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <div>
                  <span className="text-slate-900 dark:text-white font-black text-sm">₹{raised.toLocaleString("en-IN")}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs"> {ngoT.projectsPage.raised}</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-xs">
                  {ngoT.projectsPage.goalTarget} <span className="text-slate-900 dark:text-white font-bold">₹{target.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="flex md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/5 pt-4 md:pt-0 md:pl-6">
              <Link
                href={`/ngo/donations?project=${project.id}`}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-center rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md active:scale-95"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                {ngoT.projectsPage.supportCause}
              </Link>
              <Link
                href={`/ngo/volunteers?project=${project.id}`}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 font-bold text-center rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Users className="w-3.5 h-3.5" />
                {ngoT.projectsPage.applyServe}
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-slate-100/50 dark:from-slate-900/90 dark:via-purple-950/20 dark:to-slate-900/90 border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm">
            <div className="space-y-1.5 text-left max-w-lg">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Verified Humanitarian Care Initiative</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Direct Field Relief & Care Sponsorship
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                100% of your contributions go directly to patient care, critical equipment, nutrition, and essential provisions under KCM NGO Society (80G Tax-Deductible).
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
              <Link
                href={`/ngo/donations?project=${project.id}`}
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold text-center rounded-xl text-xs transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>{ngoT.projectsPage.supportCause || "Support This Initiative"}</span>
              </Link>
              <Link
                href={`/ngo/volunteers?project=${project.id}`}
                className="flex-1 sm:flex-none px-5 py-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 font-bold text-center rounded-xl text-xs transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
              >
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{ngoT.projectsPage.applyServe || "Volunteer"}</span>
              </Link>
            </div>
          </div>
        )}

        {/* Details Story */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{ngoT.projectsPage.overview}</h3>
          <div className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
            <p>{project.description}</p>
            <p className="whitespace-pre-line bg-white/60 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-200 dark:border-white/5 leading-loose">
              {project.details}
            </p>
          </div>
        </div>

        {/* Associated Media */}
        {project.media && project.media.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-white/5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                {ngoT.projectsPage.mediaLog}
              </h3>
              <span className="text-xs font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full font-semibold">
                {project.media.length} items • Click any image to view in full size
              </span>
            </div>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {project.media.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setActiveLightboxIndex(idx)}
                  className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/10 bg-slate-950 group shadow-md hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                  title="Click to view full image"
                >
                  {/* Ambient blurred backdrop so portrait/document images fill the frame gorgeously without black voids */}
                  <img
                    src={encodeSrc(item.url)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-125 pointer-events-none select-none"
                  />

                  {/* Foreground image - 100% visible and uncropped! */}
                  <img
                    src={encodeSrc(item.url)}
                    alt={item.title || "Campaign media"}
                    className="relative z-10 w-full h-full object-contain p-1.5 group-hover:scale-[1.03] transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/ngo_outreach_drive_thumbnail.png";
                    }}
                  />

                  {/* Expand icon pill on hover */}
                  <div className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Maximize2 className="w-3 h-3" />
                    <span>Expand</span>
                  </div>

                  {/* Caption overlay */}
                  {item.title && (
                    <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-3 pt-6 pointer-events-none">
                      <p className="text-xs font-semibold text-white truncate drop-shadow-sm">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fullscreen Interactive Lightbox Modal */}
        {activeLightboxIndex !== null && project.media && project.media[activeLightboxIndex] && (
          <div
            className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
            onClick={() => setActiveLightboxIndex(null)}
          >
            {/* Top Toolbar */}
            <div
              className="w-full flex items-center justify-between text-white z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-xs sm:text-sm font-medium text-slate-300">
                <span className="font-bold text-white">{activeLightboxIndex + 1}</span> of{" "}
                <span className="text-slate-400">{project.media.length}</span>
                {project.media[activeLightboxIndex].title && (
                  <span className="ml-3 hidden sm:inline text-white font-semibold">
                    • {project.media[activeLightboxIndex].title}
                  </span>
                )}
              </div>
              <button
                onClick={() => setActiveLightboxIndex(null)}
                aria-label="Close image viewer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image Display with Left/Right Navigation */}
            <div
              className="relative flex-1 w-full flex items-center justify-center my-2 max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous Button */}
              {project.media.length > 1 && (
                <button
                  onClick={() =>
                    setActiveLightboxIndex(
                      (activeLightboxIndex - 1 + project.media.length) % project.media.length
                    )
                  }
                  aria-label="Previous image"
                  className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Full Image */}
              <img
                src={encodeSrc(project.media[activeLightboxIndex].url)}
                alt={project.media[activeLightboxIndex].title || "Campaign media"}
                className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-2xl transition-all select-none"
              />

              {/* Next Button */}
              {project.media.length > 1 && (
                <button
                  onClick={() =>
                    setActiveLightboxIndex((activeLightboxIndex + 1) % project.media.length)
                  }
                  aria-label="Next image"
                  className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Caption */}
            <div
              className="w-full text-center py-2 text-xs sm:text-sm text-slate-300 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-semibold text-white drop-shadow-md">
                {project.media[activeLightboxIndex].title}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Use Left / Right arrow keys to navigate • Esc to close</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
