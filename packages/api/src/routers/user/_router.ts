import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZChangeNameInputSchema,
  ZSwitchActiveTeamInputSchema,
} from "@kdx/validators/trpc/user";

import { protectedProcedure } from "../../procedures";
import { changeNameHandler } from "./changeName.handler";
import { getNotificationsHandler } from "./getNotifications.handler";
import { switchActiveTeamHandler } from "./switchActiveTeam.handler";

export const userRouter = {
  changeName: protectedProcedure
    .input(ZChangeNameInputSchema)
    .mutation(changeNameHandler),
  getNotifications: protectedProcedure.query(getNotificationsHandler),
  switchActiveTeam: protectedProcedure
    .input(ZSwitchActiveTeamInputSchema)
    .mutation(switchActiveTeamHandler),
} satisfies TRPCRouterRecord;
