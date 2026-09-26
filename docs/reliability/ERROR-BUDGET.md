# KCM Portal — Service Level Indicators (SLI), SLOs & Error Budget Policy

## 1. Scope & Reliability Principles

This document defines the quantitative Service Level Indicators (SLIs), Service Level Objectives (SLOs), and Error Budget policies for the Kingdom of Christ Ministries (KCM) Church Platform.

---

## 2. SLI / SLO Registry

| Service Tier / User Journey | Service Level Indicator (SLI) | Service Level Objective (SLO) | Measurement Window | Target Status |
| :--- | :--- | :--- | :--- | :--- |
| **Core Portal Availability** | $\frac{\text{Successful HTTP Requests (2xx/3xx)}}{\text{Total Valid Requests}} \times 100$ | **99.9% Availability** | Rolling 30 Days | `ESTABLISHED` |
| **Edge API Latency** | $\% \text{ of HTTP requests completed in } < 300\text{ms}$ | **p95 < 300ms / p99 < 800ms** | Rolling 30 Days | `ESTABLISHED` |
| **Authentication Flow (GIS & Local)** | $\frac{\text{Successful Logins}}{\text{Valid Login Attempts}} \times 100$ | **99.95% Success Rate** | Rolling 7 Days | `ESTABLISHED` |
| **Database Query Availability (Neon/PG)**| $\frac{\text{Healthy DB Connection Checks}}{\text{Total Probes}} \times 100$ | **99.95% Uptime** | Rolling 30 Days | `ESTABLISHED` |
| **Payment Webhook Processing** | $\frac{\text{Idempotent Webhooks Processed without Error}}{\text{Total Webhook Events Received}} \times 100$ | **99.99% Reliability** | Rolling 30 Days | `ESTABLISHED` |
| **Offline PWA Data Sync** | $\frac{\text{Synced Client Transactions}}{\text{Total Online Sync Batches}} \times 100$ | **99.9% Sync Success** | Rolling 30 Days | `ESTABLISHED` |
| **Transactional Email Delivery** | $\frac{\text{Emails Delivered / Queued}}{\text{Total Valid Email Requests}} \times 100$ | **99.5% Delivery Rate** | Rolling 30 Days | `ESTABLISHED` |

---

## 3. Error Budget Calculation & Burn Rate Policies

### Monthly Error Budget Matrix (Assuming 1,000,000 requests/month)

| Target SLO | Allowed Unavailability (per 30 Days) | Max Allowed Failed Requests (per 1M reqs) |
| :--- | :--- | :--- |
| **99.9% (Core API)** | **43.2 Minutes** | **1,000 Failed Requests** |
| **99.95% (Auth & DB)** | **21.6 Minutes** | **500 Failed Requests** |
| **99.99% (Payments)** | **4.32 Minutes** | **100 Failed Requests** |

### Error Budget Burn Rate Action Triggers

```
+-----------------------------------------------------------------------------------+
|                        ERROR BUDGET CONSUMPTION POLICIES                          |
+-----------------------------------------------------------------------------------+
| 1. Normal State (< 25% Budget Burned):                                            |
|    - Normal feature deployments and active engineering workflows.                 |
|                                                                                   |
| 2. Elevated Alert (25% - 75% Budget Burned):                                      |
|    - Automated notification sent to on-call engineer via Grafana / Slack.         |
|    - Non-essential releases undergo mandatory staging canary validation.          |
|                                                                                   |
| 3. Critical State (> 75% Budget Burned):                                          |
|    - Feature deployment freeze enforced.                                          |
|    - Engineering focus pivots 100% to reliability, bug fixing, and circuit breaker|
|      hardening until budget recovers.                                             |
+-----------------------------------------------------------------------------------+
```

---

## 4. Measurement Methodology & Telemetry Sources

- **Prometheus Counters**:
  - `http_requests_total{status=~"2..|3.."}` vs `http_requests_total`
  - `http_request_duration_seconds_bucket` for latency SLIs
  - `kcm_email_delivery_total{status="sent"}`
  - `kcm_offline_sync_total{status="success"}`
- **Grafana SLI Dashboard**: Located at `monitoring/dashboards/sli-slo-overview.json`.
