export const OLYMPICS_BASE_URL = "https://stacy.olympics.com/OG2024";
export const OLYMPICS_DATA_BASE_URL = `${OLYMPICS_BASE_URL}/data`;
export const OLYMPICS_LABELS_URL = `${OLYMPICS_BASE_URL}/locales/eng/labels.json`;

export const OLYMPICS_COMPETITION_CODE = "OG2024";
export const OLYMPICS_LANGUAGE = "ENG";
export const FOOTBALL_DISCIPLINE = "FBL";

export const endpointTemplates = {
  startList: () =>
    `SCH_StartList~comp=${OLYMPICS_COMPETITION_CODE}~disc=${FOOTBALL_DISCIPLINE}~lang=${OLYMPICS_LANGUAGE}.json`,
  eventUnits: () =>
    `GLO_EventUnits~comp=${OLYMPICS_COMPETITION_CODE}~disc=${FOOTBALL_DISCIPLINE}~lang=${OLYMPICS_LANGUAGE}.json`,
  eventGames: (eventCode: string) =>
    `GLO_EventGames~comp=${OLYMPICS_COMPETITION_CODE}~event=${eventCode}~lang=${OLYMPICS_LANGUAGE}.json`,
  phases: (eventCode: string) =>
    `SEL_Phases~comp=${OLYMPICS_COMPETITION_CODE}~lang=${OLYMPICS_LANGUAGE}~event=${eventCode}.json`,
  resultByMatch: (matchCode: string) =>
    `RES_ByRSC_H2H~comp=${OLYMPICS_COMPETITION_CODE}~disc=${FOOTBALL_DISCIPLINE}~rscResult=${matchCode}~lang=${OLYMPICS_LANGUAGE}.json`,
};
