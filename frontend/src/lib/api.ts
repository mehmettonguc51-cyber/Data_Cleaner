function getApiUrl(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("apiUrl");
    if (stored) return stored;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

export async function getTables(): Promise<{ table_names: string[] }> {
  const res = await fetch(`${getApiUrl()}/api/tables`);
  if (!res.ok) throw new Error("Failed to fetch tables");
  return res.json();
}

export async function getReport(): Promise<{
  report: { table: string; rows_before: number | null; rows_after: number; duplicates_removed: number | null; status: string }[];
}> {
  const res = await fetch(`${getApiUrl()}/api/report`);
  if (!res.ok) throw new Error("Failed to fetch report");
  return res.json();
}

export async function getStats(): Promise<{
  tables: { table: string; rows: number; outlier_count: number; outlier_rate: number }[];
}> {
  const res = await fetch(`${getApiUrl()}/api/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function getPreview(tableName: string, limit = 100): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${getApiUrl()}/api/preview/${encodeURIComponent(tableName)}?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch preview");
  return res.json();
}

export function getDownloadUrl(tableName: string): string {
  return `${getApiUrl()}/api/download/${encodeURIComponent(tableName)}`;
}

export async function uploadFiles(files: File[]): Promise<{ table_names: string[] }> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  const res = await fetch(`${getApiUrl()}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function runPipeline(source: "bigquery" | "upload", tableNames?: string[]): Promise<{
  report: { table: string; rows_before: number; rows_after: number; duplicates_removed: number; status: string }[];
}> {
  const formData = new FormData();
  formData.append("source", source);
  if (tableNames?.length) formData.append("table_names", tableNames.join(","));
  const res = await fetch(`${getApiUrl()}/api/run`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Pipeline failed");
  }
  return res.json();
}
