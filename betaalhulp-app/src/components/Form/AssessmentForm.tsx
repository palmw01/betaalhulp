import React from 'react';
import type { AssessmentRequest, AssessmentType } from '../../logic/types';

interface Props {
  data: AssessmentRequest;
  onChange: (data: AssessmentRequest) => void;
  onNext: () => void;
  error?: string | null;
}

function parseDateLocal(value: string): Date {
  if (!value) return new Date(NaN);
  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return new Date(NaN);
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}

const AssessmentForm: React.FC<Props> = ({ data, onChange, onNext, error }) => {
  const dateValue = isNaN(data.date.getTime())
    ? ''
    : data.date.toLocaleDateString('sv-SE'); // geeft YYYY-MM-DD in lokale tijd

  const isValid = data.amount > 0 && !isNaN(data.date.getTime()) &&
    (data.type !== 'PROVISIONAL' || (data.assessmentYear >= 1990 && data.assessmentYear <= 2099));

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (isValid) onNext(); }}>
      <h2>Vul uw gegevens in</h2>

      <div className="form-group">
        <label htmlFor="assessmentType">Type aanslag</label>
        <select
          id="assessmentType"
          value={data.type}
          onChange={(e) => onChange({
            ...data,
            type: e.target.value as AssessmentType,
            isCustomBookYear: false,
          })}
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
          min="1990-06-01"
          max="2099-12-31"
          value={dateValue}
          onChange={(e) => {
            const newDate = parseDateLocal(e.target.value);
            const yearFromDate = isNaN(newDate.getTime()) ? data.assessmentYear : newDate.getFullYear();
            onChange({ ...data, date: newDate, assessmentYear: yearFromDate });
          }}
        />
        <span className="hint">De datum waarop de Belastingdienst de aanslag heeft vastgesteld.</span>
      </div>

      {data.type === 'PROVISIONAL' && (
        <div className="form-group">
          <label htmlFor="assessmentYear">Belastingjaar van de aanslag</label>
          <input
            id="assessmentYear"
            type="number"
            min="1990"
            max="2099"
            step="1"
            value={data.assessmentYear}
            onChange={(e) => onChange({ ...data, assessmentYear: parseInt(e.target.value, 10) || data.assessmentYear })}
          />
          <span className="hint">
            Het jaar waarover de voorlopige aanslag is opgelegd (staat op uw aanslagbiljet). Meestal gelijk aan het jaar van de dagtekening.
          </span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="assessmentAmount">Totaalbedrag (€)</label>
        <input
          id="assessmentAmount"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          value={data.amount || ''}
          onChange={(e) => onChange({ ...data, amount: parseFloat(e.target.value) || 0 })}
          placeholder="Bijv. 1250.00"
        />
        <span className="hint">Het 'totaal te betalen' bedrag van uw aanslagbiljet.</span>
      </div>

      {data.type === 'PROVISIONAL' && (
        <>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={data.isCustomBookYear}
                onChange={(e) => onChange({ ...data, isCustomBookYear: e.target.checked })}
              />
              Afwijkend boekjaar
            </label>
            <span className="hint">
              Selecteer dit alleen als u een ondernemer bent met een boekjaar dat niet op 1 januari begint.
            </span>
          </div>

          {data.isCustomBookYear && (
            <div className="form-group" style={{ marginLeft: '30px', borderLeft: '2px solid #eee', paddingLeft: '15px' }}>
              <label htmlFor="bookYearEndMonth">In welke maand eindigt uw boekjaar?</label>
              <select
                id="bookYearEndMonth"
                value={data.bookYearEndMonth || 12}
                onChange={(e) => onChange({ ...data, bookYearEndMonth: parseInt(e.target.value, 10) })}
              >
                <option value={1}>Januari</option>
                <option value={2}>Februari</option>
                <option value={3}>Maart</option>
                <option value={4}>April</option>
                <option value={5}>Mei</option>
                <option value={6}>Juni</option>
                <option value={7}>Juli</option>
                <option value={8}>Augustus</option>
                <option value={9}>September</option>
                <option value={10}>Oktober</option>
                <option value={11}>November</option>
                <option value={12}>December</option>
              </select>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn" disabled={!isValid}>
          Bereken betaalschema
        </button>
      </div>
    </form>
  );
};

export default AssessmentForm;
