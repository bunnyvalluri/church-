'use client';

import React, { useState, useEffect } from 'react';
import { executeDeveloperSupport, getAgentSocket, AgentSource } from '@/lib/agentReachClient';
import { AgentProgressStream } from './AgentProgressStream';
import { Code2, Terminal, Sparkles, Cpu } from 'lucide-react';

export function DeveloperSupportView() {
  const [query, setQuery] = useState('Prisma Neon PostgreSQL connection timeout in Next.js Serverless');
  const [stackTrace, setStackTrace] = useState('Error: PrismaClientInitializationError: Connection pool timeout after 10000ms at PrismaClient.connect');
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED'>('IDLE');
  const [progressMsg, setProgressMsg] = useState('');
  const [step, setStep] = useState(1);
  const [sources, setSources] = useState<AgentSource[]>([]);
  const [markdownReport, setMarkdownReport] = useState('');

  useEffect(() => {
    const socket = getAgentSocket();
    socket.on('agent:progress', (data) => {
      setStatus('RUNNING');
      setStep(data.step || 1);
      setProgressMsg(data.message || '');
    });

    socket.on('agent:source_found', (data) => {
      if (data.source) {
        setSources((prev) => [...prev, data.source]);
      }
    });

    socket.on('agent:complete', (data) => {
      setStatus('COMPLETED');
      setMarkdownReport(data.markdownReport || '');
    });

    return () => {
      socket.off('agent:progress');
      socket.off('agent:source_found');
      socket.off('agent:complete');
    };
  }, []);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('RUNNING');
    setSources([]);
    setMarkdownReport('');
    setProgressMsg('Searching GitHub issues, Reddit bug fixes, & official docs...');

    try {
      const res = await executeDeveloperSupport({ query, errorLog: query, stackTrace });
      if (res.task && res.task.markdownReport) {
        setStatus('COMPLETED');
        setMarkdownReport(res.task.markdownReport);
      }
    } catch (err: any) {
      setStatus('FAILED');
      setProgressMsg(err.message || 'Developer support search failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Developer Support Agent</h2>
            <p className="text-sm text-slate-400">
              Searches GitHub issues, Reddit developer bug fixes, and technical documentation to generate step-by-step resolution patches.
            </p>
          </div>
        </div>

        <form onSubmit={handleRun} className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Issue / Error Query</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="e.g. Next.js 14 hydration mismatch in custom component"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Stack Trace / Error Log</label>
            <textarea
              value={stackTrace}
              onChange={(e) => setStackTrace(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
              placeholder="Paste terminal or browser stack trace..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={status === 'RUNNING'}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition"
            >
              {status === 'RUNNING' ? <Sparkles className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
              Diagnose & Generate Code Patch
            </button>
          </div>
        </form>
      </div>

      <AgentProgressStream
        status={status}
        progressMsg={progressMsg}
        step={step}
        sources={sources}
        markdownReport={markdownReport}
      />
    </div>
  );
}
