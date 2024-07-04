"use server";

import { redirect } from "next/navigation";

import { action } from "~/helpers/safe-action/safe-action";
import { api } from "~/trpc/server";
import { ZSigninActionSchema } from "./schema";

export const signInAction = action(
  ZSigninActionSchema,
  async ({ email, password, callbackUrl }) => {
    await api.user.signInByPassword({
      email,
      password,
    });
    redirect(callbackUrl ?? "/team");
  },
);
