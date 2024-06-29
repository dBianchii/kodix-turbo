"use client";

import { LuLoader2 } from "react-icons/lu";
import { z } from "zod";

import { useScopedI18n } from "@kdx/locales/client";
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
import { signInAction } from "../actions";

export function PasswordSignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const t = useScopedI18n("signin");
  const form = useForm({
    schema: z.object({
      email: z.string().email(),
      password: z.string().min(3).max(31),
    }),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          const result = await signInAction({
            email: values.email,
            password: values.password,
            callbackUrl,
          });
          if (defaultSafeActionToastError(result)) return;
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
              <FormLabel>{t("Your password")}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="*******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          variant="default"
          disabled={form.formState.isSubmitting}
          className="mt-4 w-full"
        >
          {t("Sign in")}
          {form.formState.isSubmitting && (
            <LuLoader2 className="ml-2 size-4 animate-spin" />
          )}
        </Button>
      </form>
    </Form>
  );
}
