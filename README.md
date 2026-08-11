# 🏛️ Kingdom of Christ Ministries - Web & Digital Platform

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5?style=for-the-badge&logo=kubernetes)
![AI Powered](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge&logo=openai)

A modern, enterprise-grade, AI-powered web application and digital ecosystem designed for Kingdom of Christ Ministries (K.C.M). Built using Next.js 14, TypeScript, Tailwind CSS, Node.js, PostgreSQL, and advanced AI technologies, featuring bilingual support (English & Telugu), secure online donations, comprehensive media archives, and intelligent conversational assistance.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Monorepo Architecture](#-monorepo-architecture)
- [Getting Started](#-getting-started)
- [Database Schema & Models](#-database-schema--models)
- [AI Capabilities & Integration](#-ai-capabilities--integration)
- [Deployment & Infrastructure](#-deployment--infrastructure)
- [Project Roadmap](#-project-roadmap)
- [Contributing](#-contributing)
- [License & Support](#-license--support)

---

## 🌟 Overview

Kingdom of Christ Ministries digital platform brings a state-of-the-art web experience to church members, visitors, and global supporters. The platform combines visual elegance, responsive design, multi-language conversational AI, and robust cloud infrastructure to streamline community connection, sermon delivery, event management, and online giving.

---

## ✨ Key Features

### 🎨 **Modern Design & User Experience**
- **Sleek Interface**: Built with modern gradient accents, glassmorphism UI components, and clean typography.
- **Fully Responsive Layout**: Optimized across desktop, tablet, and mobile displays.
- **Theme Flexibility**: Dark mode and light mode visual themes.
- **Fluid Animations**: Smooth page transitions and interactive micro-animations powered by Framer Motion.

### 🏠 **Public Experience & Community Hub**
- **Hero & Ministry Showcase**: Highlights mission statements, key statistics, and upcoming service schedules.
- **Sermon & Media Library**: Filterable video and audio sermon archives with transcript integration.
- **Event Management**: Interactive events calendar with attendee registration.
- **Prayer Requests**: Online submission for prayer requests with category selection.
- **Testimonials & Gallery**: Interactive community stories, photo galleries, and news updates.
- **Multilingual Support**: Seamless English and Telugu content presentation.

### 🤖 **Intelligent AI Assistant**
- **Bilingual AI Chatbot (English & Telugu)**: 24/7 automated assistance for church inquiries.
- **Service & Location Info**: Instant answers regarding service timings, map directions, and contact details.
- **Event & Prayer Guidance**: Interactive prompts for event registration and prayer requests.
- **RAG Sermon Search**: Semantic vector search over sermon transcripts for scripture and topic inquiries.

### 💳 **Online Giving & NGO Support**
- **Secure Payment Processing**: Integrated with Stripe for smooth, PCI-compliant transactions.
- **Flexible Giving Options**: Support for one-time donations, recurring giving, and specific ministry funds.
- **Instant Receipts**: Digital donation confirmations and summary history.

---

## 🚀 Technology Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) | React framework for server rendering and optimal performance |
| **Language** | TypeScript 5.4 | Type-safe development across frontend and backend |
| **Styling** | Tailwind CSS & Radix UI | Utility-first styling with accessible UI primitives |
| **Animations** | Framer Motion | Dynamic UI transitions and micro-interactions |
| **Backend API** | Node.js / Express | Modular REST and API route infrastructure |
| **Database & ORM** | PostgreSQL & Prisma ORM | Relational database with type-safe schema migrations |
| **AI Orchestration** | LangChain, OpenAI & Gemini | LLM integration and vector retrieval pipelines |
| **Vector DB** | Pinecone | High-dimensional vector database for semantic sermon search |
| **Payments** | Stripe API | Global secure payment processing |
| **DevOps & Containers** | Docker & Kubernetes | Containerized workloads with k8s orchestration manifests |
| **Monitoring** | Prometheus & Grafana | Real-time observability and metrics tracking |

---

## 🏗️ Monorepo Architecture

```
church-platform/
├── frontend/                 # Next.js 14 Web Application
│   ├── app/                  # App Router pages and API endpoints
│   ├── components/           # UI components, layout, and AI interface
│   ├── lib/                  # Client utilities and state management
│   └── public/               # Static assets and media
├── backend/                  # Node.js API Service & Workers
│   ├── src/                  # Controllers, services, and business logic
│   └── prisma/               # Database schema and migration scripts
├── database/                 # Database initialization and scripts
├── docker/                   # Docker Compose environment configurations
├── k8s/                      # Kubernetes deployment manifests & network policies
├── monitoring/               # Prometheus & Grafana dashboards
├── platform/                 # Shared platform manifests and network policies
├── package.json              # Workspace root configuration
└── README.md                 # Project documentation
```

---

## 📦 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher (or a cloud PostgreSQL instance)
- **Docker**: (Optional) For containerized local development

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/church-platform.git
cd church-platform
```

---

### 2. Install Dependencies

Install all monorepo dependencies:

```bash
npm install
```

---

### 3. Environment Configuration

Copy `.env.example` to `.env.local` in `frontend/` and `.env` in `backend/`, then update the variables:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/kcm_db"

# NextAuth / Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-secret-key"

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# AI Services
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="..."
PINECONE_API_KEY="..."
PINECONE_INDEX="kcm-sermons"

# Communications (Optional)
RESEND_API_KEY="re_..."
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
```

---

### 4. Database Setup & Migrations

Initialize the PostgreSQL database schema with Prisma:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes to database
npm run db:push

# Seed initial database data
npm run db:seed
```

---

### 5. Run Development Server

Start both the frontend application and backend service concurrently:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📊 Database Schema & Models

The PostgreSQL database powering the platform includes key models managed via Prisma:

- **User**: User profiles, credentials, and access permissions.
- **Event**: Church events, service schedules, venue details, and categories.
- **Sermon**: Video/audio sermon media links, speaker information, and searchable transcripts.
- **PrayerRequest**: Community prayer requests with categorization and privacy controls.
- **Donation**: Financial giving history, payment reference IDs, and transaction statuses.
- **Announcement**: Church updates, bulletin posts, and highlights.
- **Testimonial**: User feedback, stories, and verified community testimonials.
- **Ministry**: Ministry teams, mission groups, and outreach initiatives.
- **Gallery**: Event photo albums and media archives.

---

## 🤖 AI Capabilities & Integration

### RAG-Powered Sermon Search & Chatbot

The platform incorporates Retrieval-Augmented Generation (RAG) to allow visitors and members to interact with church content seamlessly:

1. **Transcript Indexing**: Sermon transcripts are processed and converted into vector embeddings using OpenAI / Gemini embedding models.
2. **Vector Storage**: Embeddings are indexed in Pinecone for semantic similarity matching.
3. **Conversational Assistant**: The bilingual AI engine queries the vector database to provide contextual scriptural answers and service details.

---

## 🐳 Deployment & Infrastructure

### Containerization with Docker

Run the entire application stack locally using Docker Compose:

```bash
# Start development container stack
npm run docker:dev

# Stop development containers
npm run docker:dev:down

# Build and run production containers
npm run docker:prod
```

### Kubernetes Orchestration

Deploy to a Kubernetes cluster using the provided manifests:

```bash
# Apply Kubernetes manifests
npm run k8s:apply

# Check namespace status
npm run k8s:status

# Remove Kubernetes resources
npm run k8s:delete
```

---

## 🎯 Project Roadmap

### Phase 1: Core Platform & Public Experience (Completed ✅)
- [x] Responsive web application design with glassmorphism styling
- [x] Public service, events, media, and contact sections
- [x] Bilingual AI conversational chatbot (English & Telugu)
- [x] Monorepo workspace structure setup

### Phase 2: Community & Giving Enhancements (In Progress 🔄)
- [x] Secure Stripe donation integration & NGO campaign support
- [ ] User profile dashboard and registration workflow
- [ ] Enhanced prayer request submission and tracking
- [ ] Event registration with confirmation notifications

### Phase 3: Content Management & Analytics (Planned 📋)
- [ ] Centralized media upload pipeline for sermons
- [ ] Engagement analytics dashboard for church operations
- [ ] Automated newsletter dispatch via email service
- [ ] Automated sermon transcript generation

### Phase 4: Advanced AI Features (Planned 🤖)
- [ ] Voice-assisted interactive chatbot interface
- [ ] Automated sermon summarization and quote extraction
- [ ] Multilingual expansion (Telugu, Hindi, English)

---

## 🤝 Contributing

Contributions are welcome to help enhance the Kingdom of Christ Ministries platform!

1. Fork the repository
2. Create a dedicated feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to your branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request for code review

---

## 📄 License & Support

### License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more information.

### Contact & Location
- 🌐 **Website**: [kingdomofchrist.org](http://localhost:3000)
- 📧 **Email**: info@kingdomofchrist.org
- 📱 **Phone**: +91 96409 43777
- 📍 **Address**: 15-201, Vivekananda Nagar, Jeedimetla, Hyderabad, Telangana 500055

---

**Built with ❤️ for Kingdom of Christ Ministries, Hyderabad**
