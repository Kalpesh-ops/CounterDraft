# CounterDraft | Legal Intelligence & Clause Negotiation Engine

> **Accessible, privacy-first legal document intelligence, clause risk auditing, side-by-side contract comparison, and statutory counter-proposal drafts grounded in Indian statutory law and landmark Supreme Court jurisprudence.**

[![CI/CD Pipeline](https://github.com/kalpeshparashar/counterdraft/actions/workflows/ci.yml/badge.svg)](https://github.com/kalpeshparashar/counterdraft/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Cloud Retention](https://img.shields.io/badge/Privacy-Zero_Cloud_Retention-2d4a22.svg)](#privacy--zero-server-model)
[![Tests Passing](https://img.shields.io/badge/Tests-32%20passing-brightgreen.svg)](#testing)

---

## Overview

Legal agreements are inherently asymmetrical. Corporate landlords, dominant employers, and enterprise software vendors deploy standardized adhesion contracts packed with unilateral termination rights, unliquidated deposit forfeiture clauses, post-tenure non-competes, and one-sided indemnity waivers.

**CounterDraft** is an autonomous legal intelligence system built to level this playing field for prospective signatories—tenants, employees, independent contractors, and MSMEs. Operating on a **100% client-side, local-first architecture**, it translates dense contractual legalese into structured risk analysis, quantifiable financial exposures, balanced counter-proposals, and formal consultation briefs for advocates.

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
