import React from 'react';
import { Modal } from './Modal';
import { CloseIcon, ShieldAlertIcon } from './Icons';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="privacy-modal-title" className="modal-folio-large">
      <div className="modal-header">
        <div className="modal-title-group">
          <ShieldAlertIcon size={18} />
          <h2 id="privacy-modal-title">PRIVACY POLICY AND DATA PROTECTION FRAMEWORK</h2>
        </div>
        <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close dialog">
          <CloseIcon size={16} />
        </button>
      </div>

      <div className="modal-body policy-text-body">
        <div className="policy-statutory-callout">
          <strong>CLIENT CONFIDENTIALITY COMMITMENT:</strong> Legal documents contain privileged business secrets, lease details, and personal identifiers. CounterDraft keeps no database of your documents and lets you choose whether any text is sent to a GenAI model.
        </div>

        <section className="policy-section">
          <h3>1. In-Browser Processing</h3>
          <p>
            Clause segmentation, risk scoring, comparison, checklists, and briefs run in your browser. Documents are held in session memory only and are cleared when you close the tab.
          </p>
        </section>

        <section className="policy-section">
          <h3>2. Optional GenAI Processing (Google Gemini)</h3>
          <p>
            When GenAI analysis, AI Q&amp;A, or plain-language explanations are used, the relevant clause text and your question are sent over HTTPS to our server function and forwarded to the Google Gemini API. CounterDraft does not log or store this content. Google processes it under the Gemini API Terms; on the free tier Google may use submitted content to improve its products, so remove names, addresses, and account numbers first. You can switch GenAI off at upload to keep everything on your device.
          </p>
        </section>

        <section className="policy-section">
          <h3>3. Zero Permanent Cloud Storage</h3>
          <p>
            CounterDraft does not operate a persistent database storing your analyzed agreements. Any exports you generate (e.g. Counsel Briefs, Checklists) are compiled directly on your client device and downloaded to your local file system.
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
    </Modal>
  );
};
