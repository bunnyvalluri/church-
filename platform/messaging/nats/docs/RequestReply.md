# Request / Reply Pattern Implementation Guide

## Overview
The Request/Reply pattern enables synchronous point-to-point microservice RPC calls over NATS without requiring separate HTTP REST clients or service meshes.

## Request/Reply Sequence Flow

```
 Requester (Node.js API)                          Replier (Worker Service)
         |                                                   |
         | --- Request Subject: `pastors.counseling.check` ->|
         |     Reply Subject: `_INBOX.x7a91k...`             |
         |                                                   |
         |                                         (Process Request)
         |                                                   |
         |<-- Response Payload via `_INBOX.x7a91k...` -------|
```

## Client Implementation Code
```typescript
import { EventPublisher } from '../publishers/publisher';

const publisher = new EventPublisher();

// Send RPC request and await response with 3s timeout
const result = await publisher.request('pastors.counseling.check', {
  pastorId: 'pas-101',
  requestedDate: '2026-08-01T10:00:00Z'
}, 3000);

console.log('Counseling Availability:', result);
```
