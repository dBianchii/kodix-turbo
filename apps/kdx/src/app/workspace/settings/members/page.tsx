import { Suspense } from "react";

import { auth } from "@kdx/auth";

import SettingsEditCardSkeleton from "../general/_components/edit-team-name-card-skeleton";
import { EditWSMembersAndInvitesCard } from "./_components/edit-team-members/edit-ws-members-and-invites-card";
import TeamInviteCard from "./_components/invite/team-invite-card";

export default async function Members() {
  const session = await auth();
  if (!session) return null;

  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <TeamInviteCard session={session} />
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditWSMembersAndInvitesCard />
      </Suspense>
    </div>
  );
}
