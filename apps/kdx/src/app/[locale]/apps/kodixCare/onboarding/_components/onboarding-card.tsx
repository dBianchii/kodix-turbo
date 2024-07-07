"use client";

import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { LuArrowRight, LuLoader2 } from "react-icons/lu";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kdx/ui/form";
import { Input } from "@kdx/ui/input";
import { kodixCareConfigSchema } from "@kdx/validators";

import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";
import { finishKodixCareOnboardingAction } from "../actions/onboardingActions";

export default function OnboardingCard() {
  const form = useForm({
    schema: kodixCareConfigSchema,
    defaultValues: {
      patientName: "",
    },
  });

  const router = useRouter();
  const t = useI18n();
  const { execute } = useAction(finishKodixCareOnboardingAction, {
    onError: (res) => {
      defaultSafeActionToastError(res.error);
    },
    onSuccess: () => {
      router.push(`/apps/kodixCare`);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          execute({
            patientName: values.patientName,
          });
        })}
        className="space-y-8"
      >
        <Card className="w-[550px]">
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
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {t("apps.kodixCare.onboarding.goToKodixCare")}
              {!form.formState.isSubmitting && (
                <LuArrowRight className="ml-2 size-4" />
              )}
              {form.formState.isSubmitting && (
                <LuLoader2 className="ml-2 size-4 animate-spin" />
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
