import type { TCheckEmailForRegisterInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { userRepository } from "@kdx/db/repositories";

import type { TPublicProcedureContext } from "../../../procedures";

interface CheckEmailForRegisterOptions {
  ctx: TPublicProcedureContext;
  input: TCheckEmailForRegisterInputSchema;
}

export const checkEmailForRegisterHandler = async ({
  ctx,
  input,
}: CheckEmailForRegisterOptions) => {
  const { publicRepositories } = ctx;

  const user = await userRepository.findUserByEmail(input.email);
  if (user) return { status: "already registered" as const };

  const invite = await asdssadewf.findInvitationByEmail(input.email);
  if (!invite) return { status: "not invited" as const };

  const inviteLink = {
    inviteId: invite.id, //`${getBaseKdxUrl()}/team/invite/${invite.id}`,
    status: "invited" as const,
  };

  return inviteLink;
};
