import React, { useState } from 'react';
import type { AssessmentResult } from '../../logic/types';

interface Props {
  result: AssessmentResult;
  onBack: () => void;
}

const PaymentSchedule: React.FC<Props> = ({ result, onBack }) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <div>
      <div className="schedule-header">
        <h2>Uw betaalschema</h2>
        <div className="terms-badge">
          {result.terms.length} {result.terms.length === 1 ? 'termijn' : 'termijnen'}
        </div>
      </div>

      <p>U moet het totaalbedrag betalen in de volgende termijn(en):</p>

      <div className="terms-list">
        {result.terms.map((term, index) => (
          <div key={index} className="term-item">
            <div className="term-label">
              {term.label}: {formatCurrency(term.amount)}
            </div>
            <div className="deadline">
              Uiterste betaaldatum: {formatDate(term.date)}
            </div>
            <div className="rationale">
              {term.rationale}
            </div>
          </div>
        ))}
      </div>

      <div className="trace-container">
        <h3>Hoe is deze berekening tot stand gekomen?</h3>
        <p style={{ fontSize: '0.9em' }}>
          De Belastingdienst berekent uw betaaltermijnen op basis van wettelijke regels.
          Hieronder ziet u de stappen die zijn gevolgd voor uw specifieke situatie:
        </p>
        <div>
          {result.trace.map((step, index) => {
            const isExpanded = expandedSteps.has(index);
            return (
              <div key={index} className="trace-step">
                <div className="trace-label">{step.step}</div>
                <div className="trace-result">{step.result}</div>
                <div className="trace-meta">
                  <span className="legal-basis-tag">{step.legalBasis}</span>
                  {step.legalText && (
                    <button
                      className="legal-text-toggle"
                      onClick={() => toggleStep(index)}
                      aria-expanded={isExpanded}
                      aria-controls={`legal-text-${index}`}
                    >
                      {isExpanded ? 'Verberg wettekst' : 'Toon wettekst'}
                    </button>
                  )}
                </div>
                {isExpanded && step.legalText && (
                  <div
                    id={`legal-text-${index}`}
                    role="region"
                    className="legal-text"
                  >
                    {step.legalText}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="schedule-footer">
        <button className="btn" onClick={onBack}>
          Nieuwe berekening
        </button>
      </div>
    </div>
  );
};

export default PaymentSchedule;
