import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import { DocumentAuditor } from './DocumentAuditor';
import { ContractComparator } from './ContractComparator';
import { ActionChecklist } from './ActionChecklist';
import { CounselBriefGenerator } from './CounselBriefGenerator';
import { NegotiationPlaybook } from './NegotiationPlaybook';
import { PrecedentNavigator } from './PrecedentNavigator';
import { DocumentUploader } from './DocumentUploader';
import { ErrorBoundary } from './ErrorBoundary';
import { sampleContracts } from '../data/sampleContracts';

const [leaseDoc, employmentDoc] = sampleContracts;
const writeText = vi.fn<(text: string) => Promise<void>>(async () => {});

beforeEach(() => {
  writeText.mockClear();
  Object.defineProperty(window.navigator, 'clipboard', { value: { writeText }, configurable: true });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('DocumentAuditor', () => {
  const renderAuditor = (onSwitch = vi.fn(), onQA = vi.fn()) => {
    render(
      <DocumentAuditor document={leaseDoc} allDocuments={sampleContracts} onSwitchDocument={onSwitch} onSelectClauseForQA={onQA} />
    );
    return { onSwitch, onQA };
  };

  it('filters clauses by risk level and category and exposes pressed state', () => {
    renderAuditor();
    const highBtn = screen.getByRole('button', { name: /^High Risk/ });
    fireEvent.click(highBtn);
    expect(highBtn.getAttribute('aria-pressed')).toBe('true');
    const cards = document.querySelectorAll('.clause-card');
    expect(cards.length).toBe(leaseDoc.riskSummary.highCount);
    cards.forEach((card) => expect(card.className).toContain('risk-border-high'));

    fireEvent.change(screen.getByLabelText('Category:'), { target: { value: 'intellectual_property' } });
    expect(screen.getByText(/No clauses match the selected filter criteria/)).toBeDefined();
  });

  it('switches documents from the selector', () => {
    const { onSwitch } = renderAuditor();
    fireEvent.change(screen.getByLabelText(/SELECT ACTIVE CONTRACT TO AUDIT/), { target: { value: employmentDoc.id } });
    expect(onSwitch).toHaveBeenCalledWith(employmentDoc.id);
  });

  it('expands a clause with the keyboard, copies its redline, and routes to Q&A', async () => {
    const { onQA } = renderAuditor();
    const header = document.querySelectorAll('.clause-card-header')[0] as HTMLElement;
    expect(header.getAttribute('aria-expanded')).toBe('false');
    fireEvent.keyDown(header, { key: 'Enter' });
    expect(header.getAttribute('aria-expanded')).toBe('true');

    const card = header.closest('article') as HTMLElement;
    fireEvent.click(within(card).getByRole('button', { name: /Copy Proposed Redline/ }));
    await waitFor(() => expect(within(card).getByText('Copied to Clipboard')).toBeDefined());
    expect(writeText).toHaveBeenCalledWith(leaseDoc.clauses[0].recommendedCounterProposal);

    fireEvent.click(within(card).getByRole('button', { name: /Inquire About/ }));
    expect(onQA).toHaveBeenCalledWith(leaseDoc.clauses[0].clauseNumber);
  });
});

describe('Copy feedback', () => {
  it('tells the user to copy manually when the browser blocks clipboard access', async () => {
    writeText.mockRejectedValueOnce(new DOMException('denied', 'NotAllowedError'));
    render(<NegotiationPlaybook document={leaseDoc} />);
    fireEvent.click(screen.getByRole('button', { name: /Copy Negotiation Email/ }));
    expect(await screen.findByText(/Copy blocked: select the text and press Ctrl\+C/)).toBeDefined();
  });
});

describe('ContractComparator', () => {
  it('filters diffs by impact', () => {
    render(<ContractComparator />);
    const worse = screen.getByRole('button', { name: /Unfavorable Shifts/ });
    fireEvent.click(worse);
    expect(worse.getAttribute('aria-pressed')).toBe('true');
  });

  it('builds a custom comparison from the demonstration pair', async () => {
    render(<ContractComparator />);
    fireEvent.click(screen.getByRole('button', { name: /Compare Two Custom Documents/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Load Freelance Contract vs Client Redline/ }));
    fireEvent.click(screen.getByRole('button', { name: /Execute Side-by-Side Comparison/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect((screen.getByLabelText(/SELECT COMPARISON BENCHMARK/) as HTMLSelectElement).value).toMatch(/^custom-comparison-/);
  });

  it('rejects an unusable draft with an accessible error', async () => {
    render(<ContractComparator />);
    fireEvent.click(screen.getByRole('button', { name: /Compare Two Custom Documents/ }));
    await screen.findByRole('dialog');
    fireEvent.change(document.getElementById('doc-a-text') as HTMLTextAreaElement, { target: { value: 'hi' } });
    fireEvent.change(document.getElementById('doc-b-text') as HTMLTextAreaElement, { target: { value: 'hey' } });
    fireEvent.click(screen.getByRole('button', { name: /Execute Side-by-Side Comparison/ }));
    expect(await screen.findByRole('alert')).toBeDefined();
  });
});

describe('ActionChecklist', () => {
  it('filters by stage, tracks progress, and adds a custom milestone', () => {
    render(<ActionChecklist document={leaseDoc} />);
    const progress = screen.getByRole('progressbar', { name: 'Checklist completion' });
    expect(progress.getAttribute('aria-valuenow')).toBe('0');

    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(Number(progress.getAttribute('aria-valuenow'))).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Exit & Handover Protocols' }));
    expect(screen.queryByText('Verify Title and Authority of Counterparty')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /All Stages/ }));

    fireEvent.change(screen.getByLabelText('Custom milestone description'), { target: { value: 'Photograph meter readings' } });
    fireEvent.change(screen.getByLabelText('Milestone stage'), { target: { value: 'termination_exit' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Item/ }));
    expect(screen.getByText('Photograph meter readings')).toBeDefined();
  });

  it('exports the checklist as a text file', () => {
    const createObjectURL = vi.fn(() => 'blob:checklist');
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<ActionChecklist document={leaseDoc} />);
    fireEvent.click(screen.getByRole('button', { name: /Export Checklist/ }));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
  });
});

describe('CounselBriefGenerator', () => {
  it('personalises, copies, and prints the advocate brief', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<CounselBriefGenerator document={employmentDoc} />);
    fireEvent.change(screen.getByLabelText(/client/i), { target: { value: 'Asha Verma' } });
    expect(screen.getAllByText(/Asha Verma/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Copy Plaintext Brief/ }));
    await waitFor(() => expect(screen.getByText('Brief Copied to Clipboard')).toBeDefined());
    expect(writeText.mock.calls[0][0]).toContain('Asha Verma');

    fireEvent.click(screen.getByRole('button', { name: /Print \/ Export PDF Folio/ }));
    expect(print).toHaveBeenCalledTimes(1);
  });
});

describe('NegotiationPlaybook', () => {
  it('rebuilds the negotiation email from the entered names and copies it', async () => {
    render(<NegotiationPlaybook document={leaseDoc} />);
    fireEvent.change(screen.getByLabelText(/YOUR NAME \/ ENTITY/), { target: { value: 'Ravi Kumar' } });
    fireEvent.change(screen.getByLabelText(/COUNTERPARTY CONTACT/), { target: { value: 'Apex Realty' } });
    fireEvent.click(screen.getByRole('button', { name: /Copy Negotiation Email/ }));
    await waitFor(() => expect(screen.getByText('Email Copied to Clipboard')).toBeDefined());
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toContain('Ravi Kumar');
    expect(copied).toContain('Apex Realty');
  });
});

describe('PrecedentNavigator', () => {
  it('searches, filters by statute, and selects a case with the keyboard', () => {
    render(<PrecedentNavigator />);
    fireEvent.change(screen.getByLabelText('Search judicial precedents'), { target: { value: 'deposit' } });
    expect(screen.getAllByText(/Kailash Nath/).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Search judicial precedents'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Statutory Doctrine/), { target: { value: 'Section 27' } });
    const cards = document.querySelectorAll('.precedent-card-item');
    expect(cards.length).toBeGreaterThan(0);

    const last = cards[cards.length - 1] as HTMLElement;
    fireEvent.keyDown(last, { key: ' ' });
    expect(last.getAttribute('aria-pressed')).toBe('true');
  });
});

describe('DocumentUploader file handling', () => {
  const upload = (file: File) => {
    render(<DocumentUploader isOpen onClose={() => {}} onDocumentLoaded={() => {}} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
  };

  it('rejects binary formats such as PDF', () => {
    upload(new File(['%PDF-1.7'], 'lease.pdf', { type: 'application/pdf' }));
    expect(screen.getByText(/Unsupported file format/)).toBeDefined();
  });

  it('rejects files larger than 2 MB before reading them', () => {
    const big = new File(['x'], 'huge.txt', { type: 'text/plain' });
    Object.defineProperty(big, 'size', { value: 3 * 1024 * 1024 });
    upload(big);
    expect(screen.getByText(/exceeds maximum permitted size of 2 MB/)).toBeDefined();
  });

  it('reads a plain-text contract and pre-fills the title', async () => {
    upload(new File(['Section 1. Rent\nRent is due monthly.'], 'flat-lease.txt', { type: 'text/plain' }));
    await waitFor(() => expect((screen.getByLabelText(/CONTRACT TEXT/i) as HTMLTextAreaElement).value).toContain('Rent is due monthly.'));
    expect((screen.getByLabelText(/CONTRACT TITLE/i) as HTMLInputElement).value).toBe('flat-lease');
  });

  it('loads a demonstration template', () => {
    render(<DocumentUploader isOpen onClose={() => {}} onDocumentLoaded={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Load Commercial NDA Template/ }));
    expect((screen.getByLabelText(/CONTRACT TEXT/i) as HTMLTextAreaElement).value).toContain('MUTUAL NON-DISCLOSURE AGREEMENT');
  });
});

describe('ErrorBoundary', () => {
  const Boom = () => {
    throw new Error('Clause table failed to render');
  };

  it('isolates a rendering fault and offers a clean reload', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reload = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload });

    render(<ErrorBoundary><Boom /></ErrorBoundary>);
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText(/Clause table failed to render/)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Reload Clean Workspace/ }));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('renders children normally when nothing throws', () => {
    render(<ErrorBoundary><p>Healthy workspace</p></ErrorBoundary>);
    expect(screen.getByText('Healthy workspace')).toBeDefined();
  });
});
