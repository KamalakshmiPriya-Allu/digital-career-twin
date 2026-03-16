# 🎓 Digital Career Twin

> An Agentic AI-Powered Career Mentoring Platform

[![Status](https://img.shields.io/badge/status-in%20development-orange)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## 🧠 Overview

**Digital Career Twin (DCT)** is an AI-powered SaaS platform that creates a personalized virtual representation of a student's academic profile, skills, and career aspirations. Powered by Claude API, the platform acts as an autonomous career mentor — continuously analyzing the user's growth, predicting career outcomes, and delivering actionable learning roadmaps.

---

## 🏗️ Project Structure

```
digital-career-twin/
├── frontend/          # Next.js 14 App (TypeScript + Tailwind)
│   ├── app/           # App Router pages & layouts
│   ├── components/    # Reusable UI components
│   ├── lib/           # Utilities and helpers
│   └── public/        # Static assets
│
├── backend/           # Node.js + Express API (TypeScript)
│   ├── src/
│   │   ├── routes/        # API route definitions
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/     # Auth, rate-limiting, etc.
│   │   ├── config/        # App & DB configuration
│   │   └── utils/         # Helper functions
│   └── prisma/
│       └── schema.prisma  # Database schema
│
├── .gitignore
├── README.md
└── gsd.config.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or pnpm

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npx prisma migrate dev
npm run dev
# → http://localhost:4000
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| AI Engine | Claude API (claude-sonnet-4) |
| Video API | YouTube Data API v3 |
| Auth | JWT (httpOnly cookies) |

---

## 📋 Build Phases

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | Foundation & Auth | 🔄 In Progress |
| Phase 2 | Onboarding Wizard | ⏳ Planned |
| Phase 3 | AI Dashboard | ⏳ Planned |
| Phase 4 | AI Core (Claude) | ⏳ Planned |
| Phase 5 | Assessments | ⏳ Planned |
| Phase 6 | Learning + YouTube | ⏳ Planned |
| Phase 7 | Career + Resume | ⏳ Planned |
| Phase 8 | Polish + Launch | ⏳ Planned |

---

## 📄 License

MIT © 2026 Digital Career Twin
