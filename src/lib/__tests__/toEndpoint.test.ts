import { toEndpoint } from "@/lib/transformers/toEndpoint";
import type { MatchDetail, MatchSeed } from "@/lib/types/domain";

const seed: MatchSeed = {
  matchCode: "FBLMTEAM11------------GPA-000100--",
  eventCode: "FBLMTEAM11------------",
  kickoff: "2024-07-24T21:00:00+02:00",
  statusCode: "FT",
  homeTeamCode: "FBLMTEAM11--FRA01",
  homeTeamName: "France",
  awayTeamCode: "FBLMTEAM11--ESP01",
  awayTeamName: "Spain",
  venueName: "Parc des Princes",
  venueCity: "Paris",
};

const detail: MatchDetail = {
  status: "FT",
  scoreHome: 2,
  scoreAway: 1,
  halfTimeHome: 1,
  halfTimeAway: 1,
  scorers: [
    {
      teamCode: "FBLMTEAM11--FRA01",
      player: "Alex Forward",
      minute: 44,
      assist: "Jordan Mid",
      type: "open_play",
    },
  ],
  lineups: [
    {
      teamCode: "FBLMTEAM11--FRA01",
      teamName: "France",
      formation: "4-3-3",
      coach: "Coach Home",
      players: [
        {
          name: "Player One",
          number: 1,
          position: "GK",
          isStarter: true,
          sortOrder: 1,
        },
      ],
    },
    {
      teamCode: "FBLMTEAM11--ESP01",
      teamName: "Spain",
      formation: "4-2-3-1",
      coach: "Coach Away",
      players: [
        {
          name: "Bench Player",
          number: 16,
          position: "MF",
          isStarter: false,
          sortOrder: 16,
        },
      ],
    },
  ],
};

describe("toEndpoint", () => {
  it("maps canonical data into exact endpoint structure", () => {
    const endpoint = toEndpoint(seed, detail, "Group A");

    expect(endpoint.competition.round).toBe("Group A");
    expect(endpoint.teams.home).toBe("France");
    expect(endpoint.score.away).toBe(1);
    expect(endpoint.scorers[0]?.assist).toBe("Jordan Mid");
    expect(endpoint.lineups.home.startingXI).toHaveLength(1);
    expect(endpoint.lineups.away.bench).toHaveLength(1);
  });
});
