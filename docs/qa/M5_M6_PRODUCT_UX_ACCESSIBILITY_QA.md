# M5/M6 Product, UX, Accessibility And Regression QA

Status: FAIL - production QA sign-off not granted

Date: 2026-07-29

## Baseline Result

The existing Vitest and static-validator suite passed before implementation changes. It is not sufficient for Phase 6 production release.

## Blocking Issues

- Playwright, WebKit, mobile, accessibility, visual, and production-smoke gates now exist and pass for the public auth/legal/status contract, including 20/20 public production smoke against `https://azure-quest-pwa.vercel.app`.
- Route validation now includes runtime browser navigation for the public/auth smoke contract, but broader learner/admin signed-in journeys still need E2E coverage.
- `/admin` lacks browser-tested anonymous and role-specific access denial.
- Secondary practice surfaces lack regression tests for demo-bank trust copy and answer reveal timing.
- Mobile nav, safe areas, focus order, keyboard-only use, form errors, and screen-reader labels are not tested.
- Career Lab has no full E2E for import, interview completion, history, recovery, or project evidence flow.

## Required Before PASS

- Extend CI/browser coverage beyond the current public auth/legal/status contract into signed-in learner, onboarding, Admin role, repository import, Project Intelligence, Interview Studio, Assessment Shell, and results journeys.
- Add accessibility checks for auth, onboarding, Home, Learn, Practise, Prove, repository import, Project Intelligence, Interview Studio, Assessment Shell, results, Account, and Admin.
- Add mobile viewport checks for 320px, 390px, tablet portrait, tablet landscape, 1280px, and 1440px.

## Sign-Off

Product/UX/Accessibility QA: FAIL
