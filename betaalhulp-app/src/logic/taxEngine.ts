import type { AssessmentRequest, AssessmentResult, PaymentTerm, CalculationStep } from './types';
import { LEGAL_TEXTS } from './legalTexts';

const SIX_WEEKS_IN_DAYS = 42;

const MONTH_NAMES = [
  'januari', 'februari', 'maart', 'april',
  'mei', 'juni', 'juli', 'augustus',
  'september', 'oktober', 'november', 'december'
];

function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] || month.toString();
}

// § 9.5 LI 2008: als de dagtekening de laatste dag van de maand is, valt elke
// maandtermijn ook op de laatste dag van de betreffende maand.
// Bij gewone datums: overflow (bijv. 31 jan + 1 mnd) klapt terug op de laatste dag.
function addMonths(base: Date, months: number): Date {
  const lastOfBaseMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  if (base.getDate() === lastOfBaseMonth) {
    return new Date(base.getFullYear(), base.getMonth() + months + 1, 0);
  }
  const d = new Date(base.getFullYear(), base.getMonth() + months, base.getDate());
  if (d.getDate() !== base.getDate()) {
    d.setDate(0);
  }
  return d;
}

function applyLid1(date: Date, amount: number, trace: CalculationStep[]): AssessmentResult {
  const dueDate = new Date(date);
  dueDate.setDate(dueDate.getDate() + SIX_WEEKS_IN_DAYS);

  trace.push({
    step: 'Toepassen hoofdregel',
    result: 'Betalingstermijn van zes weken na dagtekening',
    legalBasis: 'Artikel 9, eerste lid, IW 1990',
    legalText: LEGAL_TEXTS.ART_9_LID_1,
    sourceFile: 'regels/AR-9-1.md'
  });

  trace.push({
    step: 'Uitsluiting Algemene termijnenwet',
    result: 'De termijn loopt kalenderstrikt: weekenden en feestdagen verlengen de betaaltermijn niet.',
    legalBasis: 'Artikel 9, tiende lid, IW 1990',
    legalText: LEGAL_TEXTS.ART_9_LID_10,
    sourceFile: 'regels/AR-9-1.md'
  });

  return {
    terms: [{
      date: dueDate,
      amount,
      label: 'Volledig bedrag',
      rationale: 'Invorderbaarheid treedt in zodra de termijn van zes weken na de dagtekening is verstreken (Art. 9 lid 1 IW 1990).'
    }],
    legalBasis: 'Artikel 9, eerste lid, Invorderingswet 1990',
    trace
  };
}

function applyLI91(result: AssessmentResult, request: AssessmentRequest): AssessmentResult {
  const { isCustomBookYear, bookYearEndMonth = 12, assessmentYear, date } = request;
  const lastTermIndex = result.terms.length - 1;
  if (lastTermIndex < 0) return result;

  const lastTerm = result.terms[lastTermIndex];
  const newTerms = [...result.terms];
  const newTrace = [...result.trace];

  if (isCustomBookYear) {
    const lastDayOfMonth = new Date(lastTerm.date.getFullYear(), lastTerm.date.getMonth() + 1, 0);
    const alreadyLastDay = lastTerm.date.getDate() === lastDayOfMonth.getDate();
    const isEndBookYear = (lastTerm.date.getMonth() + 1) === bookYearEndMonth;

    if (!alreadyLastDay) {
      newTerms[lastTermIndex] = {
        ...lastTerm,
        date: lastDayOfMonth,
        rationale: 'Voor afwijkende boekjaren wordt de laatste vervaldag gesteld op de laatste dag van de maand (§ 9.1 Leidraad Invordering 2008).',
      };
    }

    newTrace.push({
      step: `Controle laatste termijn (Afwijkend boekjaar eindigend in ${getMonthName(bookYearEndMonth)})`,
      result: alreadyLastDay
        ? `Vervaldag bleef staan op de laatste dag van de maand: ${lastTerm.date.toLocaleDateString('nl-NL')}${isEndBookYear ? ' (Einde boekjaar)' : ''}`
        : `Verschoven naar laatste dag van de maand: ${lastDayOfMonth.toLocaleDateString('nl-NL')}${isEndBookYear ? ' (Einde boekjaar)' : ''}`,
      legalBasis: '§ 9.1 Leidraad Invordering 2008',
      legalText: LEGAL_TEXTS.LI_2008_9_1_AFWIJKEND,
      sourceFile: 'regels/AR-LI-9-1b.md'
    });
  } else if (date.getMonth() <= 10) { // November of eerder
    const endOfYear = new Date(assessmentYear, 11, 31);
    if (lastTerm.date < endOfYear) {
      newTerms[lastTermIndex] = {
        ...lastTerm,
        date: endOfYear,
        rationale: 'De laatste termijn is verschoven naar 31 december op basis van begunstigend beleid (§ 9.1 Leidraad Invordering 2008).',
      };
      newTrace.push({
        step: `Verschuiving laatste termijn (Termijn ${lastTermIndex + 1})`,
        result: 'Verschoven naar 31 december (begunstigend beleid)',
        legalBasis: '§ 9.1 Leidraad Invordering 2008',
        legalText: LEGAL_TEXTS.LI_2008_9_1,
        sourceFile: 'regels/AR-LI-9-1a.md'
      });
    }
  }

  return { ...result, terms: newTerms, trace: newTrace };
}

function applyLid5(request: AssessmentRequest, trace: CalculationStep[]): AssessmentResult {
  const { date, amount, assessmentYear } = request;
  const dagtekeningYear = date.getFullYear();

  // Kwalificatieconditie: dagtekening moet in het belastingjaar vallen (art. 9 lid 5 IW 1990).
  // Dagtekening ná het belastingjaar → lid 1 direct van toepassing (niet via terugvalregel).
  // Dagtekening vóór het belastingjaar → lid 7 (buiten scope van dit hulpmiddel).
  if (dagtekeningYear !== assessmentYear) {
    trace.push({
      step: 'Controle dagtekening-in-vaststellingsjaar',
      result: dagtekeningYear < assessmentYear
        ? `Dagtekening (${dagtekeningYear}) ligt vóór het belastingjaar (${assessmentYear}) — lid 7 IW 1990 is van toepassing (niet geïmplementeerd)`
        : `Dagtekening (${dagtekeningYear}) ligt ná het belastingjaar (${assessmentYear}) — lid 5 is niet van toepassing; hoofdregel lid 1 herneemt`,
      legalBasis: 'Artikel 9, vijfde lid, IW 1990',
      legalText: LEGAL_TEXTS.ART_9_LID_5_VOLZIN_1,
      sourceFile: 'begrippen/dagtekening-in-vaststellingsjaar.md'
    });

    if (dagtekeningYear < assessmentYear) {
      throw new Error(
        `Artikel 9 lid 7 IW 1990 is van toepassing (dagtekening ${dagtekeningYear} ligt vóór het belastingjaar ${assessmentYear}). ` +
        'Dit hulpmiddel ondersteunt dit geval niet.'
      );
    }

    // Dagtekening ná belastingjaar: lid 1 direct, niet via terugvalregel.
    return applyLid1(date, amount, trace);
  }

  // Dagtekening-in-vaststellingsjaar is vervuld; gebruik het belastingjaar voor de termijnenberekening.
  const month = date.getMonth() + 1; // 1-12
  const isCustom = request.isCustomBookYear && request.bookYearEndMonth != null;
  const endMonth = isCustom ? request.bookYearEndMonth! : 12;

  const numTerms = isCustom 
    ? (endMonth - month + 12) % 12 
    : 12 - month;

  trace.push({
    step: 'Berekenen aantal termijnen',
    result: isCustom
      ? `${numTerms} ${numTerms === 1 ? 'termijn' : 'termijnen'} mogelijk (${getMonthName(month)} t/m ${getMonthName(endMonth)} in afwijkend boekjaar)`
      : `${numTerms} ${numTerms === 1 ? 'termijn' : 'termijnen'} mogelijk (12 − maand ${month})`,
    legalBasis: 'Artikel 9, vijfde lid, eerste volzin, IW 1990',
    legalText: LEGAL_TEXTS.ART_9_LID_5_VOLZIN_1,
    sourceFile: 'begrippen/termijnenberekening-resterende-maanden.md'
  });

  // Terugvalregel (derde volzin): als de berekening niet leidt tot meer dan één termijn,
  // herneemt lid 1. Dit geldt voor dagtekening in november (1 termijn) of december (0 termijnen).
  if (numTerms <= 1) {
    trace.push({
      step: 'Controle terugvalregel',
      result: numTerms === 0
        ? 'Na de maand van dagtekening resteren 0 maanden in het jaar → terugval naar hoofdregel'
        : 'Na de maand van dagtekening resteert slechts 1 maand in het jaar → terugval naar hoofdregel',
      legalBasis: 'Artikel 9, vijfde lid, derde volzin, IW 1990',
      legalText: LEGAL_TEXTS.ART_9_LID_5_VOLZIN_3,
      sourceFile: 'begrippen/terugvalregel-lid-1.md'
    });
    return applyLI91(applyLid1(date, amount, trace), request);
  }

  // Algoritme: elk termijnbedrag wordt naar boven afgerond op hele euro's.
  // Vervolgens worden een aantal termijnen met precies €1 verlaagd totdat
  // de som exact gelijk is aan het totaalbedrag (uitvoeringskeuze).
  // Belastingaanslagen luiden in hele euro's; Math.round absorbeert eventuele centafwijkingen.
  const totalEuros = Math.round(amount);
  if (totalEuros < numTerms) {
    throw new Error(
      `Het aanslagbedrag (€${totalEuros}) is lager dan het aantal termijnen (${numTerms}). ` +
      'Controleer of het bedrag correct is.'
    );
  }
  const higherTerm = Math.ceil(totalEuros / numTerms);
  const lowerTerm = higherTerm - 1;
  const numHigher = totalEuros - numTerms * lowerTerm; // 1..numTerms termijnen met higherTerm

  trace.push({
    step: 'Toepassen termijnregeling',
    result: numHigher === numTerms
      ? `Bedrag wordt verdeeld in ${numTerms} gelijke termijnen van €${higherTerm}`
      : `Bedrag wordt verdeeld in ${numHigher} termijnen van €${higherTerm} en ${numTerms - numHigher} termijnen van €${lowerTerm}`,
    legalBasis: 'Artikel 9, vijfde lid, tweede volzin, IW 1990',
    legalText: LEGAL_TEXTS.ART_9_LID_5_VOLZIN_2,
    sourceFile: 'regels/AR-9-5a.md'
  });

  trace.push({
    step: 'Uitsluiting Algemene termijnenwet',
    result: 'De vervaldagen lopen kalenderstrikt: weekenden en feestdagen verlengen de termijnen niet.',
    legalBasis: 'Artikel 9, tiende lid, IW 1990',
    legalText: LEGAL_TEXTS.ART_9_LID_10,
    sourceFile: 'regels/AR-9-5c.md'
  });

  const terms: PaymentTerm[] = [];

  for (let i = 1; i <= numTerms; i++) {
    const termDate = addMonths(date, i);
    const termRationale = i === 1
      ? 'Eerste termijn vervalt één maand na dagtekening (Art. 9 lid 5 IW 1990).'
      : 'Vervolgtermijn telkens één maand later (Art. 9 lid 5 IW 1990).';

    // De eerste numHigher termijnen krijgen het hogere bedrag, de rest €1 minder.
    const termAmount = i <= numHigher ? higherTerm : lowerTerm;

    terms.push({
      date: termDate,
      amount: termAmount,
      label: `Termijn ${i}`,
      rationale: termRationale
    });
  }

  return applyLI91({
    terms,
    legalBasis: 'Artikel 9, vijfde lid, Invorderingswet 1990',
    trace
  }, request);
}

export function calculatePaymentTerms(request: AssessmentRequest): AssessmentResult {
  if (request.amount <= 0) throw new Error('Bedrag moet groter zijn dan nul.');
  if (isNaN(request.date.getTime())) throw new Error('Ongeldige datum opgegeven.');

  const { type } = request;
  const trace: CalculationStep[] = [];

  trace.push({
    step: 'Vaststellen aanslagtype',
    result: type === 'PROVISIONAL' ? 'Voorlopige aanslag' : 'Normale aanslag',
    legalBasis: type === 'PROVISIONAL'
      ? 'Artikel 9, vijfde lid, IW 1990'
      : 'Artikel 9, eerste lid, IW 1990',
    legalText: type === 'PROVISIONAL' ? LEGAL_TEXTS.ART_9_LID_5_VOLZIN_1 : LEGAL_TEXTS.ART_9_LID_1
  });

  if (type === 'PROVISIONAL') {
    return applyLid5(request, trace);
  }

  return applyLid1(request.date, request.amount, trace);
}
