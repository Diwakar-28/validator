import pandas as pd
import re
from datetime import datetime

ALLOWED_PAYMENT_MODES = {'UPI', 'Card', 'NetBanking', 'Wallet', 'Cash'}
MANDATORY_COLUMNS = ['order_id', 'customer_name', 'phone_number', 'country_code', 'email', 'payment_mode', 'order_date', 'amount']

def validate_phone(row):
    phone = str(row.get('phone_number', '')).strip()
    country = str(row.get('country_code', '')).strip().upper()
    
    if pd.isna(row.get('phone_number')) or not phone:
        return False, "Phone number is missing"
    if not phone.isdigit():
        return False, "Phone number must be numeric"
        
    if country == 'IN':
        if len(phone) != 10:
            return False, "India (IN) phone number must be exactly 10 digits"
    elif country == 'SG':
        if len(phone) != 8:
            return False, "Singapore (SG) phone number must be exactly 8 digits"
    else:
        # If country code is missing or unknown, apply a generic rule or just reject?
        # The prompt says "Country-specific validation... IN exactly 10, SG exactly 8".
        # Let's reject if it doesn't match standard lengths for now.
        if len(phone) not in [8, 10]:
             return False, f"Invalid phone number length for country code {country}"
             
    return True, ""

def validate_email(email_val):
    if pd.isna(email_val):
        return False, "Email is missing"
    email = str(email_val).strip()
    if not email:
        return False, "Email is blank"
    
    # Basic regex for email format
    regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    if not re.match(regex, email):
        return False, "Malformed email format"
    return True, ""

def validate_date(date_val):
    if pd.isna(date_val):
        return False, "Date is missing", None
    
    date_str = str(date_val).strip()
    if not date_str:
         return False, "Date is blank", None
         
    # Accept YYYY-MM-DD or DD-MM-YYYY
    parsed_date = None
    for fmt in ('%Y-%m-%d', '%d-%m-%Y'):
        try:
            parsed_date = datetime.strptime(date_str, fmt)
            break
        except ValueError:
            pass
            
    if parsed_date is None:
        return False, "Invalid date format. Expected YYYY-MM-DD or DD-MM-YYYY or impossible date.", None
        
    # Standardize format
    return True, "", parsed_date.strftime('%Y-%m-%d')

def validate_amount(amount_val):
    if pd.isna(amount_val):
        return False, "Amount is missing"
    
    try:
        val = float(amount_val)
        if val < 0:
            return False, "Amount must be greater than or equal to zero"
        return True, ""
    except ValueError:
        return False, "Amount must be numeric"

def validate_payment_mode(mode_val):
    if pd.isna(mode_val):
         return False, "Payment mode is missing"
    mode = str(mode_val).strip()
    # Case insensitive matching? The requirement says "UPI, Card, NetBanking, Wallet, Cash". 
    # Let's normalize for check.
    allowed_lower = {m.lower() for m in ALLOWED_PAYMENT_MODES}
    if mode.lower() not in allowed_lower:
         return False, f"Invalid payment mode. Allowed values: {', '.join(ALLOWED_PAYMENT_MODES)}"
    
    # Convert to the exact requested casing
    for am in ALLOWED_PAYMENT_MODES:
        if am.lower() == mode.lower():
            return True, am
            
    return True, mode

def process_dataframe(df: pd.DataFrame):
    errors = []
    valid_rows = []
    invalid_rows = []
    
    # Standardize column names to lowercase and replace spaces with underscores
    df.columns = [str(col).strip().lower().replace(' ', '_') for col in df.columns]
    
    # Check data integrity: missing mandatory columns
    missing_cols = [col for col in MANDATORY_COLUMNS if col not in df.columns]
    
    if missing_cols:
        # If columns are completely missing, we might reject the entire file or just mark all rows.
        # Let's return a global error or we can just process what we have.
        pass # Will handle missing col gracefully by using .get()

    # Track duplicates
    seen_order_ids = set()

    # Iterate rows
    # Convert to dict records for easier processing
    # Row index in pandas is 0-indexed, UI wants 1-indexed probably or we use index + 1 (taking into account header)
    # The actual row number in the CSV is index + 2 (1 for header, 1 for 0-index)
    
    for idx, row in df.iterrows():
        row_num = idx + 2  # Assuming index is 0-based and row 1 was header
        row_dict = row.to_dict()
        row_errors = []

        # 1. Missing fields (mandatory)
        for col in MANDATORY_COLUMNS:
            val = row_dict.get(col)
            if pd.isna(val) or str(val).strip() == '':
                row_errors.append({"field": col, "reason": "Missing or blank mandatory field"})

        # 2. Duplicate order_id
        order_id = row_dict.get('order_id')
        if not pd.isna(order_id) and str(order_id).strip() != '':
            if order_id in seen_order_ids:
                row_errors.append({"field": "order_id", "reason": "Duplicate order_id"})
            else:
                seen_order_ids.add(order_id)

        # 3. Phone validation
        if not pd.isna(row_dict.get('phone_number')) and str(row_dict.get('phone_number')).strip() != '':
            p_valid, p_reason = validate_phone(row_dict)
            if not p_valid:
                row_errors.append({"field": "phone_number", "reason": p_reason})

        # 4. Email validation
        if not pd.isna(row_dict.get('email')) and str(row_dict.get('email')).strip() != '':
            e_valid, e_reason = validate_email(row_dict.get('email'))
            if not e_valid:
                row_errors.append({"field": "email", "reason": e_reason})

        # 5. Date validation
        if not pd.isna(row_dict.get('order_date')) and str(row_dict.get('order_date')).strip() != '':
            d_valid, d_reason, d_formatted = validate_date(row_dict.get('order_date'))
            if not d_valid:
                row_errors.append({"field": "order_date", "reason": d_reason})
            else:
                row_dict['order_date'] = d_formatted

        # 6. Amount validation
        if not pd.isna(row_dict.get('amount')) and str(row_dict.get('amount')).strip() != '':
            a_valid, a_reason = validate_amount(row_dict.get('amount'))
            if not a_valid:
                row_errors.append({"field": "amount", "reason": a_reason})

        # 7. Payment mode validation
        if not pd.isna(row_dict.get('payment_mode')) and str(row_dict.get('payment_mode')).strip() != '':
            pm_valid, pm_res = validate_payment_mode(row_dict.get('payment_mode'))
            if not pm_valid:
                row_errors.append({"field": "payment_mode", "reason": pm_res})
            else:
                row_dict['payment_mode'] = pm_res

        if not row_errors:
            valid_rows.append(row_dict)
        else:
            for err in row_errors:
                errors.append({"row": row_num, "field": err["field"], "reason": err["reason"]})
            reasons_str = "; ".join([f"{e['field']}: {e['reason']}" for e in row_errors])
            row_dict['failure_reasons'] = reasons_str
            invalid_rows.append(row_dict)
            
    valid_df = pd.DataFrame(valid_rows)
    invalid_df = pd.DataFrame(invalid_rows)
    
    return {
        "summary": {
            "totalRows": len(df),
            "validRows": len(valid_df),
            "invalidRows": len(invalid_df)
        },
        "errors": errors,
        "valid_df": valid_df,
        "invalid_df": invalid_df
    }
