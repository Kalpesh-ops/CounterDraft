/**
 * Security & Input Sanitization Suite for CounterDraft
 * Provides multi-layer defense against Cross-Site Scripting (XSS),
 * Denial of Service (DoS) memory bombs, prototype pollution,
 * and malicious payload injection in contract text and user queries.
 */

const MAX_CONTRACT_LENGTH = 1_000_000; // 1 MB text limit
const MAX_QUERY_LENGTH = 1_000;        // 1,000 characters for search queries
const MAX_TITLE_LENGTH = 200;          // 200 characters for titles and names

/**
 * Strips script tags, HTML tags, event handlers, and javascript: protocols.
 */
export function sanitizeInput(input: unknown, maxLength: number = MAX_TITLE_LENGTH): string {
  if (typeof input !== 'string') {
    if (input === null || input === undefined) return '';
    return String(input).slice(0, maxLength);
  }

  // 1. Enforce length cap
  let text = input.slice(0, maxLength);

  // 2. Remove null bytes and dangerous control characters (preserve \n and \t)
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 3. Neutralize script blocks and style blocks
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 4. Strip html tags
  text = text.replace(/<\/?[a-z][a-z0-9]*\b[^>]*>/gi, '');

  // 5. Strip javascript: / vbscript: / data: pseudo-protocols
  text = text.replace(/(?:javascript|vbscript|data):/gi, '');

  // 6. Strip inline event handlers (e.g. onload=, onerror=, onclick=)
  text = text.replace(/on\w+\s*=/gi, '');

  // 7. Strip prototype pollution keys
  text = text.replace(/__proto__/gi, '').replace(/constructor\s*\.\s*prototype/gi, '');

  return text.trim();
}

/**
 * Sanitizes large legal contract text while preserving legal punctuation,
 * paragraph structures, and clause numbers.
 */
export function sanitizeLegalText(rawText: unknown): string {
  if (typeof rawText !== 'string') {
    if (rawText === null || rawText === undefined) return '';
    rawText = String(rawText);
  }

  let text = (rawText as string).slice(0, MAX_CONTRACT_LENGTH);

  // Strip null bytes
  text = text.replace(/\0/g, '');

  // Neutralize script tags, object, embed, iframe (linear non-backtracking)
  text = text.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '');
  text = text.replace(/<object\b[\s\S]*?<\/object>/gi, '');
  text = text.replace(/<embed\b[\s\S]*?<\/embed>/gi, '');

  // Strip remaining opened or unclosed tags
  text = text.replace(/<\/?[a-z][a-z0-9]*\b[^>]*>/gi, '');

  // Strip dangerous protocol patterns
  text = text.replace(/(?:javascript|vbscript):/gi, '');
  text = text.replace(/on\w+\s*=/gi, '');

  return text.trim();
}

/**
 * Validates and sanitizes search / grounded Q&A queries.
 */
export function sanitizeQuery(query: unknown): string {
  return sanitizeInput(query, MAX_QUERY_LENGTH);
}

/**
 * Validates payload structure and size before ingestion.
 */
export function validateContractPayload(rawText: string, title?: string): {
  isValid: boolean;
  cleanText: string;
  cleanTitle: string;
  errorMessage?: string;
} {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return {
      isValid: false,
      cleanText: '',
      cleanTitle: '',
      errorMessage: 'Contract payload is empty. Please provide valid text.'
    };
  }

  if (rawText.length > MAX_CONTRACT_LENGTH) {
    return {
      isValid: false,
      cleanText: '',
      cleanTitle: '',
      errorMessage: `Contract exceeds maximum permitted size of 1 MB (${rawText.length} characters).`
    };
  }

  const cleanText = sanitizeLegalText(rawText);
  if (cleanText.length < 30) {
    return {
      isValid: false,
      cleanText: '',
      cleanTitle: '',
      errorMessage: 'Contract text contains insufficient legible content (minimum 30 characters required).'
    };
  }

  const cleanTitle = sanitizeInput(title || 'Custom Legal Contract', MAX_TITLE_LENGTH);

  return {
    isValid: true,
    cleanText,
    cleanTitle
  };
}

/**
 * Copies text with the asynchronous Clipboard API and never throws.
 *
 * Resolves `false` when the API is unavailable (insecure origin, very old browser) or the
 * user denies permission, so callers can tell the user to copy manually. The deprecated
 * `document.execCommand('copy')` fallback is intentionally not used.
 */
export async function safeCopyToClipboard(text: string): Promise<boolean> {
  const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard;
  if (!clipboard || typeof clipboard.writeText !== 'function') return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
