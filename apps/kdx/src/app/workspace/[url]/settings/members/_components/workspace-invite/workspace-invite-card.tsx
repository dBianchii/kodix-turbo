import { auth } from "@kdx/auth";

import WorkspaceInviteCardClient from "./workspace-invite-card-client";

export default async function WorkspaceInviteCard() {
  const session = await auth();
  if (!session) return null;
  // const invites = await prisma.invitation.findMany({
  //   where: {
  //     workspaceId: session.user.activeWorkspaceId,
  //   },
  //   select: {
  //     id: true,
  //     email: true,
  //   },
  // });

  return <WorkspaceInviteCardClient />;
}
