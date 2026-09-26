import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Modal } from './Modal';
import { DocumentUploader } from './DocumentUploader';
import { GroundedQA } from './GroundedQA';
import { ClauseExplainer } from './ClauseExplainer';
import { sampleContracts } from '../data/sampleContracts';
import type { LegalDocument } from '../types/legal';

const leaseDoc = sampleContracts[0];

/** Stubs fetch so /api/genai returns the given JSON body and status. */
const stubGateway = (body: unknown, status = 200) => {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Modal accessibility', () => {
  it('moves focus inside, closes on Escape, and restores focus to the trigger', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const onClose = vi.fn();

    const { rerender } = render(
      <Modal isOpen onClose={onClose} labelledBy="t">
        <h2 id="t">Dialog</h2>
        <button type="button">First</button>
        <button type="button">Last</button>
      </Modal>
    );

    const dialog = screen.getByRole('dialog', { name: 'Dialog' });
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <Modal isOpen={false} onClose={onClose} labelledBy="t">
        <h2 id="t">Dialog</h2>
      </Modal>
    );
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe('');
    trigger.remove();
  });

  it('traps Tab focus within the dialog', () => {
    render(
      <Modal isOpen onClose={() => {}} labelledBy="t">
        <h2 id="t">Dialog</h2>
        <button type="button">First</button>
        <button type="button">Last</button>
      </Modal>
    );
    const last = screen.getByText('Last');
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByText('First'));
  });
});

describe('DocumentUploader with Gemini', () => {
  const contract = 'Section 1. Security Deposit\nThe Landlord may forfeit the entire deposit if the Tenant leaves early.';

  const fillAndSubmit = () => {
    fireEvent.change(screen.getByLabelText(/CONTRACT TITLE/i), { target: { value: 'My Flat Rental' } });
    fireEvent.change(screen.getByLabelText(/CONTRACT TEXT/i), { target: { value: contract } });
    fireEvent.click(screen.getByRole('button', { name: /Analyze & Ingest Docket/i }));
  };

  it('shows a validation error for an empty contract without calling Gemini', () => {
    const fetchMock = stubGateway({});
    render(<DocumentUploader isOpen onClose={() => {}} onDocumentLoaded={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Analyze & Ingest Docket/i }));
    expect(screen.getByRole('alert')).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('enriches the uploaded contract with Gemini analysis', async () => {
    stubGateway({
      task: 'analyze',
      model: 'gemini-test',
      result: {
        executiveSummary: 'Deposit terms favour the landlord.',
        partyA: 'Landlord', partyB: 'Tenant', jurisdiction: 'India', governingLaw: 'Indian Contract Act, 1872',
        clauses: [{
          clauseNumber: 'Section 1', plainSummary: 'The landlord can keep your whole deposit.', riskLevel: 'high',
          riskRationale: 'Penalty without proof of loss.', statutoryContext: 'Section 74, ICA', practicalScenario: 'You lose Rs 90,000.',
          recommendedCounterProposal: 'Limit deductions to proven damage.', category: 'financial', tags: ['deposit'],
        }],
        obligations: [],
        nextSteps: ['Ask for a refund timeline in writing.'],
      },
    });
    const onLoaded = vi.fn<(doc: LegalDocument) => void>();
    render(<DocumentUploader isOpen onClose={() => {}} onDocumentLoaded={onLoaded} />);
    fillAndSubmit();

    await waitFor(() => expect(onLoaded).toHaveBeenCalledTimes(1));
    const doc = onLoaded.mock.calls[0][0];
    expect(doc.analysisSource).toBe('genai');
    expect(doc.clauses[0].plainSummary).toBe('The landlord can keep your whole deposit.');
    expect(doc.clauses[0].originalText).toContain('forfeit the entire deposit');
    expect(doc.nextSteps).toEqual(['Ask for a refund timeline in writing.']);
  });

  it('falls back to the statutory rule engine when Gemini is unavailable', async () => {
    stubGateway({ error: 'AI service is not configured.' }, 503);
    const onLoaded = vi.fn<(doc: LegalDocument) => void>();
    render(<DocumentUploader isOpen onClose={() => {}} onDocumentLoaded={onLoaded} />);
    fillAndSubmit();

    await waitFor(() => expect(onLoaded).toHaveBeenCalledTimes(1));
    expect(onLoaded.mock.calls[0][0].analysisSource).toBe('rules');
  });

  it('never contacts Gemini when the user opts out of GenAI', async () => {
    const fetchMock = stubGateway({});
    const onLoaded = vi.fn<(doc: LegalDocument) => void>();
    render(<DocumentUploader isOpen onClose={() => {}} onDocumentLoaded={onLoaded} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Analyse with Google Gemini/i }));
    fillAndSubmit();

    await waitFor(() => expect(onLoaded).toHaveBeenCalledTimes(1));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onLoaded.mock.calls[0][0].analysisSource).toBe('rules');
  });
});

describe('GroundedQA with Gemini', () => {
  it('shows a Gemini answer with verified citations and a provenance badge', async () => {
    stubGateway({
      task: 'qa',
      model: 'gemini-test',
      result: {
        answerSummary: 'Only reasonable, proven losses can be deducted.',
        statutoryRightsNote: 'Section 74 of the Indian Contract Act limits forfeiture.',
        citations: [],
        precedentRefs: [],
        suggestedFollowUps: [],
        discardedCitations: 1,
      },
    });
    render(<GroundedQA document={leaseDoc} />);
    fireEvent.change(screen.getByLabelText(/Ask a question about this contract/i), { target: { value: 'Can they keep my deposit?' } });
    fireEvent.click(screen.getByRole('button', { name: /Ask Gemini/i }));

    expect(await screen.findByText('Only reasonable, proven losses can be deducted.')).toBeDefined();
    expect(screen.getByText(/Gemini GenAI · grounded/)).toBeDefined();
    expect(screen.getByText(/1 AI-proposed quote was removed/)).toBeDefined();
  });

  it('falls back to the rule engine and tells the user when Gemini fails', async () => {
    stubGateway({ error: 'busy' }, 429);
    render(<GroundedQA document={leaseDoc} />);
    fireEvent.change(screen.getByLabelText(/Ask a question about this contract/i), { target: { value: 'Can the landlord enter without notice?' } });
    fireEvent.click(screen.getByRole('button', { name: /Ask Gemini/i }));

    expect(await screen.findByText(/offline statutory rule engine/i)).toBeDefined();
    expect(screen.getByText('Can the landlord enter without notice?')).toBeDefined();
  });
});

describe('ClauseExplainer', () => {
  const clause = leaseDoc.clauses[1];

  it('requests the chosen language and caches repeat requests', async () => {
    const fetchMock = stubGateway({
      task: 'simplify',
      model: 'gemini-test',
      result: { language: 'Hindi', explanation: 'मकान मालिक पूरी राशि रख सकता है।', keyPoints: ['जमा राशि'], watchOut: 'पूरी जमा राशि खो सकते हैं।', questionsToAsk: [] },
    });
    render(<ClauseExplainer clause={clause} />);
    fireEvent.change(screen.getByLabelText('Explanation language'), { target: { value: 'Hindi' } });
    fireEvent.click(screen.getByRole('button', { name: /Explain this clause/i }));

    const explanation = await screen.findByText('मकान मालिक पूरी राशि रख सकता है।');
    expect(explanation.closest('[lang]')?.getAttribute('lang')).toBe('hi');
    const body = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body).toMatchObject({ task: 'simplify', language: 'Hindi' });

    fireEvent.click(screen.getByRole('button', { name: /Explain this clause/i }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('shows a friendly message when Gemini is unavailable', async () => {
    stubGateway({ error: 'down' }, 502);
    render(<ClauseExplainer clause={leaseDoc.clauses[2]} />);
    fireEvent.click(screen.getByRole('button', { name: /Explain this clause/i }));
    expect(await screen.findByText(/Gemini is unavailable right now/)).toBeDefined();
  });
});
