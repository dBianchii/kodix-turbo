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

const PATHS_TO_REMOVE = ["updatedAt"];

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

  const logsWithMessage = logs.map((log) => {
    const diffs = deepDiffSchema.parse(log.diff);
    const messageParts: string[] = [];
    for (const diff of diffs) {
      // Remove paths that are not relevant to the user
      if (PATHS_TO_REMOVE.some((path) => diff.path.includes(path))) continue;

      if (!diff.lhs) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        messageParts.push(`inserted at ${diff.path.join(".")} ${diff.rhs}`);
        continue;
      }

      messageParts.push(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-base-to-string
        `updated ${diff.path.join(".")} from ${diff.lhs} to ${diff.rhs}`,
      );
    }

    return {
      ...log,
      message: `${messageParts.join(", ")}`,
    };
  });

  return logsWithMessage;
}
