// Demo data so the UI is fully navigable out of the box.
// Swap these reads for live Firestore queries (see lib/firebase.ts) once
// you've created a Firebase project and pasted your config into .env.local.
import type { Attempt, Course, Quiz } from "@/types";

const now = Date.now();
const hour = 60 * 60 * 1000;

export const mockCourses: Course[] = [
  { id: "csc301", name: "Data Structures & Algorithms", code: "CSC301", lecturerId: "lec1", caCeiling: 30 },
  { id: "csc305", name: "Operating Systems", code: "CSC305", lecturerId: "lec1", caCeiling: 30 },
];

export const mockQuizzes: Quiz[] = [
  {
    id: "q1",
    courseId: "csc301",
    title: "Arrays & Linked Lists",
    createdBy: "lec1",
    maxScore: 5,
    weight: 10,
    durationMinutes: 15,
    startWindow: now - 2 * hour,
    endWindow: now + 48 * hour,
    status: "published",
    questions: [
      {
        id: "q1-1",
        text: "What is the time complexity of accessing an element in an array by index?",
        options: [
          { id: "a", text: "O(1)" },
          { id: "b", text: "O(n)" },
          { id: "c", text: "O(log n)" },
          { id: "d", text: "O(n^2)" },
        ],
        correctOptionId: "a",
      },
      {
        id: "q1-2",
        text: "Inserting at the head of a singly linked list is:",
        options: [
          { id: "a", text: "O(n)" },
          { id: "b", text: "O(1)" },
          { id: "c", text: "O(log n)" },
          { id: "d", text: "Impossible" },
        ],
        correctOptionId: "b",
      },
    ],
  },
  {
    id: "q2",
    courseId: "csc301",
    title: "Trees & Graphs",
    createdBy: "lec1",
    maxScore: 4,
    weight: 15,
    durationMinutes: 20,
    startWindow: now - 1 * hour,
    endWindow: now + 72 * hour,
    status: "published",
    questions: [
      {
        id: "q2-1",
        text: "A binary search tree's in-order traversal visits nodes:",
        options: [
          { id: "a", text: "In sorted order" },
          { id: "b", text: "In random order" },
          { id: "c", text: "Root first always" },
          { id: "d", text: "Leaves first" },
        ],
        correctOptionId: "a",
      },
    ],
  },
];

export const mockAttempts: (Attempt & { studentName: string; studentEmail: string })[] = [
  {
    uid: "stu1",
    studentName: "Ada Obi",
    studentEmail: "ada.obi@esut.edu.ng",
    quizId: "q1",
    startedAt: now - 3 * hour,
    submittedAt: now - 3 * hour + 10 * 60 * 1000,
    status: "submitted",
    answers: [
      { questionId: "q1-1", selectedOptionId: "a" },
      { questionId: "q1-2", selectedOptionId: "b" },
    ],
    score: 2,
    lateSubmission: false,
  },
  {
    uid: "stu2",
    studentName: "Chike Nwosu",
    studentEmail: "chike.nwosu@esut.edu.ng",
    quizId: "q1",
    startedAt: now - 4 * hour,
    submittedAt: now - 4 * hour + 16 * 60 * 1000,
    status: "submitted",
    answers: [
      { questionId: "q1-1", selectedOptionId: "a" },
      { questionId: "q1-2", selectedOptionId: "a" },
    ],
    score: 1,
    lateSubmission: true,
  },
];

export const demoUser = {
  student: { uid: "stu1", displayName: "Ada Obi", email: "ada.obi@esut.edu.ng", role: "student" as const },
  lecturer: { uid: "lec1", displayName: "Dr. Uzo Eze", email: "u.eze@esut.edu.ng", role: "lecturer" as const },
  admin: { uid: "admin1", displayName: "Registry Admin", email: "admin@esut.edu.ng", role: "admin" as const },
};
