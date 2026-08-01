'use client';

import React, { useState, useEffect } from 'react';
import { executeSocialContent, getAgentSocket, AgentSource } from '@/lib/agentReachClient';
import { AgentProgressStream } from './AgentProgressStream';
import { Share2, Sparkles, Image, Link, Instagram, Youtube, Facebook, Twitter } from 'lucide-react';

export function SocialContentView() {
  const [eventTitle, setEventTitle] = useState('Glorious Sunday Worship & Word');
  const [eventDescription, setEventDescription] = useState('A powerful service featuring anointed worship, prophetic teaching, and prayer for families.');
  const [mediaUrl, setMediaUrl] = useState('https://res.cloudinary.com/demo/image/upload/sample.jpg');
  const [publicId, setPublicId] = useState('kcm_events/sunday_service_2026');
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
    setProgressMsg('Connecting to Cloudinary asset & analyzing visual media context...');

    try {
      const res = await executeSocialContent({ mediaUrl, publicId, eventTitle, eventDescription });
      if (res.task && res.task.markdownReport) {
        setStatus('COMPLETED');
        setMarkdownReport(res.task.markdownReport);
      }
    } catch (err: any) {
      setStatus('FAILED');
      setProgressMsg(err.message || 'Social content generation failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Social Content & Media Agent</h2>
              <p className="text-sm text-slate-400">
                Analyzes uploaded Cloudinary event photos/videos to generate Instagram captions, Facebook CTAs, Twitter threads, blogs, & YouTube metadata.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <Instagram className="w-4 h-4 text-pink-400" />
            <Facebook className="w-4 h-4 text-blue-400" />
            <Twitter className="w-4 h-4 text-sky-400" />
            <Youtube className="w-4 h-4 text-red-400" />
          </div>
        </div>

        <form onSubmit={handleRun} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Event Title</label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Cloudinary Public ID / Asset Tag</label>
            <input
              type="text"
              value={publicId}
              onChange={(e) => setPublicId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">Cloudinary Media URL</label>
            <div className="relative">
              <Link className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-pink-500"
                placeholder="https://res.cloudinary.com/..."
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">Event Summary / Sermon Highlights</label>
            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={status === 'RUNNING'}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-pink-500/20 disabled:opacity-50 transition"
            >
              {status === 'RUNNING' ? <Sparkles className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
              Generate Cross-Platform Media Assets
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
