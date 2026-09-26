import React, { memo } from 'react';
import { ScalesIcon, DocumentIcon, CompareIcon, SearchIcon, GavelIcon, ChecklistIcon, BriefcaseIcon, PlusIcon } from './Icons';

export type ActiveTab = 'auditor' | 'comparator' | 'qa' | 'precedents' | 'playbook' | 'checklist' | 'counsel';

const TABS: { id: ActiveTab; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: 'auditor', label: 'Clause Breakdown & Risk Ledger', Icon: DocumentIcon },
  { id: 'comparator', label: 'Contract Comparator & Redline', Icon: CompareIcon },
  { id: 'playbook', label: 'Negotiation Email & Exposure', Icon: BriefcaseIcon },
  { id: 'qa', label: 'Ask Gemini: Grounded Q&A', Icon: SearchIcon },
  { id: 'precedents', label: 'Precedent Navigator (Courts & Cases)', Icon: GavelIcon },
  { id: 'checklist', label: 'Compliance Checklist & Deadlines', Icon: ChecklistIcon },
  { id: 'counsel', label: 'Lawyer Consultation Brief', Icon: BriefcaseIcon },
];

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  activeDocTitle: string;
}

/** Masthead and tab navigation; memoised because it re-renders only when its props change. */
export const Header = memo<HeaderProps>(function Header({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenTerms,
  onOpenPrivacy,
  activeDocTitle
}) {
  return (
    <header className="site-header">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {/* Statutory Disclaimer Ticker */}
      <div className="disclaimer-banner">
        <span className="disclaimer-tag">STATUTORY NOTICE</span>
        <span className="disclaimer-text">
          Informational assistance only. CounterDraft does not provide formal legal representation or create an attorney-client relationship. All evaluations must be validated by an enrolled advocate or jurisdictional legal professional.
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
            <h1 className="brand-title">
              COUNTERDRAFT<span className="brand-dot">.</span>
            </h1>
            <div className="brand-subtitle">
              GenAI Legal Assistant powered by Google Gemini · Clause Risk Auditor & Counter-Proposal Engine
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
      <nav className="tab-navigation" aria-label="CounterDraft tools">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
            aria-current={activeTab === id ? 'page' : undefined}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
});
