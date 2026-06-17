# Azure Quest V7 — Path UI + World-Class Job Readiness

## Highlights

- New path-first UI inspired by certification learning platforms.
- Three certification selectors: SC-300, AZ-500, SC-500.
- Each path has Knowledge Check, Learning Content, Exam Readiness, and Job Readiness.
- Job Readiness is path-based and includes project stories, mock interview questions, Say This mode, STAR answers, project-to-interview mapper, follow-up traps, avoid-this guidance, and resume bullets.
- Dedicated video library moved into Learning Content.
- Quizzes and exams now have a Finish Now button that grades answered questions and treats unanswered questions as incorrect.
- KQL Gym has Finish Now.
- Low-bandwidth mode added to header and Settings to reduce visual effects/background weight.
- Confetti is disabled when Low-bandwidth mode is on.
- Production build verified with npm run build.

## Deploy

```powershell
npm install --legacy-peer-deps
npm run build
```

Upload the `dist` folder to Netlify Drop.
