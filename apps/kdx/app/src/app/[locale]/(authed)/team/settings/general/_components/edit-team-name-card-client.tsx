"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useForm,
} from "@kdx/ui/form";
import { Input } from "@kdx/ui/input";
import { toast } from "@kdx/ui/toast";
import { ZUpdateInputSchema } from "@kdx/validators/trpc/team";

import { useRouter } from "~/i18n/routing";
import { useTRPC } from "~/trpc/react";

import { getErrorMessage } from "../../../../../../../../../../../packages/kodix/shared/src/utils";

export function EditTeamNameCardClient({
  teamId,
  teamName,
  canEdit,
}: {
  teamId: string;
  teamName: string;
  canEdit: boolean;
}) {
  const trpc = useTRPC();
  const t = useTranslations();

  const form = useForm({
    schema: ZUpdateInputSchema(t),
    defaultValues: {
      teamId,
      teamName,
    },
  });

  const router = useRouter();
  const mutation = useMutation(
    trpc.team.update.mutationOptions({
      onSuccess: () => {
        router.refresh();
      },
    }),
  );

  return (
    <Card className="w-full text-left">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            toast.promise(mutation.mutateAsync(data), {
              loading: `${t("Saving")}...`,
              success: t("Team name saved successfully"),
              error: getErrorMessage,
            }),
          )}
        >
          <CardHeader>
            <CardTitle>{t("Team name")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <FormField
                  control={form.control}
                  name="teamName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          className={cn({
                            "cursor-not-allowed": !canEdit,
                          })}
                          disabled={!canEdit}
                          placeholder="Acme"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t px-6 py-4">
            <Button loading={mutation.isPending}>{t("Save")}</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
