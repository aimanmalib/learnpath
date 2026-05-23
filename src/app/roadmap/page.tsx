"use client";
import { useState } from "react";
import { RoadmapNode, RoadmapStep } from "@/components/RoadmapNode";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function RoadmapPage() {
  const [topicInput, setTopicInput] = useState("");
  const [level, setLevel] = useState("beginner");
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topicInput.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicInput, level }),
      });
      const data = await res.json();
      if (data.roadmap?.steps) {
        setTitle(data.roadmap.title || topicInput);
        setSteps(data.roadmap.steps.map((s: RoadmapStep, i: number) => ({
          ...s,
          status: i === 0 ? "current" : "upcoming",
        })));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🗺️ Learning Roadmap</h1>

      {steps.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl shadow p-6 max-w-md mx-auto">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Topic to learn..."
            className="w-full px-4 py-2 border rounded-lg mb-3"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button onClick={handleGenerate} className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600">
            Generate Roadmap
          </button>
        </div>
      )}

      {isLoading && <LoadingSpinner size="lg" label="Building your roadmap..." />}

      {steps.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-6">{title}</h2>
          {steps.map((step, i) => (
            <RoadmapNode key={step.id} step={step} index={i} isLast={i === steps.length - 1} />
          ))}
        </div>
      )}
    </main>
  );
}
