# High Availability Architecture

The Kubernetes migration transforms the single-server application into a decoupled, horizontally scalable architecture.

## Architecture Diagram

```mermaid
graph TD
    Client((Web Browser)) --> DNS[DNS / Route53]
    DNS --> LB[Cloud Load Balancer]
    LB --> Ingress[NGINX Ingress Controller]

    subgrade cluster
        Ingress -- / --> Frontend[Frontend Deployment HPA 3-15]
        Ingress -- /api --> API[API Deployment HPA 3-10]
        Ingress -- /socket.io --> Socket[Socket Deployment HPA 3-20]
        
        Cron[CronJob Scheduled]
        Worker[Worker Deployment]
    end

    Frontend -.-> |Fetch Data| API
    Frontend -.-> |WebSocket| Socket
    
    API --> Neon[(Neon PostgreSQL)]
    Worker --> Neon
    Cron --> Neon

    API --> Redis[(External Redis Pub/Sub)]
    Socket <--> Redis
    Worker <--> Redis

    Worker --> Cloudinary((Cloudinary Media))
```

## Key Components

1. **Next.js Frontend (HPA)**: Served as a decoupled service, communicating with the API via the Ingress. Scales based on CPU utilization.
2. **API Backend (HPA)**: The Node.js Express server acting as a Webhook receiver and REST API. Uses `socket.io-redis-emitter` to publish real-time events to the Redis backend.
3. **Socket.io Service (HPA)**: Dedicated Node.js processes handling persistent WebSocket connections. Uses `@socket.io/redis-adapter` to synchronize state across multiple Pods, ensuring users receive events regardless of which pod they connect to.
4. **Background Worker**: Consumes BullMQ jobs from Redis. Does not need to be exposed to the internet.
5. **CronJobs**: Uses Kubernetes native CronJobs to spin up ephemeral pods that run a script and terminate, ensuring reliable task scheduling without memory leaks.
