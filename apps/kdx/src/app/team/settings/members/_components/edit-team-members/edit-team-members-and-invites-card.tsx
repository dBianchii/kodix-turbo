import { auth } from "@kdx/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kdx/ui/tabs";

import { api, HydrateClient } from "~/trpc/server";
import { InviteDataTable } from "./invites/data-table-invite";
import { DataTableMembers } from "./members/data-table-members";

export async function EditTeamMembersAndInvitesCard() {
  const session = await auth();
  if (!session) return null;

  await api.team.getAllUsers();
  await api.team.invitation.getAll();
  return (
    <Tabs defaultValue="members">
      <TabsList className="">
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="invites">Invites</TabsTrigger>
      </TabsList>
      <HydrateClient>
        <TabsContent value="members">
          <DataTableMembers session={session} />
        </TabsContent>
        <TabsContent value="invites">
          <InviteDataTable />
        </TabsContent>
      </HydrateClient>
    </Tabs>
  );
}
