import React, { useState } from 'react';
import type { LegalDocument, GroundedQAResponse } from '../types/legal';
import { queryDocumentGrounded } from '../services/legalEngine';
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
  const [qaHistory, setQaHistory] = useState<GroundedQAResponse[]>([
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

  const suggestedQuestions = document.id.includes('lease')
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
      ];

  const handleRunQuery = (questionText: string) => {
    if (!questionText.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      const response = queryDocumentGrounded(document, questionText.trim());
      setQaHistory((prev) => [response, ...prev]);
      setQuery('');
      setIsProcessing(false);
    }, 300);
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
            <input
              type="text"
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
              {isProcessing ? 'Consulting Docket...' : 'Execute Inquiry'}
            </button>
          </div>
        </form>

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
      <div className="qa-stream">
        {qaHistory.map((item) => (
          <article key={item.id} className="qa-response-card">
            {/* User Question */}
            <div className="qa-question-bar">
              <span className="qa-marker">Q:</span>
              <h3 className="qa-question-text">{item.question}</h3>
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
