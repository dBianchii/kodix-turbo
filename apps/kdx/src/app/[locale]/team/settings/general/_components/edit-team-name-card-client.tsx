"use client";

import { useRouter } from "next/navigation";
import { LuLoader2 } from "react-icons/lu";

import { useI18n } from "@kdx/locales/client";
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

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

export function EditTeamNameCardClient({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
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
    onError: (e) => trpcErrorToastDefault(e),
  });
  const t = useI18n();

  return (
    <Card className="w-full text-left">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            toast.promise(mutation.mutateAsync(data), {
              loading: "Saving...",
              success: t("Team name saved successfully"),
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
                        <Input placeholder="Acme" {...field} />
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
