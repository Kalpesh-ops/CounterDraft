# Security Policy

CounterDraft takes the security, confidentiality, and integrity of legal document intelligence seriously. As a 100% client-side application, we enforce strict local-first privacy guarantees to protect sensitive commercial and personal agreements.

---

## 1. Supported Versions

We provide security patches and dependency updates for the current major release:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

---

## 2. Reporting a Vulnerability

If you discover a security vulnerability, potential cross-site scripting (XSS) vector, Regular Expression Denial of Service (ReDoS) vulnerability, or client-side data leakage issue, please report it responsibly:

- **Email**: Send vulnerability reports directly to [security@counterdraft.legal](mailto:security@counterdraft.legal).
- **GitHub Security Advisory**: You may also submit a private report via GitHub's [Advisory Submission](https://github.com/Kalpesh-ops/CounterDraft/security/advisories/new) interface.

### What to Include in Your Report
To help us triage and remediate the issue promptly, please include:
1. Type of vulnerability (e.g. DOM XSS, ReDoS, Clickjacking bypass).
2. Step-by-step instructions or minimal proof-of-concept payload demonstrating the issue.
3. Affected components, files, or browser environments.
4. Any potential mitigations or suggested fixes.

### Response Timeline
- **Initial Response**: Within 24 to 48 hours of receipt.
- **Triage & Assessment**: Within 5 business days.
- **Remediation & Patch**: Released within 14 days of confirmed reproduction.

Please **do not** file public GitHub issues for sensitive security vulnerabilities until a patched release has been published.

---

## 3. Core Architectural Security Invariants

- **Zero Cloud Persistence**: CounterDraft never uploads, transmits, or stores user contract text, search queries, or generated letters on remote servers.
- **Strict Content Security Policy**: Network egress is restricted via `connect-src 'self'`.
- **Zero DOM Sinks**: `dangerouslySetInnerHTML`, `innerHTML`, and `document.write` are strictly prohibited.
- **Anti-Clickjacking**: Enforced via `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`, and active client-side frame-busting scripts.
- **Pre-Read File Boundaries**: Files are validated before reading into memory, capped at 2 MB with strict MIME/extension whitelisting.

---

## 4. RFC 9116 Disclosure Standard

CounterDraft maintains machine-readable vulnerability disclosure metadata at:
- `/.well-known/security.txt`
- `/security.txt`
