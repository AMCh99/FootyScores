import { errorMessages } from "@/lib/errors/messages";
import type {
  LineupPlayerSeed,
  MatchDetail,
  MatchSeed,
  ScorerSeed,
  TeamLineupSeed,
} from "@/lib/types/domain";

type JsonRecord = Record<string, unknown>;

export interface EventGameSummary {
  scoreHome: number;
  scoreAway: number;
  status: string;
  round: string;
}

const EVENT_CODE_LENGTH = 22;

const KNOWN_POSITIONS = new Set([
  "GK",
  "RB",
  "LB",
  "CB",
  "RWB",
  "LWB",
  "DM",
  "CM",
  "AM",
  "RW",
  "LW",
  "ST",
  "FW",
  "DF",
  "MF",
]);

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function parseVenueCity(locationDescription: string): string {
  const parts = locationDescription
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length < 2) {
    return "Unknown";
  }

  return parts[parts.length - 1] ?? "Unknown";
}

function extractMinute(minuteLabel: string): number {
  const cleaned = minuteLabel.replace(/\s+/g, "");

  const plusMatch = cleaned.match(/(\d+)'\+(\d+)/);

  if (plusMatch) {
    const base = Number.parseInt(plusMatch[1] ?? "0", 10);
    const extra = Number.parseInt(plusMatch[2] ?? "0", 10);

    return base + extra;
  }

  const singleMatch = cleaned.match(/(\d+)'/);

  if (singleMatch) {
    return Number.parseInt(singleMatch[1] ?? "0", 10);
  }

  return 0;
}

function normalizeStatus(status: string): string {
  const upper = status.toUpperCase();

  if (upper === "FINISHED" || upper === "OFFICIAL") {
    return "FT";
  }

  if (upper === "SCHEDULED") {
    return "NS";
  }

  if (upper === "HALF_TIME") {
    return "HT";
  }

  if (upper.length === 0) {
    return "NS";
  }

  return status;
}

function inferGoalType(action: string, comment: string): string {
  const upperAction = action.toUpperCase();
  const upperComment = comment.toUpperCase();

  if (upperAction.includes("PEN")) {
    return "penalty";
  }

  if (upperAction.includes("HEAD") || upperComment.includes("HEADER")) {
    return "header";
  }

  return "open_play";
}

function findEntryValue(entries: unknown[], code: string): string {
  for (const entry of entries) {
    if (!isRecord(entry)) {
      continue;
    }

    const entryCode = asString(entry.eue_code);

    if (entryCode !== code) {
      continue;
    }

    return asString(entry.eue_value);
  }

  return "";
}

function extractPosition(entries: unknown[]): string {
  const values = entries
    .filter(isRecord)
    .filter((entry) => asString(entry.eue_code) === "POSITION")
    .map((entry) => asString(entry.eue_value))
    .filter((value) => value.length > 0);

  const known = values.find((value) => KNOWN_POSITIONS.has(value));

  if (known) {
    return known;
  }

  const first = values[0];

  return first ?? "Unknown";
}

function extractRoundToken(matchCode: string): string {
  if (matchCode.length < EVENT_CODE_LENGTH + 4) {
    return "";
  }

  return matchCode.slice(EVENT_CODE_LENGTH, EVENT_CODE_LENGTH + 4);
}

export function deriveRoundFromMatchCode(matchCode: string): string {
  const roundToken = extractRoundToken(matchCode);

  if (roundToken.startsWith("GP") && roundToken.length >= 3) {
    const groupLetter = roundToken.charAt(2);

    if (groupLetter) {
      return `Group ${groupLetter}`;
    }
  }

  if (roundToken === "QFNL") {
    return "Quarter-finals";
  }

  if (roundToken === "SFNL") {
    return "Semi-finals";
  }

  if (roundToken === "FNL-") {
    if (matchCode.includes("000100")) {
      return "Gold Medal Match";
    }

    if (matchCode.includes("000200")) {
      return "Bronze Medal Match";
    }

    return "Finals";
  }

  return "Unknown";
}

function extractStatusFromExtendedInfos(value: unknown): string {
  const entries = asArray(value);

  for (const entry of entries) {
    if (!isRecord(entry)) {
      continue;
    }

    const code = asString(entry.ei_code);

    if (code !== "PERIOD") {
      continue;
    }

    return normalizeStatus(asString(entry.ei_value));
  }

  return "";
}

function extractTeamBasics(startEntry: unknown): { code: string; name: string } {
  if (!isRecord(startEntry)) {
    return {
      code: "",
      name: "Unknown",
    };
  }

  const participant = isRecord(startEntry.participant) ? startEntry.participant : {};

  return {
    code: asString(startEntry.teamCode, asString(participant.code)),
    name: asString(participant.name, "Unknown"),
  };
}

function sortByStartOrder(left: unknown, right: unknown): number {
  const leftRecord = isRecord(left) ? left : {};
  const rightRecord = isRecord(right) ? right : {};
  const leftOrder = asNumber(leftRecord.startOrder, asNumber(leftRecord.sortOrder, 999));
  const rightOrder = asNumber(rightRecord.startOrder, asNumber(rightRecord.sortOrder, 999));

  return leftOrder - rightOrder;
}

export function parseScheduleSeeds(payload: unknown): MatchSeed[] {
  if (!isRecord(payload)) {
    throw new Error(errorMessages.invalidSchedulePayload);
  }

  const schedules = asArray(payload.schedules);

  if (schedules.length === 0) {
    throw new Error(errorMessages.invalidSchedulePayload);
  }

  const seeds: MatchSeed[] = [];

  for (const scheduleValue of schedules) {
    if (!isRecord(scheduleValue)) {
      continue;
    }

    const matchCode = asString(scheduleValue.code);

    if (matchCode.length === 0) {
      continue;
    }

    const startEntries = asArray(scheduleValue.start).sort(sortByStartOrder);
    const homeSource = extractTeamBasics(startEntries[0]);
    const awaySource = extractTeamBasics(startEntries[1]);

    if (homeSource.code.length === 0 || awaySource.code.length === 0) {
      continue;
    }

    const status = isRecord(scheduleValue.status) ? scheduleValue.status : {};
    const venue = isRecord(scheduleValue.venue) ? scheduleValue.venue : {};
    const location = isRecord(scheduleValue.location) ? scheduleValue.location : {};
    const locationDescription = asString(location.description);

    seeds.push({
      matchCode,
      eventCode: matchCode.slice(0, EVENT_CODE_LENGTH),
      kickoff: asString(scheduleValue.startDate),
      statusCode: normalizeStatus(asString(status.code)),
      homeTeamCode: homeSource.code,
      homeTeamName: homeSource.name,
      awayTeamCode: awaySource.code,
      awayTeamName: awaySource.name,
      venueName: asString(venue.description, "Unknown"),
      venueCity: parseVenueCity(locationDescription),
    });
  }

  return seeds;
}

function extractTeamCoach(teamCoaches: unknown[]): string {
  for (const coachEntry of teamCoaches) {
    if (!isRecord(coachEntry)) {
      continue;
    }

    const functionInfo = isRecord(coachEntry.function) ? coachEntry.function : {};
    const functionCode = asString(functionInfo.functionCode);

    if (functionCode !== "COACH") {
      continue;
    }

    const coach = isRecord(coachEntry.coach) ? coachEntry.coach : {};

    return asString(coach.name, "Unknown");
  }

  const first = teamCoaches.find(isRecord);

  if (!first) {
    return "Unknown";
  }

  const coach = isRecord(first.coach) ? first.coach : {};

  return asString(coach.name, "Unknown");
}

function parseTeamAthlete(entry: unknown): LineupPlayerSeed | null {
  if (!isRecord(entry)) {
    return null;
  }

  const athlete = isRecord(entry.athlete) ? entry.athlete : {};
  const eventUnitEntries = asArray(entry.eventUnitEntries);
  const starterMarker = findEntryValue(eventUnitEntries, "STARTER");

  return {
    name: asString(athlete.name, "Unknown"),
    number: asNumber(entry.bib, 0),
    position: extractPosition(eventUnitEntries),
    isStarter: starterMarker === "Y",
    sortOrder: asNumber(entry.startSortOrder, asNumber(entry.order, 999)),
  };
}

function parseTeamLineup(item: unknown): TeamLineupSeed | null {
  if (!isRecord(item)) {
    return null;
  }

  const participant = isRecord(item.participant) ? item.participant : {};
  const eventUnitEntries = asArray(item.eventUnitEntries);

  const players = asArray(item.teamAthletes)
    .map(parseTeamAthlete)
    .filter((player): player is LineupPlayerSeed => player !== null)
    .sort((left, right) => left.sortOrder - right.sortOrder);

  return {
    teamCode: asString(item.teamCode),
    teamName: asString(participant.name, "Unknown"),
    formation: findEntryValue(eventUnitEntries, "FORMATION") || "Unknown",
    coach: extractTeamCoach(asArray(item.teamCoaches)),
    players,
  };
}

function buildAthleteNameByCode(items: unknown[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const item of items) {
    if (!isRecord(item)) {
      continue;
    }

    const athletes = asArray(item.teamAthletes);

    for (const athleteEntry of athletes) {
      if (!isRecord(athleteEntry)) {
        continue;
      }

      const athlete = isRecord(athleteEntry.athlete) ? athleteEntry.athlete : {};
      const code = asString(athleteEntry.participantCode);

      if (code.length === 0) {
        continue;
      }

      map.set(code, asString(athlete.name, "Unknown"));
    }
  }

  return map;
}

function extractGoalScorers(
  playByPlayValue: unknown,
  athleteNameByCode: Map<string, string>,
): ScorerSeed[] {
  const scorers: ScorerSeed[] = [];
  const playByPlay = asArray(playByPlayValue);

  for (const periodEntry of playByPlay) {
    if (!isRecord(periodEntry)) {
      continue;
    }

    const actions = asArray(periodEntry.actions);

    for (const actionEntry of actions) {
      if (!isRecord(actionEntry)) {
        continue;
      }

      if (asString(actionEntry.pbpa_Result) !== "GOAL") {
        continue;
      }

      const competitors = asArray(actionEntry.competitors);
      const team = competitors.find(isRecord);

      if (!team) {
        continue;
      }

      const athletes = asArray(team.athletes).filter(isRecord);
      const scorerAthlete = athletes.find((athlete) => asString(athlete.pbpat_role) === "SCR");
      const assistAthlete = athletes.find((athlete) => asString(athlete.pbpat_role) === "ASSIST");
      const scorerCode = scorerAthlete ? asString(scorerAthlete.pbpat_code) : "";
      const assistCode = assistAthlete ? asString(assistAthlete.pbpat_code) : "";
      const assistName = athleteNameByCode.get(assistCode);

      scorers.push({
        teamCode: asString(team.pbpc_code),
        player: athleteNameByCode.get(scorerCode) ?? "Unknown",
        minute: extractMinute(asString(actionEntry.pbpa_When)),
        assist: assistName,
        type: inferGoalType(asString(actionEntry.pbpa_Action), asString(actionEntry.pbpa_Comment)),
      });
    }
  }

  const dedupeKey = new Set<string>();

  return scorers
    .filter((entry) => {
      const key = `${entry.teamCode}|${entry.player}|${entry.minute}`;

      if (dedupeKey.has(key)) {
        return false;
      }

      dedupeKey.add(key);
      return true;
    })
    .sort((left, right) => left.minute - right.minute);
}

function parseScoreFromPeriods(periodsValue: unknown): {
  scoreHome: number;
  scoreAway: number;
  halfTimeHome: number;
  halfTimeAway: number;
} {
  const periods = asArray(periodsValue).filter(isRecord);
  const totalPeriod = periods.find((period) => asString(period.p_code) === "TOT");
  const firstHalfPeriod = periods.find((period) => asString(period.p_code) === "H1");

  const totalHome = isRecord(totalPeriod?.home) ? totalPeriod.home : {};
  const totalAway = isRecord(totalPeriod?.away) ? totalPeriod.away : {};
  const firstHalfHome = isRecord(firstHalfPeriod?.home) ? firstHalfPeriod.home : {};
  const firstHalfAway = isRecord(firstHalfPeriod?.away) ? firstHalfPeriod.away : {};

  return {
    scoreHome: asNumber(totalHome.score, 0),
    scoreAway: asNumber(totalAway.score, 0),
    halfTimeHome: asNumber(firstHalfHome.score, 0),
    halfTimeAway: asNumber(firstHalfAway.score, 0),
  };
}

export function createEmptyMatchDetail(): MatchDetail {
  return {
    status: "NS",
    scoreHome: 0,
    scoreAway: 0,
    halfTimeHome: 0,
    halfTimeAway: 0,
    scorers: [],
    lineups: [],
  };
}

export function parseMatchDetail(payload: unknown): MatchDetail {
  if (!isRecord(payload) || !isRecord(payload.results)) {
    return createEmptyMatchDetail();
  }

  const results = payload.results;
  const items = asArray(results.items);
  const lineups = items
    .map(parseTeamLineup)
    .filter((lineup): lineup is TeamLineupSeed => lineup !== null);

  const score = parseScoreFromPeriods(results.periods);
  const extendedStatus = extractStatusFromExtendedInfos(results.extendedInfos);
  const statusRecord = isRecord(results.status) ? results.status : {};
  const status = extendedStatus || normalizeStatus(asString(statusRecord.code));

  return {
    status: status.length > 0 ? status : "NS",
    scoreHome: score.scoreHome,
    scoreAway: score.scoreAway,
    halfTimeHome: score.halfTimeHome,
    halfTimeAway: score.halfTimeAway,
    scorers: extractGoalScorers(results.playByPlay, buildAthleteNameByCode(items)),
    lineups,
  };
}

export function buildRoundLookup(phasePayloads: unknown[], eventUnitsPayload: unknown): Map<string, string> {
  const map = new Map<string, string>();

  for (const phasePayload of phasePayloads) {
    if (!isRecord(phasePayload)) {
      continue;
    }

    const event = isRecord(phasePayload.event) ? phasePayload.event : {};
    const phases = asArray(event.phases);

    for (const phaseValue of phases) {
      if (!isRecord(phaseValue)) {
        continue;
      }

      const phaseRound = asString(phaseValue.shortDescription, asString(phaseValue.description, "Unknown"));
      const units = asArray(phaseValue.units);

      for (const unit of units) {
        if (!isRecord(unit)) {
          continue;
        }

        const code = asString(unit.code);

        if (code.length === 0) {
          continue;
        }

        const round = asString(unit.shortDescription, asString(unit.description, phaseRound));

        map.set(code, round);
      }
    }
  }

  if (!isRecord(eventUnitsPayload)) {
    return map;
  }

  const eventUnits = asArray(eventUnitsPayload.eventUnits);

  for (const unitValue of eventUnits) {
    if (!isRecord(unitValue)) {
      continue;
    }

    const unitType = asString(unitValue.type);

    if (unitType !== "HTEAM") {
      continue;
    }

    const code = asString(unitValue.code);

    if (code.length === 0 || map.has(code)) {
      continue;
    }

    const round = asString(unitValue.shortDescription, asString(unitValue.description, "Unknown"));

    map.set(code, round);
  }

  return map;
}

export function buildEventGameSummaryLookup(payloads: unknown[]): Map<string, EventGameSummary> {
  const map = new Map<string, EventGameSummary>();

  for (const payload of payloads) {
    if (!isRecord(payload)) {
      continue;
    }

    const event = isRecord(payload.event) ? payload.event : {};
    const phases = asArray(event.phases);

    for (const phaseValue of phases) {
      if (!isRecord(phaseValue)) {
        continue;
      }

      const phaseRound = asString(phaseValue.shortDescription, asString(phaseValue.description, "Unknown"));
      const units = asArray(phaseValue.units);

      for (const unitValue of units) {
        if (!isRecord(unitValue)) {
          continue;
        }

        const code = asString(unitValue.code);

        if (code.length === 0) {
          continue;
        }

        const schedule = isRecord(unitValue.schedule) ? unitValue.schedule : {};
        const result = isRecord(schedule.result) ? schedule.result : {};
        const items = asArray(result.items).filter(isRecord);

        const homeItem = items.find((item) => asString(item.startOrder) === "1");
        const awayItem = items.find((item) => asString(item.startOrder) === "2");
        const status =
          extractStatusFromExtendedInfos(result.extendedInfos) ||
          normalizeStatus(asString((isRecord(schedule.status) ? schedule.status : {}).code));

        map.set(code, {
          scoreHome: homeItem ? asNumber(homeItem.resultData, 0) : 0,
          scoreAway: awayItem ? asNumber(awayItem.resultData, 0) : 0,
          status: status.length > 0 ? status : "NS",
          round: asString(unitValue.shortDescription, asString(unitValue.description, phaseRound)),
        });
      }
    }
  }

  return map;
}

export function mergeDetailWithSummary(detail: MatchDetail, summary?: EventGameSummary): MatchDetail {
  if (!summary) {
    return detail;
  }

  if (detail.status !== "NS") {
    return detail;
  }

  return {
    ...detail,
    status: summary.status,
    scoreHome: summary.scoreHome,
    scoreAway: summary.scoreAway,
  };
}

export function parseResultMatchCode(payload: unknown): string {
  if (!isRecord(payload) || !isRecord(payload.results)) {
    throw new Error(errorMessages.invalidResultPayload);
  }

  return asString(payload.results.eventUnitCode);
}
