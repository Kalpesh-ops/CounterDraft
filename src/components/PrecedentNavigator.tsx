import React, { useMemo, useState } from 'react';
import { courtPrecedents } from '../data/courtPrecedents';
import type { CourtPrecedent } from '../types/legal';
import { GavelIcon, SearchIcon, BookOpenIcon, FilterIcon } from './Icons';

export const PrecedentNavigator: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatute, setSelectedStatute] = useState<string>('all');
  const [activePrecedentId, setActivePrecedentId] = useState<string>(courtPrecedents[0].id);

  const filteredPrecedents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const statute = selectedStatute.toLowerCase();
    return courtPrecedents.filter((item: CourtPrecedent) => {
      const matchesSearch =
        term === '' ||
        item.caseName.toLowerCase().includes(term) ||
        item.citation.toLowerCase().includes(term) ||
        item.coreDoctrine.toLowerCase().includes(term) ||
        item.rulingSummary.toLowerCase().includes(term) ||
        item.keywords.some((k) => k.toLowerCase().includes(term));

      const matchesStatute = statute === 'all' || item.statutorySection.toLowerCase().includes(statute);

      return matchesSearch && matchesStatute;
    });
  }, [searchTerm, selectedStatute]);

  const activePrecedent = courtPrecedents.find((p) => p.id === activePrecedentId) || courtPrecedents[0];

  return (
    <div className="precedent-container">
      {/* Top Banner & Search */}
      <section className="docket-overview-panel">
        <div className="docket-selector-row">
          <div>
            <span className="section-eyebrow">COURTS & CASES INTELLIGENCE REPOSITORY</span>
            <h2 className="panel-heading-text">Authoritative Judicial Precedents & Statutory Anchors</h2>
          </div>
          <div className="governing-meta">
            <span className="meta-item">
              <strong>Corpus:</strong> Supreme Court of India & High Court Authorities
            </span>
          </div>
        </div>

        <div className="precedent-search-bar">
          <div className="search-input-box">
            <SearchIcon size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by case name, citation, legal doctrine, or keyword (e.g. non-compete, deposit, adhesion)..."
              className="styled-search-input"
            />
          </div>

          <div className="statute-filter-box">
            <FilterIcon size={14} />
            <label htmlFor="statute-select" className="field-label-inline">
              Statutory Doctrine:
            </label>
            <select
              id="statute-select"
              value={selectedStatute}
              onChange={(e) => setSelectedStatute(e.target.value)}
              className="styled-select-compact"
            >
              <option value="all">All Statutory Provisions</option>
              <option value="Section 27">Section 27 (Restraint of Trade)</option>
              <option value="Section 74">Section 74 (Forfeiture & Penalties)</option>
              <option value="Section 23">Section 23 (Unconscionable Contracts)</option>
              <option value="Arbitration">Arbitration & Conciliation Act</option>
              <option value="Specific Relief">Specific Relief Act</option>
              <option value="Copyright">Copyright & IT Act</option>
            </select>
          </div>
        </div>
      </section>

      {/* Precedent Browser (2-column layout: Left Case Docket, Right Deep Dossier) */}
      <div className="precedent-layout-grid">
        {/* Left Column: Precedent List */}
        <div className="precedent-list-col">
          <div className="column-masthead">
            <span>INDEXED AUTHORITIES ({filteredPrecedents.length})</span>
          </div>

          <div className="precedent-cards-scroll">
            {filteredPrecedents.map((item) => {
              const isSelected = item.id === activePrecedentId;
              return (
                <div
                  key={item.id}
                  className={`precedent-card-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setActivePrecedentId(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setActivePrecedentId(item.id);
                  }}
                >
                  <div className="card-top-line">
                    <span className="case-year-tag">{item.year}</span>
                    <span className="court-badge">{item.court}</span>
                  </div>

                  <h4 className="case-title-text">{item.caseName}</h4>
                  <div className="citation-code">{item.citation}</div>

                  <div className="case-statute-row">
                    <span className="statute-label">Statute:</span>
                    <span className="statute-value">{item.statutorySection}</span>
                  </div>

                  <div className="case-doctrine-preview">
                    {item.coreDoctrine}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Authority Dossier */}
        <div className="precedent-dossier-col">
          <article className="dossier-card">
            {/* Header */}
            <div className="dossier-header">
              <div className="dossier-court-badge">
                <GavelIcon size={14} />
                <span>{activePrecedent.court.toUpperCase()}</span>
              </div>
              <h3 className="dossier-case-name">{activePrecedent.caseName}</h3>
              <div className="dossier-citation-badge">
                <span>Official Citation:</span> {activePrecedent.citation}
              </div>
            </div>

            {/* Metadata Bar (2x2 Balanced Grid) */}
            <div className="dossier-meta-table">
              <div className="meta-cell">
                <span className="cell-label">BENCH COMPOSITION:</span>
                <span className="cell-value">{activePrecedent.bench}</span>
              </div>
              <div className="meta-cell">
                <span className="cell-label">STATUTORY PROVISION:</span>
                <span className="cell-value">{activePrecedent.statutorySection}</span>
              </div>
              <div className="meta-cell">
                <span className="cell-label">CORE DOCTRINE:</span>
                <span className="cell-value">{activePrecedent.coreDoctrine}</span>
              </div>
              <div className="meta-cell">
                <span className="cell-label">COURT OF RECORD:</span>
                <span className="cell-value">{activePrecedent.court} ({activePrecedent.year})</span>
              </div>
            </div>

            {/* Core Ruling Synthesis */}
            <div className="dossier-section">
              <div className="section-title-line">
                <BookOpenIcon size={15} />
                <span>JUDICIAL HOLDING & RATIO DECIDENDI:</span>
              </div>
              <p className="dossier-text">{activePrecedent.rulingSummary}</p>
            </div>

            {/* Direct Contract Relevance */}
            <div className="dossier-section">
              <div className="section-title-line">
                <span>DIRECT CONTRACTUAL RELEVANCE:</span>
              </div>
              <div className="relevance-box">
                <p className="relevance-text">{activePrecedent.relevanceToContracts}</p>
              </div>
            </div>

            {/* Practical Strategic Application */}
            <div className="dossier-section">
              <div className="section-title-line">
                <span>PRACTICAL NEGOTIATION & LITIGATION GUIDANCE:</span>
              </div>
              <div className="guidance-box">
                <p className="guidance-text">{activePrecedent.applicationGuidance}</p>
              </div>
            </div>

            {/* Keywords */}
            <div className="dossier-keywords-row">
              <span className="keywords-label">SEARCH TAXONOMY:</span>
              <div className="keyword-tags">
                {activePrecedent.keywords.map((kw, kIdx) => (
                  <span key={kIdx} className="keyword-tag">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
