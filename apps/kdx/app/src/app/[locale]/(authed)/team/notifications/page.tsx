import { Suspense } from "react";
import { DataTableSkeleton } from "@kodix/ui/data-table/data-table-skeleton";
import { H1, Lead } from "@kodix/ui/typography";
import { getLocale, getTranslations } from "next-intl/server";

import { trpcCaller } from "@kdx/api/trpc/react/server";
import { auth } from "@kdx/auth";
import { ZGetNotificationsInputSchema } from "@kdx/validators/trpc/user";

import { CustomKodixIcon } from "~/app/[locale]/_components/app/custom-kodix-icon";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { redirect } from "~/i18n/routing";

import { DataTableNotifications } from "./_components/data-table-notifications";
import { NotificationsDateRangePicker } from "./_components/notifications-date-range-picker";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function NotificationsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const { user } = await auth();
  if (!user) redirect({ href: "/", locale: await getLocale() });
  const t = await getTranslations();

  const search = ZGetNotificationsInputSchema.parse(searchParams);
  const notificationsPromise = trpcCaller.user.getNotifications({
    ...search,
  });
  const allTeamsPromise = trpcCaller.team.getAll();

  return (
    <MaxWidthWrapper>
      <div className="flex items-center space-x-4">
        <CustomKodixIcon
          appName={t("Notifications")}
          renderText={false}
          iconPath={"/appIcons/notifications.png"}
        />
        <H1>{t("Notifications")}</H1>
      </div>
      <Lead className="mt-2">{t("Manage your notifications")}</Lead>
      <br />

      <NotificationsDateRangePicker
        triggerSize="sm"
        triggerClassName="ml-auto w-fit min-w-56"
        align="end"
      />
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
        <DataTableNotifications
          notificationsPromise={notificationsPromise}
          allTeamsPromise={allTeamsPromise}
        />
      </Suspense>
    </MaxWidthWrapper>
  );
}
