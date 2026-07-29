/**
 * Enterprise NATS JetStream Consumer & Subscriber for Kingdom of Christ Ministries
 * Supports Queue Groups, Durable Consumers, Exponential Retry Backoff, and Dead Letter Queue Handling
 */

import { NatsClientManager } from '../publishers/natsClient';
import { EventEnvelope } from '../publishers/publisher';
import { JsMsg } from 'nats';

export type EventHandler<T> = (event: EventEnvelope<T>, msg: JsMsg) => Promise<void>;

export class EventSubscriber {
  private clientManager = NatsClientManager.getInstance();

  /**
   * Consume persistent messages from a JetStream Stream using a Durable Queue Consumer
   */
  public async subscribeDurableConsumer<T>(
    streamName: string,
    consumerName: string,
    handler: EventHandler<T>
  ): Promise<void> {
    const js = this.clientManager.getJetStream();
    const codec = this.clientManager.getCodec();

    try {
      const consumer = await js.consumers.get(streamName, consumerName);
      console.log(`Subscribed to Durable Consumer: ${consumerName} on Stream: ${streamName}`);

      const messages = await consumer.consume();
      
      (async () => {
        for await (const msg of messages) {
          try {
            const envelope = codec.decode(msg.data) as EventEnvelope<T>;
            console.log(`Processing Msg Seq: ${msg.seq} [${envelope.eventType}] (Deliveries: ${msg.info.deliveryCount})`);

            // Execute application business logic handler
            await handler(envelope, msg);

            // Acknowledge successful processing
            msg.ack();

          } catch (handlerError) {
            console.error(`Error handling message Seq: ${msg.seq}:`, handlerError);

            // If max deliveries reached, nak or send to Dead Letter Queue (DLQ)
            if (msg.info.deliveryCount >= 3) {
              console.warn(`Max retries reached for message Seq: ${msg.seq}. Sending to DLQ...`);
              await this.publishToDLQ(msg, handlerError);
              msg.term(); // Terminate message to prevent further redelivery
            } else {
              // Exponential backoff NAK
              const backoffDelayMs = Math.pow(2, msg.info.deliveryCount) * 1000;
              msg.nak(backoffDelayMs);
            }
          }
        }
      })().catch(err => console.error('Consumer iterator error:', err));

    } catch (error) {
      console.error(`Failed to start JetStream subscriber for ${consumerName}:`, error);
      throw error;
    }
  }

  /**
   * Publish unprocessable messages to Dead Letter Queue (DLQ) Stream
   */
  private async publishToDLQ(msg: JsMsg, error: any): Promise<void> {
    const js = this.clientManager.getJetStream();
    const codec = this.clientManager.getCodec();

    const dlqPayload = {
      originalSubject: msg.subject,
      sequence: msg.seq,
      deliveryCount: msg.info.deliveryCount,
      error: error?.message || String(error),
      payload: codec.decode(msg.data),
      failedAt: new Date().toISOString(),
    };

    try {
      await js.publish(`audit.logs.dlq.${msg.subject}`, codec.encode(dlqPayload));
      console.log(`Successfully published message Seq: ${msg.seq} to DLQ stream`);
    } catch (dlqErr) {
      console.error('Failed to publish to DLQ:', dlqErr);
    }
  }
}
