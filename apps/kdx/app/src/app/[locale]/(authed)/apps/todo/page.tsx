import { todoAppId } from "@kodix/shared/db";
import { getTranslations } from "next-intl/server";

import { Separator } from "@kdx/ui/separator";
import { H1 } from "@kdx/ui/typography";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { trpcCaller } from "~/trpc/server";

import { CreateTaskDialogButton } from "./_components/create-task-dialog-button";
import { DataTableTodo } from "./_components/data-table-todo";

export default async function TodoPage() {
  await redirectIfAppNotInstalled({
    appId: todoAppId,
  });

  const initialData = await trpcCaller.app.todo.getAll();
  const t = await getTranslations();
  return (
    <MaxWidthWrapper>
      <main className="pt-6">
        <div className="flex space-x-4">
          <IconKodixApp appId={todoAppId} renderText={false} />
          <H1>{t("Todo")}</H1>
        </div>
        <Separator className="my-4" />
        <CreateTaskDialogButton />
        <DataTableTodo initialData={initialData} />
      </main>
    </MaxWidthWrapper>
  );
}
