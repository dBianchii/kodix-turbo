import { useTranslations } from "next-intl";
import { z } from "zod";

import { useRouter } from "@kdx/locales/next-intl/navigation";
import { getErrorMessage } from "@kdx/shared";
import {
  AlertDialog,
  AlertDialogAction,
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

import { api } from "~/trpc/react";

export function DeleteTeamConfirmationDialog({
  teamName,
  open,
  setOpen,
}: {
  teamName: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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
    <AlertDialog
      open={open}
      onOpenChange={(isOpening) => {
        if (!isOpening) form.reset();
        setOpen(isOpening);
      }}
    >
      <AlertDialogContent>
        <Form {...form}>
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
              <div className="flex gap-2 rounded-md bg-destructive/40 p-3 text-sm text-red-400">
                <span className="font-bold">{t("Warning")}:</span>
                <span>
                  {t("This action is not reversible please be certain")}
                </span>
              </div>
            </AlertDialogHeader>
            <div className="flex flex-col gap-4 bg-card/40 py-8">
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
              <Button
                onClick={form.handleSubmit((values) => {
                  toast.promise(
                    mutation.mutateAsync({
                      teamNameConfirmation: values.teamNameConfirmation,
                    }),
                    {
                      loading: t("Deleting team"),
                      success: t("Team deleted successfully"),
                      error: (err) => getErrorMessage(err),
                    },
                  );
                })}
              >
                {t("Continue")}
              </Button>
            </AlertDialogFooter>
          </div>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
