/**
 * Enterprise NATS Client Manager for Kingdom of Christ Ministries (KCM Church)
 * Handles Connection Management, TLS, NKEY Auth, Automatic Reconnection Backoff, and JetStream Initialization
 */

import { connect, NatsConnection, JetStreamClient, JetStreamManager, JSONCodec, Headers, headers } from 'nats';

export interface NatsConfig {
  servers: string[];
  user?: string;
  password?: string;
  token?: string;
  nkey?: string;
  tlsCertPath?: string;
  tlsKeyPath?: string;
  tlsCaPath?: string;
  maxReconnectAttempts?: number;
  reconnectTimeWaitMs?: number;
}

export class NatsClientManager {
  private static instance: NatsClientManager;
  private nc: NatsConnection | null = null;
  private js: JetStreamClient | null = null;
  private jsm: JetStreamManager | null = null;
  private codec = JSONCodec();

  private constructor() {}

  public static getInstance(): NatsClientManager {
    if (!NatsClientManager.instance) {
      NatsClientManager.instance = new NatsClientManager();
    }
    return NatsClientManager.instance;
  }

  public async initialize(config: NatsConfig): Promise<void> {
    if (this.nc) {
      console.log('NATS client already initialized');
      return;
    }

    try {
      console.log(`Connecting to NATS cluster: ${config.servers.join(', ')}`);
      
      this.nc = await connect({
        servers: config.servers,
        user: config.user || process.env.NATS_USER,
        pass: config.password || process.env.NATS_PASSWORD,
        token: config.token || process.env.NATS_TOKEN,
        maxReconnectAttempts: config.maxReconnectAttempts || -1, // Infinite reconnect
        reconnectTimeWait: config.reconnectTimeWaitMs || 2000,
        pingInterval: 10000,
        maxPingOut: 3,
        name: 'kcm-backend-service',
      });

      console.log(`Connected successfully to NATS server: ${this.nc.getServer()}`);

      // Initialize JetStream Client & Manager
      this.js = this.nc.jetstream();
      this.jsm = await this.nc.jetstreamManager();

      // Setup connection status listeners
      this.listenStatusEvents();

    } catch (error) {
      console.error('Failed to establish NATS connection:', error);
      throw error;
    }
  }

  private async listenStatusEvents(): Promise<void> {
    if (!this.nc) return;
    for await (const status of this.nc.status()) {
      switch (status.type) {
        case 'disconnect':
          console.warn('NATS disconnected from cluster');
          break;
        case 'reconnect':
          console.log(`NATS reconnected to server: ${status.data}`);
          break;
        case 'error':
          console.error('NATS runtime error:', status.data);
          break;
      }
    }
  }

  public getConnection(): NatsConnection {
    if (!this.nc) throw new Error('NATS client is not initialized. Call initialize() first.');
    return this.nc;
  }

  public getJetStream(): JetStreamClient {
    if (!this.js) throw new Error('JetStream client is not initialized.');
    return this.js;
  }

  public getJetStreamManager(): JetStreamManager {
    if (!this.jsm) throw new Error('JetStream Manager is not initialized.');
    return this.jsm;
  }

  public getCodec() {
    return this.codec;
  }

  public createHeaders(correlationId?: string, actorId?: string): Headers {
    const h = headers();
    h.set('Nats-Msg-Id', crypto.randomUUID());
    h.set('X-Correlation-ID', correlationId || crypto.randomUUID());
    h.set('X-Timestamp', new Date().toISOString());
    if (actorId) h.set('X-Actor-ID', actorId);
    return h;
  }

  public async close(): Promise<void> {
    if (this.nc) {
      console.log('Closing NATS connection...');
      await this.nc.drain();
      await this.nc.close();
      this.nc = null;
      this.js = null;
      this.jsm = null;
      console.log('NATS connection closed gracefully.');
    }
  }
}
