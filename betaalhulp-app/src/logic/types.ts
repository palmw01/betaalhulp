export type AssessmentType = 'NORMAL' | 'PROVISIONAL';

export interface AssessmentRequest {
  type: AssessmentType;
  date: Date;
  amount: number;
  isCustomBookYear: boolean;
  /** Maandnummer (1-12) waarin het afwijkende boekjaar eindigt. */
  bookYearEndMonth?: number;
  /** Alleen relevant voor voorlopige aanslagen: het jaar waarover de aanslag is vastgesteld. */
  assessmentYear: number;
}

export interface PaymentTerm {
  date: Date;
  amount: number;
  label: string;
  rationale: string;
}

export interface CalculationStep {
  step: string;
  result: string;
  legalBasis: string;
  legalText?: string;
  sourceFile?: string;
}

export interface AssessmentResult {
  terms: PaymentTerm[];
  legalBasis: string;
  trace: CalculationStep[];
}
