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
          value={data.date.toISOString().split('T')[0]} 
          onChange={(e) => onChange({ ...data, date: new Date(e.target.value) })}
        />
        <span className="hint">De datum waarop de Belastingdienst de aanslag heeft vastgesteld.</span>
      </div>

      <div className="form-group">
        <label htmlFor="assessmentAmount">Totaalbedrag (€)</label>
        <input 
          id="assessmentAmount"
          type="number" 
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

      <div style={{ marginTop: '40px' }}>
        <button className="btn" onClick={onNext} disabled={!data.amount || isNaN(data.date.getTime())}>
          Bereken betaalschema
        </button>
      </div>
    </div>
  );
};

export default AssessmentForm;
