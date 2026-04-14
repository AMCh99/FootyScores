# FootyScores

FootyScores is a Next.js frontend tool for QA engineers to generate and review the expected API endpoints for every football (soccer) match played during the **Paris 2024 Olympic Games**.

The generated endpoints serve as reference values for automated tests that validate the FootyScores API.

## Features

- Lists all Men's and Women's Olympic football matches (Paris 2024)
- Displays the generated API endpoint for each match in the format `/api/v1/matches/{id}`
- One-click copy of any endpoint to the clipboard
- Match metadata: date, time (CEST), teams, venue, stage, and group

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
