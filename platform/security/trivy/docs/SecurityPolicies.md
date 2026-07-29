# Security Policies & Compliance Standards

## Overview
This document defines the automated security policies enforced by Trivy across the KCM Church container and infrastructure platform.

---

## 1. Severity Threshold Policy

| Vulnerability Severity | Fix Available | Enforcement Action |
| :--- | :--- | :--- |
| **CRITICAL** | Yes | Block Build / Block PR / Trigger Alert |
| **CRITICAL** | No (Unpatched) | Quarantine Workload / Escalate to Vendor |
| **HIGH** | Yes | Block Build / Require Fix in 24 Hours |
| **MEDIUM** | Yes | Notify Team / Fix in Sprint Cycle |
| **LOW** | N/A | Log for Information |

---

## 2. Compliance Framework Alignment
- **CIS Kubernetes Benchmark v1.8**: Config audit checks enforce strict PodSecurityStandards (`restricted`).
- **Kubernetes Security Best Practices**: Non-root containers, read-only root filesystems, drop all capabilities.
- **OWASP Top 10 Security Guidance**: Secret scanning prevents sensitive credential exposure.
