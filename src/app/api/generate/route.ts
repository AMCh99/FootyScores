import { NextRequest, NextResponse } from "next/server";

import { errorMessages } from "@/lib/errors/messages";
import { generateMatchEndpoints } from "@/lib/pipeline/generateEndpoints";
import type { SourceMode } from "@/lib/types/domain";

interface GenerateRequestBody {
  mode?: SourceMode;
}

function normalizeMode(mode: string | null | undefined): SourceMode {
  return mode === "fixture" ? "fixture" : "live";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const mode = normalizeMode(request.nextUrl.searchParams.get("mode"));

  try {
    const result = await generateMatchEndpoints(mode);

    return NextResponse.json(result);
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: GenerateRequestBody | null = null;

  try {
    body = (await request.json()) as GenerateRequestBody;
  } catch {
    body = null;
  }

  const mode = normalizeMode(body?.mode);

  try {
    const result = await generateMatchEndpoints(mode);

    return NextResponse.json(result);
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
