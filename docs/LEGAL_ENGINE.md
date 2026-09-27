# CounterDraft Legal Engine & Statutory Heuristics

> Mathematical models, legal reasoning rules, and statutory mappings governing the automated analysis engine.

---

## 1. Overview of the Legal Engine

The `legalEngine.ts` service implements deterministic, rule-based statutory analysis grounded in the substantive laws of India. It does two jobs: it segments every contract into verbatim clauses (the grounding that Google Gemini's explanations are layered on and verified against), and it is the offline fallback that rates clauses when GenAI is switched off or unavailable. Pairing codified legal doctrines with binding Supreme Court precedents keeps its evaluations consistent and free of hallucinated citations.

### 1.1 Clause Segmentation (`detectClauseHeading`, `parseCustomContract`)
A line starts a new clause when it is one of:
- a keyword heading: `Section 4.1`, `Clause 3`, `Article IV` (Roman numerals supported), `Paragraph 2`, or `§ 7`;
- a numbered heading: `1.`, `2)`, or `1.1 Title` (a number followed by a capitalised word);
- a markdown heading (`## Dispute Resolution`) or a short ALL-CAPS heading (`INDEMNITY AND LIABILITY`).

Sub-items such as `(a)`, `(ii)` or `a)` never start a clause, so nested lists stay inside their parent, and numbers followed by lowercase text (`30 days notice...`) are body text. "Title. Body" lines are split at the first full stop. Text before the first heading becomes the `Preamble`; unnumbered headings are labelled `Part 1`, `Part 2`, and so on; duplicate designators get a suffix (`Section 1 (2)`) so every clause number is unique and Gemini insights map back unambiguously. Unstructured text falls back to paragraph chunking. All patterns are anchored with no nested quantifiers, so matching is linear (ReDoS-safe).

---

## 2. Statutory Mappings & Evaluation Rules

### 2.1 Post-Termination Non-Compete Clauses & Restraint of Trade
- **Governing Statute**: Section 27, Indian Contract Act, 1872:
  > *"Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void."*
- **Appellate Authority**: *Percept D'Mark (India) Pvt. Ltd. v. Zaheer Khan (2006) 4 SCC 227*
- **Judicial Doctrine**: Indian jurisprudence does not recognize the common law "doctrine of reasonableness" for post-employment restraints. Negative covenants that extend beyond the date of termination or resignation are void ab initio.
- **Engine Action**:
  - Automatically flags any post-tenure covenant as `high` risk.
  - Generates redline counter-proposal deleting post-termination restraints and restricting confidentiality exclusively to proprietary trade secrets.

### 2.2 Security Deposit Forfeitures & Liquidated Damages
- **Governing Statute**: Section 74, Indian Contract Act, 1872:
  > *"When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach... the party complaining of the breach is entitled... to receive from the party who has broken the contract reasonable compensation not exceeding the amount so named or, as the case may be, the penalty stipulated for."*
- **Appellate Authority**: *Kailash Nath Associates v. Delhi Development Authority (2015) 4 SCC 136*
- **Judicial Doctrine**: Compensation is awarded only for damage actually suffered. Where money is deposited as security, the payee cannot forfeit the sum unless they prove actual financial injury resulting directly from the breach.
- **Engine Action**:
  - Flags unilateral forfeiture clauses as `high` risk.
  - Proposes redlines mandating itemized, verified expense audits for deductions and strict 14-day return windows.

### 2.3 Unilateral Termination & Unconscionable Standard Contracts
- **Governing Statute**: Section 23, Indian Contract Act, 1872 (Public Policy) & Article 14 of the Constitution.
- **Appellate Authority**: *Central Inland Water Transport Corp v. Brojo Nath Ganguly (1986) 3 SCC 156*
- **Judicial Doctrine**: Courts will not enforce unfair or unconscionable clauses in standard-form contracts entered into by parties with unequal bargaining power. Clauses granting employers or landlords the right to terminate arbitrarily without cause are void as contrary to public policy.
- **Engine Action**:
  - Flags asymmetric termination windows (e.g. 90 days for tenant, 0 days for landlord) as `high` risk.
  - Generates balanced reciprocal notice terms (minimum 30 days) and mandatory cure periods.

### 2.4 Tenant Quiet Enjoyment & Structural Maintenance
- **Governing Statute**: Section 108(c) and 108(f), Transfer of Property Act, 1882.
- **Judicial Doctrine**: Lessors are statutorily bound to provide uninterrupted possession. Landlords who fail to maintain the structural integrity of the leased premises cannot shift total repair burdens onto tenants without contractual consideration.
- **Engine Action**:
  - Differentiates between ordinary interior wear-and-tear (tenant's minor responsibility) and major external/structural defects (landlord's mandatory duty).
  - Flags landlord right-of-entry clauses as **Caution** when entry is allowed "at any time", "without notice", on verbal notice, or with under 24 hours' notice, and proposes a 24-hour written-notice redline.

---

## 3. Mathematical Models

### 3.1 Composite Risk Score Calculation
The overall document risk score is a normalized metric ranging from 0 to 95:

$$\text{Score} = \min\left(95, \left\lfloor\frac{30 H + 15 C + 5 S + 0 F}{T} \times 3.5\right\rfloor\right)$$

Where:
- $H$ = Count of `high` risk clauses (weight: 30)
- $C$ = Count of `caution` risk clauses (weight: 15)
- $S$ = Count of `standard` clauses (weight: 5)
- $F$ = Count of `favorable` clauses (weight: 0)
- $T$ = Total clause count ($\max(1, \text{clauses.length})$)
- Multiplier ($3.5$) scales the weighted density to a human-readable 0-100 gauge capped at 95.

### 3.2 Net Favorability Shift Metric (Comparator)
When comparing Baseline Draft ($A$) with Counterparty Revised Draft ($B$):
- Let $\Delta_{worse}$ be the count of provisions where Document $B$ introduces elevated risk compared to Document $A$.
- **Classification**:
  - If $\Delta_{worse} \ge 3 \implies \text{"substantially\_worse"}$
  - If $1 \le \Delta_{worse} < 3 \implies \text{"moderately\_worse"}$
  - If $\Delta_{worse} = 0 \text{ and } \Delta_{better} > 0 \implies \text{"improved"}$
  - Otherwise $\implies \text{"balanced"}$

---

## 4. Financial Exposure Modeling

The `calculateFinancialExposure` algorithm scans contractual clauses for monetary commitments:
1. **Deposit at Risk**: Identifies 2-month or 3-month advance security requirements exposed to unilateral confiscation upon early departure.
2. **Penalty Rate**: Captures daily compounding charges (e.g. Rs. 500/day late fees) exceeding legal commercial interest caps.
3. **Lock-In Wage / Rent Exposure**: Quantifies financial liability during mandatory lock-in windows where vacating or leaving requires paying out remaining months.
4. **Liability Cap Exposure**: Identifies disproportionately low vendor liability caps (e.g. 1 month of subscription fees) that neutralize recovery in data loss scenarios.
