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
git clone https://github.com/kalpeshparashar/counterdraft.git
cd counterdraft

# Install dependencies
npm install

# Start local development server (Vite HMR)
npm run dev
```

The application will be served at `http://localhost:5173/`.

---

## 2. Testing & Quality Assurance

CounterDraft maintains comprehensive unit and integration test coverage using **Vitest**:

```bash
# Execute full test suite in single-run mode
npm test -- --run

# Run tests in continuous watch mode during development
npm test

# Run tests with coverage reporting
npm test -- --coverage
```

### Test Suite Structure
- `src/utils/security.test.ts`: Validates XSS neutralization, payload caps, control character removal, ReDoS resilience, and clipboard fallbacks.
- `src/services/legalEngine.test.ts`: Verifies statutory clause risk evaluation, contract parsing, grounded Q&A snippet extraction, and financial exposure calculations.
- `src/components/App.test.tsx`: End-to-end integration tests verifying tab navigation, document switching, modal dialogs, and custom contract comparison workflows.

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
| **29** | External analytics / telemetry scripts | Zero external tracking; 100% client-side privacy. |
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
