# 🏛️ Kingdom of Christ Ministries - Digital Platform
<!-- cache sync -->

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.12-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://kcmchurch.vercel.app)
[![AI Powered](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge&logo=openai)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

A state-of-the-art, enterprise-grade digital ecosystem and web platform designed for **Kingdom of Christ Ministries (K.C.M)**. Built with Next.js 14, TypeScript, Tailwind CSS, Node.js, PostgreSQL, Firebase Auth, and intelligent AI capabilities—delivering multilingual support (English, Telugu & Hindi), offline-first PWA resilience, seamless sermon media streaming, prayer requests, and secure online giving.

---

## 🌐 Live Application
- **Production Website**: [https://kcmchurch.vercel.app](https://kcmchurch.vercel.app)
- **Source Code**: [GitHub Repository](https://github.com/bunnyvalluri/church-)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Monorepo Architecture](#-monorepo-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation \& Setup](#1-installation--setup)
  - [Environment Configuration](#2-environment-configuration)
  - [Database \& Migrations](#3-database--migrations)
  - [Development Server](#4-development-server)
- [Database Schema \& Models](#-database-schema--models)
- [AI \& Network Resilience](#-ai--network-resilience)
- [Deployment \& Infrastructure](#-deployment--infrastructure)
- [License \& Support](#-license--support)

---

## 🌟 Overview

The **Kingdom of Christ Ministries Platform** serves as a digital gateway connecting church members, visitors, and global supporters. Designed with visual excellence, intuitive user navigation, and high availability, the platform streamlines sermon delivery, event management, prayer requests, community outreach, and secure financial contributions.

> [!NOTE]  
> The platform features full multilingual support (English, Telugu & Hindi), adaptive offline-first sync capabilities, dynamic accent theme switching, and zero-latency media playback.

---

## ✨ Key Features

### 🎨 Modern Design & Experience
- **Apple Glassmorphism Interface**: Crafted with modern typography, glassmorphism UI components, fluid gradients, and dark/light mode customization.
- **Dynamic Accent Themes**: 10 customizable color accent themes (Purple, Emerald, Holy Blue, Crimson, Royal Gold, Rose, Sky, Olive, Earth, Platinum).
- **Fully Responsive**: Flawless responsive layout optimized across mobile, tablet, laptop, and widescreen displays.
- **Micro-Animations**: Smooth component micro-interactions and route transitions.

### 🌐 Community Hub & Media Library
- **Hero & Ministry Showcase**: Displays mission statements, weekly service schedules, and ministry highlights.
- **Sermon & Media Archive**: Filterable sermon library with high-definition audio and video streaming, plus transcript support.
- **Interactive Events Calendar**: Full event listing with category filters, schedule details, and location maps.
- **Prayer & Testimonials**: Online prayer request submissions and verified community testimony sharing.
- **Multilingual Interface**: Seamless translation across English, Telugu, and Hindi.

### ⚡ Offline-First Architecture & Network Resilience
- **PWA Service Worker**: Instant page load with offline caching and background synchronization.
- **Real-Time Health Monitoring**: Automatic network quality detection and sync handling.

### 🤖 Intelligent AI Assistant
- **Multilingual Conversational AI (English, Telugu & Hindi)**: Provides 24/7 answers to church schedules, location details, sermon insights, and service information.
- **Dynamic Color Theme Sync**: Chatbot interface automatically synchronizes with active accent themes.

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
| **Deployment** | Vercel & Docker | Automated CI/CD edge deployment and containerization |

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
- **Git**: Installed for version control

---

### 1. Installation & Setup

Clone the repository and install all workspace dependencies:

```bash
git clone https://github.com/bunnyvalluri/church-.git
cd church-
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
- **Sermon**: Video/audio sermon media links, speaker information, and transcripts.
- **PrayerRequest**: Community prayer requests with privacy controls.
- **Donation**: Giving records, transaction reference IDs, and payment status tracking.
- **Announcement**: Bulletin notices and church news updates.
- **Testimonial**: Community testimonies and stories.
- **Ministry**: Ministry teams and community outreach programs.
- **Gallery**: Event photos and media archives.

---

## 🤖 AI & Network Resilience

### Intelligent AI Assistant
- Interactive multilingual chat assistance for service timings, prayer requests, and biblical inquiries.
- Real-time theme synchronization with the user's active visual palette.

### Network Quality Manager
- Monitors connection speed and availability in real-time.
- Automatically handles temporary offline states, caching content locally and syncing back gracefully.

---

## 🐳 Deployment & Infrastructure

### Production Vercel Deployment
Automatically builds and deploys on every push to `main` branch.

### Containerization with Docker
```bash
# Development stack
npm run docker:dev

# Production stack
npm run docker:prod
```

---

## 📄 License & Support

### License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Contact & Location
- 🌐 **Website**: [https://kcmchurch.vercel.app](https://kcmchurch.vercel.app)
- 📧 **Email**: info@kingdomofchrist.org
- 📱 **Phone**: +91 96409 43777
- 📍 **Address**: 15-201, Vivekananda Nagar, Jeedimetla, Hyderabad, Telangana 500055

---

**Built with ❤️ for Kingdom of Christ Ministries, Hyderabad**
