import { ForbiddenError } from "@casl/ability";
import { TRPCError } from "@trpc/server";

import type { TDeleteCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
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
  const { permissionsService } = ctx.services;
  const { careTaskRepository } = ctx.repositories;
  const careTask = await careTaskRepository.findCareTaskById(input.id);
  if (!careTask) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.Care task not found"),
    });
  }

  const ability = await permissionsService.getUserPermissionsForApp({
    appId: kodixCareAppId,
    user: ctx.auth.user,
  });
  ForbiddenError.from(ability).throwUnlessCan("Delete", {
    __typename: "CareTask",
    createdFromCalendar: careTask.createdFromCalendar,
    createdBy: careTask.createdBy,
  });

  await careTaskRepository.deleteCareTaskById(input.id);
};
