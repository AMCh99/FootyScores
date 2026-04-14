---
description: "Use when generating football match payloads that must match task/example.json structure exactly for QA validation."
name: "Generate Exact Match JSON"
argument-hint: "Provide match data to transform into the exact example.json structure"
agent: "agent"
---
Generate football match JSON payloads from the user-provided data.

Use [example.json](../../task/example.json) as the strict source of truth for structure.

Requirements:
- Match the same key names, nesting, and key order as the example object.
- Keep the same data types as the example for every field.
- Use ISO 8601 date-time with timezone offset for kickoff.
- Return valid JSON only: no markdown, no explanation, no comments.
- If input contains one match, return one JSON object.
- If input contains multiple matches, return a JSON array of match objects.
- Include all keys from the example, even when some values are unknown.
- For unknown scalar values, use null.
- For unknown lists, use an empty array.
- Do not add fields that are not present in the example.

Validation checklist before responding:
1. Every match object has top-level keys matching the example and in the same order.
2. Every match object has nested object structure matching the example.
3. Output is parseable JSON.
4. Output contains no extra keys.
