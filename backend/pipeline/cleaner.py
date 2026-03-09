"""Data cleaning pipeline - extracted from data_cleaning_pipeline.ipynb"""
import re
import pandas as pd
import numpy as np


def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Sütun isimlerini standartlaştır: lowercase, boşluk -> _, özel karakter temizle"""
    new_columns = {}
    seen = {}
    for col in df.columns:
        new_name = str(col).lower().strip()
        new_name = re.sub(r'\s+', '_', new_name)
        new_name = re.sub(r'[^a-z0-9_]', '', new_name)
        if not new_name:
            new_name = f"col_{list(df.columns).index(col)}"
        if new_name in seen:
            seen[new_name] += 1
            new_name = f"{new_name}_{seen[new_name]}"
        else:
            seen[new_name] = 0
        new_columns[col] = new_name
    return df.rename(columns=new_columns)


def trim_whitespace(df: pd.DataFrame) -> pd.DataFrame:
    """Object/string sütunlarda baştaki ve sondaki boşlukları temizle"""
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].apply(lambda x: x.strip() if isinstance(x, str) else x)
    return df


def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """Tekrarlayan satırları kaldır"""
    return df.drop_duplicates()


def fix_dtypes(df: pd.DataFrame) -> pd.DataFrame:
    """Veri tiplerini düzelt: dbdate -> datetime64, sayısal sütunlar"""
    for col in df.columns:
        dtype_str = str(df[col].dtype)
        if 'dbdate' in dtype_str or 'date' in dtype_str.lower():
            df[col] = pd.to_datetime(df[col], errors='coerce')
        elif df[col].dtype == 'object':
            try:
                numeric = pd.to_numeric(df[col], errors='coerce')
                if numeric.notna().sum() > len(df) * 0.5:
                    df[col] = numeric
            except Exception:
                pass
    return df


def handle_missing(df: pd.DataFrame) -> pd.DataFrame:
    """Eksik değerleri işle: %50+ eksik sütun drop, sayısal median, kategorik mode, boolean mode"""
    threshold = 0.5
    cols_to_drop = [col for col in df.columns if df[col].isna().mean() >= threshold]
    df = df.drop(columns=cols_to_drop, errors='ignore')
    for col in df.columns:
        if df[col].isna().any():
            if pd.api.types.is_bool_dtype(df[col]):
                mode_val = df[col].mode()
                df[col] = df[col].fillna(mode_val[0] if len(mode_val) > 0 else False)
            elif pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].median())
            else:
                mode_val = df[col].mode()
                df[col] = df[col].fillna(mode_val[0] if len(mode_val) > 0 else 'Unknown')
    return df


def flag_outliers(df: pd.DataFrame) -> pd.DataFrame:
    """IQR yöntemi ile aykırı değerleri tespit et, outlier_flag sütunu ekle"""
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if not numeric_cols:
        df['outlier_flag'] = False
        return df
    outlier_mask = pd.Series([False] * len(df), index=df.index)
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        if IQR == 0:
            continue
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        outlier_mask |= (df[col] < lower) | (df[col] > upper)
    df['outlier_flag'] = outlier_mask
    return df


def clean_table(df: pd.DataFrame, table_name: str) -> pd.DataFrame:
    """Tüm cleaning adımlarını sırayla uygula"""
    df = df.copy()
    df = standardize_columns(df)
    df = trim_whitespace(df)
    df = remove_duplicates(df)
    df = fix_dtypes(df)
    df = handle_missing(df)
    df = flag_outliers(df)
    return df
