"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  Users,
  Award,
  Calendar,
  ArrowRight,
  Loader2,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  TrendingUp,
  Building2,
  Eye,
  Gift
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  targetAmount: number | null;
  raisedAmount: number;
  status: string;
  category?: string;
  location?: string;
  beneficiaries?: string;
  createdAt: string;
}

export default function NgoProjectsPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const ngoT = t?.ngo || {};
  const projectsPage = ngoT.projectsPage || {};

  // Preset seed projects with detailed attributes
  const presetProjects: Project[] = [
    {
      id: "preset-gandhi",
      title: "Gandhi General Hospital Support",
      description: "Distributing nutritious milk food, basic medical supplies, sanitary clothes, and patient caretaker assistance kits in critical care wards.",
      imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800",
      targetAmount: null,
      raisedAmount: 0,
      status: "ACTIVE",
      category: "HOSPITAL",
      location: "Gandhi Hospital, Secunderabad",
      beneficiaries: "1,500+ Patients & Families",
      createdAt: new Date().toISOString(),
    },
    {
      id: "preset-bethany",
      title: "Bethany Samrakshana Ashramam Care",
      description: "Supporting orphan children and elders in Bethany Ashramam with monthly groceries, school supplies, clean blankets, and care assistants.",
      imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
      targetAmount: null,
      raisedAmount: 0,
      status: "ACTIVE",
      category: "ASHRAMAM",
      location: "Bethany Ashramam, Hyderabad",
      beneficiaries: "120+ Elders & Children",
      createdAt: new Date().toISOString(),
    },
    {
      id: "preset-disabled",
      title: "Home for the Disabled Ashramam Aid",
      description: "Assisting physical rehabilitation centers with wheelchairs, walkers, monthly provisions, and critical healthcare monitoring programs.",
      imageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800",
      targetAmount: null,
      raisedAmount: 0,
      status: "ACTIVE",
      category: "REHABILITATION",
      location: "Rehab Center, Jeedimetla",
      beneficiaries: "85+ Disabled Individuals",
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

  // Filtered Projects Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory =
        selectedCategory === "ALL" ||
        (p.category && p.category.toUpperCase() === selectedCategory.toUpperCase());
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  // Active campaign count
  const activeCampaigns = projects.filter((p) => p.status === "ACTIVE").length;

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* 1. Hero Section & Impact Metrics Banner */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Heart className="w-4 h-4 text-red-500 animate-pulse fill-red-500/20" />
                <span>Active Humanitarian Relief Campaigns</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-slate-900 via-slate-800 to-purple-700 dark:from-white dark:via-slate-100 dark:to-purple-300 bg-clip-text text-transparent">
                {projectsPage.title || "Social Service Projects"}
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                {projectsPage.desc || "Discover our active community initiatives and help us achieve our goals. Your support directly finances medical items, wheelchairs, food campaigns, and Ashramam expenses."}
              </p>
            </div>

            {/* Quick Action Button */}
            <Link
              href="/ngo/donations"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm whitespace-nowrap"
            >
              <Gift className="w-4 h-4" />
              <span>Donate to All Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Active Campaigns Banner */}
          {activeCampaigns > 0 && (
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 border border-purple-500/20">
              <TrendingUp className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {activeCampaigns} Active Relief Campaign{activeCampaigns !== 1 ? "s" : ""} — Your support directly helps communities in need.
              </span>
            </div>
          )}
        </div>

        {/* 2. Filter & Search Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          {/* Category Tabs */}
          <div className="w-full md:w-auto">
            {/* Mobile: 2-col grid so all 4 category names are 100% visible */}
            <div className="grid grid-cols-2 gap-2 sm:hidden w-full">
              {[
                { id: "ALL", label: "All Projects" },
                { id: "HOSPITAL", label: "Hospital Relief" },
                { id: "ASHRAMAM", label: "Ashramam Care" },
                { id: "REHABILITATION", label: "Handicap Aid" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center truncate ${
                    selectedCategory === tab.id
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20 dark:bg-purple-500"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Desktop / Tablet: horizontal row */}
            <div className="hidden sm:flex items-center gap-1.5">
              {[
                { id: "ALL", label: "All Projects" },
                { id: "HOSPITAL", label: "Hospital Relief" },
                { id: "ASHRAMAM", label: "Ashramam Care" },
                { id: "REHABILITATION", label: "Handicap Aid" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === tab.id
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20 dark:bg-purple-500"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>
        </div>

        {/* 3. Projects Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                {projectsPage.fetching || "Loading active initiatives..."}
              </p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="min-h-[30vh] flex flex-col items-center justify-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center space-y-3">
            <Filter className="w-10 h-10 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No projects found</h3>
            <p className="text-slate-500 text-xs max-w-sm">No active initiatives match your selected filter or search query.</p>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold rounded-xl text-xs hover:bg-purple-500/20 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
              const target = project.targetAmount || 0;
              const raised = project.raisedAmount || 0;
              const percent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;

              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 hover:border-purple-500/40 dark:hover:border-purple-500/40 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5"
                >
                  <div>
                    {/* Cover image & Floating Badges */}
                    <div className="relative aspect-video overflow-hidden bg-slate-950">
                      {project.imageUrl ? (
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900">
                          <Heart className="w-12 h-12" />
                        </div>
                      )}

                      {/* Status Tag */}
                      <div className="absolute top-3.5 right-3.5 bg-slate-950/80 backdrop-blur-md border border-white/20 text-amber-400 text-[10px] font-bold font-mono uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{project.status}</span>
                      </div>

                      {/* Category Pill */}
                      {project.category && (
                        <div className="absolute bottom-3.5 left-3.5 bg-purple-950/80 backdrop-blur-md border border-purple-400/30 text-purple-200 text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-md">
                          {project.category}
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-6 space-y-3.5 text-left">
                      {/* Location / Beneficiary indicator */}
                      {(project.location || project.beneficiaries) && (
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          {project.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                              <span className="truncate max-w-[160px]">{project.location}</span>
                            </span>
                          )}
                          {project.beneficiaries && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                              <span>{project.beneficiaries}</span>
                            </span>
                          )}
                        </div>
                      )}

                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors leading-snug">
                        {project.title}
                      </h3>

                      <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 space-y-5">
                    {/* Actions */}
                    <div className="space-y-2.5">
                      <div className="flex gap-2.5">
                        <Link
                          href={`/ngo/donations?project=${project.id}`}
                          className="flex-1 py-3 bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold text-center rounded-xl text-xs transition-all shadow-md shadow-purple-500/10 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span>{projectsPage.donateBtn || "Donate Now"}</span>
                        </Link>
                        
                        <Link
                          href={`/ngo/volunteers?project=${project.id}`}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold text-center rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>{projectsPage.volunteerBtn || "Volunteer"}</span>
                        </Link>
                      </div>

                      <Link
                        href={`/ngo/projects/${project.id}`}
                        className="w-full py-2 bg-purple-500/5 dark:bg-purple-500/10 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 rounded-xl text-[11px] font-bold text-center flex items-center justify-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-purple-500" />
                        <span>View Project Details & Logs</span>
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Tax Exemption & Verification Trust Footer Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-blue-500/10 dark:from-slate-900 dark:via-indigo-950/50 dark:to-slate-900 border border-purple-200/80 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-lg">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Section 80G Tax Exemption Certified</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Every Donation is Tax-Deductible & Fully Audited
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              KCM Society NGO is registered under Regd No: 206/2024 with 12A & 80G(5)(VI) approvals. Instant tax receipts are generated for all campaign donations.
            </p>
          </div>

          <Link
            href="/ngo/donations"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md text-xs whitespace-nowrap transition-all hover:scale-105"
          >
            Support Active Relief Drives
          </Link>
        </div>

      </div>
    </div>
  );
}
