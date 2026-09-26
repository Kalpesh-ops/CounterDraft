# CounterDraft Security Audit & Threat Model

> Technical security verification, threat matrix, and defensive architecture.

---

## 1. Threat Profile for Client-Side Legal Intelligence

Legal documents contain confidential commercial agreements, compensation data, intellectual property assignments, and personal identifying information. The threat model addresses three primary attack categories:

1. **Client-Side Code Execution & DOM Manipulation**: Ingestion of adversarial contract payloads attempting Cross-Site Scripting (XSS), script gadget injection, or prototype pollution.
2. **Denial of Service (DoS) & Memory Exhaustion**: Maliciously oversized files, polyglots, or catastrophic backtracking in regular expressions (ReDoS) freezing user devices.
3. **Data Exfiltration & Confidentiality Breaches**: Unauthorized network egress, third-party script leakage, or framing attacks (Clickjacking).

---

## 2. Defensive Controls & Implementation

### 2.1 Multi-Layer Sanitization Suite (`src/utils/security.ts`)
- **Control Character Filtering**: Strips ASCII null bytes (`\0`) and non-printable control characters `[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]` while preserving necessary formatting characters (`\n` linebreaks and `\t` tabs).
- **Linear Tag Neutralization**: Replaces `<script>`, `<style>`, `<iframe>`, `<object>`, and `<embed>` tags using non-backtracking linear scans.
- **Protocol Stripping**: Removes `javascript:`, `vbscript:`, and `data:` pseudo-protocols.
- **Prototype Pollution Defense**: Neutralizes `__proto__` and `constructor.prototype` substrings.
- **Payload Boundaries**: Rejects payloads exceeding 1,000,000 characters (1 MB text ceiling) or search queries exceeding 1,000 characters.

### 2.2 Memory-Safe File Upload Pipeline (`src/components/DocumentUploader.tsx`)
- **Pre-Read Size Verification**: Verifies `file.size <= 2 * 1024 * 1024` (2 MB) before allocating memory in `FileReader`.
- **Extension & MIME Whitelisting**: Allows only plain-text extensions (`.txt`, `.md`, `.text`) with a `text/*` MIME type. Binary formats (Word, PDF, archives, executables) are rejected with guidance to paste the text instead, because they cannot be decoded faithfully in the browser.
- **Error Trapping**: Sets `reader.onerror` handlers to gracefully report filesystem read faults without hanging.

### 2.3 Clickjacking & Framing Defense
Enforced as HTTP response headers in `vercel.json` (header-based, so it cannot be bypassed by disabling scripts):
```http
X-Frame-Options: DENY
Content-Security-Policy: ... frame-ancestors 'none'; ...
```
The former inline frame-busting script was removed so the CSP can use `script-src 'self'` without `'unsafe-inline'`.

### 2.3.1 GenAI Gateway (`/api/genai`)
- **Key isolation**: `GEMINI_API_KEY` exists only in the server environment and is sent to Google in the `x-goog-api-key` header, never in a URL.
- **Input limits**: JSON-only, 150 KB body cap, max 60 clauses / 60,000 characters, control-character stripping, task and language allow-lists.
- **Prompt injection**: user text is wrapped in `<contract>` / `<question>` delimiters, closing tags inside user text are neutralised, and the system instruction treats delimited text as untrusted data.
- **Output verification**: quotes must appear verbatim in the cited clause; precedents must match the curated corpus; enums and clause numbers are clamped to known values; strings are length-capped. React renders all output as escaped text.
- **Abuse & errors**: cross-site browser requests rejected (`Sec-Fetch-Site` / `Origin` check), per-client rate limit keyed on the platform-set client IP (20 requests/minute per instance, bounded memory), 45 s upstream timeout, generic error messages without upstream details, `Cache-Control: no-store`.

### 2.4 Cryptographic Headers & Content Security Policy
Enforced as response headers in `vercel.json` (with a `<meta>` fallback in `index.html`):
```http
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self';
img-src 'self' data: https:;
object-src 'none';
base-uri 'self';
```

### 2.5 Resilient Clipboard Operations (`safeCopyToClipboard`)
Direct invocation of `navigator.clipboard.writeText()` throws unhandled promise rejections in non-HTTPS origins or when browser permissions are denied.
- `safeCopyToClipboard()` wraps the Async Clipboard API in a `try/catch`.
- Automatically falls back to an off-screen readonly `textarea` executed via `document.execCommand('copy')`.
- Returns a clean boolean promise without console errors.

### 2.6 Fault Isolation (`src/components/ErrorBoundary.tsx`)
- Wraps root component tree in `main.tsx`.
- Intercepts unexpected rendering exceptions.
- Provides a clean recovery view conforming to the warm paper aesthetic (`#f8f6f0`), with a button to reload the workspace safely.
