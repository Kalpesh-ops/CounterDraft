# Frequently Asked Questions (FAQ)

> Comprehensive technical and legal FAQ for CounterDraft users, advocates, and developers.

---

## 1. Technical & Privacy Questions

### Q1: Where does my uploaded contract go? Does CounterDraft store my documents on a server?
**Answer**: No. CounterDraft operates under a strict **Zero-Cloud-Retention** architectural invariant. All document ingestion, parsing, comparison, and brief compilation happen 100% locally inside your browser's JavaScript engine. No document text, queries, or generated letters are ever transmitted to or stored on external servers or databases.

### Q2: What file formats and sizes are supported for contract upload?
**Answer**: CounterDraft supports plain text files (`.txt`, `.md`, `.rtf`), Microsoft Word documents saved as text (`.doc`, `.docx`), and JSON contract exports up to 2 MB. You can also copy and paste contract text directly into the custom ingestion window.

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
