"use client";

import { getErrorMessage } from "@kodix/shared/utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@kodix/ui/alert-dialog";
import { Button } from "@kodix/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kodix/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kodix/ui/form";
import { Input } from "@kodix/ui/input";
import { toast } from "@kodix/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import z from "zod";

import { useTRPC } from "@kdx/api/trpc/react/client";

import { useRouter } from "~/i18n/routing";

export function DeleteAccountCard() {
  const trpc = useTRPC();
  const t = useTranslations();

  const confirmationNeeded = t("Delete my account");
  const form = useForm({
    schema: z.object({
      confirmation: z.literal(confirmationNeeded),
    }),
  });

  const router = useRouter();
  const mutation = useMutation(
    trpc.user.deleteAccount.mutationOptions({
      onSuccess: () => {
        router.push("/");
        router.refresh();
      },
    }),
  );

  return (
    <Card className="w-full overflow-hidden border-destructive pb-0 text-left">
      <CardHeader>
        <CardTitle>{t("Delete account")}</CardTitle>
        <CardDescription>
          {t("Permanently delete your account and all your data ")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5" />
        </div>
      </CardContent>
      <CardFooter className="justify-end border-destructive border-t bg-destructive/40 py-6">
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
            <Button variant={"destructive"}>{t("Delete account")}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <Form {...form}>
              <form
                className="flex flex-col gap-4"
                onSubmit={form.handleSubmit(() => {
                  toast.promise(mutation.mutateAsync(), {
                    error: (err) => getErrorMessage(err),
                    loading: t("Deleting account"),
                    success: t("Account deleted successfully"),
                  });
                })}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("You are deleting your account")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t(
                      "All data related to you will be permanently lost and cannot be recovered",
                    )}
                  </AlertDialogDescription>
                  <div className="flex gap-2 rounded-md bg-destructive/40 p-3 text-red-400 text-sm">
                    <span className="font-bold">{t("Warning")}:</span>
                    <span>
                      {t("This action is not reversible please be certain")}
                    </span>
                  </div>
                </AlertDialogHeader>
                <div className="flex flex-col gap-4 py-8">
                  <FormField
                    control={form.control}
                    name="confirmation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">
                          {t.rich("Please type DELETE_ACCOUNT to continue", {
                            deleteAccount: () => <b>{confirmationNeeded}</b>,
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
                  <AlertDialogCancel disabled={mutation.isPending}>
                    {t("Cancel")}
                  </AlertDialogCancel>
                  <Button disabled={mutation.isPending} type="submit">
                    {t("Delete account")}
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
