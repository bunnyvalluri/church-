'use client';

import React, { useState, useEffect } from 'react';
import { executeSermonResearch, getAgentSocket, AgentSource } from '@/lib/agentReachClient';
import { AgentProgressStream } from './AgentProgressStream';
import { Search, Sparkles, BookOpen } from 'lucide-react';

export function SermonResearchView() {
  const [topic, setTopic] = useState('Faith over Fear');
  const [scripture, setScripture] = useState('Romans 8:28-39');
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
      setProgressMsg('Sermon research synthesis complete!');
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
    setProgressMsg('Initiating multi-platform sermon intelligence search...');

    try {
      const res = await executeSermonResearch({ topic, scripture, query: `${topic} ${scripture}` });
      if (res.task && res.task.markdownReport) {
        setStatus('COMPLETED');
        setMarkdownReport(res.task.markdownReport);
      }
    } catch (err: any) {
      setStatus('FAILED');
      setProgressMsg(err.message || 'Sermon research task failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Sermon Research Agent</h2>
            <p className="text-sm text-slate-400">
              Searches YouTube sermons, exegetical blogs, and GitHub study tools to generate structured outlines & commentary.
            </p>
          </div>
        </div>

        <form onSubmit={handleRun} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Sermon Theme / Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Walking in Divine Favor"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Primary Scripture Passage</label>
            <input
              type="text"
              value={scripture}
              onChange={(e) => setScripture(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Psalm 23, Ephesians 6:10-18"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={status === 'RUNNING'}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition"
            >
              {status === 'RUNNING' ? <Sparkles className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Run Sermon Intelligence
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
