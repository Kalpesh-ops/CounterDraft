/**
 * CounterDraft Legal Intelligence & Clause Negotiation Engine
 * Core Data Models and Domain Type System
 * 
 * Defines the structural schema for parsed contracts, clause risk models,
 * judicial precedent references, comparative diffs, and advocate consultation briefs.
 */

/**
 * Categorical risk rating assigned to a contractual provision:
 * - 'high': Unilateral, unconscionable, or statutory violation (e.g. post-term non-compete).
 * - 'caution': Significant liability shift or ambiguous timeline requiring protective redlines.
 * - 'standard': Typical bilateral commercial terms aligned with common legal practice.
 * - 'favorable': Expressly beneficial protections (e.g. escrow deposits, mutual remedies).
 */
export type RiskLevel = 'high' | 'caution' | 'standard' | 'favorable';

/**
 * Deep semantic analysis of a single contractual clause or section.
 */
export interface ClauseAnalysis {
  /** Unique internal identifier for the clause */
  id: string;
  /** Section or clause designator (e.g. "Section 4.1", "Clause 8") */
  clauseNumber: string;
  /** Descriptive title or topic of the clause */
  title: string;
  /** Original, unamended legal text as drafted by the counterparty */
  originalText: string;
  /** Plain-language demystified summary explaining what the clause practically means */
  plainSummary: string;
  /** Evaluated severity level for prospective signatories */
  riskLevel: RiskLevel;
  /** Detailed legal reasoning explaining why the provision creates exposure */
  riskRationale: string;
  /** Relevant statutory codification (e.g. Indian Contract Act 1872, Sec 27) */
  statutoryContext: string;
  /** Landmark Supreme Court or High Court citation governing the topic */
  precedentCitation?: string;
  /** Real-world consequence scenario demonstrating the clause in action */
  practicalScenario: string;
  /** Ready-to-use, balanced redline counter-proposal ready for copy-pasting */
  recommendedCounterProposal: string;
  /** Substantive legal classification */
  category: 'liability' | 'termination' | 'financial' | 'intellectual_property' | 'dispute_resolution' | 'covenants' | 'general';
  /** Searchable keywords and thematic labels */
  tags: string[];
}

/**
 * Discrete operational duty extracted from the agreement.
 */
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

/**
 * Master representation of an audited legal agreement.
 */
export interface LegalDocument {
  /** Unique docket identifier */
  id: string;
  /** Full formal title of the agreement */
  title: string;
  /** Contractual genre (e.g. "Residential Lease", "Employment Agreement") */
  documentType: string;
  /** Territorial jurisdiction governing execution */
  jurisdiction: string;
  /** Governing substantive law */
  governingLaw: string;
  /** Audit preparation or last revision timestamp */
  lastUpdated: string;
  /** Designated executing entities */
  parties: {
    partyA: string;
    partyB: string;
  };
  /** Composite risk metric (0-100), where higher signifies elevated exposure */
  overallRiskScore: number;
  /** Breakdown of clause counts by evaluated risk level */
  riskSummary: {
    highCount: number;
    cautionCount: number;
    standardCount: number;
    favorableCount: number;
  };
  /** High-level executive briefing for signatories */
  executiveSummary: string;
  /** Top flagged legal vulnerabilities extracted from high-risk provisions */
  keyVulnerabilities: string[];
  /** Complete array of analyzed clauses */
  clauses: ClauseAnalysis[];
  /** Extracted operational obligations */
  obligations: ObligationItem[];
  /** References to relevant landmark court precedents */
  precedentLinks: string[];
}

/**
 * Clause-by-clause comparative diff between two contract versions.
 */
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

/**
 * Paired contract comparison set with overall shift assessment.
 */
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

/**
 * Curated judicial authority from Indian appellate jurisprudence.
 */
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

/**
 * Verbatim text citation grounded in the active docket.
 */
export interface QACitation {
  clauseNumber: string;
  clauseTitle: string;
  exactSnippet: string;
  relevanceExplanation: string;
}

/**
 * Grounded Q&A response synthesizing contract citations with statutory rights.
 */
export interface GroundedQAResponse {
  id: string;
  question: string;
  answerSummary: string;
  statutoryRightsNote: string;
  citations: QACitation[];
  precedentRefs: string[];
  suggestedFollowUps: string[];
}

/**
 * One-page structured consultation memorandum prepared for an enrolled advocate.
 */
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

/**
 * Ready-to-transmit counter-draft correspondence.
 */
export interface NegotiationEmail {
  recipientType: 'counterparty' | 'landlord' | 'employer' | 'vendor';
  subject: string;
  bodyText: string;
  addressedClauseNumbers: string[];
}

/**
 * Quantified financial vulnerability summary.
 */
export interface FinancialExposureSummary {
  depositAtRisk: string;
  potentialPenaltyRate: string;
  noticeWageExposure: string;
  liabilityCapAmount: string;
  keyFinancialVulnerabilities: string[];
}
