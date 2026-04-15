import type {
  LineupPlayerSeed,
  MatchDetail,
  MatchSeed,
  TeamLineupSeed,
} from "@/lib/types/domain";
import type {
  EndpointLineupPlayer,
  EndpointScorer,
  EndpointTeamLineup,
  MatchEndpoint,
} from "@/lib/types/endpoint";

function safeString(value: string, fallback: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return fallback;
  }

  return trimmed;
}

function mapPlayer(player: LineupPlayerSeed): EndpointLineupPlayer {
  return {
    name: safeString(player.name, "Unknown"),
    number: player.number,
    position: safeString(player.position, "Unknown"),
  };
}

function buildTeamLineup(
  lineups: TeamLineupSeed[],
  teamCode: string,
  fallbackTeamName: string,
): EndpointTeamLineup {
  const source = lineups.find((lineup) => lineup.teamCode === teamCode);

  if (!source) {
    return {
      team: fallbackTeamName,
      formation: "Unknown",
      coach: "Unknown",
      startingXI: [],
      bench: [],
    };
  }

  const startingXI = source.players
    .filter((player) => player.isStarter)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map(mapPlayer);

  const bench = source.players
    .filter((player) => !player.isStarter)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map(mapPlayer);

  return {
    team: safeString(source.teamName, fallbackTeamName),
    formation: safeString(source.formation, "Unknown"),
    coach: safeString(source.coach, "Unknown"),
    startingXI,
    bench,
  };
}

function mapScorers(seed: MatchSeed, detail: MatchDetail): EndpointScorer[] {
  return detail.scorers.map((scorer) => {
    const teamName =
      scorer.teamCode === seed.homeTeamCode
        ? seed.homeTeamName
        : scorer.teamCode === seed.awayTeamCode
          ? seed.awayTeamName
          : "Unknown";

    return {
      team: safeString(teamName, "Unknown"),
      player: safeString(scorer.player, "Unknown"),
      minute: scorer.minute,
      assist: scorer.assist ? safeString(scorer.assist, "Unknown") : undefined,
      type: safeString(scorer.type, "open_play"),
    };
  });
}

export function toEndpoint(seed: MatchSeed, detail: MatchDetail, round: string): MatchEndpoint {
  return {
    competition: {
      name: "Olympic Football Tournament",
      season: "2024",
      round: safeString(round, "Unknown"),
    },
    venue: {
      name: safeString(seed.venueName, "Unknown"),
      city: safeString(seed.venueCity, "Unknown"),
    },
    kickoff: seed.kickoff,
    status: safeString(detail.status, seed.statusCode),
    teams: {
      home: safeString(seed.homeTeamName, "Unknown"),
      away: safeString(seed.awayTeamName, "Unknown"),
    },
    score: {
      home: detail.scoreHome,
      away: detail.scoreAway,
      halfTime: {
        home: detail.halfTimeHome,
        away: detail.halfTimeAway,
      },
    },
    scorers: mapScorers(seed, detail),
    lineups: {
      home: buildTeamLineup(detail.lineups, seed.homeTeamCode, seed.homeTeamName),
      away: buildTeamLineup(detail.lineups, seed.awayTeamCode, seed.awayTeamName),
    },
  };
}
