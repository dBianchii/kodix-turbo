import { TRPCError } from "@trpc/server";

import type { TEditCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { db } from "@kdx/db/client";
import { kodixCareRepository } from "@kdx/db/repositories";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { logActivity } from "../../../../services/appActivityLogs.service";

interface EditCareShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TEditCareShiftInputSchema;
}
type Primitive = string | number | boolean | null | undefined | Date;

interface DiffResult<T> {
  changed: boolean;
  oldValue: T | undefined;
  newValue: T | undefined;
}

type DeepDiffResult<T> = {
  [P in keyof T]: T[P] extends Primitive
    ? DiffResult<T[P]>
    : T[P] extends unknown[]
      ? DiffResult<T[P]> // Treat arrays as primitives
      : T[P] extends object
        ? DeepDiffResult<T[P]>
        : DiffResult<T[P]>;
};

function createDiff<T extends object>(oldObj: T, newObj: T): DeepDiffResult<T> {
  const result = {} as DeepDiffResult<T>;

  // Get all unique keys from both objects
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const oldValue = oldObj[key as keyof T];
    const newValue = newObj[key as keyof T];

    if (oldValue instanceof Date && newValue instanceof Date) {
      result[key as keyof T] = {
        changed: oldValue.getTime() !== newValue.getTime(),
        oldValue,
        newValue,
      } as DeepDiffResult<T>[keyof T];
    } else if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      result[key as keyof T] = {
        changed: JSON.stringify(oldValue) !== JSON.stringify(newValue),
        oldValue,
        newValue,
      } as DeepDiffResult<T>[keyof T];
    } else if (
      oldValue &&
      newValue &&
      typeof oldValue === "object" &&
      typeof newValue === "object"
    ) {
      result[key as keyof T] = createDiff(
        oldValue as object,
        newValue as object,
      ) as DeepDiffResult<T>[keyof T];
    } else {
      result[key as keyof T] = {
        changed: oldValue !== newValue,
        oldValue,
        newValue,
      } as DeepDiffResult<T>[keyof T];
    }
  }

  return result;
}

// Helper function to get a flat list of all changes
function getFlattenedChanges<T extends object>(
  diff: DeepDiffResult<T>,
  prefix = "",
): { path: string; oldValue: unknown; newValue: unknown }[] {
  const changes: { path: string; oldValue: unknown; newValue: unknown }[] = [];

  for (const key in diff) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    const value = diff[key];

    if ("changed" in value) {
      if (value.changed) {
        changes.push({
          path: currentPath,
          oldValue: value.oldValue,
          newValue: value.newValue,
        });
      }
    } else {
      // Recurse for nested objects
      changes.push(
        ...getFlattenedChanges(value as DeepDiffResult<any>, currentPath),
      );
    }
  }

  return changes;
}

export const editCareShiftHandler = async ({
  ctx,
  input,
}: EditCareShiftOptions) => {
  const oldShift = await kodixCareRepository.getCareShiftById({
    id: input.id,
    teamId: ctx.auth.user.activeTeamId,
  });
  if (!oldShift)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.Shift not found"),
    });

  await db.transaction(async (tx) => {
    const [header] = await kodixCareRepository.updateCareShift(
      {
        id: input.id,
        input: {
          startAt: input.startAt,
          endAt: input.endAt,
        },
      },
      tx,
    );
    const newShift = await kodixCareRepository.getCareShiftById({
      id: input.id,
      teamId: ctx.auth.user.activeTeamId,
    });
    if (!newShift)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: ctx.t("api.Could not update resource"),
      });

    const diff = createDiff(oldShift, newShift);
    const changes = getFlattenedChanges(diff);

    if (header.affectedRows)
      await logActivity({
        appId: kodixCareAppId,
        userId: ctx.auth.user.id,
        teamId: ctx.auth.user.activeTeamId,
        type: "update",
        rowId: input.id,
        tableName: "careShift",
        body: changes,
      });
  });
};
