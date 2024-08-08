"use client";

import { LuLoader2 } from "react-icons/lu";

import { useTranslations } from "@kdx/locales/next-intl/client";
import { useRouter } from "@kdx/locales/next-intl/navigation";
import { getErrorMessage } from "@kdx/shared";
import { cn } from "@kdx/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@kdx/ui/alert-dialog";
import { Button } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kdx/ui/form";
import { Input } from "@kdx/ui/input";
import { toast } from "@kdx/ui/toast";
import { ZDeleteTeamInputSchema } from "@kdx/validators/trpc/team";
import { useI18nZodErrors } from "@kdx/validators/useI18nZodErrors";

import { api } from "~/trpc/react";

export function DeleteTeamCardClient({
  teamName,
  canEdit,
}: {
  teamName: string;
  canEdit: boolean;
}) {
  useI18nZodErrors();
  const t = useTranslations();

  const form = useForm({
    schema: ZDeleteTeamInputSchema,
  });

  const router = useRouter();
  const mutation = api.team.deleteTeam.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <Card className="w-full border-destructive text-left">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            toast.promise(mutation.mutateAsync(data), {
              loading: `${t("Saving")}...`,
              success: t("Team name saved successfully"),
              error: (err) => {
                return getErrorMessage(err);
              },
            });
          })}
        >
          <CardHeader>
            <CardTitle>{t("Delete team")}</CardTitle>
            <CardDescription>
              {t("Before deleting your team you must remove all members")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5"></div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-destructive bg-destructive/40 px-6 py-4">
            {/* <CardDescription>
              {t("Please use 32 characters at maximum")}
            </CardDescription> */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={"destructive"}>{t("Delete team")}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t.rich("You are deleting your team teamName", {
                      teamName: () => <b className="font-light">{teamName}</b>,
                    })}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t(
                      "All data related to your team will be permanently lost and cannot be recovered",
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div>ey</div>
                <AlertDialogFooter className="justify-between">
                  <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                  <AlertDialogAction>{t("Continue")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
