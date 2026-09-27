import { describe, it, expect } from 'vitest';
import {
  analyzeClauseRisk,
  parseCustomContract,
  detectClauseHeading,
  queryDocumentGrounded,
  compareCustomDocuments,
  calculateFinancialExposure,
  generateNegotiationEmail
} from './legalEngine';
import { sampleContracts } from '../data/sampleContracts';

describe('Legal Intelligence Engine - Clause Risk Analysis', () => {
  it('identifies non-compete restraint of trade as high risk with Section 27 citation', () => {
    const text = 'Employee shall not engage in or advise any business in competition with Company for twenty-four (24) months after termination anywhere in India.';
    const result = analyzeClauseRisk(text, 'Non-Compete Covenant');

    expect(result.riskLevel).toBe('high');
    expect(result.statutoryContext).toContain('Section 27');
    expect(result.precedentCitation).toContain('Percept D\'Mark');
    expect(result.category).toBe('covenants');
    expect(result.recommendedCounterProposal).toBeDefined();
  });

  it('flags unilateral deposit forfeiture as high risk under Section 74', () => {
    const text = 'If Tenant vacates early, the security deposit shall be absolutely forfeited as liquidated damages without proof of loss.';
    const result = analyzeClauseRisk(text, 'Security Deposit');

    expect(result.riskLevel).toBe('high');
    expect(result.statutoryContext).toContain('Section 74');
    expect(result.precedentCitation).toContain('Kailash Nath Associates');
    expect(result.category).toBe('financial');
  });

  it('detects ultra-low liability cap of 1 month as high risk', () => {
    const text = 'Under no circumstances shall Vendor cumulative liability exceed fees paid in the one (1) month prior to the event.';
    const result = analyzeClauseRisk(text, 'Limitation of Liability');

    expect(result.riskLevel).toBe('high');
    expect(result.category).toBe('liability');
    expect(result.plainSummary).toContain('1 month');
  });

  it('categorizes reciprocal standard terms with standard risk', () => {
    const text = 'This agreement constitutes the entire understanding between the parties with respect to the subject matter hereof.';
    const result = analyzeClauseRisk(text, 'Entire Agreement');

    expect(result.riskLevel).toBe('standard');
    expect(result.category).toBe('general');
  });
});

describe('Legal Intelligence Engine - Document Parsing & Scoring', () => {
  it('parses raw text with numbered sections into structured clauses', () => {
    const rawText = `Section 1. Grant of License
Licensor grants Customer a non-exclusive license.

Section 2. Liquidated Damages & Forfeiture
Customer deposit shall stand absolutely forfeited upon any breach.

Section 3. Governing Law
This contract is governed by Indian Law.`;

    const doc = parseCustomContract(rawText, 'Test Software License', 'Software Agreement');

    expect(doc.title).toBe('Test Software License');
    expect(doc.clauses.length).toBe(3);
    expect(doc.clauses[1].riskLevel).toBe('high');
    expect(doc.riskSummary.highCount).toBeGreaterThanOrEqual(1);
    expect(doc.overallRiskScore).toBeGreaterThan(0);
  });

  it('handles paragraph chunking when no explicit section regex matches', () => {
    const rawParagraphs = `This is the first long paragraph that describes the parties and recitals for the commercial transaction between the parties in detail.

This is the second long paragraph establishing that all security deposits and advances shall be forfeited immediately if any default occurs.

This is the third paragraph that stipulates governing jurisdiction under local state court laws and procedures.`;

    const doc = parseCustomContract(rawParagraphs, 'Unstructured Contract');
    expect(doc.clauses.length).toBe(3);
    expect(doc.clauses[0].clauseNumber).toBe('Clause 1');
  });
});

describe('Legal Intelligence Engine - Tenancy and Covenant Heuristics', () => {
  it('flags landlord entry on short or verbal notice as a quiet-enjoyment risk', () => {
    const result = analyzeClauseRisk('The Landlord may enter the flat at any time with 2 hours verbal notice.', 'Entry');
    expect(result.riskLevel).toBe('caution');
    expect(result.statutoryContext).toContain('Section 108');
  });

  it('treats entry after 24 hours written notice as standard', () => {
    const result = analyzeClauseRisk('The Landlord may enter the premises after giving 48 hours written notice.', 'Inspection');
    expect(result.riskLevel).toBe('standard');
  });

  it('recognises a post-exit business ban as a void restraint of trade', () => {
    const result = analyzeClauseRisk('The Tenant shall not run any home business in this city for 2 years after leaving.', 'Non-Compete');
    expect(result.riskLevel).toBe('high');
    expect(result.statutoryContext).toContain('Section 27');
  });

  it('does not treat intellectual property access as a right-of-entry clause', () => {
    const result = analyzeClauseRisk('Consultant shall have access to intellectual property owned by the Company.', 'Access to Materials');
    expect(result.tags).not.toContain('right of entry');
  });
});

describe('Legal Intelligence Engine - Clause Segmentation', () => {
  it('recognises the common heading styles used in Indian contracts', () => {
    expect(detectClauseHeading('Section 4.1: Security Deposit')).toMatchObject({ number: 'Section 4.1', title: 'Security Deposit' });
    expect(detectClauseHeading('ARTICLE IV - TERMINATION')).toMatchObject({ number: 'Article IV' });
    expect(detectClauseHeading('§ 7 Governing Law')).toMatchObject({ number: 'Section 7', title: 'Governing Law' });
    expect(detectClauseHeading('2) Rent and Escalation')).toMatchObject({ number: 'Clause 2', title: 'Rent and Escalation' });
    expect(detectClauseHeading('1.1 Grant of Licence')).toMatchObject({ number: 'Clause 1.1', title: 'Grant of Licence' });
    expect(detectClauseHeading('## Section 9. Arbitration')).toMatchObject({ number: 'Section 9', title: 'Arbitration' });
    expect(detectClauseHeading('## Dispute Resolution')).toMatchObject({ number: null, title: 'Dispute Resolution' });
    expect(detectClauseHeading('INDEMNITY AND LIABILITY')).toMatchObject({ number: null, title: 'Indemnity and liability' });
  });

  it('does not mistake body text or sub-items for headings', () => {
    expect(detectClauseHeading('30 days notice is required before vacating.')).toBeNull();
    expect(detectClauseHeading('(a) the Tenant shall pay rent monthly;')).toBeNull();
    expect(detectClauseHeading('(ii) utilities are borne by the Tenant.')).toBeNull();
    expect(detectClauseHeading('The Lessee shall maintain the premises.')).toBeNull();
    expect(detectClauseHeading('OK')).toBeNull();
  });

  it('splits a numbered sentence into a short title and its clause body', () => {
    const heading = detectClauseHeading('3. Security Deposit. The Landlord may forfeit the entire deposit on early exit.');
    expect(heading).toMatchObject({ number: 'Clause 3', title: 'Security Deposit' });
    expect(heading?.inlineText).toBe('The Landlord may forfeit the entire deposit on early exit.');
  });

  it('keeps nested sub-items inside their parent clause and numbers the preamble separately', () => {
    const doc = parseCustomContract(`RENTAL AGREEMENT
This agreement is made between the Landlord and the Tenant.

1. Rent
(a) Rent of Rs 30,000 is payable on the 5th of each month;
(b) 30 days notice is required for any revision.

2. Security Deposit. The Landlord may forfeit the entire deposit without proof of damage.

ARTICLE III - GOVERNING LAW
This agreement is governed by the laws of India.`, 'Flat Lease');

    expect(doc.clauses.map((c) => c.clauseNumber)).toEqual(['Part 1', 'Clause 1', 'Clause 2', 'Article III']);
    expect(doc.clauses[0].title).toBe('Rental agreement');
    const rent = doc.clauses[1];
    expect(rent.title).toBe('Rent');
    expect(rent.originalText).toContain('(a) Rent of Rs 30,000');
    expect(rent.originalText).toContain('(b) 30 days notice');
    expect(doc.clauses[2].riskLevel).toBe('high');
  });

  it('gives every clause a unique number so AI insights map back unambiguously', () => {
    const lines = ['Section 1. Term', 'One year.', 'Section 1. Renewal', 'Automatic renewal applies.'];
    const doc = parseCustomContract(lines.join(String.fromCharCode(10)), 'Duplicate numbering');
    const numbers = doc.clauses.map((c) => c.clauseNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
  });
});

describe('Legal Intelligence Engine - Grounded Q&A', () => {
  const leaseDoc = sampleContracts[0];

  it('grounds answers with exact clause citations and statutory override notes', () => {
    const response = queryDocumentGrounded(leaseDoc, 'Can the landlord enter without notice?');

    expect(response.citations.length).toBeGreaterThan(0);
    expect(response.citations[0].clauseNumber).toBeDefined();
    expect(response.citations[0].exactSnippet).toBeDefined();
    expect(response.statutoryRightsNote).toContain('Transfer of Property Act');
  });

  it('retrieves relevant case law for forfeiture inquiries', () => {
    const response = queryDocumentGrounded(leaseDoc, 'What happens to my deposit if I leave early?');

    expect(response.answerSummary).toBeDefined();
    expect(response.statutoryRightsNote).toContain('Section 74');
  });
});

describe('Legal Intelligence Engine - Dynamic Comparator', () => {
  it('correctly compares two custom documents and detects modifications and additions', () => {
    const docA = parseCustomContract(
      'Section 1. Notice\nEither party may terminate with thirty (30) days notice.',
      'Baseline Version'
    );
    const docB = parseCustomContract(
      'Section 1. Notice\nCompany may terminate immediately without notice.\n\nSection 2. Non-Compete\nEmployee shall not compete for 24 months.',
      'Revised Version'
    );

    const comparison = compareCustomDocuments(docA, docB);

    expect(comparison.diffs.length).toBe(2);
    expect(comparison.diffs[0].status).toBe('modified');
    expect(comparison.diffs[1].status).toBe('added');
    expect(comparison.diffs[0].riskImpact).toBe('worse_for_user');
  });
});

describe('Legal Intelligence Engine - Financial Exposure & Negotiation Email', () => {
  const leaseDoc = sampleContracts[0];

  it('calculates financial vulnerabilities from lease terms', () => {
    const exposure = calculateFinancialExposure(leaseDoc);

    expect(exposure.depositAtRisk).toContain('3 Months');
    expect(exposure.potentialPenaltyRate).toContain('500');
    expect(exposure.keyFinancialVulnerabilities.length).toBeGreaterThan(0);
  });

  it('generates a professional, citation-backed negotiation email', () => {
    const email = generateNegotiationEmail(leaseDoc, 'Jane Tenant', 'Apex Property Manager');

    expect(email.subject).toContain('Proposed Amendments');
    expect(email.bodyText).toContain('Dear Apex Property Manager');
    expect(email.bodyText).toContain('Jane Tenant');
    expect(email.addressedClauseNumbers.length).toBeGreaterThan(0);
    expect(email.recipientType).toBe('landlord');
  });
});
