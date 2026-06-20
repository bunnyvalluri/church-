"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Users, ChevronLeft, Calendar, Loader2, Image as ImageIcon } from "lucide-react";

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

export default function NgoProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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
                imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200",
                targetAmount: 150000,
                raisedAmount: 95400,
                status: "ACTIVE",
                createdAt: new Date().toISOString(),
                media: [],
                _count: { volunteers: 42 },
              },
              "preset-bethany": {
                id: "preset-bethany",
                title: "Bethany Samrakshana Ashramam Care",
                description: "Supporting orphan children and elders in Bethany Ashramam with monthly groceries, school supplies, clean blankets, and care assistants.",
                details: "Bethany Samrakshana Ashramam provides refuge to underprivileged orphan children and abandoned elders. KCM NGO services finance their primary operating costs. This includes purchasing monthly dry grocery bags (rice, wheat, pulses), school books and uniforms for the children, medical checkups for the elderly residents, and contributing toward helper salaries.",
                imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200",
                targetAmount: 200000,
                raisedAmount: 180000,
                status: "ACTIVE",
                createdAt: new Date().toISOString(),
                media: [],
                _count: { volunteers: 30 },
              },
              "preset-disabled": {
                id: "preset-disabled",
                title: "Home for the Disabled Ashramam Aid",
                description: "Assisting physical rehabilitation centers with wheelchairs, walkers, monthly provisions, and critical healthcare monitoring programs.",
                details: "We partner with local disabled rehabilitation centers to supply mobility aids. Our support covers the purchase of high-quality wheelchairs, walkers, crutches, and orthotic accessories. We also organize monthly provisions deliveries and fund visiting healthcare nurses to manage therapy, medical needs, and daily rehabilitation audits.",
                imageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1200",
                targetAmount: 300000,
                raisedAmount: 124000,
                status: "ACTIVE",
                createdAt: new Date().toISOString(),
                media: [],
                _count: { volunteers: 25 },
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
          <h2 className="text-2xl font-bold text-red-400">Error Occurred</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{errorMsg || "The project detail page could not load."}</p>
          <Link
            href="/ngo/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-white/5 rounded-xl text-xs text-white font-bold transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Projects
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
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        {/* Title */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono uppercase px-2.5 py-1 rounded-full">
              {project.status}
            </span>
            <span className="text-slate-500 text-xs flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(project.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {project.title}
          </h1>
        </div>

        {/* Banner Cover Image */}
        {project.imageUrl && (
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Progress Grid */}
        <div className="grid md:grid-cols-3 gap-6 bg-slate-900 border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
          <div className="md:col-span-2 space-y-3 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Campaign Funds Progress</span>
              <span className="text-purple-300 font-bold">{percent}% Complete</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-purple-600 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <div>
                <span className="text-white font-black text-sm">₹{raised.toLocaleString("en-IN")}</span>
                <span className="text-slate-400 text-xs"> raised</span>
              </div>
              {target > 0 && (
                <div className="text-slate-400 text-xs">
                  Goal Target: <span className="text-white font-bold">₹{target.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
            <Link
              href={`/ngo/donations?project=${project.id}`}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-center rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              Support Cause
            </Link>
            
            <Link
              href={`/ngo/volunteers?project=${project.id}`}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-white/5 font-bold text-center rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              Apply to Serve
            </Link>
          </div>
        </div>

        {/* Details Story */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Project Overview</h3>
          <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
            <p>{project.description}</p>
            <p className="whitespace-pre-line bg-slate-900/30 p-6 rounded-2xl border border-white/5 leading-loose">
              {project.details}
            </p>
          </div>
        </div>

        {/* Associated Media */}
        {project.media && project.media.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-white/5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              Campaign Media Log
            </h3>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {project.media.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-slate-900 group shadow-md"
                >
                  <img
                    src={item.url}
                    alt={item.title || "Campaign media"}
                    className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-300"
                  />
                  {item.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs font-bold text-white">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
