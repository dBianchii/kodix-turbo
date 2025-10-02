"use server";

import { getLocale } from "next-intl/server";

import { trpcCaller } from "@kdx/api/trpc/react/server";

import { action } from "~/helpers/safe-action/safe-action";
import { redirect } from "~/i18n/routing";

import { ZSigninActionSchema } from "./schema";

export const signInAction = action
  .inputSchema(ZSigninActionSchema)
  .action(async ({ parsedInput: { email, password, callbackUrl } }) => {
    await trpcCaller.user.signInByPassword({
      email,
      password,
    });
    redirect({
      href: callbackUrl ?? "/team",
      locale: await getLocale(),
    });
  });
