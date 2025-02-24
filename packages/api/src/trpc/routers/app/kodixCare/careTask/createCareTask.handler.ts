import { ForbiddenError } from "@casl/ability";
import { TRPCError } from "@trpc/server";
import { diff } from "deep-diff";

import type { TCreateCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../../procedures";

interface CreateCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateCareTaskInputSchema;
}

export const createCareTaskHandler = async ({
  ctx,
  input,
}: CreateCareTaskOptions) => {
  const { permissionsService, appActivityLogsService } = ctx.services;
  const { careTaskRepository } = ctx.repositories;
  const ability = await permissionsService.getUserPermissionsForApp({
    user: ctx.auth.user,
    appId: kodixCareAppId,
  });
  ForbiddenError.from(ability).throwUnlessCan("Create", "CareTask");

  const [created] = await careTaskRepository.createCareTask({
    ...input,
    teamId: ctx.auth.user.activeTeamId,
    createdBy: ctx.auth.user.id,
    createdFromCalendar: false,
  });

  if (!created) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create care task",
    });
  }

  const careTaskInserted = await careTaskRepository.findCareTaskById(
    created.id,
  );

  await appActivityLogsService.logActivity({
    appId: kodixCareAppId,
    teamId: ctx.auth.user.activeTeamId,
    tableName: "careTask",
    rowId: created.id,
    diff: diff({}, careTaskInserted),
    userId: ctx.auth.user.id,
    type: "create",
  });
};
