"use client";

interface Concept {
  id: string;
  label: string;
  connections: string[];
  mastery: number; // 0-100
}

interface ConceptMapProps {
  concepts: Concept[];
  title?: string;
}

export function ConceptMap({ concepts, title = "Concept Map" }: ConceptMapProps) {
  const getMasteryColor = (mastery: number): string => {
    if (mastery >= 80) return "bg-green-100 border-green-400 text-green-800";
    if (mastery >= 50) return "bg-yellow-100 border-yellow-400 text-yellow-800";
    return "bg-red-100 border-red-400 text-red-800";
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {concepts.map((concept) => (
          <div
            key={concept.id}
            className={`px-3 py-2 rounded-lg border text-sm ${getMasteryColor(concept.mastery)}`}
          >
            <span className="font-medium">{concept.label}</span>
            <span className="ml-2 text-xs opacity-70">{concept.mastery}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
