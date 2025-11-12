"use client";

import type { ComponentProps } from "react";
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  UseFormProps,
} from "react-hook-form";
import type { ZodType } from "zod";
import { createContext, useContext, useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@kodix/ui/lib/utils";
import { type Label as LabelPrimitive, Slot as SlotPrimitive } from "radix-ui";
import {
  useForm as __useForm,
  Controller,
  FormProvider,
  type UseFormReturn,
  useFormContext,
  useFormState,
} from "react-hook-form";

import { Label } from "./label";

function createForm<TOut extends FieldValues, TIn extends FieldValues>(
  schema: ZodType<TOut, TIn>,
) {
  const useFormHook = (
    props?: Omit<UseFormProps<TIn, unknown, TOut>, "resolver">,
  ) =>
    useForm<TOut, TIn>({
      ...(props ?? {}),
      schema,
    });

  const useFormContextHook: () => UseFormReturn<TIn, unknown, TOut> = () =>
    useFormContext<TIn, unknown, TOut>();

  return [useFormHook, useFormContextHook] as const;
}

function useForm<TOut extends FieldValues, TIn extends FieldValues>(
  props: Omit<UseFormProps<TIn, unknown, TOut>, "resolver"> & {
    schema: ZodType<TOut, TIn>;
  },
) {
  const form = __useForm<TIn, unknown, TOut>({
    ...props,
    resolver: zodResolver(props.schema, undefined),
  });

  return form;
}

const Form = FormProvider;

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
}

const FormFieldContext = createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
);

const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  const { id } = itemContext;

  return {
    formDescriptionId: `${id}-form-item-description`,
    formItemId: `${id}-form-item`,
    formMessageId: `${id}-form-item-message`,
    id,
    name: fieldContext.name,
    ...fieldState,
  };
};

interface FormItemContextValue {
  id: string;
}

const FormItemContext = createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: ComponentProps<"div">) {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        className={cn("grid gap-2", className)}
        data-slot="form-item"
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      className={cn("data-[error=true]:text-destructive-foreground", className)}
      data-error={!!error}
      data-slot="form-label"
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: ComponentProps<typeof SlotPrimitive.Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <SlotPrimitive.Slot
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : `${formDescriptionId}`
      }
      aria-invalid={!!error}
      data-slot="form-control"
      id={formItemId}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="form-description"
      id={formDescriptionId}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      className={cn("text-destructive-foreground text-sm", className)}
      data-slot="form-message"
      id={formMessageId}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  useForm,
  useFormField,
  Form,
  FormItem,
  FormLabel,
  createForm,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
