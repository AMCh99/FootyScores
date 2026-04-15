import { dedupeByMatchCode, filterFootballMatches } from "@/lib/filters/footballFilter";
import type { MatchSeed } from "@/lib/types/domain";

const baseSeed: MatchSeed = {
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

describe("football filters", () => {
  it("keeps only football seeds", () => {
    const mixed: MatchSeed[] = [
      baseSeed,
      {
        ...baseSeed,
        matchCode: "TENMSINGLES-----------R16-000100--",
        eventCode: "TENMSINGLES-----------",
      },
    ];

    const filtered = filterFootballMatches(mixed);

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.matchCode).toBe(baseSeed.matchCode);
  });

  it("deduplicates matches by match code", () => {
    const deduped = dedupeByMatchCode([
      baseSeed,
      {
        ...baseSeed,
        venueCity: "Lyon",
      },
    ]);

    expect(deduped).toHaveLength(1);
    expect(deduped[0]?.venueCity).toBe("Paris");
  });
});
