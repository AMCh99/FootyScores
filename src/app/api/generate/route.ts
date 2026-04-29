import { NextRequest, NextResponse } from "next/server";

import { errorMessages } from "@/lib/errors/messages";
import { generateMatchEndpoints } from "@/lib/pipeline/generateEndpoints";

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

async function generateResponse(matchCode: string, includeSourceContext: boolean): Promise<NextResponse> {
  try {
    const result = await generateMatchEndpoints({
      includeSourceContext,
    });

    if (matchCode.length === 0) {
      return NextResponse.json(result);
    }

    const selectedRecord = result.matches.find((item) => item.source.matchCode === matchCode);

    if (!selectedRecord) {
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

    if (includeSourceContext) {
      return NextResponse.json({
        diagnostics: {
          ...result.diagnostics,
          totalMatches: 1,
        },
        matches: [selectedRecord],
      });
    }

    const selectedResult = selectedRecord.endpoint;

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
