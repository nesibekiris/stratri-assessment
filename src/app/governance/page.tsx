"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const GovernanceAssessment = dynamic(
  () => import("@/components/GovernanceAssessment"),
  { ssr: false }
);

export default function GovernancePage() {
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
      <GovernanceAssessment />
    </Suspense>
  );
}
