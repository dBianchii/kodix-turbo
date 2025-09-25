import { Suspense } from "react";
import { HydrateClient, prefetch } from "@kodix/trpc/react/server";
import { DataTableSkeleton } from "@kodix/ui/data-table/data-table-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kodix/ui/tabs";
import { getLocale, getTranslations } from "next-intl/server";

import { auth } from "@kdx/auth";
import { teamRepository } from "@kdx/db/repositories";

import { redirect } from "~/i18n/routing";
import { trpc } from "~/trpc/server";

import { InviteDataTable } from "./_components/edit-team-members/invites/data-table-invite";
import { DataTableMembers } from "./_components/edit-team-members/members/data-table-members";
import TeamInviteCard from "./_components/invite/team-invite-card";
import { ReloadMembersButton } from "./_components/reload-members-button";

export default async function SettingsMembersPage() {
  const { user } = await auth();
  if (!user) return redirect({ href: "/", locale: await getLocale() });

  const t = await getTranslations();

  const currentTeam = await teamRepository.findTeamById(user.activeTeamId);

  if (!currentTeam) throw new Error("No team found");
  const canEditPage = currentTeam.ownerId === user.id;

  prefetch(trpc.team.getAllUsers.queryOptions());

  return (
    <div className="mt-8 space-y-6 md:mt-0">
      <div>
        <h2 className="text-center font-bold text-2xl md:text-left">
          {t("Members")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("settings.Invite members to your team and remove active members")}
        </p>
      </div>
      <HydrateClient>
        <TeamInviteCard user={user} canEditPage={canEditPage} />
        <Tabs defaultValue="members">
          <div className="flex flex-row gap-2">
            <TabsList className="">
              <TabsTrigger value="members">{t("Members")}</TabsTrigger>
              <TabsTrigger value="invites">{t("Invites")}</TabsTrigger>
            </TabsList>
            <ReloadMembersButton />
          </div>
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
              <DataTableMembers user={user} canEditPage={canEditPage} />
            </Suspense>
          </TabsContent>
          <TabsContent value="invites">
            <InviteDataTable canEditPage={canEditPage} />
          </TabsContent>
        </Tabs>
      </HydrateClient>
    </div>
  );
}
