"use client";
import { useCallback, useState } from "react";
import { FlashCard } from "@/components/FlashCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorNotice } from "@/components/ErrorNotice";
import { useFlashcardStore, type Flashcard } from "@/store/flashcard-store";
import type { QualityRating } from "@/lib/spaced-repetition";
import { ApiError, postJson } from "@/lib/api-client";
import { recordSession } from "@/lib/record-session";

export default function FlashcardsPage() {
  const [topicInput, setTopicInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const store = useFlashcardStore();

  const handleGenerate = useCallback(async () => {
    const topic = topicInput.trim();
    if (!topic || isLoading) return;
    setIsLoading(true);
    setError(null);
    const started = Date.now();
    try {
      const data = await postJson<{ cards: Flashcard[]; tokens_used?: number }>("/api/flashcards", { topic, count: 10 });
      store.setCards(data.cards, topic);
      recordSession({ feature: "flashcards", topic, duration: Date.now() - started, tokensUsed: data.tokens_used || 0 });
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError("unknown", "Something went wrong. Please try again.", 0));
    } finally {
      setIsLoading(false);
    }
  }, [topicInput, isLoading, store]);

  const currentCard = store.cards[store.currentIndex];
  const progress = store.getProgress();

  const rateAndNext = (quality: QualityRating) => {
    store.rate(quality);
    store.next();
  };

  return (
    <main className="min-h-[70vh] px-4 py-6 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🃏 Flashcards</h1>

      {store.cards.length === 0 && !isLoading && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto">
            <h2 className="font-semibold mb-4">Choose a topic</h2>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g., Data Structures, Biology..."
              className="w-full px-4 py-2 border rounded-lg mb-4 text-base"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <button onClick={handleGenerate} className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600">
              Generate Flashcards
            </button>
          </div>
          <ErrorNotice error={error} />
        </>
      )}

      {isLoading && <LoadingSpinner size="lg" label="Generating flashcards..." />}

      {currentCard && (
        <div className="max-w-md mx-auto">
          <p className="text-sm text-gray-500 mb-4 text-center">
            {Math.min(progress.reviewed + 1, progress.total)} / {progress.total}
          </p>
          <FlashCard
            front={currentCard.front}
            back={currentCard.back}
            isFlipped={store.isFlipped}
            onFlip={store.flip}
            topic={currentCard.topic}
          />
          {store.isFlipped && (
            <div className="flex justify-center gap-2 mt-6">
              {([1, 3, 5] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => rateAndNext(q)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    q === 1 ? "bg-red-100 text-red-700" : q === 3 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                  }`}
                >
                  {q === 1 ? "Hard" : q === 3 ? "Good" : "Easy"}
                </button>
              ))}
            </div>
          )}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                store.setCards([], "");
                setTopicInput("");
              }}
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              New topic
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
