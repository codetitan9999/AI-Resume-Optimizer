# Diagram Pack

This file centralizes the main diagrams for reviews, demos, onboarding, and interviews.

## 1. System Context Diagram

```mermaid
flowchart LR
    Candidate[Candidate / User]
    Recruiter[Recruiter / Reviewer]
    Candidate --> App[AI Resume Optimizer]
    Recruiter --> App
    App --> Gemini[Gemini API]
    App --> OpenAI[OpenAI API]
    App --> Mongo[(MongoDB Atlas)]
    App --> Razorpay[Razorpay]
    App --> JobSites[Public Job Pages]
    App --> Vercel[Vercel Hosting]
```

## 2. HLD Container Diagram

```mermaid
flowchart TD
    subgraph Browser
        Pages[Route Pages]
        Components[Feature Components]
        Store[Zustand Store]
        Services[Client Service Layer]
    end

    subgraph NextJSApp[Next.js Runtime]
        APIRoutes[API Routes]
        Guards[Auth / Subscription Guards]
        AIOrchestrator[AI Orchestrator]
        JDExtractor[JD Extractor]
        PaymentLayer[Payment Layer]
        MongoLayer[Mongo Layer]
    end

    Pages --> Components
    Components --> Store
    Components --> Services
    Services --> APIRoutes
    APIRoutes --> Guards
    APIRoutes --> AIOrchestrator
    APIRoutes --> JDExtractor
    APIRoutes --> PaymentLayer
    Guards --> MongoLayer
    PaymentLayer --> MongoLayer
```

## 3. LLD Module Interaction Diagram

```mermaid
flowchart LR
    A[AnalyzeWorkspace / Builder / Billing UI] --> B[lib/services/*]
    B --> C[app/api/* route handlers]
    C --> D[Zod Schemas]
    C --> E[Auth Session Helpers]
    C --> F[AI / JD / Payment Orchestration]
    E --> G[(MongoDB Users)]
    F --> H[(MongoDB Payments)]
    F --> I[Gemini / OpenAI]
    F --> J[Razorpay / Public URLs]
    C --> K[JSON Response]
    K --> L[Zustand Store]
    L --> A
```

## 4. Class Diagram

This is a domain-and-service class diagram, not a literal representation of only `class` keywords in the code.

```mermaid
classDiagram
    class AuthUser {
      +string id
      +string name
      +string email
      +string createdAt
      +UserSubscription subscription
    }

    class UserSubscription {
      +SubscriptionPlanId planId
      +SubscriptionStatus status
      +number amountInr
      +string currency
      +string startedAt
      +string expiresAt
      +string updatedAt
      +string paymentProvider
      +string paymentId
      +string orderId
    }

    class ResumeData {
      +PersonalInfo personalInfo
      +string summary
      +ExperienceItem[] experience
      +ProjectItem[] projects
      +SkillsData skills
      +EducationItem[] education
      +string[] certifications
    }

    class AnalysisResult {
      +number score
      +number probability
      +string[] strengths
      +string[] weaknesses
      +string[] missingKeywords
      +string[] matchedKeywords
    }

    class OptimizationSection {
      +string id
      +string title
      +OptimizationSuggestion[] suggestions
    }

    class OptimizationSuggestion {
      +string id
      +string original
      +string optimized
      +string rationale
      +number confidence
      +OptimizationTarget target
    }

    class ResumeAnalyzerService {
      <<interface>>
      +analyze(input)
    }

    class ResumeOptimizerService {
      <<interface>>
      +optimize(input)
    }

    class AuthService {
      +signup(input)
      +login(input)
      +logout()
      +session()
    }

    class PaymentService {
      +createOrder(planId)
      +verify(planId, payload)
      +activateBypass(planId)
      +subscription()
    }

    AuthUser --> UserSubscription
    ResumeData --> OptimizationSection
    OptimizationSection --> OptimizationSuggestion
    ResumeAnalyzerService --> AnalysisResult
    ResumeOptimizerService --> OptimizationSection
```

## 5. ER Diagram

```mermaid
erDiagram
    USERS ||--o{ PAYMENTS : makes

    USERS {
        string _id
        string name
        string email
        string passwordHash
        string createdAt
        string subscription_planId
        string subscription_status
        int subscription_amountInr
        string subscription_currency
        string subscription_startedAt
        string subscription_expiresAt
        string subscription_updatedAt
        string subscription_paymentProvider
        string subscription_paymentId
        string subscription_orderId
    }

    PAYMENTS {
        string _id
        string userId
        string planId
        int amountInr
        int amountPaise
        string currency
        string provider
        string razorpayOrderId
        string razorpayPaymentId
        string razorpaySignature
        string createdAt
    }
```

## 6. Signup And Login Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Auth UI
    participant API as Auth API
    participant DB as MongoDB
    participant C as Cookie Store

    U->>UI: Submit signup/login form
    UI->>API: POST /api/auth/signup or /api/auth/login
    API->>DB: Create user or validate user credentials
    DB-->>API: User record
    API->>C: Set signed HTTP-only auth cookie
    API-->>UI: Return public user profile
    UI-->>U: Navigate to billing or analyze
```

## 7. Analyze Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant UI as AnalyzeWorkspace
    participant PDF as PDF Text Extractor
    participant API as /api/analyze
    participant AUTH as Session Guard
    participant JD as JD Extractor
    participant AI as AI Layer

    U->>UI: Upload PDF + provide JD text or URL
    UI->>PDF: Extract text locally when possible
    UI->>API: POST analysis payload
    API->>AUTH: Validate session + subscription
    API->>JD: Resolve JD text
    API->>AI: Analyze resume against JD
    AI-->>API: Structured analysis result
    API-->>UI: Analysis result + metadata
    UI-->>U: Render score, strengths, weaknesses, keywords
```

## 8. Optimize Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Optimize/Builder UI
    participant API as /api/optimize
    participant AUTH as Session Guard
    participant JD as JD Extractor
    participant AI as AI Layer
    participant STORE as Zustand Store

    U->>UI: Request general or JD-aligned optimization
    UI->>API: POST structured resumeData
    API->>AUTH: Validate session + subscription
    API->>JD: Resolve JD when provided
    API->>AI: Generate optimization sections
    AI-->>API: Structured optimization output
    API-->>UI: Suggestion sections + context
    U->>UI: Apply mapped suggestion
    UI->>STORE: Update resumeData
    STORE-->>UI: Refresh preview/content
```

## 9. Billing Bypass Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Billing UI
    participant API as /api/payments/mock-activate
    participant AUTH as Session Guard
    participant DB as MongoDB

    U->>UI: Choose plan in demo mode
    UI->>API: POST selected plan
    API->>AUTH: Validate session
    API->>DB: Update embedded user subscription
    DB-->>API: Updated user
    API-->>UI: Active subscription payload
    UI-->>U: Redirect to premium workflow
```

## 10. Billing Razorpay Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Billing UI
    participant API1 as /api/payments/create-order
    participant RZ as Razorpay
    participant API2 as /api/payments/verify
    participant DB as MongoDB

    U->>UI: Choose paid plan
    UI->>API1: Create order request
    API1->>RZ: Create Razorpay order
    RZ-->>UI: Checkout details
    U->>RZ: Complete payment
    UI->>API2: Verify payment payload
    API2->>DB: Update user subscription and insert payment record
    API2-->>UI: Success response
    UI-->>U: Subscription activated
```

## 11. Deployment Diagram

```mermaid
flowchart LR
    Dev[Developer] --> GitHub[GitHub Repository]
    GitHub --> Vercel[Vercel Project]
    Vercel --> AppRuntime[Next.js Node Runtime]
    AppRuntime --> MongoDB[(MongoDB Atlas)]
    AppRuntime --> Gemini[Gemini API]
    AppRuntime --> OpenAI[OpenAI API]
    AppRuntime --> Razorpay[Razorpay API]
    AppRuntime --> PublicWeb[Public Job URLs]
    Browser[End User Browser] --> Vercel
```
