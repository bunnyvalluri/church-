# AI Security Incident Response Protocol

This document outlines the standard operating procedures for identifying, triaging, mitigating, and documenting AI security incidents affecting the **KCM Assistant**.

---

## 1. Incident Classification

| Severity | Definition | Examples | SLA |
| :--- | :--- | :--- | :--- |
| **P1 - CRITICAL** | Active secret leakage or cross-tenant private data exposure. | API keys returned in chat, unauthorized member prayer request dumped. | $< 15$ mins |
| **P2 - HIGH** | High-volume jailbreak bypass or automated prompt injection campaign. | Sustained bypass of church persona, mass hallucination attacks. | $< 1$ hour |
| **P3 - MEDIUM** | Denial-of-service / rate-limit threshold alerts. | Spikes in 429 errors from single subnet. | $< 4$ hours |
| **P4 - LOW** | Minor formatting anomalies or unhandled edge-case inputs. | Broken markdown links, encoding mismatches. | $< 24$ hours |

---

## 2. Containment & Mitigation Procedures

### Step 1: Immediate Key Rotation (If Credential Leak Occurs)
1. Revoke the exposed API key in OpenRouter / OpenAI / Google Cloud Console.
2. Generate a new key and update Vercel Environment Variables:
   ```powershell
   vercel env add OPENROUTER_API_KEY production
   ```
3. Trigger redeployment to invalidate edge caches.

### Step 2: Emergency Prompt Hardening
- Update `PROMPT_INJECTION_PATTERNS` in `frontend/lib/ai/aiSecurityPipeline.ts` with newly observed attack signatures.
- Deploy hotfix immediately to production.

### Step 3: Audit Logging & Post-Mortem
- Review `AIChatLog` in PostgreSQL for the affected timeframe.
- Document Root Cause Analysis (RCA) in `docs/security/incidents/`.
