import {
  ZAcceptInputSchema,
  ZDeleteInputSchema,
  ZInviteInputSchema,
} from "@kdx/validators/trpc/invitation";

import { createTRPCRouter } from "~/trpc";
import { protectedProcedure } from "../../../procedures";
import { acceptHandler } from "./accept.handler";
import { declineHandler } from "./decline.handler";
import { deleteHandler } from "./delete.handler";
import { getAllHandler } from "./getAll.handler";
import { inviteHandler } from "./invite.handler";

export const invitationRouter = createTRPCRouter({
  accept: protectedProcedure.input(ZAcceptInputSchema).mutation(acceptHandler),
  decline: protectedProcedure
    .input(ZAcceptInputSchema)
    //.use(enforceUserHasTeam)
    .mutation(declineHandler),
  delete: protectedProcedure.input(ZDeleteInputSchema).mutation(deleteHandler),
  getAll: protectedProcedure.query(getAllHandler),
  invite: protectedProcedure.input(ZInviteInputSchema).mutation(inviteHandler),
});
