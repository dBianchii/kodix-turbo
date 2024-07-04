"use server";

import { redirect } from "next/navigation";

import { ZSignupWithPasswordInputSchema } from "@kdx/validators/trpc/user";

import { action } from "~/helpers/safe-action/safe-action";
import { api } from "~/trpc/server";

export const signupAction = action(
  ZSignupWithPasswordInputSchema,
  async (input) => {
    await api.user.signupWithPassword(input);
    redirect("/team");
  },
);
