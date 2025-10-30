import { useEffect, useEffectEvent, useRef } from "react";
import { useTRPC } from "@cash/api/trpc/react/client";
import {
  type RegisterInputSchemaKeys,
  ZRegisterInputSchema,
} from "@cash/api/trpc/schemas/client";
import { ZCpfSchema } from "@kodix/shared/schemas";
import { Alert, AlertDescription, AlertTitle } from "@kodix/ui/alert";
import { Button } from "@kodix/ui/button";
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
import { Switch } from "@kodix/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import cep from "cep-promise";
import { AlertCircle } from "lucide-react";

import { CadastroSuccess } from "./cadastro-success";
import { CpfAlreadyRegisteredAlert } from "./cpf-already-registered-alert";

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
} as const;

const addressFields = Object.keys(
  addressValues,
) as (keyof typeof addressValues)[];

export function CadastroForm() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const numeroInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      ...addressValues,
      cpf: "",
      email: "",
      name: "",
      phone: "",
      withAddress: false,
    },
    schema: ZRegisterInputSchema,
  });

  const registerMutation = useMutation(
    trpc.client.register.mutationOptions({
      onSuccess: () => {
        form.reset();
        queryClient.invalidateQueries(trpc.client.getByCpf.pathFilter());
      },
    }),
  );

  const isMutating = registerMutation.isPending;

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

  const isCpfAlreadyRegistered = cpfQuery.data?.status === "missing-fields";
  const missingOrDifferentFields =
    cpfQuery.data?.missingOrDifferentFields ?? [];

  const withAddress = form.watch("withAddress");

  const shouldShowField = (field: RegisterInputSchemaKeys | "withAddress") => {
    if (cpfQuery.data?.status === "not-found") {
      return true;
    }

    if (field === "withAddress") {
      return !cpfQuery.isFetching;
    }

    const isAddressField = addressFields.includes(
      field as keyof typeof addressValues,
    );
    if (isAddressField) {
      return (
        !cpfQuery.isFetching &&
        withAddress &&
        missingOrDifferentFields.includes(field)
      );
    }

    return !cpfQuery.isFetching && missingOrDifferentFields.includes(field);
  };
  const hasMissingAddressFields = missingOrDifferentFields.some((f) =>
    addressFields.includes(f as keyof typeof addressValues),
  );

  useEffect(() => {
    if (isCpfAlreadyRegistered) {
      form.setValue("isUpdate", !!missingOrDifferentFields.length);

      const allEditableFields: RegisterInputSchemaKeys[] = [
        "name",
        "email",
        "phone",
        "bairro",
        "cep",
        "cidade",
        "complemento",
        "estado",
        "logradouro",
        "numero",
      ];

      for (const field of allEditableFields) {
        if (missingOrDifferentFields.includes(field)) {
          form.setValue(field, undefined);
        } else {
          form.setValue(field, "");
        }
      }
    }
  }, [missingOrDifferentFields, form.setValue, isCpfAlreadyRegistered]);

  const validCepValue = form.watch("cep")?.replace(NON_DIGIT_REGEX, "");
  const cepQuery = useQuery({
    enabled: withAddress && validCepValue?.length === CEP_LENGTH,
    queryFn: () =>
      cep(validCepValue ?? "", {
        providers: ["brasilapi", "viacep", "widenet"],
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
    <Form {...form}>
      <pre>{JSON.stringify(form.formState.errors)}</pre>
      <pre>{JSON.stringify(form.getValues())}</pre>
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
                  {cpfQuery.isFetching && (
                    <InputGroupAddon align="inline-end">
                      <Spinner className="h-5 w-5" />
                    </InputGroupAddon>
                  )}
                </InputGroup>
              </FormControl>
              <FormMessage />
              {cpfQuery.data?.status === "missing-fields" && (
                <CpfAlreadyRegisteredAlert
                  missingOrDifferentFields={missingOrDifferentFields}
                />
              )}
            </FormItem>
          )}
        />
        {!cpfQuery.isFetching && (
          <>
            {shouldShowField("name") && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="name"
                        disabled={
                          isCpfAlreadyRegistered &&
                          !missingOrDifferentFields.includes("name")
                        }
                        placeholder="João da Silva"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {shouldShowField("email") && (
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
                        disabled={
                          isCpfAlreadyRegistered &&
                          !missingOrDifferentFields.includes("email")
                        }
                        placeholder="nome@email.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {shouldShowField("phone") && (
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
                        disabled={
                          isCpfAlreadyRegistered &&
                          !missingOrDifferentFields.includes("phone")
                        }
                        inputMode="tel"
                        placeholder="(16) 99999-9999"
                        type="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {shouldShowField("withAddress") && (
              <FormField
                control={form.control}
                name="withAddress"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 text-center">
                    <FormControl>
                      <Switch
                        checked={field.value}
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
                    </FormControl>
                    <FormLabel>Adicionar endereço (opcional)</FormLabel>
                  </FormItem>
                )}
              />
            )}

            {shouldShowField("cep") && (
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {shouldShowField("logradouro") && (
              <FormField
                control={form.control}
                name="logradouro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logradouro</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="street-address"
                        disabled={cepQuery.isFetching || isCpfAlreadyRegistered}
                        placeholder="Rua, Avenida, etc."
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {(shouldShowField("numero") || shouldShowField("complemento")) && (
              <div className="grid gap-4 md:grid-cols-2">
                {shouldShowField("numero") && (
                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={
                              isCpfAlreadyRegistered &&
                              !missingOrDifferentFields.includes("numero")
                            }
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {shouldShowField("complemento") && (
                  <FormField
                    control={form.control}
                    name="complemento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input
                            disabled={
                              isCpfAlreadyRegistered &&
                              !missingOrDifferentFields.includes("complemento")
                            }
                            placeholder="Apto 101, Bloco A, etc."
                            type="text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
            {(shouldShowField("bairro") ||
              shouldShowField("cidade") ||
              shouldShowField("estado")) && (
              <div className="grid gap-4 md:grid-cols-2">
                {shouldShowField("bairro") && (
                  <FormField
                    control={form.control}
                    name="bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input
                            disabled={
                              cepQuery.isFetching ||
                              (isCpfAlreadyRegistered &&
                                !missingOrDifferentFields.includes("bairro"))
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
                )}
                {shouldShowField("cidade") && (
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
                              cepQuery.isFetching ||
                              (isCpfAlreadyRegistered &&
                                !missingOrDifferentFields.includes("cidade"))
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
                )}
                {shouldShowField("estado") && (
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
                              cepQuery.isFetching ||
                              (isCpfAlreadyRegistered &&
                                !missingOrDifferentFields.includes("estado"))
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
                )}
              </div>
            )}
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
          className="mt-4 w-full"
          disabled={
            (isCpfAlreadyRegistered && missingOrDifferentFields.length === 0) ||
            cpfQuery?.isFetching
          }
          loading={isMutating}
          type="submit"
          variant="default"
        >
          {missingOrDifferentFields.length > 0
            ? "Completar cadastro"
            : "Cadastrar"}
        </Button>
      </form>
    </Form>
  );
}
