# Data Model

## Overview

The current application mixes two data scopes:
- persisted server-side entities in MongoDB
- transient client-side UI state in Zustand

This split is important because user accounts and subscriptions survive refreshes, while resume builder content currently does not.

## Domain Types

## `AuthUser`
Defined in `types/auth.ts`.

Fields:
- `id`
- `name`
- `email`
- `createdAt`
- `subscription`

## `UserSubscription`
Embedded inside `AuthUser`.

Fields:
- `planId`: `day | monthly | yearly | null`
- `status`: `inactive | active | expired`
- `amountInr`
- `currency`
- `startedAt`
- `expiresAt`
- `updatedAt`
- `paymentProvider`
- `paymentId`
- `orderId`

## `ResumeData`
Defined in `types/resume.ts`.

Fields:
- `personalInfo`
- `summary`
- `experience[]`
- `projects[]`
- `skills`
- `education[]`
- `certifications[]`

## `AnalysisResult`
Defined in `types/analysis.ts`.

Fields:
- `score`
- `probability`
- `strengths[]`
- `weaknesses[]`
- `missingKeywords[]`
- `matchedKeywords[]`

## `OptimizationSection`
Defined in `types/optimization.ts`.

Fields:
- `id`
- `title`
- `suggestions[]`

## `OptimizationSuggestion`
Defined in `types/optimization.ts`.

Fields:
- `id`
- `original`
- `optimized`
- `rationale`
- `confidence`
- `target`

## MongoDB Collections

## `users`
Backed by `lib/server/auth/user-store.ts`.

Representative document shape:
```json
{
  "_id": "ObjectId",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "passwordHash": "...",
  "createdAt": "2026-05-01T12:00:00.000Z",
  "subscription": {
    "planId": "monthly",
    "status": "active",
    "amountInr": 15,
    "currency": "INR",
    "startedAt": "2026-05-01T12:00:00.000Z",
    "expiresAt": "2026-05-31T12:00:00.000Z",
    "updatedAt": "2026-05-01T12:00:00.000Z",
    "paymentProvider": "razorpay",
    "paymentId": "pay_xxx",
    "orderId": "order_xxx"
  }
}
```

Indexes:
- unique index on `email`

## `payments`
Backed by `lib/server/payments/payment-store.ts`.

Representative document shape:
```json
{
  "_id": "ObjectId",
  "userId": "6650f0...",
  "planId": "yearly",
  "amountInr": 100,
  "amountPaise": 10000,
  "currency": "INR",
  "provider": "razorpay",
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature",
  "createdAt": "2026-05-01T12:30:00.000Z"
}
```

Indexes:
- index on `{ userId, createdAt }`
- unique index on `razorpayPaymentId`

## Client-Side Zustand State

File: `store/use-resume-store.ts`

State slices:
- `uploadedFile`: selected file metadata only
- `jobDescription`: resolved or user-entered JD text
- `resumeText`: pasted or locally extracted text used for analysis
- `analysisResult`: current resume/JD analysis output
- `resumeData`: builder resume model
- `optimizationSections`: latest optimization suggestion groups
- `optimizationContext`: source/mode metadata for the latest optimization run
- `isAnalyzing`: analysis loading state

## Data Ownership Matrix

| Data | Owner | Persistence |
| --- | --- | --- |
| User profile | MongoDB | Persistent |
| Subscription status | Embedded in user document | Persistent |
| Payment records | MongoDB | Persistent |
| Auth session | Signed cookie + DB lookup | Semi-persistent |
| Builder resume content | Zustand | Ephemeral |
| Uploaded PDF | Browser memory | Ephemeral |
| Analysis result | Zustand | Ephemeral |
| Optimization suggestions | Zustand | Ephemeral |

## Normalization Rules

### User Data
- emails are lowercased and trimmed before storage
- subscription objects are normalized to include required default fields

### Analysis Output
- AI percentages may be normalized from `0-1` to `0-100`
- string arrays are trimmed and filtered before validation

### Optimization Output
- confidence may be normalized from percentages to `0-1`
- category aliases such as `methodologies` may be mapped to `tools`
- bullet indices may be inferred from original text when missing

## Data Model Gaps

Current gaps worth addressing in future iterations:
- no `resume_documents` collection yet
- no `ai_generations` collection for observability/auditing
- no `job_descriptions` cache
- no `usage_events` or analytics model
