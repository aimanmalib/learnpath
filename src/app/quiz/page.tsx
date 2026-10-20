"use client";
import { useEffect, useRef, useState } from "react";
import { QuizCard } from "@/components/QuizCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorNotice } from "@/components/ErrorNotice";
import { useQuizState } from "@/hooks/useQuizState";
import { recordSession } from "@/lib/record-session";

export default function QuizPage() {
  const [topicInput, setTopicInput] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const quiz = useQuizState();
  const recorded = useRef(false);

  const handleGenerate = async () => {
    if (!topicInput.trim() || quiz.isGenerating) return;
    recorded.current = false;
    setStartedAt(Date.now());
    await quiz.generateQuiz(topicInput.trim());
  };

  const score = quiz.getScore();

  useEffect(() => {
    if (quiz.isComplete && !recorded.current) {
      recorded.current = true;
      recordSession({
        feature: "quiz",
        topic: quiz.topic,
        score: score.percentage,
        duration: startedAt ? Date.now() - startedAt : 0,
        tokensUsed: quiz.tokensUsed,
      });
    }
  }, [quiz.isComplete, quiz.topic, quiz.tokensUsed, score.percentage, startedAt]);

  const currentQ = quiz.questions[quiz.currentQuestionIndex];

  return (
    <main className="min-h-[70vh] px-4 py-6 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📝 Adaptive Quiz</h1>

      {quiz.questions.length === 0 && !quiz.isGenerating && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto">
            <h2 className="font-semibold mb-4">Choose a topic</h2>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g., Machine Learning, React Hooks..."
              className="w-full px-4 py-2 border rounded-lg mb-4 text-base"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Generate Quiz
            </button>
          </div>
          <ErrorNotice error={quiz.generationError} />
        </>
      )}

      {quiz.isGenerating && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" label="Generating quiz..." />
        </div>
      )}

      {currentQ && !quiz.isComplete && (
        <QuizCard
          question={currentQ}
          questionNumber={quiz.currentQuestionIndex + 1}
          totalQuestions={quiz.questions.length}
          onAnswer={quiz.answerAndNext}
        />
      )}

      {quiz.isComplete && (
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">🎉 Quiz Complete!</h2>
          <p className="text-4xl font-bold text-blue-500 my-4">{score.percentage}%</p>
          <p className="text-gray-600">
            {score.correct} / {score.total} correct
          </p>
          <button
            onClick={() => {
              quiz.reset();
              setTopicInput("");
            }}
            className="mt-4 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Try Another Topic
          </button>
        </div>
      )}
    </main>
  );
}
