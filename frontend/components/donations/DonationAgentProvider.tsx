"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import {
  DonationState,
  DonationEvent,
  type DonationStateType,
  type DonationEventType,
  type DonationContext,
  type StateMachineInstance,
  createDonationStateMachine,
  transition,
  stateToWizardStep,
  stateLabel,
  stateColor,
} from '@/lib/donationStateMachine';

// ─── React State & Actions ───────────────────────────────────────────────────

interface AgentState {
  machine: StateMachineInstance;
  isPolling: boolean;
  pollError: string | null;
  agentMessage: string;
}

type AgentAction =
  | { type: 'TRANSITION'; event: DonationEventType; payload?: Partial<DonationContext> }
  | { type: 'SET_POLLING'; isPolling: boolean }
  | { type: 'SET_POLL_ERROR'; error: string | null }
  | { type: 'SET_AGENT_MESSAGE'; message: string }
  | { type: 'RESET' };

function agentReducer(state: AgentState, action: AgentAction): AgentState {
  switch (action.type) {
    case 'TRANSITION': {
      const newMachine = { ...state.machine, history: [...state.machine.history] };
      const res = transition(newMachine, action.event, action.payload);
      if (!res.success) {
        console.warn('[AGENT_CONTEXT] Transition warning:', res.error);
        return state;
      }
      return {
        ...state,
        machine: newMachine,
        agentMessage: getAgentPromptForState(newMachine.state),
      };
    }
    case 'SET_POLLING':
      return { ...state, isPolling: action.isPolling };
    case 'SET_POLL_ERROR':
      return { ...state, pollError: action.error };
    case 'SET_AGENT_MESSAGE':
      return { ...state, agentMessage: action.message };
    case 'RESET':
      return {
        machine: createDonationStateMachine(),
        isPolling: false,
        pollError: null,
        agentMessage: 'Welcome! Choose an amount to support KCM Ministry outreach.',
      };
    default:
      return state;
  }
}

function getAgentPromptForState(state: DonationStateType): string {
  switch (state) {
    case DonationState.IDLE:
      return 'Select or enter your donation amount to begin.';
    case DonationState.AMOUNT_SELECTED:
      return 'Amount selected. Please provide your details to personalize your receipt.';
    case DonationState.DONOR_FILLED:
      return 'Details validated! Proceeding to generate secure Razorpay UPI QR...';
    case DonationState.ORDER_CREATING:
      return 'Connecting to Razorpay gateway to generate dynamic UPI QR code...';
    case DonationState.ORDER_CREATED:
    case DonationState.QR_DISPLAYED:
    case DonationState.PAYMENT_WAITING:
      return 'Scan the UPI QR code with GPay, PhonePe, Paytm, or BHIM. Live status is being monitored...';
    case DonationState.PAYMENT_PROCESSING:
      return 'Payment detected! Verifying transaction signature and amount on backend...';
    case DonationState.PAYMENT_VERIFIED:
    case DonationState.RECEIPT_GENERATING:
      return 'Payment verified! Generating official 80G tax tax receipt PDF...';
    case DonationState.RECEIPT_GENERATED:
    case DonationState.NOTIFICATIONS_SENDING:
      return 'Sending instant email, SMS, and WhatsApp notifications...';
    case DonationState.COMPLETED:
      return '🎉 Donation complete! Your official receipt is ready for download.';
    case DonationState.EXPIRED:
      return 'QR code session expired for security. Please generate a new QR code.';
    case DonationState.FAILED:
      return 'Payment verification failed or timed out. You can retry safely.';
    default:
      return 'Guiding your donation process securely.';
  }
}

// ─── Context Definition ───────────────────────────────────────────────────────

interface DonationAgentContextType {
  state: DonationStateType;
  context: DonationContext;
  wizardStep: 1 | 2 | 3 | 4;
  label: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  agentMessage: string;
  isPolling: boolean;
  pollError: string | null;

  // Agent Actions
  selectAmount: (amount: number, purposeCode?: string, branchId?: string) => void;
  fillDonorInfo: (info: { donorName: string; donorEmail?: string; donorPhone?: string; isAnonymous?: boolean; [key: string]: any }) => void;
  setOrderCreated: (orderData: { sessionId: string; donationId: string; orderId: string; referenceNumber: string; qrCodeBase64: string; upiUri: string; expiresAt: string }) => void;
  startPolling: (sessionId: string) => void;
  stopPolling: () => void;
  cancelSession: (reason?: string) => void;
  resetAgent: () => void;
  trackEvent: (event: string, metadata?: Record<string, any>) => void;
}

const DonationAgentContext = createContext<DonationAgentContextType | null>(null);

// ─── Provider Component ───────────────────────────────────────────────────────

export function DonationAgentProvider({ children }: { children: React.ReactNode }) {
  const [agentState, dispatch] = useReducer(agentReducer, null, () => ({
    machine: createDonationStateMachine(),
    isPolling: false,
    pollError: null,
    agentMessage: 'Welcome! Choose an amount to support KCM Ministry outreach.',
  }));

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track event via API
  const trackEvent = useCallback((event: string, metadata?: Record<string, any>) => {
    fetch('/api/donations/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        sessionId: agentState.machine.context.sessionId,
        donationId: agentState.machine.context.donationId,
        amount: agentState.machine.context.amount,
        metadata,
      }),
    }).catch(() => {});
  }, [agentState.machine.context]);

  // Action helpers
  const selectAmount = useCallback((amount: number, purposeCode?: string, branchId?: string) => {
    dispatch({
      type: 'TRANSITION',
      event: DonationEvent.SELECT_AMOUNT,
      payload: { amount, purposeCode, branchId },
    });
    trackEvent('AMOUNT_CONFIRMED', { amount, purposeCode, branchId });
  }, [trackEvent]);

  const fillDonorInfo = useCallback((info: any) => {
    dispatch({
      type: 'TRANSITION',
      event: DonationEvent.FILL_DONOR_INFO,
      payload: {
        donorName: info.donorName,
        donorEmail: info.donorEmail,
        donorPhone: info.donorPhone,
        isAnonymous: !!info.isAnonymous,
      },
    });
    trackEvent('DONOR_FORM_COMPLETED', info);
  }, [trackEvent]);

  const setOrderCreated = useCallback((orderData: any) => {
    dispatch({
      type: 'TRANSITION',
      event: DonationEvent.CREATE_ORDER,
    });

    dispatch({
      type: 'TRANSITION',
      event: DonationEvent.ORDER_SUCCESS,
      payload: {
        sessionId: orderData.sessionId,
        donationId: orderData.donationId,
        orderId: orderData.orderId,
        referenceNumber: orderData.referenceNumber,
        qrCodeBase64: orderData.qrCode,
        upiUri: orderData.upiUri,
        expiresAt: new Date(orderData.expiresAt),
      },
    });

    dispatch({ type: 'TRANSITION', event: DonationEvent.DISPLAY_QR });
    trackEvent('QR_DISPLAYED', { sessionId: orderData.sessionId });
  }, [trackEvent]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    dispatch({ type: 'SET_POLLING', isPolling: false });
  }, []);

  // Poll backend for payment completion
  const startPolling = useCallback((sessionId: string) => {
    stopPolling();
    dispatch({ type: 'SET_POLLING', isPolling: true });
    dispatch({ type: 'TRANSITION', event: DonationEvent.START_POLLING });

    let attempts = 0;
    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      if (attempts > 200) { // ~10 min
        stopPolling();
        dispatch({ type: 'TRANSITION', event: DonationEvent.QR_EXPIRED });
        return;
      }

      try {
        const res = await fetch(`/api/donations/agent?sessionId=${sessionId}`);
        if (!res.ok) return;

        const data = await res.json();
        if (data.success) {
          if (data.state === DonationState.COMPLETED) {
            stopPolling();
            dispatch({
              type: 'TRANSITION',
              event: DonationEvent.PAYMENT_DETECTED,
            });
            dispatch({
              type: 'TRANSITION',
              event: DonationEvent.PAYMENT_CONFIRMED,
              payload: { donationId: data.donationId, receiptId: data.receiptId, receiptNumber: data.receiptNumber },
            });
            dispatch({ type: 'TRANSITION', event: DonationEvent.START_RECEIPT });
            dispatch({ type: 'TRANSITION', event: DonationEvent.RECEIPT_READY });
            dispatch({ type: 'TRANSITION', event: DonationEvent.SEND_NOTIFICATIONS });
            dispatch({ type: 'TRANSITION', event: DonationEvent.COMPLETE });
          } else if (data.state === DonationState.EXPIRED) {
            stopPolling();
            dispatch({ type: 'TRANSITION', event: DonationEvent.QR_EXPIRED });
          } else if (data.state === DonationState.FAILED) {
            stopPolling();
            dispatch({ type: 'TRANSITION', event: DonationEvent.PAYMENT_FAILED });
          }
        }
      } catch {
        // Retry silently
      }
    }, 3000);
  }, [stopPolling]);

  const cancelSession = useCallback((reason = 'User cancelled') => {
    stopPolling();
    const sessionId = agentState.machine.context.sessionId;
    if (sessionId) {
      fetch('/api/donations/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', sessionId, reason }),
      }).catch(() => {});
    }
    dispatch({ type: 'TRANSITION', event: DonationEvent.CANCEL });
  }, [agentState.machine.context.sessionId, stopPolling]);

  const resetAgent = useCallback(() => {
    stopPolling();
    dispatch({ type: 'RESET' });
  }, [stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const currentState = agentState.machine.state;

  return (
    <DonationAgentContext.Provider
      value={{
        state: currentState,
        context: agentState.machine.context,
        wizardStep: stateToWizardStep(currentState),
        label: stateLabel(currentState),
        color: stateColor(currentState),
        agentMessage: agentState.agentMessage,
        isPolling: agentState.isPolling,
        pollError: agentState.pollError,
        selectAmount,
        fillDonorInfo,
        setOrderCreated,
        startPolling,
        stopPolling,
        cancelSession,
        resetAgent,
        trackEvent,
      }}
    >
      {children}
    </DonationAgentContext.Provider>
  );
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────

export function useDonationAgent() {
  const ctx = useContext(DonationAgentContext);
  if (!ctx) {
    throw new Error('useDonationAgent must be used within a DonationAgentProvider');
  }
  return ctx;
}
