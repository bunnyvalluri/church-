'use client';

import React, { useState, useEffect } from 'react';
import { fetchChurchNews, triggerChurchNewsFetch, getAgentSocket, AgentSource } from '@/lib/agentReachClient';
import { AgentProgressStream } from './AgentProgressStream';
import { Newspaper, RefreshCw, Filter, HeartHandshake, Globe2, Sparkles, ExternalLink } from 'lucide-react';

export function ChurchNewsDashboardView() {
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [fetchingNew, setFetchingNew] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED'>('IDLE');
  const [progressMsg, setProgressMsg] = useState('');
  const [sources, setSources] = useState<AgentSource[]>([]);
  const [markdownReport, setMarkdownReport] = useState('');

  const loadCachedNews = async () => {
    setLoading(true);
    try {
      const res = await fetchChurchNews();
      if (res.articles) {
        setArticles(res.articles);
      }
    } catch (e) {
      console.warn('Failed to load news:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCachedNews();

    const socket = getAgentSocket();
    socket.on('agent:progress', (data) => {
      setStatus('RUNNING');
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
      loadCachedNews();
    });

    return () => {
      socket.off('agent:progress');
      socket.off('agent:source_found');
      socket.off('agent:complete');
    };
  }, []);

  const handleRefreshNews = async () => {
    setFetchingNew(true);
    setStatus('RUNNING');
    setSources([]);
    setMarkdownReport('');
    setProgressMsg('Fetching Christian, NGO, & Mission news feeds...');

    try {
      const res = await triggerChurchNewsFetch();
      if (res.task && res.task.markdownReport) {
        setStatus('COMPLETED');
        setMarkdownReport(res.task.markdownReport);
      }
      await loadCachedNews();
    } catch (err: any) {
      setStatus('FAILED');
      setProgressMsg(err.message || 'News fetch failed.');
    } finally {
      setFetchingNew(false);
    }
  };

  const filteredArticles = selectedCategory === 'ALL'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Church News & Mission Intelligence Agent</h2>
            <p className="text-sm text-slate-400">
              Aggregates global Christian news, NGO developments, and mission field updates into an AI executive summary.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefreshNews}
          disabled={fetchingNew}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${fetchingNew ? 'animate-spin' : ''}`} />
          Refresh News Intelligence
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Filter className="w-4 h-4 text-slate-400 ml-1" />
        <span className="text-xs text-slate-400 font-medium mr-2">Filter Category:</span>
        {[
          { id: 'ALL', label: 'All Updates', icon: Globe2 },
          { id: 'CHRISTIAN_NEWS', label: 'Christian News', icon: Newspaper },
          { id: 'NGO_NEWS', label: 'NGO & Humanitarian', icon: HeartHandshake },
          { id: 'MISSION_UPDATE', label: 'Mission Field', icon: Sparkles }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              selectedCategory === tab.id
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* News Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            Loading news database...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
            No cached articles found in this category. Click &quot;Refresh News Intelligence&quot; to fetch live feeds.
          </div>
        ) : (
          filteredArticles.map((article) => (
            <div key={article.id} className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                    article.category === 'MISSION_UPDATE' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    article.category === 'NGO_NEWS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {article.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-500">{article.sourceName}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{article.summary}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>{new Date(article.publishedAt || article.fetchedAt).toLocaleDateString()}</span>
                {article.sourceUrl && (
                  <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                    Read Feed <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <AgentProgressStream
        status={status}
        progressMsg={progressMsg}
        sources={sources}
        markdownReport={markdownReport}
      />
    </div>
  );
}
