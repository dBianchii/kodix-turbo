"use server";

import { redirect } from "next/navigation";
import { auth, deleteSessionTokenCookie, invalidateSession } from "@cash/auth";

export async function signOutAction() {
  const { session } = await auth();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await invalidateSession(session.id);

  await deleteSessionTokenCookie();

  redirect("/");
}
