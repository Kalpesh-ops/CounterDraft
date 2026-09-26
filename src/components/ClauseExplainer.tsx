import React, { useState } from 'react';
import type { ClauseAnalysis } from '../types/legal';
import { SUPPORTED_LANGUAGES } from '../types/genai';
import type { SimplifyResult, SupportedLanguage } from '../types/genai';
import { simplifyClauseAI } from '../services/genai';

/** BCP 47 codes so screen readers pronounce the explanation in the right language. */
const LANGUAGE_CODES: Record<SupportedLanguage, string> = {
  English: 'en', Hindi: 'hi', Bengali: 'bn', Marathi: 'mr', Tamil: 'ta', Telugu: 'te', Kannada: 'kn', Gujarati: 'gu',
};

interface ClauseExplainerProps {
  clause: ClauseAnalysis;
}

/**
 * On-demand GenAI explanation of a single clause in plain language, available
 * in eight Indian languages so non-English readers can understand their contract.
 */
export const ClauseExplainer: React.FC<ClauseExplainerProps> = ({ clause }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('English');
  const [result, setResult] = useState<SimplifyResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const selectId = `explain-lang-${clause.id}`;

  const handleExplain = async () => {
    setStatus('loading');
    try {
      setResult(await simplifyClauseAI(clause, language));
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="clause-explainer">
      <div className="clause-explainer-controls">
        <span className="detail-heading">EXPLAIN SIMPLY WITH GEMINI:</span>
        <label htmlFor={selectId} className="visually-hidden">Explanation language</label>
        <select
          id={selectId}
          value={language}
          onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
          className="styled-select-compact"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleExplain}
          disabled={status === 'loading'}
          aria-busy={status === 'loading'}
          className="action-btn-secondary"
        >
          {status === 'loading' ? 'Explaining…' : 'Explain this clause'}
        </button>
      </div>

      <div aria-live="polite">
        {status === 'error' && (
          <p className="form-error-banner" role="status">
            Gemini is unavailable right now. The plain-terms summary above is still available.
          </p>
        )}
        {result && (
          <div className="clause-explainer-result" lang={LANGUAGE_CODES[result.language]}>
            <p>{result.explanation}</p>
            {result.keyPoints.length > 0 && (
              <ul>
                {result.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
              </ul>
            )}
            {result.watchOut && (
              <p className="explainer-watchout"><strong>Watch out:</strong> {result.watchOut}</p>
            )}
            {result.questionsToAsk.length > 0 && (
              <>
                <p className="explainer-subhead">Questions to ask:</p>
                <ul>
                  {result.questionsToAsk.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
