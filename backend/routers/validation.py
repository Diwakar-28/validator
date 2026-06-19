from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel
import pandas as pd
import io
import uuid
import zipfile
from services.validator import process_dataframe

router = APIRouter()

# In-memory session storage (UUID -> dict of DataFrames)
# Note: For production, use Redis or cloud storage.
SESSION_STORE = {}

class ErrorDetail(BaseModel):
    row: int
    field: str
    reason: str

class ValidationSummary(BaseModel):
    totalRows: int
    validRows: int
    invalidRows: int

class ValidationResponse(BaseModel):
    session_id: str
    summary: ValidationSummary
    errors: list[ErrorDetail]

@router.post("/upload", response_model=ValidationResponse)
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents), dtype=str, keep_default_na=False)
    except Exception as e:
         raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
         
    result = process_dataframe(df)
    
    # Store results in memory
    session_id = str(uuid.uuid4())
    SESSION_STORE[session_id] = {
         "valid_df": result["valid_df"],
         "invalid_df": result["invalid_df"]
    }
    
    return {
        "session_id": session_id,
        "summary": result["summary"],
        "errors": result["errors"]
    }

@router.get("/download/cleaned/{session_id}")
async def download_cleaned(session_id: str):
    if session_id not in SESSION_STORE:
        raise HTTPException(status_code=404, detail="Session not found or expired")
        
    valid_df = SESSION_STORE[session_id]["valid_df"]
    
    if valid_df.empty:
         raise HTTPException(status_code=404, detail="No valid data to download")
         
    total_rows = len(valid_df)
    CHUNK_SIZE = 5000
    
    if total_rows <= CHUNK_SIZE:
        # Return single CSV
        stream = io.StringIO()
        valid_df.to_csv(stream, index=False)
        response = Response(content=stream.getvalue(), media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=cleaned_transactions.csv"
        return response
    else:
        # Zip multiple chunks
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            num_chunks = (total_rows // CHUNK_SIZE) + (1 if total_rows % CHUNK_SIZE != 0 else 0)
            for i in range(num_chunks):
                 chunk_df = valid_df.iloc[i*CHUNK_SIZE : (i+1)*CHUNK_SIZE]
                 chunk_csv = chunk_df.to_csv(index=False)
                 zip_file.writestr(f"chunk_{i+1}.csv", chunk_csv)
                 
        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer, 
            media_type="application/zip", 
            headers={"Content-Disposition": "attachment; filename=cleaned_transactions.zip"}
        )

@router.get("/download/errors/{session_id}")
async def download_errors(session_id: str):
    if session_id not in SESSION_STORE:
        raise HTTPException(status_code=404, detail="Session not found or expired")
        
    invalid_df = SESSION_STORE[session_id]["invalid_df"]
    
    if invalid_df.empty:
         raise HTTPException(status_code=404, detail="No error data to download")
         
    stream = io.StringIO()
    invalid_df.to_csv(stream, index=False)
    response = Response(content=stream.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=error_report.csv"
    return response
