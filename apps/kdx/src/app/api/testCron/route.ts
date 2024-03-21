import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"), //5 Requests per 1 hour
  analytics: true,
});
export async function GET() {
  await ratelimit.limit(`Cron Job fired at ${new Date().toString()}`);

  // await prisma.post.create({
  //   data: {
  //     content: "Cron Job fired at " + new Date().toString(),
  //     title: "Cron Job",
  //   },
  // });

  return new NextResponse(null, {
    status: 200,
  });
}
