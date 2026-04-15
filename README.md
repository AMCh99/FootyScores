# FootyScores

FootyScores is a Next.js + TypeScript tool for QA engineers to generate deterministic expected API payloads for football matches from the Paris 2024 Olympic schedule.

## Features

- Retrieves Olympic football data from official endpoint families.
- Filters football-only matches (`FBL*`) and excludes other disciplines.
- Transforms each match into the exact endpoint schema from `task/example.json`.
- Provides a UI to trigger generation and inspect match source + generated endpoint JSON.
- Exports generated endpoints as machine-readable JSON.
- Supports two data modes:
	- Live mode (official source)
	- Fixture mode (`api_examples`) fallback for stable local development.

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Jest for unit tests

## Getting Started

1. Install Node.js 20+.
2. Install dependencies:

```bash
npm install
```

3. Run development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run lint` - run Next.js lint rules
- `npm run test` - run Jest tests

## Data Retrieval Strategy

Primary live source uses the official Olympics endpoint pattern:

- `https://stacy.olympics.com/OG2024/data/<filename>.json`
- labels endpoint: `https://stacy.olympics.com/OG2024/locales/eng/labels.json`

Implemented endpoint families:

- `SCH_StartList~comp=OG2024~disc=FBL~lang=ENG.json`
- `GLO_EventUnits~comp=OG2024~disc=FBL~lang=ENG.json`
- `GLO_EventGames~comp=OG2024~event=<eventCode>~lang=ENG.json`
- `SEL_Phases~comp=OG2024~lang=ENG~event=<eventCode>.json`
- `RES_ByRSC_H2H~comp=OG2024~disc=FBL~rscResult=<matchCode>~lang=ENG.json`

When live retrieval is unavailable, the app falls back to `api_examples` fixture files.

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

Tests are in `src/lib/__tests__`.

## Assignment References

- Requirements: `task/readme.md`
- Output schema contract: `task/example.json`