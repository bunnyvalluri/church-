# Container Image Scanning Documentation

## Overview
Automated container image scanning covers every workload container image in the KCM Church platform stack, ensuring zero unpatched `CRITICAL` or `HIGH` vulnerabilities reach production.

---

## 1. Scanned Image Inventory

| Workload Component | Target Image | Base OS | Scan Policy |
| :--- | :--- | :--- | :--- |
| **Frontend App** | `ghcr.io/kcm-church/kcm-portal` | Alpine 3.19 | Block on CRITICAL/HIGH |
| **Backend API** | `ghcr.io/kcm-church/kcm-api` | Alpine 3.19 | Block on CRITICAL/HIGH |
| **Database** | `ghcr.io/cloudnative-pg/postgresql` | Debian Bookworm | Daily automated audit |
| **Redis Cache** | `redis:7.2-alpine` | Alpine 3.19 | Daily automated audit |
| **NATS Messaging** | `nats:2.10-alpine` | Alpine 3.19 | Daily automated audit |
| **Apache Kafka** | `apache/kafka:3.7.0` | Ubuntu Minimal | Daily automated audit |
| **Istio Service Mesh** | `docker.io/istio/proxyv2:1.20.0` | Ubuntu Minimal | Daily automated audit |
| **Envoy Gateway** | `docker.io/envoyproxy/envoy:v1.29.0` | Ubuntu Minimal | Daily automated audit |
| **Longhorn Storage** | `longhornio/longhorn-engine:v1.6.0` | Ubuntu Minimal | Daily automated audit |
| **Velero Backup** | `velero/velero:v1.13.0` | Alpine 3.19 | Daily automated audit |

---

## 2. Automated Image Pipeline Integration
Container images built in GitHub Actions trigger `aquasecurity/trivy-action` immediately following `docker build`. Images failing the severity thresholds are prevented from pushing to GitHub Container Registry (GHCR).
