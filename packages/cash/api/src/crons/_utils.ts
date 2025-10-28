import { headers } from "next/headers";
import { Receiver } from "@upstash/qstash";

export const createCronJobCtx = async () => ({});
export type TCronJobContext = Awaited<ReturnType<typeof createCronJobCtx>>;

const receiver = new Receiver({
  // biome-ignore lint/style/noNonNullAssertion: <it's not undefined in production>
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  // biome-ignore lint/style/noNonNullAssertion: <it's not undefined in production>
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
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

    // Allow running cron jobs locally, for development purposes
    if (process.env.NODE_ENV === "development") return handler({ ctx, req });

    const qStashSignature = (await headers()).get("Upstash-Signature");
    if (!qStashSignature)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const isValid = await receiver.verify({
      body: await req.text(),
      signature: qStashSignature,
    });
    if (!isValid)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    return handler({ ctx, req });
  };
