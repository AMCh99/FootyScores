import { readFileSync } from "node:fs";
import path from "node:path";

import { dedupeByMatchCode, filterFootballMatches } from "@/lib/filters/footballFilter";
import { parseScheduleSeeds } from "@/lib/parsers/olympicsParsers";
import { generateMatchEndpoints } from "@/lib/pipeline/generateEndpoints";
import { retrieveOlympicPayloads } from "@/lib/source/olympicsSource";
import type { RetrievedOlympicPayloads } from "@/lib/source/olympicsSource";
import type { GeneratedMatchRecord } from "@/lib/types/domain";
import type { MatchEndpoint } from "@/lib/types/endpoint";

jest.mock("@/lib/source/olympicsSource", () => ({
  retrieveOlympicPayloads: jest.fn(),
}));

const mockedRetrieveOlympicPayloads = jest.mocked(retrieveOlympicPayloads);

const START_LIST_FIXTURE_FILE = "SCH_StartList~comp=OG2024~disc=FBL~lang=ENG.json";

function readJsonFixture(fileName: string): unknown {
  const fixturePath = path.resolve(process.cwd(), "api_examples", fileName);

  return JSON.parse(readFileSync(fixturePath, "utf8")) as unknown;
}

function createSchedule(
  matchCode: string,
  kickoff: string,
  homeTeamCode: string,
  homeTeamName: string,
  awayTeamCode: string,
  awayTeamName: string,
): unknown {
  return {
    code: matchCode,
    startDate: kickoff,
    status: {
      code: "SCHEDULED",
    },
    start: [
      {
        startOrder: 1,
        teamCode: homeTeamCode,
        participant: {
          name: homeTeamName,
        },
      },
      {
        startOrder: 2,
        teamCode: awayTeamCode,
        participant: {
          name: awayTeamName,
        },
      },
    ],
    venue: {
      description: "Parc des Princes",
    },
    location: {
      description: "Paris, France",
    },
  };
}

function createMockPayloads(): RetrievedOlympicPayloads {
  return {
    sourceMode: "official",
    failedEndpoints: [],
    startListPayload: {
      schedules: [
        createSchedule(
          "FBLMTEAM11------------GPB-000300--",
          "2024-07-26T21:00:00+02:00",
          "FBLMTEAM11--JPN01",
          "Japan",
          "FBLMTEAM11--BRA01",
          "Brazil",
        ),
        createSchedule(
          "FBLMTEAM11------------GPA-000100--",
          "2024-07-24T19:00:00+02:00",
          "FBLMTEAM11--ARG01",
          "Argentina",
          "FBLMTEAM11--MAR01",
          "Morocco",
        ),
        createSchedule(
          "FBLMTEAM11------------GPA-000200--",
          "2024-07-26T21:00:00+02:00",
          "FBLMTEAM11--AUS01",
          "Australia",
          "FBLMTEAM11--USA01",
          "United States",
        ),
        createSchedule(
          "FBLMTEAM11------------GPA-000100--",
          "2024-07-24T19:00:00+02:00",
          "FBLMTEAM11--ARG01",
          "Argentina",
          "FBLMTEAM11--MAR01",
          "Morocco",
        ),
      ],
    },
    eventUnitsPayload: {},
    eventGamesPayloads: [],
    phasePayloads: [],
    resultPayloadByMatchCode: new Map<string, unknown>(),
    labelsPayload: {},
  };
}

function createOfficialFixturePayloads(): RetrievedOlympicPayloads {
  return {
    sourceMode: "official",
    failedEndpoints: [],
    startListPayload: readJsonFixture(START_LIST_FIXTURE_FILE),
    eventUnitsPayload: {},
    eventGamesPayloads: [],
    phasePayloads: [],
    resultPayloadByMatchCode: new Map<string, unknown>(),
    labelsPayload: {},
  };
}

function compareRecords(left: GeneratedMatchRecord, right: GeneratedMatchRecord): number {
  const kickoffDiff = Date.parse(left.endpoint.kickoff) - Date.parse(right.endpoint.kickoff);

  if (kickoffDiff !== 0) {
    return kickoffDiff;
  }

  const homeDiff = left.endpoint.teams.home.localeCompare(right.endpoint.teams.home, "en");

  if (homeDiff !== 0) {
    return homeDiff;
  }

  return left.endpoint.teams.away.localeCompare(right.endpoint.teams.away, "en");
}

function assertEndpointSchema(endpoint: MatchEndpoint): void {
  expect(Object.keys(endpoint).sort()).toEqual(
    ["competition", "venue", "kickoff", "status", "teams", "score", "scorers", "lineups"].sort(),
  );

  expect(Object.keys(endpoint.competition).sort()).toEqual(["name", "season", "round"].sort());
  expect(Object.keys(endpoint.venue).sort()).toEqual(["name", "city"].sort());
  expect(Object.keys(endpoint.teams).sort()).toEqual(["home", "away"].sort());
  expect(Object.keys(endpoint.score).sort()).toEqual(["home", "away", "halfTime"].sort());
  expect(Object.keys(endpoint.score.halfTime).sort()).toEqual(["home", "away"].sort());
  expect(Object.keys(endpoint.lineups).sort()).toEqual(["home", "away"].sort());

  for (const side of [endpoint.lineups.home, endpoint.lineups.away]) {
    expect(Object.keys(side).sort()).toEqual(
      ["team", "formation", "coach", "startingXI", "bench"].sort(),
    );

    for (const player of [...side.startingXI, ...side.bench]) {
      expect(Object.keys(player).sort()).toEqual(["name", "number", "position"].sort());
      expect(typeof player.name).toBe("string");
      expect(typeof player.number).toBe("number");
      expect(typeof player.position).toBe("string");
    }
  }

  for (const scorer of endpoint.scorers) {
    const keys = Object.keys(scorer).sort();
    const validWithoutAssist = ["team", "player", "minute", "type"].sort();
    const validWithAssist = ["team", "player", "minute", "assist", "type"].sort();

    const isValidShape =
      JSON.stringify(keys) === JSON.stringify(validWithoutAssist) ||
      JSON.stringify(keys) === JSON.stringify(validWithAssist);

    expect(isValidShape).toBe(true);

    expect(typeof scorer.team).toBe("string");
    expect(typeof scorer.player).toBe("string");
    expect(typeof scorer.minute).toBe("number");
    expect(typeof scorer.type).toBe("string");

    if ("assist" in scorer) {
      expect(typeof scorer.assist).toBe("string");
    }
  }
}

describe("generateMatchEndpoints (official source integration)", () => {
  beforeEach(() => {
    mockedRetrieveOlympicPayloads.mockResolvedValue(createMockPayloads());
  });

  afterEach(() => {
    mockedRetrieveOlympicPayloads.mockReset();
  });

  it("covers football matches without duplicates", async () => {
    const result = await generateMatchEndpoints();
    const matchCodes = result.matches.map((record) => record.source.matchCode);

    expect(result.diagnostics.sourceMode).toBe("official");
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches.length).toBe(result.diagnostics.totalMatches);
    expect(new Set(matchCodes).size).toBe(matchCodes.length);
    expect(matchCodes.every((matchCode) => matchCode.startsWith("FBL"))).toBe(true);
  });

  it("returns deterministically sorted results", async () => {
    const result = await generateMatchEndpoints();

    for (let index = 1; index < result.matches.length; index += 1) {
      const left = result.matches[index - 1];
      const right = result.matches[index];

      expect(compareRecords(left, right)).toBeLessThanOrEqual(0);
    }
  });

  it("generates endpoints that match the example schema shape", async () => {
    const result = await generateMatchEndpoints();

    for (const record of result.matches) {
      const serializedEndpoint = JSON.parse(JSON.stringify(record.endpoint)) as MatchEndpoint;

      assertEndpointSchema(serializedEndpoint);
    }
  });

  it("covers all playable Paris 2024 football matches from official start list fixture", async () => {
    const fixturePayloads = createOfficialFixturePayloads();
    const fixtureSeeds = dedupeByMatchCode(filterFootballMatches(parseScheduleSeeds(fixturePayloads.startListPayload)));
    const expectedMatchCodes = fixtureSeeds.map((seed) => seed.matchCode).sort();

    mockedRetrieveOlympicPayloads.mockResolvedValue(fixturePayloads);

    const result = await generateMatchEndpoints();
    const generatedMatchCodes = result.matches.map((record) => record.source.matchCode).sort();

    expect(generatedMatchCodes).toEqual(expectedMatchCodes);
    expect(result.matches.length).toBe(58);
    expect(result.diagnostics.totalMatches).toBe(58);
    expect(generatedMatchCodes.some((code) => code.includes("VICT"))).toBe(false);
    expect(generatedMatchCodes.filter((code) => code.startsWith("FBLM"))).toHaveLength(32);
    expect(generatedMatchCodes.filter((code) => code.startsWith("FBLW"))).toHaveLength(26);
  });
});
