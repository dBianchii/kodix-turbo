"use client";

import type { RouterOutputs } from "@cash/api";
import type { CEP } from "cep-promise";
import { useCallback, useEffect, useRef } from "react";
import { useTRPC } from "@cash/api/trpc/react/client";
import { ZRegisterInputSchema } from "@cash/api/trpc/schemas/client";
import { ZCpfSchema } from "@kodix/shared/schemas";
import { Alert, AlertDescription, AlertTitle } from "@kodix/ui/alert";
import { Button } from "@kodix/ui/button";
import { PhoneInput } from "@kodix/ui/common/phone-input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@kodix/ui/field";
import { useForm } from "@kodix/ui/form";
import { Input } from "@kodix/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@kodix/ui/input-group";
import { Spinner } from "@kodix/ui/spinner";
import { Switch } from "@kodix/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Controller } from "react-hook-form";

import { CepInput } from "./cep-input";
import { CpfAlreadyRegisteredAlert } from "./cpf-already-registered-alert";

const NON_DIGIT_REGEX = /\D/g;
const CPF_FIRST_GROUP_REGEX = /(\d{3})(\d)/;
const CPF_SECOND_GROUP_REGEX = /(\d{3})(\d)/;
const CPF_THIRD_GROUP_REGEX = /(\d{3})(\d{1,2})/;
const CPF_EXCESS_DIGITS_REGEX = /(-\d{2})\d+?$/;
const CEP_FORMAT_REGEX = /(\d{5})(\d)/;

const CPF_LENGTH = 11;

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

interface RegistrationFormProps {
  onSuccess: () => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const numeroInputRef = useRef<HTMLInputElement>(null);

  const registerMutation = useMutation(
    trpc.client.register.mutationOptions({
      onSuccess: () => {
        form.reset();
        queryClient.invalidateQueries(trpc.client.getByCpf.pathFilter());
        onSuccess();
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

  const shouldShowField = (field: MissingOrDifferentFields) =>
    cpfQuery.data?.status === "not-found" ||
    (cpfQuery.data?.status === "missing-fields" &&
      cpfQuery.data?.missingOrDifferentFields?.includes(field));

  const handleCepError = useCallback(() => {
    form.setError("cep", {
      message: "CEP não encontrado",
      type: "manual",
    });
  }, [form.setError]);

  const handleCepFetched = useCallback(
    (cepData: CEP) => {
      form.clearErrors("cep");
      form.setValue("logradouro", cepData.street);
      form.setValue("bairro", cepData.neighborhood);
      form.setValue("cidade", cepData.city);
      form.setValue("estado", cepData.state);
      form.trigger(["logradouro", "bairro", "cidade", "estado"]);
    },
    [form.clearErrors, form.setValue, form.trigger],
  );

  return (
    <form
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await registerMutation.mutateAsync({
            ...values,
            // biome-ignore lint/style/noNonNullAssertion: The non-null assertion is safe because when isUpdate is false, name is guaranteed to exist by the discriminated union schema.
            name: values.name!,
          });
        } catch {
          /* Error is already captured by mutation state */
        }
      })}
    >
      <FieldGroup className="gap-5">
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
                        form.trigger("cpf");
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
                {cpfQuery.isLoading && isValidCpf && (
                  <div className="fade-in slide-in-from-top-2 animate-in duration-300">
                    <Alert variant="default">
                      <Spinner className="h-4 w-4" />
                      <AlertTitle>Verificando CPF...</AlertTitle>
                      <AlertDescription>
                        Aguarde enquanto verificamos seus dados no sistema.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                {(cpfQuery.data?.status === "missing-fields" ||
                  cpfQuery.data?.status === "completed") && (
                  <div className="fade-in slide-in-from-top-2 animate-in duration-300">
                    <CpfAlreadyRegisteredAlert
                      hasMissingOrDifferentFields={
                        cpfQuery.data?.status === "missing-fields"
                      }
                    />
                  </div>
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
                      <FieldLabel htmlFor={inputId}>Nome completo</FieldLabel>
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
                      <FieldLabel htmlFor={inputId}>Telefone</FieldLabel>
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
                    <FieldLabel className="text-center" htmlFor="addAddress">
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
                        <CepInput
                          {...field}
                          aria-invalid={fieldState.invalid}
                          autoComplete="postal-code"
                          focusNextInputRef={numeroInputRef}
                          id={inputId}
                          inputMode="numeric"
                          onCepError={handleCepError}
                          onCepFetched={handleCepFetched}
                          onChange={(e) => {
                            const cleanedValue = e.target.value.replace(
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
                        <FieldLabel htmlFor={inputId}>Logradouro</FieldLabel>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          autoComplete="street-address"
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
                          <FieldLabel htmlFor={inputId}>Número</FieldLabel>
                          <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
                            id={inputId}
                            inputMode="numeric"
                            onChange={(e) => {
                              const onlyNumbers = e.target.value.replace(
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
                          <FieldLabel htmlFor={inputId}>Complemento</FieldLabel>
                          <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
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
                          <FieldLabel htmlFor={inputId}>Bairro</FieldLabel>
                          <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
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
                          <FieldLabel htmlFor={inputId}>Cidade</FieldLabel>
                          <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
                            autoComplete="address-level2"
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
                          <FieldLabel htmlFor={inputId}>Estado</FieldLabel>
                          <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
                            autoComplete="address-level1"
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
  );
}
