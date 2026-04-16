const OLYMPIC_FLAG_BASE_URL = "https://stacy.olympics.com/OG2024/assets/images/flags/OG2024";

function parseCountryCode(teamCode: string): string | null {
  const normalized = teamCode.trim().toUpperCase();

  if (/^[A-Z]{3}$/.test(normalized)) {
    return normalized;
  }

  const suffixMatch = normalized.match(/([A-Z]{3})(?:\d{2})?$/);

  return suffixMatch ? suffixMatch[1] : null;
}

export function getOlympicFlagUrl(teamCode: string): string | null {
  const countryCode = parseCountryCode(teamCode);

  if (!countryCode) {
    return null;
  }

  return `${OLYMPIC_FLAG_BASE_URL}/${countryCode}.webp`;
}
