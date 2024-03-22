import { revalidateTag } from "next/cache";

import { cacheTags, getBaseUrl, getZodEnumFromObjectEnum } from "@kdx/shared";

export const POST = async (request: Request) => {
  const tags = getZodEnumFromObjectEnum(cacheTags)
    .array()
    .min(1)
    .parse(await request.json());

  for (const tag of tags) revalidateTag(tag);

  return Response.json(
    `Successfully revalidated tags: "${tags.join(", ")}" on Next.JS app running at ${getBaseUrl()}`,
  );
};
