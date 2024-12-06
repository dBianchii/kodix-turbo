import { z } from "zod";

import type { appActivityLogs } from "@kdx/db/schema";
import type { KodixAppId } from "@kdx/shared";
import { appRepository } from "@kdx/db/repositories";

export async function logActivity(input: typeof appActivityLogs.$inferInsert) {
  await appRepository.createAppActivityLog(input);
}

const baseDiffSchema = z.object({
  path: z.array(z.string()),
});
// Schema for "Edit" (E), "New" (N), and "Delete" (D) diffs
const editNewDeleteDiffSchema = baseDiffSchema.extend({
  kind: z.enum(["E", "N", "D"]),
  lhs: z.unknown(), // Left-hand side value
  rhs: z.unknown(), // Right-hand side value
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

export async function getAppActivityLogs({
  tableNames,
  rowId,
  teamId,
  appId,
  page,
  pageSize,
}: {
  tableNames?: (typeof appActivityLogs.$inferSelect.tableName)[];
  rowId?: string;
  teamId: string;
  appId: KodixAppId;
  page: number;
  pageSize: number;
}) {
  const logs = await appRepository.findManyAppActivityLogs({
    appId: appId,
    page,
    tableNames,
    rowId,
    pageSize,
    teamId,
  });

  for (const log of logs) {
    if (log.type === "update") {
      const diffs = deepDiffSchema.parse(log.diff);

      const messageParts: string[] = [];
      for (const diff of diffs) {
        if (diff.kind !== "E") continue; //What do we do if it isnt?
        if (typeof diff.lhs !== "string" && typeof diff.rhs !== "string")
          continue; //What do we do if it isnt?

        if (!diff.lhs) {
          messageParts.push(`inserted at ${diff.path.join(".")} ${diff.rhs}`);
          continue;
        }

        messageParts.push(
          `updated ${diff.path.join(".")} from ${diff.lhs} to ${diff.rhs}`,
        );
      }

      log.message = `${log.User.name} ${messageParts.join(", ")}`;
    }
  }

  return logs;
}
