"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import z from "zod/v4";

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

import { useRouter } from "~/i18n/routing";
import { useTRPC } from "~/trpc/react";

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
    <Card className="border-destructive w-full text-left">
      <CardHeader>
        <CardTitle>{t("Delete account")}</CardTitle>
        <CardDescription>
          {t("Permanently delete your account and all your data ")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5"></div>
        </div>
      </CardContent>
      <CardFooter className="border-destructive bg-destructive/40 flex justify-end border-t px-6 py-4">
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
                    loading: t("Deleting account"),
                    success: t("Account deleted successfully"),
                    error: (err) => getErrorMessage(err),
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
                  <div className="bg-destructive/40 flex gap-2 rounded-md p-3 text-sm text-red-400">
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
                  <Button type="submit" disabled={mutation.isPending}>
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
