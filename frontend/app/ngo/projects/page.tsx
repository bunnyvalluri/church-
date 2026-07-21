"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, DollarSign, Users, Award, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  targetAmount: number | null;
  raisedAmount: number;
  status: string;
  createdAt: string;
}

export default function NgoProjectsPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ngoT = t.ngo; // LanguageProvider guards t to en before mount � no double-guard needed

  // Fallback / seed projects in case DB is empty on first load
  const presetProjects: Project[] = [
    {
      id: "preset-gandhi",
      title: "Gandhi General Hospital Support",
      description: "Distributing nutritious milk food, basic medical supplies, and sanitary items to critical care wards and patient caretakers.",
      imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800",
      targetAmount: 150000,
      raisedAmount: 95400,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    },
    {
      id: "preset-bethany",
      title: "Bethany Samrakshana Ashramam Care",
      description: "Supporting orphan children and elders in Bethany Ashramam with monthly groceries, school supplies, clean blankets, and care assistants.",
      imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
      targetAmount: 200000,
      raisedAmount: 180000,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    },
    {
      id: "preset-disabled",
      title: "Home for the Disabled Ashramam Aid",
      description: "Assisting physical rehabilitation centers with wheelchairs, walkers, monthly provisions, and critical healthcare monitoring programs.",
      imageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800",
      targetAmount: 300000,
      raisedAmount: 124000,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/ngo/projects");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.projects.length > 0) {
            setProjects(data.projects);
          } else {
            setProjects(presetProjects);
          }
        } else {
          setProjects(presetProjects);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
        setProjects(presetProjects);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="space-y-4 max-w-2xl text-left">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-purple-600 dark:from-white dark:to-purple-400 bg-clip-text text-transparent">
            {ngoT.projectsPage.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {ngoT.projectsPage.desc}
          </p>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">{ngoT.projectsPage.fetching}</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              const target = project.targetAmount || 0;
              const raised = project.raisedAmount || 0;
              const percent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;
              
              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-purple-500/25 dark:hover:border-white/10 rounded-3xl overflow-hidden shadow-lg dark:shadow-2xl flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1"
                >
                  <div>
                    {/* Cover image */}
                    <div className="relative aspect-video overflow-hidden bg-slate-950">
                      {project.imageUrl ? (
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-750"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900">
                          <Heart className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-slate-950/70 border border-white/10 text-slate-200 text-[10px] font-mono uppercase px-2.5 py-1 rounded-full backdrop-blur-md">
                        {project.status}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {project.title}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 space-y-6">
                    {/* Target progress */}
                    {target > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-500">{ngoT.projectsPage.progressLabel}</span>
                          <span className="text-purple-600 dark:text-purple-300">{percent}% {ngoT.projectsPage.completeLabel}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-purple-600 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <div>
                            <span className="text-slate-800 dark:text-slate-200 font-bold">₹{raised.toLocaleString("en-IN")}</span>
                            <span className="text-slate-500"> {ngoT.projectsPage.raised}</span>
                          </div>
                          <div className="text-slate-500">
                            {ngoT.projectsPage.target} <span className="font-bold text-slate-800 dark:text-slate-300">₹{target.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Link
                        href={`/ngo/donations?project=${project.id}`}
                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-center rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        {ngoT.projectsPage.donateBtn}
                      </Link>
                      
                      <Link
                        href={`/ngo/volunteers?project=${project.id}`}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/5 font-bold text-center rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        {ngoT.projectsPage.volunteerBtn}
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
