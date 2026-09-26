# CounterDraft Developer Guide

> Engineering standards, local development workflows, and design invariants.

---

## 1. Prerequisites & Environment Setup

- **Node.js**: v18.0.0 or higher (v24.x recommended)
- **Package Manager**: npm v9.0.0 or higher
- **TypeScript**: v5.9+ with strict mode enabled

### Local Installation

```bash
# Clone the repository
git clone https://github.com/Kalpesh-ops/CounterDraft.git
cd CounterDraft

# Install dependencies
npm install

# Start local development server (Vite HMR)
cp .env.example .env.local   # add GEMINI_API_KEY for GenAI features
npm run dev
```

The application will be served at `http://localhost:5173/`.

---

## 2. Testing & Quality Assurance

CounterDraft uses **Vitest** with **Testing Library** (84 tests) and enforces coverage thresholds in CI (statements 85%, lines 85%, functions 80%, branches 70%; current: ~88% statements, ~91% lines):

```bash
npm test                 # full suite, single run
npm run test:coverage    # suite + v8 coverage report with enforced thresholds
npm run typecheck        # strict TypeScript across app, server, and tooling
npm run lint             # Oxlint: correctness, React hooks, jsx-a11y, TypeScript rules
npm run audit:deps       # npm audit at moderate severity (also run in CI)
```

### Test Suite Structure
- `src/utils/security.test.ts`: XSS neutralisation, payload caps, control-character removal, ReDoS resilience, clipboard fallbacks.
- `src/services/legalEngine.test.ts`: statutory clause risk evaluation, contract parsing, grounded Q&A retrieval, financial exposure maths.
- `src/services/genai.test.ts`: merging Gemini insights without altering verbatim clause text, gateway error handling for fallback.
- `server/genai.test.ts`: request validation, prompt-injection fencing, verbatim-quote and precedent verification, cross-site blocking, trusted client IP, rate limiting, and HTTP status mapping (Gemini mocked).
- `api/genai.test.ts`: the Vercel Function adapter and its configuration.
- `src/components/GenAIFeatures.test.tsx`: accessible dialogs (focus trap, Escape, focus restore), Gemini upload/Q&A/Explain Simply flows, failure fallbacks, GenAI opt-out, response caching.
- `src/components/Workspaces.test.tsx`: auditor filters and keyboard expansion, comparator custom diffs and errors, checklist progress/add/export, counsel brief copy/print, negotiation email, precedent search, file-upload guards, error boundary recovery.
- `src/components/App.test.tsx`: end-to-end tab navigation and policy dialogs.

---

## 3. Production Build & Validation

```bash
# Type-check with tsc and produce optimized Vite production bundle
npm run build

# Preview production build locally
npm run preview

# Execute fast linter (Oxlint)
npm run lint
```

### Performance Practices
- **Code splitting**: six secondary workspaces and all three dialogs are `React.lazy` chunks; React ships in a separate long-cached `react-vendor` chunk (initial app chunk ~89 KB).
- **Memoisation**: derived data (`useMemo`), stable handlers (`useCallback`), and `React.memo` on the header and provenance badge prevent needless re-renders.
- **Network**: Gemini explanations are cached per clause and language; in-flight requests are aborted on unmount; only used font weights are loaded.
- **Server**: precedent match keys are precomputed once; oversized bodies are rejected from `Content-Length` before buffering.

---

## 4. The 30 Negative Design Constraints (Mandatory Invariants)

CounterDraft's visual identity reflects a classical, authoritative legal publishing aesthetic (warm archival paper, deep ink typography, zero frivolous software tropes). **All developers must strictly comply with the following 30 negative constraints:**

| # | Prohibited Pattern | Required Design Standard |
|---|---|---|
| **1** | Harsh, saturated neon gradients | Subtle parchment tones (`#f8f6f0`, `#f0ede1`, `#ece7d5`). |
| **2** | Lucide / Feather icon libraries | Bespoke geometric SVG legal icon suite in `Icons.tsx`. |
| **3** | Pure white (`#ffffff` / `#fff`) page backgrounds | Archival warm paper (`#f8f6f0`). |
| **4** | Rainbow accent palettes | Curated terracotta (`#8b2500`), forest (`#2d4a22`), and ink (`#1a1a18`). |
| **5** | Drop shadows (`box-shadow`) | `box-shadow: none !important;` sharp editorial borders. |
| **6** | 3 feature cards in a row | Balanced 2-column or full-width editorial ledgers. |
| **7** | Emojis anywhere in UI or copy | Serious, formal legal prose and clean iconography. |
| **8** | Liquid glass / backdrop-filter blur | Solid, opaque paper surfaces (`var(--bg-card)`). |
| **9** | Em dashes (`\u2014`) | Classical typographic hyphens or semicolons. |
| **10** | Inter / Geist / Space Grotesk fonts | Newsreader (serif), IBM Plex Serif, and IBM Plex Mono. |
| **11** | Colored left accent stripes (`border-left`) | Full rectangular borders or top risk borders (`border-top: 3px`). |
| **12** | Fake user testimonials | Real statutory analysis and Supreme Court citations. |
| **13** | Bento grid layouts | Clean columnar dockets and legal brief sheets. |
| **14** | Faux terminal / macOS window chrome | Authentic legal docket tables and citation cards. |
| **15** | "It's not X, it's Y" marketing clichés | Direct, precise legal literacy explanations. |
| **16** | Checkmark bullet icons | Clean numbered lists or typographic bullets. |
| **17** | 3-tier SaaS pricing cards | Free public legal intelligence engine. |
| **18** | Placeholder / mock text | Real, verifiable Indian legal statutes and precedents. |
| **19** | Rounded corners (`border-radius`) | Sharp corners (`border-radius: 0px !important`). |
| **20** | Purple and black SaaS palettes | Warm parchment `#f8f6f0` and deep carbon ink `#1a1a18`. |
| **21** | Shimmer / skeleton loaders | Discrete mono processing indicators or instant state updates. |
| **22** | Radial glow orbs / mesh gradients | Flat, crisp editorial paper textures. |
| **23** | Background dot grids | Clean, unblemished archival paper surfaces. |
| **24** | Sparkle / magic AI stars | Scales of Justice, Gavel, and Document emblems. |
| **25** | Animated bouncing arrows | Static, clear navigational links and tabs. |
| **26** | Placeholder TOS or Privacy Policy | Real, comprehensive statutory disclaimers. |
| **27** | Hover scale transforms (`scale(1.05)`) | Instant underline or background tone shifts. |
| **28** | Basic pastel colors | Deep mineral tones (crimson, amber, olive, ink). |
| **29** | External analytics / telemetry scripts | Zero external tracking; GenAI calls only through the same-origin `/api/genai` gateway. |
| **30** | Unescaped HTML rendering | React JSX text escaping; zero `dangerouslySetInnerHTML`. |

---

## 5. Coding Principles

1. **Strict TypeScript Typing**:
   - Always import types with `import type { ... }` (`verbatimModuleSyntax` compliant).
   - Never use `any`; use typed domain interfaces from `src/types/legal.ts`.
2. **ReDoS-Immune Operations**:
   - Avoid nested repeating regular expressions.
   - Use linear `string.includes()` or non-overlapping tokenizers.
3. **Graceful Error Handling**:
   - Wrap asynchronous APIs (like `navigator.clipboard.writeText`) in try/catch or use `safeCopyToClipboard()`.
   - Never allow unhandled promise rejections.
