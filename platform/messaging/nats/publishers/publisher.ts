/**
 * Enterprise NATS Event Publisher for Kingdom of Christ Ministries
 * Supports Core Pub/Sub, JetStream Persistent Publish with Acknowledgment, and Request/Reply RPC
 */

import { NatsClientManager } from './natsClient';
import { PubAck } from 'nats';

export interface EventEnvelope<T = any> {
  eventId: string;
  eventType: string;
  timestamp: string;
  sourceService: string;
  correlationId: string;
  actorId?: string;
  payload: T;
}

export class EventPublisher {
  private clientManager = NatsClientManager.getInstance();

  /**
   * Publish message using standard NATS Pub/Sub (Ephemeral, fast, fire-and-forget)
   */
  public publish<T>(subject: string, payload: T, sourceService = 'kcm-api', correlationId?: string): void {
    const nc = this.clientManager.getConnection();
    const codec = this.clientManager.getCodec();
    const eventHeaders = this.clientManager.createHeaders(correlationId);

    const envelope: EventEnvelope<T> = {
      eventId: crypto.randomUUID(),
      eventType: subject,
      timestamp: new Date().toISOString(),
      sourceService,
      correlationId: correlationId || crypto.randomUUID(),
      payload,
    };

    nc.publish(subject, codec.encode(envelope), { headers: eventHeaders });
  }

  /**
   * Publish message to JetStream with persistent storage acknowledgment (R3 replication guaranteed)
   */
  public async publishJetStream<T>(
    subject: string,
    payload: T,
    sourceService = 'kcm-api',
    correlationId?: string
  ): Promise<PubAck> {
    const js = this.clientManager.getJetStream();
    const codec = this.clientManager.getCodec();
    const eventHeaders = this.clientManager.createHeaders(correlationId);

    const eventId = crypto.randomUUID();
    eventHeaders.set('Nats-Msg-Id', eventId); // De-duplication key

    const envelope: EventEnvelope<T> = {
      eventId,
      eventType: subject,
      timestamp: new Date().toISOString(),
      sourceService,
      correlationId: correlationId || crypto.randomUUID(),
      payload,
    };

    try {
      const pubAck = await js.publish(subject, codec.encode(envelope), { headers: eventHeaders });
      console.log(`JetStream Publish Success [${subject}] - Stream: ${pubAck.stream}, Seq: ${pubAck.seq}`);
      return pubAck;
    } catch (error) {
      console.error(`JetStream Publish Failed [${subject}]:`, error);
      throw error;
    }
  }

  /**
   * Request/Reply RPC Pattern (Synchronous microservice communication)
   */
  public async request<TRequest, TResponse>(
    subject: string,
    requestPayload: TRequest,
    timeoutMs = 5000
  ): Promise<TResponse> {
    const nc = this.clientManager.getConnection();
    const codec = this.clientManager.getCodec();

    try {
      const msg = await nc.request(subject, codec.encode(requestPayload), { timeout: timeoutMs });
      return codec.decode(msg.data) as TResponse;
    } catch (error) {
      console.error(`Request/Reply RPC Timeout or Error [${subject}]:`, error);
      throw error;
    }
  }
}
