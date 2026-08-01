/**
 * frontend/lib/agentReachClient.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Frontend Client SDK for interacting with Agent Reach API endpoints & Socket.io
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

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

export function getAgentSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      autoConnect: true
    });
  }
  return socketInstance;
}

export async function executeSermonResearch(payload: { query?: string; scripture?: string; topic?: string }) {
  const res = await fetch(`${BACKEND_URL}/api/agents/sermon-research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchChurchNews() {
  const res = await fetch(`${BACKEND_URL}/api/agents/church-news`);
  return res.json();
}

export async function triggerChurchNewsFetch() {
  const res = await fetch(`${BACKEND_URL}/api/agents/church-news/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ forceRefresh: true })
  });
  return res.json();
}

export async function executeEventInspiration(payload: { topic?: string; targetAudience?: string; eventType?: string }) {
  const res = await fetch(`${BACKEND_URL}/api/agents/event-inspiration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function executeSocialContent(payload: { mediaUrl?: string; publicId?: string; eventTitle?: string; eventDescription?: string }) {
  const res = await fetch(`${BACKEND_URL}/api/agents/social-content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function executeDeveloperSupport(payload: { query?: string; errorLog?: string; stackTrace?: string }) {
  const res = await fetch(`${BACKEND_URL}/api/agents/developer-support`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchAgentTaskHistory() {
  const res = await fetch(`${BACKEND_URL}/api/agents/tasks`);
  return res.json();
}

export async function fetchTaskDetails(id: string) {
  const res = await fetch(`${BACKEND_URL}/api/agents/tasks/${id}`);
  return res.json();
}
