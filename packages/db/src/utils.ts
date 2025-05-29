import type {
  MySqlTableWithColumns,
  TableConfig,
} from "drizzle-orm/mysql-core";

import type { KodixAppId } from "@kdx/shared";
import {
  calendarAppId,
  chatAppId,
  kodixCareAppId,
  todoAppId,
} from "@kdx/shared";

import * as calendar from "./schema/apps/calendar";
import * as kodixCare from "./schema/apps/kodixCare";
import * as todos from "./schema/apps/todos";

const withoutRelationsAndZodSchemas = <T>(obj: Record<string, T>) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([key]) => !key.includes("Relation") && !key.includes("Schema"),
    ),
  ) as Record<string, MySqlTableWithColumns<TableConfig>>;

export const appIdToSchemas: Record<
  KodixAppId,
  Record<string, MySqlTableWithColumns<TableConfig>>
> = {
  [kodixCareAppId]: withoutRelationsAndZodSchemas(kodixCare),
  [todoAppId]: withoutRelationsAndZodSchemas(todos),
  [calendarAppId]: withoutRelationsAndZodSchemas(calendar),
  [chatAppId]: withoutRelationsAndZodSchemas({}),
};
