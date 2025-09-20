import { calendarAppId, kodixCareAppId, todoAppId } from "@kdx/shared/db";

//TODO: make i18n-ally pick up these values
export const appIdToName = {
  [kodixCareAppId]: "Kodix Care",
  [calendarAppId]: "Calendar",
  [todoAppId]: "Todo",
} as const;
