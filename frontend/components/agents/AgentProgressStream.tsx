'use client';

import React from 'react';
import { AgentSource } from '@/lib/agentReachClient';
import { Loader2, CheckCircle2, Youtube, BookOpen, GitBranch, MessageSquare, ExternalLink, Globe, FileText } from 'lucide-react';

interface AgentProgressStreamProps {
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progressMsg?: string;
  step?: number;
  sources: AgentSource[];
  markdownReport?: string;
}

export function AgentProgressStream({ status, progressMsg, step = 1, sources, markdownReport }: AgentProgressStreamProps) {
  if (status === 'IDLE') {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl">
        <Globe className="w-12 h-12 mx-auto mb-3 text-cyan-400 animate-pulse" />
        <h3 className="text-lg font-medium text-slate-200">Agent Reach Intelligence Engine Ready</h3>
        <p className="text-sm mt-1 max-w-md mx-auto text-slate-400">
          Enter parameters above and click run to trigger live web scraping, API searching, and AI synthesis.
        </p>
      </div>
    );
  }

  const getSourceIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'YOUTUBE': return <Youtube className="w-4 h-4 text-red-400" />;
      case 'BLOG': return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'GITHUB': return <GitBranch className="w-4 h-4 text-purple-400" />;
      case 'REDDIT': return <MessageSquare className="w-4 h-4 text-orange-400" />;
      default: return <FileText className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Status Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status === 'RUNNING' ? (
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          ) : status === 'COMPLETED' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <span className="w-3 h-3 rounded-full bg-rose-500" />
          )}
          <div>
            <div className="text-sm font-semibold text-slate-200">
              {status === 'RUNNING' ? `Executing Step ${step}/5` : status === 'COMPLETED' ? 'Task Completed' : 'Task Failed'}
            </div>
            <div className="text-xs text-slate-400">{progressMsg || 'Processing internet intelligence stream...'}</div>
          </div>
        </div>
        <div className="text-xs px-3 py-1 bg-slate-800 rounded-full font-mono text-cyan-400">
          {sources.length} Sources Found
        </div>
      </div>

      {/* Discovered Sources Stream */}
      {sources.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Live Sources Discovered</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sources.map((src, idx) => (
              <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg flex items-start gap-3">
                <div className="p-2 bg-slate-900 rounded-md mt-0.5">{getSourceIcon(src.sourceType)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 truncate">{src.title}</span>
                    {src.url && (
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 ml-1">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {src.author && <div className="text-[11px] text-slate-500">{src.author}</div>}
                  {src.snippet && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{src.snippet}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Markdown Output Preview */}
      {markdownReport && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              AI Intelligence Report & Output
            </h3>
            <button
              onClick={() => navigator.clipboard.writeText(markdownReport)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md transition"
            >
              Copy Report
            </button>
          </div>
          <div className="prose prose-invert max-w-none text-slate-300 space-y-4 whitespace-pre-line text-sm leading-relaxed">
            {markdownReport}
          </div>
        </div>
      )}
    </div>
  );
}
