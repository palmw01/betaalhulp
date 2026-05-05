import React from 'react';
import type { AssessmentRequest, AssessmentType } from '../../logic/types';

interface Props {
  data: AssessmentRequest;
  onChange: (data: AssessmentRequest) => void;
  onNext: () => void;
  error?: string | null;
}

function parseDateLocal(value: string): Date {
  // new Date("YYYY-MM-DD") parseert als UTC; dit parseert als lokale tijd.
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const AssessmentForm: React.FC<Props> = ({ data, onChange, onNext, error }) => {
  const dateValue = isNaN(data.date.getTime())
    ? ''
    : data.date.toLocaleDateString('sv-SE'); // geeft YYYY-MM-DD in lokale tijd

  const isValid = data.amount > 0 && !isNaN(data.date.getTime());

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (isValid) onNext(); }}>
      <h2>Vul uw gegevens in</h2>

      <div className="form-group">
        <label htmlFor="assessmentType">Type aanslag</label>
        <select
          id="assessmentType"
          value={data.type}
          onChange={(e) => onChange({ ...data, type: e.target.value as AssessmentType })}
        >
          <option value="NORMAL">Normale aanslag (definitief)</option>
          <option value="PROVISIONAL">Voorlopige aanslag</option>
        </select>
        <span className="hint">Een voorlopige aanslag ontvangt u meestal aan het begin van het jaar.</span>
      </div>

      <div className="form-group">
        <label htmlFor="assessmentDate">Dagtekening op het aanslagbiljet</label>
        <input
          id="assessmentDate"
          type="date"
          value={dateValue}
          onChange={(e) => onChange({ ...data, date: parseDateLocal(e.target.value) })}
        />
        <span className="hint">De datum waarop de Belastingdienst de aanslag heeft vastgesteld.</span>
      </div>

      <div className="form-group">
        <label htmlFor="assessmentAmount">Totaalbedrag (€)</label>
        <input
          id="assessmentAmount"
          type="number"
          min="0.01"
          step="0.01"
          value={data.amount || ''}
          onChange={(e) => onChange({ ...data, amount: parseFloat(e.target.value) || 0 })}
          placeholder="Bijv. 1250.00"
        />
        <span className="hint">Het 'totaal te betalen' bedrag van uw aanslagbiljet.</span>
      </div>

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={data.isCustomBookYear}
            onChange={(e) => onChange({ ...data, isCustomBookYear: e.target.checked })}
            style={{ width: 'auto', marginRight: '10px' }}
          />
          Afwijkend boekjaar
        </label>
        <span className="hint">Selecteer dit alleen als u een ondernemer bent met een boekjaar dat niet op 1 januari begint.</span>
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        <button type="submit" className="btn" disabled={!isValid}>
          Bereken betaalschema
        </button>
      </div>
    </form>
  );
};

export default AssessmentForm;
