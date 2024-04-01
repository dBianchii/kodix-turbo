import { auth } from "@kdx/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kdx/ui/tabs";

import { api } from "~/trpc/server";
import { InviteDataTable } from "./invites/data-table-invite";
import { DataTableMembers } from "./members/data-table-members";

export async function EditTeamMembersAndInvitesCard() {
  const session = await auth();
  if (!session) return null;

  const users = await api.team.getAllUsers();

  return (
    <Tabs defaultValue="members">
      <TabsList className="">
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="invites">Invites</TabsTrigger>
      </TabsList>
      <TabsContent value="members">
        <DataTableMembers initialUsers={users} session={session} />
      </TabsContent>
      <TabsContent value="invites">
        <InviteDataTable />
      </TabsContent>
    </Tabs>
  );
}
