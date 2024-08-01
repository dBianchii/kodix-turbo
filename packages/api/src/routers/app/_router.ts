import type { TRPCRouterRecord } from "@trpc/server";


import {
  publicProcedure
} from "../../procedures";
import { saveConfigHandler } from "./saveConfig.handler";

export const appRouter = {
  saveConfig: publicProcedure
    .query(saveConfigHandler),
} satisfies TRPCRouterRecord;
