"use client";

import type { NumericFormatProps } from "react-number-format";
import { NumericFormat } from "react-number-format";

import { InputGroup, InputGroupAddon, InputGroupInput } from "../input-group";

export interface CurrencyInputProps
  extends Omit<
    NumericFormatProps,
    "customInput" | "decimalScale" | "fixedDecimalScale" | "thousandSeparator"
  > {
  readonly decimalScale?: number;
  readonly fixedDecimalScale?: boolean;
  readonly thousandSeparator?: string | boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  decimalScale = 2,
  fixedDecimalScale = true,
  thousandSeparator = ".",
  decimalSeparator = ",",
  ...props
}) => (
  <InputGroup>
    <InputGroupAddon align="inline-start">R$</InputGroupAddon>
    <NumericFormat
      {...props}
      customInput={InputGroupInput}
      decimalScale={decimalScale}
      decimalSeparator={decimalSeparator}
      fixedDecimalScale={fixedDecimalScale}
      thousandSeparator={thousandSeparator}
    />
  </InputGroup>
);
