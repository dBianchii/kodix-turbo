import { Suspense } from "react";

import { auth } from "@kdx/auth";

import SettingsEditCardSkeleton from "../general/_components/edit-workspace-name-card-skeleton";
import { EditWSMembersAndInvitesCard } from "./_components/edit-workspace-members/edit-ws-members-and-invites-card";
import WorkspaceInviteCard from "./_components/invite/workspace-invite-card";

export default async function Members() {
  const session = await auth();
  if (!session) return null;

  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <WorkspaceInviteCard session={session} />
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditWSMembersAndInvitesCard />
      </Suspense>
    </div>
  );
}
