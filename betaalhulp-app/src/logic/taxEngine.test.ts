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
      bookYearEndMonth: 12,
      assessmentYear: 2026,
    });

    // 11 termijnen
    const lastTerm = result.terms[10];
    // Laatste dag van dec (maand 11)
    expect(lastTerm.date.getMonth()).toBe(11);
    expect(lastTerm.date.getDate()).toBe(31);
    expect(lastTerm.rationale).toContain('afwijkende boekjaren');
  });

  it('should apply LI 2008 custom book year rule for March end month', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      amount: 1100,
      isCustomBookYear: true,
      bookYearEndMonth: 3, // Maart
      assessmentYear: 2026,
      date: new Date(2026, 0, 10), // 10 jan 2026
    });

    // 10 jan (maand 1) -> boekjaar eindigt in maart (maand 3)
    // Resterende maanden: feb, mrt -> 2 termijnen
    expect(result.terms).toHaveLength(2);
    
    const lastTerm = result.terms[1]; // Maart
    expect(lastTerm.date.getMonth()).toBe(2); // maart
    expect(lastTerm.date.getDate()).toBe(31);
    
    const traceStep = result.trace.find(s => s.step.includes('Controle laatste termijn (Afwijkend boekjaar eindigend in maart)'));
    expect(traceStep).toBeDefined();
    expect(traceStep?.result).toContain('Einde boekjaar');
  });

  it('should show Einde boekjaar in trace when last term coincides with book year end', () => {
    // Dagtekening in mei (maand 4) -> 12 - 5 = 7 termijnen
    // Termijnen: jun, jul, aug, sep, okt, nov, dec
    // Laatste termijn: dec
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 4, 10),
      amount: 700,
      isCustomBookYear: true,
      bookYearEndMonth: 12, // Eindigt in december
      assessmentYear: 2026,
    });

    const traceStep = result.trace.find(s => s.step.includes('Afwijkend boekjaar'));
    expect(traceStep?.result).toContain('Einde boekjaar');
  });

  it('should still add a trace step for custom book year even if date is already last day of month', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 0, 31), // 31 jan 2026
      amount: 1100,
      isCustomBookYear: true,
      bookYearEndMonth: 12,
      assessmentYear: 2026,
    });

    const customBookYearStep = result.trace.find(s => s.step.includes('Afwijkend boekjaar'));
    expect(customBookYearStep).toBeDefined();
    expect(customBookYearStep?.result).toContain('bleef staan op de laatste dag');
  });

  it('should handle month overflow correctly (31 Jan + 1 month = last day of Feb)', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 0, 31), // 31 jan 2026 (laatste dag van jan)
      amount: 1100,
      isCustomBookYear: false,
      assessmentYear: 2026,
    });

    // § 9.5 LI 2008: dagtekening is laatste dag van de maand → termijnen ook op laatste dag
    // 31 jan + 1 mnd → 28 feb (laatste dag feb 2026, niet-schrikkeljaar)
    expect(result.terms[0].date.getMonth()).toBe(1); // feb
    expect(result.terms[0].date.getDate()).toBe(28);
    // 31 jan + 2 mnd → 31 mrt (laatste dag mrt)
    expect(result.terms[1].date.getMonth()).toBe(2); // mrt
    expect(result.terms[1].date.getDate()).toBe(31);
    // 31 jan + 3 mnd → 30 apr (laatste dag apr)
    expect(result.terms[2].date.getMonth()).toBe(3); // apr
    expect(result.terms[2].date.getDate()).toBe(30);
  });

  it('§ 9.5 LI 2008: dagtekening 28 feb (niet-schrikkeljaar) → termijnen op laatste dag van de maand', () => {
    // 2026 is geen schrikkeljaar, dus 28 feb is de laatste dag van feb
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 1, 28), // 28 feb 2026 (laatste dag van feb)
      amount: 1000,
      isCustomBookYear: false,
      assessmentYear: 2026,
    });

    // 12 - 2 = 10 termijnen
    expect(result.terms).toHaveLength(10);

    // Termijn 1: 28 feb + 1 mnd → 31 mrt (laatste dag mrt; niet 28 mrt)
    expect(result.terms[0].date.getMonth()).toBe(2); // mrt
    expect(result.terms[0].date.getDate()).toBe(31);

    // Termijn 2: 28 feb + 2 mnd → 30 apr (laatste dag apr)
    expect(result.terms[1].date.getMonth()).toBe(3); // apr
    expect(result.terms[1].date.getDate()).toBe(30);

    // Termijn 3: 28 feb + 3 mnd → 31 mei
    expect(result.terms[2].date.getMonth()).toBe(4); // mei
    expect(result.terms[2].date.getDate()).toBe(31);
  });

  it('§ 9.5 LI 2008: dagtekening 28 feb in schrikkeljaar → geen laatste-dag-regel (feb heeft 29 dagen)', () => {
    // 2028 is een schrikkeljaar; 28 feb is NIET de laatste dag
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2028, 1, 28), // 28 feb 2028 (schrikkeljaar: feb heeft 29 dagen)
      amount: 1000,
      isCustomBookYear: false,
      assessmentYear: 2028,
    });

    // Termijn 1: 28 feb + 1 mnd → 28 mrt (geen laatste-dag-regel, want 28 feb ≠ einde maand)
    expect(result.terms[0].date.getMonth()).toBe(2); // mrt
    expect(result.terms[0].date.getDate()).toBe(28);
  });

  it('art. 9 lid 10: trace vermeldt uitsluiting ATW voor normale aanslag', () => {
    const result = calculatePaymentTerms({
      type: 'NORMAL',
      date: new Date(2026, 4, 15),
      amount: 1000,
      isCustomBookYear: false,
      assessmentYear: 2026,
    });

    const step = result.trace.find(s => s.step === 'Uitsluiting Algemene termijnenwet');
    expect(step).toBeDefined();
    expect(step?.legalBasis).toContain('tiende lid');
  });

  it('art. 9 lid 10: trace vermeldt uitsluiting ATW voor voorlopige aanslag', () => {
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 0, 10),
      amount: 1100,
      isCustomBookYear: false,
      assessmentYear: 2026,
    });

    const step = result.trace.find(s => s.step === 'Uitsluiting Algemene termijnenwet');
    expect(step).toBeDefined();
    expect(step?.legalBasis).toContain('tiende lid');
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

  it('should throw when totalEuros is less than numTerms', () => {
    // 5 euro / 11 termijnen → lowerTerm = 0, zinloze €0-termijnen
    expect(() => calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 0, 10), // jan → 11 termijnen
      amount: 5,
      isCustomBookYear: false,
      assessmentYear: 2026,
    })).toThrow('lager dan het aantal termijnen');
  });

  it('§ 9.1 LI 2008: (Einde boekjaar) ook getoond als vervaldag al op laatste dag staat', () => {
    // 31 jan 2026 (laatste dag van jan) → § 9.5 LI 2008: alle termijnen op laatste dag.
    // Laatste termijn (dec) = 31 dec → alreadyLastDay = true, isEndBookYear = true (bookYearEndMonth=12).
    const result = calculatePaymentTerms({
      type: 'PROVISIONAL',
      date: new Date(2026, 0, 31),
      amount: 1100,
      isCustomBookYear: true,
      bookYearEndMonth: 12,
      assessmentYear: 2026,
    });

    const step = result.trace.find(s => s.step.includes('Afwijkend boekjaar'));
    expect(step).toBeDefined();
    expect(step?.result).toContain('bleef staan op de laatste dag');
    expect(step?.result).toContain('Einde boekjaar');
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
