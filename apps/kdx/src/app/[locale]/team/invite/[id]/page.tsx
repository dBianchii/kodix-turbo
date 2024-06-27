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
  if (!session)
    redirect(`/api/auth/signin?callbackUrl=/team/invite/${invitationId}`);

  if (user.email !== invitation.email) return notFound();
  await api.team.invitation.accept({ invitationId });

  redirect("/");
}
