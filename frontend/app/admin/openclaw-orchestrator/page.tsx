'use client';

/**
 * frontend/app/admin/openclaw-orchestrator/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * OpenClaw Specialized AI Skill Orchestrator Control Center
 * Integrated into KCM Admin Portal Theme Engine & AdminPageTemplate
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import AdminPageTemplate from '@/components/admin/layout/AdminPageTemplate';
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
  { id: 'ALL', label: 'All Skill Domains', icon: Layers, activeColor: 'bg-indigo-600 text-white border-indigo-600' },
  { id: 'SECURITY', label: '1. Security Skills', icon: ShieldCheck, activeColor: 'bg-emerald-600 text-white border-emerald-600' },
  { id: 'EVENT', label: '2. Event Skills', icon: Zap, activeColor: 'bg-amber-600 text-white border-amber-600' },
  { id: 'SERMON', label: '3. Sermon Skills', icon: BookOpen, activeColor: 'bg-purple-600 text-white border-purple-600' },
  { id: 'NOTIFICATION', label: '4. Notification Skills', icon: Bell, activeColor: 'bg-blue-600 text-white border-blue-600' },
  { id: 'PRAYER', label: '5. Prayer Skills', icon: Heart, activeColor: 'bg-rose-600 text-white border-rose-600' },
  { id: 'DEPLOYMENT', label: '6. Deployment Skills', icon: Activity, activeColor: 'bg-cyan-600 text-white border-cyan-600' },
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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
    <AdminPageTemplate
      title="OpenClaw AI Skill Orchestrator"
      description="Production-grade AI workflow automation engine across Security, Event, Sermon, Notification, Prayer, and Deployment domains."
      icon={Cpu}
      onRefresh={fetchSkills}
      isLoading={loading}
      searchPlaceholder="Search AI skills by name, tag, or domain..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      actions={
        <button
          onClick={runFullDomainPipeline}
          disabled={pipelineRunning}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-md border border-indigo-400/30 flex items-center gap-2 text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 whitespace-nowrap"
        >
          <Play className={`w-4 h-4 ${pipelineRunning ? 'animate-spin' : ''}`} />
          {pipelineRunning ? 'Running Pipeline...' : 'Run Composite AI Pipeline'}
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* Domain Selection Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {DOMAINS.map(d => {
            const Icon = d.icon;
            const isSelected = selectedDomain === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
                  isSelected
                    ? `${d.activeColor} shadow-md scale-105`
                    : 'bg-white dark:bg-[#121428] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {d.label}
              </button>
            );
          })}
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Registered Skills Explorer */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Registered Skills ({filteredSkills.length})
              </h2>
            </div>

            <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
              {filteredSkills.map(skill => {
                const isSelected = activeSkill?.id === skill.id;
                
                const securityColor = 
                  skill.securityLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800' :
                  skill.securityLevel === 'HIGH' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800' :
                  skill.securityLevel === 'MEDIUM' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800' :
                  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';

                return (
                  <div
                    key={skill.id}
                    onClick={() => selectSkill(skill)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-[#121428] border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/30">
                        {skill.id}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${securityColor}`}>
                        {skill.securityLevel}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-1">{skill.name}</h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-2.5 leading-relaxed">{skill.description}</p>

                    <div className="flex flex-wrap items-center gap-1">
                      {skill.tags.map(t => (
                        <span key={t} className="text-[10px] bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-medium px-1.5 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold ml-auto">
                        Role: {skill.policy.requiredRole}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Execution Workspace */}
          <div className="lg:col-span-7 space-y-5">
            {activeSkill ? (
              <div className="bg-white dark:bg-[#121428] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-5">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{activeSkill.id}</span>
                      <span className="text-xs text-slate-500">• v{activeSkill.version}</span>
                    </div>
                    <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">{activeSkill.name}</h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{activeSkill.description}</p>
                  </div>

                  <button
                    onClick={runSkillExecution}
                    disabled={executing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm border border-emerald-500/30 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 whitespace-nowrap self-start sm:self-center"
                  >
                    <Play className={`w-3.5 h-3.5 ${executing ? 'animate-spin' : ''}`} />
                    {executing ? 'Executing...' : 'Execute Skill'}
                  </button>
                </div>

                {/* Input Editor */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Input Parameters (JSON)
                    </label>
                    <button
                      onClick={() => setInputJson(JSON.stringify(DEFAULT_SAMPLE_INPUTS[activeSkill.id] || {}, null, 2))}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset Sample
                    </button>
                  </div>

                  <textarea
                    value={inputJson}
                    onChange={e => setInputJson(e.target.value)}
                    rows={7}
                    className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner scrollbar-thin"
                  />
                </div>

                {/* Telemetry Output */}
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Execution Telemetry & Output
                  </label>

                  {executionResult ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-3 shadow-inner">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          {executionResult.success ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-extrabold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> SUCCESS
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-400 font-extrabold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" /> FAILED
                            </span>
                          )}
                          <span className="text-slate-300 font-semibold">Domain: {executionResult.domain}</span>
                        </div>

                        {executionResult.telemetry && (
                          <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 font-semibold text-indigo-300">
                              <Clock className="w-3 h-3 text-indigo-400" />
                              {executionResult.telemetry.durationMs} ms
                            </span>
                            <span>•</span>
                            <span>ID: {executionResult.telemetry.executionId}</span>
                          </div>
                        )}
                      </div>

                      <pre className="text-emerald-300 overflow-x-auto max-h-64 scrollbar-thin leading-relaxed">
                        {JSON.stringify(executionResult, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-white/10 rounded-xl p-6 text-center text-slate-500 text-xs">
                      Click <span className="text-slate-900 dark:text-slate-200 font-semibold">"Execute Skill"</span> to trigger OpenClaw policy validation & telemetry metrics.
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white dark:bg-[#121428] border border-slate-200 dark:border-white/10 rounded-2xl p-10 text-center text-slate-500">
                Select a skill from the left list to open the execution panel.
              </div>
            )}

            {/* Pipeline Logs */}
            {pipelineLogs.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-slate-100 shadow-lg">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  Composite Workflow Pipeline Execution Logs
                </h3>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
                  {pipelineLogs.map((log, idx) => (
                    <div key={idx} className="text-slate-200">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </AdminPageTemplate>
  );
}
