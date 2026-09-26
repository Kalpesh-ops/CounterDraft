# Contributing to CounterDraft

Thank you for your interest in contributing to CounterDraft! We are committed to making legal information accessible, demystifying asymmetrical drafting, and protecting signatory rights.

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in this community.

---

## 1. How to Contribute

You can contribute in several meaningful ways:
1. **Reporting Bugs**: Found an edge case in parsing, an unhandled clause structure, or a UI bug? File an issue using our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yml).
2. **Proposing Statutory Rules or Precedents**: Have expertise in Indian contract law or tenancy legislation? Suggest new statutory benchmarks or landmark High Court/Supreme Court citations using our [Precedent Proposal Template](.github/ISSUE_TEMPLATE/statutory_precedent_proposal.yml).
3. **Submitting Pull Requests**: Implement bug fixes, performance enhancements, or new legal templates.

---

## 2. Development Setup & Workflow

### Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### Local Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/counterdraft.git
cd counterdraft

# 2. Install dependencies
npm install

# 3. Start local development server with Vite HMR
npm run dev

# 4. Run the test suite
npm test -- --run

# 5. Verify the production build
npm run build
```

---

## 3. Engineering & Code Quality Standards

All pull requests must adhere to our engineering invariants:

1. **Strict TypeScript**:
   - `verbatimModuleSyntax` must be respected (use `import type { ... }` for types).
   - Zero use of `any`; all models must use domain interfaces from `src/types/legal.ts`.
2. **ReDoS & Algorithmic Safety**:
   - Regular expressions must use non-overlapping, bounded patterns.
   - Core token matching should be linear $O(N)$ to avoid freezing the browser.
3. **The 30 Negative Design Constraints**:
   - CounterDraft adheres to a classical archival paper publishing aesthetic (`#f8f6f0` background, deep ink typography, sharp borders).
   - **Prohibited**: Emojis, em dashes (`\u2014`), pure white (`#fff`) page backgrounds, drop shadows (`box-shadow`), Lucide icons, neon gradients, rounded corners (`border-radius: 0px`), or fake testimonials.
4. **Zero-Server Invariant**:
   - Never introduce outbound network telemetry, remote analytics scripts, or cloud logging. All document intelligence must execute client-side.

---

## 4. Statutory & Case Law Standards

When proposing or editing legal engine rules in `src/services/legalEngine.ts` or `src/data/courtPrecedents.ts`:
- **Statutes**: Cite specific section numbers and official legislation titles (e.g. *Section 27, Indian Contract Act, 1872* or *Section 108(c), Transfer of Property Act, 1882*).
- **Precedents**: Citations must be verifiable appellate authorities with official law report citations (e.g. *(2006) 4 SCC 227* or *(2015) 4 SCC 136*).
- **Bilateral Redlines**: Counter-proposals must be balanced, commercially viable, and practical.

---

## 5. Pull Request Guidelines

1. Ensure all tests pass cleanly:
   ```bash
   npm test -- --run
   ```
2. Verify production bundle build:
   ```bash
   npm run build
   ```
3. Run linter:
   ```bash
   npm run lint
   ```
4. Open a Pull Request referencing the related issue using our [Pull Request Template](.github/pull_request_template.md).
