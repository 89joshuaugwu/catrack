export type Role = "admin" | "lecturer" | "student";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  lecturerId: string;
  caCeiling: number;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctOptionId: string;
}

export type QuizStatus = "draft" | "published" | "closed";

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  createdBy: string;
  questions: Question[];
  maxScore: number;
  weight: number;
  durationMinutes: number;
  startWindow: number; // epoch millis
  endWindow: number; // epoch millis
  status: QuizStatus;
}

export interface Answer {
  questionId: string;
  selectedOptionId: string;
}

export type AttemptStatus = "in_progress" | "submitted";

export interface Attempt {
  uid: string;
  quizId: string;
  startedAt: number;
  submittedAt: number | null;
  status: AttemptStatus;
  answers: Answer[];
  score: number;
  lateSubmission?: boolean;
}
