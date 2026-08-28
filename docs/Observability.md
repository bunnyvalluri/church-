# End-to-End Observability & Distributed Tracing

## Purpose
This document specifies the unified observability architecture across the three foundational pillars—**Metrics**, **Logs**, and **Distributed Traces**—for the Kingdom of Christ Ministries platform.

## Scope
Covers Prometheus metrics, Grafana Loki structured logs, OpenTelemetry (OTel) distributed tracing, and Jaeger trace aggregation.

## Status
> Status: Implemented

---

## 1. The Three Pillars of Observability

```mermaid
graph TD
    subgraph 1. Metrics (Prometheus)
        MetricsData[Numeric Time-Series: Request Counts, Latencies, CPU/Memory Utilization]
    end

    subgraph 2. Structured Logs (Loki)
        LogsData[JSON Log Streams with Context: CorrelationID, ActorID, Error Stack]
    end

    subgraph 3. Distributed Traces (Jaeger / OTel)
        TracesData[End-to-End Spans: Client Request -> Gateway -> Next.js -> Backend -> Postgres]
    end

    Correlator[Unified Correlation Engine: Grafana Explore]
    
    MetricsData --> Correlator
    LogsData --> Correlator
    TracesData --> Correlator

    Correlator --> RapidTriage[Sub-60s Incident Root Cause Identification]
```

---

## 2. Correlation Engine & Context Propagation

To allow instant jump from an error log to its exact distributed trace and Prometheus metric spike:
1. **Trace Context Propagation**: Incoming HTTP requests at Envoy Gateway receive a standard W3C `traceparent` header.
2. **Log Correlation**: Application loggers automatically inject `traceId` and `spanId` into every structured JSON log line.
3. **Grafana Trace-to-Logs**: Clicking an error span in Grafana Tempo/Jaeger automatically queries Loki for all logs emitted during that span's exact microsecond execution window.

---

## 3. Service Level Objectives (SLOs) & Error Budgets

| Service Objective | Target SLO | Measurement Window | Error Budget Exhaustion Alert |
| :--- | :--- | :--- | :--- |
| **API Availability** | `99.95%` (<= 0.05% 5xx errors) | 30-Day Rolling Window | Fires if 10% of monthly budget consumed in 1 hour |
| **P95 Transaction Latency** | `<= 300ms` for core endpoints | 7-Day Rolling Window | Fires if P95 latency > 500ms for > 15 minutes |
| **Donation Webhook Delivery** | `99.99%` successful delivery | 30-Day Rolling Window | Fires immediately on 3 consecutive failed webhooks |

---

## 4. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Traces missing downstream database spans | Prisma query tracing extension not enabled | Enable `previewFeatures = ["tracing"]` in Prisma schema and initialize OpenTelemetry Prisma instrumentation. |
| High trace storage ingestion costs | Tracing 100% of high-volume health check probes | Configure OpenTelemetry probabilistic head sampler: sample 100% of errors (`status >= 400`) and 5% of healthy requests. |

---

## Security Considerations
- Distributed traces redact sensitive query parameters (passwords, tokens, PAN numbers) before transmitting spans to Jaeger.

## Related Documentation
- [Monitoring.md](Monitoring.md) — Prometheus metrics and alerting.
- [Logging.md](Logging.md) — Loki structured logging.
- [Health-Checks.md](Health-Checks.md) — Health check probe specifications.
