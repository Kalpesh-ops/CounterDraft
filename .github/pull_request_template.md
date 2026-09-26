## Summary of Changes

Briefly explain the intent, rationale, and scope of this Pull Request.

Fixes #(issue)

---

## Type of Change

- [ ] Bug fix (non-breaking change fixing an issue or parsing glitch)
- [ ] New feature or legal workflow module
- [ ] Statutory rule, case precedent, or redline improvement
- [ ] Performance optimization or security hardening
- [ ] Documentation enhancement

---

## Technical & Legal Verification Checklist

Please verify that your contribution meets all standards before submitting:

- [ ] **TypeScript Strict Mode**: Code compiles cleanly with `tsc -b && vite build` (zero type errors).
- [ ] **Tests Passing**: All unit and integration tests pass via `npm test -- --run`.
- [ ] **New Tests Added**: Added appropriate test coverage in `src/utils/security.test.ts` or `src/services/legalEngine.test.ts`.
- [ ] **Negative Design Constraints Checked**: Confirmed that **none** of the 30 prohibited design patterns are present (no emojis, no em dashes, `#f8f6f0` warm paper palette maintained, `box-shadow: none !important`, sharp corners, no Lucide icons).
- [ ] **Privacy Invariant Preserved**: Confirmed zero outbound network telemetry, remote analytics, or server persistence is introduced.
- [ ] **Legal Citations Verifiable**: Any statutory references or court precedents cite official legal reporters (SCC, SCR, or AIR).

---

## Screenshots or Diff Summary (if applicable)

*If modifying UI layouts or printed sheets, provide a brief description of the visual changes.*
