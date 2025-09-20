"use client";

import { Button } from "@kodix/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kodix/ui/form";
import { Input } from "@kodix/ui/input";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";

import { ZSignupWithPasswordInputSchema } from "@kdx/validators/trpc/user";

import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";

import { signupAction } from "./actions";

export function PasswordSignupForm({ invite }: { invite?: string }) {
  const t = useTranslations();
  const form = useForm({
    schema: ZSignupWithPasswordInputSchema.omit({
      invite: true,
    }),
    // .extend({
    //   agreeToTOS: z
    //     .boolean()
    //     .default(false)
    //     .refine((val) => !!val, {
    //       message: "You must agree to the terms of service",
    //     }),
    // }),
  });

  const { execute, isExecuting } = useAction(signupAction, {
    onError: (res) => {
      defaultSafeActionToastError(res.error);
    },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-2"
        onSubmit={form.handleSubmit((values) => {
          execute({
            email: values.email,
            password: values.password,
            name: values.name,
            invite: invite,
          });
        })}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("Name")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Your email")}</FormLabel>
              <FormControl>
                <Input type="email" placeholder="name@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Password")}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="*******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
          control={form.control}
          name="agreeToTOS"
          render={({ field }) => (
            <FormItem>
              <div className="my-4 space-y-2">
                <div className="flex items-center space-x-3 rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>{t("I agree to the terms of service")}</FormLabel>
                </div>
                <FormMessage />
              </div>
            </FormItem>
          )}
        /> */}

        <Button
          className="w-full"
          loading={form.formState.isSubmitting || isExecuting}
        >
          {t("Create account")}
        </Button>
      </form>
    </Form>
  );
}
