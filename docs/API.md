# API Reference

All API routes are implemented as Next.js App Router route handlers under `app/api/`.

## Authentication Model

- Authentication uses a signed HTTP-only cookie.
- Premium routes and premium APIs require an active subscription.
- Most authenticated routes rebuild session state from the cookie token plus a MongoDB user lookup.

## Endpoint Catalog

| Method | Path | Auth Required | Subscription Required | Purpose |
| --- | --- | --- | --- | --- |
| `GET` | `/api/auth/session` | No | No | Return current session snapshot |
| `POST` | `/api/auth/signup` | No | No | Create account and issue session cookie |
| `POST` | `/api/auth/login` | No | No | Authenticate user and issue session cookie |
| `POST` | `/api/auth/logout` | Yes | No | Clear auth cookie |
| `POST` | `/api/analyze` | Yes | Yes | Analyze resume against JD |
| `POST` | `/api/optimize` | Yes | Yes | Generate optimization suggestions |
| `POST` | `/api/jd/extract` | Yes | Yes | Resolve JD text from URL or raw text |
| `GET` | `/api/payments/subscription` | Yes | No | Return plans and subscription snapshot |
| `POST` | `/api/payments/create-order` | Yes | No | Create Razorpay order |
| `POST` | `/api/payments/verify` | Yes | No | Verify Razorpay payment and activate subscription |
| `POST` | `/api/payments/mock-activate` | Yes | No | Activate a plan directly in bypass mode |

## Auth APIs

### `GET /api/auth/session`
Returns whether the user is authenticated and, if so, the public user profile.

Success response:
```json
{
  "authenticated": true,
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "createdAt": "...",
    "subscription": {
      "planId": "monthly",
      "status": "active"
    }
  },
  "expiresAt": 1712345678
}
```

### `POST /api/auth/signup`
Request body:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "strongpassword"
}
```

Behavior:
- validates payload with `signupSchema`
- rejects duplicate emails
- hashes password
- creates MongoDB user record
- sets auth cookie

### `POST /api/auth/login`
Request body:
```json
{
  "email": "jane@example.com",
  "password": "strongpassword"
}
```

Behavior:
- validates payload with `loginSchema`
- verifies password hash
- sets auth cookie

### `POST /api/auth/logout`
Clears the auth cookie and returns:
```json
{ "success": true }
```

## Resume Analysis API

### `POST /api/analyze`
Requires authentication and active subscription.

Request body:
```json
{
  "jobInput": "https://company.com/jobs/123 or pasted JD text",
  "resumeText": "optional extracted or pasted resume text",
  "resumeFileName": "resume.pdf"
}
```

Success response:
```json
{
  "analysisResult": {
    "score": 82,
    "probability": 74,
    "strengths": ["..."],
    "weaknesses": ["..."],
    "missingKeywords": ["..."],
    "matchedKeywords": ["..."]
  },
  "source": "ai",
  "warning": "optional fallback or provider warning",
  "jobDescriptionSource": "url",
  "jobDescription": "resolved JD text",
  "jobUrl": "https://..."
}
```

Notes:
- the API may return `source: "mock"` if analysis fallback is used
- premium access failure returns HTTP `402`

## Resume Optimization API

### `POST /api/optimize`
Requires authentication and active subscription.

Request body:
```json
{
  "resumeData": {
    "personalInfo": { "fullName": "...", "email": "..." },
    "summary": "...",
    "experience": [],
    "projects": [],
    "skills": { "technical": [], "tools": [], "soft": [] },
    "education": [],
    "certifications": []
  },
  "jobInput": "optional JD text or URL",
  "mode": "general"
}
```

Success response:
```json
{
  "sections": [
    {
      "id": "summary",
      "title": "Summary Suggestions",
      "suggestions": [
        {
          "id": "...",
          "original": "...",
          "optimized": "...",
          "rationale": "...",
          "confidence": 0.86,
          "target": { "kind": "summary" }
        }
      ]
    }
  ],
  "context": {
    "source": "ai",
    "mode": "jd-aligned",
    "jobSource": "text"
  },
  "warning": "optional warning"
}
```

Notes:
- optimization currently fails instead of silently returning mock content when live AI is unavailable
- suggestion `target` values determine whether the UI can auto-apply the change

## JD Extraction API

### `POST /api/jd/extract`
Requires authentication and active subscription.

Request body:
```json
{
  "jobInput": "https://company.com/job or pasted JD text"
}
```

Success response:
```json
{
  "jobDescription": "resolved text",
  "source": "url",
  "jobUrl": "https://company.com/job",
  "warnings": []
}
```

## Payment APIs

### `GET /api/payments/subscription`
Returns the current user, active subscription snapshot, available plans, and whether bypass mode is enabled.

### `POST /api/payments/create-order`
Request body:
```json
{ "planId": "monthly" }
```

Behavior:
- validates plan selection
- creates a Razorpay order
- returns `keyId`, `order`, and `plan`

### `POST /api/payments/verify`
Request body:
```json
{
  "planId": "monthly",
  "razorpay_order_id": "order_...",
  "razorpay_payment_id": "pay_...",
  "razorpay_signature": "signature"
}
```

Behavior:
- validates signature
- prevents duplicate processing
- writes payment record to MongoDB
- activates user subscription

### `POST /api/payments/mock-activate`
Request body:
```json
{ "planId": "yearly" }
```

Behavior:
- only works when `PAYMENT_BYPASS_MODE=true`
- directly activates the chosen plan for the current user

## Common Error Responses

| Status | Meaning |
| --- | --- |
| `400` | Validation failure or malformed request |
| `401` | Unauthenticated |
| `402` | Authenticated but no active subscription |
| `403` | Payment bypass route called while disabled |
| `409` | Duplicate user or duplicate payment |
| `500` | Unexpected server failure |
