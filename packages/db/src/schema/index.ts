import type {
  MySqlTableWithColumns,
  TableConfig,
} from "drizzle-orm/mysql-core";

import { calendarAppId, kodixCareAppId, todoAppId } from "@kdx/shared";

import * as apps from "./apps";
import * as calendar from "./apps/calendar";
import * as kodixCare from "./apps/kodixCare";
import * as todos from "./apps/todos";
import * as teams from "./teams";
import * as users from "./users";

export const schema = {
  ...apps,
  ...calendar,
  ...kodixCare,
  ...todos,
  ...users,
  ...teams,
};

const withoutRelations = <T>(obj: Record<string, T>) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => !key.includes("Relation")),
  ) as Record<string, MySqlTableWithColumns<TableConfig>>;

export const appIdToSchemas = {
  [kodixCareAppId]: withoutRelations(kodixCare),
  [todoAppId]: withoutRelations(todos),
  [calendarAppId]: withoutRelations(calendar),
};
