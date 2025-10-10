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

import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";
import { Link } from "~/i18n/routing";

import { signInAction } from "./actions";
import { ZSigninActionSchema } from "./schema";

export function PasswordSignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const t = useTranslations();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    schema: ZSigninActionSchema,
  });
  const { execute, isExecuting } = useAction(signInAction, {
    onError: (res) => {
      defaultSafeActionToastError(res.error);
    },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          execute({
            callbackUrl,
            email: values.email,
            password: values.password,
          });
        })}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Your email")}</FormLabel>
              <FormControl>
                <Input placeholder="name@email.com" type="email" {...field} />
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
                  className="text-primary text-sm"
                  href="/signin/forgot-password"
                >
                  {t("Forgot password")}
                </Link>
              </div>
              <FormControl>
                <Input placeholder="*******" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="mt-4 w-full"
          loading={form.formState.isSubmitting || isExecuting}
          variant="default"
        >
          {t("Sign in")}
        </Button>
      </form>
    </Form>
  );
}
