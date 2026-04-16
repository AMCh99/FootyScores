import { compareGeneratedWithTested } from "@/lib/comparison/jsonComparison";
import type { GeneratedMatchRecord } from "@/lib/types/domain";
import type { MatchEndpoint } from "@/lib/types/endpoint";

function createEndpoint(home: string, away: string, scoreHome: number): MatchEndpoint {
  return {
    competition: {
      name: "Olympic Football Tournament",
      season: "2024",
      round: "Group A",
    },
    venue: {
      name: "Parc des Princes",
      city: "Paris",
    },
    kickoff: "2024-07-24T19:00:00+02:00",
    status: "FT",
    teams: {
      home,
      away,
    },
    score: {
      home: scoreHome,
      away: 0,
      halfTime: {
        home: 0,
        away: 0,
      },
    },
    scorers: [],
    lineups: {
      home: {
        team: home,
        formation: "4-3-3",
        coach: "Coach Home",
        startingXI: [],
        bench: [],
      },
      away: {
        team: away,
        formation: "4-2-3-1",
        coach: "Coach Away",
        startingXI: [],
        bench: [],
      },
    },
  };
}

function createRecord(matchCode: string, endpoint: MatchEndpoint): GeneratedMatchRecord {
  return {
    source: {
      matchCode,
      eventCode: matchCode.slice(0, 22),
      kickoff: endpoint.kickoff,
      homeTeam: endpoint.teams.home,
      awayTeam: endpoint.teams.away,
      status: endpoint.status,
      round: endpoint.competition.round,
      sourceMode: "official",
    },
    endpoint,
  };
}

describe("compareGeneratedWithTested", () => {
  it("compares by match code when tested payload includes source metadata", () => {
    const generated = [
      createRecord("FBLMTEAM11------------GPA-000100--", createEndpoint("Argentina", "Morocco", 2)),
      createRecord("FBLMTEAM11------------GPA-000200--", createEndpoint("France", "USA", 1)),
    ];

    const testedPayload = {
      matches: [
        {
          source: {
            matchCode: "FBLMTEAM11------------GPA-000100--",
          },
          endpoint: createEndpoint("Argentina", "Morocco", 1),
        },
        {
          source: {
            matchCode: "FBLMTEAM11------------GPA-000200--",
          },
          endpoint: createEndpoint("France", "USA", 1),
        },
      ],
    };

    const comparison = compareGeneratedWithTested(generated, testedPayload, "https://tested.example/api");

    expect(comparison.diagnostics.strategy).toBe("by-match-code");
    expect(comparison.diagnostics.comparedMatches).toBe(2);
    expect(comparison.diagnostics.mismatchedMatches).toBe(1);
    expect(comparison.matches[0]?.differenceCount).toBeGreaterThan(0);
    expect(comparison.matches[0]?.differences[0]?.path).toBe("$.score.home");
    expect(comparison.passed).toBe(false);
  });

  it("compares by order when tested payload is an endpoint array", () => {
    const generated = [
      createRecord("FBLMTEAM11------------GPA-000100--", createEndpoint("Argentina", "Morocco", 2)),
      createRecord("FBLMTEAM11------------GPA-000200--", createEndpoint("France", "USA", 1)),
    ];

    const testedPayload = [
      createEndpoint("Argentina", "Morocco", 2),
      createEndpoint("France", "USA", 1),
    ];

    const comparison = compareGeneratedWithTested(generated, testedPayload, "https://tested.example/api");

    expect(comparison.diagnostics.strategy).toBe("by-order");
    expect(comparison.diagnostics.mismatchedMatches).toBe(0);
    expect(comparison.passed).toBe(true);
  });

  it("reports missing and extra entries for code-based comparison", () => {
    const generated = [
      createRecord("FBLMTEAM11------------GPA-000100--", createEndpoint("Argentina", "Morocco", 2)),
      createRecord("FBLMTEAM11------------GPA-000200--", createEndpoint("France", "USA", 1)),
    ];

    const testedPayload = {
      matches: [
        {
          source: {
            matchCode: "FBLMTEAM11------------GPA-000100--",
          },
          endpoint: createEndpoint("Argentina", "Morocco", 2),
        },
        {
          source: {
            matchCode: "FBLMTEAM11------------GPA-999999--",
          },
          endpoint: createEndpoint("Extra", "Entry", 0),
        },
      ],
    };

    const comparison = compareGeneratedWithTested(generated, testedPayload, "https://tested.example/api");

    expect(comparison.diagnostics.missingInTested).toEqual(["FBLMTEAM11------------GPA-000200--"]);
    expect(comparison.diagnostics.extraInTested).toEqual(["FBLMTEAM11------------GPA-999999--"]);
    expect(comparison.passed).toBe(false);
  });

  it("can ignore extra tested entries for single-match checks", () => {
    const generated = [
      createRecord("FBLMTEAM11------------GPA-000100--", createEndpoint("Argentina", "Morocco", 2)),
    ];

    const testedPayload = {
      matches: [
        {
          source: {
            matchCode: "FBLMTEAM11------------GPA-000100--",
          },
          endpoint: createEndpoint("Argentina", "Morocco", 2),
        },
        {
          source: {
            matchCode: "FBLMTEAM11------------GPA-999999--",
          },
          endpoint: createEndpoint("Extra", "Entry", 0),
        },
      ],
    };

    const comparison = compareGeneratedWithTested(generated, testedPayload, "https://tested.example/api", {
      ignoreExtraInTested: true,
    });

    expect(comparison.diagnostics.extraInTested).toEqual([]);
    expect(comparison.passed).toBe(true);
  });
});