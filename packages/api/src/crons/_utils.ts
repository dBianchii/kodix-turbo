import type { NextRequest, NextResponse } from "next/server";

import { db } from "@kdx/db/client";

import { getLocaleBasedOnCookie } from "../utils/locales";

export const createCronJobCtx = (req: NextRequest) => {
  const authToken = req.headers.get("Authorization") ?? null;

  return {
    token: authToken,
    locale: getLocaleBasedOnCookie(),
    db,
  };
};
export type TCronJobContext = ReturnType<typeof createCronJobCtx>;

export const authedVercelCronJob =
  (
    handler: ({
      req,
      res,
      ctx,
    }: {
      req: NextRequest;
      res: NextResponse;
      ctx: TCronJobContext;
    }) => Promise<void>,
  ) =>
  async (req: NextRequest, res: NextResponse) => {
    const ctx = createCronJobCtx(req);
    if (ctx.token !== `Bearer ${process.env.CRON_SECRET}`)
      return new Response("Unauthorized", {
        status: 401,
      });

    return handler({
      req,
      res,
      ctx,
    });
  };
