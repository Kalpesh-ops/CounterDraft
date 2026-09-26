import React from 'react';
import { ScalesIcon, DocumentIcon, CompareIcon, SearchIcon, GavelIcon, ChecklistIcon, BriefcaseIcon, PlusIcon } from './Icons';

export type ActiveTab = 'auditor' | 'comparator' | 'qa' | 'precedents' | 'checklist' | 'counsel';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  activeDocTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenTerms,
  onOpenPrivacy,
  activeDocTitle
}) => {
  return (
    <header className="site-header">
      {/* Statutory Disclaimer Ticker */}
      <div className="disclaimer-banner">
        <span className="disclaimer-tag">STATUTORY NOTICE</span>
        <span className="disclaimer-text">
          Informational assistance only. JurisFolio does not provide formal legal advice or create an attorney-client relationship. All evaluations must be validated by an enrolled advocate or jurisdictional legal professional.
        </span>
        <div className="policy-links">
          <button type="button" onClick={onOpenTerms} className="policy-link-btn">
            Terms of Service
          </button>
          <span className="policy-divider">/</span>
          <button type="button" onClick={onOpenPrivacy} className="policy-link-btn">
            Privacy Policy
          </button>
        </div>
      </div>

      {/* Main Masthead */}
      <div className="masthead">
        <div className="brand-section">
          <div className="brand-crest">
            <ScalesIcon size={24} />
          </div>
          <div>
            <div className="brand-title">JURISFOLIO</div>
            <div className="brand-subtitle">
              Accessible Legal Document Intelligence & Case Law Navigator
            </div>
          </div>
        </div>

        <div className="active-docket-info">
          <span className="docket-label">CURRENT DOCKET:</span>
          <span className="docket-title" title={activeDocTitle}>
            {activeDocTitle}
          </span>
          <button
            type="button"
            onClick={onOpenUpload}
            className="action-btn-secondary"
            title="Upload or paste custom agreement"
          >
            <PlusIcon size={14} />
            <span>Upload Custom Contract</span>
          </button>
        </div>
      </div>

      {/* Navigation Ledger Tabs */}
      <nav className="tab-navigation">
        <button
          type="button"
          onClick={() => setActiveTab('auditor')}
          className={`tab-btn ${activeTab === 'auditor' ? 'active' : ''}`}
        >
          <DocumentIcon size={15} />
          <span>Clause Breakdown & Risk Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comparator')}
          className={`tab-btn ${activeTab === 'comparator' ? 'active' : ''}`}
        >
          <CompareIcon size={15} />
          <span>Contract Comparator & Redline</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('qa')}
          className={`tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
        >
          <SearchIcon size={15} />
          <span>Grounded Q&A & Citations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('precedents')}
          className={`tab-btn ${activeTab === 'precedents' ? 'active' : ''}`}
        >
          <GavelIcon size={15} />
          <span>Precedent Navigator (Courts & Cases)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('checklist')}
          className={`tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
        >
          <ChecklistIcon size={15} />
          <span>Compliance Checklist & Deadlines</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('counsel')}
          className={`tab-btn ${activeTab === 'counsel' ? 'active' : ''}`}
        >
          <BriefcaseIcon size={15} />
          <span>Lawyer Consultation Brief</span>
        </button>
      </nav>
    </header>
  );
};
