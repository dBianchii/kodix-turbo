"use server";

import { redirect } from "next/navigation";
import { auth, deleteSessionTokenCookie, invalidateSession } from "@cash/auth";

export async function signOutAction() {
  const { session } = await auth();

  if (session) {
    await invalidateSession(session.id);
  }

  await deleteSessionTokenCookie();

  redirect("/");
}
