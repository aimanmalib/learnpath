"use client";
import { ProgressChart } from "@/components/ProgressChart";
import { TokenUsageBar } from "@/components/TokenUsageBar";
import { useProgressStore } from "@/store/progress-store";
import { DAILY_ESTIMATES } from "@/lib/token-tracker";

export default function ProgressPage() {
  const store = useProgressStore();
  const topicProgress = store.getTopicProgress();
  const weeklyStats = store.getWeeklyStats();

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 Progress Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{store.sessions.length}</p>
          <p className="text-sm text-gray-500">Total Sessions</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-500">
            {Math.round(store.totalStudyTime / 60000)}m
          </p>
          <p className="text-sm text-gray-500">Study Time</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-purple-500">
            {(store.totalTokens / 1000).toFixed(1)}K
          </p>
          <p className="text-sm text-gray-500">Tokens Used</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProgressChart
          data={weeklyStats.map((s) => ({ label: s.day, value: s.sessions }))}
          title="Weekly Activity"
        />

        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Token Usage</h3>
          <div className="space-y-2">
            {Object.entries(DAILY_ESTIMATES).map(([feature, daily]) => (
              <TokenUsageBar
                key={feature}
                feature={feature}
                current={store.totalTokens}
                daily={daily}
              />
            ))}
          </div>
        </div>
      </div>

      {Object.keys(topicProgress).length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Topic Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(topicProgress).map(([topic, data]) => (
              <div key={topic} className="bg-white rounded-xl shadow p-4">
                <h3 className="font-medium">{topic}</h3>
                <p className="text-sm text-gray-500">
                  {data.sessions} sessions • Avg: {data.avgScore}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
