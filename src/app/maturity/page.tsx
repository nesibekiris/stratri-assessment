"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Import the assessment component (copy stratri-ai-maturity-assessment.jsx to src/components/)
// The component will be enhanced to accept these props:
//   onProfileSubmit(profile) - triggers Supabase create
//   onAnswer(domain, qIndex, value, allResponses) - triggers auto-save
//   onComplete(results) - triggers Supabase complete + shows ResultsActions
//   initialData - for resuming { profile, responses, currentDomain, currentQuestion }

const MaturityAssessment = dynamic(
  () => import("@/components/MaturityAssessment"),
  { ssr: false }
);

export default function MaturityPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FEFBF8",
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: "#8A8F9C",
            fontSize: 13,
          }}
        >
          Loading assessment...
        </div>
      }
    >
      <MaturityAssessment />
    </Suspense>
  );
}
