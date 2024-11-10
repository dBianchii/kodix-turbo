import { asc, eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { careShifts } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetAllCareShiftsOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllCareShiftsHandler = async ({
  ctx,
}: GetAllCareShiftsOptions) => {
  return await db.query.careShifts.findMany({
    where: eq(careShifts.teamId, ctx.auth.user.activeTeamId),
    orderBy: [asc(careShifts.checkIn)],
    with: {
      Caregiver: {
        columns: {
          image: true,
          name: true,
        },
      },
    },
  });
};
