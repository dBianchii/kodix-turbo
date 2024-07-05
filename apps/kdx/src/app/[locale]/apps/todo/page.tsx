import { getI18n } from "@kdx/locales/server";
import { todoAppId } from "@kdx/shared";
import { Separator } from "@kdx/ui/separator";
import { H1 } from "@kdx/ui/typography";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { CreateTaskDialogButton } from "~/app/[locale]/apps/todo/_components/create-task-dialog-button";
import { DataTableTodo } from "~/app/[locale]/apps/todo/_components/data-table-todo";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { api, HydrateClient } from "~/trpc/server";

export default async function TodoPage() {
  await redirectIfAppNotInstalled({
    appId: todoAppId,
  });

  void api.app.todo.getAll.prefetch();
  const t = await getI18n();
  return (
    <MaxWidthWrapper>
      <div className="flex space-x-4">
        <IconKodixApp appId={todoAppId} renderText={false} />
        <H1>{t("Todo")}</H1>
      </div>
      <Separator className="my-4" />
      <CreateTaskDialogButton />
      <HydrateClient>
        <DataTableTodo />
      </HydrateClient>
    </MaxWidthWrapper>
  );
}
