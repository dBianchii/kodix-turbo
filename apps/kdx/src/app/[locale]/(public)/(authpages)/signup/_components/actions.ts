"use server";

import { getLocale } from "next-intl/server";

import { redirect } from "@kdx/locales/next-intl/navigation";
import { ZSignupWithPasswordInputSchema } from "@kdx/validators/trpc/user";

import { action } from "~/helpers/safe-action/safe-action";
import { api } from "~/trpc/server";

export const signupAction = action
  .schema(ZSignupWithPasswordInputSchema)
  .action(async ({ parsedInput }) => {
    await api.user.signupWithPassword(parsedInput);
    redirect({
      href: "/team",
      locale: await getLocale(),
    });
  });
