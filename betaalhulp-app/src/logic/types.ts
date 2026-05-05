export type AssessmentType = 'NORMAL' | 'PROVISIONAL';

export interface AssessmentRequest {
  type: AssessmentType;
  date: Date;
  amount: number;
  isCustomBookYear?: boolean;
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
