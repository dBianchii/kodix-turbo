import { TRPCError } from "@trpc/server";

import type { TCreateCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { kodixCareRepository } from "@kdx/db/repositories";
import { kodixCareAppId, kodixCareRoleDefaultIds } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getMyRolesHandler } from "../../team/appRole/getMyRoles.handler";

interface CreateCareShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateCareShiftInputSchema;
}

export const createCareShiftHandler = async ({
  ctx,
  input,
}: CreateCareShiftOptions) => {
  if (input.careGiverId !== ctx.auth.user.id) {
    const roles = await getMyRolesHandler({
      ctx,
      input: { appId: kodixCareAppId },
    });

    if (
      !roles.some(
        (role) => role.appRoleDefaultId === kodixCareRoleDefaultIds.admin,
      )
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ctx.t(
          "api.Only admins can create shifts for other caregivers",
        ),
      });
    }
  }

  await kodixCareRepository.createCareShift({
    caregiverId: input.careGiverId,
    endAt: input.endAt,
    startAt: input.startAt,
    teamId: ctx.auth.user.activeTeamId,
  });
};
