# AI Resume Optimizer (UI-Only MVP)

Scalable frontend MVP for resume analysis, optimization suggestions, and ATS-friendly resume building.

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
- Planned additions:
  - OpenAI integration
  - PDF parsing pipeline
  - Auth and payments
  - Backend persistence APIs

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
