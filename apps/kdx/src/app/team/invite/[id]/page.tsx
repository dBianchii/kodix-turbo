import { notFound, redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { db, eq, schema } from "@kdx/db";

import { api } from "~/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
  const { id: invitationId } = params;

  // const invitation = await prisma.invitation.findUnique({
  //   where: {
  //     id: invitationId,
  //   },
  // });

  const invitation = await db.query.invitations.findFirst({
    where: eq(schema.invitations, invitationId),
  });
  if (!invitation) return notFound();

  const session = await auth();
  if (!session)
    redirect(`/api/auth/signin?callbackUrl=/team/invite/${invitationId}`);

  if (session.user.email !== invitation.email) return notFound();
  await api.team.invitation.accept({ invitationId });

  redirect("/");
}
