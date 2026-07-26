# M5/M6 Product, UX, Accessibility And Regression QA

Status: FAIL - production QA sign-off not granted

Date: 2026-07-26

## Baseline Result

The existing Vitest and static-validator suite passed before implementation changes. It is not sufficient for Phase 6 production release.

## Blocking Issues

- No Playwright, WebKit, mobile, accessibility, visual, or production-smoke test gate exists.
- Existing route validation is import/string based, not runtime browser navigation.
- `/admin` lacks browser-tested anonymous and role-specific access denial.
- Secondary practice surfaces lack regression tests for demo-bank trust copy and answer reveal timing.
- Mobile nav, safe areas, focus order, keyboard-only use, form errors, and screen-reader labels are not tested.
- Career Lab has no full E2E for import, interview completion, history, recovery, or project evidence flow.

## Required Before PASS

- Add CI scripts for `test:e2e`, `test:e2e:chromium`, `test:e2e:webkit`, `test:e2e:mobile`, `test:accessibility`, `test:visual`, and `test:production-smoke`.
- Add runtime route smoke tests that fail on page errors and console errors.
- Add accessibility checks for auth, onboarding, Home, Learn, Practise, Prove, repository import, Project Intelligence, Interview Studio, Assessment Shell, results, Account, and Admin.
- Add mobile viewport checks for 320px, 390px, tablet portrait, tablet landscape, 1280px, and 1440px.

## Sign-Off

Product/UX/Accessibility QA: FAIL
