import type { ValidationError, ValidationResult, TransactionRow } from '../types';

const ALLOWED_PAYMENT_MODES = ['UPI', 'Card', 'NetBanking', 'Wallet', 'Cash'];
const MANDATORY_COLUMNS = ['order_id', 'customer_name', 'phone_number', 'country_code', 'email', 'payment_mode', 'order_date', 'amount'];

function isBlank(val: string | undefined | null): boolean {
  return val === undefined || val === null || val.trim() === '';
}

function validatePhone(phone: string, country: string): { valid: boolean; reason: string } {
  if (!phone.trim()) return { valid: false, reason: 'Phone number is missing' };
  if (!/^\d+$/.test(phone.trim())) return { valid: false, reason: 'Phone number must be numeric' };

  const cc = country.trim().toUpperCase();
  const len = phone.trim().length;

  if (cc === 'IN' && len !== 10) return { valid: false, reason: 'India (IN) phone number must be exactly 10 digits' };
  if (cc === 'SG' && len !== 8) return { valid: false, reason: 'Singapore (SG) phone number must be exactly 8 digits' };
  if (cc !== 'IN' && cc !== 'SG' && ![8, 10].includes(len)) return { valid: false, reason: `Invalid phone number length for country code ${cc}` };

  return { valid: true, reason: '' };
}

function validateEmail(email: string): { valid: boolean; reason: string } {
  if (!email.trim()) return { valid: false, reason: 'Email is blank' };
  const regex = /^[\w.-]+@[\w.-]+\.\w+$/;
  if (!regex.test(email.trim())) return { valid: false, reason: 'Malformed email format' };
  return { valid: true, reason: '' };
}

function validateDate(dateStr: string): { valid: boolean; reason: string; formatted: string | null } {
  if (!dateStr.trim()) return { valid: false, reason: 'Date is blank', formatted: null };

  // Try YYYY-MM-DD
  const isoMatch = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const d = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    if (d.getFullYear() === parseInt(isoMatch[1]) && d.getMonth() === parseInt(isoMatch[2]) - 1 && d.getDate() === parseInt(isoMatch[3])) {
      return { valid: true, reason: '', formatted: dateStr.trim() };
    }
  }

  // Try DD-MM-YYYY
  const dmy = dateStr.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmy) {
    const day = parseInt(dmy[1]), month = parseInt(dmy[2]), year = parseInt(dmy[3]);
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return { valid: true, reason: '', formatted: `${year}-${mm}-${dd}` };
    }
  }

  return { valid: false, reason: 'Invalid date format. Expected YYYY-MM-DD or DD-MM-YYYY or impossible date.', formatted: null };
}

function validateAmount(amount: string): { valid: boolean; reason: string } {
  if (!amount.trim()) return { valid: false, reason: 'Amount is missing' };
  const val = parseFloat(amount.trim());
  if (isNaN(val)) return { valid: false, reason: 'Amount must be numeric' };
  if (val < 0) return { valid: false, reason: 'Amount must be greater than or equal to zero' };
  return { valid: true, reason: '' };
}

function validatePaymentMode(mode: string): { valid: boolean; result: string } {
  if (!mode.trim()) return { valid: false, result: 'Payment mode is missing' };
  const matched = ALLOWED_PAYMENT_MODES.find(m => m.toLowerCase() === mode.trim().toLowerCase());
  if (!matched) return { valid: false, result: `Invalid payment mode. Allowed values: ${ALLOWED_PAYMENT_MODES.join(', ')}` };
  return { valid: true, result: matched };
}

export interface ProcessedData {
  validationResult: ValidationResult;
  validRows: TransactionRow[];
  invalidRows: TransactionRow[];
}

export function processCSVData(rawRows: TransactionRow[]): ProcessedData {
  const errors: ValidationError[] = [];
  const validRows: TransactionRow[] = [];
  const invalidRows: TransactionRow[] = [];
  const seenOrderIds = new Set<string>();

  // Normalize column names
  const normalizedRows: TransactionRow[] = rawRows.map(row => {
    const newRow: TransactionRow = {};
    for (const key of Object.keys(row)) {
      const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
      newRow[normalizedKey] = row[key];
    }
    return newRow;
  });

  for (let idx = 0; idx < normalizedRows.length; idx++) {
    const rowNum = idx + 2; // header is row 1
    const row = { ...normalizedRows[idx] };
    const rowErrors: { field: string; reason: string }[] = [];

    // 1. Missing mandatory fields
    for (const col of MANDATORY_COLUMNS) {
      if (isBlank(row[col])) {
        rowErrors.push({ field: col, reason: 'Missing or blank mandatory field' });
      }
    }

    // 2. Duplicate order_id
    const orderId = (row['order_id'] || '').trim();
    if (orderId) {
      if (seenOrderIds.has(orderId)) {
        rowErrors.push({ field: 'order_id', reason: 'Duplicate order_id' });
      } else {
        seenOrderIds.add(orderId);
      }
    }

    // 3. Phone
    if (!isBlank(row['phone_number'])) {
      const { valid, reason } = validatePhone(row['phone_number'], row['country_code'] || '');
      if (!valid) rowErrors.push({ field: 'phone_number', reason });
    }

    // 4. Email
    if (!isBlank(row['email'])) {
      const { valid, reason } = validateEmail(row['email']);
      if (!valid) rowErrors.push({ field: 'email', reason });
    }

    // 5. Date
    if (!isBlank(row['order_date'])) {
      const { valid, reason, formatted } = validateDate(row['order_date']);
      if (!valid) {
        rowErrors.push({ field: 'order_date', reason });
      } else if (formatted) {
        row['order_date'] = formatted;
      }
    }

    // 6. Amount
    if (!isBlank(row['amount'])) {
      const { valid, reason } = validateAmount(row['amount']);
      if (!valid) rowErrors.push({ field: 'amount', reason });
    }

    // 7. Payment mode
    if (!isBlank(row['payment_mode'])) {
      const { valid, result } = validatePaymentMode(row['payment_mode']);
      if (!valid) {
        rowErrors.push({ field: 'payment_mode', reason: result });
      } else {
        row['payment_mode'] = result;
      }
    }

    if (rowErrors.length === 0) {
      validRows.push(row);
    } else {
      for (const err of rowErrors) {
        errors.push({ row: rowNum, field: err.field, reason: err.reason });
      }
      row['failure_reasons'] = rowErrors.map(e => `${e.field}: ${e.reason}`).join('; ');
      invalidRows.push(row);
    }
  }

  return {
    validationResult: {
      session_id: crypto.randomUUID(),
      summary: {
        totalRows: normalizedRows.length,
        validRows: validRows.length,
        invalidRows: invalidRows.length,
      },
      errors,
    },
    validRows,
    invalidRows,
  };
}
