'use client';

import React, { useState, useEffect } from 'react';
import { executeEventInspiration, getAgentSocket, AgentSource } from '@/lib/agentReachClient';
import { AgentProgressStream } from './AgentProgressStream';
import { Calendar, Sparkles, Rocket } from 'lucide-react';

export function EventInspirationView() {
  const [topic, setTopic] = useState('Youth Summer Awakening 2026');
  const [targetAudience, setTargetAudience] = useState('Teens & Young Adults (Ages 13-25)');
  const [eventType, setEventType] = useState('Youth Program & VBS Activities');
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
    setProgressMsg('Searching web for event blueprints & VBS activities...');

    try {
      const res = await executeEventInspiration({ topic, targetAudience, eventType });
      if (res.task && res.task.markdownReport) {
        setStatus('COMPLETED');
        setMarkdownReport(res.task.markdownReport);
      }
    } catch (err: any) {
      setStatus('FAILED');
      setProgressMsg(err.message || 'Event inspiration task failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Event Inspiration Agent</h2>
            <p className="text-sm text-slate-400">
              Searches web event ideas, youth retreats, and VBS activities to generate a complete Event Blueprint with schedules & slogans.
            </p>
          </div>
        </div>

        <form onSubmit={handleRun} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Event Concept / Name</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              placeholder="e.g. VBS 2026: Champions of Faith"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Audience</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              placeholder="e.g. Kids (5-12), Youth, Couples"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Category / Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="Youth Program & VBS Activities">Youth Program & VBS Activities</option>
              <option value="Community Outreach & Charity">Community Outreach & Charity</option>
              <option value="Worship Night & Prayer Rally">Worship Night & Prayer Rally</option>
              <option value="Marriage & Family Retreat">Marriage & Family Retreat</option>
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={status === 'RUNNING'}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 transition"
            >
              {status === 'RUNNING' ? <Sparkles className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              Generate Event Blueprint
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
