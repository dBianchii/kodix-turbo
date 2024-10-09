import type { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";

import { db } from "@kdx/db/client";

import { getLocaleBasedOnCookie } from "../utils/locales";

export const createCronJobCtx = (req: NextRequest) => {
  const authToken = req.headers.get("Upstash-Signature");

  return {
    token: authToken,
    locale: getLocaleBasedOnCookie(),
    db,
  };
};
export type TCronJobContext = ReturnType<typeof createCronJobCtx>;

export const authedQStashCronJob =
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

    const QSTASH_CURRENT_SIGNING_KEY = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const QSTASH_NEXT_SIGNING_KEY = process.env.QSTASH_NEXT_SIGNING_KEY;

    if (!QSTASH_CURRENT_SIGNING_KEY || !QSTASH_NEXT_SIGNING_KEY)
      throw new Error(
        "QSTASH_CURRENT_SIGNING_KEY and QSTASH_NEXT_SIGNING_KEY must be set",
      );

    const r = new Receiver({
      currentSigningKey: QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: QSTASH_NEXT_SIGNING_KEY,
    });

    const isValid = await r.verify({
      signature: ctx.token ?? "",
      body: JSON.stringify(req.body),
    });

    if (!isValid) {
      return new Response("Unauthorized", { status: 401 });
    }

    return handler({
      req,
      res,
      ctx,
    });
  };
