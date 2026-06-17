# Azure Quest PWA v5

A mobile-first PWA for SC-300, AZ-500, and SC-500 study.

## v5 highlights

- 600 rewritten, scenario-style questions: 200 per certification.
- SC-300, AZ-500, and SC-500 are all playable in the arena.
- Quiz Sprints: 10 questions, 12 minutes, focused topic drills.
- Mock Exams: 50 questions, 100 minutes, Microsoft-style randomized structure.
- 10 numbered mock exams per certification.
- Every new quiz/exam uses a new randomized seed unless you choose "Retake same set".
- Past Exams & Quizzes now stores title, type, cert, score, pass/review status, timing, domain breakdown, XP, retake same set, and new randomized set.
- Question-bank exports are included in `/question-bank` as JSON, CSV, and Markdown.

## Run locally

```powershell
npm install --legacy-peer-deps
npm run dev
```

## Build for Netlify

```powershell
npm run build
```

Upload the `dist` folder to Netlify Drop.
