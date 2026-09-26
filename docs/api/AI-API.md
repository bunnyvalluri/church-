# KCM AI Assistant & Context Pipeline API Specification

## 1. Pipeline Flow
```
User Prompt (Client)
        |
        v
[Rate Limiter & Auth Check]
        |
        v
[Sanitization & Prompt Injection Guard]
        |
        v
[Context Engine (System Prompt, Church Scripture DB, Branch Info)]
        |
        v
[LLM Inference (Groq / Google AI Studio / OpenRouter)]
        |
        v
[Output Moderation & Theological Safety Check]
        |
        v
[Structured Response + Audit Log in ai_chat_logs]
```

## 2. Security Boundaries
1. **Zero System Prompt Exposure**: The model's internal prompt instructions are not revealed to users.
2. **Least Privilege Context**: User role determines what knowledge items can be retrieved by the context engine. Financial and private member records are never injected into LLM prompts.
3. **Audit Trails**: All queries, latency measurements, and moderation flags are logged to `ai_chat_logs`.
