import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { getI18n } from "@kdx/locales/server";
import { DataTableSkeleton } from "@kdx/ui/data-table/data-table-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kdx/ui/tabs";

import { api } from "~/trpc/server";
import { InviteDataTable } from "./_components/edit-team-members/invites/data-table-invite";
import { DataTableMembers } from "./_components/edit-team-members/members/data-table-members";
import TeamInviteCard from "./_components/invite/team-invite-card";

export default async function SettingsMembersPage() {
  const { user } = await auth();
  if (!user) redirect("/");
  const t = await getI18n();

  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <TeamInviteCard user={user} />
      <Tabs defaultValue="members">
        <TabsList className="">
          <TabsTrigger value="members">{t("Members")}</TabsTrigger>
          <TabsTrigger value="invites">{t("Invites")}</TabsTrigger>
        </TabsList>
        <TabsContent value="members">
          <Suspense
            fallback={
              <DataTableSkeleton
                columnCount={2}
                rowCount={3}
                withPagination={false}
                showViewOptions={false}
                cellWidths={["auto", "5rem"]}
                shrinkZero
              />
            }
          >
            <DataTableMembersServer />
          </Suspense>
        </TabsContent>
        <TabsContent value="invites">
          <Suspense
            fallback={
              <DataTableSkeleton
                columnCount={2}
                rowCount={3}
                withPagination={false}
                showViewOptions={false}
                cellWidths={["auto", "5rem"]}
                shrinkZero
              />
            }
          >
            <InviteDataTable
              initialInvitations={await api.team.invitation.getAll()}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function DataTableMembersServer() {
  const { user } = await auth();
  if (!user) return null;

  const users = await api.team.getAllUsers();

  return <DataTableMembers initialUsers={users} user={user} />;
}
