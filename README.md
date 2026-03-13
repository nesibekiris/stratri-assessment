# STRATRI AI Assessment Suite

A Next.js application featuring two research-grounded AI assessment tools with Supabase backend, PDF export, and email delivery.

## Architecture

```
stratri-assessments/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with fonts
│   │   ├── page.tsx                # Landing page (links to both tools)
│   │   ├── maturity/page.tsx       # AI Maturity Assessment
│   │   ├── governance/page.tsx     # AI Governance Assessment
│   │   └── api/
│   │       └── send-results/route.ts  # Resend email API
│   ├── components/
│   │   ├── MaturityAssessment.jsx     # 8 domains, 40 questions
│   │   ├── GovernanceAssessment.jsx   # 7 domains + 3 regional modules
│   │   └── ResultsActions.tsx         # PDF export + email send bar
│   ├── hooks/
│   │   └── useAssessment.ts        # Supabase save/load/auto-save hook
│   └── lib/
│       ├── supabase.ts             # Supabase client + API functions
│       └── pdf.ts                  # html2canvas + jsPDF export
├── supabase/
│   └── schema.sql                  # Database tables + RLS policies
├── .env.local.example              # Environment variables template
└── package.json
```

## Features

| Feature | Status |
|---------|--------|
| Interactive multi-step wizard | ✅ |
| Progress tracking (sidebar + bar) | ✅ |
| Results dashboard (radar + bars) | ✅ |
| Supabase backend | ✅ Ready to connect |
| Auto-save on each answer | ✅ Via useAssessment hook |
| Resume assessment (URL-based) | ✅ Via ?id= parameter |
| PDF export | ✅ Client-side (html2canvas + jsPDF) |
| Email results | ✅ Resend API route |
| STRATRI brand system | ✅ Cream/Navy/Teal, Cormorant+IBM Plex |
| Real logo assets (base64) | ✅ Embedded |

## Quick Start

### 1. Clone and install

```bash
cd stratri-assessments
npm install
```

### 2. Set up Supabase

1. Go to your Supabase dashboard → SQL Editor
2. Paste and run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key from Settings → API

### 3. Set up Resend (email)

1. Create account at [resend.com](https://resend.com)
2. Add your domain (or use sandbox for testing)
3. Get your API key

### 4. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=assessments@stratri.com
NEXT_PUBLIC_APP_URL=https://assessments.stratri.com
```

### 5. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`

### 6. Deploy to Vercel

```bash
npx vercel
```

Add environment variables in Vercel dashboard → Settings → Environment Variables.

## Integration Guide

The assessment components are standalone React components. To connect them to Supabase, add these callback props:

### In each assessment component, add these props:

```jsx
// At the top of the component
export default function App({ 
  onProfileSubmit,   // (profile) => Promise<string>  — returns assessment ID
  onAnswer,          // (responses, progress) => void  — triggers auto-save
  onComplete,        // (results) => void              — saves final scores
  initialData,       // { profile, responses, ... }    — for resuming
}) {
```

### Connect auto-save to the answer handler:

```jsx
// After setting a core answer:
function pickCore(lv) {
  const newAns = { ...coreAns, [dom.id]: { ...coreAns[dom.id], [cQ]: lv } };
  setCoreAns(newAns);
  // ← Add this: trigger auto-save
  onAnswer?.(newAns, calculateProgress(newAns));
}
```

### Connect profile submission:

```jsx
// When "Start Assessment" is clicked:
async function handleStart() {
  const id = await onProfileSubmit?.(profile);
  if (id) setPhase("assessment");
}
```

### Connect results completion:

```jsx
// When results are calculated:
useEffect(() => {
  if (phase === "results") {
    onComplete?.({
      domain_scores: scores,
      regional_scores: regScores,
      overall_score: overall,
      maturity_level: Math.round(overall),
    });
  }
}, [phase]);
```

### Add ResultsActions to results page:

```jsx
import ResultsActions from "./ResultsActions";

// In the results section, after the radar chart:
<ResultsActions
  assessmentType="governance"
  resultsElementId="results-dashboard"
  isSaving={isSaving}
  lastSaved={lastSaved}
  onSendEmail={sendResultsEmail}
/>
```

## Supabase Schema

The `assessments` table stores:
- **Profile**: organization, industry, regions
- **Responses**: JSONB with domain → question → score mapping
- **Scores**: Calculated domain scores and overall maturity level
- **Contact**: Name, email, company (for lead gen)
- **Status**: in_progress / completed with progress percentage

RLS is configured for public access (no auth required). The UUID in the URL acts as the access token.

## Email Template

The Resend API route (`/api/send-results`) sends a branded HTML email with:
- STRATRI header and branding
- Overall score and maturity level
- Domain breakdown table
- Regional compliance scores (governance only)
- CTA to schedule consultation
- Optional PDF attachment

## PDF Export

Client-side generation using html2canvas + jsPDF:
- Captures the results dashboard as a high-resolution PNG
- Converts to multi-page A4 PDF
- Adds STRATRI footer with date and page numbers
- Triggers browser download

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + RLS)
- **Email**: Resend
- **PDF**: html2canvas + jsPDF
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deploy**: Vercel

## License

Proprietary — STRATRI © 2026
