import { headers } from "next/headers";
import { Receiver } from "@upstash/qstash";
import { getTranslations } from "next-intl/server";

import { db } from "@kdx/db/client";
import { env } from "@kdx/env";

import { getLocaleBasedOnCookie } from "../utils/locales";

export const createCronJobCtx = async () => ({
  t: await getTranslations({ locale: await getLocaleBasedOnCookie() }),
  db,
});
export type TCronJobContext = Awaited<ReturnType<typeof createCronJobCtx>>;

const receiver = new Receiver({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY!,
});

export const verifiedQstashCron =
  (
    handler: ({
      req,
      ctx,
    }: {
      req: Request;
      ctx: TCronJobContext;
    }) => Promise<Response>,
  ) =>
  async (req: Request) => {
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
