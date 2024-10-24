import { sql } from "@kdx/db";
import { db } from "@kdx/db/client";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetInvitationsOptions {
  ctx: TProtectedProcedureContext;
}

const prepared = db.query.invitations
  .findMany({
    where: (invitation, { eq }) =>
      eq(invitation.email, sql.placeholder("email")),
    columns: {
      id: true,
    },
    with: {
      Team: {
        columns: {
          id: true,
          name: true,
        },
      },
      InvitedBy: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })
  .prepare();

export const getInvitationsHandler = async ({ ctx }: GetInvitationsOptions) => {
  const invitations = await prepared.execute({
    email: ctx.auth.user.email,
  });

  return invitations;
};
