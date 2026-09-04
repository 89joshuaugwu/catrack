"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { Question, QuestionOption } from "@/types";

function newQuestion(): Question {
  const qid = crypto.randomUUID();
  const opts: QuestionOption[] = ["A", "B", "C", "D"].map(() => ({
    id: crypto.randomUUID(),
    text: "",
  }));
  return { id: qid, text: "", options: opts, correctOptionId: opts[0].id };
}

interface QuizBuilderProps {
  courses: { id: string; name: string; code: string }[];
  onPublish: (payload: {
    title: string;
    courseId: string;
    questions: Question[];
    maxScore: number;
    weight: number;
    durationMinutes: number;
    startWindow: number;
    endWindow: number;
  }) => Promise<void> | void;
}

export default function QuizBuilder({ courses, onPublish }: QuizBuilderProps) {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [questions, setQuestions] = useState<Question[]>([newQuestion()]);
  const [weight, setWeight] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [startWindow, setStartWindow] = useState("");
  const [endWindow, setEndWindow] = useState("");
  const [publishing, setPublishing] = useState(false);

  function updateQuestion(id: string, patch: Partial<Question>) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function updateOption(qId: string, optId: string, text: string) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o) => (o.id === optId ? { ...o, text } : o)) }
          : q
      )
    );
  }

  async function handlePublish() {
    if (!title || !courseId || !startWindow || !endWindow) {
      toast.error("Fill in title, course, and the quiz window.");
      return;
    }
    setPublishing(true);
    try {
      await onPublish({
        title,
        courseId,
        questions,
        maxScore: questions.length,
        weight,
        durationMinutes,
        startWindow: new Date(startWindow).getTime(),
        endWindow: new Date(endWindow).getTime(),
      });
      toast.success("Quiz published.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not publish quiz.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="grid gap-1 text-sm">
            Quiz title
            <input
              className="min-h-12 px-3 rounded-lg border border-border"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mid-semester test 1"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Course
            <select
              className="min-h-12 px-3 rounded-lg border border-border"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <label className="grid gap-1 text-sm">
            Weight toward CA
            <input
              type="number"
              min={1}
              className="min-h-12 px-3 rounded-lg border border-border"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Duration (minutes)
            <input
              type="number"
              min={1}
              className="min-h-12 px-3 rounded-lg border border-border"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="grid gap-1 text-sm">
            Opens
            <input
              type="datetime-local"
              className="min-h-12 px-3 rounded-lg border border-border"
              value={startWindow}
              onChange={(e) => setStartWindow(e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Closes
            <input
              type="datetime-local"
              className="min-h-12 px-3 rounded-lg border border-border"
              value={endWindow}
              onChange={(e) => setEndWindow(e.target.value)}
            />
          </label>
        </div>
      </Card>

      {questions.map((q, qi) => (
        <Card key={q.id} className="grid gap-3">
          <div className="flex items-center justify-between">
            <p className="font-medium">Question {qi + 1}</p>
            {questions.length > 1 && (
              <button
                className="text-sm text-error"
                onClick={() => setQuestions((qs) => qs.filter((x) => x.id !== q.id))}
              >
                Remove
              </button>
            )}
          </div>
          <input
            className="min-h-12 px-3 rounded-lg border border-border"
            placeholder="Question text"
            value={q.text}
            onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            {q.options.map((o, oi) => (
              <label
                key={o.id}
                className={`flex items-center gap-2 px-3 rounded-lg border ${
                  q.correctOptionId === o.id ? "border-accent bg-accent/10" : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={q.correctOptionId === o.id}
                  onChange={() => updateQuestion(q.id, { correctOptionId: o.id })}
                />
                <input
                  className="min-h-12 flex-1 bg-transparent outline-none"
                  placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                  value={o.text}
                  onChange={(e) => updateOption(q.id, o.id, e.target.value)}
                />
              </label>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={() => setQuestions((qs) => [...qs, newQuestion()])}>
          + Add question
        </Button>
        <Button onClick={handlePublish} disabled={publishing}>
          {publishing ? "Publishing…" : "Publish quiz"}
        </Button>
      </div>
    </div>
  );
}
