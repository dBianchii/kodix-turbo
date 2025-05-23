"use client";

import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";

import { Button } from "@kdx/ui/button";
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
import { Link } from "~/i18n/routing";
import { signInAction } from "./actions";
import { ZSigninActionSchema } from "./schema";

export function PasswordSignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const t = useTranslations();
  const form = useForm({
    schema: ZSigninActionSchema,
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { execute, isExecuting } = useAction(signInAction, {
    onError: (res) => {
      defaultSafeActionToastError(res.error);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          execute({
            email: values.email,
            password: values.password,
            callbackUrl,
          });
        })}
        className="space-y-4"
      >
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
              <div className="flex justify-between">
                <FormLabel>{t("Your password")}</FormLabel>
                <Link
                  href="/signin/forgot-password"
                  className="text-primary text-sm"
                >
                  {t("Forgot password")}
                </Link>
              </div>
              <FormControl>
                <Input type="password" placeholder="*******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          variant="default"
          loading={form.formState.isSubmitting || isExecuting}
          className="mt-4 w-full"
        >
          {t("Sign in")}
        </Button>
      </form>
    </Form>
  );
}
