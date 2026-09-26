# KCM Portal — AI Architecture & Security Guardrails

## 1. AI Assistant & OpenClaw Orchestrator Architecture

The KCM platform incorporates AI capabilities (Gemini / LangChain) for faith-based guidance, scripture lookup, and church administration under strict architectural guardrails:

```
+-----------------------------------------------------------------------------------+
|                        AI SECURITY & EXECUTION PIPELINE                           |
|                                                                                   |
|  [ User Message / Chat Prompt ]                                                   |
|        |                                                                          |
|        v                                                                          |
|  [ 1. Input Guard ] (Prompt Injection & Jailbreak Scanners - `evaluatePrompt`)    |
|        |                                                                          |
|        v                                                                          |
|  [ 2. Context Builder ] (Authorized User & Scripture Context - Least Privilege)   |
|        |                                                                          |
|        v                                                                          |
|  [ 3. Model Invocation ] (Strict Temperature, Rate Limits, Strict Timeouts)      |
|        |                                                                          |
|        v                                                                          |
|  [ 4. Tool Execution Guard ] (Strict Allowlist: e.g. `lookup_scripture`, NO DB)   |
|        |                                                                          |
|        v                                                                          |
|  [ 5. Output Redactor ] (Masks DB connection strings, API keys, JWT tokens)       |
|        |                                                                          |
|        v                                                                          |
|  [ Safe Markdown Render in Client UI ]                                            |
+-----------------------------------------------------------------------------------+
```

---

## 2. Security Boundaries & Invariants

1. **Zero Privileged DB Access**: The AI model has zero direct execution permissions on PostgreSQL or MongoDB.
2. **Deterministic Output Redaction**: All generated strings pass through [`frontend/lib/ai/aiSecurityPipeline.ts`](file:///c:/K.C.M-Portal/frontend/lib/ai/aiSecurityPipeline.ts) masking regex patterns for database URLs, JWTs, and API credentials.
3. **No Secret Ingestion**: System instructions and prompts strictly exclude server secrets.
