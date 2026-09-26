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

  const clauseRegex = /^(?:section|clause|article|paragraph|\u00A7)\s*([0-9]+(?:\.[0-9]+)*)[.:\-\s]+(.*)$/i;
  const numRegex = /^([0-9]+(?:\.[0-9]+)*)[.:\-\s]+(.*)$/;

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

export function generateNegotiationEmail(
  doc: LegalDocument,
  senderName: string = 'Prospective Signatory',
  recipientName: string = 'Counterparty'
): import('../types/legal').NegotiationEmail {
  const highRisks = doc.clauses.filter(c => c.riskLevel === 'high');
  const targetRisks = highRisks.length > 0 ? highRisks.slice(0, 3) : doc.clauses.slice(0, 2);

  let recipientType: import('../types/legal').NegotiationEmail['recipientType'] = 'counterparty';
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

export function calculateFinancialExposure(doc: LegalDocument): import('../types/legal').FinancialExposureSummary {
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

export function compareCustomDocuments(docA: LegalDocument, docB: LegalDocument): import('../types/legal').ComparisonPair {
  const diffs: import('../types/legal').ComparisonDiff[] = [];

  const maxLen = Math.max(docA.clauses.length, docB.clauses.length);

  for (let i = 0; i < maxLen; i++) {
    const clauseA = docA.clauses[i];
    const clauseB = docB.clauses[i];

    if (clauseA && clauseB) {
      const isIdentical = clauseA.originalText.trim() === clauseB.originalText.trim();
      const riskHigher = (clauseB.riskLevel === 'high' && clauseA.riskLevel !== 'high') ||
                         (clauseB.riskLevel === 'caution' && clauseA.riskLevel === 'standard');

      let riskImpact: import('../types/legal').ComparisonDiff['riskImpact'] = 'neutral';
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
  let netFavorabilityShift: import('../types/legal').ComparisonPair['netFavorabilityShift'] = 'balanced';
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
