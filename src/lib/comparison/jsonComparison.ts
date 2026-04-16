import type { GeneratedMatchRecord } from "@/lib/types/domain";
import type {
  ComparisonStrategy,
  JsonComparisonResult,
  JsonDifference,
  MatchComparisonResult,
} from "@/lib/types/comparison";
import type { MatchEndpoint } from "@/lib/types/endpoint";

const DEFAULT_MAX_DIFFERENCES_PER_MATCH = 120;

interface DifferenceCollector {
  differences: JsonDifference[];
  totalDifferences: number;
  maxDifferences: number;
}

interface EndpointDiffResult {
  totalDifferences: number;
  differences: JsonDifference[];
  truncated: boolean;
}

interface NormalizedTestedPayload {
  byMatchCode: Map<string, MatchEndpoint>;
  orderedEndpoints: MatchEndpoint[];
}

interface CompareOptions {
  ignoreExtraInTested?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isEndpointScorer(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.team) &&
    isString(value.player) &&
    isNumber(value.minute) &&
    isString(value.type) &&
    (value.assist === undefined || isString(value.assist))
  );
}

function isEndpointLineupPlayer(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return isString(value.name) && isNumber(value.number) && isString(value.position);
}

function isEndpointTeamLineup(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  if (!isString(value.team) || !isString(value.formation) || !isString(value.coach)) {
    return false;
  }

  if (!Array.isArray(value.startingXI) || !Array.isArray(value.bench)) {
    return false;
  }

  return value.startingXI.every(isEndpointLineupPlayer) && value.bench.every(isEndpointLineupPlayer);
}

function isMatchEndpoint(value: unknown): value is MatchEndpoint {
  if (!isRecord(value)) {
    return false;
  }

  if (!isRecord(value.competition) || !isRecord(value.venue) || !isRecord(value.teams) || !isRecord(value.score)) {
    return false;
  }

  if (!isRecord(value.score.halfTime) || !isRecord(value.lineups)) {
    return false;
  }

  const homeLineup = isRecord(value.lineups) ? value.lineups.home : undefined;
  const awayLineup = isRecord(value.lineups) ? value.lineups.away : undefined;

  return (
    isString(value.competition.name) &&
    isString(value.competition.season) &&
    isString(value.competition.round) &&
    isString(value.venue.name) &&
    isString(value.venue.city) &&
    isString(value.kickoff) &&
    isString(value.status) &&
    isString(value.teams.home) &&
    isString(value.teams.away) &&
    isNumber(value.score.home) &&
    isNumber(value.score.away) &&
    isNumber(value.score.halfTime.home) &&
    isNumber(value.score.halfTime.away) &&
    Array.isArray(value.scorers) &&
    value.scorers.every(isEndpointScorer) &&
    isEndpointTeamLineup(homeLineup) &&
    isEndpointTeamLineup(awayLineup)
  );
}

function toMatchCodeRecord(value: unknown): { matchCode: string; endpoint: MatchEndpoint } | null {
  if (!isRecord(value)) {
    return null;
  }

  const directMatchCode = isString(value.matchCode) ? value.matchCode.trim() : "";

  if (directMatchCode.length > 0 && isMatchEndpoint(value.endpoint)) {
    return {
      matchCode: directMatchCode,
      endpoint: value.endpoint,
    };
  }

  if (isRecord(value.source) && isString(value.source.matchCode) && isMatchEndpoint(value.endpoint)) {
    const sourceMatchCode = value.source.matchCode.trim();

    if (sourceMatchCode.length === 0) {
      return null;
    }

    return {
      matchCode: sourceMatchCode,
      endpoint: value.endpoint,
    };
  }

  return null;
}

function normalizeMatchCollection(
  collection: unknown[],
  normalized: NormalizedTestedPayload,
): void {
  for (const item of collection) {
    const withMatchCode = toMatchCodeRecord(item);

    if (withMatchCode) {
      normalized.byMatchCode.set(withMatchCode.matchCode, withMatchCode.endpoint);
      continue;
    }

    if (isMatchEndpoint(item)) {
      normalized.orderedEndpoints.push(item);
    }
  }
}

export function normalizeTestedPayload(payload: unknown): NormalizedTestedPayload {
  const normalized: NormalizedTestedPayload = {
    byMatchCode: new Map<string, MatchEndpoint>(),
    orderedEndpoints: [],
  };

  if (Array.isArray(payload)) {
    normalizeMatchCollection(payload, normalized);
    return normalized;
  }

  if (isRecord(payload) && Array.isArray(payload.matches)) {
    normalizeMatchCollection(payload.matches, normalized);
    return normalized;
  }

  if (isMatchEndpoint(payload)) {
    normalized.orderedEndpoints.push(payload);
  }

  return normalized;
}

function getValueKind(value: unknown): string {
  if (Array.isArray(value)) {
    return "array";
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

function addDifference(
  collector: DifferenceCollector,
  path: string,
  expected: unknown,
  actual: unknown,
): void {
  collector.totalDifferences += 1;

  if (collector.differences.length >= collector.maxDifferences) {
    return;
  }

  collector.differences.push({
    path,
    expected,
    actual,
  });
}

function walkDifference(
  expected: unknown,
  actual: unknown,
  path: string,
  collector: DifferenceCollector,
): void {
  const expectedKind = getValueKind(expected);
  const actualKind = getValueKind(actual);

  if (expectedKind !== actualKind) {
    addDifference(collector, path, expected, actual);
    return;
  }

  if (Array.isArray(expected) && Array.isArray(actual)) {
    const maxLength = Math.max(expected.length, actual.length);

    for (let index = 0; index < maxLength; index += 1) {
      const nextPath = `${path}[${index}]`;

      if (index >= expected.length) {
        addDifference(collector, nextPath, undefined, actual[index]);
        continue;
      }

      if (index >= actual.length) {
        addDifference(collector, nextPath, expected[index], undefined);
        continue;
      }

      walkDifference(expected[index], actual[index], nextPath, collector);
    }

    return;
  }

  if (isRecord(expected) && isRecord(actual)) {
    const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort();

    for (const key of keys) {
      const nextPath = path === "$" ? `$.${key}` : `${path}.${key}`;
      const expectedHasKey = Object.prototype.hasOwnProperty.call(expected, key);
      const actualHasKey = Object.prototype.hasOwnProperty.call(actual, key);

      if (!expectedHasKey) {
        addDifference(collector, nextPath, undefined, actual[key]);
        continue;
      }

      if (!actualHasKey) {
        addDifference(collector, nextPath, expected[key], undefined);
        continue;
      }

      walkDifference(expected[key], actual[key], nextPath, collector);
    }

    return;
  }

  if (!Object.is(expected, actual)) {
    addDifference(collector, path, expected, actual);
  }
}

function diffEndpoints(
  expected: MatchEndpoint,
  actual: MatchEndpoint,
  maxDifferences: number,
): EndpointDiffResult {
  const collector: DifferenceCollector = {
    differences: [],
    totalDifferences: 0,
    maxDifferences,
  };

  walkDifference(expected, actual, "$", collector);

  return {
    totalDifferences: collector.totalDifferences,
    differences: collector.differences,
    truncated: collector.totalDifferences > collector.differences.length,
  };
}

function compareByCode(
  generatedMatches: GeneratedMatchRecord[],
  testedByCode: Map<string, MatchEndpoint>,
): {
  comparisons: MatchComparisonResult[];
  missingInTested: string[];
  extraInTested: string[];
} {
  const comparisons: MatchComparisonResult[] = [];
  const missingInTested: string[] = [];
  const generatedCodeSet = new Set<string>();

  for (const record of generatedMatches) {
    generatedCodeSet.add(record.source.matchCode);

    const testedEndpoint = testedByCode.get(record.source.matchCode);

    if (!testedEndpoint) {
      missingInTested.push(record.source.matchCode);
      continue;
    }

    const diff = diffEndpoints(record.endpoint, testedEndpoint, DEFAULT_MAX_DIFFERENCES_PER_MATCH);

    comparisons.push({
      matchCode: record.source.matchCode,
      isEqual: diff.totalDifferences === 0,
      differenceCount: diff.totalDifferences,
      differencesTruncated: diff.truncated,
      differences: diff.differences,
    });
  }

  const extraInTested = [...testedByCode.keys()].filter((matchCode) => !generatedCodeSet.has(matchCode));

  return {
    comparisons,
    missingInTested,
    extraInTested,
  };
}

function compareByOrder(
  generatedMatches: GeneratedMatchRecord[],
  testedEndpoints: MatchEndpoint[],
): {
  comparisons: MatchComparisonResult[];
  missingInTested: string[];
  extraInTested: string[];
} {
  const comparisons: MatchComparisonResult[] = [];
  const minLength = Math.min(generatedMatches.length, testedEndpoints.length);

  for (let index = 0; index < minLength; index += 1) {
    const record = generatedMatches[index];
    const testedEndpoint = testedEndpoints[index];

    if (!record || !testedEndpoint) {
      continue;
    }

    const diff = diffEndpoints(record.endpoint, testedEndpoint, DEFAULT_MAX_DIFFERENCES_PER_MATCH);

    comparisons.push({
      matchCode: record.source.matchCode,
      isEqual: diff.totalDifferences === 0,
      differenceCount: diff.totalDifferences,
      differencesTruncated: diff.truncated,
      differences: diff.differences,
    });
  }

  const missingInTested = generatedMatches.slice(minLength).map((record) => record.source.matchCode);
  const extraInTested = testedEndpoints.slice(minLength).map((_endpoint, index) => `index:${index + minLength}`);

  return {
    comparisons,
    missingInTested,
    extraInTested,
  };
}

export function compareGeneratedWithTested(
  generatedMatches: GeneratedMatchRecord[],
  testedPayload: unknown,
  testedApiUrl: string,
  options?: CompareOptions,
): JsonComparisonResult {
  const normalized = normalizeTestedPayload(testedPayload);
  const strategy: ComparisonStrategy = normalized.byMatchCode.size > 0 ? "by-match-code" : "by-order";
  const ignoreExtraInTested = options?.ignoreExtraInTested ?? false;

  const result =
    strategy === "by-match-code"
      ? compareByCode(generatedMatches, normalized.byMatchCode)
      : compareByOrder(generatedMatches, normalized.orderedEndpoints);

  const reportedExtraInTested = ignoreExtraInTested ? [] : result.extraInTested;

  const equalMatches = result.comparisons.filter((comparison) => comparison.isEqual).length;
  const mismatchedMatches = result.comparisons.length - equalMatches;
  const passed =
    mismatchedMatches === 0 && result.missingInTested.length === 0 && reportedExtraInTested.length === 0;

  return {
    passed,
    diagnostics: {
      testedApiUrl,
      strategy,
      generatedAt: new Date().toISOString(),
      comparedMatches: result.comparisons.length,
      equalMatches,
      mismatchedMatches,
      missingInTested: result.missingInTested,
      extraInTested: reportedExtraInTested,
    },
    matches: result.comparisons,
  };
}