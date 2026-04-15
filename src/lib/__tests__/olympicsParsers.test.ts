import {
  deriveRoundFromMatchCode,
  parseMatchDetail,
  parseScheduleSeeds,
} from "@/lib/parsers/olympicsParsers";

describe("olympicsParsers", () => {
  it("parses schedule seeds from start list payload", () => {
    const payload = {
      schedules: [
        {
          code: "FBLMTEAM11------------GPB-000100--",
          startDate: "2024-07-24T15:00:00+02:00",
          status: {
            code: "FINISHED",
          },
          start: [
            {
              startOrder: 1,
              teamCode: "FBLMTEAM11--ARG01",
              participant: {
                name: "Argentina",
              },
            },
            {
              startOrder: 2,
              teamCode: "FBLMTEAM11--MAR01",
              participant: {
                name: "Morocco",
              },
            },
          ],
          venue: {
            description: "Geoffroy-Guichard Stadium",
          },
          location: {
            description: "Geoffroy-Guichard, St-Etienne",
          },
        },
      ],
    };

    const seeds = parseScheduleSeeds(payload);

    expect(seeds).toHaveLength(1);
    expect(seeds[0]?.homeTeamName).toBe("Argentina");
    expect(seeds[0]?.venueCity).toBe("St-Etienne");
  });

  it("extracts basic detail fields from result payload", () => {
    const payload = {
      results: {
        status: {
          code: "OFFICIAL",
        },
        periods: [
          {
            p_code: "H1",
            home: { score: "0" },
            away: { score: "1" },
          },
          {
            p_code: "TOT",
            home: { score: "1" },
            away: { score: "2" },
          },
        ],
        playByPlay: [
          {
            actions: [
              {
                pbpa_Result: "GOAL",
                pbpa_Action: "SHOT",
                pbpa_When: "45' +2",
                competitors: [
                  {
                    pbpc_code: "FBLMTEAM11--MAR01",
                    athletes: [
                      {
                        pbpat_code: "1970731",
                        pbpat_role: "SCR",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            itemType: "T",
            teamCode: "FBLMTEAM11--MAR01",
            participant: {
              name: "Morocco",
            },
            eventUnitEntries: [
              {
                eue_code: "FORMATION",
                eue_value: "4-2-3-1",
              },
            ],
            teamCoaches: [
              {
                function: { functionCode: "COACH" },
                coach: { name: "Coach Morocco" },
              },
            ],
            teamAthletes: [
              {
                participantCode: "1970731",
                bib: "9",
                athlete: {
                  name: "RAHIMI Soufiane",
                },
                eventUnitEntries: [
                  { eue_code: "STARTER", eue_value: "Y" },
                  { eue_code: "POSITION", eue_value: "FW" },
                ],
              },
            ],
          },
        ],
      },
    };

    const detail = parseMatchDetail(payload);

    expect(detail.status).toBe("FT");
    expect(detail.scoreAway).toBe(2);
    expect(detail.scorers[0]?.minute).toBe(47);
    expect(detail.lineups[0]?.formation).toBe("4-2-3-1");
  });

  it("derives round from match code", () => {
    expect(deriveRoundFromMatchCode("FBLMTEAM11------------GPB-000100--")).toBe("Group B");
    expect(deriveRoundFromMatchCode("FBLMTEAM11------------QFNL000100--")).toBe("Quarter-finals");
  });
});
