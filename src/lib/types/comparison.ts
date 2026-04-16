export interface JsonDifference {
  path: string;
  expected: unknown;
  actual: unknown;
}

export interface MatchComparisonResult {
  matchCode: string;
  isEqual: boolean;
  differenceCount: number;
  differencesTruncated: boolean;
  differences: JsonDifference[];
}

export type ComparisonStrategy = "by-match-code" | "by-order";

export interface ComparisonDiagnostics {
  testedApiUrl: string;
  strategy: ComparisonStrategy;
  generatedAt: string;
  comparedMatches: number;
  equalMatches: number;
  mismatchedMatches: number;
  missingInTested: string[];
  extraInTested: string[];
}

export interface JsonComparisonResult {
  passed: boolean;
  diagnostics: ComparisonDiagnostics;
  matches: MatchComparisonResult[];
}