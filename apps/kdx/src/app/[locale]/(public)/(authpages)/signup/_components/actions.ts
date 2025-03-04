"use server";

import { getLocale } from "next-intl/server";

import { ZSignupWithPasswordInputSchema } from "@kdx/validators/trpc/user";

import { action } from "~/helpers/safe-action/safe-action";
import { redirect } from "~/i18n/routing";
import { trpc } from "~/trpc/server";

export const signupAction = action
  .schema(ZSignupWithPasswordInputSchema)
  .action(async ({ parsedInput }) => {
    await trpc.user.signupWithPassword(parsedInput);
    redirect({
      href: "/team",
      locale: await getLocale(),
    });
  });
