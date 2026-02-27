"use server";

import { getLocaleBasedOnCookie } from "@kdx/api/utils/locales";
import { auth, deleteSessionTokenCookie, invalidateSession } from "@kdx/auth";

import { redirect } from "~/i18n/routing";

export async function signOutAction() {
  const { session } = await auth();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await invalidateSession(session.id);

  await deleteSessionTokenCookie();

  return redirect({
    href: "/",
    locale: await getLocaleBasedOnCookie(),
  });
}
