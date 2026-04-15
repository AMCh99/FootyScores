export interface EndpointCompetition {
  name: string;
  season: string;
  round: string;
}

export interface EndpointVenue {
  name: string;
  city: string;
}

export interface EndpointTeams {
  home: string;
  away: string;
}

export interface EndpointHalfTimeScore {
  home: number;
  away: number;
}

export interface EndpointScore {
  home: number;
  away: number;
  halfTime: EndpointHalfTimeScore;
}

export interface EndpointScorer {
  team: string;
  player: string;
  minute: number;
  assist?: string;
  type: string;
}

export interface EndpointLineupPlayer {
  name: string;
  number: number;
  position: string;
}

export interface EndpointTeamLineup {
  team: string;
  formation: string;
  coach: string;
  startingXI: EndpointLineupPlayer[];
  bench: EndpointLineupPlayer[];
}

export interface EndpointLineups {
  home: EndpointTeamLineup;
  away: EndpointTeamLineup;
}

export interface MatchEndpoint {
  competition: EndpointCompetition;
  venue: EndpointVenue;
  kickoff: string;
  status: string;
  teams: EndpointTeams;
  score: EndpointScore;
  scorers: EndpointScorer[];
  lineups: EndpointLineups;
}
