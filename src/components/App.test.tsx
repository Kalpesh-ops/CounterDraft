import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('CounterDraft Application - UI & Navigation Flow', () => {
  beforeEach(() => {
    render(<App />);
  });

  it('renders masthead branding, disclaimer banner, and active docket', () => {
    expect(screen.getByText('COUNTERDRAFT')).toBeDefined();
    expect(screen.getByText('STATUTORY NOTICE')).toBeDefined();
    expect(screen.getByText(/Informational assistance only/i)).toBeDefined();
  });

  it('navigates to Contract Comparator and displays side-by-side versions', async () => {
    const comparatorTab = screen.getByRole('button', { name: /Contract Comparator & Redline/i });
    fireEvent.click(comparatorTab);

    expect(await screen.findByText('SELECT COMPARISON BENCHMARK:')).toBeDefined();
    expect(screen.getByText(/DEVIATION IMPACT OVERVIEW/i)).toBeDefined();
    expect(screen.getAllByText(/VERSION A/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/VERSION B/i).length).toBeGreaterThan(0);
  });

  it('navigates to Negotiation Playbook and renders pushback email', async () => {
    const playbookTab = screen.getByRole('button', { name: /Negotiation Email & Exposure/i });
    fireEvent.click(playbookTab);

    expect(await screen.findByText(/Ready-to-Send Counter-Proposal Email/i)).toBeDefined();
    expect(screen.getByText(/Security Deposit Exposure:/i)).toBeDefined();
    expect(screen.getByText(/Copy Negotiation Email/i)).toBeDefined();
  });

  it('navigates to Precedent Navigator and filters case law', async () => {
    const precedentsTab = screen.getByRole('button', { name: /Precedent Navigator/i });
    fireEvent.click(precedentsTab);

    expect(await screen.findByText(/COURTS & CASES INTELLIGENCE REPOSITORY/i)).toBeDefined();
    expect(screen.getAllByText(/Percept D'Mark/i).length).toBeGreaterThan(0);
  });

  it('navigates to Action Checklist and marks items complete', async () => {
    const checklistTab = screen.getByRole('button', { name: /Compliance Checklist & Deadlines/i });
    fireEvent.click(checklistTab);

    expect(await screen.findByText(/Compliance & Safeguard Checklist/i)).toBeDefined();
    const checkbox = screen.getAllByRole('checkbox')[0];
    expect(checkbox).toBeDefined();
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it('navigates to Lawyer Consultation Brief and shows printable memo', async () => {
    const counselTab = screen.getByRole('button', { name: /Lawyer Consultation Brief/i });
    fireEvent.click(counselTab);

    expect(await screen.findByText(/ADVOCATE CONSULTATION BRIEFING MEMORANDUM/i)).toBeDefined();
    expect(screen.getByText(/HIGH-PRIORITY CLAUSES & STRATEGIC QUESTIONS FOR COUNSEL/i)).toBeDefined();
    expect(screen.getByText(/RELEVANT STATUTORY DEFENSES/i)).toBeDefined();
  });

  it('opens and closes Terms of Service modal', () => {
    const termsButtons = screen.getAllByText('Terms of Service');
    fireEvent.click(termsButtons[0]);

    expect(screen.getByText('TERMS OF SERVICE AND LEGAL NOTICE')).toBeDefined();
    const closeBtn = screen.getByText('I Understand and Acknowledge');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('TERMS OF SERVICE AND LEGAL NOTICE')).toBeNull();
  });

  it('opens and closes Privacy Policy modal', () => {
    const privacyButtons = screen.getAllByText('Privacy Policy');
    fireEvent.click(privacyButtons[0]);

    expect(screen.getByText('PRIVACY POLICY AND DATA PROTECTION FRAMEWORK')).toBeDefined();
    const closeBtn = screen.getByText('Close Privacy Policy');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('PRIVACY POLICY AND DATA PROTECTION FRAMEWORK')).toBeNull();
  });
});
