import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FootyScores – Paris 2024 Olympic Football API Reference",
  description:
    "Generate and review expected API endpoints for every football match played during the Paris 2024 Olympic Games.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
