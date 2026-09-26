import React, { useState } from 'react';
import { sampleContracts } from './data/sampleContracts';
import type { LegalDocument } from './types/legal';
import { Header } from './components/Header';
import type { ActiveTab } from './components/Header';
import { DocumentAuditor } from './components/DocumentAuditor';
import { ContractComparator } from './components/ContractComparator';
import { GroundedQA } from './components/GroundedQA';
import { PrecedentNavigator } from './components/PrecedentNavigator';
import { NegotiationPlaybook } from './components/NegotiationPlaybook';
import { ActionChecklist } from './components/ActionChecklist';
import { CounselBriefGenerator } from './components/CounselBriefGenerator';
import { DocumentUploader } from './components/DocumentUploader';
import { TermsModal } from './components/TermsModal';
import { PrivacyModal } from './components/PrivacyModal';
import { ScalesIcon } from './components/Icons';

export const App: React.FC = () => {
  const [documents, setDocuments] = useState<LegalDocument[]>(sampleContracts);
  const [activeDocId, setActiveDocId] = useState<string>(sampleContracts[0].id);
  const [activeTab, setActiveTab] = useState<ActiveTab>('auditor');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [qaPrefillQuery, setQaPrefillQuery] = useState<string>('');

  const currentDoc = documents.find((d) => d.id === activeDocId) || documents[0];

  const handleDocumentLoaded = (newDoc: LegalDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    setActiveTab('auditor');
  };

  const handleSelectClauseForQA = (clauseNumber: string) => {
    setQaPrefillQuery(`What does ${clauseNumber} obligate me to do, and what are my legal protections?`);
    setActiveTab('qa');
  };

  return (
    <div className="juris-app">
      {/* Masthead Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        activeDocTitle={currentDoc.title}
      />

      {/* Main Workspace Area */}
      <main className="main-content-area">
        {activeTab === 'auditor' && (
          <DocumentAuditor
            document={currentDoc}
            onSelectClauseForQA={handleSelectClauseForQA}
            onSwitchDocument={(id) => setActiveDocId(id)}
            allDocuments={documents}
          />
        )}

        {activeTab === 'comparator' && (
          <ContractComparator />
        )}

        {activeTab === 'playbook' && (
          <NegotiationPlaybook document={currentDoc} />
        )}

        {activeTab === 'qa' && (
          <GroundedQA
            document={currentDoc}
            initialQuery={qaPrefillQuery}
            onNavigateToClause={() => setActiveTab('auditor')}
          />
        )}

        {activeTab === 'precedents' && (
          <PrecedentNavigator />
        )}

        {activeTab === 'checklist' && (
          <ActionChecklist document={currentDoc} />
        )}

        {activeTab === 'counsel' && (
          <CounselBriefGenerator document={currentDoc} />
        )}
      </main>

      {/* Global Editorial Footer */}
      <footer className="site-footer no-print">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-brand">
              <ScalesIcon size={16} />
              <span>COUNTERDRAFT LEGAL INTELLIGENCE</span>
            </div>
            <p className="footer-text">
              Engineered to demystify complex legal drafting, balance asymmetrical contracts, and empower non-lawyers with actionable redline counter-drafts and statutory literacy before entering consultations with advocates.
            </p>
          </div>

          <div className="footer-right">
            <div className="footer-links-row">
              <button type="button" onClick={() => setIsTermsOpen(true)} className="footer-link">
                Terms of Service
              </button>
              <span className="footer-sep">•</span>
              <button type="button" onClick={() => setIsPrivacyOpen(true)} className="footer-link">
                Privacy Policy
              </button>
              <span className="footer-sep">•</span>
              <button type="button" onClick={() => setActiveTab('precedents')} className="footer-link">
                Judicial Precedent Index
              </button>
            </div>
            <div className="footer-copy">
              Grounded in Supreme Court & High Court Precedents, Transfer of Property Act, and Indian Contract Act, 1872.
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DocumentUploader
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentLoaded={handleDocumentLoaded}
      />

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
};

export default App;
