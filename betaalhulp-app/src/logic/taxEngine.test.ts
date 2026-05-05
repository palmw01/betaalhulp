import { describe, it, expect } from 'vitest';
import { calculatePaymentTerms } from './taxEngine';

describe('taxEngine', () => {
  it('should calculate Lid 1 (6 weeks) for normal assessments', () => {
    const result = calculatePaymentTerms({
      type: 'NORMAL',
      date: new Date(2026, 4, 15), // 15 mei 2026
      amount: 1000,
      isCustomBookYear: false
    });

    expect(result.terms).toHaveLength(1);
    expect(result.legalBasis).toContain('eerste lid');

    // 15 mei + 42 dagen = 26 juni
    const dueDate = result.terms[0].date;
    expect(dueDate.getFullYear()).toBe(2026);
    expect(dueDate.getMonth()).toBe(5); // juni = 5
    expect(dueDate.getDate()).toBe(26);
  });

  it('should calculate Lid 5 (multiple terms) for provisional assessments in Jan', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 0, 10), // 10 jan 2026
      amount: 1100,
      isCustomBookYear: false
    });

    // 12 - 1 = 11 termijnen
    expect(result.terms).toHaveLength(11);
    expect(result.legalBasis).toContain('vijfde lid');
    expect(result.terms[0].amount).toBe(100);

    // Eerste termijn: 10 feb
    expect(result.terms[0].date.getMonth()).toBe(1);
    expect(result.terms[0].date.getDate()).toBe(10);
  });

  it('should fallback to Lid 1 if numTerms <= 1 (e.g. November)', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 10, 15), // 15 nov 2026
      amount: 1000,
      isCustomBookYear: false
    });

    // 12 - 11 = 1 termijn -> terugval naar lid 1
    expect(result.terms).toHaveLength(1);
    expect(result.legalBasis).toContain('eerste lid');
  });

  it('should apply LI 2008 Eindejaarsregeling for October provisional assessment', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 9, 10), // 10 okt 2026
      amount: 1000,
      isCustomBookYear: false
    });

    // 12 - 10 = 2 termijnen
    expect(result.terms).toHaveLength(2);

    // Termijn 1: 10 nov
    // Termijn 2: oorspronkelijk 10 dec, maar LI 2008 verschuift naar 31 dec
    expect(result.terms[1].date.getMonth()).toBe(11); // dec
    expect(result.terms[1].date.getDate()).toBe(31);
    expect(result.terms[1].rationale).toContain('Leidraad Invordering 2008');
  });

  it('should apply LI 2008 custom book year rule', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 0, 10), // 10 jan 2026
      amount: 1100,
      isCustomBookYear: true
    });

    // 11 termijnen
    const lastTerm = result.terms[10];
    // Laatste dag van dec (maand 11)
    expect(lastTerm.date.getMonth()).toBe(11);
    expect(lastTerm.date.getDate()).toBe(31);
    expect(lastTerm.rationale).toContain('afwijkende boekjaren');
  });

  it('should handle month overflow correctly (31 Jan + 1 month = last day of Feb)', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 0, 31), // 31 jan 2026
      amount: 1100,
      isCustomBookYear: false
    });

    // Termijn 1: 31 jan + 1 mnd -> 28 feb (geen overflow naar 3 mrt)
    expect(result.terms[0].date.getMonth()).toBe(1); // feb
    expect(result.terms[0].date.getDate()).toBe(28);
  });

  it('should throw on non-positive amount', () => {
    expect(() => calculatePaymentTerms({
      type: 'NORMAL',
      date: new Date(2026, 4, 15),
      amount: 0,
      isCustomBookYear: false
    })).toThrow('Bedrag moet groter zijn dan nul.');

    expect(() => calculatePaymentTerms({
      type: 'NORMAL',
      date: new Date(2026, 4, 15),
      amount: -100,
      isCustomBookYear: false
    })).toThrow('Bedrag moet groter zijn dan nul.');
  });

  it('should throw on invalid date', () => {
    expect(() => calculatePaymentTerms({
      type: 'NORMAL',
      date: new Date(NaN),
      amount: 1000,
      isCustomBookYear: false
    })).toThrow('Ongeldige datum opgegeven.');
  });

  it('should fallback to Lid 1 for December provisional assessment (numTerms = 0)', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 11, 15), // 15 dec 2026
      amount: 1000,
      isCustomBookYear: false
    });

    // 12 - 12 = 0 termijnen -> terugval naar lid 1
    expect(result.terms).toHaveLength(1);
    expect(result.legalBasis).toContain('eerste lid');

    // 15 dec + 42 dagen = 26 jan 2027
    const dueDate = result.terms[0].date;
    expect(dueDate.getFullYear()).toBe(2027);
    expect(dueDate.getMonth()).toBe(0); // jan
    expect(dueDate.getDate()).toBe(26);
  });

  it('should ignore isCustomBookYear for NORMAL assessment type', () => {
    const withFlag = calculatePaymentTerms({
      type: 'NORMAL',
      date: new Date(2026, 4, 15),
      amount: 1000,
      isCustomBookYear: true
    });
    const withoutFlag = calculatePaymentTerms({
      type: 'NORMAL',
      date: new Date(2026, 4, 15),
      amount: 1000,
      isCustomBookYear: false
    });

    expect(withFlag.terms[0].date.getTime()).toBe(withoutFlag.terms[0].date.getTime());
  });

  it('should correctly distribute rounding remainder to last term', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 9, 1), // 1 okt 2026 -> 2 termijnen
      amount: 100.01,
      isCustomBookYear: false
    });

    expect(result.terms).toHaveLength(2);
    const total = result.terms.reduce((sum, t) => sum + t.amount, 0);
    // Totaal moet exact gelijk zijn aan het ingevoerde bedrag
    expect(Math.round(total * 100)).toBe(Math.round(100.01 * 100));
  });
});
