import { after } from "next/server";
import { TRPCError } from "@trpc/server";
import deepDiff from "deep-diff";

import type { careTasks } from "@kdx/db/schema";
import type { TEditCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { db } from "@kdx/db/client";
import { careTaskRepository } from "@kdx/db/repositories";
import { kodixCareAppId } from "@kdx/shared/db";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { logActivity } from "../../../../../services/appActivityLogs.service";

interface EditCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TEditCareTaskInputSchema;
}

export const editCareTaskHandler = async ({
  ctx,
  input,
}: EditCareTaskOptions) => {
  const oldCareTask = await careTaskRepository.findCareTaskById({
    id: input.id,
    teamId: ctx.auth.user.activeTeamId,
  });
  if (!oldCareTask)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.Care task not found"),
    });

  const set: Partial<typeof careTasks.$inferInsert> = {
    details: input.details,
  };

  const isEditingDoneAt = input.doneAt !== undefined;
  if (isEditingDoneAt) {
    set.doneAt = input.doneAt;
    set.doneByUserId = input.doneAt === null ? null : ctx.auth.user.id;
  }

  await db.transaction(async (tx) => {
    await careTaskRepository.updateCareTask(
      {
        id: input.id,
        input: set,
      },
      tx,
    );

    after(async () => {
      const newCareTask = await careTaskRepository.findCareTaskById(
        {
          id: input.id,
          teamId: ctx.auth.user.activeTeamId,
        },
        tx,
      );
      if (!newCareTask)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ctx.t("api.Care task not found"),
        });
      const diff = deepDiff(oldCareTask, newCareTask);

      await logActivity(
        {
          appId: kodixCareAppId,
          diff,
          tableName: "careTask",
          teamId: ctx.auth.user.activeTeamId,
          type: "update",
          userId: ctx.auth.user.id,
          rowId: input.id,
        },
        tx,
      );
    });
  });
};
