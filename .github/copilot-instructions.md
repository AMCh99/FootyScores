# Project Guidelines

## Stack and Scope
- Build this project as a Next.js application using React and TypeScript.
- Process only football (soccer) matches from the Paris 2024 Olympic schedule.
- Exclude non-football events from all generated output.

## Code Style
- Write clean, readable, maintainable code with focused functions and clear naming.
- Avoid the any type. Use explicit types and type guards for parsed external data.
- Use React functional components and hooks.
- Keep error messages professional, specific, and actionable in UI, thrown errors, and logs.
- Follow additional TypeScript and React quality standards in [.github/instructions/typescript-react-quality.instructions.md](./instructions/typescript-react-quality.instructions.md).

## Architecture
- Keep logic separated into clear layers:
  - data retrieval and parsing
  - football-only filtering
  - endpoint transformation to target schema
  - UI presentation and export
  - optional API comparison (bonus)
- Prefer pure transformation functions for deterministic output and easier Jest testing.

## Build and Test
- This repository is currently a greenfield setup and may not yet expose scripts.
- After project scaffold, use npm and keep standard scripts available: dev, build, lint, and test.
- Expected commands after scaffold: npm install, npm run dev, npm run build, npm run lint, and npm run test.
- Use Jest for unit tests, especially for parser, filter, sorting, and endpoint generation logic.
- Treat deterministic ordering as a tested requirement.

## Data and Output Conventions
- Use [task/readme.md](../task/readme.md) as the source of truth for acceptance criteria.
- Use [task/example.json](../task/example.json) as the source of truth for endpoint structure.
- Match example schema exactly: keys, nesting, and data types.
- Do not add extra fields to generated endpoint objects.
- Use ISO 8601 date-time with timezone offset for kickoff.
- Ensure deterministic output ordering, documented and enforced in tests.

## References
- Assignment details: [task/readme.md](../task/readme.md)
- Endpoint schema: [task/example.json](../task/example.json)
- File-specific coding standards: [.github/instructions/typescript-react-quality.instructions.md](./instructions/typescript-react-quality.instructions.md)
- Reusable strict JSON prompt: [.github/prompts/generate-exact-match-json.prompt.md](./prompts/generate-exact-match-json.prompt.md)
