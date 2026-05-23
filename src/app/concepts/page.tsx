"use client";
import { ConceptMap } from "@/components/ConceptMap";

const sampleConcepts = [
  { id: "1", label: "Variables", connections: ["2", "3"], mastery: 90 },
  { id: "2", label: "Functions", connections: ["1", "4"], mastery: 75 },
  { id: "3", label: "Data Types", connections: ["1", "5"], mastery: 85 },
  { id: "4", label: "Control Flow", connections: ["2", "6"], mastery: 60 },
  { id: "5", label: "Collections", connections: ["3", "6"], mastery: 45 },
  { id: "6", label: "OOP", connections: ["4", "5"], mastery: 30 },
];

export default function ConceptsPage() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧠 Concept Map</h1>
      <ConceptMap concepts={sampleConcepts} title="Programming Fundamentals" />
      <p className="text-sm text-gray-400 mt-4 text-center">
        Concepts auto-generated from your study sessions using MiMo
      </p>
    </main>
  );
}
