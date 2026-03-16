---
description: DCT Project Setup — Install dependencies, configure .env, run database migration, and start both servers
---

# DCT Project Setup Workflow

> [!IMPORTANT]
> Complete Phase 1 before moving to Phase 2.

---

## Phase 1: Environment Setup

### Step 1.1 — Install backend dependencies
```powershell
cd "d:\Digital Twin\digital-career-twin\backend"
npm install
```

### Step 1.2 — Install frontend dependencies
```powershell
cd "d:\Digital Twin\digital-career-twin\frontend"
npm install
```

### Step 1.3 — Verify PostgreSQL is running
```powershell
psql -U postgres -c "\l"
```
If PostgreSQL is not installed, download from https://postgresql.org/download/windows/

### Step 1.4 — Create the database (if not exists)
```powershell
psql -U postgres -c "CREATE DATABASE dct_db;"
```

### Step 1.5 — Fill in the .env file

Open `d:\Digital Twin\digital-career-twin\backend\.env` and fill in:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:YOUR_PG_PASSWORD@localhost:5432/dct_db` |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com → API Keys |
| `YOUTUBE_API_KEY` | https://console.cloud.google.com → YouTube Data API v3 *(optional)* |
| `JWT_SECRET` | Already auto-generated — do NOT change |

```powershell
# Open .env in notepad to edit
notepad "d:\Digital Twin\digital-career-twin\backend\.env"
```

### Step 1.6 — Run Prisma database migration
```powershell
cd "d:\Digital Twin\digital-career-twin\backend"
npx prisma db push
```
Expected output: `All migrations ran successfully.`

### Step 1.7 — Verify backend health
```powershell
cd "d:\Digital Twin\digital-career-twin\backend"
npm run dev
```
In a new terminal:
```powershell
Invoke-RestMethod http://localhost:4000/health
```
Expected: `status: ok`

---

## Phase 2: Start the Application

### Step 2.1 — Start backend (Terminal 1)
```powershell
cd "d:\Digital Twin\digital-career-twin\backend"
npm run dev
```

### Step 2.2 — Start frontend (Terminal 2)
```powershell
cd "d:\Digital Twin\digital-career-twin\frontend"
npm run dev
```

### Step 2.3 — Open the app
Navigate to: http://localhost:3000

---

## Phase 3: Test Connectivity

### Step 3.1 — Register an account
1. Go to http://localhost:3000/register
2. Fill in name, email, password
3. You'll be redirected to the 5-step onboarding wizard

### Step 3.2 — Complete onboarding
Fill in your academic details, career goals, skills (sliders), and learning preferences.

### Step 3.3 — Verify AI features work
On the dashboard, click the **AI Mentor** button in the top bar to open the chat panel and test Claude AI integration.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ECONNREFUSED 4000` | Backend not running — start with `npm run dev` in backend folder |
| `P1001` Prisma error | PostgreSQL not running or wrong password in `DATABASE_URL` |
| `401` on AI routes | Check `ANTHROPIC_API_KEY` is set correctly |
| Frontend shows blank | Check `NEXT_PUBLIC_API_URL=http://localhost:4000/api` in frontend `.env.local` |
| Port 3000 in use | Change Next.js port: `npm run dev -- -p 3001` |
| Port 4000 in use | Change in backend `.env`: `PORT=4001` |
