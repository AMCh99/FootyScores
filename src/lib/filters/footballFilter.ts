import type { MatchSeed } from "@/lib/types/domain";

export function isFootballMatch(seed: MatchSeed): boolean {
  return seed.matchCode.startsWith("FBL") && seed.eventCode.startsWith("FBL");
}

export function filterFootballMatches(seeds: MatchSeed[]): MatchSeed[] {
  return seeds.filter(isFootballMatch);
}

export function dedupeByMatchCode(seeds: MatchSeed[]): MatchSeed[] {
  const seen = new Set<string>();
  const deduped: MatchSeed[] = [];

  for (const seed of seeds) {
    if (seen.has(seed.matchCode)) {
      continue;
    }

    seen.add(seed.matchCode);
    deduped.push(seed);
  }

  return deduped;
}
