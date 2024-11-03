import { cookies } from "next/headers";

import { createAccount, findUserByEmail } from "@kdx/db/auth";
import { db } from "@kdx/db/client";
import { nanoid } from "@kdx/db/nanoid";

import { createUser } from "../../utils";

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
  const existingUser = await findUserByEmail(email);

  await db.transaction(async (tx) => {
    if (existingUser) userId = existingUser.id;
    else {
      const teamId = nanoid();
      const invite = cookies().get("invite")?.value;
      await createUser({
        tx,
        name,
        email,
        image: image ?? "",
        teamId,
        userId,
        invite,
      });
      cookies().delete("invite");
    }

    await createAccount(tx, {
      providerId,
      providerUserId,
      userId,
    });
  });
  return userId;
}
