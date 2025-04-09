import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { auth } from "@kdx/auth";
import { teamRepository, userRepository } from "@kdx/db/repositories";

import { redirect } from "~/i18n/routing";
import { trpcCaller } from "~/trpc/server";

export default async function InvitePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id: invitationId } = params;

  const invitation = await teamRepository.findInvitationById(invitationId);
  if (!invitation) return notFound();

  const { user } = await auth();
  if (!user) {
    let path = `/signup?invite=${invitationId}`;

    const existingUser = await userRepository.findUserByEmail(invitation.email);

    //? If the user already has an account, redirect them back here after signing in.
    if (existingUser) path = `/signin?callbackUrl=/team/invite/${invitationId}`;

    return redirect({
      href: path,
      locale: await getLocale(),
    });
  }

  if (user.email !== invitation.email) return notFound();
  await trpcCaller.team.invitation.accept({ invitationId });

  redirect({
    href: "/team",
    locale: await getLocale(),
  });
}
