"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(
    typeof window !== "undefined" ? localStorage.getItem("apiUrl") || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000" : "http://localhost:8000"
  );

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("apiUrl", apiUrl);
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ayarlar</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">API URL (Backend)</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2"
            placeholder="http://localhost:8000"
          />
          <p className="text-sm text-slate-500 mt-1">
            Backend FastAPI adresi. Deploy sonrası Cloud Run/Railway URL&apos;ini girin.
          </p>
        </div>
        <div className="text-sm text-slate-600">
          <p><strong>BigQuery ayarları</strong> (PROJECT_ID, DATASET_ID) backend&apos;de env değişkenleri ile yapılandırılır.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Kaydet
        </button>
      </div>
      <a href="/" className="block mt-6 text-blue-600 hover:underline">← Dashboard&apos;a dön</a>
    </div>
  );
}
