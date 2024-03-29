import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZAcceptInputSchema,
  ZDeleteUserSchema,
  ZInviteInputSchema,
} from "@kdx/validators/trpc/invitation";

import { protectedProcedure } from "../../../trpc";
import { acceptHandler } from "./accept.handler";
import { declineHandler } from "./decline.handler";
import { deleteHandler } from "./delete.handler";
import { getAllHandler } from "./getAll.handler";
import { inviteHandler } from "./invite.handler";

export const invitationRouter = {
  accept: protectedProcedure
    .input(ZAcceptInputSchema)
    .mutation(async (opts) => await acceptHandler(opts)),
  decline: protectedProcedure
    .input(ZAcceptInputSchema)
    //.use(enforceUserHasTeam)
    .mutation(async (opts) => await declineHandler(opts)),
  delete: protectedProcedure
    .input(ZDeleteUserSchema)
    .mutation(async (opts) => await deleteHandler(opts)),
  getAll: protectedProcedure.query(
    async ({ ctx }) => await getAllHandler({ ctx }),
  ),
  invite: protectedProcedure
    .input(ZInviteInputSchema)
    .mutation(async (opts) => await inviteHandler(opts)),
} satisfies TRPCRouterRecord;
