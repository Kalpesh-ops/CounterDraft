import React, { useState } from 'react';
import type { ComparisonPair, ComparisonDiff } from '../types/legal';
import { sampleComparisonPairs } from '../data/sampleContracts';
import { parseCustomContract, compareCustomDocuments } from '../services/legalEngine';
import { CompareIcon, ShieldAlertIcon, PlusIcon, CloseIcon, DocumentIcon } from './Icons';

interface ContractComparatorProps {
  customPair?: ComparisonPair | null;
}

export const ContractComparator: React.FC<ContractComparatorProps> = ({ customPair }) => {
  const [pairsList, setPairsList] = useState<ComparisonPair[]>(
    customPair ? [customPair, ...sampleComparisonPairs] : sampleComparisonPairs
  );
  const [selectedPairId, setSelectedPairId] = useState<string>(pairsList[0].id);
  const [activeDiffFilter, setActiveDiffFilter] = useState<'all' | 'worse_for_user' | 'neutral' | 'better_for_user'>('all');

  // Custom Pair Modal state
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [docATitle, setDocATitle] = useState<string>('Original Baseline Draft');
  const [docBTitle, setDocBTitle] = useState<string>('Counterparty Revised Addendum');
  const [docAText, setDocAText] = useState<string>('');
  const [docBText, setDocBText] = useState<string>('');

  const currentPair = pairsList.find((p) => p.id === selectedPairId) || pairsList[0];

  const filteredDiffs = currentPair.diffs.filter((diff) => {
    if (activeDiffFilter === 'all') return true;
    return diff.riskImpact === activeDiffFilter;
  });

  const handleCreateCustomComparison = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docAText.trim() || !docBText.trim()) return;

    const parsedA = parseCustomContract(docAText, docATitle, 'Baseline Version');
    const parsedB = parseCustomContract(docBText, docBTitle, 'Counter Draft Version');
    const newPair = compareCustomDocuments(parsedA, parsedB);

    setPairsList((prev) => [newPair, ...prev]);
    setSelectedPairId(newPair.id);
    setIsCustomModalOpen(false);
  };

  const handleLoadSampleComparison = () => {
    setDocATitle('Standard Independent Contractor Terms');
    setDocAText(`Section 1. Term and Exclusivity
Consultant shall provide services on a non-exclusive basis. Consultant remains free to provide consulting services to other clients provided no direct conflict of interest occurs.

Section 2. Notice and Mutual Termination
Either party may terminate this agreement upon providing thirty (30) days prior written notice.

Section 3. Intellectual Property Deliverables
Consultant assigns to Client all deliverables specifically commissioned and paid for under Statement of Work. Pre-existing materials remain property of Consultant.

Section 4. Limitation of Liability
Each party cumulative liability shall be capped at total fees paid under this agreement.`);

    setDocBTitle('Client Demanded One-Sided Redline');
    setDocBText(`Section 1. Term and Absolute Exclusivity
Consultant shall devote full professional capacity exclusively to Client and shall not render any services to any other commercial enterprise during the term.

Section 2. Unilateral Termination by Client
Client reserves the right to terminate Consultant immediately without cause and without obligation to pay fees for uncompleted milestones.

Section 3. Total Intellectual Property Capture
Consultant irrevocably assigns all inventions, ideas, and algorithms conceived during the term, whether during or outside working hours, and whether using personal or client equipment.

Section 4. Unilateral Consultant Liability
Consultant shall indemnify and hold harmless Client for any third-party claims. Client liability to Consultant shall under no circumstances exceed one hundred (100) currency units.`);
  };

  return (
    <div className="comparator-container">
      {/* Comparator Header & Selection */}
      <section className="docket-overview-panel">
        <div className="docket-selector-row">
          <div className="selector-group">
            <label htmlFor="pair-select" className="field-label">
              SELECT COMPARISON BENCHMARK:
            </label>
            <select
              id="pair-select"
              value={selectedPairId}
              onChange={(e) => setSelectedPairId(e.target.value)}
              className="styled-select"
            >
              {pairsList.map((pair) => (
                <option key={pair.id} value={pair.id}>
                  {pair.title}
                </option>
              ))}
            </select>
          </div>

          <div className="governing-meta">
            <button
              type="button"
              onClick={() => setIsCustomModalOpen(true)}
              className="action-btn-secondary"
            >
              <PlusIcon size={14} />
              <span>Compare Two Custom Documents</span>
            </button>
          </div>
        </div>

        {/* Favorability Shift Assessment Ledger (2-column layout) */}
        <div className="exposure-summary-grid">
          <div className="exposure-card left-exposure">
            <div className="card-header-line">
              <span className="section-eyebrow">DEVIATION IMPACT OVERVIEW</span>
              <span className={`risk-badge badge-${currentPair.netFavorabilityShift.includes('worse') ? 'high' : 'standard'}`}>
                Net Shift: {currentPair.netFavorabilityShift.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="summary-paragraph">{currentPair.shiftSummary}</p>
            <div className="parties-line">
              <div><strong>Document A (Baseline):</strong> {currentPair.docA.title}</div>
              <div><strong>Document B (Redline / Counter-Draft):</strong> {currentPair.docB.title}</div>
            </div>
          </div>

          <div className="exposure-card right-exposure">
            <div className="card-header-line">
              <span className="section-eyebrow">REDLINE METRICS</span>
              <span className="stat-count-total">{currentPair.diffs.length} Key Clauses Compared</span>
            </div>

            <div className="risk-metrics-row">
              <div className="metric-pill pill-high">
                <span className="metric-num">
                  {currentPair.diffs.filter(d => d.riskImpact === 'worse_for_user').length}
                </span>
                <span className="metric-name">Worse for Signatory</span>
              </div>
              <div className="metric-pill pill-standard">
                <span className="metric-num">
                  {currentPair.diffs.filter(d => d.riskImpact === 'neutral').length}
                </span>
                <span className="metric-name">Neutral / Procedural</span>
              </div>
              <div className="metric-pill pill-favorable">
                <span className="metric-num">
                  {currentPair.diffs.filter(d => d.riskImpact === 'better_for_user').length}
                </span>
                <span className="metric-name">Better for Signatory</span>
              </div>
            </div>

            <div className="critical-vulnerabilities-list">
              <span className="vuln-heading">Core Strategic Takeaway:</span>
              <p className="summary-subtext">
                Document B systematically alters bilateral covenants, narrows remedy windows, and reallocates commercial liabilities to the signatory party.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Difference Filter Bar */}
      <div className="clause-toolbar">
        <div className="toolbar-left">
          <CompareIcon size={14} />
          <span className="toolbar-label">FILTER DEVIATIONS:</span>
          <div className="filter-button-group">
            <button
              type="button"
              className={`filter-btn ${activeDiffFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveDiffFilter('all')}
            >
              All Deviations ({currentPair.diffs.length})
            </button>
            <button
              type="button"
              className={`filter-btn btn-filter-high ${activeDiffFilter === 'worse_for_user' ? 'active' : ''}`}
              onClick={() => setActiveDiffFilter('worse_for_user')}
            >
              Unfavorable Shifts ({currentPair.diffs.filter(d => d.riskImpact === 'worse_for_user').length})
            </button>
            <button
              type="button"
              className={`filter-btn btn-filter-standard ${activeDiffFilter === 'neutral' ? 'active' : ''}`}
              onClick={() => setActiveDiffFilter('neutral')}
            >
              Neutral ({currentPair.diffs.filter(d => d.riskImpact === 'neutral').length})
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Redline Stream */}
      <div className="diff-stream">
        {filteredDiffs.map((diff: ComparisonDiff, index: number) => {
          return (
            <div key={index} className="diff-card">
              <div className="diff-card-header">
                <div className="diff-title-meta">
                  <span className="clause-number-tag">{diff.clauseNumber}</span>
                  <h3 className="diff-topic-heading">{diff.topic}</h3>
                </div>

                <div className="diff-status-meta">
                  <span className={`risk-badge badge-${diff.riskImpact === 'worse_for_user' ? 'high' : 'standard'}`}>
                    {diff.riskImpact === 'worse_for_user' ? 'SIGNIFICANT EXPOSURE' : 'NEUTRAL VARIATION'}
                  </span>
                </div>
              </div>

              {/* Word Changes Bar */}
              {diff.keyWordChanges && diff.keyWordChanges.length > 0 && (
                <div className="word-substitution-bar">
                  <span className="sub-label">KEY SUBSTITUTIONS:</span>
                  <div className="sub-tags">
                    {diff.keyWordChanges.map((sub, sIdx) => (
                      <span key={sIdx} className="sub-tag">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Split Screen Document A vs Document B Comparison */}
              <div className="split-diff-grid">
                <div className="diff-column col-version-a">
                  <div className="column-masthead">
                    <span className="doc-version-tag">VERSION A: {currentPair.docA.title}</span>
                  </div>
                  <div className="diff-text-content">
                    {diff.versionAText}
                  </div>
                </div>

                <div className="diff-column col-version-b">
                  <div className="column-masthead">
                    <span className="doc-version-tag tag-redline">VERSION B: {currentPair.docB.title}</span>
                  </div>
                  <div className="diff-text-content redline-highlight">
                    {diff.versionBText}
                  </div>
                </div>
              </div>

              {/* Legal Analysis of the Deviation */}
              <div className="diff-analysis-box">
                <div className="analysis-header">
                  <ShieldAlertIcon size={14} />
                  <span>LEGAL IMPACT OF DEVIATION:</span>
                </div>
                <p className="analysis-text">{diff.analysis}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Pair Comparison Modal */}
      {isCustomModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCustomModalOpen(false)}>
          <div className="modal-folio modal-folio-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <CompareIcon size={18} />
                <h2>COMPARE ANY TWO CUSTOM CONTRACTS</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="modal-close-btn"
                aria-label="Close dialog"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomComparison} className="modal-body">
              <div className="modal-intro">
                Paste any two contract drafts (e.g. Original Draft vs Counterparty Redline) to generate a clause-by-clause deviation audit and favorability score.
              </div>

              <div className="sample-buttons-strip">
                <span className="sample-label">Demonstration:</span>
                <button
                  type="button"
                  onClick={handleLoadSampleComparison}
                  className="sample-pill-btn"
                >
                  Load Freelance Contract vs Client Redline
                </button>
              </div>

              <div className="split-diff-grid">
                <div className="form-group">
                  <label htmlFor="doc-a-title" className="field-label">
                    DOCUMENT A TITLE (BASELINE):
                  </label>
                  <input
                    id="doc-a-title"
                    type="text"
                    value={docATitle}
                    onChange={(e) => setDocATitle(e.target.value)}
                    className="styled-search-input"
                  />
                  <label htmlFor="doc-a-text" className="field-label" style={{ marginTop: '8px' }}>
                    DOCUMENT A TEXT:
                  </label>
                  <textarea
                    id="doc-a-text"
                    rows={8}
                    value={docAText}
                    onChange={(e) => setDocAText(e.target.value)}
                    placeholder="Paste baseline agreement sections..."
                    className="styled-textarea"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doc-b-title" className="field-label">
                    DOCUMENT B TITLE (COUNTER-DRAFT):
                  </label>
                  <input
                    id="doc-b-title"
                    type="text"
                    value={docBTitle}
                    onChange={(e) => setDocBTitle(e.target.value)}
                    className="styled-search-input"
                  />
                  <label htmlFor="doc-b-text" className="field-label" style={{ marginTop: '8px' }}>
                    DOCUMENT B TEXT:
                  </label>
                  <textarea
                    id="doc-b-text"
                    rows={8}
                    value={docBText}
                    onChange={(e) => setDocBText(e.target.value)}
                    placeholder="Paste counterparty revised sections..."
                    className="styled-textarea"
                  />
                </div>
              </div>

              <div className="modal-actions-bar">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="action-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!docAText.trim() || !docBText.trim()}
                  className="action-btn-primary"
                >
                  <DocumentIcon size={14} />
                  <span>Execute Side-by-Side Comparison</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
