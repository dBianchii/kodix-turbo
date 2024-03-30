import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZChangeNameInputSchema,
  ZGetOneInputSchema,
  ZSwitchActiveTeamInputSchema,
} from "@kdx/validators/trpc/user";

import { protectedProcedure, publicProcedure } from "../../trpc";
import { changeNameHandler } from "./changeName.handler";
import { getAllHandler } from "./getAll.handler";
import { getNotificationsHandler } from "./getNotifications.handler";
import { getOneHandler } from "./getOne.handler";
import { switchActiveTeamHandler } from "./switchActiveTeam.handler";

export const userRouter = {
  changeName: protectedProcedure
    .input(ZChangeNameInputSchema)
    .mutation(changeNameHandler),
  getAll: publicProcedure.query(getAllHandler),
  getNotifications: protectedProcedure.query(getNotificationsHandler),
  getOne: protectedProcedure.input(ZGetOneInputSchema).query(getOneHandler),
  switchActiveTeam: protectedProcedure
    .input(ZSwitchActiveTeamInputSchema)
    .mutation(switchActiveTeamHandler),
} satisfies TRPCRouterRecord;
