# ADR-005: AI Security Guardrails, Prompt Defense & Sensitive Output Redaction

## Status
`ACCEPTED`

## Context
AI-powered features (OpenClaw church orchestrator, scripture assistance) require protection against prompt injection, jailbreaking, data exfiltration, and unauthorized privileged actions.

## Decision
Enforce a multi-stage security pipeline:
1. Input evaluation for prompt injection vectors and adversarial patterns (`evaluatePromptSecurity`).
2. Strict tool allowlisting with zero direct database execution permissions.
3. Deterministic output redaction masking database connection strings, JWTs, and API credentials before rendering to the client (`redactSensitiveOutput`).

## Consequences
- **Positive**: Complete defense against prompt injection attacks, zero secret leakage to chat interfaces.
- **Negative**: Adds ~10-20ms preprocessing overhead per model request.
