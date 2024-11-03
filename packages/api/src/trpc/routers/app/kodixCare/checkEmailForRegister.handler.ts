import type { TCheckEmailForRegisterInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { findUserByEmail } from "@kdx/db/auth";
import { findInvitationByEmail } from "@kdx/db/team";

import type { TPublicProcedureContext } from "../../../procedures";

interface CheckEmailForRegisterOptions {
  ctx: TPublicProcedureContext;
  input: TCheckEmailForRegisterInputSchema;
}

export const checkEmailForRegisterHandler = async ({
  input,
}: CheckEmailForRegisterOptions) => {
  const user = await findUserByEmail(input.email);
  if (user) return { status: "already registered" as const };

  const invite = await findInvitationByEmail(input.email);
  if (!invite) return { status: "not invited" as const };

  const inviteLink = {
    inviteId: invite.id, //`${getBaseKdxUrl()}/team/invite/${invite.id}`,
    status: "invited" as const,
  };

  return inviteLink;
};
