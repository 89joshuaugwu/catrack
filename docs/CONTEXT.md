# CATrack — CONTEXT.md

Technical architecture reference. Pair with `DESIGN.md` when prompting Antigravity.

---

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) | |
| Language | TypeScript (strict mode) | |
| Styling | Tailwind CSS v4 | Royal Blue/Lime palette per DESIGN.md |
| Auth | Firebase Auth (email/password, admin/lecturer-provisioned) | No public signup, same closed pattern as your other institutional projects |
| Database | Firestore | Spark plan free tier |
| PDF export | jsPDF + jspdf-autotable | Score reports, gradesheets |
| Hosting | Vercel | Free tier |

No external APIs, no ML phase, no biometric calibration — this project is deliberately simple relative to your recent builds, matching your own "very implementable" scoping.

---

## 2. Server-Validated Timing (same principle as ExamGuard, applied at a lighter scale)

The client's countdown is a display only — a student could edit browser JavaScript to claim more time than they had. Enforcement happens server-side.

```typescript
async function startQuizAttempt(quizId: string, uid: string): Promise<{ startedAt: number; durationMinutes: number }> {
  const quiz = (await db.collection("quizzes").doc(quizId).get()).data()!;
  const now = Date.now();

  if (now < quiz.startWindow.toMillis() || now > quiz.endWindow.toMillis()) {
    throw new Error("This quiz is not currently available.");
  }

  const attemptRef = db.collection("quizzes").doc(quizId).collection("attempts").doc(uid);
  if ((await attemptRef.get()).exists) {
    throw new Error("You have already taken this quiz.");
  }

  await attemptRef.set({
    startedAt: Timestamp.fromMillis(now),
    submittedAt: null,
    status: "in_progress",
    answers: [],
  });

  return { startedAt: now, durationMinutes: quiz.durationMinutes };
}

async function submitQuizAttempt(quizId: string, uid: string, answers: Answer[]): Promise<{ score: number }> {
  const attemptRef = db.collection("quizzes").doc(quizId).collection("attempts").doc(uid);
  const attempt = (await attemptRef.get()).data()!;
  const quiz = (await db.collection("quizzes").doc(quizId).get()).data()!;

  const elapsedMinutes = (Date.now() - attempt.startedAt.toMillis()) / 60000;
  if (elapsedMinutes > quiz.durationMinutes + 0.5) {
    await attemptRef.update({ lateSubmission: true });
  }

  const score = gradeQuiz(answers, quiz.questions);

  await attemptRef.update({
    answers, submittedAt: Timestamp.now(), status: "submitted", score,
  });

  return { score };
}

function gradeQuiz(answers: Answer[], questions: Question[]): number {
  return answers.reduce((score, answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    return question && answer.selectedOptionId === question.correctOptionId
      ? score + 1
      : score;
  }, 0);
}
```

---

## 3. Weighted CA Aggregation

```typescript
interface Quiz {
  id: string;
  courseId: string;
  maxScore: number;
  weight: number;
}

interface Attempt {
  quizId: string;
  score: number;
}

function computeCAScore(
  attempts: Attempt[],
  quizzes: Quiz[],
  caCeiling: number
): number {
  const total = attempts.reduce((sum, attempt) => {
    const quiz = quizzes.find((q) => q.id === attempt.quizId);
    if (!quiz) return sum;
    const normalized = (attempt.score / quiz.maxScore) * quiz.weight;
    return sum + normalized;
  }, 0);

  return Math.min(total, caCeiling);
}
```

**Why normalize per-quiz before summing:** a 5-question quiz and a 20-question quiz shouldn't contribute equally per raw point — normalizing each quiz's score to its assigned weight before summing means a lecturer can genuinely control how much each quiz counts toward the final CA total, regardless of how many questions it happens to contain. This is the actual point of the weight field, not decoration.

---

## 4. Firestore Data Model

```
/courses/{courseId}
  name, code, lecturerId, caCeiling: number

/quizzes/{quizId}
  courseId, title, createdBy
  questions: [{ id, text, options: [{id,text}], correctOptionId }]
  maxScore, weight
  durationMinutes, startWindow, endWindow
  status: "draft" | "published" | "closed"

/quizzes/{quizId}/attempts/{uid}
  startedAt, submittedAt, status: "in_progress"|"submitted"
  answers: [{questionId, selectedOptionId}]
  score: number
  lateSubmission: boolean

/users/{uid}
  uid, email, displayName
  role: "admin" | "lecturer" | "student"
```

---

## 5. RBAC

| Action | Student | Lecturer | Admin |
|---|---|---|---|
| Take quizzes | Yes | No | No |
| Create/publish quizzes | No | Yes (own courses) | Yes |
| View own score history | Yes | N/A | N/A |
| View class results / CA overview | No | Yes (own courses) | Yes |
| Manage lecturer accounts | No | No | Yes |
| Manage courses | No | No | Yes |

---

## 6. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function getRole() {
      return request.auth != null
        ? get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
        : null;
    }

    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if getRole() == "admin";
    }

    match /quizzes/{quizId} {
      allow read: if request.auth != null;
      allow write: if getRole() in ["lecturer", "admin"];

      match /attempts/{uid} {
        allow read: if request.auth != null && (
          request.auth.uid == uid || getRole() in ["lecturer", "admin"]
        );
        allow write: if false;
      }
    }

    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if getRole() == "admin";
    }
  }
}
```

⚠️ Manual publish required in Firebase Console every time these rules change.

---

## 7. Environment Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

NEXT_PUBLIC_APP_URL=https://catrack.vercel.app
```

---

## 8. Non-Goals (out of scope — kept deliberately lean, per your own scoping)

- No descriptive/essay questions — MCQ only
- No facial verification or anti-cheating incident logging — a simpler integrity model (server-validated timing only) is the right scope match for a CA quiz tool, not a full proctored exam system
- No AI-assisted question generation
- No mobile native app — responsive web
