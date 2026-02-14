import type { KodixAppId } from "@kodix/shared/db";
import type { getFormatter } from "next-intl/server";
import dayjs from "@kodix/dayjs";
import { ZNanoId } from "@kodix/shared/utils";
import z from "zod";

import type { appActivityLogs } from "@kdx/db/schema";
import type { ServerSideT } from "@kdx/locales";
import { db as _db } from "@kdx/db/client";
import { appRepository } from "@kdx/db/repositories";

const baseDiffSchema = z.object({
  path: z.array(z.string()),
});
const valueSchema = z.union([
  z.string(),
  z.null(),
  z.date(),
  z.undefined(),
  z.boolean(),
]);
// Schema for "Edit" (E), "New" (N), and "Delete" (D) diffs
const editNewDeleteDiffSchema = baseDiffSchema.extend({
  kind: z.enum(["E", "N", "D"]),
  lhs: valueSchema, // Left-hand side value
  rhs: valueSchema, // Right-hand side value
});

//  Schema for "Array" (A) diffs, with nested item diffs
// const arrayDiffSchema = baseDiffSchema.extend({
//   index: z.number(), // Array index
//   item: z.lazy(() => diffSchema), // Recursive definition for nested diffs
// });

// Combine all possible diff kinds
// const diffSchema = z.union([editNewDeleteDiffSchema, arrayDiffSchema]);
const diffSchema = editNewDeleteDiffSchema;

// Schema for the top-level array of diffs
const deepDiffSchema = z.array(diffSchema);

export async function logActivity(
  input: typeof appActivityLogs.$inferInsert,
  db = _db,
) {
  deepDiffSchema.parse(input.diff);
  await appRepository.createAppActivityLog(input, db);
}

const formatSide = ({
  value,
  path,
  log,
  format,
  t,
}: {
  value: z.infer<typeof valueSchema>;
  path: string;
  log: {
    User: {
      name: string;
    };
  };
  format: Awaited<ReturnType<typeof getFormatter>>;
  t: ServerSideT;
}) => {
  if (value === null) return t("api.appActivityLogs.null");

  if (typeof value === "string" && dayjs(value).isValid())
    return format.dateTime(new Date(value), "shortWithHours");

  if (ZNanoId.safeParse(value).success && path.includes("UserId"))
    return log.User.name;

  return value;
};

const PATHS_TO_REMOVE = ["updatedAt"];
export async function getAppActivityLogs({
  t,
  format,
  tableNames,
  rowId,
  teamId,
  appId,
  page,
  pageSize,
}: {
  t: ServerSideT;
  format: Awaited<ReturnType<typeof getFormatter>>;
  tableNames?: (typeof appActivityLogs.$inferSelect.tableName)[];
  rowId?: string;
  teamId: string;
  appId: KodixAppId;
  page: number;
  pageSize: number;
}) {
  const logs = await appRepository.findManyAppActivityLogs({
    appId,
    page,
    pageSize,
    rowId,
    tableNames,
    teamId,
  });

  const logsWithMessage = logs.map((log) => {
    const diffs = deepDiffSchema.parse(log.diff);
    if (log.type === "create") {
      return {
        ...log,
        message: `${t("api.appActivityLogs.created")} ${JSON.stringify(
          diffs.reduce(
            (acc, diff) => ({
              // biome-ignore lint/performance/noAccumulatingSpread: <biome migration>
              ...acc,
              [diff.path.join(".")]: diff.rhs,
            }),
            {},
          ),
        )}`,
      };
    }

    const messageParts: string[] = [];
    for (const diff of diffs) {
      const fullPath = diff.path.join(".");
      // Remove paths that are not relevant to the user
      if (PATHS_TO_REMOVE.some((path) => diff.path.includes(path))) continue;

      const lhs = formatSide({
        format,
        log,
        path: fullPath,
        t,
        value: diff.lhs,
      });
      const rhs = formatSide({
        format,
        log,
        path: fullPath,
        t,
        value: diff.rhs,
      });

      const pathMessage = `[${fullPath}]`;

      if (!lhs) {
        messageParts.push(
          `${t("api.appActivityLogs.inserted at")} ${pathMessage} ${JSON.stringify(rhs)}`,
        );
        continue;
      }

      messageParts.push(
        `${t("api.appActivityLogs.updated")} ${pathMessage} ${t("api.appActivityLogs.from")} ${JSON.stringify(lhs)} ${t("api.appActivityLogs.to")} ${JSON.stringify(rhs)}`,
      );
    }

    return {
      ...log,
      message: `${messageParts.join(", ")}`,
    };
  });

  return logsWithMessage;
}
