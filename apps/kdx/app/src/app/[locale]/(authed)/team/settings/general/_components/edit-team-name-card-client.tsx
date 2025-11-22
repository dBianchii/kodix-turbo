"use client";

import { getErrorMessage } from "@kodix/shared/utils";
import { Button } from "@kodix/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kodix/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useForm,
} from "@kodix/ui/form";
import { Input } from "@kodix/ui/input";
import { cn } from "@kodix/ui/lib/utils";
import { toast } from "@kodix/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { useTRPC } from "@kdx/api/trpc/react/client";
import { ZUpdateInputSchema } from "@kdx/validators/trpc/team";

import { useRouter } from "~/i18n/routing";

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
    defaultValues: {
      teamId,
      teamName,
    },
    schema: ZUpdateInputSchema(t),
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
    <Card>
      <CardHeader>
        <CardTitle>{t("Team name")}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            toast.promise(mutation.mutateAsync(data), {
              error: getErrorMessage,
              loading: `${t("Saving")}...`,
              success: t("Team name saved successfully"),
            }),
          )}
        >
          <CardContent className="pb-6">
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
          </CardContent>
          <CardFooter className="justify-end border-t">
            <Button loading={mutation.isPending}>{t("Save")}</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
