"use client";

import { useI18n } from "@kdx/locales/client";
import { Button } from "@kdx/ui/button";
import { Checkbox } from "@kdx/ui/checkbox";
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

import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";
import { signupAction } from "./actions";
import { ZSignUpActionSchema } from "./schema";

export function PasswordSignupForm({ invite }: { invite?: string }) {
  const t = useI18n();
  const form = useForm({
    schema: ZSignUpActionSchema.omit({
      invite: true,
    }),
  });

  return (
    <Form {...form}>
      <form
        className="space-y-2"
        onSubmit={form.handleSubmit(async (values) => {
          const result = await signupAction({
            email: values.email,
            password: values.password,
            name: values.name,
            agreeToTOS: values.agreeToTOS,
            invite: invite,
          });
          if (defaultSafeActionToastError(result)) return;
        })}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Name")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Name")}
                  className="lowercase"
                  {...field}
                />
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
        <FormField
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
        />

        <Button className="w-full">{t("Create account")}</Button>
      </form>
    </Form>
  );
}
