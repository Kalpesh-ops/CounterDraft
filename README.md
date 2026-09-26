# CounterDraft | Legal Intelligence & Clause Negotiation Engine

> **Accessible, privacy-first legal document intelligence, clause risk auditing, side-by-side contract comparison, and statutory counter-proposal drafts grounded in Indian statutory law and landmark Supreme Court jurisprudence.**

[![CI/CD Pipeline](https://github.com/kalpeshparashar/counterdraft/actions/workflows/ci.yml/badge.svg)](https://github.com/kalpeshparashar/counterdraft/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Cloud Retention](https://img.shields.io/badge/Privacy-Zero_Cloud_Retention-2d4a22.svg)](#privacy--zero-server-model)
[![Tests Passing](https://img.shields.io/badge/Tests-32%20passing-brightgreen.svg)](#testing)

---

## Submission Information

- **Project Name**: CounterDraft
- **Chosen Challenge Vertical**: Legal Information & Basic Legal Assistance Accessibility
- **Repository Visibility**: Public GitHub Repository
- **Repository Branch Count**: Exactly 1 branch (`main`)
- **Repository Size**: ~345 KiB (Strictly compliant with `< 10 MB` ceiling)
- **Deployment**: Static SPA deployable to GitHub Pages / Cloudflare Pages / Vercel

---

## 1. Chosen Vertical & Challenge Alignment

Legal information is structurally complex, terminology-dense, and notoriously difficult for non-lawyers to navigate without expensive legal representation. Individual signatories—such as residential tenants, tech employees, independent consultants, and MSME vendors—frequently sign standardized adhesion contracts containing unilateral termination powers, illegal security deposit forfeitures, uncapped indemnities, and void non-competes.

**CounterDraft** is engineered specifically for the **Legal Information & Basic Legal Assistance Accessibility** vertical. It demystifies opaque legal drafting, evaluates clause enforceability against codified Indian statutes and landmark Supreme Court precedents, and equips signatories with actionable, balanced counter-drafts and advocate briefing memoranda before signing.

---

## 2. Approach and Logic

1. **Deterministic Statutory Grounding vs. Black-Box Hallucination**:
   Rather than piping unvetted contract text into an unconstrained system prompt that risks hallucinating non-existent statutory citations or yielding to adversarial prompt injection, CounterDraft pairs algorithmic document segmentation with codified legal principles (*Indian Contract Act, 1872* and *Transfer of Property Act, 1882*) and binding Supreme Court rulings (*Percept D'Mark*, *Kailash Nath Associates*, *Central Inland Water Transport*).
2. **Asymmetry Rebalancing Engine**:
   Every flagged high-risk clause automatically generates a reciprocal, legally grounded **redline counter-proposal** that can be immediately copied into an ongoing negotiation.
3. **Local-First Zero-Cloud-Retention Architecture**:
   To guarantee absolute client confidentiality, 100% of document ingestion, parsing, comparison, and brief compilation execute client-side in browser memory. No confidential contract data is transmitted to or stored on external servers.
4. **ReDoS-Immune Linear Processing**:
   All text segmentation and keyword matching algorithms operate with bounded, non-overlapping linear time complexity $O(N)$, ensuring zero Regular Expression Denial of Service vulnerabilities even on massive 1 MB contract payloads.

---

## 3. How the Solution Works

```
[ User Input: File / Text ]
          │
          ▼
[ Security & Sanitization Layer ] ──► Size Cap (2 MB) & Script Neutralizer
          │
          ▼
[ Clause Segmentation Parser ] ──► Regex Boundary & Paragraph Chunking
          │
          ▼
[ Statutory Rule Evaluator ] ──► ICA 1872 / TPA 1882 Heuristic Matching
          │
          ├─────────────────────────────────────────────────┐
          ▼                                                 ▼
[ Multi-Module Output Pipeline ]               [ Quantified Risk Engine ]
  • Clause Risk Auditor                          • Composite Risk Score (0-95)
  • Side-by-Side Diff Comparator                 • Deposit at Risk Metric
  • Negotiation Letter Generator                 • Daily Delay Penalties
  • Grounded Q&A Inquiries                       • Lock-in Period Liabilities
  • Precedent Case Law Index                     • Net Favorability Shift
  • Counsel Consultation Brief
  • Actionable Safeguard Checklist
```

---

## 4. Key Assumptions Made

1. **Jurisdiction & Legal Framework**: Grounded primarily in Indian statutory law (*Indian Contract Act, 1872*, *Transfer of Property Act, 1882*, and Supreme Court appellate jurisprudence), which forms the core benchmark for commercial and civil contracting across India. The underlying principles of unconscionability, direct damage causality, and bilateral reciprocity remain structurally relevant across common-law jurisdictions.
2. **Language**: Designed for English-language legal agreements, which represent the universal standard for corporate, tenancy, employment, and commercial contracts in India.
3. **Informational & Assistive Mandate**: Assumes the role of an intelligent informational assistant. CounterDraft explicitly disclaims formal legal representation and provides users with a structured Counsel Brief to maximize the efficiency and value of subsequent consultations with enrolled advocates.
4. **Client Environment**: Assumes modern web standards supporting HTML5, ES2022 JavaScript, Web Cryptography/Clipboard APIs, and local File API.

---

## Core Capabilities & Modules

| Module | Core Functionality | Statutory Grounding |
|---|---|---|
| **[Clause Risk Auditor](docs/USER_MANUAL.md#step-2-clause-risk-auditor-auditor)** | Evaluates clauses into High, Caution, Standard, and Favorable tiers; provides plain-language translations and 1-click statutory redline counter-proposals. | Indian Contract Act 1872 (Sec 23, 27, 74); Transfer of Property Act 1882 (Sec 108) |
| **[Side-by-Side Comparator](docs/USER_MANUAL.md#step-3-side-by-side-contract-comparator-comparator)** | Computes clause-by-clause diffs between baseline agreements and counterparty markups, quantifying net favorability shifts. | Contractual deviation and adhesion analysis |
| **[Negotiation Playbook](docs/USER_MANUAL.md#step-4-negotiation-playbook--financial-exposure-playbook)** | Quantifies financial liabilities (deposit confiscation, lock-in wages, compounding penalties) and compiles a ready-to-send negotiation letter. | Supreme Court liquidated damages benchmark (*Kailash Nath*) |
| **[Judicial Precedent Navigator](docs/STATUTORY_REFERENCE.md#3-landmark-judicial-authorities-digest)** | Curated repository of landmark appellate authorities (*Percept D'Mark*, *Kailash Nath*, *Brojo Nath Ganguly*, *Golikari*, *Vidya Drolia*). | Supreme Court of India jurisprudence |
| **[Grounded Document Q&A](docs/USER_MANUAL.md#step-5-grounded-document-qa-qa)** | Anchored inquiry engine retrieving exact contract snippets synthesized with mandatory statutory rights and override notes. | Codified Indian statutory law |
| **[Counsel Brief Generator](docs/USER_MANUAL.md#step-7-counsel-brief-generator-counsel)** | Generates an editorial 1-page printable legal memorandum organizing high-priority risks and interrogation questions for an advocate consultation. | Dedicated print stylesheet (`@media print`) |
| **[Actionable Safeguard Checklist](docs/USER_MANUAL.md#step-6-compliance--safeguard-checklist-checklist)** | Three-phase compliance tracker (Pre-Signing, Active Term, Exit/Termination) with `.txt` export. | Risk management best practices |

---

## Comprehensive Documentation Directory

The project includes an exhaustive technical and legal documentation suite:

### Developer & Technical Documentation
- **[System Architecture](docs/ARCHITECTURE.md)**: Zero-server privacy model, data flow pipeline, state management, and memory safety boundaries.
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)**: Local setup, Vitest test execution, production build instructions, and the **30 Negative Design Constraints**.
- **[Legal Engine Specification](docs/LEGAL_ENGINE.md)**: Algorithmic parsing, ReDoS-safe linear regex heuristics, composite risk scoring mathematics, and financial exposure algorithms.
- **[Security Audit & Threat Model](docs/SECURITY_AUDIT.md)**: XSS/Clickjacking mitigations, memory bomb file boundaries, CSP headers, and clipboard fallback routines.

### Legal Knowledge & User Guides
- **[Statutory Reference Handbook](docs/STATUTORY_REFERENCE.md)**: In-depth digest of Indian Contract Act & Transfer of Property Act sections and landmark case briefs.
- **[User Manual](docs/USER_MANUAL.md)**: Step-by-step practical guide for evaluating, comparing, and negotiating contracts.
- **[Frequently Asked Questions (FAQ)](docs/FAQ.md)**: Answers to key legal and technical questions (non-compete enforceability, deposit rules, privacy).

### Legal Analysis Articles & Blog
- **[Navigating Non-Competes in Indian Employment Contracts](docs/blog/01-navigating-indian-employment-agreements-section-27.md)**: Why Section 27 and *Percept D'Mark* protect employee mobility.
- **[Lease Forfeiture Pitfalls: Protecting Tenant Security Deposits](docs/blog/02-commercial-and-residential-lease-pitfalls-section-74.md)**: Applying Section 74 and Section 108 against arbitrary landlord deductions.
- **[Unpacking Asymmetrical Liability Caps in MSME SaaS Contracts](docs/blog/03-asymmetrical-liability-caps-in-msme-saas-contracts.md)**: Gross negligence carve-outs and unconscionable standard terms under *Central Inland Water Transport*.
- **[How to Consult an Advocate Effectively: The Counsel Brief](docs/blog/04-preparing-for-advocate-consultation-the-counsel-brief.md)**: Saving legal fees and maximizing consultation value with structured briefing memoranda.

---

## LLM & AI Discovery Standards

CounterDraft implements modern web discovery and AI agent context protocols in the [`public/`](public/) directory:
- **[`public/llms.txt`](public/llms.txt)**: Structured markdown context manifest for AI search engines following the [llmstxt.org](https://llmstxt.org) standard.
- **[`public/llms-full.txt`](public/llms-full.txt)**: Deep prompt-grounding context containing statutory rules and judicial precedent digests.
- **[`public/robots.txt`](public/robots.txt)**: Directives for web crawlers and modern LLM agents (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`).
- **[`public/sitemap.xml`](public/sitemap.xml)**: Comprehensive search engine sitemap protocol.
- **[`public/.well-known/security.txt`](public/.well-known/security.txt)**: RFC 9116 security disclosure standard.
- **[`public/manifest.webmanifest`](public/manifest.webmanifest)**: Progressive Web Application metadata.

---

## Quickstart & Local Development

### Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

```bash
# Clone the repository
git clone https://github.com/kalpeshparashar/counterdraft.git
cd counterdraft

# Install dependencies
npm install

# Start local development server with Vite HMR
npm run dev

# Run Vitest test suite
npm test -- --run

# Compile production bundle
npm run build
```

---

## Privacy & Zero-Server Model

CounterDraft guarantees absolute document confidentiality:
- **Zero Cloud Persistence**: Contracts never leave your browser; no backend databases, telemetry trackers, or external logging.
- **Zero Web Storage**: `localStorage` and `sessionStorage` are untouched to prevent script scraping.
- **Strict Content Security Policy**: Network egress is restricted via `connect-src 'self'`.

---

## Statutory Disclaimer

CounterDraft provides legal document intelligence and clause comprehension assistance for informational and educational purposes only. It does not provide formal legal representation or create an attorney-client relationship. All evaluations, redline proposals, and statutory summaries should be verified with an enrolled advocate or qualified legal practitioner prior to contract execution.
