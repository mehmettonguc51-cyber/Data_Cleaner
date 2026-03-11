"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatsCharts } from "@/components/StatsCharts";
import {
  getCurrentUser,
  getDownloadUrl,
  getPreview,
  getReport,
  getStats,
  getTables,
  logout,
  runPipeline,
  uploadFiles,
} from "@/lib/api";

type Source = "bigquery" | "upload";

export default function Dashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [source, setSource] = useState<Source>("bigquery");
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [report, setReport] = useState<{ table: string; rows_before: number | null; rows_after: number; duplicates_removed: number | null; status: string }[]>([]);
  const [stats, setStats] = useState<{ table: string; rows: number; outlier_count: number; outlier_rate: number }[]>([]);
  const [previewTable, setPreviewTable] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedTableNames, setUploadedTableNames] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [tRes, rRes, sRes] = await Promise.all([getTables(), getReport(), getStats()]);
      setTables(tRes.table_names);
      setReport(rRes.report);
      setStats(sRes.tables);
    } catch (e) {
      const msg = String(e);
      if (msg.includes("Not authenticated") || msg.includes("expired") || msg.includes("Invalid")) {
        router.push("/login");
        return;
      }
      setError(
        msg.includes("Failed to fetch")
          ? "Backend'e bağlanılamadı. Backend çalışıyor mu? (cd backend && uvicorn main:app --reload --port 8000)"
          : msg
      );
    }
  }, [router]);

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (!user) {
          router.push("/login");
          return;
        }
        setAuthChecked(true);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    refresh();
  }, [authChecked, refresh]);

  useEffect(() => {
    if (previewTable) {
      getPreview(previewTable)
        .then(setPreviewData)
        .catch(() => setPreviewData([]));
    } else {
      setPreviewData([]);
    }
  }, [previewTable]);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const tableNames = source === "upload" ? uploadedTableNames : Array.from(selectedTables);
      if (source === "bigquery" && tableNames.length === 0) {
        const { report: r } = await runPipeline("bigquery");
        setReport(r);
      } else {
        const { report: r } = await runPipeline(source, tableNames.length ? tableNames : undefined);
        setReport(r);
      }
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFiles.length) return;
    setLoading(true);
    setError(null);
    try {
      const { table_names } = await uploadFiles(uploadedFiles);
      setUploadedTableNames(table_names);
      setSelectedTables(new Set(table_names));
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const toggleTable = (t: string) => {
    setSelectedTables((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Data Cleaning Pipeline Dashboard</h1>
        <div className="flex gap-4">
          <a href="/settings" className="text-blue-600 hover:underline">Ayarlar</a>
          <button
            type="button"
            onClick={handleLogout}
            className="text-slate-600 hover:text-slate-800 underline"
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Veri kaynağı */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setSource("bigquery")}
          className={`px-4 py-2 rounded ${source === "bigquery" ? "bg-blue-600 text-white" : "bg-slate-200"}`}
        >
          BigQuery
        </button>
        <button
          onClick={() => setSource("upload")}
          className={`px-4 py-2 rounded ${source === "upload" ? "bg-blue-600 text-white" : "bg-slate-200"}`}
        >
          CSV Upload
        </button>
      </div>

      {source === "bigquery" && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Tabloları seçin</h2>
          <div className="flex flex-wrap gap-2">
            {tables.map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTables.has(t)}
                  onChange={() => toggleTable(t)}
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-1">Boş bırakırsanız tüm tablolar işlenir.</p>
        </div>
      )}

      {source === "upload" && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">CSV dosyaları yükleyin</h2>
          <input
            type="file"
            accept=".csv"
            multiple
            onChange={(e) => setUploadedFiles(Array.from(e.target.files || []))}
            className="block mb-2"
          />
          <button
            onClick={handleUpload}
            disabled={!uploadedFiles.length || loading}
            className="px-4 py-2 bg-slate-600 text-white rounded disabled:opacity-50"
          >
            Yükle
          </button>
          {uploadedTableNames.length > 0 && (
            <p className="mt-2 text-sm">Yüklenen: {uploadedTableNames.join(", ")}</p>
          )}
        </div>
      )}

      <button
        onClick={handleRun}
        disabled={loading || (source === "upload" && !uploadedTableNames.length)}
        className="px-6 py-3 bg-green-600 text-white rounded font-medium disabled:opacity-50 mb-6"
      >
        {loading ? "Çalışıyor..." : "Pipeline Çalıştır"}
      </button>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      {/* Rapor */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Rapor</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-200">
                <th className="border border-slate-300 p-2 text-left">Tablo</th>
                <th className="border border-slate-300 p-2 text-right">Önce</th>
                <th className="border border-slate-300 p-2 text-right">Sonra</th>
                <th className="border border-slate-300 p-2 text-right">Tekrar Kaldırıldı</th>
                <th className="border border-slate-300 p-2 text-left">Durum</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r) => (
                <tr key={r.table}>
                  <td className="border border-slate-300 p-2">{r.table}</td>
                  <td className="border border-slate-300 p-2 text-right">{r.rows_before ?? "-"}</td>
                  <td className="border border-slate-300 p-2 text-right">{r.rows_after ?? "-"}</td>
                  <td className="border border-slate-300 p-2 text-right">{r.duplicates_removed ?? "-"}</td>
                  <td className="border border-slate-300 p-2">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grafikler */}
      {stats.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">İstatistikler</h2>
          <StatsCharts stats={stats} />
        </div>
      )}

      {/* Tablo önizleme ve indirme */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Tablo önizleme ve indirme</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {report.map((r) => (
            <div key={r.table} className="flex gap-2 items-center">
              <button
                onClick={() => setPreviewTable(previewTable === r.table ? null : r.table)}
                className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300"
              >
                Önizle: {r.table}
              </button>
              <a
                href={getDownloadUrl(r.table)}
                download
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                İndir
              </a>
            </div>
          ))}
        </div>
        {previewTable && previewData.length > 0 && (
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100">
                  {Object.keys(previewData[0]).map((k) => (
                    <th key={k} className="p-2 text-left border-b">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="p-2 border-b">
                        {String(v ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
