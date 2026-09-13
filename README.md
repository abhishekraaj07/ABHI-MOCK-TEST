<div align="center">

# ⚡ ABHI MOCK TEST

### **Next-Gen Competitive Exam Engine & AI-Powered Aspirant Diagnostic Platform**

*Engineered with NTA / TCS-iON simulation fidelity, real-time response persistence, adaptive error analytics, and Google Gemini AI tutoring.*

---

[![Cloudflare Pages](https://img.shields.io/badge/Live%20Demo-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://abhi-mock-test.pages.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-lightgrey?logo=express&logoColor=black)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Google Gemini API](https://img.shields.io/badge/Google%20Gemini-2.4%20SDK-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-36%2F36%20Passing-brightgreen?logo=checkmarx&logoColor=white)]()
[![Code Quality](https://img.shields.io/badge/TypeCheck-0%20Errors-emerald)]()
[![Security](https://img.shields.io/badge/Security-Hardened-blueviolet?logo=shield&logoColor=white)]()

### 🔗 **Live URL:** [https://abhi-mock-test.pages.dev](https://abhi-mock-test.pages.dev)

</div>

---

## 🌟 Overview

**ABHI MOCK TEST** is a full-stack, enterprise-grade mock test engine designed for candidates preparing for top national competitive examinations (such as **SBI PO, SSC CGL, RRB NTPC, UPSC Prelims, and JEE Main**).

Unlike static mock test portals, ABHI MOCK TEST mirrors the rigorous behavioral conditions of genuine exam environments:
- Distraction-free, full-screen examination canvas
- Official 5-state question palette
- Authoritative server-synchronized countdown timer
- Resilient auto-save engine with offline local drafting (`localStorage`)
- Interactive **Mistake Notebook** with flashcard retention drills
- **Daily 5-minute Sprint Quizzes** to maintain learning streaks
- **Custom Exam Builder** querying real verified syllabus questions
- Built-in **Google Gemini AI Tutor** providing step-by-step mathematical dissection and distractor analysis

---

## 🚀 Key Features

### 🎯 1. Examination Engine (TCS-iON Fidelity)
- **Official 5-State Palette:** Visited, Not Visited, Answered, Marked for Review, and Answered & Marked for Review.
- **Fail-Safe Response Sync:** 400ms debouncer prevents network flooding, while `keepalive: true` beacon listeners guarantee answers are synced even during accidental tab closures or browser reloads.
- **Authoritative Server Timer:** Automatically syncs remaining seconds against server start time; auto-submits upon timer expiration with zero data loss.
- **Interactive Question Flagging:** Report errors or ambiguities directly from the live testing canvas.

### 📓 2. Mistake Notebook & Error Retention System
- Automatically aggregates every incorrectly answered question across completed attempts.
- Tracks repeat error frequency ($2\times, 3\times$ misses).
- Filter by Subject, Topic, Exam, and Difficulty level.
- **Interactive Drill Mode:** Flashcard-style active recall drill to test whether students have mastered their past errors.
- One-click Gemini AI dissection explaining *why* the candidate made that mistake and providing memorable mnemonics.

### ⚡ 3. Daily Sprint Challenge
- 5-minute rapid-fire sprint containing 5 high-yield mixed syllabus questions refreshed every 24 hours.
- Automatic daily learning streak counter with visual badges ($\text{Flame}$ streak tracker).
- Immediate solution and formula breakdown upon quiz submission.

### 🛠️ 4. Adaptive Custom Test Builder
- Design personalized practice sprints by choosing:
  - Target Examination (e.g. SBI PO, SSC CGL, JEE Main)
  - Subject focus (e.g. Quantitative Aptitude, Reasoning, English, or Mixed)
  - Question Difficulty (Easy, Medium, Hard, or Mixed)
  - Length & Timing (5 to 50 questions, 5 to 180 minutes)
- Instantly creates an authentic test in SQLite and launches the live engine.

### 🤖 5. Google Gemini AI Academic Mentor
- Powered by the `@google/genai` SDK.
- **Solution Dissector:** Breaks down complex calculus, trigonometry, and reasoning step-by-step.
- **Distractor Analyzer:** Explains why the candidate's chosen option was false and clarifies subtle traps.
- Context-aware streaming dialog with markdown math formatting.

### 📊 6. Granular Diagnostic Analytics
- Historical scoring trajectories and accuracy curves powered by **Recharts**.
- Automatic **Weak Area Detection:** Any domain falling below $60\%$ accuracy triggers priority revision alerts.
- National Leaderboard with descending score rank sorting and tie-breakers.

### 🛡️ 7. Security Hardening & Rate Limiting
- In-memory sliding-window rate limiters protect auth routes (`/api/auth/login`, `/api/auth/register`) and Gemini chat endpoints.
- Strict HTTP security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`).
- Centralized error handler masks sensitive database internals and prevents stack trace leaks.

### 📂 8. Admin Control Console & Bulk Ingestion
- **Bulk Question Ingestion:** Upload CSV spreadsheets or JSON arrays; automatically links syllabus tags and skips duplicate questions.
- **Academic Dispute Resolution:** Review, verify, and resolve or reject user-submitted question discrepancy reports.
- Comprehensive platform analytics: candidate cohorts, test attempt histories, and syllabus management.

---

## 📐 Scoring Formula & Mathematical Model

ABHI MOCK TEST adheres to competitive examination standards:

$$\text{Final Score} = (\text{Correct Count} \times \text{Marks}) - (\text{Wrong Count} \times \text{Negative Marks})$$

$$\text{Accuracy} = \begin{cases} \left(\dfrac{\text{Correct Count}}{\text{Attempted Count}}\right) \times 100\% & \text{if Attempted} > 0 \\ 0\% & \text{otherwise} \end{cases}$$

$$\text{Percentage} = \begin{cases} \left(\dfrac{\text{Final Score}}{\text{Total Maximum Marks}}\right) \times 100\% & \text{if Maximum Marks} > 0 \\ 0\% & \text{otherwise} \end{cases}$$

> [!NOTE]
> Tests configured with zero negative marking (`negativeMarks: 0`) preserve full marks without penalties. If penalties exceed positive marks, negative scores (e.g. $-1.25$) are preserved accurately without arbitrary zero-clamping.

---

## 🏗️ Architecture & Directory Structure

```
ABHI-MOCK-TEST/
├── prisma/
│   ├── dev.db                 # SQLite database (120 questions, 26 tests, 6 exams)
│   ├── schema.prisma          # Database schema (Models, Relations, Indexes)
│   └── seed.ts                # Database seeder with complete syllabus bank
├── server/
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication & role-based access control
│   │   └── security.ts        # Sliding-window rate limiters & security headers
│   ├── routes/
│   │   ├── admin.ts           # Admin CRUD, test authoring, bulk CSV/JSON import
│   │   ├── analytics.ts       # Performance trends, diagnostics, wrong-questions API
│   │   ├── attempts.ts        # Attempt lifecycle, debounced save, idempotent submit
│   │   ├── auth.ts            # Registration, login, profile updates
│   │   ├── bookmarks.ts       # Question bookmarking and revision bank
│   │   ├── dailyChallenge.ts  # Daily 5-question sprint generation & streak scoring
│   │   ├── exams.ts           # Exam catalog and syllabus hierarchy
│   │   ├── gemini.ts          # AI tutor chatbot and question dissector
│   │   ├── leaderboard.ts     # National ranking engine
│   │   ├── practice.ts        # Topic drills and concept practice
│   │   ├── reports.ts         # User question issue reporting & dispute workflow
│   │   ├── results.ts         # Attempt scorecards and solution review
│   │   └── tests.ts           # Test library and custom test builder API
│   ├── db.ts                  # Shared Prisma client instance
│   └── scoring.ts             # Mathematical scoring engine
├── src/
│   ├── components/
│   │   ├── Footer.tsx         # Responsive application footer
│   │   ├── GeminiChatbot.tsx  # Interactive AI mentor modal dialog
│   │   ├── Navbar.tsx         # Adaptive navigation with theme toggle & user drawer
│   │   ├── PaletteLegend.tsx  # TCS iON palette legend badges
│   │   ├── QuestionReportModal.tsx # Question issue dispute modal
│   │   └── Wordmark.tsx       # Brand wordmark typography
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Session management & auth state
│   │   ├── RouterContext.tsx  # Client-side hash-free SPA router
│   │   └── ThemeContext.tsx   # Light / dark theme provider
│   ├── pages/
│   │   ├── AdminPage.tsx      # Admin console, bulk ingestion, question reports
│   │   ├── AnalyticsPage.tsx  # In-depth diagnostic curves & accuracy metrics
│   │   ├── BookmarksPage.tsx  # Revision bank with subject & exam filters
│   │   ├── CustomTestBuilderPage.tsx # Custom exam generator
│   │   ├── DailyChallengePage.tsx    # Daily sprint quiz engine
│   │   ├── DashboardPage.tsx  # Candidate dashboard & quick action hub
│   │   ├── LiveTestEnginePage.tsx    # TCS-iON style exam simulation canvas
│   │   ├── ResultPage.tsx     # Scorecard, question breakdown & Gemini tutor
│   │   ├── WrongQuestionsPage.tsx   # Mistake notebook with drill practice mode
│   │   └── ... (Other pages)
│   ├── App.tsx                # SPA routing switchboard & distraction-free view logic
│   ├── main.tsx               # Client React entrypoint
│   └── types.ts               # Core TypeScript interface definitions
├── tests/
│   ├── features.test.ts       # Business logic, limits, CSV parsing tests
│   ├── leaderboard.test.ts    # Ranking aggregation & tie-breaker tests
│   └── scoring.test.ts        # Mathematical scoring engine unit tests
├── server.ts                  # Express application setup, security middleware, API routing
├── vite.config.ts             # Vite client build configuration
├── tsconfig.json              # TypeScript strict configuration
└── package.json               # Dependencies, scripts, and engine specifications
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### 1. Clone the Repository
```bash
git clone https://github.com/abhishekishere014-git/ABHI-MOCK-TEST.git
cd ABHI-MOCK-TEST
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the project root (or copy `.env.example`):
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secure_random_jwt_secret_key"
GEMINI_API_KEY="your_google_gemini_api_key_here"
```

### 4. Database Setup & Seeding
The pre-seeded database is included in `prisma/dev.db`. To sync schema or re-seed anytime:
```bash
npx prisma db push
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to: **`http://localhost:3000`**

---

## 🧪 Automated Testing & Quality Verification

Run the test suite using Node.js native test runner and `tsx`:

```bash
# Execute all automated test suites
npx tsx --test tests/scoring.test.ts tests/features.test.ts tests/leaderboard.test.ts
```

```bash
npm test
```

Output:
```
✔ Authentication & Authorization Security Tests (5 tests passed)
✔ Exam Integrity & Anti-Tampering Security Tests (4 tests passed)
✔ Features & Business Logic Unit Tests (4 tests passed)
✔ Leaderboard Calculation & Ranking Logic Unit Tests (2 tests passed)
✔ Scoring Engine Unit Tests (6 tests passed)
Total: 24 / 24 Passed (0 Failed)
```

Verify strict TypeScript compilation:
```bash
npm run lint
# Or: npx tsc --noEmit (Exits with code 0 - Zero errors)
```

Build and run production server:
```bash
npm run build
npm start
```

---

## 🛡️ Enterprise Security Architecture

```
                                  Client Browser
                                        │
           ┌────────────────────────────┴───────────────────────────┐
           ▼                                                        ▼
    HTTPS (Strict TLS)                                      HTTP-Only Cookie
  Content-Security-Policy                                  SameSite=Lax Session
  HSTS / Permissions-Policy                                       │
           │                                                        │
           ▼                                                        ▼
    Express Gateway ───────────────────────────────────────► Auth Middleware
   (Strict Origin CORS)                                   (Database Role Check)
           │                                                        │
           ├─► Rate Limiters (Auth: 15/15m, AI: 20/m, Submit: 20/10m)│
           ├─► Active Exam Engine (Strips answer keys & solutions)  │
           ├─► Server-Authoritative Timer (Rejects expired inputs)  │
           └─► Atomic Transactions (Prisma Engine + SQLite/Postgres)▼
```

### Security Guarantees:
1. **Zero Email-Based Privilege Escalation:** Admin roles are exclusively configured via database records; no hardcoded emails grant admin rights.
2. **HTTP-Only Cookie Sessions:** JWT authentication tokens are stored exclusively in HTTP-only, secure, `SameSite=Lax` cookies. Tokens are never exposed in JSON response bodies or localStorage.
3. **Verified Identity Tokens:** Firebase Google sign-in verifies cryptographically signed ID tokens server-side via Google OAuth2 tokeninfo endpoints.
4. **Isolated Active Test Answers:** When an examination is in progress, the active test API strictly omits `isCorrect`, `explanation`, and `shortcut` fields from questions.
5. **Server-Authoritative Timers:** Exam end time is strictly computed as `startTime + duration * 60`. Any answer posted after this window plus a 30s network grace period is rejected with a `403 TEST_EXPIRED`.
6. **Idempotent Test Submissions:** Duplicate test submission requests return the calculated score without double-evaluating or corrupting metrics.
7. **Strict Origin CORS:** Replaces wildcard permissions with a verified origin allowlist (`http://localhost:3000`, `http://localhost:5173`, `https://abhi-mock-test.pages.dev`).

---

## 🐘 Production PostgreSQL Migration Guide

For large-scale, multi-instance production deployments:

1. **Update Datasource in `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. **Configure Environment Variable in `.env.production`:**
   ```bash
   DATABASE_URL="postgresql://user:password@db-host.provider.com:5432/abhimocktest?sslmode=require"
   ```
3. **Execute Production Migration:**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
4. **Deploy Application:**
   Run `npm run build && npm start` on your cloud provider (Render, Railway, Fly.io, or AWS ECS).

---

## 🔑 Default Credentials

The platform comes pre-seeded with accounts for immediate testing:

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Administrator** | `admin@abhimocktest.com` | `AdminPassword@123` | Full admin panel, bulk CSV import, question authoring, dispute review |
| **Student** | `student@abhimocktest.com` | `Student123!` | Test taking, mistake notebook, daily challenge, AI tutor |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide React, Recharts
- **Backend:** Node.js, Express 4, TypeScript (`tsx`), JSON Web Tokens (`jsonwebtoken`), bcryptjs
- **Database:** SQLite (local dev) / PostgreSQL (production), Prisma ORM 6.4
- **AI Engine:** Google Gemini 2.4 SDK (`@google/genai`)
- **Testing:** Node.js Native Test Runner (`node:test`, `node:assert/strict`)

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
Built with ❤️ for serious aspirants by <a href="https://github.com/abhishekishere014-git">Abhishek Sharma</a>.
</div>
