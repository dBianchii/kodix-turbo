"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { kodixCareAppId } from "@kdx/shared";

import { getAppUrl } from "~/helpers/miscelaneous";
import { action } from "~/helpers/safe-action/safe-action";
import { api } from "~/trpc/server";

export const startShiftButtonAction = action(z.void(), async () => {
  await api.kodixCare.startShift();
  revalidatePath(`${getAppUrl(kodixCareAppId)}`);
});
