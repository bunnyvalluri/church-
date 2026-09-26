# Agent Configuration & Development Harness Audit

## Purpose
This document catalogs all AI agent harness elements, skills, workflows, and session configurations within `.agent/`, `.agents/`, and `.jcode/`.

---

## 1. Inventory & Classification

| Directory / File | Type | Classification | Purpose | Action |
| :--- | :--- | :--- | :--- | :--- |
| `.agent/workflows/setup-project.md` | Workflow | **B. Reusable Team Configuration** | Standard setup and build instructions for new team members. | **Retained** |
| `.agents/skills/firecrawl/SKILL.md` | Skill | **A. Required Project Configuration** | Firecrawl agent integration skill for web crawling & sermon content extraction. | **Retained** |
| `.jcode/jcode.config.toml` | Config | **B. Reusable Team Configuration** | Defines multi-session harness settings for AI assistants. | **Retained** |
| `.jcode/mcp.json` | Config | **A. Required Project Configuration** | Model Context Protocol server bindings using environment variable placeholders. | **Retained** |
| `.jcode/opencode-antigravity-auth.config.json` | Config | **B. Reusable Team Configuration** | Session schemas, model routing policies, and domain rules. No credentials. | **Retained** |
| `.jcode/memory/graph_schema.json` | Schema | **B. Reusable Team Configuration** | Structural knowledge graph schema for code intelligence. | **Retained** |
| `.jcode/sessions/*.toml` | Session | **B. Reusable Team Configuration** | Focused module context definitions (Sermons, Events, Security, PWA, Deployment). | **Retained** |
| `.jcode/swarm/swarm.json` | Config | **B. Reusable Team Configuration** | Agent swarm orchestration topology. | **Retained** |

---

## 2. Security Review
- **Zero Credentials**: All `.jcode` files use standard templated environment variable references (e.g. `${NEON_DATABASE_URL}`, `${CLOUDINARY_URL}`).
- **Zero Session Tokens**: No personal OAuth tokens or bearer strings are tracked in git.
- **Git Tracking**: Verified that `.jcode` contains only declarative schemas and structural blueprints.
