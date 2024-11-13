import { TRPCError } from "@trpc/server";

import type { careTasks } from "@kdx/db/schema";
import type { TEditCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import dayjs from "@kdx/dayjs";
import { and, eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { careTaskRepository, kodixCareRepository } from "@kdx/db/repositories";
import { teamAppRoles, teamAppRolesToUsers } from "@kdx/db/schema";
import { kodixCareAppId, kodixCareRoleDefaultIds } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../../procedures";

interface EditCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TEditCareTaskInputSchema;
}

export const editCareTaskHandler = async ({
  ctx,
  input,
}: EditCareTaskOptions) => {
  const currentShift = await kodixCareRepository.getCurrentCareShiftByTeamId(
    ctx.auth.user.activeTeamId,
  );
  if (!currentShift)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t("api.No active shift"),
    });

  if (currentShift.shiftEndedAt)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t(
        "api.You cannot edit a task while the current shift is closed",
      ),
    });

  const careTask = await careTaskRepository.findCareTaskById({
    id: input.id,
    teamId: ctx.auth.user.activeTeamId,
  });
  if (!careTask)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.Care task not found"),
    });

  const set: Partial<typeof careTasks.$inferInsert> = {
    details: input.details,
  };

  const isEditingDetails = input.details !== undefined;
  if (isEditingDetails) {
    const roles = await db
      .select({
        appRoleDefaultId: teamAppRoles.appRoleDefaultId,
      })
      .from(teamAppRoles)
      .where(
        and(
          eq(teamAppRolesToUsers.userId, ctx.auth.user.id),
          eq(teamAppRoles.teamId, ctx.auth.user.activeTeamId),
          eq(teamAppRoles.appId, kodixCareAppId),
        ),
      )
      .innerJoin(
        teamAppRolesToUsers,
        eq(teamAppRolesToUsers.teamAppRoleId, teamAppRoles.id),
      );

    if (
      careTask.createdBy !== ctx.auth.user.id &&
      !roles.some((x) => x.appRoleDefaultId === kodixCareRoleDefaultIds.admin)
    )
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ctx.t("api.Only admins and the creator can delete a task"),
      });
  }

  const isEditingDoneAt = input.doneAt !== undefined;
  if (isEditingDoneAt) {
    if (currentShift.Caregiver.id !== ctx.auth.user.id)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ctx.t(
          "api.You cannot edit a task from another caregivers shift",
        ),
      });

    if (input.doneAt)
      if (dayjs(input.doneAt).isBefore(currentShift.checkIn))
        throw new TRPCError({
          code: "FORBIDDEN",
          message: ctx.t(
            "api.You cannot mark a task as done before the shift started",
          ),
        });

    set.doneAt = input.doneAt;
    set.doneByUserId = input.doneAt === null ? null : ctx.auth.user.id;
  }

  await careTaskRepository.updateCareTask(db, {
    id: input.id,
    input: set,
  });
};
