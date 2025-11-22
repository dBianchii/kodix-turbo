"use client";

import { kodixCareConfigSchema } from "@kodix/shared/db";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kodix/ui/form";
import { Input } from "@kodix/ui/input";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";

import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";

import { finishKodixCareOnboardingAction } from "../actions/finish-kodic-care-onboarding.action";

export default function OnboardingCard() {
  const form = useForm({
    defaultValues: {
      patientName: "",
    },
    schema: kodixCareConfigSchema,
  });

  const t = useTranslations();
  const { execute, isExecuting } = useAction(finishKodixCareOnboardingAction, {
    onError: (res) => defaultSafeActionToastError(res.error),
  });

  return (
    <Form {...form}>
      <form
        className="space-y-8"
        onSubmit={form.handleSubmit((values) => {
          execute({
            patientName: values.patientName,
          });
        })}
      >
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{t("apps.kodixCare.onboarding.cardTitle")}</CardTitle>
            <CardDescription>
              {t("apps.kodixCare.onboarding.cardDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your patient&apos;s name</FormLabel>
                      <FormControl>
                        <Input placeholder="John appleseed" {...field} />
                      </FormControl>
                      <FormDescription>
                        {t(
                          "apps.kodixCare.onboarding.You can change this later in the settings",
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              className="group"
              disabled={isExecuting}
              loading={isExecuting}
              type="submit"
            >
              {t("apps.kodixCare.onboarding.goToKodixCare")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
