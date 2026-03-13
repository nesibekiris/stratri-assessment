"use client";

import { useState } from "react";
import { Download, Mail, Check, Loader2, AlertCircle } from "lucide-react";
import { exportResultsToPDF } from "@/lib/pdf";

const B = {
  cream: "#FEFBF8",
  navy: "#1E2A45",
  teal: "#184A5A",
  muted: "#9FB7C8",
  mutedPale: "#E1EBF0",
  textSecondary: "#5A6478",
  textTertiary: "#8A8F9C",
  border: "#E8E2D9",
  green: "#3A7D68",
  red: "#B54A3F",
};

const sans = "'IBM Plex Sans', -apple-system, sans-serif";
const mono = "'IBM Plex Mono', 'Courier New', monospace";

interface ResultsActionsProps {
  assessmentType: "maturity" | "governance";
  resultsElementId: string;
  isSaving: boolean;
  lastSaved: Date | null;
  onSendEmail: (email: string, name: string) => Promise<boolean>;
}

export default function ResultsActions({
  assessmentType,
  resultsElementId,
  isSaving,
  lastSaved,
  onSendEmail,
}: ResultsActionsProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailAddr, setEmailAddr] = useState("");
  const [emailName, setEmailName] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const typeLabel =
    assessmentType === "maturity" ? "AI-Maturity" : "AI-Governance";

  async function handlePDF() {
    setPdfLoading(true);
    await exportResultsToPDF(
      resultsElementId,
      `STRATRI-${typeLabel}-Results.pdf`
    );
    setPdfLoading(false);
    setPdfDone(true);
    setTimeout(() => setPdfDone(false), 3000);
  }

  async function handleEmail() {
    if (!emailAddr || !emailAddr.includes("@")) return;
    setEmailSending(true);
    setEmailError(false);
    const success = await onSendEmail(emailAddr, emailName);
    setEmailSending(false);
    if (success) {
      setEmailSent(true);
      setTimeout(() => {
        setEmailSent(false);
        setEmailOpen(false);
      }, 3000);
    } else {
      setEmailError(true);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: `1px solid ${B.border}`,
        padding: "20px 28px",
        marginBottom: 28,
        fontFamily: sans,
      }}
    >
      {/* Save status + actions row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Save status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: B.textTertiary,
            fontFamily: mono,
          }}
        >
          {isSaving ? (
            <>
              <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
              <span>Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <Check size={13} color={B.green} />
              <span>
                Saved{" "}
                {lastSaved.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </>
          ) : (
            <span style={{ opacity: 0.5 }}>Auto-save enabled</span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handlePDF}
            disabled={pdfLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 20px",
              background: "#fff",
              border: `1.5px solid ${B.border}`,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: pdfDone ? B.green : B.navy,
              cursor: pdfLoading ? "wait" : "pointer",
              fontFamily: sans,
              transition: "all 0.15s",
            }}
          >
            {pdfLoading ? (
              <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
            ) : pdfDone ? (
              <Check size={15} />
            ) : (
              <Download size={15} />
            )}
            {pdfDone ? "Downloaded" : "Export PDF"}
          </button>

          <button
            onClick={() => setEmailOpen(!emailOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 20px",
              background: emailOpen ? B.teal : B.navy,
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "#fff",
              cursor: "pointer",
              fontFamily: sans,
              transition: "all 0.15s",
            }}
          >
            <Mail size={15} />
            Email Results
          </button>
        </div>
      </div>

      {/* Email form (expandable) */}
      {emailOpen && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: `1px solid ${B.border}`,
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 140 }}>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 500,
                color: B.textTertiary,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 6,
                fontFamily: mono,
              }}
            >
              Name
            </label>
            <input
              type="text"
              value={emailName}
              onChange={(e) => setEmailName(e.target.value)}
              placeholder="Your name"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: `1.5px solid ${B.border}`,
                borderRadius: 8,
                fontSize: 13.5,
                fontFamily: sans,
                background: "#fff",
                color: B.navy,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 500,
                color: B.textTertiary,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 6,
                fontFamily: mono,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={emailAddr}
              onChange={(e) => setEmailAddr(e.target.value)}
              placeholder="you@company.com"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: `1.5px solid ${B.border}`,
                borderRadius: 8,
                fontSize: 13.5,
                fontFamily: sans,
                background: "#fff",
                color: B.navy,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            onClick={handleEmail}
            disabled={emailSending || !emailAddr.includes("@")}
            style={{
              padding: "10px 24px",
              background: emailSent
                ? B.green
                : emailError
                ? B.red
                : B.teal,
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "#fff",
              cursor:
                emailSending || !emailAddr.includes("@")
                  ? "not-allowed"
                  : "pointer",
              fontFamily: sans,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity:
                emailSending || !emailAddr.includes("@") ? 0.6 : 1,
            }}
          >
            {emailSending ? (
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            ) : emailSent ? (
              <Check size={14} />
            ) : emailError ? (
              <AlertCircle size={14} />
            ) : (
              <Mail size={14} />
            )}
            {emailSent
              ? "Sent!"
              : emailError
              ? "Try Again"
              : "Send"}
          </button>
        </div>
      )}

      {/* CSS for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
