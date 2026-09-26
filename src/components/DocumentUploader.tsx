import React, { useState } from 'react';
import type { LegalDocument } from '../types/legal';
import { parseCustomContract } from '../services/legalEngine';
import { validateContractPayload } from '../utils/security';
import { DocumentIcon, CloseIcon } from './Icons';

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

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!docTitle) {
      setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content || '');
    };
    reader.readAsText(file);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateContractPayload(rawText, docTitle);
    if (!validation.isValid) {
      setErrorMsg(validation.errorMessage || 'Invalid contract text.');
      return;
    }

    try {
      const parsedDoc = parseCustomContract(validation.cleanText, validation.cleanTitle, docType);
      onDocumentLoaded(parsedDoc);
      onClose();
    } catch {
      setErrorMsg('Failed to parse text. Please ensure the document contains legible text.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-folio" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <DocumentIcon size={18} />
            <h2>UPLOAD OR PASTE CUSTOM CONTRACT FOR AUDIT</h2>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close dialog">
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="modal-body">
          <p className="modal-intro">
            CounterDraft parses contract text locally in your browser. No confidential document text is stored on external model training databases.
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
                <span>Select .txt / .doc file</span>
                <input
                  type="file"
                  accept=".txt,.doc,.docx,.json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
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

          {errorMsg && <div className="form-error-banner">{errorMsg}</div>}

          <div className="modal-actions-bar">
            <button type="button" onClick={onClose} className="action-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="action-btn-primary">
              <DocumentIcon size={14} />
              <span>Analyze & Ingest Docket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
