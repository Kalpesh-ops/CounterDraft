import React, { useMemo, useState } from 'react';
import type { LegalDocument, ObligationItem } from '../types/legal';
import { sanitizeInput } from '../utils/security';
import { ChecklistIcon, PlusIcon, DownloadIcon } from './Icons';

interface ActionChecklistProps {
  document: LegalDocument;
}

interface ChecklistItem {
  id: string;
  stage: 'pre_signing' | 'active_term' | 'termination_exit';
  title: string;
  description: string;
  deadlineOrTiming: string;
  clauseRef: string;
  completed: boolean;
  priority: 'urgent' | 'standard';
}

/** Builds the starting checklist: universal safeguards plus the document's extracted obligations. */
function buildDefaultItems(document: LegalDocument): ChecklistItem[] {
  const safeguards: ChecklistItem[] = [
    {
      id: 'chk-1',
      stage: 'pre_signing',
      title: 'Verify Title and Authority of Counterparty',
      description: 'Request official proof of ownership (e.g. registered title deed, power of attorney, or board resolution) before signing or paying deposits.',
      deadlineOrTiming: 'Prior to signing and advance deposit disbursement',
      clauseRef: 'Section 1.1',
      completed: false,
      priority: 'urgent'
    },
    {
      id: 'chk-2',
      stage: 'pre_signing',
      title: 'Submit Redline on Unilateral Forfeiture and Liability Caps',
      description: 'Propose amended bilateral terms for security deposit return within 14 days and elimination of disproportionate penalty clauses.',
      deadlineOrTiming: 'During pre-execution contract negotiations',
      clauseRef: document.clauses.find(c => c.riskLevel === 'high')?.clauseNumber || 'Section 2.3',
      completed: false,
      priority: 'urgent'
    },
    {
      id: 'chk-3',
      stage: 'active_term',
      title: 'Establish Written Log for All Financial & Notice Communications',
      description: 'Ensure all rent payments, repair requests, and maintenance defects are documented via registered email or written receipt rather than verbal calls.',
      deadlineOrTiming: 'Continuous throughout active contractual term',
      clauseRef: 'Section 3.1',
      completed: false,
      priority: 'standard'
    },
    {
      id: 'chk-4',
      stage: 'active_term',
      title: 'Monitor Lock-In Period and Notice Windows',
      description: 'Calendar the expiration of the minimum lock-in period and note the exact 30-day notice window required before terminating or renewing.',
      deadlineOrTiming: 'At least 45 days prior to intended departure date',
      clauseRef: 'Section 6.1',
      completed: false,
      priority: 'urgent'
    },
    {
      id: 'chk-5',
      stage: 'termination_exit',
      title: 'Formal Written Notice of Termination with Acknowledgment',
      description: 'Dispatch formal termination notice via email with delivery receipt, citing the exact clause governing exit without fault.',
      deadlineOrTiming: 'Exactly according to contractual notice requirements',
      clauseRef: 'Section 6.1',
      completed: false,
      priority: 'urgent'
    },
    {
      id: 'chk-6',
      stage: 'termination_exit',
      title: 'Joint Inspection and Formal Handover Clearance Sheet',
      description: 'Execute a written joint inspection sign-off recording condition of premises/assets to preempt arbitrary security deposit deductions.',
      deadlineOrTiming: 'On the final day of possession / handover',
      clauseRef: 'Section 2.3',
      completed: false,
      priority: 'urgent'
    }
  ];

  const obligationItems: ChecklistItem[] = document.obligations.slice(0, 6).map((ob: ObligationItem) => ({
    id: `chk-${ob.id}`,
    stage: 'active_term',
    title: ob.action.length > 90 ? ob.action.slice(0, 87) + '…' : ob.action,
    description: `${ob.responsibleParty} owes this to ${ob.beneficiaryParty}. If missed: ${ob.consequenceOfDefault}`,
    deadlineOrTiming: ob.timelineOrDeadline,
    clauseRef: ob.clauseRef,
    completed: false,
    priority: ob.status === 'mandatory' ? 'urgent' : 'standard'
  }));

  return [...safeguards, ...obligationItems];
}

export const ActionChecklist: React.FC<ActionChecklistProps> = ({ document }) => {
  const [items, setItems] = useState<ChecklistItem[]>(() => buildDefaultItems(document));
  const [newTitle, setNewTitle] = useState<string>('');
  const [newStage, setNewStage] = useState<ChecklistItem['stage']>('pre_signing');
  const [activeStageFilter, setActiveStageFilter] = useState<'all' | ChecklistItem['stage']>('all');

  const toggleComplete = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeInput(newTitle);
    if (!clean) return;

    const newItem: ChecklistItem = {
      id: 'custom-chk-' + Date.now(),
      stage: newStage,
      title: clean,
      description: 'User-specified action item for contractual compliance.',
      deadlineOrTiming: 'As scheduled by user',
      clauseRef: 'General Protocol',
      completed: false,
      priority: 'standard'
    };

    setItems((prev) => [...prev, newItem]);
    setNewTitle('');
  };

  const handleExportChecklist = () => {
    let content = 'ACTIONABLE CONTRACT COMPLIANCE CHECKLIST\n';
    content += 'Docket: ' + document.title + '\n';
    content += 'Generated: ' + new Date().toLocaleDateString() + '\n\n';

    items.forEach((item, index) => {
      content += '[' + (item.completed ? 'COMPLETED' : 'PENDING') + '] ' + (index + 1) + '. ' + item.title + '\n';
      content += '   Stage: ' + item.stage.toUpperCase() + ' | Ref: ' + item.clauseRef + '\n';
      content += '   Timing: ' + item.deadlineOrTiming + '\n';
      content += '   Guidance: ' + item.description + '\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = 'counterdraft_compliance_checklist.txt';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const filteredItems = useMemo(
    () => (activeStageFilter === 'all' ? items : items.filter((item) => item.stage === activeStageFilter)),
    [items, activeStageFilter]
  );

  const completedCount = useMemo(() => items.filter((i) => i.completed).length, [items]);
  const completionPercent = Math.round((completedCount / (items.length || 1)) * 100);

  return (
    <div className="checklist-container">
      {/* Overview Banner */}
      <section className="docket-overview-panel">
        <div className="docket-selector-row">
          <div>
            <span className="section-eyebrow">ACTIONABLE MILESTONES & TIMELINES</span>
            <h2 className="panel-heading-text">Compliance & Safeguard Checklist</h2>
          </div>

          <div className="brief-actions-bar">
            <button
              type="button"
              onClick={handleExportChecklist}
              className="action-btn-secondary"
            >
              <DownloadIcon size={14} />
              <span>Export Checklist (.txt)</span>
            </button>
          </div>
        </div>

        {/* Progress & Stage Filters (2-column layout) */}
        <div className="exposure-summary-grid">
          <div className="exposure-card left-exposure">
            <div className="card-header-line">
              <span className="section-eyebrow">COMPLETION STATUS</span>
              <span className="stat-count-total">
                {completedCount} of {items.length} Completed
              </span>
            </div>
            <div
              className="progress-bar-container"
              role="progressbar"
              aria-label="Checklist completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completionPercent}
            >
              {/* Width is data-driven, so it is the one style set inline. */}
              <div className="progress-bar-fill" style={{ width: `${completionPercent}%` }} />
            </div>
            <p className="summary-paragraph">
              Executing these strategic steps prior to signature and upon contract termination mitigates the severe liabilities identified in the document audit.
            </p>
          </div>

          <div className="exposure-card right-exposure">
            <div className="card-header-line">
              <span className="section-eyebrow">EXTRACTED CONTRACTUAL OBLIGATIONS</span>
              <span className="stat-count-total">{document.obligations.length} Active Duties</span>
            </div>

            <div className="obligations-preview-list">
              {document.obligations.slice(0, 2).map((ob: ObligationItem) => (
                <div key={ob.id} className="obligation-micro-card">
                  <div className="ob-head">
                    <span className="ob-actor">{ob.responsibleParty}:</span>
                    <span className="ob-action">{ob.action}</span>
                  </div>
                  <div className="ob-foot">
                    <span>Deadline: {ob.timelineOrDeadline}</span>
                    <span>Ref: {ob.clauseRef}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stage Toolbar */}
      <div className="clause-toolbar">
        <div className="toolbar-left">
          <ChecklistIcon size={14} />
          <span className="toolbar-label">TIMELINE STAGE:</span>
          <div className="filter-button-group">
            <button
              type="button"
              className={`filter-btn ${activeStageFilter === 'all' ? 'active' : ''}`}
              aria-pressed={activeStageFilter === 'all'}
              onClick={() => setActiveStageFilter('all')}
            >
              All Stages ({items.length})
            </button>
            <button
              type="button"
              className={`filter-btn ${activeStageFilter === 'pre_signing' ? 'active' : ''}`}
              aria-pressed={activeStageFilter === 'pre_signing'}
              onClick={() => setActiveStageFilter('pre_signing')}
            >
              Pre-Signing Due Diligence
            </button>
            <button
              type="button"
              className={`filter-btn ${activeStageFilter === 'active_term' ? 'active' : ''}`}
              aria-pressed={activeStageFilter === 'active_term'}
              onClick={() => setActiveStageFilter('active_term')}
            >
              Active Term Covenants
            </button>
            <button
              type="button"
              className={`filter-btn ${activeStageFilter === 'termination_exit' ? 'active' : ''}`}
              aria-pressed={activeStageFilter === 'termination_exit'}
              onClick={() => setActiveStageFilter('termination_exit')}
            >
              Exit & Handover Protocols
            </button>
          </div>
        </div>
      </div>

      {/* Checklist Stream */}
      <div className="checklist-stream">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`checklist-item-card ${item.completed ? 'is-completed' : ''}`}
          >
            <div className="chk-col-control">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleComplete(item.id)}
                className="styled-checkbox"
                aria-label={`Mark ${item.title} as completed`}
              />
            </div>

            <div className="chk-col-content">
              <div className="chk-top-meta">
                <span className="stage-pill">
                  {item.stage === 'pre_signing'
                    ? 'PRE-SIGNING'
                    : item.stage === 'active_term'
                    ? 'ACTIVE TERM'
                    : 'EXIT & HANDOVER'}
                </span>
                <span className="clause-number-tag">{item.clauseRef}</span>
                {item.priority === 'urgent' && (
                  <span className="risk-badge badge-high">URGENT</span>
                )}
              </div>

              <h3 className="chk-title">{item.title}</h3>
              <p className="chk-desc">{item.description}</p>

              <div className="chk-timing-line">
                <strong>Target Schedule:</strong> {item.deadlineOrTiming}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Action Item */}
      <div className="add-item-card">
        <span className="section-eyebrow">ADD CUSTOM COMPLIANCE MILESTONE</span>
        <form onSubmit={handleAddItem} className="add-item-form">
          <label htmlFor="new-milestone-title" className="visually-hidden">Custom milestone description</label>
          <input
            id="new-milestone-title"
            type="text"
            maxLength={200}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add custom compliance milestone (e.g. 'Inspect electrical meters on move-in day')..."
            className="styled-search-input"
          />
          <label htmlFor="new-milestone-stage" className="visually-hidden">Milestone stage</label>
          <select
            id="new-milestone-stage"
            value={newStage}
            onChange={(e) => setNewStage(e.target.value as ChecklistItem['stage'])}
            className="styled-select-compact"
          >
            <option value="pre_signing">Pre-Signing Stage</option>
            <option value="active_term">Active Term Stage</option>
            <option value="termination_exit">Exit & Handover Stage</option>
          </select>
          <button type="submit" className="action-btn-primary">
            <PlusIcon size={14} />
            <span>Add Item</span>
          </button>
        </form>
      </div>
    </div>
  );
};
