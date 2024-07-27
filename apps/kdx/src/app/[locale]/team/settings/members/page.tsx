import { Suspense } from "react";

import { auth } from "@kdx/auth";
import { db } from "@kdx/db/client";
import { redirect } from "@kdx/locales/navigation";
import { getTranslations } from "@kdx/locales/server";
import { DataTableSkeleton } from "@kdx/ui/data-table/data-table-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kdx/ui/tabs";

import { api } from "~/trpc/server";
import { InviteDataTable } from "./_components/edit-team-members/invites/data-table-invite";
import { DataTableMembers } from "./_components/edit-team-members/members/data-table-members";
import TeamInviteCard from "./_components/invite/team-invite-card";

export default async function SettingsMembersPage() {
  const { user } = await auth();
  if (!user) redirect("/");
  const t = await getTranslations();

  const currentTeam = await db.query.teams.findFirst({
    where: (teams, { eq }) => eq(teams.id, user.activeTeamId),
    columns: {
      ownerId: true,
    },
  });
  if (!currentTeam) throw new Error("No team found");
  const canEditPage = currentTeam.ownerId === user.id;

  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <TeamInviteCard user={user} canEditPage={canEditPage} />
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
            <DataTableMembersServer canEditPage={canEditPage} />
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
              canEditPage={canEditPage}
              initialInvitations={await api.team.invitation.getAll()}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function DataTableMembersServer({
  canEditPage,
}: {
  canEditPage: boolean;
}) {
  const { user } = await auth();
  if (!user) return null;

  return <DataTableMembers user={user} canEditPage={canEditPage} />;
}
