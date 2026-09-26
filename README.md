# CounterDraft | GenAI Legal Assistant for Contracts

> **A GenAI-powered legal assistant, built on Google Gemini, that helps non-lawyers understand, compare, and negotiate contracts. It simplifies clauses in plain language (in 8 Indian languages), flags risks, answers questions with verified quotes from the contract, and prepares a brief for an advocate. Every AI output is grounded in the user's document and in Indian statute and precedent.**

[![CI/CD Pipeline](https://github.com/Kalpesh-ops/CounterDraft/actions/workflows/ci.yml/badge.svg)](https://github.com/Kalpesh-ops/CounterDraft/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GenAI: Google Gemini](https://img.shields.io/badge/GenAI-Google_Gemini-1a73e8.svg)](#2-approach-grounded-genai)
[![Tests Passing](https://img.shields.io/badge/Tests-82%20passing-brightgreen.svg)](#testing)

---

## Submission Information

- **Project Name**: CounterDraft
- **Chosen Challenge Vertical**: AI for Legal Assistance & Access
- **Repository Visibility**: Public GitHub Repository
- **Repository Branch Count**: Exactly 1 branch (`main`)
- **Live Application**: [https://counterdraft-app.vercel.app](https://counterdraft-app.vercel.app/)
- **Mirror Domain**: [https://counterdraft-legal.vercel.app](https://counterdraft-legal.vercel.app/)
- **Deployment Platform**: Vercel (static SPA + one serverless function, `/api/genai`, that calls Google Gemini)
- **GenAI Model**: Google Gemini (`gemini-3.5-flash` by default, configurable via `GEMINI_MODEL`)

---

## 1. Problem & Challenge Alignment

Legal information is complex, full of jargon, and hard to navigate without paying for a lawyer. Tenants, employees, freelancers, and small businesses routinely sign one-sided contracts containing illegal deposit forfeitures, void non-competes, uncapped indemnities, and unilateral termination rights, without understanding them.

**CounterDraft is a GenAI-powered solution for the "AI for Legal Assistance & Access" challenge.** It uses Google Gemini to explain, analyse, and answer questions about a user's own contract, and it keeps the model honest by grounding it in the document and in a curated corpus of Indian statutes and Supreme Court precedents. It provides information and assistance, not legal advice, and it ends every journey by helping the user prepare for a real advocate.

### How each suggested use case is covered

| Challenge use case | CounterDraft feature | GenAI role |
|---|---|---|
| Simplifying complex legal documents | **Explain Simply** on every clause, in English, Hindi, Bengali, Marathi, Tamil, Telugu, Kannada, or Gujarati; plain-terms summary for every clause | Gemini rewrites each clause at a ~12-year-old reading level, with key points, the biggest risk, and questions to ask |
| Comparing contracts, agreements, or policies | **Contract Comparator & Redline**: clause-by-clause diff with favourability shift | Statutory engine scores each deviation for the user |
| Highlighting important clauses, obligations, risks, or inconsistencies | **Clause Risk Auditor**: high/caution/standard/favourable ratings, rationale, statute, and precedent for every clause | Gemini analyses every uploaded clause, extracts obligations, and writes a balanced counter-proposal |
| Answering questions based on provided legal documents | **Ask Gemini: Grounded Q&A** | Gemini answers only from the contract; quotes are verified verbatim server-side and unverifiable ones are dropped |
| Helping users understand their options and next steps | **Your Next Steps** on the audit summary, **Negotiation Playbook** with a ready-to-send email | Gemini generates 3-5 practical next steps, including when to see an advocate |
| Generating summaries, checklists, or other actionable outputs | Executive summary, **Compliance Checklist** (pre-signing / active term / exit) with `.txt` export | Gemini's extracted obligations become checklist items |
| Helping users prepare questions for a legal professional | **Lawyer Consultation Brief**: printable 1-page memo with prioritised risks and questions | Built from the (AI-enriched) audit |

---

## 2. Approach: Grounded GenAI

Pure LLM legal tools hallucinate citations and can be steered by text hidden inside a contract. Pure rule engines are safe but rigid. CounterDraft combines the two:

1. **Deterministic segmentation first.** The contract is split into clauses in the browser. The verbatim clause text is never rewritten by the model, so what the user reads as "the contract" is always the real contract.
2. **Gemini for understanding.** The clauses are sent to Google Gemini (through a server function that holds the API key) to produce plain-language explanations, risk ratings, rationale, obligations, counter-proposals, next steps, and grounded answers.
3. **Verification after generation.** The server checks every model output before it reaches the user:
   - Q&A quotes must appear **verbatim** in the cited clause, or they are discarded (the UI says how many were removed).
   - Case citations must match the **curated precedent corpus** (*Percept D'Mark*, *Kailash Nath*, *Brojo Nath Ganguly*, and others), or they are dropped.
   - Clause numbers, risk levels, and categories are validated against the input and allowed values.
4. **Prompt-injection defence.** Contract text and questions are fenced as untrusted data, closing tags inside user text are neutralised, and the system instruction forbids following embedded instructions.
5. **Graceful degradation.** If Gemini is unavailable, rate-limited, or switched off by the user, every feature falls back to the offline statutory rule engine (Indian Contract Act, 1872; Transfer of Property Act, 1882), and the UI labels which engine produced each result.
6. **Transparent provenance.** Each audit and answer carries a badge: *Gemini GenAI · grounded*, *Statutory rule engine*, or *Curated expert analysis* (for the bundled sample contracts).

---

## 3. How the Solution Works

```
[ User: paste / upload .txt or .md ]
          |
          v
[ Browser: sanitisation & size caps ] --> 2 MB file cap, control-char & script stripping
          |
          v
[ Browser: clause segmentation ] --> verbatim clauses (never rewritten)
          |                                   |
          |  GenAI on (default, with consent) |  GenAI off / unavailable
          v                                   v
[ POST /api/genai  (Vercel Function) ]   [ Offline statutory rule engine ]
  - schema & size validation, rate limit   - ICA 1872 / TPA 1882 heuristics
  - injection-fenced prompt -> Google Gemini
  - verify quotes & precedents, clamp enums
          |                                   |
          +---------------+-------------------+
                          v
[ Workspaces ]
  - Clause Risk Auditor + Explain Simply (8 languages)   - Ask Gemini: Grounded Q&A
  - Negotiation Playbook & exposure maths                 - Contract Comparator
  - Compliance Checklist (incl. extracted obligations)    - Precedent Navigator
  - Lawyer Consultation Brief (print-ready)
```

---

## 4. Key Assumptions Made

1. **Jurisdiction**: Indian contract law (*Indian Contract Act, 1872*, *Transfer of Property Act, 1882*, *Specific Relief Act, 1963*, and Supreme Court precedent).
2. **Language**: Contracts are assumed to be in English (the norm for Indian commercial, tenancy, and employment agreements); explanations can be generated in 8 Indian languages.
3. **Informational mandate**: CounterDraft informs and assists; it does not give legal advice or create an attorney-client relationship, and it directs users to an enrolled advocate.
4. **Input format**: Plain text (`.txt`, `.md`) or pasted text. Word and PDF files should be copied and pasted, since binary formats cannot be read faithfully in the browser.
5. **GenAI availability**: A `GEMINI_API_KEY` is configured on the server. Without it the app still works using the offline rule engine.

---

## Core Capabilities & Modules

| Module | Core Functionality | Statutory Grounding |
|---|---|---|
| **[Clause Risk Auditor](docs/USER_MANUAL.md#step-2-clause-risk-auditor-auditor)** | Evaluates clauses into High, Caution, Standard, and Favorable tiers; provides plain-language translations and 1-click statutory redline counter-proposals. | Indian Contract Act 1872 (Sec 23, 27, 74); Transfer of Property Act 1882 (Sec 108) |
| **[Side-by-Side Comparator](docs/USER_MANUAL.md#step-3-side-by-side-contract-comparator-comparator)** | Computes clause-by-clause diffs between baseline agreements and counterparty markups, quantifying net favorability shifts. | Contractual deviation and adhesion analysis |
| **[Negotiation Playbook](docs/USER_MANUAL.md#step-4-negotiation-playbook--financial-exposure-playbook)** | Quantifies financial liabilities (deposit confiscation, lock-in wages, compounding penalties) and compiles a ready-to-send negotiation letter. | Supreme Court liquidated damages benchmark (*Kailash Nath*) |
| **[Judicial Precedent Navigator](docs/STATUTORY_REFERENCE.md#3-landmark-judicial-authorities-digest)** | Curated repository of landmark appellate authorities (*Percept D'Mark*, *Kailash Nath*, *Brojo Nath Ganguly*, *Golikari*, *Vidya Drolia*). | Supreme Court of India jurisprudence |
| **[Ask Gemini: Grounded Q&A](docs/USER_MANUAL.md#step-5-grounded-document-qa-qa)** | Google Gemini answers questions from the contract only, with verbatim quotes verified server-side, statutory rights notes, and follow-up questions. | Codified Indian statutory law + curated precedents |
| **Explain Simply (GenAI)** | Plain-language explanation of any clause in 8 Indian languages, with key points, the main risk, and questions to ask. | Google Gemini, grounded in the clause text |
| **[Counsel Brief Generator](docs/USER_MANUAL.md#step-7-counsel-brief-generator-counsel)** | Generates an editorial 1-page printable legal memorandum organizing high-priority risks and interrogation questions for an advocate consultation. | Dedicated print stylesheet (`@media print`) |
| **[Actionable Safeguard Checklist](docs/USER_MANUAL.md#step-6-compliance--safeguard-checklist-checklist)** | Three-phase compliance tracker (Pre-Signing, Active Term, Exit/Termination) with `.txt` export. | Risk management best practices |

---

## Comprehensive Documentation Directory

The project includes an exhaustive technical and legal documentation suite:

### Developer & Technical Documentation
- **[System Architecture](docs/ARCHITECTURE.md)**: Grounded GenAI pipeline, the `/api/genai` gateway, data flow, state management, and memory safety boundaries.
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
- Node.js v20 or higher (CI runs Node 22)
- npm v9 or higher
- A Google Gemini API key (optional: without it the app uses the offline rule engine)

```bash
# Clone the repository
git clone https://github.com/Kalpesh-ops/CounterDraft.git
cd CounterDraft

# Install dependencies
npm install

# Configure Google Gemini (get a key at https://aistudio.google.com/apikey)
cp .env.example .env.local   # then set GEMINI_API_KEY

# Start local development server (also serves POST /api/genai)
npm run dev

# Run Vitest test suite
npm test

# Run with enforced coverage thresholds
npm run test:coverage

# Compile production bundle
npm run build
```

### Deploying to Vercel

1. Import the repository in Vercel (framework preset: Vite).
2. Add the environment variable `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) under **Settings > Environment Variables**.
3. Deploy. The static app and the `/api/genai` function deploy together; the key never reaches the browser.

### Testing

`npm test` runs 82 Vitest tests (`npm run test:coverage` enforces thresholds; ~91% line coverage) covering the statutory engine, input sanitisation, the GenAI gateway (validation, prompt-injection fencing, quote and precedent verification, cross-site request blocking, HTTP handling, and rate limiting, with Gemini mocked), the GenAI client merge and fallback logic, accessible dialogs (focus trap, Escape, focus restore), the Gemini upload, Q&A and Explain Simply flows including failure fallbacks and opt-out, every workspace (auditor, comparator, checklist, counsel brief, negotiation email, precedents), file-upload guards, the error boundary, and UI navigation. CI also runs `npm audit`, Oxlint (with jsx-a11y rules), and a strict typecheck.

---

## Privacy & Data Handling

- **No document database**: CounterDraft never stores contracts, questions, or outputs. There is no telemetry or analytics.
- **User choice**: Clause text goes to Google Gemini only when GenAI features are used. Users can untick GenAI at upload to keep all processing in the browser.
- **Key isolation**: The Gemini API key lives only in the server environment; the browser talks to `/api/genai` on the same origin (`connect-src 'self'`).
- **Honest disclosure**: On the Gemini API free tier, Google may use submitted content to improve its products. The in-app privacy policy says so and advises removing names, addresses, and account numbers.
- **Zero web storage**: `localStorage` and `sessionStorage` are not used.

## Community Standards & Repository Governance

CounterDraft adheres to open source best practices and GitHub Community Standards:
- **[Code of Conduct](CODE_OF_CONDUCT.md)**: Community standards and pledge based on Contributor Covenant v2.1.
- **[Contributing Guidelines](CONTRIBUTING.md)**: Guidelines for bug reports, statutory rule proposals, PR checklists, and engineering invariants.
- **[Security Policy](SECURITY.md)**: Supported versions, responsible vulnerability disclosure protocols, and response SLAs.
- **[MIT License](LICENSE)**: Permissive open source license for community adoption and transparency.

---

## Statutory Disclaimer

CounterDraft provides legal document intelligence and clause comprehension assistance for informational and educational purposes only. It does not provide formal legal representation or create an attorney-client relationship. All evaluations, redline proposals, and statutory summaries should be verified with an enrolled advocate or qualified legal practitioner prior to contract execution.
