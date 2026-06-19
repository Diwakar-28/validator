export interface TransactionRow {
  [key: string]: string;
}

export interface ValidationError {
  row: number;
  field: string;
  reason: string;
}

export interface ValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

export interface ValidationResult {
  session_id: string;
  summary: ValidationSummary;
  errors: ValidationError[];
}
