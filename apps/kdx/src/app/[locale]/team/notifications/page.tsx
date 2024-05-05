import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { getI18n } from "@kdx/locales/server";
import { DataTableSkeleton } from "@kdx/ui/data-table/data-table-skeleton";
import { H1, Lead } from "@kdx/ui/typography";
import { ZGetNotificationsInputSchema } from "@kdx/validators/trpc/user";

import { api } from "~/trpc/server";
import { CustomKodixIcon } from "../../_components/app/kodix-icon";
import MaxWidthWrapper from "../../_components/max-width-wrapper";
import { DataTableNotifications } from "./_components/data-table-notifications";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session) redirect("/");
  const t = await getI18n();

  const search = ZGetNotificationsInputSchema.omit({ teamId: true }).parse(
    searchParams,
  );
  const notificationsPromise = api.user.getNotifications({
    ...search,
    teamId: session.user.activeTeamId,
  });

  return (
    <MaxWidthWrapper>
      <div className="flex items-center space-x-4">
        <CustomKodixIcon
          appName={t("Notifications")}
          renderText={false}
          appUrl={"/team/notifications"}
          iconPath={"/appIcons/notifications.png"}
        />
        <H1>{t("Notifications")}</H1>
      </div>
      <Lead className="mt-2">{t("Manage your notifications")}</Lead>
      <br />
      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={5}
            searchableColumnCount={1}
            filterableColumnCount={2}
            cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
            shrinkZero
          />
        }
      >
        <DataTableNotifications notificationsPromise={notificationsPromise} />
      </Suspense>
    </MaxWidthWrapper>
  );
}
