# FootyScores

FootyScores is a Next.js + TypeScript tool for QA engineers to generate deterministic expected API payloads for football matches from the Paris 2024 Olympic schedule.

## Live Website

- URL: https://footy-scores.vercel.app/
- Hosting: Deployed on Vercel.

## Features

- Retrieves Olympic football data from official endpoint families.
- Filters football-only matches (`FBL*`) and excludes other disciplines.
- Transforms each match into the exact endpoint schema from `task/example.json`.
- Provides a UI to trigger generation and inspect match source + generated endpoint JSON.
- Automatically loads and generates endpoint data on initial page load, with manual reload support.
- Exports generated endpoints as machine-readable JSON.
- Supports single-match endpoint retrieval and single-match JSON export from fullscreen match view.
- Supports automated JSON comparison with a tested API (all matches or a single selected match).
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

API usage:

- All football matches: `/api/generate`
- Single football match by code: `/api/generate?matchCode=<matchCode>`
- Compare generated JSON with tested API: `POST /api/compare` body `{ "testedApiUrl": "<url>", "matchCode": "<optional matchCode>" }`
- Compare using query params: `/api/compare?testedApiUrl=<urlEncodedUrl>&matchCode=<optional matchCode>`

## Automated JSON Comparison

The comparison feature validates generated expected endpoints against a tested API response.

What the comparison does:

1. Generates the expected endpoint set from official Olympics football data.
2. Fetches JSON from the tested API URL (`testedApiUrl`).
3. Normalizes the tested payload into a supported structure.
4. Compares generated vs tested endpoints using a deterministic strategy.
5. Returns a pass/fail result with detailed mismatch diagnostics.

Supported tested payload shapes:

- `{ "matches": [{ "source": { "matchCode": "..." }, "endpoint": { ... } }] }`
- `[{ ...matchEndpoint }, { ...matchEndpoint }]`
- `{ ...singleMatchEndpoint }`

Comparison strategies:

- `by-match-code`: used when tested payload includes match codes.
- `by-order`: fallback when match codes are not available.

Difference behavior:

- Deep comparison is recursive for objects and arrays.
- Differences include JSON path, expected value, and actual value.
- Each compared match reports total difference count.
- Difference samples are capped per match and flagged as truncated when needed.

Pass criteria:

- `passed=true` only when there are no mismatched compared matches,
- no generated matches missing in tested payload,
- and no extra tested matches (except single-match mode, where unrelated extras are ignored).

Single-match comparison:

- Provide `matchCode` to compare exactly one generated football match.
- If match code does not exist in generated results, API returns `404`.

Comparison result includes:

- `passed`
- `diagnostics`: tested API URL, strategy, compared/equal/mismatched counts, missing/extra lists, generation timestamp
- `matches[]`: per-match result with `isEqual`, `differenceCount`, `differencesTruncated`, and `differences[]`

## Architecture

The implementation is split into clear layers:

- Data retrieval: `src/lib/source/olympicsSource.ts`
- Parsing and normalization: `src/lib/parsers/olympicsParsers.ts`
- Football filtering and dedupe: `src/lib/filters/footballFilter.ts`
- Endpoint transformation: `src/lib/transformers/toEndpoint.ts`
- Deterministic sorting: `src/lib/sorters/orderEndpoints.ts`
- JSON comparison engine: `src/lib/comparison/jsonComparison.ts`
- Export logic: `src/lib/export/exportJson.ts`
- End-to-end orchestration: `src/lib/pipeline/generateEndpoints.ts`
- UI + API routes: `src/app/page.tsx`, `src/app/api/generate/route.ts`, and `src/app/api/compare/route.ts`

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
- JSON comparison behavior: by-match-code, by-order, and single-match extra-entry handling
- Endpoint contract shape against `task/example.json`

Tests are in `src/lib/__tests__`.

Run the full validation suite before submission:

```bash
npm run lint
npm run test
npm run build
```

## Deploy (Vercel)

1. Push the repository to GitHub.
2. In Vercel, import the GitHub repository as a new project.
3. Keep default Next.js build settings.
4. Deploy.

Notes:

- Node runtime is pinned via `package.json` engines (`22.x`), which Vercel respects.
- No custom environment variables are required for the core generator flow.

## Submission Requirements Coverage

- Install, run, and deploy instructions: see `Getting Started` and `Deploy (Vercel)`.
- How data is retrieved and parsed: see `Data Retrieval Strategy` and `Architecture`.
- How endpoint ordering is determined: see `Deterministic Ordering`.
- Assumptions for missing or inconsistent schedule data: see `Missing Data Assumptions`.

## Assignment References

- Requirements: `task/readme.md`
- Output schema contract: `task/example.json`