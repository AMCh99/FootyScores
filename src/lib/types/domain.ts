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
