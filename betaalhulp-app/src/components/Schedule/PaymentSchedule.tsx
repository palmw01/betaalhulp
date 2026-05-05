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
        <h2>Uw betaalschema</h2>
        <div style={{ background: '#e6f0fa', padding: '10px 15px', fontWeight: 'bold', color: '#01689b' }}>
          {result.terms.length} {result.terms.length === 1 ? 'termijn' : 'termijnen'}
        </div>
      </div>
      
      <p style={{ marginBottom: '30px' }}>
        U moet het totaalbedrag betalen in de volgende termijn(en):
      </p>
      
      <div className="terms-list">
        {result.terms.map((term, index) => (
          <div key={index} className="term-item">
            <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
              {term.label}: {formatCurrency(term.amount)}
            </div>
            <div className="deadline">
              Uiterste betaaldatum: {formatDate(term.date)}
            </div>
            <div className="rationale" style={{ marginTop: '10px', fontSize: '0.9em' }}>
              {term.rationale}
            </div>
          </div>
        ))}
      </div>

      <div className="trace-container">
        <h3 style={{ marginTop: 0, color: '#01689b', fontSize: '1.1em' }}>Hoe is deze berekening tot stand gekomen?</h3>
        <p style={{ fontSize: '0.9em' }}>
          De Belastingdienst berekent uw betaaltermijnen op basis van wettelijke regels. 
          Hieronder ziet u de stappen die zijn gevolgd voor uw specifieke situatie:
        </p>
        <div style={{ marginTop: '15px' }}>
          {result.trace.map((step, index) => (
            <div key={index} className="trace-step">
              <div className="trace-label">{step.step}</div>
              <div style={{ flex: 1 }}>
                {step.result}
                <span className="legal-basis-tag">{step.legalBasis}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <button className="btn" onClick={onBack}>
          Nieuwe berekening
        </button>
      </div>
    </div>
  );
};

export default PaymentSchedule;
