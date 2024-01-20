import { notFound, redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";

import { api } from "~/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
  const { id: invitationId } = params;

  const invitation = await prisma.invitation.findUnique({
    where: {
      id: invitationId,
    },
  });
  if (!invitation) return notFound();

  const session = await auth();
  if (!session)
    return redirect(
      `/api/auth/signin?callbackUrl=/team/invite/${invitationId}`,
    );

  if (session.user.email !== invitation.email) return notFound();
  await api.team.invitation.accept({ invitationId });

  return redirect("/");
}
