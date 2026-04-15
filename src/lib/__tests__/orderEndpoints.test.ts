import { sortGeneratedMatches } from "@/lib/sorters/orderEndpoints";
import type { GeneratedMatchRecord } from "@/lib/types/domain";

const baseRecord: GeneratedMatchRecord = {
  source: {
    matchCode: "FBLMTEAM11------------GPA-000100--",
    eventCode: "FBLMTEAM11------------",
    kickoff: "2024-07-24T21:00:00+02:00",
    homeTeam: "France",
    awayTeam: "Spain",
    status: "FT",
    round: "Group A",
    sourceMode: "official",
  },
  endpoint: {
    competition: {
      name: "Olympic Football Tournament",
      season: "2024",
      round: "Group A",
    },
    venue: {
      name: "Parc des Princes",
      city: "Paris",
    },
    kickoff: "2024-07-24T21:00:00+02:00",
    status: "FT",
    teams: {
      home: "France",
      away: "Spain",
    },
    score: {
      home: 1,
      away: 0,
      halfTime: {
        home: 1,
        away: 0,
      },
    },
    scorers: [],
    lineups: {
      home: {
        team: "France",
        formation: "4-3-3",
        coach: "Coach A",
        startingXI: [],
        bench: [],
      },
      away: {
        team: "Spain",
        formation: "4-3-3",
        coach: "Coach B",
        startingXI: [],
        bench: [],
      },
    },
  },
};

describe("sortGeneratedMatches", () => {
  it("sorts by kickoff, then home, then away", () => {
    const records: GeneratedMatchRecord[] = [
      {
        ...baseRecord,
        source: {
          ...baseRecord.source,
          matchCode: "FBLMTEAM11------------GPA-000300--",
          homeTeam: "Brazil",
          awayTeam: "Japan",
        },
        endpoint: {
          ...baseRecord.endpoint,
          teams: {
            home: "Brazil",
            away: "Japan",
          },
        },
      },
      {
        ...baseRecord,
        source: {
          ...baseRecord.source,
          matchCode: "FBLMTEAM11------------GPA-000200--",
          homeTeam: "Argentina",
          awayTeam: "Mali",
        },
        endpoint: {
          ...baseRecord.endpoint,
          teams: {
            home: "Argentina",
            away: "Mali",
          },
        },
      },
      {
        ...baseRecord,
        source: {
          ...baseRecord.source,
          matchCode: "FBLMTEAM11------------GPA-000100--",
          kickoff: "2024-07-24T19:00:00+02:00",
          homeTeam: "France",
          awayTeam: "Spain",
        },
        endpoint: {
          ...baseRecord.endpoint,
          kickoff: "2024-07-24T19:00:00+02:00",
          teams: {
            home: "France",
            away: "Spain",
          },
        },
      },
    ];

    const sorted = sortGeneratedMatches(records);

    expect(sorted[0]?.endpoint.kickoff).toBe("2024-07-24T19:00:00+02:00");
    expect(sorted[1]?.endpoint.teams.home).toBe("Argentina");
    expect(sorted[2]?.endpoint.teams.home).toBe("Brazil");
  });
});
