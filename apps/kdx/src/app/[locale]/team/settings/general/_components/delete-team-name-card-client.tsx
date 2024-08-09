"use client";

import { z } from "zod";

import { useTranslations } from "@kdx/locales/next-intl/client";
import { useRouter } from "@kdx/locales/next-intl/navigation";
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

export function DeleteTeamCardClient({ teamName }: { teamName: string }) {
  useI18nZodErrors();
  const t = useTranslations();

  const deleteMyTeamString = t("delete my team");

  const form = useForm({
    schema: ZDeleteTeamInputSchema.extend({
      teamNameConfirmation: z.literal(teamName, {
        message: t("Team name does not match"),
      }),
      verification: z.literal(deleteMyTeamString),
    }),
  });

  const router = useRouter();
  const mutation = api.team.deleteTeam.useMutation({
    onSuccess: () => {
      router.push("/team");
      router.refresh();
    },
  });

  return (
    <Card className="w-full border-destructive text-left">
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
        <AlertDialog
          onOpenChange={(open) => {
            form.reset();
            return open;
          }}
        >
          <AlertDialogTrigger asChild>
            <Button variant={"destructive"}>{t("Delete team")}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <Form {...form}>
              <form
                className="flex flex-col gap-4"
                onSubmit={form.handleSubmit((values) => {
                  toast.promise(
                    mutation.mutateAsync({
                      teamNameConfirmation: values.teamNameConfirmation,
                    }),
                    {
                      loading: t("Deleting team..."),
                      success: t("Team deleted successfully"),
                      error: (err) => getErrorMessage(err),
                    },
                  );
                })}
              >
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
                  <div className="flex gap-2 rounded-md bg-destructive/40 p-3 text-sm text-red-400">
                    <span className="font-bold">{t("Warning")}:</span>
                    <span>
                      {t("This action is not reversible please be certain")}
                    </span>
                  </div>
                </AlertDialogHeader>
                <div className="bg-card/40 py-8">
                  <FormField
                    control={form.control}
                    name="teamNameConfirmation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">
                          {t.rich("Enter the team name teamName to continue", {
                            teamName: () => <b>{teamName}</b>,
                          })}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="verification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">
                          {t.rich("To verify please type KEY", {
                            deleteMyTeam: () => <b>{deleteMyTeamString}</b>,
                          })}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <AlertDialogFooter className="gap-3 sm:justify-between">
                  <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                  <Button type="submit">{t("Continue")}</Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
