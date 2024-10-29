"use client";

import { LuAlertCircle, LuLoader2 } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import { useTranslations } from "@kdx/locales/next-intl/client";
import { kodixCareAppId } from "@kdx/shared";
import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="w-full space-y-6"
      >
        <div className="space-y-4">
          <div className="flex items-center">
            <FormField
              control={form.control}
              name="config.sendNotificationsForDelayedTasks"
              render={({ field }) => (
                <FormItem className="flex max-w-md flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2">
                      <LuAlertCircle
                        className={cn(
                          "size-5 text-muted-foreground transition-colors",
                          {
                            "text-orange-500": field.value,
                          },
                        )}
                      />
                      {t("apps.kodixCare.Critical tasks")}
                    </FormLabel>
                    <FormDescription>
                      {t(
                        "apps.kodixCare.Set this on if you want to receive notifications for delayed tasks",
                      )}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      className="mx-4"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button disabled={mutation.isPending}>
          {mutation.isPending ? (
            <LuLoader2 className="size-4 animate-spin" />
          ) : (
            t("Save")
          )}
        </Button>
      </form>
    </Form>
  );
}
