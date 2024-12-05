"use client";

import { useTranslations } from "next-intl";

import { getErrorMessage } from "@kdx/shared";
import {
  AlertDialog,
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
import { Form, useForm } from "@kdx/ui/form";
import { toast } from "@kdx/ui/toast";
import { ZLeaveTeamInputSchema } from "@kdx/validators/trpc/team";

import { useRouter } from "~/i18n/routing";
import { api } from "~/trpc/react";

export function LeaveTeamCardClient({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const t = useTranslations();

  const form = useForm({
    schema: ZLeaveTeamInputSchema,
    defaultValues: {
      teamId,
    },
  });

  const router = useRouter();
  const mutation = api.team.leaveTeam.useMutation({
    onSuccess: () => {
      router.push("/team");
      router.refresh();
    },
  });

  return (
    <Card className="w-full text-left">
      <CardHeader>
        <CardTitle>{t("Leave team")}</CardTitle>
        <CardDescription>
          {t(
            "If you leave the team you will not be able to access it anymore until you are invited back",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5"></div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t px-6 py-4">
        {/* <CardDescription>
              {t("Please use 32 characters at maximum")}
            </CardDescription> */}
        <AlertDialog
          onOpenChange={(open) => {
            form.reset();
            return open;
          }}
        >
          <AlertDialogTrigger asChild>
            <Button>{t("Leave team")}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <Form {...form}>
              <form
                className="flex flex-col gap-4"
                onSubmit={form.handleSubmit(() => {
                  toast.promise(
                    mutation.mutateAsync({
                      teamId,
                    }),
                    {
                      loading: t("Leaving team"),
                      success: t("Successfully left the team"),
                      error: (err) => getErrorMessage(err),
                    },
                  );
                })}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t.rich("You are leaving the team TEAMNAME", {
                      teamName: () => <b className="font-light">{teamName}</b>,
                    })}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("Are you sure you want to leave the team")}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-3 sm:justify-between">
                  <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                  <Button type="submit" loading={mutation.isPending}>
                    {mutation.isPending ? t("Leaving team") : t("Leave team")}
                  </Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
