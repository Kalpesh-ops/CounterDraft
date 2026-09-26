import React, { useState } from 'react';
import type { ComparisonPair, ComparisonDiff } from '../types/legal';
import { sampleComparisonPairs } from '../data/sampleContracts';
import { CompareIcon, ShieldAlertIcon } from './Icons';

interface ContractComparatorProps {
  customPair?: ComparisonPair | null;
}

export const ContractComparator: React.FC<ContractComparatorProps> = ({ customPair }) => {
  const availablePairs = customPair ? [customPair, ...sampleComparisonPairs] : sampleComparisonPairs;
  const [selectedPairId, setSelectedPairId] = useState<string>(availablePairs[0].id);
  const [activeDiffFilter, setActiveDiffFilter] = useState<'all' | 'worse_for_user' | 'neutral' | 'better_for_user'>('all');

  const currentPair = availablePairs.find((p) => p.id === selectedPairId) || availablePairs[0];

  const filteredDiffs = currentPair.diffs.filter((diff) => {
    if (activeDiffFilter === 'all') return true;
    return diff.riskImpact === activeDiffFilter;
  });

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
              {availablePairs.map((pair) => (
                <option key={pair.id} value={pair.id}>
                  {pair.title}
                </option>
              ))}
            </select>
          </div>

          <div className="governing-meta">
            <span className="meta-item">
              <strong>Comparison Type:</strong> Side-by-Side Clause Deviation Analysis
            </span>
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
              <div><strong>Document A (Benchmark):</strong> {currentPair.docA.title}</div>
              <div><strong>Document B (Redline / Proposed):</strong> {currentPair.docB.title}</div>
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
                Document B systematically removes reciprocal safeguards, narrows remedy windows, and reallocates commercial or operational liabilities to the recipient party.
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
                    <span className="doc-version-tag">VERSION A (BASELINE MODEL)</span>
                  </div>
                  <div className="diff-text-content">
                    {diff.versionAText}
                  </div>
                </div>

                <div className="diff-column col-version-b">
                  <div className="column-masthead">
                    <span className="doc-version-tag tag-redline">VERSION B (COUNTER DRAFT / REDLINE)</span>
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
    </div>
  );
};
