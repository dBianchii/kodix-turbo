"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTRPC } from "@cash/api/trpc/react/client";
import { ZRegisterInputSchema } from "@cash/api/trpc/schemas/client";
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
import { Label } from "@kodix/ui/label";
import { Spinner } from "@kodix/ui/spinner";
import { Switch } from "@kodix/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import cep from "cep-promise";
import { AlertCircle, Check } from "lucide-react";

import DespertarLogo from "./_assets/despertar-logo.png";
import { CadastroSuccess } from "./_components/cadastro-success";
import { CpfAlreadyRegisteredAlert } from "./_components/cpf-already-registered-alert";

const NON_DIGIT_REGEX = /\D/g;
const FIRST_GROUP_REGEX = /(\d{3})(\d)/;
const SECOND_GROUP_REGEX = /(\d{3})(\d)/;
const THIRD_GROUP_REGEX = /(\d{3})(\d{1,2})/;
const EXCESS_DIGITS_REGEX = /(-\d{2})\d+?$/;
const CEP_FORMAT_REGEX = /(\d{5})(\d)/;

const formatCpf = (value: string) => {
  const cleanedValue = value.replace(NON_DIGIT_REGEX, "");

  return cleanedValue
    .replace(FIRST_GROUP_REGEX, "$1.$2")
    .replace(SECOND_GROUP_REGEX, "$1.$2")
    .replace(THIRD_GROUP_REGEX, "$1-$2")
    .replace(EXCESS_DIGITS_REGEX, "$1");
};

const addressValues = {
  bairro: undefined,
  cep: undefined,
  cidade: undefined,
  complemento: undefined,
  estado: undefined,
  logradouro: undefined,
  numero: undefined,
};

export default function CadastroPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [addAddress, setAddAddress] = useState(false);
  const numeroInputRef = useRef<HTMLInputElement>(null);

  const registerMutation = useMutation(
    trpc.client.register.mutationOptions({
      onSuccess: () => {
        form.reset();
        queryClient.invalidateQueries(trpc.client.getByCpf.pathFilter());
        setAddAddress(false);
      },
    })
  );

  const form = useForm({
    defaultValues: {
      ...addressValues,
      cpf: "",
      email: "",
      name: "",
      phone: "",
    },
    schema: ZRegisterInputSchema.omit({ withAddress: true }),
  });

  const cpfValue = form.watch("cpf")?.replace(NON_DIGIT_REGEX, "");
  const cpfQuery = useQuery(
    trpc.client.getByCpf.queryOptions(
      { cpf: cpfValue },
      {
        enabled: cpfValue?.length === 11,
        retry: false,
      }
    )
  );
  const isCpfAlreadyRegistered = !!cpfQuery.data;

  const validCepValue = form.watch("cep")?.replace(NON_DIGIT_REGEX, "");
  const cepQuery = useQuery({
    enabled: addAddress && validCepValue?.length === 8,
    queryFn: () =>
      cep(validCepValue ?? "", {
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
      <CadastroSuccess
        onReset={() => {
          registerMutation.reset();
          form.reset();
          setAddAddress(false);
        }}
      />
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
                  await registerMutation.mutateAsync({
                    ...data,
                    withAddress: addAddress,
                  });
                } catch {
                  /* Error is already captured by mutation state */
                }
              })}
            >
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          inputMode="numeric"
                          onChange={(e) => {
                            field.onChange(formatCpf(e.target.value));
                          }}
                          placeholder="000.000.000-00"
                          type="text"
                        />
                        {!cpfQuery.isPending && (
                          <InputGroupAddon
                            align="inline-end"
                            className="cursor-default"
                          >
                            {cpfQuery.data ? null : (
                              <Check className="text-green-500" />
                            )}
                          </InputGroupAddon>
                        )}
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                    {cpfQuery.data && (
                      <CpfAlreadyRegisteredAlert
                        email={cpfQuery.data.email}
                        phone={cpfQuery.data.phone}
                      />
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="name"
                        disabled={isCpfAlreadyRegistered}
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="email"
                        disabled={isCpfAlreadyRegistered}
                        placeholder="nome@email.com"
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
                        disabled={isCpfAlreadyRegistered}
                        inputMode="tel"
                        placeholder="(16) 99999-9999"
                        type="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-row items-center gap-2 py-1 text-center">
                <Switch
                  checked={addAddress}
                  disabled={isCpfAlreadyRegistered}
                  id="addAddress"
                  onCheckedChange={(checked) => {
                    const toSetValue = checked ? "" : undefined;

                    for (const key of Object.keys(addressValues)) {
                      form.setValue(
                        key as keyof typeof addressValues,
                        toSetValue
                      );
                    }

                    setAddAddress(checked);
                  }}
                />
                <Label className="text-center" htmlFor="addAddress">
                  Adicionar endereço (opcional)
                </Label>
              </div>
              {addAddress && (
                <>
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
                              disabled={
                                field.disabled ||
                                cepQuery.isFetching ||
                                isCpfAlreadyRegistered
                              }
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
                            disabled={
                              cepQuery.isFetching || isCpfAlreadyRegistered
                            }
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
                              disabled={isCpfAlreadyRegistered}
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
                              disabled={isCpfAlreadyRegistered}
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
                              disabled={
                                cepQuery.isFetching || isCpfAlreadyRegistered
                              }
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
                              disabled={
                                cepQuery.isFetching || isCpfAlreadyRegistered
                              }
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
                              disabled={
                                cepQuery.isFetching || isCpfAlreadyRegistered
                              }
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
                </>
              )}
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
                disabled={isCpfAlreadyRegistered}
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
