import type { AssessmentRequest, AssessmentResult, PaymentTerm, CalculationStep } from './types';
import { LEGAL_TEXTS } from './legalTexts';

const SIX_WEEKS_IN_DAYS = 42;

// Voegt maanden toe aan een datum. Bij overflow (bijv. 31 jan + 1 mnd) wordt
// de laatste dag van de doelmaand gebruikt in plaats van doorlopen naar de volgende maand.
function addMonths(base: Date, months: number): Date {
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

function applyLid5(request: AssessmentRequest, trace: CalculationStep[]): AssessmentResult {
  const { date, amount, isCustomBookYear } = request;
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const numTerms = 12 - month;

  trace.push({
    step: 'Berekenen aantal termijnen',
    result: `${numTerms} termijnen mogelijk (12 - maand ${month})`,
    legalBasis: 'Artikel 9, vijfde lid, eerste volzin, IW 1990',
    legalText: LEGAL_TEXTS.ART_9_LID_5_VOLZIN_1,
    sourceFile: 'begrippen/termijnenberekening-resterende-maanden.md'
  });

  if (numTerms <= 1) {
    trace.push({
      step: 'Controle aantal termijnen',
      result: 'Slechts 1 termijn berekend -> Terugval naar hoofdregel',
      legalBasis: 'Artikel 9, vijfde lid, derde volzin, IW 1990',
      legalText: LEGAL_TEXTS.ART_9_LID_5_VOLZIN_3,
      sourceFile: 'begrippen/terugvalregel-lid-1.md'
    });
    return applyLid1(date, amount, trace);
  }

  // Algoritme: elk termijnbedrag wordt naar boven afgerond op hele euro's.
  // Vervolgens worden een aantal termijnen met precies €1 verlaagd totdat
  // de som exact gelijk is aan het totaalbedrag (uitvoeringskeuze).
  // Belastingaanslagen luiden in hele euro's; Math.round absorbeert eventuele centafwijkingen.
  const totalEuros = Math.round(amount);
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

  const terms: PaymentTerm[] = [];

  for (let i = 1; i <= numTerms; i++) {
    let termDate = addMonths(date, i);
    let termRationale = i === 1
      ? 'Eerste termijn vervalt één maand na dagtekening (Art. 9 lid 5 IW 1990).'
      : 'Vervolgtermijn telkens één maand later (Art. 9 lid 5 IW 1990).';

    if (i === numTerms) {
      if (isCustomBookYear) {
        termDate = new Date(termDate.getFullYear(), termDate.getMonth() + 1, 0);
        trace.push({
          step: 'Verschuiving laatste termijn (Afwijkend boekjaar)',
          result: `Gesteld op laatste dag van de maand: ${termDate.toLocaleDateString('nl-NL')}`,
          legalBasis: '§ 9.1 Leidraad Invordering 2008',
          legalText: LEGAL_TEXTS.LI_2008_9_1_AFWIJKEND,
          sourceFile: 'regels/AR-LI-9-1b.md'
        });
        termRationale = 'Voor afwijkende boekjaren wordt de laatste vervaldag gesteld op de laatste dag van de maand (§ 9.1 Leidraad Invordering 2008).';
      } else if (termDate <= new Date(year, 11, 31)) {
        trace.push({
          step: `Verschuiving laatste termijn (Termijn ${i})`,
          result: 'Verschoven naar 31 december (begunstigend beleid)',
          legalBasis: '§ 9.1 Leidraad Invordering 2008',
          legalText: LEGAL_TEXTS.LI_2008_9_1,
          sourceFile: 'regels/AR-LI-9-1a.md'
        });
        termDate = new Date(year, 11, 31);
        termRationale = 'De laatste termijn is verschoven naar 31 december op basis van begunstigend beleid (§ 9.1 Leidraad Invordering 2008).';
      }
    }

    // De eerste numHigher termijnen krijgen het hogere bedrag, de rest €1 minder.
    const termAmount = i <= numHigher ? higherTerm : lowerTerm;

    terms.push({
      date: termDate,
      amount: termAmount,
      label: `Termijn ${i}`,
      rationale: termRationale
    });
  }

  return {
    terms,
    legalBasis: 'Artikel 9, vijfde lid, Invorderingswet 1990',
    trace
  };
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
