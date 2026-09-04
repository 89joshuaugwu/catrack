"use client";

import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
}

// The one deliberate visual signature in this app: an OMR-style answer
// sheet, the actual format Nigerian students already read exam questions
// in (WAEC/JAMB bubble sheets) — not a generic radio-card list.
export default function QuestionCard({
  question,
  index,
  total,
  selectedOptionId,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 w-12 text-right">
        <span className="font-tnum text-4xl font-semibold text-text-secondary/40 leading-none">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex-1 min-w-0 pb-8 border-l border-hairline pl-5">
        <p className="text-xs text-text-secondary mb-2">of {total} questions</p>
        <h3 className="text-lg leading-snug mb-5">{question.text}</h3>

        <div role="radiogroup" aria-label={question.text} className="grid gap-3">
          {question.options.map((option, oi) => {
            const checked = selectedOptionId === option.id;
            const letter = String.fromCharCode(65 + oi);
            return (
              <label
                key={option.id}
                className="flex items-center gap-4 cursor-pointer group"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={checked}
                  onChange={() => onSelect(option.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`shrink-0 w-11 h-11 rounded-full border-2 grid place-items-center font-tnum font-semibold transition-colors ${
                    checked
                      ? "bg-primary border-primary text-white"
                      : "border-hairline text-text-secondary group-hover:border-primary"
                  }`}
                >
                  {letter}
                </span>
                <span className={checked ? "font-medium" : ""}>{option.text}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
