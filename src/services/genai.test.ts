import { describe, it, expect, vi, afterEach } from 'vitest';
import { askDocumentAI, GenAIUnavailableError, mergeAIAnalysis, toClauseInputs } from './genai';
import { parseCustomContract } from './legalEngine';
import type { AnalyzeResult } from '../types/genai';

const contract = `Section 1. Security Deposit
The Lessor may forfeit the full deposit on early exit without showing damage.

Section 2. Rent
Rent is payable on the fifth day of each month.`;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GenAI client - merging Gemini analysis', () => {
  it('overlays AI explanations but never alters verbatim clause text', () => {
    const doc = parseCustomContract(contract, 'Lease', 'Residential Lease');
    const ai: AnalyzeResult = {
      executiveSummary: 'Heavily favours the landlord.',
      partyA: 'Lessor',
      partyB: 'Lessee',
      jurisdiction: 'Not specified in contract',
      governingLaw: 'Indian Contract Act, 1872',
      clauses: [{
        clauseNumber: doc.clauses[1].clauseNumber,
        plainSummary: 'Rent is due on the 5th.',
        riskLevel: 'favorable',
        riskRationale: 'Clear due date.',
        statutoryContext: 'Section 108, TPA',
        practicalScenario: 'Pay by the 5th.',
        recommendedCounterProposal: 'Add a 3-day grace period.',
        category: 'financial',
        tags: ['rent'],
      }],
      obligations: [],
      nextSteps: ['Ask for a grace period.'],
    };

    const merged = mergeAIAnalysis(doc, ai, 'gemini-test');

    expect(merged.analysisSource).toBe('genai');
    expect(merged.aiModel).toBe('gemini-test');
    expect(merged.clauses[1].originalText).toBe(doc.clauses[1].originalText);
    expect(merged.clauses[1].riskLevel).toBe('favorable');
    expect(merged.clauses[0]).toEqual(doc.clauses[0]);
    expect(merged.riskSummary.favorableCount).toBe(1);
    expect(merged.obligations).toEqual(doc.obligations);
    expect(merged.nextSteps).toEqual(['Ask for a grace period.']);
  });

  it('sends only clause numbers, titles and verbatim text to the gateway', () => {
    const doc = parseCustomContract(contract, 'Lease');
    expect(Object.keys(toClauseInputs(doc.clauses)[0]).sort()).toEqual(['clauseNumber', 'text', 'title']);
  });
});

describe('GenAI client - transport', () => {
  it('surfaces gateway errors as GenAIUnavailableError so callers can fall back', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'AI service is not configured.' }), { status: 503 })));
    const doc = parseCustomContract(contract, 'Lease');
    await expect(askDocumentAI(doc, 'Can they keep my deposit?')).rejects.toBeInstanceOf(GenAIUnavailableError);
  });

  it('maps a successful Q&A response into a GenAI-attributed answer', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      task: 'qa',
      model: 'gemini-test',
      result: {
        answerSummary: 'Only for proven loss.',
        statutoryRightsNote: 'Section 74.',
        citations: [],
        precedentRefs: [],
        suggestedFollowUps: [],
        discardedCitations: 1,
      },
    }), { status: 200 })));
    const doc = parseCustomContract(contract, 'Lease');
    const answer = await askDocumentAI(doc, 'Can they keep my deposit?');
    expect(answer.analysisSource).toBe('genai');
    expect(answer.discardedCitations).toBe(1);
  });
});
