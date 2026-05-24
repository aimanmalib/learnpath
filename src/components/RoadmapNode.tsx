"use client";
import { clsx } from "clsx";

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  estimatedTime?: string;
  topics?: string[];
}

interface RoadmapNodeProps {
  step: RoadmapStep;
  index: number;
  isLast: boolean;
}

export function RoadmapNode({ step, index, isLast }: RoadmapNodeProps) {
  const statusColors = {
    completed: "bg-green-500 border-green-500",
    current: "bg-blue-500 border-blue-500",
    upcoming: "bg-gray-200 border-gray-300",
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2",
            statusColors[step.status],
          )}
        >
          {step.status === "completed" ? "✓" : index + 1}
        </div>
        {!isLast && (
          <div
            className={clsx(
              "w-0.5 flex-1 min-h-[40px]",
              step.status === "completed" ? "bg-green-300" : "bg-gray-200",
            )}
          />
        )}
      </div>

      <div className="pb-8">
        <h3
          className={clsx(
            "font-semibold",
            step.status === "current" ? "text-blue-600" : "text-gray-900",
          )}
        >
          {step.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
        {step.estimatedTime && (
          <span className="text-xs text-gray-400 mt-1 block">
            ⏱ {step.estimatedTime}
          </span>
        )}
        {step.topics && step.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {step.topics.map((t) => (
              <span key={t} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
