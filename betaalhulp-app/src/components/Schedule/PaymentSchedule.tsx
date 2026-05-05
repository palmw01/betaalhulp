import React, { useState } from 'react';
import type { AssessmentResult } from '../../logic/types';

interface Props {
  result: AssessmentResult;
  onBack: () => void;
}

const PaymentSchedule: React.FC<Props> = ({ result, onBack }) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

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
            <div key={index} className="trace-step" style={{ display: 'block', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div className="trace-label" style={{ marginBottom: '4px' }}>{step.step}</div>
                  <div style={{ fontSize: '1em' }}>{step.result}</div>
                  <div style={{ marginTop: '4px' }}>
                    <span className="legal-basis-tag" style={{ margin: 0 }}>{step.legalBasis}</span>
                    {step.legalText && (
                      <button 
                        onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#01689b', 
                          textDecoration: 'underline', 
                          fontSize: '0.85em', 
                          cursor: 'pointer',
                          marginLeft: '10px',
                          padding: 0
                        }}
                      >
                        {expandedStep === index ? 'Verberg wettekst' : 'Toon wettekst'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {expandedStep === index && step.legalText && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px 15px', 
                  backgroundColor: '#f3f6f8', 
                  borderLeft: '4px solid #01689b',
                  fontSize: '0.9em',
                  lineHeight: '1.5',
                  fontStyle: 'italic',
                  color: '#333'
                }}>
                  {step.legalText}
                </div>
              )}
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
