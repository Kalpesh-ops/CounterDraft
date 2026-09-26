/**
 * Browser client for the CounterDraft GenAI gateway (Google Gemini via `/api/genai`).
 *
 * Every AI feature is paired with the deterministic statutory engine in
 * `legalEngine.ts`: if the gateway is unreachable, unconfigured, or rate-limited,
 * callers fall back to the rule-based result so the app keeps working offline.
 */
import type { ClauseAnalysis, GroundedQAResponse, LegalDocument } from '../types/legal';
import type { AnalyzeResult, ClauseInput, GenAIResultMap, GenAITask, SimplifyResult, SupportedLanguage } from '../types/genai';
import { computeRiskMetrics } from './legalEngine';

const ENDPOINT = '/api/genai';
const CLIENT_TIMEOUT_MS = 60_000;

export class GenAIUnavailableError extends Error {}

interface GatewayResponse<T extends GenAITask> {
  task: T;
  model: string;
  result: GenAIResultMap[T];
}

async function callGateway<T extends GenAITask>(
  task: T,
  payload: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<GatewayResponse<T>> {
  const timeout = AbortSignal.timeout(CLIENT_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ task, ...payload }),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch {
    throw new GenAIUnavailableError('Could not reach the AI service.');
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok || typeof data !== 'object' || data === null || !('result' in data)) {
    const message = typeof data === 'object' && data !== null && 'error' in data ? String(data.error) : 'AI service unavailable.';
    throw new GenAIUnavailableError(message);
  }
  return data as GatewayResponse<T>;
}

export const toClauseInputs = (clauses: ClauseAnalysis[]): ClauseInput[] =>
  clauses.map((c) => ({ clauseNumber: c.clauseNumber, title: c.title, text: c.originalText }));

const orFallback = (value: string, fallback: string) => value || fallback;

/**
 * Merges validated Gemini insights into a rule-engine parsed document.
 * Verbatim clause text is never replaced — only the explanatory layer is.
 */
export function mergeAIAnalysis(doc: LegalDocument, ai: AnalyzeResult, model: string): LegalDocument {
  const insights = new Map(ai.clauses.map((c) => [c.clauseNumber, c]));

  const clauses = doc.clauses.map((clause): ClauseAnalysis => {
    const insight = insights.get(clause.clauseNumber);
    if (!insight) return clause;
    return {
      ...clause,
      plainSummary: orFallback(insight.plainSummary, clause.plainSummary),
      riskLevel: insight.riskLevel,
      riskRationale: orFallback(insight.riskRationale, clause.riskRationale),
      statutoryContext: orFallback(insight.statutoryContext, clause.statutoryContext),
      precedentCitation: insight.precedentCitation ?? clause.precedentCitation,
      practicalScenario: orFallback(insight.practicalScenario, clause.practicalScenario),
      recommendedCounterProposal: orFallback(insight.recommendedCounterProposal, clause.recommendedCounterProposal),
      category: insight.category,
      tags: insight.tags.length > 0 ? insight.tags : clause.tags,
    };
  });

  const metrics = computeRiskMetrics(clauses);

  return {
    ...doc,
    ...metrics,
    clauses,
    executiveSummary: orFallback(ai.executiveSummary, doc.executiveSummary),
    parties: {
      partyA: orFallback(ai.partyA, doc.parties.partyA),
      partyB: orFallback(ai.partyB, doc.parties.partyB),
    },
    jurisdiction: orFallback(ai.jurisdiction, doc.jurisdiction),
    governingLaw: orFallback(ai.governingLaw, doc.governingLaw),
    obligations: ai.obligations.length > 0
      ? ai.obligations.map((o, i) => ({ ...o, id: `ai-ob-${i + 1}` }))
      : doc.obligations,
    nextSteps: ai.nextSteps,
    analysisSource: 'genai',
    aiModel: model,
  };
}

/** Sends a parsed document's clauses to Gemini and returns the enriched document. */
export async function enrichDocumentWithAI(doc: LegalDocument, signal?: AbortSignal): Promise<LegalDocument> {
  const { result, model } = await callGateway(
    'analyze',
    { title: doc.title, documentType: doc.documentType, clauses: toClauseInputs(doc.clauses) },
    signal,
  );
  return mergeAIAnalysis(doc, result, model);
}

/** Answers a question grounded in the document's clauses; quotes are verified server-side. */
export async function askDocumentAI(doc: LegalDocument, question: string, signal?: AbortSignal): Promise<GroundedQAResponse> {
  const { result, model } = await callGateway('qa', { title: doc.title, question, clauses: toClauseInputs(doc.clauses) }, signal);
  return {
    id: `qa-ai-${Date.now()}`,
    question,
    answerSummary: result.answerSummary,
    statutoryRightsNote: result.statutoryRightsNote,
    citations: result.citations,
    precedentRefs: result.precedentRefs,
    suggestedFollowUps: result.suggestedFollowUps,
    analysisSource: 'genai',
    aiModel: model,
    discardedCitations: result.discardedCitations,
  };
}

/** Explains one clause in plain language in the requested Indian language. */
export async function simplifyClauseAI(
  clause: ClauseAnalysis,
  language: SupportedLanguage,
  signal?: AbortSignal,
): Promise<SimplifyResult> {
  const { result } = await callGateway('simplify', { language, clause: toClauseInputs([clause])[0] }, signal);
  return result;
}
