# CounterDraft User Manual: Signatory Workflow Guide

> Step-by-step practical guide for prospective signatories, tenants, employees, and consultants using CounterDraft to evaluate, compare, and negotiate agreements.

---

## 1. Introduction & Workflow Architecture

CounterDraft is designed to level the playing field between institutional contract drafters and individual signatories. It provides seven integrated modules organized into a sequential review workflow:

```
[ Ingest Contract ] ──► [ Clause Risk Audit ] ──► [ Side-by-Side Diff ]
                                │                           │
                                ▼                           ▼
                      [ Grounded Inquiries ]       [ Negotiation Letter ]
                                │                           │
                                ▼                           ▼
                      [ Milestone Checklist ] ──► [ Counsel Briefing ]
```

---

## 2. Step-by-Step Module Walkthrough

### Step 1: Ingesting Your Contract
- **Preloaded Dockets**: Select from high-fidelity sample agreements in the masthead dropdown:
  - *Standard Residential Tenancy Agreement*
  - *Executive Technology Employment & Non-Compete Agreement*
  - *Enterprise Cloud SaaS Master Services Agreement*
- **Custom Contract Upload**:
  - Click **"Ingest Custom Contract"** in the top navigation bar.
  - Drop a `.txt`, `.doc`, `.md`, or `.json` file, or paste raw agreement text directly into the input area.
  - Specify the contract title and category.
  - Click **"Ingest & Audit Contract"**. Ingestion processes 100% locally in browser memory.

### Step 2: Clause Risk Auditor (`#auditor`)
- **Risk Badges**: Provisions are color-coded into four tiers:
  - `High Risk` (Crimson): Potentially void or heavily asymmetrical provisions.
  - `Caution` (Amber): Ambiguous liabilities requiring clarification or limits.
  - `Standard` (Olive): Normal operational covenants.
  - `Favorable` (Green): Provisions providing express protections.
- **Filtering**: Filter clauses by Risk Level (High, Caution, Standard, Favorable) or Category (Liability, Financial, Termination, Covenants, IP).
- **Interactive Clause Card**:
  - **Plain-Terms Translation**: Reads the clause in everyday language without legal jargon.
  - **Statutory Context**: Cites relevant sections of the Indian Contract Act or Transfer of Property Act.
  - **Real-World Scenario**: Explains what happens if a dispute or breach occurs under the clause.
  - **1-Click Redline Copy**: Click **"Copy Redline Proposal"** to copy a balanced, ready-to-insert substitute clause.
  - **Ask Grounded Q&A**: Click **"Inquire on this Clause"** to immediately open Q&A with the clause pre-populated.

### Step 3: Side-by-Side Contract Comparator (`#comparator`)
- **Preloaded Pairs**: Review typical baseline terms versus aggressive counterparty redlines.
- **Custom Comparison**: Click **"Compare Custom Pair"** to paste two custom contract versions side by side.
- **Diff Analysis**:
  - Highlights modified, added, or removed text.
  - Labels risk shift: `Worse for Signatory`, `Better for Signatory`, or `Neutral`.
  - Calculates the **Net Favorability Shift** across the entire document.

### Step 4: Negotiation Playbook & Financial Exposure (`#playbook`)
- **Financial Vulnerability Audit**:
  - **Deposit at Risk**: Identifies security deposit sums vulnerable to unilateral forfeiture.
  - **Penalty Rates**: Flags compounding daily late fees.
  - **Lock-In Wage Exposure**: Calculates remaining lease or salary payouts if you exit early.
  - **Liability Caps**: Evaluates whether vendor accountability is capped too low.
- **Counter-Draft Letter Generator**:
  - Automatically drafts a polite, professional negotiation email addressed to your Landlord, Employer, or Vendor.
  - Seamlessly incorporates the top 3 high-risk clauses with specific redline substitutions and statutory justifications.
  - Click **"Copy Negotiation Draft"** to paste into your email client.

### Step 5: Grounded Document Q&A (`#qa`)
- **Natural Language Search**: Ask specific questions (e.g., *"Can the landlord enter without 24 hours notice?"* or *"Can my employer stop me from joining a competitor?"*).
- **Verbatim Anchoring**: Returns exact contractual snippets from the active docket.
- **Statutory Overrides**: Provides essential legal guidance on whether the contract term is actually enforceable under Indian law.

### Step 6: Compliance & Safeguard Checklist (`#checklist`)
- **Three Operational Phases**:
  1. *Pre-Signing Verification*: Verifying counterparty title, proposing redlines, deposit escrow confirmation.
  2. *Active Term Record-Keeping*: Documenting defect notices, rent receipts, calendar reminders for notice windows.
  3. *Termination & Exit*: Formal written termination notice, joint property inspection, security deposit return receipts.
- **Custom Item Insertion**: Add your own tasks with deadlines and clause references.
- **Text Export**: Click **"Export Checklist (.txt)"** to download a local compliance record.

### Step 7: Counsel Brief Generator (`#counsel`)
- **Advocate Consultation Preparation**: Compiles an editorial 1-page briefing memorandum summarizing:
  - High-priority statutory risks.
  - Specific questions to ask your advocate during your consultation.
  - Statutory defenses (*Section 27*, *Section 74*, *Section 108*).
  - Missing protective covenants.
- **Print / PDF Sheet**: Click **"Print / Save as PDF"** to trigger the dedicated print stylesheet, rendering a clean formal document suitable for meeting with legal counsel.
