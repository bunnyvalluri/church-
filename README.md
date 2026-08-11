# 🏛️ Kingdom of Christ Ministries - Digital Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.12-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5?style=for-the-badge&logo=kubernetes)](https://kubernetes.io/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge&logo=openai)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

A state-of-the-art, enterprise-grade digital ecosystem and web platform designed for **Kingdom of Christ Ministries (K.C.M)**. Built with Next.js 14, TypeScript, Tailwind CSS, Node.js, PostgreSQL, Firebase Auth, and intelligent AI capabilities—delivering multilingual support (English, Telugu & Hindi), offline-first PWA resilience, seamless sermon media streaming, prayer requests, and secure online giving.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Monorepo Architecture](#-monorepo-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#1-installation--setup)
  - [Environment Configuration](#2-environment-configuration)
  - [Database & Migrations](#3-database--migrations)
  - [Development Server](#4-development-server)
- [Database Schema & Models](#-database-schema--models)
- [AI & Network Resilience](#-ai--network-resilience)
- [Deployment & Infrastructure](#-deployment--infrastructure)
- [Project Roadmap](#-project-roadmap)
- [Contributing](#-contributing)
- [License & Support](#-license--support)

---

## 🌟 Overview

The **Kingdom of Christ Ministries Platform** serves as a digital gateway connecting church members, visitors, and global supporters. Designed with visual excellence, intuitive user navigation, and high availability, the platform streamlines sermon delivery, event management, prayer requests, community outreach, and secure financial contributions.

> [!NOTE]  
> The platform features full multilingual support (English, Telugu & Hindi), adaptive offline-first sync capabilities, and zero-latency media playback.

---

## ✨ Key Features

### 🎨 Modern Design & Experience
- **Premium Interface**: Crafted with modern typography, glassmorphism UI components, fluid gradients, and dark/light mode customization.
- **Fully Responsive**: Flawless responsive layout optimized across mobile, tablet, and widescreen displays.
- **Micro-Animations**: Framer Motion powered transitions for an interactive user interface.

### 🌐 Community Hub & Media Library
- **Hero & Ministry Showcase**: Displays mission statements, weekly service schedules, and ministry highlights.
- **Sermon & Media Archive**: Filterable sermon library with high-definition audio and video streaming, plus transcript support.
- **Interactive Events Calendar**: Full event listing with category filters, schedule details, and RSVP capabilities.
- **Prayer & Testimonials**: Online prayer request submissions and verified community testimony sharing.
- **Multilingual Interface**: Seamless translation across English, Telugu, and Hindi.

### ⚡ Offline-First Architecture & Network Resilience
- **PWA Service Worker**: Instant page load with offline caching and background synchronization.
- **Real-Time Health Monitoring**: Automatic network quality detection and sync handling.

### 🤖 Intelligent AI Assistance
- **Multilingual Conversational AI (English, Telugu & Hindi)**: Provides 24/7 answers to church schedules, location details, and service information.
- **Semantic Sermon Search (RAG)**: Search over sermon archives using contextual vector embeddings.

### 💳 Secure Online Giving & NGO Support
- **PCI-Compliant Payment Processing**: Powered by Stripe for single and recurring tithes, offerings, and outreach funding.
- **Digital Receipting**: Instant transaction confirmations and giving history summary.

---

## 🚀 Technology Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | React framework with Server Side Rendering (SSR) & Static Site Generation (SSG) |
| **Language** | TypeScript 5.4 | End-to-end type safety across client and server |
| **Styling** | Tailwind CSS 3.4 & Radix UI | Utility-first styling with accessible UI primitives |
| **Animations** | Framer Motion | Smooth component micro-interactions and route transitions |
| **Backend API** | Node.js / Express | High-performance modular REST API endpoints |
| **Authentication** | Firebase Auth (Google & Email) | Secure identity provider with OAuth and session tokens |
| **Database & ORM** | PostgreSQL 16 & Prisma | Relational database management with schema migrations |
| **AI Engine** | OpenAI & Gemini API | Natural Language Processing (NLP) & Retrieval-Augmented Generation (RAG) |
| **Payments** | Stripe API | Secure global donation gateway |
| **DevOps & Infrastructure** | Docker & Kubernetes | Containerized microservices and automated deployment manifests |
| **Observability** | Prometheus & Grafana | Monitoring, alert metrics, and application health dashboards |

---

## 🏗️ Monorepo Architecture

```
church-platform/
├── frontend/                 # Next.js 14 Web Application
│   ├── app/                  # App Router pages and API routes
│   ├── components/           # UI components, cards, and AI chat interface
│   ├── hooks/                # Custom React hooks (Network, Audio, PWA)
│   ├── lib/                  # Utilities, translations, API clients
│   └── public/               # Public static assets, icons, service worker
├── backend/                  # Node.js Express API Engine
│   ├── src/                  # Controllers, services, and middleware
│   └── prisma/               # Prisma database schema & seeds
├── database/                 # Database initialization and migration scripts
├── docker/                   # Docker Compose development and production configs
├── k8s/                      # Kubernetes manifests & Helm charts
├── monitoring/               # Prometheus alert rules & Grafana dashboards
├── platform/                 # Shared platform configs & gateway routes
├── package.json              # Workspace root configuration
└── README.md                 # Documentation
```

---

## 📦 Getting Started

### Prerequisites

Ensure the following tools are installed:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: `v14.0` or higher (or cloud database connection)
- **Docker**: (Optional) For containerized development

---

### 1. Installation & Setup

Clone the repository and install all workspace dependencies:

```bash
git clone https://github.com/your-org/church-platform.git
cd church-platform
npm install
```

---

### 2. Environment Configuration

Create environment configuration files:

```bash
# Frontend setup
cp frontend/.env.example frontend/.env.local

# Backend setup
cp backend/.env.example backend/.env
```

Configure your environment variables in `frontend/.env.local`:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/kcm_db"

# NextAuth / App Secret
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-secret-key"

# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# AI Integration
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="..."

# Communications
RESEND_API_KEY="re_..."
```

---

### 3. Database & Migrations

Set up the PostgreSQL database schema and seed initial data using Prisma:

```bash
# Generate Prisma Client
npm run db:generate

# Push database schema
npm run db:push

# Seed initial data
npm run db:seed
```

---

### 4. Development Server

Run the development server for both frontend and backend concurrently:

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📊 Database Schema & Models

Managed seamlessly via Prisma ORM:

- **User**: User accounts, authentication credentials, and preferences.
- **Event**: Church services, community events, location details, and dates.
- **Sermon**: Video/audio sermon media links, speaker information, and searchable transcripts.
- **PrayerRequest**: Community prayer requests with privacy controls.
- **Donation**: Giving records, transaction reference IDs, and payment status tracking.
- **Announcement**: Bulletin notices and church news updates.
- **Testimonial**: Community testimonies and stories.
- **Ministry**: Ministry teams and community outreach programs.
- **Gallery**: Event photos and media archives.

---

## 🤖 AI & Network Resilience

### RAG-Powered Sermon Search
- Converts sermon transcripts into high-dimensional vector embeddings.
- Enables semantic search so users can query sermon topics and scripture references naturally.

### Network Quality Manager
- Monitors connection speed and availability in real-time.
- Automatically handles temporary offline states, caching content locally and syncing back gracefully.

---

## 🐳 Deployment & Infrastructure

### Containerization with Docker

Start local containerized environment:

```bash
# Development stack
npm run docker:dev

# Production stack
npm run docker:prod
```

### Kubernetes Cluster Deployment

Deploy manifests to your Kubernetes cluster:

```bash
npm run k8s:apply
```

---

## 🎯 Project Roadmap

### Phase 1: Core Platform & Public Experience (Completed ✅)
- [x] Responsive web interface with glassmorphism design system
- [x] Public service, events, media, and contact sections
- [x] Multilingual AI conversational chatbot (English, Telugu & Hindi)
- [x] PWA offline caching & background sync infrastructure

### Phase 2: Community & Giving Enhancements (Completed ✅)
- [x] Stripe payment gateway for online donations & NGO campaigns
- [x] Prayer request submissions and community stories
- [x] Dynamic sermon media player with filtering

### Phase 3: Analytics & Expansion (In Progress 🔄)
- [ ] Centralized media upload pipeline for sermons
- [ ] Automated email bulletins and announcements
- [ ] Voice-enabled interactive AI assistant

---

## 🤝 Contributing

We welcome contributions to help improve the Kingdom of Christ Ministries platform!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License & Support

### License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Contact & Location
- 🌐 **Website**: [kingdomofchrist.org](http://localhost:3000)
- 📧 **Email**: info@kingdomofchrist.org
- 📱 **Phone**: +91 96409 43777
- 📍 **Address**: 15-201, Vivekananda Nagar, Jeedimetla, Hyderabad, Telangana 500055

---

**Built with ❤️ for Kingdom of Christ Ministries, Hyderabad**
