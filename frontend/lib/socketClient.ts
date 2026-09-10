/**
 * frontend/lib/socketClient.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized, production-resilient Socket.IO Client SDK for KCM Church Portal.
 *
 * Key Architecture Rules:
 *  1. ZERO localhost WebSocket attempts in production HTTPS (kcmchurch.vercel.app).
 *  2. Circuit-breaker: If NEXT_PUBLIC_SOCKET_URL is unset or points to localhost
 *     in a production browser environment, socket connections stay IDLE (null).
 *  3. Controlled exponential backoff: Caps reconnection attempts at 3, preventing
 *     browser console spam when companion server is offline.
 *  4. Secure transport: Prioritizes WebSockets with graceful polling fallback.
 *  5. Optional token-based authentication pass-through for authenticated rooms.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Socket } from 'socket.io-client';

export interface ManagedSocketOptions {
  auth?: Record<string, any>;
  path?: string;
  autoConnect?: boolean;
}

/**
 * Resolves the valid WebSocket URL based on execution environment.
 * Returns `null` if running in production HTTPS and no valid secure endpoint is provided.
 */
export function getSocketUrl(): string | null {
  if (typeof window === 'undefined') {
    // Server-side rendering context
    return null;
  }

  const configuredUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  const isHttps = window.location.protocol === 'https:';
  const isLocalHostDomain =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local');

  // In production HTTPS, enforce secure endpoints and reject localhost/unencrypted
  if (isHttps) {
    if (!configuredUrl) {
      return null;
    }
    const isConfiguredLocal =
      configuredUrl.includes('localhost') ||
      configuredUrl.includes('127.0.0.1') ||
      configuredUrl.startsWith('http://') ||
      configuredUrl.startsWith('ws://');

    if (isConfiguredLocal) {
      // Insecure or localhost URL disallowed on production HTTPS
      return null;
    }

    return configuredUrl;
  }

  // In local development or HTTP test environments
  if (isLocalHostDomain) {
    return configuredUrl || 'http://localhost:3001';
  }

  return configuredUrl || null;
}

let sharedSocketInstance: Socket | null = null;
let isInitializing = false;

/**
 * Returns the singleton Socket.IO instance if a valid URL exists.
 * If running on production HTTPS without a companion backend, returns null safely.
 */
export async function getSharedSocket(options: ManagedSocketOptions = {}): Promise<Socket | null> {
  if (typeof window === 'undefined') return null;

  const url = getSocketUrl();
  if (!url) {
    return null;
  }

  if (sharedSocketInstance && sharedSocketInstance.connected) {
    return sharedSocketInstance;
  }

  if (sharedSocketInstance && !sharedSocketInstance.connected) {
    return sharedSocketInstance;
  }

  if (isInitializing) {
    // Wait briefly if already initializing
    await new Promise((r) => setTimeout(r, 100));
    return sharedSocketInstance;
  }

  isInitializing = true;
  try {
    const { io } = await import('socket.io-client');

    sharedSocketInstance = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      timeout: 8000,
      autoConnect: options.autoConnect ?? true,
      auth: options.auth,
      path: options.path || '/socket.io',
    });

    sharedSocketInstance.on('connect_error', (err) => {
      // Suppress noisy repeating errors when companion backend is unavailable
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[SOCKET] Companion server offline/unreachable:', err.message);
      }
    });

    return sharedSocketInstance;
  } catch (err) {
    console.warn('[SOCKET] Failed to load socket.io-client:', err);
    return null;
  } finally {
    isInitializing = false;
  }
}

/**
 * Creates a dedicated isolated socket for specific scoped components (e.g. Donation flow).
 * Also respects the production HTTPS circuit-breaker.
 */
export async function createDedicatedSocket(options: ManagedSocketOptions = {}): Promise<Socket | null> {
  if (typeof window === 'undefined') return null;

  const url = getSocketUrl();
  if (!url) return null;

  try {
    const { io } = await import('socket.io-client');
    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 8000,
      autoConnect: options.autoConnect ?? true,
      auth: options.auth,
      path: options.path || '/socket.io',
    });

    socket.on('connect_error', () => {
      // Quiet handler
    });

    return socket;
  } catch {
    return null;
  }
}
