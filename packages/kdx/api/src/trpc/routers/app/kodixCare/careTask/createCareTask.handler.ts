import { ForbiddenError } from "@casl/ability";
import { kodixCareAppId } from "@kodix/shared/db";
import { TRPCError } from "@trpc/server";
import { diff } from "deep-diff";

import type { TCreateCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { careTaskRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { logActivity } from "../../../../../services/app-activity-logs.service";

interface CreateCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateCareTaskInputSchema;
}

export const createCareTaskHandler = async ({
  ctx,
  input,
}: CreateCareTaskOptions) => {
  const { services } = ctx;
  const ability = await services.permissions.getUserPermissionsForApp({
    appId: kodixCareAppId,
    user: ctx.auth.user,
  });
  ForbiddenError.from(ability).throwUnlessCan("Create", "CareTask");

  const [created] = await careTaskRepository.createCareTask({
    ...input,
    createdBy: ctx.auth.user.id,
    createdFromCalendar: false,
    teamId: ctx.auth.user.activeTeamId,
  });

  if (!created) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create care task",
    });
  }

  const careTaskInserted = await careTaskRepository.findCareTaskById({
    id: created.id,
    teamId: ctx.auth.user.activeTeamId,
  });

  await logActivity({
    appId: kodixCareAppId,
    diff: diff({}, careTaskInserted),
    rowId: created.id,
    tableName: "careTask",
    teamId: ctx.auth.user.activeTeamId,
    type: "create",
    userId: ctx.auth.user.id,
  });
};
