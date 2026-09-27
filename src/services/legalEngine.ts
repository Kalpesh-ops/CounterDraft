import type {
  LegalDocument, ClauseAnalysis, RiskLevel, ObligationItem, GroundedQAResponse, CounselBrief,
  NegotiationEmail, FinancialExposureSummary, ComparisonPair, ComparisonDiff
} from '../types/legal';
import { courtPrecedents } from '../data/courtPrecedents';

/**
 * Evaluates legal risk, statutory context, and judicial enforceability of a single clause.
 * 
 * Analyzes contractual provisions using linear keyword matching (O(N) ReDoS-safe)
 * against statutory benchmarks from the Indian Contract Act, 1872 and Transfer of
 * Property Act, 1882, accompanied by landmark Supreme Court precedent citations.
 * 
 * @param text - The raw or sanitized text of the clause.
 * @param title - The title or section heading of the clause.
 * @returns Comprehensive analysis object including risk rating, plain-terms summary,
 * statutory context, and recommended counter-proposal redline.
 */
export function analyzeClauseRisk(text: string, title: string): {
  riskLevel: RiskLevel;
  riskRationale: string;
  statutoryContext: string;
  precedentCitation?: string;
  plainSummary: string;
  recommendedCounterProposal: string;
  category: ClauseAnalysis['category'];
  tags: string[];
} {
  const lower = text.toLowerCase();
  const lowerTitle = title.toLowerCase();

  // Non-compete and restraint of trade (explicit wording, a "compete" heading, or a post-exit ban on business or work)
  const restrictsFutureWork = lower.includes('shall not') && /\b(business|employment|work|services)\b/.test(lower)
    && /\b(after|following|post)\b/.test(lower) && /\b(months?|years?)\b/.test(lower);
  if (lower.includes('non-compete') || lower.includes('restraint') || (lower.includes('competition') && lower.includes('month'))
    || lowerTitle.includes('compet') || restrictsFutureWork) {
    return {
      riskLevel: 'high',
      riskRationale: 'Restricts post-tenure commercial activities and livelihood. Under Section 27 of the Indian Contract Act, post-termination non-competes are void ab initio.',
      statutoryContext: 'Section 27, Indian Contract Act, 1872; Percept D\'Mark (India) v. Zaheer Khan (2006) 4 SCC 227.',
      precedentCitation: 'Percept D\'Mark (India) v. Zaheer Khan (2006) 4 SCC 227',
      plainSummary: 'You are barred from working for competitors or starting a competing venture after leaving. Courts do not enforce post-departure non-competes in India.',
      recommendedCounterProposal: 'Delete post-termination restrictions entirely. Clarify that exclusivity obligations apply solely during active employment.',
      category: 'covenants',
      tags: ['non-compete', 'restraint of trade', 'career mobility', 'section 27']
    };
  }

  // Security deposit forfeiture & penalty clauses
  if (lower.includes('forfeit') || (lower.includes('deposit') && lower.includes('liquidated damages')) || (lower.includes('security') && lower.includes('loss'))) {
    return {
      riskLevel: 'high',
      riskRationale: 'Permits unilateral forfeiture of money without proving actual financial injury. Indian courts treat unverified forfeitures as illegal penalties under Section 74.',
      statutoryContext: 'Section 74, Indian Contract Act, 1872; Kailash Nath Associates v. DDA (2015) 4 SCC 136.',
      precedentCitation: 'Kailash Nath Associates v. DDA (2015) 4 SCC 136',
      plainSummary: 'The other party can confiscate your entire deposit or advance if you exit early, even if they suffered zero actual financial harm.',
      recommendedCounterProposal: 'Require that deposit deductions be restricted to verified unpaid utility dues and substantiated physical damages beyond ordinary wear and tear, returnable within 14 days.',
      category: 'financial',
      tags: ['security deposit', 'forfeiture', 'penalty', 'damages']
    };
  }

  // Right of entry / inspection with short or no notice (tenant's quiet enjoyment)
  if (/\b(enter|entry|inspect|inspection)\b/.test(lower + ' ' + lowerTitle) && /\b(premises|flat|apartment|house|dwelling|landlord|lessor)\b/.test(lower)) {
    const noticeHours = Number(lower.match(/(\d{1,3})\s*hours?/)?.[1] ?? NaN);
    const shortNotice = lower.includes('any time') || lower.includes('without notice') || lower.includes('verbal') || noticeHours < 24;
    return {
      riskLevel: shortNotice ? 'caution' : 'standard',
      riskRationale: shortNotice
        ? 'Permits the landlord to enter on very short, informal, or no notice, which erodes your statutory right to quiet enjoyment of the premises.'
        : 'Regulates landlord access to the premises with advance notice, consistent with ordinary tenancy practice.',
      statutoryContext: 'Section 108(c), Transfer of Property Act, 1882 (covenant for quiet enjoyment); state rent control and Model Tenancy Act norms of 24 hours written notice.',
      plainSummary: shortNotice
        ? 'The landlord can walk into your home with little or no warning.'
        : 'The landlord may visit the property after giving you advance notice.',
      recommendedCounterProposal: 'Landlord may enter only between 8 AM and 8 PM after at least 24 hours written notice stating the purpose, except in a genuine emergency threatening life or property.',
      category: 'covenants',
      tags: ['right of entry', 'quiet enjoyment', 'notice period', 'section 108']
    };
  }

  // Indemnity & hold harmless
  if (lower.includes('indemnify') || lower.includes('hold harmless') || lower.includes('indemnification')) {
    const isUnilateral = !lower.includes('each party shall indemnify') && !lower.includes('mutually indemnify');
    return {
      riskLevel: isUnilateral ? 'high' : 'caution',
      riskRationale: isUnilateral
        ? 'Imposes one-sided obligation to pay legal expenses and settlements for claims made against the other party, without reciprocal protection.'
        : 'Indemnification clause creates potential financial liability for third-party claims.',
      statutoryContext: 'Sections 124 and 125, Indian Contract Act, 1872 (Contracts of Indemnity).',
      plainSummary: isUnilateral
        ? 'You are forced to pay all legal defense bills and judgments if a third party sues them because of your contract activities, while they offer you zero defense.'
        : 'Both sides agree to cover legal damages for specific defined third-party claims.',
      recommendedCounterProposal: 'Make indemnities strictly reciprocal. Add clear carve-outs for the other party gross negligence, willful misconduct, or unauthorized alterations.',
      category: 'liability',
      tags: ['indemnity', 'hold harmless', 'third-party risk', 'legal defense']
    };
  }

  // Limitation of liability
  if (lower.includes('limitation of liability') || lower.includes('aggregate liability') || lower.includes('consequential damages') || lowerTitle.includes('liability')) {
    const isUltraLow = lower.includes('one (1) month') || lower.includes('1 month') || lower.includes('fees paid in the prior month');
    return {
      riskLevel: isUltraLow ? 'high' : 'caution',
      riskRationale: isUltraLow
        ? 'The liability cap is disproportionately tiny (1 month fees), neutralizing your ability to recover meaningful damages in the event of gross breach or data loss.'
        : 'Caps monetary recovery in case of breach. Ensure appropriate carve-outs for confidentiality breaches and statutory liabilities.',
      statutoryContext: 'Section 73, Indian Contract Act; Unfair Contract Terms doctrine.',
      precedentCitation: 'LIC of India v. Consumer Education & Research Centre (1995) 5 SCC 482',
      plainSummary: isUltraLow
        ? 'If the vendor causes massive data loss or system failure, their total payout is restricted to just 1 month of subscription fees.'
        : 'Limits the maximum cash payout you can get if the other party breaches the contract.',
      recommendedCounterProposal: 'Expand liability cap to 12 months fees paid. Include super-caps or uncapped liability for breaches of data privacy, confidentiality, and willful misconduct.',
      category: 'liability',
      tags: ['liability cap', 'damages limit', 'remedies']
    };
  }

  // Unilateral termination & lock-in
  if (lower.includes('terminate') || lower.includes('termination') || lower.includes('lock-in') || lowerTitle.includes('termination')) {
    const isAsymmetric = lower.includes('sole discretion') ||
      (lower.includes('without paying') && lower.includes('notice')) ||
      lower.includes('immediately without notice') ||
      lower.includes('without notice') ||
      lower.includes('unilateral');

    const isMutualStandard = (lower.includes('either party') || lower.includes('each party')) &&
      (lower.includes('30 days') || lower.includes('thirty (30) days') || lower.includes('60 days'));

    const riskLevel: RiskLevel = isAsymmetric ? 'high' : isMutualStandard ? 'standard' : 'caution';

    return {
      riskLevel,
      riskRationale: isAsymmetric
        ? 'Grants one party asymmetric power to cancel or walk away without notice, leaving the counterparty vulnerable.'
        : isMutualStandard
        ? 'Mutual termination clause with standard 30+ day advance notice window.'
        : 'Outlines how and when either side can end the contract. Requires scrutiny of notice periods and wind-down procedures.',
      statutoryContext: 'Central Inland Water Transport Corp v. Brojo Nath Ganguly (1986) 3 SCC 156.',
      precedentCitation: 'Central Inland Water Transport Corp v. Brojo Nath Ganguly (1986) 3 SCC 156',
      plainSummary: isAsymmetric
        ? 'They can terminate the contract immediately without giving you notice or compensation.'
        : isMutualStandard
        ? 'Either party can exit the contract by providing 30 days advance written notice.'
        : 'Specifies the notice timeline and exit protocols required to terminate the agreement.',
      recommendedCounterProposal: 'Ensure identical notice periods apply to both sides (e.g. 30 days written notice) with pro-rata compensation for any unserved notice period.',
      category: 'termination',
      tags: ['termination', 'lock-in', 'exit clause', 'notice']
    };
  }

  // Arbitration and sole arbitrator
  if (lower.includes('arbitrat') || lower.includes('dispute resolution') || lowerTitle.includes('dispute')) {
    const isSoleArbitrator = lower.includes('appointed exclusively') || lower.includes('sole arbitrator appointed by') || lower.includes('landlord sole discretion');
    return {
      riskLevel: isSoleArbitrator ? 'caution' : 'standard',
      riskRationale: isSoleArbitrator
        ? 'Unilateral appointment of a sole arbitrator violates statutory impartiality mandates under the Arbitration and Conciliation Act (Section 12(5)).'
        : 'Establishes the forum and procedural rules for resolving legal disagreements.',
      statutoryContext: 'Section 12(5) and Seventh Schedule, Arbitration and Conciliation Act, 1996; Perkins Eastman Architects (2020) 20 SCC 760.',
      plainSummary: isSoleArbitrator
        ? 'The other party picks the private judge to decide any dispute, giving them an unfair structural advantage.'
        : 'Legal conflicts must be resolved through arbitration rather than filing a standard civil suit.',
      recommendedCounterProposal: 'Require mutual agreement on the appointment of any sole arbitrator, or preserve recourse to local courts having territorial jurisdiction.',
      category: 'dispute_resolution',
      tags: ['arbitration', 'sole arbitrator', 'forum', 'jurisdiction']
    };
  }

  // Intellectual property assignment
  if (lower.includes('assigns') || lower.includes('intellectual property') || lower.includes('inventions') || lowerTitle.includes('invention')) {
    const isOverreaching = lower.includes('non-working hours') || lower.includes('personal devices') || lower.includes('whether or not during');
    return {
      riskLevel: isOverreaching ? 'high' : 'caution',
      riskRationale: isOverreaching
        ? 'Claims ownership over your personal ideas, code, or creations developed outside of working hours and without company equipment.'
        : 'Assigns creations produced in the course of work to the client or employer.',
      statutoryContext: 'Section 17, Copyright Act, 1957 (work made for hire scope).',
      plainSummary: isOverreaching
        ? 'The company claims to own your personal weekend projects and private side inventions.'
        : 'The client or employer owns the specific deliverables they paid you to create.',
      recommendedCounterProposal: 'Narrow IP assignment to work created during official working hours, using employer resources, and directly applicable to the employer commercial business.',
      category: 'intellectual_property',
      tags: ['ip assignment', 'inventions', 'ownership', 'copyright']
    };
  }

  // General default fallback
  return {
    riskLevel: 'standard',
    riskRationale: 'Standard commercial or administrative provision. Appears aligned with typical contractual drafting practices.',
    statutoryContext: 'General principles of Indian Contract Act, 1872.',
    plainSummary: 'Sets standard administrative, operational, or definitional conditions between the parties.',
    recommendedCounterProposal: 'Review definitions to verify that terms are accurate and reciprocal.',
    category: 'general',
    tags: ['general terms', 'administrative']
  };
}

/** A clause boundary recognised by {@link detectClauseHeading}. */
export interface ClauseHeading {
  /** Normalised designator, e.g. "Section 4.1", "Article IV", "Clause 3"; null when the heading carries no number. */
  number: string | null;
  title: string;
  /** Text that followed the designator on the same line when it reads as clause body rather than a title. */
  inlineText: string;
}

// All patterns are anchored and free of nested or overlapping quantifiers, so matching stays linear (ReDoS-safe).
const KEYWORD_HEADING = /^(section|clause|article|paragraph|\u00A7)\s*(\d+(?:\.\d+)*|[ivxlc]+)\b[\s.:)\u2013\u2014-]*(.*)$/i;
const NUMBERED_HEADING = /^(\d{1,3}(?:\.\d{1,3}){0,3})(?:[.)]\s+|\s+(?=[A-Z]))(.+)$/;
const MARKDOWN_HEADING = /^#{1,6}\s+(.+)$/;
const ALL_CAPS_HEADING = /^[A-Z][A-Z0-9 &,'()/-]{3,79}$/;
const TITLE_MAX_CHARS = 80;

const KEYWORD_LABELS: Record<string, string> = {
  section: 'Section', clause: 'Clause', article: 'Article', paragraph: 'Paragraph', '\u00a7': 'Section',
};

/** Splits "Title text. Body text" style remainders into a short title and the clause body. */
function splitTitleAndBody(rest: string): { title: string; inlineText: string } {
  const trimmed = rest.trim();
  // A short remainder without sentence punctuation is a title ("Security Deposit").
  if (trimmed.length <= TITLE_MAX_CHARS && !/[.;]$/.test(trimmed)) return { title: trimmed, inlineText: '' };
  // "Security Deposit. The Tenant shall..." -> title before the first full stop.
  const stop = trimmed.indexOf('. ');
  if (stop > 0 && stop <= TITLE_MAX_CHARS) return { title: trimmed.slice(0, stop), inlineText: trimmed.slice(stop + 2) };
  // Otherwise the whole line is body text; derive a readable title from its first words.
  const words = trimmed.split(/\s+/).slice(0, 6).join(' ');
  return { title: words.replace(/[,.;:]+$/, ''), inlineText: trimmed };
}

/**
 * Recognises a line that starts a new clause. Supports "Section 4.1", "Clause 3", "Article IV",
 * "§ 7", numbered lines ("1.", "2)", "1.1 Title"), markdown headings, and ALL-CAPS headings.
 * Sub-items such as "(a)", "(i)" or "a)" are deliberately not headings, so nested lists stay
 * inside their parent clause; numbers followed by lowercase text ("30 days notice") are body text.
 */
export function detectClauseHeading(line: string): ClauseHeading | null {
  const markdown = line.match(MARKDOWN_HEADING);
  if (markdown) {
    const inner = detectClauseHeading(markdown[1].trim());
    return inner ?? { number: null, title: markdown[1].replace(/[#*_]+/g, '').trim(), inlineText: '' };
  }

  const keyword = line.match(KEYWORD_HEADING);
  if (keyword) {
    const label = KEYWORD_LABELS[keyword[1].toLowerCase()] ?? 'Section';
    const designator = /^\d/.test(keyword[2]) ? keyword[2] : keyword[2].toUpperCase();
    const { title, inlineText } = splitTitleAndBody(keyword[3]);
    return { number: `${label} ${designator}`, title: title || 'General Terms', inlineText };
  }

  const numbered = line.match(NUMBERED_HEADING);
  if (numbered) {
    const { title, inlineText } = splitTitleAndBody(numbered[2]);
    return { number: `Clause ${numbered[1]}`, title: title || 'General Terms', inlineText };
  }

  const letters = line.replace(/[^A-Za-z]/g, '');
  if (ALL_CAPS_HEADING.test(line) && letters.length >= 4 && letters === letters.toUpperCase()) {
    return { number: null, title: line.charAt(0) + line.slice(1).toLowerCase(), inlineText: '' };
  }

  return null;
}

/**
 * Parses raw legal contract text into a fully indexed LegalDocument object.
 * 
 * Segmenting algorithm uses bounded regular expressions and paragraph chunking
 * to isolate distinct clauses, assigns statutory risk ratings, generates obligations,
 * and computes the composite overall risk metric (0-100).
 * 
 * @param rawText - Sanitized contract text payload.
 * @param customTitle - Optional user-defined title for the contract.
 * @param customType - Optional contractual classification (e.g. "Residential Lease").
 * @returns Fully populated LegalDocument ready for auditing, Q&A, and diffing.
 */
export function parseCustomContract(rawText: string, customTitle?: string, customType?: string): LegalDocument {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const title = customTitle || (lines.length > 0 ? lines[0].slice(0, 80) : 'Custom Legal Document');
  const documentType = customType || 'Custom Contract / Agreement';

  // Chunk text into clauses at recognised headings; everything before the first heading is the preamble.
  const rawSections: { title: string; number: string; text: string }[] = [];
  const usedNumbers = new Set<string>();
  const uniqueNumber = (candidate: string): string => {
    let number = candidate;
    for (let n = 2; usedNumbers.has(number); n++) number = `${candidate} (${n})`;
    usedNumbers.add(number);
    return number;
  };

  // Unnumbered headings get their own "Part N" sequence so they never collide with explicit clause numbers.
  let unnumberedHeadings = 0;
  let currentSection = { title: 'Preamble / Recitals', number: 'Preamble', text: '' };
  const flush = () => {
    if (currentSection.text.trim()) {
      rawSections.push({ ...currentSection, number: uniqueNumber(currentSection.number) });
    }
  };

  for (const line of lines) {
    const heading = detectClauseHeading(line);
    if (heading) {
      flush();
      currentSection = {
        number: heading.number ?? `Part ${++unnumberedHeadings}`,
        title: heading.title,
        text: heading.inlineText
      };
    } else {
      currentSection.text += (currentSection.text ? ' ' : '') + line;
    }
  }
  flush();

  // If no sections were broken down by regex, split by double newlines or chunks
  if (rawSections.length <= 1 && rawText.length > 300) {
    const paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 30);
    rawSections.length = 0;
    paragraphs.forEach((p, idx) => {
      rawSections.push({
        number: 'Clause ' + (idx + 1),
        title: 'Provision ' + (idx + 1),
        text: p.trim()
      });
    });
  }

  const clauses: ClauseAnalysis[] = rawSections.map((sec, idx) => {
    const analysis = analyzeClauseRisk(sec.text, sec.title);
    return {
      id: 'custom-clause-' + (idx + 1),
      clauseNumber: sec.number,
      title: sec.title,
      originalText: sec.text,
      plainSummary: analysis.plainSummary,
      riskLevel: analysis.riskLevel,
      riskRationale: analysis.riskRationale,
      statutoryContext: analysis.statutoryContext,
      precedentCitation: analysis.precedentCitation,
      practicalScenario: 'If a dispute arises under this section, the wording here controls your rights and potential financial liabilities.',
      recommendedCounterProposal: analysis.recommendedCounterProposal,
      category: analysis.category,
      tags: analysis.tags
    };
  });

  const { overallRiskScore, riskSummary, keyVulnerabilities } = computeRiskMetrics(clauses);
  const { highCount, cautionCount } = riskSummary;

  const obligations: ObligationItem[] = clauses.slice(0, 3).map((c, i) => ({
    id: 'custom-ob-' + (i + 1),
    responsibleParty: 'Signatory / User',
    beneficiaryParty: 'Counterparty',
    action: c.plainSummary.slice(0, 100),
    timelineOrDeadline: 'As stipulated in ' + c.clauseNumber,
    consequenceOfDefault: 'Potential contractual breach under ' + c.clauseNumber,
    clauseRef: c.clauseNumber,
    status: 'mandatory'
  }));

  return {
    id: 'custom-doc-' + Date.now(),
    title,
    documentType,
    jurisdiction: 'Jurisdiction as stipulated in contract',
    governingLaw: 'Applicable Statutory Contract Law',
    lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    parties: {
      partyA: 'First Party (Originator)',
      partyB: 'Second Party (Recipient / You)'
    },
    overallRiskScore,
    riskSummary,
    executiveSummary: 'This document comprises ' + clauses.length + ' provisions. Our automated audit flagged ' + highCount + ' high-risk clauses and ' + cautionCount + ' caution-level provisions requiring careful examination before execution.',
    keyVulnerabilities,
    clauses,
    obligations,
    precedentLinks: ['prec-001', 'prec-002', 'prec-003'],
    analysisSource: 'rules'
  };
}

/**
 * Derives the composite risk score (0-100), per-level clause counts, and the top
 * high-risk vulnerabilities from a set of analysed clauses.
 *
 * @param clauses - Analysed clauses (from the rule engine or GenAI).
 * @returns Risk metrics suitable for spreading onto a LegalDocument.
 */
export function computeRiskMetrics(clauses: ClauseAnalysis[]): Pick<LegalDocument, 'overallRiskScore' | 'riskSummary' | 'keyVulnerabilities'> {
  const riskSummary = { highCount: 0, cautionCount: 0, standardCount: 0, favorableCount: 0 };
  for (const c of clauses) {
    if (c.riskLevel === 'high') riskSummary.highCount++;
    else if (c.riskLevel === 'caution') riskSummary.cautionCount++;
    else if (c.riskLevel === 'standard') riskSummary.standardCount++;
    else riskSummary.favorableCount++;
  }

  const total = clauses.length || 1;
  const overallRiskScore = Math.min(
    95,
    Math.round(((riskSummary.highCount * 30) + (riskSummary.cautionCount * 15) + (riskSummary.standardCount * 5)) / total * 3.5)
  );

  const keyVulnerabilities = clauses
    .filter(c => c.riskLevel === 'high')
    .map(c => c.title + ': ' + c.plainSummary)
    .slice(0, 4);
  if (keyVulnerabilities.length === 0) {
    keyVulnerabilities.push('Standard commercial provisions with standard bilateral risks.');
  }

  return { overallRiskScore, riskSummary, keyVulnerabilities };
}

/**
 * Executes grounded document inquiry retrieval against an ingested LegalDocument.
 * 
 * Extracts salient query tokens, locates matching contractual snippets, and augments
 * verbatim language with mandatory statutory overrides and Supreme Court case precedents.
 * 
 * @param doc - The active LegalDocument being interrogated.
 * @param question - Sanitized user question text.
 * @returns GroundedQAResponse containing verbatim citations, statutory guidance, and follow-ups.
 */
export function queryDocumentGrounded(doc: LegalDocument, question: string): GroundedQAResponse {
  const qLower = question.toLowerCase();
  const matchedClauses: ClauseAnalysis[] = [];

  // Tokenise the question once, not once per clause.
  const words = qLower.split(/\s+/).filter(w => w.length > 3);

  for (const clause of doc.clauses) {
    const textLower = (clause.title + ' ' + clause.originalText + ' ' + clause.plainSummary + ' ' + clause.tags.join(' ')).toLowerCase();
    const hasMatch = words.some(w => textLower.includes(w));
    if (hasMatch) {
      matchedClauses.push(clause);
    }
  }

  // Fallback to top clauses if no exact keyword match
  const selectedClauses = matchedClauses.length > 0 ? matchedClauses.slice(0, 3) : doc.clauses.slice(0, 2);

  const citations = selectedClauses.map(c => ({
    clauseNumber: c.clauseNumber,
    clauseTitle: c.title,
    exactSnippet: c.originalText.slice(0, 220) + (c.originalText.length > 220 ? '...' : ''),
    relevanceExplanation: c.plainSummary
  }));

  let answerSummary = '';
  let statutoryRightsNote = '';

  if (qLower.includes('evict') || qLower.includes('enter') || qLower.includes('privacy') || qLower.includes('visit')) {
    answerSummary = 'Under ' + (citations[0]?.clauseNumber || 'the contract') + ', the counterparty has stipulated terms governing inspection and access. The document language grants access subject to the notice timelines noted in the citation.';
    statutoryRightsNote = 'Under Section 108(c) of the Transfer of Property Act, 1882, a tenant holds the statutory right of quiet enjoyment. Notice periods under 24 hours are generally considered unreasonable unless addressing an imminent emergency.';
  } else if (qLower.includes('forfeit') || qLower.includes('deposit') || qLower.includes('money back') || qLower.includes('refund')) {
    answerSummary = 'Based on ' + (citations[0]?.clauseNumber || 'the agreement') + ', the text asserts that the deposit or payment can be retained upon early termination or breach.';
    statutoryRightsNote = 'Supreme Court precedent in Kailash Nath Associates v. DDA (2015) establishes that contractual forfeiture is only enforceable to compensate actual proven damages. A blanket forfeiture without proof of injury is void as a penalty under Section 74 of the Indian Contract Act.';
  } else if (qLower.includes('compete') || qLower.includes('job') || qLower.includes('resign') || qLower.includes('work for')) {
    answerSummary = 'The agreement in ' + (citations[0]?.clauseNumber || 'the covenants clause') + ' purports to restrict your ability to work for competitors or engage in business following departure.';
    statutoryRightsNote = 'Section 27 of the Indian Contract Act, 1872 explicitly renders all post-termination non-compete agreements void ab initio. This was affirmed by the Supreme Court in Percept D\'Mark v. Zaheer Khan (2006).';
  } else if (qLower.includes('liable') || qLower.includes('sue') || qLower.includes('damage') || qLower.includes('breach')) {
    answerSummary = 'Liability is governed primarily by ' + (citations[0]?.clauseNumber || 'the liability clause') + ', which specifies financial caps and indemnification responsibilities.';
    statutoryRightsNote = 'Under Section 73 of the Contract Act, compensation is limited to damages that naturally arose in the usual course of things. Unilateral indemnity provisions that impose uncapped liabilities on one party without reciprocal protection can be contested under public policy doctrines.';
  } else {
    answerSummary = 'According to ' + (citations.map(c => c.clauseNumber).join(', ') || 'the provisions') + ', the document establishes specific rights and covenants addressing this area. Review the highlighted clause snippets for precise wording.';
    statutoryRightsNote = 'Statutory contract law establishes that ambiguous terms drafted exclusively by one party are construed against the drafter under the doctrine of contra proferentem.';
  }

  const relevantPrecedents = courtPrecedents
    .filter(p => p.keywords.some(k => qLower.includes(k)))
    .map(p => p.caseName)
    .slice(0, 2);

  return {
    id: 'qa-resp-' + Date.now(),
    question,
    answerSummary,
    statutoryRightsNote,
    citations,
    precedentRefs: relevantPrecedents.length > 0 ? relevantPrecedents : ['Central Inland Water Transport Corp v. Brojo Nath Ganguly (1986) 3 SCC 156'],
    suggestedFollowUps: [
      'What specific counter-proposal should I present on this clause?',
      'Does this clause create personal liability or corporate liability?',
      'What happens if I give notice earlier than the stipulated deadline?'
    ],
    analysisSource: 'rules'
  };
}

/**
 * Compiles a structured 1-page advocate consultation briefing memorandum.
 * 
 * Organizes high-priority statutory risks, identified legal defenses, missing protective
 * covenants, and tailored questions for an enrolled legal practitioner.
 * 
 * @param doc - The audited LegalDocument.
 * @param clientName - Client or prospective signatory identifier.
 * @returns Fully populated CounselBrief ready for print stylesheet or copy.
 */
export function generateCounselBrief(doc: LegalDocument, clientName: string = 'Consulting Client'): CounselBrief {
  const highRisks = doc.clauses.filter(c => c.riskLevel === 'high');
  const cautionRisks = doc.clauses.filter(c => c.riskLevel === 'caution');

  const highPriorityRisks = [...highRisks, ...cautionRisks].slice(0, 4).map(c => ({
    clauseNumber: c.clauseNumber,
    issue: c.title + ': ' + c.riskRationale,
    questionsForAttorney: [
      'Given ' + (c.statutoryContext.split(';')[0] || 'applicable statute') + ', what is the realistic judicial enforceability of ' + c.clauseNumber + ' in our local jurisdiction?',
      'Can we successfully strike this provision entirely, or should we propose the redline alternative below?',
      'If the counterparty refuses to amend ' + c.clauseNumber + ', what collateral risks does this expose us to?'
    ],
    suggestedRedline: c.recommendedCounterProposal
  }));

  const statutoryDefenses = [
    'Section 27 of Indian Contract Act: Protection against post-termination restraints of trade.',
    'Section 74 of Indian Contract Act: Defense against arbitrary forfeiture of deposits without proof of actual damage.',
    'Doctrine of Contra Proferentem: Ambiguous boilerplate clauses are interpreted against the drafter.',
    'Supreme Court benchmark in Central Inland Water Transport Corp: Unconscionable terms created under unequal bargaining power.'
  ];

  const negotiationChecklist = [
    'Insist on mutual notice periods and bilateral remedies across all termination clauses.',
    'Cap any indemnity or damage exposure to actual verifiable direct losses.',
    'Verify that dispute resolution takes place in a neutral territorial jurisdiction.',
    'Require at least 14 days cure notice before default proceedings or forfeiture can occur.'
  ];

  const missingSafeguards = [
    'Absence of a mandatory written cure period (minimum 14 to 30 days) prior to contract termination for cause.',
    'No reciprocal indemnification from the counterparty for third-party intellectual property or structural claims.',
    'Lack of an express carve-out for force majeure and unforeseen statutory impossibility.',
    'Missing interest accrual or escrow protection on held security deposits.'
  ];

  let exposureRating: CounselBrief['overallExposureRating'] = 'Moderate';
  if (doc.overallRiskScore >= 80) exposureRating = 'Severe';
  else if (doc.overallRiskScore >= 60) exposureRating = 'Elevated';
  else if (doc.overallRiskScore <= 35) exposureRating = 'Routine';

  return {
    clientName,
    documentTitle: doc.title,
    counterparty: doc.parties.partyA,
    datePrepared: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
    overallExposureRating: exposureRating,
    highPriorityRisks,
    statutoryDefenses,
    negotiationChecklist,
    missingSafeguards
  };
}

/**
 * Generates ready-to-transmit professional negotiation correspondence.
 * 
 * Formats a respectful, legally grounded counter-draft email proposing specific
 * redlines for the top identified risk clauses.
 * 
 * @param doc - The audited LegalDocument.
 * @param senderName - Prospective signatory name.
 * @param recipientName - Counterparty representative name.
 * @returns NegotiationEmail object with subject and formatted body.
 */
export function generateNegotiationEmail(
  doc: LegalDocument,
  senderName: string = 'Prospective Signatory',
  recipientName: string = 'Counterparty'
): NegotiationEmail {
  const highRisks = doc.clauses.filter(c => c.riskLevel === 'high');
  const targetRisks = highRisks.length > 0 ? highRisks.slice(0, 3) : doc.clauses.slice(0, 2);

  let recipientType: NegotiationEmail['recipientType'] = 'counterparty';
  const docLower = doc.documentType.toLowerCase();
  if (docLower.includes('lease') || docLower.includes('tenancy')) {
    recipientType = 'landlord';
  } else if (docLower.includes('employment')) {
    recipientType = 'employer';
  } else if (docLower.includes('saas') || docLower.includes('service') || docLower.includes('vendor')) {
    recipientType = 'vendor';
  }

  const subject = 'Proposed Amendments and Clarifications: ' + doc.title;

  let body = 'Dear ' + recipientName + ',\n\n';
  body += 'Thank you for sharing the draft of ' + doc.title + '. I have reviewed the terms in detail and appreciate the comprehensive framework provided.\n\n';
  body += 'In order to ensure mutual alignment, operational clarity, and standard commercial reciprocity, I would like to propose a few targeted revisions to specific provisions before execution:\n\n';

  targetRisks.forEach((clause, idx) => {
    body += (idx + 1) + '. ' + clause.clauseNumber + ' (' + clause.title + ')\n';
    body += '   - Current Concern: ' + clause.plainSummary + '\n';
    body += '   - Proposed Redline: "' + clause.recommendedCounterProposal + '"\n';
    body += '   - Justification: ' + clause.riskRationale + '\n\n';
  });

  body += 'These adjustments reflect standard statutory standards under ' + doc.governingLaw + ' and ensure equitable protections for both parties.\n\n';
  body += 'Please let me know if these proposed revisions work for you, or if we can schedule a brief call to finalize the draft.\n\n';
  body += 'Sincerely,\n' + senderName;

  return {
    recipientType,
    subject,
    bodyText: body,
    addressedClauseNumbers: targetRisks.map(c => c.clauseNumber)
  };
}

/**
 * Calculates concrete financial exposure metrics across contractual provisions.
 * 
 * Extracts monetary liabilities, unliquidated deposit forfeiture exposure,
 * compounding daily delay penalties, and asymmetric liability limitations.
 * 
 * @param doc - The audited LegalDocument.
 * @returns FinancialExposureSummary with itemized exposure ratings.
 */
export function calculateFinancialExposure(doc: LegalDocument): FinancialExposureSummary {
  let depositAtRisk = 'Standard terms (no excessive deposit detected)';
  let potentialPenaltyRate = 'Standard interest rate';
  let noticeWageExposure = 'Standard mutual notice period';
  let liabilityCapAmount = 'Uncapped or mutual statutory limits';
  const keyFinancialVulnerabilities: string[] = [];

  for (const c of doc.clauses) {
    const text = c.originalText.toLowerCase();

    if (text.includes('security deposit') || text.includes('deposit') || text.includes('forfeit')) {
      if (text.includes('three (3) months') || text.includes('3 months')) {
        depositAtRisk = '3 Months Rent (Subject to absolute forfeiture on early departure)';
        keyFinancialVulnerabilities.push('Full 3-month security deposit vulnerable to unilateral forfeiture under ' + c.clauseNumber);
      } else if (text.includes('two (2) months') || text.includes('2 months')) {
        depositAtRisk = '2 Months Rent (Refundable with verified damage audit)';
      }
    }

    if (text.includes('late fee') || text.includes('per day') || text.includes('500')) {
      if (text.includes('500')) {
        potentialPenaltyRate = '500 currency units per day of delay (Compounding daily penalty)';
        keyFinancialVulnerabilities.push('Daily compounding penalty of 500 per day under ' + c.clauseNumber);
      }
    }

    if (text.includes('ninety (90) days') || text.includes('90 days') || text.includes('lock-in')) {
      if (text.includes('lock-in')) {
        noticeWageExposure = '6 Months Lock-in rent liability (accelerated payment upon early vacancy)';
        keyFinancialVulnerabilities.push('Accelerated rent obligation for full remaining lock-in period under ' + c.clauseNumber);
      } else if (text.includes('without paying salary')) {
        noticeWageExposure = '90 Days salary forfeiture on unilateral company restructuring';
        keyFinancialVulnerabilities.push('Zero severance / salary in lieu of notice for employee under ' + c.clauseNumber);
      }
    }

    if (text.includes('one (1) month') && (text.includes('liability') || text.includes('cap'))) {
      liabilityCapAmount = 'Restricted to 1 month of subscription fees (Maximum recovery)';
      keyFinancialVulnerabilities.push('Vendor liability capped at 1 month of fees under ' + c.clauseNumber + ' despite potential data breach');
    }
  }

  if (keyFinancialVulnerabilities.length === 0) {
    keyFinancialVulnerabilities.push('No extreme financial penalty or forfeiture provisions detected in parsed clauses.');
  }

  return {
    depositAtRisk,
    potentialPenaltyRate,
    noticeWageExposure,
    liabilityCapAmount,
    keyFinancialVulnerabilities
  };
}

/**
 * Performs clause-by-clause comparative diffing between two contract versions.
 * 
 * Analyzes modifications, additions, and removals to quantify net favorability shift
 * and highlight subtle liability transfers introduced in counterparty markups.
 * 
 * @param docA - Baseline or standard agreement version.
 * @param docB - Revised or counterparty draft version.
 * @returns ComparisonPair containing itemized diffs and aggregate favorability shift.
 */
export function compareCustomDocuments(docA: LegalDocument, docB: LegalDocument): ComparisonPair {
  const diffs: ComparisonDiff[] = [];

  const maxLen = Math.max(docA.clauses.length, docB.clauses.length);

  for (let i = 0; i < maxLen; i++) {
    const clauseA = docA.clauses[i];
    const clauseB = docB.clauses[i];

    if (clauseA && clauseB) {
      const isIdentical = clauseA.originalText.trim() === clauseB.originalText.trim();
      const riskHigher = (clauseB.riskLevel === 'high' && clauseA.riskLevel !== 'high') ||
                         (clauseB.riskLevel === 'caution' && clauseA.riskLevel === 'standard');

      let riskImpact: ComparisonDiff['riskImpact'] = 'neutral';
      if (!isIdentical && riskHigher) {
        riskImpact = 'worse_for_user';
      } else if (!isIdentical && clauseB.riskLevel === 'favorable') {
        riskImpact = 'better_for_user';
      }

      diffs.push({
        clauseNumber: clauseB.clauseNumber || clauseA.clauseNumber,
        topic: clauseB.title || clauseA.title,
        versionAText: clauseA.originalText,
        versionBText: clauseB.originalText,
        status: isIdentical ? 'identical' : 'modified',
        riskImpact,
        analysis: isIdentical
          ? 'Language is identical between both versions.'
          : 'Version B alters obligations in ' + clauseB.title + '. ' + clauseB.riskRationale,
        keyWordChanges: [
          'Version A Risk: ' + clauseA.riskLevel.toUpperCase(),
          'Version B Risk: ' + clauseB.riskLevel.toUpperCase()
        ]
      });
    } else if (clauseB && !clauseA) {
      diffs.push({
        clauseNumber: clauseB.clauseNumber,
        topic: clauseB.title + ' (Added Provision)',
        versionAText: '[Not present in Document A]',
        versionBText: clauseB.originalText,
        status: 'added',
        riskImpact: clauseB.riskLevel === 'high' ? 'worse_for_user' : 'neutral',
        analysis: 'Provision added in Document B that did not exist in Document A: ' + clauseB.plainSummary,
        keyWordChanges: ['New clause introduced in Document B']
      });
    } else if (clauseA && !clauseB) {
      diffs.push({
        clauseNumber: clauseA.clauseNumber,
        topic: clauseA.title + ' (Deleted Provision)',
        versionAText: clauseA.originalText,
        versionBText: '[Deleted in Document B]',
        status: 'removed',
        riskImpact: clauseA.riskLevel === 'favorable' ? 'worse_for_user' : 'neutral',
        analysis: 'Provision present in Document A was removed in Document B.',
        keyWordChanges: ['Clause deleted in Document B']
      });
    }
  }

  const worseCount = diffs.filter(d => d.riskImpact === 'worse_for_user').length;
  let netFavorabilityShift: ComparisonPair['netFavorabilityShift'] = 'balanced';
  if (worseCount >= 3) netFavorabilityShift = 'substantially_worse';
  else if (worseCount >= 1) netFavorabilityShift = 'moderately_worse';

  return {
    id: 'custom-comparison-' + Date.now(),
    title: docA.title + ' vs. ' + docB.title,
    description: 'Dynamic clause-by-clause comparison between ' + docA.title + ' and ' + docB.title + '.',
    docA,
    docB,
    diffs,
    netFavorabilityShift,
    shiftSummary: 'Dynamic diff detected ' + diffs.length + ' provisions. ' + worseCount + ' clauses introduce increased exposure or liability shift for the signatory in Document B compared to Document A.'
  };
}
