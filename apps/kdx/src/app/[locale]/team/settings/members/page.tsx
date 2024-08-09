import { Suspense } from "react";

import { auth } from "@kdx/auth";
import { db } from "@kdx/db/client";
import { redirect } from "@kdx/locales/next-intl/navigation";
import { getTranslations } from "@kdx/locales/next-intl/server";
import { DataTableSkeleton } from "@kdx/ui/data-table/data-table-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kdx/ui/tabs";

import { api } from "~/trpc/server";
import { InviteDataTable } from "./_components/edit-team-members/invites/data-table-invite";
import { DataTableMembers } from "./_components/edit-team-members/members/data-table-members";
import TeamInviteCard from "./_components/invite/team-invite-card";

export default async function SettingsMembersPage() {
  const { user } = await auth();
  if (!user) return redirect("/");
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
    <div className="mt-8 space-y-6 md:mt-0">
      <div>
        <h2 className="text-center text-2xl font-bold md:text-left">
          {t("Members")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("settings.Invite members to your team and remove active members")}
        </p>
      </div>
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
