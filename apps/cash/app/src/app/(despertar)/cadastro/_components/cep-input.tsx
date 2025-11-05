import { type ComponentProps, useEffect } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@kodix/ui/input-group";
import { Spinner } from "@kodix/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import cep, { type CEP } from "cep-promise";

const CEP_LENGTH = 8;
const NON_DIGIT_REGEX = /\D/g;

export function CepInput({
  onCepFetched,
  onCepError,
  focusNextInputRef,
  value,
  ...props
}: {
  value?: string;
  onCepFetched: (data: CEP) => void;
  onCepError: (error: Error) => void;
  focusNextInputRef?: React.RefObject<HTMLInputElement | null>;
} & Omit<ComponentProps<typeof InputGroupInput>, "value">) {
  const validCepValue = value?.replace(NON_DIGIT_REGEX, "");
  const cepQuery = useQuery({
    enabled: validCepValue?.length === CEP_LENGTH,
    queryFn: () =>
      cep(validCepValue ?? "", {
        providers: ["viacep", "widenet"],
      }),
    queryKey: ["cep", validCepValue],
    retry: false,
  });

  useEffect(() => {
    if (cepQuery.data) {
      onCepFetched?.(cepQuery.data);

      // Focus next input after a brief delay
      if (focusNextInputRef?.current) {
        const timeoutId = setTimeout(() => {
          focusNextInputRef.current?.focus();
        }, 100);

        return () => {
          clearTimeout(timeoutId);
        };
      }
    }

    if (cepQuery.error) {
      onCepError(cepQuery.error);
    }
  }, [
    cepQuery.data,
    cepQuery.error,
    onCepFetched,
    onCepError,
    focusNextInputRef,
  ]);

  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        disabled={props.disabled || cepQuery.isFetching}
      />
      {cepQuery.isFetching && (
        <InputGroupAddon align="inline-end">
          <Spinner />
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
