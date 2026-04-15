export const errorMessages = {
  generationFailedTitle: "Unable to Generate Match Endpoints",
  generationFailedDetail:
    "The match data could not be processed. Please try again or switch to fixture mode.",
  sourceUnavailable:
    "Official data source is unavailable. Falling back to local fixture data.",
  invalidSchedulePayload:
    "Official schedule payload is missing required fields.",
  invalidResultPayload: "Match result payload is missing required fields.",
} as const;
