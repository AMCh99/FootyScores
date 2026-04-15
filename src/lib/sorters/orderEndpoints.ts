import type { GeneratedMatchRecord } from "@/lib/types/domain";

function compareKickoff(leftKickoff: string, rightKickoff: string): number {
  const leftTimestamp = Date.parse(leftKickoff);
  const rightTimestamp = Date.parse(rightKickoff);

  return leftTimestamp - rightTimestamp;
}

export function sortGeneratedMatches(records: GeneratedMatchRecord[]): GeneratedMatchRecord[] {
  return [...records].sort((left, right) => {
    const kickoffDiff = compareKickoff(left.endpoint.kickoff, right.endpoint.kickoff);

    if (kickoffDiff !== 0) {
      return kickoffDiff;
    }

    const homeDiff = left.endpoint.teams.home.localeCompare(right.endpoint.teams.home, "en");

    if (homeDiff !== 0) {
      return homeDiff;
    }

    return left.endpoint.teams.away.localeCompare(right.endpoint.teams.away, "en");
  });
}
