import React, { useState } from 'react';
import type { LegalDocument } from '../types/legal';
import { parseCustomContract } from '../services/legalEngine';
import { enrichDocumentWithAI } from '../services/genai';
import { validateContractPayload } from '../utils/security';
import { DocumentIcon, CloseIcon } from './Icons';
import { Modal } from './Modal';

/** Plain-text formats that FileReader.readAsText can decode faithfully. */
const ACCEPTED_EXTENSIONS = ['.txt', '.md', '.text'];

interface DocumentUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentLoaded: (doc: LegalDocument) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  isOpen,
  onClose,
  onDocumentLoaded
}) => {
  const [docTitle, setDocTitle] = useState<string>('');
  const [docType, setDocType] = useState<string>('Commercial Agreement');
  const [rawText, setRawText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [useGenAI, setUseGenAI] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Guard against memory bomb DoS (> 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('File exceeds maximum permitted size of 2 MB. Please provide a standard text contract.');
      e.target.value = '';
      return;
    }

    // 2. Only accept plain-text formats; binary Word/PDF files cannot be decoded as text in the browser
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ACCEPTED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    const isTextMime = !file.type || file.type.startsWith('text/');

    if (!hasValidExtension || !isTextMime) {
      setErrorMsg('Unsupported file format. Upload a plain-text contract (.txt or .md), or copy the text from your Word/PDF file and paste it below.');
      e.target.value = '';
      return;
    }

    if (!docTitle) {
      setDocTitle(file.name.replace(/\.[^/.]+$/, '').slice(0, 80));
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content || '');
    };
    reader.onerror = () => {
      setErrorMsg('An error occurred while reading the file. Please verify file permissions.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadSample = (sampleType: 'nda' | 'consultancy') => {
    if (sampleType === 'nda') {
      setDocTitle('Mutual Non-Disclosure & Confidentiality Agreement');
      setDocType('Non-Disclosure Agreement');
      setRawText(`MUTUAL NON-DISCLOSURE AGREEMENT

Section 1. Definition of Confidential Information
Confidential Information means all technical, commercial, financial, and proprietary data disclosed by either party, whether orally or in writing, designated as confidential.

Section 2. Standard of Care and Non-Use
Each party agrees to hold the other party Confidential Information in strict confidence, exercising at least the same degree of care it exercises with its own trade secrets, but in no event less than a reasonable standard of care.

Section 3. Residual Information Carve-Out
Notwithstanding any provision herein, Recipient shall be free to use for any purpose the residuals resulting from access to or work with Discloser Confidential Information. Residuals shall mean ideas, concepts, know-how, or techniques retained in unaided human memory.

Section 4. Term and Perpetual Protection
The confidentiality obligations under this Agreement shall survive for a period of five (5) years from the Effective Date, except with respect to Trade Secrets which shall be maintained indefinitely until public disclosure through no fault of Recipient.

Section 5. Remedies and Liquidated Damages
In the event of any unauthorized disclosure or breach of this Agreement by Recipient, Discloser shall be entitled to recover liquidated damages in the amount of 500,000 currency units per violation without proof of actual financial damage.`);
    } else {
      setDocTitle('Independent Contractor & Consultancy Master Agreement');
      setDocType('Consultancy Agreement');
      setRawText(`CONSULTANCY SERVICES AGREEMENT

Clause 1. Scope of Independent Services
Consultant agrees to provide specialized advisory services as detailed in Statement of Work No. 1 in an autonomous professional capacity.

Clause 2. Compensation and Payment Terms
Company shall pay Consultant hourly professional fees net 30 days following receipt of verified itemized invoice.

Clause 3. Intellectual Property Assignment
Consultant hereby assigns to Company all right, title, and interest in and to all deliverables and inventions produced in performance of the Services. Consultant warrants that deliverables do not infringe third-party patents.

Clause 4. Unilateral Restraint of Trade
For twelve (12) months following termination of this Agreement, Consultant shall not render services, directly or indirectly, to any existing client of Company in the same metropolitan territory.

Clause 5. Governing Law and Exclusive Forum
This Agreement shall be governed by the laws of India. Any legal dispute shall be subject to the exclusive jurisdiction of the civil courts located at Company corporate headquarters.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateContractPayload(rawText, docTitle);
    if (!validation.isValid) {
      setErrorMsg(validation.errorMessage || 'Invalid contract text.');
      return;
    }

    let parsedDoc: LegalDocument;
    try {
      parsedDoc = parseCustomContract(validation.cleanText, validation.cleanTitle, docType);
    } catch {
      setErrorMsg('Failed to parse text. Please ensure the document contains legible text.');
      return;
    }

    if (useGenAI) {
      setIsAnalyzing(true);
      setErrorMsg('');
      try {
        parsedDoc = await enrichDocumentWithAI(parsedDoc);
      } catch {
        // Graceful degradation: keep the offline statutory rule-engine analysis.
        parsedDoc = { ...parsedDoc, analysisSource: 'rules' };
      } finally {
        setIsAnalyzing(false);
      }
    }

    onDocumentLoaded(parsedDoc);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="upload-modal-title">
      {/* Modal Header */}
      <div className="modal-header">
        <div className="modal-title-group">
          <DocumentIcon size={18} />
          <h2 id="upload-modal-title">UPLOAD OR PASTE CUSTOM CONTRACT FOR AUDIT</h2>
        </div>
        <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close dialog">
          <CloseIcon size={16} />
        </button>
      </div>

      {/* Modal Content */}
      <form onSubmit={handleSubmit} className="modal-body">
        <p className="modal-intro">
          Clauses are segmented locally in your browser. With GenAI analysis enabled, the clause text is sent to Google Gemini through our server to generate plain-language explanations, risk ratings, and redlines. Nothing is stored by CounterDraft. Remove names, addresses, and account numbers before submitting.
        </p>

        <div className="form-row-grid">
          <div className="form-group">
            <label htmlFor="custom-title" className="field-label">
              CONTRACT TITLE:
            </label>
            <input
              id="custom-title"
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Commercial Office Lease / Freelance Contract"
              className="styled-search-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="custom-type" className="field-label">
              DOCUMENT CLASSIFICATION:
            </label>
            <select
              id="custom-type"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="styled-select"
            >
              <option value="Residential Lease">Residential Lease Agreement</option>
              <option value="Commercial Agreement">Commercial Agreement / Services</option>
              <option value="Employment Agreement">Employment & Executive Contract</option>
              <option value="Non-Disclosure Agreement">Non-Disclosure Agreement (NDA)</option>
              <option value="Terms of Service">Digital Terms of Service / Policy</option>
              <option value="Other Agreement">Other Legal Contract</option>
            </select>
          </div>
        </div>

        <div className="sample-buttons-strip">
          <span className="sample-label">Or load standard demonstration template:</span>
          <button
            type="button"
            onClick={() => handleLoadSample('nda')}
            className="sample-pill-btn"
          >
            Load Commercial NDA Template
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('consultancy')}
            className="sample-pill-btn"
          >
            Load Consultancy Agreement Template
          </button>
        </div>

        <div className="form-group">
          <div className="textarea-label-row">
            <label htmlFor="raw-contract-text" className="field-label">
              CONTRACT TEXT (PASTE VERBATIM TEXT OR UPLOAD FILE):
            </label>
            <label className="file-upload-label">
              <span>Select .txt / .md file</span>
              <input
                type="file"
                accept=".txt,.md,.text,text/plain,text/markdown"
                onChange={handleFileUpload}
                className="visually-hidden"
              />
            </label>
          </div>

          <textarea
            id="raw-contract-text"
            rows={12}
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setErrorMsg('');
            }}
            placeholder="Paste contract sections, clauses, or full text here (e.g. Section 1. Term... Section 2. Liability...)..."
            className="styled-textarea"
          />
        </div>

        <label className="genai-consent-row">
          <input
            type="checkbox"
            checked={useGenAI}
            onChange={(e) => setUseGenAI(e.target.checked)}
            className="styled-checkbox"
          />
          <span>
            <strong>Analyse with Google Gemini (GenAI).</strong> Untick to use only the offline statutory rule engine; no text leaves your browser.
          </span>
        </label>

        {errorMsg && <div className="form-error-banner" role="alert">{errorMsg}</div>}

        <div className="modal-actions-bar">
          <button type="button" onClick={onClose} className="action-btn-secondary">
            Cancel
          </button>
          <button type="submit" className="action-btn-primary" disabled={isAnalyzing} aria-busy={isAnalyzing}>
            <DocumentIcon size={14} />
            <span>{isAnalyzing ? 'Gemini is reading your contract…' : 'Analyze & Ingest Docket'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
