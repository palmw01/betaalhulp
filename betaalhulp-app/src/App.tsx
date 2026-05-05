import { useState } from 'react';
import './App.css';
import type { AssessmentRequest, AssessmentResult } from './logic/types';
import { calculatePaymentTerms } from './logic/taxEngine';
import AssessmentForm from './components/Form/AssessmentForm';
import PaymentSchedule from './components/Schedule/PaymentSchedule';

function App() {
  const [step, setStep] = useState<'INTRO' | 'FORM' | 'RESULT'>('INTRO');
  const [request, setRequest] = useState<AssessmentRequest>({
    type: 'NORMAL',
    date: new Date(),
    amount: 0,
    isCustomBookYear: false
  });
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const handleCalculate = () => {
    const calculationResult = calculatePaymentTerms(request);
    setResult(calculationResult);
    setStep('RESULT');
  };

  const handleBack = () => {
    setStep('FORM');
  };

  const startWizard = () => {
    setStep('FORM');
  };

  return (
    <div className="page-wrapper">
      <div className="ribbon"></div>
      <header className="header-container">
        <div className="content-width">
          <h1>BetaalHulp Belastingaanslag</h1>
          <p>Hulpmiddel voor het berekenen van uw betaaltermijnen conform de Invorderingswet.</p>
        </div>
      </header>

      <main className="content-width">
        <div className="main-container">
          {step === 'INTRO' && (
            <div>
              <h2>Wanneer moet u betalen?</h2>
              <p>
                Met dit hulpmiddel berekent u eenvoudig de uiterste betaaldatum(s) van uw belastingaanslag. 
                De berekening is gebaseerd op Artikel 9 van de Invorderingswet 1990.
              </p>
              <p><strong>Houd uw aanslagbiljet bij de hand. U heeft de volgende gegevens nodig:</strong></p>
              <ul>
                <li>De dagtekening van het aanslagbiljet</li>
                <li>Het totaalbedrag van de aanslag</li>
                <li>Het type aanslag (normaal of voorlopig)</li>
              </ul>
              <div style={{ marginTop: '30px' }}>
                <button className="btn" onClick={startWizard}>Start berekening</button>
              </div>
            </div>
          )}

          {step === 'FORM' && (
            <AssessmentForm 
              data={request} 
              onChange={setRequest} 
              onNext={handleCalculate} 
            />
          )}

          {step === 'RESULT' && result && (
            <PaymentSchedule result={result} onBack={handleBack} />
          )}
        </div>
      </main>

      <footer className="content-width">
        <p>
          Dit hulpmiddel is gebaseerd op de actuele wet- en regelgeving (Artikel 9 IW 1990).
          Er kunnen geen rechten worden ontleend aan de uitkomsten van deze berekening.
        </p>
      </footer>
    </div>
  );
}

export default App;
