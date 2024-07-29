"use client";

import { LuLoader2 } from "react-icons/lu";

import { useTranslations } from "@kdx/locales/client";
import { useRouter } from "@kdx/locales/navigation";
import { getErrorMessage } from "@kdx/shared";
import { cn } from "@kdx/ui";
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
import { ZUpdateInputSchema } from "@kdx/validators/trpc/team";

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
  const form = useForm({
    schema: ZUpdateInputSchema,
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
  const t = useTranslations();

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
            <CardDescription>
              {t("This is your teams visible name")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <FormField
                  control={form.control}
                  name="teamName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Team name")}</FormLabel>
                      <FormControl>
                        <Input
                          className={cn({
                            "cursor-not-allowed": !canEdit,
                          })}
                          placeholder="Acme"
                          {...field}
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
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <CardDescription>
              {t("Please use 32 characters at maximum")}
            </CardDescription>
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
