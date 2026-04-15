import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  endpointTemplates,
  fixtureFiles,
  OLYMPICS_DATA_BASE_URL,
  OLYMPICS_LABELS_URL,
} from "@/lib/constants/endpoints";
import { errorMessages } from "@/lib/errors/messages";
import { parseResultMatchCode } from "@/lib/parsers/olympicsParsers";
import type { SourceMode } from "@/lib/types/domain";

interface ResultEntry {
  matchCode: string;
  payload: unknown;
}

const EVENT_CODE_LENGTH = 22;

export interface RetrievedOlympicPayloads {
  sourceMode: SourceMode;
  fallbackUsed: boolean;
  failedEndpoints: string[];
  startListPayload: unknown;
  eventUnitsPayload: unknown;
  eventGamesPayloads: unknown[];
  phasePayloads: unknown[];
  resultPayloadByMatchCode: Map<string, unknown>;
  labelsPayload: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function buildDataUrl(fileName: string): string {
  return `${OLYMPICS_DATA_BASE_URL}/${fileName}`;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return (await response.json()) as unknown;
}

async function readFixtureJson(fileName: string): Promise<unknown> {
  const fixturePath = path.join(process.cwd(), "api_examples", fileName);
  const raw = await readFile(fixturePath, "utf8");

  return JSON.parse(raw) as unknown;
}

function extractMatchCodesFromStartList(payload: unknown): string[] {
  if (!isRecord(payload)) {
    return [];
  }

  const schedules = asArray(payload.schedules);
  const codes = schedules
    .filter(isRecord)
    .map((item) => asString(item.code))
    .filter((code) => code.length > 0);

  return [...new Set(codes)];
}

function extractEventCodesFromMatchCodes(matchCodes: string[]): string[] {
  const eventCodes = matchCodes
    .map((code) => code.slice(0, EVENT_CODE_LENGTH))
    .filter((code) => code.length > 0);

  return [...new Set(eventCodes)];
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const queue = [...items];
  const results: R[] = [];
  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, async () => {
    while (queue.length > 0) {
      const next = queue.shift();

      if (next === undefined) {
        return;
      }

      const value = await mapper(next);
      results.push(value);
    }
  });

  await Promise.all(workers);

  return results;
}

async function loadFixturePayloads(): Promise<RetrievedOlympicPayloads> {
  const [startListPayload, eventUnitsPayload, eventGamesMen, phasesMen, oneResultPayload, labelsPayload] =
    await Promise.all([
      readFixtureJson(fixtureFiles.startList),
      readFixtureJson(fixtureFiles.eventUnits),
      readFixtureJson(fixtureFiles.eventGamesMen),
      readFixtureJson(fixtureFiles.phasesMen),
      readFixtureJson(fixtureFiles.oneResultSample),
      readFixtureJson(fixtureFiles.labels),
    ]);

  const resultPayloadByMatchCode = new Map<string, unknown>();

  try {
    const matchCode = parseResultMatchCode(oneResultPayload);

    if (matchCode.length > 0) {
      resultPayloadByMatchCode.set(matchCode, oneResultPayload);
    }
  } catch {
    // Keep fixture mode operational even when one optional sample cannot be keyed.
  }

  return {
    sourceMode: "fixture",
    fallbackUsed: false,
    failedEndpoints: [],
    startListPayload,
    eventUnitsPayload,
    eventGamesPayloads: [eventGamesMen],
    phasePayloads: [phasesMen],
    resultPayloadByMatchCode,
    labelsPayload,
  };
}

async function loadLivePayloads(): Promise<RetrievedOlympicPayloads> {
  const failedEndpoints: string[] = [];
  const startListFile = endpointTemplates.startList();
  const eventUnitsFile = endpointTemplates.eventUnits();

  const startListPayload = await fetchJson(buildDataUrl(startListFile));

  const eventUnitsPayload = await fetchJson(buildDataUrl(eventUnitsFile)).catch((error) => {
    failedEndpoints.push(`${eventUnitsFile}: ${String(error)}`);
    return {};
  });

  const labelsPayload = await fetchJson(OLYMPICS_LABELS_URL).catch((error) => {
    failedEndpoints.push(`labels.json: ${String(error)}`);
    return {};
  });

  const matchCodes = extractMatchCodesFromStartList(startListPayload);
  const eventCodes = extractEventCodesFromMatchCodes(matchCodes);

  const eventGamesPayloads = (
    await Promise.all(
      eventCodes.map(async (eventCode) => {
        const file = endpointTemplates.eventGames(eventCode);

        try {
          return await fetchJson(buildDataUrl(file));
        } catch (error) {
          failedEndpoints.push(`${file}: ${String(error)}`);
          return null;
        }
      }),
    )
  ).filter((payload): payload is unknown => payload !== null);

  const phasePayloads = (
    await Promise.all(
      eventCodes.map(async (eventCode) => {
        const file = endpointTemplates.phases(eventCode);

        try {
          return await fetchJson(buildDataUrl(file));
        } catch (error) {
          failedEndpoints.push(`${file}: ${String(error)}`);
          return null;
        }
      }),
    )
  ).filter((payload): payload is unknown => payload !== null);

  const resultEntries = await mapWithConcurrency(matchCodes, 8, async (matchCode): Promise<ResultEntry | null> => {
    const file = endpointTemplates.resultByMatch(matchCode);

    try {
      const payload = await fetchJson(buildDataUrl(file));

      return {
        matchCode,
        payload,
      };
    } catch (error) {
      failedEndpoints.push(`${file}: ${String(error)}`);
      return null;
    }
  });

  const resultPayloadByMatchCode = new Map<string, unknown>();

  for (const resultEntry of resultEntries) {
    if (!resultEntry) {
      continue;
    }

    resultPayloadByMatchCode.set(resultEntry.matchCode, resultEntry.payload);
  }

  return {
    sourceMode: "live",
    fallbackUsed: false,
    failedEndpoints,
    startListPayload,
    eventUnitsPayload,
    eventGamesPayloads,
    phasePayloads,
    resultPayloadByMatchCode,
    labelsPayload,
  };
}

export async function retrieveOlympicPayloads(preferredMode: SourceMode): Promise<RetrievedOlympicPayloads> {
  if (preferredMode === "fixture") {
    return loadFixturePayloads();
  }

  try {
    return await loadLivePayloads();
  } catch (error) {
    const fixturePayloads = await loadFixturePayloads();

    return {
      ...fixturePayloads,
      fallbackUsed: true,
      failedEndpoints: [
        `${errorMessages.sourceUnavailable}: ${String(error)}`,
        ...fixturePayloads.failedEndpoints,
      ],
    };
  }
}
