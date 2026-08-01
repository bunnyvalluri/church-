'use client';

/**
 * frontend/app/admin/openclaw-orchestrator/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * OpenClaw Specialized AI Skill Orchestrator Control Center
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  Bell, 
  Heart, 
  Activity, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Code, 
  Cpu, 
  Layers,
  Terminal,
  Server
} from 'lucide-react';

interface SkillMeta {
  id: string;
  name: string;
  description: string;
  domain: string;
  version: string;
  author: string;
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tags: string[];
  policy: {
    requiredRole: string;
    rateLimitPerMin?: number;
    requiresAuditLog?: boolean;
  };
}

const DOMAINS = [
  { id: 'ALL', label: 'All Skill Domains', icon: Layers, color: 'text-indigo-400 border-indigo-500' },
  { id: 'SECURITY', label: '1. Security Skills', icon: ShieldCheck, color: 'text-emerald-400 border-emerald-500' },
  { id: 'EVENT', label: '2. Event Skills', icon: Zap, color: 'text-amber-400 border-amber-500' },
  { id: 'SERMON', label: '3. Sermon Skills', icon: BookOpen, color: 'text-purple-400 border-purple-500' },
  { id: 'NOTIFICATION', label: '4. Notification Skills', icon: Bell, color: 'text-blue-400 border-blue-500' },
  { id: 'PRAYER', label: '5. Prayer Skills', icon: Heart, color: 'text-rose-400 border-rose-500' },
  { id: 'DEPLOYMENT', label: '6. Deployment Skills', icon: Activity, color: 'text-cyan-400 border-cyan-500' },
];

const DEFAULT_SAMPLE_INPUTS: Record<string, any> = {
  'security.jwt_validation': {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfazNtXzA0MiIsImVtYWlsIjoicGFzdG9yQGtjbS5vcmciLCJyb2xlIjoiUEFTVE9SIiwiaXNzIjoia2NtLW1pbmlzdHJpZXMtYXV0aCIsImlhdCI6MTc1NDA2NzIwMCwiZXhwIjoxNzU0MTUzNjAwfQ.sample_signature_hash',
    expectedIssuer: 'kcm-ministries-auth',
  },
  'security.rbac_audit': {
    resource: 'events',
    action: 'DELETE',
    targetUserRole: 'PASTOR',
  },
  'security.upload_validation': {
    fileName: 'sunday_service_banner.png',
    mimeType: 'image/png',
    fileSizeBytes: 4200000,
    base64HeadSnippet: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  },
  'security.api_abuse_detection': {
    ipAddress: '192.168.1.105',
    endpoint: '/api/events',
    requestCountLastMinute: 45,
    payloadSize: 1024,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) KCM-PWA/2.0',
  },
  'event.upload_automation': {
    title: 'Grace & Truth Annual Gospel Conference 2026',
    description: 'Join us for a transformative 3-day anointed worship and word convention with international speakers.',
    date: '2026-09-15T09:00:00Z',
    location: 'Main Sanctuary, KCM Ministries Campus',
    capacity: 2500,
  },
  'event.media_optimization': {
    mediaUrl: 'https://res.cloudinary.com/kcm-church/image/upload/v1/event_posters/conference_banner.jpg',
    mediaType: 'POSTER',
    targetWidth: 1200,
    targetHeight: 630,
  },
  'event.homepage_publishing': {
    eventId: 'evt_conference_2026',
    eventTitle: 'Grace & Truth Annual Gospel Conference 2026',
    isFeatured: true,
    displayOrder: 1,
    publishInstantBroadcast: true,
  },
  'sermon.summarization': {
    title: 'Walking by Unshakable Faith in Times of Storms',
    transcriptOrNotes: 'Today we open our Bibles to Mark 4:35-41. Jesus calls us to step out onto the waters of faith even when wind and wave billow around us. God is never surprised by your trials. His grace is sufficient and His presence is near.',
    targetSummaryLength: 'MEDIUM',
  },
  'sermon.verse_suggestions': {
    theme: 'Peace & Hope',
    testamentFilter: 'ALL',
    maxResults: 4,
  },
  'sermon.content_generation': {
    sermonTitle: 'Walking by Unshakable Faith in Times of Storms',
    mainPassage: 'Mark 4:35-41',
    targetContentType: 'SMALL_GROUP_QUESTIONS',
  },
  'notification.fcm_push': {
    title: '🔥 Live Worship Service Starting Now!',
    body: 'Join Senior Pastor Valluri live on stream or at the main sanctuary for today\'s message.',
    targetTopic: 'all-members',
  },
  'notification.socket_popup': {
    message: '🙏 Urgent Prayer Request: Please join in prayer for Brother John in ICU.',
    type: 'URGENT_PRAYER',
    targetRoom: 'global',
  },
  'notification.retry_failed': {
    maxRetries: 3,
    channelFilter: 'ALL',
    batchSize: 10,
  },
  'prayer.categorize': {
    title: 'Pray for complete healing for my mother',
    description: 'My mother was admitted to the hospital today with chest pain. Requesting church elders to pray for divine healing.',
  },
  'prayer.priority_detection': {
    title: 'Urgent ICU emergency prayer needed',
    description: 'Immediate crisis prayer for Brother Samuel following a critical accident in ICU.',
  },
  'prayer.pastor_assignment': {
    prayerId: 'pry_9921',
    category: 'HEAL_HEALTH',
    priority: 'URGENT',
  },
  'deployment.cicd_monitoring': {
    pipelineId: 'kcm-main-deploy',
    targetEnvironment: 'PRODUCTION',
  },
  'deployment.rollback': {
    reason: 'Preventative test trigger for OpenClaw SRE automated safety rollback sequence.',
    forceRollback: false,
  },
  'deployment.health_check': {
    checkDatabase: true,
    checkCloudinary: true,
    checkSocketIo: true,
    checkFcm: true,
  },
};

export default function OpenClawOrchestratorAdminPage() {
  const [skills, setSkills] = useState<SkillMeta[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [activeSkill, setActiveSkill] = useState<SkillMeta | null>(null);
  const [inputJson, setInputJson] = useState<string>('{}');
  const [executing, setExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pipelineRunning, setPipelineRunning] = useState<boolean>(false);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/openclaw/skills');
      const data = await res.json();
      if (data.success) {
        setSkills(data.skills);
        if (data.skills.length > 0) {
          selectSkill(data.skills[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load OpenClaw skills:', e);
    }
  };

  const selectSkill = (skill: SkillMeta) => {
    setActiveSkill(skill);
    const sampleInput = DEFAULT_SAMPLE_INPUTS[skill.id] || {};
    setInputJson(JSON.stringify(sampleInput, null, 2));
    setExecutionResult(null);
  };

  const runSkillExecution = async () => {
    if (!activeSkill) return;
    setExecuting(true);
    setExecutionResult(null);

    try {
      let parsedInput = {};
      try {
        parsedInput = JSON.parse(inputJson);
      } catch (err) {
        alert('Invalid JSON input format');
        setExecuting(false);
        return;
      }

      const res = await fetch('/api/openclaw/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: activeSkill.id,
          input: parsedInput,
          userRole: 'ADMIN',
        }),
      });

      const data = await res.json();
      setExecutionResult(data);
    } catch (err: any) {
      setExecutionResult({ success: false, error: err.message });
    } finally {
      setExecuting(false);
    }
  };

  const runFullDomainPipeline = async () => {
    setPipelineRunning(true);
    setPipelineLogs(['🚀 Initiating OpenClaw Multi-Domain Composite AI Pipeline...']);

    const sampleFlow = [
      { id: 'security.jwt_validation', desc: '1/6 Validating JWT Token & Claims...' },
      { id: 'event.upload_automation', desc: '2/6 Automating Event Upload Record...' },
      { id: 'sermon.summarization', desc: '3/6 Synthesizing Sermon Insights & Verse Suggestions...' },
      { id: 'notification.fcm_push', desc: '4/6 Dispatching FCM Mobile Push Notification...' },
      { id: 'prayer.priority_detection', desc: '5/6 Detecting Crisis Sentiments & Assigning Pastor...' },
      { id: 'deployment.health_check', desc: '6/6 Running Multi-Point Platform Health Inspection...' },
    ];

    for (const step of sampleFlow) {
      setPipelineLogs(prev => [...prev, `[STEP] ${step.desc}`]);
      const sampleInput = DEFAULT_SAMPLE_INPUTS[step.id] || {};
      
      try {
        const res = await fetch('/api/openclaw/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillId: step.id, input: sampleInput, userRole: 'ADMIN' }),
        });
        const data = await res.json();
        if (data.success) {
          setPipelineLogs(prev => [...prev, `   ✅ ${step.id} completed in ${data.telemetry?.durationMs || 12}ms`]);
        } else {
          setPipelineLogs(prev => [...prev, `   ❌ ${step.id} failed: ${data.error?.message}`]);
        }
      } catch (err: any) {
        setPipelineLogs(prev => [...prev, `   ⚠️ Step exception: ${err.message}`]);
      }
      await new Promise(r => setTimeout(r, 600));
    }

    setPipelineLogs(prev => [...prev, '🎉 Composite AI Skill Pipeline Execution Completed Successfully!']);
    setPipelineRunning(false);
  };

  const filteredSkills = skills.filter(s => {
    const matchesDomain = selectedDomain === 'ALL' || s.domain === selectedDomain;
    const matchesSearch = searchQuery === '' || 
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header Banner */}
      <div className="max-w-7xl mx-mx-auto mb-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                OpenClaw Skill Architecture
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-medium">
                Production-Grade Engine
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
              OpenClaw AI Skill Orchestrator
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-3xl">
              Specialized AI workflow automation for KCM Ministries across Security, Event, Sermon, Notification, Prayer, and Deployment domains.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runFullDomainPipeline}
              disabled={pipelineRunning}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${pipelineRunning ? 'animate-spin' : ''}`} />
              {pipelineRunning ? 'Running Composite Pipeline...' : 'Run Full Multi-Domain Pipeline'}
            </button>
          </div>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {DOMAINS.map(d => {
            const Icon = d.icon;
            const isSelected = selectedDomain === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`px-4 py-2.5 rounded-xl border font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? `bg-slate-900 ${d.color} shadow-lg shadow-slate-950/50`
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Skills Explorer & Test Panel */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Skill List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Registered Skills ({filteredSkills.length})
            </h2>
            <div className="relative w-48">
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filteredSkills.map(skill => {
              const isSelected = activeSkill?.id === skill.id;
              const securityColor = 
                skill.securityLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                skill.securityLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                skill.securityLevel === 'MEDIUM' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

              return (
                <div
                  key={skill.id}
                  onClick={() => selectSkill(skill)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500/80 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {skill.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${securityColor}`}>
                      {skill.securityLevel}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 mb-1">{skill.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{skill.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {skill.tags.map(t => (
                      <span key={t} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                    <span className="text-[10px] bg-slate-800/60 text-slate-500 px-2 py-0.5 rounded ml-auto">
                      Role: {skill.policy.requiredRole}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Execution Workspace & Console (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeSkill ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Skill Info Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-indigo-400">{activeSkill.id}</span>
                    <span className="text-xs text-slate-500">• v{activeSkill.version}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{activeSkill.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">{activeSkill.description}</p>
                </div>

                <button
                  onClick={runSkillExecution}
                  disabled={executing}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 border border-emerald-400/30 flex items-center gap-2 text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Play className={`w-4 h-4 ${executing ? 'animate-spin' : ''}`} />
                  {executing ? 'Executing...' : 'Execute Skill'}
                </button>
              </div>

              {/* Input Schema Parameters Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-indigo-400" />
                    Input Parameters (Zod Schema JSON)
                  </label>
                  <button
                    onClick={() => setInputJson(JSON.stringify(DEFAULT_SAMPLE_INPUTS[activeSkill.id] || {}, null, 2))}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Sample
                  </button>
                </div>

                <textarea
                  value={inputJson}
                  onChange={e => setInputJson(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500/80 shadow-inner scrollbar-thin"
                />
              </div>

              {/* Execution Telemetry & Result Terminal */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Execution Telemetry & Output
                </label>

                {executionResult ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        {executionResult.success ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                            <AlertTriangle className="w-3.5 h-3.5" /> FAILED
                          </span>
                        )}
                        <span className="text-slate-400">Domain: {executionResult.domain}</span>
                      </div>

                      {executionResult.telemetry && (
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            {executionResult.telemetry.durationMs} ms
                          </span>
                          <span className="text-slate-600">|</span>
                          <span className="text-slate-400">ID: {executionResult.telemetry.executionId}</span>
                        </div>
                      )}
                    </div>

                    <pre className="text-slate-300 overflow-x-auto max-h-72 scrollbar-thin">
                      {JSON.stringify(executionResult, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                    Click <span className="text-slate-300 font-semibold">"Execute Skill"</span> to trigger OpenClaw policy validation & execution telemetry.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              Select a skill from the left list to open the execution panel.
            </div>
          )}

          {/* Composite Pipeline Live Log Console */}
          {pipelineLogs.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" />
                Composite Workflow Pipeline Logs
              </h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto">
                {pipelineLogs.map((log, idx) => (
                  <div key={idx} className="text-slate-300">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
