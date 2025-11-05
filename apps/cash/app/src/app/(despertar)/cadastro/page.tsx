"use client";

import type { RouterOutputs } from "@cash/api";
import { useEffect, useEffectEvent, useRef } from "react";
import Image from "next/image";
import { useTRPC } from "@cash/api/trpc/react/client";
import { ZRegisterInputSchema } from "@cash/api/trpc/schemas/client";
import { ZCpfSchema } from "@kodix/shared/schemas";
import { Alert, AlertDescription, AlertTitle } from "@kodix/ui/alert";
import { Button } from "@kodix/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kodix/ui/card";
import { PhoneInput } from "@kodix/ui/common/phone-input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@kodix/ui/field";
import { Form, useForm } from "@kodix/ui/form";
import { Input } from "@kodix/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@kodix/ui/input-group";
import { Spinner } from "@kodix/ui/spinner";
import { Switch } from "@kodix/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import cep from "cep-promise";
import { AlertCircle } from "lucide-react";
import { Controller } from "react-hook-form";

import DespertarLogo from "./_assets/despertar-logo.png";
import { CadastroSuccess } from "./_components/cadastro-success";
import { CpfAlreadyRegisteredAlert } from "./_components/cpf-already-registered-alert";

const NON_DIGIT_REGEX = /\D/g;
const CPF_FIRST_GROUP_REGEX = /(\d{3})(\d)/;
const CPF_SECOND_GROUP_REGEX = /(\d{3})(\d)/;
const CPF_THIRD_GROUP_REGEX = /(\d{3})(\d{1,2})/;
const CPF_EXCESS_DIGITS_REGEX = /(-\d{2})\d+?$/;
const CEP_FORMAT_REGEX = /(\d{5})(\d)/;

const CPF_LENGTH = 11;
const CEP_LENGTH = 8;

const formatCpf = (value: string) => {
  const cleanedValue = value.replace(NON_DIGIT_REGEX, "");

  return cleanedValue
    .replace(CPF_FIRST_GROUP_REGEX, "$1.$2")
    .replace(CPF_SECOND_GROUP_REGEX, "$1.$2")
    .replace(CPF_THIRD_GROUP_REGEX, "$1-$2")
    .replace(CPF_EXCESS_DIGITS_REGEX, "$1");
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

type MissingOrDifferentFields = NonNullable<
  RouterOutputs["client"]["getByCpf"]["missingOrDifferentFields"]
>[number];

export default function CadastroPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const numeroInputRef = useRef<HTMLInputElement>(null);

  const registerMutation = useMutation(
    trpc.client.register.mutationOptions({
      onSuccess: () => {
        form.reset();
        queryClient.invalidateQueries(trpc.client.getByCpf.pathFilter());
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      ...addressValues,
      cpf: "",
      email: "",
      isUpdate: false,
      name: "",
      phone: "",
      withAddress: false,
    },
    schema: ZRegisterInputSchema,
    shouldUnregister: true, //Important! This will unregister the field from the form when it is unmounted
  });

  const cpfValue = form.watch("cpf")?.replace(NON_DIGIT_REGEX, "");

  const isValidCpf = ZCpfSchema.safeParse(cpfValue).success;
  const cpfQuery = useQuery(
    trpc.client.getByCpf.queryOptions(
      { cpf: cpfValue },
      {
        enabled: isValidCpf,
      },
    ),
  );
  useEffect(() => {
    form.setValue("isUpdate", cpfQuery.data?.status === "missing-fields");
  }, [cpfQuery.data, form.setValue]);

  const withAddress = form.watch("withAddress");
  const validCepValue = form.watch("cep")?.replace(NON_DIGIT_REGEX, "");

  const cepQuery = useQuery({
    enabled: Boolean(withAddress && validCepValue?.length === CEP_LENGTH),
    queryFn: () =>
      cep(validCepValue ?? "", {
        providers: ["viacep", "widenet"],
      }),
    queryKey: ["cep", validCepValue],
    retry: false,
  });

  const focusInput = useEffectEvent(() => {
    numeroInputRef.current?.focus();
  });
  useEffect(() => {
    if (cepQuery.data) {
      form.clearErrors("cep");
      form.setValue("logradouro", cepQuery.data.street);
      form.setValue("bairro", cepQuery.data.neighborhood);
      form.setValue("cidade", cepQuery.data.city);
      form.setValue("estado", cepQuery.data.state);
      form.trigger(["logradouro", "bairro", "cidade", "estado"]);

      const timeoutId = setTimeout(() => {
        focusInput();
      }, 100);

      return () => clearTimeout(timeoutId);
    }

    if (cepQuery.error) {
      form.setError("cep", {
        message: "CEP não encontrado",
        type: "manual",
      });
    }
  }, [cepQuery.data, cepQuery.error, form]);

  const shouldShowField = (field: MissingOrDifferentFields) =>
    cpfQuery.data?.status === "not-found" ||
    (cpfQuery.data?.status === "missing-fields" &&
      cpfQuery.data?.missingOrDifferentFields?.includes(field));

  if (registerMutation.isSuccess) {
    return (
      <CadastroSuccess
        onReset={() => {
          registerMutation.reset();
          form.reset();
        }}
      />
    );
  }

  return (
    <main className="flex flex-col items-center p-4 px-2">
      <Image
        alt="Logo do Despertar"
        className="mx-auto mb-3"
        height={100}
        src={DespertarLogo}
        width={100}
      />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Participe do programa de cashback</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await registerMutation.mutateAsync({
                    ...values,
                    // biome-ignore lint/style/noNonNullAssertion: When we are updating, the name is optional
                    name: values.name!,
                  });
                } catch {
                  /* Error is already captured by mutation state */
                }
              })}
            >
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="cpf"
                  render={({ field, fieldState }) => {
                    const inputId = `field-${field.name}`;
                    return (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={inputId}>CPF</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            aria-invalid={fieldState.invalid}
                            id={inputId}
                            inputMode="numeric"
                            onChange={(e) => {
                              const formattedValue = formatCpf(e.target.value);
                              field.onChange(formattedValue);

                              const justNumbers = formattedValue.replace(
                                NON_DIGIT_REGEX,
                                "",
                              );
                              if (justNumbers.length === CPF_LENGTH) {
                                form.trigger("cpf"); // Trigger validation immediately
                              }
                            }}
                            placeholder="000.000.000-00"
                            type="text"
                          />
                          {cpfQuery.isLoading && (
                            <InputGroupAddon
                              align="inline-end"
                              className="cursor-default"
                            >
                              <Spinner />
                            </InputGroupAddon>
                          )}
                        </InputGroup>
                        <FieldError errors={[fieldState.error]} />
                        {(cpfQuery.data?.status === "missing-fields" ||
                          cpfQuery.data?.status === "completed") && (
                          <CpfAlreadyRegisteredAlert
                            hasMissingOrDifferentFields={
                              cpfQuery.data?.status === "missing-fields"
                            }
                          />
                        )}
                      </Field>
                    );
                  }}
                />
                {cpfQuery.isLoading ? null : (
                  <>
                    {shouldShowField("name") && (
                      <Controller
                        control={form.control}
                        name="name"
                        render={({ field, fieldState }) => {
                          const inputId = `field-${field.name}`;
                          return (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={inputId}>
                                Nome completo
                              </FieldLabel>
                              <Input
                                {...field}
                                aria-invalid={fieldState.invalid}
                                autoComplete="name"
                                id={inputId}
                                placeholder="João da Silva"
                                type="text"
                              />
                              <FieldError errors={[fieldState.error]} />
                            </Field>
                          );
                        }}
                      />
                    )}
                    {shouldShowField("email") && (
                      <Controller
                        control={form.control}
                        name="email"
                        render={({ field, fieldState }) => {
                          const inputId = `field-${field.name}`;
                          return (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={inputId}>Email</FieldLabel>
                              <Input
                                {...field}
                                aria-invalid={fieldState.invalid}
                                autoComplete="email"
                                id={inputId}
                                placeholder="nome@email.com"
                              />
                              <FieldError errors={[fieldState.error]} />
                            </Field>
                          );
                        }}
                      />
                    )}
                    {shouldShowField("phone") && (
                      <Controller
                        control={form.control}
                        name="phone"
                        render={({ field, fieldState }) => {
                          const inputId = `field-${field.name}`;
                          return (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={inputId}>
                                Telefone
                              </FieldLabel>
                              <PhoneInput
                                {...field}
                                aria-invalid={fieldState.invalid}
                                countries={["BR"]}
                                defaultCountry="BR"
                                id={inputId}
                                inputMode="tel"
                                placeholder="(16) 99999-9999"
                                type="tel"
                              />
                              <FieldError errors={[fieldState.error]} />
                            </Field>
                          );
                        }}
                      />
                    )}
                    {cpfQuery.data?.status === "not-found" && (
                      <Controller
                        control={form.control}
                        name="withAddress"
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            orientation="horizontal"
                          >
                            <Switch
                              checked={field.value}
                              id="addAddress"
                              onCheckedChange={(checked) => {
                                const toSetValue = checked ? "" : undefined;

                                for (const key of Object.keys(addressValues)) {
                                  form.setValue(
                                    key as keyof typeof addressValues,
                                    toSetValue,
                                  );
                                }

                                field.onChange(checked);
                              }}
                            />
                            <FieldLabel
                              className="text-center"
                              htmlFor="addAddress"
                            >
                              Adicionar endereço (opcional)
                            </FieldLabel>
                          </Field>
                        )}
                      />
                    )}
                    {form.watch("withAddress") && (
                      <>
                        <Controller
                          control={form.control}
                          name="cep"
                          render={({ field, fieldState }) => {
                            const inputId = `field-${field.name}`;
                            return (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={inputId}>CEP</FieldLabel>
                                <InputGroup>
                                  <InputGroupInput
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    autoComplete="postal-code"
                                    disabled={
                                      field.disabled || cepQuery.isFetching
                                    }
                                    id={inputId}
                                    inputMode="numeric"
                                    onChange={(e) => {
                                      const cleanedValue =
                                        e.target.value.replace(
                                          NON_DIGIT_REGEX,
                                          "",
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
                                <FieldError errors={[fieldState.error]} />
                              </Field>
                            );
                          }}
                        />
                        <Controller
                          control={form.control}
                          name="logradouro"
                          render={({ field, fieldState }) => {
                            const inputId = `field-${field.name}`;
                            return (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={inputId}>
                                  Logradouro
                                </FieldLabel>
                                <Input
                                  {...field}
                                  aria-invalid={fieldState.invalid}
                                  autoComplete="street-address"
                                  disabled={cepQuery.isFetching}
                                  id={inputId}
                                  placeholder="Rua, Avenida, etc."
                                  type="text"
                                />
                                <FieldError errors={[fieldState.error]} />
                              </Field>
                            );
                          }}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                          <Controller
                            control={form.control}
                            name="numero"
                            render={({ field, fieldState }) => {
                              const inputId = `field-${field.name}`;
                              return (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={inputId}>
                                    Número
                                  </FieldLabel>
                                  <Input
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    id={inputId}
                                    inputMode="numeric"
                                    onChange={(e) => {
                                      const onlyNumbers =
                                        e.target.value.replace(
                                          NON_DIGIT_REGEX,
                                          "",
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
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              );
                            }}
                          />
                          <Controller
                            control={form.control}
                            name="complemento"
                            render={({ field, fieldState }) => {
                              const inputId = `field-${field.name}`;
                              return (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={inputId}>
                                    Complemento
                                  </FieldLabel>
                                  <Input
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    disabled={cepQuery.isFetching}
                                    id={inputId}
                                    placeholder="Apto 101, Bloco A, etc."
                                    type="text"
                                  />
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              );
                            }}
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Controller
                            control={form.control}
                            name="bairro"
                            render={({ field, fieldState }) => {
                              const inputId = `field-${field.name}`;
                              return (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={inputId}>
                                    Bairro
                                  </FieldLabel>
                                  <Input
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    disabled={cepQuery.isFetching}
                                    id={inputId}
                                    placeholder="Centro"
                                    type="text"
                                  />
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              );
                            }}
                          />
                          <Controller
                            control={form.control}
                            name="cidade"
                            render={({ field, fieldState }) => {
                              const inputId = `field-${field.name}`;
                              return (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={inputId}>
                                    Cidade
                                  </FieldLabel>
                                  <Input
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    autoComplete="address-level2"
                                    disabled={cepQuery.isFetching}
                                    id={inputId}
                                    placeholder="São Paulo"
                                    type="text"
                                  />
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              );
                            }}
                          />
                          <Controller
                            control={form.control}
                            name="estado"
                            render={({ field, fieldState }) => {
                              const inputId = `field-${field.name}`;
                              return (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={inputId}>
                                    Estado
                                  </FieldLabel>
                                  <Input
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    autoComplete="address-level1"
                                    disabled={cepQuery.isFetching}
                                    id={inputId}
                                    maxLength={2}
                                    placeholder="SP"
                                    type="text"
                                  />
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              );
                            }}
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
                  </>
                )}

                <Button
                  className="mt-4 w-full"
                  disabled={
                    cpfQuery.isLoading ||
                    cpfQuery.data?.missingOrDifferentFields?.length === 0
                  }
                  loading={registerMutation.isPending}
                  type="submit"
                  variant="default"
                >
                  Cadastrar
                </Button>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
