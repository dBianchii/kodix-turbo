import { unstable_after as after } from "next/server";
import { TRPCError } from "@trpc/server";
import deepDiff from "deep-diff";

import type { careTasks } from "@kdx/db/schema";
import type { TEditCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { db } from "@kdx/db/client";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../../procedures";

interface EditCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TEditCareTaskInputSchema;
}

export const editCareTaskHandler = async ({
  ctx,
  input,
}: EditCareTaskOptions) => {
  const { appActivityLogsService } = ctx.services;
  const { careTaskRepository } = ctx.repositories;
  const oldCareTask = await careTaskRepository.findCareTaskById(input.id);
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
        input.id,
        tx,
      );
      if (!newCareTask)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ctx.t("api.Care task not found"),
        });
      const diff = deepDiff(oldCareTask, newCareTask);

      await appActivityLogsService.logActivity(
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
