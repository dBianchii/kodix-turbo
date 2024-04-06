import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZAcceptInputSchema,
  ZDeleteUserSchema,
  ZInviteInputSchema,
} from "@kdx/validators/trpc/invitation";

import { protectedProcedure } from "~/procedures";
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
  delete: protectedProcedure.input(ZDeleteUserSchema).mutation(deleteHandler),
  getAll: protectedProcedure.query(getAllHandler),
  invite: protectedProcedure.input(ZInviteInputSchema).mutation(inviteHandler),
} satisfies TRPCRouterRecord;
