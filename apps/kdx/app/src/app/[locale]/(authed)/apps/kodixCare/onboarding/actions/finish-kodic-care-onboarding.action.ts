"use server";

import { revalidatePath } from "next/cache";
import { kodixCareAppId, kodixCareConfigSchema } from "@kodix/shared/db";
import { getLocale } from "next-intl/server";

import { trpcCaller } from "@kdx/api/trpc/react/server";

import { action } from "~/helpers/safe-action/safe-action";
import { redirect } from "~/i18n/routing";

export const finishKodixCareOnboardingAction = action
  .inputSchema(kodixCareConfigSchema)
  .action(async ({ parsedInput }) => {
    await Promise.allSettled([
      trpcCaller.app.saveConfig({
        appId: kodixCareAppId,
        config: parsedInput,
      }),
      trpcCaller.app.installApp({
        appId: kodixCareAppId,
      }),
    ]);
    revalidatePath("/", "layout");
    redirect({ href: "/apps/kodixCare", locale: await getLocale() });
  });
