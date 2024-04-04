import { auth } from "@kdx/auth";
import { getI18n } from "@kdx/locales/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kdx/ui/tabs";

import { api } from "~/trpc/server";
import { InviteDataTable } from "./invites/data-table-invite";
import { DataTableMembers } from "./members/data-table-members";

export async function EditTeamMembersAndInvitesCard() {
  const session = await auth();
  if (!session) return null;

  const users = await api.team.getAllUsers();

  const t = await getI18n();

  return (
    <Tabs defaultValue="members">
      <TabsList className="">
        <TabsTrigger value="members">{t("Members")}</TabsTrigger>
        <TabsTrigger value="invites">{t("Invites")}</TabsTrigger>
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
