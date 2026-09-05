# Development seed

Configure Firebase Email/Password authentication, Firestore, and the client and
Admin SDK variables in .env.local. Run:

```powershell
npm run seed
```

New accounts use SEED_PASSWORD from the environment, or CATrack-demo-2026!.
Existing accounts keep their passwords. Changing SEED_PASSWORD and rerunning
does NOT reset them; use the password reset flow instead.

| Role | Email |
| --- | --- |
| Admin | admin@catrack.test |
| Lecturer | uzo.eze@catrack.test |
| Student with submitted work | ada.obi@catrack.test |
| Student with a late submission | chike.nwosu@catrack.test |
| Student without attempts | new.student@catrack.test |

The seed only creates missing records. It does not overwrite courses, quizzes,
attempts, profiles, or passwords. Existing expired quiz windows remain expired:
edit an unattempted quiz through the lecturer library or create a fresh one.
The seed is for a development project; do not use its public test password for
real institution accounts.

Quiz maximum scores equal the question count. Older seed records with mismatched
maxScore values are normalized on read by the application; the seed does not
rewrite existing assessment history.
