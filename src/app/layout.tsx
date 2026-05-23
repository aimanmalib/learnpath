import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnPath — Adaptive Learning Platform",
  description: "AI-powered adaptive learning with MiMo V2.5 Pro",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
