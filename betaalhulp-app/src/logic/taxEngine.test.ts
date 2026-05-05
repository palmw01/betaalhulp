import { describe, it, expect } from 'vitest';
import { calculatePaymentTerms } from './taxEngine';

describe('taxEngine', () => {
  it('should calculate Lid 1 (6 weeks) for normal assessments', () => {
    const result = calculatePaymentTerms({
      type: 'NORMAL',
      date: new Date(2026, 4, 15), // 15 May 2026
      amount: 1000
    });
    
    expect(result.terms).toHaveLength(1);
    expect(result.legalBasis).toContain('eerste lid');
    
    // 15 May + 42 days = 26 June
    const dueDate = result.terms[0].date;
    expect(dueDate.getFullYear()).toBe(2026);
    expect(dueDate.getMonth()).toBe(5); // June is 5
    expect(dueDate.getDate()).toBe(26);
  });

  it('should calculate Lid 5 (multiple terms) for provisional assessments in Jan', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 0, 10), // 10 Jan 2026
      amount: 1100
    });
    
    // 12 - 1 = 11 terms
    expect(result.terms).toHaveLength(11);
    expect(result.legalBasis).toContain('vijfde lid');
    expect(result.terms[0].amount).toBe(100);
    
    // First term: 10 Feb
    expect(result.terms[0].date.getMonth()).toBe(1);
    expect(result.terms[0].date.getDate()).toBe(10);
  });

  it('should fallback to Lid 1 if numTerms <= 1 (e.g. November)', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 10, 15), // 15 Nov 2026
      amount: 1000
    });
    
    // 12 - 11 = 1 term -> fallback to Lid 1
    expect(result.terms).toHaveLength(1);
    expect(result.legalBasis).toContain('eerste lid');
  });

  it('should apply LI 2008 Eindejaarsregeling for October provisional assessment', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 9, 10), // 10 Oct 2026
      amount: 1000
    });
    
    // 12 - 10 = 2 terms
    expect(result.terms).toHaveLength(2);
    
    // Term 1: 10 Nov
    // Term 2: originally 10 Dec, but LI 2008 moves to 31 Dec
    expect(result.terms[1].date.getMonth()).toBe(11); // Dec
    expect(result.terms[1].date.getDate()).toBe(31);
    expect(result.terms[1].rationale).toContain('Leidraad Invordering 2008');
  });

  it('should apply LI 2008 custom book year rule', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 0, 10), // 10 Jan 2026
      amount: 1100,
      isCustomBookYear: true
    });
    
    // 11 terms
    const lastTerm = result.terms[10];
    // Last day of Dec (month 11)
    expect(lastTerm.date.getMonth()).toBe(11); 
    expect(lastTerm.date.getDate()).toBe(31); 
    expect(lastTerm.rationale).toContain('afwijkende boekjaren');
  });
});
