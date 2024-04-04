import { getI18n } from "@kdx/locales/server";
import { todoAppId } from "@kdx/shared";
import { Separator } from "@kdx/ui/separator";
import { H1 } from "@kdx/ui/typography";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";
import { columns } from "~/app/[locale]/_components/apps/todo/columns";
import { CreateTaskDialogButton } from "~/app/[locale]/_components/apps/todo/create-task-dialog-button";
import { DataTable } from "~/app/[locale]/_components/apps/todo/data-table";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { api } from "~/trpc/server";

export default async function Todo() {
  await redirectIfAppNotInstalled({
    appId: todoAppId,
  });

  const data = await api.app.todo.getAll();
  const t = await getI18n();
  return (
    <MaxWidthWrapper>
      <div className="flex space-x-4">
        <IconKodixApp appId={todoAppId} renderText={false} />
        <H1>{t("Todo")}</H1>
      </div>
      <Separator className="my-4" />
      <CreateTaskDialogButton />
      <DataTable columns={columns} data={data ?? []} />
    </MaxWidthWrapper>
  );
}
