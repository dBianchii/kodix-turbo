import {
  ZAcceptInputSchema,
  ZDeleteUserSchema,
  ZInviteInputSchema,
} from "@kdx/validators/trpc/invitation";

import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import { acceptHandler } from "./accept.handler";
import { declineHandler } from "./decline.handler";
import { deleteHandler } from "./delete.handler";
import { getAllHandler } from "./getAll.handler";
import { inviteHandler } from "./invite.handler";

export const invitationRouter = createTRPCRouter({
  accept: protectedProcedure
    .input(ZAcceptInputSchema)
    //.use(enforceUserHasTeam) // TODO: make this a middleware
    .mutation(async (opts) => await acceptHandler(opts)),
  decline: protectedProcedure
    .input(ZAcceptInputSchema)
    //.use(enforceUserHasTeam)
    .mutation(async (opts) => await declineHandler(opts)),
  delete: protectedProcedure
    .input(ZDeleteUserSchema)
    //.use(enforceUserHasTeam) // TODO: make this a middleware
    .mutation(async (opts) => await deleteHandler(opts)),
  getAll: protectedProcedure.query(
    async ({ ctx }) => await getAllHandler({ ctx }),
  ),
  invite: protectedProcedure
    .input(ZInviteInputSchema)
    .mutation(async (opts) => await inviteHandler(opts)),
});
