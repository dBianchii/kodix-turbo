"use server";

import { getLocale } from "next-intl/server";

import { trpcCaller } from "@kdx/api/trpc/react/server";
import { ZSignupWithPasswordInputSchema } from "@kdx/validators/trpc/user";

import { action } from "~/helpers/safe-action/safe-action";
import { redirect } from "~/i18n/routing";

export const signupAction = action
  .inputSchema(ZSignupWithPasswordInputSchema)
  .action(async ({ parsedInput }) => {
    await trpcCaller.user.signupWithPassword(parsedInput);
    redirect({
      href: "/team",
      locale: await getLocale(),
    });
  });
