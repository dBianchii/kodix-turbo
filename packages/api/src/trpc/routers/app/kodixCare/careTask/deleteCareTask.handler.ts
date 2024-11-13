import { TRPCError } from "@trpc/server";

import type { TDeleteCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { and, eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { getKodixCareRepository } from "@kdx/db/repositories";
import { teamAppRoles, teamAppRolesToUsers } from "@kdx/db/schema";
import { kodixCareAppId, kodixCareRoleDefaultIds } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { getCareTaskRepository } from "../../../../../../../db/src/repositories/app/kodixCare/careTaskRepository";
import { getTeamDbFromCtx } from "../../../../getTeamDbFromCtx";

interface DeleteCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TDeleteCareTaskInputSchema;
}

export const deleteCareTaskHandler = async ({
  ctx,
  input,
}: DeleteCareTaskOptions) => {
  const teamDb = getTeamDbFromCtx(ctx);

  const kodixCareRepository = getKodixCareRepository(teamDb);
  const careTaskRepository = getCareTaskRepository(teamDb);

  const currentShift = await kodixCareRepository.getCurrentCareShift();

  if (currentShift?.shiftEndedAt)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t(
        "api.You cannot delete a task when there is no active shift",
      ),
    });

  const careTask = await careTaskRepository.findCareTaskById(input.id);
  if (!careTask) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.Care task not found"),
    });
  }
  if (careTask.CareShift?.shiftEndedAt) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t("api.You cannot delete a task from a closed shift"),
    });
  }

  const userRoles = await db
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

  if (careTask.createdFromCalendar) {
    if (
      !userRoles.some(
        (x) => x.appRoleDefaultId === kodixCareRoleDefaultIds.admin,
      )
    )
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ctx.t(
          "api.Only admins can delete a task created from calendar",
        ),
      });
  }

  if (
    careTask.createdBy !== ctx.auth.user.id &&
    !userRoles.some((x) => x.appRoleDefaultId === kodixCareRoleDefaultIds.admin)
  )
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t("api.Only admins and the creator can delete a task"),
    });

  await careTaskRepository.deleteCareTaskById(input.id);
};
