"use server";

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

  deleteSessionTokenCookie();

  return redirect("/");
}
