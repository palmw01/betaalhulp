import { describe, it, expect } from 'vitest';
import { calculatePaymentTerms } from './taxEngine';

describe('taxEngine', () => {
  it('should calculate Lid 1 (6 weeks) for normal assessments', () => {
    const result = calculatePaymentTerms({
      type: 'NORMAL',
      date: new Date(2026, 4, 15), // 15 mei 2026
      amount: 1000,
      isCustomBookYear: false,
      assessmentYear: 2026,
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
      isCustomBookYear: false,
      assessmentYear: 2026,
    });

    // 12 - 1 = 11 termijnen
    expect(result.terms).toHaveLength(11);
    expect(result.legalBasis).toContain('vijfde lid');
    expect(result.terms[0].amount).toBe(100);

    // Eerste termijn: 10 feb
    expect(result.terms[0].date.getMonth()).toBe(1);
    expect(result.terms[0].date.getDate()).toBe(10);
  });

  it('should fallback to Lid 1 if numTerms <= 1 (e.g. November) and apply LI 2008 Eindejaarsregeling', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 10, 15), // 15 nov 2026
      amount: 1000,
      isCustomBookYear: false,
      assessmentYear: 2026,
    });

    // 12 - 11 = 1 termijn -> terugval naar lid 1
    expect(result.terms).toHaveLength(1);
    expect(result.legalBasis).toContain('eerste lid');

    // 15 nov + 42 dagen = 27 dec, maar LI 2008 verschuift naar 31 dec
    expect(result.terms[0].date.getMonth()).toBe(11); // dec
    expect(result.terms[0].date.getDate()).toBe(31);
    expect(result.terms[0].rationale).toContain('Leidraad Invordering 2008');
  });

  it('should apply LI 2008 Eindejaarsregeling for October provisional assessment', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 9, 10), // 10 okt 2026
      amount: 1000,
      isCustomBookYear: false,
      assessmentYear: 2026,
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
      isCustomBookYear: true,
      assessmentYear: 2026,
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
      isCustomBookYear: false,
      assessmentYear: 2026,
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
      isCustomBookYear: false,
      assessmentYear: 2026,
    })).toThrow('Bedrag moet groter zijn dan nul.');

    expect(() => calculatePaymentTerms({
      type: 'NORMAL',
      date: new Date(2026, 4, 15),
      amount: -100,
      isCustomBookYear: false,
      assessmentYear: 2026,
    })).toThrow('Bedrag moet groter zijn dan nul.');
  });

  it('should throw on invalid date', () => {
    expect(() => calculatePaymentTerms({
      type: 'NORMAL',
      date: new Date(NaN),
      amount: 1000,
      isCustomBookYear: false,
      assessmentYear: 2026,
    })).toThrow('Ongeldige datum opgegeven.');
  });

  it('should fallback to Lid 1 for December provisional assessment (numTerms = 0)', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 11, 15), // 15 dec 2026
      amount: 1000,
      isCustomBookYear: false,
      assessmentYear: 2026,
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
      isCustomBookYear: true,
      assessmentYear: 2026,
    });
    const withoutFlag = calculatePaymentTerms({
      type: 'NORMAL',
      date: new Date(2026, 4, 15),
      amount: 1000,
      isCustomBookYear: false,
      assessmentYear: 2026,
    });

    expect(withFlag.terms[0].date.getTime()).toBe(withoutFlag.terms[0].date.getTime());
  });

  it('should round each term up to whole euros and correct with €1 reductions', () => {
    // 1003 / 11 = 91.18... → higherTerm=92, lowerTerm=91
    // numHigher = 1003 - 11*91 = 2 → eerste 2 termijnen €92, daarna €91
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 0, 10), // 10 jan 2026 → 11 termijnen
      amount: 1003,
      isCustomBookYear: false,
      assessmentYear: 2026,
    });

    expect(result.terms).toHaveLength(11);
    expect(result.terms[0].amount).toBe(92);
    expect(result.terms[1].amount).toBe(92);
    expect(result.terms[2].amount).toBe(91);
    expect(result.terms[10].amount).toBe(91);

    const total = result.terms.reduce((sum, t) => sum + t.amount, 0);
    expect(total).toBe(1003);
  });

  it('should produce equal terms when total is exactly divisible', () => {
    // 1100 / 11 = 100 precies → alle termijnen €100
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 0, 10),
      amount: 1100,
      isCustomBookYear: false,
      assessmentYear: 2026,
    });

    expect(result.terms.every(t => t.amount === 100)).toBe(true);
    expect(result.terms.reduce((s, t) => s + t.amount, 0)).toBe(1100);
  });

  it('should handle two unequal terms (101 over 2 = 51 + 50)', () => {
    // 101 / 2 = 50.5 → higherTerm=51, lowerTerm=50, numHigher=1
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 9, 1), // 1 okt → 2 termijnen
      amount: 101,
      isCustomBookYear: false,
      assessmentYear: 2026,
    });

    expect(result.terms).toHaveLength(2);
    expect(result.terms[0].amount).toBe(51);
    expect(result.terms[1].amount).toBe(50);
    expect(result.terms[0].amount - result.terms[1].amount).toBe(1);
    expect(result.terms.reduce((s, t) => s + t.amount, 0)).toBe(101);
  });

  // Dagtekening-in-vaststellingsjaar: cross-year scenario's
  it('should apply lid 1 directly when dagtekening is after belastingjaar', () => {
    // Aanslag over 2025, maar dagtekening is in 2026 (bijv. navorderingsaanslag)
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 2, 15), // 15 mrt 2026
      amount: 500,
      isCustomBookYear: false,
      assessmentYear: 2025,
    });

    // Dagtekening ná belastingjaar → lid 1 direct, niet via terugvalregel
    expect(result.terms).toHaveLength(1);
    expect(result.legalBasis).toContain('eerste lid');

    // 15 mrt + 42 dagen = 26 apr
    const dueDate = result.terms[0].date;
    expect(dueDate.getFullYear()).toBe(2026);
    expect(dueDate.getMonth()).toBe(3); // apr = 3
    expect(dueDate.getDate()).toBe(26);
  });

  it('should throw when dagtekening is before belastingjaar (lid 7 case)', () => {
    // Aanslag over 2027, maar dagtekening is in 2026 (niet ondersteund)
    expect(() => calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 5, 1), // 1 jun 2026
      amount: 1000,
      isCustomBookYear: false,
      assessmentYear: 2027,
    })).toThrow('Artikel 9 lid 7');
  });
});
