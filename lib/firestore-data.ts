import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import type { Attempt, Course, Quiz } from "@/types";

function millis(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof (value as { toMillis?: () => number }).toMillis === "function") return (value as { toMillis: () => number }).toMillis();
  return 0;
}
export function courseFromDoc(snapshot: QueryDocumentSnapshot<DocumentData>): Course { return { id: snapshot.id, ...(snapshot.data() as Omit<Course, "id">) }; }
export function quizFromDoc(snapshot: QueryDocumentSnapshot<DocumentData>): Quiz { const data=snapshot.data(); return { ...data, id:snapshot.id, startWindow:millis(data.startWindow), endWindow:millis(data.endWindow) } as Quiz; }
export function attemptFromData(uid: string, quizId: string, data: DocumentData): Attempt { return { ...data, uid, quizId, startedAt:millis(data.startedAt), submittedAt:data.submittedAt?millis(data.submittedAt):null } as Attempt; }
