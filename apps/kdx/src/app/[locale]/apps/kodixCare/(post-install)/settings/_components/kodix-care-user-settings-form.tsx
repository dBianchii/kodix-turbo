"use client";

import { LuLoader2 } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import { useTranslations } from "@kdx/locales/next-intl/client";
import { kodixCareAppId } from "@kdx/shared";
import { Button } from "@kdx/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kdx/ui/form";
import { Switch } from "@kdx/ui/switch";
import { toast } from "@kdx/ui/toast";
import { ZSaveUserAppTeamConfigInputSchema } from "@kdx/validators/trpc/app";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

export function KodixCareUserSettingsForm({
  config,
}: {
  config: RouterOutputs["app"]["getUserAppTeamConfig"];
}) {
  const t = useTranslations();

  const form = useForm({
    schema: ZSaveUserAppTeamConfigInputSchema,
    defaultValues: {
      appId: kodixCareAppId,
      config,
    },
  });
  const mutation = api.app.saveUserAppTeamConfig.useMutation({
    onSuccess: () => {
      toast.success(t("Settings saved"));
    },
    onError: trpcErrorToastDefault,
  });

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="w-full space-y-6"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="config.sendNotificationsForDelayedTasks"
              render={({ field }) => (
                <FormItem className="flex max-w-md flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>
                      {t(
                        "apps.kodixCare.Receive notifications for delayed tasks",
                      )}
                    </FormLabel>
                    <FormDescription>
                      {t(
                        "apps.kodixCare.Set this on if you want to receive notifications for delayed tasks",
                      )}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={mutation.isPending || !form.formState.isDirty}>
            {mutation.isPending ? (
              <LuLoader2 className="size-4 animate-spin" />
            ) : (
              t("Save")
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}
