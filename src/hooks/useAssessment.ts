"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  supabase,
  createAssessment,
  loadAssessment,
  saveResponses,
  completeAssessment,
  type Assessment,
} from "@/lib/supabase";

interface UseAssessmentOptions {
  type: "maturity" | "governance";
  totalQuestions: number;
}

interface UseAssessmentReturn {
  // State
  assessmentId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;

  // Actions
  startAssessment: (profile: {
    industry?: string;
    employee_count?: string;
    regions?: string[];
    organization_name?: string;
  }) => Promise<string | null>;
  resumeAssessment: (id: string) => Promise<Assessment | null>;
  saveProgress: (
    coreResponses: Record<string, Record<string, number>>,
    regionalResponses?: Record<string, Record<string, number>>,
    answeredCount?: number
  ) => Promise<void>;
  finishAssessment: (results: {
    domain_scores: Record<string, number>;
    regional_scores?: Record<string, { score: number; max: number; pct: number }>;
    overall_score: number;
    maturity_level: number;
  }) => Promise<void>;
  saveContact: (contact: {
    name?: string;
    email?: string;
    company?: string;
    role?: string;
    emailConsent?: boolean;
    marketingConsent?: boolean;
  }) => Promise<void>;
  sendResultsEmail: (
    email: string,
    name: string,
    results: any,
    pdfBase64?: string
  ) => Promise<boolean>;
}

export function useAssessment({
  type,
  totalQuestions,
}: UseAssessmentOptions): UseAssessmentReturn {
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer for auto-save
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // Check URL for existing assessment ID on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id) {
        setAssessmentId(id);
      }
    }
  }, []);

  // Start a new assessment
  const startAssessment = useCallback(
    async (profile: {
      industry?: string;
      employee_count?: string;
      regions?: string[];
      organization_name?: string;
    }): Promise<string | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const assessment = await createAssessment(type, profile);
        if (assessment) {
          setAssessmentId(assessment.id);
          // Update URL without reload
          const url = new URL(window.location.href);
          url.searchParams.set("id", assessment.id);
          window.history.replaceState({}, "", url.toString());
          return assessment.id;
        }
        setError("Failed to create assessment");
        return null;
      } catch (e) {
        setError("Network error");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [type]
  );

  // Resume an existing assessment
  const resumeAssessment = useCallback(
    async (id: string): Promise<Assessment | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const assessment = await loadAssessment(id);
        if (assessment) {
          setAssessmentId(assessment.id);
          return assessment;
        }
        setError("Assessment not found");
        return null;
      } catch (e) {
        setError("Network error");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Auto-save progress (debounced)
  const saveProgress = useCallback(
    async (
      coreResponses: Record<string, Record<string, number>>,
      regionalResponses?: Record<string, Record<string, number>>,
      answeredCount?: number
    ) => {
      if (!assessmentId) return;

      // Debounce: cancel previous timer
      if (saveTimer.current) clearTimeout(saveTimer.current);

      saveTimer.current = setTimeout(async () => {
        setIsSaving(true);
        const progress = answeredCount
          ? Math.round((answeredCount / totalQuestions) * 100)
          : 0;

        const updates: any = {
          core_responses: coreResponses,
          progress,
        };
        if (regionalResponses) {
          updates.regional_responses = regionalResponses;
        }

        const success = await saveResponses(assessmentId, updates);
        if (success) {
          setLastSaved(new Date());
        }
        setIsSaving(false);
      }, 1500); // 1.5s debounce
    },
    [assessmentId, totalQuestions]
  );

  // Complete assessment with final scores
  const finishAssessment = useCallback(
    async (results: {
      domain_scores: Record<string, number>;
      regional_scores?: Record<
        string,
        { score: number; max: number; pct: number }
      >;
      overall_score: number;
      maturity_level: number;
    }) => {
      if (!assessmentId) return;
      setIsSaving(true);
      await completeAssessment(assessmentId, results);
      setLastSaved(new Date());
      setIsSaving(false);
    },
    [assessmentId]
  );

  // Save contact info
  const saveContact = useCallback(
    async (contact: {
      name?: string;
      email?: string;
      company?: string;
      role?: string;
      emailConsent?: boolean;
      marketingConsent?: boolean;
    }) => {
      if (!assessmentId) return;
      await supabase
        .from("assessments")
        .update({
          contact_name: contact.name,
          contact_email: contact.email,
          contact_company: contact.company,
          contact_role: contact.role,
          email_consent: contact.emailConsent,
          marketing_consent: contact.marketingConsent,
        })
        .eq("id", assessmentId);
    },
    [assessmentId]
  );

  // Send results via email
  const sendResultsEmail = useCallback(
    async (
      email: string,
      name: string,
      results: any,
      pdfBase64?: string
    ): Promise<boolean> => {
      try {
        const response = await fetch("/api/send-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            name,
            assessmentType: type,
            results,
            pdfBase64,
          }),
        });
        return response.ok;
      } catch {
        return false;
      }
    },
    [type]
  );

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return {
    assessmentId,
    isLoading,
    isSaving,
    lastSaved,
    error,
    startAssessment,
    resumeAssessment,
    saveProgress,
    finishAssessment,
    saveContact,
    sendResultsEmail,
  };
}
