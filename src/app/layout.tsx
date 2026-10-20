import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnPath — Adaptive Learning",
  description: "AI-generated quizzes, flashcards and learning roadmaps with any OpenAI-compatible LLM. Bring your own API key.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AppHeader />
        {children}
        <footer className="mx-auto max-w-4xl px-4 pb-8 pt-4 text-center text-xs text-gray-400 sm:px-8">
          <a href="https://github.com/aimanmalib/learnpath" className="underline hover:text-gray-600">
            Source on GitHub
          </a>
          {" · "}Built by{" "}
          <a href="https://sasateguh.com" className="underline hover:text-gray-600">
            Sasa Teguh
          </a>
        </footer>
      </body>
    </html>
  );
}
