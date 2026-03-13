import { useState, useEffect, useRef, useCallback } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer
} from "recharts";
import {
  ChevronRight, ChevronLeft, Check, ArrowRight, AlertTriangle,
  Zap, Clock, Shield, Layers, Star, Download, Mail, Loader2
} from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import ResultsActions from "@/components/ResultsActions";

// ─── STRATRI BRAND TOKENS ───
const B = {
  cream: "#FEFBF8",
  creamDark: "#F5F0EA",
  navy: "#1E2A45",
  navyLight: "#2C3A55",
  teal: "#184A5A",
  tealLight: "#1F5E72",
  muted: "#9FB7C8",
  mutedLight: "#C2D3DE",
  mutedPale: "#E1EBF0",
  warmGrey: "#8A8578",
  textPrimary: "#1E2A45",
  textSecondary: "#5A6478",
  textTertiary: "#8A8F9C",
  border: "#E8E2D9",
  borderLight: "#F0EBE3",
  red: "#B54A3F",
  orange: "#C47F2B",
  amber: "#7A6C3A",
  green: "#3A7D68",
};

const INDUSTRIES = [
  "Financial Services & Banking", "Healthcare & Life Sciences", "Technology & Software",
  "Retail & E-Commerce", "Manufacturing", "Energy & Utilities",
  "Telecommunications", "Government & Public Sector", "Education",
  "Media & Entertainment", "Transportation & Logistics", "Other"
];

const COMPANY_SIZES = [
  "1\u201350 employees", "51\u2013200 employees", "201\u20131,000 employees",
  "1,001\u20135,000 employees", "5,001\u201310,000 employees", "10,000+ employees"
];

const REGIONS = [
  { id: "eu", label: "European Union / EEA", flag: "\uD83C\uDDEA\uD83C\uDDFA" },
  { id: "us", label: "United States", flag: "\uD83C\uDDFA\uD83C\uDDF8" },
  { id: "tr", label: "T\u00FCrkiye", flag: "\uD83C\uDDF9\uD83C\uDDF7" },
  { id: "uk", label: "United Kingdom", flag: "\uD83C\uDDEC\uD83C\uDDE7" },
  { id: "apac", label: "Asia-Pacific", flag: "\uD83C\uDF0F" },
  { id: "mena", label: "Middle East & North Africa", flag: "\uD83C\uDF0D" },
  { id: "latam", label: "Latin America", flag: "\uD83C\uDF0E" },
];

const DOMAINS = [
  { id: "strategy", name: "Strategy & Vision",
    description: "AI strategy definition, corporate integration, leadership engagement, and innovation mandate",
    questions: [
      { q: "How would you characterize your organization\u2019s AI strategy?", options: [
        { text: "No formal AI strategy exists", level: 1 },
        { text: "Informal discussions happening, no documentation", level: 2 },
        { text: "Documented strategy approved by leadership", level: 3 },
        { text: "Strategy actively executed with measured KPIs", level: 4 },
        { text: "Strategy continuously optimized based on outcomes", level: 5 },
      ]},
      { q: "How frequently does your board or executive team review AI strategy?", options: [
        { text: "Never or only when issues arise", level: 1 },
        { text: "Annually at best", level: 2 },
        { text: "Quarterly with agenda items", level: 3 },
        { text: "Monthly with KPI tracking", level: 4 },
        { text: "Continuous with real-time dashboards and decision loops", level: 5 },
      ]},
      { q: "How is your AI strategy integrated with overall corporate strategy?", options: [
        { text: "AI is not part of corporate strategy discussions", level: 1 },
        { text: "AI is mentioned as a future initiative", level: 2 },
        { text: "AI goals are mapped to specific business objectives", level: 3 },
        { text: "AI is a core pillar of corporate strategy with dedicated budget", level: 4 },
        { text: "AI is embedded across all strategic pillars as a transformative enabler", level: 5 },
      ]},
      { q: "Does your organization have a defined AI roadmap with clear milestones?", options: [
        { text: "No roadmap exists", level: 1 },
        { text: "High-level aspirations but no concrete timelines", level: 2 },
        { text: "12-month roadmap with defined milestones", level: 3 },
        { text: "Multi-year roadmap with quarterly reviews and resource allocation", level: 4 },
        { text: "Dynamic roadmap that adapts based on outcomes and market changes", level: 5 },
      ]},
      { q: "How well-defined are ROI targets for your AI investments?", options: [
        { text: "No ROI tracking for AI initiatives", level: 1 },
        { text: "General expectations exist but not quantified", level: 2 },
        { text: "ROI targets set for major AI projects", level: 3 },
        { text: "Comprehensive ROI framework across all AI initiatives", level: 4 },
        { text: "Real-time value tracking with continuous optimization loops", level: 5 },
      ]},
    ]
  },
  { id: "data", name: "Data Foundation",
    description: "Data quality, accessibility, pipeline maturity, governance, and infrastructure readiness",
    questions: [
      { q: "How would you describe the overall quality and accessibility of your organizational data?", options: [
        { text: "Data is siloed, inconsistent, and largely inaccessible", level: 1 },
        { text: "Some data accessible but quality inconsistent across sources", level: 2 },
        { text: "Enterprise data catalog exists with defined quality standards", level: 3 },
        { text: "Automated data quality monitoring with high accessibility scores", level: 4 },
        { text: "Self-service data platform with real-time quality assurance", level: 5 },
      ]},
      { q: "What is the maturity level of your data pipelines?", options: [
        { text: "Mostly manual data extraction and preparation", level: 1 },
        { text: "Some automated pipelines but frequent manual intervention", level: 2 },
        { text: "Standardized ETL/ELT processes with scheduled runs", level: 3 },
        { text: "Fully automated pipelines with monitoring and alerting", level: 4 },
        { text: "Real-time streaming pipelines with self-healing capabilities", level: 5 },
      ]},
      { q: "How mature is your data governance framework?", options: [
        { text: "No formal data governance exists", level: 1 },
        { text: "Basic data ownership defined for some datasets", level: 2 },
        { text: "Formal governance framework with stewards and policies", level: 3 },
        { text: "Governance integrated with compliance and automated enforcement", level: 4 },
        { text: "Data governance operates as a strategic function with continuous improvement", level: 5 },
      ]},
      { q: "How well does your infrastructure support AI/ML workloads?", options: [
        { text: "No dedicated infrastructure for AI workloads", level: 1 },
        { text: "Basic cloud or on-premise resources, manually provisioned", level: 2 },
        { text: "Dedicated AI infrastructure with GPU/TPU access", level: 3 },
        { text: "Scalable cloud infrastructure with auto-provisioning", level: 4 },
        { text: "Hybrid multi-cloud with optimized cost management and edge capabilities", level: 5 },
      ]},
      { q: "How do you track data lineage and traceability?", options: [
        { text: "No data lineage tracking", level: 1 },
        { text: "Manual documentation of key data flows", level: 2 },
        { text: "Lineage tools in place for critical data assets", level: 3 },
        { text: "Automated end-to-end lineage across the data estate", level: 4 },
        { text: "Full lineage with impact analysis and regulatory reporting", level: 5 },
      ]},
    ]
  },
  { id: "technology", name: "Technology & Tools",
    description: "AI/ML platform adoption, MLOps capabilities, deployment automation, and integration maturity",
    questions: [
      { q: "What AI/ML development platforms does your organization use?", options: [
        { text: "No dedicated AI/ML platforms; ad-hoc tool usage", level: 1 },
        { text: "Individual tools used by specific teams", level: 2 },
        { text: "Enterprise platform adopted (Azure ML, SageMaker, etc.)", level: 3 },
        { text: "Integrated platform with experiment tracking and model registry", level: 4 },
        { text: "Custom or best-of-breed stack with full lifecycle management", level: 5 },
      ]},
      { q: "How mature are your MLOps capabilities?", options: [
        { text: "No MLOps practices in place", level: 1 },
        { text: "Manual model deployment with basic versioning", level: 2 },
        { text: "CI/CD for models with automated testing", level: 3 },
        { text: "Full MLOps with monitoring, retraining triggers, and A/B testing", level: 4 },
        { text: "Self-optimizing ML systems with automated feature engineering", level: 5 },
      ]},
      { q: "How well are AI tools integrated with your existing technology stack?", options: [
        { text: "AI tools are standalone and disconnected", level: 1 },
        { text: "Basic integrations with core systems through manual effort", level: 2 },
        { text: "API-based integrations with key business applications", level: 3 },
        { text: "Deep integration with enterprise architecture and data mesh", level: 4 },
        { text: "AI is natively embedded across the entire technology landscape", level: 5 },
      ]},
      { q: "What level of deployment automation do you have for AI models?", options: [
        { text: "Models are deployed manually by data scientists", level: 1 },
        { text: "Semi-automated deployment with scripts", level: 2 },
        { text: "Automated deployment pipelines with staging environments", level: 3 },
        { text: "Blue-green/canary deployments with automated rollback", level: 4 },
        { text: "Zero-touch deployment with continuous delivery and shadow testing", level: 5 },
      ]},
      { q: "How do you manage experimentation and model versioning?", options: [
        { text: "No formal experiment tracking", level: 1 },
        { text: "Spreadsheets or notebooks used to track experiments", level: 2 },
        { text: "Experiment tracking platform adopted", level: 3 },
        { text: "Integrated versioning across data, code, and models", level: 4 },
        { text: "Automated experiment orchestration with intelligent optimization", level: 5 },
      ]},
    ]
  },
  { id: "people", name: "People & Skills",
    description: "AI talent, organization-wide literacy, training programs, and cross-functional team structures",
    questions: [
      { q: "How would you assess your organization\u2019s AI talent situation?", options: [
        { text: "No dedicated AI/ML roles in the organization", level: 1 },
        { text: "A few individuals with AI skills, not formally structured", level: 2 },
        { text: "Dedicated AI/ML team with defined roles and hiring pipeline", level: 3 },
        { text: "Strong AI team with specialized roles", level: 4 },
        { text: "Center of Excellence with embedded AI talent across business units", level: 5 },
      ]},
      { q: "What is the level of AI literacy across your organization?", options: [
        { text: "Very limited; most employees have no AI understanding", level: 1 },
        { text: "Basic awareness in IT/tech teams only", level: 2 },
        { text: "Organization-wide AI awareness training completed", level: 3 },
        { text: "Role-specific AI literacy programs with certifications", level: 4 },
        { text: "AI-fluent culture where all levels use AI tools confidently", level: 5 },
      ]},
      { q: "Do you have structured AI training and upskilling programs?", options: [
        { text: "No AI training programs", level: 1 },
        { text: "Ad-hoc training opportunities", level: 2 },
        { text: "Structured curriculum with learning paths by role", level: 3 },
        { text: "Comprehensive program with internal AI academy", level: 4 },
        { text: "Continuous learning culture with personalized development plans", level: 5 },
      ]},
      { q: "How are cross-functional AI teams structured?", options: [
        { text: "No cross-functional AI collaboration", level: 1 },
        { text: "Informal collaboration between IT and specific business units", level: 2 },
        { text: "Defined cross-functional teams for AI projects", level: 3 },
        { text: "Embedded AI teams within each business unit", level: 4 },
        { text: "Fluid, self-organizing teams with AI product owners in every function", level: 5 },
      ]},
      { q: "How do you leverage external AI expertise?", options: [
        { text: "No external AI partnerships", level: 1 },
        { text: "Occasional use of consultants for specific projects", level: 2 },
        { text: "Strategic partnerships with AI vendors and consultancies", level: 3 },
        { text: "Ecosystem approach with academia, startups, and industry partners", level: 4 },
        { text: "Co-innovation programs with knowledge transfer and IP development", level: 5 },
      ]},
    ]
  },
  { id: "usecases", name: "Use Cases",
    description: "AI use cases in production, departmental spread, scaling capabilities, and business impact",
    questions: [
      { q: "How many AI use cases does your organization have in production?", options: [
        { text: "None; all AI work is exploratory", level: 1 },
        { text: "1\u20133 use cases in production", level: 2 },
        { text: "4\u201310 use cases across multiple departments", level: 3 },
        { text: "10\u201325 use cases with a managed portfolio approach", level: 4 },
        { text: "25+ use cases with AI embedded in core processes", level: 5 },
      ]},
      { q: "What is your pilot-to-production conversion rate?", options: [
        { text: "No pilots have reached production", level: 1 },
        { text: "Less than 20% of pilots reach production", level: 2 },
        { text: "20\u201350% conversion with lessons learned process", level: 3 },
        { text: "50\u201370% conversion with structured stage-gate process", level: 4 },
        { text: "70%+ conversion with rapid experimentation methodology", level: 5 },
      ]},
      { q: "How diverse is your AI use case portfolio across departments?", options: [
        { text: "AI is limited to one department", level: 1 },
        { text: "AI used in 2\u20133 departments", level: 2 },
        { text: "AI initiatives across most major departments", level: 3 },
        { text: "Enterprise-wide AI adoption with department strategies", level: 4 },
        { text: "AI is a core capability across all functions", level: 5 },
      ]},
      { q: "How do you measure business impact from AI initiatives?", options: [
        { text: "No measurement of AI business impact", level: 1 },
        { text: "Anecdotal evidence and informal tracking", level: 2 },
        { text: "KPIs defined for each AI project at launch", level: 3 },
        { text: "Centralized value tracking with attribution models", level: 4 },
        { text: "Real-time impact measurement with continuous optimization", level: 5 },
      ]},
      { q: "How effectively can you scale successful AI pilots?", options: [
        { text: "No scaling methodology exists", level: 1 },
        { text: "Scaling is ad-hoc and resource-intensive", level: 2 },
        { text: "Documented scaling playbook with reusable components", level: 3 },
        { text: "Platform-based scaling with templates and automation", level: 4 },
        { text: "Self-service scaling with embedded governance", level: 5 },
      ]},
    ]
  },
  { id: "processes", name: "Processes & Ops",
    description: "AI development lifecycle, model monitoring, change management, and documentation standards",
    questions: [
      { q: "How well-defined is your AI development lifecycle?", options: [
        { text: "No defined lifecycle; each project follows its own approach", level: 1 },
        { text: "Basic steps documented but inconsistently followed", level: 2 },
        { text: "Standardized lifecycle with gates and checkpoints", level: 3 },
        { text: "Lifecycle integrated with DevOps/MLOps and governance checks", level: 4 },
        { text: "Adaptive lifecycle with continuous feedback loops", level: 5 },
      ]},
      { q: "What model monitoring and maintenance processes do you have?", options: [
        { text: "No model monitoring after deployment", level: 1 },
        { text: "Manual periodic checks on model performance", level: 2 },
        { text: "Automated monitoring with alerts for degradation", level: 3 },
        { text: "Drift detection with automated retraining triggers", level: 4 },
        { text: "Self-healing models with continuous validation", level: 5 },
      ]},
      { q: "How mature are your documentation standards for AI systems?", options: [
        { text: "No documentation standards for AI", level: 1 },
        { text: "Basic documentation exists for some models", level: 2 },
        { text: "Model cards required for all production AI", level: 3 },
        { text: "Comprehensive documentation with automated generation", level: 4 },
        { text: "Living documentation that auto-updates with model changes", level: 5 },
      ]},
      { q: "Do you have incident response protocols for AI issues?", options: [
        { text: "No AI-specific incident response", level: 1 },
        { text: "General IT incident response applied to AI", level: 2 },
        { text: "AI-specific plan with defined escalation paths", level: 3 },
        { text: "Tested response with tabletop exercises and post-mortems", level: 4 },
        { text: "Predictive prevention with automated failsafes", level: 5 },
      ]},
      { q: "How well do change management processes support AI adoption?", options: [
        { text: "No change management for AI initiatives", level: 1 },
        { text: "Informal; relies on individual champions", level: 2 },
        { text: "Structured change management with stakeholder plans", level: 3 },
        { text: "Dedicated change management function for AI", level: 4 },
        { text: "Change-ready culture where AI adoption is seamless", level: 5 },
      ]},
    ]
  },
  { id: "culture", name: "Culture & Change",
    description: "Innovation culture, cross-functional collaboration, failure tolerance, and leadership support",
    questions: [
      { q: "How would you describe your organization\u2019s appetite for AI innovation?", options: [
        { text: "Risk-averse; AI seen as threatening", level: 1 },
        { text: "Cautiously interested; innovation in safe pockets", level: 2 },
        { text: "Innovation encouraged with dedicated resources", level: 3 },
        { text: "Strong innovation culture with rapid experimentation", level: 4 },
        { text: "AI-first mindset across the organization", level: 5 },
      ]},
      { q: "How effective is cross-functional collaboration on AI initiatives?", options: [
        { text: "Departments operate in silos", level: 1 },
        { text: "Occasional cross-team projects but friction-heavy", level: 2 },
        { text: "Defined collaboration structures", level: 3 },
        { text: "Seamless collaboration with shared goals", level: 4 },
        { text: "Self-organizing cross-functional teams", level: 5 },
      ]},
      { q: "How does your organization handle AI project failures?", options: [
        { text: "Failures are penalized", level: 1 },
        { text: "Failures tolerated but not analyzed", level: 2 },
        { text: "Post-mortem culture with lessons learned", level: 3 },
        { text: "Failure celebrated as learning", level: 4 },
        { text: "Fast-fail methodology embedded", level: 5 },
      ]},
      { q: "How visible is leadership support for AI initiatives?", options: [
        { text: "Leadership is uninvolved or skeptical", level: 1 },
        { text: "Verbal support but limited action", level: 2 },
        { text: "Active sponsorship of key AI projects", level: 3 },
        { text: "C-suite champions with regular AI communication", level: 4 },
        { text: "Leadership personally uses and models AI-first behavior", level: 5 },
      ]},
      { q: "How engaged are employees in AI adoption?", options: [
        { text: "Widespread resistance or apathy", level: 1 },
        { text: "Small group of enthusiasts; majority disengaged", level: 2 },
        { text: "Growing engagement with training participation", level: 3 },
        { text: "High engagement; employees propose AI use cases", level: 4 },
        { text: "Universal engagement; AI in daily workflows", level: 5 },
      ]},
    ]
  },
  { id: "value", name: "Value Creation",
    description: "ROI achievement, business outcomes measurement, stakeholder satisfaction, and competitive advantage",
    questions: [
      { q: "What ROI has your organization realized from AI investments?", options: [
        { text: "No measurable ROI from AI", level: 1 },
        { text: "Some cost savings but not systematically tracked", level: 2 },
        { text: "Positive ROI demonstrated for key initiatives", level: 3 },
        { text: "Strong ROI across portfolio with attribution models", level: 4 },
        { text: "AI is a primary driver of revenue growth", level: 5 },
      ]},
      { q: "How effectively do you track AI-driven business outcomes?", options: [
        { text: "No outcome tracking for AI", level: 1 },
        { text: "Output metrics tracked but not business outcomes", level: 2 },
        { text: "Business KPIs linked to AI with regular reporting", level: 3 },
        { text: "Comprehensive framework with leading and lagging indicators", level: 4 },
        { text: "Real-time impact dashboards with predictive forecasting", level: 5 },
      ]},
      { q: "How satisfied are stakeholders with AI-delivered value?", options: [
        { text: "Stakeholders unaware of or dissatisfied with AI efforts", level: 1 },
        { text: "Mixed feedback; some projects valued", level: 2 },
        { text: "Generally positive with regular updates", level: 3 },
        { text: "High satisfaction with demand for more AI solutions", level: 4 },
        { text: "AI considered a strategic differentiator by the board", level: 5 },
      ]},
      { q: "Has AI provided measurable competitive advantage?", options: [
        { text: "No competitive advantage from AI", level: 1 },
        { text: "AI helps maintain parity with competitors", level: 2 },
        { text: "AI provides advantage in specific areas", level: 3 },
        { text: "AI is a recognized market differentiator", level: 4 },
        { text: "AI-driven innovation sets industry benchmarks", level: 5 },
      ]},
      { q: "How well do you communicate AI value across the organization?", options: [
        { text: "No communication about AI value", level: 1 },
        { text: "Occasional presentations to leadership", level: 2 },
        { text: "Regular reporting with case studies", level: 3 },
        { text: "Organization-wide AI value dashboard", level: 4 },
        { text: "AI value narrative embedded in company culture", level: 5 },
      ]},
    ]
  },
];

const LEVEL_LABELS = {
  1: { name: "Foundational", tag: "Critical Gap", color: B.red },
  2: { name: "Developing", tag: "Needs Attention", color: B.orange },
  3: { name: "Defined", tag: "Moderate", color: B.amber },
  4: { name: "Advanced", tag: "Strong", color: B.teal },
  5: { name: "Optimized", tag: "Leading", color: B.green },
};

function getLevelInfo(s) { return LEVEL_LABELS[Math.max(1, Math.min(5, Math.round(s)))] || LEVEL_LABELS[1]; }
function getMod(s) { const f = s - Math.floor(s); return f < 0.3 ? "\u2212" : f > 0.7 ? "+" : ""; }
function calcScores(answers) {
  const sc = {};
  DOMAINS.forEach(d => {
    const a = answers[d.id];
    if (!a || Object.keys(a).length === 0) { sc[d.id] = 0; return; }
    const v = Object.values(a);
    sc[d.id] = v.reduce((x, y) => x + y, 0) / v.length;
  });
  return sc;
}
function getOverall(sc) {
  const v = Object.values(sc).filter(x => x > 0);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'IBM Plex Sans', -apple-system, sans-serif";
const mono = "'IBM Plex Mono', 'Courier New', monospace";

const LOGO_MARK = "data:image/png;base64,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";

function Mark({ size = 32 }) {
  return <img src={LOGO_MARK} alt="STRATRI" style={{ height: size, width: "auto", objectFit: "contain" }} />;
}

function Dots({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6, height: 6, borderRadius: 3,
          background: i < current ? B.teal : i === current ? B.navy : B.mutedPale,
          transition: "all 0.3s ease",
        }} />
      ))}
    </div>
  );
}

function Radio({ text, selected, onClick, level }) {
  const lc = LEVEL_LABELS[level]?.color || B.textTertiary;
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "flex-start", gap: 14, padding: "15px 18px",
      background: selected ? B.teal + "0A" : "#fff",
      border: selected ? "1.5px solid " + B.teal : "1.5px solid " + B.border,
      borderRadius: 10, cursor: "pointer", textAlign: "left", width: "100%",
      transition: "all 0.15s ease", fontFamily: sans,
    }}
    onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = B.muted; }}
    onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = selected ? B.teal : B.border; }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
        border: selected ? "2px solid " + B.teal : "2px solid " + B.mutedLight,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: selected ? B.teal : "transparent", transition: "all 0.15s ease",
      }}>
        {selected && <Check size={12} color="#fff" strokeWidth={3} />}
      </div>
      <span style={{ flex: 1, color: selected ? B.navy : B.textSecondary, fontSize: 14.5, lineHeight: 1.55 }}>{text}</span>
      <span style={{
        fontSize: 10, fontWeight: 500, color: lc, opacity: 0.45, padding: "2px 7px",
        borderRadius: 4, background: lc + "0D", fontFamily: mono, whiteSpace: "nowrap", marginTop: 3,
      }}>L{level}</span>
    </button>
  );
}

function SideItem({ name, idx, score, done, active, onClick }) {
  const info = score > 0 ? getLevelInfo(score) : null;
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 11, padding: "10px 16px",
      background: active ? B.teal + "0A" : "transparent",
      border: "none", borderLeft: active ? "2.5px solid " + B.teal : "2.5px solid transparent",
      cursor: "pointer", width: "100%", textAlign: "left", transition: "all 0.12s ease", fontFamily: sans,
    }}>
      <div style={{
        width: 25, height: 25, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 600, fontFamily: mono,
        background: done ? B.teal : active ? B.mutedPale : B.creamDark,
        color: done ? "#fff" : active ? B.navy : B.textTertiary,
      }}>{done ? <Check size={12} strokeWidth={2.5} /> : idx + 1}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: active ? 600 : 400,
          color: active ? B.navy : B.textSecondary,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{name}</div>
        {info && <div style={{ fontSize: 10, color: info.color, fontFamily: mono, marginTop: 1 }}>Level {Math.round(score)}</div>}
      </div>
    </button>
  );
}

function Arc({ score, size = 150 }) {
  const info = getLevelInfo(score);
  const mod = getMod(score);
  const r = 56; const circ = 2 * Math.PI * r;
  const arc = circ * 0.75; const filled = arc * (score / 5);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke={B.mutedPale} strokeWidth="6.5"
          strokeDasharray={arc + " " + (circ - arc)} strokeLinecap="round" transform="rotate(135 65 65)" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={info.color} strokeWidth="6.5"
          strokeDasharray={filled + " " + circ} strokeLinecap="round" transform="rotate(135 65 65)"
          style={{ transition: "stroke-dasharray 1s ease" }} />
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
  const [profile, setProfile] = useState({ industry: "", size: "", regions: [] });
  const [cD, setCD] = useState(0);
  const [cQ, setCQ] = useState(0);
  const [ans, setAns] = useState({});
  const [fade, setFade] = useState(false);
  const [resultsReady, setResultsReady] = useState(false);
  const mr = useRef(null);

  const totalQ = DOMAINS.reduce((s, d) => s + d.questions.length, 0);
  const doneQ = Object.values(ans).reduce((s, d) => s + Object.keys(d).length, 0);
  const dom = DOMAINS[cD]; const q = dom?.questions[cQ];
  const dAns = ans[dom?.id] || {}; const sel = dAns[cQ];
  const sc = calcScores(ans); const ov = getOverall(sc);

  // ── Supabase Hook ──
  const {
    assessmentId, isLoading, isSaving, lastSaved, error,
    startAssessment, resumeAssessment, saveProgress,
    finishAssessment, saveContact, sendResultsEmail,
  } = useAssessment({ type: "maturity", totalQuestions: totalQ });

  // ── Resume from URL ──
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id) {
        resumeAssessment(id).then((data) => {
          if (data) {
            setProfile({ industry: data.industry || "", size: data.employee_count || "", regions: [] });
            if (data.core_responses && Object.keys(data.core_responses).length > 0) {
              setAns(data.core_responses);
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

  function pick(lv) {
    const newAns = { ...ans, [dom.id]: { ...ans[dom.id], [cQ]: lv } };
    setAns(newAns);
    const answered = Object.values(newAns).reduce((s, d) => s + Object.keys(d).length, 0);
    saveProgress(newAns, undefined, answered);
  }
  function next() {
    if (sel === undefined) return;
    setFade(true);
    setTimeout(() => {
      if (cQ < dom.questions.length - 1) setCQ(q => q + 1);
      else if (cD < DOMAINS.length - 1) { setCD(d => d + 1); setCQ(0); }
      else setPhase("results");
      setFade(false);
      if (mr.current) mr.current.scrollTop = 0;
    }, 160);
  }
  function prev() {
    setFade(true);
    setTimeout(() => {
      if (cQ > 0) setCQ(q => q - 1);
      else if (cD > 0) { const p = cD - 1; setCD(p); setCQ(DOMAINS[p].questions.length - 1); }
      setFade(false);
    }, 160);
  }
  function jump(i) { setCD(i); setCQ(0); if (mr.current) mr.current.scrollTop = 0; }
  const togR = id => setProfile(p => ({ ...p, regions: p.regions.includes(id) ? p.regions.filter(r => r !== id) : [...p.regions, id] }));

  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
    l.rel = "stylesheet"; document.head.appendChild(l);
    if (!document.getElementById("stratri-spin-css")) {
      const s = document.createElement("style"); s.id = "stratri-spin-css";
      s.textContent = "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";
      document.head.appendChild(s);
    }
  }, []);

  const pg = { minHeight: "100vh", background: B.cream, color: B.textPrimary, fontFamily: sans };

  // ═══ WELCOME ═══
  if (phase === "welcome") return (
    <div style={pg}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "100px 28px 80px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Mark size={44} />
        <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 3.5, color: B.teal, textTransform: "uppercase", marginTop: 18, marginBottom: 40, fontFamily: mono }}>STRATRI</div>
        <h1 style={{ fontSize: "clamp(32px, 5.5vw, 50px)", fontWeight: 400, lineHeight: 1.12, margin: "0 0 20px", fontFamily: serif, color: B.navy }}>
          AI Maturity<br /><span style={{ fontStyle: "italic", fontWeight: 300 }}>Assessment</span>
        </h1>
        <div style={{ width: 48, height: 1.5, background: B.muted, margin: "0 auto 28px", borderRadius: 1 }} />
        <p style={{ fontSize: 16.5, lineHeight: 1.75, color: B.textSecondary, maxWidth: 440, margin: "0 0 52px", fontWeight: 300 }}>
          Evaluate your organization's AI readiness across eight critical dimensions. Receive a detailed maturity profile with a tailored roadmap.
        </p>
        <div style={{ display: "flex", gap: 44, marginBottom: 56 }}>
          {[{ n: "8", l: "Dimensions" }, { n: "40", l: "Questions" }, { n: "~12", l: "Minutes" }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 300, color: B.navy, fontFamily: serif }}>{s.n}</div>
              <div style={{ fontSize: 10.5, color: B.textTertiary, letterSpacing: 1, textTransform: "uppercase", fontFamily: mono, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setPhase("profile")} style={{
          padding: "16px 44px", background: B.navy, color: "#fff", border: "none", borderRadius: 8,
          fontSize: 14.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: sans,
          transition: "background 0.2s",
        }} onMouseEnter={e => e.currentTarget.style.background = B.navyLight}
           onMouseLeave={e => e.currentTarget.style.background = B.navy}>
          Begin Assessment <ArrowRight size={17} />
        </button>
        <div style={{ marginTop: 72, paddingTop: 16, borderTop: "1px solid " + B.border, width: "100%", maxWidth: 400 }}>
          <div style={{ fontSize: 10, color: B.textTertiary, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: mono, marginBottom: 8 }}>Aligned with</div>
          <div style={{ fontSize: 13, color: B.textTertiary, lineHeight: 1.6 }}>ISO/IEC 42001 &middot; NIST AI RMF &middot; EU AI Act 2026 &middot; R.A.I.L.W.A.Y. Framework</div>
        </div>
      </div>
    </div>
  );

  // ═══ PROFILE ═══
  if (phase === "profile") {
    const ok = profile.industry && profile.size && profile.regions.length > 0;
    return (
      <div style={pg}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "56px 28px" }}>
          <button onClick={() => setPhase("welcome")} style={{ background: "none", border: "none", color: B.textTertiary, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 5, marginBottom: 36, fontFamily: sans }}><ChevronLeft size={16} /> Back</button>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: 2.5, color: B.teal, textTransform: "uppercase", marginBottom: 10, fontFamily: mono }}>Organization Profile</div>
          <h2 style={{ fontSize: 30, fontWeight: 400, margin: "0 0 8px", fontFamily: serif }}>Tell us about your <em style={{ fontWeight: 300 }}>organization</em></h2>
          <p style={{ fontSize: 14, color: B.textTertiary, margin: "0 0 36px" }}>This helps benchmark your results against industry peers.</p>
          {[
            { label: "Industry Sector", items: INDUSTRIES, key: "industry", multi: false },
            { label: "Organization Size", items: COMPANY_SIZES, key: "size", multi: false },
          ].map(section => (
            <div key={section.key} style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 10.5, fontWeight: 500, color: B.textTertiary, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 10, fontFamily: mono }}>{section.label}</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 7 }}>
                {section.items.map(item => {
                  const sel = profile[section.key] === item;
                  return <button key={item} onClick={() => setProfile(p => ({ ...p, [section.key]: item }))} style={{
                    padding: "10px 14px", fontSize: 13, textAlign: "left", fontFamily: sans,
                    background: sel ? B.teal + "0A" : "#fff", border: sel ? "1.5px solid " + B.teal : "1.5px solid " + B.border,
                    borderRadius: 8, color: sel ? B.navy : B.textSecondary, cursor: "pointer", fontWeight: sel ? 500 : 400, transition: "all 0.12s",
                  }}>{item}</button>;
                })}
              </div>
            </div>
          ))}
          <div style={{ marginBottom: 40 }}>
            <label style={{ fontSize: 10.5, fontWeight: 500, color: B.textTertiary, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 10, fontFamily: mono }}>Operating Regions <span style={{ opacity: 0.5, fontWeight: 400 }}>(select all)</span></label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 7 }}>
              {REGIONS.map(r => {
                const s = profile.regions.includes(r.id);
                return <button key={r.id} onClick={() => togR(r.id)} style={{
                  padding: "10px 14px", fontSize: 13, textAlign: "left", fontFamily: sans,
                  background: s ? B.teal + "0A" : "#fff", border: s ? "1.5px solid " + B.teal : "1.5px solid " + B.border,
                  borderRadius: 8, color: s ? B.navy : B.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: s ? 500 : 400,
                }}><span>{r.flag}</span>{r.label}{s && <Check size={13} color={B.teal} style={{ marginLeft: "auto" }} />}</button>;
              })}
            </div>
          </div>
          <button onClick={async () => {
            if (!ok) return;
            await startAssessment({ industry: profile.industry, employee_count: profile.size });
            setPhase("assessment");
          }} disabled={!ok} style={{
            padding: "16px 44px", width: "100%", background: ok ? B.navy : B.mutedPale, color: ok ? "#fff" : B.textTertiary,
            border: "none", borderRadius: 8, fontSize: 14.5, fontWeight: 500, cursor: ok ? "pointer" : "not-allowed",
            fontFamily: sans, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>Start Assessment <ArrowRight size={17} /></button>
        </div>
      </div>
    );
  }

  // ═══ ASSESSMENT ═══
  if (phase === "assessment") return (
    <div style={{ ...pg, display: "flex", minHeight: "100vh" }}>
      <div style={{ width: 250, flexShrink: 0, borderRight: "1px solid " + B.border, padding: "24px 0", display: "flex", flexDirection: "column", background: "#fff", overflowY: "auto" }}>
        <div style={{ padding: "0 18px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Mark size={20} /><span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 2.5, color: B.teal, fontFamily: mono, textTransform: "uppercase" }}>STRATRI</span>
          </div>
          <div style={{ width: "100%", height: 3, background: B.mutedPale, borderRadius: 2 }}>
            <div style={{ width: (doneQ / totalQ * 100) + "%", height: "100%", borderRadius: 2, background: B.teal, transition: "width 0.4s" }} />
          </div>
          <div style={{ fontSize: 10, color: B.textTertiary, marginTop: 6, fontFamily: mono }}>{doneQ}/{totalQ}</div>
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
        {DOMAINS.map((d, i) => {
          const dA = ans[d.id] || {};
          return <SideItem key={d.id} name={d.name} idx={i} score={sc[d.id]} done={Object.keys(dA).length === d.questions.length} active={i === cD} onClick={() => jump(i)} />;
        })}
      </div>
      <div ref={mr} style={{ flex: 1, padding: "44px 52px", overflowY: "auto", maxHeight: "100vh" }}>
        <div style={{ opacity: fade ? 0 : 1, transform: fade ? "translateY(5px)" : "none", transition: "all 0.16s", maxWidth: 620 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: B.teal, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: mono }}>Dimension {cD + 1} of {DOMAINS.length}</div>
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
              {q.options.map((o, i) => <Radio key={i} text={o.text} level={o.level} selected={sel === o.level} onClick={() => pick(o.level)} />)}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={prev} disabled={cD === 0 && cQ === 0} style={{
              padding: "11px 22px", background: "#fff", border: "1px solid " + B.border, borderRadius: 8,
              color: (cD === 0 && cQ === 0) ? B.mutedLight : B.textSecondary, cursor: (cD === 0 && cQ === 0) ? "not-allowed" : "pointer",
              fontSize: 13, fontFamily: sans, display: "flex", alignItems: "center", gap: 5, opacity: (cD === 0 && cQ === 0) ? 0.5 : 1,
            }}><ChevronLeft size={14} /> Previous</button>
            <button onClick={next} disabled={sel === undefined} style={{
              padding: "11px 30px", background: sel !== undefined ? B.navy : B.mutedPale, color: sel !== undefined ? "#fff" : B.textTertiary,
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: sel !== undefined ? "pointer" : "not-allowed",
              fontFamily: sans, display: "flex", alignItems: "center", gap: 5,
            }}>{cD === DOMAINS.length - 1 && cQ === dom.questions.length - 1 ? "View Results" : "Next"} <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══ RESULTS ═══
  // ── Save results to Supabase on completion ──
  useEffect(() => {
    if (phase === "results" && !resultsReady) {
      const s = calcScores(ans);
      const o = getOverall(s);
      const domainNamed = {};
      DOMAINS.forEach(d => { domainNamed[d.name] = s[d.id]; });
      finishAssessment({
        domain_scores: domainNamed,
        overall_score: o,
        maturity_level: Math.round(o),
      });
      setResultsReady(true);
    }
  }, [phase]);

  if (phase === "results") {
    const rd = DOMAINS.map(d => ({ dimension: d.name.length > 12 ? d.name.replace(/ & | /g, "\n") : d.name, score: sc[d.id], fullMark: 5 }));
    const oi = getLevelInfo(ov); const om = getMod(ov);
    const sorted = [...DOMAINS].sort((a, b) => sc[a.id] - sc[b.id]);
    const weak = sorted.slice(0, 3); const strong = sorted.slice(-2).reverse();
    const constr = sorted.filter(d => sc[d.id] > 0 && sc[d.id] < 2.5).map(d => d.name);
    const lo = sorted.filter(d => sc[d.id] < 2.5), mi = sorted.filter(d => sc[d.id] >= 2.5 && sc[d.id] < 3.5), hi = sorted.filter(d => sc[d.id] >= 3.5);
    const ph = [];
    if (lo.length) ph.push({ t: "Foundation", time: "Months 1\u20136", icon: Shield, c: B.red, items: lo.map(d => "Address " + d.name + " (Level " + Math.round(sc[d.id]) + ")") });
    if (mi.length || lo.length) ph.push({ t: "Standardization", time: lo.length ? "Months 7\u201312" : "Months 1\u20136", icon: Layers, c: B.amber, items: mi.length ? mi.map(d => "Elevate " + d.name + " to Level " + Math.min(5, Math.round(sc[d.id]) + 1)) : ["Formalize processes across all dimensions"] });
    ph.push({ t: "Optimization", time: lo.length ? "Months 13\u201324" : mi.length ? "Months 7\u201318" : "Months 1\u201312", icon: Star, c: B.green, items: hi.length ? hi.map(d => "Scale " + d.name + " across organization") : ["Target Level 4+ across all dimensions"] });

    const card = { background: "#fff", borderRadius: 14, border: "1px solid " + B.border, padding: "28px" };
    const lbl = { fontSize: 10, fontWeight: 500, color: B.textTertiary, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: mono, marginBottom: 20 };

    // Named scores for email
    const domainNamed = {};
    DOMAINS.forEach(d => { domainNamed[d.name] = sc[d.id]; });

    return (
      <div style={{ ...pg, overflowY: "auto" }}>
        <div style={{ maxWidth: 840, margin: "0 auto", padding: "52px 28px" }}>
          {/* ── Results Actions Bar (PDF + Email) ── */}
          <ResultsActions
            assessmentType="maturity"
            resultsElementId="maturity-results-dashboard"
            isSaving={isSaving}
            lastSaved={lastSaved}
            onSendEmail={async (email, name) => {
              return sendResultsEmail(email, name, {
                overallScore: ov,
                domainScores: domainNamed,
              });
            }}
          />

          <div id="maturity-results-dashboard">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Mark size={26} /><span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 2.5, color: B.teal, fontFamily: mono, textTransform: "uppercase" }}>STRATRI</span>
              </div>
              <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 400, margin: "0 0 6px", fontFamily: serif }}>AI Maturity <em style={{ fontWeight: 300 }}>Report</em></h1>
              <p style={{ fontSize: 13, color: B.textTertiary, margin: 0 }}>
                {profile.industry} &middot; {profile.size} &middot; {profile.regions.map(r => REGIONS.find(x => x.id === r)?.flag).join(" ")}
              </p>
            </div>
            <button onClick={() => { setPhase("welcome"); setAns({}); setCD(0); setCQ(0); setResultsReady(false); }} style={{
              padding: "9px 18px", background: "#fff", border: "1px solid " + B.border, borderRadius: 8, color: B.textSecondary, cursor: "pointer", fontSize: 12, fontFamily: sans,
            }}>New Assessment</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20, marginBottom: 36 }}>
            <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={lbl}>Overall Maturity</div>
              <Arc score={ov} />
              <div style={{ marginTop: 16, padding: "9px 18px", borderRadius: 8, background: oi.color + "0D", border: "1px solid " + oi.color + "22", fontSize: 13, fontWeight: 500, color: oi.color }}>Level {Math.round(ov)}{om} &middot; {oi.name}</div>
              {constr.length > 0 && (
                <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 8, background: B.red + "08", border: "1px solid " + B.red + "18", width: "100%" }}>
                  <div style={{ fontSize: 9.5, fontWeight: 500, color: B.red, fontFamily: mono, letterSpacing: 1, display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}><AlertTriangle size={11} /> CONSTRAINTS</div>
                  {constr.map((c, i) => <div key={i} style={{ fontSize: 12, color: B.textSecondary, marginTop: 3 }}>&middot; {c}</div>)}
                </div>
              )}
            </div>
            <div style={card}>
              <div style={lbl}>Dimension Radar</div>
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

          <div style={{ ...card, marginBottom: 36 }}>
            <div style={lbl}>Dimension Breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {DOMAINS.map(d => {
                const s = sc[d.id]; const info = getLevelInfo(s); const m = getMod(s);
                return (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 130, flexShrink: 0, fontSize: 13, fontWeight: 500, color: B.navy }}>{d.name}</div>
                    <div style={{ flex: 1, height: 7, background: B.mutedPale, borderRadius: 4 }}>
                      <div style={{ width: (s / 5 * 100) + "%", height: "100%", borderRadius: 4, background: info.color, opacity: 0.7, transition: "width 0.8s" }} />
                    </div>
                    <div style={{ width: 100, textAlign: "right", fontSize: 12, fontFamily: mono, color: info.color, fontWeight: 500 }}>L{Math.round(s)}{m} &middot; {s.toFixed(1)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 36 }}>
            <div style={card}>
              <div style={{ ...lbl, color: B.orange, display: "flex", alignItems: "center", gap: 7 }}><AlertTriangle size={13} /> PRIORITY GAPS</div>
              {weak.map(d => {
                const s = sc[d.id]; const info = getLevelInfo(s);
                return (
                  <div key={d.id} style={{ padding: "12px 14px", marginBottom: 8, borderRadius: 8, background: info.color + "08", border: "1px solid " + info.color + "15" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: B.navy }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: info.color, fontFamily: mono }}>Level {Math.round(s)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: B.textTertiary, lineHeight: 1.5 }}>
                      {s < 2 ? "Immediate attention required. This gap constrains overall advancement." : s < 3 ? "Developing. Formalized processes needed for Level 3 baseline." : "Room for improvement. Focus on standardization."}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={card}>
              <div style={{ ...lbl, color: B.green, display: "flex", alignItems: "center", gap: 7 }}><Zap size={13} /> STRENGTHS</div>
              {strong.map(d => {
                const s = sc[d.id]; const info = getLevelInfo(s);
                return (
                  <div key={d.id} style={{ padding: "12px 14px", marginBottom: 8, borderRadius: 8, background: info.color + "08", border: "1px solid " + info.color + "15" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: B.navy }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: info.color, fontFamily: mono }}>Level {Math.round(s)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: B.textTertiary, lineHeight: 1.5 }}>
                      {s >= 4 ? "Industry-leading. Leverage as foundation for broader maturity." : s >= 3 ? "Solid foundation. Well-positioned for next level." : "Relative strength. Continue building here."}
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 16 }}>
                <div style={{ ...lbl, color: B.teal, marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}><Clock size={13} /> QUICK WINS</div>
                {[ov < 3 && "Document existing AI processes and decisions", weak[0] && sc[weak[0].id] < 2.5 && "Initiate " + weak[0].name.toLowerCase() + " gap assessment", "Establish monthly AI steering committee"].filter(Boolean).map((w, i) => (
                  <div key={i} style={{ fontSize: 12, color: B.textSecondary, padding: "4px 0", display: "flex", gap: 7 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: B.teal, marginTop: 6, flexShrink: 0 }} />{w}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...card, marginBottom: 36 }}>
            <div style={lbl}>Maturity Roadmap</div>
            <div style={{ fontSize: 14, color: B.textTertiary, marginBottom: 24, fontStyle: "italic", fontFamily: serif }}>Level {Math.round(ov)} → Level {Math.min(5, Math.round(ov) + 2)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {ph.map((p, i) => {
                const IC = p.icon;
                return (
                  <div key={i} style={{ display: "flex", gap: 18, position: "relative" }}>
                    {i < ph.length - 1 && <div style={{ position: "absolute", left: 18, top: 42, bottom: -22, width: 1, background: B.border }} />}
                    <div style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: p.c + "0D", border: "1px solid " + p.c + "22" }}><IC size={17} color={p.c} /></div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 14.5, fontWeight: 600, color: B.navy }}>Phase {i + 1}: {p.t}</span>
                        <span style={{ fontSize: 10, color: p.c, padding: "2px 9px", borderRadius: 4, background: p.c + "0D", fontFamily: mono }}>{p.time}</span>
                      </div>
                      {p.items.map((it, j) => (
                        <div key={j} style={{ fontSize: 13, color: B.textSecondary, padding: "3px 0", display: "flex", gap: 7 }}>
                          <ChevronRight size={13} color={p.c} style={{ marginTop: 2, flexShrink: 0 }} />{it}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          </div>{/* close #maturity-results-dashboard */}

          <div style={{ background: B.navy, borderRadius: 14, padding: "44px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, borderRadius: "50%", background: B.muted + "10" }} />
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: 2.5, color: B.muted, textTransform: "uppercase", marginBottom: 14, fontFamily: mono }}>Ready to accelerate?</div>
            <h3 style={{ fontSize: 25, fontWeight: 400, margin: "0 0 12px", fontFamily: serif, color: "#fff" }}>Let STRATRI guide your AI maturity <em style={{ fontWeight: 300 }}>journey</em></h3>
            <p style={{ fontSize: 14, color: B.muted, maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.7, fontWeight: 300 }}>Our R.A.I.L.W.A.Y. framework aligns with ISO 42001 to close gaps, build resilience, and turn maturity into strategic advantage.</p>
            <button style={{ padding: "14px 38px", background: "#fff", color: B.navy, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: sans, display: "inline-flex", alignItems: "center", gap: 9 }}>Schedule a Consultation <ArrowRight size={16} /></button>
          </div>

          <div style={{ marginTop: 44, paddingTop: 20, borderTop: "1px solid " + B.border, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: B.textTertiary, fontFamily: mono }}>&copy; 2026 STRATRI &middot; Governance & Technology Policy Studio</span>
            <span style={{ fontSize: 10, color: B.textTertiary, fontFamily: mono }}>Assessment v1.0 &middot; ISO 42001 aligned</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
