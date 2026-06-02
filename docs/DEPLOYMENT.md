# Deployment Guide

## Target Platform

The application is designed to run on Vercel using the Next.js App Router runtime.

## Runtime Requirements

- Node.js `20.x`
- MongoDB Atlas or an accessible MongoDB deployment
- At least one configured AI provider
- Optional Razorpay credentials for real payment flow

## Environment Variables

### AI Configuration
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

### Auth Configuration
```bash
AUTH_SECRET=your_long_random_secret
```

### MongoDB Configuration
```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/<db>?retryWrites=true&w=majority
MONGODB_DB=ai_resume_optimizer
MONGODB_USERS_COLLECTION=users
MONGODB_PAYMENTS_COLLECTION=payments
```

### Billing Configuration
```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
PAYMENT_BYPASS_MODE=false
```

## Local Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in MongoDB, auth, and AI variables.
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`.

## MongoDB Atlas Checklist

1. Create a cluster.
2. Create a database user with read/write access.
3. Add a Network Access rule that allows the environments you need.
4. Copy the driver connection string.
5. Set `MONGODB_URI` in `.env.local` and in Vercel.

Recommended collection names:
- `users`
- `payments`

## Vercel Deployment Steps

### Dashboard Flow
1. Push the repository to GitHub.
2. Create or open the Vercel project.
3. Import the repository.
4. Set framework preset to `Next.js` if Vercel does not auto-detect it.
5. Add all required environment variables.
6. Deploy.

### CLI Flow
```bash
vercel
vercel --prod
```

## Production Configuration Checklist

Before promoting a production deployment, verify:
- `AUTH_SECRET` is set
- MongoDB environment variables are set in Production scope
- at least one AI provider key is set in Production scope
- `PAYMENT_BYPASS_MODE` matches intended billing behavior
- if real payments are enabled, Razorpay keys are valid and matching the correct environment

## Billing Modes

### Demo / Test Billing Mode
Use this when you want users to exercise subscription-gated flows without paying.

```bash
PAYMENT_BYPASS_MODE=true
```

Behavior:
- billing page clearly indicates demo mode
- selecting a plan activates it instantly
- no Razorpay order is created
- no real charge is attempted

### Real Billing Mode
Use this when you are ready for actual payment processing.

```bash
PAYMENT_BYPASS_MODE=false
```

Requirements:
- valid `RAZORPAY_KEY_ID`
- valid `RAZORPAY_KEY_SECRET`
- Razorpay account with required payment methods enabled

## AI Provider Modes

### Gemini Default Mode
Set:
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=...
```

### OpenAI Alternate Mode
Set:
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=...
```

## Operational Notes

### Resume Analysis
- can return safe fallback output if the AI provider is unavailable
- returns metadata about whether the source was `ai` or `mock`

### Resume Optimization
- expects live AI success
- intentionally fails if no valid structured AI output is available

### Route Protection
- `/analyze`, `/optimize`, and `/builder` require an active subscription
- authenticated users without active plans are redirected to `/billing`

## Troubleshooting

### `MONGODB_URI is not configured`
Cause:
- missing environment variable in the current runtime

Fix:
- add `MONGODB_URI` to `.env.local` or Vercel environment variables
- restart local dev server or redeploy Vercel

### TLS or MongoDB connection failures on Vercel
Cause:
- Atlas network access or runtime mismatch

Fix:
- confirm Atlas network rules allow Vercel traffic
- confirm Node runtime is 20.x
- verify the URI is correct and password characters are URL-safe

### `Authentication failed` from Razorpay
Cause:
- placeholder or invalid Razorpay credentials

Fix:
- set valid `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- ensure test keys are paired with the test environment and live keys with live environment

### Job URL extraction fails
Cause:
- public site blocks scraping or returns too little readable text

Fix:
- paste the full JD manually instead of relying on the URL

## Recommended Next Operational Improvements

- add health-check endpoint for environment validation
- add logging/monitoring for AI and payment failures
- add webhook-driven payment confirmation
- persist resume builder content per user
- add automated tests and CI validation
