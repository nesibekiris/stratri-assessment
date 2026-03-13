import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Types ──

export interface Assessment {
  id: string;
  type: "maturity" | "governance";
  status: "in_progress" | "completed";
  progress: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  organization_name: string | null;
  industry: string | null;
  employee_count: string | null;
  regions: string[];
  core_responses: Record<string, Record<string, number>>;
  regional_responses: Record<string, Record<string, number>>;
  domain_scores: Record<string, number>;
  regional_scores: Record<string, { score: number; max: number; pct: number }>;
  overall_score: number | null;
  maturity_level: number | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_company: string | null;
  contact_role: string | null;
  email_consent: boolean;
  marketing_consent: boolean;
}

// ── API Functions ──

export async function createAssessment(
  type: "maturity" | "governance",
  profile: {
    industry?: string;
    employee_count?: string;
    regions?: string[];
    organization_name?: string;
  }
): Promise<Assessment | null> {
  const { data, error } = await supabase
    .from("assessments")
    .insert({
      type,
      ...profile,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating assessment:", error);
    return null;
  }
  return data;
}

export async function loadAssessment(id: string): Promise<Assessment | null> {
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error loading assessment:", error);
    return null;
  }
  return data;
}

export async function saveResponses(
  id: string,
  updates: {
    core_responses?: Record<string, Record<string, number>>;
    regional_responses?: Record<string, Record<string, number>>;
    progress?: number;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from("assessments")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error saving responses:", error);
    return false;
  }
  return true;
}

export async function completeAssessment(
  id: string,
  results: {
    domain_scores: Record<string, number>;
    regional_scores?: Record<string, { score: number; max: number; pct: number }>;
    overall_score: number;
    maturity_level: number;
    contact_name?: string;
    contact_email?: string;
    contact_company?: string;
    contact_role?: string;
    email_consent?: boolean;
    marketing_consent?: boolean;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from("assessments")
    .update({
      ...results,
      status: "completed",
      progress: 100,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error completing assessment:", error);
    return false;
  }
  return true;
}
