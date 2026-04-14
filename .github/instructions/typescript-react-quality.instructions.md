---
description: "Use when implementing or refactoring FootyScores source code. Enforces TypeScript-first development, clean code practices, React functional components, and professional error communication in UI, thrown errors, and logs."
name: "TypeScript React Quality Standards"
applyTo:
  "**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}",
  "**/*.{test,spec}.{ts,tsx,js,jsx}"
---
# TypeScript and React Quality Standards

- Use TypeScript for all application code and code examples.
- Do not create new JavaScript React source files. Use `.ts` and `.tsx` for new files.
- Prefer explicit, readable types over `any`. If `any` is unavoidable, justify it with a short comment.
- Keep code clean:
  - Use meaningful names for functions, variables, and types.
  - Keep functions focused on one responsibility.
  - Prefer small functions and early returns over deeply nested conditionals.
  - Avoid magic numbers and duplicated logic.
- Build React UI using functional components and hooks.
- Do not introduce class-based React components.
- Handle errors with a professional tone across UI, thrown errors, and logs:
  - UI error headings must be clear, concise, and respectful.
  - Prefer actionable headings such as "Unable to Load Matches" instead of vague or informal text.
  - Thrown error messages should describe what failed and include actionable context when possible.
  - Log messages should be professional, specific, and searchable.
  - Avoid slang, blameful language, or all-caps phrasing in user-facing and developer-facing error text.
