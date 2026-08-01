'use client';

import React, { useState, useEffect } from 'react';
import { SermonResearchView } from '@/components/agents/SermonResearchView';
import { ChurchNewsDashboardView } from '@/components/agents/ChurchNewsDashboardView';
import { EventInspirationView } from '@/components/agents/EventInspirationView';
import { SocialContentView } from '@/components/agents/SocialContentView';
import { DeveloperSupportView } from '@/components/agents/DeveloperSupportView';
import { fetchAgentTaskHistory, AgentTask } from '@/lib/agentReachClient';
import {
  BookOpen,
  Newspaper,
  Calendar,
  Share2,
  Code2,
  Sparkles,
  History,
  Clock,
  CheckCircle2,
  Globe2,
  ChevronRight
} from 'lucide-react';

export default function AdminAgentsPage() {
  const [activeTab, setActiveTab] = useState<'sermon' | 'news' | 'event' | 'social' | 'dev'>('sermon');
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);

  const loadHistory = async () => {
    try {
      const res = await fetchAgentTaskHistory();
      if (res.tasks) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.warn('Failed to load agent history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [activeTab]);

  const tabs = [
    { id: 'sermon', name: 'Sermon Research', icon: BookOpen, color: 'text-indigo-400', border: 'border-indigo-500' },
    { id: 'news', name: 'Church News', icon: Newspaper, color: 'text-emerald-400', border: 'border-emerald-500' },
    { id: 'event', name: 'Event Inspiration', icon: Calendar, color: 'text-amber-400', border: 'border-amber-500' },
    { id: 'social', name: 'Social Content', icon: Share2, color: 'text-pink-400', border: 'border-pink-500' },
    { id: 'dev', name: 'Developer Support', icon: Code2, color: 'text-cyan-400', border: 'border-cyan-500' }
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">
              <Globe2 className="w-4 h-4" /> Agent Reach Internet Intelligence Platform
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              KCM Church AI Agents
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1 max-w-2xl">
              Multi-source web intelligence, live scraping, Cloudinary visual media analysis, and automated content workflows for Kingdom of Christ Ministries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/admin/firecrawl-intelligence"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-950 font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-lg"
            >
              <Sparkles className="w-4 h-4" /> Firecrawl Intelligence Hub
            </a>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-md"
            >
              <History className="w-4 h-4 text-cyan-400" />
              {showHistory ? 'Hide History' : 'Task History Log'}
              <span className="bg-slate-800 text-cyan-400 text-xs px-2 py-0.5 rounded-full">{tasks.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Task History Drawer / Modal overlay */}
      {showHistory && (
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" /> Recent Intelligence Tasks Log (Neon DB)
            </h3>
            <button onClick={() => setShowHistory(false)} className="text-xs text-slate-400 hover:text-slate-200">
              Close Drawer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-500 col-span-3 py-4 text-center">No tasks executed yet.</p>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className={`p-3 bg-slate-950/80 border rounded-xl cursor-pointer transition ${
                    selectedTask?.id === t.id ? 'border-cyan-500' : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-cyan-400 font-semibold">{t.agentType}</span>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> {t.status}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-200 truncate">{t.query}</div>
                  <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(t.createdAt).toLocaleTimeString()}</span>
                    <span>{t.sources?.length || 0} Sources</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedTask && (
            <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-cyan-400">{selectedTask.query}</h4>
                <button onClick={() => setSelectedTask(null)} className="text-xs text-slate-500 hover:text-slate-300">
                  Close Detail
                </button>
              </div>
              <div className="prose prose-invert max-w-none text-xs text-slate-300 whitespace-pre-line max-h-60 overflow-y-auto p-3 bg-slate-900/50 rounded-lg">
                {selectedTask.markdownReport || 'No markdown report saved.'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Agent Hub Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800/80 pb-4 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm transition whitespace-nowrap ${
              activeTab === tab.id
                ? `bg-slate-900 text-slate-100 border ${tab.border} shadow-lg shadow-slate-900/50`
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${tab.color}`} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Active Agent Workspace */}
      <div className="pt-2">
        {activeTab === 'sermon' && <SermonResearchView />}
        {activeTab === 'news' && <ChurchNewsDashboardView />}
        {activeTab === 'event' && <EventInspirationView />}
        {activeTab === 'social' && <SocialContentView />}
        {activeTab === 'dev' && <DeveloperSupportView />}
      </div>
    </div>
  );
}
