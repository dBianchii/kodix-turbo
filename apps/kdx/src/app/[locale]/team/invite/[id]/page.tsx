import { notFound, redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { schema } from "@kdx/db/schema";

import { api } from "~/trpc/server";

export default async function InvitePage({
  params,
}: {
  params: { id: string };
}) {
  const { id: invitationId } = params;

  const invitation = await db.query.invitations.findFirst({
    where: eq(schema.invitations.id, invitationId),
  });
  if (!invitation) return notFound();

  const { user } = await auth();
  if (!user) {
    let path = `/signup?invite=${invitationId}`;

    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, invitation.email),
      columns: { id: true },
    });

    //? If the user already has an account, redirect them back here after signing in.
    if (existingUser) path = `/signin?callbackUrl=/team/invite/${invitationId}`;

    return redirect(path);
  }

  if (user.email !== invitation.email) return notFound();
  await api.team.invitation.accept({ invitationId });

  redirect("/");
}
