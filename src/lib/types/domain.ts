import type { MatchEndpoint } from "@/lib/types/endpoint";

export interface MatchSeed {
  matchCode: string;
  eventCode: string;
  kickoff: string;
  statusCode: string;
  homeTeamCode: string;
  homeTeamName: string;
  awayTeamCode: string;
  awayTeamName: string;
  venueName: string;
  venueCity: string;
}

export interface ScorerSeed {
  teamCode: string;
  player: string;
  minute: number;
  assist?: string;
  type: string;
}

export interface LineupPlayerSeed {
  name: string;
  number: number;
  position: string;
  isStarter: boolean;
  sortOrder: number;
}

export interface TeamLineupSeed {
  teamCode: string;
  teamName: string;
  formation: string;
  coach: string;
  players: LineupPlayerSeed[];
}

export interface MatchDetail {
  status: string;
  scoreHome: number;
  scoreAway: number;
  halfTimeHome: number;
  halfTimeAway: number;
  scorers: ScorerSeed[];
  lineups: TeamLineupSeed[];
}

export interface MatchSourceSummary {
  matchCode: string;
  eventCode: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  round: string;
  sourceMode: "official";
  sourceContext?: MatchSourceContext;
}

export interface RoundResolutionTrace {
  fromPhaseOrUnits: string | null;
  fromEventGames: string | null;
  fallbackFromMatchCode: string;
  finalRound: string;
}

export interface MatchSourceContext {
  sourceEndpoints: {
    startList: string;
    eventUnits: string;
    eventGames: string;
    phases: string;
    resultByMatch: string;
    labels: string;
  };
  seed: MatchSeed;
  parsedDetail: MatchDetail;
  mergedDetail: MatchDetail;
  eventGameSummary: {
    scoreHome: number;
    scoreAway: number;
    status: string;
    round: string;
  } | null;
  rawPayloads: {
    eventUnits: unknown;
    eventGames: unknown | null;
    phases: unknown | null;
    resultByMatch: unknown | null;
    labels: unknown;
  };
  roundResolution: RoundResolutionTrace;
}

export interface GeneratedMatchRecord {
  source: MatchSourceSummary;
  endpoint: MatchEndpoint;
}

export interface GenerationDiagnostics {
  sourceMode: "official";
  generatedAt: string;
  totalMatches: number;
  failedEndpoints: string[];
}

export interface GenerationResult {
  diagnostics: GenerationDiagnostics;
  matches: GeneratedMatchRecord[];
}
