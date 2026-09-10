/**
 * frontend/lib/agentReachClient.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Frontend Client SDK for interacting with Agent Reach API endpoints & Socket.io
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { io, Socket } from 'socket.io-client';

function getBackendUrl(): string {
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const envUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_SOCKET_URL || '').trim();
    if (isHttps) {
      if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1') || envUrl.startsWith('http://') || envUrl.startsWith('ws://')) {
        return '';
      }
      return envUrl;
    }
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return envUrl || 'http://localhost:3001';
    }
    return envUrl;
  }
  if (process.env.NODE_ENV === 'production') {
    return (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_SOCKET_URL || '').trim();
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
}

export interface AgentSource {
  id?: string;
  sourceType: string;
  title: string;
  url?: string;
  author?: string;
  publishedAt?: string;
  snippet?: string;
  metadata?: any;
}

export interface AgentTask {
  id: string;
  agentType: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  query: string;
  parameters?: any;
  summaryResult?: any;
  markdownReport?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  sources?: AgentSource[];
}

export interface ProgressEvent {
  taskId: string;
  step?: number;
  message?: string;
  source?: AgentSource;
  task?: AgentTask;
  markdownReport?: string;
  timestamp: string;
}

let socketInstance: Socket | null = null;

const createNoopSocket = (): Socket => ({
  id: 'noop',
  connected: false,
  disconnected: true,
  on: () => {},
  off: () => {},
  emit: () => false,
  connect: () => {},
  disconnect: () => {},
  close: () => {},
} as unknown as Socket);

export function getAgentSocket(): Socket {
  if (!socketInstance) {
    const url = getBackendUrl();
    if (!url) {
      // In production HTTPS without a configured external backend URL, return safe noop
      return createNoopSocket();
    }

    const isLocalhostDomain = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const shouldConnect = Boolean(url && (!url.includes('localhost') || isLocalhostDomain));

    socketInstance = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      autoConnect: shouldConnect
    });
  }
  return socketInstance;
}

export async function executeSermonResearch(payload: { query?: string; scripture?: string; topic?: string }) {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return { success: false, error: 'Agent backend server is not available.' };
  const res = await fetch(`${backendUrl}/api/agents/sermon-research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchChurchNews() {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return { success: false, error: 'Agent backend server is not available.', articles: [] };
  const res = await fetch(`${backendUrl}/api/agents/church-news`);
  return res.json();
}

export async function triggerChurchNewsFetch() {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return { success: false, error: 'Agent backend server is not available.' };
  const res = await fetch(`${backendUrl}/api/agents/church-news/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ forceRefresh: true })
  });
  return res.json();
}

export async function executeEventInspiration(payload: { topic?: string; targetAudience?: string; eventType?: string }) {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return { success: false, error: 'Agent backend server is not available.' };
  const res = await fetch(`${backendUrl}/api/agents/event-inspiration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function executeSocialContent(payload: { mediaUrl?: string; publicId?: string; eventTitle?: string; eventDescription?: string }) {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return { success: false, error: 'Agent backend server is not available.' };
  const res = await fetch(`${backendUrl}/api/agents/social-content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function executeDeveloperSupport(payload: { query?: string; errorLog?: string; stackTrace?: string }) {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return { success: false, error: 'Agent backend server is not available.' };
  const res = await fetch(`${backendUrl}/api/agents/developer-support`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchAgentTaskHistory() {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return { success: false, error: 'Agent backend server is not available.', tasks: [] };
  const res = await fetch(`${backendUrl}/api/agents/tasks`);
  return res.json();
}

export async function fetchTaskDetails(id: string) {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return { success: false, error: 'Agent backend server is not available.' };
  const res = await fetch(`${backendUrl}/api/agents/tasks/${id}`);
  return res.json();
}
