import type { AssessmentRequest, AssessmentResult, PaymentTerm } from './types';

export function calculatePaymentTerms(request: AssessmentRequest): AssessmentResult {
  const { type, date, amount, isCustomBookYear } = request;
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12

  // LID 5: Voorlopige aanslag in het belastingjaar
  if (type === 'PROVISIONAL') {
    const numTerms = 12 - month;

    if (numTerms > 1) {
      const terms: PaymentTerm[] = [];
      const termAmount = Math.floor((amount / numTerms) * 100) / 100;
      let remaining = amount;

      for (let i = 1; i <= numTerms; i++) {
        let termDate = new Date(date);
        termDate.setMonth(termDate.getMonth() + i);

        // LI 2008: Eindejaarsregeling
        // Voor aanslagen gedagtekend in november of eerder (month <= 11)
        // Verschuif laatste termijn naar 31 december
        if (i === numTerms && month <= 11 && !isCustomBookYear) {
          const dec31 = new Date(year, 11, 31);
          if (termDate < dec31) {
            termDate = dec31;
          }
        }

        // LI 2008: Afwijkend boekjaar (laatste dag van de maand)
        if (i === numTerms && isCustomBookYear) {
          termDate = new Date(termDate.getFullYear(), termDate.getMonth() + 1, 0);
        }

        const currentAmount = i === numTerms ? Math.round(remaining * 100) / 100 : termAmount;
        remaining -= currentAmount;

        terms.push({
          date: termDate,
          amount: currentAmount,
          label: `Termijn ${i}`,
          rationale: i === 1 
            ? 'Eerste termijn vervalt één maand na dagtekening (Art. 9 lid 5 IW 1990).' 
            : 'Vervolgtermijn telkens één maand later (Art. 9 lid 5 IW 1990).'
        });
      }

      return {
        terms,
        legalBasis: 'Artikel 9, vijfde lid, Invorderingswet 1990'
      };
    }
  }

  // LID 1: Standaardregeling (6 weken)
  const dueDate = new Date(date);
  dueDate.setDate(dueDate.getDate() + 42); // 6 weeks

  return {
    terms: [{
      date: dueDate,
      amount: amount,
      label: 'Volledig bedrag',
      rationale: 'Invorderbaarheid treedt in zodra de termijn van zes weken na de dagtekening is verstreken (Art. 9 lid 1 IW 1990).'
    }],
    legalBasis: 'Artikel 9, eerste lid, Invorderingswet 1990'
  };
}
