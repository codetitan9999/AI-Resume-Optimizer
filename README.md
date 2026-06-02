# AI Resume Optimizer

AI Resume Optimizer is a full-stack SaaS-style web application for resume analysis, job-description alignment, ATS-friendly resume building, subscription-based access control, and AI-assisted content optimization.

## Live Application

- Production URL: [https://ai-resume-optimizer-for-top-companies.vercel.app/](https://ai-resume-optimizer-for-top-companies.vercel.app/)
- Repository: [https://github.com/codetitan9999/AI-Resume-Optimizer](https://github.com/codetitan9999/AI-Resume-Optimizer)

## What The Product Does

- Analyzes a resume against a pasted job description or a public job URL
- Generates ATS-focused match scoring, keyword coverage, strengths, and gaps
- Optimizes resume content using live AI output aligned to either general ATS best practices or a target JD
- Provides an ATS-friendly resume builder with live preview and browser-print PDF export
- Supports user authentication, MongoDB-backed account persistence, and subscription-gated premium workflows
- Includes a billing interface with Razorpay integration hooks and a configurable bypass mode for demo/test environments

## Core Capabilities

### 1. Resume Analysis
- Upload a PDF resume on `/analyze`
- Paste JD text or a job URL
- Extract resume text locally when possible
- Generate ATS-oriented score, shortlisting probability, strengths, weaknesses, and keyword gaps

### 2. Resume Optimization
- Optimize builder resume content on `/optimize`
- Run either general optimization or JD-aligned optimization
- Apply AI suggestions back into the in-memory resume model when a suggestion has a reliable field mapping

### 3. Resume Builder
- Create a structured resume on `/builder`
- Edit personal info, summary, experience, projects, skills, education, and certifications
- Preview the final resume in a single-column ATS-friendly layout
- Export through browser print/PDF

### 4. Authentication And Access Control
- Sign up, log in, log out, and restore sessions from secure HTTP-only cookies
- Persist user accounts in MongoDB
- Protect premium routes using subscription-aware route guards

### 5. Subscription And Billing
- Support day, monthly, and yearly plans
- Store active subscription state inside the user record
- Record verified Razorpay payments in MongoDB
- Run hosted demos safely through `PAYMENT_BYPASS_MODE=true`

## Current Runtime Status

- Live AI is enabled and Gemini is the default provider.
- Resume analysis supports a safe fallback response if the AI provider is unavailable or returns invalid structured output.
- Resume optimization is configured to require a valid live AI response instead of silently showing mock content.
- Hosted billing is currently documented and supported in demo bypass mode unless real Razorpay credentials are configured.
- User auth, MongoDB connectivity, subscription gating, and Vercel deployment are working end to end.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- ShadCN-style component architecture
- React Hook Form
- Zod
- Zustand
- MongoDB Atlas
- Gemini API / OpenAI API (provider-switchable)
- Razorpay integration hooks
- Vercel deployment

## Project Structure

```text
app/                    Next.js routes, layouts, API handlers
components/             Reusable UI and feature modules
hooks/                  Client hooks
lib/                    Server-side integrations and shared utilities
store/                  Zustand application store
types/                  Shared domain types
utils/                  Validation, transformation, and helper logic
docs/                   Architecture, diagrams, API docs, deployment docs
```

## Documentation Map

- [Documentation Hub](./docs/README.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [High-Level Design](./docs/HLD.md)
- [Low-Level Design](./docs/LLD.md)
- [Diagram Pack](./docs/DIAGRAMS.md)
- [API Reference](./docs/API.md)
- [Data Model](./docs/DATA_MODEL.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/analyze` | Resume analysis against JD |
| `/optimize` | AI optimization suggestions |
| `/builder` | ATS-friendly resume builder |
| `/billing` | Plan selection and payment UI |
| `/login` | User login |
| `/signup` | User signup |

## Environment Variables

Copy from `.env.example` and set the values required for your environment.

```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini

AUTH_SECRET=your_long_random_secret

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/<db>?retryWrites=true&w=majority
MONGODB_DB=ai_resume_optimizer
MONGODB_USERS_COLLECTION=users
MONGODB_PAYMENTS_COLLECTION=payments

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
PAYMENT_BYPASS_MODE=false
```

## Local Development

### Prerequisites
- Node.js 20.x
- npm 10+
- MongoDB Atlas or another reachable MongoDB deployment
- Gemini API key or OpenAI API key

### Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Billing Demo Mode

If you want to demo the app without accepting real payments:

```bash
PAYMENT_BYPASS_MODE=true
```

Behavior in bypass mode:
- User logs in or signs up
- User opens `/billing`
- User selects a plan
- The subscription is applied immediately without a real transaction

## Known Constraints

- Uploaded resume files are not stored server-side; PDF extraction is used to improve the analysis request only.
- Resume builder content currently lives in client state and is not persisted to MongoDB yet.
- Job URL extraction depends on public page readability and may fail on heavily protected career sites.
- The repository does not yet include an automated test suite.

## Deployment

The app is designed for Vercel. Full deployment instructions, environment setup, MongoDB configuration, and billing notes are in [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

## Roadmap Candidates

- Persist resume builder content per user
- Add robust PDF parsing and resume import
- Replace billing bypass with production Razorpay checkout everywhere
- Add admin analytics and usage reporting
- Add test coverage for API routes, auth, and AI orchestration
