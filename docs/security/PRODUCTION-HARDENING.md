# Production Hardening Checklist — KCM Assistant

This document provides the operational pre-flight and production checklist for the **KCM Assistant** deployment.

---

## 1. Production Security Checklist

- [x] **Authentication & RBAC**: `POST /api/chat` validates session cookie and derives user role (`PUBLIC`, `MEMBER`, `PASTOR`, `ADMIN`) server-side.
- [x] **Prompt Injection Defense**: Multilingual regex & heuristic classifier active for English, Telugu (`తెలుగు`), Hindi (`हिंदी`), and Romanized variations.
- [x] **Zero Direct DB Access**: LLM has zero direct database credentials and executes only through typed, authorized Prisma tools in `AI_TOOL_REGISTRY`.
- [x] **Cross-User Data Isolation**: `ownerId === authUser.uid` enforced for all member tools (`get_my_prayers`, `get_my_profile`).
- [x] **Output Redaction**: Stream output filter masks API keys, database connection strings, JWT tokens, passwords, and credit card numbers.
- [x] **XSS Sanitization**: Markdown link renderer rejects `javascript:`, `data:`, `vbscript:` protocols and enforces valid HTTPS / internal relative paths.
- [x] **Multi-Tier Rate Limiting**: Token bucket rate limiters configured per tier (10/min public, 30/min member, 60/min pastor, 100/min admin).
- [x] **AI Cost & Resource Bounds**: Max tokens (350), 12s timeout, bounded history (6 messages).
- [x] **Crisis Intervention**: Emergency crisis detection returns immediate helpline guidance (14416 Tele-MANAS / 988) and pastor support number.
- [x] **Environment Validation**: Clean build passing with 0 TypeScript compilation errors and 0 build errors.
