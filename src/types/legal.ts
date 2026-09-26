export type RiskLevel = 'high' | 'caution' | 'standard' | 'favorable';

export interface ClauseAnalysis {
  id: string;
  clauseNumber: string;
  title: string;
  originalText: string;
  plainSummary: string;
  riskLevel: RiskLevel;
  riskRationale: string;
  statutoryContext: string;
  precedentCitation?: string;
  practicalScenario: string;
  recommendedCounterProposal: string;
  category: 'liability' | 'termination' | 'financial' | 'intellectual_property' | 'dispute_resolution' | 'covenants' | 'general';
  tags: string[];
}

export interface ObligationItem {
  id: string;
  responsibleParty: string;
  beneficiaryParty: string;
  action: string;
  timelineOrDeadline: string;
  consequenceOfDefault: string;
  clauseRef: string;
  status: 'mandatory' | 'conditional' | 'prohibited';
}

export interface LegalDocument {
  id: string;
  title: string;
  documentType: string;
  jurisdiction: string;
  governingLaw: string;
  lastUpdated: string;
  parties: {
    partyA: string;
    partyB: string;
  };
  overallRiskScore: number; // 0 to 100, where higher is riskier for Party B / user
  riskSummary: {
    highCount: number;
    cautionCount: number;
    standardCount: number;
    favorableCount: number;
  };
  executiveSummary: string;
  keyVulnerabilities: string[];
  clauses: ClauseAnalysis[];
  obligations: ObligationItem[];
  precedentLinks: string[];
}

export interface ComparisonDiff {
  clauseNumber: string;
  topic: string;
  versionAText: string;
  versionBText: string;
  status: 'modified' | 'added' | 'removed' | 'identical';
  riskImpact: 'worse_for_user' | 'better_for_user' | 'neutral';
  analysis: string;
  keyWordChanges: string[];
}

export interface ComparisonPair {
  id: string;
  title: string;
  description: string;
  docA: LegalDocument;
  docB: LegalDocument;
  diffs: ComparisonDiff[];
  netFavorabilityShift: 'substantially_worse' | 'moderately_worse' | 'balanced' | 'improved';
  shiftSummary: string;
}

export interface CourtPrecedent {
  id: string;
  caseName: string;
  citation: string;
  court: string;
  year: number;
  bench: string;
  statutorySection: string;
  coreDoctrine: string;
  rulingSummary: string;
  relevanceToContracts: string;
  applicationGuidance: string;
  keywords: string[];
}

export interface QACitation {
  clauseNumber: string;
  clauseTitle: string;
  exactSnippet: string;
  relevanceExplanation: string;
}

export interface GroundedQAResponse {
  id: string;
  question: string;
  answerSummary: string;
  statutoryRightsNote: string;
  citations: QACitation[];
  precedentRefs: string[];
  suggestedFollowUps: string[];
}

export interface CounselBrief {
  clientName: string;
  documentTitle: string;
  counterparty: string;
  datePrepared: string;
  overallExposureRating: 'Severe' | 'Elevated' | 'Moderate' | 'Routine';
  highPriorityRisks: {
    clauseNumber: string;
    issue: string;
    questionsForAttorney: string[];
    suggestedRedline: string;
  }[];
  statutoryDefenses: string[];
  negotiationChecklist: string[];
  missingSafeguards: string[];
}
