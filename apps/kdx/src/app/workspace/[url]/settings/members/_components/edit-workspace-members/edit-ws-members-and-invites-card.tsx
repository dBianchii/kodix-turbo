import { auth } from "@kdx/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kdx/ui";

import { api } from "~/trpc/server";
import { InviteDataTable } from "./invites/data-table-invite";
import { DataTableMembers } from "./members/data-table-members";

export interface Member {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export async function EditWSMembersAndInvitesCard() {
  const session = await auth();
  if (!session) return null;

  const users = await api.workspace.getAllUsers.query();
  const initialInvites = await api.workspace.invitation.getAll.query();

  return (
    <Tabs defaultValue="members">
      <TabsList className="">
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="invites">Invites</TabsTrigger>
      </TabsList>
      <TabsContent value="members">
        <DataTableMembers initialUsers={users} />
      </TabsContent>
      <TabsContent value="invites">
        <InviteDataTable initialInvites={initialInvites} />
      </TabsContent>
    </Tabs>
  );
}
