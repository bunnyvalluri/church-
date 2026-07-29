# Publish / Subscribe Pattern Implementation Guide

## Overview
The Publish/Subscribe pattern provides 1-to-N event broadcasting across microservices.

## Code Example: Publisher (Node.js TypeScript)
```typescript
import { EventPublisher } from '../publishers/publisher';

const publisher = new EventPublisher();

// Ephemeral Pub/Sub (Fire-and-forget for live UI updates)
publisher.publish('prayer.events.requested', {
  requestId: 'req-9912',
  memberId: 'mem-4512',
  category: 'Healing',
  isUrgent: true,
});
```

## Code Example: Queue Group Subscriber
Queue groups distribute message load among multiple consumer instances so each message is processed by only ONE subscriber in the group.

```typescript
import { EventSubscriber } from '../subscribers/subscriber';

const subscriber = new EventSubscriber();

await subscriber.subscribeDurableConsumer(
  'KCM_NOTIFICATIONS_STREAM',
  'EMAIL_WORKER_GROUP',
  async (event, msg) => {
    console.log('Sending email notification to:', event.payload.recipientEmail);
  }
);
```
