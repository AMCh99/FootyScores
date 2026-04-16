/* eslint-disable @next/next/no-img-element */

import { getOlympicFlagUrl } from "@/lib/constants/flags";

interface TeamFlagProps {
  teamCode: string;
  teamName: string;
  size?: "sm" | "lg";
}

export function TeamFlag({ teamCode, teamName, size = "sm" }: TeamFlagProps) {
  const flagUrl = getOlympicFlagUrl(teamCode);
  const sizeClassName = size === "lg" ? "large" : "";

  if (!flagUrl) {
    return (
      <span className={`team-flag-fallback ${sizeClassName}`} aria-hidden="true">
        🏳️
      </span>
    );
  }

  return (
    <img
      className={`team-flag ${sizeClassName}`}
      src={flagUrl}
      alt={`${teamName} flag`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}
