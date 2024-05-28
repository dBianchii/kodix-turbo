"use server";

import { revalidatePath } from "next/cache";

import type { TDeleteNotificationsInputSchema } from "@kdx/validators/trpc/user";

import { api } from "~/trpc/server";

export const deleteNotificationsAction = async (
  input: TDeleteNotificationsInputSchema,
) => {
  //wait 4 secs
  await new Promise((resolve) => setTimeout(resolve, 4000));
  await api.user.deleteNotifications(input);
  revalidatePath("/[locale]/team/notifications");
};
