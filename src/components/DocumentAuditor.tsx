import React, { useMemo, useState } from 'react';
import type { LegalDocument, RiskLevel } from '../types/legal';
import { safeCopyToClipboard } from '../utils/security';
import { FilterIcon, ShieldAlertIcon, DocumentIcon } from './Icons';
import { AnalysisSourceBadge } from './AnalysisSourceBadge';
import { ClauseExplainer } from './ClauseExplainer';

interface DocumentAuditorProps {
  document: LegalDocument;
  onSelectClauseForQA?: (clauseNumber: string) => void;
  onSwitchDocument: (docId: string) => void;
  allDocuments: LegalDocument[];
}

export const DocumentAuditor: React.FC<DocumentAuditorProps> = ({
  document,
  onSelectClauseForQA,
  onSwitchDocument,
  allDocuments
}) => {
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(document.clauses[1]?.id || document.clauses[0]?.id || null);
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);

  const filteredClauses = useMemo(() => document.clauses.filter((clause) => {
    if (selectedRiskFilter !== 'all' && clause.riskLevel !== selectedRiskFilter) {
      return false;
    }
    if (selectedCategoryFilter !== 'all' && clause.category !== selectedCategoryFilter) {
      return false;
    }
    return true;
  }), [document.clauses, selectedRiskFilter, selectedCategoryFilter]);

  const toggleClause = (clauseId: string) => {
    setExpandedClauseId((current) => (current === clauseId ? null : clauseId));
  };

  const handleCopyRedline = (clauseId: string, text: string) => {
    safeCopyToClipboard(text).then((success) => {
      if (success) {
        setCopiedClauseId(clauseId);
        setTimeout(() => {
          setCopiedClauseId(null);
        }, 2000);
      }
    });
  };

  return (
    <div className="auditor-container">
      {/* Top Document Selection & Metadata Ledger */}
      <section className="docket-overview-panel" aria-labelledby="audit-heading">
        <h2 id="audit-heading" className="visually-hidden">Contract audit: {document.title}</h2>
        <div className="docket-selector-row">
          <div className="selector-group">
            <label htmlFor="doc-select" className="field-label">
              SELECT ACTIVE CONTRACT TO AUDIT:
            </label>
            <select
              id="doc-select"
              value={document.id}
              onChange={(e) => onSwitchDocument(e.target.value)}
              className="styled-select"
            >
              {allDocuments.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.documentType})
                </option>
              ))}
            </select>
          </div>

          <div className="governing-meta">
            <span className="meta-item">
              <strong>Jurisdiction:</strong> {document.jurisdiction}
            </span>
            <span className="meta-divider">|</span>
            <span className="meta-item">
              <strong>Governing Law:</strong> {document.governingLaw}
            </span>
          </div>
        </div>

        {/* Executive Summary & Exposure Metrics (2-column balanced layout) */}
        <div className="exposure-summary-grid">
          <div className="exposure-card left-exposure">
            <div className="card-header-line">
              <span className="section-eyebrow">AUDIT SUMMARY</span>
              <AnalysisSourceBadge source={document.analysisSource} model={document.aiModel} />
              <span className={`risk-badge badge-${document.overallRiskScore >= 70 ? 'high' : document.overallRiskScore >= 45 ? 'caution' : 'standard'}`}>
                Risk Score: {document.overallRiskScore} / 100
              </span>
            </div>
            <p className="summary-paragraph">{document.executiveSummary}</p>
            <div className="parties-line">
              <div><strong>Party A (Originator):</strong> {document.parties.partyA}</div>
              <div><strong>Party B (Recipient / Signatory):</strong> {document.parties.partyB}</div>
            </div>
            {document.nextSteps && document.nextSteps.length > 0 && (
              <div className="next-steps-box">
                <span className="vuln-heading">Your Next Steps:</span>
                <ol className="vuln-items">
                  {document.nextSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="exposure-card right-exposure">
            <div className="card-header-line">
              <span className="section-eyebrow">VULNERABILITY FLAGS & EXPOSURE</span>
              <span className="stat-count-total">{document.clauses.length} Clauses Assessed</span>
            </div>

            <div className="risk-metrics-row">
              <div className="metric-pill pill-high">
                <span className="metric-num">{document.riskSummary.highCount}</span>
                <span className="metric-name">High Risk</span>
              </div>
              <div className="metric-pill pill-caution">
                <span className="metric-num">{document.riskSummary.cautionCount}</span>
                <span className="metric-name">Caution</span>
              </div>
              <div className="metric-pill pill-standard">
                <span className="metric-num">{document.riskSummary.standardCount}</span>
                <span className="metric-name">Standard</span>
              </div>
              <div className="metric-pill pill-favorable">
                <span className="metric-num">{document.riskSummary.favorableCount}</span>
                <span className="metric-name">Balanced</span>
              </div>
            </div>

            <div className="critical-vulnerabilities-list">
              <span className="vuln-heading">Primary Exposure Points:</span>
              <ol className="vuln-items">
                {document.keyVulnerabilities.map((vuln, i) => (
                  <li key={i}>{vuln}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Control Toolbar */}
      <div className="clause-toolbar">
        <div className="toolbar-left">
          <FilterIcon size={14} />
          <span className="toolbar-label">FILTER CLAUSES:</span>

          <div className="filter-button-group">
            <button
              type="button"
              className={`filter-btn ${selectedRiskFilter === 'all' ? 'active' : ''}`}
              aria-pressed={selectedRiskFilter === 'all'}
              onClick={() => setSelectedRiskFilter('all')}
            >
              All ({document.clauses.length})
            </button>
            <button
              type="button"
              className={`filter-btn btn-filter-high ${selectedRiskFilter === 'high' ? 'active' : ''}`}
              aria-pressed={selectedRiskFilter === 'high'}
              onClick={() => setSelectedRiskFilter('high')}
            >
              High Risk ({document.riskSummary.highCount})
            </button>
            <button
              type="button"
              className={`filter-btn btn-filter-caution ${selectedRiskFilter === 'caution' ? 'active' : ''}`}
              aria-pressed={selectedRiskFilter === 'caution'}
              onClick={() => setSelectedRiskFilter('caution')}
            >
              Caution ({document.riskSummary.cautionCount})
            </button>
            <button
              type="button"
              className={`filter-btn btn-filter-standard ${selectedRiskFilter === 'standard' ? 'active' : ''}`}
              aria-pressed={selectedRiskFilter === 'standard'}
              onClick={() => setSelectedRiskFilter('standard')}
            >
              Standard ({document.riskSummary.standardCount})
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <label htmlFor="cat-filter" className="field-label-inline">
            Category:
          </label>
          <select
            id="cat-filter"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="styled-select-compact"
          >
            <option value="all">All Categories</option>
            <option value="financial">Financial & Deposits</option>
            <option value="liability">Liability & Indemnity</option>
            <option value="termination">Termination & Notice</option>
            <option value="covenants">Covenants & Restrictions</option>
            <option value="intellectual_property">Intellectual Property</option>
            <option value="dispute_resolution">Dispute Resolution</option>
            <option value="general">General / Administrative</option>
          </select>
        </div>
      </div>

      {/* Clause Ledger Stream */}
      <h2 className="visually-hidden">Clause-by-clause risk ledger</h2>
      <div className="clause-stream">
        {filteredClauses.length === 0 ? (
          <div className="empty-state-card">
            No clauses match the selected filter criteria. Select another risk level or category above.
          </div>
        ) : (
          filteredClauses.map((clause) => {
            const isExpanded = expandedClauseId === clause.id;

            return (
              <article
                key={clause.id}
                className={`clause-card risk-border-${clause.riskLevel} ${isExpanded ? 'expanded' : ''}`}
              >
                {/* Header Strip */}
                <div
                  className="clause-card-header"
                  onClick={() => toggleClause(clause.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-label={`${clause.clauseNumber}: ${clause.title}, ${clause.riskLevel} risk. ${isExpanded ? 'Collapse' : 'Expand'} details`}
                  aria-controls={`clause-detail-${clause.id}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleClause(clause.id);
                    }
                  }}
                >
                  <div className="clause-card-title-group">
                    <span className="clause-number-tag">{clause.clauseNumber}</span>
                    <h3 className="clause-title-text">{clause.title}</h3>
                    <span className="clause-category-tag">{clause.category.replace('_', ' ').toUpperCase()}</span>
                  </div>

                  <div className="clause-card-meta-group">
                    <span className={`risk-badge badge-${clause.riskLevel}`}>
                      {clause.riskLevel.toUpperCase()}
                    </span>
                    <span className="expand-indicator">
                      {isExpanded ? 'Collapse [-]' : 'Inspect [+]'}
                    </span>
                  </div>
                </div>

                {/* Plain-Language Demystification (Always visible for fast scanning) */}
                <div className="plain-language-strip">
                  <span className="demystify-label">PLAIN TERMS:</span>
                  <p className="plain-language-text">{clause.plainSummary}</p>
                </div>

                {/* Detailed Analysis Dossier (Expanded View) */}
                {isExpanded && (
                  <div className="clause-detail-body" id={`clause-detail-${clause.id}`}>
                    {/* Verbatim Legal Language */}
                    <div className="detail-section">
                      <div className="detail-heading">
                        <DocumentIcon size={14} />
                        <span>VERBATIM CONTRACT TEXT:</span>
                      </div>
                      <div className="verbatim-text-block">
                        {clause.originalText}
                      </div>
                    </div>

                    <ClauseExplainer clause={clause} />

                    {/* Legal Rationale & Statutory Grounding (2-column balanced layout) */}
                    <div className="rationale-grid">
                      <div className="rationale-col">
                        <div className="detail-heading">
                          <ShieldAlertIcon size={14} />
                          <span>LEGAL RISK RATIONALE:</span>
                        </div>
                        <p className="rationale-text">{clause.riskRationale}</p>

                        <div className="statutory-note">
                          <strong>Statutory Anchor:</strong> {clause.statutoryContext}
                        </div>

                        {clause.precedentCitation && (
                          <div className="precedent-ref-box">
                            <strong>Judicial Precedent:</strong> {clause.precedentCitation}
                          </div>
                        )}
                      </div>

                      <div className="rationale-col">
                        <div className="detail-heading">
                          <span>PRACTICAL SCENARIO:</span>
                        </div>
                        <p className="scenario-text">{clause.practicalScenario}</p>

                        <div className="counter-proposal-box">
                          <div className="counter-proposal-header">
                            <span className="counter-title">RECOMMENDED COUNTER-PROPOSAL:</span>
                            <button
                              type="button"
                              onClick={() => handleCopyRedline(clause.id, clause.recommendedCounterProposal)}
                              className="copy-redline-btn"
                            >
                              {copiedClauseId === clause.id ? 'Copied to Clipboard' : 'Copy Proposed Redline'}
                            </button>
                          </div>
                          <div className="counter-proposal-text">
                            {clause.recommendedCounterProposal}
                          </div>
                        </div>

                        {onSelectClauseForQA && (
                          <div className="qa-shortcut-row">
                            <button
                              type="button"
                              onClick={() => onSelectClauseForQA(clause.clauseNumber)}
                              className="qa-query-link"
                            >
                              Inquire About {clause.clauseNumber} in Q&A Module
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
