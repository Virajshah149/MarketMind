from fastapi import FastAPI
import pandas as pd

app = FastAPI(
    title="MarketMind API",
    description="Corporate dependency and supply-chain intelligence platform",
    version="0.1.0"
)

COMPANY_FILE = "../data/companies.csv"


@app.get("/")
def root():
    return {
        "message": "Welcome to MarketMind API",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/companies")
def get_companies():
    companies = pd.read_csv(COMPANY_FILE)

    return companies.to_dict(orient="records")