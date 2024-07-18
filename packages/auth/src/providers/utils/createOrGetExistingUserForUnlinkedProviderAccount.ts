import { cookies } from "next/headers";

import { db } from "@kdx/db/client";
import { nanoid } from "@kdx/db/nanoid";
import { schema } from "@kdx/db/schema";

import { createUser } from "../../db";

export default async function createOrGetExistingUserForUnlinkedProviderAccount({
  name,
  email,
  image,
  providerUserId,
  providerId,
}: {
  name: string;
  email: string;
  image?: string;
  providerUserId: string;
  providerId: "google" | "discord";
}) {
  let userId = nanoid();

  await db.transaction(async (tx) => {
    const existingUser = await tx.query.users.findFirst({
      columns: {
        id: true,
        image: true,
      },
      where: (users, { and, eq }) => {
        return and(eq(users.email, email));
      },
    });

    if (!existingUser) {
      const teamId = nanoid();
      const invite = cookies().get("invite")?.value;
      await createUser({
        name,
        email,
        image: image ?? "",
        teamId,
        userId,
        invite,
        tx,
      });
      cookies().delete("invite");
    } else {
      userId = existingUser.id;
    }

    await tx.insert(schema.accounts).values({
      providerId: providerId,
      providerUserId: providerUserId,
      userId,
    });
  });
  return userId;
}
