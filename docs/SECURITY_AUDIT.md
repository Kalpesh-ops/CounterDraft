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
- **Extension & MIME Whitelisting**: Allows only text-based legal document extensions (`.txt`, `.doc`, `.docx`, `.md`, `.rtf`, `.json`, `.legal`, `.contract`). Rejects executables, SVGs, audio, video, and raw binary archives.
- **Error Trapping**: Sets `reader.onerror` handlers to gracefully report filesystem read faults without hanging.

### 2.3 Dual-Layer Clickjacking & Framing Defense
1. **Server Header Defense (`public/_headers`)**:
   ```http
   X-Frame-Options: DENY
   Content-Security-Policy: ... frame-ancestors 'none'; ...
   ```
2. **Client-Side Frame Guard (`index.html`)**:
   ```javascript
   if (window.top && window.self !== window.top) {
     try {
       window.top.location = window.self.location;
     } catch {
       document.documentElement.style.display = 'none';
     }
   }
   ```

### 2.4 Cryptographic Headers & Content Security Policy
Enforced in `index.html` and `public/_headers`:
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
