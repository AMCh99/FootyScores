import { errorMessages } from "@/lib/errors/messages";
import { dedupeByMatchCode, filterFootballMatches } from "@/lib/filters/footballFilter";
import { endpointTemplates, OLYMPICS_LABELS_URL } from "@/lib/constants/endpoints";
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
  MatchDetail,
  MatchSeed,
  MatchSourceContext,
  GenerationResult,
  GeneratedMatchRecord,
  MatchSourceSummary,
  RoundResolutionTrace,
} from "@/lib/types/domain";

interface GenerateMatchEndpointsOptions {
  includeSourceContext?: boolean;
}

function buildSourceSummary(record: GeneratedMatchRecord): MatchSourceSummary {
  return {
    matchCode: record.source.matchCode,
    eventCode: record.source.eventCode,
    kickoff: record.source.kickoff,
    homeTeam: record.source.homeTeam,
    awayTeam: record.source.awayTeam,
    status: record.source.status,
    round: record.source.round,
    sourceMode: "official",
    sourceContext: record.source.sourceContext,
  };
}

function buildRoundResolutionTrace(
  roundFromPhaseOrUnits: string | null,
  roundFromEventGames: string | null,
  fallbackRound: string,
  finalRound: string,
): RoundResolutionTrace {
  return {
    fromPhaseOrUnits: roundFromPhaseOrUnits,
    fromEventGames: roundFromEventGames,
    fallbackFromMatchCode: fallbackRound,
    finalRound,
  };
}

function buildSourceContext(
  seed: MatchSeed,
  detail: MatchDetail,
  mergedDetail: MatchDetail,
  detailPayload: unknown | undefined,
  eventGameSummary: {
    scoreHome: number;
    scoreAway: number;
    status: string;
    round: string;
  } | undefined,
  roundResolution: RoundResolutionTrace,
  payloads: Awaited<ReturnType<typeof retrieveOlympicPayloads>>,
): MatchSourceContext {
  return {
    sourceEndpoints: {
      startList: endpointTemplates.startList(),
      eventUnits: endpointTemplates.eventUnits(),
      eventGames: endpointTemplates.eventGames(seed.eventCode),
      phases: endpointTemplates.phases(seed.eventCode),
      resultByMatch: endpointTemplates.resultByMatch(seed.matchCode),
      labels: OLYMPICS_LABELS_URL,
    },
    seed,
    parsedDetail: detail,
    mergedDetail,
    eventGameSummary: eventGameSummary ?? null,
    rawPayloads: {
      eventUnits: payloads.eventUnitsPayload,
      eventGames: payloads.eventGamesPayloadByEventCode?.get(seed.eventCode) ?? null,
      phases: payloads.phasePayloadByEventCode?.get(seed.eventCode) ?? null,
      resultByMatch: detailPayload ?? null,
      labels: payloads.labelsPayload,
    },
    roundResolution,
  };
}

export async function generateMatchEndpoints(
  options: GenerateMatchEndpointsOptions = {},
): Promise<GenerationResult> {
  const includeSourceContext = options.includeSourceContext === true;
  const payloads = await retrieveOlympicPayloads();

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
    const eventGameSummary = eventGameSummaryLookup.get(seed.matchCode);
    const mergedDetail = mergeDetailWithSummary(detail, eventGameSummary);
    const roundFromPhaseOrUnits = roundLookup.get(seed.matchCode) ?? null;
    const roundFromEventGames = eventGameSummary?.round ?? null;
    const fallbackRound = deriveRoundFromMatchCode(seed.matchCode);

    const round =
      roundFromPhaseOrUnits ??
      roundFromEventGames ??
      fallbackRound;

    const roundResolution = buildRoundResolutionTrace(
      roundFromPhaseOrUnits,
      roundFromEventGames,
      fallbackRound,
      round,
    );

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
        sourceMode: "official",
        sourceContext: includeSourceContext
          ? buildSourceContext(
              seed,
              detail,
              mergedDetail,
              detailPayload,
              eventGameSummary,
              roundResolution,
              payloads,
            )
          : undefined,
      },
      endpoint,
    };
  });

  const sorted = sortGeneratedMatches(records);

  return {
    diagnostics: {
      sourceMode: payloads.sourceMode,
      generatedAt: new Date().toISOString(),
      totalMatches: sorted.length,
      failedEndpoints: payloads.failedEndpoints,
    },
    matches: sorted.map((record) => ({
      source: buildSourceSummary(record),
      endpoint: record.endpoint,
    })),
  };
}
