"use client";
import Link from "next/link";

const features = [
  { href: "/quiz", icon: "📝", title: "Adaptive Quiz", desc: "AI-generated quizzes that adapt to your level" },
  { href: "/flashcards", icon: "🃏", title: "Flashcards", desc: "Spaced repetition for long-term retention" },
  { href: "/roadmap", icon: "🗺️", title: "Learning Roadmap", desc: "Personalized learning paths" },
  { href: "/progress", icon: "📊", title: "Progress Tracker", desc: "Visualize your learning journey" },
  { href: "/concepts", icon: "🧠", title: "Concept Map", desc: "Explore knowledge connections" },
];

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">🎓 LearnPath</h1>
        <p className="text-lg text-gray-600">Adaptive Learning Platform powered by Xiaomi MiMo V2.5 Pro</p>
        <p className="text-sm text-gray-400 mt-1">AI-driven quizzes, flashcards, and personalized roadmaps</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <Link key={f.href} href={f.href}>
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer">
              <span className="text-3xl">{f.icon}</span>
              <h2 className="text-lg font-semibold mt-3">{f.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-gray-400">
        <p>Powered by Xiaomi MiMo V2.5 Pro • API: token-plan-sgp.xiaomimimo.com/v1</p>
      </div>
    </main>
  );
}
