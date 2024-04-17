import * as apps from "./apps";
import * as calendar from "./apps/calendar";
import * as kodixCare from "./apps/kodixCare";
import * as todos from "./apps/todos";
import * as auth from "./auth";
import * as teams from "./teams";

export const schema = {
  ...apps,
  ...calendar,
  ...kodixCare,
  ...todos,
  ...auth,
  ...teams,
};
