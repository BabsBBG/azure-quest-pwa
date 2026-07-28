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
- Deployment URL: `https://azure-quest-azwmivyy6-tonybabalola-1114s-projects.vercel.app`
- Deployment ID: `dpl_4RzMGkKVnHT2J1gynrZZhLJ3QoLS`
- Status: READY

## PraxisGrid project migration

- 2026-07-28: Vercel project renamed from `azure-quest-pwa` to `praxisgrid`.
- 2026-07-28: Vercel project settings aligned to Vite, `npm run build`, `dist`, and `npm install --legacy-peer-deps --no-audit --no-fund`.
- The historical production alias `https://azure-quest-pwa.vercel.app` still returns the latest production deployment.
- `https://praxisgrid.vercel.app` is not live yet; it requires a fresh production deployment or alias after the project rename.
