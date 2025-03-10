import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { getErrorMessage } from "@kdx/shared";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@kdx/ui/alert-dialog";
import { Button } from "@kdx/ui/button";
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

import { useRouter } from "~/i18n/routing";
import { useTRPC } from "~/trpc/react";

export function DeleteTeamConfirmationDialog({
  teamName,
  teamId,
  open,
  setOpen,
}: {
  teamName: string;
  teamId: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const trpc = useTRPC();
  const t = useTranslations();
  const deleteMyTeamString = t("delete my team");

  const form = useForm({
    schema: ZDeleteTeamInputSchema.extend({
      teamNameConfirmation: z.literal(teamName, {
        message: t("Team name does not match"),
      }),
      verification: z.literal(deleteMyTeamString),
    }),
    defaultValues: {
      teamId,
    },
  });

  const router = useRouter();
  const mutation = useMutation(
    trpc.team.deleteTeam.mutationOptions({
      onSuccess: () => {
        router.push("/team");
        router.refresh();
      },
    }),
  );

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpening) => {
        if (!isOpening) form.reset();
        setOpen(isOpening);
      }}
    >
      <AlertDialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              toast.promise(
                mutation.mutateAsync({
                  teamNameConfirmation: values.teamNameConfirmation,
                  teamId: teamId,
                }),
                {
                  loading: t("Deleting team"),
                  success: t("Team deleted successfully"),
                  error: (err) => getErrorMessage(err),
                },
              );
            })}
          >
            <div className="flex flex-col gap-4">
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
                <div className="bg-destructive/40 flex gap-2 rounded-md p-3 text-sm text-red-400">
                  <span className="font-bold">{t("Warning")}:</span>
                  <span>
                    {t("This action is not reversible please be certain")}
                  </span>
                </div>
              </AlertDialogHeader>
              <div className="bg-card/40 flex flex-col gap-4 py-8">
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
                <Button loading={mutation.isPending}>{t("Continue")}</Button>
              </AlertDialogFooter>
            </div>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
