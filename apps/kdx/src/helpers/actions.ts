"use server";

import { cookies } from "next/headers";

import { auth, lucia } from "@kdx/auth";
import { redirect } from "@kdx/locales/navigation";

export async function signOutAction() {
  const { session } = await auth();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}
