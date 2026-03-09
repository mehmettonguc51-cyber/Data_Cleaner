"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Stat = { table: string; rows: number; outlier_count: number; outlier_rate: number };

export function StatsCharts({ stats }: { stats: Stat[] }) {
  const rowData = stats.map((s) => ({ name: s.table, satırlar: s.rows }));
  const outlierData = stats.map((s) => ({ name: s.table, "Outlier %": s.outlier_rate }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-medium mb-4">Satır sayıları</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={rowData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="satırlar" fill="#3b82f6" name="Satır" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-medium mb-4">Outlier oranları (%)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={outlierData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Outlier %" fill="#f59e0b" name="Outlier %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
