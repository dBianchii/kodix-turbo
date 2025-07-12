"use client";

import type { ComponentProps, ElementRef, ReactNode } from "react";
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  UseFormProps,
} from "react-hook-form";
import type { LabelProps, ParagraphProps, TextProps, ViewProps } from "tamagui";
import type { ZodType, ZodTypeDef } from "zod";
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

const useForm = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
>(
  props: Omit<UseFormProps<TFieldValues, TContext>, "resolver"> & {
    schema: ZodType<TFieldValues, any, any>;
  },
) => {
  const form = __useForm<TFieldValues, TContext>({
    ...props,
    resolver: zodResolver(props.schema, undefined),
  });
  return form;
};

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
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

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
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
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
      ref={ref}
      htmlFor={formItemId}
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
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
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
        ref={ref}
        id={formDescriptionId}
        {...props}
        size="$1"
        color={"gray"}
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
      <Text ref={ref} id={formMessageId} {...props} color="red" fontSize={"$1"}>
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
