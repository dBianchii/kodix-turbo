import type {
  MySqlTableWithColumns,
  TableConfig,
} from "drizzle-orm/mysql-core";

import type { KodixAppId } from "@kdx/shared";
import {
  aiStudioAppId,
  calendarAppId,
  chatAppId,
  cupomAppId,
  kodixCareAppId,
  todoAppId,
} from "@kdx/shared";

import * as aiStudio from "./schema/apps/ai-studio";
import * as calendar from "./schema/apps/calendar";
import * as chat from "./schema/apps/chat";
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
  [chatAppId]: withoutRelationsAndZodSchemas(chat),
  [aiStudioAppId]: withoutRelationsAndZodSchemas(aiStudio),
  [cupomAppId]: withoutRelationsAndZodSchemas({}),
};

// Export crypto utilities
export { encryptToken, decryptToken } from "./utils/crypto";
