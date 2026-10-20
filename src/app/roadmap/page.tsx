"use client";
import { useState } from "react";
import { RoadmapNode, RoadmapStep } from "@/components/RoadmapNode";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorNotice } from "@/components/ErrorNotice";
import { ApiError, postJson } from "@/lib/api-client";
import { recordSession } from "@/lib/record-session";

export default function RoadmapPage() {
  const [topicInput, setTopicInput] = useState("");
  const [level, setLevel] = useState("beginner");
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleGenerate = async () => {
    const topic = topicInput.trim();
    if (!topic || isLoading) return;
    setIsLoading(true);
    setError(null);
    const started = Date.now();
    try {
      const data = await postJson<{ roadmap: { title: string; steps: RoadmapStep[] }; tokens_used?: number }>(
        "/api/roadmap",
        { topic, level },
      );
      setTitle(data.roadmap.title || topic);
      setSteps(data.roadmap.steps.map((s, i) => ({ ...s, status: i === 0 ? "current" : "upcoming" })));
      recordSession({ feature: "roadmap", topic, duration: Date.now() - started, tokensUsed: data.tokens_used || 0 });
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError("unknown", "Something went wrong. Please try again.", 0));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[70vh] px-4 py-6 sm:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🗺️ Learning Roadmap</h1>

      {steps.length === 0 && !isLoading && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Topic to learn..."
              className="w-full px-4 py-2 border rounded-lg mb-3 text-base"
            />
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4 bg-white text-base"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <button onClick={handleGenerate} className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600">
              Generate Roadmap
            </button>
          </div>
          <ErrorNotice error={error} />
        </>
      )}

      {isLoading && <LoadingSpinner size="lg" label="Building your roadmap..." />}

      {steps.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-6">{title}</h2>
          {steps.map((step, i) => (
            <RoadmapNode key={step.id} step={step} index={i} isLast={i === steps.length - 1} />
          ))}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setSteps([]);
                setTopicInput("");
              }}
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              New roadmap
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
