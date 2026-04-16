import { NextRequest, NextResponse } from "next/server";

import { compareGeneratedWithTested, normalizeTestedPayload } from "@/lib/comparison/jsonComparison";
import { errorMessages } from "@/lib/errors/messages";
import { generateMatchEndpoints } from "@/lib/pipeline/generateEndpoints";
import type { GenerationResult, GeneratedMatchRecord } from "@/lib/types/domain";

interface CompareRequestBody {
  testedApiUrl?: string;
  matchCode?: string;
}

function normalizeText(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function resolveTestedApiUrl(request: NextRequest, rawUrl: string): string | null {
  if (rawUrl.length === 0) {
    return null;
  }

  if (rawUrl.startsWith("/")) {
    return new URL(rawUrl, request.nextUrl.origin).toString();
  }

  try {
    return new URL(rawUrl).toString();
  } catch {
    return null;
  }
}

function selectMatches(result: GenerationResult, matchCode: string): GeneratedMatchRecord[] | null {
  if (matchCode.length === 0) {
    return result.matches;
  }

  const record = result.matches.find((matchRecord) => matchRecord.source.matchCode === matchCode);

  if (!record) {
    return null;
  }

  return [record];
}

async function fetchTestedApiPayload(testedApiUrl: string): Promise<unknown> {
  const response = await fetch(testedApiUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as unknown;
}

async function compareResponse(
  request: NextRequest,
  rawTestedApiUrl: string,
  rawMatchCode: string,
): Promise<NextResponse> {
  if (rawTestedApiUrl.length === 0) {
    return NextResponse.json(
      {
        error: {
          title: errorMessages.comparisonFailedTitle,
          detail: errorMessages.testedApiUrlRequired,
        },
      },
      {
        status: 400,
      },
    );
  }

  const testedApiUrl = resolveTestedApiUrl(request, rawTestedApiUrl);

  if (!testedApiUrl) {
    return NextResponse.json(
      {
        error: {
          title: errorMessages.comparisonFailedTitle,
          detail: errorMessages.testedApiUrlInvalid,
        },
      },
      {
        status: 400,
      },
    );
  }

  try {
    const generation = await generateMatchEndpoints();
    const selectedMatches = selectMatches(generation, rawMatchCode);

    if (!selectedMatches) {
      return NextResponse.json(
        {
          error: {
            title: errorMessages.matchNotFoundTitle,
            detail: `${errorMessages.matchNotFoundDetail} (${rawMatchCode})`,
          },
        },
        {
          status: 404,
        },
      );
    }

    const testedPayload = await fetchTestedApiPayload(testedApiUrl);
    const normalizedTested = normalizeTestedPayload(testedPayload);

    if (normalizedTested.byMatchCode.size === 0 && normalizedTested.orderedEndpoints.length === 0) {
      return NextResponse.json(
        {
          error: {
            title: errorMessages.comparisonFailedTitle,
            detail: errorMessages.testedApiEmptyPayload,
          },
        },
        {
          status: 422,
        },
      );
    }

    const comparison = compareGeneratedWithTested(selectedMatches, testedPayload, testedApiUrl, {
      ignoreExtraInTested: rawMatchCode.length > 0,
    });

    return NextResponse.json(comparison);
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          title: errorMessages.comparisonFailedTitle,
          detail: `${errorMessages.testedApiUnavailable} (${String(error)})`,
        },
      },
      {
        status: 502,
      },
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const testedApiUrl = normalizeText(request.nextUrl.searchParams.get("testedApiUrl"));
  const matchCode = normalizeText(request.nextUrl.searchParams.get("matchCode"));

  return compareResponse(request, testedApiUrl, matchCode);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: CompareRequestBody | null = null;

  try {
    body = (await request.json()) as CompareRequestBody;
  } catch {
    body = null;
  }

  const testedApiUrl = normalizeText(body?.testedApiUrl);
  const matchCode = normalizeText(body?.matchCode);

  return compareResponse(request, testedApiUrl, matchCode);
}