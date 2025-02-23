import { cookies } from "next/headers";

import { db } from "@kdx/db/client";
import { nanoid } from "@kdx/db/nanoid";
import {
  public_authRepositoryFactory,
  public_teamRepositoryFactory,
  public_userRepositoryFactory,
} from "@kdx/db/repositories";

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

  const publicUserRepository = public_userRepositoryFactory();
  const publicTeamRepository = public_teamRepositoryFactory();
  const publicAuthRepository = public_authRepositoryFactory();

  const existingUser = await publicUserRepository.findUserByEmail(email);

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
        publicTeamRepository,
        publicUserRepository,
      });
      (await cookies()).delete("invite");
    }

    await publicAuthRepository.createAccount(tx, {
      providerId,
      providerUserId,
      userId,
    });
  });
  return userId;
}
