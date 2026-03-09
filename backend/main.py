"""Data Cleaning Pipeline API - FastAPI backend"""
import os
import uuid
from io import BytesIO
from pathlib import Path
from typing import Optional

import pandas as pd
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from pipeline.cleaner import clean_table

# Config from env
PROJECT_ID = os.getenv("PROJECT_ID", "datawarehouseanalytics-480618")
DATASET_ID = os.getenv("DATASET_ID", "datawarehouseset")
_OUTPUT = os.getenv("OUTPUT_DIR", "")
OUTPUT_DIR = Path(_OUTPUT) if _OUTPUT else Path(__file__).resolve().parent.parent / "cleaned_data"
CORS_ORIGINS = [
    o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",") if o.strip()
]

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# In-memory store for uploaded files (session-scoped, stateless per request in production)
# For production: use temp dir that gets cleaned; we use a module-level dict for simplicity
_uploaded_files: dict[str, pd.DataFrame] = {}

app = FastAPI(title="Data Cleaning Pipeline API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_bigquery_client():
    """Lazy BigQuery client - only when needed and credentials available"""
    try:
        from google.cloud import bigquery
        return bigquery.Client(project=PROJECT_ID)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"BigQuery unavailable: {str(e)}")


@app.get("/health")
def health():
    """Health check for deploy"""
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    """Upload CSV files; returns table names for run"""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    table_names = []
    for f in files:
        if not f.filename or not f.filename.lower().endswith(".csv"):
            continue
        content = await f.read()
        try:
            df = pd.read_csv(BytesIO(content))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid CSV {f.filename}: {e}")
        # Table name from filename (without .csv)
        table_name = Path(f.filename).stem
        if not table_name:
            table_name = f"upload_{uuid.uuid4().hex[:8]}"
        _uploaded_files[table_name] = df
        table_names.append(table_name)
    return {"table_names": table_names, "message": f"Uploaded {len(table_names)} file(s)"}


@app.post("/api/run")
async def run_pipeline(source: str = Form("bigquery"), table_names: Optional[str] = Form(None)):
    """Run pipeline: source=bigquery or upload; table_names comma-separated (optional)"""
    tables_to_process = [t.strip() for t in (table_names or "").split(",") if t.strip()]

    if source == "bigquery":
        client = get_bigquery_client()
        dataset_ref = f"{PROJECT_ID}.{DATASET_ID}"
        try:
            from google.cloud import bigquery
            tables_list = list(client.list_tables(dataset_ref))
            all_tables = [t.table_id for t in tables_list if not t.table_id.startswith("cleaned_")]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        if not tables_to_process:
            tables_to_process = all_tables
        else:
            tables_to_process = [t for t in tables_to_process if t in all_tables]

        report = []
        for table_name in tables_to_process:
            try:
                full_table_id = f"{PROJECT_ID}.{DATASET_ID}.{table_name}"
                query = f"SELECT * FROM `{full_table_id}`"
                df_raw = client.query(query).to_dataframe()
            except Exception as e:
                report.append({"table": table_name, "rows_before": None, "rows_after": None, "duplicates_removed": None, "status": str(e)})
                continue
            rows_before = len(df_raw)
            df_clean = clean_table(df_raw, table_name)
            rows_after = len(df_clean)
            cleaned_name = f"cleaned_{table_name}"
            csv_path = OUTPUT_DIR / f"{cleaned_name}.csv"
            df_clean.to_csv(csv_path, index=False)
            report.append({
                "table": table_name,
                "rows_before": rows_before,
                "rows_after": rows_after,
                "duplicates_removed": rows_before - rows_after,
                "status": "OK",
            })

    elif source == "upload":
        if not tables_to_process:
            tables_to_process = list(_uploaded_files.keys())
        if not tables_to_process:
            raise HTTPException(status_code=400, detail="No uploaded files. Upload CSV first.")
        report = []
        for table_name in tables_to_process:
            if table_name not in _uploaded_files:
                report.append({"table": table_name, "rows_before": None, "rows_after": None, "duplicates_removed": None, "status": "File not found"})
                continue
            df_raw = _uploaded_files[table_name]
            rows_before = len(df_raw)
            df_clean = clean_table(df_raw, table_name)
            rows_after = len(df_clean)
            cleaned_name = f"cleaned_{table_name}"
            csv_path = OUTPUT_DIR / f"{cleaned_name}.csv"
            df_clean.to_csv(csv_path, index=False)
            report.append({
                "table": table_name,
                "rows_before": rows_before,
                "rows_after": rows_after,
                "duplicates_removed": rows_before - rows_after,
                "status": "OK",
            })

    else:
        raise HTTPException(status_code=400, detail="source must be 'bigquery' or 'upload'")

    return {"report": report}


@app.get("/api/report")
def get_report():
    """Report - reads from cleaned_data folder"""
    reports = []
    for p in OUTPUT_DIR.glob("cleaned_*.csv"):
        table_name = p.stem.replace("cleaned_", "")
        df = pd.read_csv(p, nrows=0)
        with open(p, "r", encoding="utf-8", errors="ignore") as f:
            rows_after = sum(1 for _ in f) - 1
        reports.append({
            "table": table_name,
            "rows_before": None,
            "rows_after": rows_after,
            "duplicates_removed": None,
            "status": "OK",
        })
    return {"report": reports}


@app.get("/api/tables")
def get_tables(source: str = "both"):
    """Table list: from BigQuery (if available) and/or cleaned_data"""
    tables = set()
    # From cleaned_data
    for p in OUTPUT_DIR.glob("cleaned_*.csv"):
        tables.add(p.stem.replace("cleaned_", ""))
    # From BigQuery
    if source in ("bigquery", "both"):
        try:
            client = get_bigquery_client()
            dataset_ref = f"{PROJECT_ID}.{DATASET_ID}"
            from google.cloud import bigquery
            for t in client.list_tables(dataset_ref):
                if not t.table_id.startswith("cleaned_"):
                    tables.add(t.table_id)
        except Exception:
            pass
    return {"table_names": sorted(tables)}


@app.get("/api/preview/{table_name}")
def preview_table(table_name: str, limit: int = 100):
    """Preview first N rows of cleaned table"""
    cleaned_name = f"cleaned_{table_name}"
    csv_path = OUTPUT_DIR / f"{cleaned_name}.csv"
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="Table not found")
    df = pd.read_csv(csv_path, nrows=limit)
    return JSONResponse(content=df.to_dict(orient="records"))


@app.get("/api/download/{table_name}")
def download_table(table_name: str):
    """Download cleaned CSV"""
    cleaned_name = f"cleaned_{table_name}"
    csv_path = OUTPUT_DIR / f"{cleaned_name}.csv"
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="Table not found")
    return FileResponse(csv_path, filename=f"{cleaned_name}.csv", media_type="text/csv")


@app.get("/api/stats")
def get_stats():
    """Stats for charts: row counts, outlier rates per table"""
    stats = []
    for p in OUTPUT_DIR.glob("cleaned_*.csv"):
        table_name = p.stem.replace("cleaned_", "")
        df = pd.read_csv(p)
        total = len(df)
        outlier_count = 0
        if "outlier_flag" in df.columns:
            outlier_count = df["outlier_flag"].sum()
        stats.append({
            "table": table_name,
            "rows": total,
            "outlier_count": int(outlier_count),
            "outlier_rate": round(outlier_count / total * 100, 2) if total > 0 else 0,
        })
    return {"tables": stats}
