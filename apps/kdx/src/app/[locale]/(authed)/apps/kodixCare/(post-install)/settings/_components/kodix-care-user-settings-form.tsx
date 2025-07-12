"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { LuCircleAlert } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
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

import { saveUserAppTeamConfig } from "./actions";

export function KodixCareUserSettingsForm({
  config,
}: {
  config: Promise<RouterOutputs["app"]["getUserAppTeamConfig"]>;
}) {
  const t = useTranslations();

  const form = useForm({
    schema: ZSaveUserAppTeamConfigInputSchema,
    defaultValues: {
      appId: kodixCareAppId,
      config: use(config) as { sendNotificationsForDelayedTasks?: boolean },
    },
  });

  const { execute, isExecuting } = useAction(saveUserAppTeamConfig, {
    onSuccess: () => {
      toast.success(t("Settings saved"));
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values: any) => {
          execute(values);
        })}
        className="w-full space-y-6"
      >
        <FormField
          control={form.control}
          name="config.sendNotificationsForDelayedTasks"
          render={({ field }) => (
            <FormItem className="flex max-w-md flex-row items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <LuCircleAlert
                    className={cn(
                      "text-muted-foreground size-5 transition-colors",
                      {
                        "text-orange-500": field.value === true,
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
                  onCheckedChange={field.onChange}
                  checked={field.value}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button loading={isExecuting}>{t("Save")}</Button>
      </form>
    </Form>
  );
}
