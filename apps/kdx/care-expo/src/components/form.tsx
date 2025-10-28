"use client";

import type { ComponentProps, ElementRef, ReactNode } from "react";
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  UseFormProps,
} from "react-hook-form";
import type { LabelProps, ParagraphProps, TextProps, ViewProps } from "tamagui";
import type { ZodType } from "zod";
import { createContext, forwardRef, useContext, useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Slot } from "@radix-ui/react-slot";
import {
  useForm as __useForm,
  Controller,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { Label, Paragraph, Text, View } from "tamagui";

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

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

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
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

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

const FormItem = forwardRef<typeof View, ViewProps>(({ ...props }, ref) => {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <View {...props} gap="$1" ref={ref} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = forwardRef<typeof Label, LabelProps>(({ ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      htmlFor={formItemId}
      ref={ref}
      {...props}
      color={error ? "red" : props.color}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = forwardRef<
  ElementRef<typeof Slot>,
  ComponentProps<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : `${formDescriptionId}`
      }
      aria-invalid={!!error}
      id={formItemId}
      ref={ref}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = forwardRef<typeof Paragraph, ParagraphProps>(
  ({ ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return (
      <Paragraph
        id={formDescriptionId}
        ref={ref}
        {...props}
        color={"gray"}
        size="$1"
      />
    );
  },
);
FormDescription.displayName = "FormDescription";

const FormMessage = forwardRef<typeof Text, TextProps>(
  ({ children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error.message) : (children as ReactNode);

    if (!body) {
      return null;
    }

    return (
      <Text id={formMessageId} ref={ref} {...props} color="red" fontSize={"$1"}>
        {body}
      </Text>
    );
  },
);
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
  useFormField,
};
