"use client";

import { useTranslations } from "next-intl";
import { LuLoader2 } from "react-icons/lu";

import { useRouter } from "@kdx/locales/next-intl/navigation";
import { getErrorMessage } from "@kdx/shared";
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
import { useI18nZodErrors } from "@kdx/validators/useI18nZodErrors";

import { api } from "~/trpc/react";

export function EditTeamNameCardClient({
  teamId,
  teamName,
  canEdit,
}: {
  teamId: string;
  teamName: string;
  canEdit: boolean;
}) {
  useI18nZodErrors();
  const t = useTranslations();

  const form = useForm({
    schema: ZUpdateInputSchema(t),
    defaultValues: {
      teamId,
      teamName,
    },
  });

  const router = useRouter();
  const mutation = api.team.update.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <Card className="w-full text-left">
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
                          className={cn({
                            "cursor-not-allowed": !canEdit,
                          })}
                          placeholder="Acme"
                          {...field}
                          onChange={(e) => {
                            void form.trigger("teamName");
                            field.onChange(e);
                          }}
                          disabled={!canEdit}
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
            <Button disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <LuLoader2 className="mr-2 size-4 animate-spin" />{" "}
                  {t("Saving")}
                </>
              ) : (
                <>{t("Save")}</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
