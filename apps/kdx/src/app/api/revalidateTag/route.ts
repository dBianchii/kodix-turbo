import { revalidateTag } from "next/cache";
import { z } from "zod";

export const POST = async (request: Request) => {
  const json = (await request.json()) as unknown;
  const tag = z.string().parse(json);

  revalidateTag(tag);

  return Response.json({ success: `Revalidated tag "${tag}"` });
};
