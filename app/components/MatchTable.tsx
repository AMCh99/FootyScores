"use client";

import { useState } from "react";
import { Match, generateEndpoint } from "../data/matches";

interface MatchTableProps {
  matches: Match[];
}

const STAGE_COLORS: Record<string, string> = {
  "Group Stage": "bg-blue-100 text-blue-800",
  "Quarter-Final": "bg-purple-100 text-purple-800",
  "Semi-Final": "bg-orange-100 text-orange-800",
  "Bronze Medal Match": "bg-amber-100 text-amber-800",
  "Gold Medal Match": "bg-yellow-100 text-yellow-800",
};

export default function MatchTable({ matches }: MatchTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (matchId: string, endpoint: string) => {
    try {
      await navigator.clipboard.writeText(endpoint);
      setCopiedId(matchId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback for environments without clipboard API
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
              Date
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
              Time (CEST)
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
              Home Team
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
              Away Team
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
              Venue
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
              Stage
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
              Group
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
              API Endpoint
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {matches.map((match) => {
            const endpoint = generateEndpoint(match);
            const isCopied = copiedId === match.id;
            return (
              <tr key={match.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {match.date}
                </td>
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {match.time}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  {match.homeTeam}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  {match.awayTeam}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {match.venue}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STAGE_COLORS[match.stage] ??
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {match.stage}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {match.group ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-800">
                      {endpoint}
                    </code>
                    <button
                      onClick={() => handleCopy(match.id, endpoint)}
                      aria-label={`Copy endpoint for ${match.homeTeam} vs ${match.awayTeam}`}
                      className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                      title="Copy endpoint"
                    >
                      {isCopied ? (
                        <svg
                          className="h-4 w-4 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
