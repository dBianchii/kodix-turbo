import {
  ZChangeNameInputSchema,
  ZGetOneInputSchema,
  ZSwitchActiveTeamInputSchema,
} from "@kdx/validators/trpc/user";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";
import { changeNameHandler } from "./changeName.handler";
import { getAllHandler } from "./getAll.handler";
import { getNotificationsHandler } from "./getNotifications.handler";
import { getOneHandler } from "./getOne.handler";
import { switchActiveTeamHandler } from "./switchActiveTeam.handler";

export const userRouter = createTRPCRouter({
  changeName: protectedProcedure
    .input(ZChangeNameInputSchema)
    .mutation(async (opts) => await changeNameHandler(opts)),
  getAll: publicProcedure.query(
    async ({ ctx }) => await getAllHandler({ ctx }),
  ),
  getNotifications: protectedProcedure.query(
    async ({ ctx }) => await getNotificationsHandler({ ctx }),
  ),
  getOne: protectedProcedure
    .input(ZGetOneInputSchema)
    .query(async (opts) => await getOneHandler(opts)),
  switchActiveTeam: protectedProcedure
    .input(ZSwitchActiveTeamInputSchema)
    .mutation(async (opts) => await switchActiveTeamHandler(opts)),
});
