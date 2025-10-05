import type { ProviderConfig } from "@kodix/auth/providers";
import { cookies } from "next/headers";
import { authProviders } from "@kodix/auth/providers";
import { nanoid } from "@kodix/shared/utils";

import { db } from "@kdx/db/client";
import { authRepository, userRepository } from "@kdx/db/repositories";

import { createUser } from "../utils";

export type { AuthProvider } from "@kodix/auth/providers";

const providerConfig: ProviderConfig = {
  repositories: {
    findAccountByProviderUserId: authRepository.findAccountByProviderUserId,
    findUserByEmail: userRepository.findUserByEmail,
    createUserWithProvider: async ({
      //TODO: it would seem that this function can be reused and moved to @kodix/auth
      name,
      email,
      image,
      providerUserId,
      providerId,
    }) => {
      let userId = nanoid();
      const existingUser = await userRepository.findUserByEmail(email);

      await db.transaction(async (tx) => {
        if (existingUser) {
          userId = existingUser.id;
        } else {
          const inviteFromCookie = (await cookies()).get("invite")?.value;
          await createUser({
            tx,
            name,
            email,
            image: image ?? "",
            teamId: nanoid(),
            userId,
            invite: inviteFromCookie,
          });
          if (inviteFromCookie) {
            (await cookies()).delete("invite");
          }
        }

        await authRepository.createAccount(tx, {
          providerId,
          providerUserId,
          userId,
        });
      });

      return userId;
    },
  },
};

export const kdxAuthProviders = {
  google: authProviders.google(providerConfig),
  discord: authProviders.discord(providerConfig),
};
export type KdxAuthProvider = keyof typeof kdxAuthProviders;
