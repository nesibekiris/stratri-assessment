import { useState, useEffect, useRef, useCallback } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { ChevronRight, ChevronLeft, Check, ArrowRight, AlertTriangle, Zap, Clock, Shield, Layers, Star, Globe, Scale, FileText, Users, Eye, Lock, Activity, AlertCircle, Download, Mail, Loader2, RefreshCw } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import ResultsActions from "@/components/ResultsActions";
import { exportResultsToPDF } from "@/lib/pdf";

const B = {
  cream: "#FEFBF8", creamDark: "#F5F0EA", navy: "#1E2A45", navyLight: "#2C3A55",
  teal: "#184A5A", tealLight: "#1F5E72", muted: "#9FB7C8", mutedLight: "#C2D3DE",
  mutedPale: "#E1EBF0", textPrimary: "#1E2A45", textSecondary: "#5A6478",
  textTertiary: "#8A8F9C", border: "#E8E2D9", red: "#B54A3F", orange: "#C47F2B",
  amber: "#7A6C3A", green: "#3A7D68",
};
const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'IBM Plex Sans', -apple-system, sans-serif";
const mono = "'IBM Plex Mono', 'Courier New', monospace";

const GOV_LEVELS = {
  1: { name: "Exploring", desc: "Building awareness, baselining, gap analysis", color: B.red },
  2: { name: "Aligning", desc: "Defining enterprise AI governance principles", color: B.orange },
  3: { name: "Formalizing", desc: "Adopting standardized governance workflows", color: B.amber },
  4: { name: "Optimizing", desc: "Optimizing GRC across AI operations", color: B.teal },
  5: { name: "Governing at Scale", desc: "Scaling governance, risk & compliance", color: B.green },
};

const REGIONS = [
  { id: "eu", label: "European Union / EEA", flag: "\uD83C\uDDEA\uD83C\uDDFA" },
  { id: "us", label: "United States", flag: "\uD83C\uDDFA\uD83C\uDDF8" },
  { id: "tr", label: "T\u00FCrkiye", flag: "\uD83C\uDDF9\uD83C\uDDF7" },
];

const INDUSTRIES = [
  "Financial Services", "Healthcare", "Technology", "Retail", "Manufacturing",
  "Energy", "Telecom", "Government", "Education", "Media", "Other"
];

const CORE_DOMAINS = [
  { id: "policy", name: "Policy & Framework", icon: FileText,
    description: "AI policies, ethics frameworks, acceptable use standards, and enforcement mechanisms",
    questions: [
      { q: "Does your organization have a documented AI policy?", options: [
        { text: "No AI-specific policy exists", level: 1 },
        { text: "Draft policy under development", level: 2 },
        { text: "Approved policy covering key AI principles", level: 3 },
        { text: "Comprehensive policy suite with regular review cycles", level: 4 },
        { text: "Living policy framework with automated enforcement and version control", level: 5 },
      ]},
      { q: "Is there a defined AI ethics framework guiding your organization?", options: [
        { text: "No ethics framework", level: 1 },
        { text: "General awareness of ethical principles, not formalized", level: 2 },
        { text: "Documented ethics principles endorsed by leadership", level: 3 },
        { text: "Ethics framework embedded in decision-making with review board", level: 4 },
        { text: "Ethics principles operationalized with automated checks and continuous updates", level: 5 },
      ]},
      { q: "Do you have acceptable use policies for AI tools and systems?", options: [
        { text: "No acceptable use policies for AI", level: 1 },
        { text: "Informal guidance shared via email or wiki", level: 2 },
        { text: "Formal acceptable use policy covering major AI tools", level: 3 },
        { text: "Comprehensive policies covering all AI usage with training requirements", level: 4 },
        { text: "Dynamic policies updated with new AI capabilities and monitored for compliance", level: 5 },
      ]},
      { q: "How often are AI governance policies reviewed and updated?", options: [
        { text: "Never reviewed since creation", level: 1 },
        { text: "Updated only when issues arise", level: 2 },
        { text: "Annual review cycle", level: 3 },
        { text: "Quarterly reviews aligned with regulatory changes", level: 4 },
        { text: "Continuous monitoring with trigger-based updates and stakeholder input", level: 5 },
      ]},
    ]
  },
  { id: "structure", name: "Organizational Structure", icon: Users,
    description: "Governance committees, accountability roles, RACI clarity, and escalation pathways",
    questions: [
      { q: "Is there a dedicated AI Governance Committee with executive mandate?", options: [
        { text: "No governance committee exists", level: 1 },
        { text: "Informal working group without formal authority", level: 2 },
        { text: "Formal committee that meets quarterly", level: 3 },
        { text: "Active committee with monthly meetings and documented decisions", level: 4 },
        { text: "Empowered council with real-time oversight, clear authority, and board reporting", level: 5 },
      ]},
      { q: "Are roles and responsibilities for AI governance clearly defined (RACI)?", options: [
        { text: "No defined roles for AI governance", level: 1 },
        { text: "Some informal ownership but unclear boundaries", level: 2 },
        { text: "RACI matrix documented for key AI governance activities", level: 3 },
        { text: "Comprehensive RACI across all AI lifecycle stages with named individuals", level: 4 },
        { text: "Dynamic accountability framework integrated with HR and project management systems", level: 5 },
      ]},
      { q: "Does your organization have a Chief AI Officer or equivalent role?", options: [
        { text: "No dedicated AI leadership role", level: 1 },
        { text: "AI responsibilities added to an existing role informally", level: 2 },
        { text: "Designated AI lead with partial governance mandate", level: 3 },
        { text: "Dedicated CAIO or equivalent with governance authority and budget", level: 4 },
        { text: "CAIO with board access, cross-functional mandate, and P&L accountability", level: 5 },
      ]},
      { q: "Are escalation pathways for AI-related issues clearly defined?", options: [
        { text: "No escalation pathways exist", level: 1 },
        { text: "Ad-hoc escalation through general IT channels", level: 2 },
        { text: "Documented escalation matrix for AI risks", level: 3 },
        { text: "Tiered escalation with SLAs and automatic triggers", level: 4 },
        { text: "Predictive risk flagging with pre-emptive escalation and resolution tracking", level: 5 },
      ]},
    ]
  },
  { id: "risk", name: "Risk Management", icon: Shield,
    description: "Risk methodology, AI system classification, risk registers, and mitigation planning",
    questions: [
      { q: "Have you adopted a recognized AI risk assessment methodology?", options: [
        { text: "No risk methodology for AI", level: 1 },
        { text: "General enterprise risk framework applied loosely to AI", level: 2 },
        { text: "AI-specific risk framework adopted (NIST AI RMF, ISO 42001, or equivalent)", level: 3 },
        { text: "Comprehensive methodology with quantitative scoring and regular assessments", level: 4 },
        { text: "Continuous risk assessment integrated with model monitoring and automated alerts", level: 5 },
      ]},
      { q: "Have you classified your AI systems by risk level?", options: [
        { text: "No classification of AI systems", level: 1 },
        { text: "Awareness of risk levels but no formal classification", level: 2 },
        { text: "AI systems classified as high/limited/minimal risk", level: 3 },
        { text: "Risk classification drives governance requirements and resource allocation", level: 4 },
        { text: "Dynamic risk classification that updates with usage, context, and regulatory changes", level: 5 },
      ]},
      { q: "Do you maintain a risk register for AI-related risks?", options: [
        { text: "No AI risk register", level: 1 },
        { text: "Key risks informally tracked", level: 2 },
        { text: "Formal risk register with ownership and review cycles", level: 3 },
        { text: "Integrated risk register with impact/likelihood scoring and mitigation tracking", level: 4 },
        { text: "Real-time risk dashboard with predictive analytics and automated mitigation triggers", level: 5 },
      ]},
      { q: "Do you have documented incident response procedures for AI failures?", options: [
        { text: "No AI incident response plan", level: 1 },
        { text: "General IT incident response applied to AI", level: 2 },
        { text: "AI-specific response procedures with defined escalation", level: 3 },
        { text: "Tested procedures with regular tabletop exercises and post-incident reviews", level: 4 },
        { text: "Automated detection, containment, and recovery with continuous improvement loops", level: 5 },
      ]},
    ]
  },
  { id: "ethics", name: "Ethics & Responsible AI", icon: Scale,
    description: "Fairness testing, explainability, human oversight, transparency, and fundamental rights",
    questions: [
      { q: "Do you conduct systematic bias and fairness testing on AI systems?", options: [
        { text: "No bias testing conducted", level: 1 },
        { text: "Awareness of bias risk but no systematic testing", level: 2 },
        { text: "Bias testing conducted for high-risk systems before deployment", level: 3 },
        { text: "Regular bias audits across all production systems with defined metrics", level: 4 },
        { text: "Continuous fairness monitoring with automated detection and remediation", level: 5 },
      ]},
      { q: "How do you address explainability requirements for AI decisions?", options: [
        { text: "No explainability practices", level: 1 },
        { text: "Some model documentation exists but not systematic", level: 2 },
        { text: "Explainability required for high-risk decisions with model cards", level: 3 },
        { text: "Comprehensive explainability framework with stakeholder-appropriate explanations", level: 4 },
        { text: "Real-time explanations integrated into all AI-driven interfaces and decisions", level: 5 },
      ]},
      { q: "Are human oversight mechanisms in place for AI-driven decisions?", options: [
        { text: "No human oversight requirements defined", level: 1 },
        { text: "Human-in-the-loop for some decisions informally", level: 2 },
        { text: "Defined HITL requirements based on risk classification", level: 3 },
        { text: "Structured oversight with clear criteria for when humans must intervene", level: 4 },
        { text: "Adaptive oversight that scales based on system confidence and impact severity", level: 5 },
      ]},
      { q: "Have you conducted Fundamental Rights Impact Assessments (FRIA)?", options: [
        { text: "No awareness of FRIA requirements", level: 1 },
        { text: "Awareness exists but no assessments conducted", level: 2 },
        { text: "FRIA completed for known high-risk systems", level: 3 },
        { text: "Systematic FRIA process integrated into AI development lifecycle", level: 4 },
        { text: "Continuous impact monitoring with stakeholder engagement and public reporting", level: 5 },
      ]},
    ]
  },
  { id: "data_gov", name: "Data Governance", icon: Lock,
    description: "Data quality, privacy compliance, consent management, and training data documentation",
    questions: [
      { q: "How do you ensure data quality for AI training and inference?", options: [
        { text: "No formal data quality standards for AI", level: 1 },
        { text: "Basic quality checks on ad-hoc basis", level: 2 },
        { text: "Defined data quality standards with regular assessments", level: 3 },
        { text: "Automated quality monitoring with defined thresholds and remediation", level: 4 },
        { text: "Continuous data quality assurance integrated with model performance tracking", level: 5 },
      ]},
      { q: "Have you completed Privacy Impact Assessments for AI systems?", options: [
        { text: "No privacy assessments for AI", level: 1 },
        { text: "General GDPR/KVKK compliance applied without AI-specific analysis", level: 2 },
        { text: "PIAs completed for AI systems processing personal data", level: 3 },
        { text: "Comprehensive DPIAs integrated into AI development lifecycle", level: 4 },
        { text: "Continuous privacy monitoring with automated compliance verification", level: 5 },
      ]},
      { q: "Is AI training data documented with provenance and consent records?", options: [
        { text: "No documentation of training data", level: 1 },
        { text: "Basic awareness of data sources used", level: 2 },
        { text: "Training data inventoried with source documentation", level: 3 },
        { text: "Full data lineage with consent records and usage restrictions tracked", level: 4 },
        { text: "Automated data provenance system with real-time compliance verification", level: 5 },
      ]},
      { q: "How do you manage data minimization in AI systems?", options: [
        { text: "No data minimization practices for AI", level: 1 },
        { text: "Awareness of principle but not applied systematically", level: 2 },
        { text: "Data minimization reviewed during AI system design", level: 3 },
        { text: "Enforced data minimization with regular audits and documentation", level: 4 },
        { text: "Automated data minimization with privacy-enhancing technologies embedded", level: 5 },
      ]},
    ]
  },
  { id: "technical", name: "Technical Controls", icon: Activity,
    description: "Model documentation, monitoring, drift detection, audit trails, and third-party assessment",
    questions: [
      { q: "Do you maintain model cards or system documentation for AI systems?", options: [
        { text: "No model documentation", level: 1 },
        { text: "Some models have basic README files", level: 2 },
        { text: "Standardized model cards for all production systems", level: 3 },
        { text: "Comprehensive factsheets with performance, limitations, and usage guidelines", level: 4 },
        { text: "Living documentation auto-generated from model metadata with compliance mapping", level: 5 },
      ]},
      { q: "What level of continuous monitoring exists for deployed AI systems?", options: [
        { text: "No monitoring after deployment", level: 1 },
        { text: "Manual periodic performance reviews", level: 2 },
        { text: "Automated monitoring with scheduled reports", level: 3 },
        { text: "Real-time monitoring with drift detection and automated alerts", level: 4 },
        { text: "Predictive monitoring with self-healing capabilities and compliance integration", level: 5 },
      ]},
      { q: "How complete are your AI system audit trails?", options: [
        { text: "No audit trails for AI decisions", level: 1 },
        { text: "Partial logging of some AI system activities", level: 2 },
        { text: "Comprehensive logging for high-risk systems", level: 3 },
        { text: "Full audit trails across all systems with immutable storage", level: 4 },
        { text: "End-to-end audit infrastructure with automated compliance reporting and forensics", level: 5 },
      ]},
      { q: "Do you conduct third-party assessments of AI systems?", options: [
        { text: "No external assessments", level: 1 },
        { text: "Occasional vendor security assessments", level: 2 },
        { text: "Annual third-party AI audits for high-risk systems", level: 3 },
        { text: "Regular external audits with defined scope and remediation tracking", level: 4 },
        { text: "Continuous assurance program with multiple audit partners and public reporting", level: 5 },
      ]},
    ]
  },
  { id: "transparency", name: "Transparency", icon: Eye,
    description: "Public disclosure, stakeholder communication, complaint mechanisms, and accountability",
    questions: [
      { q: "Do you publicly disclose your use of AI systems?", options: [
        { text: "No public disclosure of AI usage", level: 1 },
        { text: "Mentioned in general terms in privacy policy", level: 2 },
        { text: "AI usage disclosed with purpose descriptions", level: 3 },
        { text: "Detailed AI transparency reports published regularly", level: 4 },
        { text: "Real-time transparency dashboard with impact assessments and public engagement", level: 5 },
      ]},
      { q: "Do users have mechanisms to contest or appeal AI-driven decisions?", options: [
        { text: "No contestability mechanisms", level: 1 },
        { text: "General complaint channels, not AI-specific", level: 2 },
        { text: "Defined appeal process for AI-driven decisions", level: 3 },
        { text: "Structured contestation with SLAs, human review, and outcome tracking", level: 4 },
        { text: "Proactive notification with easy-access appeals and systemic pattern analysis", level: 5 },
      ]},
      { q: "How do you communicate AI governance practices to stakeholders?", options: [
        { text: "No governance communication", level: 1 },
        { text: "Internal leadership briefings only", level: 2 },
        { text: "Regular internal reporting with external-facing summary", level: 3 },
        { text: "Comprehensive stakeholder engagement with tailored communications", level: 4 },
        { text: "Multi-channel transparency program with community involvement and feedback loops", level: 5 },
      ]},
    ]
  },
];

// Regional compliance modules
const REGIONAL_MODULES = {
  eu: {
    name: "EU AI Act Compliance", flag: "\uD83C\uDDEA\uD83C\uDDFA",
    deadline: "August 2, 2026", deadlineDate: new Date(2026, 7, 2),
    maxPenalty: "\u20AC35M or 7% global turnover",
    weight: 1.5,
    questions: [
      { q: "Have you classified your AI systems per EU AI Act risk categories (prohibited, high-risk, limited, minimal)?", points: 15 },
      { q: "Is technical documentation prepared for high-risk AI systems as required?", points: 15 },
      { q: "Have you determined the conformity assessment pathway for high-risk systems?", points: 10 },
      { q: "Have you conducted Fundamental Rights Impact Assessments (FRIA) where required?", points: 10 },
      { q: "Is a post-market monitoring plan established for high-risk systems?", points: 10 },
      { q: "Have you assessed CE marking readiness for applicable AI systems?", points: 5 },
    ]
  },
  us: {
    name: "US State AI Compliance", flag: "\uD83C\uDDFA\uD83C\uDDF8",
    deadline: "June 2026 (Colorado)", deadlineDate: new Date(2026, 5, 1),
    maxPenalty: "Varies by state; AG enforcement powers",
    weight: 1.3,
    questions: [
      { q: "Have you completed algorithmic discrimination assessments (Colorado AI Act)?", points: 12 },
      { q: "Is impact assessment documentation prepared for high-risk automated systems?", points: 12 },
      { q: "Are consumer notification mechanisms in place for AI-driven consequential decisions?", points: 8 },
      { q: "Have you implemented AI-generated content disclosure (California requirements)?", points: 8 },
      { q: "Is training data transparency documentation prepared?", points: 10 },
    ]
  },
  tr: {
    name: "T\u00FCrkiye Compliance", flag: "\uD83C\uDDF9\uD83C\uDDF7",
    deadline: "Ongoing (KVKK + AI Strategy)", deadlineDate: null,
    maxPenalty: "KVKK fines up to \u20BA9.8M + sector-specific",
    weight: 1.1,
    questions: [
      { q: "Are AI systems compliant with KVKK (Personal Data Protection Law) data processing requirements?", points: 15 },
      { q: "Have you aligned with T\u00FCrkiye\u2019s National AI Strategy (2021\u20132025) principles?", points: 10 },
      { q: "Is explicit consent obtained for AI processing of personal data per KVKK Article 5-6?", points: 12 },
      { q: "Have you registered AI-related data processing activities with the Data Controllers Registry (VERBIS)?", points: 10 },
      { q: "Are cross-border data transfer safeguards in place for AI model training data?", points: 8 },
    ]
  },
};

// Helpers
function getLvl(s) { return GOV_LEVELS[Math.max(1, Math.min(5, Math.round(s)))] || GOV_LEVELS[1]; }
function getMod(s) { const f = s - Math.floor(s); return f < 0.3 ? "\u2212" : f > 0.7 ? "+" : ""; }
function calcCore(ans) {
  const sc = {};
  CORE_DOMAINS.forEach(d => {
    const a = ans[d.id]; if (!a || !Object.keys(a).length) { sc[d.id] = 0; return; }
    const v = Object.values(a); sc[d.id] = v.reduce((x, y) => x + y, 0) / v.length;
  }); return sc;
}
function calcRegional(regAns) {
  const sc = {};
  Object.keys(regAns).forEach(rId => {
    const mod = REGIONAL_MODULES[rId]; if (!mod) return;
    const a = regAns[rId]; const maxPts = mod.questions.reduce((s, q) => s + q.points, 0);
    const gotPts = Object.values(a).reduce((s, v) => s + v, 0);
    sc[rId] = { score: gotPts, max: maxPts, pct: Math.round((gotPts / maxPts) * 100) };
  }); return sc;
}
function daysUntil(d) { if (!d) return null; const now = new Date(); return Math.max(0, Math.ceil((d - now) / 86400000)); }

const LOGO_MARK = "data:image/png;base64,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";
const LOGO_WORDMARK = "data:image/png;base64,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";

function Mark({ size = 32 }) {
  return <img src={LOGO_MARK} alt="STRATRI" style={{ height: size, width: "auto", objectFit: "contain" }} />;
}
function Wordmark({ height = 28 }) {
  return <img src={LOGO_WORDMARK} alt="STRATRI" style={{ height, width: "auto", objectFit: "contain" }} />;
}

function Dots({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ width: i === current ? 20 : 6, height: 6, borderRadius: 3, background: i < current ? B.teal : i === current ? B.navy : B.mutedPale, transition: "all 0.3s" }} />
      ))}
    </div>
  );
}

function Radio({ text, selected, onClick, level }) {
  const lc = GOV_LEVELS[level]?.color || B.textTertiary;
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "flex-start", gap: 14, padding: "15px 18px",
      background: selected ? B.teal + "0A" : "#fff", border: selected ? "1.5px solid " + B.teal : "1.5px solid " + B.border,
      borderRadius: 10, cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.15s", fontFamily: sans,
    }} onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = B.muted; }}
       onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = selected ? B.teal : B.border; }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1, border: selected ? "2px solid " + B.teal : "2px solid " + B.mutedLight, display: "flex", alignItems: "center", justifyContent: "center", background: selected ? B.teal : "transparent" }}>
        {selected && <Check size={12} color="#fff" strokeWidth={3} />}
      </div>
      <span style={{ flex: 1, color: selected ? B.navy : B.textSecondary, fontSize: 14.5, lineHeight: 1.55 }}>{text}</span>
      <span style={{ fontSize: 10, fontWeight: 500, color: lc, opacity: 0.45, padding: "2px 7px", borderRadius: 4, background: lc + "0D", fontFamily: mono, whiteSpace: "nowrap", marginTop: 3 }}>L{level}</span>
    </button>
  );
}

function ComplianceRadio({ text, points, selected, value, onClick }) {
  const options = [
    { label: "Not started", val: 0, color: B.red },
    { label: "In progress", val: Math.round(points * 0.5), color: B.orange },
    { label: "Complete", val: points, color: B.green },
  ];
  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid " + B.border }}>
      <div style={{ fontSize: 14, color: B.navy, marginBottom: 10, lineHeight: 1.5 }}>{text}</div>
      <div style={{ display: "flex", gap: 8 }}>
        {options.map(o => (
          <button key={o.label} onClick={() => onClick(o.val)} style={{
            padding: "7px 16px", fontSize: 12, fontFamily: sans, borderRadius: 6, cursor: "pointer",
            background: value === o.val ? o.color + "12" : "#fff",
            border: value === o.val ? "1.5px solid " + o.color : "1.5px solid " + B.border,
            color: value === o.val ? o.color : B.textTertiary, fontWeight: value === o.val ? 600 : 400,
            transition: "all 0.12s",
          }}>{o.label} <span style={{ fontFamily: mono, fontSize: 10, opacity: 0.6 }}>({o.val}pts)</span></button>
        ))}
      </div>
    </div>
  );
}

function Arc({ score, size = 150 }) {
  const info = getLvl(score); const mod = getMod(score);
  const r = 56; const circ = 2 * Math.PI * r; const arc = circ * 0.75; const filled = arc * (score / 5);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke={B.mutedPale} strokeWidth="6.5" strokeDasharray={arc + " " + (circ - arc)} strokeLinecap="round" transform="rotate(135 65 65)" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={info.color} strokeWidth="6.5" strokeDasharray={filled + " " + circ} strokeLinecap="round" transform="rotate(135 65 65)" style={{ transition: "stroke-dasharray 1s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 500, color: B.navy, fontFamily: serif, lineHeight: 1 }}>{score.toFixed(1)}</div>
        <div style={{ fontSize: 10.5, color: info.color, fontWeight: 500, marginTop: 4, fontFamily: mono }}>Level {Math.round(score)}{mod}</div>
        <div style={{ fontSize: 9.5, color: B.textTertiary, marginTop: 2 }}>{info.name}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("welcome");
  const [profile, setProfile] = useState({ industry: "", regions: [] });
  const [section, setSection] = useState("core"); // core | regional
  const [cD, setCD] = useState(0);
  const [cQ, setCQ] = useState(0);
  const [coreAns, setCoreAns] = useState({});
  const [regAns, setRegAns] = useState({});
  const [curReg, setCurReg] = useState(0);
  const [fade, setFade] = useState(false);
  const [resultsReady, setResultsReady] = useState(false);
  const mr = useRef(null);

  const totalCoreQ = CORE_DOMAINS.reduce((s, d) => s + d.questions.length, 0);
  const totalRegQCalc = (regs) => regs.reduce((s, id) => s + (REGIONAL_MODULES[id]?.questions.length || 0), 0);

  // ── Supabase Hook ──
  const {
    assessmentId, isLoading, isSaving, lastSaved, error,
    startAssessment, resumeAssessment, saveProgress,
    finishAssessment, saveContact, sendResultsEmail,
  } = useAssessment({
    type: "governance",
    totalQuestions: totalCoreQ + totalRegQCalc(profile.regions),
  });

  // ── Resume from URL ──
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id) {
        resumeAssessment(id).then((data) => {
          if (data) {
            setProfile({ industry: data.industry || "", regions: data.regions || [] });
            if (data.core_responses && Object.keys(data.core_responses).length > 0) {
              setCoreAns(data.core_responses);
            }
            if (data.regional_responses && Object.keys(data.regional_responses).length > 0) {
              setRegAns(data.regional_responses);
            }
            if (data.status === "completed") {
              setPhase("results");
            } else if (data.industry) {
              setPhase("assessment");
            }
          }
        });
      }
    }
  }, []);

  const selRegions = profile.regions.map(id => REGIONAL_MODULES[id]).filter(Boolean);
  const dom = CORE_DOMAINS[cD]; const q = dom?.questions[cQ];
  const dAns = coreAns[dom?.id] || {}; const sel = dAns[cQ];
  const doneCore = Object.values(coreAns).reduce((s, d) => s + Object.keys(d).length, 0);
  const totalRegQ = selRegions.reduce((s, r) => s + r.questions.length, 0);
  const doneReg = Object.values(regAns).reduce((s, d) => s + Object.keys(d).length, 0);
  const scores = calcCore(coreAns);
  const regScores = calcRegional(regAns);
  const overall = (() => { const v = Object.values(scores).filter(x => x > 0); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; })();

  function pickCore(lv) {
    const newAns = { ...coreAns, [dom.id]: { ...coreAns[dom.id], [cQ]: lv } };
    setCoreAns(newAns);
    const answered = Object.values(newAns).reduce((s, d) => s + Object.keys(d).length, 0) + doneReg;
    saveProgress(newAns, regAns, answered);
  }
  function pickReg(regId, qIdx, val) {
    const newRegAns = { ...regAns, [regId]: { ...regAns[regId], [qIdx]: val } };
    setRegAns(newRegAns);
    const regAnswered = Object.values(newRegAns).reduce((s, d) => s + Object.keys(d).length, 0);
    saveProgress(coreAns, newRegAns, doneCore + regAnswered);
  }

  function nextCore() {
    if (sel === undefined) return;
    setFade(true);
    setTimeout(() => {
      if (cQ < dom.questions.length - 1) setCQ(q => q + 1);
      else if (cD < CORE_DOMAINS.length - 1) { setCD(d => d + 1); setCQ(0); }
      else { setSection("regional"); setCurReg(0); }
      setFade(false); if (mr.current) mr.current.scrollTop = 0;
    }, 160);
  }
  function prevCore() {
    setFade(true);
    setTimeout(() => {
      if (cQ > 0) setCQ(q => q - 1);
      else if (cD > 0) { const p = cD - 1; setCD(p); setCQ(CORE_DOMAINS[p].questions.length - 1); }
      setFade(false);
    }, 160);
  }
  function jumpDom(i) { setCD(i); setCQ(0); setSection("core"); if (mr.current) mr.current.scrollTop = 0; }

  function finishRegional() {
    if (curReg < selRegions.length - 1) { setCurReg(r => r + 1); if (mr.current) mr.current.scrollTop = 0; }
    else setPhase("results");
  }

  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
    l.rel = "stylesheet"; document.head.appendChild(l);
    // Spin animation for save indicator
    if (!document.getElementById("stratri-spin-css")) {
      const s = document.createElement("style"); s.id = "stratri-spin-css";
      s.textContent = "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";
      document.head.appendChild(s);
    }
  }, []);

  const pg = { minHeight: "100vh", background: B.cream, color: B.textPrimary, fontFamily: sans };
  const card = { background: "#fff", borderRadius: 14, border: "1px solid " + B.border, padding: "28px" };
  const lbl = { fontSize: 10, fontWeight: 500, color: B.textTertiary, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: mono, marginBottom: 20 };

  // ═══ WELCOME ═══
  if (phase === "welcome") return (
    <div style={pg}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "100px 28px 80px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Mark size={44} />
        <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 3.5, color: B.teal, textTransform: "uppercase", marginTop: 18, marginBottom: 40, fontFamily: mono }}>STRATRI</div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 400, lineHeight: 1.12, margin: "0 0 20px", fontFamily: serif, color: B.navy }}>
          AI Governance<br /><span style={{ fontStyle: "italic", fontWeight: 300 }}>Assessment</span>
        </h1>
        <div style={{ width: 48, height: 1.5, background: B.muted, margin: "0 auto 28px" }} />
        <p style={{ fontSize: 16.5, lineHeight: 1.75, color: B.textSecondary, maxWidth: 460, margin: "0 0 52px", fontWeight: 300 }}>
          Evaluate your AI governance readiness, compliance posture, and risk exposure across seven core domains and region-specific regulatory requirements.
        </p>
        <div style={{ display: "flex", gap: 36, marginBottom: 56 }}>
          {[{ n: "7", l: "Core Domains" }, { n: "3", l: "Regional Modules" }, { n: "~15", l: "Minutes" }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 300, color: B.navy, fontFamily: serif }}>{s.n}</div>
              <div style={{ fontSize: 10.5, color: B.textTertiary, letterSpacing: 1, textTransform: "uppercase", fontFamily: mono, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setPhase("profile")} style={{
          padding: "16px 44px", background: B.navy, color: "#fff", border: "none", borderRadius: 8,
          fontSize: 14.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: sans,
        }}>Begin Assessment <ArrowRight size={17} /></button>
        <div style={{ marginTop: 72, paddingTop: 16, borderTop: "1px solid " + B.border, width: "100%", maxWidth: 420 }}>
          <div style={{ fontSize: 10, color: B.textTertiary, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: mono, marginBottom: 8 }}>Compliance coverage</div>
          <div style={{ fontSize: 13, color: B.textTertiary, lineHeight: 1.6 }}>EU AI Act \u00B7 Colorado AI Act \u00B7 KVKK \u00B7 ISO 42001 \u00B7 NIST AI RMF \u00B7 R.A.I.L.W.A.Y. Framework</div>
        </div>
      </div>
    </div>
  );

  // ═══ PROFILE ═══
  if (phase === "profile") {
    const ok = profile.industry && profile.regions.length > 0;
    return (
      <div style={pg}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "56px 28px" }}>
          <button onClick={() => setPhase("welcome")} style={{ background: "none", border: "none", color: B.textTertiary, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 5, marginBottom: 36, fontFamily: sans }}><ChevronLeft size={16} /> Back</button>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: 2.5, color: B.teal, textTransform: "uppercase", marginBottom: 10, fontFamily: mono }}>Organization Profile</div>
          <h2 style={{ fontSize: 28, fontWeight: 400, margin: "0 0 32px", fontFamily: serif }}>Select your <em style={{ fontWeight: 300 }}>context</em></h2>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 10.5, fontWeight: 500, color: B.textTertiary, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 10, fontFamily: mono }}>Industry</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 7 }}>
              {INDUSTRIES.map(ind => (
                <button key={ind} onClick={() => setProfile(p => ({ ...p, industry: ind }))} style={{
                  padding: "10px 14px", fontSize: 13, textAlign: "left", fontFamily: sans,
                  background: profile.industry === ind ? B.teal + "0A" : "#fff",
                  border: profile.industry === ind ? "1.5px solid " + B.teal : "1.5px solid " + B.border,
                  borderRadius: 8, color: profile.industry === ind ? B.navy : B.textSecondary, cursor: "pointer", fontWeight: profile.industry === ind ? 500 : 400,
                }}>{ind}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 40 }}>
            <label style={{ fontSize: 10.5, fontWeight: 500, color: B.textTertiary, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 10, fontFamily: mono }}>Operating Regions <span style={{ opacity: 0.5 }}>(determines compliance modules)</span></label>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {REGIONS.map(r => {
                const s = profile.regions.includes(r.id); const mod = REGIONAL_MODULES[r.id];
                const days = daysUntil(mod.deadlineDate);
                return (
                  <button key={r.id} onClick={() => setProfile(p => ({ ...p, regions: p.regions.includes(r.id) ? p.regions.filter(x => x !== r.id) : [...p.regions, r.id] }))} style={{
                    padding: "14px 18px", fontSize: 13.5, textAlign: "left", fontFamily: sans,
                    background: s ? B.teal + "0A" : "#fff", border: s ? "1.5px solid " + B.teal : "1.5px solid " + B.border,
                    borderRadius: 10, color: s ? B.navy : B.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ fontSize: 20 }}>{r.flag}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: s ? 600 : 400 }}>{r.label}</div>
                    </div>
                    {s && <Check size={16} color={B.teal} />}
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={async () => {
            if (!ok) return;
            await startAssessment({ industry: profile.industry, regions: profile.regions });
            setPhase("assessment");
          }} disabled={!ok} style={{
            padding: "16px 44px", width: "100%", background: ok ? B.navy : B.mutedPale, color: ok ? "#fff" : B.textTertiary,
            border: "none", borderRadius: 8, fontSize: 14.5, fontWeight: 500, cursor: ok ? "pointer" : "not-allowed", fontFamily: sans,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>Start Assessment <ArrowRight size={17} /></button>
        </div>
      </div>
    );
  }

  // ═══ ASSESSMENT ═══
  if (phase === "assessment") {
    const isRegional = section === "regional";
    const curRegMod = isRegional ? selRegions[curReg] : null;
    const curRegId = isRegional ? profile.regions[curReg] : null;
    const curRegAns = isRegional ? (regAns[curRegId] || {}) : {};
    const allRegDone = isRegional && curRegMod && Object.keys(curRegAns).length === curRegMod.questions.length;

    return (
      <div style={{ ...pg, display: "flex", minHeight: "100vh" }}>
        <div style={{ width: 250, flexShrink: 0, borderRight: "1px solid " + B.border, padding: "24px 0", display: "flex", flexDirection: "column", background: "#fff", overflowY: "auto" }}>
          <div style={{ padding: "0 18px", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Mark size={20} /><span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 2.5, color: B.teal, fontFamily: mono, textTransform: "uppercase" }}>STRATRI</span>
            </div>
            <div style={{ width: "100%", height: 3, background: B.mutedPale, borderRadius: 2 }}>
              <div style={{ width: ((doneCore + doneReg) / (totalCoreQ + totalRegQ) * 100) + "%", height: "100%", borderRadius: 2, background: B.teal, transition: "width 0.4s" }} />
            </div>
            <div style={{ fontSize: 10, color: B.textTertiary, marginTop: 6, fontFamily: mono }}>{doneCore + doneReg}/{totalCoreQ + totalRegQ}</div>
            {isSaving ? (
              <div style={{ fontSize: 9, color: B.muted, marginTop: 4, fontFamily: mono, display: "flex", alignItems: "center", gap: 4 }}>
                <Loader2 size={9} style={{ animation: "spin 1s linear infinite" }} /> Saving...
              </div>
            ) : lastSaved ? (
              <div style={{ fontSize: 9, color: B.green, marginTop: 4, fontFamily: mono, display: "flex", alignItems: "center", gap: 4 }}>
                <Check size={9} /> Saved {lastSaved.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </div>
            ) : null}
          </div>
          <div style={{ fontSize: 9, fontWeight: 500, color: B.textTertiary, letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 18px", fontFamily: mono }}>Core Domains</div>
          {CORE_DOMAINS.map((d, i) => {
            const dA = coreAns[d.id] || {}; const done = Object.keys(dA).length === d.questions.length;
            const active = section === "core" && i === cD;
            const IC = d.icon;
            return (
              <button key={d.id} onClick={() => jumpDom(i)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 16px",
                background: active ? B.teal + "0A" : "transparent", border: "none",
                borderLeft: active ? "2.5px solid " + B.teal : "2.5px solid transparent",
                cursor: "pointer", width: "100%", textAlign: "left", fontFamily: sans,
              }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", background: done ? B.teal : B.creamDark, color: done ? "#fff" : B.textTertiary }}>
                  {done ? <Check size={11} strokeWidth={2.5} /> : <IC size={11} />}
                </div>
                <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? B.navy : B.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
              </button>
            );
          })}
          {selRegions.length > 0 && (
            <>
              <div style={{ fontSize: 9, fontWeight: 500, color: B.textTertiary, letterSpacing: 1.5, textTransform: "uppercase", padding: "12px 18px 8px", fontFamily: mono }}>Regional Compliance</div>
              {selRegions.map((r, i) => {
                const rId = profile.regions[i]; const rA = regAns[rId] || {};
                const done = Object.keys(rA).length === r.questions.length;
                const active = isRegional && i === curReg;
                return (
                  <button key={rId} onClick={() => { setSection("regional"); setCurReg(i); if (mr.current) mr.current.scrollTop = 0; }} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "9px 16px",
                    background: active ? B.teal + "0A" : "transparent", border: "none",
                    borderLeft: active ? "2.5px solid " + B.teal : "2.5px solid transparent",
                    cursor: "pointer", width: "100%", textAlign: "left", fontFamily: sans,
                  }}>
                    <span style={{ fontSize: 16 }}>{r.flag}</span>
                    <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? B.navy : B.textSecondary }}>{r.name}</span>
                    {done && <Check size={12} color={B.teal} style={{ marginLeft: "auto" }} />}
                  </button>
                );
              })}
            </>
          )}
        </div>

        <div ref={mr} style={{ flex: 1, padding: "44px 52px", overflowY: "auto", maxHeight: "100vh" }}>
          {!isRegional ? (
            <div style={{ opacity: fade ? 0 : 1, transform: fade ? "translateY(5px)" : "none", transition: "all 0.16s", maxWidth: 620 }}>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: B.teal, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: mono }}>Domain {cD + 1} of {CORE_DOMAINS.length}</div>
                <h2 style={{ fontSize: 26, fontWeight: 400, margin: "0 0 5px", fontFamily: serif }}>{dom.name}</h2>
                <p style={{ fontSize: 13, color: B.textTertiary, margin: 0, fontStyle: "italic" }}>{dom.description}</p>
              </div>
              <div style={{ paddingTop: 24, borderTop: "1px solid " + B.border, marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <Dots current={cQ} total={dom.questions.length} />
                  <span style={{ fontSize: 10.5, color: B.textTertiary, fontFamily: mono }}>Q{cQ + 1}/{dom.questions.length}</span>
                </div>
                <h3 style={{ fontSize: 16.5, fontWeight: 500, lineHeight: 1.6, margin: "0 0 22px", color: B.navy }}>{q.q}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {q.options.map((o, i) => <Radio key={i} text={o.text} level={o.level} selected={sel === o.level} onClick={() => pickCore(o.level)} />)}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={prevCore} disabled={cD === 0 && cQ === 0} style={{
                  padding: "11px 22px", background: "#fff", border: "1px solid " + B.border, borderRadius: 8,
                  color: (cD === 0 && cQ === 0) ? B.mutedLight : B.textSecondary, cursor: (cD === 0 && cQ === 0) ? "not-allowed" : "pointer",
                  fontSize: 13, fontFamily: sans, display: "flex", alignItems: "center", gap: 5, opacity: (cD === 0 && cQ === 0) ? 0.5 : 1,
                }}><ChevronLeft size={14} /> Previous</button>
                <button onClick={nextCore} disabled={sel === undefined} style={{
                  padding: "11px 30px", background: sel !== undefined ? B.navy : B.mutedPale, color: sel !== undefined ? "#fff" : B.textTertiary,
                  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: sel !== undefined ? "pointer" : "not-allowed", fontFamily: sans, display: "flex", alignItems: "center", gap: 5,
                }}>{cD === CORE_DOMAINS.length - 1 && cQ === dom.questions.length - 1 ? (selRegions.length ? "Continue to Compliance" : "View Results") : "Next"} <ChevronRight size={14} /></button>
              </div>
            </div>
          ) : curRegMod ? (
            <div style={{ maxWidth: 640 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>{curRegMod.flag}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: B.teal, letterSpacing: 2, textTransform: "uppercase", fontFamily: mono }}>Regional Compliance</div>
                  <h2 style={{ fontSize: 24, fontWeight: 400, margin: 0, fontFamily: serif }}>{curRegMod.name}</h2>
                </div>
              </div>
              {curRegMod.deadlineDate && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, background: B.red + "0A", border: "1px solid " + B.red + "20", marginBottom: 24 }}>
                  <AlertCircle size={14} color={B.red} />
                  <span style={{ fontSize: 12.5, color: B.red, fontWeight: 500 }}>{daysUntil(curRegMod.deadlineDate)} days until {curRegMod.deadline}</span>
                  <span style={{ fontSize: 11, color: B.textTertiary, fontFamily: mono }}> | Max penalty: {curRegMod.maxPenalty}</span>
                </div>
              )}
              <p style={{ fontSize: 13, color: B.textTertiary, marginBottom: 24, fontStyle: "italic" }}>Rate each compliance requirement. Points reflect regulatory weight.</p>
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid " + B.border, padding: "8px 20px" }}>
                {curRegMod.questions.map((rq, i) => (
                  <ComplianceRadio key={i} text={rq.q} points={rq.points} value={curRegAns[i]} onClick={(val) => pickReg(curRegId, i, val)} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                <button onClick={finishRegional} style={{
                  padding: "11px 30px", background: B.navy, color: "#fff", border: "none", borderRadius: 8,
                  fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: sans, display: "flex", alignItems: "center", gap: 5,
                }}>{curReg < selRegions.length - 1 ? "Next Region" : "View Results"} <ChevronRight size={14} /></button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // ═══ RESULTS ═══
  // ── Save results to Supabase on completion ──
  useEffect(() => {
    if (phase === "results" && !resultsReady) {
      const s = calcCore(coreAns);
      const rs = calcRegional(regAns);
      const v = Object.values(s).filter(x => x > 0);
      const ov = v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
      const domainNamed = {};
      CORE_DOMAINS.forEach(d => { domainNamed[d.name] = s[d.id]; });
      finishAssessment({
        domain_scores: domainNamed,
        regional_scores: rs,
        overall_score: ov,
        maturity_level: Math.round(ov),
      });
      setResultsReady(true);
    }
  }, [phase]);

  if (phase === "results") {
    const rd = CORE_DOMAINS.map(d => ({ dimension: d.name.length > 12 ? d.name.replace(/ & | /g, "\n") : d.name, score: scores[d.id], fullMark: 5 }));
    const oi = getLvl(overall); const om = getMod(overall);
    const sorted = [...CORE_DOMAINS].sort((a, b) => scores[a.id] - scores[b.id]);
    const weak = sorted.slice(0, 3); const strong = sorted.slice(-2).reverse();

    // Named scores for email
    const domainNamed = {};
    CORE_DOMAINS.forEach(d => { domainNamed[d.name] = scores[d.id]; });

    return (
      <div style={{ ...pg, overflowY: "auto" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "52px 28px" }}>
          {/* ── Results Actions Bar (PDF + Email) ── */}
          <ResultsActions
            assessmentType="governance"
            resultsElementId="governance-results-dashboard"
            isSaving={isSaving}
            lastSaved={lastSaved}
            onSendEmail={async (email, name) => {
              return sendResultsEmail(email, name, {
                overallScore: overall,
                domainScores: domainNamed,
                regionalScores: regScores,
              });
            }}
          />

          <div id="governance-results-dashboard">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Mark size={26} /><span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 2.5, color: B.teal, fontFamily: mono, textTransform: "uppercase" }}>STRATRI</span></div>
              <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 400, margin: "0 0 6px", fontFamily: serif }}>AI Governance <em style={{ fontWeight: 300 }}>Report</em></h1>
              <p style={{ fontSize: 13, color: B.textTertiary, margin: 0 }}>{profile.industry} \u00B7 {profile.regions.map(r => REGIONS.find(x => x.id === r)?.flag).join(" ")}</p>
            </div>
            <button onClick={() => { setPhase("welcome"); setCoreAns({}); setRegAns({}); setCD(0); setCQ(0); setSection("core"); setResultsReady(false); }} style={{ padding: "9px 18px", background: "#fff", border: "1px solid " + B.border, borderRadius: 8, color: B.textSecondary, cursor: "pointer", fontSize: 12, fontFamily: sans }}>New Assessment</button>
          </div>

          {/* Score + Radar */}
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20, marginBottom: 36 }}>
            <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={lbl}>Governance Maturity</div>
              <Arc score={overall} />
              <div style={{ marginTop: 16, padding: "9px 18px", borderRadius: 8, background: oi.color + "0D", border: "1px solid " + oi.color + "22", fontSize: 13, fontWeight: 500, color: oi.color, textAlign: "center" }}>
                {oi.name}
              </div>
              <div style={{ fontSize: 11.5, color: B.textTertiary, marginTop: 8, textAlign: "center", lineHeight: 1.5, fontStyle: "italic" }}>{oi.desc}</div>
            </div>
            <div style={card}>
              <div style={lbl}>Domain Radar</div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={rd} cx="50%" cy="50%" outerRadius="68%">
                  <PolarGrid stroke={B.mutedPale} />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: B.textTertiary, fontSize: 9.5, fontFamily: "'IBM Plex Sans'" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: B.mutedLight, fontSize: 8.5 }} axisLine={false} />
                  <Radar dataKey="score" stroke={B.teal} fill={B.teal} fillOpacity={0.1} strokeWidth={2} dot={{ r: 3.5, fill: B.teal }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Regional Compliance */}
          {Object.keys(regScores).length > 0 && (
            <div style={{ ...card, marginBottom: 36 }}>
              <div style={{ ...lbl, display: "flex", alignItems: "center", gap: 8 }}><Globe size={14} /> Regional Compliance Posture</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(" + Math.min(3, Object.keys(regScores).length) + ", 1fr)", gap: 16 }}>
                {Object.entries(regScores).map(([rId, rs]) => {
                  const mod = REGIONAL_MODULES[rId]; const days = daysUntil(mod.deadlineDate);
                  const riskColor = rs.pct < 40 ? B.red : rs.pct < 70 ? B.orange : B.green;
                  const riskLabel = rs.pct < 40 ? "CRITICAL" : rs.pct < 70 ? "AT RISK" : "ON TRACK";
                  return (
                    <div key={rId} style={{ padding: "20px", borderRadius: 12, background: riskColor + "06", border: "1px solid " + riskColor + "18" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 20 }}>{mod.flag}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: B.navy }}>{mod.name}</span>
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 500, color: B.navy, fontFamily: serif }}>{rs.pct}%</div>
                      <div style={{ fontSize: 11, color: riskColor, fontWeight: 600, fontFamily: mono, marginTop: 2 }}>{riskLabel}</div>
                      <div style={{ width: "100%", height: 6, background: B.mutedPale, borderRadius: 3, marginTop: 10 }}>
                        <div style={{ width: rs.pct + "%", height: "100%", borderRadius: 3, background: riskColor, transition: "width 0.8s" }} />
                      </div>
                      <div style={{ fontSize: 10.5, color: B.textTertiary, marginTop: 8, fontFamily: mono }}>{rs.score}/{rs.max} points</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Core Domain Breakdown */}
          <div style={{ ...card, marginBottom: 36 }}>
            <div style={lbl}>Core Domain Breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {CORE_DOMAINS.map(d => {
                const s = scores[d.id]; const info = getLvl(s); const m = getMod(s);
                return (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 130, flexShrink: 0, fontSize: 13, fontWeight: 500, color: B.navy }}>{d.name}</div>
                    <div style={{ flex: 1, height: 7, background: B.mutedPale, borderRadius: 4 }}>
                      <div style={{ width: (s / 5 * 100) + "%", height: "100%", borderRadius: 4, background: info.color, opacity: 0.7, transition: "width 0.8s" }} />
                    </div>
                    <div style={{ width: 110, textAlign: "right", fontSize: 12, fontFamily: mono, color: info.color, fontWeight: 500 }}>L{Math.round(s)}{m} \u00B7 {s.toFixed(1)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gaps + Strengths */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 36 }}>
            <div style={card}>
              <div style={{ ...lbl, color: B.orange, display: "flex", alignItems: "center", gap: 7 }}><AlertTriangle size={13} /> PRIORITY GAPS</div>
              {weak.map(d => {
                const s = scores[d.id]; const info = getLvl(s);
                return (
                  <div key={d.id} style={{ padding: "12px 14px", marginBottom: 8, borderRadius: 8, background: info.color + "08", border: "1px solid " + info.color + "15" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: B.navy }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: info.color, fontFamily: mono }}>{info.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: B.textTertiary, lineHeight: 1.5 }}>
                      {s < 2 ? "Critical gap. Immediate intervention needed to meet compliance requirements."
                        : s < 3 ? "Aligning stage. Formalized governance workflows required."
                        : "Moderate. Optimization opportunities to strengthen posture."}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={card}>
              <div style={{ ...lbl, color: B.green, display: "flex", alignItems: "center", gap: 7 }}><Zap size={13} /> STRENGTHS</div>
              {strong.map(d => {
                const s = scores[d.id]; const info = getLvl(s);
                return (
                  <div key={d.id} style={{ padding: "12px 14px", marginBottom: 8, borderRadius: 8, background: info.color + "08", border: "1px solid " + info.color + "15" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: B.navy }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: info.color, fontFamily: mono }}>{info.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: B.textTertiary, lineHeight: 1.5 }}>
                      {s >= 4 ? "Strong foundation. Well-positioned for scale and audit readiness."
                        : s >= 3 ? "Formalizing. Good trajectory toward optimization."
                        : "Relative strength. Build on this foundation."}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          </div>{/* close #governance-results-dashboard */}

          {/* CTA */}
          <div style={{ background: B.navy, borderRadius: 14, padding: "44px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, borderRadius: "50%", background: B.muted + "10" }} />
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: 2.5, color: B.muted, textTransform: "uppercase", marginBottom: 14, fontFamily: mono }}>Close the gaps before deadlines hit</div>
            <h3 style={{ fontSize: 25, fontWeight: 400, margin: "0 0 12px", fontFamily: serif, color: "#fff" }}>STRATRI Compliance <em style={{ fontWeight: 300 }}>Acceleration</em></h3>
            <p style={{ fontSize: 14, color: B.muted, maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.7, fontWeight: 300 }}>Our R.A.I.L.W.A.Y. framework provides the governance infrastructure to move from {oi.name} to Governing at Scale, aligned with ISO 42001 and your regional compliance requirements.</p>
            <button style={{ padding: "14px 38px", background: "#fff", color: B.navy, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: sans, display: "inline-flex", alignItems: "center", gap: 9 }}>Schedule a Consultation <ArrowRight size={16} /></button>
          </div>

          <div style={{ marginTop: 44, paddingTop: 20, borderTop: "1px solid " + B.border, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: B.textTertiary, fontFamily: mono }}>\u00A9 2026 STRATRI \u00B7 Governance & Technology Policy Studio</span>
            <span style={{ fontSize: 10, color: B.textTertiary, fontFamily: mono }}>Governance Assessment v1.0</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
