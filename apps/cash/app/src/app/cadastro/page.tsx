"use client";

import { useState } from "react";
import { useTRPC } from "@cash/api/trpc/react/client";
import { Button } from "@kodix/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kodix/ui/card";
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
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

const ZCadastroSchema = z.object({
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone inválido").max(15, "Telefone inválido"),
});

type CadastroFormData = z.infer<typeof ZCadastroSchema>;

export default function CadastroPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const trpc = useTRPC();

  const registerMutation = useMutation(
    trpc.client.registerInterest.mutationOptions()
  );

  const form = useForm({
    defaultValues: {
      cpf: "",
      name: "",
      phone: "",
    },
    schema: ZCadastroSchema,
  });

  const onSubmit = async (data: CadastroFormData) => {
    try {
      await registerMutation.mutateAsync(data);
      setIsSuccess(true);
      form.reset();
    } catch {
      // Handle error silently
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">
              Cadastro realizado!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              Obrigado pelo seu interesse. Entraremos em contato em breve.
            </p>
            <Button
              className="w-full"
              onClick={() => setIsSuccess(false)}
              variant="default"
            >
              Fazer novo cadastro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Cadastro</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="name"
                        placeholder="João da Silva"
                        type="text"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        inputMode="numeric"
                        maxLength={14}
                        placeholder="000.000.000-00"
                        type="text"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={15}
                        placeholder="(11) 99999-9999"
                        type="tel"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="mt-6 w-full"
                loading={registerMutation.isPending}
                type="submit"
                variant="default"
              >
                Cadastrar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
