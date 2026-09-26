# CounterDraft System Architecture

> Internal technical specification for developers and maintainers.  
> *Note: This document is for repository developers and is not exposed in the end-user web UI.*

---

## 1. Architectural Philosophy: Grounded GenAI

CounterDraft is a **GenAI legal assistant** built as a React 19 + TypeScript (strict mode) + Vite single-page application with one serverless function:

- **Browser**: sanitisation, clause segmentation, the offline statutory rule engine, all seven workspaces, and printing/export.
- **`POST /api/genai`** (`api/genai.ts` -> `server/genai.ts`): validates requests, rate-limits, builds injection-fenced prompts, calls **Google Gemini** (`generateContent`, JSON mode) with the server-held `GEMINI_API_KEY`, and verifies the output (verbatim quote check, curated-precedent check, enum and clause-number validation) before returning it.
- **Tasks**: `analyze` (clause-by-clause audit, obligations, next steps), `qa` (grounded answers with verified citations), `simplify` (plain-language explanation in 8 Indian languages).
- **Fallback**: if the function is unreachable, unconfigured, or rate-limited, the browser uses the deterministic `LegalEngine` and labels the result "Statutory rule engine".

The diagram below shows the in-browser layer; the GenAI gateway sits between the React modules and Google Gemini.

```
                      +---------------------------------------+
                      |          User Browser Client          |
                      |                                       |
                      |   +-------------------------------+   |
                      |   |     React 19 Presentation     |   |
                      |   |    (7 Specialized Modules)    |   |
                      |   +---------------+---------------+   |
                      |                   |                   |
                      |   +---------------v---------------+   |
                      |   |      LegalEngine Service      |   |
                      |   |  - analyzeClauseRisk()        |   |
                      |   |  - compareCustomDocuments()   |   |
                      |   |  - calculateFinancialExp()    |   |
                      |   |  - queryDocumentGrounded()    |   |
                      |   +---------------+---------------+   |
                      |                   |                   |
                      |   +---------------v---------------+   |
                      |   |    Security & Sanitization    |   |
                      |   |  - Linear Regex / ReDoS Guard |   |
                      |   |  - Ingestion Ceiling (2MB)    |   |
                      |   |  - HTML / Script Neutralizer  |   |
                      |   +---------------+---------------+   |
                      |                   |                   |
                      |   +---------------v---------------+   |
                      |   |     In-Memory State Store     |   |
                      |   |    (Transient React State)    |   |
                      |   +-------------------------------+   |
                      |                                       |
                      +---------------------------------------+
                                          |
                      ====================X====================
                                NO NETWORK OUTBOUND
                           (Zero Server Persistence)
```

### Privacy & Confidentiality Invariant
- **Zero Cloud Transmission**: Contracts, counter-proposals, queries, and advocate briefs remain exclusively in browser memory.
- **Zero Web Storage**: `localStorage` and `sessionStorage` are intentionally bypassed to prevent unencrypted document retention or scraping by rogue browser extensions.
- **Strict Network Egress**: Enforced via Content Security Policy (`connect-src 'self'`).

---

## 2. Directory Layout & Module Structure

```
legal-pw-f/
├── .github/workflows/       # CI/CD pipelines (Lint, Test, Build, Deploy)
├── docs/                    # Internal developer & legal documentation
│   ├── ARCHITECTURE.md      # System data flow & architecture (this file)
│   ├── DEVELOPER_GUIDE.md   # Setup, test, build, and styling rules
│   ├── LEGAL_ENGINE.md      # Statutory heuristics & precedent math
│   ├── SECURITY_AUDIT.md    # Vulnerability threat modeling & audit
│   ├── STATUTORY_REFERENCE.md # Indian legal codification handbook
│   ├── USER_MANUAL.md       # Signatory workflow guide
│   ├── FAQ.md               # Legal & technical FAQ
│   └── blog/                # Authoritative legal analysis explainers
├── api/
│   └── genai.ts             # Vercel Function: POST /api/genai (Gemini gateway)
├── server/
│   ├── genai.ts             # Validation, prompts, Gemini call, output verification
│   └── genai.test.ts        # Gateway tests (Gemini mocked)
├── public/                  # Static assets & SEO discovery standards
│   ├── favicon.svg          # Scales of justice vector emblem
│   ├── llms.txt             # LLM context manifest (llmstxt.org)
│   ├── llms-full.txt        # Deep legal prompt grounding context
│   ├── manifest.webmanifest # PWA metadata
│   ├── og-image.svg         # Social share card
│   ├── robots.txt           # Search & AI crawler directives
│   ├── security.txt         # RFC 9116 security disclosure
│   └── sitemap.xml          # Search engine sitemap protocol
├── src/
│   ├── components/          # UI modules adhering to 30 negative constraints
│   │   ├── ActionChecklist.tsx       # Pre-signing & exit milestone tracker
│   │   ├── ContractComparator.tsx    # Side-by-side diffing engine
│   │   ├── CounselBriefGenerator.tsx # Advocate consultation memorandum
│   │   ├── DocumentAuditor.tsx       # Clause breakdown & redline generator
│   │   ├── DocumentUploader.tsx      # Ingestion & file validator
│   │   ├── ErrorBoundary.tsx         # Runtime fault isolation
│   │   ├── GroundedQA.tsx            # Anchored document search
│   │   ├── Header.tsx                # Masthead & navigation
│   │   ├── Icons.tsx                 # Bespoke SVG legal icon suite
│   │   ├── NegotiationPlaybook.tsx   # Financial exposure & pushback letter
│   │   ├── PrecedentNavigator.tsx    # Appellate case law index
│   │   ├── PrivacyModal.tsx          # Zero-retention privacy policy
│   │   └── TermsModal.tsx            # Statutory disclaimer of representation
│   ├── data/
│   │   ├── courtPrecedents.ts        # Landmark Supreme Court case database
│   │   └── sampleContracts.ts        # Preloaded commercial & lease agreements
│   ├── services/
│   │   └── legalEngine.ts            # Core statutory evaluation & diff engine
│   ├── types/
│   │   └── legal.ts                  # Domain type models & schemas
│   ├── utils/
│   │   └── security.ts               # Sanitization, ReDoS guard, clipboard fallback
│   ├── App.tsx                       # Root container & workspace orchestrator
│   ├── index.css                     # Editorial typography & design tokens
│   └── main.tsx                      # Mount point & ErrorBoundary wrapper
├── index.html               # Semantic HTML5 entry, CSP, & JSON-LD
├── package.json             # Dependencies & test scripts
├── tsconfig.json            # Strict TypeScript configuration
└── vite.config.ts           # Bundler & Vitest test runner configuration
```

---

## 3. Core Engine Pipeline

### 3.1 Document Ingestion Pipeline
1. **User Action**: Drops a `.txt`, `.doc`, `.rtf`, or `.json` file, or pastes contract text.
2. **Pre-Read Inspection** (`DocumentUploader.tsx`):
   - Validates `file.size <= 2,097,152` bytes (2 MB) before allocating memory.
   - Verifies extension and MIME type against the whitelist.
3. **Payload Sanitization** (`validateContractPayload` in `security.ts`):
   - Removes null bytes (`\0`) and dangerous control characters (`[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]`).
   - Strips HTML tags, `<script>` blocks, inline event handlers, and prototype pollution keys.
   - Enforces length bounds (minimum 30 chars, maximum 1,000,000 chars).
4. **Segmentation & Parsing** (`parseCustomContract` in `legalEngine.ts`):
   - Applies linear non-backtracking regex to isolate clause numbers and titles.
   - Evaluates risk levels against statutory heuristics.
   - Generates operational obligations.
   - Computes composite risk score:
     $$\text{Score} = \min\left(95, \left\lfloor\frac{30 H + 15 C + 5 S}{T} \times 3.5\right\rfloor\right)$$
     *where $H$ = high-risk count, $C$ = caution count, $S$ = standard count, $T$ = total clauses.*

### 3.2 Side-by-Side Comparison Algorithm (`compareCustomDocuments`)
- Computes index-aligned pairwise clause comparison.
- Evaluates identical text vs. modified provisions.
- Quantifies net favorability shift based on newly introduced liabilities (e.g. baseline 'standard' altered to 'high').
- Accurately tracks inserted provisions (`status: 'added'`) and omitted protections (`status: 'removed'`).

### 3.3 Consultation Brief & Print Engine
- `generateCounselBrief` synthesizes top statutory risks with tailored questions for counsel.
- Print stylesheet (`@media print` in `index.css`) strips navigation chrome, tickers, and interactive buttons, rendering a clean, formal 1-page paper document for physical consultation.

---

## 4. State Management Model

CounterDraft utilizes localized, reactive React state (`useState`) without external Redux/Zustand overhead:
- Active Docket (`activeDocId` & `currentDoc` in `App.tsx`) propagates unidirectionally down to child modules.
- Dynamic custom comparisons (`pairsList` in `ContractComparator.tsx`) maintain immutability via prepend operators (`[newPair, ...prev]`).
- Transient modal states (`isUploadOpen`, `isTermsOpen`, `isPrivacyOpen`) mount lazily on first open and unmount cleanly when dismissed.
- Per-document workspaces are keyed by `currentDoc.id`, so switching contracts resets Q&A history and checklist state instead of leaking it across documents.
- Handlers passed to the memoised `Header` are wrapped in `useCallback`; derived collections use `useMemo`.

## 5. GenAI Request Lifecycle

1. The browser sends `{ task, ...payload }` to same-origin `POST /api/genai` (60 s client timeout, abortable).
2. `server/genai.ts` rejects cross-site requests, applies the per-client rate limit, enforces JSON and size limits, and validates the payload against task-specific schemas.
3. A task prompt is built with the curated precedent corpus in the system instruction and all user text fenced as untrusted data.
4. Gemini `generateContent` is called in JSON mode (temperature 0.2, 45 s timeout).
5. Output is normalised: clause numbers must exist in the request, enums are clamped, strings length-capped, quotes verified verbatim, precedents matched to the corpus.
6. The browser merges the result over the rule-engine analysis (verbatim text untouched) and labels its provenance; any failure falls back to the rule engine.
