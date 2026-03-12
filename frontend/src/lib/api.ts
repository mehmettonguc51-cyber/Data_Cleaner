function getApiUrl(): string {
  let base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("apiUrl");
    if (stored && !stored.startsWith(window.location.origin)) base = stored;
  }
  base = base.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  return base || "http://localhost:8000";
}

/** Auth istekleri her zaman aynı host, port 8000'e gitsin (localStorage karışmasın). */
function getAuthApiUrl(): string {
  return getApiUrl();
}

const defaultFetchOptions: RequestInit = { credentials: "include" };

export type AuthUser = { id: number; username: string; created_at?: string };

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${getAuthApiUrl()}/auth/me`, defaultFetchOptions);
    if (res.status === 401) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function register(username: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${getAuthApiUrl()}/auth/register`, {
    ...defaultFetchOptions,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Kayıt başarısız");
  }
  return res.json();
}

export async function login(username: string, password: string): Promise<{ success: boolean; username: string }> {
  const res = await fetch(`${getAuthApiUrl()}/auth/login`, {
    ...defaultFetchOptions,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Giriş başarısız");
  }
  return res.json();
}

export async function logout(): Promise<void> {
  const res = await fetch(`${getAuthApiUrl()}/auth/logout`, {
    ...defaultFetchOptions,
    method: "POST",
  });
  if (!res.ok) throw new Error("Çıkış başarısız");
}

export async function getTables(): Promise<{ table_names: string[] }> {
  const res = await fetch(`${getApiUrl()}/api/tables`, defaultFetchOptions);
  if (!res.ok) throw new Error("Failed to fetch tables");
  return res.json();
}

export async function getReport(): Promise<{
  report: { table: string; rows_before: number | null; rows_after: number; duplicates_removed: number | null; status: string }[];
}> {
  const res = await fetch(`${getApiUrl()}/api/report`, defaultFetchOptions);
  if (!res.ok) throw new Error("Failed to fetch report");
  return res.json();
}

export async function getStats(): Promise<{
  tables: { table: string; rows: number; outlier_count: number; outlier_rate: number }[];
}> {
  const res = await fetch(`${getApiUrl()}/api/stats`, defaultFetchOptions);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function getPreview(tableName: string, limit = 100): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${getApiUrl()}/api/preview/${encodeURIComponent(tableName)}?limit=${limit}`, defaultFetchOptions);
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
    ...defaultFetchOptions,
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
    ...defaultFetchOptions,
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Pipeline failed");
  }
  return res.json();
}
