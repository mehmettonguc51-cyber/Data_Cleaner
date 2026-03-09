import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Data Cleaning Pipeline Dashboard",
  description: "BigQuery ve CSV ile veri temizleme",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
