import React, { useMemo, useState } from 'react';
import type { LegalDocument } from '../types/legal';
import { generateNegotiationEmail, calculateFinancialExposure } from '../services/legalEngine';
import { sanitizeInput, safeCopyToClipboard } from '../utils/security';
import { BriefcaseIcon, CheckIcon, ShieldAlertIcon } from './Icons';

interface NegotiationPlaybookProps {
  document: LegalDocument;
}

export const NegotiationPlaybook: React.FC<NegotiationPlaybookProps> = ({ document }) => {
  const [senderName, setSenderName] = useState<string>('Prospective Signatory');
  const [recipientName, setRecipientName] = useState<string>(
    document.documentType.toLowerCase().includes('lease')
      ? 'Property Manager / Landlord'
      : document.documentType.toLowerCase().includes('employment')
      ? 'Hiring Team & HR Director'
      : 'Contract Administrator'
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const cleanSender = sanitizeInput(senderName) || 'Prospective Signatory';
  const cleanRecipient = sanitizeInput(recipientName) || 'Counterparty';
  const emailDraft = useMemo(
    () => generateNegotiationEmail(document, cleanSender, cleanRecipient),
    [document, cleanSender, cleanRecipient]
  );
  const financialExposure = useMemo(() => calculateFinancialExposure(document), [document]);
  const highRiskCount = useMemo(() => document.clauses.filter(c => c.riskLevel === 'high').length, [document.clauses]);

  const handleCopyEmail = () => {
    safeCopyToClipboard(`Subject: ${emailDraft.subject}\n\n${emailDraft.bodyText}`).then((success) => {
      if (success) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    });
  };

  return (
    <div className="negotiation-playbook-container">
      {/* Top Overview Panel */}
      <section className="docket-overview-panel">
        <div className="docket-selector-row">
          <div>
            <span className="section-eyebrow">CONTRACT NEGOTIATION PLAYBOOK</span>
            <h2 className="panel-heading-text">Counter-Draft Negotiation Letter & Financial Exposure</h2>
          </div>

          <div className="brief-actions-bar">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="action-btn-primary"
            >
              {isCopied ? <CheckIcon size={14} /> : <BriefcaseIcon size={14} />}
              <span>{isCopied ? 'Email Copied to Clipboard' : 'Copy Negotiation Email'}</span>
            </button>
          </div>
        </div>

        {/* Financial & Liability Exposure Grid (2-column balanced layout) */}
        <div className="exposure-summary-grid">
          <div className="exposure-card left-exposure">
            <div className="card-header-line">
              <span className="section-eyebrow">FINANCIAL EXPOSURE AUDIT</span>
              <span className="risk-badge badge-high">
                {highRiskCount} High-Risk Covenants
              </span>
            </div>

            <div className="exposure-financial-metrics">
              <div className="fin-metric-row">
                <span className="fin-metric-label">Security Deposit Exposure:</span>
                <span className="fin-metric-value">{financialExposure.depositAtRisk}</span>
              </div>
              <div className="fin-metric-row">
                <span className="fin-metric-label">Penalty / Late Fee Rate:</span>
                <span className="fin-metric-value">{financialExposure.potentialPenaltyRate}</span>
              </div>
              <div className="fin-metric-row">
                <span className="fin-metric-label">Notice & Wage Liability:</span>
                <span className="fin-metric-value">{financialExposure.noticeWageExposure}</span>
              </div>
              <div className="fin-metric-row">
                <span className="fin-metric-label">Liability Cap Protection:</span>
                <span className="fin-metric-value">{financialExposure.liabilityCapAmount}</span>
              </div>
            </div>
          </div>

          <div className="exposure-card right-exposure">
            <div className="card-header-line">
              <span className="section-eyebrow">STRATEGIC NEGOTIATION OBJECTIVE</span>
              <span className="stat-count-total">{emailDraft.addressedClauseNumbers.length} Redlines Proposed</span>
            </div>

            <p className="summary-paragraph">
              Counterparties often insert aggressive boilerplate assuming signatories will sign without reading. Sending a formal, polite counter-proposal referencing standard statutory norms shifts leverage back to you before signature.
            </p>

            <div className="critical-vulnerabilities-list">
              <span className="vuln-heading">Provisions Targeted for Revision:</span>
              <ol className="vuln-items">
                {financialExposure.keyFinancialVulnerabilities.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Sender & Recipient Inputs */}
        <div className="form-row-grid section-spaced">
          <div className="form-group">
            <label htmlFor="sender-name-input" className="field-label">
              YOUR NAME / ENTITY:
            </label>
            <input
              id="sender-name-input"
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="styled-search-input"
              placeholder="e.g. John Doe / Client Signatory"
            />
          </div>

          <div className="form-group">
            <label htmlFor="recipient-name-input" className="field-label">
              COUNTERPARTY CONTACT / TITLE:
            </label>
            <input
              id="recipient-name-input"
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="styled-search-input"
              placeholder="e.g. Apex Property Management / HR Director"
            />
          </div>
        </div>
      </section>

      {/* Generated Ready-to-Send Email Card */}
      <article className="diff-card">
        <div className="diff-card-header">
          <div className="diff-title-meta">
            <BriefcaseIcon size={16} />
            <h3 className="diff-topic-heading">Ready-to-Send Counter-Proposal Email</h3>
          </div>
          <span className="clause-number-tag">EXECUTIVE CORRESPONDENCE</span>
        </div>

        <div className="email-subject-box">
          <span className="sub-label">SUBJECT:</span>
          <span className="email-subject-text">{emailDraft.subject}</span>
        </div>

        <div className="email-body-box">
          <pre className="email-pre-text">{emailDraft.bodyText}</pre>
        </div>

        <div className="diff-analysis-box">
          <div className="analysis-header">
            <ShieldAlertIcon size={14} />
            <span>HOW TO USE THIS CORRESPONDENCE:</span>
          </div>
          <p className="analysis-text">
            Copy this draft directly into your email client. Counterparties typically concede on at least 2 of 3 requests when presented with reasonable statutory arguments and drafted replacement text.
          </p>
        </div>
      </article>
    </div>
  );
};
