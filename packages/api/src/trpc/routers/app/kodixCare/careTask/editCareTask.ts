import { unstable_after as after } from "next/server";
import { TRPCError } from "@trpc/server";
import deepDiff from "deep-diff";

import type { careTasks } from "@kdx/db/schema";
import type { TEditCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { db } from "@kdx/db/client";
import { careTaskRepository } from "@kdx/db/repositories";
import { kodixCareAppId, kodixCareRoleDefaultIds } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { logActivity } from "../../../../../services/appActivityLogs.service";
import { getMyRolesHandler } from "../../../team/appRole/getMyRoles.handler";

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

  if (oldCareTask.doneByUserId) {
    const taskWasDoneByCurrentUser =
      oldCareTask.doneByUserId === ctx.auth.user.id;
    if (!taskWasDoneByCurrentUser) {
      const myRoles = await getMyRolesHandler({
        ctx,
        input: { appId: kodixCareAppId },
      });
      const amIAnAdmin = myRoles.some(
        (x) => x.appRoleDefaultId === kodixCareRoleDefaultIds.admin,
      );
      if (!amIAnAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: ctx.t(
            "api.Only admins can edit tasks that were done by others",
          ),
        });
      }
    }
  }
  // const isEditingDetails = input.details !== undefined;
  // if (isEditingDetails) {
  //   const roles = await db
  //     .select({
  //       appRoleDefaultId: teamAppRoles.appRoleDefaultId,
  //     })
  //     .from(teamAppRoles)
  //     .where(
  //       and(
  //         eq(teamAppRolesToUsers.userId, ctx.auth.user.id),
  //         eq(teamAppRoles.teamId, ctx.auth.user.activeTeamId),
  //         eq(teamAppRoles.appId, kodixCareAppId),
  //       ),
  //     )
  //     .innerJoin(
  //       teamAppRolesToUsers,
  //       eq(teamAppRolesToUsers.teamAppRoleId, teamAppRoles.id),
  //     );

  //   if (
  //     careTask.createdBy !== ctx.auth.user.id &&
  //     !roles.some((x) => x.appRoleDefaultId === kodixCareRoleDefaultIds.admin)
  //   )
  //     throw new TRPCError({
  //       code: "FORBIDDEN",
  //       message: ctx.t("api.Only admins and the creator can delete a task"),
  //     });
  // }

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
