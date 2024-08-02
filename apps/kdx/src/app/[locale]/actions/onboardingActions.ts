"use server";

import { revalidatePath } from "next/cache";


import { action } from "~/helpers/safe-action/safe-action";
import { api } from "~/trpc/server";

export const finishKodixCareOnboardingAction = action
  .action(async () => {
    await api.app.saveConfig();
    revalidatePath("/", "layout");
  });
