import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { Receiver } from "@upstash/qstash";
import { getTranslations } from "next-intl/server";

import { env } from "@kdx/auth/env";
import { db } from "@kdx/db/client";

import { getLocaleBasedOnCookie } from "../utils/locales";

export const createCronJobCtx = async () => ({
  t: await getTranslations({ locale: await getLocaleBasedOnCookie() }),
  db,
});
export type TCronJobContext = Awaited<ReturnType<typeof createCronJobCtx>>;

const receiver = new Receiver({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export const verifiedQstashCron =
  (
    handler: ({
      req,
      ctx,
    }: {
      req: NextRequest;
      ctx: TCronJobContext;
    }) => Promise<Response>,
  ) =>
  async (req: NextRequest) => {
    const ctx = await createCronJobCtx();

    //? Allow running cron jobs locally, for development purposes
    if (env.NODE_ENV !== "production") return handler({ req, ctx });

    const qStashSignature = (await headers()).get("Upstash-Signature");
    if (!qStashSignature)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const isValid = await receiver.verify({
      body: await req.text(),
      signature: qStashSignature,
    });
    if (!isValid)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    return handler({ req, ctx });
  };
