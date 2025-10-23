"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTRPC } from "@cash/api/trpc/react/client";
import { ZRegisterInterestInputSchema } from "@cash/api/trpc/schemas/client";
import { Alert, AlertDescription, AlertTitle } from "@kodix/ui/alert";
import { Button } from "@kodix/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kodix/ui/card";
import { PhoneInput } from "@kodix/ui/common/phone-input";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@kodix/ui/input-group";
import { Spinner } from "@kodix/ui/spinner";
import { useMutation, useQuery } from "@tanstack/react-query";
import cep from "cep-promise";
import { AlertCircle } from "lucide-react";

import DespertarLogo from "./_assets/despertar-logo.png";

const NON_DIGIT_REGEX = /\D/g;
const FIRST_GROUP_REGEX = /(\d{3})(\d)/;
const SECOND_GROUP_REGEX = /(\d{3})(\d)/;
const THIRD_GROUP_REGEX = /(\d{3})(\d{1,2})/;
const EXCESS_DIGITS_REGEX = /(-\d{2})\d+?$/;
const CEP_FORMAT_REGEX = /(\d{5})(\d)/;

export const formatCpf = (value: string) => {
  const cleanedValue = value.replace(NON_DIGIT_REGEX, "");

  return cleanedValue
    .replace(FIRST_GROUP_REGEX, "$1.$2")
    .replace(SECOND_GROUP_REGEX, "$1.$2")
    .replace(THIRD_GROUP_REGEX, "$1-$2")
    .replace(EXCESS_DIGITS_REGEX, "$1");
};

export default function CadastroPage() {
  const trpc = useTRPC();

  const numeroInputRef = useRef<HTMLInputElement>(null);

  const registerMutation = useMutation(
    trpc.client.registerInterest.mutationOptions({
      onSuccess: () => {
        form.reset();
      },
    })
  );

  const form = useForm({
    defaultValues: {
      bairro: "",
      cep: "",
      cidade: "",
      complemento: "",
      cpf: "",
      email: "",
      estado: "",
      logradouro: "",
      name: "",
      numero: "",
      phone: "",
    },
    schema: ZRegisterInterestInputSchema,
  });

  const validCepValue = form.watch("cep")?.replace(NON_DIGIT_REGEX, "");
  const cepQuery = useQuery({
    enabled: validCepValue?.length === 8,
    queryFn: () =>
      cep(validCepValue, {
        providers: ["brasilapi", "viacep", "widenet"],
      }),
    queryKey: ["cep", validCepValue],
    retry: false,
  });
  useEffect(() => {
    if (cepQuery.data) {
      form.clearErrors("cep");
      form.setValue("logradouro", cepQuery.data.street);
      form.setValue("bairro", cepQuery.data.neighborhood);
      form.setValue("cidade", cepQuery.data.city);
      form.setValue("estado", cepQuery.data.state);

      setTimeout(() => {
        numeroInputRef.current?.focus();
      }, 100);
    }

    if (cepQuery.error) {
      form.setError("cep", {
        message: "CEP não encontrado",
        type: "manual",
      });
    }
  }, [cepQuery.data, cepQuery.error, form]);

  if (registerMutation.isSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-green-500">
              Obrigado por se registrar no programa de cashback!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Obrigado por se registrar no programa de cashback!
            </p>
            <p className="text-muted-foreground text-sm">
              Seus dados foram salvos e você começará a acumular cashback em
              suas próximas compras. Em breve, você receberá mais informações no
              email cadastrado.
            </p>
            <Button
              className="mt-6 w-full"
              onClick={() => {
                registerMutation.reset();
                form.reset();
              }}
              variant="default"
            >
              Fazer outro cadastro
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-2 md:p-4">
      <Image
        alt="Logo do Despertar"
        className="m-4 mx-auto"
        height={125}
        src={DespertarLogo}
        width={125}
      />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Participe do programa de cashback</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(async (data) => {
                try {
                  await registerMutation.mutateAsync(data);
                } catch {
                  /* Error is already captured by mutation state */
                }
              })}
            >
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
                        {...field}
                        inputMode="numeric"
                        onChange={(e) => {
                          field.onChange(formatCpf(e.target.value));
                        }}
                        placeholder="000.000.000-00"
                        type="text"
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="email"
                        placeholder="nome@email.com"
                        type="email"
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
                      <PhoneInput
                        {...field}
                        countries={["BR"]}
                        defaultCountry="BR"
                        inputMode="tel"
                        placeholder="(16) 99999-9999"
                        type="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          autoComplete="postal-code"
                          disabled={field.disabled || cepQuery.isFetching}
                          inputMode="numeric"
                          onChange={(e) => {
                            const cleanedValue = e.target.value.replace(
                              NON_DIGIT_REGEX,
                              ""
                            );
                            const formatted = cleanedValue
                              .replace(CEP_FORMAT_REGEX, "$1-$2")
                              .slice(0, 9);

                            field.onChange(formatted);
                          }}
                          placeholder="00000-000"
                          type="text"
                        />
                        {cepQuery.isFetching && (
                          <InputGroupAddon align="inline-end">
                            <Spinner />
                          </InputGroupAddon>
                        )}
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logradouro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logradouro</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="street-address"
                        disabled={cepQuery.isFetching}
                        placeholder="Rua, Avenida, etc."
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          inputMode="numeric"
                          onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(
                              /\D/g,
                              ""
                            );
                            field.onChange(onlyNumbers);
                          }}
                          pattern="[0-9]*"
                          placeholder="123"
                          ref={(e) => {
                            field.ref(e);
                            numeroInputRef.current = e;
                          }}
                          type="text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apto 101, Bloco A, etc."
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input
                          disabled={cepQuery.isFetching}
                          placeholder="Centro"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="address-level2"
                          disabled={cepQuery.isFetching}
                          placeholder="São Paulo"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="address-level1"
                          disabled={cepQuery.isFetching}
                          maxLength={2}
                          placeholder="SP"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {registerMutation.error && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>Erro ao realizar cadastro</AlertTitle>
                  <AlertDescription>
                    {registerMutation.error.message ||
                      "Ocorreu um erro ao processar seu cadastro. Por favor, tente novamente."}
                  </AlertDescription>
                </Alert>
              )}

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
    </main>
  );
}
