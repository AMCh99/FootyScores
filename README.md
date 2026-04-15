# FootyScores

FootyScores is a Next.js + TypeScript tool for QA engineers to generate deterministic expected API payloads for football matches from the Paris 2024 Olympic schedule.

## Features

- Retrieves Olympic football data from official endpoint families.
- Filters football-only matches (`FBL*`) and excludes other disciplines.
- Transforms each match into the exact endpoint schema from `task/example.json`.
- Provides a UI to trigger generation and inspect match source + generated endpoint JSON.
- Exports generated endpoints as machine-readable JSON.
- Uses the official Olympics source as the runtime data input.

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Jest for unit tests

## Getting Started

1. Use Node.js 22.x (LTS).
2. If you use nvm, run:

```bash
nvm install
nvm use
```

3. Install dependencies:

```bash
npm install
```

4. Run development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run lint` - run Next.js lint rules
- `npm run test` - run Jest tests

## Runtime Notes

- This repository pins Node to `22.x` in `package.json` and `.nvmrc`.
- Vercel reads the Node version from `package.json` `engines.node`.
- npm scripts include a `NODE_OPTIONS` localStorage safeguard so the app can still run locally on environments using newer Node versions.

## Data Retrieval Strategy

Primary live source uses the official Olympics endpoint pattern:

- Competition schedule source of truth: `https://stacy.olympics.com/en/paris-2024/competition-schedule`
- `https://stacy.olympics.com/OG2024/data/<filename>.json`
- labels endpoint: `https://stacy.olympics.com/OG2024/locales/eng/labels.json`

Implemented endpoint families:

- `SCH_StartList~comp=OG2024~disc=FBL~lang=ENG.json`
- `GLO_EventUnits~comp=OG2024~disc=FBL~lang=ENG.json`
- `GLO_EventGames~comp=OG2024~event=<eventCode>~lang=ENG.json`
- `SEL_Phases~comp=OG2024~lang=ENG~event=<eventCode>.json`
- `RES_ByRSC_H2H~comp=OG2024~disc=FBL~rscResult=<matchCode>~lang=ENG.json`

The `api_examples` directory is retained only as optional reference material when defining interfaces and parser contracts. Runtime generation does not read from `api_examples`.

## Architecture

The implementation is split into clear layers:

- Data retrieval: `src/lib/source/olympicsSource.ts`
- Parsing and normalization: `src/lib/parsers/olympicsParsers.ts`
- Football filtering and dedupe: `src/lib/filters/footballFilter.ts`
- Endpoint transformation: `src/lib/transformers/toEndpoint.ts`
- Deterministic sorting: `src/lib/sorters/orderEndpoints.ts`
- Export logic: `src/lib/export/exportJson.ts`
- End-to-end orchestration: `src/lib/pipeline/generateEndpoints.ts`
- UI + API route: `src/app/page.tsx` and `src/app/api/generate/route.ts`

## Deterministic Ordering

Generated output order is deterministic and tested:

1. kickoff timestamp ascending
2. home team name ascending
3. away team name ascending

## Missing Data Assumptions

- Missing strings are normalized to `"Unknown"`.
- Missing arrays are normalized to empty arrays.
- Numeric fields in exported endpoint schema are normalized to numbers (`0` fallback).
- If detailed match result payload is missing, summary endpoints are used when available.

## Testing

Current tests cover:

- Football filtering and dedupe
- Deterministic sorting
- Canonical-to-endpoint transformation
- Parser behavior for schedule and match details
- Integration checks with mocked official payload retrieval: no duplicates, football-only coverage, deterministic ordering
- Endpoint contract shape against `task/example.json`

Tests are in `src/lib/__tests__`.

Run the full validation suite before submission:

```bash
npm run lint
npm run test
npm run build
```

## Deploy (Vercel)

1. Push this repository to GitHub.
2. In Vercel, import the repository as a new project.
3. Keep the default Next.js build settings.
4. Deploy.

Notes:

- Node runtime is pinned via `package.json` engines (`22.x`), which Vercel respects.
- No custom environment variables are required for the core generator flow.

## Assignment References

- Requirements: `task/readme.md`
- Output schema contract: `task/example.json`