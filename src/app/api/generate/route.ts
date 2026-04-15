import { NextResponse } from "next/server";

import { errorMessages } from "@/lib/errors/messages";
import { generateMatchEndpoints } from "@/lib/pipeline/generateEndpoints";

async function generateResponse(): Promise<NextResponse> {
  try {
    const result = await generateMatchEndpoints();

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

export async function GET(): Promise<NextResponse> {
  return generateResponse();
}

export async function POST(): Promise<NextResponse> {
  return generateResponse();
}
