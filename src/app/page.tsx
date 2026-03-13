"use client";

import { ArrowRight, BarChart3, Shield } from "lucide-react";
import Link from "next/link";

const LOGO_MARK =
  "data:image/png;base64,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";

export default function Home() {
  const serif = "'Cormorant Garamond', Georgia, serif";
  const mono = "'IBM Plex Mono', monospace";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
      }}
    >
      {/* Header */}
      <img
        src={LOGO_MARK}
        alt="STRATRI"
        style={{ height: 56, marginBottom: 16 }}
      />
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: 4,
          color: "#184A5A",
          textTransform: "uppercase",
          fontFamily: mono,
          marginBottom: 44,
        }}
      >
        STRATRI
      </div>

      <h1
        style={{
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 400,
          lineHeight: 1.1,
          textAlign: "center",
          fontFamily: serif,
          marginBottom: 16,
        }}
      >
        AI Assessment{" "}
        <em style={{ fontWeight: 300 }}>Suite</em>
      </h1>
      <div
        style={{
          width: 48,
          height: 1.5,
          background: "#9FB7C8",
          marginBottom: 20,
        }}
      />
      <p
        style={{
          fontSize: 16.5,
          lineHeight: 1.75,
          color: "#5A6478",
          maxWidth: 480,
          textAlign: "center",
          fontWeight: 300,
          marginBottom: 56,
        }}
      >
        Evaluate your organization&apos;s AI readiness and governance posture
        with research-grounded, framework-aligned assessments.
      </p>

      {/* Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          maxWidth: 680,
          width: "100%",
        }}
      >
        <Link href="/maturity" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #E8E2D9",
              padding: "36px 28px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#184A5A";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E8E2D9";
              e.currentTarget.style.transform = "none";
            }}
          >
            <BarChart3 size={28} color="#184A5A" strokeWidth={1.5} />
            <h2
              style={{
                fontSize: 22,
                fontWeight: 400,
                fontFamily: serif,
                margin: "16px 0 8px",
              }}
            >
              AI Maturity
            </h2>
            <p style={{ fontSize: 14, color: "#5A6478", lineHeight: 1.6, marginBottom: 20 }}>
              8 domains, 40 questions. Evaluate technical readiness, data
              infrastructure, talent, and strategic alignment.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                color: "#184A5A",
              }}
            >
              Start Assessment <ArrowRight size={15} />
            </div>
          </div>
        </Link>

        <Link href="/governance" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #E8E2D9",
              padding: "36px 28px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#184A5A";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E8E2D9";
              e.currentTarget.style.transform = "none";
            }}
          >
            <Shield size={28} color="#184A5A" strokeWidth={1.5} />
            <h2
              style={{
                fontSize: 22,
                fontWeight: 400,
                fontFamily: serif,
                margin: "16px 0 8px",
              }}
            >
              AI Governance
            </h2>
            <p style={{ fontSize: 14, color: "#5A6478", lineHeight: 1.6, marginBottom: 20 }}>
              7 core domains + regional compliance modules. EU AI Act, US state
              laws, Türkiye KVKK coverage.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                color: "#184A5A",
              }}
            >
              Start Assessment <ArrowRight size={15} />
            </div>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 72,
          paddingTop: 20,
          borderTop: "1px solid #E8E2D9",
          textAlign: "center",
          maxWidth: 420,
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "#8A8F9C",
            fontFamily: mono,
            letterSpacing: 1,
          }}
        >
          © 2026 STRATRI · Governance & Technology Policy Studio
        </div>
      </div>
    </div>
  );
}
