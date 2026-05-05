import type { AssessmentRequest, AssessmentResult, PaymentTerm, CalculationStep } from './types';

export function calculatePaymentTerms(request: AssessmentRequest): AssessmentResult {
  const { type, date, amount, isCustomBookYear } = request;
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const trace: CalculationStep[] = [];

  trace.push({
    step: 'Vaststellen aanslagtype',
    result: type === 'PROVISIONAL' ? 'Voorlopige aanslag' : 'Normale aanslag',
    legalBasis: 'Artikel 9, eerste en vijfde lid, IW 1990'
  });

  // LID 5: Voorlopige aanslag in het belastingjaar
  if (type === 'PROVISIONAL') {
    const numTerms = 12 - month;
    
    trace.push({
      step: 'Berekenen aantal termijnen',
      result: `${numTerms} termijnen mogelijk (12 - maand ${month})`,
      legalBasis: 'Artikel 9, vijfde lid, eerste volzin, IW 1990',
      sourceFile: 'begrippen/termijnenberekening-resterende-maanden.md'
    });

    if (numTerms > 1) {
      const terms: PaymentTerm[] = [];
      const termAmount = Math.floor((amount / numTerms) * 100) / 100;
      let remaining = amount;

      trace.push({
        step: 'Toepassen termijnregeling',
        result: `Bedrag wordt verdeeld over ${numTerms} gelijke termijnen`,
        legalBasis: 'Artikel 9, vijfde lid, tweede volzin, IW 1990',
        sourceFile: 'regels/AR-9-5a.md'
      });

      for (let i = 1; i <= numTerms; i++) {
        let termDate = new Date(date);
        termDate.setMonth(termDate.getMonth() + i);
        let termRationale = i === 1 
          ? 'Eerste termijn vervalt één maand na dagtekening (Art. 9 lid 5 IW 1990).' 
          : 'Vervolgtermijn telkens één maand later (Art. 9 lid 5 IW 1990).';

        // LI 2008: Eindejaarsregeling
        if (i === numTerms && month <= 11 && !isCustomBookYear) {
          const dec31 = new Date(year, 11, 31);
          if (termDate < dec31) {
            trace.push({
              step: `Verschuiving laatste termijn (Lid ${i})`,
              result: 'Verschoven naar 31 december (begunstigend beleid)',
              legalBasis: '§ 9.1 Leidraad Invordering 2008',
              sourceFile: 'regels/AR-LI-9-1a.md'
            });
            termDate = dec31;
            termRationale = 'De laatste termijn is verschoven naar 31 december op basis van begunstigend beleid (§ 9.1 Leidraad Invordering 2008).';
          }
        }

        // LI 2008: Afwijkend boekjaar
        if (i === numTerms && isCustomBookYear) {
          termDate = new Date(termDate.getFullYear(), termDate.getMonth() + 1, 0);
          trace.push({
            step: `Verschuiving laatste termijn (Afwijkend boekjaar)`,
            result: `Gesteld op laatste dag van de maand: ${termDate.toLocaleDateString()}`,
            legalBasis: '§ 9.1 Leidraad Invordering 2008',
            sourceFile: 'regels/AR-LI-9-1b.md'
          });
          termRationale = 'Voor afwijkende boekjaren wordt de laatste vervaldag gesteld op de laatste dag van de maand (§ 9.1 Leidraad Invordering 2008).';
        }

        const currentAmount = i === numTerms ? Math.round(remaining * 100) / 100 : termAmount;
        remaining -= currentAmount;

        terms.push({
          date: termDate,
          amount: currentAmount,
          label: `Termijn ${i}`,
          rationale: termRationale
        });
      }

      return {
        terms,
        legalBasis: 'Artikel 9, vijfde lid, Invorderingswet 1990',
        trace
      };
    } else {
      trace.push({
        step: 'Controle aantal termijnen',
        result: 'Slechts 1 termijn berekend -> Terugval naar hoofdregel',
        legalBasis: 'Artikel 9, vijfde lid, derde volzin, IW 1990',
        sourceFile: 'begrippen/terugvalregel-lid-1.md'
      });
    }
  }

  // LID 1: Standaardregeling (6 weken)
  const dueDate = new Date(date);
  dueDate.setDate(dueDate.getDate() + 42); // 6 weeks

  trace.push({
    step: 'Toepassen hoofdregel',
    result: 'Betalingstermijn van zes weken na dagtekening',
    legalBasis: 'Artikel 9, eerste lid, IW 1990',
    sourceFile: 'regels/AR-9-1.md'
  });

  return {
    terms: [{
      date: dueDate,
      amount: amount,
      label: 'Volledig bedrag',
      rationale: 'Invorderbaarheid treedt in zodra de termijn van zes weken na de dagtekening is verstreken (Art. 9 lid 1 IW 1990).'
    }],
    legalBasis: 'Artikel 9, eerste lid, Invorderingswet 1990',
    trace
  };
}
