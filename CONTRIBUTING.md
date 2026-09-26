# Contributing to Kingdom of Christ Ministries (KCM) Platform

Welcome! We appreciate your contributions to the KCM Church platform monorepo.

---

## 1. Development Setup

### Prerequisites
- Node.js 22 LTS
- NPM 10+
- PostgreSQL (or Neon Serverless account)

### Installation
```bash
# Clone the repository
git clone https://github.com/bunnyvalluri/church-.git
cd church-

# Install monorepo dependencies
npm install

# Generate Prisma clients
npm run db:generate -w backend
npm run postinstall
```

### Running Locally
```bash
# Start Next.js frontend (port 3000) and Express backend (port 3001) concurrently
npm run dev
```

---

## 2. Quality & Security Standards

Before opening a pull request, run the verification commands:

```bash
# 1. Multilingual Translation Key Parity Check
npm run i18n:check

# 2. ESLint Validation
npm run lint

# 3. TypeScript Typecheck
npm run typecheck

# 4. Playwright End-to-End & Health Suite
npm run test:health
```

---

## 3. Pull Request Guidelines
- **Least Privilege**: Workflows must not request unnecessary GitHub token permissions.
- **Never Commit Secrets**: Ensure `.env` or credential files are never committed.
- **Strict Error Handling**: Do not suppress errors or use `continue-on-error: true` on required CI steps.
