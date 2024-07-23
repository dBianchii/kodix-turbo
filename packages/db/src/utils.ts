import type {
  MySqlTableWithColumns,
  TableConfig,
} from "drizzle-orm/mysql-core";

import { calendarAppId, kodixCareAppId, todoAppId } from "@kdx/shared";

import * as calendar from "./schema/apps/calendar";
import * as kodixCare from "./schema/apps/kodixCare";
import * as todos from "./schema/apps/todos";

const withoutRelations = <T>(obj: Record<string, T>) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => !key.includes("Relation")),
  ) as Record<string, MySqlTableWithColumns<TableConfig>>;

export const appIdToSchemas = {
  [kodixCareAppId]: withoutRelations(kodixCare),
  [todoAppId]: withoutRelations(todos),
  [calendarAppId]: withoutRelations(calendar),
};
