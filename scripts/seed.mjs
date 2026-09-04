/*
 * CATrack Firebase development seed.
 * Uses the FIREBASE_ADMIN_* credentials from .env.local (see docs/CONTEXT.md).
 * Safe to re-run: it upserts documents and reuses existing Auth users.
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "node:fs";

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}
loadLocalEnv();

const password = process.env.SEED_PASSWORD ?? "CATrack-demo-2026!";
const app = getApps()[0] ?? initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}) });
const auth = getAuth(app);
const db = getFirestore(app);

const users = [
  { key: "admin", email: "admin@catrack.test", displayName: "Registry Admin", role: "admin" },
  { key: "lecturer", email: "uzo.eze@catrack.test", displayName: "Dr. Uzo Eze", role: "lecturer" },
  { key: "ada", email: "ada.obi@catrack.test", displayName: "Ada Obi", role: "student" },
  { key: "chike", email: "chike.nwosu@catrack.test", displayName: "Chike Nwosu", role: "student" },
];

async function ensureUser(user) {
  let record;
  try { record = await auth.getUserByEmail(user.email); }
  catch { record = await auth.createUser({ email: user.email, password, displayName: user.displayName, emailVerified: true }); }
  await db.collection("users").doc(record.uid).set({ uid: record.uid, email: user.email, displayName: user.displayName, role: user.role }, { merge: true });
  return record.uid;
}

const hour = 60 * 60 * 1000;
async function seed() {
  const ids = Object.fromEntries(await Promise.all(users.map(async (user) => [user.key, await ensureUser(user)])));
  const now = Date.now();
  const courses = [
    { id: "csc301", name: "Data Structures & Algorithms", code: "CSC301", lecturerId: ids.lecturer, caCeiling: 30 },
    { id: "csc305", name: "Operating Systems", code: "CSC305", lecturerId: ids.lecturer, caCeiling: 30 },
  ];
  await Promise.all(courses.map((course) => db.collection("courses").doc(course.id).set(course)));
  const quizzes = [
    { id: "arrays-linked-lists", courseId: "csc301", title: "Arrays & Linked Lists", createdBy: ids.lecturer, maxScore: 5, weight: 10, durationMinutes: 15, startWindow: now - 2 * hour, endWindow: now + 48 * hour, status: "published", questions: [
      { id: "q1", text: "What is the time complexity of accessing an element in an array by index?", options: [{ id: "a", text: "O(1)" }, { id: "b", text: "O(n)" }, { id: "c", text: "O(log n)" }, { id: "d", text: "O(n²)" }], correctOptionId: "a" },
      { id: "q2", text: "Inserting at the head of a singly linked list is:", options: [{ id: "a", text: "O(n)" }, { id: "b", text: "O(1)" }, { id: "c", text: "O(log n)" }, { id: "d", text: "Impossible" }], correctOptionId: "b" },
    ] },
    { id: "trees-graphs", courseId: "csc301", title: "Trees & Graphs", createdBy: ids.lecturer, maxScore: 4, weight: 15, durationMinutes: 20, startWindow: now + 24 * hour, endWindow: now + 72 * hour, status: "published", questions: [
      { id: "q1", text: "A binary search tree’s in-order traversal visits nodes:", options: [{ id: "a", text: "In sorted order" }, { id: "b", text: "In random order" }, { id: "c", text: "Root first always" }, { id: "d", text: "Leaves first" }], correctOptionId: "a" },
    ] },
  ];
  await Promise.all(quizzes.map((quiz) => db.collection("quizzes").doc(quiz.id).set(quiz)));
  const attempts = [
    { uid: ids.ada, score: 2, lateSubmission: false }, { uid: ids.chike, score: 1, lateSubmission: true },
  ];
  await Promise.all(attempts.map(({ uid, score, lateSubmission }) => db.collection("quizzes").doc("arrays-linked-lists").collection("attempts").doc(uid).set({ startedAt: Timestamp.fromMillis(now - 3 * hour), submittedAt: Timestamp.fromMillis(now - 170 * 60 * 1000), status: "submitted", answers: [], score, lateSubmission })));
  console.log("CATrack seed complete. Test password:", password);
  console.table(users.map(({ role, email, displayName }) => ({ role, email, displayName })));
}
seed().catch((error) => { console.error("Seeding failed:", error); process.exitCode = 1; });
