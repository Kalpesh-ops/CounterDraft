import React, { useMemo, useState } from 'react';
import type { LegalDocument, GroundedQAResponse } from '../types/legal';
import { queryDocumentGrounded } from '../services/legalEngine';
import { askDocumentAI } from '../services/genai';
import { AnalysisSourceBadge } from './AnalysisSourceBadge';
import { sanitizeQuery } from '../utils/security';
import { SearchIcon, DocumentIcon, GavelIcon, ShieldAlertIcon } from './Icons';

interface GroundedQAProps {
  document: LegalDocument;
  initialQuery?: string;
  onNavigateToClause?: (clauseNumber: string) => void;
}

export const GroundedQA: React.FC<GroundedQAProps> = ({
  document,
  initialQuery = '',
  onNavigateToClause
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  // Lazy initialiser: the seeded example answer is computed once, not on every render.
  const [qaHistory, setQaHistory] = useState<GroundedQAResponse[]>(() => [
    queryDocumentGrounded(
      document,
      document.id.includes('lease')
        ? 'Can the landlord forfeit my full security deposit if I need to move early?'
        : document.id.includes('emp')
        ? 'Can my employer stop me from joining a competitor after I resign?'
        : 'What is the maximum liability the vendor accepts if my data is compromised?'
    )
  ]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [notice, setNotice] = useState<string>('');

  const suggestedQuestions = useMemo(() => document.id.includes('lease')
    ? [
        'Can the landlord enter my apartment without 24 hours notice?',
        'Who is responsible for major plumbing or structural water leaks?',
        'What is the notice period required to terminate after the lock-in period?',
        'Can the landlord automatically forfeit my security deposit without showing damage?'
      ]
    : document.id.includes('emp')
    ? [
        'Is the 24-month nationwide non-compete legally enforceable in India?',
        'Does the company own software or inventions I code on my personal laptop on weekends?',
        'Can the employer cancel my notice period without paying salary in lieu of notice?',
        'Can the employer claw back vested bonuses if I join another technology firm?'
      ]
    : [
        'What is the vendor maximum liability cap if a data breach occurs?',
        'Are there any uncapped indemnities imposed on the customer?',
        'How many days do I have to retrieve my data after the contract ends?',
        'Can the vendor unilaterally increase prices during the subscription term?'
      ], [document.id]);

  const handleRunQuery = async (questionText: string) => {
    const cleanQuestion = sanitizeQuery(questionText);
    if (!cleanQuestion || isProcessing) return;
    setIsProcessing(true);
    setNotice('');

    let response: GroundedQAResponse;
    try {
      response = await askDocumentAI(document, cleanQuestion);
    } catch {
      // Graceful degradation to the deterministic statutory retriever.
      response = queryDocumentGrounded(document, cleanQuestion);
      setNotice('Gemini is unavailable right now, so this answer comes from the offline statutory rule engine.');
    }

    setQaHistory((prev) => [response, ...prev]);
    setQuery('');
    setIsProcessing(false);
  };

  return (
    <div className="qa-container">
      {/* Search Header Banner */}
      <section className="docket-overview-panel">
        <div className="docket-selector-row">
          <div>
            <span className="section-eyebrow">DOCUMENT-GROUNDED CITATION SEARCH</span>
            <h2 className="panel-heading-text">Inquire Against Docket: {document.title}</h2>
          </div>
          <div className="governing-meta">
            <span className="meta-item">
              <strong>Grounding Scope:</strong> {document.clauses.length} Indexed Provisions & Statutory Benchmarks
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunQuery(query);
          }}
          className="qa-form"
        >
          <div className="qa-input-wrapper">
            <SearchIcon size={18} className="qa-search-icon" />
            <label htmlFor="qa-question-input" className="visually-hidden">
              Ask a question about this contract
            </label>
            <input
              id="qa-question-input"
              type="text"
              maxLength={1000}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your obligations, penalties, exit terms, or landlord/employer rights..."
              className="qa-input-field"
            />
            <button
              type="submit"
              disabled={isProcessing || !query.trim()}
              className="action-btn-primary"
            >
              {isProcessing ? 'Gemini is reading the contract…' : 'Ask Gemini'}
            </button>
          </div>
        </form>
        <p className="qa-grounding-note">
          Answers are generated by Google Gemini from this contract only. Quotes are checked against the clause text and removed if they do not match exactly.
        </p>
        {notice && <div className="form-error-banner" role="status">{notice}</div>}

        {/* Suggested Quick Questions */}
        <div className="suggested-queries-section">
          <span className="suggested-label">SUGGESTED DOCKET INQUIRIES:</span>
          <div className="suggested-chips">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRunQuery(q)}
                className="suggested-chip-btn"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Answers & Grounded Citations Stream */}
      <div className="qa-stream" aria-live="polite" aria-busy={isProcessing}>
        {qaHistory.map((item) => (
          <article key={item.id} className="qa-response-card">
            {/* User Question */}
            <div className="qa-question-bar">
              <span className="qa-marker">Q:</span>
              <h3 className="qa-question-text">{item.question}</h3>
              <AnalysisSourceBadge source={item.analysisSource} model={item.aiModel} />
            </div>

            {/* Answer Body (2-column balanced layout) */}
            <div className="qa-body-grid">
              {/* Left Column: Direct Synthesis & Statutory Rights */}
              <div className="qa-col-left">
                <div className="qa-section-header">
                  <DocumentIcon size={14} />
                  <span>CONTRACTUAL EVALUATION:</span>
                </div>
                <p className="qa-answer-summary">{item.answerSummary}</p>

                <div className="statutory-override-box">
                  <div className="override-header">
                    <ShieldAlertIcon size={14} />
                    <span>STATUTORY LAW & COMMON RIGHT OVERRIDE:</span>
                  </div>
                  <p className="override-text">{item.statutoryRightsNote}</p>
                </div>

                {item.precedentRefs && item.precedentRefs.length > 0 && (
                  <div className="precedent-pill-group">
                    <span className="precedent-label">
                      <GavelIcon size={12} />
                      <span>Applicable Authority:</span>
                    </span>
                    <span className="precedent-name">{item.precedentRefs.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Anchored Clause Citations */}
              <div className="qa-col-right">
                <div className="qa-section-header">
                  <span>ANCHORED CLAUSE CITATIONS:</span>
                </div>

                {item.citations.length === 0 && (
                  <p className="cite-explanation">No clause in this contract directly addresses the question.</p>
                )}
                {item.discardedCitations ? (
                  <p className="grounding-discard-note">
                    {item.discardedCitations} AI-proposed quote{item.discardedCitations > 1 ? 's were' : ' was'} removed because {item.discardedCitations > 1 ? 'they' : 'it'} did not match the contract verbatim.
                  </p>
                ) : null}
                <div className="citations-stack">
                  {item.citations.map((cite, cIdx) => (
                    <div key={cIdx} className="citation-item">
                      <div className="citation-header-line">
                        <span className="clause-number-tag">{cite.clauseNumber}</span>
                        <span className="cite-clause-title">{cite.clauseTitle}</span>
                        {onNavigateToClause && (
                          <button
                            type="button"
                            onClick={() => onNavigateToClause(cite.clauseNumber)}
                            className="cite-jump-btn"
                          >
                            Inspect Clause
                          </button>
                        )}
                      </div>

                      <div className="verbatim-quote-box">
                        "{cite.exactSnippet}"
                      </div>

                      <div className="cite-explanation">
                        <strong>Significance:</strong> {cite.relevanceExplanation}
                      </div>
                    </div>
                  ))}
                </div>

                {item.suggestedFollowUps && item.suggestedFollowUps.length > 0 && (
                  <div className="followup-box">
                    <span className="followup-title">STRATEGIC COUNSEL FOLLOW-UPS:</span>
                    <ul className="followup-list">
                      {item.suggestedFollowUps.map((fu, fIdx) => (
                        <li key={fIdx}>{fu}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
