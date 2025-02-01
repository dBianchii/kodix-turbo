import { ForbiddenError } from "@casl/ability";
import { TRPCError } from "@trpc/server";

import type { TDeleteCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { getUserPermissionsForApp } from "@kdx/auth/get-user-permissions";
import { careTaskRepository, teamRepository } from "@kdx/db/repositories";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../../procedures";

interface DeleteCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TDeleteCareTaskInputSchema;
}

export const deleteCareTaskHandler = async ({
  ctx,
  input,
}: DeleteCareTaskOptions) => {
  const careTask = await careTaskRepository.findCareTaskById({
    id: input.id,
    teamId: ctx.auth.user.activeTeamId,
  });
  if (!careTask) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.Care task not found"),
    });
  }

  const userRoles = await teamRepository.findUserRolesByTeamIdAndAppId({
    appId: kodixCareAppId,
    teamId: ctx.auth.user.activeTeamId,
    userId: ctx.auth.user.id,
  });

  const ability = getUserPermissionsForApp(
    ctx.auth.user,
    kodixCareAppId,
    userRoles.map((x) => x.role),
  );
  ForbiddenError.from(ability).throwUnlessCan("delete", {
    __typename: "CareTask",
    createdFromCalendar: careTask.createdFromCalendar,
    createdBy: careTask.createdBy,
  });

  // if (
  //   careTask.createdBy !== ctx.auth.user.id &&
  //   !userRoles.some((x) => x.appRoleDefaultId === kodixCareRoleDefaultIds.admin)
  // )
  //   throw new TRPCError({
  //     code: "FORBIDDEN",
  //     message: ctx.t("api.Only admins and the creator can delete a task"),
  //   });

  await careTaskRepository.deleteCareTaskById({
    id: input.id,
    teamId: ctx.auth.user.activeTeamId,
  });
};
