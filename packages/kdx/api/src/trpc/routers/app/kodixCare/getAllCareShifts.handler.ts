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
  const shifts = await db.query.careShifts.findMany({
    orderBy: [asc(careShifts.checkIn)],
    where: eq(careShifts.teamId, ctx.auth.user.activeTeamId),
    with: {
      Caregiver: {
        columns: {
          image: true,
          name: true,
        },
      },
    },
  });

  return shifts;
};
