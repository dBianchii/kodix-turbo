"use client";

import type { z } from "zod";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LuArrowRight, LuLoader2 } from "react-icons/lu";

import { kodixCareAppId } from "@kdx/shared";
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
} from "@kdx/ui/form";
import { Input } from "@kdx/ui/input";
import { kodixCareConfigSchema } from "@kdx/validators";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

export default function OnboardingCard() {
  const form = useForm<z.infer<typeof kodixCareConfigSchema>>({
    resolver: zodResolver(kodixCareConfigSchema),
    defaultValues: {
      patientName: "",
    },
  });
  const router = useRouter();

  const { mutate: saveConfig } = api.app.saveConfig.useMutation({
    onSuccess: () => {
      router.push(`/apps/kodixCare`);
    },
    onError: (e) => {
      trpcErrorToastDefault(e);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function onSubmit(values: z.infer<typeof kodixCareConfigSchema>) {
    setIsSubmitting(true);
    saveConfig({
      appId: kodixCareAppId,
      config: { patientName: values.patientName },
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="w-[450px]">
          <CardHeader>
            <CardTitle>Welcome to Kodix Care</CardTitle>
            <CardDescription>
              To start your onboarding, submit the name of the patient
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
                        You can change this later in the settings.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit">
              Go to Kodix Care
              {!isSubmitting && <LuArrowRight className="ml-2 h-4 w-4" />}
              {isSubmitting && (
                <LuLoader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
