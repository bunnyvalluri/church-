"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, ShieldCheck, Loader2, QrCode, FileCheck, Send } from 'lucide-react';
import { useDonationAgent } from './DonationAgentProvider';
import { DonationState } from '@/lib/donationStateMachine';

export function PaymentStateMonitor() {
  const { state } = useDonationAgent();

  const STEPS = [
    { key: 'ORDER', label: 'Order Created', icon: ShieldCheck, activeStates: [DonationState.ORDER_CREATED, DonationState.QR_DISPLAYED, DonationState.PAYMENT_WAITING, DonationState.PAYMENT_PROCESSING, DonationState.PAYMENT_VERIFIED, DonationState.COMPLETED] },
    { key: 'QR', label: 'QR Generated', icon: QrCode, activeStates: [DonationState.QR_DISPLAYED, DonationState.PAYMENT_WAITING, DonationState.PAYMENT_PROCESSING, DonationState.PAYMENT_VERIFIED, DonationState.COMPLETED] },
    { key: 'PAYMENT', label: 'Backend Verification', icon: Clock, activeStates: [DonationState.PAYMENT_PROCESSING, DonationState.PAYMENT_VERIFIED, DonationState.COMPLETED] },
    { key: 'RECEIPT', label: 'Official Receipt PDF', icon: FileCheck, activeStates: [DonationState.RECEIPT_GENERATED, DonationState.NOTIFICATIONS_SENDING, DonationState.COMPLETED] },
    { key: 'NOTIFY', label: 'Notifications Sent', icon: Send, activeStates: [DonationState.NOTIFICATIONS_SENDING, DonationState.COMPLETED] },
  ];

  const getStepStatus = (stepActiveStates: string[]) => {
    if (stepActiveStates.includes(state)) {
      if (state === DonationState.COMPLETED) return 'completed';
      const isCurrent = stepActiveStates[0] === state || (state === DonationState.PAYMENT_WAITING && stepActiveStates.includes(DonationState.PAYMENT_WAITING));
      return isCurrent ? 'in_progress' : 'completed';
    }
    return 'pending';
  };

  // Find the index of the currently active/in-progress or last completed step for mobile view
  let activeStepIndex = 0;
  for (let i = STEPS.length - 1; i >= 0; i--) {
    const status = getStepStatus(STEPS[i].activeStates);
    if (status === 'in_progress' || status === 'completed') {
      activeStepIndex = i;
      break;
    }
  }

  const activeStep = STEPS[activeStepIndex] || STEPS[0];
  const activeStatus = getStepStatus(activeStep.activeStates);
  const ActiveIcon = activeStep.icon;

  return (
    <div className="w-full bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-500/20 rounded-2xl p-3.5 sm:p-4 my-3 sm:my-4 backdrop-blur-md shadow-sm transition-colors overflow-hidden">
      
      {/* ── MOBILE VIEW: Compact Progress Pill & Card (< 640px) ─────────────── */}
      <div className="block sm:hidden space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                activeStatus === 'completed'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-purple-600 text-white animate-pulse shadow-sm shadow-purple-500/30'
              }`}
            >
              {activeStatus === 'completed' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-black tracking-wider text-purple-600 dark:text-purple-400 block">
                Verification Step {activeStepIndex + 1} of {STEPS.length}
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {activeStep.label}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
            {Math.round(((activeStepIndex + 1) / STEPS.length) * 100)}%
          </span>
        </div>

        {/* Mini 5-segment Progress Bar for Mobile */}
        <div className="grid grid-cols-5 gap-1.5 pt-0.5">
          {STEPS.map((s, idx) => {
            const isDone = idx < activeStepIndex || (idx === activeStepIndex && activeStatus === 'completed');
            const isCurrent = idx === activeStepIndex && activeStatus === 'in_progress';
            return (
              <div
                key={s.key}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-500'
                    : isCurrent
                    ? 'bg-purple-600 animate-pulse'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* ── DESKTOP & TABLET VIEW: Full Stepper (>= 640px) ────────────────────── */}
      <div className="hidden sm:flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STEPS.map((step, i) => {
          const status = getStepStatus(step.activeStates);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center min-w-[80px] text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    status === 'completed'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : status === 'in_progress'
                      ? 'bg-purple-600 text-white animate-pulse shadow-md shadow-purple-500/30'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                  }`}
                >
                  {status === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : status === 'in_progress' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium mt-1.5 leading-tight ${
                    status === 'completed'
                      ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                      : status === 'in_progress'
                      ? 'text-purple-700 dark:text-purple-300 font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 min-w-[20px] max-w-[50px] rounded mb-5 transition-colors ${
                    status === 'completed'
                      ? 'bg-emerald-500/80'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
