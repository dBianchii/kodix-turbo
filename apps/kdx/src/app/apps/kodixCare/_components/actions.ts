"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { kodixCareAppId } from "@kdx/shared";

import { getAppUrl } from "~/helpers/miscelaneous";
import { action } from "~/helpers/safe-action/safe-action";
import { api } from "~/trpc/server";

export const toggleShiftButtonAction = action(z.void(), async () => {
  await api.app.kodixCare.toggleShift();
  revalidatePath(`${getAppUrl(kodixCareAppId)}`);
});

export const doCheckoutAction = action(z.date(), async (value) => {
  await api.app.kodixCare.doCheckoutForShift(value);
  revalidatePath(`${getAppUrl(kodixCareAppId)}`);
});
