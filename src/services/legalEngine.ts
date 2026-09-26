import type { LegalDocument, ClauseAnalysis, RiskLevel, ObligationItem, GroundedQAResponse, CounselBrief } from '../types/legal';
import { courtPrecedents } from '../data/courtPrecedents';

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

  // Non-compete and restraint of trade
  if (lower.includes('non-compete') || lower.includes('restraint') || (lower.includes('competition') && lower.includes('month')) || lowerTitle.includes('competition')) {
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
    const isAsymmetric = lower.includes('sole discretion') || (lower.includes('without paying') && lower.includes('notice'));
    return {
      riskLevel: isAsymmetric ? 'high' : 'caution',
      riskRationale: isAsymmetric
        ? 'Grants one party asymmetric power to cancel or walk away while binding the other party to strict financial penalties.'
        : 'Outlines how and when either side can end the contract. Requires scrutiny of notice periods and wind-down procedures.',
      statutoryContext: 'Central Inland Water Transport Corp v. Brojo Nath Ganguly (1986) 3 SCC 156.',
      precedentCitation: 'Central Inland Water Transport Corp v. Brojo Nath Ganguly (1986) 3 SCC 156',
      plainSummary: isAsymmetric
        ? 'They can terminate you on a whim without compensation, while you face hefty penalties if you leave.'
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

export function parseCustomContract(rawText: string, customTitle?: string, customType?: string): LegalDocument {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const title = customTitle || (lines.length > 0 ? lines[0].slice(0, 80) : 'Custom Legal Document');
  const documentType = customType || 'Custom Contract / Agreement';

  // Chunk text into sections or clauses
  const rawSections: { title: string; number: string; text: string }[] = [];
  let currentSection = {
    title: 'Preamble / Recitals',
    number: 'Clause 1',
    text: ''
  };

  const clauseRegex = /^(?:section|clause|article|paragraph|\u00A7)\s*([0-9]+(?:\.[0-9]+)*)[:\.\-\s]+(.*)$/i;
  const numRegex = /^([0-9]+(?:\.[0-9]+)*)[:\.\-\s]+(.*)$/;

  for (const line of lines) {
    const clauseMatch = line.match(clauseRegex);
    const numMatch = line.match(numRegex);

    if (clauseMatch) {
      if (currentSection.text.trim()) {
        rawSections.push({ ...currentSection });
      }
      currentSection = {
        number: 'Section ' + clauseMatch[1],
        title: clauseMatch[2].trim() || 'General Terms',
        text: ''
      };
    } else if (numMatch && numMatch[1].length <= 5 && line.length < 100) {
      if (currentSection.text.trim()) {
        rawSections.push({ ...currentSection });
      }
      currentSection = {
        number: 'Clause ' + numMatch[1],
        title: numMatch[2].trim() || 'General Terms',
        text: ''
      };
    } else {
      currentSection.text += (currentSection.text ? ' ' : '') + line;
    }
  }

  if (currentSection.text.trim()) {
    rawSections.push(currentSection);
  }

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

  const highCount = clauses.filter(c => c.riskLevel === 'high').length;
  const cautionCount = clauses.filter(c => c.riskLevel === 'caution').length;
  const standardCount = clauses.filter(c => c.riskLevel === 'standard').length;
  const favorableCount = clauses.filter(c => c.riskLevel === 'favorable').length;

  const total = clauses.length || 1;
  const overallRiskScore = Math.min(95, Math.round(((highCount * 30) + (cautionCount * 15) + (standardCount * 5)) / total * 3.5));

  const keyVulnerabilities: string[] = clauses
    .filter(c => c.riskLevel === 'high')
    .map(c => c.title + ': ' + c.plainSummary)
    .slice(0, 4);

  if (keyVulnerabilities.length === 0) {
    keyVulnerabilities.push('Standard commercial provisions with standard bilateral risks.');
  }

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
    riskSummary: {
      highCount,
      cautionCount,
      standardCount,
      favorableCount
    },
    executiveSummary: 'This document comprises ' + clauses.length + ' provisions. Our automated audit flagged ' + highCount + ' high-risk clauses and ' + cautionCount + ' caution-level provisions requiring careful examination before execution.',
    keyVulnerabilities,
    clauses,
    obligations,
    precedentLinks: ['prec-001', 'prec-002', 'prec-003']
  };
}

export function queryDocumentGrounded(doc: LegalDocument, question: string): GroundedQAResponse {
  const qLower = question.toLowerCase();
  const matchedClauses: ClauseAnalysis[] = [];

  for (const clause of doc.clauses) {
    const textLower = (clause.title + ' ' + clause.originalText + ' ' + clause.plainSummary + ' ' + clause.tags.join(' ')).toLowerCase();
    const words = qLower.split(/\s+/).filter(w => w.length > 3);
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
    ]
  };
}

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
