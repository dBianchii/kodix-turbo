import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZAcceptInputSchema,
  ZDeleteInputSchema,
  ZInviteInputSchema,
} from "@kdx/validators/trpc/team/invitation";

import { isTeamOwnerProcedure, protectedProcedure } from "../../../procedures";
import { acceptHandler } from "./accept.handler";
import { declineHandler } from "./decline.handler";
import { deleteHandler } from "./delete.handler";
import { getAllHandler } from "./getAll.handler";
import { inviteHandler } from "./invite.handler";

export const invitationRouter = {
  accept: protectedProcedure.input(ZAcceptInputSchema).mutation(acceptHandler),
  decline: protectedProcedure
    .input(ZAcceptInputSchema)
    //.use(enforceUserHasTeam)
    .mutation(declineHandler),
  delete: protectedProcedure.input(ZDeleteInputSchema).mutation(deleteHandler),
  getAll: protectedProcedure.query(getAllHandler),
  invite: isTeamOwnerProcedure
    .input(ZInviteInputSchema)
    .mutation(inviteHandler),
} satisfies TRPCRouterRecord;
