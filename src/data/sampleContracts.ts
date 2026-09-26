import type { LegalDocument, ComparisonPair } from '../types/legal';

export const sampleContracts: LegalDocument[] = [
  {
    id: 'contract-lease-residential',
    title: 'Standard Residential Tenancy Agreement (Landlord-Drafted)',
    documentType: 'Tenancy & Lease Agreement',
    jurisdiction: 'State Jurisdiction (Rent Control & Transfer of Property Act)',
    governingLaw: 'Transfer of Property Act, 1882 & Model Tenancy Framework',
    lastUpdated: 'October 2024',
    parties: {
      partyA: 'Apex Realty Management LLC (Landlord)',
      partyB: 'Individual Resident / Lessee (Tenant)'
    },
    overallRiskScore: 78,
    riskSummary: {
      highCount: 3,
      cautionCount: 4,
      standardCount: 4,
      favorableCount: 1
    },
    executiveSummary: 'This tenancy agreement is heavily tilted in favor of the lessor. It contains unilateral security deposit forfeiture provisions, grants the landlord unrestricted entry with only 4 hours informal notice, shifts structural and major plumbing maintenance burdens entirely to the lessee, and enforces automatic 15 percent annual rent escalations alongside tenant-funded legal defense indemnities.',
    keyVulnerabilities: [
      'Unrestricted forfeiture of full security deposit without third-party damage assessment',
      'Overbroad landlord entry rights with 4 hours verbal notice',
      'Tenant indemnification of landlord for building-wide structural or water damage',
      'Waiver of standard 30-day statutory notice for termination upon minor delay'
    ],
    precedentLinks: ['prec-003', 'prec-004', 'prec-008'],
    clauses: [
      {
        id: 'lease-c1',
        clauseNumber: 'Section 1.1',
        title: 'Grant of Tenancy and Demised Premises',
        originalText: 'The Landlord hereby demises unto the Tenant Apartment Unit 402, Oakwood Enclave, together with dedicated parking bay P-14, for a fixed term of eleven (11) calendar months commencing on the Effective Date.',
        plainSummary: 'Grants you exclusive occupancy of Apartment 402 and parking bay P-14 for exactly 11 months.',
        riskLevel: 'standard',
        riskRationale: 'Standard fixed-term tenancy description. Eleven-month terms are customary to prevent mandatory registration complexities under local stamp duty statutes.',
        statutoryContext: 'Section 105 and 107 of Transfer of Property Act, 1882 regarding leases of immovable property.',
        practicalScenario: 'Your occupancy rights begin on day one and expire precisely at month 11 unless formally renewed in writing.',
        recommendedCounterProposal: 'Standard wording is acceptable. Ensure specific inclusion of all fixtures, fittings, and dedicated parking identifiers.',
        category: 'general',
        tags: ['term', 'demised premises', 'occupancy']
      },
      {
        id: 'lease-c2',
        clauseNumber: 'Section 2.3',
        title: 'Security Deposit & Absolute Forfeiture',
        originalText: 'Tenant shall deposit a sum equivalent to three (3) months rent as interest-free security deposit. In the event Tenant vacates the premises prior to the completion of the initial eleven (11) month term, or breaches any house rule, the entire security deposit shall stand absolutely forfeited to the Landlord as liquidated damages without requirement of proof of actual loss or judicial intervention.',
        plainSummary: 'If you leave early or violate any house rule, the landlord automatically keeps your entire three-month security deposit, even if they suffered zero financial loss.',
        riskLevel: 'high',
        riskRationale: 'Blanket forfeiture clauses without proof of actual damage are legally punitive. Under Indian Contract Act Section 74 and Supreme Court precedent (Kailash Nath Associates), damages can only compensate actual demonstrated losses.',
        statutoryContext: 'Section 74 of Indian Contract Act, 1872; Kailash Nath Associates v. DDA (2015) 4 SCC 136.',
        precedentCitation: 'Kailash Nath Associates v. DDA (2015) 4 SCC 136',
        practicalScenario: 'If you need to relocate for a job transfer after month 8 with 30 days notice, the landlord can confiscate your entire deposit under this clause.',
        recommendedCounterProposal: 'Replace with: "Security deposit shall be refunded within fourteen (14) days of handover, subject only to deductions for unpaid utility charges and substantiated physical damage beyond reasonable wear and tear."',
        category: 'financial',
        tags: ['security deposit', 'forfeiture', 'penalty', 'damages']
      },
      {
        id: 'lease-c3',
        clauseNumber: 'Section 3.1',
        title: 'Rent Escalation and Late Charges',
        originalText: 'Monthly rent shall be payable in advance on or before the 1st day of each calendar month. In case of delay beyond the 3rd day, Tenant shall pay a late fee penalty of 500 currency units per day of delay. Upon renewal, rent shall automatically escalate by 15 percent over the preceding base rent.',
        plainSummary: 'Rent is due on the 1st. Missing day 3 triggers a 500/day penalty. Renewal incurs an automatic 15% rent hike.',
        riskLevel: 'caution',
        riskRationale: 'A per-day fixed penalty of 500 represents an exorbitant annualized interest rate. 15% annual escalation exceeds standard metropolitan inflation benchmarks (typically 5 to 8 percent).',
        statutoryContext: 'Usurious Loans Act, 1918 and statutory reasonableness standards under Section 73 Contract Act.',
        practicalScenario: 'A bank transfer delay over a holiday weekend could rack up thousands in arbitrary penalties within a week.',
        recommendedCounterProposal: 'Negotiate a grace period until the 7th or 10th of the month. Restrict late fee to simple interest at 12 percent per annum or a nominal flat fee of 200 per month. Cap renewal escalation at 5 to 7 percent.',
        category: 'financial',
        tags: ['rent', 'late fee', 'escalation', 'due date']
      },
      {
        id: 'lease-c4',
        clauseNumber: 'Section 4.2',
        title: 'Right of Entry and Immediate Inspection',
        originalText: 'The Landlord or its authorized agents reserve the right to enter the demised premises at any hour between 07:00 and 22:00 upon giving four (4) hours verbal notice via telephone or messaging application, or without notice in any situation deemed urgent by Landlord, for inspection, repairs, or showing to prospective buyers or subsequent tenants.',
        plainSummary: 'Landlord can enter your home anytime from 7 AM to 10 PM with just 4 hours notice via text or phone call, or with zero notice if they claim urgency.',
        riskLevel: 'high',
        riskRationale: 'Severely breaches the tenant statutory covenant of quiet enjoyment. 4 hours notice is inadequate to guarantee privacy or accommodate working schedules.',
        statutoryContext: 'Section 108(c) of Transfer of Property Act, 1882 (implied covenant for quiet possession).',
        practicalScenario: 'The landlord could demand entry on a Saturday morning with a text sent at 5 AM, disrupting your family privacy.',
        recommendedCounterProposal: 'Require at least twenty-four (24) or forty-eight (48) hours advance written notice, restrict entry to normal business hours, and require tenant accompaniment.',
        category: 'covenants',
        tags: ['quiet enjoyment', 'inspection', 'privacy', 'landlord entry']
      },
      {
        id: 'lease-c5',
        clauseNumber: 'Section 5.4',
        title: 'Maintenance, Repairs, and Structural Liabilities',
        originalText: 'Tenant accepts the premises in as-is condition. Tenant shall be solely responsible for all maintenance and repairs whatsoever, whether minor, major, internal, electrical, plumbing, sanitary, or structural, arising during the tenancy term at Tenant sole cost.',
        plainSummary: 'You are forced to pay for all building repairs, including major plumbing, wiring, and structural issues that you did not cause.',
        riskLevel: 'high',
        riskRationale: 'Structural and major capital repairs are universally the legal responsibility of the property owner. Forcing the tenant to pay for preexisting or structural defects is unconscionable.',
        statutoryContext: 'Section 108(f) of Transfer of Property Act, 1882; Model Tenancy Act provisions distinguishing structural vs routine repairs.',
        precedentCitation: 'Central Inland Water Transport Corp v. Brojo Nath Ganguly (1986) 3 SCC 156',
        practicalScenario: 'If a hidden pipe bursts inside the wall and floods the floor, the landlord could present you with a 50,000 repair invoice.',
        recommendedCounterProposal: 'Limit tenant responsibility strictly to routine consumable replacements (light bulbs, faucet washers) up to 1,000 per occurrence. All structural, foundational, and concealed plumbing/electrical repairs must remain the landlord sole liability.',
        category: 'liability',
        tags: ['repairs', 'structural damage', 'maintenance', 'as-is']
      },
      {
        id: 'lease-c6',
        clauseNumber: 'Section 6.1',
        title: 'Notice of Termination & Lock-in Period',
        originalText: 'Both parties agree to a mandatory lock-in period of six (6) months. After the lock-in period, either party may terminate this agreement by providing thirty (30) days prior written notice. If Tenant terminates during the lock-in period, Tenant remains liable to pay the rent for the entire unexpired portion of the lock-in period.',
        plainSummary: 'You cannot leave during the first 6 months without paying rent for all remaining months. After month 6, either side can exit with 30 days written notice.',
        riskLevel: 'caution',
        riskRationale: 'Lock-in periods are legally binding, but the clause fails to provide tenant remedies if the landlord renders the property uninhabitable during the lock-in period.',
        statutoryContext: 'Indian Oil Corp v. Amritsar Gas Service (1991) 1 SCC 533 on determinable contracts.',
        practicalScenario: 'If serious water leaks or pest infestations make the flat unlivable during month 2, you could still be held liable for months 3 through 6 unless an explicit uninhabitable carve-out exists.',
        recommendedCounterProposal: 'Insert an express exception: "Tenant may terminate immediately without penalty during the lock-in period if Landlord fails to rectify substantial habitability defects within seven (7) days of written notice."',
        category: 'termination',
        tags: ['lock-in', 'termination notice', 'habitability']
      },
      {
        id: 'lease-c7',
        clauseNumber: 'Section 7.3',
        title: 'Dispute Resolution & Forum Selection',
        originalText: 'Any dispute arising under or in connection with this agreement shall be settled through sole arbitration by an arbitrator appointed exclusively by the Landlord. The venue and seat of arbitration shall be at the Landlord principal office.',
        plainSummary: 'Any legal dispute must go to private arbitration with an arbitrator chosen solely by the landlord.',
        riskLevel: 'caution',
        riskRationale: 'Unilateral appointment of a sole arbitrator by an interested party is invalid under Section 12(5) of the Arbitration and Conciliation Act as amended in 2015 (Perkins Eastman Architects).',
        statutoryContext: 'Section 12(5) & Seventh Schedule, Arbitration and Conciliation Act, 1996; Perkins Eastman Architects DPC v. HSCC (India) Ltd. (2020) 20 SCC 760.',
        practicalScenario: 'The landlord could appoint their own corporate lawyer as arbitrator, creating structural bias against the tenant.',
        recommendedCounterProposal: 'Disputes should be resolved under the local Rent Authority / civil court of competent territorial jurisdiction, or by an arbitrator appointed mutually by both parties.',
        category: 'dispute_resolution',
        tags: ['arbitration', 'sole arbitrator', 'forum', 'bias']
      },
      {
        id: 'lease-c8',
        clauseNumber: 'Section 8.1',
        title: 'Subletting and Assignment Restrictions',
        originalText: 'Tenant shall not assign, sublet, transfer, or license the demised premises or any part thereof, nor permit paying guests or lodgers without the prior written consent of Landlord.',
        plainSummary: 'You cannot rent out rooms, host paying guests, or transfer the lease to anyone else without written landlord approval.',
        riskLevel: 'standard',
        riskRationale: 'Standard protective clause customary in residential leasing.',
        statutoryContext: 'Section 108(j) of Transfer of Property Act, 1882.',
        practicalScenario: 'You cannot list a spare room on Airbnb or allow an unregistered long-term sub-tenant without explicit landlord sign-off.',
        recommendedCounterProposal: 'Ensure normal family guests and temporary visitors for under thirty (30) consecutive days are expressly exempted from being classified as lodgers.',
        category: 'covenants',
        tags: ['subletting', 'assignment', 'guests']
      }
    ],
    obligations: [
      {
        id: 'lease-ob1',
        responsibleParty: 'Tenant',
        beneficiaryParty: 'Landlord',
        action: 'Pay monthly base rent',
        timelineOrDeadline: 'On or before the 1st of every calendar month',
        consequenceOfDefault: 'Late penalty fee of 500 per day from day 4',
        clauseRef: 'Section 3.1',
        status: 'mandatory'
      },
      {
        id: 'lease-ob2',
        responsibleParty: 'Tenant',
        beneficiaryParty: 'Landlord',
        action: 'Pay interest-free security deposit',
        timelineOrDeadline: 'Prior to physical possession / execution',
        consequenceOfDefault: 'Denial of entry and termination of grant',
        clauseRef: 'Section 2.3',
        status: 'mandatory'
      },
      {
        id: 'lease-ob3',
        responsibleParty: 'Landlord',
        beneficiaryParty: 'Tenant',
        action: 'Provide advance notice before inspection',
        timelineOrDeadline: '4 hours prior verbal notice',
        consequenceOfDefault: 'Tenant may object, though emergency exception exists',
        clauseRef: 'Section 4.2',
        status: 'mandatory'
      },
      {
        id: 'lease-ob4',
        responsibleParty: 'Tenant',
        beneficiaryParty: 'Landlord',
        action: 'Provide written notice for post-lock-in termination',
        timelineOrDeadline: '30 days prior written notice',
        consequenceOfDefault: 'Forfeiture of one month rent in lieu of notice',
        clauseRef: 'Section 6.1',
        status: 'mandatory'
      }
    ]
  },
  {
    id: 'contract-employment-exec',
    title: 'Executive Employment & Proprietary Rights Agreement',
    documentType: 'Employment & Restrictive Covenants',
    jurisdiction: 'National Corporate & Labor Framework',
    governingLaw: 'Indian Contract Act, 1872 & Industrial Relations Code',
    lastUpdated: 'November 2024',
    parties: {
      partyA: 'StrataGlobal Technologies Private Limited (Employer)',
      partyB: 'Senior Engineering Director / Executive (Employee)'
    },
    overallRiskScore: 84,
    riskSummary: {
      highCount: 4,
      cautionCount: 3,
      standardCount: 4,
      favorableCount: 1
    },
    executiveSummary: 'This executive employment contract features aggressive post-employment restraints, sweeping intellectual property capture over private non-work inventions, unilateral clawback of vested equity compensation, and a non-compete provision extending 24 months nationwide that runs contrary to Section 27 of the Indian Contract Act.',
    keyVulnerabilities: [
      '24-month nationwide post-termination non-compete covenant',
      'Overreaching assignment of personal intellectual property developed off-duty',
      'Unilateral company clawback of vested bonuses and equity upon departure',
      'Non-solicitation of clients extending to any company affiliate worldwide for 3 years'
    ],
    precedentLinks: ['prec-001', 'prec-002', 'prec-005'],
    clauses: [
      {
        id: 'emp-c1',
        clauseNumber: 'Clause 4.1',
        title: 'Post-Employment Restraint of Competition',
        originalText: 'For a period of twenty-four (24) months following the termination of employment for any reason whatsoever, whether voluntary or involuntary, Employee shall not directly or indirectly engage in, advise, consult with, or invest in any business entity operating in competition with Company anywhere within the territory of India.',
        plainSummary: 'You are prohibited from working for or advising any competitor anywhere in India for 2 full years after you leave this job.',
        riskLevel: 'high',
        riskRationale: 'Directly violates Section 27 of the Indian Contract Act, 1872. Indian courts consistently strike down post-termination non-compete clauses as void ab initio, regardless of duration or geographic scope.',
        statutoryContext: 'Section 27 of Indian Contract Act, 1872; Percept D\'Mark (India) v. Zaheer Khan (2006) 4 SCC 227.',
        precedentCitation: 'Percept D\'Mark (India) v. Zaheer Khan (2006) 4 SCC 227',
        practicalScenario: 'The company might send a legal notice to your new employer attempting to intimidate them, even though their non-compete is legally void.',
        recommendedCounterProposal: 'Strike post-termination restrictions entirely. Clarify that non-compete obligations apply solely during active employment tenure, as permitted under Niranjan Shankar Golikari v. Century Spinning.',
        category: 'covenants',
        tags: ['non-compete', 'restraint of trade', 'section 27', 'career mobility']
      },
      {
        id: 'emp-c2',
        clauseNumber: 'Clause 6.3',
        title: 'Comprehensive Invention Assignment & Personal IP',
        originalText: 'Employee irrevocably assigns to Company all right, title, and interest in and to all inventions, algorithms, designs, computer programs, and intellectual property conceived or authored by Employee during the term of employment, whether during working hours or non-working hours, and whether using Company equipment or personal devices.',
        plainSummary: 'The company claims ownership of everything you build or invent, even on weekends, using your own laptop, without company data.',
        riskLevel: 'high',
        riskRationale: 'Overbroad assignment claiming private off-duty work created without employer equipment, trade secrets, or work hours exceeds customary employment IP rights.',
        statutoryContext: 'Section 17 of Copyright Act, 1957 (work for hire is limited to work created in the course of employment under a contract of service).',
        practicalScenario: 'If you develop an independent mobile game or personal open-source tool on a Sunday, the company could claim full ownership.',
        recommendedCounterProposal: 'Restrict IP assignment exclusively to works created: (i) within working hours, (ii) using company resources, or (iii) directly relating to the company current commercial products.',
        category: 'intellectual_property',
        tags: ['ip assignment', 'inventions', 'copyright', 'personal projects']
      },
      {
        id: 'emp-c3',
        clauseNumber: 'Clause 8.2',
        title: 'Notice Period and Garden Leave Discretion',
        originalText: 'Either party may terminate employment by giving ninety (90) days prior written notice. However, Company reserves the right, at its sole discretion, to waive the notice period without paying salary in lieu thereof if termination arises from restructuring or role redundancy.',
        plainSummary: 'You must give 90 days notice, but the company can fire you instantly during restructuring without paying you for the 90-day period.',
        riskLevel: 'high',
        riskRationale: 'Completely asymmetric and unconscionable. Eliminating salary in lieu of notice for one party violates bilateral contract fairness under Section 23 Contract Act.',
        statutoryContext: 'Central Inland Water Transport Corp v. Brojo Nath Ganguly (1986) 3 SCC 156.',
        precedentCitation: 'Central Inland Water Transport Corp v. Brojo Nath Ganguly (1986) 3 SCC 156',
        practicalScenario: 'In a sudden corporate reorganization, you could be dismissed with zero notice and zero severance pay.',
        recommendedCounterProposal: 'Make notice and payment in lieu strictly mutual: "If Company waives notice, Company shall pay full gross salary and benefits corresponding to the unserved notice duration."',
        category: 'termination',
        tags: ['notice period', 'garden leave', 'unilateral waiver', 'severance']
      },
      {
        id: 'emp-c4',
        clauseNumber: 'Clause 10.4',
        title: 'Discretionary Bonus & Equity Clawback',
        originalText: 'Company reserves the absolute right to retroactively forfeit or claw back any performance bonus or vested stock option gains received by Employee during the preceding twelve (12) months if Employee resigns to join an enterprise in the technology sector.',
        plainSummary: 'If you quit to work in tech, the company can demand back bonuses and vested stock you already earned over the last year.',
        riskLevel: 'high',
        riskRationale: 'An impermissible financial penalty designed to coerce continued employment, functioning as an indirect restraint of trade prohibited under Section 27.',
        statutoryContext: 'Section 27 and Section 74 of Indian Contract Act, 1872.',
        practicalScenario: 'Leaving for a rival after receiving a year-end bonus could lead to demands for repayment of past earned wages.',
        recommendedCounterProposal: 'Limit clawbacks strictly to proven willful financial fraud or gross ethical malfeasance, never for ordinary resignation.',
        category: 'financial',
        tags: ['clawback', 'bonus', 'equity', 'penalty']
      }
    ],
    obligations: [
      {
        id: 'emp-ob1',
        responsibleParty: 'Employee',
        beneficiaryParty: 'Employer',
        action: 'Devote full working time exclusively to company business',
        timelineOrDeadline: 'Continuous throughout active employment',
        consequenceOfDefault: 'Summary disciplinary dismissal for dual employment',
        clauseRef: 'Clause 2.1',
        status: 'mandatory'
      },
      {
        id: 'emp-ob2',
        responsibleParty: 'Employee',
        beneficiaryParty: 'Employer',
        action: 'Disclose all authored inventions and designs',
        timelineOrDeadline: 'Within 7 days of conception',
        consequenceOfDefault: 'Breach of employment covenant',
        clauseRef: 'Clause 6.3',
        status: 'mandatory'
      },
      {
        id: 'emp-ob3',
        responsibleParty: 'Employer',
        beneficiaryParty: 'Employee',
        action: 'Disburse monthly executive compensation',
        timelineOrDeadline: 'Last working day of each calendar month',
        consequenceOfDefault: 'Statutory wage claim under Payment of Wages framework',
        clauseRef: 'Clause 3.1',
        status: 'mandatory'
      }
    ]
  },
  {
    id: 'contract-saas-msa',
    title: 'Enterprise Cloud SaaS Master Services Agreement (Vendor-Favored)',
    documentType: 'Cloud Software & Master Services Agreement',
    jurisdiction: 'Commercial Technology Transactions',
    governingLaw: 'Commercial Contract Act & Information Technology Law',
    lastUpdated: 'December 2024',
    parties: {
      partyA: 'CloudVault Systems Inc. (Vendor)',
      partyB: 'Mid-Market Enterprise Client (Customer)'
    },
    overallRiskScore: 75,
    riskSummary: {
      highCount: 3,
      cautionCount: 4,
      standardCount: 4,
      favorableCount: 1
    },
    executiveSummary: 'This SaaS enterprise agreement severely restricts the customer remedies while placing disproportionate financial and indemnification exposure on the customer. It caps the vendor total cumulative liability at 1 month of service fees, excludes all consequential damages even for vendor data breaches, and allows the vendor to unilaterally modify subscription pricing with 14 days digital notice.',
    keyVulnerabilities: [
      'Vendor liability capped at fees paid in the immediately preceding 1 month',
      'Customer provides uncapped indemnification for any third-party claims arising from platform usage',
      'Vendor can modify features and raise prices unilaterally on 14 days notice',
      'Immediate data destruction after 30 days post-termination without guaranteed retrieval window'
    ],
    precedentLinks: ['prec-002', 'prec-006', 'prec-008'],
    clauses: [
      {
        id: 'saas-c1',
        clauseNumber: 'Section 8.1',
        title: 'Limitation of Cumulative Liability',
        originalText: 'Under no circumstances shall Vendor cumulative aggregate liability for all claims arising out of or related to this Agreement exceed the fees actually paid by Customer to Vendor in the one (1) month immediately preceding the event giving rise to liability.',
        plainSummary: 'If the software crashes or leaks your confidential data, the maximum refund or damages you can ever receive from the vendor is 1 month worth of fees.',
        riskLevel: 'high',
        riskRationale: 'Grossly disproportionate cap. In enterprise SaaS, data breaches or extended service outages cause damages vastly exceeding a single monthly invoice. A typical market standard is 12 months fees, with super-caps for confidentiality and data breach.',
        statutoryContext: 'Section 73 of Indian Contract Act; Unfair Contract Terms doctrine.',
        precedentCitation: 'LIC of India v. Consumer Education & Research Centre (1995) 5 SCC 482',
        practicalScenario: 'If a vendor security flaw exposes customer records resulting in 500,000 regulatory penalties, the vendor liability would remain restricted to 2,000.',
        recommendedCounterProposal: 'Establish an aggregate liability cap equal to twelve (12) months fees. Include an uncapped or super-cap (e.g. 3x to 5x annual fees) for breaches of confidentiality, data protection, and gross negligence.',
        category: 'liability',
        tags: ['limitation of liability', 'liability cap', 'data breach', 'damages']
      },
      {
        id: 'saas-c2',
        clauseNumber: 'Section 9.2',
        title: 'Unilateral Customer Indemnification',
        originalText: 'Customer shall defend, indemnify, and hold harmless Vendor, its officers, directors, and affiliates against any third-party claims, liabilities, costs, and attorney fees arising from or related to Customer data, Customer use of the Services, or any alleged breach of applicable laws by Customer.',
        plainSummary: 'You must pay all legal fees and settlements for the vendor if a third party sues the vendor relating to your use of their system, with no reciprocal protection for you.',
        riskLevel: 'high',
        riskRationale: 'One-sided indemnity. The customer should only indemnify for its own content infringement. The vendor must provide reciprocal IP infringement indemnification protecting the customer if the vendor software infringes third-party patents or copyrights.',
        statutoryContext: 'Section 124 and Section 125, Indian Contract Act, 1872 (Contract of Indemnity).',
        practicalScenario: 'If the vendor software code infringes an Oracle or Microsoft patent, you could be sued without any obligation from the vendor to defend you unless mutual IP indemnity is added.',
        recommendedCounterProposal: 'Insert mutual IP infringement indemnity: "Vendor shall defend and indemnify Customer against any claim alleging that the Services infringe any patent, copyright, or trade secret of any third party."',
        category: 'liability',
        tags: ['indemnification', 'third-party claim', 'ip indemnity', 'hold harmless']
      },
      {
        id: 'saas-c3',
        clauseNumber: 'Section 12.4',
        title: 'Data Retention and Post-Termination Retrieval',
        originalText: 'Upon expiration or termination of this Agreement, Customer shall have fourteen (14) days to request an export of Customer data at Vendor prevailing professional services rates. Following said 14-day window, Vendor shall have the right to permanently purge and delete all Customer data without further notice.',
        plainSummary: 'You have only 14 days after termination to ask for your data back, and the vendor can charge high consulting fees for giving it back before wiping it clean.',
        riskLevel: 'caution',
        riskRationale: '14 days is an uncomfortably short window for enterprise data migrations. Charging arbitrary professional service fees for raw data export is predatory.',
        statutoryContext: 'Digital Personal Data Protection Act, 2023 (Data fiduciary obligations).',
        practicalScenario: 'If a contract ends while key staff are on leave, the 14-day window might lapse, causing irrecoverable corporate data destruction.',
        recommendedCounterProposal: 'Extend retrieval window to sixty (60) days. Mandate that vendor provide raw data in standard format (JSON/CSV/SQL dump) at no additional charge prior to scheduled secure destruction.',
        category: 'general',
        tags: ['data export', 'data retention', 'termination', 'data purge']
      }
    ],
    obligations: [
      {
        id: 'saas-ob1',
        responsibleParty: 'Customer',
        beneficiaryParty: 'Vendor',
        action: 'Pay recurring subscription licensing fees',
        timelineOrDeadline: 'Net 30 days from invoice dispatch',
        consequenceOfDefault: 'Suspension of cloud access after 10 days delinquency notice',
        clauseRef: 'Section 4.1',
        status: 'mandatory'
      },
      {
        id: 'saas-ob2',
        responsibleParty: 'Vendor',
        beneficiaryParty: 'Customer',
        action: 'Maintain cloud platform operational uptime of 99.5 percent',
        timelineOrDeadline: 'Calculated monthly excluding scheduled maintenance',
        consequenceOfDefault: 'Service fee credits against future billing',
        clauseRef: 'Section 5.2',
        status: 'conditional'
      }
    ]
  }
];

export const sampleComparisonPairs: ComparisonPair[] = [
  {
    id: 'pair-tenancy-comparison',
    title: 'Model Balanced Tenancy Agreement vs. Landlord Restrictive Addendum',
    description: 'Compares a standard statutory fair-lease draft with a heavily modified landlord addendum that introduces unilateral forfeiture, shortened notice windows, and structural repair obligations.',
    docA: {
      ...sampleContracts[0],
      title: 'Model Fair Tenancy Agreement (Standard Benchmark)',
      overallRiskScore: 32
    },
    docB: sampleContracts[0],
    netFavorabilityShift: 'substantially_worse',
    shiftSummary: 'The Landlord Restrictive Addendum introduces 4 severe deviations: unilateral security deposit forfeiture without proof of loss, landlord entry with only 4 hours notice, transfer of structural repair burdens to tenant, and replacement of civil jurisdiction with unilateral sole arbitration.',
    diffs: [
      {
        clauseNumber: 'Section 2.3',
        topic: 'Security Deposit Refund vs Forfeiture',
        versionAText: 'Landlord shall hold a security deposit equivalent to two (2) months rent. Said deposit shall be refunded to Tenant within fourteen (14) days of vacant possession, subject only to deductions for unpaid utilities and physical damages verified by mutual inspection.',
        versionBText: 'Tenant shall deposit a sum equivalent to three (3) months rent as interest-free security deposit. In the event Tenant vacates prior to completion of term or breaches any rule, the entire security deposit shall stand absolutely forfeited to Landlord as liquidated damages without proof of actual loss.',
        status: 'modified',
        riskImpact: 'worse_for_user',
        analysis: 'Version B increases the deposit from 2 to 3 months and transforms a refundable deposit into an automatic punitive forfeiture mechanism on premature departure, directly contravening Section 74 of the Contract Act.',
        keyWordChanges: ['two (2) months -> three (3) months', 'refunded within 14 days -> absolutely forfeited', 'verified damages -> liquidated damages without proof']
      },
      {
        clauseNumber: 'Section 4.2',
        topic: 'Inspection & Landlord Entry Notice',
        versionAText: 'Landlord or designated representative may inspect the premises upon providing at least twenty-four (24) hours advance written notice, between the hours of 09:00 and 18:00 on business days, accompanied by Tenant.',
        versionBText: 'Landlord or its authorized agents reserve the right to enter the demised premises at any hour between 07:00 and 22:00 upon giving four (4) hours verbal notice via telephone or messaging application, or without notice in any situation deemed urgent by Landlord.',
        status: 'modified',
        riskImpact: 'worse_for_user',
        analysis: 'Notice time slashed from 24 hours written to 4 hours verbal. Permitted hours expanded into late evening (until 10 PM), and emergency entry left entirely to the subjective judgment of the landlord.',
        keyWordChanges: ['24 hours advance written -> 4 hours verbal notice', '09:00 to 18:00 -> 07:00 to 22:00', 'accompanied by Tenant -> without notice in situation deemed urgent']
      },
      {
        clauseNumber: 'Section 5.4',
        topic: 'Maintenance and Structural Repairs',
        versionAText: 'Tenant shall be responsible for routine minor maintenance costing under 1,000 per incident. All major repairs, structural defects, foundational plumbing, and external seepage shall remain the sole liability of Landlord.',
        versionBText: 'Tenant accepts the premises in as-is condition. Tenant shall be solely responsible for all maintenance and repairs whatsoever, whether minor, major, internal, electrical, plumbing, sanitary, or structural, arising during the term at Tenant sole cost.',
        status: 'modified',
        riskImpact: 'worse_for_user',
        analysis: 'Shifts 100 percent of structural, foundational, and capital maintenance onto the tenant under an "as-is" caveat, which is customarily the landlord fundamental duty under Transfer of Property Act Section 108.',
        keyWordChanges: ['minor maintenance under 1,000 -> all maintenance whatsoever', 'structural defects remain Landlord liability -> Tenant solely responsible for structural']
      },
      {
        clauseNumber: 'Section 7.3',
        topic: 'Dispute Resolution & Arbitrator Appointment',
        versionAText: 'Any disputes shall be submitted to the competent civil court having territorial jurisdiction over the location of the premises, or by mutual agreement to a mediator accredited by the High Court.',
        versionBText: 'Any dispute arising under or in connection with this agreement shall be settled through sole arbitration by an arbitrator appointed exclusively by the Landlord. Venue and seat shall be at Landlord principal office.',
        status: 'modified',
        riskImpact: 'worse_for_user',
        analysis: 'Replaces affordable civil court jurisdiction with expensive private arbitration, and gives the landlord unilateral power to pick the arbitrator, which violates the Perkins Eastman neutrality principle.',
        keyWordChanges: ['competent civil court -> sole arbitration', 'mutual mediator -> appointed exclusively by Landlord']
      }
    ]
  },
  {
    id: 'pair-saas-comparison',
    title: 'Customer-Protected SaaS MSA vs. Vendor One-Sided Redline',
    description: 'Compares a balanced enterprise software agreement with a vendor-skewed counter-proposal that eliminates IP indemnities and caps vendor breach liability to 30 days of fees.',
    docA: {
      ...sampleContracts[2],
      title: 'Customer Balanced SaaS Agreement (Standard)',
      overallRiskScore: 38
    },
    docB: sampleContracts[2],
    netFavorabilityShift: 'substantially_worse',
    shiftSummary: 'The Vendor One-Sided Redline caps total vendor liability to just 1 month of subscription fees, eliminates customer consequential damages, and imposes uncapped customer indemnification while giving the vendor unilateral pricing power.',
    diffs: [
      {
        clauseNumber: 'Section 8.1',
        topic: 'Liability Cap Scope',
        versionAText: 'Each party aggregate cumulative liability shall be capped at the total fees paid or payable by Customer in the twelve (12) months preceding the incident, with unlimited liability for breaches of confidentiality and third-party IP claims.',
        versionBText: 'Under no circumstances shall Vendor cumulative aggregate liability for all claims exceed the fees actually paid by Customer to Vendor in the one (1) month immediately preceding the event giving rise to liability.',
        status: 'modified',
        riskImpact: 'worse_for_user',
        analysis: 'Reduces liability cap by over 91 percent (from 12 months to 1 month) and removes carve-outs for confidentiality breaches and gross negligence.',
        keyWordChanges: ['twelve (12) months -> one (1) month', 'unlimited liability for confidentiality -> Under no circumstances shall Vendor liability exceed']
      },
      {
        clauseNumber: 'Section 9.2',
        topic: 'IP Infringement Indemnification',
        versionAText: 'Vendor shall defend and indemnify Customer against any third-party claim alleging that the SaaS platform infringes any patent, copyright, or trademark. Customer shall indemnify Vendor for Customer uploaded data.',
        versionBText: 'Customer shall defend, indemnify, and hold harmless Vendor, its officers, directors, and affiliates against any third-party claims, liabilities, costs, and attorney fees arising from or related to Customer data or use of Services.',
        status: 'modified',
        riskImpact: 'worse_for_user',
        analysis: 'Vendor completely deletes its own obligation to indemnify the customer if the software infringes third-party intellectual property, while keeping the customer indemnification burden uncapped.',
        keyWordChanges: ['Vendor shall defend and indemnify Customer -> Deleted', 'Customer data only -> Customer data or use of Services']
      }
    ]
  }
];
