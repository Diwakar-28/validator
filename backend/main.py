from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import validation

app = FastAPI(title="Transaction Data Validation API")

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(validation.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Transaction Data Validation API is running"}
