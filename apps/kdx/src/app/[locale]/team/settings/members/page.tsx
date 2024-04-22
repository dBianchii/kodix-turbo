import { Suspense } from "react";

import { auth } from "@kdx/auth";
import { getI18n } from "@kdx/locales/server";
import { DataTableSkeleton } from "@kdx/ui/data-table-skeleton";
import { Skeleton } from "@kdx/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kdx/ui/tabs";

import { api } from "~/trpc/server";
import SettingsEditCardSkeleton from "../general/_components/edit-team-name-card-skeleton";
import { InviteDataTable } from "./_components/edit-team-members/invites/data-table-invite";
import { DataTableMembers } from "./_components/edit-team-members/members/data-table-members";
import TeamInviteCard from "./_components/invite/team-invite-card";

export default async function SettingsMembersPage() {
  const session = await auth();
  if (!session) return null;

  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <TeamInviteCard session={session} />
      </Suspense>
      <Suspense
        fallback={
          <Tabs defaultValue="one">
            <TabsList className="">
              <TabsTrigger value="one">
                <Skeleton className="h-4 w-12" />
              </TabsTrigger>
              <TabsTrigger value="two">
                <Skeleton className="h-4 w-12" />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="one">
              <DataTableSkeleton
                columnCount={2}
                rowCount={3}
                withPagination={false}
                showViewOptions={false}
                cellWidths={["auto", "5rem"]}
                shrinkZero
              />
            </TabsContent>
            <TabsContent value="two"></TabsContent>
          </Tabs>
        }
      >
        <EditTeamMembersAndInvitesCard />
      </Suspense>
    </div>
  );
}

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
