import React, { useState } from 'react';
import type { LegalDocument } from '../types/legal';
import { generateCounselBrief } from '../services/legalEngine';
import { BriefcaseIcon, DownloadIcon, CheckIcon, ShieldAlertIcon } from './Icons';

interface CounselBriefGeneratorProps {
  document: LegalDocument;
}

export const CounselBriefGenerator: React.FC<CounselBriefGeneratorProps> = ({ document }) => {
  const [clientName, setClientName] = useState<string>('Client Signatory');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const brief = generateCounselBrief(document, clientName);

  const handlePrintOrDownload = () => {
    window.print();
  };

  const handleCopyText = () => {
    let text = 'LEGAL COUNSEL CONSULTATION BRIEF\n';
    text += '=================================\n';
    text += 'Client: ' + brief.clientName + '\n';
    text += 'Document Under Review: ' + brief.documentTitle + '\n';
    text += 'Counterparty: ' + brief.counterparty + '\n';
    text += 'Date Prepared: ' + brief.datePrepared + '\n';
    text += 'Overall Exposure Rating: ' + brief.overallExposureRating + '\n\n';

    text += '1. HIGH PRIORITY RISKS & QUESTIONS FOR COUNSEL:\n';
    brief.highPriorityRisks.forEach((risk, i) => {
      text += '\n[' + (i + 1) + '] Clause ' + risk.clauseNumber + ': ' + risk.issue + '\n';
      text += 'Questions to ask Advocate:\n';
      risk.questionsForAttorney.forEach((q) => {
        text += '  - ' + q + '\n';
      });
      text += 'Suggested Redline Alternative:\n  ' + risk.suggestedRedline + '\n';
    });

    text += '\n2. STATUTORY DEFENSES IDENTIFIED:\n';
    brief.statutoryDefenses.forEach((def) => {
      text += '  - ' + def + '\n';
    });

    text += '\n3. CRITICAL MISSING SAFEGUARDS:\n';
    brief.missingSafeguards.forEach((sg) => {
      text += '  - ' + sg + '\n';
    });

    text += '\n4. NEGOTIATION PRIORITIES:\n';
    brief.negotiationChecklist.forEach((nc) => {
      text += '  - ' + nc + '\n';
    });

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="counsel-brief-container">
      {/* Top Banner & Client Name Control */}
      <section className="docket-overview-panel no-print">
        <div className="docket-selector-row">
          <div>
            <span className="section-eyebrow">LEGAL COUNSEL ESCALATION DOSSIER</span>
            <h2 className="panel-heading-text">Consultation Briefing Sheet for Enrolled Advocate</h2>
          </div>

          <div className="brief-actions-bar">
            <button
              type="button"
              onClick={handleCopyText}
              className="action-btn-secondary"
            >
              {isCopied ? <CheckIcon size={14} /> : <BriefcaseIcon size={14} />}
              <span>{isCopied ? 'Brief Copied to Clipboard' : 'Copy Plaintext Brief'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintOrDownload}
              className="action-btn-primary"
            >
              <DownloadIcon size={14} />
              <span>Print / Export PDF Folio</span>
            </button>
          </div>
        </div>

        <div className="client-name-input-bar">
          <label htmlFor="client-name" className="field-label-inline">
            Signatory / Client Name:
          </label>
          <input
            id="client-name"
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="styled-input-compact"
            placeholder="Enter your name or entity..."
          />
          <span className="field-hint">
            (Formats this briefing sheet ready for your legal consultation)
          </span>
        </div>
      </section>

      {/* Printable Folio Card */}
      <article className="printable-folio-sheet">
        {/* Folio Header */}
        <div className="folio-header">
          <div className="folio-stamp-box">
            <span className="stamp-label">EXPOSURE RATING:</span>
            <span className={`stamp-value exposure-${brief.overallExposureRating.toLowerCase()}`}>
              {brief.overallExposureRating.toUpperCase()}
            </span>
          </div>

          <div className="folio-title-block">
            <span className="folio-kicker">ADVOCATE CONSULTATION BRIEFING MEMORANDUM</span>
            <h1 className="folio-document-title">{brief.documentTitle}</h1>
            <div className="folio-meta-line">
              <span><strong>Client:</strong> {brief.clientName}</span>
              <span className="folio-sep">•</span>
              <span><strong>Counterparty:</strong> {brief.counterparty}</span>
              <span className="folio-sep">•</span>
              <span><strong>Date Generated:</strong> {brief.datePrepared}</span>
            </div>
          </div>
        </div>

        {/* Section 1: High Priority Provisions and Direct Questions for Advocate */}
        <section className="folio-section">
          <div className="folio-section-title">
            <span className="section-roman">I.</span>
            <h2>HIGH-PRIORITY CLAUSES & STRATEGIC QUESTIONS FOR COUNSEL</h2>
          </div>

          <div className="folio-risks-table">
            {brief.highPriorityRisks.map((item, index) => (
              <div key={index} className="folio-risk-row">
                <div className="folio-risk-header">
                  <span className="clause-number-tag">{item.clauseNumber}</span>
                  <span className="folio-issue-title">{item.issue}</span>
                </div>

                <div className="folio-questions-block">
                  <span className="sub-section-label">Questions to Pose to Advocate:</span>
                  <ol className="advocate-questions-list">
                    {item.questionsForAttorney.map((q, qIdx) => (
                      <li key={qIdx}>{q}</li>
                    ))}
                  </ol>
                </div>

                <div className="folio-redline-block">
                  <span className="sub-section-label">Proposed Counter-Draft Language:</span>
                  <div className="redline-language-box">
                    {item.suggestedRedline}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Statutory Defenses & Missing Safeguards (2-column balanced layout) */}
        <div className="folio-split-grid">
          <section className="folio-col">
            <div className="folio-section-title">
              <span className="section-roman">II.</span>
              <h2>RELEVANT STATUTORY DEFENSES</h2>
            </div>
            <ul className="folio-check-list">
              {brief.statutoryDefenses.map((def, idx) => (
                <li key={idx}>
                  <strong>{def.split(':')[0]}:</strong>
                  <span>{def.split(':')[1] || ''}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="folio-col">
            <div className="folio-section-title">
              <span className="section-roman">III.</span>
              <h2>IDENTIFIED MISSING SAFEGUARDS</h2>
            </div>
            <ul className="folio-check-list">
              {brief.missingSafeguards.map((sg, idx) => (
                <li key={idx}>{sg}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* Section 3: Recommended Negotiation Priorities */}
        <section className="folio-section">
          <div className="folio-section-title">
            <span className="section-roman">IV.</span>
            <h2>RECOMMENDED NEGOTIATION PRIORITIES</h2>
          </div>
          <ol className="negotiation-priority-list">
            {brief.negotiationChecklist.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ol>
        </section>

        {/* Mandatory Counsel Disclaimer Footer */}
        <footer className="folio-footer-disclaimer">
          <ShieldAlertIcon size={16} />
          <p>
            CONFIDENTIAL ATTORNEY-CLIENT PREPARATION AID: This briefing sheet was synthesized by JurisFolio solely to assist the user in preparing for formal consultation with a licensed legal practitioner. It does not constitute formal legal counsel.
          </p>
        </footer>
      </article>
    </div>
  );
};
