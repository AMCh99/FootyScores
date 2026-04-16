export const errorMessages = {
  generationFailedTitle: "Unable to Generate Match Endpoints",
  generationFailedDetail:
    "The match data could not be processed from the official Olympic source. Please try again.",
  comparisonFailedTitle: "Unable to Compare API JSON",
  comparisonFailedDetail:
    "The generated endpoints could not be compared with the tested API response. Please verify the tested API URL and try again.",
  testedApiUrlRequired:
    "A tested API URL is required to run automated JSON comparison.",
  testedApiUrlInvalid:
    "The tested API URL is invalid. Use an absolute URL or a relative path starting with '/'.",
  testedApiUnavailable:
    "The tested API could not be reached or returned an invalid response.",
  testedApiEmptyPayload:
    "The tested API payload did not include endpoints in a supported structure.",
  matchNotFoundTitle: "Match Endpoint Not Found",
  matchNotFoundDetail: "No football match endpoint was found for the requested match code",
  invalidSchedulePayload:
    "Official schedule payload is missing required fields.",
  invalidResultPayload: "Match result payload is missing required fields.",
} as const;
