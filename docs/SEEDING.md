# Development seed

CATrack uses Firebase Authentication and Firestore, as specified in `CONTEXT.md`.
The seed creates deterministic development users, two courses, two quizzes, and
two submitted attempts. It can be run repeatedly without creating duplicate
accounts.

1. Enable Email/Password sign-in and create Firestore in your Firebase project.
2. Configure the `FIREBASE_ADMIN_*` values in `.env.local`.
3. Run `npm run seed`.

The default test password is `CATrack-demo-2026!`. Set `SEED_PASSWORD` in
`.env.local` before running the command to use a different password.

| Role | Email |
| --- | --- |
| Admin | `admin@catrack.test` |
| Lecturer | `uzo.eze@catrack.test` |
| Student | `ada.obi@catrack.test` |
| Student | `chike.nwosu@catrack.test` |

The seed records mirror the documented data model: `/users`, `/courses`,
`/quizzes`, and `/quizzes/{quizId}/attempts/{uid}`.
