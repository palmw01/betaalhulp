import React from 'react';
import type { AssessmentResult } from '../../logic/types';

interface Props {
  result: AssessmentResult;
  onBack: () => void;
}

const PaymentSchedule: React.FC<Props> = ({ result, onBack }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Uw Persoonlijke Betaalschema</h2>
        <div style={{ background: '#e6f0fa', padding: '10px 15px', borderRadius: '4px', fontWeight: 'bold' }}>
          Totaal: {result.terms.length} {result.terms.length === 1 ? 'termijn' : 'termijnen'}
        </div>
      </div>
      
      <p style={{ marginBottom: '30px', fontSize: '1.1em' }}>
        Op basis van uw {result.terms.length > 1 ? 'voorlopige' : 'normale'} aanslag zijn de volgende betaalmomenten vastgesteld:
      </p>
      
      <div className="term-grid">
        {result.terms.map((term, index) => (
          <div key={index} className="card">
            <div style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#003082' }}>
              {term.label}
            </div>
            <div style={{ margin: '8px 0', fontSize: '1.1em' }}>
              {formatCurrency(term.amount)}
            </div>
            <div style={{ color: '#d52b1e', fontWeight: 'bold' }}>
              Viterlijk betalen op: {formatDate(term.date)}
            </div>
            <div className="rationale">{term.rationale}</div>
          </div>
        ))}
      </div>

      <div className="legal-basis">
        Wettelijke basis: {result.legalBasis}
      </div>

      <div style={{ marginTop: '30px' }}>
        <button className="btn" onClick={onBack}>
          Terug naar invoer
        </button>
      </div>
    </div>
  );
};

export default PaymentSchedule;
