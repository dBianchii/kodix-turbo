import { notFound, redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { schema } from "@kdx/db/schema";

import { api } from "~/trpc/server";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { id: invitationId } = params;

  const invitation = await db.query.invitations.findFirst({
    where: eq(schema.invitations.id, invitationId),
  });
  if (!invitation) return notFound();
  const session = await auth();

  if (!session) {
    //Redirect the user
    const url = new URL(
      `/api/auth/signin?callbackUrl=/team/invite/${invitationId}`,
      window.location.href,
    );
    const isExpoRedirect = searchParams["expo-redirect"];
    if (isExpoRedirect && typeof isExpoRedirect === "string") {
      url.searchParams.append(
        "expo-redirect",
        encodeURIComponent(isExpoRedirect),
      );
      url.searchParams.append(
        "expo-register",
        encodeURIComponent(`invite-${invitationId}`),
      );
    }

    redirect(url.href);
  }

  if (session.user.email !== invitation.email) return notFound();
  await api.team.invitation.accept({ invitationId });

  redirect("/");
}
