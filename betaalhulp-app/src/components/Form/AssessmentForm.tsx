import React from 'react';
import type { AssessmentRequest, AssessmentType } from '../../logic/types';

interface Props {
  data: AssessmentRequest;
  onChange: (data: AssessmentRequest) => void;
  onNext: () => void;
}

const AssessmentForm: React.FC<Props> = ({ data, onChange, onNext }) => {
  return (
    <div>
      <h2>Aanslaggegevens</h2>
      <div className="form-group">
        <label>Type aanslag</label>
        <select 
          value={data.type} 
          onChange={(e) => onChange({ ...data, type: e.target.value as AssessmentType })}
        >
          <option value="NORMAL">Normale aanslag (definitief)</option>
          <option value="PROVISIONAL">Voorlopige aanslag</option>
        </select>
        <p className="rationale">Kies 'Voorlopige aanslag' als u in termijnen wilt betalen gedurende het belastingjaar.</p>
      </div>

      <div className="form-group">
        <label>Dagtekening op het aanslagbiljet</label>
        <input 
          type="date" 
          value={data.date.toISOString().split('T')[0]} 
          onChange={(e) => onChange({ ...data, date: new Date(e.target.value) })}
        />
        <p className="rationale">Deze datum staat rechtsboven op uw aanslagbiljet.</p>
      </div>

      <div className="form-group">
        <label>Totaalbedrag (€)</label>
        <input 
          type="number" 
          value={data.amount} 
          onChange={(e) => onChange({ ...data, amount: parseFloat(e.target.value) })}
          placeholder="Bijv. 1250.00"
        />
        <p className="rationale">Het volledige bedrag dat u moet betalen.</p>
      </div>

      <div className="form-group">
        <label>
          <input 
            type="checkbox" 
            checked={data.isCustomBookYear} 
            onChange={(e) => onChange({ ...data, isCustomBookYear: e.target.checked })}
          />
          Afwijkend boekjaar
        </label>
        <p className="rationale">Alleen van toepassing als uw boekjaar niet gelijk loopt met het kalenderjaar.</p>
      </div>

      <button className="btn" onClick={onNext} disabled={!data.amount || isNaN(data.date.getTime())}>
        Bereken Betaalschema
      </button>
    </div>
  );
};

export default AssessmentForm;
