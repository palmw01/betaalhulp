import { useState } from 'react';
import './App.css';
import type { AssessmentRequest, AssessmentResult } from './logic/types';
import { calculatePaymentTerms } from './logic/taxEngine';
import AssessmentForm from './components/Form/AssessmentForm';
import PaymentSchedule from './components/Schedule/PaymentSchedule';

function App() {
  const [step, setStep] = useState<'FORM' | 'RESULT'>('FORM');
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

  return (
    <div className="container">
      <header>
        <h1>BetaalHulp Belastingaanslag</h1>
        <p>Bereken eenvoudig uw betaaltermijnen conform Artikel 9 Invorderingswet 1990.</p>
      </header>

      <main>
        {step === 'FORM' ? (
          <AssessmentForm 
            data={request} 
            onChange={setRequest} 
            onNext={handleCalculate} 
          />
        ) : (
          result && <PaymentSchedule result={result} onBack={handleBack} />
        )}
      </main>

      <footer>
        <p style={{ marginTop: '50px', fontSize: '0.8em', textAlign: 'center', color: '#888' }}>
          Disclaimer: Deze applicatie is een hulpmiddel en geen officiële bron van de Belastingdienst.
        </p>
      </footer>
    </div>
  );
}

export default App;
