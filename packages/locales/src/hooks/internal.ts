import {
  calendarAppId,
  kodixCareAppId,
  PKodixCare_CanToggleShiftId,
  todoAppId,
} from "@kdx/shared";

//TODO: make i18n-ally pick up these values
export const appIdToName = {
  [kodixCareAppId]: "Kodix Care",
  [calendarAppId]: "Calendar",
  [todoAppId]: "Todo",
} as const;

export const appPermissionIdToName = {
  [PKodixCare_CanToggleShiftId]: "Can toggle shift",
} as const;
