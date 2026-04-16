import { NextRequest, NextResponse } from "next/server";

import { errorMessages } from "@/lib/errors/messages";
import { generateMatchEndpoints } from "@/lib/pipeline/generateEndpoints";
import type { GenerationResult } from "@/lib/types/domain";

interface GenerateRequestBody {
  matchCode?: string;
  includeSourceContext?: boolean;
}

function normalizeMatchCode(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
  }

  return false;
}

function selectSingleMatchResult(result: GenerationResult, matchCode: string): GenerationResult | null {
  if (matchCode.length === 0) {
    return result;
  }

  const record = result.matches.find((item) => item.source.matchCode === matchCode);

  if (!record) {
    return null;
  }

  return {
    diagnostics: {
      ...result.diagnostics,
      totalMatches: 1,
    },
    matches: [record],
  };
}

async function generateResponse(matchCode: string, includeSourceContext: boolean): Promise<NextResponse> {
  try {
    const result = await generateMatchEndpoints({
      includeSourceContext,
    });
    const selectedResult = selectSingleMatchResult(result, matchCode);

    if (!selectedResult) {
      return NextResponse.json(
        {
          error: {
            title: errorMessages.matchNotFoundTitle,
            detail: `${errorMessages.matchNotFoundDetail} (${matchCode})`,
          },
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(selectedResult);
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          title: errorMessages.generationFailedTitle,
          detail: `${errorMessages.generationFailedDetail} (${String(error)})`,
        },
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const matchCode = normalizeMatchCode(request.nextUrl.searchParams.get("matchCode"));
  const includeSourceContext = normalizeBoolean(request.nextUrl.searchParams.get("includeSourceContext"));

  return generateResponse(matchCode, includeSourceContext);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: GenerateRequestBody | null = null;

  try {
    body = (await request.json()) as GenerateRequestBody;
  } catch {
    body = null;
  }

  const matchCode = normalizeMatchCode(body?.matchCode);
  const includeSourceContext = normalizeBoolean(body?.includeSourceContext);

  return generateResponse(matchCode, includeSourceContext);
}
