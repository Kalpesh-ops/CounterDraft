import React, { Suspense, lazy, useCallback, useMemo, useState } from 'react';
import { sampleContracts } from './data/sampleContracts';
import type { LegalDocument } from './types/legal';
import { Header } from './components/Header';
import type { ActiveTab } from './components/Header';
import { DocumentAuditor } from './components/DocumentAuditor';
import { ScalesIcon } from './components/Icons';

// Secondary workspaces are code-split so the initial bundle only ships the auditor.
const ContractComparator = lazy(() => import('./components/ContractComparator').then((m) => ({ default: m.ContractComparator })));
const GroundedQA = lazy(() => import('./components/GroundedQA').then((m) => ({ default: m.GroundedQA })));
const PrecedentNavigator = lazy(() => import('./components/PrecedentNavigator').then((m) => ({ default: m.PrecedentNavigator })));
const NegotiationPlaybook = lazy(() => import('./components/NegotiationPlaybook').then((m) => ({ default: m.NegotiationPlaybook })));
const ActionChecklist = lazy(() => import('./components/ActionChecklist').then((m) => ({ default: m.ActionChecklist })));
// Dialogs load on first open, not with the initial page.
const DocumentUploader = lazy(() => import('./components/DocumentUploader').then((m) => ({ default: m.DocumentUploader })));
const TermsModal = lazy(() => import('./components/TermsModal').then((m) => ({ default: m.TermsModal })));
const PrivacyModal = lazy(() => import('./components/PrivacyModal').then((m) => ({ default: m.PrivacyModal })));
const CounselBriefGenerator = lazy(() => import('./components/CounselBriefGenerator').then((m) => ({ default: m.CounselBriefGenerator })));

export const App: React.FC = () => {
  const [documents, setDocuments] = useState<LegalDocument[]>(sampleContracts);
  const [activeDocId, setActiveDocId] = useState<string>(sampleContracts[0].id);
  const [activeTab, setActiveTab] = useState<ActiveTab>('auditor');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [qaPrefillQuery, setQaPrefillQuery] = useState<string>('');

  const currentDoc = useMemo(
    () => documents.find((d) => d.id === activeDocId) || documents[0],
    [documents, activeDocId]
  );

  // Stable handler identities let the memoised Header and workspaces skip needless re-renders.
  const openUpload = useCallback(() => setIsUploadOpen(true), []);
  const closeUpload = useCallback(() => setIsUploadOpen(false), []);
  const openTerms = useCallback(() => setIsTermsOpen(true), []);
  const closeTerms = useCallback(() => setIsTermsOpen(false), []);
  const openPrivacy = useCallback(() => setIsPrivacyOpen(true), []);
  const closePrivacy = useCallback(() => setIsPrivacyOpen(false), []);
  const showAuditor = useCallback(() => setActiveTab('auditor'), []);
  const showPrecedents = useCallback(() => setActiveTab('precedents'), []);

  const handleDocumentLoaded = useCallback((newDoc: LegalDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    setActiveTab('auditor');
  }, []);

  const handleSelectClauseForQA = useCallback((clauseNumber: string) => {
    setQaPrefillQuery(`What does ${clauseNumber} obligate me to do, and what are my legal protections?`);
    setActiveTab('qa');
  }, []);

  return (
    <div className="juris-app">
      {/* Masthead Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={openUpload}
        onOpenTerms={openTerms}
        onOpenPrivacy={openPrivacy}
        activeDocTitle={currentDoc.title}
      />

      {/* Main Workspace Area */}
      <main className="main-content-area" id="main-content" tabIndex={-1}>
        <Suspense fallback={<div className="empty-state-card" role="status">Loading workspace…</div>}>
          {activeTab === 'auditor' && (
            <DocumentAuditor
              key={currentDoc.id}
              document={currentDoc}
              onSelectClauseForQA={handleSelectClauseForQA}
              onSwitchDocument={setActiveDocId}
              allDocuments={documents}
            />
          )}

          {activeTab === 'comparator' && (
            <ContractComparator />
          )}

          {activeTab === 'playbook' && (
            <NegotiationPlaybook key={currentDoc.id} document={currentDoc} />
          )}

          {activeTab === 'qa' && (
            <GroundedQA
              key={currentDoc.id}
              document={currentDoc}
              initialQuery={qaPrefillQuery}
              onNavigateToClause={showAuditor}
            />
          )}

          {activeTab === 'precedents' && (
            <PrecedentNavigator />
          )}

          {activeTab === 'checklist' && (
            <ActionChecklist key={currentDoc.id} document={currentDoc} />
          )}

          {activeTab === 'counsel' && (
            <CounselBriefGenerator key={currentDoc.id} document={currentDoc} />
          )}
        </Suspense>
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
              A GenAI legal assistant built on Google Gemini, grounded in Indian statute and verified precedent. Engineered to demystify complex legal drafting, balance asymmetrical contracts, and empower non-lawyers with actionable redline counter-drafts and statutory literacy before entering consultations with advocates.
            </p>
          </div>

          <div className="footer-right">
            <div className="footer-links-row">
              <button type="button" onClick={openTerms} className="footer-link">
                Terms of Service
              </button>
              <span className="footer-sep">•</span>
              <button type="button" onClick={openPrivacy} className="footer-link">
                Privacy Policy
              </button>
              <span className="footer-sep">•</span>
              <button type="button" onClick={showPrecedents} className="footer-link">
                Judicial Precedent Index
              </button>
              <span className="footer-sep">•</span>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="footer-link">
                Sitemap
              </a>
              <span className="footer-sep">•</span>
              <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="footer-link">
                LLMs.txt
              </a>
            </div>
            <div className="footer-copy">
              Grounded in Supreme Court & High Court Precedents, Transfer of Property Act, and Indian Contract Act, 1872.
            </div>
          </div>
        </div>
      </footer>

      {/* Modals (mounted only once opened, so their code is fetched on demand) */}
      <Suspense fallback={null}>
        {isUploadOpen && (
          <DocumentUploader
            isOpen={isUploadOpen}
            onClose={closeUpload}
            onDocumentLoaded={handleDocumentLoaded}
          />
        )}
        {isTermsOpen && <TermsModal isOpen={isTermsOpen} onClose={closeTerms} />}
        {isPrivacyOpen && <PrivacyModal isOpen={isPrivacyOpen} onClose={closePrivacy} />}
      </Suspense>
    </div>
  );
};

export default App;
