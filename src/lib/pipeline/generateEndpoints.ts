import { errorMessages } from "@/lib/errors/messages";
import { dedupeByMatchCode, filterFootballMatches } from "@/lib/filters/footballFilter";
import {
  buildEventGameSummaryLookup,
  buildRoundLookup,
  createEmptyMatchDetail,
  deriveRoundFromMatchCode,
  mergeDetailWithSummary,
  parseMatchDetail,
  parseScheduleSeeds,
} from "@/lib/parsers/olympicsParsers";
import { sortGeneratedMatches } from "@/lib/sorters/orderEndpoints";
import { retrieveOlympicPayloads } from "@/lib/source/olympicsSource";
import { toEndpoint } from "@/lib/transformers/toEndpoint";
import type {
  GenerationResult,
  GeneratedMatchRecord,
  MatchSourceSummary,
  SourceMode,
} from "@/lib/types/domain";

function buildSourceSummary(
  record: GeneratedMatchRecord,
  sourceMode: SourceMode,
  round: string,
): MatchSourceSummary {
  return {
    matchCode: record.source.matchCode,
    eventCode: record.source.eventCode,
    kickoff: record.source.kickoff,
    homeTeam: record.source.homeTeam,
    awayTeam: record.source.awayTeam,
    status: record.source.status,
    round,
    sourceMode,
  };
}

export async function generateMatchEndpoints(preferredMode: SourceMode): Promise<GenerationResult> {
  const payloads = await retrieveOlympicPayloads(preferredMode);

  let seeds;

  try {
    seeds = parseScheduleSeeds(payloads.startListPayload);
  } catch {
    throw new Error(errorMessages.invalidSchedulePayload);
  }

  const footballSeeds = dedupeByMatchCode(filterFootballMatches(seeds));
  const roundLookup = buildRoundLookup(payloads.phasePayloads, payloads.eventUnitsPayload);
  const eventGameSummaryLookup = buildEventGameSummaryLookup(payloads.eventGamesPayloads);

  const records: GeneratedMatchRecord[] = footballSeeds.map((seed) => {
    const detailPayload = payloads.resultPayloadByMatchCode.get(seed.matchCode);
    const detail = detailPayload ? parseMatchDetail(detailPayload) : createEmptyMatchDetail();
    const mergedDetail = mergeDetailWithSummary(detail, eventGameSummaryLookup.get(seed.matchCode));

    const round =
      roundLookup.get(seed.matchCode) ??
      eventGameSummaryLookup.get(seed.matchCode)?.round ??
      deriveRoundFromMatchCode(seed.matchCode);

    const endpoint = toEndpoint(seed, mergedDetail, round);

    return {
      source: {
        matchCode: seed.matchCode,
        eventCode: seed.eventCode,
        kickoff: seed.kickoff,
        homeTeam: seed.homeTeamName,
        awayTeam: seed.awayTeamName,
        status: endpoint.status,
        round,
        sourceMode: payloads.sourceMode,
      },
      endpoint,
    };
  });

  const sorted = sortGeneratedMatches(records);

  return {
    diagnostics: {
      sourceMode: payloads.sourceMode,
      fallbackUsed: payloads.fallbackUsed,
      generatedAt: new Date().toISOString(),
      totalMatches: sorted.length,
      failedEndpoints: payloads.failedEndpoints,
    },
    matches: sorted.map((record) => ({
      source: buildSourceSummary(record, payloads.sourceMode, record.source.round),
      endpoint: record.endpoint,
    })),
  };
}
