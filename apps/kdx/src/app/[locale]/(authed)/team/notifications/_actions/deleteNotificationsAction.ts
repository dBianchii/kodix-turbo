"use server";

import { revalidatePath } from "next/cache";

import type { TDeleteNotificationsInputSchema } from "@kdx/validators/trpc/user";

import { trpc } from "~/trpc/server";

export const deleteNotificationsAction = async (
  input: TDeleteNotificationsInputSchema,
) => {
  await trpc.user.deleteNotifications(input);
  revalidatePath("/[locale]/team/notifications");
};
