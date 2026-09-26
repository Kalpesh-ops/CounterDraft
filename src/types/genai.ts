/**
 * Shared request/response contract between the browser and the
 * CounterDraft GenAI gateway (`/api/genai`, backed by Google Gemini).
 */
import type { ClauseAnalysis, ObligationItem, RiskLevel } from './legal';

export const SUPPORTED_LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Gujarati',
] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export type GenAITask = 'analyze' | 'qa' | 'simplify';

/** A verbatim contract clause sent to the model as grounding context. */
export interface ClauseInput {
  clauseNumber: string;
  title: string;
  text: string;
}

/** Model-generated insight for one clause, already validated server-side. */
export interface AIClauseInsight {
  clauseNumber: string;
  plainSummary: string;
  riskLevel: RiskLevel;
  riskRationale: string;
  statutoryContext: string;
  /** Present only when it matches the curated precedent corpus. */
  precedentCitation?: string;
  practicalScenario: string;
  recommendedCounterProposal: string;
  category: ClauseAnalysis['category'];
  tags: string[];
}

export type AIObligation = Omit<ObligationItem, 'id'>;

export interface AnalyzeResult {
  executiveSummary: string;
  partyA: string;
  partyB: string;
  jurisdiction: string;
  governingLaw: string;
  clauses: AIClauseInsight[];
  obligations: AIObligation[];
  nextSteps: string[];
}

export interface QAResult {
  answerSummary: string;
  statutoryRightsNote: string;
  citations: { clauseNumber: string; clauseTitle: string; exactSnippet: string; relevanceExplanation: string }[];
  precedentRefs: string[];
  suggestedFollowUps: string[];
  /** Model-proposed quotes discarded because they were not found verbatim in the contract. */
  discardedCitations: number;
}

export interface SimplifyResult {
  language: SupportedLanguage;
  explanation: string;
  keyPoints: string[];
  watchOut: string;
  questionsToAsk: string[];
}

export interface GenAIResultMap {
  analyze: AnalyzeResult;
  qa: QAResult;
  simplify: SimplifyResult;
}
