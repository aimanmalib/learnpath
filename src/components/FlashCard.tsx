"use client";
import { clsx } from "clsx";

interface FlashCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
  topic?: string;
}

export function FlashCard({ front, back, isFlipped, onFlip, topic }: FlashCardProps) {
  return (
    <div
      className="perspective-[1000px] cursor-pointer w-full max-w-md mx-auto"
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onFlip();
        }
      }}
    >
      <div
        className={clsx(
          "relative w-full min-h-[200px] transition-transform duration-500 transform-3d",
          isFlipped && "rotate-y-180",
        )}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          {topic && (
            <span className="absolute top-3 right-3 text-xs bg-gray-100 px-2 py-1 rounded-sm">
              {topic}
            </span>
          )}
          <p className="text-lg font-medium text-center">{front}</p>
          <p className="text-sm text-gray-400 mt-4">Tap to reveal</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-emerald-50 rounded-xl shadow-lg p-6 flex items-center justify-center">
          <p className="text-base text-center">{back}</p>
        </div>
      </div>
    </div>
  );
}
