import type { Answer, Question, Quiz } from "@/types";

export function millis(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value && typeof (value as { toMillis?: unknown }).toMillis === "function")
    return (value as { toMillis: () => number }).toMillis();
  throw new Error("Invalid assessment timestamp.");
}
export function gradeAnswers(answers: Answer[], questions: Question[]): number {
  const selected = new Map(answers.map(a => [a.questionId, a.selectedOptionId]));
  return questions.reduce((score, q) => score + (selected.get(q.id) === q.correctOptionId ? 1 : 0), 0);
}
export function validateAnswers(value: unknown, questions: Question[]): Answer[] {
  if (!Array.isArray(value) || value.length > questions.length) throw new Error("Invalid answers.");
  const seen = new Set<string>();
  return value.map(a => {
    const q = questions.find(q => q.id === a?.questionId);
    if (!q || seen.has(q.id) || !q.options.some(o => o.id === a.selectedOptionId))
      throw new Error("Answers contain a duplicate question or an invalid option.");
    seen.add(q.id);
    return { questionId: q.id, selectedOptionId: a.selectedOptionId };
  });
}
export function validateQuiz(value: Quiz) {
  if (!value || typeof value.title !== "string" || !value.title.trim() || value.title.length > 200 ||
      typeof value.courseId !== "string" || !value.courseId) throw new Error("Enter a title and course.");
  if (!Number.isInteger(value.durationMinutes) || value.durationMinutes < 1 || value.durationMinutes > 180)
    throw new Error("Duration must be between 1 and 180 minutes.");
  if (!Number.isFinite(value.weight) || value.weight <= 0) throw new Error("Enter a positive CA weight.");
  if (!Number.isFinite(value.startWindow) || !Number.isFinite(value.endWindow) ||
      value.endWindow - value.startWindow < value.durationMinutes * 60000)
    throw new Error("The quiz window must accommodate the full duration.");
  if (!Array.isArray(value.questions) || !value.questions.length || value.questions.length > 100)
    throw new Error("Add between 1 and 100 questions.");
  const ids = new Set<string>();
  for (const q of value.questions) {
    if (!q || typeof q.id !== "string" || !q.id || ids.has(q.id) || typeof q.text !== "string" || !q.text.trim() ||
        !Array.isArray(q.options) || q.options.length !== 4 ||
        q.options.some(o => typeof o.id !== "string" || !o.id || typeof o.text !== "string" || !o.text.trim()) ||
        new Set(q.options.map(o => o.id)).size !== 4 || !q.options.some(o => o.id === q.correctOptionId))
      throw new Error("Each question needs text, four unique options, and one correct answer.");
    ids.add(q.id);
  }
}
// Explicit projection: no answer keys or unknown document fields leave the server.
export function studentQuiz(quiz: Quiz): Quiz {
  return { id: quiz.id, courseId: quiz.courseId, title: quiz.title, createdBy: quiz.createdBy,
    maxScore: quiz.maxScore, weight: quiz.weight, durationMinutes: quiz.durationMinutes,
    startWindow: quiz.startWindow, endWindow: quiz.endWindow, status: quiz.status, allowReview: !!quiz.allowReview,
    questions: quiz.questions.map(q => ({ id: q.id, text: q.text, options: q.options.map(o => ({id:o.id,text:o.text})) })) } as Quiz;
}
