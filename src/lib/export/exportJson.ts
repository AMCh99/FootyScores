import type { MatchEndpoint } from "@/lib/types/endpoint";

export function exportEndpointsToJson(endpoints: MatchEndpoint[]): string {
  return JSON.stringify(endpoints, null, 2);
}
