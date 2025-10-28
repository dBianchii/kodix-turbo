import type {
  MySqlTableWithColumns,
  TableConfig,
} from "drizzle-orm/mysql-core";
import { calendarAppId, kodixCareAppId, todoAppId } from "@kodix/shared/db";

import * as calendar from "./schema/apps/calendar";
import * as kodixCare from "./schema/apps/kodix-care";
import * as todos from "./schema/apps/todos";

const withoutRelationsAndZodSchemas = <T>(obj: Record<string, T>) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([key]) => !(key.includes("Relation") || key.includes("Schema")),
    ),
  ) as Record<string, MySqlTableWithColumns<TableConfig>>;

export const appIdToSchemas = {
  [kodixCareAppId]: withoutRelationsAndZodSchemas(kodixCare),
  [todoAppId]: withoutRelationsAndZodSchemas(todos),
  [calendarAppId]: withoutRelationsAndZodSchemas(calendar),
};
