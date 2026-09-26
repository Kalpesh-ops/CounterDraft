import React from 'react';
import { CloseIcon, ShieldAlertIcon } from './Icons';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-folio modal-folio-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldAlertIcon size={18} />
            <h2>PRIVACY POLICY AND DATA PROTECTION FRAMEWORK</h2>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close dialog">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body policy-text-body">
          <div className="policy-statutory-callout">
            <strong>CLIENT CONFIDENTIALITY COMMITMENT:</strong> Legal documents contain privileged business secrets, lease details, and personal identifiers. JurisFolio is engineered on a local-first paradigm designed to prevent confidential document retention.
          </div>

          <section className="policy-section">
            <h3>1. Local Memory Processing</h3>
            <p>
              When you paste or upload contracts, agreements, or addenda into JurisFolio, parsing and clause analysis occur within your browser execution environment. Documents are retained in active session memory only for the duration of your inspection and are cleared when the session terminates.
            </p>
          </section>

          <section className="policy-section">
            <h3>2. No Foundation Model Training on Client Data</h3>
            <p>
              Your uploaded agreements, contract terms, party names, and financial covenants are never harvested, compiled, or utilized to train general public artificial intelligence or foundation models.
            </p>
          </section>

          <section className="policy-section">
            <h3>3. Zero Permanent Cloud Storage</h3>
            <p>
              JurisFolio does not operate a persistent database storing your analyzed agreements. Any exports you generate (e.g. Counsel Briefs, Checklists) are compiled directly on your client device and downloaded to your local file system.
            </p>
          </section>

          <section className="policy-section">
            <h3>4. Compliance with Personal Data Protection Statutes</h3>
            <p>
              In alignment with international privacy standards and the Digital Personal Data Protection Act, you maintain sole sovereignty over any personal or corporate information inputted into the platform.
            </p>
          </section>
        </div>

        <div className="modal-actions-bar">
          <button type="button" onClick={onClose} className="action-btn-primary">
            Close Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
};
