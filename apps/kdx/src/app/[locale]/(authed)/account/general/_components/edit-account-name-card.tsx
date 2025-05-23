import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

import { auth } from "@kdx/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";

import { trpcCaller } from "~/trpc/server";
import { SubmitButton } from "./submit-button";

export async function EditAccountNameCard({ name }: { name?: string | null }) {
  const { user } = await auth();
  if (!user) return null;
  const t = await getTranslations();
  return (
    <form
      action={async (values) => {
        "use server";

        await trpcCaller.user.changeName({
          name: values.get("name") as string,
        });
        revalidatePath("/account/general");
      }}
    >
      <Card className="w-full text-left">
        <CardHeader>
          <CardTitle>{t("account.Display Name")}</CardTitle>
          <CardDescription>
            {t(
              "account.please-enter-your-full-name-or-a-display-name-you-are-comfortable-with",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">{t("Name")}</Label>
              <Input
                required
                id="name"
                name="name"
                maxLength={32}
                defaultValue={name ?? ""}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <CardDescription>
            {t("account.Please use 32 characters at maximum")}
          </CardDescription>
          <SubmitButton>{t("Save")}</SubmitButton>
        </CardFooter>
      </Card>
    </form>
  );
}
