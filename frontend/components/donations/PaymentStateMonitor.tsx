"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, ShieldCheck, Loader2, QrCode, AlertTriangle, FileCheck, Send } from 'lucide-react';
import { useDonationAgent } from './DonationAgentProvider';
import { DonationState } from '@/lib/donationStateMachine';

export function PaymentStateMonitor() {
  const { state } = useDonationAgent();

  const STEPS = [
    { key: 'ORDER', label: 'Order Created', icon: ShieldCheck, activeStates: [DonationState.ORDER_CREATED, DonationState.QR_DISPLAYED, DonationState.PAYMENT_WAITING, DonationState.PAYMENT_PROCESSING, DonationState.PAYMENT_VERIFIED, DonationState.COMPLETED] },
    { key: 'QR', label: 'QR Generated', icon: QrCode, activeStates: [DonationState.QR_DISPLAYED, DonationState.PAYMENT_WAITING, DonationState.PAYMENT_PROCESSING, DonationState.PAYMENT_VERIFIED, DonationState.COMPLETED] },
    { key: 'PAYMENT', label: 'Backend Verification', icon: Clock, activeStates: [DonationState.PAYMENT_PROCESSING, DonationState.PAYMENT_VERIFIED, DonationState.COMPLETED] },
    { key: 'RECEIPT', label: 'Tax Receipt PDF', icon: FileCheck, activeStates: [DonationState.RECEIPT_GENERATED, DonationState.NOTIFICATIONS_SENDING, DonationState.COMPLETED] },
    { key: 'NOTIFY', label: 'Notifications Sent', icon: Send, activeStates: [DonationState.NOTIFICATIONS_SENDING, DonationState.COMPLETED] },
  ];

  const getStepStatus = (stepActiveStates: string[]) => {
    if (stepActiveStates.includes(state)) {
      if (state === DonationState.COMPLETED) return 'completed';
      // If it's the last state matching in active array, show in-progress spinner
      const isCurrent = stepActiveStates[0] === state || (state === DonationState.PAYMENT_WAITING && stepActiveStates.includes(DonationState.PAYMENT_WAITING));
      return isCurrent ? 'in_progress' : 'completed';
    }
    return 'pending';
  };

  return (
    <div className="w-full bg-slate-900/40 dark:bg-slate-950/60 border border-purple-500/20 rounded-2xl p-4 my-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STEPS.map((step, i) => {
          const status = getStepStatus(step.activeStates);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center min-w-[70px] text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    status === 'completed'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : status === 'in_progress'
                      ? 'bg-purple-600 text-white animate-pulse shadow-md shadow-purple-500/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
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
                  className={`text-[10px] font-medium mt-1.5 leading-tight ${
                    status === 'completed'
                      ? 'text-emerald-400 font-semibold'
                      : status === 'in_progress'
                      ? 'text-purple-300 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 min-w-[15px] max-w-[40px] rounded mb-5 ${
                    status === 'completed' ? 'bg-emerald-500/80' : 'bg-slate-800'
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
