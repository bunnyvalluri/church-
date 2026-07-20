"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ShieldCheck, Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useDonationAgent } from './DonationAgentProvider';

export function AgentStatusBar() {
  const { state, label, color, agentMessage, isPolling } = useDonationAgent();

  const colorStyles = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400',
    green: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400',
    yellow: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800 dark:text-amber-400',
    red: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800 dark:text-rose-400',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800 dark:text-purple-400',
    gray: 'bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800 dark:text-slate-400',
  };

  const badgeColor = colorStyles[color] || colorStyles.gray;

  return (
    <div className="w-full mb-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-lg shadow-purple-900/5 relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3">
          {/* Bot Avatar Icon */}
          <div className="relative flex-shrink-0 mt-0.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Bot className="w-5 h-5" />
            </div>
            {isPolling && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> KCM Donation Agent
                </span>
              </div>

              {/* Status Chip */}
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${badgeColor}`}>
                {isPolling && <RefreshCw className="w-3 h-3 animate-spin" />}
                {label}
              </span>
            </div>

            {/* Prompt message with text transition */}
            <AnimatePresence mode="wait">
              <motion.p
                key={agentMessage}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed"
              >
                {agentMessage}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
