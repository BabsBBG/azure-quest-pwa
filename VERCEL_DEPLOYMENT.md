# VERCEL_DEPLOYMENT.md

## Hosting target

Frontend hosting target:

- Vercel

## Framework

- Vite

## Build command

```bash
npm run build
```

## Install command

```bash
npm install --legacy-peer-deps --no-audit --no-fund
```

## Output directory

dist

## Required files

- vercel.json
- .npmrc
- .nvmrc

## Required Vercel behavior

- Build from source.
- Output dist.
- Rewrite all routes to index.html for SPA support.

## Current production deployment

- Project: `praxisgrid`
- Scope: `tonybabalola-1114s-projects`
- Production URL: `https://azure-quest-pwa.vercel.app`
- Public PraxisGrid project alias: `https://praxisgrid-tonybabalola-1114s-projects.vercel.app`
- Deployment URL: `https://praxisgrid-om99h3h2u-tonybabalola-1114s-projects.vercel.app`
- Deployment ID: `dpl_3amN4Z2CXQap8XKsh6vxXxkBqNic`
- Status: READY

## PraxisGrid project migration

- 2026-07-29: Vercel project renamed from `azure-quest-pwa` to `praxisgrid`.
- 2026-07-29: Vercel project settings aligned to Vite, `npm run build`, `dist`, and `npm install --legacy-peer-deps --no-audit --no-fund`.
- 2026-07-29: Fresh production deployment `dpl_3amN4Z2CXQap8XKsh6vxXxkBqNic` completed READY.
- The historical production alias `https://azure-quest-pwa.vercel.app` returns the latest production deployment and is the public smoke-test target.
- The unique deployment URL and PraxisGrid project alias may redirect through Vercel deployment protection in this account; do not use them as public smoke targets unless protection is disabled.
- `https://praxisgrid.vercel.app` is not live yet and returned 404 during verification; a custom/canonical domain assignment remains pending.

## Latest production smoke

- 2026-07-29: `PRODUCTION_BASE_URL=https://azure-quest-pwa.vercel.app npm run test:production-smoke` passed 20 public production checks across production Chromium and mobile projects; the 6 dev-only signed-in E2E harness checks were skipped as intended outside localhost.
