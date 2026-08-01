'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Activity, 
  Server, 
  BrainCircuit, 
  Radio, 
  ArrowRight,
  Database,
  Lock,
  Workflow
} from 'lucide-react';

export default function AntigravityWorkflowView() {
  const [activeModel, setActiveModel] = useState<'claude' | 'gemini'>('gemini');
  const [isRotating, setIsRotating] = useState(false);
  const [activeTab, setActiveTab] = useState<'domains' | 'agents' | 'gateway'>('domains');

  const handleModelRotation = () => {
    setIsRotating(true);
    setTimeout(() => {
      setActiveModel(prev => (prev === 'claude' ? 'gemini' : 'claude'));
      setIsRotating(false);
    }, 600);
  };

  const workflowDomains = [
    { id: 1, name: 'Multi-Session Parallel Coding', status: 'ACTIVE', model: 'Gemini 3.6 Flash', tokens: '42.5k', latency: '120ms' },
    { id: 2, name: 'Internet Intelligence Swarm', status: 'ACTIVE', model: 'Gemini 3.6 Flash', tokens: '31.2k', latency: '180ms' },
    { id: 3, name: 'Firecrawl Content Extraction', status: 'ACTIVE', model: 'Gemini 3.6 Flash', tokens: '18.9k', latency: '210ms' },
    { id: 4, name: 'Kubernetes Envoy Gateway API', status: 'VERIFIED', model: 'Claude 3.7 Sonnet', tokens: '89.4k', latency: '95ms' },
    { id: 5, name: 'PWA Offline & Push Engine', status: 'OPTIMIZED', model: 'Gemini 3.6 Flash', tokens: '24.1k', latency: '140ms' },
    { id: 6, name: 'Cloudinary & Media Pipeline', status: 'OPERATIONAL', model: 'Claude 3.7 Sonnet', tokens: '52.0k', latency: '110ms' },
    { id: 7, name: 'Prisma & Neon PostgreSQL DB', status: 'SYNCED', model: 'Claude 3.7 Sonnet', tokens: '64.8k', latency: '85ms' },
    { id: 8, name: 'Firebase & Google Apps Script', status: 'ACTIVE', model: 'Gemini 3.6 Flash', tokens: '19.3k', latency: '160ms' },
    { id: 9, name: 'Argo Rollouts Blue/Green Deploy', status: 'READY', model: 'Claude 3.7 Sonnet', tokens: '38.7k', latency: '105ms' },
    { id: 10, name: 'Security Policy & CORS Guard', status: 'VERIFIED', model: 'Claude 3.7 Sonnet', tokens: '71.2k', latency: '75ms' },
  ];

  const intelligenceAgents = [
    { name: 'Sermon Research Agent', engine: 'Firecrawl + Agent Reach', rate: '99.4%', status: 'Running' },
    { name: 'Church News Feed Engine', engine: 'Neon DB + Redis Cache', rate: '100%', status: 'Scheduled' },
    { name: 'Event Inspiration Generator', engine: 'Gemini AI Pipeline', rate: '98.9%', status: 'Idle' },
    { name: 'Social Content Optimizer', engine: 'Cloudinary + Text AI', rate: '99.1%', status: 'Running' },
    { name: 'Developer Support Agent', engine: 'OpenCode Memory Graph', rate: '100%', status: 'Active' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <BrainCircuit className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
                  OpenCode Antigravity AI Orchestrator
                </h1>
                <p className="text-sm text-slate-400">
                  KCM Ministries Platform — Enterprise Multi-Model AI Engine & Telemetry Portal
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              opencode-antigravity-auth v2.4.0
            </div>
            <button
              onClick={handleModelRotation}
              disabled={isRotating}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
              Rotate Model Target
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Active AI Model</span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {activeModel === 'gemini' ? 'Gemini 3.6 Flash' : 'Claude 3.7 Sonnet'}
              </span>
              <span className="text-xs text-indigo-400 font-medium">Primary</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {activeModel === 'gemini' ? 'Optimized for high-speed implementation & async workers' : 'Optimized for system architecture & security policies'}
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Gateway Telemetry</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">100% Verified</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Envoy Gateway API • Public Auth Bypass • Zero Route Collisions
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Session Memory Graph</span>
              <Database className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">Synchronized</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              .jcode/memory/graph.db • Cross-session state persistence
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Workflow Velocity</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-400">4.8x Speedup</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              10 Parallel AI Domains • Real-time Socket.io feedback
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('domains')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'domains' 
                ? 'border-indigo-500 text-indigo-400 font-semibold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            10 AI Workflow Domains
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'agents' 
                ? 'border-indigo-500 text-indigo-400 font-semibold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            Agent Reach Swarm
          </button>
          <button
            onClick={() => setActiveTab('gateway')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'gateway' 
                ? 'border-indigo-500 text-indigo-400 font-semibold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            API Gateway Security & Routes
          </button>
        </div>

        {/* Tab 1: Workflow Domains */}
        {activeTab === 'domains' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Workflow className="w-5 h-5 text-indigo-400" />
                Active Workflow Engineering Domains
              </h2>
              <span className="text-xs text-slate-400">10 of 10 Domains Operational</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">Domain Name</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Assigned AI Model</th>
                    <th className="py-3.5 px-4">Context Tokens</th>
                    <th className="py-3.5 px-4 text-right">Avg Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {workflowDomains.map((domain) => (
                    <tr key={domain.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-white flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-xs flex items-center justify-center text-slate-300 font-bold">
                          {domain.id}
                        </span>
                        {domain.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {domain.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">{domain.model}</td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs">{domain.tokens}</td>
                      <td className="py-3.5 px-4 text-right text-slate-400 text-xs font-mono">{domain.latency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Agent Swarm */}
        {activeTab === 'agents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {intelligenceAgents.map((agent, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-white">{agent.name}</h3>
                    <p className="text-xs text-slate-400">{agent.engine}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
                    {agent.status}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs">
                  <span className="text-slate-400">Accuracy & Success Rate</span>
                  <span className="font-semibold text-emerald-400">{agent.rate}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Gateway Telemetry */}
        {activeTab === 'gateway' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Kubernetes Envoy Gateway API Security Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Verified configuration across HTTPRoutes, SecurityPolicies, RateLimiters, and Traffic Mirroring.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">kcm-public-api-route</span>
                  <span className="text-xs text-emerald-400 font-mono">200 OK</span>
                </div>
                <p className="text-xs text-slate-400">Paths: /health, /api/health, /api/auth/*</p>
                <p className="text-[11px] text-indigo-400">Security: Public (No JWT Required)</p>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">kcm-protected-api-route</span>
                  <span className="text-xs text-emerald-400 font-mono">JWT Guarded</span>
                </div>
                <p className="text-xs text-slate-400">Paths: /api/* (Events, AI, Loops)</p>
                <p className="text-[11px] text-purple-400">Security: Firebase JWT Validated</p>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">kcm-traffic-mirror</span>
                  <span className="text-xs text-sky-400 font-mono">10% Shadow</span>
                </div>
                <p className="text-xs text-slate-400">Host: api.kcmchurch.org</p>
                <p className="text-[11px] text-sky-400">Target: backend-api-preview-service:3001</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
