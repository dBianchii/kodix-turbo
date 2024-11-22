"use server";

import { getLocaleBasedOnCookie } from "node_modules/@kdx/api/src/utils/locales";

import { auth, deleteSessionTokenCookie, invalidateSession } from "@kdx/auth";
import { redirect } from "@kdx/locales/next-intl/navigation";

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
