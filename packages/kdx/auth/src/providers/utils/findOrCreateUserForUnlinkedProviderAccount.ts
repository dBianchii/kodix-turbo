import { cookies } from "next/headers";

import { db } from "@kdx/db/client";
import { nanoid } from "@kdx/db/nanoid";
import { authRepository, userRepository } from "@kdx/db/repositories";

import { createUser } from "../../utils";

export default async function findOrCreateUserForUnlinkedProviderAccount({
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
  const existingUser = await userRepository.findUserByEmail(email);

  await db.transaction(async (tx) => {
    if (existingUser) userId = existingUser.id;
    else {
      const invite = (await cookies()).get("invite")?.value;
      await createUser({
        tx,
        name,
        email,
        image: image ?? "",
        teamId: nanoid(),
        userId,
        invite,
      });
      (await cookies()).delete("invite");
    }

    await authRepository.createAccount(tx, {
      providerId,
      providerUserId,
      userId,
    });
  });
  return userId;
}
