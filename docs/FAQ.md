# Frequently Asked Questions (FAQ)

> Comprehensive technical and legal FAQ for CounterDraft users, advocates, and developers.

---

## 1. Technical & Privacy Questions

### Q1: Where does my uploaded contract go? Does CounterDraft store my documents on a server?
**Answer**: CounterDraft never stores your documents; there is no database. Clause segmentation, comparison, checklists, and briefs run in your browser. When you use the GenAI features (AI audit, Ask Gemini, Explain Simply), the relevant clause text and your question are sent over HTTPS to our server function and on to Google Gemini, then discarded by CounterDraft. You can untick GenAI at upload to keep everything on your device. On the Gemini free tier Google may use submitted content to improve its products, so remove names, addresses, and account numbers first.

### Q2: What file formats and sizes are supported for contract upload?
**Answer**: Plain-text files (`.txt`, `.md`) up to 2 MB. For Word or PDF contracts, open the file, copy the text, and paste it into the upload window: binary formats cannot be decoded faithfully in the browser.

### Q3: How does CounterDraft protect against web vulnerabilities like XSS and Clickjacking?
**Answer**: CounterDraft implements defense-in-depth:
- Zero usage of unsafe DOM sinks (`dangerouslySetInnerHTML`, `innerHTML`, `document.write`).
- Multi-layer input sanitization stripping `<script>`, control characters, and prototype pollution keys.
- Frame-busting client scripts and HTTP headers (`X-Frame-Options: DENY`, `frame-ancestors 'none'`) preventing Clickjacking.
- Strict Content Security Policy (`connect-src 'self'`) restricting unauthorized network egress.

---

## 2. Legal & Statutory Questions

### Q4: Are post-employment non-compete clauses legally binding in India?
**Answer**: Under Section 27 of the Indian Contract Act, 1872, every agreement in restraint of a lawful profession, trade, or business is void ab initio. The Supreme Court of India in *Percept D'Mark (India) v. Zaheer Khan (2006)* firmly established that post-termination non-competes are completely unenforceable in India, regardless of whether the employee signed the contract. Restrictive covenants are only valid during the active term of employment (*Niranjan Shankar Golikari v. Century Spinning*).

### Q5: Can my landlord legally keep my full security deposit if I vacate before the lease expires?
**Answer**: No. Under Section 74 of the Indian Contract Act, 1872 as interpreted by the Supreme Court in *Kailash Nath Associates v. DDA (2015)*, a party cannot forfeit a deposit as a penal measure without establishing actual financial damage. Deductions must be limited to verified unpaid rent, unpaid utility bills, or proven physical damage beyond ordinary wear and tear.

### Q6: What is a lock-in period, and can I be forced to pay all remaining months if I leave early?
**Answer**: A lock-in clause seeks to guarantee occupancy for a fixed minimum duration (e.g. 6 or 12 months). While commercial leases often enforce accelerated rent provisions, Indian courts require landlords to make reasonable efforts to mitigate their losses by finding replacement tenants. Accelerated rent clauses that demand 100% of remaining rent without proof of injury can be contested as unreasonable penalties under Section 74.

### Q7: Does using CounterDraft create an attorney-client relationship?
**Answer**: No. CounterDraft is an automated informational intelligence and contract comprehension engine. It provides statutory literacy, risk categorization, and negotiation redlines, but it does not provide formal legal representation or jurisdictional counsel. You should always review critical agreements with an enrolled advocate before final execution.

### Q8: How should I use the generated Counsel Brief?
**Answer**: Print or export the Counsel Brief before meeting with an advocate. It organizes high-priority risks, missing safeguards, and targeted questions, allowing your advocate to immediately focus on the most dangerous clauses without billing you for hours of basic document review.
