# AI Resume Optimizer (UI-Only MVP)

Scalable frontend MVP for resume analysis, optimization suggestions, and ATS-friendly resume building.

## Live Demo

- Live app: [https://ai-resume-optimizer-for-top-companies.vercel.app/](https://ai-resume-optimizer-for-top-companies.vercel.app/)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- ShadCN-style UI components
- React Hook Form + Zod validation
- Zustand state management
- Sonner toast notifications

## Routes

- `/` Home landing page
- `/analyze` Resume score + suggestions (mock analysis)
- `/optimize` Resume optimization suggestion sections
- `/builder` Resume builder with live ATS-friendly preview
- `/billing` Subscription and payment checkout
- `/login` Auth login
- `/signup` Auth signup

## Architecture

- `app/(routes)/` Route pages
- `components/` Reusable UI and feature components
- `lib/` Mock data and service abstraction for future backend integration
- `store/` Zustand global state
- `types/` Shared domain types
- `utils/` Validation schemas and transformers
- `hooks/` Reusable hooks

## State Model (Zustand)

Global store tracks:

- Uploaded file metadata
- Job description content
- Analysis result data
- Resume builder content
- Analysis loading state

## Future Integration Points

- `lib/services/resume-analyzer.ts`
  - `ResumeAnalyzerService` interface for swapping mock analysis with real API.
- `app/api/analyze/route.ts`
  - Phase 2 AI-backed (with safe mock fallback) analysis endpoint.
- `app/api/optimize/route.ts`
  - Phase 2 AI-backed (with safe mock fallback) optimization endpoint.
- Planned additions:
  - PDF parsing pipeline
  - Auth and payments
  - Backend persistence APIs

## Phase 2 (AI + JD Alignment)

- Analyze route now supports:
  - JD URL extraction (`/api/jd/extract`)
  - Resume-to-JD scoring (`/api/analyze`)
- Optimize route now supports:
  - General optimization
  - JD-aligned optimization
  - Section-level apply mapping (`summary`, `experience`, `projects`, `skills`, `keywords`)

Set environment variable for real AI output:

```bash
OPENAI_API_KEY=your_key_here
```

Optional model override:

```bash
OPENAI_MODEL=gpt-4.1-mini
```

## Phase 3 (Authentication)

- Added auth routes:
  - `GET /api/auth/session`
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
- Added protected app pages:
  - `/analyze`
  - `/optimize`
  - `/builder`
- Added new pages:
  - `/login`
  - `/signup`

Set auth secret:

```bash
AUTH_SECRET=your_long_random_secret
```

Notes:

- Sessions are stored in secure HTTP-only cookies.

## Phase 4 (MongoDB User Storage)

- Authentication user storage now uses MongoDB instead of local JSON files.
- User lookup and creation are performed through `lib/server/auth/user-store.ts`.

Environment variables:

```bash
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=ai_resume_optimizer
MONGODB_USERS_COLLECTION=users
```

Collection/index behavior:

- Users are stored in the configured collection.
- A unique index on `email` is created automatically.

## Phase 5 (Subscriptions & Payments)

- Added paid subscription model using Razorpay checkout:
  - Day pass: ₹10
  - Monthly: ₹15
  - Yearly: ₹100
- Payment methods supported by Razorpay checkout include:
  - UPI
  - Credit cards
  - Debit cards
  - Net banking / wallets (as enabled in your Razorpay account)

API routes:

- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `GET /api/payments/subscription`

Subscription gating:

- `/analyze`, `/optimize`, and `/builder` require an active subscription.
- Non-subscribed authenticated users are redirected to `/billing`.

Payment environment variables:

```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
PAYMENT_BYPASS_MODE=false
MONGODB_PAYMENTS_COLLECTION=payments
```

Local testing shortcut:

- Set `PAYMENT_BYPASS_MODE=true` to bypass Razorpay and activate selected plans directly from the billing UI.

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)

You can copy env defaults from `.env.example`.

## Notes

- This MVP intentionally uses mock structured data and no backend.
- `Export as PDF` currently uses browser print (`window.print`).

## Deploy to Vercel

### Option 1: Vercel Dashboard (recommended)

1. Push this project to GitHub/GitLab/Bitbucket.
2. In Vercel, click **Add New Project**.
3. Import the repository.
4. Keep defaults:
   - Framework Preset: `Next.js`
   - Build Command: `next build` (auto)
   - Output Directory: `.next` (auto)
5. Click **Deploy**.

### Option 2: Vercel CLI

1. Install CLI:
   ```bash
   npm i -g vercel
   ```
2. From project root:
   ```bash
   vercel
   ```
3. For production deployment:
   ```bash
   vercel --prod
   ```

### Node Runtime

- Project pins Node with:
  - `.nvmrc`: `22`
  - `package.json > engines.node`: `>=18.18 <23`
